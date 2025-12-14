
import Layout from "@/components/layout/Layout";
import { useEffect, useState } from "react";
import { fetchData } from "@/dataService";
import { API_FITMATE_BASE_URL } from "@/constants";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import {
    Activity, Dumbbell, Calendar, Flame, TrendingUp, Clock,
    Award, ChevronRight, User, MoreHorizontal
} from "lucide-react";
import Link from "next/link";


// --- Chart Config & Components ---
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-xl text-xs">
                <p className="font-bold text-gray-700">{label}</p>
                {payload.map((p, i) => (
                    <p key={i} style={{ color: p.color }} className="font-medium">
                        {p.name}: {p.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const DashboardCard = ({ title, value, subtext, icon: Icon, colorClass }) => (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-start justify-between transition-all hover:shadow-md">
        <div>
            <p className="text-sm font-medium text-gray-400 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-800 tracking-tight">{value}</h3>
            {subtext && <p className={`text-xs mt-1 font-medium ${subtext.includes('+') ? 'text-green-500' : 'text-gray-400'}`}>{subtext}</p>}
        </div>
        <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 text-opacity-100`}>
            <Icon size={22} className={colorClass.replace('bg-', 'text-')} />
        </div>
    </div>
);

const SectionHeader = ({ title, subtitle, action }) => (
    <div className="flex justify-between items-center mb-6">
        <div>
            <h2 className="text-lg font-bold text-gray-800">{title}</h2>
            {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
        </div>
        {action}
    </div>
);


const FitmateDashboardLogic = () => {
    const [stats, setStats] = useState({
        totalWorkouts: 0,
        volume: 0,
        streak: 3, // Mocked for now
        calories: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [pieData, setPieData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                // Fetching all routines for analytics
                // Note: In production you'd want aggregation endpoints
                const res = await fetchData(`${API_FITMATE_BASE_URL}/routines/routines`);
                const routines = res.data || [];

                // 1. Calculate KPIs
                const totalWorkouts = routines.length;

                // Estimate volume (sum of all weights in all sets in all drills)
                let volume = 0;
                let cals = 0;

                // 2. Process for Charts
                // Group by Date for Bar Chart
                const groupedByDate = {};
                const groupedByType = {};

                routines.forEach(r => {
                    const date = r.workoutDate; // YYYY-MM-DD
                    if (!groupedByDate[date]) groupedByDate[date] = { date, workouts: 0, volume: 0 };
                    groupedByDate[date].workouts += 1;

                    // Training Type distribution
                    const type = r.training?.name || 'Other';
                    if (!groupedByType[type]) groupedByType[type] = 0;
                    groupedByType[type] += 1;

                    // Metrics Drill Check
                    if (r.drills) {
                        r.drills.forEach(drill => {
                            // Assuming drill has flattened sets or we might need to look deeper. 
                            // The structure in previous steps was Flattened drills (1 set = 1 drill entry) for API,
                            // OR embedded sets. Let's assume the read model returns drilled arrays.
                            // Actually user's API structure: Routine -> drills (array).

                            // Simple volume calc: weight * reps
                            if (drill.measurement && drill.repetition) {
                                volume += (drill.measurement * drill.repetition);
                            }
                        });
                    }
                });

                // Convert charts to Arrays
                // Sort by date and take last 7-14 entries
                const barData = Object.values(groupedByDate)
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .slice(-7);

                const pData = Object.keys(groupedByType).map(k => ({
                    name: k, value: groupedByType[k]
                }));

                setChartData(barData);
                setPieData(pData);
                setStats({
                    totalWorkouts,
                    volume: Math.round(volume),
                    streak: 4, // Mock
                    calories: totalWorkouts * 320 // Mock avg cals
                });

                // Recent Activity
                setRecentActivity(routines.slice(0, 5)); // routines usually returned desc? if not sort.
                setLoading(false);

            } catch (e) {
                console.error("Dashboard Load Error", e);
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) return (
        <div className="flex h-96 items-center justify-center text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Welcome back, Athlete! 👋</h1>
                    <p className="text-gray-500 text-sm">Here is your fitness activity for this week.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/fitmate/routine/make-routine">
                        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95">
                            <Dumbbell size={18} /> Log Workout
                        </button>
                    </Link>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <DashboardCard
                    title="Total Workouts"
                    value={stats.totalWorkouts}
                    subtext="+2 this week"
                    icon={Activity}
                    colorClass="bg-blue-500 text-blue-500" // Light bg is handled by 'bg-opacity-10' in component
                />
                <DashboardCard
                    title="Volume Lifted"
                    value={`${(stats.volume / 1000).toFixed(1)}k kg`}
                    subtext="Cumulative load"
                    icon={Dumbbell}
                    colorClass="bg-purple-500 text-purple-500"
                />
                <DashboardCard
                    title="Total Duration"
                    value={`${Math.floor(stats.totalWorkouts * 45 / 60)}h`}
                    subtext="Approximate time"
                    icon={Clock}
                    colorClass="bg-orange-500 text-orange-500"
                />
                <DashboardCard
                    title="Current Streak"
                    value={`${stats.streak} Days`}
                    subtext="Keep it up!"
                    icon={Flame}
                    colorClass="bg-red-500 text-red-500"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Activity Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <SectionHeader title="Activity Overview" subtitle="Workouts per day (Last 7 Days)" />
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorWorkouts" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { weekday: 'short' })}
                                />
                                <YAxis hide domain={[0, 'auto']} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
                                <Area
                                    type="monotone"
                                    dataKey="workouts"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorWorkouts)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie Chart */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                    <SectionHeader title="Training Split" subtitle="Distribution by type" />
                    <div className="flex-1 min-h-[250px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Text */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-center pb-8">
                                <p className="text-2xl font-bold text-gray-800">{stats.totalWorkouts}</p>
                                <p className="text-xs text-gray-400 font-medium uppercase">Sessions</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent History List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                    <h2 className="font-bold text-gray-800">Recent History</h2>
                    <Link href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-700">View All</Link>
                </div>
                <div>
                    {recentActivity.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">No recent activity found.</div>
                    ) : (
                        recentActivity.map((routine, idx) => (
                            <div key={idx} className="p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-none flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                        <Dumbbell size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800">{routine.description || routine.training?.name || 'Untitled Workout'}</h4>
                                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                            <Calendar size={12} />
                                            <span>{routine.workoutDate}</span>
                                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                            <span>{routine.training?.name}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="hidden sm:block text-right">
                                        <p className="text-xs font-bold text-gray-500 uppercase">Status</p>
                                        <p className="text-sm font-bold text-green-600 flex items-center gap-1">
                                            Completed <CheckCircleIcon size={12} />
                                        </p>
                                    </div>
                                    <button className="p-2 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

// Mini Icon helper for the missing one in imports or just SVG inline
const CheckCircleIcon = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
)

const MainDesign = () => {
    return <Layout content={<FitmateDashboardLogic />} />;
}

export default MainDesign;