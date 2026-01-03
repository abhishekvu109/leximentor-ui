import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Layout from "@/components/layout/Layout";
import { API_LEXIMENTOR_BASE_URL } from "@/constants";
import { fetchData, fetchWithAuth } from "@/dataService";
import {
    ArrowLeftIcon,
    CheckCircleIcon,
    XCircleIcon,
    SparklesIcon,
    ArrowPathIcon,
    BookOpenIcon,
    ChatBubbleBottomCenterTextIcon
} from "@heroicons/react/24/outline";

const POS_OPTIONS = [
    'Noun', 'Verb', 'Adjective', 'Adverb',
    'Pronoun', 'Preposition', 'Conjunction', 'Interjection'
];

const Notification = ({ message, type, onClose }) => {
    if (!message) return null;
    const isSuccess = type === 'success';

    return (
        <div className={`fixed bottom-6 right-6 max-w-sm w-full bg-white rounded-xl shadow-2xl border-l-4 p-4 flex items-start gap-4 z-50 animate-in slide-in-from-right-10 fade-in duration-300 ${isSuccess ? 'border-green-500' : 'border-red-500'}`}>
            <div className={`shrink-0 ${isSuccess ? 'text-green-500' : 'text-red-500'}`}>
                {isSuccess ? <CheckCircleIcon className="w-6 h-6" /> : <XCircleIcon className="w-6 h-6" />}
            </div>
            <div className="flex-1 pt-0.5">
                <h3 className="font-bold text-slate-800 text-sm mb-1">{isSuccess ? "Success" : "Error"}</h3>
                <p className="text-slate-600 text-sm leading-snug">{message}</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                <span className="sr-only">Close</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
    );
};

const LoadPosDrillChallenge = () => {
    const router = useRouter();
    const { drillId } = router.query; // [...drillId] -> [challengeId, drillRefId]

    const [drillSetData, setDrillSetData] = useState({ data: [] });
    const [drillSetWordData, setDrillSetWordData] = useState({ data: [] });
    const [challengeScores, setChallengeScores] = useState({ data: [] });
    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [isCompleted, setIsCompleted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState({ visible: false, message: '', type: '' });

    const challengeId = drillId?.[0];
    const drillRefId = drillId?.[1];

    useEffect(() => {
        if (drillRefId && challengeId) {
            setLoading(true);
            const fetchDataAsync = async () => {
                try {
                    const [setData, wordData, scores] = await Promise.all([
                        fetchWithAuth(`${API_LEXIMENTOR_BASE_URL}/drill/metadata/sets/${drillRefId}`).then(res => res.json()),
                        fetchWithAuth(`${API_LEXIMENTOR_BASE_URL}/drill/metadata/sets/words/data/${drillRefId}`).then(res => res.json()),
                        fetchWithAuth(`${API_LEXIMENTOR_BASE_URL}/drill/metadata/challenges/challenge/${challengeId}/scores`).then(res => res.json())
                    ]);

                    setDrillSetData(setData || { data: [] });
                    setDrillSetWordData(wordData || { data: [] });
                    setChallengeScores(scores || { data: [] });

                    if (wordData?.data && scores?.data && setData?.data) {
                        initializeGame(wordData, scores, setData);
                    }
                } catch (error) {
                    console.error("Failed to fetch challenge data:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchDataAsync();
        }
    }, [drillRefId, challengeId]);

    const initializeGame = (wordData = drillSetWordData, scores = challengeScores, setData = drillSetData) => {
        const generatedQuestions = scores.data.map(scoreItem => {
            const setItem = setData.data.find(d => d.refId === scoreItem.drillSetRefId);
            if (!setItem) return null;

            const wordItem = wordData.data.find(w => w.refId === setItem.wordRefId);
            if (!wordItem) return null;

            return {
                scoreRefId: scoreItem.refId,
                drillSetRefId: scoreItem.drillSetRefId,
                word: wordItem.word,
                meaning: wordItem.meanings?.[0]?.meaning || wordItem.meaning || "No meaning available",
                example: wordItem.examples?.[0]?.example || `Context: The word "${wordItem.word}" is used in various sentences.`,
                correctPos: wordItem.pos?.toLowerCase() || 'noun'
            };
        }).filter(Boolean);

        setQuestions(generatedQuestions);
        setCurrentIndex(0);
        setAnswers([]);
        setIsCompleted(false);
    };

    const handlePosSelect = (selectedPos) => {
        const currentQuestion = questions[currentIndex];
        const isCorrect = selectedPos.toLowerCase() === currentQuestion.correctPos.toLowerCase();

        const newAnswer = {
            refId: currentQuestion.scoreRefId,
            drillChallengeRefId: challengeId,
            drillSetRefId: currentQuestion.drillSetRefId,
            question: currentQuestion.word,
            response: selectedPos,
            isCorrect: isCorrect,
            correct: isCorrect
        };

        const updatedAnswers = [...answers, newAnswer];
        setAnswers(updatedAnswers);

        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            handleComplete(updatedAnswers);
        }
    };

    const handleComplete = async (finalAnswers) => {
        setIsCompleted(true);
        await submitResults(finalAnswers);
    };

    const submitResults = async (submissionData) => {
        setIsSubmitting(true);
        try {
            const URL = `${API_LEXIMENTOR_BASE_URL}/drill/metadata/challenges/challenge/${challengeId}/scores`;
            const response = await fetchWithAuth(URL, {
                method: 'PUT',
                body: JSON.stringify(submissionData),
            });

            if (response.ok) {
                setNotification({ visible: true, message: "Progress saved successfully!", type: 'success' });
            } else {
                throw new Error("Failed to save progress.");
            }
        } catch (error) {
            console.error(error);
            setNotification({ visible: true, message: "Failed to save progress.", type: 'error' });
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setNotification({ visible: false, message: '', type: '' }), 5000);
        }
    };

    const currentQuestion = questions[currentIndex];
    const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

    if (loading) {
        return (
            <Layout content={
                <div className="min-h-screen flex items-center justify-center bg-slate-50">
                    <div className="text-center">
                        <ArrowPathIcon className="w-10 h-10 text-indigo-400 animate-spin mx-auto mb-4" />
                        <p className="text-slate-500 font-bold">Initialing Challenge...</p>
                    </div>
                </div>
            } />
        );
    }

    return (
        <Layout content={
            <div className="min-h-screen bg-slate-50 pb-20 font-sans">
                {/* Header */}
                <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
                    <div className="max-w-4xl mx-auto px-6 py-3">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <Link href={`/challenges/${drillRefId}`} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-indigo-600">
                                    <ArrowLeftIcon className="w-5 h-5" />
                                </Link>
                                <div>
                                    <h1 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                                        Identify POS
                                    </h1>
                                    <div className="text-xs text-slate-500 font-bold">
                                        Word {currentIndex + 1} / {questions.length}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Link href="/dashboard/dashboard2" className="text-xs font-bold text-slate-500 hover:text-slate-900 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50">
                                    Exit
                                </Link>
                            </div>
                        </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-1 bg-slate-100 w-full relative">
                        <div
                            className="h-full bg-indigo-500 transition-all duration-500 ease-out absolute left-0 top-0"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                <main className="max-w-2xl mx-auto px-6 py-10">
                    {isCompleted ? (
                        <div className="text-center py-20 animate-in zoom-in duration-500 bg-white rounded-3xl shadow-sm border border-slate-100 p-10">
                            <SparklesIcon className="w-20 h-20 text-indigo-600 mx-auto mb-6" />
                            <h2 className="text-4xl font-black text-slate-800 mb-4">Complete!</h2>
                            <p className="text-slate-500 text-lg mb-8">
                                You have finished the Part of Speech challenge.
                            </p>
                            <div className="flex justify-center gap-4">
                                <button onClick={initializeGame} className="px-6 py-3 bg-white border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                                    Restart
                                </button>
                                <Link href={`/challenges/${drillRefId}`} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all">
                                    Back to Drills
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Card */}
                            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                                <div className="bg-indigo-600 px-8 py-6 text-white">
                                    <span className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-2 block">The Word</span>
                                    <h2 className="text-5xl font-black">{currentQuestion.word}</h2>
                                </div>
                                <div className="p-8 space-y-6">
                                    <div className="flex gap-4">
                                        <div className="shrink-0 w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                            <BookOpenIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Meaning</h3>
                                            <p className="text-slate-700 font-medium leading-relaxed">{currentQuestion.meaning}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="shrink-0 w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
                                            <ChatBubbleBottomCenterTextIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Example</h3>
                                            <p className="text-slate-700 italic leading-relaxed">&quot;{currentQuestion.example}&quot;</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Options */}
                            <div className="space-y-4">
                                <h3 className="text-center text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Select Part of Speech</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {POS_OPTIONS.map((pos) => (
                                        <button
                                            key={pos}
                                            onClick={() => handlePosSelect(pos)}
                                            className="px-4 py-4 bg-white border-2 border-slate-200 rounded-2xl font-bold text-slate-600 hover:border-indigo-600 hover:text-indigo-600 transition-all hover:shadow-md active:scale-95"
                                        >
                                            {pos}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </main>

                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification({ ...notification, visible: false })}
                />
            </div>
        } />
    );
};


export default POSPractice;
