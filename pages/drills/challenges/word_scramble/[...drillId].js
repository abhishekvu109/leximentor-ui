import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Layout from "@/components/layout/Layout";
import leximentorService from "../../../../services/leximentor.service";
import {
    ArrowLeftIcon,
    CheckCircleIcon,
    XCircleIcon,
    ArrowPathIcon,
    SparklesIcon,
    BackspaceIcon,
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

// Utility to shuffle array
const shuffleArray = (array) => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
};

const WordScrambleChallenge = () => {
    const router = useRouter();
    const { drillId } = router.query; // [...drillId] -> [challengeId, drillRefId]

    // --- State ---
    const [words, setWords] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [scrambledLetters, setScrambledLetters] = useState([]);
    const [userAnswer, setUserAnswer] = useState([]);
    const [isCorrect, setIsCorrect] = useState(null);
    const [showHint, setShowHint] = useState(false);
    const [responses, setResponses] = useState([]);
    const [isCompleted, setIsCompleted] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [loading, setLoading] = useState(true);

    const [notification, setNotification] = useState({ visible: false, message: '', type: '' });

    const challengeId = drillId?.[0];
    const drillRefId = drillId?.[1];

    // --- Fetching ---
    useEffect(() => {
        if (drillRefId && challengeId) {
            setLoading(true);
            const fetchDataAsync = async () => {
                try {
                    const [drillSetData, drillSetWordData, challengeScores] = await Promise.all([
                        leximentorService.getDrillSet(drillRefId),
                        leximentorService.getDrillSetWords(drillRefId),
                        leximentorService.getChallengeScores(challengeId)
                    ]);

                    if (drillSetWordData?.data && challengeScores?.data && drillSetData?.data) {
                        initializeGame(drillSetWordData.data, challengeScores.data, drillSetData.data);
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
        // Map scores to words using drillSetData join table
        const mapped = scores.map(scoreItem => {
            const setItem = setData.find(d => d.refId === scoreItem.drillSetRefId);
            if (!setItem) return null;

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
        if (mapped.length > 0) {
            setCurrentIndex(0);
            initializeWord(mapped[0]);
        }
        setResponses([]);
        setIsCompleted(false);
    };

    const initializeWord = (wordData) => {
        const letters = wordData.word.split('').map((letter, idx) => ({
            id: idx,
            letter: letter,
            used: false
        }));
        setScrambledLetters(shuffleArray(letters));
        setUserAnswer([]);
        setIsCorrect(null);
        setShowHint(false);
        setAttempts(0);
    };

    const closeNotification = () => setNotification({ ...notification, visible: false });

    // --- Interaction ---
    const handleLetterClick = (letterId) => {
        const letter = scrambledLetters.find(l => l.id === letterId);
        if (letter.used) return;

        // Add to answer
        setUserAnswer([...userAnswer, { id: letterId, letter: letter.letter }]);
        setScrambledLetters(scrambledLetters.map(l =>
            l.id === letterId ? { ...l, used: true } : l
        ));
    };

    const handleRemoveLetter = (index) => {
        const removedLetter = userAnswer[index];
        setUserAnswer(userAnswer.filter((_, i) => i !== index));
        setScrambledLetters(scrambledLetters.map(l =>
            l.id === removedLetter.id ? { ...l, used: false } : l
        ));
    };

    const handleClear = () => {
        setUserAnswer([]);
        setScrambledLetters(scrambledLetters.map(l => ({ ...l, used: false })));
    };

    const handleSubmit = () => {
        const currentWord = words[currentIndex];
        const userWord = userAnswer.map(l => l.letter).join('');
        const correctWord = currentWord.word;

        setAttempts(attempts + 1);

        if (userWord.toLowerCase() === correctWord.toLowerCase()) {
            // Correct!
            setIsCorrect(true);

            const newResponse = {
                refId: currentWord.scoreRefId,
                drillChallengeRefId: challengeId,
                drillSetRefId: currentWord.drillSetRefId,
                question: currentWord.word,
                response: userWord,
                isCorrect: true,
                correct: true
            };
            const updatedResponses = [...responses, newResponse];
            setResponses(updatedResponses);

            // Move to next after delay
            setTimeout(() => {
                if (currentIndex < words.length - 1) {
                    const nextIndex = currentIndex + 1;
                    setCurrentIndex(nextIndex);
                    initializeWord(words[nextIndex]);
                } else {
                    handleComplete(updatedResponses);
                }
            }, 1500);
        } else {
            // Incorrect
            setIsCorrect(false);
            setTimeout(() => {
                setIsCorrect(null);
            }, 1000);
        }
    };

    const handleSkip = () => {
        const currentWord = words[currentIndex];

        const newResponse = {
            refId: currentWord.scoreRefId,
            drillChallengeRefId: challengeId,
            drillSetRefId: currentWord.drillSetRefId,
            question: currentWord.word,
            response: "Skipped",
            isCorrect: false,
            correct: false
        };

        const updatedResponses = [...responses, newResponse];
        setResponses(updatedResponses);

        if (currentIndex < words.length - 1) {
            const nextIndex = currentIndex + 1;
            setCurrentIndex(nextIndex);
            initializeWord(words[nextIndex]);
        } else {
            handleComplete(updatedResponses);
        }
    };

    const handleComplete = async (finalResponses) => {
        setIsCompleted(true);
        await submitResults(finalResponses);
    };

    const submitResults = async (submissionData) => {
        try {
            await leximentorService.updateChallengeScores(challengeId, submissionData);
            setNotification({ visible: true, message: "Challenge Completed! Progress saved.", type: 'success' });
        } catch (error) {
            console.error(error);
            setNotification({ visible: true, message: "Failed to save progress.", type: 'error' });
        } finally {
            setTimeout(closeNotification, 5000);
        }
    };

    const currentWord = words[currentIndex];
    const progress = words.length > 0 ? ((currentIndex + 1) / words.length) * 100 : 0;

    return (
        <Layout content={
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 pb-20 font-sans">

                {/* Header */}
                <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 shadow-sm">
                    <div className="max-w-4xl mx-auto px-6 py-3">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <Link href={`/challenges/${challengeId}`} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-purple-600">
                                    <ArrowLeftIcon className="w-5 h-5" />
                                </Link>
                                <div>
                                    <h1 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                                        <SparklesIcon className="w-5 h-5 text-purple-600" />
                                        Word Scramble
                                    </h1>
                                    <div className="text-xs text-slate-500 font-bold">
                                        Word {currentIndex + 1} / {words.length}
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
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ease-out absolute left-0 top-0"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Main Area */}
                <main className="max-w-3xl mx-auto px-6 py-10">

                    {isCompleted ? (
                        <div className="text-center py-20 animate-in zoom-in duration-500 bg-white rounded-3xl shadow-lg border border-slate-100 p-10">
                            <SparklesIcon className="w-20 h-20 text-purple-600 mx-auto mb-6" />
                            <h2 className="text-4xl font-black text-slate-800 mb-4">All Words Unscrambled!</h2>
                            <p className="text-slate-500 text-lg mb-8">
                                You completed <span className="font-bold text-purple-600">{words.length}</span> words
                            </p>
                            <div className="flex justify-center gap-4">
                                <Link href={`/challenges/${challengeId}`} className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 shadow-lg shadow-purple-200 transition-all hover:scale-105">
                                    Back to Drills
                                </Link>
                            </div>
                        </div>
                    ) : currentWord ? (
                        <div className="space-y-8">

                            {/* Hint Section */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Definition</div>
                                        <p className="text-lg text-slate-700 leading-relaxed">
                                            {currentWord.meanings?.[0]?.meaning || "Unscramble the letters to form a word"}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setShowHint(!showHint)}
                                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                        title="Show hint"
                                    >
                                        <LightBulbIcon className="w-6 h-6" />
                                    </button>
                                </div>

                                {showHint && (
                                    <div className="mt-4 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">Hint</div>
                                        <p className="text-sm text-slate-600">
                                            The word has <span className="font-bold text-purple-600">{currentWord.word.length}</span> letters
                                            {currentWord.word.length > 2 && ` and starts with "${currentWord.word[0].toUpperCase()}"`}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* User Answer Area */}
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border-2 border-dashed border-purple-200 min-h-[120px]">
                                <div className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-4 text-center">Your Answer</div>
                                <div className="flex flex-wrap justify-center gap-2 min-h-[60px]">
                                    {userAnswer.length === 0 ? (
                                        <div className="text-slate-400 text-sm italic">Click letters below to build your answer...</div>
                                    ) : (
                                        userAnswer.map((item, index) => (
                                            <button
                                                key={`answer-${index}`}
                                                onClick={() => handleRemoveLetter(index)}
                                                className="w-14 h-14 bg-white border-2 border-purple-400 rounded-xl font-black text-2xl text-purple-700 hover:bg-red-50 hover:border-red-400 transition-all shadow-md hover:scale-105"
                                            >
                                                {item.letter.toUpperCase()}
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Scrambled Letters */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 text-center">Available Letters</div>
                                <div className="flex flex-wrap justify-center gap-3">
                                    {scrambledLetters.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => handleLetterClick(item.id)}
                                            disabled={item.used}
                                            className={`w-14 h-14 rounded-xl font-black text-2xl transition-all shadow-md
                                                ${item.used
                                                    ? 'bg-slate-100 text-slate-300 border-2 border-slate-200 cursor-not-allowed opacity-50'
                                                    : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white border-2 border-purple-600 hover:scale-110 active:scale-95 cursor-pointer'
                                                }
                                            `}
                                        >
                                            {item.letter.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={handleClear}
                                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                                >
                                    <BackspaceIcon className="w-5 h-5" />
                                    Clear
                                </button>
                                <button
                                    onClick={handleSkip}
                                    className="flex-1 py-3 bg-white border-2 border-slate-200 text-slate-500 hover:border-red-200 hover:text-red-500 hover:bg-red-50 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                                >
                                    Skip Word
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={userAnswer.length === 0}
                                    className={`flex-[2] py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg
                                        ${userAnswer.length === 0
                                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                            : isCorrect === true
                                                ? 'bg-green-500 text-white'
                                                : isCorrect === false
                                                    ? 'bg-red-500 text-white animate-shake'
                                                    : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 hover:scale-105'
                                        }
                                    `}
                                >
                                    {isCorrect === true ? (
                                        <>
                                            <CheckCircleIcon className="w-5 h-5" />
                                            Correct!
                                        </>
                                    ) : isCorrect === false ? (
                                        <>
                                            <XCircleIcon className="w-5 h-5" />
                                            Try Again
                                        </>
                                    ) : (
                                        'Submit Answer'
                                    )}
                                </button>
                            </div>

                        </div>
                    ) : loading ? (
                        <div className="text-center py-20 text-slate-400 animate-pulse font-bold text-xl">
                            Loading words...
                        </div>
                    ) : (
                        <div className="text-center py-20 text-red-400 font-bold">
                            Failed to load challenge.
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

export default WordScrambleChallenge;
