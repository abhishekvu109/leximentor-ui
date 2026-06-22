
import Link from "next/link";
import Layout from "@/components/layout/Layout";
import { useEffect, useState, useMemo } from "react";
import fitmateService from "../../../services/fitmate.service";
import {
    Search, Plus, Filter, Trash2, Edit2, Dumbbell,
    MoreVertical, X, Check, AlertCircle, Loader2, Info, Camera,
    ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, History, Globe
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

// --- Components ---

const ExerciseCard = ({ exercise, analytics, onDelete, onEdit, onThumbnailUpload, onNotification }) => {
    const [uploading, setUploading] = useState(false);
    const [thumbUrl, setThumbUrl] = useState(null);
    const [showUrlInput, setShowUrlInput] = useState(false);
    const [urlInput, setUrlInput] = useState('');
    const [urlError, setUrlError] = useState('');
    const [urlLoading, setUrlLoading] = useState(false);

    useEffect(() => {
        const fetchThumb = async () => {
            setThumbUrl(null); // Reset when refId changes or fetch starts

            try {
                let blob;
                try {
                    blob = await fitmateService.getThumbnail(exercise.refId);
                } catch (err) {
                    // Ignore THUMBNAIL error, will try GIF fallback
                }

                // If thumbnail is missing or invalid (or failed), try falling back to GIF
                if (!blob || blob.size === 0 || !blob.type.startsWith('image/')) {
                    try {
                        blob = await fitmateService.getExerciseResource(exercise.refId, 'GIF');
                    } catch (err) {
                        // Both failed
                    }
                }

                if (blob && blob.size > 0 && blob.type.startsWith('image/')) {
                    setThumbUrl(URL.createObjectURL(blob));
                }
            } catch (e) {
                console.error("Image fetch failed", e);
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

    const handleUrlSubmit = async () => {
        const url = urlInput.trim();
        if (!url) return;
        setUrlError('');
        setUrlLoading(true);
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Could not fetch the image.');
            const blob = await response.blob();
            if (!blob.type.startsWith('image/')) throw new Error('URL does not point to an image.');
            const ext = blob.type.split('/')[1] || 'jpg';
            const file = new File([blob], `thumbnail.${ext}`, { type: blob.type });
            await onThumbnailUpload(exercise.refId, file);
            setShowUrlInput(false);
            setUrlInput('');
        } catch (err) {
            // CORS or network errors surface here
            const msg = err.message.includes('fetch')
                ? 'CORS blocked — try downloading and uploading the image directly.'
                : err.message;
            setUrlError(msg);
        } finally {
            setUrlLoading(false);
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
                    {analytics?.totalNumberOfTimesCompleted > 0 && (
                        <div className="absolute top-2 left-2 z-10">
                            <div className="w-9 h-9 rounded-full bg-blue-600/90 backdrop-blur-sm text-white flex flex-col items-center justify-center shadow-lg shadow-blue-500/30 border border-white/20 animate-in zoom-in duration-300">
                                <History size={12} strokeWidth={3.5} />
                                <span className="text-[10px] font-black leading-none mt-0.5">
                                    {analytics.totalNumberOfTimesCompleted}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="absolute bottom-2 left-2 flex flex-col gap-1">
                        <span className="px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider rounded-md w-fit">
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
                <label className="p-2 bg-white/90 rounded-full text-blue-600 hover:text-blue-700 shadow-sm backdrop-blur-sm cursor-pointer" title="Upload from file">
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
                    {uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                </label>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setUrlError('');
                        setUrlInput('');
                        setShowUrlInput(v => !v);
                    }}
                    className={`p-2 rounded-full shadow-sm backdrop-blur-sm transition-colors ${showUrlInput ? 'bg-blue-600 text-white' : 'bg-white/90 text-blue-600 hover:text-blue-700'}`}
                    title="Paste image URL"
                >
                    <Globe size={14} />
                </button>
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

            {/* URL paste overlay — sits outside <Link> to avoid navigation */}
            {showUrlInput && (
                <div className="absolute inset-0 z-20 bg-black/75 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-4 gap-3">
                    <p className="text-white text-xs font-bold tracking-wide uppercase">Paste image URL</p>
                    <div className="flex gap-2 w-full">
                        <input
                            autoFocus
                            type="url"
                            value={urlInput}
                            onChange={e => { setUrlInput(e.target.value); setUrlError(''); }}
                            onKeyDown={e => e.key === 'Enter' && handleUrlSubmit()}
                            placeholder="https://example.com/image.jpg"
                            className="flex-1 text-xs px-3 py-2 rounded-lg border-none outline-none min-w-0"
                        />
                        <button
                            onClick={handleUrlSubmit}
                            disabled={urlLoading || !urlInput.trim()}
                            className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50 shrink-0"
                            title="Upload"
                        >
                            {urlLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                        </button>
                        <button
                            onClick={() => { setShowUrlInput(false); setUrlInput(''); setUrlError(''); }}
                            className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg shrink-0"
                            title="Cancel"
                        >
                            <X size={14} />
                        </button>
                    </div>
                    {urlError && (
                        <p className="text-red-300 text-[10px] text-center leading-snug">{urlError}</p>
                    )}
                </div>
            )}
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
        status: "ACTIVE",
        unit: "reps"
    });

    const [filteredMuscles, setFilteredMuscles] = useState([]);

    // Reset form when opening
    useEffect(() => {
        if (isOpen) {
            setForm({
                name: "", description: "", training: "",
                bodyPart: "", targetMuscles: [], equipments: [], status: "ACTIVE", unit: "reps"
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
                status: form.status,
                unit: form.unit
            }];

            await fitmateService.addExercise(payload);
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

                        {/* Unit Selection */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Measure By (Unit)</label>
                            <div className="flex gap-2">
                                {['reps', 'weight', 'time'].map((u) => (
                                    <button
                                        key={u}
                                        type="button"
                                        onClick={() => setForm({ ...form, unit: u })}
                                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all border ${form.unit === u
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                                            }`}
                                    >
                                        {u.charAt(0).toUpperCase() + u.slice(1)}
                                    </button>
                                ))}
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
    const { user } = useAuth();
    // State
    const [exercises, setExercises] = useState([]);
    const [exerciseAnalytics, setExerciseAnalytics] = useState({});
    const [refData, setRefData] = useState({ trainings: [], bodyParts: [], musclesAll: [] });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState({ bodyPart: "", training: "" });
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [notification, setNotification] = useState({ visible: false, message: "", type: "info" });

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12; // 3 rows of 4 (lg) or 6 rows of 2 (sm)
    const [totalServerElements, setTotalServerElements] = useState(0);
    const [totalServerPages, setTotalServerPages] = useState(0);

    const showNotification = ({ message, type = "info" }) => {
        setNotification({ visible: true, message, type });
        setTimeout(() => setNotification(prev => ({ ...prev, visible: false })), 4000);
    };

    // Fetch Data
    const loadRefsAndAnalytics = async () => {
        try {
            const [trRes, bpRes, mRes] = await Promise.all([
                fitmateService.getTrainings(),
                fitmateService.getBodyParts(),
                fitmateService.getMuscles()
            ]);

            setRefData({
                trainings: trRes.data?.content || (Array.isArray(trRes.data) ? trRes.data : []),
                bodyParts: bpRes.data?.content || (Array.isArray(bpRes.data) ? bpRes.data : []),
                musclesAll: mRes.data?.content || (Array.isArray(mRes.data) ? mRes.data : [])
            });

            if (user?.username) {
                try {
                    const res = await fitmateService.getExerciseAnalytics(user.username);
                    const dataMap = res?.data || res;

                    if (dataMap && typeof dataMap === 'object') {
                        const normalizedData = {};
                        Object.keys(dataMap).forEach(key => {
                            if (key !== 'meta' && typeof dataMap[key] === 'object') {
                                normalizedData[key.toLowerCase().trim()] = dataMap[key];
                            }
                        });
                        setExerciseAnalytics(normalizedData);
                    }
                } catch (err) {
                    console.error("Failed to fetch exercise analytics", err);
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

    const loadExercises = async () => {
        setLoading(true);
        try {
            const hasFilters = search || filters.bodyPart || filters.training;
            let exRes;

            if (hasFilters) {
                const payload = {};
                if (search) payload.name = search;
                if (filters.bodyPart) {
                    const bp = refData.bodyParts?.find(b => b.name === filters.bodyPart);
                    if (bp) payload.targetBodyPartRefId = bp.refId?.toString();
                }
                if (filters.training) {
                    const tr = refData.trainings?.find(t => t.name === filters.training);
                    if (tr) payload.trainingRefId = tr.refId?.toString();
                }
                exRes = await fitmateService.searchExercises(payload, currentPage - 1, itemsPerPage);
            } else {
                exRes = await fitmateService.getExercises(currentPage - 1, itemsPerPage);
            }

            const dataObj = exRes.data;
            if (dataObj && typeof dataObj === 'object' && 'content' in dataObj) {
                setExercises(dataObj.content);
                setTotalServerPages(dataObj.totalPages);
                setTotalServerElements(dataObj.totalElements);
            } else if (Array.isArray(dataObj)) {
                setExercises(dataObj);
                setTotalServerPages(Math.ceil(dataObj.length / itemsPerPage));
                setTotalServerElements(dataObj.length);
            } else {
                setExercises([]);
                setTotalServerPages(0);
                setTotalServerElements(0);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const loadData = () => {
        loadExercises();
    };

    useEffect(() => {
        loadRefsAndAnalytics();
    }, [user?.username]);

    useEffect(() => {
        const timer = setTimeout(() => {
            loadExercises();
        }, 400);
        return () => clearTimeout(timer);
    }, [currentPage, search, filters]);

    // Handlers
    const handleDelete = async (exercise) => {
        if (!confirm(`Permanently delete "${exercise.name}"?`)) return;
        try {
            await fitmateService.deleteExercise(exercise.refId);
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
            await fitmateService.uploadThumbnail(refId, formData);
            showNotification({ message: "Thumbnail uploaded successfully", type: 'success' });
            loadData();
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

    // Pagination Logic
    const totalPages = totalServerPages > 0 ? totalServerPages : Math.ceil(filteredExercises.length / itemsPerPage);
    
    // We already sliced from the backend via 'page' and 'size', so we don't need to slice locally 
    // UNLESS totalServerPages is 0 (meaning we received unpaginated data)
    const paginatedExercises = totalServerPages > 0 
        ? filteredExercises 
        : filteredExercises.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, filters]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

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
                    {paginatedExercises.map((ex) => (
                        <ExerciseCard
                            key={ex.refId || ex.id || Math.random()}
                            exercise={ex}
                            analytics={exerciseAnalytics[ex.name?.toLowerCase()?.trim()]}
                            onDelete={handleDelete}
                            onEdit={() => { }}
                            onThumbnailUpload={handleThumbnailUpload}
                            onNotification={showNotification}
                        />
                    ))}
                </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500">
                        Showing <span className="font-bold text-gray-900">{totalServerElements > 0 && paginatedExercises.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-gray-900">{totalServerElements > 0 ? (currentPage - 1) * itemsPerPage + paginatedExercises.length : Math.min(currentPage * itemsPerPage, filteredExercises.length)}</span> of <span className="font-bold text-gray-900">{totalServerElements > 0 ? totalServerElements : filteredExercises.length}</span> results
                    </p>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handlePageChange(1)}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            title="First Page"
                        >
                            <ChevronsLeft size={18} />
                        </button>
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            title="Previous Page"
                        >
                            <ChevronLeft size={18} />
                        </button>

                        <div className="flex items-center gap-1 mx-2">
                            {(() => {
                                let startPage = 1;
                                if (totalPages > 5) {
                                    if (currentPage <= 3) {
                                        startPage = 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        startPage = totalPages - 4;
                                    } else {
                                        startPage = currentPage - 2;
                                    }
                                }

                                return Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum = startPage + i;
                                    return (
                                        <button
                                            key={pageNum}
                                        onClick={() => handlePageChange(pageNum)}
                                        className={`w-10 h-10 rounded-lg text-sm font-bold transition-all
                                            ${currentPage === pageNum
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105'
                                                : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            });
                        })()}
                        </div>

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            title="Next Page"
                        >
                            <ChevronRight size={18} />
                        </button>
                        <button
                            onClick={() => handlePageChange(totalPages)}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            title="Last Page"
                        >
                            <ChevronsRight size={18} />
                        </button>
                    </div>
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