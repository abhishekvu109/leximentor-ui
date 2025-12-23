import React from "react";
import dynamic from "next/dynamic";
import Layout from "@/components/layout/Layout";
import {
    Activity,
    TrendingUp,
    Brain,
    Zap,
    Filter,
    Target,
    AlertTriangle,
    PieChart as PieIcon,
    Calendar,
    ArrowUpRight
} from "lucide-react";

// Dynamically import Recharts to avoid SSR issues
const ResponsiveContainer = dynamic(() => import("recharts").then(mod => mod.ResponsiveContainer), { ssr: false });
const AreaChart = dynamic(() => import("recharts").then(mod => mod.AreaChart), { ssr: false });
const Area = dynamic(() => import("recharts").then(mod => mod.Area), { ssr: false });
const XAxis = dynamic(() => import("recharts").then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then(mod => mod.Tooltip), { ssr: false });
const RadarChart = dynamic(() => import("recharts").then(mod => mod.RadarChart), { ssr: false });
const PolarGrid = dynamic(() => import("recharts").then(mod => mod.PolarGrid), { ssr: false });
const PolarAngleAxis = dynamic(() => import("recharts").then(mod => mod.PolarAngleAxis), { ssr: false });
const PolarRadiusAxis = dynamic(() => import("recharts").then(mod => mod.PolarRadiusAxis), { ssr: false });
const Radar = dynamic(() => import("recharts").then(mod => mod.Radar), { ssr: false });
const BarChart = dynamic(() => import("recharts").then(mod => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then(mod => mod.Bar), { ssr: false });
const PieChart = dynamic(() => import("recharts").then(mod => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import("recharts").then(mod => mod.Pie), { ssr: false });
const Cell = dynamic(() => import("recharts").then(mod => mod.Cell), { ssr: false });

// Mock Data for Visuals
const funnelData = [
    { name: "Mon", seen: 400, active: 240, mastered: 100 },
    { name: "Tue", seen: 520, active: 280, mastered: 120 },
    { name: "Wed", seen: 600, active: 390, mastered: 180 },
    { name: "Thu", seen: 750, active: 480, mastered: 250 },
    { name: "Fri", seen: 890, active: 550, mastered: 310 },
    { name: "Sat", seen: 1050, active: 620, mastered: 420 },
    { name: "Sun", seen: 1284, active: 750, mastered: 500 },
];

const radarData = [
    { subject: 'Meaning', A: 120, B: 110, fullMark: 150 },
    { subject: 'Speed', A: 98, B: 130, fullMark: 150 },
    { subject: 'Flashcards', A: 86, B: 130, fullMark: 150 },
    { subject: 'Context', A: 99, B: 100, fullMark: 150 },
    { subject: 'Usage', A: 85, B: 90, fullMark: 150 },
];

const posData = [
    { name: 'Nouns', value: 400, color: '#6366f1' },
    { name: 'Verbs', value: 300, color: '#f43f5e' },
    { name: 'Adjectives', value: 200, color: '#10b981' },
    { name: 'Adverbs', value: 100, color: '#f59e0b' },
];

const troubleData = [
    { word: 'Acquiesce', errors: 12 },
    { word: 'Ephemeral', errors: 9 },
    { word: 'Paradigm', errors: 7 },
    { word: 'Ubiquitous', errors: 6 },
    { word: 'Sycophant', errors: 5 },
];

const HeatmapBox = ({ intensity }) => {
    const colors = ['bg-slate-100', 'bg-indigo-100', 'bg-indigo-300', 'bg-indigo-500', 'bg-indigo-700'];
    return <div className={`w-3 h-3 rounded-sm ${colors[intensity]} transition-colors hover:ring-2 ring-indigo-400 cursor-help`} />;
};

const PrimalAnalytics = () => {
    return (
        <Layout content={
            <div className="max-w-[1600px] mx-auto p-6 space-y-8 animate-in fade-in duration-1000">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-indigo-600 mb-2 font-black uppercase text-xs tracking-widest">
                            <Activity size={16} />
                            Primal Intelligence
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                            Your Learning <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-8">DNA</span>
                        </h1>
                        <p className="text-slate-500 mt-2 font-medium">Deep behavioral analysis of your vocabulary growth.</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-4">
                        <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                            <Zap size={20} fill="currentColor" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase">Learning Velocity</p>
                            <p className="text-lg font-black text-slate-900">+12.4% <span className="text-xs font-bold text-emerald-500">↑</span></p>
                        </div>
                    </div>
                </div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[900px]">

                    {/* Mastery Funnel (Span 8) */}
                    <div className="md:col-span-8 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col relative overflow-hidden group">
                        <div className="flex justify-between items-start mb-8 relative z-10">
                            <div>
                                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 tracking-tight">
                                    <TrendingUp className="text-indigo-500" />
                                    Vocabulary Mastery Funnel
                                </h3>
                                <p className="text-sm text-slate-500 font-medium">Tracking word progression from Seen to Mastered</p>
                            </div>
                            <button className="p-2 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 transition-colors">
                                <ArrowUpRight size={18} className="text-slate-400" />
                            </button>
                        </div>
                        <div className="flex-1 min-h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={funnelData}>
                                    <defs>
                                        <linearGradient id="colorSeen" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#818cf8" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} dy={10} />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                                        itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                    />
                                    <Area type="monotone" dataKey="seen" stackId="1" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorSeen)" />
                                    <Area type="monotone" dataKey="active" stackId="2" stroke="#6366f1" strokeWidth={3} fillOpacity={0.1} fill="#6366f1" />
                                    <Area type="monotone" dataKey="mastered" stackId="3" stroke="#4f46e5" strokeWidth={3} fillOpacity={0.2} fill="#4f46e5" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Drill Radar (Span 4) */}
                    <div className="md:col-span-4 bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Brain size={120} className="transform rotate-12" />
                        </div>
                        <h3 className="text-xs font-black text-indigo-300 uppercase tracking-widest mb-2">Efficiency Profile</h3>
                        <h2 className="text-2xl font-black mb-6 tracking-tight">Drill DNA Radar</h2>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                    <PolarGrid stroke="#334155" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} />
                                    <Radar name="User" dataKey="A" stroke="#818cf8" fill="#818cf8" fillOpacity={0.6} />
                                    <Tooltip />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
                            <p className="text-[10px] font-black text-indigo-300 uppercase tracking-wider mb-1">Core Insight</p>
                            <p className="text-xs font-medium text-slate-300 leading-relaxed">
                                You are a <span className="text-white font-bold italic">Context Master</span>. Your scores reveal you learn 40% faster when words are presented in full sentences.
                            </p>
                        </div>
                    </div>

                    {/* Heatmap (Span 6) */}
                    <div className="md:col-span-6 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 tracking-tight">
                                    <Calendar className="text-indigo-500" />
                                    Memory Strength Map
                                </h3>
                                <p className="text-sm text-slate-500 font-medium italic">Predictive Retention Analysis</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                            {Array.from({ length: 140 }).map((_, i) => (
                                <HeatmapBox key={i} intensity={Math.floor(Math.random() * 5)} />
                            ))}
                        </div>
                        <div className="mt-6 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <span>Last 20 Weeks</span>
                            <div className="flex items-center gap-2">
                                <span>Low Strength</span>
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 rounded-full bg-slate-200" />
                                    <div className="w-2 h-2 rounded-full bg-indigo-300" />
                                    <div className="w-2 h-2 rounded-full bg-indigo-700" />
                                </div>
                                <span>Max Mastery</span>
                            </div>
                        </div>
                    </div>

                    {/* POS Equilibrium (Span 3) */}
                    <div className="md:col-span-3 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col items-center">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 w-full text-left">POS Balance</h3>
                        <div className="h-48 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={posData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={8}
                                        dataKey="value"
                                    >
                                        {posData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-4 w-full text-center">
                            {posData.map((pos, i) => (
                                <div key={i}>
                                    <p className="text-[10px] font-black text-slate-400 uppercase">{pos.name}</p>
                                    <p className="text-sm font-black text-slate-800" style={{ color: pos.color }}>{pos.value}%</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Trouble Words (Span 3) */}
                    <div className="md:col-span-3 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col justify-between">
                        <div className="mb-4">
                            <h3 className="text-xs font-black text-rose-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                                <AlertTriangle size={14} /> Critical focus
                            </h3>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">The Obstacles</h2>
                        </div>
                        <div className="space-y-4">
                            {troubleData.map((item, i) => (
                                <div key={i} className="group cursor-pointer">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-black text-slate-700">{item.word}</span>
                                        <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded italic">{item.errors} fails</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                        <div
                                            className="h-full bg-rose-400 rounded-full transition-all group-hover:bg-rose-500"
                                            style={{ width: `${(item.errors / 15) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="mt-6 w-full py-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-100 transition-colors border border-rose-100">
                            Drill These Now
                        </button>
                    </div>
                </div>
            </div>
        } />
    );
};

export default PrimalAnalytics;
