import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Activity,
    Clock,
    AlertCircle,
    RefreshCw,
    LogOut,
    LayoutDashboard,
    Users
} from 'lucide-react';
import MetricCard from './components/MetricCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const Dashboard = ({ user, onLogout }) => {
    const [metrics, setMetrics] = useState(null);
    const [projects, setProjects] = useState([]);
    const [team, setTeam] = useState([]);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [selectedProject, setSelectedProject] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (activeTab === 'dashboard') {
                    const resp = await axios.get(`http://localhost:5000/api/metrics`, {
                        params: {
                            project_id: selectedProject ? selectedProject.id : user.project_id,
                            role: user.role
                        }
                    });
                    setMetrics(resp.data);
                } else if (activeTab === 'projects') {
                    const resp = await axios.get(`http://localhost:5000/api/projects`);
                    setProjects(resp.data);
                } else if (activeTab === 'team') {
                    const resp = await axios.get(`http://localhost:5000/api/team`);
                    setTeam(resp.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user, activeTab, selectedProject]);

    if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-white">Loading...</div>;

    return (
        <div className="min-h-screen bg-background flex text-slate-300">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/5 p-6 flex flex-col glass-card rounded-none m-0">
                <div className="flex items-center gap-3 mb-10 px-2">
                    <div className="w-8 h-8 rounded-lg bg-primary glow"></div>
                    <h2 className="text-xl font-bold text-white uppercase tracking-wider">DORA Metrics</h2>
                </div>

                <nav className="space-y-2 flex-grow">
                    <button
                        onClick={() => {
                            setActiveTab('dashboard');
                            setSelectedProject(null);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' && !selectedProject ? 'bg-primary/10 text-primary font-medium border border-primary/20' : 'hover:bg-white/5'}`}
                    >
                        <LayoutDashboard size={20} /> Dashboard
                    </button>
                    {user.role === 'admin' && (
                        <button
                            onClick={() => setActiveTab('projects')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'projects' ? 'bg-primary/10 text-primary font-medium border border-primary/20' : 'hover:bg-white/5'}`}
                        >
                            <Users size={20} /> Projects
                        </button>
                    )}
                    {user.role === 'admin' && (
                        <button
                            onClick={() => setActiveTab('team')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'team' ? 'bg-primary/10 text-primary font-medium border border-primary/20' : 'hover:bg-white/5'}`}
                        >
                            <Users size={20} /> Team
                        </button>
                    )}
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-left">
                        <Activity size={20} /> History
                    </button>
                </nav>

                <button
                    onClick={onLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-all mt-auto"
                >
                    <LogOut size={20} /> Logout
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-grow p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-10 text-white">
                    <div>
                        <h1 className="text-3xl font-bold mb-1">
                            {activeTab === 'dashboard'
                                ? (selectedProject ? `${selectedProject.name} Metrics` : (user.role === 'admin' ? 'Admin Overview' : 'Project Performance'))
                                : 'Project Management'}
                        </h1>
                        <p className="text-slate-400">
                            {activeTab === 'dashboard'
                                ? (selectedProject ? `Detailed DORA performance for ${selectedProject.name}` : (user.role === 'admin' ? 'DORA metrics for all active projects' : `Viewing metrics for ${user.username}`))
                                : 'Manage and monitor all active development projects'}
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right mr-4">
                            <p className="font-bold">{user.username}</p>
                            <p className="text-xs text-slate-400 capitalize">{user.role}</p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-accent glow"></div>
                    </div>
                </header>

                {activeTab === 'dashboard' && metrics && (
                    <>
                        {/* Metric Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                            <MetricCard
                                title="Deployment Frequency"
                                value={metrics.deploymentFrequency}
                                unit="per day"
                                icon={Activity}
                                color="blue"
                                trend={12.5}
                                badge={metrics.isRealTime ? "Live" : null}
                            />
                            <MetricCard
                                title="Lead Time for Changes"
                                value={metrics.leadTimeChange}
                                unit="min"
                                icon={Clock}
                                color="purple"
                                trend={-4.3}
                                badge={metrics.isRealTime ? "Live" : null}
                            />
                            <MetricCard
                                title="Change Failure Rate"
                                value={metrics.changeFailureRate}
                                unit="%"
                                icon={AlertCircle}
                                color="yellow"
                                trend={-2.1}
                                badge={metrics.isRealTime ? "Live" : "Simulated"}
                            />
                            <MetricCard
                                title="Mean Time to Recovery"
                                value={metrics.meanTimeToRecovery}
                                unit="min"
                                icon={RefreshCw}
                                color="green"
                                trend={15.8}
                                badge={metrics.isRealTime ? "Live" : null}
                            />
                        </div>

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="glass-card p-6 min-h-[400px] min-w-0">
                                <h3 className="text-xl font-bold mb-6 text-white">Deployment Activity</h3>
                                <div className="h-[300px] w-full relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={metrics.rawData.slice(-10)}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                            <XAxis dataKey="deployed_at" tick={{ fill: '#64748b', fontSize: 10 }} />
                                            <YAxis tick={{ fill: '#64748b' }} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#16161a', border: '1px solid #2d2d33', borderRadius: '8px', color: 'white' }}
                                                itemStyle={{ color: '#3b82f6' }}
                                            />
                                            <Bar dataKey="lead_time_minutes" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div className="glass-card p-6 min-h-[400px] min-w-0">
                                <h3 className="text-xl font-bold mb-6 text-white">Performance Trend</h3>
                                <div className="h-[300px] w-full relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={metrics.rawData.slice(-10)}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                            <XAxis dataKey="deployed_at" tick={{ fill: '#64748b', fontSize: 10 }} />
                                            <YAxis tick={{ fill: '#64748b' }} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#16161a', border: '1px solid #2d2d33', borderRadius: '8px', color: 'white' }}
                                                itemStyle={{ color: '#8b5cf6' }}
                                            />
                                            <Line type="monotone" dataKey="lead_time_minutes" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', strokeWidth: 2 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'projects' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                        {projects.map(project => (
                            <div key={project.id} className="glass-card p-8 hover:border-primary/30 transition-all group relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-10 -mt-10 transition-all group-hover:bg-primary/10"></div>
                                <div className="flex items-center gap-6 mb-6">
                                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-lg">
                                        <LayoutDashboard size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white mb-1">{project.name}</h3>
                                        <p className="text-slate-400 text-sm">Active Project • ID: #{project.id}</p>
                                    </div>
                                </div>
                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Service Health</span>
                                        <span className="text-green-400 font-medium">Stable</span>
                                    </div>
                                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                        <div className="bg-primary h-full w-[85%] rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setSelectedProject(project);
                                        setActiveTab('dashboard');
                                    }}
                                    className="w-full py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-primary hover:border-primary transition-all flex items-center justify-center gap-2"
                                >
                                    View Detailed Metrics <Activity size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                {activeTab === 'team' && (
                    <div className="glass-card overflow-hidden">
                        <div className="p-8 border-b border-white/5 bg-white/2">
                            <h3 className="text-xl font-bold text-white">Engineering Team</h3>
                            <p className="text-slate-400 text-sm">Directory of all active developers and team leaders</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-white/2">
                                        <th className="px-8 py-4 text-slate-400 font-medium text-sm">Developer Name</th>
                                        <th className="px-8 py-4 text-slate-400 font-medium text-sm">Designation</th>
                                        <th className="px-8 py-4 text-slate-400 font-medium text-sm">Team Leader</th>
                                        <th className="px-8 py-4 text-slate-400 font-medium text-sm">Assigned Project</th>
                                        <th className="px-8 py-4 text-slate-400 font-medium text-sm">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {team.map(member => (
                                        <tr key={member.id} className="hover:bg-white/2 transition-colors">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                                        {member.full_name?.charAt(0)}
                                                    </div>
                                                    <span className="text-white font-medium">{member.full_name}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-slate-300">Software Engineer</td>
                                            <td className="px-8 py-5 text-slate-300">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                                                    {member.leader_name}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
                                                    {member.project_name}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2 text-green-400 text-sm">
                                                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                                                    Online
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
