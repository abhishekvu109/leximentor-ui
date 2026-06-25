
import Layout from "@/components/layout/Layout";
import { ChevronDown, Option, CheckCircle2, MoreVertical, Plus, Trash2, Timer, Check, X, Dumbbell, Calendar, Save, Filter, Search, ArrowRight, Download, FileText, History, Info, Clock, Sparkles, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import fitmateService from "../../../services/fitmate.service";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/router";
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- Sub-components ---

const AddExerciseModal = ({ isOpen, onClose, onSuccess, trainings, bodyParts, musclesAll }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({ name: "", description: "", training: "", bodyPart: "", targetMuscles: [], equipments: [], status: "ACTIVE", unit: "reps" });
    const [filteredMuscles, setFilteredMuscles] = useState([]);

    useEffect(() => {
        if (isOpen) {
            setForm({ name: "", description: "", training: "", bodyPart: "", targetMuscles: [], equipments: [], status: "ACTIVE", unit: "reps" });
            setFilteredMuscles([]);
            setError('');
        }
    }, [isOpen]);

    useEffect(() => {
        if (form.bodyPart && musclesAll) {
            setFilteredMuscles(musclesAll.filter(m => m.bodyPart?.name === form.bodyPart));
        } else {
            setFilteredMuscles([]);
        }
    }, [form.bodyPart, musclesAll]);

    const toggleSelection = (field, value) => {
        setForm(prev => {
            const current = prev[field];
            return { ...prev, [field]: current.includes(value) ? current.filter(i => i !== value) : [...current, value] };
        });
    };

    const handleSubmit = async (e) => {
        e?.preventDefault();
        setError('');
        setLoading(true);
        try {
            const payload = [{
                name: form.name, description: form.description,
                training: { name: form.training }, bodyPart: { name: form.bodyPart },
                targetMuscles: form.targetMuscles.map(m => ({ name: m })),
                equipments: form.equipments, status: form.status, unit: form.unit
            }];
            await fitmateService.addExercise(payload);
            onSuccess(form.name);
            onClose();
        } catch (err) {
            console.error(err);
            setError("Failed to create exercise. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
                    >
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">New Exercise</h2>
                                <p className="text-sm text-gray-400 mt-0.5">Add it to your library and use it right away</p>
                            </div>
                            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[65vh] p-6 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Exercise Name *</label>
                                    <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm" placeholder="e.g. Incline Bench Press" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Training Type *</label>
                                    <select required value={form.training} onChange={e => setForm({ ...form, training: e.target.value })} className="w-full rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm">
                                        <option value="">Select Type</option>
                                        {trainings.map((t, i) => <option key={i} value={t.name}>{t.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Measure By</label>
                                <div className="flex gap-2">
                                    {['reps', 'weight', 'time'].map(u => (
                                        <button key={u} type="button" onClick={() => setForm({ ...form, unit: u })}
                                            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all border ${form.unit === u ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>
                                            {u.charAt(0).toUpperCase() + u.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm" rows="2" placeholder="Optional instructions..." />
                            </div>

                            <div className="w-full h-px bg-gray-100" />

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Target Body Part *</label>
                                <select required value={form.bodyPart} onChange={e => setForm({ ...form, bodyPart: e.target.value, targetMuscles: [] })} className="w-full rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm mb-4">
                                    <option value="">Select Body Part</option>
                                    {bodyParts.map((b, i) => <option key={i} value={b.name}>{b.name}</option>)}
                                </select>
                                {form.bodyPart && (
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Target Muscles ({form.targetMuscles.length})</label>
                                        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-xl max-h-32 overflow-y-auto">
                                            {filteredMuscles.length > 0 ? filteredMuscles.map((m, i) => {
                                                const isActive = form.targetMuscles.includes(m.name);
                                                return (
                                                    <button key={i} type="button" onClick={() => toggleSelection('targetMuscles', m.name)}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isActive ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'}`}>
                                                        {m.name}
                                                    </button>
                                                );
                                            }) : <p className="text-gray-400 text-sm italic">No muscles found for this body part.</p>}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Equipment Needed</label>
                                <div className="flex flex-wrap gap-2">
                                    {['Body Weight', 'Dumbbell', 'Barbell Bar', 'Weights', 'Cable', 'Machine', 'Kettlebell'].map((eq, i) => {
                                        const isActive = form.equipments.includes(eq);
                                        return (
                                            <button key={i} type="button" onClick={() => toggleSelection('equipments', eq)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isActive ? 'bg-gray-800 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
                                                {eq}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {error && <p className="text-red-500 text-sm font-medium bg-red-50 px-4 py-3 rounded-xl">{error}</p>}
                        </form>

                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
                            <button onClick={onClose} className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                            <button onClick={handleSubmit} disabled={loading} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 flex items-center gap-2 disabled:opacity-70 transition-all">
                                {loading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                                Save Exercise
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

const GenerateRoutineModal = ({ isOpen, onClose, onGenerate, trainings, bodyParts }) => {
    const [trainingType, setTrainingType] = useState('Weight Training');
    const [selectedBodyParts, setSelectedBodyParts] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);

    const toggleBodyPart = (bp) => {
        setSelectedBodyParts(prev =>
            prev.includes(bp) ? prev.filter(item => item !== bp) : [...prev, bp]
        );
    };

    const handleGenerate = async () => {
        if (!trainingType || selectedBodyParts.length === 0) {
            alert("Please select training type and at least one body part.");
            return;
        }
        setIsGenerating(true);
        try {
            await onGenerate({ trainingType, targetBodyParts: selectedBodyParts.map(bp => bp.toLowerCase()) });
            onClose();
        } catch (error) {
            console.error("Generation failed:", error);
            alert("Failed to generate workout. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20"
                    >
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-8">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">AI Workout Generator</h2>
                                    <p className="text-slate-500 text-sm font-medium">Select parameters for your AI-built routine</p>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                    <X size={24} className="text-slate-400" />
                                </button>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Training Type</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {trainings.map(t => (
                                            <button
                                                key={t.name}
                                                onClick={() => setTrainingType(t.name)}
                                                className={`px-4 py-3 rounded-2xl text-sm font-bold transition-all border-2 text-left ${trainingType === t.name ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-50 border-slate-50 text-slate-600 hover:border-blue-200'}`}
                                            >
                                                {t.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Target Body Parts</label>
                                    <div className="flex flex-wrap gap-2">
                                        {bodyParts.map(bp => (
                                            <button
                                                key={bp.name}
                                                onClick={() => toggleBodyPart(bp.name)}
                                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-2 ${selectedBodyParts.includes(bp.name) ? 'bg-blue-100 border-blue-500 text-blue-700' : 'bg-slate-50 border-slate-50 text-slate-500 hover:border-slate-200'}`}
                                            >
                                                {bp.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating || selectedBodyParts.length === 0}
                                className="w-full mt-10 py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                            >
                                {isGenerating ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={18} className="text-blue-400" />
                                        Generate Workout
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

const SuccessNotification = ({ message, onClose }) => {
    return (
        <div className="fixed bottom-6 right-6 max-w-md bg-white rounded-xl shadow-2xl border-l-4 border-green-500 p-4 flex items-start gap-4 z-50 animate-in slide-in-from-right-10 fade-in duration-300">
            <div className="shrink-0 text-green-500">
                <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="flex-1 pt-0.5">
                <h3 className="font-bold text-slate-800 text-sm mb-1">Success!</h3>
                <p className="text-slate-600 text-sm leading-snug">{message}</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

const CartExerciseThumb = ({ refId, name }) => {
    const [thumbUrl, setThumbUrl] = useState(null);

    useEffect(() => {
        const fetchThumb = async () => {
            setThumbUrl(null); // Reset when refId changes or fetch starts
            try {
                let blob;
                try {
                    blob = await fitmateService.getThumbnail(refId);
                } catch (err) {
                    // Ignore THUMBNAIL error, will try GIF fallback
                }

                // If thumbnail is missing or invalid, try falling back to GIF
                if (!blob || blob.size === 0 || !blob.type.startsWith('image/')) {
                    try {
                        blob = await fitmateService.getExerciseResource(refId, 'GIF');
                    } catch (err) {
                        // Both failed
                    }
                }

                if (blob && blob.size > 0 && blob.type.startsWith('image/')) {
                    setThumbUrl(URL.createObjectURL(blob));
                }
            } catch (e) {
                console.error("Cart thumb fetch failed", e);
            }
        };
        if (refId) fetchThumb();
        return () => { if (thumbUrl) URL.revokeObjectURL(thumbUrl); };
    }, [refId]);

    if (thumbUrl) {
        return <img src={thumbUrl} alt={name} className="w-full h-full object-cover rounded-lg" />;
    }

    return (
        <div className="w-full h-full flex items-center justify-center bg-slate-50 rounded-lg">
            <span className="text-xl font-bold text-slate-400">
                {name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()}
            </span>
        </div>
    );
};

const HistoryPanel = ({ isOpen, onClose, exerciseName, historyData, loading }) => {
    const [recordLimit, setRecordLimit] = useState(5);
    const limits = [5, 10, 20, 'All'];
    const displayData = historyData ? (recordLimit === 'All' ? historyData : historyData.slice(0, recordLimit)) : [];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]" />
                    <motion.div
                        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[101] flex flex-col"
                    >
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-xl"><History size={20} /></div>
                                <div>
                                    <h3 className="font-bold text-slate-800 leading-tight">Exercise History</h3>
                                    <p className="text-xs text-slate-500 font-medium">{exerciseName}</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"><X size={20} /></button>
                        </div>

                        <div className="px-6 py-3 border-b border-slate-50 flex items-center justify-between bg-white/80 sticky top-0 z-10">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Show Records</span>
                            <div className="flex bg-slate-100 p-1 rounded-xl">
                                {limits.map(limit => (
                                    <button
                                        key={limit}
                                        onClick={() => setRecordLimit(limit)}
                                        className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all ${recordLimit === limit ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        {limit}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center h-40 gap-3">
                                    <Clock className="w-8 h-8 text-blue-500 animate-pulse" />
                                    <p className="text-sm font-bold text-slate-400">Fetching records...</p>
                                </div>
                            ) : displayData && displayData.length > 0 ? (
                                <div className="space-y-4">
                                    {displayData.map((log, i) => (
                                        <div key={i} className={`group p-4 bg-white border rounded-2xl transition-all ${i === 0 ? 'border-blue-200 bg-blue-50/10 shadow-lg shadow-blue-500/5' : 'border-slate-100 hover:border-blue-200'}`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-[10px] font-bold text-slate-400">{new Date(log.creationDate).toLocaleDateString()}</span>
                                                <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-bold uppercase">{log.unit}</span>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase mb-0.5">Measurement</p>
                                                    <p className="text-sm font-black text-slate-700">{log.measurement}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase mb-0.5">Reps</p>
                                                    <p className="text-sm font-black text-slate-700">{log.repetition}</p>
                                                </div>
                                            </div>
                                            {log.notes && <p className="mt-2 text-[10px] text-slate-500 italic">&quot;{log.notes}&quot;</p>}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-60 text-center space-y-4 opacity-40">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center"><Info size={32} /></div>
                                    <p className="font-bold text-slate-600">No History Found</p>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                            <button onClick={onClose} className="w-full py-3 bg-slate-800 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg hover:bg-slate-900 transition-all active:scale-95">Close History</button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

const CompactCardSelector = ({ label, items, selected, onSelect }) => {
    return (
        <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">{label}</label>
            <div className="flex flex-wrap gap-2">
                {items.map((item, idx) => (
                    <button
                        key={idx}
                        onClick={() => onSelect(item)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${selected === item ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600'}`}
                    >
                        {item}
                    </button>
                ))}
            </div>
        </div>
    );
};

const ExerciseGridItem = ({ name, refId, isSelected, onClick }) => {
    const [thumbUrl, setThumbUrl] = useState(null);

    useEffect(() => {
        const fetchThumb = async () => {
            setThumbUrl(null); // Reset when refId changes or fetch starts
            try {
                let blob;
                try {
                    blob = await fitmateService.getThumbnail(refId);
                } catch (err) {
                    // Ignore THUMBNAIL error, will try GIF fallback
                }

                // If thumbnail is missing or invalid, try falling back to GIF
                if (!blob || blob.size === 0 || !blob.type.startsWith('image/')) {
                    try {
                        blob = await fitmateService.getExerciseResource(refId, 'GIF');
                    } catch (err) {
                        // Both failed
                    }
                }

                if (blob && blob.size > 0 && blob.type.startsWith('image/')) {
                    setThumbUrl(URL.createObjectURL(blob));
                }
            } catch (e) {
                console.error("Grid item thumb fetch failed", e);
            }
        };
        if (refId) fetchThumb();
        return () => { if (thumbUrl) URL.revokeObjectURL(thumbUrl); };
    }, [refId]);

    return (
        <div
            onClick={onClick}
            className={`group cursor-pointer rounded-xl border transition-all duration-200 overflow-hidden bg-white ${isSelected ? 'ring-2 ring-blue-500 border-blue-500 shadow-md' : 'border-gray-100 hover:shadow-lg hover:-translate-y-1'}`}
        >
            <div className="aspect-[4/3] bg-gray-50 relative flex items-center justify-center">
                {thumbUrl ? (
                    <img src={thumbUrl} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-50">
                        <span className="text-xl font-bold text-slate-300">{name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()}</span>
                    </div>
                )}
                {isSelected && (
                    <div className="absolute inset-0 bg-blue-900/10 flex items-center justify-center">
                        <div className="bg-blue-600 text-white p-1 rounded-full shadow-lg"><Plus size={16} /></div>
                    </div>
                )}
            </div>
            <div className="p-3">
                <h4 className={`font-semibold text-sm leading-tight ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>{name}</h4>
            </div>
        </div>
    );
};

// --- Main Builder component ---

const UnifiedRoutineBuilder = ({
    routine, setRoutine,
    workoutDate, setWorkoutDate,
    description, setDescription,
    bodyParts, muscles, exercises, trainings,
    exerciseCart, setExerciseCart,
    handleSubmit,
    handleDownloadPDF,
    showSuccess,
    successMessage,
    setShowSuccess,
    onExerciseAdded
}) => {
    const { user } = useAuth();
    const [selectedBodyPart, setSelectedBodyPart] = useState(null);
    const [selectedMuscle, setSelectedMuscle] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
    const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false);
    const [historyPanel, setHistoryPanel] = useState({ open: false, exercise: null, data: [], loading: false });

    const openHistory = async (exerciseName) => {
        setHistoryPanel({ open: true, exercise: exerciseName, data: [], loading: true });
        try {
            const res = await fitmateService.getExerciseHistory(exerciseName);
            setHistoryPanel(prev => ({ ...prev, data: res.data?.content || res.data || [], loading: false }));
        } catch (e) {
            console.error("Failed to fetch history:", e);
            setHistoryPanel(prev => ({ ...prev, loading: false }));
        }
    };

    const addToCart = (exercise) => {
        const exerciseUnit = exercise.unit || 'reps';
        let defaultSetUnit = 'REPS';
        if (exerciseUnit === 'weight') defaultSetUnit = 'KG';
        else if (exerciseUnit === 'time') defaultSetUnit = 'sec';

        setExerciseCart(prev => [...prev, {
            exercise: exercise.name,
            refId: exercise.refId,
            bodyPart: exercise.bodyPart?.name || selectedBodyPart,
            muscle: selectedMuscle || exercise.targetMuscles?.[0]?.name,
            exerciseUnit: exerciseUnit,
            sets: [{ id: Date.now(), weight: '', reps: '', unit: defaultSetUnit, completed: false }],
            notes: ''
        }]);
    };

    const removeFromCart = (index) => {
        setExerciseCart(prev => prev.filter((_, i) => i !== index));
    };

    const handleAddSet = (exerciseIndex) => {
        setExerciseCart(prev => {
            const newCart = [...prev];
            const exercise = newCart[exerciseIndex];
            const lastSet = exercise.sets[exercise.sets.length - 1] || { weight: '', reps: '', unit: 'REPS' };
            exercise.sets.push({ id: Date.now() + Math.random(), weight: lastSet.weight, reps: lastSet.reps, unit: lastSet.unit, completed: false });
            return newCart;
        });
    };

    const handleUpdateSet = (exerciseIndex, setIndex, field, value) => {
        setExerciseCart(prev => {
            const newCart = [...prev];
            newCart[exerciseIndex].sets[setIndex][field] = value;
            return newCart;
        });
    };

    const handleToggleSet = (exerciseIndex, setIndex) => {
        setExerciseCart(prev => {
            const newCart = [...prev];
            newCart[exerciseIndex].sets[setIndex].completed = !newCart[exerciseIndex].sets[setIndex].completed;
            return newCart;
        });
    };

    const removeSet = (exerciseIndex, setIndex) => {
        setExerciseCart(prev => {
            const newCart = [...prev];
            newCart[exerciseIndex].sets.splice(setIndex, 1);
            return newCart;
        });
    };

    const handleGenerateWorkout = async (params) => {
        try {
            const res = await fitmateService.generateRoutine({ ...params, username: user?.username });
            if (res.meta?.code === "000" && res.data?.drills) {
                const newDrills = res.data.drills.map(drill => ({
                    exercise: drill.exercise.name,
                    refId: drill.exercise.refId,
                    bodyPart: drill.exercise.bodyPart?.name,
                    muscle: drill.muscle?.name || drill.exercise.targetMuscles?.[0]?.name,
                    sets: Array.from({ length: 3 }, (_, i) => ({
                        id: Date.now() + Math.random() + i,
                        weight: drill.measurement || '',
                        reps: drill.repetition || '',
                        unit: drill.unit || 'kg',
                        completed: false
                    })),
                    notes: drill.notes || 'Auto-generated'
                }));
                // Clear cart for AI suggestions
                setExerciseCart(newDrills);
                if (!routine.training?.name) {
                    setRoutine(prev => ({ ...prev, training: { name: res.data.training?.name || params.trainingType } }));
                }
            }
        } catch (error) {
            console.error("AI Generation failed:", error);
            throw error;
        }
    };

    const visibleMuscles = selectedBodyPart ? muscles.filter(m => m.bodyPart?.name === selectedBodyPart).map(m => m.name) : [];
    const bodyPartNames = bodyParts.map(b => b.name);

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-gray-50/50">
            <header className="flex-none bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10 shadow-sm">
                <div className="flex items-center gap-6 flex-1">
                    <div className="flex items-center gap-3 text-gray-700">
                        <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Dumbbell size={20} /></div>
                        <div>
                            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Training Type</label>
                            <select
                                className="bg-transparent border-none p-0 font-bold text-gray-800 focus:ring-0 cursor-pointer hover:text-blue-600 text-lg w-40"
                                value={routine.training?.name || ''}
                                onChange={(e) => {
                                    setRoutine(prev => ({ ...prev, training: { name: e.target.value } }));
                                    setSelectedBodyPart(null);
                                    setSelectedMuscle(null);
                                }}
                            >
                                <option value="" disabled>Select Type</option>
                                {trainings.map((t, i) => <option key={i} value={t.name}>{t.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="h-8 w-px bg-gray-200 mx-2" />
                    <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400" />
                        <input type="date" value={workoutDate} onChange={(e) => setWorkoutDate(e.target.value)} className="border-none bg-transparent p-0 text-sm font-medium text-gray-600 focus:ring-0 max-w-[130px]" />
                    </div>
                    <div className="flex items-center gap-2 flex-1 max-w-md">
                        <input placeholder="Routine Description (e.g. Legs Push Day)" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full text-sm border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-500" />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={() => setIsGeneratorOpen(true)} className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-95">
                        <Sparkles size={18} /> Generate Workout
                    </button>
                    <button onClick={handleDownloadPDF} disabled={exerciseCart.length === 0} className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl font-bold transition-all shadow-md border border-gray-200 active:scale-95 disabled:opacity-50">
                        <Download size={18} /> Download PDF
                    </button>
                    <button onClick={handleSubmit} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-95">
                        <Save size={18} /> Finish Routine
                    </button>
                </div>
            </header>

            <div className="flex-1 grid grid-cols-12 overflow-hidden">
                {/* Explorer */}
                <div className="col-span-4 border-r border-gray-200 bg-white flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-gray-100 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Exercise Library</span>
                            <button
                                onClick={() => setIsAddExerciseOpen(true)}
                                className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg transition-colors"
                            >
                                <Plus size={13} /> New Exercise
                            </button>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                placeholder="Search exercises..."
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 rounded-xl text-sm transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <CompactCardSelector label="Target Area" items={bodyPartNames} selected={selectedBodyPart} onSelect={(bp) => { setSelectedBodyPart(bp); setSelectedMuscle(null); }} />
                        {visibleMuscles.length > 0 && <CompactCardSelector label="Muscle Group" items={visibleMuscles} selected={selectedMuscle} onSelect={setSelectedMuscle} />}
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 content-start">
                        <div className="grid grid-cols-2 gap-3">
                            {(() => {
                                const filtered = exercises.filter(e => {
                                    if (searchQuery && !e.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
                                    if (routine.training?.name && e.training?.name !== routine.training.name) return false;
                                    if (selectedBodyPart && e.bodyPart?.name !== selectedBodyPart) return false;
                                    if (selectedMuscle && !e.targetMuscles?.some(m => m.name === selectedMuscle)) return false;
                                    return true;
                                });

                                if (filtered.length === 0) {
                                    return (
                                        <div className="col-span-2 flex flex-col items-center justify-center py-12 text-center gap-3">
                                            <Dumbbell size={32} className="text-gray-200" />
                                            <p className="text-sm text-gray-400">No exercises found.</p>
                                            <button
                                                onClick={() => setIsAddExerciseOpen(true)}
                                                className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-xl transition-colors"
                                            >
                                                <Plus size={13} />
                                                {searchQuery ? `Add "${searchQuery}"` : 'Add New Exercise'}
                                            </button>
                                        </div>
                                    );
                                }

                                return filtered.map((ex) => (
                                    <ExerciseGridItem key={ex.refId || Math.random()} name={ex.name} refId={ex.refId} onClick={() => addToCart(ex)} />
                                ));
                            })()}
                        </div>
                    </div>
                </div>

                {/* Canvas */}
                <div className="col-span-8 bg-gray-50/50 flex flex-col overflow-hidden relative">
                    {exerciseCart.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-10 text-center">
                            <ArrowRight size={32} className="text-gray-300 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-600">Your routine is empty</h3>
                            <p className="max-w-xs mt-2 text-sm">Select exercises from the left panel or generate one with AI.</p>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto p-8 space-y-6">
                            {exerciseCart.map((item, exIdx) => (
                                <div key={item.refId ? `${item.refId}-${exIdx}` : exIdx} className="bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden animate-in slide-in-from-right-4 duration-300">
                                    <div className="p-4 flex gap-5 items-start bg-gradient-to-r from-white to-gray-50/30">
                                        <div className="w-16 h-16 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center p-1">
                                            <CartExerciseThumb refId={item.refId} name={item.exercise} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
                                                    <h3 className="font-bold text-lg text-gray-800 truncate">{exIdx + 1}. {item.exercise}</h3>
                                                    {item.sets.filter(s => s.completed).length > 0 && (
                                                        <span className="shrink-0 text-[10px] font-black px-2 py-0.5 bg-green-100 text-green-600 rounded-full whitespace-nowrap">
                                                            {item.sets.filter(s => s.completed).length}/{item.sets.length}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1 shrink-0">
                                                    <button onClick={() => openHistory(item.exercise)} className="text-gray-300 hover:text-blue-500 transition-colors p-1"><History size={18} /></button>
                                                    <button onClick={() => removeFromCart(exIdx)} className="text-gray-300 hover:text-red-500 transition-colors p-1"><Trash2 size={18} /></button>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-[10px] font-black px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg uppercase tracking-widest border border-slate-200/50">{item.bodyPart}</span>
                                                <span className="text-[10px] font-black px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg uppercase tracking-widest border border-blue-100/50">{item.muscle || 'General'}</span>
                                            </div>
                                            <input
                                                placeholder="Add notes..."
                                                className="mt-3 text-xs border-none bg-transparent p-0 text-gray-500 placeholder-gray-400 focus:ring-0 w-full italic"
                                                value={item.notes || ''}
                                                onChange={(e) => {
                                                    const newCart = [...exerciseCart];
                                                    newCart[exIdx].notes = e.target.value;
                                                    setExerciseCart(newCart);
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-100">
                                        {/* Column hints */}
                                        <div className="flex items-center px-5 py-1.5 bg-gray-50/80 border-b border-gray-100">
                                            <span className="w-6 shrink-0" />
                                            <span className="flex-1 text-[10px] font-black text-gray-400 uppercase tracking-widest pl-8">
                                                {item.exerciseUnit === 'weight' ? 'Weight' : item.exerciseUnit === 'time' ? 'Duration' : 'Reps'}
                                            </span>
                                            {item.exerciseUnit !== 'reps' && (
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-24">Reps</span>
                                            )}
                                        </div>

                                        {/* Set rows */}
                                        {item.sets.map((set, setIdx) => (
                                            <div key={set.id} className={`flex items-center gap-3 px-5 py-2.5 group transition-colors border-b border-gray-50 last:border-b-0
                                                ${set.completed ? 'bg-green-50/50' : 'bg-white hover:bg-gray-50/40'}`}>

                                                {/* Set badge */}
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all
                                                    ${set.completed ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500 text-[11px] font-black'}`}>
                                                    {set.completed ? <Check size={11} strokeWidth={3.5} /> : setIdx + 1}
                                                </div>

                                                {/* Main value stepper */}
                                                <div className={`flex items-center gap-1.5 flex-1 transition-opacity ${set.completed ? 'opacity-40' : ''}`}>
                                                    <button type="button"
                                                        onClick={() => handleUpdateSet(exIdx, setIdx, 'weight', String(Math.max(0, (Number(set.weight) || 0) - 1)))}
                                                        className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center text-base font-bold leading-none select-none shrink-0">−</button>
                                                    <input
                                                        type="number" min="0"
                                                        value={set.weight}
                                                        onChange={e => handleUpdateSet(exIdx, setIdx, 'weight', e.target.value)}
                                                        className="w-14 text-center font-black text-base border-none bg-transparent focus:ring-0 focus:outline-none text-gray-800 p-0 tabular-nums"
                                                        placeholder="0"
                                                    />
                                                    <button type="button"
                                                        onClick={() => handleUpdateSet(exIdx, setIdx, 'weight', String((Number(set.weight) || 0) + 1))}
                                                        className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center text-base font-bold leading-none select-none shrink-0">+</button>
                                                    <button type="button"
                                                        onClick={() => {
                                                            const units = item.exerciseUnit === 'weight' ? ['KG', 'LB'] : item.exerciseUnit === 'time' ? ['min', 'sec', 'HR'] : ['REPS'];
                                                            handleUpdateSet(exIdx, setIdx, 'unit', units[(units.indexOf(set.unit) + 1) % units.length]);
                                                        }}
                                                        className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded text-[10px] font-black uppercase tracking-wider transition-colors shrink-0">
                                                        {set.unit}
                                                    </button>
                                                </div>

                                                {/* Reps (weight / time exercises) */}
                                                {item.exerciseUnit !== 'reps' && (
                                                    <div className={`flex items-center gap-1.5 transition-opacity ${set.completed ? 'opacity-40' : ''}`}>
                                                        <span className="text-gray-200 font-black select-none text-lg">×</span>
                                                        <button type="button"
                                                            onClick={() => handleUpdateSet(exIdx, setIdx, 'reps', String(Math.max(0, (Number(set.reps) || 0) - 1)))}
                                                            className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center text-base font-bold leading-none select-none shrink-0">−</button>
                                                        <input
                                                            type="number" min="0"
                                                            value={set.reps}
                                                            onChange={e => handleUpdateSet(exIdx, setIdx, 'reps', e.target.value)}
                                                            className="w-12 text-center font-black text-base border-none bg-transparent focus:ring-0 focus:outline-none text-gray-800 p-0 tabular-nums"
                                                            placeholder="0"
                                                        />
                                                        <button type="button"
                                                            onClick={() => handleUpdateSet(exIdx, setIdx, 'reps', String((Number(set.reps) || 0) + 1))}
                                                            className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center text-base font-bold leading-none select-none shrink-0">+</button>
                                                        <span className="text-[10px] text-gray-400 font-bold shrink-0">reps</span>
                                                    </div>
                                                )}

                                                {/* Done + delete */}
                                                <div className="flex items-center gap-1.5 shrink-0 ml-1">
                                                    <button type="button"
                                                        onClick={() => handleToggleSet(exIdx, setIdx)}
                                                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all
                                                            ${set.completed
                                                                ? 'bg-green-500 text-white shadow-md shadow-green-200 scale-105'
                                                                : 'bg-gray-100 text-gray-300 hover:bg-green-100 hover:text-green-500 hover:scale-105'}`}>
                                                        <Check size={16} strokeWidth={3} />
                                                    </button>
                                                    <button type="button"
                                                        onClick={() => removeSet(exIdx, setIdx)}
                                                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-200 hover:text-red-400 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all">
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Add set */}
                                        <button onClick={() => handleAddSet(exIdx)}
                                            className="w-full py-3 text-blue-500 hover:text-blue-700 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-blue-50/50 transition-colors">
                                            <Plus size={13} /> Add Set
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <div className="h-20" />
                        </div>
                    )}
                </div>
            </div>

            {showSuccess && <SuccessNotification message={successMessage} onClose={() => setShowSuccess(false)} />}
            <HistoryPanel isOpen={historyPanel.open} onClose={() => setHistoryPanel(prev => ({ ...prev, open: false }))} exerciseName={historyPanel.exercise} historyData={historyPanel.data} loading={historyPanel.loading} />
            <GenerateRoutineModal isOpen={isGeneratorOpen} onClose={() => setIsGeneratorOpen(false)} onGenerate={handleGenerateWorkout} trainings={trainings} bodyParts={bodyParts} />
            <AddExerciseModal
                isOpen={isAddExerciseOpen}
                onClose={() => setIsAddExerciseOpen(false)}
                onSuccess={(name) => { setIsAddExerciseOpen(false); onExerciseAdded(name); }}
                trainings={trainings}
                bodyParts={bodyParts}
                musclesAll={muscles}
            />
        </div>
    );
};

const FitmateMakeRoutine = () => {
    const { user } = useAuth();
    const [routine, setRoutine] = useState({ training: { name: '' }, description: '', workoutDate: new Date().toISOString().split('T')[0], drills: [] });
    const [workoutDate, setWorkoutDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [exerciseCart, setExerciseCart] = useState([]);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [bodyParts, setBodyParts] = useState([]);
    const [muscles, setMuscles] = useState([]);
    const [exercises, setExercises] = useState([]);
    const [trainings, setTrainings] = useState([]);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [bodyRes, muscleRes, exerciseRes, trainingRes] = await Promise.all([
                    fitmateService.getBodyParts(),
                    fitmateService.getMuscles(),
                    fitmateService.getExercises(0, 500), // Fetch a larger batch for the local builder grid
                    fitmateService.getTrainings()
                ]);
                setBodyParts(bodyRes.data?.content || bodyRes.data || []);
                setMuscles(muscleRes.data?.content || muscleRes.data || []);
                setExercises(exerciseRes.data?.content || exerciseRes.data || []);
                setTrainings(trainingRes.data?.content || trainingRes.data || []);
            } catch (error) { console.error("Error fetching dropdown data:", error); }
        };
        fetchInitialData();
    }, []);

    const handleDownloadPDF = () => {
        if (exerciseCart.length === 0) return alert("Your routine is empty!");
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        doc.setFillColor(59, 130, 246);
        doc.rect(0, 0, pageWidth, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont(undefined, 'bold');
        doc.text('Workout Plan', pageWidth / 2, 20, { align: 'center' });
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`${routine.training?.name || 'Training'} - ${workoutDate}`, pageWidth / 2, 30, { align: 'center' });

        let yPos = 50;
        exerciseCart.forEach((item, exIdx) => {
            if (yPos > 250) { doc.addPage(); yPos = 20; }
            doc.setFillColor(243, 244, 246);
            doc.roundedRect(10, yPos, pageWidth - 20, 12, 2, 2, 'F');
            doc.setTextColor(30, 41, 59);
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text(`${exIdx + 1}. ${item.exercise}`, 15, yPos + 8);
            yPos += 15;
            const tableData = item.sets.map((set, idx) => [`${idx + 1}`, `${set.weight || '0'} ${set.unit}`, `${set.reps || '0'}`, '☐']);
            autoTable(doc, {
                startY: yPos,
                head: [['Set', 'Weight', 'Reps', '✓']],
                body: tableData,
                theme: 'grid',
                headStyles: { fillColor: [59, 130, 246] }
            });
            yPos = doc.lastAutoTable.finalY + 10;
        });
        doc.save(`workout-${workoutDate}.pdf`);
    };

    const refreshExercises = async () => {
        try {
            const exerciseRes = await fitmateService.getExercises(0, 500);
            setExercises(exerciseRes.data?.content || exerciseRes.data || []);
        } catch (error) { console.error("Failed to refresh exercises:", error); }
    };

    const handleExerciseAdded = async (name) => {
        await refreshExercises();
        setSuccessMessage(`"${name}" added to the library! Find it in the exercise list.`);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);
    };

    const handleSubmit = async () => {
        if (!routine.training?.name || exerciseCart.length === 0) return alert("Please finish setup.");
        const drills = [];
        exerciseCart.forEach(ex => {
            ex.sets.forEach(set => {
                drills.push({ exercise: { name: ex.exercise }, muscle: { name: ex.muscle || 'General' }, measurementUnit: 'Weight', measurement: Number(set.weight) || 0, unit: set.unit, repetition: Number(set.reps) || 0, notes: ex.notes || '' });
            });
        });
        try {
            await fitmateService.createRoutine({ ...routine, workoutDate, description, drills, username: user?.username });
            setSuccessMessage("Routine created successfully!");
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 5000);
        } catch (e) { console.error(e); alert("Failed to save routine."); }
    };

    return (
        <UnifiedRoutineBuilder
            routine={routine} setRoutine={setRoutine}
            workoutDate={workoutDate} setWorkoutDate={setWorkoutDate}
            description={description} setDescription={setDescription}
            bodyParts={bodyParts} muscles={muscles} exercises={exercises} trainings={trainings}
            exerciseCart={exerciseCart} setExerciseCart={setExerciseCart}
            handleSubmit={handleSubmit}
            handleDownloadPDF={handleDownloadPDF}
            showSuccess={showSuccess}
            successMessage={successMessage}
            setShowSuccess={setShowSuccess}
            onExerciseAdded={handleExerciseAdded}
        />
    );
};

const RoutineBuilder = () => <Layout content={<FitmateMakeRoutine />} />;
export default RoutineBuilder;
