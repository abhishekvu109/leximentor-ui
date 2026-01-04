import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { API_LEXIMENTOR_BASE_URL } from "@/constants";
import { fetchWithAuth } from "@/dataService";
import Link from "next/link";
import Layout from "@/components/layout/Layout";
import {
    ArrowLeftIcon,
    CheckCircleIcon,
    XCircleIcon,
    PencilSquareIcon,
    ArrowPathIcon,
    PaperAirplaneIcon,
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

const ChallengeCard = ({ item, index, onChange, value }) => {
    return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 group">
            <div className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 px-8 py-6 flex justify-between items-center group-hover:from-indigo-50/50 group-hover:to-white transition-colors">
                <div className="flex items-center gap-4">
                    <span className="bg-indigo-600 text-white text-xs font-black px-3 py-1.5 rounded-lg shadow-sm shadow-indigo-200">#{index + 1}</span>
                    <div>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight">{item.word}</h3>
                    </div>
                </div>
            </div>
            <div className="p-8">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                    <PencilSquareIcon className="w-4 h-4" />
                    Write a sentence used in context
                </label>
                <div className="relative">
                    <textarea
                        rows={3}
                        value={value || ''}
                        name="response"
                        onChange={(e) => onChange(index, 'response', e.target.value)}
                        className="w-full rounded-2xl border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-700 text-base p-5 leading-relaxed resize-none shadow-inner"
                        placeholder={`Example: The ${item.word}...`}
                    />
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <LightBulbIcon className="w-5 h-5 text-slate-300" />
                    </div>
                </div>
                <div className="mt-4 flex justify-between items-center">
                    <span className={`text-xs font-bold transition-colors ${value?.length > 10 ? 'text-green-500' : 'text-slate-300'}`}>
                        {value?.length || 0} chars
                    </span>
                    {!value && <span className="text-xs text-slate-400 italic">Start typing to complete...</span>}
                </div>
            </div>
        </div>
    );
};

const SentenceUsageChallenge = () => {
    const router = useRouter();
    const { drillId } = router.query; // [...drillId] -> [challengeId, drillRefId]

    const [drillSetData, setDrillSetData] = useState({ data: [] });
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState([]);
    const [notification, setNotification] = useState({ visible: false, message: '', type: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const challengeId = drillId?.[0];
    const drillRefId = drillId?.[1];

    useEffect(() => {
        if (drillRefId && challengeId) {
            setLoading(true);
            fetchWithAuth(`${API_LEXIMENTOR_BASE_URL}/drill/metadata/sets/${drillRefId}`)
                .then(res => res.json())
                .then(data => {
                    const actualData = data || { data: [] };
                    setDrillSetData(actualData);
                    setFormData(actualData.data?.map(item => ({
                        drillSetRefId: item.refId,
                        drillChallengeRefId: challengeId,
                        response: item.response || '',
                    })) || []);
                    setLoading(false);
                })
                .catch(err => {
                    console.error('Failed to fetch drill data:', err);
                    setLoading(false);
                });
        }
    }, [drillRefId, challengeId]);

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
            setFormData(drillSetData.data?.map(item => ({
                drillSetRefId: item.refId,
                drillChallengeRefId: challengeId,
                response: '',
            })) || []);
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const URL = `${API_LEXIMENTOR_BASE_URL}/drill/metadata/challenges/challenge/${challengeId}/scores`;
            const response = await fetchWithAuth(URL, {
                method: 'PUT',
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error("Submission failed");

            setNotification({ visible: true, message: "Drill submitted successfully!", type: 'success' });

        } catch (error) {
            console.error(error);
            setNotification({ visible: true, message: "Failed to submit drill. Please try again.", type: 'error' });
        } finally {
            setIsSubmitting(false);
            setTimeout(closeNotification, 5000);
        }
    };

    if (loading) return (
        <Layout content={
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-6"></div>
                    <p className="text-slate-400 font-bold text-lg animate-pulse">Preparing Challenge...</p>
                </div>
            </div>
        } />
    );

    const words = drillSetData?.data || [];

    return (
        <Layout content={
            <div className="min-h-screen bg-slate-50/50 pb-20 font-sans selection:bg-indigo-100 selection:text-indigo-800">

                {/* Header */}
                <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-30">
                    <div className="max-w-5xl mx-auto px-6 py-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <div className="mb-2 flex items-center gap-2">
                                    <Link href={`/challenges/${drillRefId}`} className="text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-1 text-xs font-bold uppercase tracking-wider">
                                        <ArrowLeftIcon className="w-4 h-4" />
                                        Back to Drill
                                    </Link>
                                </div>
                                <h1 className="text-3xl font-black text-slate-800 mb-1 flex items-center gap-3">
                                    Sentence Usage
                                </h1>
                                <p className="text-slate-500 font-medium">
                                    Create meaningful sentences for <span className="font-bold text-indigo-600">{words.length} words</span>.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <Link href="/dashboard/dashboard2">
                                    <button className="text-sm font-bold text-slate-500 hover:text-slate-800 px-4 py-2 hover:bg-slate-100 rounded-xl transition-colors">
                                        Exit
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <main className="max-w-3xl mx-auto px-6 py-12">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {words.map((item, index) => (
                            <ChallengeCard
                                key={item.refId}
                                item={item}
                                index={index}
                                value={formData[index]?.response}
                                onChange={handleChange}
                            />
                        ))}

                        {/* Actions */}
                        <div className="sticky bottom-6 z-10 bg-white/90 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-2xl p-4 flex justify-between items-center mt-12 animate-in slide-in-from-bottom-4 duration-500 ring-1 ring-slate-900/5">
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
                                className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition-all hover:scale-105 active:scale-95"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <PaperAirplaneIcon className="w-5 h-5" />
                                        Submit Challenge
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

export default SentenceUsageChallenge;
