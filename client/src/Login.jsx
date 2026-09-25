import React, { useState } from 'react';
import axios from 'axios';
import { LogIn, Github } from 'lucide-react';

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const resp = await axios.post('http://localhost:5000/api/login', { username, password });
            onLogin(resp.data);
        } catch (err) {
            setError(err.response?.status === 401
                ? 'Invalid username or password'
                : 'Unable to connect to the server. Start the backend on port 5000 and try again.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
            {/* Background blobs - more subtle in light mode */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary opacity-5 rounded-full blur-[120px] animate-pulse-slow"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent opacity-5 rounded-full blur-[120px] animate-pulse-slow"></div>

            <div className="glass-card w-full max-w-md p-10 relative z-10 border-slate-200/60 shadow-xl shadow-slate-200/40">
                <div className="flex justify-center mb-8">
                    <div className="bg-primary/10 p-4 rounded-2xl border border-primary/20">
                        <LogIn size={40} className="text-primary" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-center mb-2 text-slate-900">Welcome back</h1>
                <p className="text-slate-500 text-center mb-8">Login to your DORA Metrics Dashboard</p>

                {error && <div className="bg-red-500/10 border border-red-500/20 text-red-600 p-3 rounded-lg text-sm mb-6 text-center">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5 px-1">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl transition-all border-slate-200 focus:ring-4 focus:ring-primary/5"
                            placeholder="e.g. admin"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5 px-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl transition-all border-slate-200 focus:ring-4 focus:ring-primary/5"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-4 rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-[0.98]"
                    >
                        Sign In
                    </button>
                </form>

                <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                    <p className="text-slate-400 text-sm">Demo credentials: admin/admin123, dev1/dev123</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
