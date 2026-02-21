const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'dora.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT CHECK(role IN ('admin', 'developer')),
    full_name TEXT,
    leader_name TEXT,
    project_id INTEGER
  )`);

  // Projects table
  db.run(`CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    data_source TEXT CHECK(data_source IN ('MOCK', 'REAL')) DEFAULT 'MOCK',
    repo_owner TEXT,
    repo_name TEXT
  )`);

  // Deployments table
  db.run(`CREATE TABLE IF NOT EXISTS deployments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER,
    status TEXT CHECK(status IN ('success', 'failure')),
    deployed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    lead_time_minutes INTEGER,
    recovery_time_minutes INTEGER,
    FOREIGN KEY(project_id) REFERENCES projects(id)
  )`);

  // Seed initial data if empty
  db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
    if (row && row.count === 0) {
      db.run("INSERT INTO projects (name, data_source) VALUES ('E-commerce Frontend', 'MOCK')"); // ID 1
      db.run("INSERT INTO projects (name, data_source) VALUES ('CRM Module', 'MOCK')");        // ID 2
      db.run("INSERT INTO projects (name, data_source, repo_owner, repo_name) VALUES ('Smart IoT Core', 'REAL', 'Allampatiteja', 'smartiot')"); // ID 3

      // Admin
      db.run("INSERT INTO users (username, password, role, full_name, leader_name, project_id) VALUES ('admin', 'admin123', 'admin', 'Alex Johnson', NULL, NULL)");

      // Developers for Project 1 (E-commerce)
      db.run("INSERT INTO users (username, password, role, full_name, leader_name, project_id) VALUES ('dev1', 'dev123', 'developer', 'Sarah Chen', 'Michael Scott', 1)");
      db.run("INSERT INTO users (username, password, role, full_name, leader_name, project_id) VALUES ('dev2', 'dev123', 'developer', 'James Wilson', 'Michael Scott', 1)");
      db.run("INSERT INTO users (username, password, role, full_name, leader_name, project_id) VALUES ('dev3', 'dev123', 'developer', 'Elena Rodriguez', 'Michael Scott', 1)");

      // Developers for Project 2 (CRM)
      db.run("INSERT INTO users (username, password, role, full_name, leader_name, project_id) VALUES ('dev4', 'dev123', 'developer', 'David Kim', 'Dwight Schrute', 2)");
      db.run("INSERT INTO users (username, password, role, full_name, leader_name, project_id) VALUES ('dev5', 'dev123', 'developer', 'Maya Patel', 'Dwight Schrute', 2)");

      const now = new Date();

      // Project 1: "The Agile Runner" (High frequency, Fast)
      for (let i = 0; i < 60; i++) {
        const status = Math.random() > 0.12 ? 'success' : 'failure';
        const leadTime = Math.floor(Math.random() * 40) + 20; // 20-60 mins
        const recoveryTime = status === 'failure' ? Math.floor(Math.random() * 30) + 10 : null;
        const date = new Date(now.getTime() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000); // last 30 days

        db.run(`INSERT INTO deployments (project_id, status, deployed_at, lead_time_minutes, recovery_time_minutes) 
                VALUES (?, ?, ?, ?, ?)`, [1, status, date.toISOString(), leadTime, recoveryTime]);
      }

      // Project 2: "The Steady Giant" (Low frequency, Slow but stable)
      for (let i = 0; i < 15; i++) {
        const status = Math.random() > 0.05 ? 'success' : 'failure';
        const leadTime = Math.floor(Math.random() * 200) + 180; // 180-380 mins
        const recoveryTime = status === 'failure' ? Math.floor(Math.random() * 120) + 60 : null;
        const date = new Date(now.getTime() - Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000); // last 60 days

        db.run(`INSERT INTO deployments (project_id, status, deployed_at, lead_time_minutes, recovery_time_minutes) 
                VALUES (?, ?, ?, ?, ?)`, [2, status, date.toISOString(), leadTime, recoveryTime]);
      }
    }
  });
});

module.exports = db;
