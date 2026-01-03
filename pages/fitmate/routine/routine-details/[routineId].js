
import { fetchData, updateData, DeleteByObject, fetchWithAuth } from "@/dataService";
import { API_FITMATE_BASE_URL } from "@/constants";
import Layout from "@/components/layout/Layout";
import { useRouter } from "next/router";
import Link from "next/link";
import {
    Pen, Trash2, Check, X, Play, Flag, Clock, Flame,
    Dumbbell, Calendar, ArrowLeft, Save, AlertCircle
} from "lucide-react";
import { useState, useEffect } from "react";

// --- Components ---

const StatusBadge = ({ status }) => {
    const s = (status || 'not_started').toLowerCase();
    const config = {
        'completed': { color: 'bg-green-100 text-green-700', label: 'Completed', icon: Check },
        'in_progress': { color: 'bg-blue-100 text-blue-700', label: 'In Progress', icon: Play },
        'not_started': { color: 'bg-gray-100 text-gray-700', label: 'Planned', icon: Calendar },
        'scheduled': { color: 'bg-purple-100 text-purple-700', label: 'Scheduled', icon: Calendar },
    };
    const c = config[s] || config['not_started'];
    const Icon = c.icon;

    return (
        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${c.color}`}>
            <Icon size={12} /> {c.label}
        </span>
    );
};

const DrillCard = ({ drill, onSave, onDelete, isSessionActive }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        measurement: drill.measurement || '',
        unit: drill.unit || 'kg',
        repetition: drill.repetition || '',
        measurementUnit: drill.measurementUnit || 'Weight' // Context (Weight/Time/Distance)
    });

    // Reset form if drill prop updates (e.g. after save)
    useEffect(() => {
        setFormData({
            measurement: drill.measurement || '',
            unit: drill.unit || 'kg',
            repetition: drill.repetition || '',
            measurementUnit: drill.measurementUnit || 'Weight'
        });
        setIsEditing(false);
    }, [drill]);

    const handleSave = () => {
        onSave({ ...drill, ...formData });
        setIsEditing(false);
    };

    const units = ['kg', 'lb', 'min', 'sec']; // Simplified for typical use

    return (
        <div className={`group bg-white rounded-2xl border transition-all duration-300 ${isEditing ? 'border-blue-300 shadow-md ring-4 ring-blue-50/50' : 'border-gray-100 shadow-sm hover:border-blue-100'}`}>
            <div className="p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                {/* Visual / Info */}
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-gray-400 uppercase">{drill.muscle?.name || 'Muscle'}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span className="text-xs font-bold text-gray-400 uppercase">{drill.exercise?.bodyPart?.name || 'Body'}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">{drill.exercise?.name || 'Exercise'}</h3>
                    {!isEditing && (
                        <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1 text-sm font-semibold text-gray-700 bg-gray-50 px-2 py-1 rounded-lg">
                                {/* Auto-detect icon based on unit/context usually, default to Dumbbell */}
                                <Dumbbell size={14} className="text-blue-500" />
                                {drill.measurement || '-'} {drill.unit}
                            </div>
                            <div className="flex items-center gap-1 text-sm font-semibold text-gray-700 bg-gray-50 px-2 py-1 rounded-lg">
                                <span className="text-xs text-gray-400">x</span>
                                {drill.repetition || '-'} Reps
                            </div>
                        </div>
                    )}
                </div>

                {/* Edit Controls */}
                {isEditing ? (
                    <div className="flex-1 w-full sm:w-auto grid grid-cols-2 gap-3 animate-in fade-in zoom-in-95 duration-200">
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Load / Time</label>
                            <div className="flex">
                                <input
                                    type="number"
                                    value={formData.measurement}
                                    onChange={e => setFormData({ ...formData, measurement: e.target.value })}
                                    className="w-full rounded-l-lg border-gray-200 text-sm focus:border-blue-500 focus:ring-blue-500 py-1.5"
                                    placeholder="0"
                                />
                                <select
                                    value={formData.unit}
                                    onChange={e => setFormData({ ...formData, unit: e.target.value })}
                                    className="border-l-0 rounded-r-lg border-gray-200 bg-gray-50 text-xs font-medium focus:border-blue-500 focus:ring-blue-500 py-1.5 px-1"
                                >
                                    {units.map(u => <option key={u} value={u}>{u}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Reps</label>
                            <input
                                type="number"
                                value={formData.repetition}
                                onChange={e => setFormData({ ...formData, repetition: e.target.value })}
                                className="w-full rounded-lg border-gray-200 text-sm focus:border-blue-500 focus:ring-blue-500 py-1.5"
                                placeholder="0"
                            />
                        </div>
                    </div>
                ) : null}

                {/* Buttons */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end sm:border-l sm:border-gray-100 sm:pl-4">
                    {isEditing ? (
                        <>
                            <button onClick={handleSave} className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-sm transition-all">
                                <Check size={18} />
                            </button>
                            <button onClick={() => setIsEditing(false)} className="p-2 bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200 transition-all">
                                <X size={18} />
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setIsEditing(true)}
                                disabled={!isSessionActive}
                                className={`p-2 rounded-xl transition-all flex items-center gap-2 text-sm font-semibold
                                    ${isSessionActive
                                        ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                                        : 'bg-gray-50 text-gray-400 cursor-not-allowed opacity-50'}`}
                            >
                                <Pen size={16} /> <span className="hidden sm:inline">Log</span>
                            </button>
                            <button
                                onClick={() => onDelete(drill)}
                                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const CompletionModal = ({ isOpen, onClose, onComplete }) => {
    const [stats, setStats] = useState({ duration: '', calories: '' });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                <div className="bg-blue-600 p-6 text-white text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-md">
                        <Flag size={32} />
                    </div>
                    <h2 className="text-xl font-bold">Session Complete!</h2>
                    <p className="text-blue-100 text-sm">Great job crushing your workout.</p>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Duration (Mins)</label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-2.5 text-gray-400" size={16} />
                            <input
                                type="number"
                                value={stats.duration}
                                onChange={e => setStats({ ...stats, duration: e.target.value })}
                                className="w-full pl-10 rounded-xl border-gray-200 text-gray-700 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="45"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Calories Burned (Approx)</label>
                        <div className="relative">
                            <Flame className="absolute left-3 top-2.5 text-gray-400" size={16} />
                            <input
                                type="number"
                                value={stats.calories}
                                onChange={e => setStats({ ...stats, calories: e.target.value })}
                                className="w-full pl-10 rounded-xl border-gray-200 text-gray-700 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="300"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 text-sm font-bold text-gray-500 hover:bg-gray-200 rounded-xl transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={() => onComplete(stats)}
                        className="flex-1 py-3 text-sm font-bold bg-green-600 text-white rounded-xl shadow-lg shadow-green-200 hover:bg-green-700 transition-all"
                    >
                        Finish & Save
                    </button>
                </div>
            </div>
        </div>
    );
}

// --- Main Page ---

const RoutineLogger = ({ initialData }) => {
    const router = useRouter();
    const [routine, setRoutine] = useState(initialData);
    const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);

    // Status Logic
    const status = (routine?.status || 'not_started').toLowerCase();
    const isActive = status === 'in_progress';
    const isCompleted = status === 'completed';

    // Actions
    const handleStatusUpdate = async (newStatus, extraData = {}) => {
        const payload = {
            refId: routine.refId,
            status: newStatus,
            ...extraData
        };
        try {
            await updateData(`${API_FITMATE_BASE_URL}/routines/routine`, payload);
            alert(`Routine updated to ${newStatus}`); // Simple feedback (can be toast)
            // Ideally we refresh data or update local state
            setRoutine(prev => ({ ...prev, status: newStatus, ...extraData }));
        } catch (e) {
            console.error(e);
            alert("Update failed");
        }
    };

    const handleStart = () => handleStatusUpdate('IN_PROGRESS');

    const handleFinish = (stats) => {
        handleStatusUpdate('COMPLETED', {
            durationInMinutes: stats.duration,
            burntCalories: stats.calories
        });
        setIsCompleteModalOpen(false);
        router.push('/fitmate/routine/routine'); // Go back to list on finish
    };

    const handleDrillSave = async (updatedDrill) => {
        try {
            // Optimistic update
            const oldDrills = [...routine.drills];
            const newDrills = oldDrills.map(d => d.refId === updatedDrill.refId ? updatedDrill : d);
            setRoutine({ ...routine, drills: newDrills });

            await updateData(`${API_FITMATE_BASE_URL}/drills/drill`, updatedDrill);
        } catch (e) {
            console.error(e);
            alert("Failed to save drill");
        }
    };

    const handleDrillDelete = async (drill) => {
        if (!confirm("Remove this exercise from routine?")) return;
        try {
            // Assuming delete drill endpoint or similar logic
            // Ideally we need an endpoint for deleting drill
            // For now just removing from UI to mock
            const newDrills = routine.drills.filter(d => d.refId !== drill.refId);
            setRoutine({ ...routine, drills: newDrills });
            alert("Deleted (Mock)"); // Replace with actual API call if available
        } catch (e) { console.error(e); }
    };


    if (!routine) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 pb-32">
            {/* Top Link */}
            <Link href="/fitmate/routine/routine" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors">
                <ArrowLeft size={18} /> Back to My Routines
            </Link>

            {/* Header Card */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <StatusBadge status={routine.status} />
                        <span className="text-gray-300">|</span>
                        <span className="text-sm font-medium text-gray-500 flex items-center gap-1">
                            <Dumbbell size={14} /> {routine.training?.name}
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                        {routine.description || routine.training?.name || "Workout Session"}
                    </h1>
                    <p className="text-sm text-gray-400 mt-2 flex items-center gap-2">
                        <Calendar size={14} /> {new Date(routine.workoutDate).toLocaleDateString()}
                    </p>
                </div>

                {/* Main Action Button */}
                <div className="flex-shrink-0">
                    {!isActive && !isCompleted && (
                        <button
                            onClick={handleStart}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 transition-transform hover:scale-105 active:scale-95"
                        >
                            <Play className="fill-current" size={20} /> Start Session
                        </button>
                    )}
                    {isActive && (
                        <button
                            onClick={() => setIsCompleteModalOpen(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl shadow-lg shadow-green-200 transition-transform hover:scale-105 active:scale-95 animate-pulse"
                        >
                            <Flag className="fill-current" size={20} /> Finish Workout
                        </button>
                    )}
                    {isCompleted && (
                        <div className="text-right">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Session Stats</p>
                            <div className="flex gap-4">
                                <div><span className="text-lg font-bold text-gray-800">{routine.durationInMinutes || 0}</span> <span className="text-xs text-gray-500">mins</span></div>
                                <div><span className="text-lg font-bold text-gray-800">{routine.burntCalories || 0}</span> <span className="text-xs text-gray-500">cal</span></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Drills Section */}
            <div>
                {!isActive && !isCompleted && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex gap-3 text-blue-800 text-sm">
                        <AlertCircle className="shrink-0" size={20} />
                        <p>Click &quot;Start Session&quot; above to begin logging your sets.</p>
                    </div>
                )}

                <div className="space-y-4">
                    {routine.drills?.length > 0 ? (
                        routine.drills.map((drill, i) => (
                            <DrillCard
                                key={i}
                                drill={drill}
                                onSave={handleDrillSave}
                                onDelete={handleDrillDelete}
                                isSessionActive={isActive}
                            />
                        ))
                    ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                            <Dumbbell className="mx-auto text-gray-300 mb-2" size={32} />
                            <p className="text-gray-500">No exercises in this routine.</p>
                        </div>
                    )}
                </div>
            </div>

            <CompletionModal
                isOpen={isCompleteModalOpen}
                onClose={() => setIsCompleteModalOpen(false)}
                onComplete={handleFinish}
            />
        </div>
    );
};

const RoutineDetail = () => {
    const router = useRouter();
    const { routineId } = router.query;
    const [routine, setRoutine] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (routineId) {
            setLoading(true);
            fetchWithAuth(`${API_FITMATE_BASE_URL}/routines/routine/${routineId}`)
                .then(res => res.json())
                .then(data => {
                    setRoutine(data.data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error('Failed to fetch routine:', err);
                    setLoading(false);
                });
        }
    }, [routineId]);

    if (loading) return <div className="p-10 text-center font-bold text-gray-400 animate-pulse">Loading Routine...</div>;
    if (!routine) return <div className="p-10 text-center text-red-500 font-bold">Routine not found.</div>;

    return <Layout content={<RoutineLogger initialData={routine} />} />;
}

export default RoutineDetail;