import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Layout from "@/components/layout/Layout";
import { API_LEXIMENTOR_BASE_URL } from "@/constants";
import { fetchData } from "@/dataService";
import {
    ArrowLeftIcon,
    CheckCircleIcon,
    XCircleIcon,
    BookOpenIcon,
    ArrowPathIcon,
    SparklesIcon,
    LightBulbIcon
} from "@heroicons/react/24/outline";

// --- Components ---

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

const ContextMasterChallenge = ({ drillSetData, drillSetWordData, challengeId, drillRefId, challengeScores }) => {

    // --- State ---
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [isCompleted, setIsCompleted] = useState(false);

    const [notification, setNotification] = useState({ visible: false, message: '', type: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const closeNotification = () => setNotification({ ...notification, visible: false });

    // --- Init ---
    const initializeGame = useCallback(() => {
        if (!drillSetWordData?.data || !challengeScores?.data || !drillSetData?.data) return;

        const generatedQuestions = challengeScores.data.map(scoreItem => {
            // Find the word metadata in drillSetData that matches the score's drillSetRefId
            const setItem = drillSetData.data.find(d => d.refId === scoreItem.drillSetRefId);
            if (!setItem) return null;

            // Find the full word data in drillSetWordData that matches the set item's wordRefId
            const wordItem = drillSetWordData.data.find(w => w.refId === setItem.wordRefId);
            if (!wordItem) return null;

            // Generate options
            const otherWords = (drillSetWordData.data || [])
                .filter(w => w.word !== wordItem.word)
                .map(w => w.word);
            const shuffled = [...otherWords].sort(() => 0.5 - Math.random());
            const options = [wordItem.word, ...shuffled.slice(0, 3)].sort(() => 0.5 - Math.random());

            // Get a sentence for the blank
            const exampleText = wordItem.examples?.[0]?.example ||
                `The word "${wordItem.word}" means ${wordItem.meanings?.[0]?.meaning || 'something important'}.`;
            const wordRegex = new RegExp(`\\b${wordItem.word}\\b`, 'gi');
            const sentenceWithBlank = exampleText.replace(wordRegex, '_____');

            return {
                refId: scoreItem.refId,
                drillChallengeRefId: challengeId,
                drillSetRefId: scoreItem.drillSetRefId,
                word: wordItem.word,
                sentence: sentenceWithBlank,
                fullQuestion: sentenceWithBlank,
                options: options,
                correctAnswer: wordItem.word
            };
        }).filter(q => q !== null);

        setQuestions(generatedQuestions);
        setCurrentIndex(0);
        setScore(0);
        setAnswers([]);
        setIsCompleted(false);
        setIsAnswered(false);
        setSelectedAnswer(null);
    }, [drillSetData, drillSetWordData, challengeScores, challengeId]);

    useEffect(() => {
        if (drillSetWordData?.data && challengeScores?.data && drillSetData?.data) {
            initializeGame();
        }
    }, [drillSetWordData, challengeScores, drillSetData, initializeGame]);

    // --- Interaction ---
    const handleAnswerClick = (option) => {
        if (isAnswered) return;

        const currentQuestion = questions[currentIndex];
        const isCorrect = option === currentQuestion.correctAnswer;

        setSelectedAnswer(option);
        setIsAnswered(true);

        const newAnswers = [...answers, {
            refId: currentQuestion.refId,
            drillChallengeRefId: currentQuestion.drillChallengeRefId,
            drillSetRefId: currentQuestion.drillSetRefId,
            userResponse: option,
            question: currentQuestion.fullQuestion,
            isCorrect: isCorrect
        }];
        setAnswers(newAnswers);

        if (isCorrect) {
            setScore(prev => prev + 1);
        }

        setTimeout(() => {
            if (currentIndex < questions.length - 1) {
                setCurrentIndex(prev => prev + 1);
                setIsAnswered(false);
                setSelectedAnswer(null);
            } else {
                handleComplete(newAnswers);
            }
        }, 1500);
    };

    const handleComplete = async (finalAnswers) => {
        setIsCompleted(true);

        const submissionData = finalAnswers.map(ans => ({
            refId: ans.refId,
            drillChallengeRefId: challengeId,
            drillSetRefId: ans.drillSetRefId,
            question: ans.question,
            response: ans.userResponse,
            isCorrect: ans.isCorrect,
            correct: ans.isCorrect
        }));

        await submitResults(submissionData);
    };

    const submitResults = async (submissionData) => {
        setIsSubmitting(true);
        try {
            const URL = `${API_LEXIMENTOR_BASE_URL}/drill/metadata/challenges/challenge/${challengeId}/scores`;
            const response = await fetch(URL, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submissionData),
            });

            if (response.ok) {
                setNotification({ visible: true, message: "Challenge Completed! Progress saved.", type: 'success' });
            } else {
                throw new Error("Failed to save progress.");
            }
        } catch (error) {
            console.error(error);
            setNotification({ visible: true, message: "Failed to save progress.", type: 'error' });
        } finally {
            setIsSubmitting(false);
            setTimeout(closeNotification, 5000);
        }
    };

    const resetGame = () => {
        if (confirm("Restart the challenge?")) {
            initializeGame();
        }
    };

    const totalQuestions = questions.length;
    const progress = totalQuestions > 0 ? ((currentIndex + (isCompleted ? 1 : 0)) / totalQuestions) * 100 : 0;
    const currentQuestion = questions[currentIndex];

    return (
        <Layout content={
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pb-20 font-sans">
                {/* Header */}
                <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 shadow-sm">
                    <div className="max-w-4xl mx-auto px-6 py-3">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-4">
                                <Link href={`/challenges/${drillRefId}`} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-indigo-600">
                                    <ArrowLeftIcon className="w-5 h-5" />
                                </Link>
                                <div>
                                    <h1 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                                        <BookOpenIcon className="w-5 h-5 text-indigo-600" />
                                        Context Master
                                    </h1>
                                    <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider mt-0.5">
                                        <span className="text-indigo-600">
                                            Question {currentIndex + 1}/{totalQuestions}
                                        </span>
                                        <span className="text-slate-400">•</span>
                                        <span className="text-green-600">
                                            Score: {score}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={resetGame}
                                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                    title="Restart"
                                >
                                    <ArrowPathIcon className="w-5 h-5" />
                                </button>
                                <Link href="/dashboard/dashboard2" className="text-xs font-bold text-slate-500 hover:text-slate-900 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50">
                                    Exit
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="h-1 bg-slate-100 w-full relative">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out absolute left-0 top-0"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                <main className="max-w-3xl mx-auto px-6 py-10">
                    {isCompleted ? (
                        <div className="text-center py-20 animate-in zoom-in duration-500 bg-white rounded-3xl shadow-lg border border-slate-100 p-10">
                            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 ${score === totalQuestions ? 'bg-green-100 text-green-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                <SparklesIcon className="w-12 h-12" />
                            </div>
                            <h2 className="text-4xl font-black text-slate-800 mb-4">
                                {score === totalQuestions ? "Perfect Score!" : "Challenge Complete!"}
                            </h2>
                            <p className="text-slate-500 text-lg mb-2">
                                You scored <span className="font-bold text-indigo-600 text-2xl">{score}</span> out of <span className="font-bold text-slate-700">{totalQuestions}</span>
                            </p>
                            <p className="text-slate-400 text-sm mb-8">
                                {totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0}% accuracy
                            </p>
                            <div className="flex justify-center gap-4">
                                <button onClick={() => initializeGame()} className="px-6 py-3 bg-white border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                                    Play Again
                                </button>
                                <Link href={`/challenges/${drillRefId}`} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all hover:scale-105">
                                    Back to Drills
                                </Link>
                            </div>
                        </div>
                    ) : currentQuestion ? (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-8 md:p-12">
                                <div className="flex items-start gap-3 mb-6">
                                    <div className="shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                        <LightBulbIcon className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Fill in the blank</h3>
                                        <p className="text-xl md:text-2xl font-medium text-slate-800 leading-relaxed">
                                            {currentQuestion.sentence.split('_____').map((part, idx, arr) => (
                                                <span key={idx}>
                                                    {part}
                                                    {idx < arr.length - 1 && (
                                                        <span className="inline-block mx-2 px-4 py-1 bg-indigo-100 text-indigo-600 rounded-lg font-bold border-2 border-dashed border-indigo-300">
                                                            _____
                                                        </span>
                                                    )}
                                                </span>
                                            ))}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {currentQuestion.options.map((option, idx) => {
                                    const isSelected = selectedAnswer === option;
                                    const isCorrect = option === currentQuestion.correctAnswer;
                                    const showFeedback = isAnswered;

                                    let buttonStyle = 'bg-white border-2 border-slate-200 text-slate-700 hover:border-indigo-300 hover:shadow-md';

                                    if (showFeedback) {
                                        if (isSelected && isCorrect) {
                                            buttonStyle = 'bg-green-50 border-2 border-green-500 text-green-700 shadow-lg scale-105';
                                        } else if (isSelected && !isCorrect) {
                                            buttonStyle = 'bg-red-50 border-2 border-red-400 text-red-600 animate-shake';
                                        } else if (!isSelected && isCorrect) {
                                            buttonStyle = 'bg-green-50 border-2 border-green-300 text-green-600';
                                        } else {
                                            buttonStyle = 'bg-slate-50 border-2 border-slate-200 text-slate-400 opacity-50';
                                        }
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleAnswerClick(option)}
                                            disabled={isAnswered}
                                            className={`p-6 rounded-2xl font-bold text-lg transition-all duration-200 text-left ${buttonStyle} ${!isAnswered ? 'active:scale-95 cursor-pointer' : 'cursor-default'}`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span>{option}</span>
                                                {showFeedback && isCorrect && <CheckCircleIcon className="w-6 h-6 text-green-600" />}
                                                {showFeedback && isSelected && !isCorrect && <XCircleIcon className="w-6 h-6 text-red-500" />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-20 text-slate-400 animate-pulse">
                            Loading questions...
                        </div>
                    )}
                </main>

                {notification.visible && (
                    <Notification
                        message={notification.message}
                        type={notification.type}
                        onClose={closeNotification}
                    />
                )}
            </div>
        } />
    );
};

export default ContextMasterChallenge;

export async function getServerSideProps(context) {
    const { params } = context;
    const drillId = params.drillId;
    const challengeId = drillId[0];
    const drillRefId = drillId[1];

    try {
        const drillSetData = await fetchData(`${API_LEXIMENTOR_BASE_URL}/drill/metadata/sets/${drillRefId}`) || { data: [] };
        const drillSetWordData = await fetchData(`${API_LEXIMENTOR_BASE_URL}/drill/metadata/sets/words/data/${drillRefId}`) || { data: [] };
        const challengeScores = await fetchData(`${API_LEXIMENTOR_BASE_URL}/drill/metadata/challenges/challenge/${challengeId}/scores`) || { data: [] };

        return {
            props: { drillSetData, drillSetWordData, challengeId, drillRefId, challengeScores },
        };
    } catch (e) {
        console.error("Error fetching drill data:", e);
        return {
            props: { drillSetData: { data: [] }, drillSetWordData: { data: [] }, challengeId, drillRefId, challengeScores: { data: [] } },
        };
    }
}
