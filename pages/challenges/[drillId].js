
import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { API_LEXIMENTOR_BASE_URL } from "@/constants";
import { deleteData, fetchData, postData, fetchWithAuth } from "@/dataService";
import Layout from "@/components/layout/Layout";
import { motion } from "framer-motion";
import {
    Play, Trash2, CheckCircle, AlertCircle, BarChart2,
    Plus, RefreshCw, BookOpen, Mic, Brain, Hash, Type,
    Layers, Zap, FileText, LayoutGrid, List, Sparkles
} from "lucide-react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';

const DRILL_TYPES = [
    { id: 'MEANING', label: 'Meaning', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50', shadow: 'hover:shadow-blue-200/50' },
    { id: 'POS', label: 'Identify POS', icon: Hash, color: 'text-purple-600', bg: 'bg-purple-50', shadow: 'hover:shadow-purple-200/50' },
    { id: 'WS', label: 'Word Scramble', icon: Type, color: 'text-green-600', bg: 'bg-green-50', shadow: 'hover:shadow-green-200/50' },
    { id: 'IDENTIFY', label: 'Pronunciation', icon: Mic, color: 'text-yellow-600', bg: 'bg-yellow-50', shadow: 'hover:shadow-yellow-200/50' },
    { id: 'GUESS', label: 'Guess Word', icon: Brain, color: 'text-pink-600', bg: 'bg-pink-50', shadow: 'hover:shadow-pink-200/50' },
    { id: 'MW', label: 'Match Word', icon: CheckCircle, color: 'text-indigo-600', bg: 'bg-indigo-50', shadow: 'hover:shadow-indigo-200/50' },
    { id: 'FB', label: 'Flashcard Blitz', icon: Layers, color: 'text-teal-600', bg: 'bg-teal-50', shadow: 'hover:shadow-teal-200/50' },
    { id: 'ST', label: 'Speed Typer', icon: Zap, color: 'text-orange-600', bg: 'bg-orange-50', shadow: 'hover:shadow-orange-200/50' },
    { id: 'CM', label: 'Context Master', icon: FileText, color: 'text-cyan-600', bg: 'bg-cyan-50', shadow: 'hover:shadow-cyan-200/50' },
];

const getDrillConfig = (typeId) => {
    // Map longer backend IDs to standard config IDs
    const mapping = {
        'LEARN_MEANING': 'MEANING',
        'LEARN_POS': 'POS',
        'WORD_SCRAMBLE': 'WS',
        'SCRAMBLE': 'WS',
        'IDENTIFY_WORD': 'IDENTIFY',
        'GUESS_WORD': 'GUESS',
        'MATCH_WORD': 'MW',
        'FLASHCARD_BLITZ': 'FB',
        'FLASHCARD': 'FB',
        'SPEED_TYPER': 'ST',
        'SPEED': 'ST',
        'CONTEXT_MASTER': 'CM',
        'CONTEXT': 'CM'
    };
    const standardId = mapping[typeId] || typeId;
    return DRILL_TYPES.find(t => t.id === standardId);
};

const formatLabel = (str) => {
    if (!str) return "";
    return str.replace(/_/g, ' ')
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

const ChallengeCard = ({ challenge, drillRefId, onDelete, onTry, onEvaluate, onViewReport }) => {
    const isPassed = challenge.drillScore > 70;
    const isCompleted = challenge.status === 'Completed';
    const isEvaluated = challenge.evaluationStatus === 'Evaluated';

    const typeConfig = getDrillConfig(challenge.drillType) || {
        label: formatLabel(challenge.drillType),
        color: 'bg-gray-100 text-gray-600',
        icon: BookOpen
    };
    const Icon = typeConfig.icon;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5 flex flex-col h-full group relative">
            <div className="flex justify-between items-start mb-4">
                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-2 ${typeConfig.color}`}>
                    <Icon size={12} />
                    {typeConfig.label}
                </div>
                {isCompleted && (
                    <div className={`flex flex-col items-end`}>
                        <span className={`text-2xl font-bold ${isPassed ? 'text-green-600' : 'text-red-500'}`}>
                            {challenge.drillScore}%
                        </span>
                        <span className="text-[10px] uppercase font-bold text-gray-400">Score</span>
                    </div>
                )}
            </div>

            <div className="flex-1 mb-4">
                <div className="text-xs text-gray-400 mb-1 font-mono">{challenge.refId}</div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900">{challenge.totalCorrect || 0}</span>
                        <span className="text-xs text-gray-400">Correct</span>
                    </div>
                    <div className="w-px h-8 bg-gray-100"></div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900">{challenge.totalWrong || 0}</span>
                        <span className="text-xs text-gray-400">Wrong</span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-gray-100 flex items-center gap-2">
                {!isCompleted ? (
                    <Link href={onTry(challenge.drillType, challenge.refId)} className="flex-1">
                        <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                            <Play size={16} /> Start
                        </button>
                    </Link>
                ) : !isEvaluated ? (
                    <button
                        onClick={() => onEvaluate(challenge)}
                        className="flex-1 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                        <BarChart2 size={16} /> Evaluate
                    </button>
                ) : (
                    <Link
                        href={`/evaluation_report/${challenge.drillType === 'CM' ? 'context-master' : 'meaning_report'}/${challenge.refId}`}
                        className="flex-1"
                    >
                        <button className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                            <BookOpen size={16} /> Report
                        </button>
                    </Link>
                )}

                <button
                    onClick={() => onDelete(challenge.refId)}
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    title="Delete Challenge"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
};

const ChallengeAnalytics = ({ challenges }) => {
    if (!challenges || challenges.length === 0) return null;

    // Aggregations
    const totalChallenges = challenges.length;
    const completedChallenges = challenges.filter(c => c.status === 'Completed');
    const avgScore = completedChallenges.length > 0
        ? (completedChallenges.reduce((acc, c) => acc + (c.drillScore || 0), 0) / completedChallenges.length).toFixed(1)
        : 0;
    const masteryRate = completedChallenges.length > 0
        ? ((completedChallenges.filter(c => c.drillScore > 70).length / completedChallenges.length) * 100).toFixed(0)
        : 0;

    // Trend Data
    const trendData = [...completedChallenges]
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        .map((c, i) => ({
            name: `Day ${i + 1}`,
            score: c.drillScore,
            date: new Date(c.createdAt).toLocaleDateString()
        }));

    // Type Data
    const typeMap = challenges.reduce((acc, c) => {
        const type = DRILL_TYPES.find(t => t.id === c.drillType)?.label || c.drillType;
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {});
    const typeData = Object.entries(typeMap).map(([name, value]) => ({ name, value }));
    const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];

    // Trouble Areas (Mocked for now as we don't have per-word aggregate API yet, 
    // but we can show which types have lowest scores)
    const typePerformance = completedChallenges.reduce((acc, c) => {
        const type = DRILL_TYPES.find(t => t.id === c.drillType)?.label || c.drillType;
        if (!acc[type]) acc[type] = { name: type, total: 0, count: 0 };
        acc[type].total += (c.drillScore || 0);
        acc[type].count += 1;
        return acc;
    }, {});
    const performanceData = Object.values(typePerformance)
        .map(t => ({ name: t.name, score: Math.round(t.total / t.count) }))
        .sort((a, b) => a.score - b.score);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Drills', value: totalChallenges, icon: Layers, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Avg Accuracy', value: `${avgScore}%`, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Mastery Rate', value: `${masteryRate}%`, icon: Sparkles, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: 'Words Tested', value: completedChallenges.reduce((acc, c) => acc + (c.totalCorrect + c.totalWrong || 0), 0), icon: FileText, color: 'text-orange-600', bg: 'bg-orange-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
                            <stat.icon size={24} />
                        </div>
                        <div className="text-2xl font-black text-gray-900">{stat.value}</div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Score Trend */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <BarChart2 size={16} className="text-blue-500" /> Performance Trend
                    </h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" hide />
                                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `${v}%`} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    formatter={(v) => [`${v}%`, 'Score']}
                                />
                                <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={4} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Drill Type Breakdown */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Plus size={16} className="text-purple-500" /> Drill Distribution
                    </h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={typeData}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {typeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Performance by Type */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm lg:col-span-2">
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <AlertCircle size={16} className="text-orange-500" /> Accuracy per Drill Type
                    </h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={performanceData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" domain={[0, 100]} hide />
                                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} width={120} />
                                <Tooltip />
                                <Bar dataKey="score" fill="#8b5cf6" radius={[0, 8, 8, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

const EvaluatorModal = ({ isVisible, onClose, evaluators, onSubmit, challengeId }) => {
    const [selectedEvaluator, setSelectedEvaluator] = useState('');

    if (!isVisible) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(challengeId, selectedEvaluator);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">Submit for Evaluation</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><Trash2 className="hidden" /><span className="text-xl">&times;</span></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Challenge ID</label>
                        <input type="text" value={challengeId} disabled className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Evaluator</label>
                        <select
                            required
                            value={selectedEvaluator}
                            onChange={(e) => setSelectedEvaluator(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Choose...</option>
                            {evaluators?.data?.map((ev, i) => (
                                <option key={i} value={ev.name}>{ev.name}</option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl transition-colors">
                        Evaluate
                    </button>
                </form>
            </div>
        </div>
    );
};

const Challenges = () => {
    const router = useRouter();
    const { drillId } = router.query;

    const [challengeData, setChallengeData] = useState({ data: [] });
    const [drillRefId, setDrillRefId] = useState(drillId);
    const [loading, setLoading] = useState(true);

    // Evaluation State
    const [isEvaluatorVisible, setIsEvaluatorVisible] = useState(false);
    const [challengeEvaluators, setChallengeEvaluators] = useState(null);
    const [activeChallengeId, setActiveChallengeId] = useState(null);

    // Creation State
    const [creatingType, setCreatingType] = useState(null);

    // View State
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'analytics'

    const loadChallenges = useCallback(async (id) => {
        const URL = `${API_LEXIMENTOR_BASE_URL}/drill/metadata/challenges/${id}`;
        try {
            const res = await fetchWithAuth(URL);
            const data = await res.json();
            setChallengeData(data);
        } catch (error) {
            console.error("Failed to load challenges:", error);
        }
    }, []);

    useEffect(() => {
        if (drillId) {
            setDrillRefId(drillId);
            const init = async () => {
                setLoading(true);
                await loadChallenges(drillId);
                setLoading(false);
            };
            init();
        }
    }, [drillId, loadChallenges]);

    useEffect(() => {
        if (typeof window !== "undefined" && window.initFlowbite) {
            window.initFlowbite();
        }
    }, []);

    const handleCreateChallenge = async (type) => {
        setCreatingType(type);
        try {
            const URL = `${API_LEXIMENTOR_BASE_URL}/drill/metadata/challenges/challenge?drillId=${drillRefId}&drillType=${type}`;
            await fetchWithAuth(URL, { method: 'POST' });
            await loadChallenges(drillRefId);
        } catch (error) {
            console.error(error);
            alert("Failed to create challenge");
        } finally {
            setCreatingType(null);
        }
    };

    const handleDelete = async (refId) => {
        if (!confirm("Are you sure you want to delete this challenge?")) return;
        const URL = `${API_LEXIMENTOR_BASE_URL}/drill/metadata/challenges/${refId}`;
        try {
            await fetchWithAuth(URL, { method: 'DELETE' });
            await loadChallenges(drillRefId);
        } catch (error) {
            console.error("Failed to delete challenge:", error);
        }
    };

    const handleOpenEvaluator = async (challengeId) => {
        setActiveChallengeId(challengeId);
        setIsEvaluatorVisible(true);
        const URL = `${API_LEXIMENTOR_BASE_URL}/drill/metadata/challenges/challenge/evaluators?challengeRefId=${challengeId}`;
        try {
            const res = await fetchWithAuth(URL);
            const data = await res.json();
            setChallengeEvaluators(data);
        } catch (error) {
            console.error("Failed to fetch evaluators:", error);
        }
    };

    const handleSubmitEvaluation = async (challengeId, evaluator) => {
        const URL = `${API_LEXIMENTOR_BASE_URL}/drill/metadata/challenges/challenge/${challengeId}/evaluate?challengeId=${challengeId}&evaluator=${evaluator}`;
        try {
            await fetchWithAuth(URL, { method: 'POST' });
            setIsEvaluatorVisible(false);
            setActiveChallengeId(null);
            alert("Evaluation submitted!"); // Replace with toast
            await loadChallenges(drillRefId);
        } catch (error) {
            console.error("Failed to submit evaluation:", error);
        }
    };

    const getDrillLink = (type, refId) => {
        const base = type === 'LEARN_MEANING' ? '/drills/challenges/meaning/' :
            type === 'LEARN_POS' ? '/drills/challenges/pos/' :
                type === 'IDENTIFY_WORD' ? '/drills/challenges/identify_word/' :
                    type === 'GUESS_WORD' ? '/drills/challenges/guess_word/' :
                        type === 'MATCH_WORD' || type === 'MATCH_WORD' ? '/drills/challenges/match_meaning/' :
                            type === 'CONTEXT' || type === 'CONTEXT_MASTER' ? '/drills/challenges/context_master/' :
                                type === 'SPEED' || type === 'SPEED_TYPER' ? '/drills/challenges/speed_typer/' :
                                    type === 'FLASHCARD' || type === 'FLASHCARD_BLITZ' ? '/drills/challenges/flashcard_blitz/' :
                                        type === 'SCRAMBLE' || type === 'WORD_SCRAMBLE' ? '/drills/challenges/word_scramble/' :
                                            '/drills/challenges/meaning/';
        return `${base}${refId}/${drillRefId}`;
    };

    if (loading) return <Layout content={<div className="p-8 text-center text-slate-500 font-bold">Loading Challenges...</div>} />;

    return (
        <Layout content={
            <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-100 pb-6">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                            <Link href="/dashboard/dashboard2" className="hover:text-blue-600">Dashboard</Link>
                            <span>/</span>
                            <span>Drills</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Challenge Manager</h1>
                        <p className="text-gray-500">Create, track, and evaluate your learning drills.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex bg-gray-100 p-1 rounded-xl mr-4">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <List size={14} /> Drills
                            </button>
                            <button
                                onClick={() => setViewMode('analytics')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'analytics' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <BarChart2 size={14} /> Insights
                            </button>
                        </div>
                        <button
                            onClick={loadChallenges}
                            className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
                        >
                            <RefreshCw size={16} /> Refresh
                        </button>
                    </div>
                </div>

                {/* Create Toolbar */}
                <div className="relative group overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-[2rem] blur-2xl group-hover:blur-3xl transition-all duration-700" />
                    <div className="relative bg-white/40 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] ring-1 ring-black/5">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Drill Workshop</h3>
                                <p className="text-xl font-bold text-slate-800">Generate a New Challenge</p>
                            </div>
                            <div className="w-10 h-10 bg-blue-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 animate-pulse">
                                <Plus size={20} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {DRILL_TYPES.map((type, idx) => {
                                const Icon = type.icon;
                                const isCreating = creatingType === type.id;
                                return (
                                    <motion.button
                                        key={type.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        whileHover={{ y: -5, scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleCreateChallenge(type.id)}
                                        disabled={!!creatingType}
                                        className={`group/btn relative flex flex-col items-center gap-3 p-5 rounded-[2rem] transition-all bg-white border border-slate-100 hover:border-transparent shadow-sm hover:shadow-xl ${type.shadow}
                                            ${isCreating ? 'opacity-50 cursor-wait' : ''}
                                        `}
                                    >
                                        <div className={`w-14 h-14 ${type.bg} ${type.color} rounded-2xl flex items-center justify-center transition-transform group-hover/btn:scale-110 duration-300`}>
                                            <Icon size={28} strokeWidth={2.5} />
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <span className="text-sm font-black text-slate-700 text-center leading-tight">
                                                {isCreating ? 'Creating...' : type.label}
                                            </span>
                                            <div className="mt-1 h-1 w-0 group-hover/btn:w-8 bg-slate-200 rounded-full transition-all duration-300" />
                                        </div>
                                    </motion.button>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* View Conditional */}
                {viewMode === 'analytics' ? (
                    <ChallengeAnalytics challenges={challengeData?.data || []} />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {challengeData?.data?.length > 0 ? (
                            challengeData.data.map((challenge) => (
                                <ChallengeCard
                                    key={challenge.refId}
                                    challenge={challenge}
                                    drillRefId={drillRefId}
                                    onDelete={handleDelete}
                                    onTry={getDrillLink}
                                    onEvaluate={() => handleOpenEvaluator(challenge.refId)}
                                />
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-gray-400">
                                    <Plus size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">No challenges yet</h3>
                                <p className="text-gray-500 mb-6 max-w-sm mx-auto">Select a challenge type above to generate your first drill.</p>
                            </div>
                        )}
                    </div>
                )}

                <EvaluatorModal
                    isVisible={isEvaluatorVisible}
                    onClose={() => setIsEvaluatorVisible(false)}
                    evaluators={challengeEvaluators}
                    challengeId={activeChallengeId}
                    onSubmit={handleSubmitEvaluation}
                />
            </div>
        } />
    );
};

export default Challenges;
