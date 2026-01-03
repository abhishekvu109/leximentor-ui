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
    PuzzlePieceIcon,
    ArrowPathIcon,
    CheckIcon,
    SparklesIcon,
    XMarkIcon
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

// Utilities
const shuffleArray = (array) => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
};

const MatchMeaningChallenge = () => {
    const router = useRouter();
    const { drillId } = router.query; // [...drillId] -> [challengeId, drillRefId]

    // --- State ---
    const [drillSetData, setDrillSetData] = useState({ data: [] });
    const [drillSetWordData, setDrillSetWordData] = useState({ data: [] });
    const [challengeScores, setChallengeScores] = useState({ data: [] });

    const [words, setWords] = useState([]);
    const [meanings, setMeanings] = useState([]);
    const [selectedWord, setSelectedWord] = useState(null);

    // Logic State
    const [matchedPairs, setMatchedPairs] = useState(new Set()); // Successfully matched refIds
    const [incorrectPairs, setIncorrectPairs] = useState(new Set()); // Failed refIds (One chance policy)

    const [wrongAttempt, setWrongAttempt] = useState({ wordId: null, meaningId: null });
    const [isCompleted, setIsCompleted] = useState(false);

    const [notification, setNotification] = useState({ visible: false, message: '', type: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    const challengeId = drillId?.[0];
    const drillRefId = drillId?.[1];

    // --- Init ---
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
                        initializeGame(wordData.data, scores.data, setData.data);
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

    const initializeGame = (data, scores, setData) => {
        // Map scores to words to get scoreRefId
        const mapped = scores.map(scoreItem => {
            // Find the join record in drillSetData
            const setItem = setData.find(d => d.refId === scoreItem.drillSetRefId);
            if (!setItem) return null;

            // Find the full word data in drillSetWordData
            const wordItem = data.find(w => w.refId === setItem.wordRefId);
            if (!wordItem) return null;

            return {
                ...wordItem,
                scoreRefId: scoreItem.refId,
                drillChallengeRefId: challengeId,
                drillSetRefId: scoreItem.drillSetRefId,
            };
        }).filter(Boolean);

        setWords(mapped);

        // Extract meanings safely
        const meaningsList = mapped.map(item => ({
            refId: item.refId,
            text: item.meanings?.[0]?.meaning || item.meaning || item.description || "Definition unavailable"
        }));

        setMeanings(shuffleArray(meaningsList));
        setMatchedPairs(new Set());
        setIncorrectPairs(new Set());
        setSelectedWord(null);
        setIsCompleted(false);
    };

    const closeNotification = () => setNotification({ ...notification, visible: false });

    // --- Interaction ---
    const handleWordClick = (item) => {
        // Prevent interaction if already matched or failed
        if (matchedPairs.has(item.refId) || incorrectPairs.has(item.refId)) return;

        // Toggle selection off if clicking the same word
        if (selectedWord === item.refId) {
            setSelectedWord(null);
        } else {
            setSelectedWord(item.refId);
        }
        setWrongAttempt({ wordId: null, meaningId: null }); // Clear any prev error visual
    };

    const handleMeaningClick = (meaningItem) => {
        // Prevent interaction if word matching this meaning is already resolved (matched or failed)
        if (matchedPairs.has(meaningItem.refId) || incorrectPairs.has(meaningItem.refId)) return;

        if (!selectedWord) {
            // Shake meaningful feedback? "Select a word first"
            setNotification({ visible: true, message: "Select a word from the bank first!", type: 'error' });
            setTimeout(() => setNotification({ visible: false, message: '', type: '' }), 1500);
            return;
        }

        if (selectedWord === meaningItem.refId) {
            // --- MATCH ---
            const newMatched = new Set(matchedPairs);
            newMatched.add(selectedWord);
            setMatchedPairs(newMatched);

            setSelectedWord(null);
            checkCompletion(newMatched, incorrectPairs);
        } else {
            // --- MISMATCH (One Chance Policy) ---

            // Visual feedback first
            setWrongAttempt({ wordId: selectedWord, meaningId: meaningItem.refId });

            // Mark the SELECTED WORD as failed.
            const newIncorrect = new Set(incorrectPairs);
            newIncorrect.add(selectedWord);
            setIncorrectPairs(newIncorrect);

            // Reset selection after delay
            setTimeout(() => {
                setWrongAttempt({ wordId: null, meaningId: null });
                setSelectedWord(null);
                checkCompletion(matchedPairs, newIncorrect);
            }, 800);
        }
    };

    const checkCompletion = (matched, incorrect) => {
        // Game ends when every word is either matched or incorrect
        if ((matched.size + incorrect.size) === words.length) {
            setTimeout(() => handleComplete(matched), 500);
        }
    };

    const handleComplete = async (finalMatched) => {
        setIsCompleted(true);
        // Prepare submission
        const submissionData = words.map(w => ({
            refId: w.scoreRefId,
            drillChallengeRefId: challengeId,
            drillSetRefId: w.drillSetRefId,
            question: w.word,
            response: finalMatched.has(w.refId) ? (w.meanings?.[0]?.meaning || "Matched") : "Incorrect Match",
            isCorrect: finalMatched.has(w.refId),
            correct: finalMatched.has(w.refId)
        }));

        await submitResults(submissionData);
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
        if (confirm("Restart the matching game?")) {
            initializeGame(drillSetWordData?.data || []);
        }
    };

    // Calculate progress
    const totalWords = words.length;
    const progress = totalWords > 0 ? ((matchedPairs.size + incorrectPairs.size) / totalWords) * 100 : 0;

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
                    <div className="max-w-6xl mx-auto px-6 py-3">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-4">
                                <Link href={`/challenges/${drillRefId}`} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-indigo-600">
                                    <ArrowLeftIcon className="w-5 h-5" />
                                </Link>
                                <div>
                                    <h1 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                                        <PuzzlePieceIcon className="w-5 h-5 text-indigo-600" />
                                        Match Meaning
                                    </h1>
                                    <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider mt-0.5">
                                        <span className="text-green-600 flex items-center gap-1">
                                            <CheckCircleIcon className="w-3.5 h-3.5" />
                                            {matchedPairs.size}
                                        </span>
                                        <span className="text-red-500 flex items-center gap-1">
                                            <XCircleIcon className="w-3.5 h-3.5" />
                                            {incorrectPairs.size}
                                        </span>
                                        <span className="text-slate-400">
                                            / {words.length} Words
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={resetGame}
                                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                    title="Shuffle / Reset"
                                >
                                    <ArrowPathIcon className="w-5 h-5" />
                                </button>
                                <Link href="/dashboard/dashboard2" className="text-xs font-bold text-slate-500 hover:text-slate-900 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50">
                                    Exit
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Progress Line */}
                    <div className="h-0.5 bg-slate-100 w-full relative">
                        <div
                            className="h-full bg-indigo-500 transition-all duration-500 ease-out absolute left-0 top-0"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Main Game Area */}
                <main className="max-w-6xl mx-auto px-6 py-6 space-y-8">

                    {isCompleted ? (
                        <div className="text-center py-20 animate-in zoom-in duration-500 bg-white rounded-3xl shadow-sm border border-slate-100 max-w-2xl mx-auto mt-10">
                            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 ${incorrectPairs.size === 0 ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                                <SparklesIcon className="w-12 h-12" />
                            </div>
                            <h2 className="text-4xl font-black text-slate-800 mb-4">
                                {incorrectPairs.size === 0 ? "Perfect Score!" : "Challenge Complete!"}
                            </h2>
                            <p className="text-slate-500 text-lg mb-8">
                                You matched <span className="font-bold text-indigo-600">{matchedPairs.size}</span> correctly
                                and missed <span className="font-bold text-red-500">{incorrectPairs.size}</span>.
                            </p>
                            <div className="flex justify-center gap-4">
                                <button onClick={() => initializeGame(drillSetWordData.data, challengeScores.data, drillSetData.data)} className="px-6 py-3 bg-white border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                                    Play Again
                                </button>
                                <Link href={`/challenges/${drillRefId}`} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all hover:scale-105">
                                    Back to Drills
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* 1. Word Bank (Sticky-ish top area) */}
                            <div className="bg-slate-100/80 backdrop-blur-sm p-5 rounded-2xl border border-white/50 shadow-inner">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Link href="#" className="hover:text-amber-500">Pick a Word</Link>
                                    <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                                    {words.length - (matchedPairs.size + incorrectPairs.size)} remaining
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {words.map((item) => {
                                        const isMatched = matchedPairs.has(item.refId);
                                        const isIncorrect = incorrectPairs.has(item.refId);
                                        const isSelected = selectedWord === item.refId;
                                        const isWrong = wrongAttempt.wordId === item.refId;

                                        return (
                                            <button
                                                key={item.refId}
                                                onClick={() => handleWordClick(item)}
                                                disabled={isMatched || isIncorrect}
                                                className={`
                                                    px-4 py-2 rounded-full text-sm font-bold border transition-all duration-200 transform
                                                    ${isMatched
                                                        ? 'bg-green-100 border-green-200 text-green-700 opacity-60 scale-90 cursor-default shadow-none'
                                                        : isIncorrect
                                                            ? 'bg-red-50 border-red-200 text-red-400 opacity-50 scale-90 cursor-not-allowed decoration-line-through'
                                                            : isSelected
                                                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-md scale-105 ring-2 ring-indigo-200'
                                                                : isWrong
                                                                    ? 'bg-red-600 border-red-600 text-white animate-shake'
                                                                    : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-sm active:scale-95'
                                                    }
                                                `}
                                            >
                                                <span className="flex items-center gap-1.5">
                                                    {item.word}
                                                    {isMatched && <CheckIcon className="w-3.5 h-3.5" />}
                                                    {isIncorrect && <XMarkIcon className="w-3.5 h-3.5" />}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* 2. Meanings Grid */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Select the Meaning</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {meanings.map((item) => {
                                        const isMatched = matchedPairs.has(item.refId);
                                        const isMissed = incorrectPairs.has(item.refId);
                                        const isWrongAttempt = wrongAttempt.meaningId === item.refId;
                                        const isTargetForSelected = selectedWord === item.refId; // Cheat mode for dev? No.

                                        return (
                                            <button
                                                key={item.refId}
                                                onClick={() => handleMeaningClick(item)}
                                                disabled={isMatched || isMissed}
                                                className={`
                                                    h-full text-left p-5 rounded-2xl border-2 transition-all duration-200 relative flex flex-col justify-center
                                                    ${isMatched
                                                        ? 'bg-green-50 border-green-200 text-green-800 opacity-60'
                                                        : isMissed
                                                            ? 'bg-slate-50 border-slate-100 text-slate-300 opacity-40 cursor-not-allowed'
                                                            : isWrongAttempt
                                                                ? 'bg-red-50 border-red-400 text-red-600 animate-shake'
                                                                : selectedWord // Hover state changes if a word is selected
                                                                    ? 'bg-white border-slate-200 text-slate-600 hover:border-indigo-400 hover:shadow-md hover:scale-[1.01] hover:bg-indigo-50 cursor-pointer'
                                                                    : 'bg-white border-slate-200 text-slate-600 opacity-90 hover:opacity-100' // Bit clearer if waiting for word
                                                    }
                                                `}
                                            >
                                                <p className="text-sm font-medium leading-relaxed">
                                                    {item.text}
                                                </p>

                                                {/* Optional: Show label if matched for clarity */}
                                                {isMatched && (
                                                    <div className="absolute top-2 right-2">
                                                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
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

export default MatchMeaningChallenge;
