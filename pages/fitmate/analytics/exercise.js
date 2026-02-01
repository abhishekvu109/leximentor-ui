import Layout from "@/components/layout/Layout";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import fitmateService from "@/services/fitmate.service";
import {
    Search, Filter, Dumbbell, Calendar, Target, TrendingUp,
    ArrowRight, ChevronRight, Activity, Award, Clock,
    LayoutGrid, List as ListIcon
} from "lucide-react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, AreaChart, Area, Legend
} from 'recharts';
import { motion, AnimatePresence } from "framer-motion";

const StatCard = ({ label, value, icon: Icon, colorClass }) => (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
        <div className={`p-3 rounded-2xl ${colorClass} bg-opacity-10`}>
            <Icon size={20} className={colorClass.replace('bg-', 'text-')} />
        </div>
        <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
            <p className="text-xl font-black text-gray-800 tracking-tight">{value}</p>
        </div>
    </div>
);

const MiniStat = ({ label, value, color }) => (
    <div className="flex flex-col gap-0.5">
        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
        <span className={`text-xs font-black ${color}`}>{value}</span>
    </div>
);

const ExerciseAnalytics = () => {
    const { user } = useAuth();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedBodyPart, setSelectedBodyPart] = useState("All");
    const [expandedExercise, setExpandedExercise] = useState(null);
    const [viewMode, setViewMode] = useState("detailed"); // "detailed" or "insights"

    useEffect(() => {
        const loadData = async () => {
            if (!user?.username) return;
            try {
                const res = await fitmateService.getExerciseAnalytics(user.username);
                setAnalytics(res.data);
            } catch (e) {
                console.error("Failed to load exercise analytics", e);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [user?.username]);

    const exerciseNames = useMemo(() => {
        if (!analytics) return [];
        return Object.keys(analytics);
    }, [analytics]);

    const bodyParts = useMemo(() => {
        if (!analytics) return ["All"];
        const parts = new Set();
        Object.values(analytics).forEach(ex => {
            if (ex.lastFiveDrills?.[0]?.exercise?.bodyPart?.name) {
                parts.add(ex.lastFiveDrills[0].exercise.bodyPart.name);
            }
        });
        return ["All", ...Array.from(parts)];
    }, [analytics]);

    const filteredExercises = useMemo(() => {
        if (!analytics) return [];
        return exerciseNames.filter(name => {
            const data = analytics[name];
            const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
            const bodyPart = data.lastFiveDrills?.[0]?.exercise?.bodyPart?.name || "Other";
            const matchesBodyPart = selectedBodyPart === "All" || bodyPart === selectedBodyPart;
            return matchesSearch && matchesBodyPart;
        });
    }, [analytics, exerciseNames, searchQuery, selectedBodyPart]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4 text-blue-600 animate-pulse">
                    <Activity size={48} className="animate-spin" />
                    <p className="font-black text-sm uppercase tracking-widest">Crunching Performance Data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <TrendingUp className="text-blue-600" size={36} />
                        Exercise Analytics
                    </h1>
                    <p className="text-sm font-bold text-gray-400 mt-2 uppercase tracking-[0.2em]">Deep dive into your movement performance</p>
                </div>

                <div className="flex items-center gap-4">
                    {/* View Toggle */}
                    <div className="bg-white border-2 border-gray-100 p-1 rounded-2xl flex items-center shadow-sm">
                        <button
                            onClick={() => setViewMode("detailed")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'detailed' ? 'bg-slate-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <ListIcon size={14} />
                            Detailed
                        </button>
                        <button
                            onClick={() => setViewMode("insights")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'insights' ? 'bg-slate-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <LayoutGrid size={14} />
                            Insights
                        </button>
                    </div>

                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Find exercise..."
                            className="bg-white border-2 border-gray-100 rounded-2xl pl-12 pr-4 py-3 text-sm font-bold w-64 focus:ring-0 focus:border-blue-600 transition-all shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
                {bodyParts.map(part => (
                    <button
                        key={part}
                        onClick={() => setSelectedBodyPart(part)}
                        className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedBodyPart === part
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                            : 'bg-white border border-gray-100 text-gray-400 hover:border-blue-200 hover:text-blue-600'
                            }`}
                    >
                        {part}
                    </button>
                ))}
            </div>

            {/* Exercise Content */}
            {viewMode === "insights" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredExercises.map(name => {
                        const data = analytics[name];
                        const lastDrill = data.lastFiveDrills?.[0];
                        const unit = lastDrill?.unit || 'kg';
                        const chartData = [...data.lastFiveDrills].reverse().map(drill => ({
                            date: new Date(drill.creationDate).toLocaleDateString([], { month: 'short', day: 'numeric' }),
                            measurement: drill.measurement
                        }));

                        return (
                            <motion.div
                                key={name}
                                layout
                                className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden p-6 hover:shadow-md transition-all group"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-black text-gray-900 tracking-tight truncate max-w-[150px]">{name}</h3>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{lastDrill?.exercise?.bodyPart?.name || 'Other'}</p>
                                    </div>
                                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                                        <Dumbbell size={18} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2 mb-6">
                                    <MiniStat label="Avg" value={`${data.monthlyAverage.toFixed(1)} ${unit}`} color="text-blue-600" />
                                    <MiniStat label="Max" value={`${data.maxMeasurement} ${unit}`} color="text-red-500" />
                                    <MiniStat label="Completions" value={data.totalNumberOfTimesCompleted} color="text-green-600" />
                                </div>

                                <div className="h-24 -mx-6 bg-gray-50/50 pt-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData}>
                                            <defs>
                                                <linearGradient id={`colorMeasure-${name}`} x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <Area
                                                type="monotone"
                                                dataKey="measurement"
                                                stroke="#3b82f6"
                                                strokeWidth={2}
                                                fillOpacity={1}
                                                fill={`url(#colorMeasure-${name})`}
                                            />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 800 }}
                                                labelStyle={{ display: 'none' }}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {filteredExercises.map(name => {
                        const data = analytics[name];
                        const isExpanded = expandedExercise === name;
                        const lastDrill = data.lastFiveDrills?.[0];
                        const unit = lastDrill?.unit || 'kg';
                        const chartData = [...data.lastFiveDrills].reverse().map(drill => ({
                            date: new Date(drill.creationDate).toLocaleDateString([], { month: 'short', day: 'numeric' }),
                            measurement: drill.measurement,
                            reps: drill.repetition
                        }));

                        return (
                            <motion.div
                                key={name}
                                layout
                                className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-xl group"
                            >
                                <div className="p-8">
                                    <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-8">
                                        <div className="flex items-start gap-6">
                                            <div className="w-16 h-16 bg-blue-50 rounded-[1.5rem] flex items-center justify-center text-blue-600 shrink-0 group-hover:scale-110 transition-transform">
                                                <Dumbbell size={32} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">{name}</h3>
                                                    <span className="px-3 py-1 bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest rounded-full border border-gray-100">
                                                        {lastDrill?.exercise?.bodyPart?.name || 'Other'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-6 mt-3">
                                                    <div className="flex items-center gap-1.5">
                                                        <Activity size={14} className="text-green-500" />
                                                        <span className="text-xs font-bold text-gray-500">{data.totalNumberOfTimesCompleted} Completions</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Award size={14} className="text-orange-500" />
                                                        <span className="text-xs font-bold text-gray-500">Max: {data.maxMeasurement} {unit}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => setExpandedExercise(isExpanded ? null : name)}
                                                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${isExpanded
                                                    ? 'bg-slate-900 text-white shadow-xl'
                                                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                                    }`}
                                            >
                                                {isExpanded ? 'Hide Trends' : 'View Trends'}
                                                {isExpanded ? <ChevronRight size={14} className="rotate-90" /> : <ChevronRight size={14} />}
                                            </button>
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
                                                    {/* Stats Grid */}
                                                    <div className="space-y-4">
                                                        <StatCard
                                                            label="Monthly Avg"
                                                            value={`${data.monthlyAverage.toFixed(1)} ${unit}`}
                                                            icon={Calendar}
                                                            colorClass="bg-blue-500"
                                                        />
                                                        <StatCard
                                                            label="Personal Best"
                                                            value={`${data.maxMeasurement} ${unit}`}
                                                            icon={Target}
                                                            colorClass="bg-red-500"
                                                        />
                                                        <StatCard
                                                            label="Max Reps"
                                                            value={`${data.maxRepetitions} Reps`}
                                                            icon={Activity}
                                                            colorClass="bg-green-500"
                                                        />
                                                    </div>

                                                    {/* Chart */}
                                                    <div className="lg:col-span-2 bg-gray-50/50 p-8 rounded-[2rem] border border-gray-100 h-[300px]">
                                                        <div className="flex justify-between items-center mb-6">
                                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Progress (Last 5 Sessions)</p>
                                                        </div>
                                                        <ResponsiveContainer width="100%" height="80%">
                                                            <AreaChart data={chartData}>
                                                                <defs>
                                                                    <linearGradient id="colorMeasure" x1="0" y1="0" x2="0" y2="1">
                                                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                                    </linearGradient>
                                                                </defs>
                                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                                <XAxis
                                                                    dataKey="date"
                                                                    axisLine={false}
                                                                    tickLine={false}
                                                                    tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }}
                                                                />
                                                                <YAxis
                                                                    axisLine={false}
                                                                    tickLine={false}
                                                                    tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }}
                                                                />
                                                                <Tooltip
                                                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 800 }}
                                                                />
                                                                <Area
                                                                    type="monotone"
                                                                    dataKey="measurement"
                                                                    stroke="#3b82f6"
                                                                    strokeWidth={4}
                                                                    fillOpacity={1}
                                                                    fill="url(#colorMeasure)"
                                                                    name={`Weight (${unit})`}
                                                                />
                                                                <Area
                                                                    type="monotone"
                                                                    dataKey="reps"
                                                                    stroke="#10b981"
                                                                    strokeWidth={4}
                                                                    name="Reps"
                                                                    fillOpacity={0}
                                                                />
                                                            </AreaChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                </div>

                                                {/* Last 5 list */}
                                                <div className="mt-10 overflow-x-auto">
                                                    <table className="w-full text-left">
                                                        <thead>
                                                            <tr className="border-b border-gray-100">
                                                                <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest pl-4">Date</th>
                                                                <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Weight ({unit})</th>
                                                                <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Reps</th>
                                                                <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Notes</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {data.lastFiveDrills.map((drill, idx) => (
                                                                <tr key={drill.refId} className="border-b border-gray-50 last:border-0 hover:bg-blue-50/30 transition-colors">
                                                                    <td className="py-4 pl-4">
                                                                        <p className="text-xs font-black text-gray-700">{new Date(drill.creationDate).toLocaleDateString()}</p>
                                                                        <p className="text-[10px] font-bold text-gray-400">{new Date(drill.creationDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                                    </td>
                                                                    <td className="py-4 text-sm font-black text-gray-700">{drill.measurement}</td>
                                                                    <td className="py-4 text-sm font-black text-gray-700">{drill.repetition}</td>
                                                                    <td className="py-4 text-xs font-medium text-gray-400 italic max-w-xs truncate">{drill.notes || '--'}</td>
                                                                    <td className="py-4 pr-4 text-right">
                                                                        <div className="inline-flex items-center gap-1.5 text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                                                                            Session Logs
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
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {filteredExercises.length === 0 && (
                <div className="bg-white rounded-[2.5rem] p-20 text-center border-2 border-dashed border-gray-100">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                        <Search size={40} />
                    </div>
                    <h3 className="text-xl font-black text-gray-800 tracking-tight">No exercises found</h3>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-2">Try adjusting your filters or search query</p>
                </div>
            )}
        </div>
    );
};

export default function ExerciseAnalyticsPage() {
    return <Layout content={<ExerciseAnalytics />} />;
}
