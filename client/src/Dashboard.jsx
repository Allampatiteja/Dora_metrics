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
import { motion, AnimatePresence } from 'framer-motion';

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

    if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-slate-900">Loading...</div>;

    return (
        <div className="min-h-screen bg-background flex text-slate-600">
            {/* Sidebar */}
            <aside className="w-64 border-r border-slate-200 p-6 flex flex-col glass-card rounded-none m-0 shadow-none relative z-20">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 mb-10 px-2"
                >
                    <div className="w-10 h-10 rounded-xl bg-primary shadow-lg shadow-primary/30 flex items-center justify-center text-white">
                        <Activity size={24} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-none">DORA</h2>
                        <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Metrics</span>
                    </div>
                </motion.div>

                <nav className="space-y-2 flex-grow">
                    {[
                        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                        { id: 'projects', label: 'Projects', icon: Users, adminOnly: true },
                        { id: 'team', label: 'Team', icon: Users, adminOnly: true },
                        { id: 'history', label: 'History', icon: Activity },
                    ].map((item) => {
                        if (item.adminOnly && user.role !== 'admin') return null;
                        const isActive = activeTab === item.id && (item.id !== 'dashboard' || !selectedProject);

                        return (
                            <motion.button
                                key={item.id}
                                onClick={() => {
                                    setActiveTab(item.id);
                                    if (item.id === 'dashboard') setSelectedProject(null);
                                }}
                                whileHover={{ x: 4 }}
                                whileTap={{ scale: 0.98 }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative group ${isActive ? 'text-primary font-bold' : 'text-slate-500 hover:text-slate-900'}`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="active-pill"
                                        className="absolute inset-0 bg-primary/5 border border-primary/10 rounded-xl"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <item.icon
                                    size={20}
                                    className={`relative z-10 transition-transform group-hover:scale-110 ${isActive ? 'text-primary' : ''}`}
                                />
                                <span className="relative z-10">{item.label}</span>
                            </motion.button>
                        );
                    })}
                </nav>

                <motion.button
                    onClick={onLogout}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all mt-auto font-medium group"
                >
                    <LogOut size={20} className="group-hover:translate-x-1 transition-transform" /> Logout
                </motion.button>
            </aside>

            {/* Main Content */}
            <main className="flex-grow p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-10 text-slate-900">
                    <motion.div
                        key={activeTab + (selectedProject?.id || '')}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-3xl font-bold mb-1">
                            {activeTab === 'dashboard'
                                ? (selectedProject ? `${selectedProject.name} Metrics` : (user.role === 'admin' ? 'Admin Overview' : 'Project Performance'))
                                : 'Project Management'}
                        </h1>
                        <p className="text-slate-500">
                            {activeTab === 'dashboard'
                                ? (selectedProject ? `Detailed DORA performance for ${selectedProject.name}` : (user.role === 'admin' ? 'DORA metrics for all active projects' : `Viewing metrics for ${user.username}`))
                                : 'Manage and monitor all active development projects'}
                        </p>
                    </motion.div>
                    <div className="flex items-center gap-4">
                        <div className="text-right mr-4">
                            <p className="font-bold">{user.username}</p>
                            <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20"></div>
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    {activeTab === 'dashboard' && metrics && (
                        <motion.div
                            key="dashboard"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                        >
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
                                    <h3 className="text-xl font-bold mb-6 text-slate-900">Deployment Activity</h3>
                                    <div className="h-[300px] w-full relative">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={metrics.rawData.slice(-10)}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                                <XAxis dataKey="deployed_at" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={{ stroke: '#e2e8f0' }} />
                                                <YAxis tick={{ fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                                    itemStyle={{ color: '#2563eb' }}
                                                />
                                                <Bar dataKey="lead_time_minutes" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                                <div className="glass-card p-6 min-h-[400px] min-w-0">
                                    <h3 className="text-xl font-bold mb-6 text-slate-900">Performance Trend</h3>
                                    <div className="h-[300px] w-full relative">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={metrics.rawData.slice(-10)}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                                <XAxis dataKey="deployed_at" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={{ stroke: '#e2e8f0' }} />
                                                <YAxis tick={{ fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                                    itemStyle={{ color: '#7c3aed' }}
                                                />
                                                <Line type="monotone" dataKey="lead_time_minutes" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', strokeWidth: 2 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'projects' && (
                        <motion.div
                            key="projects"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8"
                        >
                            {projects.map(project => (
                                <div key={project.id} className="glass-card p-8 hover:border-primary/30 transition-all group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-10 -mt-10 transition-all group-hover:bg-primary/10"></div>
                                    <div className="flex items-center gap-6 mb-6">
                                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                            <LayoutDashboard size={32} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-slate-900 mb-1">{project.name}</h3>
                                            <p className="text-slate-500 text-sm">Active Project • ID: #{project.id}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4 mb-8">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Service Health</span>
                                            <span className="text-emerald-600 font-medium">Stable</span>
                                        </div>
                                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                            <div
                                                className="bg-primary h-full rounded-full shadow-[0_0_10px_rgba(59,130,246,0.2)] transition-all duration-500"
                                                style={{ width: project.name === 'CRM Module' ? '10%' : '85%' }}
                                            ></div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setSelectedProject(project);
                                            setActiveTab('dashboard');
                                        }}
                                        className="w-full py-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-bold hover:bg-primary hover:border-primary hover:text-white transition-all flex items-center justify-center gap-2"
                                    >
                                        View Detailed Metrics <Activity size={18} />
                                    </button>
                                </div>
                            ))}
                        </motion.div>
                    )}
                    {activeTab === 'team' && (
                        <motion.div
                            key="team"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="glass-card overflow-hidden"
                        >
                            <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                                <h3 className="text-xl font-bold text-slate-900">Engineering Team</h3>
                                <p className="text-slate-500 text-sm">Directory of all active developers and team leaders</p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50">
                                            <th className="px-8 py-4 text-slate-500 font-semibold text-xs uppercase tracking-wider">Developer Name</th>
                                            <th className="px-8 py-4 text-slate-500 font-semibold text-xs uppercase tracking-wider">Designation</th>
                                            <th className="px-8 py-4 text-slate-500 font-semibold text-xs uppercase tracking-wider">Team Leader</th>
                                            <th className="px-8 py-4 text-slate-500 font-semibold text-xs uppercase tracking-wider">Assigned Project</th>
                                            <th className="px-8 py-4 text-slate-500 font-semibold text-xs uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {team.map(member => (
                                            <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                            {member.full_name?.charAt(0)}
                                                        </div>
                                                        <span className="text-slate-900 font-medium">{member.full_name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-slate-600">Software Engineer</td>
                                                <td className="px-8 py-5 text-slate-600">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-violet-400"></div>
                                                        {member.leader_name}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className="px-3 py-1 rounded-full bg-primary/5 text-primary text-xs font-semibold border border-primary/10">
                                                        {member.project_name}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-2 text-emerald-600 text-sm">
                                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                                        Online
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default Dashboard;
