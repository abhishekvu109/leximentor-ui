import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from "next/link";
import Layout from "@/components/layout/Layout";
import { API_LEXIMENTOR_BASE_URL, API_TEXT_TO_SPEECH } from "@/constants";
import { fetchData } from "@/dataService";
import {
    ArrowLeftIcon,
    CheckCircleIcon,
    XCircleIcon,
    SpeakerWaveIcon,
    ArrowPathIcon,
    PaperAirplaneIcon,
    MusicalNoteIcon
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

const ChallengeCard = ({ item, index, onChange, value, onPlayAudio }) => {
    const [isPlaying, setIsPlaying] = useState(false);

    const handlePlay = async () => {
        setIsPlaying(true);
        await onPlayAudio(item.word);
        setIsPlaying(false);
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:border-indigo-200 transition-all duration-300">
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-md">Q{index + 1}</span>
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">Listen & Type</span>
                </div>
            </div>
            <div className="p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center">

                {/* Audio Button */}
                <button
                    type="button"
                    onClick={handlePlay}
                    disabled={isPlaying}
                    className="shrink-0 w-16 h-16 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-70 disabled:scale-100"
                    title="Play Audio"
                >
                    {isPlaying ? <div className="w-6 h-6 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" /> : <SpeakerWaveIcon className="w-8 h-8" />}
                </button>

                {/* Input Area */}
                <div className="flex-1 w-full space-y-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                        What word did you hear?
                    </label>
                    <input
                        type="text"
                        value={value || ''}
                        name="response"
                        onChange={(e) => onChange(index, 'response', e.target.value)}
                        className="w-full rounded-lg border-slate-300 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500 transition-all text-slate-700 text-lg font-medium p-3"
                        placeholder="Type the word here..."
                        autoComplete="off"
                    />
                </div>
            </div>
        </div>
    );
};

const LoadIdentifyWordDrillChallenge = ({ drillSetData, drillSetWordData, challengeId, drillRefId, challengeScores }) => {

    // --- State ---
    const [questions, setQuestions] = useState([]);
    const [formData, setFormData] = useState([]);
    const [notification, setNotification] = useState({ visible: false, message: '', type: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- Init ---
    useEffect(() => {
        if (!drillSetWordData?.data || !challengeScores?.data || !drillSetData?.data) return;

        const generatedQuestions = challengeScores.data.map(scoreItem => {
            const setItem = drillSetData.data.find(d => d.refId === scoreItem.drillSetRefId);
            if (!setItem) return null;

            const wordItem = drillSetWordData.data.find(w => w.refId === setItem.wordRefId);
            if (!wordItem) return null;

            return {
                refId: scoreItem.refId,
                drillChallengeRefId: challengeId,
                drillSetRefId: scoreItem.drillSetRefId,
                word: wordItem.word,
            };
        }).filter(q => q !== null);

        setQuestions(generatedQuestions);
        setFormData(generatedQuestions.map(q => ({
            refId: q.refId,
            drillChallengeRefId: challengeId,
            drillSetRefId: q.drillSetRefId,
            response: '',
        })));
    }, [drillSetData, drillSetWordData, challengeScores, challengeId]);

    // --- Handlers ---

    const closeNotification = () => setNotification({ ...notification, visible: false });

    const handleChange = (index, name, value) => {
        setFormData(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [name]: value };
            return updated;
        });
    };

    const handleReset = () => {
        if (confirm("Are you sure you want to clear your answers?")) {
            setFormData(questions.map(q => ({
                refId: q.refId,
                drillChallengeRefId: challengeId,
                drillSetRefId: q.drillSetRefId,
                response: '',
            })));
        }
    };

    const handleConvertToSpeech = async (text) => {
        try {
            const response = await axios.post(API_TEXT_TO_SPEECH, { text }, { responseType: 'arraybuffer' });
            const audioUrl = URL.createObjectURL(new Blob([response.data]));
            const audio = new Audio(audioUrl);
            await audio.play();
        } catch (error) {
            console.error('Error converting text to speech:', error);
            setNotification({ visible: true, message: "Could not play audio. Please check connections.", type: 'error' });
            setTimeout(closeNotification, 3000);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const URL = `${API_LEXIMENTOR_BASE_URL}/drill/metadata/challenges/challenge/${challengeId}/scores`;
            const response = await fetch(URL, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error("Network response was not ok");

            setNotification({ visible: true, message: "Drill submitted successfully!", type: 'success' });
        } catch (error) {
            console.error('Error:', error);
            setNotification({ visible: true, message: "Submission failed. Please try again.", type: 'error' });
        } finally {
            setIsSubmitting(false);
            setTimeout(closeNotification, 5000);
        }
    };

    return (
        <Layout content={
            <div className="min-h-screen bg-slate-50 pb-20 font-sans">

                {/* Header */}
                <div className="bg-white border-b border-slate-200">
                    <div className="max-w-4xl mx-auto px-6 py-8">
                        <div className="mb-6 flex items-center gap-2">
                            <Link href={`/challenges/${drillRefId}`} className="text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-1 text-sm font-medium">
                                <ArrowLeftIcon className="w-4 h-4" />
                                Back to Drill
                            </Link>
                        </div>

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <h1 className="text-3xl font-extrabold text-slate-800 mb-2 flex items-center gap-3">
                                    <MusicalNoteIcon className="w-8 h-8 text-indigo-600" />
                                    Listening Practice
                                </h1>
                                <p className="text-slate-500 text-lg">
                                    Listen to the pronunciation and type the word you hear.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <main className="max-w-4xl mx-auto px-6 py-10">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {questions.map((item, index) => (
                            <ChallengeCard
                                key={item.refId}
                                item={item}
                                index={index}
                                value={formData[index]?.response}
                                onChange={handleChange}
                                onPlayAudio={handleConvertToSpeech}
                            />
                        ))}

                        {/* Actions */}
                        <div className="sticky bottom-6 z-10 bg-white/80 backdrop-blur-md border border-slate-200 shadow-xl rounded-2xl p-4 flex justify-between items-center mt-10 animate-in slide-in-from-bottom-4 duration-500">
                            <button
                                type="button"
                                onClick={handleReset}
                                className="flex items-center gap-2 px-6 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl font-bold transition-all"
                            >
                                <ArrowPathIcon className="w-5 h-5" />
                                Reset
                            </button>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all hover:scale-105 active:scale-95"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <PaperAirplaneIcon className="w-5 h-5" />
                                        Submit Answers
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
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

export default LoadIdentifyWordDrillChallenge;

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
            props: {
                drillSetData: { data: [] },
                drillSetWordData: { data: [] },
                challengeId,
                drillRefId,
                challengeScores: { data: [] }
            },
        };
    }
}
