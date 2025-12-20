
import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { API_LEXIMENTOR_BASE_URL } from "@/constants";
import { deleteData, fetchData, postData } from "@/dataService";
import Layout from "@/components/layout/Layout";
import {
    Play, Trash2, CheckCircle, AlertCircle, BarChart2,
    Plus, RefreshCw, BookOpen, Mic, Brain, Hash, Type,
    Layers, Zap, FileText
} from "lucide-react";

const DRILL_TYPES = [
    { id: 'MEANING', label: 'Meaning', icon: BookOpen, color: 'bg-blue-100 text-blue-700' },
    { id: 'POS', label: 'Identify POS', icon: Hash, color: 'bg-purple-100 text-purple-700' },
    { id: 'WS', label: 'Word Scramble', icon: Type, color: 'bg-green-100 text-green-700' },
    { id: 'IDENTIFY', label: 'Pronunciation', icon: Mic, color: 'bg-yellow-100 text-yellow-700' },
    { id: 'GUESS', label: 'Guess Word', icon: Brain, color: 'bg-pink-100 text-pink-700' },
    { id: 'MW', label: 'Match Word', icon: CheckCircle, color: 'bg-indigo-100 text-indigo-700' },
    { id: 'FB', label: 'Flashcard Blitz', icon: Layers, color: 'bg-teal-100 text-teal-700' },
    { id: 'ST', label: 'Speed Typer', icon: Zap, color: 'bg-orange-100 text-orange-700' },
    { id: 'CM', label: 'Context Master', icon: FileText, color: 'bg-cyan-100 text-cyan-700' },
];

const ChallengeCard = ({ challenge, drillRefId, onDelete, onTry, onEvaluate, onViewReport }) => {
    const isPassed = challenge.drillScore > 70;
    const isCompleted = challenge.status === 'Completed';
    const isEvaluated = challenge.evaluationStatus === 'Evaluated';

    const typeConfig = DRILL_TYPES.find(t => t.id === challenge.drillType) || { label: challenge.drillType, color: 'bg-gray-100 text-gray-600', icon: BookOpen };
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

const Challenges = ({ data, drillId }) => {
    const [challengeData, setChallengeData] = useState(data);
    const [drillRefId, setDrillRefId] = useState(drillId);

    // Evaluation State
    const [isEvaluatorVisible, setIsEvaluatorVisible] = useState(false);
    const [challengeEvaluators, setChallengeEvaluators] = useState(null);
    const [activeChallengeId, setActiveChallengeId] = useState(null);

    // Creation State
    const [creatingType, setCreatingType] = useState(null);

    useEffect(() => {
        if (typeof window !== "undefined" && window.initFlowbite) {
            window.initFlowbite();
        }
    }, []);

    const loadChallenges = async () => {
        const URL = `${API_LEXIMENTOR_BASE_URL}/drill/metadata/challenges/${drillRefId}`;
        const res = await fetchData(URL);
        setChallengeData(res);
    };

    const handleCreateChallenge = async (type) => {
        setCreatingType(type);
        try {
            const URL = `${API_LEXIMENTOR_BASE_URL}/drill/metadata/challenges/challenge?drillId=${drillRefId}&drillType=${type}`;
            await postData(URL);
            await loadChallenges();
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
        await deleteData(URL);
        await loadChallenges();
    };

    const handleOpenEvaluator = async (challengeId) => {
        setActiveChallengeId(challengeId);
        setIsEvaluatorVisible(true);
        const URL = `${API_LEXIMENTOR_BASE_URL}/drill/metadata/challenges/challenge/evaluators?challengeRefId=${challengeId}`;
        const res = await fetchData(URL);
        setChallengeEvaluators(res);
    };

    const handleSubmitEvaluation = async (challengeId, evaluator) => {
        const URL = `${API_LEXIMENTOR_BASE_URL}/drill/metadata/challenges/challenge/${challengeId}/evaluate?challengeId=${challengeId}&evaluator=${evaluator}`;
        await postData(URL);
        setIsEvaluatorVisible(false);
        setActiveChallengeId(null);
        alert("Evaluation submitted!"); // Replace with toast
        await loadChallenges();
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
                    <button
                        onClick={loadChallenges}
                        className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
                    >
                        <RefreshCw size={16} /> Refresh
                    </button>
                </div>

                {/* Create Toolbar */}
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-4 flex items-center gap-2">
                        <Plus size={14} /> Start New Challenge
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        {DRILL_TYPES.map(type => {
                            const Icon = type.icon;
                            const isCreating = creatingType === type.id;
                            return (
                                <button
                                    key={type.id}
                                    onClick={() => handleCreateChallenge(type.id)}
                                    disabled={!!creatingType}
                                    className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow-md bg-white border border-gray-200 hover:border-gray-300 text-gray-700
                                        ${isCreating ? 'opacity-50 cursor-wait' : 'active:scale-95'}
                                    `}
                                >
                                    <Icon size={18} className={type.color.split(' ')[1]} />
                                    {isCreating ? 'Creating...' : type.label}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Challenge Grid */}
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

export async function getServerSideProps(context) {
    const { drillId } = context.params;
    try {
        const URL = `${API_LEXIMENTOR_BASE_URL}/drill/metadata/challenges/${drillId}`;
        const res = await fetch(URL, { headers: { 'Content-Type': 'application/json' } });
        const data = await res.json();
        return {
            props: {
                data: data,
                drillId: drillId
            }
        };
    } catch (e) {
        console.error("Failed to load challenges", e);
        return {
            props: {
                data: null,
                drillId: drillId
            }
        };
    }
}
