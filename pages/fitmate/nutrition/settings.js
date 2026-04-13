import Layout from "@/components/layout/Layout";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import fitmateService from "@/services/fitmate.service";
import { Save } from "lucide-react";

const todayIso = () => new Date().toISOString().split("T")[0];

const SettingsPageContent = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [form, setForm] = useState({
        dailyCaloriesTarget: 2000,
        proteinTarget: 120,
        carbTarget: 220,
        fatTarget: 70,
        effectiveFrom: todayIso(),
        effectiveTo: ""
    });

    const loadGoal = async () => {
        if (!user?.username) return;
        setLoading(true);
        setError("");
        try {
            const res = await fitmateService.getNutritionGoal(user.username);
            const goal = res?.data;
            if (goal) {
                setForm({
                    dailyCaloriesTarget: goal.dailyCaloriesTarget ?? 2000,
                    proteinTarget: goal.proteinTarget ?? 0,
                    carbTarget: goal.carbTarget ?? 0,
                    fatTarget: goal.fatTarget ?? 0,
                    effectiveFrom: goal.effectiveFrom || todayIso(),
                    effectiveTo: goal.effectiveTo || ""
                });
            }
        } catch (e) {
            setError(e?.response?.data?.meta?.description || "Failed to load goal.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user?.username) return;
        loadGoal();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.username]);

    const updateField = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const saveGoal = async (e) => {
        e.preventDefault();
        if (!user?.username) return;
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            await fitmateService.upsertNutritionGoal({
                username: user.username,
                dailyCaloriesTarget: Number(form.dailyCaloriesTarget || 0),
                proteinTarget: Number(form.proteinTarget || 0),
                carbTarget: Number(form.carbTarget || 0),
                fatTarget: Number(form.fatTarget || 0),
                effectiveFrom: form.effectiveFrom,
                effectiveTo: form.effectiveTo || null
            });
            setSuccess("Nutrition goal updated.");
            await loadGoal();
        } catch (e2) {
            setError(e2?.response?.data?.meta?.description || "Failed to save goal.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-16">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Nutrition Settings</h1>
                    <p className="text-slate-500 font-semibold">Define your calorie and macro targets.</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/fitmate/nutrition" className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50">Dashboard</Link>
                    <Link href="/fitmate/nutrition/trends" className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50">Trends</Link>
                </div>
            </div>

            {error && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}
            {success && <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm font-semibold text-emerald-700">{success}</div>}

            <form onSubmit={saveGoal} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs uppercase tracking-widest font-black text-slate-500 mb-1">Daily Calories Target</label>
                        <input
                            type="number"
                            step="0.1"
                            value={form.dailyCaloriesTarget}
                            onChange={(e) => updateField("dailyCaloriesTarget", e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase tracking-widest font-black text-slate-500 mb-1">Protein Target (g)</label>
                        <input
                            type="number"
                            step="0.1"
                            value={form.proteinTarget}
                            onChange={(e) => updateField("proteinTarget", e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold"
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase tracking-widest font-black text-slate-500 mb-1">Carb Target (g)</label>
                        <input
                            type="number"
                            step="0.1"
                            value={form.carbTarget}
                            onChange={(e) => updateField("carbTarget", e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold"
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase tracking-widest font-black text-slate-500 mb-1">Fat Target (g)</label>
                        <input
                            type="number"
                            step="0.1"
                            value={form.fatTarget}
                            onChange={(e) => updateField("fatTarget", e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold"
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase tracking-widest font-black text-slate-500 mb-1">Effective From</label>
                        <input
                            type="date"
                            value={form.effectiveFrom}
                            onChange={(e) => updateField("effectiveFrom", e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase tracking-widest font-black text-slate-500 mb-1">Effective To (Optional)</label>
                        <input
                            type="date"
                            value={form.effectiveTo}
                            onChange={(e) => updateField("effectiveTo", e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold"
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <button type="submit" disabled={saving || loading} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-black hover:bg-black disabled:opacity-50">
                        <Save size={16} />
                        {saving ? "Saving..." : "Save Goal"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default function NutritionSettingsPage() {
    return <Layout content={<SettingsPageContent />} />;
}
