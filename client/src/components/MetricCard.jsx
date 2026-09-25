import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const MetricCard = ({ title, value, unit, icon: Icon, color, trend, badge }) => {
    const colorMap = {
        blue: 'text-blue-600 bg-blue-50 border-blue-100',
        green: 'text-emerald-600 bg-emerald-50 border-emerald-100',
        yellow: 'text-amber-600 bg-amber-50 border-amber-100',
        purple: 'text-violet-600 bg-violet-50 border-violet-100',
    };

    return (
        <div className="glass-card p-6 flex flex-col justify-between group hover:border-primary/30 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl border ${colorMap[color] || colorMap.blue}`}>
                    <Icon size={24} />
                </div>
                <div className="flex items-center gap-2">
                    {badge && (
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${badge === 'Live' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                            {badge}
                        </span>
                    )}
                    {trend && (
                        <div className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${trend > 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                            {trend > 0 ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
                            {Math.abs(trend)}%
                        </div>
                    )}
                </div>
            </div>
            <div>
                <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-slate-900 group-hover:text-primary transition-colors">{value}</span>
                    <span className="text-slate-400 text-sm font-medium">{unit}</span>
                </div>
            </div>
        </div>
    );
};

export default MetricCard;
