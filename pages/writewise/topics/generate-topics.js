import { useState, useEffect, useCallback } from "react";
import Layout from "@/components/layout/Layout";
import Link from "next/link";
import writewiseService from "../../../services/writewise.service";
import ModalConfirmation from "@/components/modal_notifications/ModalConfirmation";

// --- Components ---
// ... (HeroSection, SubjectCard, NumberStepper, TopicCard, TabButton unchanged)

// I'll keep the component definitions as they were, but ensure they are included if I'm replacing the whole block.
// To be safe, I'll only replace the top part and the component signature.

// Actually, I'll replace the first 146 lines to get everything right.

const HeroSection = () => (
    <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight mb-3">
            Generate <span className="text-indigo-600">Writing Topics</span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-slate-600">
            Enhance your skills with tailored topics, focused writing points, and instant feedback—powered by AI.
        </p>
    </div>
);

const SubjectCard = ({ label, value, selected, onClick, icon }) => (
    <div
        onClick={() => onClick(value)}
        className={`
            cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-3
            ${selected ? 'border-indigo-600 bg-indigo-50 shadow-md transform scale-[1.02]' : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm'}
        `}
    >
        <span className="text-3xl">{icon}</span>
        <span className={`font-semibold ${selected ? 'text-indigo-800' : 'text-slate-600'}`}>{label}</span>
    </div>
);

const NumberStepper = ({ label, value, onChange, min, max, step = 1, unit = "" }) => (
    <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-slate-700">{label}</label>
        <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
            <button
                type="button"
                onClick={() => onChange(Math.max(min, value - step))}
                className="w-10 h-10 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold transition flex items-center justify-center"
            >
                -
            </button>
            <div className="flex-1 text-center font-bold text-slate-800 text-lg">
                {value} <span className="text-sm font-normal text-slate-500">{unit}</span>
            </div>
            <button
                type="button"
                onClick={() => onChange(Math.min(max, value + step))}
                className="w-10 h-10 rounded-lg bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-bold transition flex items-center justify-center"
            >
                +
            </button>
        </div>
    </div>
);

const TopicCard = ({ topic, index, onDelete, onView }) => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group">
        <div className="p-5">
            <div className="flex justify-between items-start mb-3">
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 uppercase tracking-wide">
                    {topic.subject}
                </span>
                <span className={`text-xs font-semibold ${topic.status === 'generated' ? 'text-green-600' : 'text-slate-400'
                    }`}>
                    {topic.status || 'Draft'}
                </span>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2" title={topic.topic || topic.subject}>
                {topic.topic ? topic.topic : `Topic Set ${index + 1}`}
            </h3>
            <div className="flex gap-4 text-sm text-slate-500 mb-4">
                <div className="flex items-center gap-1">
                    <span>📝</span>
                    <span>{topic.numOfTopic || 1} Topics</span>
                </div>
                <div className="flex items-center gap-1">
                    <span>⏱️</span>
                    <span>{topic.wordCount} words</span>
                </div>
            </div>
            <div className="flex gap-2">
                <Link
                    href={topic.responseRefId
                        ? `/writewise/topics/topic/writing-view/${topic.responseRefId}`
                        : (topic.topic ? `/writewise/topics/topic/writing-view/${topic.refId}` : `/writewise/topics/topic/detailed-view/${topic.refId}`)}
                    className="flex-1 text-center bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-2 rounded-lg font-semibold text-sm transition"
                >
                    View
                </Link>
                {onDelete && (
                    <button
                        onClick={() => onDelete(topic.refId)}
                        className="w-10 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition"
                        title="Delete"
                    >
                        🗑️
                    </button>
                )}
            </div>
        </div>
    </div>
);


const TabButton = ({ active, label, onClick }) => (
    <button
        onClick={onClick}
        className={`
            relative px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200
            ${active ? 'bg-slate-800 text-white shadow-md' : 'bg-transparent text-slate-600 hover:bg-slate-100'}
        `}
    >
        {label}
    </button>
);


// --- Main Component ---

export default function GenerateTopics() {
    // --- State ---
    const [formData, setFormData] = useState({
        subject: "",
        numOfTopic: 3,
        wordCount: 1000,
        purpose: "IELTS exam"
    });
    const [activeTab, setActiveTab] = useState('generate');

    // Data States
    const [topicsState, setTopicsState] = useState({ data: [] }); // Generated Sets
    const [allTopicsState, setAllTopicsState] = useState({ data: [] }); // Individual Topics
    const [submittedState, setSubmittedState] = useState({ data: [] });
    const [evaluatedState, setEvaluatedState] = useState({ data: [] });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    // --- Data Loading ---
    const loadAllData = useCallback(async () => {
        try {
            const [generations, topics, submitted, evaluated] = await Promise.all([
                writewiseService.getTopicGenerations(),
                writewiseService.getTopics(),
                writewiseService.getSubmittedResponses(),
                writewiseService.getEvaluatedResponses()
            ]);

            setTopicsState(generations || { data: [] });
            setAllTopicsState(topics || { data: [] });
            setSubmittedState(submitted || { data: [] });
            setEvaluatedState(evaluated || { data: [] });
        } catch (error) {
            console.error("Failed to load Writewise data:", error);
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await loadAllData();
            setLoading(false);
        };
        init();
    }, [loadAllData]);

    // --- Handlers ---
    const handleSubjectSelect = (subject) => {
        setFormData(prev => ({ ...prev, subject }));
    };

    const handleCountChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleGenerate = async (e) => {
        e.preventDefault();

        if (!formData.subject) {
            alert("Please select a subject!");
            return;
        }

        setIsSubmitting(true);
        try {
            await writewiseService.createTopics(formData);

            // Refresh Data
            const newRes = await writewiseService.getTopicGenerations();
            setTopicsState(newRes);

            alert("Topics Generated Successfully!");
            setFormData({ ...formData, subject: "" });
        } catch (error) {
            console.error(error);
            alert("Failed to generate topics.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (refId, type = 'topic') => {
        if (!confirm("Are you sure you want to delete this?")) return;

        try {
            await writewiseService.deleteTopicGeneration(refId);
            // Refetch based on type
            if (type === 'topic') {
                const res = await writewiseService.getTopics();
                setAllTopicsState(res);
            } else if (type === 'set') {
                const res = await writewiseService.getTopicGenerations();
                setTopicsState(res);
            }
        } catch (e) {
            console.error(e);
            alert("Delete failed");
        }
    };


    // --- Render Content ---
    const renderContent = () => {
        switch (activeTab) {
            case 'generate':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Form Section */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                            <div className="mb-8">
                                <label className="block text-sm font-semibold text-slate-700 mb-4">Choose a Subject</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <SubjectCard
                                        label="Economics"
                                        value="Economics"
                                        icon="💰"
                                        selected={formData.subject === 'Economics'}
                                        onClick={handleSubjectSelect}
                                    />
                                    <SubjectCard
                                        label="History"
                                        value="History"
                                        icon="🏛️"
                                        selected={formData.subject === 'History'}
                                        onClick={handleSubjectSelect}
                                    />
                                    <SubjectCard
                                        label="Politics"
                                        value="Politics"
                                        icon="🗳️"
                                        selected={formData.subject === 'Politics'}
                                        onClick={handleSubjectSelect}
                                    />
                                    <SubjectCard
                                        label="Sci & Tech"
                                        value="Science & Technology"
                                        icon="🚀"
                                        selected={formData.subject === 'Science & Technology'}
                                        onClick={handleSubjectSelect}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                <NumberStepper
                                    label="Word Count Goal"
                                    value={formData.wordCount}
                                    onChange={(v) => handleCountChange('wordCount', v)}
                                    min={500} max={5000} step={100}
                                />
                                <NumberStepper
                                    label="Number of Topics"
                                    value={formData.numOfTopic}
                                    onChange={(v) => handleCountChange('numOfTopic', v)}
                                    min={1} max={10}
                                />
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={handleGenerate}
                                    disabled={isSubmitting}
                                    className={`
                                        px-8 py-3 rounded-xl font-bold text-white shadow-lg shadow-indigo-200
                                        ${isSubmitting ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-300 transform active:scale-95 transition-all'}
                                    `}
                                >
                                    {isSubmitting ? 'Generating...' : '✨ Generate Topics'}
                                </button>
                            </div>
                        </div>

                        {/* Recent Sets Section */}
                        <div>
                            <h3 className="text-xl font-bold text-slate-800 mb-4 px-2">Recently Generated Sets</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {topicsState?.data?.length > 0 ? (
                                    topicsState.data.map((item, idx) => (
                                        <TopicCard key={item.refId || idx} topic={item} index={idx} onDelete={(id) => handleDelete(id, 'set')} />
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-10 text-slate-400 bg-slate-50 rounded-xl border-dashed border-2 border-slate-200">
                                        No generated topics found. Start by creating one!
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            case 'all_topics':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
                        {allTopicsState?.data?.length > 0 ? (
                            allTopicsState.data.map((item, idx) => (
                                <TopicCard key={item.refId || idx} topic={item} index={idx} onDelete={(id) => handleDelete(id, 'topic')} />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-20 text-slate-500">No topics found in the library.</div>
                        )}
                    </div>
                );
            case 'submitted':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
                        {submittedState?.data?.map((item, idx) => (
                            <div key={idx} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center">
                                <div>
                                    <div className="text-xs font-bold text-indigo-600 uppercase mb-1">{item.topic?.subject}</div>
                                    <h4 className="font-semibold text-slate-800">{item.topic?.topic}</h4>
                                    <p className="text-sm text-slate-500 mt-1">Status: Submitted</p>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Link
                                        href={`/writewise/topics/topic/writing-view/${item.topic?.refId}`}
                                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition text-center"
                                    >
                                        View Essay
                                    </Link>
                                    {item.responseVersionDTOs?.length > 0 && (
                                        <Link
                                            href={`/writewise/topics/topic/evaluation-view/${item.topic?.refId}/${item.responseVersionDTOs[0]?.refId}`}
                                            className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-sm font-medium transition text-center"
                                        >
                                            Evaluate
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                        {(!submittedState?.data || submittedState.data.length === 0) && (
                            <div className="col-span-full text-center py-20 text-slate-500">No submitted essays yet.</div>
                        )}
                    </div>
                );
            case 'evaluated':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
                        {evaluatedState?.data?.map((item, idx) => (
                            <div key={idx} className="bg-white p-5 rounded-xl shadow-sm border border-green-200 bg-green-50/30 flex justify-between items-center">
                                <div>
                                    <div className="text-xs font-bold text-green-600 uppercase mb-1">{item.topic?.subject}</div>
                                    <h4 className="font-semibold text-slate-800">{item.topic?.topic}</h4>
                                    <div className="flex gap-2 mt-2">
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Evaluated</span>
                                    </div>
                                </div>
                                <Link
                                    href={`/writewise/topics/topic/evaluation-result/${item.responseRefId}/${item.responseVersion?.refId}`}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition shadow-sm"
                                >
                                    See Result
                                </Link>
                            </div>
                        ))}
                        {(!evaluatedState?.data || evaluatedState.data.length === 0) && (
                            <div className="col-span-full text-center py-20 text-slate-500">No evaluations yet.</div>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };


    if (loading) return <Layout content={<div className="p-8 text-center text-slate-500 font-bold">Loading Writewise Topics...</div>} />;

    return (
        <Layout content={
            <div className="min-h-screen bg-slate-50/50 -m-4 sm:-m-8 p-4 sm:p-8 font-sans">
                <div className="max-w-6xl mx-auto">
                    <HeroSection />

                    {/* Navigation Tabs */}
                    <div className="flex justify-center mb-10">
                        <div className="bg-white p-1.5 rounded-full shadow-sm border border-slate-200 flex gap-1 overflow-x-auto max-w-full">
                            <TabButton active={activeTab === 'generate'} label="Generate New" onClick={() => setActiveTab('generate')} />
                            <TabButton active={activeTab === 'all_topics'} label="Browse Library" onClick={() => setActiveTab('all_topics')} />
                            <TabButton active={activeTab === 'submitted'} label="Submitted" onClick={() => setActiveTab('submitted')} />
                            <TabButton active={activeTab === 'evaluated'} label="Evaluations" onClick={() => setActiveTab('evaluated')} />
                        </div>
                    </div>

                    {/* Dynamic Content Area */}
                    <div className="min-h-[400px]">
                        {renderContent()}
                    </div>
                </div>
            </div>
        } />
    );
}

