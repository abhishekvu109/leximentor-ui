
import fitmateService from "../../../../services/fitmate.service";
import Layout from "@/components/layout/Layout";
import { useRouter } from "next/router";
import Link from "next/link";
import {
    Pen, Trash2, Check, X, Play, Flag, Clock, Flame,
    Dumbbell, Calendar, ArrowLeft, Save, AlertCircle, Info, Download, FileSpreadsheet, FileText
} from "lucide-react";
import { useState, useEffect } from "react";
import { exportToExcel, exportToPDF } from "../../../../utils/exportRoutine";

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

const SetRow = ({ drill, index, onSave, onDelete, isSessionActive }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        measurement: drill.measurement || '',
        repetition: drill.repetition || '',
        unit: drill.unit || 'kg'
    });

    useEffect(() => {
        setFormData({
            measurement: drill.measurement || '',
            repetition: drill.repetition || '',
            unit: drill.unit || 'kg'
        });
        setIsEditing(false);
    }, [drill]);

    const handleSave = () => {
        onSave({ ...drill, ...formData });
        setIsEditing(false);
    };

    return (
        <div className={`grid grid-cols-12 gap-3 px-6 py-3 items-center border-b border-gray-50 last:border-none transition-colors ${isEditing ? 'bg-blue-50/30' : 'hover:bg-gray-50/50'}`}>
            <div className="col-span-1 text-xs font-black text-gray-300">#{index + 1}</div>

            <div className="col-span-4 flex items-center gap-2">
                {isEditing ? (
                    <div className="flex w-full">
                        <input
                            type="number"
                            value={formData.measurement}
                            onChange={e => setFormData({ ...formData, measurement: e.target.value })}
                            className="w-full rounded-l-lg border-gray-200 text-sm focus:border-blue-500 focus:ring-0 py-1"
                            placeholder="0"
                        />
                        <select
                            value={formData.unit}
                            onChange={e => setFormData({ ...formData, unit: e.target.value })}
                            className="border-l-0 rounded-r-lg border-gray-200 bg-gray-50 text-[10px] font-bold focus:ring-0 py-1 px-1 uppercase"
                        >
                            {['kg', 'lb', 'min', 'sec'].map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                    </div>
                ) : (
                    <span className="text-sm font-bold text-gray-700">{drill.measurement || '-'} <span className="text-[10px] text-gray-400 uppercase">{drill.unit}</span></span>
                )}
            </div>

            <div className="col-span-3">
                {isEditing ? (
                    <input
                        type="number"
                        value={formData.repetition}
                        onChange={e => setFormData({ ...formData, repetition: e.target.value })}
                        className="w-full rounded-lg border-gray-200 text-sm focus:border-blue-500 focus:ring-0 py-1"
                        placeholder="0"
                    />
                ) : (
                    <span className="text-sm font-bold text-gray-700">{drill.repetition || '-'} <span className="text-[10px] text-gray-400 uppercase">Reps</span></span>
                )}
            </div>

            <div className="col-span-4 flex justify-end gap-2">
                {isEditing ? (
                    <>
                        <button onClick={handleSave} className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-all">
                            <Check size={14} />
                        </button>
                        <button onClick={() => setIsEditing(false)} className="p-1.5 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 transition-all">
                            <X size={14} />
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={() => setIsEditing(true)}
                            disabled={!isSessionActive}
                            className={`p-1.5 rounded-lg transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-wider
                                ${isSessionActive
                                    ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                    : 'bg-gray-50 text-gray-300 cursor-not-allowed'}`}
                        >
                            <Pen size={12} /> Log
                        </button>
                        <button
                            onClick={() => onDelete(drill)}
                            className="p-1.5 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <Trash2 size={12} />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

const ExerciseGroupCard = ({ exerciseId, exerciseName, bodyPart, muscle, drills, onSave, onDelete, isSessionActive }) => {
    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
            {/* Group Header */}
            <div className="p-6 pb-4 bg-gradient-to-r from-gray-50 to-white flex justify-between items-start border-b border-gray-50">
                <div>
                    <div className="flex flex-wrap gap-2 mb-2">
                        <span className="text-[10px] font-black px-2 py-0.5 bg-blue-100 text-blue-600 rounded-lg uppercase tracking-widest">{muscle || 'General'}</span>
                        <span className="text-[10px] font-black px-2 py-0.5 bg-slate-100 text-slate-500 rounded-lg uppercase tracking-widest">{bodyPart || 'Target'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <h3 className="text-xl font-black text-gray-800 tracking-tight">{exerciseName}</h3>
                        {exerciseId && (
                            <Link href={`/fitmate/exercise/view/${exerciseId}`}>
                                <button className="p-1 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors group/info flex items-center gap-1.5">
                                    <Info size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-0 group-hover/info:opacity-100 transition-opacity">Learn More</span>
                                </button>
                            </Link>
                        )}
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Sets</span>
                    <p className="text-2xl font-black text-blue-600 leading-none">{drills.length}</p>
                </div>
            </div>

            {/* Sets Table Header */}
            <div className="grid grid-cols-12 gap-3 px-6 py-2 bg-gray-50/50 border-b border-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <div className="col-span-1">No</div>
                <div className="col-span-4">Weight / Time</div>
                <div className="col-span-3">Reps</div>
                <div className="col-span-4 text-right pr-4">Actions</div>
            </div>

            {/* Sets List */}
            <div className="divide-y divide-gray-50">
                {drills.map((drill, idx) => (
                    <SetRow
                        key={drill.refId}
                        drill={drill}
                        index={idx}
                        onSave={onSave}
                        onDelete={onDelete}
                        isSessionActive={isSessionActive}
                    />
                ))}
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
    const [showExportMenu, setShowExportMenu] = useState(false);

    // Status Logic
    const status = (routine?.status || 'not_started').toLowerCase();
    const isActive = status === 'in_progress';
    const isCompleted = status === 'completed';

    // Close export menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showExportMenu && !event.target.closest('.export-menu-container')) {
                setShowExportMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showExportMenu]);


    // Actions
    const handleStatusUpdate = async (newStatus, extraData = {}) => {
        const payload = {
            refId: routine.refId,
            status: newStatus,
            ...extraData
        };
        try {
            await fitmateService.updateRoutine(payload);
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

            await fitmateService.updateDrill(updatedDrill);
        } catch (e) {
            console.error(e);
            alert("Failed to save drill");
        }
    };

    const handleDrillDelete = async (drill) => {
        if (!confirm("Remove this exercise from routine?")) return;
        try {
            await fitmateService.deleteDrill(drill.refId);
            // Refresh routine data after successful deletion
            const updatedRoutine = await fitmateService.getRoutine(routineId);
            if (updatedRoutine?.data) {
                setRoutine(updatedRoutine.data);
            }
            alert("Exercise removed successfully!");
        } catch (e) {
            console.error("Failed to delete drill:", e);
            alert("Failed to remove exercise. Please try again.");
        }
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

                {/* Main Action Buttons */}
                <div className="flex-shrink-0 flex gap-3">
                    {/* Export Menu */}
                    <div className="relative export-menu-container">
                        <button
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-all"
                        >
                            <Download size={18} /> Export
                        </button>
                        {showExportMenu && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                <button
                                    onClick={() => {
                                        exportToExcel(routine);
                                        setShowExportMenu(false);
                                    }}
                                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                >
                                    <FileSpreadsheet size={18} className="text-green-600" />
                                    <div>
                                        <p className="text-sm font-bold text-gray-800">Export as Excel</p>
                                        <p className="text-xs text-gray-500">Spreadsheet format</p>
                                    </div>
                                </button>
                                <button
                                    onClick={() => {
                                        exportToPDF(routine);
                                        setShowExportMenu(false);
                                    }}
                                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                >
                                    <FileText size={18} className="text-red-600" />
                                    <div>
                                        <p className="text-sm font-bold text-gray-800">Export as PDF</p>
                                        <p className="text-xs text-gray-500">Fillable workout sheet</p>
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Session Control Buttons */}
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

                <div className="space-y-6">
                    {routine.drills?.length > 0 ? (
                        (() => {
                            // Group drills by exercise
                            const groups = {};
                            routine.drills.forEach(drill => {
                                const id = drill.exercise?.refId || 'unknown';
                                if (!groups[id]) {
                                    groups[id] = {
                                        exerciseId: id,
                                        exerciseName: drill.exercise?.name,
                                        bodyPart: drill.exercise?.bodyPart?.name,
                                        muscle: drill.muscle?.name || drill.exercise?.targetMuscles?.[0]?.name,
                                        drills: []
                                    };
                                }
                                groups[id].drills.push(drill);
                            });

                            return Object.values(groups).map((group, i) => (
                                <ExerciseGroupCard
                                    key={i}
                                    exerciseId={group.exerciseId}
                                    exerciseName={group.exerciseName}
                                    bodyPart={group.bodyPart}
                                    muscle={group.muscle}
                                    drills={group.drills}
                                    onSave={handleDrillSave}
                                    onDelete={handleDrillDelete}
                                    isSessionActive={isActive}
                                />
                            ));
                        })()
                    ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                            <Dumbbell className="mx-auto text-gray-300 mb-2" size={32} />
                            <p className="text-gray-500 font-bold">No exercises in this routine.</p>
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
            fitmateService.getRoutine(routineId)
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