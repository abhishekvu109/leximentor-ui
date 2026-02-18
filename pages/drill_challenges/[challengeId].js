import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Layout from "@/components/layout/Layout";
import leximentorService from "../../services/leximentor.service";
import {
    ArrowLeft,
    RefreshCw,
    Play,
    CheckCircle2,
    XCircle,
    Clock,
    AlertCircle,
    Brain,
    ClipboardList,
    BarChart2
} from "lucide-react";

const StatusBadge = ({ status }) => {
    const configs = {
        'SUCCEEDED': { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', label: 'Success' },
        'RUNNING': { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Running...' },
        'FAILED': { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Failed' },
        'PENDING': { icon: Clock, color: 'text-gray-600', bg: 'bg-gray-50', label: 'Pending' }
    };

    const config = configs[status] || configs['PENDING'];
    const Icon = config.icon;

    return (
        <div className={`px-4 py-2 rounded-2xl flex items-center gap-2 ${config.bg} ${config.color} border border-current/10 font-bold text-sm`}>
            <Icon size={16} className="animate-in fade-in" />
            {config.label}
        </div>
    );
};

const ViewResponse = () => {
    const router = useRouter();
    const { challengeId } = router.query;

    const [challenge, setChallenge] = useState(null);
    const [scores, setScores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [evaluators, setEvaluators] = useState([]);
    const [selectedEvaluator, setSelectedEvaluator] = useState('');
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [jobStatus, setJobStatus] = useState(null);

    const checkStatus = useCallback(async () => {
        if (!challengeId) return;
        try {
            const res = await leximentorService.getEvaluationStatus(challengeId);
            setJobStatus(res.data.job);

            if (res.data.job?.status === 'SUCCEEDED') {
                const updatedChallenge = await leximentorService.getChallenge(challengeId);
                setChallenge(updatedChallenge.data);
            }
        } catch (error) {
            console.error("Failed to check status:", error);
        }
    }, [challengeId]);

    const fetchData = useCallback(async () => {
        if (!challengeId) return;
        setLoading(true);
        try {
            const [challengeRes, scoresRes, evaluatorsRes] = await Promise.all([
                leximentorService.getChallenge(challengeId),
                leximentorService.getChallengeScores(challengeId),
                leximentorService.getEvaluators(challengeId)
            ]);
            setChallenge(challengeRes.data || challengeRes);
            const scoresData = scoresRes.data || (Array.isArray(scoresRes) ? scoresRes : []);
            setScores(scoresData);

            const evData = evaluatorsRes.data || (Array.isArray(evaluatorsRes) ? evaluatorsRes : []);
            setEvaluators(evData);
            if (evData.length > 0) {
                setSelectedEvaluator(evData[0].name);
            }

            if (challengeRes.data?.evaluationStatus === 'EVALUATING' || challengeRes.evaluationStatus === 'EVALUATING') {
                checkStatus();
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    }, [challengeId, checkStatus]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleEvaluate = async () => {
        if (!selectedEvaluator) return;
        setIsEvaluating(true);
        try {
            await leximentorService.submitEvaluation(challengeId, selectedEvaluator);
            setTimeout(checkStatus, 2000);
        } catch (error) {
            console.error("Evaluation failed:", error);
            alert("Failed to submit evaluation");
        } finally {
            setIsEvaluating(false);
        }
    };

    if (loading) {
        return (
            <Layout content={
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="flex flex-col items-center gap-4">
                        <RefreshCw className="w-12 h-12 text-blue-500 animate-spin" />
                        <p className="font-bold text-gray-500">Loading your responses...</p>
                    </div>
                </div>
            } />
        );
    }

    const isEvaluated = challenge?.evaluationStatus === 'Evaluated';
    const isRunning = jobStatus?.status === 'RUNNING';

    return (
        <Layout content={
            <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
                {/* Header Navigation */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-800 font-bold transition-colors group"
                    >
                        <div className="p-2 rounded-xl group-hover:bg-gray-100 transition-colors">
                            <ArrowLeft size={20} />
                        </div>
                        Back
                    </button>

                    <div className="flex items-center gap-3">
                        {jobStatus && <StatusBadge status={jobStatus.status} />}
                        {isEvaluated && (
                            <Link
                                href={`/evaluation_report/${challenge.drillType === 'CM' ? 'context-master' : 'meaning_report'}/${challengeId}`}
                                className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold shadow-lg shadow-green-100 transition-all active:scale-95"
                            >
                                <BarChart2 size={18} />
                                View Report
                            </Link>
                        )}
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Metadata & Evaluation Control */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
                            <div>
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <ClipboardList size={14} className="text-blue-500" /> Challenge Details
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500 font-medium">Challenge ID</span>
                                        <span className="text-gray-900 font-mono font-bold truncate max-w-[120px]">{challengeId}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500 font-medium">Type</span>
                                        <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg font-bold text-xs uppercase">{challenge?.drillType}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500 font-medium">Status</span>
                                        <span className="text-gray-900 font-bold">{challenge?.status}</span>
                                    </div>
                                    {isEvaluated && (
                                        <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                                            <span className="text-gray-500 font-medium">Final Score</span>
                                            <span className={`text-2xl font-black ${challenge.drillScore > 70 ? 'text-green-600' : 'text-red-500'}`}>
                                                {challenge.drillScore}%
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-100">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Brain size={14} className="text-purple-500" /> AI Evaluation
                                </h3>

                                {!isEvaluated && !isRunning && (
                                    <div className="space-y-4">
                                        <select
                                            value={selectedEvaluator}
                                            onChange={(e) => setSelectedEvaluator(e.target.value)}
                                            className="w-full bg-gray-50 border-gray-100 rounded-2xl py-3 px-4 font-bold text-sm focus:ring-purple-500 focus:border-purple-500 transition-all"
                                        >
                                            {evaluators.map(ev => (
                                                <option key={ev.name} value={ev.name}>{ev.name}</option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={handleEvaluate}
                                            disabled={isEvaluating}
                                            className="w-full py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-purple-100 transition-all active:scale-95"
                                        >
                                            {isEvaluating ? <RefreshCw className="animate-spin" size={20} /> : <Play size={20} />}
                                            {isEvaluating ? 'Submitting...' : 'Start Evaluation'}
                                        </button>
                                    </div>
                                )}

                                {isRunning && (
                                    <div className="space-y-4">
                                        <div className="p-4 bg-blue-50 rounded-2xl flex flex-col items-center gap-3 text-center">
                                            <RefreshCw className="text-blue-500 animate-spin" size={24} />
                                            <p className="text-xs font-bold text-blue-700 leading-tight">
                                                The AI is currently evaluating your responses. This might take a few moments.
                                            </p>
                                        </div>
                                        <button
                                            onClick={checkStatus}
                                            className="w-full py-3 bg-white border-2 border-blue-100 text-blue-600 hover:bg-blue-50 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
                                        >
                                            <RefreshCw size={16} />
                                            Update Status
                                        </button>
                                    </div>
                                )}

                                {isEvaluated && (
                                    <div className="p-4 bg-green-50 rounded-2xl flex items-center gap-3">
                                        <CheckCircle2 className="text-green-500" size={24} />
                                        <p className="text-xs font-bold text-green-700">
                                            Evaluation complete! Check the report for detailed feedback.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Response List */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-xl font-black text-gray-900">Drill Responses</h2>
                            <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                                {scores.length} Questions
                            </span>
                        </div>

                        <div className="space-y-4">
                            {scores.map((score, idx) => (
                                <div key={idx} className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center font-black text-gray-400 text-sm group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <div>
                                                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Question</h4>
                                                <p className="text-lg font-bold text-gray-800">{score.question}</p>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                                                <div>
                                                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Your Response</h4>
                                                    <p className="font-bold text-gray-700 italic">&quot;{score.response}&quot;</p>
                                                </div>
                                                {isEvaluated && (
                                                    <div className="flex flex-col items-end">
                                                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 text-right">Accuracy</h4>
                                                        <div className={`flex items-center gap-2 font-black ${score.correct ? 'text-green-600' : 'text-red-500'}`}>
                                                            {score.correct ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                                                            {score.correct ? 'Correct' : 'Needs Work'}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {scores.length === 0 && (
                                <div className="text-center py-20 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
                                    <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
                                    <h3 className="font-bold text-gray-900">No responses found</h3>
                                    <p className="text-gray-500 text-sm">This challenge might not have been completed yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        } />
    );
};

export default ViewResponse;
