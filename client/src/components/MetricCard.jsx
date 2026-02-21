import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const MetricCard = ({ title, value, unit, icon: Icon, color, trend, badge }) => {
    const colorMap = {
        blue: 'text-blue-400 bg-blue-400/10',
        green: 'text-emerald-400 bg-emerald-400/10',
        yellow: 'text-amber-400 bg-amber-400/10',
        purple: 'text-violet-400 bg-violet-400/10',
    };

    return (
        <div className="glass-card p-6 flex flex-col justify-between group hover:border-primary/30 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${colorMap[color] || colorMap.blue}`}>
                    <Icon size={24} />
                </div>
                <div className="flex items-center gap-2">
                    {badge && (
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${badge === 'Live' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-white/5 text-slate-500 border border-white/10'}`}>
                            {badge}
                        </span>
                    )}
                    {trend && (
                        <div className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${trend > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                            {trend > 0 ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
                            {Math.abs(trend)}%
                        </div>
                    )}
                </div>
            </div>
            <div>
                <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white group-hover:text-primary transition-colors">{value}</span>
                    <span className="text-slate-500 text-sm font-medium">{unit}</span>
                </div>
            </div>
        </div>
    );
};

export default MetricCard;
