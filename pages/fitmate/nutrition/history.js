import Layout from "@/components/layout/Layout";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import fitmateService from "@/services/fitmate.service";
import { Edit3, Trash2 } from "lucide-react";

const todayIso = () => new Date().toISOString().split("T")[0];
const lastWeekIso = () => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split("T")[0];
};

const HistoryPageContent = () => {
    const { user } = useAuth();
    const [fromDate, setFromDate] = useState(lastWeekIso());
    const [toDate, setToDate] = useState(todayIso());
    const [mealType, setMealType] = useState("");
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [editingEntry, setEditingEntry] = useState(null);
    const [editForm, setEditForm] = useState(null);

    const totals = useMemo(() => {
        return entries.reduce((acc, item) => {
            acc.calories += Number(item.calories || 0);
            acc.protein += Number(item.protein || 0);
            acc.carbs += Number(item.carbs || 0);
            acc.fat += Number(item.fat || 0);
            return acc;
        }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
    }, [entries]);

    const loadEntries = async () => {
        if (!user?.username) return;
        setLoading(true);
        setError("");
        try {
            const res = await fitmateService.getFoodEntries(user.username, fromDate, toDate, mealType || undefined);
            setEntries(res?.data || []);
        } catch (e) {
            setError(e?.response?.data?.meta?.description || "Failed to load nutrition history.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user?.username) return;
        loadEntries();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.username]);

    const onDelete = async (refId) => {
        if (!user?.username) return;
        if (!window.confirm("Delete this food entry?")) return;
        try {
            await fitmateService.deleteFoodEntry(refId, user.username);
            await loadEntries();
        } catch (e) {
            setError(e?.response?.data?.meta?.description || "Failed to delete entry.");
        }
    };

    const startEdit = (entry) => {
        setEditingEntry(entry);
        setEditForm({
            entryDate: entry.entryDate || todayIso(),
            entryTime: entry.entryTime || "",
            mealType: entry.mealType || "OTHER",
            foodName: entry.foodName || "",
            servingQty: entry.servingQty || 0,
            servingUnit: entry.servingUnit || "",
            calories: entry.calories || 0,
            protein: entry.protein || 0,
            carbs: entry.carbs || 0,
            fat: entry.fat || 0,
            fiber: entry.fiber || 0,
            sugar: entry.sugar || 0,
            sodium: entry.sodium || 0,
            sourceType: entry.sourceType || "MANUAL",
            notes: entry.notes || ""
        });
    };

    const saveEdit = async (e) => {
        e.preventDefault();
        if (!user?.username || !editingEntry) return;
        try {
            await fitmateService.updateFoodEntry(editingEntry.refId, user.username, {
                ...editForm,
                servingQty: Number(editForm.servingQty || 0),
                calories: Number(editForm.calories || 0),
                protein: Number(editForm.protein || 0),
                carbs: Number(editForm.carbs || 0),
                fat: Number(editForm.fat || 0),
                fiber: Number(editForm.fiber || 0),
                sugar: Number(editForm.sugar || 0),
                sodium: Number(editForm.sodium || 0)
            });
            setEditingEntry(null);
            setEditForm(null);
            await loadEntries();
        } catch (e2) {
            setError(e2?.response?.data?.meta?.description || "Failed to update entry.");
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-16">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Nutrition History</h1>
                    <p className="text-slate-500 font-semibold">Filter and manage historical food logs.</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/fitmate/nutrition" className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50">Dashboard</Link>
                    <Link href="/fitmate/nutrition/trends" className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50">Trends</Link>
                </div>
            </div>

            {error && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}

            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold" />
                    <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold" />
                    <select value={mealType} onChange={(e) => setMealType(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold">
                        <option value="">All Meals</option>
                        <option value="BREAKFAST">BREAKFAST</option>
                        <option value="LUNCH">LUNCH</option>
                        <option value="DINNER">DINNER</option>
                        <option value="SNACK">SNACK</option>
                        <option value="OTHER">OTHER</option>
                    </select>
                    <button onClick={loadEntries} className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-black hover:bg-black">
                        {loading ? "Loading..." : "Apply Filters"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs uppercase font-black tracking-wider text-slate-500">Calories</p>
                    <p className="text-2xl font-black text-slate-900">{totals.calories.toFixed(0)}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs uppercase font-black tracking-wider text-slate-500">Protein</p>
                    <p className="text-2xl font-black text-slate-900">{totals.protein.toFixed(1)} g</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs uppercase font-black tracking-wider text-slate-500">Carbs</p>
                    <p className="text-2xl font-black text-slate-900">{totals.carbs.toFixed(1)} g</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs uppercase font-black tracking-wider text-slate-500">Fat</p>
                    <p className="text-2xl font-black text-slate-900">{totals.fat.toFixed(1)} g</p>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Meal</th>
                                <th className="px-4 py-3">Food</th>
                                <th className="px-4 py-3">Calories</th>
                                <th className="px-4 py-3">P/C/F</th>
                                <th className="px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {entries.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-10 text-center text-slate-500 font-semibold">No entries found.</td>
                                </tr>
                            )}
                            {entries.map((entry) => (
                                <tr key={entry.refId} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 font-semibold text-slate-700">{entry.entryDate} {entry.entryTime || ""}</td>
                                    <td className="px-4 py-3 font-bold text-slate-700">{entry.mealType}</td>
                                    <td className="px-4 py-3">
                                        <p className="font-bold text-slate-800">{entry.foodName}</p>
                                        <p className="text-xs text-slate-500">{Number(entry.servingQty || 0).toFixed(1)} {entry.servingUnit || "serving"}</p>
                                    </td>
                                    <td className="px-4 py-3 font-black text-slate-900">{Number(entry.calories || 0).toFixed(0)}</td>
                                    <td className="px-4 py-3 text-xs text-slate-600 font-semibold">
                                        {Number(entry.protein || 0).toFixed(1)} / {Number(entry.carbs || 0).toFixed(1)} / {Number(entry.fat || 0).toFixed(1)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => startEdit(entry)} className="p-2 rounded-lg border border-slate-200 hover:bg-white bg-slate-50">
                                                <Edit3 size={14} className="text-slate-700" />
                                            </button>
                                            <button onClick={() => onDelete(entry.refId)} className="p-2 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100">
                                                <Trash2 size={14} className="text-red-700" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {editingEntry && editForm && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
                    <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-black text-slate-900">Edit Food Entry</h2>
                            <button onClick={() => { setEditingEntry(null); setEditForm(null); }} className="text-sm font-bold text-slate-500 hover:text-slate-700">Close</button>
                        </div>
                        <form className="space-y-3" onSubmit={saveEdit}>
                            <div className="grid grid-cols-2 gap-2">
                                <input type="date" value={editForm.entryDate} onChange={(e) => setEditForm((p) => ({ ...p, entryDate: e.target.value }))} className="px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold" />
                                <input type="time" value={editForm.entryTime} onChange={(e) => setEditForm((p) => ({ ...p, entryTime: e.target.value }))} className="px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold" />
                            </div>
                            <select value={editForm.mealType} onChange={(e) => setEditForm((p) => ({ ...p, mealType: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold">
                                <option value="BREAKFAST">BREAKFAST</option>
                                <option value="LUNCH">LUNCH</option>
                                <option value="DINNER">DINNER</option>
                                <option value="SNACK">SNACK</option>
                                <option value="OTHER">OTHER</option>
                            </select>
                            <input type="text" value={editForm.foodName} onChange={(e) => setEditForm((p) => ({ ...p, foodName: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold" />
                            <div className="grid grid-cols-2 gap-2">
                                <input type="number" step="0.1" value={editForm.servingQty} onChange={(e) => setEditForm((p) => ({ ...p, servingQty: e.target.value }))} className="px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold" />
                                <input type="text" value={editForm.servingUnit} onChange={(e) => setEditForm((p) => ({ ...p, servingUnit: e.target.value }))} className="px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold" />
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                <input type="number" step="0.1" value={editForm.calories} onChange={(e) => setEditForm((p) => ({ ...p, calories: e.target.value }))} placeholder="Calories" className="px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold" />
                                <input type="number" step="0.1" value={editForm.protein} onChange={(e) => setEditForm((p) => ({ ...p, protein: e.target.value }))} placeholder="Protein" className="px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold" />
                                <input type="number" step="0.1" value={editForm.carbs} onChange={(e) => setEditForm((p) => ({ ...p, carbs: e.target.value }))} placeholder="Carbs" className="px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold" />
                                <input type="number" step="0.1" value={editForm.fat} onChange={(e) => setEditForm((p) => ({ ...p, fat: e.target.value }))} placeholder="Fat" className="px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold" />
                            </div>
                            <textarea value={editForm.notes} onChange={(e) => setEditForm((p) => ({ ...p, notes: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold min-h-20" />
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => { setEditingEntry(null); setEditForm(null); }} className="px-4 py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-700">Cancel</button>
                                <button type="submit" className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-black hover:bg-black">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default function NutritionHistoryPage() {
    return <Layout content={<HistoryPageContent />} />;
}
