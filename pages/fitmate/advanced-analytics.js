import React, { useState, useEffect, useMemo } from 'react';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/context/AuthContext';
import fitmateService from '@/services/fitmate.service';
import {
    Activity, TrendingUp, Target, Clock, Zap, Calendar,
    ChevronRight, Dumbbell, BarChart3, PieChart as PieChartIcon,
    Layers, Award, Search, Filter, ArrowUpRight, ArrowDownRight,
    Trophy, Flame, Timer, Scale
} from 'lucide-react';
import {
    LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, ResponsiveContainer as RC,
    BarChart, Bar, Cell, PieChart, Pie, Legend, RadarChart,
    PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const StatCard = ({ label, value, subValue, icon: Icon, color, trend }) => (
    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all group overflow-hidden relative">
        <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full bg-${color}-50/50 group-hover:scale-125 transition-transform duration-500`} />
        <div className="relative z-10">
            <div className={`w-12 h-12 rounded-2xl bg-${color}-50 flex items-center justify-center text-${color}-600 mb-6`}>
                <Icon size={24} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
            <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
                {trend && (
                    <span className={`flex items-center text-[10px] font-black ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {Math.abs(trend)}%
                    </span>
                )}
            </div>
            {subValue && <p className="text-xs font-bold text-slate-400 mt-2">{subValue}</p>}
        </div>
    </div>
);

const SectionHeader = ({ title, subtitle, icon: Icon }) => (
    <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm text-indigo-600">
            <Icon size={24} />
        </div>
        <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{title}</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">{subtitle}</p>
        </div>
        <div className="flex-1 h-px bg-slate-100 ml-4" />
    </div>
);

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

const AdvancedAnalytics = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        trends: [],
        volume: {},
        frequent: [],
        distribution: {},
        progressions: {},
        efficiency: {},
        consistency: {},
        calories: {}
    });
    const [selectedExercise, setSelectedExercise] = useState("");

    useEffect(() => {
        const fetchAllData = async () => {
            if (!user?.username) return;
            setLoading(true);
            try {
                const [
                    trends, volume, frequent, dist, progressions,
                    efficiency, consistency, calories
                ] = await Promise.all([
                    fitmateService.getWorkoutTrends(user.username),
                    fitmateService.getBodyPartWorkoutVolume(user.username),
                    fitmateService.getMostFrequentExercises(user.username),
                    fitmateService.getRoutineDistribution(user.username),
                    fitmateService.getExerciseProgressions(user.username),
                    fitmateService.getRoutineEfficiency(user.username),
                    fitmateService.getActivityConsistency(user.username),
                    fitmateService.getCaloriesDuration(user.username)
                ]);

                setData({
                    trends: trends.data || [],
                    volume: volume.data || {},
                    frequent: frequent.data || [],
                    distribution: dist.data || {},
                    progressions: progressions.data || {},
                    efficiency: efficiency.data || {},
                    consistency: consistency.data || {},
                    calories: calories.data || {}
                });

                const exerciseKeys = Object.keys(progressions.data || {});
                if (exerciseKeys.length > 0) setSelectedExercise(exerciseKeys[0]);

            } catch (error) {
                console.error("Failed to fetch advanced analytics:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [user?.username]);

    const workoutTrendsData = useMemo(() => {
        return data.trends.map(t => ({
            ...t,
            dateLabel: new Date(t.date).toLocaleDateString([], { month: 'short', day: 'numeric' })
        }));
    }, [data.trends]);

    const bodyPartVolumeData = useMemo(() => {
        return Object.entries(data.volume).map(([name, value]) => ({ name, value }));
    }, [data.volume]);

    const distributionData = useMemo(() => {
        return Object.entries(data.distribution).map(([name, value]) => ({ name, value }));
    }, [data.distribution]);

    const selectedProgressionData = useMemo(() => {
        if (!selectedExercise || !data.progressions[selectedExercise]) return [];
        return data.progressions[selectedExercise].map(p => ({
            ...p,
            dateLabel: new Date(p.date).toLocaleDateString([], { month: 'short', year: '2-digit' })
        }));
    }, [data.progressions, selectedExercise]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[70vh]">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-slate-100 rounded-full" />
                        <div className="absolute top-0 left-0 w-20 h-20 border-4 border-t-indigo-600 rounded-full animate-spin" />
                        <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600" size={24} />
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-black text-slate-900 uppercase tracking-widest">Compiling Intelligence</p>
                        <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest animate-pulse">Scanning biometric patterns...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-12 space-y-16">
            {/* Hero Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 pb-12 border-b border-slate-100">
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-[0.3em]">
                        <Zap size={18} fill="currentColor" />
                        <span>Performance Lab</span>
                    </div>
                    <div>
                        <h1 className="text-6xl font-black text-slate-900 tracking-tighter leading-none mb-4">Advanced Analytics</h1>
                        <p className="text-slate-400 font-bold text-lg max-w-2xl uppercase tracking-widest">Deep telemetry and cognitive insights for your peak performance.</p>
                    </div>
                </div>
                <div className="bg-slate-900 text-white p-6 rounded-[2.5rem] flex items-center gap-6 shadow-2xl shadow-indigo-100">
                    <div className="flex flex-col items-center border-r border-slate-700 pr-6">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Current Streak</span>
                        <div className="flex items-center gap-2">
                            <Flame className="text-orange-500" fill="currentColor" size={20} />
                            <span className="text-2xl font-black">{data.consistency.currentStreakDays || 0}d</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Efficiency</span>
                        <div className="flex items-center gap-2">
                            <Zap className="text-yellow-400" fill="currentColor" size={20} />
                            <span className="text-2xl font-black">{data.efficiency.averageCaloriesPerMinute?.toFixed(1) || 0}</span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">cal/min</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Total Active Days"
                    value={data.consistency.totalActiveDays || 0}
                    icon={Calendar}
                    color="indigo"
                    subValue={`Longest: ${data.consistency.longestStreakDays}d`}
                />
                <StatCard
                    label="Total Calories"
                    value={data.calories.totalCalories?.toLocaleString() || 0}
                    icon={Flame}
                    color="orange"
                    subValue={`Avg: ${data.calories.averageCaloriesPerRoutine?.toFixed(0)} / workout`}
                />
                <StatCard
                    label="Volume Efficiency"
                    value={data.efficiency.averageDrillsPerMinute?.toFixed(2) || 0}
                    icon={Zap}
                    color="yellow"
                    subValue="Avg Drills / Minute"
                />
                <StatCard
                    label="Total Duration"
                    value={data.calories.totalDurationMinutes || 0}
                    icon={Timer}
                    color="green"
                    subValue={`${data.calories.averageDurationMinutes?.toFixed(1)}m Avg session`}
                />
            </div>

            {/* Workout Trends */}
            <div className="space-y-8">
                <SectionHeader title="Workout Telemetry" subtitle="Consistency and output trends" icon={TrendingUp} />
                <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={workoutTrendsData}>
                            <defs>
                                <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="dateLabel"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }}
                            />
                            <YAxis
                                hide
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 900, fontSize: '12px' }}
                                itemStyle={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}
                            />
                            <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', textTransform: 'uppercase', fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em' }} />
                            <Area
                                type="monotone"
                                dataKey="caloriesBurnt"
                                stroke="#6366f1"
                                strokeWidth={4}
                                fillOpacity={1}
                                fill="url(#colorCalories)"
                                name="Calories"
                            />
                            <Line
                                type="monotone"
                                dataKey="workoutDurationMinutes"
                                stroke="#10b981"
                                strokeWidth={4}
                                dot={{ fill: '#10b981', r: 6, strokeWidth: 0 }}
                                name="Duration (Min)"
                            />
                            <Line
                                type="monotone"
                                dataKey="routinesCompleted"
                                stroke="#f59e0b"
                                strokeWidth={4}
                                dot={{ fill: '#f59e0b', r: 6, strokeWidth: 0 }}
                                name="Routines"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Body Part Volume */}
                <div className="space-y-8">
                    <SectionHeader title="Body Architecture" subtitle="Load distribution by muscle group" icon={Layers} />
                    <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart outerRadius="70%" data={bodyPartVolumeData}>
                                <PolarGrid stroke="#f1f5f9" />
                                <PolarAngleAxis
                                    dataKey="name"
                                    tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }}
                                />
                                <PolarRadiusAxis hide />
                                <Radar
                                    name="Volume"
                                    dataKey="value"
                                    stroke="#ec4899"
                                    fill="#ec4899"
                                    fillOpacity={0.4}
                                />
                                <Tooltip contentStyle={{ borderRadius: '15px' }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Routine Distribution */}
                <div className="space-y-8">
                    <SectionHeader title="Training Modality" subtitle="Allocation of workout styles" icon={PieChartIcon} />
                    <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm h-[400px] flex items-center">
                        <ResponsiveContainer width="100%" height="90%">
                            <PieChart>
                                <Pie
                                    data={distributionData}
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {distributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={12} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Frequency List & Performance Records */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Most Frequent Exercises */}
                <div className="lg:col-span-2 space-y-8">
                    <SectionHeader title="Elite Movements" subtitle="Most frequent performance drills" icon={Dumbbell} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {data.frequent.map((ex, idx) => (
                            <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between hover:border-indigo-100 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all font-black text-xs">
                                        #{idx + 1}
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-800 text-sm tracking-tight">{ex.exerciseName}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{ex.frequency} Sessions</p>
                                    </div>
                                </div>
                                <div className="h-1.5 w-24 bg-slate-50 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-indigo-500 rounded-full"
                                        style={{ width: `${(ex.frequency / data.frequent[0].frequency) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Records side panel */}
                <div className="space-y-8">
                    <SectionHeader title="Hall of Fame" subtitle="Peak metrics recorded" icon={Award} />
                    <div className="space-y-6">
                        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                            <div className="relative z-10 space-y-6">
                                <div className="flex justify-between items-start">
                                    <Trophy className="text-orange-400" size={32} />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Max Calorie Output</span>
                                </div>
                                <div>
                                    <h4 className="text-4xl font-black mb-1">{data.calories.bestByCalories?.caloriesBurnt || 0}</h4>
                                    <p className="text-xs font-black uppercase tracking-widest text-orange-400">Calories Burnt</p>
                                </div>
                                <div className="pt-4 border-t border-slate-700 space-y-2">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{data.calories.bestByCalories?.trainingName}</p>
                                    <p className="text-xs font-black">{new Date(data.calories.bestByCalories?.routineDate).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                    <p className="text-[10px] font-bold text-slate-200 uppercase tracking-widest">{data.calories.bestByCalories?.durationMinutes} Min • {data.calories.bestByCalories?.drillsCount} Drills</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                            <div className="relative z-10 space-y-6">
                                <div className="flex justify-between items-start">
                                    <Timer className="text-indigo-200" size={32} />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Max Endurance</span>
                                </div>
                                <div>
                                    <h4 className="text-4xl font-black mb-1">{data.calories.bestByDuration?.durationMinutes || 0}</h4>
                                    <p className="text-xs font-black uppercase tracking-widest text-indigo-200">Active Minutes</p>
                                </div>
                                <div className="pt-4 border-t border-indigo-500 space-y-2">
                                    <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">{data.calories.bestByDuration?.trainingName}</p>
                                    <p className="text-xs font-black">{new Date(data.calories.bestByDuration?.routineDate).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                    <p className="text-[10px] font-bold text-indigo-100 uppercase tracking-widest">{data.calories.bestByDuration?.caloriesBurnt} Cal • {data.calories.bestByDuration?.drillsCount} Drills</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Exercise Progressions Section */}
            <div className="space-y-8 bg-slate-50 -mx-4 px-4 py-16 rounded-[4rem] border border-slate-100">
                <div className="max-w-7xl mx-auto space-y-12">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                        <SectionHeader title="Evolutionary Progress" subtitle="Longitudinal biomechanical growth" icon={BarChart3} />
                        <div className="relative w-full md:w-80">
                            <select
                                value={selectedExercise}
                                onChange={(e) => setSelectedExercise(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-2xl p-4 font-black text-sm uppercase tracking-widest outline-none focus:ring-4 focus:ring-indigo-100 appearance-none text-slate-800 shadow-sm"
                            >
                                {Object.keys(data.progressions).map(ex => (
                                    <option key={ex} value={ex}>{ex}</option>
                                ))}
                            </select>
                            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-slate-400" size={20} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Stats side panel */}
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Latest Achievement</p>
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                                            <Scale size={28} />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-black text-slate-900">{selectedProgressionData[selectedProgressionData.length - 1]?.maxMeasurement.toFixed(1) || 0}</p>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Max Measurement</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                                        <Flame size={28} />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-black text-slate-900">{selectedProgressionData[selectedProgressionData.length - 1]?.maxRepetitions || 0}</p>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Max Repetitions</p>
                                    </div>
                                </div>
                                <div className="pt-6 border-t border-slate-50">
                                    <p className="text-xs font-bold text-slate-500 leading-relaxed italic border-l-4 border-indigo-200 pl-4 bg-indigo-50/30 py-4 rounded-r-xl">
                                        &quot;{selectedExercise}&quot; shows consistent improvement in muscular adaptive response over the tracked period.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Large chart */}
                        <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={selectedProgressionData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="dateLabel"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }}
                                    />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 900 }}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', textTransform: 'uppercase', fontSize: '10px', fontWeight: 900 }} />
                                    <Line
                                        type="monotone"
                                        dataKey="maxMeasurement"
                                        stroke="#6366f1"
                                        strokeWidth={6}
                                        dot={{ fill: '#6366f1', r: 8, strokeWidth: 0 }}
                                        activeDot={{ r: 10, strokeWidth: 0 }}
                                        name="Max Measurement"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="averageMeasurement"
                                        stroke="#94a3b8"
                                        strokeWidth={3}
                                        strokeDasharray="8 8"
                                        dot={false}
                                        name="Avg Measurement"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="maxRepetitions"
                                        stroke="#10b981"
                                        strokeWidth={6}
                                        dot={{ fill: '#10b981', r: 8, strokeWidth: 0 }}
                                        activeDot={{ r: 10, strokeWidth: 0 }}
                                        name="Max Reps"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function AdvancedAnalyticsPage() {
    return <Layout content={<AdvancedAnalytics />} />;
}
