import { useEffect, useState } from "react";
import { API_LEXIMENTOR_BASE_URL } from "@/constants";
import { fetchData, fetchWithAuth } from "@/dataService";
import { ChevronLeftIcon, ChevronRightIcon, SpeakerWaveIcon } from "@heroicons/react/24/solid";
import { BookOpenIcon, LightBulbIcon, TagIcon } from "@heroicons/react/24/outline";
import { API_TEXT_TO_SPEECH } from "@/constants";

const ModernFlashcard = ({ word, onFlip, isFlipped }) => {
    const [localFlipped, setLocalFlipped] = useState(false);

    useEffect(() => {
        setLocalFlipped(isFlipped);
    }, [isFlipped]);

    const handleClick = () => {
        setLocalFlipped(!localFlipped);
        onFlip?.();
    };

    return (
        <div className="w-full max-w-2xl mx-auto" style={{ perspective: '1000px' }}>
            <div
                className="relative w-full h-[500px] cursor-pointer transition-transform duration-700"
                onClick={handleClick}
                style={{
                    transformStyle: 'preserve-3d',
                    transform: localFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                }}
            >
                {/* Front Face - Word */}
                <div
                    className="absolute w-full h-full rounded-3xl shadow-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 flex flex-col items-center justify-center"
                    style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden'
                    }}
                >
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-8">
                            <BookOpenIcon className="w-5 h-5 text-white" />
                            <span className="text-white font-bold text-sm uppercase tracking-wider">Word</span>
                        </div>
                        <h1 className="text-7xl font-black text-white mb-6 drop-shadow-lg">
                            {word?.data?.word || "Loading..."}
                        </h1>
                        <p className="text-white/80 text-lg">Click to reveal meaning</p>
                    </div>
                </div>

                {/* Back Face - Details */}
                <div
                    className="absolute w-full h-full rounded-3xl shadow-2xl bg-white p-8 overflow-y-auto"
                    style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)'
                    }}
                >
                    <div className="space-y-6">
                        {/* Word Header */}
                        <div className="text-center pb-4 border-b-2 border-indigo-100">
                            <h2 className="text-4xl font-black text-slate-800 mb-2">{word?.data?.word}</h2>
                            {word?.data?.pronunciation && (
                                <p className="text-slate-500 italic">/{word.data.pronunciation}/</p>
                            )}
                        </div>

                        {/* Meanings */}
                        {word?.data?.meanings && word.data.meanings.length > 0 && (
                            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <BookOpenIcon className="w-5 h-5 text-indigo-600" />
                                    <h3 className="font-bold text-indigo-900 uppercase tracking-wider text-sm">Meanings</h3>
                                </div>
                                <ul className="space-y-2">
                                    {word.data.meanings.map((item, index) => (
                                        <li key={index} className="text-slate-700 leading-relaxed flex gap-2">
                                            <span className="text-indigo-600 font-bold">{index + 1}.</span>
                                            <span>{item.meaning}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Local Meaning */}
                        {word?.data?.localMeaning && (
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6">
                                <h3 className="font-bold text-green-900 uppercase tracking-wider text-sm mb-2">Local Translation</h3>
                                <p className="text-slate-700">{word.data.localMeaning}</p>
                            </div>
                        )}

                        {/* Part of Speech */}
                        {word?.data?.partsOfSpeeches && word.data.partsOfSpeeches.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {word.data.partsOfSpeeches.map((item, index) => (
                                    <span key={index} className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-bold">
                                        <TagIcon className="w-4 h-4" />
                                        {item.pos}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Mnemonic */}
                        {word?.data?.mnemonic && (
                            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <LightBulbIcon className="w-5 h-5 text-orange-600" />
                                    <h3 className="font-bold text-orange-900 uppercase tracking-wider text-sm">Memory Aid</h3>
                                </div>
                                <p className="text-slate-700 italic">{word.data.mnemonic}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const FlashcardView = ({ drillSetData, wordMetadata, sourcesData }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [size, setSize] = useState(drillSetData.data.length);
    const [drillMetadata, setDrillMetadata] = useState(drillSetData);
    const [wordData, setWordData] = useState(wordMetadata);
    const [sources, setSources] = useState(sourcesData);
    const [source, setSource] = useState(sourcesData.data[0]);
    const [isFlipped, setIsFlipped] = useState(false);

    const fetchWordData = async (wordId, source) => {
        const wordDataResponse = await fetchData(`${API_LEXIMENTOR_BASE_URL}/inventory/words/${wordId}/sources/${source}`);
        const sourcesDataResponse = await fetchData(`${API_LEXIMENTOR_BASE_URL}/inventory/words/${wordId}/sources`);
        setWordData(wordDataResponse);
        setSources(sourcesDataResponse);
        setIsFlipped(false); // Reset flip on word change
    };

    useEffect(() => {
        fetchWordData(drillMetadata.data[currentIndex].wordRefId, source);
    }, [currentIndex, source, drillMetadata]);

    const prevWord = () => {
        setCurrentIndex((currentIndex - 1 + size) % size);
    };

    const nextWord = () => {
        setCurrentIndex((currentIndex + 1) % size);
    };

    const handleConvertToSpeech = async (text) => {
        try {
            const response = await fetchWithAuth(API_TEXT_TO_SPEECH, {
                method: 'POST',
                body: JSON.stringify({ text }),
            });
            if (!response.ok) throw new Error('TTS failed');
            const data = await response.arrayBuffer();
            const audioUrl = URL.createObjectURL(new Blob([data]));
            const audio = new Audio(audioUrl);
            await audio.play();
        } catch (error) {
            console.error('Error converting text to speech:', error);
        }
    };

    const percentage = Math.round(((currentIndex + 1) / size) * 100);

    return (
        <div className="py-10 px-6">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Source Selector */}
                {sources?.data && sources.data.length > 1 && (
                    <div className="flex justify-center">
                        <div className="inline-flex gap-2 bg-white rounded-xl p-2 shadow-md border border-slate-200">
                            {sources.data.map((src, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSource(src)}
                                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${source === src
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : 'text-slate-600 hover:bg-slate-100'
                                        }`}
                                >
                                    {src}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Progress Bar */}
                <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-bold text-slate-600">Progress</span>
                        <span className="text-2xl font-black text-indigo-600">{percentage}%</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out rounded-full"
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                    <div className="mt-2 text-center text-sm text-slate-500">
                        Card {currentIndex + 1} of {size}
                    </div>
                </div>

                {/* Flashcard */}
                <ModernFlashcard
                    word={wordData}
                    onFlip={() => setIsFlipped(!isFlipped)}
                    isFlipped={isFlipped}
                />

                {/* Navigation Controls */}
                <div className="flex items-center justify-between gap-4">
                    <button
                        onClick={prevWord}
                        className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-bold shadow-md border border-slate-200 transition-all hover:scale-105"
                    >
                        <ChevronLeftIcon className="w-5 h-5" />
                        Previous
                    </button>

                    <button
                        onClick={() => handleConvertToSpeech(wordData?.data?.word)}
                        className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full shadow-lg transition-all hover:scale-110"
                        title="Pronounce"
                    >
                        <SpeakerWaveIcon className="w-6 h-6" />
                    </button>

                    <button
                        onClick={nextWord}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg transition-all hover:scale-105"
                    >
                        Next
                        <ChevronRightIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FlashcardView;