import Layout from "@/components/layout/Layout";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
    Plus, X, Loader2, Edit2, Trash2, Check, ChevronDown, ChevronRight,
    Folder, FolderOpen, Layers, ArrowLeft, RefreshCcw, FolderTree, AlertCircle
} from "lucide-react";
import flashcardService from "../../services/flashcard.service";

const EMPTY_GENRE_FORM = { name: "", description: "" };
const EMPTY_SUB_FORM = { name: "", description: "", parentRefId: "" };

const ManageCategoriesContent = () => {
    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Expanded genre rows
    const [expandedGenre, setExpandedGenre] = useState(null);
    // Sub-categories keyed by genre refId
    const [subMap, setSubMap] = useState({});
    const [loadingSubs, setLoadingSubs] = useState({});

    // Create forms
    const [showGenreForm, setShowGenreForm] = useState(false);
    const [genreForm, setGenreForm] = useState(EMPTY_GENRE_FORM);
    const [showSubForm, setShowSubForm] = useState(null); // genre refId where the add-sub form is open

    // Inline editing
    const [editingRefId, setEditingRefId] = useState(null);
    const [editForm, setEditForm] = useState({ name: "", description: "" });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const notify = (type, msg) => {
        if (type === "error") { setError(msg); setSuccess(""); }
        else { setSuccess(msg); setError(""); }
        setTimeout(() => { setError(""); setSuccess(""); }, 4000);
    };

    // ── Data loading ──────────────────────────────────────────────────────────

    const loadGenres = useCallback(async () => {
        setLoading(true);
        try {
            const res = await flashcardService.getAllGenres();
            setGenres(res?.data ?? []);
        } catch {
            notify("error", "Failed to load genres.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadGenres(); }, [loadGenres]);

    const loadSubs = useCallback(async (genreRefId) => {
        if (subMap[genreRefId]) return;
        setLoadingSubs(prev => ({ ...prev, [genreRefId]: true }));
        try {
            const res = await flashcardService.getCategoryById(genreRefId);
            setSubMap(prev => ({ ...prev, [genreRefId]: res?.data?.subCategories ?? [] }));
        } catch {
            setSubMap(prev => ({ ...prev, [genreRefId]: [] }));
        } finally {
            setLoadingSubs(prev => ({ ...prev, [genreRefId]: false }));
        }
    }, [subMap]);

    const refreshSubs = async (genreRefId) => {
        setLoadingSubs(prev => ({ ...prev, [genreRefId]: true }));
        try {
            const res = await flashcardService.getCategoryById(genreRefId);
            setSubMap(prev => ({ ...prev, [genreRefId]: res?.data?.subCategories ?? [] }));
        } catch {
            setSubMap(prev => ({ ...prev, [genreRefId]: [] }));
        } finally {
            setLoadingSubs(prev => ({ ...prev, [genreRefId]: false }));
        }
    };

    const handleToggleGenre = (refId) => {
        if (expandedGenre === refId) {
            setExpandedGenre(null);
        } else {
            setExpandedGenre(refId);
            loadSubs(refId);
        }
    };

    // ── Create genre ──────────────────────────────────────────────────────────

    const handleCreateGenre = async (e) => {
        e.preventDefault();
        if (!genreForm.name.trim()) return;
        setIsSubmitting(true);
        try {
            await flashcardService.createCategory({ name: genreForm.name.trim(), description: genreForm.description.trim() || null });
            notify("success", `Genre "${genreForm.name}" created.`);
            setGenreForm(EMPTY_GENRE_FORM);
            setShowGenreForm(false);
            loadGenres();
        } catch (err) {
            notify("error", err?.response?.data?.message || "Failed to create genre.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Create sub-category ───────────────────────────────────────────────────

    const [subForm, setSubForm] = useState(EMPTY_SUB_FORM);

    const openSubForm = (genreRefId) => {
        setSubForm({ name: "", description: "", parentRefId: genreRefId });
        setShowSubForm(genreRefId);
    };

    const handleCreateSub = async (e) => {
        e.preventDefault();
        if (!subForm.name.trim()) return;
        setIsSubmitting(true);
        try {
            await flashcardService.createCategory({
                name: subForm.name.trim(),
                description: subForm.description.trim() || null,
                parentRefId: subForm.parentRefId,
            });
            notify("success", `Sub-category "${subForm.name}" created.`);
            setShowSubForm(null);
            setSubForm(EMPTY_SUB_FORM);
            // force refresh subs for this genre
            setSubMap(prev => { const n = { ...prev }; delete n[subForm.parentRefId]; return n; });
            refreshSubs(subForm.parentRefId);
            // refresh genre list (deck/sub counts update)
            loadGenres();
        } catch (err) {
            notify("error", err?.response?.data?.message || "Failed to create sub-category.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Inline edit ───────────────────────────────────────────────────────────

    const startEdit = (item) => {
        setEditingRefId(item.refId);
        setEditForm({ name: item.name, description: item.description || "" });
    };

    const cancelEdit = () => { setEditingRefId(null); setEditForm({ name: "", description: "" }); };

    const handleSaveEdit = async (refId, parentRefId) => {
        if (!editForm.name.trim()) return;
        setIsSubmitting(true);
        try {
            await flashcardService.updateCategory(refId, {
                name: editForm.name.trim(),
                description: editForm.description.trim() || null,
                parentRefId: parentRefId ?? null,
            });
            notify("success", "Updated successfully.");
            cancelEdit();
            loadGenres();
            if (parentRefId) {
                setSubMap(prev => { const n = { ...prev }; delete n[parentRefId]; return n; });
                refreshSubs(parentRefId);
            }
        } catch (err) {
            notify("error", err?.response?.data?.message || "Failed to update.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Delete ────────────────────────────────────────────────────────────────

    const handleDelete = async (refId, label, parentRefId) => {
        if (!window.confirm(`Delete "${label}"? This cannot be undone.`)) return;
        setIsSubmitting(true);
        try {
            await flashcardService.deleteCategory(refId);
            notify("success", `"${label}" deleted.`);
            loadGenres();
            if (parentRefId) {
                setSubMap(prev => { const n = { ...prev }; delete n[parentRefId]; return n; });
                refreshSubs(parentRefId);
            }
        } catch (err) {
            notify("error", err?.response?.data?.message || "Failed to delete — make sure no decks or sub-categories are attached.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <Link href="/flashcards/categories" className="p-2 rounded-xl text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all">
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                            Manage Categories
                        </h1>
                        <p className="text-sm text-gray-400 dark:text-gray-500 font-medium mt-0.5">
                            Create and organise genres and their sub-categories.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={loadGenres}
                        className="p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-gray-400 hover:text-indigo-500 transition-all shadow-sm"
                        title="Refresh"
                    >
                        <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
                    </button>
                    <button
                        onClick={() => { setShowGenreForm(v => !v); setShowSubForm(null); }}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 dark:shadow-none transition-all active:scale-95 text-sm"
                    >
                        <Plus size={16} /> New Genre
                    </button>
                </div>
            </div>

            {/* Notifications */}
            {error && (
                <div className="flex items-center gap-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 text-rose-600 dark:text-rose-400 px-5 py-4 rounded-2xl text-sm font-bold">
                    <AlertCircle size={16} className="shrink-0" /> {error}
                </div>
            )}
            {success && (
                <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 px-5 py-4 rounded-2xl text-sm font-bold">
                    <Check size={16} className="shrink-0" /> {success}
                </div>
            )}

            {/* Create genre form */}
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showGenreForm ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl border border-indigo-100 dark:border-indigo-800 p-6 shadow-inner">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-indigo-600 text-white rounded-lg">
                                <Folder size={16} />
                            </div>
                            <h2 className="font-black text-indigo-900 dark:text-indigo-100 uppercase tracking-tight text-sm">New Genre</h2>
                        </div>
                        <button onClick={() => setShowGenreForm(false)} className="p-1.5 text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-lg transition-colors">
                            <X size={18} />
                        </button>
                    </div>
                    <form onSubmit={handleCreateGenre} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Name *</label>
                            <input
                                required
                                value={genreForm.name}
                                onChange={e => setGenreForm(f => ({ ...f, name: e.target.value }))}
                                placeholder="e.g. Mathematics"
                                className="w-full bg-white dark:bg-gray-800 rounded-xl px-4 py-2.5 text-sm font-semibold border-none focus:ring-2 focus:ring-indigo-400/30 outline-none dark:text-white shadow-sm"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Description</label>
                            <input
                                value={genreForm.description}
                                onChange={e => setGenreForm(f => ({ ...f, description: e.target.value }))}
                                placeholder="Optional description"
                                className="w-full bg-white dark:bg-gray-800 rounded-xl px-4 py-2.5 text-sm font-semibold border-none focus:ring-2 focus:ring-indigo-400/30 outline-none dark:text-white shadow-sm"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting || !genreForm.name.trim()}
                            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all"
                        >
                            {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                            Create Genre
                        </button>
                    </form>
                </div>
            </div>

            {/* Genre accordion */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24">
                    <Loader2 size={32} className="animate-spin text-indigo-400 mb-2" />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading…</p>
                </div>
            ) : genres.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                    <FolderTree size={40} className="text-gray-200 dark:text-gray-700 mb-3" />
                    <p className="font-black text-gray-400 text-sm uppercase tracking-widest">No genres yet</p>
                    <button
                        onClick={() => setShowGenreForm(true)}
                        className="mt-5 px-5 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-100 transition-all"
                    >
                        Create first genre
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {genres.map(genre => {
                        const isOpen = expandedGenre === genre.refId;
                        const subs = subMap[genre.refId] ?? [];
                        const isLoadingSubs = loadingSubs[genre.refId];
                        const isEditingGenre = editingRefId === genre.refId;

                        return (
                            <div key={genre.refId} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                                {/* Genre row */}
                                <div className="flex items-center gap-3 px-5 py-4 group">
                                    <button
                                        type="button"
                                        onClick={() => handleToggleGenre(genre.refId)}
                                        className="p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shrink-0"
                                    >
                                        {isOpen
                                            ? <ChevronDown size={16} className="text-indigo-500" />
                                            : <ChevronRight size={16} className="text-gray-400" />}
                                    </button>

                                    <div className={`p-2 rounded-xl shrink-0 ${isOpen ? 'bg-indigo-50 dark:bg-indigo-900/30' : 'bg-gray-50 dark:bg-gray-700'}`}>
                                        {isOpen
                                            ? <FolderOpen size={18} className="text-indigo-600 dark:text-indigo-400" />
                                            : <Folder size={18} className="text-gray-400" />}
                                    </div>

                                    {isEditingGenre ? (
                                        <div className="flex-1 flex items-center gap-3">
                                            <input
                                                autoFocus
                                                value={editForm.name}
                                                onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                                                className="flex-1 bg-gray-50 dark:bg-gray-700 border border-indigo-200 dark:border-indigo-700 rounded-xl px-3 py-1.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-400/30 dark:text-white"
                                                placeholder="Genre name"
                                            />
                                            <input
                                                value={editForm.description}
                                                onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                                                className="flex-1 bg-gray-50 dark:bg-gray-700 border border-indigo-200 dark:border-indigo-700 rounded-xl px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400/30 dark:text-white"
                                                placeholder="Description (optional)"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex-1 min-w-0">
                                            <p className="font-black text-gray-800 dark:text-white text-sm truncate">{genre.name}</p>
                                            {genre.description && (
                                                <p className="text-xs text-gray-400 truncate mt-0.5">{genre.description}</p>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 shrink-0 ml-2">
                                        <span className="text-[10px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-wide hidden sm:block">
                                            {genre.subCategoryCount} sub
                                        </span>
                                        <span className="text-[10px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-wide hidden sm:block">
                                            {genre.deckCount} decks
                                        </span>

                                        {isEditingGenre ? (
                                            <>
                                                <button
                                                    onClick={() => handleSaveEdit(genre.refId, null)}
                                                    disabled={isSubmitting}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-colors"
                                                    title="Save"
                                                >
                                                    {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                                                </button>
                                                <button onClick={cancelEdit} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors" title="Cancel">
                                                    <X size={15} />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => startEdit(genre)}
                                                    className="p-2 text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                                                    title="Edit genre"
                                                >
                                                    <Edit2 size={15} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(genre.refId, genre.name, null)}
                                                    className="p-2 text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                                                    title="Delete genre"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Sub-categories panel */}
                                {isOpen && (
                                    <div className="border-t border-gray-50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/20 px-6 py-4 space-y-4">
                                        {isLoadingSubs ? (
                                            <div className="flex items-center gap-2 py-2">
                                                <Loader2 size={15} className="animate-spin text-indigo-400" />
                                                <span className="text-xs text-gray-400">Loading sub-categories…</span>
                                            </div>
                                        ) : (
                                            <>
                                                {subs.length === 0 && showSubForm !== genre.refId && (
                                                    <p className="text-xs text-gray-400 italic py-1">No sub-categories yet.</p>
                                                )}

                                                {subs.length > 0 && (
                                                    <div className="space-y-2">
                                                        {subs.map(sub => {
                                                            const isEditingSub = editingRefId === sub.refId;
                                                            return (
                                                                <div key={sub.refId} className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 px-4 py-3 group/sub">
                                                                    <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg shrink-0">
                                                                        <Layers size={13} className="text-indigo-600 dark:text-indigo-400" />
                                                                    </div>

                                                                    {isEditingSub ? (
                                                                        <div className="flex-1 flex items-center gap-3">
                                                                            <input
                                                                                autoFocus
                                                                                value={editForm.name}
                                                                                onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                                                                                className="flex-1 bg-gray-50 dark:bg-gray-700 border border-indigo-200 dark:border-indigo-700 rounded-lg px-3 py-1.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-400/30 dark:text-white"
                                                                            />
                                                                            <input
                                                                                value={editForm.description}
                                                                                onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                                                                                className="flex-1 bg-gray-50 dark:bg-gray-700 border border-indigo-200 dark:border-indigo-700 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400/30 dark:text-white"
                                                                                placeholder="Description"
                                                                            />
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="font-bold text-gray-800 dark:text-white text-sm truncate">{sub.name}</p>
                                                                            {sub.description && (
                                                                                <p className="text-[11px] text-gray-400 truncate">{sub.description}</p>
                                                                            )}
                                                                        </div>
                                                                    )}

                                                                    <span className="text-[10px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-wide hidden sm:block shrink-0">
                                                                        {sub.deckCount} decks
                                                                    </span>

                                                                    <div className="flex items-center gap-1 shrink-0">
                                                                        {isEditingSub ? (
                                                                            <>
                                                                                <button
                                                                                    onClick={() => handleSaveEdit(sub.refId, genre.refId)}
                                                                                    disabled={isSubmitting}
                                                                                    className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                                                                                    title="Save"
                                                                                >
                                                                                    {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                                                                </button>
                                                                                <button onClick={cancelEdit} className="p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                                                                    <X size={14} />
                                                                                </button>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <button
                                                                                    onClick={() => startEdit(sub)}
                                                                                    className="p-1.5 text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors opacity-0 group-hover/sub:opacity-100"
                                                                                    title="Edit"
                                                                                >
                                                                                    <Edit2 size={14} />
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => handleDelete(sub.refId, sub.name, genre.refId)}
                                                                                    className="p-1.5 text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors opacity-0 group-hover/sub:opacity-100"
                                                                                    title="Delete"
                                                                                >
                                                                                    <Trash2 size={14} />
                                                                                </button>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}

                                                {/* Add sub-category inline form */}
                                                {showSubForm === genre.refId ? (
                                                    <form onSubmit={handleCreateSub} className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl border border-indigo-100 dark:border-indigo-800 px-4 py-3 mt-2">
                                                        <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg shrink-0">
                                                            <Plus size={13} className="text-indigo-600" />
                                                        </div>
                                                        <input
                                                            autoFocus
                                                            required
                                                            value={subForm.name}
                                                            onChange={e => setSubForm(f => ({ ...f, name: e.target.value }))}
                                                            placeholder="Sub-category name"
                                                            className="flex-1 bg-transparent text-sm font-semibold outline-none dark:text-white placeholder:text-gray-300"
                                                        />
                                                        <input
                                                            value={subForm.description}
                                                            onChange={e => setSubForm(f => ({ ...f, description: e.target.value }))}
                                                            placeholder="Description (optional)"
                                                            className="flex-1 bg-transparent text-sm outline-none dark:text-white placeholder:text-gray-300"
                                                        />
                                                        <button
                                                            type="submit"
                                                            disabled={isSubmitting || !subForm.name.trim()}
                                                            className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-black rounded-lg disabled:opacity-50 hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
                                                        >
                                                            {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : null}
                                                            Add
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowSubForm(null)}
                                                            className="p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </form>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => openSubForm(genre.refId)}
                                                        className="flex items-center gap-2 text-xs font-bold text-indigo-500 hover:text-indigo-700 py-1 transition-colors"
                                                    >
                                                        <Plus size={13} /> Add sub-category to {genre.name}
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const ManageCategoriesPage = () => <Layout content={<ManageCategoriesContent />} />;
export default ManageCategoriesPage;
