
import Layout from "@/components/layout/Layout";
import { ChevronDown, Option, CheckCircle2, MoreVertical, Plus, Trash2, Timer, Check, X, Dumbbell, Calendar, Save, Filter, Search, ArrowRight, Download, FileText, History, Info, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { API_FITMATE_BASE_URL } from "@/constants";
import { fetchData, POST, postData } from "@/dataService";
import { useRouter } from "next/router";
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- Sub-components Helper ---

// Success Notification Component
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

// Cart Exercise Thumbnail Component
const CartExerciseThumb = ({ refId, name }) => {
    const [thumbUrl, setThumbUrl] = useState(null);

    useEffect(() => {
        const fetchThumb = async () => {
            try {
                const res = await fetch(`${API_FITMATE_BASE_URL}/exercises/exercise/resources/resource?refId=${refId}&placeholder=THUMBNAIL&resourceId=`);
                if (!res.ok) return;
                const blob = await res.blob();
                if (blob.size > 0 && blob.type.startsWith('image/')) {
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
        return (
            <img
                src={thumbUrl}
                alt={name}
                className="w-full h-full object-cover rounded-lg"
            />
        );
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
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
                    />
                    {/* Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[101] flex flex-col"
                    >
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                                    <History size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 leading-tight">Exercise History</h3>
                                    <p className="text-xs text-slate-500 font-medium">{exerciseName}</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Filter Bar */}
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
                                    <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 mb-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Latest Performance</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-white p-3 rounded-xl shadow-sm border border-blue-50">
                                                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Measurement</p>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-xl font-black text-slate-800">{displayData[0].measurement}</span>
                                                    <span className="text-xs font-bold text-slate-500 uppercase">{displayData[0].unit}</span>
                                                </div>
                                            </div>
                                            <div className="bg-white p-3 rounded-xl shadow-sm border border-blue-50">
                                                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Repetitions</p>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-xl font-black text-slate-800">{displayData[0].repetition}</span>
                                                    <span className="text-xs font-bold text-slate-500 uppercase">Reps</span>
                                                </div>
                                            </div>
                                        </div>
                                        {displayData[0].notes && (
                                            <div className="mt-4 p-3 bg-white/60 rounded-xl border border-blue-50">
                                                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Notes</p>
                                                <p className="text-xs text-slate-600 font-medium italic">"{displayData[0].notes}"</p>
                                            </div>
                                        )}
                                        <div className="mt-4 flex items-center justify-between text-[10px] text-slate-400 font-bold">
                                            <span>Recording Unit: {displayData[0].measurementUnit}</span>
                                            <span>{new Date(displayData[0].creationDate).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Activity Stream ({displayData.length} records)</h4>
                                    {displayData.slice(1).map((log, i) => (
                                        <div key={i} className="group p-4 bg-white border border-slate-100 rounded-2xl hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-[10px] font-bold text-slate-400">{new Date(log.creationDate).toLocaleDateString()}</span>
                                                <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-bold uppercase">{log.unit}</span>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase mb-0.5">Weight</p>
                                                    <p className="text-sm font-black text-slate-700">{log.measurement}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase mb-0.5">Reps</p>
                                                    <p className="text-sm font-black text-slate-700">{log.repetition}</p>
                                                </div>
                                            </div>
                                            {log.notes && (
                                                <p className="mt-2 text-[10px] text-slate-500 italic">"{log.notes}"</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-60 text-center space-y-4 opacity-40">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                                        <Info size={32} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-600">No History Found</p>
                                        <p className="text-xs max-w-[200px] mt-1">Start your first session to begin tracking performance.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                            <button
                                onClick={onClose}
                                className="w-full py-3 bg-slate-800 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-slate-200 hover:bg-slate-900 transition-all active:scale-95"
                            >
                                Close History
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

const CompactCardSelector = ({ label, items, selected, onSelect, type = 'text' }) => {
    return (
        <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">{label}</label>
            <div className="flex flex-wrap gap-2">
                {items.map((item, idx) => {
                    const active = selected === item;
                    return (
                        <button
                            key={idx}
                            onClick={() => onSelect(item)}
                            className={`
                                px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                                ${active
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600'
                                }
                            `}
                        >
                            {/* Simple text or could contain icon if type='icon' */}
                            {item}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

const ExerciseGridItem = ({ name, refId, isSelected, onClick }) => {
    const [thumbUrl, setThumbUrl] = useState(null);

    useEffect(() => {
        const fetchThumb = async () => {
            try {
                const res = await fetch(`${API_FITMATE_BASE_URL}/exercises/exercise/resources/resource?refId=${refId}&placeholder=THUMBNAIL&resourceId=`);
                if (!res.ok) return;
                const blob = await res.blob();
                if (blob.size > 0 && blob.type.startsWith('image/')) {
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
            className={`
                group cursor-pointer rounded-xl border transition-all duration-200 overflow-hidden bg-white
                ${isSelected ? 'ring-2 ring-blue-500 border-blue-500 shadow-md' : 'border-gray-100 hover:shadow-lg hover:-translate-y-1'}
            `}
        >
            <div className="aspect-[4/3] bg-gray-50 relative flex items-center justify-center">
                {thumbUrl ? (
                    <img
                        src={thumbUrl}
                        alt={name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-50">
                        <h2 className="text-4xl font-black text-slate-200 leading-tight tracking-tight">
                            {name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()}
                        </h2>
                    </div>
                )}
                {isSelected && (
                    <div className="absolute inset-0 bg-blue-900/10 flex items-center justify-center">
                        <div className="bg-blue-600 text-white p-1 rounded-full shadow-lg">
                            <Plus size={16} />
                        </div>
                    </div>
                )}
            </div>
            <div className="p-3">
                <h4 className={`font-semibold text-sm leading-tight ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>{name}</h4>
            </div>
        </div>
    )
}


const UnifiedRoutineBuilder = ({
    // Global State
    routine, setRoutine,
    workoutDate, setWorkoutDate,
    description, setDescription,
    // Data
    bodyParts, muscles, exercises, trainings,
    // Cart
    exerciseCart, setExerciseCart,
    handleSubmit,
    handleDownloadPDF,
    showSuccess,
    successMessage,
    setShowSuccess
}) => {

    // --> Local UI State for Filters
    const [selectedBodyPart, setSelectedBodyPart] = useState('Chest'); // Default to first?
    const [selectedMuscle, setSelectedMuscle] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // --> History UI State
    const [historyPanel, setHistoryPanel] = useState({ open: false, exercise: null, data: [], loading: false });

    const openHistory = async (exerciseName) => {
        setHistoryPanel({ open: true, exercise: exerciseName, data: [], loading: true });
        try {
            const res = await fetchData(`${API_FITMATE_BASE_URL}/drill/${encodeURIComponent(exerciseName)}`);
            setHistoryPanel(prev => ({ ...prev, data: res.data || [], loading: false }));
        } catch (e) {
            console.error("Failed to fetch history:", e);
            setHistoryPanel(prev => ({ ...prev, loading: false }));
        }
    };

    // Derived Data
    const bodyPartNames = bodyParts.map(b => b.name);

    // Filter Muscles based on Body Part
    const visibleMuscles = selectedBodyPart
        ? muscles.filter(m => m.bodyPart?.name === selectedBodyPart).map(m => m.name)
        : [];

    // Filter Exercises based on Body Part + Muscle + Search
    const visibleExercises = exercises.filter(ex => {
        // Body Part Check
        // Exercise data usually has "targetMuscles" which have "bodyPart". 
        // Or we might need to rely on the previously fetched filtered logic.
        // Assuming 'ex' has bodyPart linkage for this demo:
        // In real app, `exercises` might be ALL exercises. 
        // Simple filter based on logic in previous code:
        const matchesMuscle = selectedMuscle
            ? ex.targetMuscles?.some(m => m.name === selectedMuscle)
            : true; // If no muscle selected, show all for body part? 

        // Actually, querying all exercises locally might be heavy if not filtered by bodypart first.
        // Let's assume `exercises` passed in IS ALL. 
        // We need a way to know if ex belongs to bodypart.

        // Fallback: simple text search if no filters, or strict muscle match.
        // Ideally we filter by muscle.

        if (selectedMuscle) return matchesMuscle;

        // If only body part selected, we need to check if ANY of ex's muscles belong to that bodypart.
        // This relies on ex structure. 
        return true;
    }).filter(ex => {
        if (!searchQuery) return true;
        return ex.name.toLowerCase().includes(searchQuery.toLowerCase());
    });


    // --> Cart Logic
    const addToCart = (exercise) => {
        setExerciseCart(prev => {
            // Check if already in cart? Allow duplicates for super-sets?
            // Let's just append for now.
            return [...prev, {
                exercise: exercise.name,
                refId: exercise.refId,
                bodyPart: selectedBodyPart,
                muscle: selectedMuscle || exercise.targetMuscles?.[0]?.name,
                sets: [{
                    id: Date.now(),
                    weight: '',
                    reps: '',
                    unit: 'kg',
                    completed: false
                }],
                notes: ''
            }];
        });
    };

    const removeFromCart = (index) => {
        setExerciseCart(prev => prev.filter((_, i) => i !== index));
    };

    // Sub-components methods for the Right Panel (copied from ReviewAndSubmit)
    const handleAddSet = (exerciseIndex) => {
        setExerciseCart(prev => {
            const newCart = [...prev];
            const exercise = newCart[exerciseIndex];
            const lastSet = exercise.sets[exercise.sets.length - 1] || { weight: '', reps: '', unit: 'kg' };
            exercise.sets.push({
                id: Date.now() + Math.random(),
                weight: lastSet.weight, reps: lastSet.reps, unit: lastSet.unit, completed: false
            });
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
            const set = newCart[exerciseIndex].sets[setIndex];
            set.completed = !set.completed;
            return newCart;
        });
    };

    const removeSet = (exerciseIndex, setIndex) => {
        setExerciseCart(prev => {
            const newCart = [...prev];
            newCart[exerciseIndex].sets.splice(setIndex, 1);
            return newCart;
        });
    }


    return (
        <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-gray-50/50">
            {/* 1. Top Bar: Meta-Data */}
            <header className="flex-none bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10 shadow-sm">
                <div className="flex items-center gap-6 flex-1">
                    <div className="flex items-center gap-3 text-gray-700">
                        <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                            <Dumbbell size={20} />
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase font-bold text-gray-400 leading-none mb-1">Training Type</label>
                            <select
                                className="bg-transparent border-none p-0 font-bold text-gray-800 focus:ring-0 cursor-pointer hover:text-blue-600 transition-colors pr-8 text-lg w-40"
                                value={routine.training?.name || ''}
                                onChange={(e) => setRoutine(prev => ({ ...prev, training: { name: e.target.value } }))}
                            >
                                <option value="" disabled>Select Type</option>
                                {trainings.map((t, i) => (
                                    <option key={i} value={t.name}>{t.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="h-8 w-px bg-gray-200 mx-2"></div>

                    <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400" />
                        <input
                            type="date"
                            value={workoutDate}
                            onChange={(e) => setWorkoutDate(e.target.value)}
                            className="border-none bg-transparent p-0 text-sm font-medium text-gray-600 focus:ring-0 max-w-[130px]"
                        />
                    </div>

                    <div className="flex items-center gap-2 flex-1 max-w-md">
                        <input
                            placeholder="Routine Description (e.g. Legs Push Day)"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full text-sm border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                        <Timer size={16} /> 00:00
                    </div>
                    <button
                        onClick={handleDownloadPDF}
                        disabled={exerciseCart.length === 0}
                        className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl font-bold transition-all shadow-md border border-gray-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download size={18} /> Download PDF
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-blue-200 active:scale-95"
                    >
                        <Save size={18} /> Finish Routine
                    </button>
                </div>
            </header>

            {/* 2. Main Split Content */}
            <div className="flex-1 grid grid-cols-12 overflow-hidden">

                {/* LEFT PANEL: Explorer (4 Cols) */}
                <div className="col-span-4 border-r border-gray-200 bg-white flex flex-col overflow-hidden">
                    {/* Filters Header */}
                    <div className="p-4 border-b border-gray-100 space-y-4 bg-white z-10">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                placeholder="Search exercises..."
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 rounded-xl text-sm transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Body Filters */}
                        <CompactCardSelector
                            label="Target Area"
                            items={bodyPartNames}
                            selected={selectedBodyPart}
                            onSelect={(bp) => { setSelectedBodyPart(bp); setSelectedMuscle(null); }}
                        />

                        {/* Muscle Filters (Horizontal Scroll) */}
                        {visibleMuscles.length > 0 && (
                            <div className="overflow-x-auto pb-2 scrollbar-hide">
                                <CompactCardSelector
                                    label="Muscle Group"
                                    items={visibleMuscles}
                                    selected={selectedMuscle}
                                    onSelect={setSelectedMuscle}
                                />
                            </div>
                        )}
                    </div>

                    {/* Scrollable Grid */}
                    <div className="flex-1 overflow-y-auto p-4 content-start">
                        <div className="space-y-2 mb-4">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                {selectedMuscle || selectedBodyPart || 'All'} Exercises
                            </h3>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {/* Mocking Filter Logic: In reality, we'd filter the main list. 
                                 For now, using the passed 'exercises' list but filtered by primitive name check or just rendering all if no match for demo consistency with old code 
                             */}
                            {exercises
                                .filter(e => {
                                    // Robust filtering replacement
                                    if (searchQuery) return e.name.toLowerCase().includes(searchQuery.toLowerCase());
                                    // if muscle selected, must match
                                    if (selectedMuscle) return e.targetMuscles?.some(m => m.name === selectedMuscle);
                                    // if bodypart selected, must match bodypart (assuming we can derive it or just showing all for now if structure missing)
                                    // fallback: show random subset if list is huge? No, show all.
                                    return true;
                                })
                                .map((ex, i) => (
                                    <ExerciseGridItem
                                        key={i}
                                        name={ex.name}
                                        refId={ex.refId}
                                        isSelected={false}
                                        onClick={() => addToCart(ex)}
                                    />
                                ))}

                            {exercises.length === 0 && (
                                <div className="col-span-2 text-center py-10 text-gray-400">
                                    <p>Loading exercises...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>


                {/* RIGHT PANEL: Builder Canvas (8 Cols) */}
                <div className="col-span-8 bg-gray-50/50 flex flex-col overflow-hidden relative">

                    {exerciseCart.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-10 text-center">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <ArrowRight size={32} className="text-gray-300" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-600">Your routine is empty</h3>
                            <p className="max-w-xs mt-2 text-sm">Select exercises from the left panel to start building your workout.</p>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto p-8 space-y-6">
                            {exerciseCart.map((item, exIdx) => (
                                <div key={exIdx} className="bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden animate-in slide-in-from-right-4 duration-300">
                                    {/* Card Header */}
                                    <div className="p-4 flex gap-5 items-start bg-gradient-to-r from-white to-gray-50/30">
                                        <div className="w-16 h-16 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center p-1">
                                            <CartExerciseThumb refId={item.refId} name={item.exercise} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-bold text-lg text-gray-800 truncate pr-4">{item.exercise}</h3>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => openHistory(item.exercise)}
                                                        className="text-gray-300 hover:text-blue-500 transition-colors p-1"
                                                        title="View History"
                                                    >
                                                        <History size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => removeFromCart(exIdx)}
                                                        className="text-gray-300 hover:text-red-500 transition-colors p-1"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md">
                                                    {item.muscle || 'General'}
                                                </span>
                                                {/* Notes Input Inline */}
                                                <input
                                                    placeholder="Add notes..."
                                                    className="text-xs border-none bg-transparent p-0 text-gray-500 placeholder-gray-400 focus:ring-0 w-full"
                                                    value={item.notes || ''}
                                                    onChange={(e) => {
                                                        const newCart = [...exerciseCart];
                                                        newCart[exIdx].notes = e.target.value;
                                                        setExerciseCart(newCart);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sets Table */}
                                    <div className="border-t border-gray-100">
                                        <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">
                                            <div className="col-span-1">Set</div>
                                            {/* <div className="col-span-3 text-left pl-2">Previous</div> */}
                                            <div className="col-span-3">Weight</div>
                                            <div className="col-span-2">Reps</div>
                                            <div className="col-span-6">Actions</div>
                                        </div>

                                        <div className="divide-y divide-gray-50">
                                            {item.sets.map((set, setIdx) => (
                                                <div
                                                    key={set.id}
                                                    className={`grid grid-cols-12 gap-2 px-4 py-2 items-center text-center group ${set.completed ? 'bg-green-50/50' : 'bg-white'}`}
                                                >
                                                    <div className="col-span-1 font-bold text-blue-600 text-sm">{setIdx + 1}</div>
                                                    {/* <div className="col-span-3 text-left pl-2 text-gray-300 text-xs font-medium">-</div> */}
                                                    <div className="col-span-3">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <input
                                                                type="number"
                                                                className="w-16 bg-gray-100 border-none rounded-md py-1 text-center font-bold text-gray-700 focus:ring-2 focus:ring-blue-500/50 text-sm"
                                                                value={set.weight}
                                                                onChange={(e) => handleUpdateSet(exIdx, setIdx, 'weight', e.target.value)}
                                                                placeholder="0"
                                                            />
                                                            <button
                                                                onClick={() => handleUpdateSet(exIdx, setIdx, 'unit', set.unit === 'kg' ? 'lb' : 'kg')}
                                                                className="text-[10px] font-bold text-gray-400 hover:text-blue-600 w-5 uppercase"
                                                            >
                                                                {set.unit}
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <input
                                                            type="number"
                                                            className="w-full bg-gray-100 border-none rounded-md py-1 text-center font-bold text-gray-700 focus:ring-2 focus:ring-blue-500/50 text-sm"
                                                            value={set.reps}
                                                            onChange={(e) => handleUpdateSet(exIdx, setIdx, 'reps', e.target.value)}
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                    <div className="col-span-6 flex justify-center gap-1 opacity-100 sm:opacity-40 sm:group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleToggleSet(exIdx, setIdx)}
                                                            className={`w-7 h-7 rounded-md flex items-center justify-center transition-all ${set.completed ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400 hover:bg-green-100 hover:text-green-600'}`}
                                                        >
                                                            <Check size={14} strokeWidth={3} />
                                                        </button>
                                                        <button
                                                            onClick={() => removeSet(exIdx, setIdx)}
                                                            className="w-7 h-7 rounded-md flex items-center justify-center bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-500 transition-all"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Add Set Footer */}
                                        <button
                                            onClick={() => handleAddSet(exIdx)}
                                            className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-blue-600/70 hover:text-blue-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1 border-t border-gray-100"
                                        >
                                            <Plus size={14} /> Add Set
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <div className="h-20"></div> {/* Spacer for scroll */}
                        </div>
                    )}
                </div>
            </div>

            {/* Success Notification */}
            {showSuccess && (
                <SuccessNotification
                    message={successMessage}
                    onClose={() => setShowSuccess(false)}
                />
            )}

            {/* History Panel */}
            <HistoryPanel
                isOpen={historyPanel.open}
                onClose={() => setHistoryPanel(prev => ({ ...prev, open: false }))}
                exerciseName={historyPanel.exercise}
                historyData={historyPanel.data}
                loading={historyPanel.loading}
            />
        </div>
    );
};


const FitmateMakeRoutine = () => {
    // --- Central State ---
    const [routine, setRoutine] = useState({
        training: { name: '' },
        description: '',
        workoutDate: new Date().toISOString().split('T')[0],
        drills: []
    });

    // Flattened UI State for ease
    const [workoutDate, setWorkoutDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [exerciseCart, setExerciseCart] = useState([]);

    // Success notification state
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // --- Data Fetching ---
    const [bodyParts, setBodyParts] = useState([]);
    const [muscles, setMuscles] = useState([]);
    const [exercises, setExercises] = useState([]);
    const [trainings, setTrainings] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [bodyRes, muscleRes, exerciseRes, trainingRes] = await Promise.all([
                    fetch(`${API_FITMATE_BASE_URL}/bodyparts`),
                    fetch(`${API_FITMATE_BASE_URL}/muscles`),
                    fetch(`${API_FITMATE_BASE_URL}/exercises`),
                    fetch(`${API_FITMATE_BASE_URL}/trainings`)
                ]);
                const [bodyData, muscleData, exerciseData, trainingData] = await Promise.all([
                    bodyRes.json(),
                    muscleRes.json(),
                    exerciseRes.json(),
                    trainingRes.json()
                ]);
                setBodyParts(bodyData.data || []);
                setMuscles(muscleData.data || []);
                setExercises(exerciseData.data || []);
                setTrainings(trainingData.data || []);
            } catch (error) {
                console.error("Error fetching dropdown data:", error);
            }
        };
        fetchData();
    }, []);

    // --- PDF Export Function ---
    const handleDownloadPDF = () => {
        if (exerciseCart.length === 0) {
            alert("Your routine is empty! Add some exercises first.");
            return;
        }

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        // Header
        doc.setFillColor(59, 130, 246); // Blue
        doc.rect(0, 0, pageWidth, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont(undefined, 'bold');
        doc.text('Workout Plan', pageWidth / 2, 20, { align: 'center' });

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`${routine.training?.name || 'Training'} - ${workoutDate}`, pageWidth / 2, 30, { align: 'center' });

        // Description
        if (description) {
            doc.setTextColor(100, 100, 100);
            doc.setFontSize(9);
            doc.text(description, pageWidth / 2, 36, { align: 'center' });
        }

        let yPos = 50;

        // Exercise Cards
        exerciseCart.forEach((item, exIdx) => {
            // Check if we need a new page
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }

            // Exercise Header
            doc.setFillColor(243, 244, 246); // Gray background
            doc.roundedRect(10, yPos, pageWidth - 20, 12, 2, 2, 'F');

            doc.setTextColor(30, 41, 59);
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text(`${exIdx + 1}. ${item.exercise}`, 15, yPos + 8);

            doc.setFontSize(8);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(100, 116, 139);
            doc.text(`${item.muscle || 'General'}`, pageWidth - 15, yPos + 8, { align: 'right' });

            yPos += 15;

            // Sets Table
            const tableData = item.sets.map((set, idx) => [
                `${idx + 1}`,
                '-',
                `${set.weight || '0'} ${set.unit}`,
                `${set.reps || '0'}`,
                '☐' // Checkbox
            ]);

            autoTable(doc, {
                startY: yPos,
                head: [['Set', 'Previous', 'Weight', 'Reps', '✓']],
                body: tableData,
                margin: { left: 15, right: 15 },
                theme: 'grid',
                headStyles: {
                    fillColor: [59, 130, 246],
                    textColor: [255, 255, 255],
                    fontSize: 9,
                    fontStyle: 'bold'
                },
                bodyStyles: {
                    fontSize: 9,
                    textColor: [51, 65, 85]
                },
                columnStyles: {
                    0: { cellWidth: 15, halign: 'center' },
                    1: { cellWidth: 30, halign: 'center' },
                    2: { cellWidth: 35, halign: 'center' },
                    3: { cellWidth: 25, halign: 'center' },
                    4: { cellWidth: 15, halign: 'center' }
                }
            });

            yPos = doc.lastAutoTable.finalY + 5;

            // Notes
            if (item.notes) {
                doc.setFontSize(8);
                doc.setTextColor(100, 116, 139);
                doc.setFont(undefined, 'italic');
                doc.text(`Notes: ${item.notes}`, 15, yPos);
                yPos += 5;
            }

            yPos += 5; // Space between exercises
        });

        // Footer
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(
                `Page ${i} of ${totalPages} - Generated on ${new Date().toLocaleDateString()}`,
                pageWidth / 2,
                doc.internal.pageSize.getHeight() - 10,
                { align: 'center' }
            );
        }

        // Download
        const filename = `workout-${routine.training?.name || 'plan'}-${workoutDate}.pdf`;
        doc.save(filename);
    };

    // --- Submission Logic ---
    const router = useRouter();
    const handleSubmit = async () => {
        if (!routine.training?.name) {
            alert("Please select a training type.");
            return;
        }
        if (exerciseCart.length === 0) {
            alert("Your routine is empty! Add some exercises.");
            return;
        }

        const drills = [];
        exerciseCart.forEach(ex => {
            ex.sets.forEach(set => {
                drills.push({
                    exercise: { name: ex.exercise },
                    muscle: { name: ex.muscle || 'General' },
                    measurementUnit: 'Weight',
                    measurement: Number(set.weight) || 0,
                    unit: set.unit,
                    repetition: Number(set.reps) || 0,
                    burntCalories: 0,
                    notes: ex.notes || ''
                });
            });
        });

        const routinePayload = {
            ...routine,
            workoutDate,
            description,
            drills
        };

        try {
            await postData(`${API_FITMATE_BASE_URL}/routines/routine`, routinePayload);

            // Show success notification instead of redirect
            setSuccessMessage(`Routine "${description || 'Workout'}" created successfully! ${exerciseCart.length} exercises added.`);
            setShowSuccess(true);

            // Auto-hide after 5 seconds
            setTimeout(() => {
                setShowSuccess(false);
            }, 5000);

            // Optionally clear the form or redirect after delay
            // setTimeout(() => {
            //     router.push('/fitmate/routine');
            // }, 2000);

        } catch (e) {
            console.error(e);
            alert("Failed to save routine.");
        }
    };

    return (
        <UnifiedRoutineBuilder
            // State
            routine={routine} setRoutine={setRoutine}
            workoutDate={workoutDate} setWorkoutDate={setWorkoutDate}
            description={description} setDescription={setDescription}
            // Data
            bodyParts={bodyParts} muscles={muscles} exercises={exercises} trainings={trainings}
            // Cart
            exerciseCart={exerciseCart} setExerciseCart={setExerciseCart}
            // Actions
            handleSubmit={handleSubmit}
            handleDownloadPDF={handleDownloadPDF}
            // Notification
            showSuccess={showSuccess}
            successMessage={successMessage}
            setShowSuccess={setShowSuccess}
        />
    );
}

const RoutineBuilder = () => {
    return (
        <Layout content={<FitmateMakeRoutine />} />
    );
}

export default RoutineBuilder;
