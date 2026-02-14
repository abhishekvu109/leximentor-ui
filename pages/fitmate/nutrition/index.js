import Layout from "@/components/layout/Layout";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import fitmateService from "@/services/fitmate.service";
import { CalendarDays, Download, Flame, Sparkles, Plus, Target } from "lucide-react";

const MEAL_TYPES = ["BREAKFAST", "LUNCH", "DINNER", "SNACK", "OTHER"];

const todayIso = () => new Date().toISOString().split("T")[0];

const MacroProgress = ({ label, value, target, color }) => {
    const safeTarget = Number(target) > 0 ? Number(target) : 0;
    const ratio = safeTarget === 0 ? 0 : Math.min(100, Math.round((Number(value || 0) / safeTarget) * 100));
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-600">
                <span>{label}</span>
                <span>{Number(value || 0).toFixed(1)} / {safeTarget.toFixed(1)}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className={`h-full ${color}`} style={{ width: `${ratio}%` }} />
            </div>
        </div>
    );
};

const NutritionDashboardPage = () => {
    const { user } = useAuth();
    const [selectedDate, setSelectedDate] = useState(todayIso());
    const [exportFrom, setExportFrom] = useState(todayIso());
    const [exportTo, setExportTo] = useState(todayIso());
    const [dailySummary, setDailySummary] = useState(null);
    const [entries, setEntries] = useState([]);
    const [goal, setGoal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [aiAssumptions, setAiAssumptions] = useState([]);
    const [aiConfidence, setAiConfidence] = useState(null);
    const [form, setForm] = useState({
        entryDate: todayIso(),
        entryTime: "",
        mealType: "BREAKFAST",
        foodName: "",
        servingQty: 1,
        servingUnit: "serving",
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0,
        sourceType: "MANUAL",
        notes: ""
    });

    const groupedByMeal = useMemo(() => {
        return entries.reduce((acc, entry) => {
            const key = entry.mealType || "OTHER";
            if (!acc[key]) acc[key] = [];
            acc[key].push(entry);
            return acc;
        }, {});
    }, [entries]);

    const loadData = async (dateVal) => {
        if (!user?.username) return;
        setLoading(true);
        setError("");
        try {
            const [summaryRes, entryRes, goalRes] = await Promise.all([
                fitmateService.getNutritionDailySummary(user.username, dateVal),
                fitmateService.getFoodEntries(user.username, dateVal, dateVal),
                fitmateService.getNutritionGoal(user.username)
            ]);
            setDailySummary(summaryRes?.data || null);
            setEntries(entryRes?.data || []);
            setGoal(goalRes?.data || null);
        } catch (e) {
            setError(e?.response?.data?.meta?.description || "Failed to load nutrition data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user?.username) return;
        loadData(selectedDate);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.username, selectedDate]);

    const onFormChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const parseAiJson = (payload) => {
        const candidates = [
            payload?.response,
            payload?.data,
            payload?.result,
            payload
        ];

        for (const candidate of candidates) {
            if (!candidate) continue;
            if (typeof candidate === "object") return candidate;
            if (typeof candidate === "string") {
                try {
                    return JSON.parse(candidate);
                } catch (_) {
                    const match = candidate.match(/\{[\s\S]*\}/);
                    if (match) {
                        try {
                            return JSON.parse(match[0]);
                        } catch (_) {
                            // continue
                        }
                    }
                }
            }
        }
        throw new Error("Unable to parse AI response JSON.");
    };

    const handleGenerateWithAI = async () => {
        if (!form.foodName?.trim()) {
            setError("Enter food name before AI generation.");
            return;
        }
        setGenerating(true);
        setError("");
        setSuccess("");
        setAiAssumptions([]);
        setAiConfidence(null);
        try {
            const raw = await fitmateService.estimateNutritionWithAI({
                foodName: form.foodName,
                servingQty: form.servingQty,
                servingUnit: form.servingUnit,
                notes: form.notes
            });
            const parsed = parseAiJson(raw);
            const estimated = parsed?.estimatedNutrition || {};

            setForm((prev) => ({
                ...prev,
                calories: Number(estimated.calories || 0),
                protein: Number(estimated.protein || 0),
                carbs: Number(estimated.carbs || 0),
                fat: Number(estimated.fat || 0),
                fiber: Number(estimated.fiber || 0),
                sugar: Number(estimated.sugar || 0),
                sodium: Number(estimated.sodium || 0),
                sourceType: "MANUAL"
            }));

            setAiAssumptions(Array.isArray(parsed?.assumptions) ? parsed.assumptions : []);
            setAiConfidence(
                Number.isFinite(Number(parsed?.confidence)) ? Number(parsed.confidence) : null
            );
            setSuccess("AI estimates applied. Review and adjust if needed.");
        } catch (e) {
            setError(e?.response?.data?.message || e?.message || "Failed to generate nutrition values with AI.");
        } finally {
            setGenerating(false);
        }
    };

    const handleAddEntry = async (e) => {
        e.preventDefault();
        if (!user?.username) return;
        setSubmitting(true);
        setError("");
        setSuccess("");
        try {
            await fitmateService.addFoodEntry({
                ...form,
                username: user.username,
                servingQty: Number(form.servingQty || 0),
                calories: Number(form.calories || 0),
                protein: Number(form.protein || 0),
                carbs: Number(form.carbs || 0),
                fat: Number(form.fat || 0),
                fiber: Number(form.fiber || 0),
                sugar: Number(form.sugar || 0),
                sodium: Number(form.sodium || 0)
            });
            setSuccess("Food entry added.");
            setForm((prev) => ({
                ...prev,
                foodName: "",
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0,
                fiber: 0,
                sugar: 0,
                sodium: 0,
                notes: ""
            }));
            await loadData(selectedDate);
        } catch (e2) {
            setError(e2?.response?.data?.meta?.description || "Failed to add entry.");
        } finally {
            setSubmitting(false);
        }
    };

    const downloadExport = async (format) => {
        if (!user?.username) return;
        if (!exportFrom || !exportTo) {
            setError("Select from and to date for export.");
            return;
        }
        try {
            const blob = await fitmateService.exportNutrition(format, user.username, exportFrom, exportTo);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            const ext = format.toLowerCase() === "json" ? "json" : "csv";
            a.href = url;
            a.download = `nutrition_${user.username}_${exportFrom}_to_${exportTo}.${ext}`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (e) {
            setError(e?.response?.data?.meta?.description || "Failed to export nutrition data.");
        }
    };

    const targetCalories = Number(dailySummary?.caloriesTarget || 0);
    const consumedCalories = Number(dailySummary?.consumedCalories || 0);
    const remainingCalories = Number(dailySummary?.remainingCalories || 0);
    const consumedProtein = Number(dailySummary?.consumedProtein || 0);
    const consumedCarbs = Number(dailySummary?.consumedCarbs || 0);
    const consumedFat = Number(dailySummary?.consumedFat || 0);

    const calorieTarget = Number(goal?.dailyCaloriesTarget || 0);
    const proteinTarget = Number(goal?.proteinTarget || 0);
    const carbTarget = Number(goal?.carbTarget || 0);
    const fatTarget = Number(goal?.fatTarget || 0);
    const hasGoal = calorieTarget > 0;

    const calorieMet = hasGoal ? consumedCalories >= calorieTarget * 0.9 && consumedCalories <= calorieTarget * 1.1 : null;
    const proteinMet = proteinTarget > 0 ? consumedProtein >= proteinTarget : null;
    const carbsMet = carbTarget > 0 ? consumedCarbs <= carbTarget * 1.1 : null;
    const fatMet = fatTarget > 0 ? consumedFat <= fatTarget * 1.1 : null;

    const statusBadge = (met) => {
        if (met === null) return <span className="px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500">N/A</span>;
        if (met) return <span className="px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700">On Track</span>;
        return <span className="px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-amber-100 text-amber-700">Off Track</span>;
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-16">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">Nutrition Tracker</h1>
                    <p className="text-slate-500 font-semibold">Track food intake, calories, and macro balance every day.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Link href="/fitmate/nutrition/batch-log" className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50">Batch Log</Link>
                    <Link href="/fitmate/nutrition/history" className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50">History</Link>
                    <Link href="/fitmate/nutrition/trends" className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50">Trends</Link>
                    <Link href="/fitmate/nutrition/settings" className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50">Settings</Link>
                </div>
            </div>

            {error && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}
            {success && <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm font-semibold text-emerald-700">{success}</div>}

            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
                <div className="flex flex-wrap items-center gap-3">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Date</label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => {
                            setSelectedDate(e.target.value);
                            setForm((prev) => ({ ...prev, entryDate: e.target.value }));
                        }}
                        className="px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-3xl p-6 bg-white border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-xs uppercase tracking-widest font-black text-slate-500">Consumed</p>
                        <Flame size={18} className="text-orange-500" />
                    </div>
                    <p className="text-3xl font-black text-slate-900 mt-3">{consumedCalories.toFixed(0)}</p>
                    <p className="text-xs text-slate-500 font-semibold mt-1">kcal</p>
                </div>
                <div className="rounded-3xl p-6 bg-white border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-xs uppercase tracking-widest font-black text-slate-500">Target</p>
                        <Target size={18} className="text-blue-500" />
                    </div>
                    <p className="text-3xl font-black text-slate-900 mt-3">{targetCalories.toFixed(0)}</p>
                    <p className="text-xs text-slate-500 font-semibold mt-1">kcal</p>
                </div>
                <div className="rounded-3xl p-6 bg-white border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-xs uppercase tracking-widest font-black text-slate-500">Remaining</p>
                        <CalendarDays size={18} className="text-emerald-500" />
                    </div>
                    <p className={`text-3xl font-black mt-3 ${remainingCalories < 0 ? "text-red-600" : "text-slate-900"}`}>{remainingCalories.toFixed(0)}</p>
                    <p className="text-xs text-slate-500 font-semibold mt-1">kcal</p>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-black text-slate-900">Goal Status (Today)</h2>
                        <p className="text-xs font-semibold text-slate-500">Active nutrition goal and whether you are meeting it.</p>
                    </div>
                    <Link href="/fitmate/nutrition/settings" className="px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-200">
                        Edit Goals
                    </Link>
                </div>

                {!hasGoal && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-800">
                        No active goal set. Add your calorie/macro targets in Nutrition Settings.
                    </div>
                )}

                {hasGoal && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                        <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-xs font-black uppercase tracking-widest text-slate-500">Calories</p>
                                {statusBadge(calorieMet)}
                            </div>
                            <p className="text-lg font-black text-slate-900">{consumedCalories.toFixed(0)} / {calorieTarget.toFixed(0)} kcal</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-xs font-black uppercase tracking-widest text-slate-500">Protein</p>
                                {statusBadge(proteinMet)}
                            </div>
                            <p className="text-lg font-black text-slate-900">{consumedProtein.toFixed(1)} / {proteinTarget.toFixed(1)} g</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-xs font-black uppercase tracking-widest text-slate-500">Carbs</p>
                                {statusBadge(carbsMet)}
                            </div>
                            <p className="text-lg font-black text-slate-900">{consumedCarbs.toFixed(1)} / {carbTarget.toFixed(1)} g</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-xs font-black uppercase tracking-widest text-slate-500">Fat</p>
                                {statusBadge(fatMet)}
                            </div>
                            <p className="text-lg font-black text-slate-900">{consumedFat.toFixed(1)} / {fatTarget.toFixed(1)} g</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                <h2 className="text-lg font-black text-slate-900">Macro Progress</h2>
                <MacroProgress label="Protein (g)" value={dailySummary?.consumedProtein || 0} target={goal?.proteinTarget || 0} color="bg-blue-500" />
                <MacroProgress label="Carbs (g)" value={dailySummary?.consumedCarbs || 0} target={goal?.carbTarget || 0} color="bg-violet-500" />
                <MacroProgress label="Fat (g)" value={dailySummary?.consumedFat || 0} target={goal?.fatTarget || 0} color="bg-amber-500" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                    <h2 className="text-lg font-black text-slate-900 mb-4">Meals Today</h2>
                    {loading ? (
                        <div className="py-10 text-center text-sm font-semibold text-slate-500">Loading entries...</div>
                    ) : (
                        <div className="space-y-4">
                            {MEAL_TYPES.map((mealType) => (
                                <div key={mealType} className="rounded-2xl border border-slate-200 overflow-hidden">
                                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                                        <h3 className="text-sm font-black text-slate-700 tracking-wide">{mealType}</h3>
                                        <span className="text-xs font-bold text-slate-500">{(groupedByMeal[mealType] || []).length} items</span>
                                    </div>
                                    <div className="divide-y divide-slate-100">
                                        {(groupedByMeal[mealType] || []).length === 0 && (
                                            <div className="px-4 py-3 text-xs text-slate-500">No entries.</div>
                                        )}
                                        {(groupedByMeal[mealType] || []).map((entry) => (
                                            <div key={entry.refId} className="px-4 py-3 flex items-center justify-between gap-3">
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">{entry.foodName}</p>
                                                    <p className="text-xs text-slate-500">
                                                        {entry.entryTime || "--:--"} | {Number(entry.servingQty || 0).toFixed(1)} {entry.servingUnit || "serving"}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-black text-slate-800">{Number(entry.calories || 0).toFixed(0)} kcal</p>
                                                    <p className="text-xs text-slate-500">P {entry.protein || 0} | C {entry.carbs || 0} | F {entry.fat || 0}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
                    <h2 className="text-lg font-black text-slate-900">Quick Add Entry</h2>
                    <form className="space-y-3" onSubmit={handleAddEntry}>
                        <input type="date" value={form.entryDate} onChange={(e) => onFormChange("entryDate", e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold" />
                        <input type="time" value={form.entryTime} onChange={(e) => onFormChange("entryTime", e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold" />
                        <select value={form.mealType} onChange={(e) => onFormChange("mealType", e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold">
                            {MEAL_TYPES.map((m) => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <input type="text" placeholder="Food name" value={form.foodName} onChange={(e) => onFormChange("foodName", e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold" required />
                        <div className="grid grid-cols-2 gap-2">
                            <input type="number" step="0.1" placeholder="Serving qty" value={form.servingQty} onChange={(e) => onFormChange("servingQty", e.target.value)} className="px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold" />
                            <input type="text" placeholder="Unit" value={form.servingUnit} onChange={(e) => onFormChange("servingUnit", e.target.value)} className="px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold" />
                        </div>
                        <input type="number" step="0.1" placeholder="Calories" value={form.calories} onChange={(e) => onFormChange("calories", e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold" required />
                        <div className="grid grid-cols-3 gap-2">
                            <input type="number" step="0.1" placeholder="Protein" value={form.protein} onChange={(e) => onFormChange("protein", e.target.value)} className="px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold" />
                            <input type="number" step="0.1" placeholder="Carbs" value={form.carbs} onChange={(e) => onFormChange("carbs", e.target.value)} className="px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold" />
                            <input type="number" step="0.1" placeholder="Fat" value={form.fat} onChange={(e) => onFormChange("fat", e.target.value)} className="px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold" />
                        </div>
                        <textarea placeholder="Notes" value={form.notes} onChange={(e) => onFormChange("notes", e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold min-h-20" />
                        <button
                            type="button"
                            onClick={handleGenerateWithAI}
                            disabled={generating}
                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-black hover:bg-indigo-700 disabled:opacity-50"
                        >
                            <Sparkles size={16} />
                            {generating ? "Generating..." : "Generate with AI"}
                        </button>
                        {(aiConfidence !== null || aiAssumptions.length > 0) && (
                            <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3 space-y-2">
                                {aiConfidence !== null && (
                                    <p className="text-xs font-bold text-indigo-800">AI Confidence: {aiConfidence}%</p>
                                )}
                                {aiAssumptions.length > 0 && (
                                    <ul className="list-disc ml-5 space-y-1 text-xs font-semibold text-indigo-800">
                                        {aiAssumptions.slice(0, 4).map((item, idx) => (
                                            <li key={`${item}-${idx}`}>{item}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                        <button type="submit" disabled={submitting} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-black hover:bg-black disabled:opacity-50">
                            <Plus size={16} />
                            {submitting ? "Saving..." : "Add Entry"}
                        </button>
                    </form>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-end gap-3 justify-between">
                    <div className="flex items-end gap-2 flex-wrap">
                        <div>
                            <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">From</label>
                            <input type="date" value={exportFrom} onChange={(e) => setExportFrom(e.target.value)} className="block mt-1 px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold" />
                        </div>
                        <div>
                            <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">To</label>
                            <input type="date" value={exportTo} onChange={(e) => setExportTo(e.target.value)} className="block mt-1 px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold" />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => downloadExport("csv")} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-black hover:bg-emerald-700">
                            <Download size={15} /> Export CSV
                        </button>
                        <button onClick={() => downloadExport("json")} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-black hover:bg-blue-700">
                            <Download size={15} /> Export JSON
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function NutritionPage() {
    return <Layout content={<NutritionDashboardPage />} />;
}
