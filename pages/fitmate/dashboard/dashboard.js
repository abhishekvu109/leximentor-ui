import Layout from "@/components/layout/Layout";
import { useEffect, useState } from "react";
import fitmateService from "../../../services/fitmate.service";
import { useAuth } from "../../../context/AuthContext";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";
import {
    Activity, Dumbbell, Calendar, Flame, TrendingUp, Clock,
    Award, ChevronRight, User, MoreHorizontal, Sparkles, Target, Zap
} from "lucide-react";
import Link from "next/link";


// --- Chart Config & Components ---
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-4 border border-gray-100 shadow-xl rounded-2xl text-xs">
                <p className="font-bold text-gray-800 mb-2">{label}</p>
                {payload.map((p, i) => (
                    <div key={i} className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                        <span className="text-gray-500 font-medium">{p.name}:</span>
                        <span className="text-gray-800 font-black">{p.value}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const DashboardCard = ({ title, value, subtext, icon: Icon, colorClass, trend }) => (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-start justify-between transition-all hover:shadow-xl hover:-translate-y-1 group">
        <div className="flex-1">
            <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">{title}</p>
            <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-black text-gray-900 tracking-tight">{value}</h3>
                {trend && <span className={`text-[10px] font-bold ${trend > 0 ? 'text-green-500' : 'text-gray-400'}`}>{trend > 0 ? `+${trend}%` : `${trend}%`}</span>}
            </div>
            {subtext && <p className="text-xs mt-2 font-bold text-gray-400">{subtext}</p>}
        </div>
        <div className={`p-4 rounded-2xl ${colorClass} bg-opacity-10 text-opacity-100 group-hover:scale-110 transition-transform`}>
            <Icon size={24} className={colorClass.replace('bg-', 'text-')} />
        </div>
    </div>
);

const SectionHeader = ({ title, subtitle, action }) => (
    <div className="flex justify-between items-center mb-6">
        <div>
            <h2 className="text-xl font-black text-gray-800 tracking-tight">{title}</h2>
            {subtitle && <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{subtitle}</p>}
        </div>
        {action}
    </div>
);


const FitmateDashboardLogic = () => {
    const { user } = useAuth();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            if (!user?.username) return;
            try {
                const res = await fitmateService.getOverallAnalytics(user.username);
                setAnalytics(res.data);
                setLoading(false);
            } catch (e) {
                console.error("Dashboard Load Error", e);
                setLoading(false);
            }
        };
        loadData();
    }, [user?.username]);

    if (loading) return (
        <div className="flex h-96 items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent shadow-xl shadow-blue-200"></div>
                <p className="text-sm font-black text-gray-400 uppercase tracking-widest animate-pulse">Analyzing Performance...</p>
            </div>
        </div>
    );

    if (!analytics) return (
        <div className="flex h-96 items-center justify-center text-gray-400 flex-col gap-4">
            <Activity size={48} className="opacity-20" />
            <p className="font-bold">No analytics found. Start logging workouts!</p>
        </div>
    );

    const { summary, workoutTrends, bodyPartWorkoutVolume, mostFrequentExercises, routineDistributionByTrainingType } = analytics;

    // Process Body Part volume for Radar Chart
    const radarData = Object.keys(bodyPartWorkoutVolume || {}).map(k => ({
        subject: k,
        A: bodyPartWorkoutVolume[k],
        fullMark: 100
    })).sort((a, b) => b.A - a.A).slice(0, 8);

    // Process Pie Data
    const pieData = Object.keys(routineDistributionByTrainingType || {}).map(k => ({
        name: k, value: routineDistributionByTrainingType[k]
    }));

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Athlete Dashboard <span className="text-blue-600">.</span></h1>
                    <p className="text-gray-400 font-bold mt-1">Hustle for the muscle, {user?.username || 'Champion'}.</p>
                </div>
                <div className="flex gap-4">
                    <Link href="/fitmate/routine/make-routine">
                        <button className="flex items-center gap-3 bg-slate-900 border-2 border-slate-900 hover:bg-black hover:border-black text-white px-8 py-4 rounded-3xl font-black text-sm uppercase tracking-widest shadow-2xl transition-all active:scale-95 group">
                            <Zap size={18} className="text-yellow-400 group-hover:scale-125 transition-transform" /> Start Session
                        </button>
                    </Link>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCard
                    title="Total Routines"
                    value={summary.totalRoutinesCompleted}
                    subtext="Sessions finished"
                    icon={Award}
                    colorClass="bg-blue-500 text-blue-500"
                />
                <DashboardCard
                    title="Workout Time"
                    value={`${Math.round(summary.totalWorkoutDurationMinutes)}m`}
                    subtext="Total duration"
                    icon={Clock}
                    colorClass="bg-purple-500 text-purple-500"
                />
                <DashboardCard
                    title="Calories Burnt"
                    value={summary.totalCaloriesBurnt}
                    subtext="Energy expenditure"
                    icon={Flame}
                    colorClass="bg-orange-500 text-orange-500"
                />
                <DashboardCard
                    title="Unique Exercises"
                    value={summary.totalUniqueExercises}
                    subtext="Movement variety"
                    icon={Target}
                    colorClass="bg-emerald-500 text-emerald-500"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Workout Trends */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <SectionHeader title="Workout Trends" subtitle="Performance over time" />
                    <div className="h-80 w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={workoutTrends}>
                                <defs>
                                    <linearGradient id="colorWave" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                />
                                <YAxis hide domain={[0, 'auto']} />
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#3b82f6', strokeWidth: 2 }} />
                                <Area
                                    type="monotone"
                                    dataKey="caloriesBurnt"
                                    name="Calories"
                                    stroke="#ec4899"
                                    strokeWidth={4}
                                    fillOpacity={0}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="workoutDurationMinutes"
                                    name="Duration (min)"
                                    stroke="#3b82f6"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorWave)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Training Split */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col">
                    <SectionHeader title="Training Split" subtitle="Volume by category" />
                    <div className="flex-1 min-h-[300px] relative mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={8}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-center">
                                <p className="text-3xl font-black text-gray-800">{summary.totalRoutinesCompleted}</p>
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Total</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 flex flex-wrap justify-center gap-4">
                        {pieData.map((d, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                <span className="text-xs font-bold text-gray-500">{d.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Exercise & Body Part Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Body Part Workout Volume */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <SectionHeader title="Muscle Focus" subtitle="Regional distribution" />
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart outerRadius={120} data={radarData}>
                                <PolarGrid stroke="#f1f5f9" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} />
                                <PolarRadiusAxis hide />
                                <Radar
                                    name="Volume"
                                    dataKey="A"
                                    stroke="#3b82f6"
                                    fill="#3b82f6"
                                    fillOpacity={0.6}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Most Frequent Exercises */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <SectionHeader title="Frequent Drill" subtitle="Most performed movements" />
                    <div className="space-y-4 mt-6">
                        {mostFrequentExercises?.slice(0, 6).map((ex, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-blue-50 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600 font-black text-xs">
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-gray-800 group-hover:text-blue-700 transition-colors">{ex.exerciseName}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Strength Training</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black text-gray-800">{ex.frequency}</p>
                                    <p className="text-[10px] text-gray-400 font-black uppercase">Sets</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Efficiency Stat */}
            {analytics.routineEfficiency && (
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-blue-200">
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                        <div className="flex-1 space-y-4">
                            <div className="flex items-center gap-3">
                                <Sparkles className="text-yellow-300" />
                                <span className="uppercase font-black tracking-[0.3em] text-[10px] opacity-80">System Insight</span>
                            </div>
                            <h2 className="text-3xl font-black tracking-tight leading-tight">Your routine efficiency is <span className="text-blue-200">{analytics.routineEfficiency.averageCaloriesPerMinute.toFixed(1)} cal/min</span></h2>
                            <p className="text-blue-100 font-medium">You average {analytics.routineEfficiency.averageDrillsPerMinute.toFixed(2)} drills per minute. Keep pushing your intensity!</p>
                        </div>
                        <div className="flex gap-10 shrink-0">
                            <div className="text-center">
                                <p className="text-4xl font-black mb-1">{analytics.routineEfficiency.averageCaloriesPerMinute.toFixed(1)}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Avg Burn Rate</p>
                            </div>
                            <div className="h-12 w-px bg-white/20" />
                            <div className="text-center">
                                <p className="text-4xl font-black mb-1">{analytics.routineEfficiency.averageDrillsPerMinute.toFixed(2)}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Avg Drills/Min</p>
                            </div>
                        </div>
                    </div>
                    {/* Abstract Shapes */}
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />
                </div>
            )}
        </div>
    );
};

const MainDesign = () => {
    return <Layout content={<FitmateDashboardLogic />} />;
}

export default MainDesign;