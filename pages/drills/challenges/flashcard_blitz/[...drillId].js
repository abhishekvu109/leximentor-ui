import { useState, useEffect } from "react";
import Link from "next/link";
import Layout from "@/components/layout/Layout";
import { API_LEXIMENTOR_BASE_URL } from "@/constants";
import { fetchData } from "@/dataService";
import {
    ArrowLeftIcon,
    EyeIcon,
    CheckCircleIcon,
    XCircleIcon,
    ExclamationTriangleIcon,
    ArrowPathIcon,
    SparklesIcon
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

const FlashcardBlitzChallenge = ({ drillSetData, drillSetWordData, challengeId, drillRefId }) => {

    // --- State ---
    const [cards, setCards] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isRevealed, setIsRevealed] = useState(false);
    const [responses, setResponses] = useState([]);
    const [isCompleted, setIsCompleted] = useState(false);

    const [notification, setNotification] = useState({ visible: false, message: '', type: '' });

    // --- Init ---
    useEffect(() => {
        if (drillSetWordData?.data) {
            setCards(drillSetWordData.data);
        }
    }, [drillSetWordData]);

    const closeNotification = () => setNotification({ ...notification, visible: false });

    // --- Interaction ---
    const handleReveal = () => {
        setIsRevealed(true);
    };

    const handleRating = (rating) => {
        const currentCard = cards[currentIndex];
        const newResponse = {
            drillSetRefId: currentCard.refId,
            drillChallengeRefId: challengeId,
            response: rating
        };

        setResponses([...responses, newResponse]);

        // Move to next card
        if (currentIndex < cards.length - 1) {
            setTimeout(() => {
                setCurrentIndex(currentIndex + 1);
                setIsRevealed(false);
            }, 300);
        } else {
            // Complete
            handleComplete([...responses, newResponse]);
        }
    };

    const handleComplete = async (finalResponses) => {
        setIsCompleted(true);
        await submitResults(finalResponses);
    };

    const submitResults = async (submissionData) => {
        try {
            const URL = `${API_LEXIMENTOR_BASE_URL}/drill/metadata/challenges/challenge/${challengeId}/scores`;
            await fetch(URL, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submissionData),
            });
            setNotification({ visible: true, message: "Challenge Completed! Progress saved.", type: 'success' });
        } catch (error) {
            console.error(error);
            setNotification({ visible: true, message: "Failed to save progress.", type: 'error' });
        } finally {
            setTimeout(closeNotification, 5000);
        }
    };

    const resetGame = () => {
        if (confirm("Restart flashcard review?")) {
            setCurrentIndex(0);
            setIsRevealed(false);
            setResponses([]);
            setIsCompleted(false);
        }
    };

    const currentCard = cards[currentIndex];
    const progress = cards.length > 0 ? ((currentIndex + 1) / cards.length) * 100 : 0;

    // Calculate stats
    const againCount = responses.filter(r => r.response === 'again').length;
    const hardCount = responses.filter(r => r.response === 'hard').length;
    const easyCount = responses.filter(r => r.response === 'easy').length;

    return (
        <Layout content={
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 pb-20 font-sans">

                {/* Header */}
                <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 shadow-sm">
                    <div className="max-w-4xl mx-auto px-6 py-3">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <Link href={`/challenges/${challengeId}`} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-indigo-600">
                                    <ArrowLeftIcon className="w-5 h-5" />
                                </Link>
                                <div>
                                    <h1 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                                        <SparklesIcon className="w-5 h-5 text-indigo-600" />
                                        Flashcard Blitz
                                    </h1>
                                    <div className="text-xs text-slate-500 font-bold">
                                        Card {currentIndex + 1} / {cards.length}
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

                    {/* Progress Bar */}
                    <div className="h-1 bg-slate-100 w-full relative">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-500 ease-out absolute left-0 top-0"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Main Area */}
                <main className="max-w-2xl mx-auto px-6 py-10">

                    {isCompleted ? (
                        <div className="text-center py-20 animate-in zoom-in duration-500 bg-white rounded-3xl shadow-lg border border-slate-100 p-10">
                            <SparklesIcon className="w-20 h-20 text-indigo-600 mx-auto mb-6" />
                            <h2 className="text-4xl font-black text-slate-800 mb-4">Review Complete!</h2>
                            <p className="text-slate-500 text-lg mb-8">
                                You reviewed <span className="font-bold text-indigo-600">{cards.length}</span> flashcards
                            </p>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4 mb-8">
                                <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                                    <div className="text-3xl font-black text-red-600">{againCount}</div>
                                    <div className="text-xs text-red-600 font-bold uppercase tracking-wider">Again</div>
                                </div>
                                <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                                    <div className="text-3xl font-black text-orange-600">{hardCount}</div>
                                    <div className="text-xs text-orange-600 font-bold uppercase tracking-wider">Hard</div>
                                </div>
                                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                                    <div className="text-3xl font-black text-green-600">{easyCount}</div>
                                    <div className="text-xs text-green-600 font-bold uppercase tracking-wider">Easy</div>
                                </div>
                            </div>

                            <div className="flex justify-center gap-4">
                                <button onClick={() => { setCurrentIndex(0); setIsRevealed(false); setResponses([]); setIsCompleted(false); }} className="px-6 py-3 bg-white border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                                    Review Again
                                </button>
                                <Link href={`/challenges/${drillRefId}`} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all hover:scale-105">
                                    Back to Drills
                                </Link>
                            </div>
                        </div>
                    ) : currentCard ? (
                        <div className="space-y-6">

                            {/* Flashcard */}
                            <div className="relative perspective-1000">
                                <div className={`relative w-full transition-all duration-500 transform-style-3d ${isRevealed ? 'rotate-y-180' : ''}`}>

                                    {/* Front of Card */}
                                    <div className={`bg-white rounded-3xl shadow-2xl border-2 border-indigo-200 p-12 min-h-[400px] flex flex-col items-center justify-center ${isRevealed ? 'hidden' : ''}`}>
                                        <div className="text-center">
                                            <div className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-4">Word</div>
                                            <h2 className="text-6xl font-black text-slate-800 mb-8">{currentCard.word}</h2>
                                            <p className="text-slate-400 text-sm mb-8">Try to recall the meaning...</p>
                                            <button
                                                onClick={handleReveal}
                                                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-bold text-lg hover:from-indigo-700 hover:to-blue-700 shadow-lg shadow-indigo-200 transition-all hover:scale-105 flex items-center gap-3 mx-auto"
                                            >
                                                <EyeIcon className="w-6 h-6" />
                                                Reveal Answer
                                            </button>
                                        </div>
                                    </div>

                                    {/* Back of Card */}
                                    {isRevealed && (
                                        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl shadow-2xl border-2 border-indigo-300 p-12 min-h-[400px] flex flex-col animate-in fade-in zoom-in duration-500">
                                            <div className="flex-1">
                                                <div className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-2">Word</div>
                                                <h2 className="text-4xl font-black text-slate-800 mb-6">{currentCard.word}</h2>
                                                <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Definition</div>
                                                <p className="text-xl text-slate-700 leading-relaxed mb-6">
                                                    {currentCard.meanings?.[0]?.meaning || "Definition not available"}
                                                </p>

                                                {/* Example if available */}
                                                {currentCard.examples?.[0]?.example && (
                                                    <div className="bg-white/60 rounded-xl p-4 border border-indigo-200">
                                                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Example</div>
                                                        <p className="text-sm text-slate-600 italic">{currentCard.examples[0].example}</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Rating Buttons */}
                                            <div className="mt-8">
                                                <p className="text-center text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">How well did you know this?</p>
                                                <div className="grid grid-cols-3 gap-3">
                                                    <button
                                                        onClick={() => handleRating('again')}
                                                        className="p-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-all hover:scale-105 shadow-lg flex flex-col items-center gap-2"
                                                    >
                                                        <XCircleIcon className="w-8 h-8" />
                                                        <span>Again</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleRating('hard')}
                                                        className="p-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition-all hover:scale-105 shadow-lg flex flex-col items-center gap-2"
                                                    >
                                                        <ExclamationTriangleIcon className="w-8 h-8" />
                                                        <span>Hard</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleRating('easy')}
                                                        className="p-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition-all hover:scale-105 shadow-lg flex flex-col items-center gap-2"
                                                    >
                                                        <CheckCircleIcon className="w-8 h-8" />
                                                        <span>Easy</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                </div>
                            </div>

                        </div>
                    ) : (
                        <div className="text-center py-20 text-slate-400">
                            Loading flashcards...
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

export default FlashcardBlitzChallenge;

export async function getServerSideProps(context) {
    const { params } = context;
    const drillId = params.drillId;
    const drillRefId = drillId[0];
    const challengeId = drillId[1];

    try {
        const drillSetData = await fetchData(`${API_LEXIMENTOR_BASE_URL}/drill/metadata/sets/${drillId[0]}`) || { data: [] };
        const drillSetWordData = await fetchData(`${API_LEXIMENTOR_BASE_URL}/drill/metadata/sets/words/data/${drillId[1]}`) || { data: [] };

        return {
            props: { drillSetData, drillSetWordData, challengeId, drillRefId },
        };
    } catch (e) {
        console.error("Error fetching drill data:", e);
        return {
            props: { drillSetData: { data: [] }, drillSetWordData: { data: [] }, challengeId, drillRefId },
        };
    }
}
