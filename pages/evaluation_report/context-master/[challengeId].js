import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import leximentorService from "../../../services/leximentor.service";
import Link from "next/link";
import Layout from "@/components/layout/Layout";
import {
    CheckCircle,
    XCircle,
    ArrowLeft,
    Target,
    Brain,
    AlertTriangle,
    Check,
    X,
    MessageSquare,
    BookOpen
} from "lucide-react";

/**
 * Component for displaying a single evaluation item
 */
const FeedbackCard = ({ item, index }) => {
    const isCorrect = item.drillChallengeScoresDTO.correct;
    const question = item.drillChallengeScoresDTO.question;

    return (
        <div className={`rounded-xl border-l-4 p-6 shadow-sm bg-white mb-4 transition-all hover:shadow-md
            ${isCorrect ? 'border-l-green-500' : 'border-l-red-500'}`}>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Question Section */}
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Question {index + 1}</span>
                        {isCorrect ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                <Check size={12} /> Correct
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                                <X size={12} /> Incorrect
                            </span>
                        )}
                    </div>

                    <div className="mb-4">
                        <h3 className="text-lg font-medium text-gray-900 leading-relaxed">
                            {question.split('_____').map((part, idx, arr) => (
                                <span key={idx}>
                                    {part}
                                    {idx < arr.length - 1 && (
                                        <span className={`inline-block mx-1 px-2 py-0.5 rounded font-bold border-b-2 ${isCorrect ? 'border-green-500 text-green-700 bg-green-50' : 'border-red-500 text-red-700 bg-red-50'}`}>
                                            {item.drillChallengeScoresDTO.response || '_____'}
                                        </span>
                                    )}
                                </span>
                            ))}
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-3">
                            <span className="text-xs font-semibold text-gray-500 block mb-1">Your Selection</span>
                            <p className="text-gray-900 font-medium">{item.drillChallengeScoresDTO.response}</p>
                        </div>
                    </div>
                </div>

                {/* AI Analysis Section */}
                <div className="md:w-1/3 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                    <div className="flex items-center gap-2 mb-2 text-blue-600">
                        <Brain size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">AI Analysis</span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed mb-3">
                        {item.reason}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>Confidence Score</span>
                        <div className="flex items-center gap-1 text-gray-700 font-medium">
                            <Target size={12} /> {item.confidence}%
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ScoreCard = ({ passed, score, correct, wrong, total }) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 mb-8 relative overflow-hidden">
            {/* Decorative Background */}
            <div className={`absolute top-0 right-0 w-64 h-64 transform translate-x-1/3 -translate-y-1/3 rounded-full opacity-5 
                ${passed ? 'bg-green-500' : 'bg-red-500'}`}></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                {/* Score Circle */}
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <svg className="w-32 h-32 transform -rotate-90">
                            <circle
                                className="text-gray-100"
                                strokeWidth="8"
                                stroke="currentColor"
                                fill="transparent"
                                r="58"
                                cx="64"
                                cy="64"
                            />
                            <circle
                                className={passed ? "text-green-500" : "text-red-500"}
                                strokeWidth="8"
                                strokeDasharray={365}
                                strokeDashoffset={365 - (365 * score) / 100}
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="transparent"
                                r="58"
                                cx="64"
                                cy="64"
                            />
                        </svg>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                            <span className="text-3xl font-bold text-gray-900">{score}%</span>
                        </div>
                    </div>

                    <div>
                        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold mb-2
                            ${passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {passed ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                            {passed ? "Passed" : "Needs Improvement"}
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Context Master Challenge</h2>
                        <p className="text-gray-500 text-sm">Detailed performance breakdown</p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="flex gap-8 text-center">
                    <div>
                        <div className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-1">
                            <Target className="text-gray-400" size={20} /> {total}
                        </div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-green-600 flex items-center justify-center gap-1">
                            <CheckCircle size={20} /> {correct}
                        </div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Correct</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-red-500 flex items-center justify-center gap-1">
                            <XCircle size={20} /> {wrong}
                        </div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Incorrect</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ContextMasterEvaluationReport = () => {
    const router = useRouter();
    const { challengeId } = router.query;

    const [evaluationReportData, setEvaluationReportData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (challengeId) {
            const loadData = async () => {
                setLoading(true);
                try {
                    const data = await leximentorService.getChallengeReport(challengeId);
                    setEvaluationReportData(data);
                } catch (error) {
                    console.error("Failed to load evaluation report:", error);
                } finally {
                    setLoading(false);
                }
            };
            loadData();
        }
    }, [challengeId]);

    if (loading) return <Layout content={<div className="p-8 text-center text-slate-500 font-bold">Loading Report...</div>} />;

    // Data Guards
    if (!evaluationReportData?.data) {
        return (
            <Layout content={
                <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="text-gray-400" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Report Not Found</h1>
                    <p className="text-gray-500 mb-6">We couldn&apos;t find the data for this evaluation.</p>
                    <Link href="/dashboard/dashboard2">
                        <button className="text-blue-600 font-bold hover:underline">Return to Dashboard</button>
                    </Link>
                </div>
            } />
        );
    }

    const {
        score,
        passed,
        totalCorrect,
        totalIncorrect,
        drillEvaluationDTOS,
        refId,
        drillType
    } = evaluationReportData.data;

    const totalQuestions = (totalCorrect || 0) + (totalIncorrect || 0);

    return (
        <Layout content={
            <div className="max-w-5xl mx-auto px-4 py-8">
                {/* Headers / Nav */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/dashboard/dashboard2">
                        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-200 transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>Context Master Report</span>
                            <span>•</span>
                            <span className="font-mono">{refId}</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <BookOpen className="text-indigo-600" /> Assessment Feedback
                        </h1>
                    </div>
                </div>

                {/* Score Dashboard */}
                <ScoreCard
                    passed={passed}
                    score={score}
                    correct={totalCorrect}
                    wrong={totalIncorrect}
                    total={totalQuestions}
                />

                {/* Detailed Breakdown */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <MessageSquare className="text-blue-500" size={20} />
                            Detailed Analysis
                        </h3>
                        <span className="text-sm text-gray-500">{drillEvaluationDTOS?.length || 0} items reviewed</span>
                    </div>

                    {drillEvaluationDTOS?.length > 0 ? (
                        drillEvaluationDTOS.map((item, index) => (
                            <FeedbackCard key={index} item={item} index={index} />
                        ))
                    ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                            <p className="text-gray-500">No detailed feedback available.</p>
                        </div>
                    )}
                </div>
            </div>
        } />
    );
};

export default ContextMasterEvaluationReport;
