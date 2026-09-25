require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Auth routes
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.get("SELECT * FROM users WHERE username = ? AND password = ?", [username, password], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        // In a real app, send JWT here
        res.json({
            id: user.id,
            username: user.username,
            role: user.role,
            project_id: user.project_id
        });
    });
});

app.get('/api/team', (req, res) => {
    const query = `
        SELECT u.id, u.full_name, u.leader_name, p.name as project_name 
        FROM users u 
        LEFT JOIN projects p ON u.project_id = p.id 
        WHERE u.role = 'developer'
    `;
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/projects', (req, res) => {
    db.all("SELECT * FROM projects", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

const { getGitHubMetrics } = require('./githubService');

const calculateMetrics = (rows) => {
    const totalDeployments = rows.length;
    const failures = rows.filter(d => d.status === 'failure').length;
    const changeFailureRate = totalDeployments > 0 ? (failures / totalDeployments) * 100 : 0;
    const totalLeadTime = rows.reduce((acc, d) => acc + (d.lead_time_minutes || 0), 0);
    const meanLeadTime = totalDeployments > 0 ? totalLeadTime / totalDeployments : 0;
    const recoveryTimes = rows.filter(d => d.recovery_time_minutes !== null).map(d => d.recovery_time_minutes);
    const meanTimeToRecovery = recoveryTimes.length > 0
        ? recoveryTimes.reduce((acc, time) => acc + time, 0) / recoveryTimes.length
        : 0;

    return {
        deploymentFrequency: (totalDeployments / 30).toFixed(2),
        leadTimeChange: meanLeadTime.toFixed(0),
        changeFailureRate: changeFailureRate.toFixed(1),
        meanTimeToRecovery: meanTimeToRecovery.toFixed(0),
        rawData: rows,
        isRealTime: false
    };
};

// Metrics routes
app.get('/api/metrics', async (req, res) => {
    const { project_id, role } = req.query;

    if (!project_id) {
        if (role !== 'admin') {
            return res.status(400).json({ error: "project_id is required" });
        }

        return db.all("SELECT * FROM deployments ORDER BY deployed_at ASC", [], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            return res.json(calculateMetrics(rows));
        });
    }

    // First, check the project source
    db.get("SELECT * FROM projects WHERE id = ?", [project_id], async (err, project) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!project) return res.status(404).json({ message: "Project not found" });

        if (project.data_source === 'REAL') {
            try {
                const metrics = await getGitHubMetrics(
                    project.repo_owner,
                    project.repo_name,
                    process.env.GITHUB_TOKEN
                );
                return res.json({ ...metrics, isRealTime: true });
            } catch (githubErr) {
                return res.status(500).json({ error: 'Failed to fetch GitHub metrics', details: githubErr.message });
            }
        }

        // MOCK data logic (default)
        let query = "SELECT * FROM deployments WHERE project_id = ?";
        let params = [project_id];

        db.all(query, params, (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });

            res.json(calculateMetrics(rows));
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
