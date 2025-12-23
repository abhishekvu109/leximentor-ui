import React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
    BookOpen,
    Hash,
    Zap,
    Layers,
    Mic,
    Brain,
    CheckCircle,
    Trophy,
    Target,
    Flame,
    LayoutDashboard,
    ArrowRight
} from "lucide-react";
import LexiDiscover from "./LexiDiscover";

const PieChartWidget = dynamic(() => import("@/components/widgets/charts/PieChartWidget"), {
    ssr: false,
});

const BarChartWidget = dynamic(() => import("@/components/widgets/charts/BarChartWidget"), {
    ssr: false,
});

const QuickChallengeItem = ({ icon: Icon, label, color, href }) => (
    <Link href={href}>
        <div className="flex items-center justify-between p-4 bg-white hover:bg-slate-50 border border-slate-100 rounded-2xl transition-all hover:shadow-md group active:scale-95 cursor-pointer">
            <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${color} text-white shadow-sm`}>
                    <Icon size={18} />
                </div>
                <span className="font-bold text-slate-700 text-sm">{label}</span>
            </div>
            <ArrowRight size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
        </div>
    </Link>
);

const DashboardStyleOne = ({ getAllDrills, wordsData }) => {
    // Dummy stats for visual flair
    const stats = [
        { label: "Words Learnt", value: "1,284", icon: BookOpen, color: "text-orange-500", bg: "bg-orange-50" },
        { label: "Drill Freq", value: "85%", icon: Flame, color: "text-red-500", bg: "bg-red-50" },
        { label: "Avg Pace", value: "12m/d", icon: Target, color: "text-indigo-500", bg: "bg-indigo-50" },
    ];

    const challenges = [
        { icon: BookOpen, label: "Meaning Master", color: "bg-blue-500", type: "MEANING" },
        { icon: Zap, label: "Speed Typer", color: "bg-orange-500", type: "SPEED" },
        { icon: Layers, label: "Flashcard Blitz", color: "bg-teal-500", type: "FLASHCARD" },
        { icon: Brain, label: "Choice Master", color: "bg-purple-500", type: "CONTEXT" },
    ];

    return (
        <div className="max-w-[1400px] mx-auto p-4 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Bento Grid Container */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[700px]">

                {/* Left Column: Stats & Discover (Span 8) */}
                <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Welcome & Stats Card */}
                    <div className="md:col-span-2 bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm flex flex-col justify-between overflow-hidden relative">
                        {/* Abstract background shape */}
                        <div className="absolute -right-20 -top-20 w-64 h-64 bg-slate-50 rounded-full blur-3xl opacity-60" />

                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <div className="flex items-center gap-2 text-indigo-600 mb-2">
                                    <LayoutDashboard size={20} />
                                    <span className="text-xs font-black uppercase tracking-widest">Dashboard</span>
                                </div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                                    Hello, <span className="text-indigo-600">Lexi-Hero!</span>
                                </h1>
                                <p className="text-slate-500 mt-1 font-medium">Ready to conquer some new vocabulary today?</p>
                            </div>

                            <div className="flex items-center gap-6">
                                {/* Streak Counter */}
                                <div className="flex items-center gap-3 bg-orange-50 px-4 py-2 rounded-2xl border border-orange-100 shadow-sm animate-pulse">
                                    <div className="bg-orange-500 p-1.5 rounded-lg text-white">
                                        <Flame size={18} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-lg font-black text-orange-600 leading-none">12</span>
                                        <span className="text-[10px] text-orange-400 font-black uppercase tracking-tighter">Day Streak</span>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    {stats.map((stat, i) => (
                                        <div key={i} className="flex flex-col items-center">
                                            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-1 shadow-sm`}>
                                                <stat.icon size={20} />
                                            </div>
                                            <span className="text-sm font-black text-slate-900">{stat.value}</span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase">{stat.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Word Discovery Widget */}
                    <div className="md:col-span-1 min-h-[320px]">
                        <LexiDiscover wordsData={wordsData} />
                    </div>

                    {/* Quick Challenges Bento Cell */}
                    <div className="md:col-span-1 bg-slate-50 rounded-[2rem] p-6 border border-slate-100 flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Quick Challenges</h3>
                            <Link href="/drills">
                                <span className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer">View All</span>
                            </Link>
                        </div>
                        <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                            {challenges.map((c, i) => (
                                <QuickChallengeItem
                                    key={i}
                                    icon={c.icon}
                                    label={c.label}
                                    color={c.color}
                                    href={`/challenges/${getAllDrills?.data?.[0]?.refId || 'LXM-D-1734267332308'}`} // Fallback for UI demo
                                />
                            ))}
                        </div>
                    </div>

                    {/* Drills History / Recent Bento Cell */}
                    <div className="md:col-span-2 bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm min-h-[250px] relative overflow-hidden group">
                        <div className="absolute right-0 top-0 p-8 text-slate-50 pointer-events-none">
                            <Trophy size={140} className="transform rotate-12 opacity-50 group-hover:scale-110 transition-transform duration-700" />
                        </div>
                        <div className="relative z-10 h-full flex flex-col">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Recent Performance</h3>
                            <div className="flex-1 flex items-end">
                                <div className="w-full h-32">
                                    <BarChartWidget />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Analytics & Progress (Span 4) */}
                <div className="md:col-span-4 flex flex-col gap-6">
                    {/* Mastery Chart */}
                    <div className="bg-slate-900 rounded-[2rem] p-6 text-white overflow-hidden relative min-h-[300px] flex flex-col">
                        <div className="absolute h-full w-full top-0 left-0 bg-[radial-gradient(circle_at_50%_120%,rgba(99,102,241,0.4),transparent)]" />

                        <div className="relative z-10">
                            <h3 className="text-xs font-black text-indigo-300 uppercase tracking-widest mb-2">Drill Breakdown</h3>
                            <div className="h-48 w-full flex items-center justify-center">
                                <PieChartWidget />
                            </div>
                        </div>

                        <div className="mt-auto relative z-10 bg-white/5 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-slate-400">Monthly Target</span>
                                <span className="text-xs font-black text-indigo-300">75%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 w-[75%] rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                            </div>
                        </div>
                    </div>

                    {/* Activity Heatmap or Info */}
                    <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm flex-1">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Daily Learning Log</h3>
                        <div className="space-y-4">
                            {[1, 2, 3].map((_, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="h-10 w-1 bg-indigo-100 rounded-full" />
                                    <div>
                                        <p className="text-xs font-black text-slate-900">Drill Completed</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Meaning Master • 15 Words</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8">
                            <button className="w-full py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200">
                                View Full History
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardStyleOne;

