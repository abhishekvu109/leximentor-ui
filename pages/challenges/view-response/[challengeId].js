import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Layout from "@/components/layout/Layout";
import leximentorService from "@/services/leximentor.service";
import { motion, AnimatePresence } from "framer-motion";
import {
    CheckCircle, XCircle, BarChart2, RefreshCw,
    ChevronLeft, Brain, Sparkles, FileText, AlertCircle
} from "lucide-react";

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
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <Brain className="text-blue-500" size={18} />
                        Submit for Evaluation
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <span className="text-2xl">&times;</span>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Challenge ID</label>
                        <input
                            type="text"
                            value={challengeId}
                            disabled
                            className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Evaluator</label>
                        <select
                            required
                            value={selectedEvaluator}
                            onChange={(e) => setSelectedEvaluator(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        >
                            <option value="">Choose an AI evaluator...</option>
                            {evaluators?.data?.map((ev, i) => (
                                <option key={i} value={ev.name}>{ev.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={!selectedEvaluator}
                            className={`w-full font-bold py-3 rounded-xl transition-all shadow-lg ${selectedEvaluator
                                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                                }`}
                        >
                            Start Evaluation
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ViewResponse = () => {
    const router = useRouter();
    const { challengeId } = router.query;

    const [scores, setScores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [evaluators, setEvaluators] = useState(null);
    const [isEvaluatorVisible, setIsEvaluatorVisible] = useState(false);
    const [jobStatus, setJobStatus] = useState(null);
    const [checkingStatus, setCheckingStatus] = useState(false);

    const loadScores = useCallback(async (id) => {
        try {
            setLoading(true);
            const res = await leximentorService.getChallengeScores(id);
            setScores(res.data || []);
        } catch (error) {
            console.error("Failed to load scores:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchEvaluators = useCallback(async (id) => {
        try {
            const res = await leximentorService.getEvaluators(id);
            setEvaluators(res);
        } catch (error) {
            console.error("Failed to fetch evaluators:", error);
        }
    }, []);

    const checkEvaluationStatus = useCallback(async () => {
        if (!challengeId) return;
        setCheckingStatus(true);
        try {
            const res = await leximentorService.getEvaluationStatus(challengeId);
            if (res.meta?.code === "001") {
                setJobStatus(null);
            } else {
                setJobStatus(res.data);
                if (res.data?.job?.status === 'SUCCEEDED') {
                    loadScores(challengeId);
                }
            }
        } catch (error) {
            if (error.response?.status === 404) {
                setJobStatus(null);
                console.log("No evaluation job found for this challenge (404).");
            } else {
                console.error("Failed to check evaluation status:", error);
            }
        } finally {
            setCheckingStatus(false);
        }
    }, [challengeId, loadScores]);

    useEffect(() => {
        if (challengeId) {
            loadScores(challengeId);
            fetchEvaluators(challengeId);
            // Check status once on load to see if it's already evaluated or in progress
            checkEvaluationStatus();
        }
    }, [challengeId, loadScores, fetchEvaluators, checkEvaluationStatus]);

    const handleOpenEvaluator = () => setIsEvaluatorVisible(true);

    const handleSubmitEvaluation = async (id, evaluator) => {
        try {
            await leximentorService.submitEvaluation(id, evaluator);
            setIsEvaluatorVisible(false);
            alert("Evaluation job started!");
            checkEvaluationStatus(); // Start checking
        } catch (error) {
            console.error("Failed to submit evaluation:", error);
            alert("Failed to start evaluation.");
        }
    };

    const getReportLink = () => {
        if (!scores.length) return "#";
        const drillType = scores[0].drillType || 'MEANING'; // Fallback or get from challenge meta
        return `/evaluation_report/${drillType === 'CM' || drillType === 'CONTEXT_MASTER' ? 'context-master' : 'meaning_report'}/${challengeId}`;
    };

    if (loading && !scores.length) {
        return <Layout content={<div className="p-20 text-center text-gray-500 font-bold animate-pulse">Loading responses...</div>} />;
    }

    const isSucceeded = jobStatus?.job?.status === 'SUCCEEDED';

    return (
        <Layout content={
            <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 pb-24">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors mb-2"
                        >
                            <ChevronLeft size={16} /> Back to Challenges
                        </button>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            <FileText className="text-blue-500" />
                            Challenge Response
                        </h1>
                        <p className="text-gray-500 font-medium">Review your submitted answers and trigger AI evaluation.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={checkEvaluationStatus}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${checkingStatus
                                ? 'bg-gray-50 border-gray-200 text-gray-400'
                                : 'bg-white border-blue-100 text-blue-600 hover:bg-blue-50 hover:border-blue-200 shadow-sm'
                                }`}
                        >
                            <RefreshCw size={16} className={checkingStatus ? 'animate-spin' : ''} />
                            Evaluation Status
                        </button>

                        {!isSucceeded ? (
                            <button
                                onClick={handleOpenEvaluator}
                                className="flex items-center gap-2 px-6 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-yellow-100 transition-all border border-yellow-400"
                            >
                                <BarChart2 size={16} />
                                Evaluate Now
                            </button>
                        ) : (
                            <Link href={getReportLink()}>
                                <button className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-green-100 transition-all border border-green-500">
                                    <Sparkles size={16} />
                                    VIEW REPORT
                                </button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Job Status Banner */}
                <AnimatePresence>
                    {jobStatus?.job && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${jobStatus.job.status === 'SUCCEEDED' ? 'bg-green-50 border-green-100 text-green-700' :
                                jobStatus.job.status === 'FAILED' ? 'bg-red-50 border-red-100 text-red-700' :
                                    'bg-blue-50 border-blue-100 text-blue-700 animate-pulse'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                {jobStatus.job.status === 'SUCCEEDED' ? <CheckCircle size={20} /> :
                                    jobStatus.job.status === 'FAILED' ? <XCircle size={20} /> : <RefreshCw size={20} className="animate-spin" />}
                                <div className="text-sm">
                                    <span className="font-bold uppercase tracking-wider text-[10px] block opacity-70">Job Status</span>
                                    <span className="font-black text-base">{jobStatus.job.status}</span>
                                    {jobStatus.job.completedAt && (
                                        <span className="ml-2 text-xs opacity-60">at {new Date(jobStatus.job.completedAt).toLocaleTimeString()}</span>
                                    )}
                                </div>
                            </div>
                            {jobStatus.job.result?.evaluator && (
                                <div className="hidden md:block text-right">
                                    <span className="font-bold uppercase tracking-wider text-[10px] block opacity-70">Evaluated By</span>
                                    <span className="font-bold text-sm">{jobStatus.job.result.evaluator}</span>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Response Table */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden shadow-gray-200/50">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">#</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 w-1/3">Question</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Your Response</th>
                                </tr>
                            </thead>
                            <tbody>
                                {scores.map((score, idx) => (
                                    <motion.tr
                                        key={score.refId}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="group hover:bg-gray-50/50 transition-colors"
                                    >
                                        <td className="px-8 py-6 text-sm font-bold text-gray-300 border-b border-gray-50">{idx + 1}</td>
                                        <td className="px-8 py-6 border-b border-gray-50">
                                            <div className="text-sm font-bold text-gray-900 leading-relaxed">{score.question}</div>
                                            <div className="text-[10px] font-mono text-gray-400 mt-1 uppercase">ID: {score.refId}</div>
                                        </td>
                                        <td className="px-8 py-6 border-b border-gray-50">
                                            {score.response ? (
                                                <div className="text-sm text-gray-700 bg-white border border-gray-100 px-4 py-2.5 rounded-2xl inline-block shadow-sm group-hover:shadow-md transition-all">
                                                    {score.response}
                                                </div>
                                            ) : (
                                                <span className="text-xs font-bold text-gray-300 italic">No response provided</span>
                                            )}
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {scores.length === 0 && (
                        <div className="p-20 text-center bg-gray-50/30">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100 shadow-sm text-gray-300">
                                <AlertCircle size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">No responses found</h3>
                            <p className="text-gray-500 max-w-xs mx-auto text-sm mt-1">We couldn&apos;t find any score data for this challenge ID.</p>
                        </div>
                    )}
                </div>

                <EvaluatorModal
                    isVisible={isEvaluatorVisible}
                    onClose={() => setIsEvaluatorVisible(false)}
                    evaluators={evaluators}
                    challengeId={challengeId}
                    onSubmit={handleSubmitEvaluation}
                />
            </div>
        } />
    );
};

export default ViewResponse;
