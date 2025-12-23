import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Layout from "@/components/layout/Layout";
import { API_LEXIMENTOR_BASE_URL } from "@/constants";
import { fetchData } from "@/dataService";
import {
    ArrowLeftIcon,
    HeartIcon,
    TrophyIcon,
    PlayIcon,
    ArrowPathIcon,
    BoltIcon
} from "@heroicons/react/24/solid";
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";

// --- Components ---

const Notification = ({ message, type, onClose }) => {
    if (!message) return null;
    const isSuccess = type === 'success';

    return (
        <div className={`fixed bottom-6 right-6 max-w-sm w-full bg-white rounded-xl shadow-2xl border-l-4 p-4 flex items-start gap-4 z-50 animate-in slide-in-from-right-10 fade-in duration-300 ${isSuccess ? 'border-green-500' : 'border-red-500'}`}>
            <div className={`shrink-0 ${isSuccess ? 'text-green-500' : 'text-red-500'}`}>
                {isSuccess ? <TrophyIcon className="w-6 h-6" /> : <HeartIcon className="w-6 h-6" />}
            </div>
            <div className="flex-1 pt-0.5">
                <h3 className="font-bold text-slate-800 text-sm mb-1">{isSuccess ? "Success" : "Game Over"}</h3>
                <p className="text-slate-600 text-sm leading-snug">{message}</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                <span className="sr-only">Close</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
    );
};

const FallingItem = ({ item, onReachBottom }) => {
    const [position, setPosition] = useState(0);
    const speed = item.speed || 1;

    useEffect(() => {
        const interval = setInterval(() => {
            setPosition(prev => {
                const newPos = prev + speed;
                if (newPos >= 100) {
                    onReachBottom(item.id);
                    return 100;
                }
                return newPos;
            });
        }, 50);

        return () => clearInterval(interval);
    }, [item.id, speed, onReachBottom]);

    return (
        <div
            className="absolute left-0 right-0 mx-auto w-80 transition-all duration-75 ease-linear"
            style={{
                top: `${position}%`,
                left: `${item.xPosition}%`,
                transform: 'translateX(-50%)'
            }}
        >
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white p-4 rounded-xl shadow-2xl border-2 border-white/20">
                <p className="text-sm font-medium leading-relaxed">{item.definition}</p>
            </div>
        </div>
    );
};

const SpeedTyperChallenge = ({ drillSetData, drillSetWordData, challengeId, drillRefId }) => {

    // --- State ---
    const [words, setWords] = useState([]);
    const [fallingItems, setFallingItems] = useState([]);
    const [currentInput, setCurrentInput] = useState('');
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(5);
    const [level, setLevel] = useState(1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isGameOver, setIsGameOver] = useState(false);
    const [wordQueue, setWordQueue] = useState([]);

    const [notification, setNotification] = useState({ visible: false, message: '', type: '' });
    const [difficulty, setDifficulty] = useState(1); // 0.5 = slower, 1 = normal, 1.5 = faster
    const inputRef = useRef(null);
    const nextIdRef = useRef(0);
    const spawnIntervalRef = useRef(null);

    // --- Init ---
    useEffect(() => {
        if (drillSetWordData?.data) {
            const wordList = drillSetWordData.data.map(item => ({
                word: item.word.toLowerCase(),
                definition: item.meanings?.[0]?.meaning || `Definition of ${item.word}`,
                refId: item.refId
            }));
            setWords(wordList);
            setWordQueue([...wordList]);
        }
    }, [drillSetWordData]);

    const closeNotification = () => setNotification({ ...notification, visible: false });

    // --- Game Logic ---
    const startGame = () => {
        setIsPlaying(true);
        setIsGameOver(false);
        setScore(0);
        setLives(5);
        setLevel(1);
        setFallingItems([]);
        setCurrentInput('');
        setWordQueue([...words]);

        // Focus input
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    const spawnItem = () => {
        if (wordQueue.length === 0 || fallingItems.length >= 5) return;

        const randomIndex = Math.floor(Math.random() * wordQueue.length);
        const wordData = wordQueue[randomIndex];

        const newItem = {
            id: nextIdRef.current++,
            word: wordData.word,
            definition: wordData.definition,
            refId: wordData.refId,
            xPosition: 20 + Math.random() * 60, // Random horizontal position
            speed: 0.5 + (level * 0.2) // Speed increases with level
        };

        setFallingItems(prev => [...prev, newItem]);
        setWordQueue(prev => prev.filter((_, idx) => idx !== randomIndex));
    };

    useEffect(() => {
        if (!isPlaying || isGameOver) {
            if (spawnIntervalRef.current) {
                clearInterval(spawnIntervalRef.current);
            }
            return;
        }

        const spawnDelay = Math.max((2000 - (level * 200)) / difficulty, 500);
        spawnIntervalRef.current = setInterval(spawnItem, spawnDelay);

        return () => {
            if (spawnIntervalRef.current) {
                clearInterval(spawnIntervalRef.current);
            }
        };
    }, [isPlaying, isGameOver, level, wordQueue, fallingItems.length, difficulty, spawnItem]);

    const handleInputChange = (e) => {
        const input = e.target.value.toLowerCase();
        setCurrentInput(input);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            const input = currentInput.trim();
            if (!input) return;

            // Check for match
            const matchedItem = fallingItems.find(item => item.word === input);
            if (matchedItem) {
                handleCorrectMatch(matchedItem);
                setCurrentInput('');
            } else {
                // Wrong word - shake effect or feedback
                setCurrentInput('');
            }
        }
    };

    const handleCorrectMatch = (item) => {
        setFallingItems(prev => prev.filter(i => i.id !== item.id));
        setScore(prev => prev + 10);

        // Level up every 50 points
        if ((score + 10) % 50 === 0) {
            setLevel(prev => prev + 1);
        }
    };

    const handleReachBottom = (itemId) => {
        const item = fallingItems.find(i => i.id === itemId);
        if (!item) return;

        setFallingItems(prev => prev.filter(i => i.id !== itemId));
        setLives(prev => {
            const newLives = prev - 1;
            if (newLives <= 0) {
                endGame();
            }
            return newLives;
        });
    };

    const endGame = () => {
        setIsPlaying(false);
        setIsGameOver(true);

        if (spawnIntervalRef.current) {
            clearInterval(spawnIntervalRef.current);
        }

        submitResults();
    };

    const submitResults = async () => {
        try {
            const submissionData = words.map(w => ({
                drillSetRefId: w.refId,
                drillChallengeRefId: challengeId,
                response: score.toString()
            }));

            const URL = `${API_LEXIMENTOR_BASE_URL}/drill/metadata/challenges/challenge/${challengeId}/scores`;
            await fetch(URL, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submissionData),
            });
            setNotification({ visible: true, message: `Final Score: ${score}! Progress saved.`, type: 'success' });
        } catch (error) {
            console.error(error);
            setNotification({ visible: true, message: "Failed to save progress.", type: 'error' });
        } finally {
            setTimeout(closeNotification, 5000);
        }
    };

    return (
        <Layout content={
            <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 pb-20 font-sans overflow-hidden">

                {/* Header HUD */}
                <div className="bg-black/40 backdrop-blur-md border-b border-white/10 sticky top-0 z-30">
                    <div className="max-w-6xl mx-auto px-6 py-3">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <Link href={`/challenges/${challengeId}`} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white">
                                    <ArrowLeftIcon className="w-5 h-5" />
                                </Link>
                                <div>
                                    <h1 className="text-lg font-extrabold text-white flex items-center gap-2">
                                        <BoltIcon className="w-5 h-5 text-yellow-400" />
                                        Speed Typer
                                    </h1>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                {/* Score */}
                                <div className="text-center">
                                    <div className="text-2xl font-black text-yellow-400">{score}</div>
                                    <div className="text-xs text-white/60 uppercase tracking-wider">Score</div>
                                </div>

                                {/* Level */}
                                <div className="text-center">
                                    <div className="text-2xl font-black text-purple-400">{level}</div>
                                    <div className="text-xs text-white/60 uppercase tracking-wider">Level</div>
                                </div>

                                {/* Lives */}
                                <div className="flex gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        i < lives ?
                                            <HeartIcon key={i} className="w-6 h-6 text-red-500" /> :
                                            <HeartOutline key={i} className="w-6 h-6 text-white/20" />
                                    ))}
                                </div>

                                {/* Difficulty Controls */}
                                {isPlaying && (
                                    <div className="flex items-center gap-2 ml-4 border-l border-white/20 pl-4">
                                        <span className="text-xs text-white/60 uppercase tracking-wider">Flow</span>
                                        <button
                                            onClick={() => setDifficulty(Math.max(0.5, difficulty - 0.25))}
                                            className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white"
                                            title="Slower"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                            </svg>
                                        </button>
                                        <span className="text-sm font-bold text-white min-w-[3ch] text-center">
                                            {difficulty === 0.5 ? '½' : difficulty === 0.75 ? '¾' : difficulty === 1 ? '1' : difficulty === 1.25 ? '1¼' : '1½'}×
                                        </span>
                                        <button
                                            onClick={() => setDifficulty(Math.min(1.5, difficulty + 0.25))}
                                            className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white"
                                            title="Faster"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Game Area */}
                <main className="relative h-[calc(100vh-200px)] max-w-6xl mx-auto">

                    {!isPlaying && !isGameOver && (
                        <div className="absolute inset-0 flex items-center justify-center z-20">
                            <div className="text-center bg-black/60 backdrop-blur-md p-12 rounded-3xl border border-white/20">
                                <BoltIcon className="w-20 h-20 text-yellow-400 mx-auto mb-6" />
                                <h2 className="text-4xl font-black text-white mb-4">Speed Typer</h2>
                                <p className="text-white/80 mb-8 max-w-md">
                                    Type the words before the definitions hit the bottom!<br />
                                    You have <span className="font-bold text-red-400">5 lives</span>.
                                </p>
                                <button
                                    onClick={startGame}
                                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold text-lg hover:from-purple-700 hover:to-indigo-700 shadow-2xl flex items-center gap-3 mx-auto transition-all hover:scale-105"
                                >
                                    <PlayIcon className="w-6 h-6" />
                                    Start Game
                                </button>
                            </div>
                        </div>
                    )}

                    {isGameOver && (
                        <div className="absolute inset-0 flex items-center justify-center z-20">
                            <div className="text-center bg-black/80 backdrop-blur-md p-12 rounded-3xl border border-white/20 max-w-lg">
                                <TrophyIcon className="w-20 h-20 text-yellow-400 mx-auto mb-6" />
                                <h2 className="text-4xl font-black text-white mb-4">Game Over!</h2>
                                <p className="text-white/80 mb-2">Final Score</p>
                                <div className="text-6xl font-black text-yellow-400 mb-8">{score}</div>
                                <div className="flex justify-center gap-4">
                                    <button
                                        onClick={startGame}
                                        className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-xl font-bold hover:bg-white/20 transition-colors flex items-center gap-2"
                                    >
                                        <ArrowPathIcon className="w-5 h-5" />
                                        Play Again
                                    </button>
                                    <Link
                                        href={`/challenges/${drillRefId}`}
                                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-indigo-700 transition-all"
                                    >
                                        Back to Drills
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Falling Items */}
                    {isPlaying && fallingItems.map(item => (
                        <FallingItem
                            key={item.id}
                            item={item}
                            onReachBottom={handleReachBottom}
                        />
                    ))}

                </main>

                {/* Input Bar */}
                {isPlaying && (
                    <div className="fixed bottom-0 left-0 right-0 bg-black/60 backdrop-blur-md border-t border-white/20 p-6 z-30">
                        <div className="max-w-2xl mx-auto">
                            <input
                                ref={inputRef}
                                type="text"
                                value={currentInput}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                placeholder="Type the word here..."
                                className="w-full px-6 py-4 bg-white/10 border-2 border-white/20 rounded-xl text-white text-2xl font-bold placeholder-white/40 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/50"
                                autoFocus
                            />
                        </div>
                    </div>
                )}

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

export default SpeedTyperChallenge;

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
