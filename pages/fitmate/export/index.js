import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/context/AuthContext';
import fitmateService from '@/services/fitmate.service';
import {
    Download,
    Dumbbell,
    ClipboardList,
    Activity,
    UtensilsCrossed,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Sparkles,
    FileDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const todayIso = () => new Date().toISOString().split('T')[0];
const monthsAgo = (n) => {
    const d = new Date();
    d.setMonth(d.getMonth() - n);
    return d.toISOString().split('T')[0];
};

const triggerDownload = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

const TABS = [
    {
        id: 'drills',
        label: 'Drill Logs',
        icon: Dumbbell,
        badge: 'ML Primary',
        badgeColor: 'bg-indigo-600 text-white',
    },
    {
        id: 'routines',
        label: 'Routines',
        icon: ClipboardList,
        badge: 'Sessions',
        badgeColor: 'bg-violet-100 text-violet-700',
    },
    {
        id: 'exercises',
        label: 'Exercises',
        icon: Activity,
        badge: 'Reference',
        badgeColor: 'bg-emerald-100 text-emerald-700',
    },
    {
        id: 'nutrition',
        label: 'Nutrition',
        icon: UtensilsCrossed,
        badge: 'Diet',
        badgeColor: 'bg-amber-100 text-amber-700',
    },
];

const EXPORT_CONFIG = {
    drills: {
        description: 'One row per exercise set — the richest dataset for AI/ML models. Contains full session context alongside per-drill performance metrics.',
        columnGroups: [
            {
                label: 'Session Context',
                color: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
                cols: ['Username', 'RoutineRefID', 'WorkoutDate', 'RoutineStatus', 'TrainingName', 'RoutineBurntCalories', 'RoutineDurationInMinutes'],
            },
            {
                label: 'Exercise Features',
                color: 'bg-violet-50 text-violet-700 border border-violet-100',
                cols: ['ExerciseName', 'ExerciseUnit', 'ExerciseDifficultyLevel', 'ExerciseRiskLevel', 'TargetBodyPart', 'TargetMuscles'],
            },
            {
                label: 'Drill Performance',
                color: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
                cols: ['DrillRefID', 'DrillMeasurementUnit', 'DrillMeasurement', 'DrillUnit', 'DrillRepetition', 'DrillBurntCalories', 'DrillNotes'],
            },
        ],
        tips: [
            { bold: 'TargetMuscles + DifficultyLevel', rest: ' — use as input features for load-progression models.' },
            { bold: 'RoutineStatus = COMPLETED', rest: ' — filter to this to remove unfinished sessions from training data.' },
            { bold: 'DrillBurntCalories', rest: ' — strong regression target for energy expenditure prediction.' },
            { bold: 'Join with Exercises export', rest: ' on ExerciseName to attach description embeddings.' },
        ],
    },
    routines: {
        description: 'One row per workout session — session-level summaries for consistency and volume analysis.',
        columnGroups: [
            {
                label: 'Session Info',
                color: 'bg-violet-50 text-violet-700 border border-violet-100',
                cols: ['Username', 'RefID', 'WorkoutDate', 'Status', 'TrainingType'],
            },
            {
                label: 'Output Metrics',
                color: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
                cols: ['BurntCalories', 'DurationMinutes'],
            },
        ],
        tips: [
            { bold: 'status = COMPLETED', rest: ' — recommended filter for building a clean ML training set.' },
            { bold: 'BurntCalories / DurationMinutes', rest: ' — key output metrics for efficiency and volume analysis.' },
            { bold: 'TrainingType', rest: ' — strong categorical feature for clustering workout patterns.' },
            { bold: 'Join with Drills export', rest: ' on RefID to drill down into individual exercise performance.' },
        ],
    },
    exercises: {
        description: 'Reference catalog of all exercises with ML features — join this onto your drill logs for full feature context.',
        columnGroups: [
            {
                label: 'Identity',
                color: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
                cols: ['RefID', 'Name', 'Description', 'Unit', 'Status'],
            },
            {
                label: 'Classification',
                color: 'bg-teal-50 text-teal-700 border border-teal-100',
                cols: ['TrainingType', 'BodyPart', 'TargetMuscles', 'Equipments'],
            },
            {
                label: 'ML Features',
                color: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
                cols: ['DifficultyLevel', 'RiskLevel'],
            },
        ],
        tips: [
            { bold: 'DifficultyLevel / RiskLevel', rest: ' — pre-encoded as LOW / MEDIUM / HIGH, ready for label encoding.' },
            { bold: 'TargetMuscles', rest: ' — pipe-delimited (|), split and one-hot encode for multi-label classification.' },
            { bold: 'Description', rest: ' — feed into an LLM to generate semantic exercise embeddings.' },
            { bold: 'Leave filters blank', rest: ' to export the full catalog as a static feature table.' },
        ],
    },
    nutrition: {
        description: 'Daily food entries — align on date with drill logs to correlate fuelling with workout performance.',
        columnGroups: [
            {
                label: 'Entry Info',
                color: 'bg-amber-50 text-amber-700 border border-amber-100',
                cols: ['Username', 'RefID', 'EntryDate', 'EntryTime', 'MealType', 'FoodName', 'ServingQty', 'ServingUnit'],
            },
            {
                label: 'Macros',
                color: 'bg-orange-50 text-orange-700 border border-orange-100',
                cols: ['Calories', 'Protein', 'Carbs', 'Fat', 'Fiber', 'Sugar', 'Sodium'],
            },
            {
                label: 'Metadata',
                color: 'bg-slate-50 text-slate-600 border border-slate-100',
                cols: ['SourceType', 'Notes'],
            },
        ],
        tips: [
            { bold: 'Align on EntryDate', rest: ' with workout logs to study how nutrition affects performance.' },
            { bold: 'Daily Protein / Carbs', rest: ' — aggregate per day and use as recovery/fuelling features.' },
            { bold: 'Calorie deficit/surplus', rest: ' — derived metric; key feature for body composition models.' },
            { bold: 'MealType = DINNER', rest: ' — isolate pre-sleep meals to study recovery patterns.' },
        ],
    },
};

const InputLabel = ({ children }) => (
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{children}</p>
);

const inputClass = "w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-white transition-all";

const ExportPage = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('drills');
    const [fromDate, setFromDate] = useState(monthsAgo(3));
    const [toDate, setToDate] = useState(todayIso());
    const [status, setStatus] = useState('');
    const [mealType, setMealType] = useState('');
    const [trainingRefId, setTrainingRefId] = useState('');
    const [bodyPartRefId, setBodyPartRefId] = useState('');
    const [loading, setLoading] = useState(false);
    const [downloadState, setDownloadState] = useState(null); // null | 'success' | 'error'
    const [errorMsg, setErrorMsg] = useState('');

    const cfg = EXPORT_CONFIG[activeTab];
    const username = user?.username || '';

    const handleDownload = async () => {
        setLoading(true);
        setDownloadState(null);
        setErrorMsg('');
        try {
            let blob;
            let filename;

            if (activeTab === 'drills') {
                blob = await fitmateService.exportDrills(username, fromDate, toDate);
                filename = `drills_${username}_${fromDate}_to_${toDate}.csv`;
            } else if (activeTab === 'routines') {
                blob = await fitmateService.exportRoutines(username, fromDate, toDate, status || undefined);
                filename = `routines_${username}_${fromDate}_to_${toDate}.csv`;
            } else if (activeTab === 'exercises') {
                blob = await fitmateService.exportExercises(trainingRefId || undefined, bodyPartRefId || undefined);
                filename = `exercises_${todayIso()}.csv`;
            } else {
                blob = await fitmateService.exportNutrition(username, fromDate, toDate, mealType || undefined);
                filename = `nutrition_${username}_${fromDate}_to_${toDate}.csv`;
            }

            triggerDownload(blob, filename);
            setDownloadState('success');
        } catch (e) {
            setDownloadState('error');
            setErrorMsg(e?.response?.data?.message || e?.message || 'Export failed. Check your filters and try again.');
        } finally {
            setLoading(false);
        }
    };

    const needsUserAndDates = activeTab !== 'exercises';

    return (
        <Layout content={
            <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">

                {/* Header */}
                <div className="flex flex-col gap-2 border-b border-slate-100 pb-8">
                    <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm uppercase tracking-wider">
                        <FileDown size={18} />
                        <span>Fitmate · Data Export</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Export Your Data</h1>
                    <p className="text-slate-500 font-medium text-lg max-w-2xl">
                        Download your fitness data as CSV for AI, ML, and LLM-based progress analysis.
                        All exports are structured for direct use with pandas, Excel, or any data pipeline.
                    </p>
                </div>

                {/* Tab Bar */}
                <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200 w-fit">
                    {TABS.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id); setDownloadState(null); }}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${isActive ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <Icon size={15} />
                                {tab.label}
                                {isActive && (
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${tab.badgeColor}`}>
                                        {tab.badge}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                        className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start"
                    >
                        {/* LEFT: Filters + Download */}
                        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                            <div>
                                <h2 className="text-lg font-black text-slate-800">Filters</h2>
                                <p className="text-sm text-slate-400 font-medium mt-1 leading-relaxed">{cfg.description}</p>
                            </div>

                            <div className="space-y-4">

                                {/* Username (auto) */}
                                {needsUserAndDates && (
                                    <div>
                                        <InputLabel>Username</InputLabel>
                                        <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                                            <span className="text-sm font-black text-slate-700 flex-1">{username || '—'}</span>
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider bg-slate-200 px-1.5 py-0.5 rounded">Auto</span>
                                        </div>
                                    </div>
                                )}

                                {/* Date range */}
                                {needsUserAndDates && (
                                    <div>
                                        <InputLabel>Date Range</InputLabel>
                                        <div className="grid grid-cols-2 gap-2">
                                            <input
                                                type="date"
                                                value={fromDate}
                                                onChange={e => setFromDate(e.target.value)}
                                                className={inputClass}
                                            />
                                            <input
                                                type="date"
                                                value={toDate}
                                                onChange={e => setToDate(e.target.value)}
                                                className={inputClass}
                                            />
                                        </div>
                                        <p className="text-[11px] text-slate-400 font-medium mt-1.5">Defaults to last 3 months.</p>
                                    </div>
                                )}

                                {/* Status (routines only) */}
                                {activeTab === 'routines' && (
                                    <div>
                                        <InputLabel>Status <span className="normal-case font-medium text-slate-300">(optional)</span></InputLabel>
                                        <select value={status} onChange={e => setStatus(e.target.value)} className={inputClass}>
                                            <option value="">All Statuses</option>
                                            <option value="COMPLETED">Completed</option>
                                            <option value="IN_PROGRESS">In Progress</option>
                                            <option value="NOT_STARTED">Not Started</option>
                                            <option value="DISCARD">Discarded</option>
                                        </select>
                                        <p className="text-[11px] text-slate-400 font-medium mt-1.5">Filter to Completed for clean ML data.</p>
                                    </div>
                                )}

                                {/* Meal type (nutrition only) */}
                                {activeTab === 'nutrition' && (
                                    <div>
                                        <InputLabel>Meal Type <span className="normal-case font-medium text-slate-300">(optional)</span></InputLabel>
                                        <select value={mealType} onChange={e => setMealType(e.target.value)} className={inputClass}>
                                            <option value="">All Meals</option>
                                            <option value="BREAKFAST">Breakfast</option>
                                            <option value="LUNCH">Lunch</option>
                                            <option value="DINNER">Dinner</option>
                                            <option value="SNACK">Snack</option>
                                            <option value="OTHER">Other</option>
                                        </select>
                                    </div>
                                )}

                                {/* Training / Body Part (exercises only) */}
                                {activeTab === 'exercises' && (
                                    <>
                                        <div>
                                            <InputLabel>Training Ref ID <span className="normal-case font-medium text-slate-300">(optional)</span></InputLabel>
                                            <input
                                                type="text"
                                                value={trainingRefId}
                                                onChange={e => setTrainingRefId(e.target.value)}
                                                placeholder="e.g. 1001"
                                                className={inputClass}
                                            />
                                        </div>
                                        <div>
                                            <InputLabel>Body Part Ref ID <span className="normal-case font-medium text-slate-300">(optional)</span></InputLabel>
                                            <input
                                                type="text"
                                                value={bodyPartRefId}
                                                onChange={e => setBodyPartRefId(e.target.value)}
                                                placeholder="e.g. 2001"
                                                className={inputClass}
                                            />
                                            <p className="text-[11px] text-slate-400 font-medium mt-1.5">Leave blank to export the full exercise catalog.</p>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Feedback */}
                            {downloadState === 'success' && (
                                <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm font-bold text-emerald-700">
                                    <CheckCircle2 size={16} className="shrink-0" />
                                    Download started successfully!
                                </div>
                            )}
                            {downloadState === 'error' && (
                                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm font-bold text-red-700">
                                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                    <span>{errorMsg}</span>
                                </div>
                            )}

                            {/* Download Button */}
                            <button
                                onClick={handleDownload}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-black text-sm shadow-lg shadow-indigo-100 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Generating CSV...
                                    </>
                                ) : (
                                    <>
                                        <Download size={18} />
                                        Download CSV
                                    </>
                                )}
                            </button>
                        </div>

                        {/* RIGHT: Column preview + ML tips */}
                        <div className="lg:col-span-3 space-y-5">

                            {/* Columns card */}
                            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
                                        <Download size={18} />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-black text-slate-800">Export Columns</h2>
                                        <p className="text-sm font-medium text-slate-400">Structured for pandas, Excel, and LLM pipelines</p>
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    {cfg.columnGroups.map((group, gi) => (
                                        <div key={gi}>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">{group.label}</p>
                                            <div className="flex flex-wrap gap-2">
                                                {group.cols.map((col, ci) => (
                                                    <span
                                                        key={ci}
                                                        className={`px-2.5 py-1 text-xs font-black rounded-lg ${group.color}`}
                                                    >
                                                        {col}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* ML tips card */}
                            <div className="bg-gradient-to-br from-indigo-50 via-violet-50 to-slate-50 border border-indigo-100 rounded-3xl p-6 space-y-4">
                                <div className="flex items-center gap-2">
                                    <Sparkles size={16} className="text-indigo-500" />
                                    <h3 className="text-xs font-black text-indigo-700 uppercase tracking-wider">AI / ML Usage Tips</h3>
                                </div>
                                <ul className="space-y-3">
                                    {cfg.tips.map((tip, ti) => (
                                        <li key={ti} className="flex items-start gap-2.5 text-sm text-indigo-700 font-semibold">
                                            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                                            <span>
                                                <span className="font-black">{tip.bold}</span>
                                                {tip.rest}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        } />
    );
};

export default ExportPage;
