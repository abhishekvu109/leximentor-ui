import Layout from "@/components/layout/Layout";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import fitmateService from "@/services/fitmate.service";
import { Plus, Sparkles, Trash2, Save } from "lucide-react";

const MEAL_TYPES = ["BREAKFAST", "LUNCH", "DINNER", "SNACK", "OTHER"];
const todayIso = () => new Date().toISOString().split("T")[0];

const newRow = () => ({
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    mealType: "BREAKFAST",
    foodName: "",
    servingQty: 1,
    servingUnit: "serving",
    notes: "",
    entryTime: ""
});

const BatchLogContent = () => {
    const { user } = useAuth();
    const [entryDate, setEntryDate] = useState(todayIso());
    const [rows, setRows] = useState([newRow()]);
    const [job, setJob] = useState(null);
    const [generatedEntries, setGeneratedEntries] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const pollRef = useRef(null);

    const isDone = useMemo(() => {
        const status = job?.status;
        return status === "COMPLETED" || status === "COMPLETED_WITH_ERRORS" || status === "FAILED";
    }, [job?.status]);

    const updateRow = (id, field, value) => {
        setRows((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
    };

    const removeRow = (id) => {
        setRows((prev) => (prev.length === 1 ? prev : prev.filter((row) => row.id !== id)));
    };

    const addRow = () => setRows((prev) => [...prev, newRow()]);

    const stopPolling = () => {
        if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
        }
    };

    const hydrateGeneratedEntries = (statusPayload) => {
        const items = (statusPayload?.results || [])
            .filter((result) => result.status === "SUCCESS" && result.suggestedEntry)
            .map((result) => ({ ...result.suggestedEntry }));
        setGeneratedEntries(items);
    };

    const pollStatus = async (requestId) => {
        if (!user?.username || !requestId) return;
        try {
            const res = await fitmateService.getNutritionAiBatchEstimateStatus(requestId, user.username);
            const statusPayload = res?.data;
            setJob(statusPayload || null);
            hydrateGeneratedEntries(statusPayload);
            const status = statusPayload?.status;
            if (status === "COMPLETED" || status === "COMPLETED_WITH_ERRORS" || status === "FAILED") {
                stopPolling();
                if (status === "COMPLETED") {
                    setSuccess("AI estimation completed.");
                } else if (status === "COMPLETED_WITH_ERRORS") {
                    setSuccess("AI estimation completed with some errors. Review generated entries.");
                } else {
                    setError("AI estimation failed.");
                }
            }
        } catch (e) {
            stopPolling();
            setError(e?.response?.data?.meta?.description || "Failed to poll AI status.");
        }
    };

    const startAsyncGeneration = async () => {
        if (!user?.username) return;
        if (rows.some((row) => !row.foodName?.trim())) {
            setError("Food name is required for all rows.");
            return;
        }
        setSubmitting(true);
        setError("");
        setSuccess("");
        setGeneratedEntries([]);
        stopPolling();
        try {
            const payload = {
                username: user.username,
                entryDate,
                meals: rows.map((row) => ({
                    mealType: row.mealType,
                    foodName: row.foodName,
                    servingQty: Number(row.servingQty || 0),
                    servingUnit: row.servingUnit,
                    notes: row.notes,
                    entryTime: row.entryTime || null
                }))
            };
            const res = await fitmateService.submitNutritionAiBatchEstimate(payload);
            const statusPayload = res?.data;
            setJob(statusPayload || null);
            const requestId = statusPayload?.requestId;
            if (!requestId) {
                throw new Error("requestId missing from server response");
            }
            pollRef.current = setInterval(() => {
                pollStatus(requestId);
            }, 2000);
        } catch (e) {
            setError(e?.response?.data?.meta?.description || e?.message || "Failed to submit AI batch request.");
        } finally {
            setSubmitting(false);
        }
    };

    const updateGenerated = (idx, field, value) => {
        setGeneratedEntries((prev) => prev.map((entry, i) => (i === idx ? { ...entry, [field]: value } : entry)));
    };

    const saveAll = async () => {
        if (!generatedEntries.length) {
            setError("No generated entries to save.");
            return;
        }
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            const payload = generatedEntries.map((entry) => ({
                ...entry,
                username: user?.username,
                entryDate: entry.entryDate || entryDate,
                servingQty: Number(entry.servingQty || 0),
                calories: Number(entry.calories || 0),
                protein: Number(entry.protein || 0),
                carbs: Number(entry.carbs || 0),
                fat: Number(entry.fat || 0),
                fiber: Number(entry.fiber || 0),
                sugar: Number(entry.sugar || 0),
                sodium: Number(entry.sodium || 0),
                sourceType: entry.sourceType || "MANUAL"
            }));
            await fitmateService.addFoodEntriesBatch(payload);
            setSuccess(`Saved ${payload.length} entries successfully.`);
            setRows([newRow()]);
            setJob(null);
            setGeneratedEntries([]);
        } catch (e) {
            setError(e?.response?.data?.meta?.description || "Failed to save generated entries.");
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        return () => stopPolling();
    }, []);

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-16">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Nutrition Batch Log</h1>
                    <p className="text-slate-500 font-semibold">Add multiple meals, run async AI estimation, then save all at once.</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/fitmate/nutrition" className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50">Dashboard</Link>
                </div>
            </div>

            {error && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}
            {success && <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm font-semibold text-emerald-700">{success}</div>}

            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Entry Date</label>
                    <input type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold" />
                </div>
                <div className="space-y-3">
                    {rows.map((row, idx) => (
                        <div key={row.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center p-3 border border-slate-200 rounded-2xl">
                            <select value={row.mealType} onChange={(e) => updateRow(row.id, "mealType", e.target.value)} className="md:col-span-2 px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold">
                                {MEAL_TYPES.map((m) => <option key={m} value={m}>{m}</option>)}
                            </select>
                            <input value={row.foodName} onChange={(e) => updateRow(row.id, "foodName", e.target.value)} placeholder="Food name" className="md:col-span-3 px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold" />
                            <input type="number" step="0.1" value={row.servingQty} onChange={(e) => updateRow(row.id, "servingQty", e.target.value)} placeholder="Qty" className="md:col-span-1 px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold" />
                            <input value={row.servingUnit} onChange={(e) => updateRow(row.id, "servingUnit", e.target.value)} placeholder="Unit" className="md:col-span-2 px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold" />
                            <input type="time" value={row.entryTime} onChange={(e) => updateRow(row.id, "entryTime", e.target.value)} className="md:col-span-2 px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold" />
                            <button onClick={() => removeRow(row.id)} className="md:col-span-1 inline-flex justify-center items-center px-3 py-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100">
                                <Trash2 size={14} className="text-red-700" />
                            </button>
                            <textarea value={row.notes} onChange={(e) => updateRow(row.id, "notes", e.target.value)} placeholder={`Notes for row ${idx + 1}`} className="md:col-span-12 px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold min-h-16" />
                        </div>
                    ))}
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                    <button onClick={addRow} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-200">
                        <Plus size={14} /> Add Meal Row
                    </button>
                    <button onClick={startAsyncGeneration} disabled={submitting} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-black hover:bg-indigo-700 disabled:opacity-50">
                        <Sparkles size={14} /> {submitting ? "Submitting..." : "Generate with AI (Async)"}
                    </button>
                </div>
            </div>

            {job && (
                <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-2">
                    <h2 className="text-lg font-black text-slate-900">Batch Status</h2>
                    <p className="text-sm font-semibold text-slate-600">Request ID: <span className="font-mono">{job.requestId}</span></p>
                    <p className="text-sm font-semibold text-slate-600">Status: <span className="font-black">{job.status}</span></p>
                    <p className="text-sm font-semibold text-slate-600">Progress: {job.completed}/{job.total} completed, {job.failed} failed</p>
                    {!isDone && <p className="text-xs font-semibold text-indigo-700">Polling every 2 seconds...</p>}
                </div>
            )}

            {generatedEntries.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
                    <h2 className="text-lg font-black text-slate-900">Generated Entries</h2>
                    <div className="space-y-3">
                        {generatedEntries.map((entry, idx) => (
                            <div key={`${entry.foodName}-${idx}`} className="grid grid-cols-1 md:grid-cols-12 gap-2 p-3 border border-slate-200 rounded-2xl">
                                <input value={entry.mealType || ""} onChange={(e) => updateGenerated(idx, "mealType", e.target.value)} className="md:col-span-2 px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold" />
                                <input value={entry.foodName || ""} onChange={(e) => updateGenerated(idx, "foodName", e.target.value)} className="md:col-span-3 px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold" />
                                <input type="number" step="0.1" value={entry.servingQty || 0} onChange={(e) => updateGenerated(idx, "servingQty", e.target.value)} className="md:col-span-1 px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold" />
                                <input value={entry.servingUnit || ""} onChange={(e) => updateGenerated(idx, "servingUnit", e.target.value)} className="md:col-span-2 px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold" />
                                <input type="time" value={entry.entryTime || ""} onChange={(e) => updateGenerated(idx, "entryTime", e.target.value)} className="md:col-span-2 px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold" />
                                <input type="number" step="0.1" value={entry.calories || 0} onChange={(e) => updateGenerated(idx, "calories", e.target.value)} className="md:col-span-2 px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold" placeholder="Calories" />
                                <input type="number" step="0.1" value={entry.protein || 0} onChange={(e) => updateGenerated(idx, "protein", e.target.value)} className="md:col-span-3 px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold" placeholder="Protein" />
                                <input type="number" step="0.1" value={entry.carbs || 0} onChange={(e) => updateGenerated(idx, "carbs", e.target.value)} className="md:col-span-3 px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold" placeholder="Carbs" />
                                <input type="number" step="0.1" value={entry.fat || 0} onChange={(e) => updateGenerated(idx, "fat", e.target.value)} className="md:col-span-3 px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold" placeholder="Fat" />
                                <input type="number" step="0.1" value={entry.fiber || 0} onChange={(e) => updateGenerated(idx, "fiber", e.target.value)} className="md:col-span-3 px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold" placeholder="Fiber" />
                            </div>
                        ))}
                    </div>
                    <button onClick={saveAll} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-black hover:bg-emerald-700 disabled:opacity-50">
                        <Save size={14} /> {saving ? "Saving..." : "Save All Entries"}
                    </button>
                </div>
            )}
        </div>
    );
};

export default function NutritionBatchLogPage() {
    return <Layout content={<BatchLogContent />} />;
}
