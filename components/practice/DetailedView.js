import axios from "axios";
import { API_LEXIMENTOR_BASE_URL, API_TEXT_TO_SPEECH } from "@/constants";
import Link from "next/link";
import { SpeakerWaveIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { BookOpenIcon, LightBulbIcon, TagIcon, ChatBubbleLeftRightIcon, ArrowsRightLeftIcon } from "@heroicons/react/24/outline";
import { fetchData } from "@/dataService";
import { useEffect, useState } from "react";

const Main = ({ drillSetData, wordMetadata, sourcesData }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [size, setSize] = useState(drillSetData.data.length);
    const [drillMetadata, setDrillMetadata] = useState(drillSetData);
    const [wordData, setWordData] = useState(wordMetadata);
    const [sources, setSources] = useState(sourcesData);
    const [source, setSource] = useState(sourcesData.data[0]);

    const handleSources = (value) => {
        setSource(value);
    };

    const fetchWordData = async (wordId, source) => {
        const wordDataResponse = await fetchData(`${API_LEXIMENTOR_BASE_URL}/inventory/words/${wordId}/sources/${source}`);
        const sourcesDataResponse = await fetchData(`${API_LEXIMENTOR_BASE_URL}/inventory/words/${wordId}/sources`);
        setWordData(wordDataResponse);
        setSources(sourcesDataResponse);
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
            const response = await axios.post(API_TEXT_TO_SPEECH, { text }, { responseType: 'arraybuffer' });
            const audioUrl = URL.createObjectURL(new Blob([response.data]));
            const audio = new Audio(audioUrl);
            await audio.play();
        } catch (error) {
            console.error('Error converting text to speech:', error);
        }
    };

    const percentage = Math.round(((currentIndex + 1) / size) * 100);

    return (
        <div className="py-10 px-6">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Source Selector */}
                {sources?.data && sources.data.length > 1 && (
                    <div className="flex justify-center">
                        <div className="inline-flex gap-2 bg-white rounded-xl p-2 shadow-md border border-slate-200">
                            {sources.data.map((src, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSources(src)}
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
                        Word {currentIndex + 1} of {size}
                    </div>
                </div>

                {/* Main Word Card */}
                <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl shadow-2xl p-8">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full mb-6">
                            <BookOpenIcon className="w-6 h-6 text-white" />
                            <span className="text-white font-bold uppercase tracking-wider">Word of Focus</span>
                        </div>
                        <h1 className="text-7xl font-black text-white mb-4 drop-shadow-lg">
                            {wordData?.data?.word || "Loading..."}
                        </h1>
                        {wordData?.data?.pronunciation && (
                            <p className="text-white/90 text-xl italic mb-6">/{wordData.data.pronunciation}/</p>
                        )}
                        <button
                            onClick={() => handleConvertToSpeech(wordData?.data?.word)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full font-bold transition-all hover:scale-105"
                        >
                            <SpeakerWaveIcon className="w-5 h-5" />
                            Pronounce
                        </button>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Meanings */}
                    {wordData?.data?.meanings && wordData.data.meanings.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 bg-indigo-100 rounded-lg">
                                    <BookOpenIcon className="w-5 h-5 text-indigo-600" />
                                </div>
                                <h3 className="font-black text-slate-800 text-lg">Meanings</h3>
                            </div>
                            <ul className="space-y-3">
                                {wordData.data.meanings.map((item, index) => (
                                    <li key={index} className="flex gap-3 p-3 bg-indigo-50 rounded-xl">
                                        <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                            {index + 1}
                                        </span>
                                        <span className="text-slate-700 leading-relaxed">{item.meaning}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Local Meaning */}
                    {wordData?.data?.localMeaning && (
                        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <ChatBubbleLeftRightIcon className="w-5 h-5 text-green-600" />
                                </div>
                                <h3 className="font-black text-slate-800 text-lg">Local Translation</h3>
                            </div>
                            <p className="text-slate-700 text-lg p-4 bg-green-50 rounded-xl">{wordData.data.localMeaning}</p>
                        </div>
                    )}

                    {/* Synonyms */}
                    {wordData?.data?.synonyms && wordData.data.synonyms.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <ArrowsRightLeftIcon className="w-5 h-5 text-blue-600" />
                                </div>
                                <h3 className="font-black text-slate-800 text-lg">Synonyms</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {wordData.data.synonyms.map((syn, index) => (
                                    <span key={index} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-bold text-sm">
                                        {syn.synonym}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Antonyms */}
                    {wordData?.data?.antonyms && wordData.data.antonyms.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 bg-red-100 rounded-lg">
                                    <ArrowsRightLeftIcon className="w-5 h-5 text-red-600" />
                                </div>
                                <h3 className="font-black text-slate-800 text-lg">Antonyms</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {wordData.data.antonyms.map((ant, index) => (
                                    <span key={index} className="px-4 py-2 bg-red-100 text-red-700 rounded-full font-bold text-sm">
                                        {ant.antonym}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Mnemonic */}
                    {wordData?.data?.mnemonic && (
                        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 md:col-span-2">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 bg-yellow-100 rounded-lg">
                                    <LightBulbIcon className="w-5 h-5 text-yellow-600" />
                                </div>
                                <h3 className="font-black text-slate-800 text-lg">Memory Aid</h3>
                            </div>
                            <p className="text-slate-700 text-lg p-4 bg-yellow-50 rounded-xl italic">{wordData.data.mnemonic}</p>
                        </div>
                    )}

                    {/* Part of Speech */}
                    {wordData?.data?.partsOfSpeeches && wordData.data.partsOfSpeeches.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 md:col-span-2">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <TagIcon className="w-5 h-5 text-purple-600" />
                                </div>
                                <h3 className="font-black text-slate-800 text-lg">Parts of Speech</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {wordData.data.partsOfSpeeches.map((pos, index) => (
                                    <span key={index} className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full font-bold">
                                        {pos.pos}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Examples */}
                    {wordData?.data?.examples && wordData.data.examples.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 md:col-span-2">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 bg-teal-100 rounded-lg">
                                    <ChatBubbleLeftRightIcon className="w-5 h-5 text-teal-600" />
                                </div>
                                <h3 className="font-black text-slate-800 text-lg">Example Sentences</h3>
                            </div>
                            <div className="space-y-3">
                                {wordData.data.examples.map((ex, index) => (
                                    <div key={index} className="p-4 bg-teal-50 rounded-xl border-l-4 border-teal-500">
                                        <p className="text-slate-700 italic">"{ex.example}"</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between gap-4">
                    <button
                        onClick={prevWord}
                        className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-bold shadow-md border border-slate-200 transition-all hover:scale-105"
                    >
                        <ChevronLeftIcon className="w-5 h-5" />
                        Previous
                    </button>

                    <div className="text-center">
                        <p className="text-sm text-slate-500 font-bold">
                            {currentIndex + 1} / {size}
                        </p>
                    </div>

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

const DetailedView = ({ drillSetData, drillId, wordMetadata, sourcesData }) => {
    useEffect(() => {
        if (typeof window !== "undefined" && window.initFlowbite) {
            window.initFlowbite();
        }
    }, []);
    return (
        <Main wordMetadata={wordMetadata} drillSetData={drillSetData} sourcesData={sourcesData} />
    );
};

export default DetailedView;