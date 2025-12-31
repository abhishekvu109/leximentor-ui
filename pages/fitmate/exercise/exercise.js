
import Link from "next/link";
import Layout from "@/components/layout/Layout";
import { useEffect, useState, useMemo } from "react";
import { API_FITMATE_BASE_URL } from "@/constants";
import { fetchData, postDataAsJson, DeleteByObject, fetchWithAuth } from "@/dataService";
import {
    Search, Plus, Filter, Trash2, Edit2, Dumbbell,
    MoreVertical, X, Check, AlertCircle, Loader2, Info, Camera
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- Components ---

const ExerciseCard = ({ exercise, onDelete, onEdit, onThumbnailUpload }) => {
    const [uploading, setUploading] = useState(false);
    const [thumbUrl, setThumbUrl] = useState(null);

    useEffect(() => {
        const fetchThumb = async () => {
            try {
                const res = await fetchWithAuth(`${API_FITMATE_BASE_URL}/exercises/exercise/resources/resource?refId=${exercise.refId}&placeholder=THUMBNAIL&resourceId=`);
                if (!res.ok) return;
                const blob = await res.blob();
                if (blob.size > 0 && blob.type.startsWith('image/')) {
                    setThumbUrl(URL.createObjectURL(blob));
                }
            } catch (e) {
                console.error("Thumb fetch failed", e);
            }
        };
        if (exercise.refId) fetchThumb();

        return () => {
            if (thumbUrl) URL.revokeObjectURL(thumbUrl);
        };
    }, [exercise.refId]);

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            await onThumbnailUpload(exercise.refId, file);
        } finally {
            setUploading(false);
        }
    };
    return (
        <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col relative cursor-pointer">
            <Link href={`/fitmate/exercise/view/${exercise.refId}`} className="flex-1 flex flex-col">
                <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden flex items-center justify-center">
                    {thumbUrl ? (
                        <img
                            src={thumbUrl}
                            alt={exercise.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-50">
                            <h2 className="text-4xl font-black text-slate-200 leading-tight tracking-tight">
                                {exercise.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()}
                            </h2>
                        </div>
                    )}
                    <div className="absolute bottom-2 left-2">
                        <span className="px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider rounded-md">
                            {exercise.bodyPart?.name || 'General'}
                        </span>
                    </div>
                </div>

                <div className="p-4 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-gray-800 leading-tight">{exercise.name}</h3>
                    </div>

                    <div className="mt-auto space-y-3">
                        {/* Muscles */}
                        <div className="flex flex-wrap gap-1">
                            {exercise.targetMuscles?.slice(0, 3).map((m, i) => (
                                <span key={i} className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded font-medium truncate max-w-[80px]">
                                    {m.name}
                                </span>
                            ))}
                            {(exercise.targetMuscles?.length > 3) && (
                                <span className="text-[10px] px-1.5 py-0.5 bg-gray-50 text-gray-500 rounded font-medium">
                                    +{exercise.targetMuscles.length - 3}
                                </span>
                            )}
                        </div>

                        {/* Equipment Details */}
                        {exercise.equipments?.length > 0 && (
                            <div className="pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
                                <Dumbbell size={12} />
                                <span className="truncate">{exercise.equipments.join(', ')}</span>
                            </div>
                        )}
                    </div>
                </div>
            </Link>

            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10">
                <label className="p-2 bg-white/90 rounded-full text-blue-600 hover:text-blue-700 shadow-sm backdrop-blur-sm cursor-pointer" title="Upload Thumbnail">
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
                    {uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                </label>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDelete(exercise);
                    }}
                    className="p-2 bg-white/90 rounded-full text-gray-600 hover:text-red-500 shadow-sm backdrop-blur-sm"
                    title="Delete Exercise"
                >
                    <Trash2 size={14} />
                </button>
            </div>
        </div>
    );
}

const AddExerciseModal = ({ isOpen, onClose, onSuccess, onNotification, data: { trainings, bodyParts, musclesAll } }) => {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: "",
        description: "",
        training: "",
        bodyPart: "",
        targetMuscles: [],
        equipments: [],
        status: "ACTIVE"
    });

    const [filteredMuscles, setFilteredMuscles] = useState([]);

    // Reset form when opening
    useEffect(() => {
        if (isOpen) {
            setForm({
                name: "", description: "", training: "",
                bodyPart: "", targetMuscles: [], equipments: [], status: "ACTIVE"
            });
            setFilteredMuscles([]);
        }
    }, [isOpen]);

    // Filter muscles when body part changes
    useEffect(() => {
        if (form.bodyPart && musclesAll) {
            const relevant = musclesAll.filter(m => m.bodyPart?.name === form.bodyPart);
            setFilteredMuscles(relevant);
        } else {
            setFilteredMuscles([]);
        }
    }, [form.bodyPart, musclesAll]);

    const equipmentOptions = ['Body Weight', 'Dumbbell', 'Barbell Bar', 'Weights', 'Cable', 'Machine', 'Kettlebell'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = [{
                name: form.name,
                description: form.description,
                training: { name: form.training },
                bodyPart: { name: form.bodyPart },
                targetMuscles: form.targetMuscles.map(m => ({ name: m })),
                equipments: form.equipments,
                status: form.status
            }];

            await postDataAsJson(`${API_FITMATE_BASE_URL}/exercises`, payload);
            onNotification({ message: `Successfully added "${form.name}"`, type: 'success' });
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            onNotification({ message: "Failed to create exercise", type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const toggleSelection = (field, value) => {
        setForm(prev => {
            const current = prev[field];
            const exists = current.includes(value);
            return {
                ...prev,
                [field]: exists
                    ? current.filter(item => item !== value)
                    : [...current, value]
            };
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">New Exercise</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="space-y-4">
                        {/* Name & Training */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Exercise Name</label>
                                <input
                                    required
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    className="w-full rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm"
                                    placeholder="e.g. Incline Bench Press"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Training Type</label>
                                <select
                                    required
                                    value={form.training}
                                    onChange={e => setForm({ ...form, training: e.target.value })}
                                    className="w-full rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm"
                                >
                                    <option value="">Select Type</option>
                                    {trainings.map((t, i) => <option key={i} value={t.name}>{t.name}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                            <textarea
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                                className="w-full rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm"
                                rows="2"
                                placeholder="Optional instructions..."
                            />
                        </div>

                        <div className="w-full h-px bg-gray-100 my-2"></div>

                        {/* Body Part & Muscles */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Target Body Part</label>
                            <select
                                required
                                value={form.bodyPart}
                                onChange={e => setForm({ ...form, bodyPart: e.target.value, targetMuscles: [] })}
                                className="w-full rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm mb-4"
                            >
                                <option value="">Select Body Part</option>
                                {bodyParts.map((b, i) => <option key={i} value={b.name}>{b.name}</option>)}
                            </select>

                            {form.bodyPart && (
                                <div className="animate-in slide-in-from-top-2 duration-300">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                                        Target Muscles ({form.targetMuscles.length})
                                    </label>
                                    <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-xl max-h-32 overflow-y-auto">
                                        {filteredMuscles.length > 0 ? filteredMuscles.map((m, i) => {
                                            const isActive = form.targetMuscles.includes(m.name);
                                            return (
                                                <button
                                                    key={i}
                                                    type="button"
                                                    onClick={() => toggleSelection('targetMuscles', m.name)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isActive
                                                        ? 'bg-blue-600 text-white shadow-md'
                                                        : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'
                                                        }`}
                                                >
                                                    {m.name}
                                                </button>
                                            )
                                        }) : <p className="text-gray-400 text-sm italic">No muscles found for this body part.</p>}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Equipments */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Equipment Needed</label>
                            <div className="flex flex-wrap gap-2">
                                {equipmentOptions.map((eq, i) => {
                                    const isActive = form.equipments.includes(eq);
                                    return (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => toggleSelection('equipments', eq)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isActive
                                                ? 'bg-gray-800 text-white shadow-md'
                                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            {eq}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </form>

                <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
                    <button onClick={onClose} className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center gap-2 disabled:opacity-70"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <SaveIcon />}
                        Save Exercise
                    </button>
                </div>
            </div>
        </div>
    )
}

// Icon helper
const SaveIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>


// --- Main Page Component ---

const ExerciseLibrary = () => {
    // State
    const [exercises, setExercises] = useState([]);
    const [refData, setRefData] = useState({ trainings: [], bodyParts: [], musclesAll: [] });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState({ bodyPart: "", training: "" });
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [notification, setNotification] = useState({ visible: false, message: "", type: "info" });

    const showNotification = ({ message, type = "info" }) => {
        setNotification({ visible: true, message, type });
        setTimeout(() => setNotification(prev => ({ ...prev, visible: false })), 4000);
    };

    // Fetch Data
    const loadData = async () => {
        setLoading(true);
        try {
            const [exRes, trRes, bpRes, mRes] = await Promise.all([
                fetchData(`${API_FITMATE_BASE_URL}/exercises`),
                fetchData(`${API_FITMATE_BASE_URL}/trainings`),
                fetchData(`${API_FITMATE_BASE_URL}/bodyparts`),
                fetchData(`${API_FITMATE_BASE_URL}/muscles`)
            ]);

            setExercises(exRes.data || []);
            setRefData({
                trainings: trRes.data || [],
                bodyParts: bpRes.data || [],
                musclesAll: mRes.data || []
            });
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    // Handlers
    const handleDelete = async (exercise) => {
        if (!confirm(`Permanently delete "${exercise.name}"?`)) return;
        try {
            await DeleteByObject(`${API_FITMATE_BASE_URL}/exercises/exercise`, [{ refId: exercise.refId }]);
            showNotification({ message: `Exercise "${exercise.name}" deleted`, type: 'success' });
            loadData();
        } catch (e) {
            showNotification({ message: "Delete failed", type: 'error' });
        }
    };

    const handleThumbnailUpload = async (refId, file) => {
        const formData = new FormData();
        formData.append('files', file);

        try {
            const res = await fetchWithAuth(`${API_FITMATE_BASE_URL}/exercises/exercise/resources?refId=${refId}&placeholder=THUMBNAIL`, {
                method: 'PUT',
                body: formData,
                headers: {} // fetchWithAuth handles Content-Type if needed, but for FormData it should be empty to let browser set boundary
            });

            if (res.ok) {
                showNotification({ message: "Thumbnail uploaded successfully", type: 'success' });
                loadData();
            } else {
                throw new Error("Upload failed");
            }
        } catch (error) {
            console.error(error);
            showNotification({ message: "Failed to upload thumbnail", type: 'error' });
        }
    };

    // Derived State
    const filteredExercises = useMemo(() => {
        let res = exercises;
        if (search) {
            const lower = search.toLowerCase();
            res = res.filter(e => e.name.toLowerCase().includes(lower));
        }
        if (filters.bodyPart) {
            res = res.filter(e => e.bodyPart?.name === filters.bodyPart);
        }
        if (filters.training) {
            res = res.filter(e => e.training?.name === filters.training);
        }
        return res;
    }, [exercises, search, filters]);

    // Unique options for filters based on actual data
    // const availableBodyParts = [...new Set(exercises.map(e => e.bodyPart?.name).filter(Boolean))];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Exercise Library</h1>
                    <p className="text-gray-500 mt-1">Manage your collection of {exercises.length} exercises</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95"
                >
                    <Plus size={20} /> Add Exercise
                </button>
            </div>

            {/* Filter Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 hover:bg-gray-100 focus:bg-white border-transparent focus:border-blue-500 rounded-xl transition-all outline-none"
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    <Filter size={18} className="text-gray-400 mr-2 shrink-0" />
                    <select
                        value={filters.bodyPart}
                        onChange={e => setFilters({ ...filters, bodyPart: e.target.value })}
                        className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm font-medium text-gray-700 border-none focus:ring-0 cursor-pointer min-w-[140px]"
                    >
                        <option value="">All Body Parts</option>
                        {refData.bodyParts.map((b, i) => <option key={i} value={b.name}>{b.name}</option>)}
                    </select>
                    <select
                        value={filters.training}
                        onChange={e => setFilters({ ...filters, training: e.target.value })}
                        className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm font-medium text-gray-700 border-none focus:ring-0 cursor-pointer min-w-[140px]"
                    >
                        <option value="">All Types</option>
                        {refData.trainings.map((t, i) => <option key={i} value={t.name}>{t.name}</option>)}
                    </select>
                </div>
            </div>

            {/* Grid Content */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-gray-100 rounded-2xl aspect-[4/3]" />
                    ))}
                </div>
            ) : filteredExercises.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                    <Dumbbell size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="text-lg font-medium">No exercises found.</p>
                    <p className="text-sm">Try adjusting your filters or add a new one.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredExercises.map((ex, i) => (
                        <ExerciseCard
                            key={i}
                            exercise={ex}
                            onDelete={handleDelete}
                            onEdit={() => { }}
                            onThumbnailUpload={handleThumbnailUpload}
                        />
                    ))}
                </div>
            )}

            {/* Modal */}
            <AddExerciseModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={loadData}
                onNotification={showNotification}
                data={refData}
            />

            {/* Notification Toast */}
            <AnimatePresence>
                {notification.visible && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] min-w-[320px]"
                    >
                        <div className={`
                            px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border flex items-center gap-4
                            ${notification.type === 'success'
                                ? 'bg-green-500/90 border-green-400 text-white'
                                : notification.type === 'error'
                                    ? 'bg-red-500/90 border-red-400 text-white'
                                    : 'bg-blue-600/90 border-blue-500 text-white'}
                        `}>
                            <div className="bg-white/20 p-2 rounded-xl">
                                {notification.type === 'success' ? <Check size={20} /> :
                                    notification.type === 'error' ? <AlertCircle size={20} /> :
                                        <Info size={20} />}
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-sm leading-tight">{notification.message}</p>
                            </div>
                            <button
                                onClick={() => setNotification(prev => ({ ...prev, visible: false }))}
                                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Main Export
const Exercise = () => {
    return (
        <Layout content={<ExerciseLibrary />} />
    );
}

export default Exercise;