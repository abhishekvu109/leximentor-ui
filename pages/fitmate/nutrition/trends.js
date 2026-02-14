import Layout from "@/components/layout/Layout";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import fitmateService from "@/services/fitmate.service";
import {
    ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar
} from "recharts";

const todayIso = () => new Date().toISOString().split("T")[0];
const daysAgoIso = (days) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().split("T")[0];
};

const TrendsPageContent = () => {
    const { user } = useAuth();
    const [fromDate, setFromDate] = useState(daysAgoIso(30));
    const [toDate, setToDate] = useState(todayIso());
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const trendRows = useMemo(() => (data?.points || []).map((point) => ({
        ...point,
        adherence: point.withinGoalRange ? 1 : 0
    })), [data]);

    const loadTrends = async () => {
        if (!user?.username) return;
        setLoading(true);
        setError("");
        try {
            const res = await fitmateService.getNutritionTrends(user.username, fromDate, toDate);
            setData(res?.data || null);
        } catch (e) {
            setError(e?.response?.data?.meta?.description || "Failed to load trends.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user?.username) return;
        loadTrends();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.username]);

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-16">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Nutrition Trends</h1>
                    <p className="text-slate-500 font-semibold">Analyze calorie and macro behavior over time.</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/fitmate/nutrition" className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50">Dashboard</Link>
                    <Link href="/fitmate/nutrition/history" className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50">History</Link>
                </div>
            </div>

            {error && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}

            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold" />
                    <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold" />
                    <button onClick={() => { setFromDate(daysAgoIso(7)); setToDate(todayIso()); }} className="px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-200">Last 7 Days</button>
                    <button onClick={loadTrends} className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-black hover:bg-black">
                        {loading ? "Loading..." : "Load Trends"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs uppercase font-black tracking-wider text-slate-500">Goal</p>
                    <p className="text-2xl font-black text-slate-900">{Number(data?.caloriesTarget || 0).toFixed(0)} kcal</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs uppercase font-black tracking-wider text-slate-500">Days With Entries</p>
                    <p className="text-2xl font-black text-slate-900">{Number(data?.daysWithEntries || 0)}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs uppercase font-black tracking-wider text-slate-500">Adherent Days</p>
                    <p className="text-2xl font-black text-slate-900">{Number(data?.adherentDays || 0)}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs uppercase font-black tracking-wider text-slate-500">Adherence</p>
                    <p className="text-2xl font-black text-slate-900">{Number(data?.adherencePercentage || 0).toFixed(1)}%</p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                    <h2 className="text-lg font-black text-slate-900 mb-4">Calories Over Time</h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendRows}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="consumedCalories" name="Consumed Calories" stroke="#f97316" strokeWidth={3} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                    <h2 className="text-lg font-black text-slate-900 mb-4">Daily Macro Distribution</h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={trendRows}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="consumedProtein" name="Protein (g)" fill="#3b82f6" />
                                <Bar dataKey="consumedCarbs" name="Carbs (g)" fill="#8b5cf6" />
                                <Bar dataKey="consumedFat" name="Fat (g)" fill="#f59e0b" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <h2 className="text-lg font-black text-slate-900 mb-4">Daily Adherence</h2>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={trendRows}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} domain={[0, 1]} />
                            <Tooltip formatter={(v) => (Number(v) === 1 ? "Within Range" : "Outside Range")} />
                            <Bar dataKey="adherence" name="Adherence (1=yes)" fill="#10b981" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default function NutritionTrendsPage() {
    return <Layout content={<TrendsPageContent />} />;
}
