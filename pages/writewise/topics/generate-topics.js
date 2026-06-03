import { useState, useEffect, useCallback } from "react";
import Layout from "@/components/layout/Layout";
import Link from "next/link";
import { useRouter } from "next/router";
import ToastContainer from "@/components/common/ToastContainer";
import CreateTopicModal from "@/components/common/CreateTopicModal";
import { useToast } from "@/hooks/useToast";
import { ArrowLeftIcon, PlusIcon } from "@heroicons/react/24/solid";
import writewiseService from "../../../services/writewise.service";

// --- Sub-components ---

const StatBadge = ({ label, count, color }) => (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${color}`}>
        <span className="text-base font-bold">{count}</span>
        <span>{label}</span>
    </div>
);

const SubjectCard = ({ label, value, selected, onClick, icon }) => (
    <button
        type="button"
        onClick={() => onClick(value)}
        className={`p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-2 w-full
            ${selected
                ? 'border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-100 scale-[1.02]'
                : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50'}`}
    >
        <span className="text-3xl">{icon}</span>
        <span className={`text-sm font-bold ${selected ? 'text-indigo-700' : 'text-slate-600'}`}>{label}</span>
    </button>
);

const NumberStepper = ({ label, value, onChange, min, max, step = 1, unit = "" }) => (
    <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>
        <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200">
            <button type="button" onClick={() => onChange(Math.max(min, value - step))}
                className="w-9 h-9 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold transition text-lg flex items-center justify-center shadow-sm">
                −
            </button>
            <div className="flex-1 text-center font-bold text-slate-800 text-lg">
                {value} <span className="text-xs font-normal text-slate-400">{unit}</span>
            </div>
            <button type="button" onClick={() => onChange(Math.min(max, value + step))}
                className="w-9 h-9 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition text-lg flex items-center justify-center shadow-sm">
                +
            </button>
        </div>
    </div>
);

const EmptyState = ({ icon, message, sub }) => (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
        <div className="text-5xl mb-4">{icon}</div>
        <p className="font-bold text-slate-600">{message}</p>
        {sub && <p className="text-sm text-slate-400 mt-1">{sub}</p>}
    </div>
);

const TopicSetCard = ({ topic, index, onDelete }) => (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group overflow-hidden">
        <div className="p-5">
            <div className="flex justify-between items-start mb-3">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-700 uppercase tracking-widest">
                    {topic.subject || 'General'}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${topic.status === 'generated' ? 'text-green-500' : 'text-slate-400'}`}>
                    {topic.status || 'Draft'}
                </span>
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-3 line-clamp-2 leading-snug">
                {topic.topic || `Topic Set ${index + 1}`}
            </h3>
            <div className="flex gap-3 text-xs text-slate-500 mb-4 font-medium">
                <span className="flex items-center gap-1">📝 {topic.numOfTopic || 1} topics</span>
                <span className="flex items-center gap-1">📏 {topic.wordCount} words</span>
            </div>
            <div className="flex gap-2">
                <Link
                    href={topic.responseRefId
                        ? `/writewise/topics/topic/writing-view/${topic.responseRefId}`
                        : (topic.topic ? `/writewise/topics/topic/writing-view/${topic.refId}` : `/writewise/topics/topic/detailed-view/${topic.refId}`)}
                    className="flex-1 text-center py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition shadow-sm"
                >
                    Open
                </Link>
                {onDelete && (
                    <button onClick={() => onDelete(topic.refId)}
                        className="w-10 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition border border-red-100"
                        title="Delete">
                        🗑️
                    </button>
                )}
            </div>
        </div>
    </div>
);

// Groups evaluated versions by topic for clarity
const EvaluatedTopicGroup = ({ topicData }) => {
    const { topic, versions } = topicData;
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{topic?.subject}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-[10px] font-bold text-slate-400">{versions.length} version{versions.length !== 1 ? 's' : ''} evaluated</span>
                </div>
                <h4 className="font-bold text-slate-800 text-sm leading-snug line-clamp-2">{topic?.topic}</h4>
            </div>
            <div className="divide-y divide-slate-100">
                {versions.map((item, i) => (
                    <div key={i} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50/50 transition">
                        <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-black flex items-center justify-center">
                                v{item.responseVersion?.versionNumber ?? i + 1}
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-700">
                                    Version {item.responseVersion?.versionNumber ?? i + 1}
                                </div>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400" />
                                    <span className="text-[10px] text-slate-400 font-medium">Evaluated</span>
                                </div>
                            </div>
                        </div>
                        <Link
                            href={`/writewise/topics/topic/evaluation-result/${item.responseRefId}/${item.responseVersion?.refId}`}
                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
                        >
                            View Result
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Main Component ---

const SUBJECTS = [
    { label: 'Economics',    value: 'Economics',              icon: '💰' },
    { label: 'History',      value: 'History',                icon: '🏛️' },
    { label: 'Politics',     value: 'Politics',               icon: '🗳️' },
    { label: 'Sci & Tech',   value: 'Science & Technology',   icon: '🚀' },
    { label: 'Philosophy',   value: 'Philosophy',             icon: '🧠' },
    { label: 'Environment',  value: 'Environment',            icon: '🌿' },
    { label: 'Society',      value: 'Society',                icon: '🤝' },
    { label: 'Literature',   value: 'Literature',             icon: '📚' },
    { label: 'Biography',    value: 'Biography',              icon: '👤' },
    { label: 'Agriculture',  value: 'Agriculture',            icon: '🌾' },
    { label: 'Psychology',   value: 'Psychology',             icon: '🧩' },
    { label: 'Health',       value: 'Medicine & Health',      icon: '🏥' },
    { label: 'Art & Culture',value: 'Art & Culture',          icon: '🎨' },
    { label: 'Geography',    value: 'Geography',              icon: '🌍' },
    { label: 'Law & Justice',value: 'Law & Justice',          icon: '⚖️' },
    { label: 'Business',     value: 'Business & Entrepreneurship', icon: '💼' },
];

const TABS = [
    { id: 'generate', label: 'Generate' },
    { id: 'all_topics', label: 'Library' },
    { id: 'submitted', label: 'Submitted' },
    { id: 'evaluated', label: 'Evaluated' },
];

export default function GenerateTopics() {
    const router = useRouter();
    const toast = useToast();
    const [formData, setFormData] = useState({ subject: "", numOfTopic: 3, wordCount: 1000, purpose: "IELTS exam" });
    const [activeTab, setActiveTab] = useState('generate');
    const [topicsState, setTopicsState] = useState({ data: [] });
    const [allTopicsState, setAllTopicsState] = useState({ data: [] });
    const [submittedState, setSubmittedState] = useState({ data: [] });
    const [evaluatedState, setEvaluatedState] = useState({ data: [] });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showCreateTopicModal, setShowCreateTopicModal] = useState(false);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);

        const loadAllData = async () => {
            try {
                const [generations, topics, submitted, evaluated] = await Promise.all([
                    writewiseService.getTopicGenerations(),
                    writewiseService.getTopics(),
                    writewiseService.getSubmittedResponses(),
                    writewiseService.getEvaluatedResponses()
                ]);

                if (isMounted) {
                    setTopicsState(generations || { data: [] });
                    setAllTopicsState(topics || { data: [] });
                    setSubmittedState(submitted || { data: [] });
                    setEvaluatedState(evaluated || { data: [] });
                }
            } catch (error) {
                console.error("Failed to load Writewise data:", error);
                if (isMounted) {
                    const errorMsg = error?.response?.data?.data || error?.message || "Failed to load topics";
                    // Only show error if toast is available
                    if (toast && toast.error) {
                        toast.error(errorMsg);
                    }
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadAllData();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!formData.subject) {
            toast.error("Please select a subject!");
            return;
        }
        setIsSubmitting(true);
        try {
            toast.info("Generating topics with AI... This may take a moment.");
            await writewiseService.createTopics(formData);
            const newRes = await writewiseService.getTopicGenerations();
            setTopicsState(newRes);
            setFormData(prev => ({ ...prev, subject: "" }));
            toast.success("Topics generated successfully!");
            setActiveTab('all_topics');
        } catch (error) {
            console.error(error);
            const errorMsg = error?.response?.data?.data || error?.message || "Failed to generate topics. Please try again.";
            toast.error(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleTopicCreatedManually = async () => {
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
            setActiveTab('all_topics');
        } catch (error) {
            console.error("Failed to refresh data:", error);
        }
    };

    const handleDelete = async (refId, type = 'topic') => {
        if (!window.confirm("Are you sure you want to delete this? This cannot be undone.")) return;
        try {
            await writewiseService.deleteTopicGeneration(refId);
            if (type === 'topic') {
                const res = await writewiseService.getTopics();
                setAllTopicsState(res);
            } else {
                const res = await writewiseService.getTopicGenerations();
                setTopicsState(res);
            }
            toast.success(`${type === 'topic' ? 'Topic' : 'Topic set'} deleted successfully!`);
        } catch (e) {
            console.error(e);
            const errorMsg = e?.response?.data?.data || e?.message || "Delete failed. Please try again.";
            toast.error(errorMsg);
        }
    };

    // Group evaluated items by topic, deduplicate by version refId (API returns one entry per evaluation run)
    const groupedEvaluations = (evaluatedState?.data || []).reduce((acc, item) => {
        const key = item.topic?.refId;
        if (!key) return acc;
        if (!acc[key]) acc[key] = { topic: item.topic, versions: [] };
        const vRefId = item.responseVersion?.refId;
        const alreadyAdded = vRefId
            ? acc[key].versions.some(v => v.responseVersion?.refId === vRefId)
            : false;
        if (!alreadyAdded) acc[key].versions.push(item);
        return acc;
    }, {});

    const renderContent = () => {
        switch (activeTab) {
            case 'generate':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-400">
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                            <h2 className="text-base font-bold text-slate-700 mb-1">Choose a Subject</h2>
                            <p className="text-sm text-slate-400 mb-5">Select the domain for your writing topic.</p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                                {SUBJECTS.map(s => (
                                    <SubjectCard key={s.value} {...s}
                                        selected={formData.subject === s.value}
                                        onClick={(v) => setFormData(prev => ({ ...prev, subject: v }))}
                                    />
                                ))}
                            </div>

                            <div className="w-full h-px bg-slate-100 my-6" />

                            <h2 className="text-base font-bold text-slate-700 mb-5">Configure Parameters</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                                <NumberStepper label="Target Word Count" value={formData.wordCount}
                                    onChange={(v) => setFormData(p => ({ ...p, wordCount: v }))}
                                    min={500} max={5000} step={100} unit="words" />
                                <NumberStepper label="Number of Topics" value={formData.numOfTopic}
                                    onChange={(v) => setFormData(p => ({ ...p, numOfTopic: v }))}
                                    min={1} max={10} />
                            </div>

                            <div className="flex justify-end">
                                <button onClick={handleGenerate} disabled={isSubmitting || !formData.subject}
                                    className="px-8 py-3 rounded-2xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-100 transition-all active:scale-95 flex items-center gap-2">
                                    {isSubmitting
                                        ? <><span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> Generating...</>
                                        : '✨ Generate Topics'}
                                </button>
                            </div>
                        </div>

                        {topicsState?.data?.length > 0 && (
                            <div>
                                <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4 px-1">Recently Generated Sets</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {topicsState.data.map((item, idx) => (
                                        <TopicSetCard key={item.refId || idx} topic={item} index={idx} onDelete={(id) => handleDelete(id, 'set')} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 'all_topics':
                return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in duration-400">
                        {allTopicsState?.data?.length > 0
                            ? allTopicsState.data.map((item, idx) => (
                                <TopicSetCard key={item.refId || idx} topic={item} index={idx} onDelete={(id) => handleDelete(id, 'topic')} />
                            ))
                            : <EmptyState icon="📂" message="No topics in the library yet" sub="Generate some topics to get started." />}
                    </div>
                );

            case 'submitted':
                return (
                    <div className="space-y-3 animate-in fade-in duration-400">
                        {submittedState?.data?.length > 0 ? submittedState.data.map((item, idx) => (
                            <div key={idx} className="bg-white rounded-2xl border border-slate-200 shadow-sm px-5 py-4 flex items-center justify-between gap-4 hover:border-indigo-200 transition">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{item.topic?.subject}</span>
                                        {item.responseVersionDTOs?.length > 0 && (
                                            <>
                                                <span className="text-slate-300">·</span>
                                                <span className="text-[10px] font-bold text-slate-400">
                                                    {item.responseVersionDTOs.length} version{item.responseVersionDTOs.length !== 1 ? 's' : ''}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    <h4 className="font-bold text-slate-800 text-sm truncate">{item.topic?.topic}</h4>
                                    <div className="flex items-center gap-1.5 mt-1.5">
                                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400" />
                                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Awaiting Evaluation</span>
                                    </div>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <Link href={`/writewise/topics/topic/writing-view/${item.topic?.refId}`}
                                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition">
                                        Essay
                                    </Link>
                                    {item.responseVersionDTOs?.[0]?.refId && (
                                        <Link href={`/writewise/topics/topic/evaluation-view/${item.topic?.refId}/${item.responseVersionDTOs[0].refId}`}
                                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm">
                                            Evaluate
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )) : <EmptyState icon="📨" message="No submitted essays yet" sub="Submit a response from the writing view to see it here." />}
                    </div>
                );

            case 'evaluated':
                return (
                    <div className="space-y-4 animate-in fade-in duration-400">
                        {Object.keys(groupedEvaluations).length > 0
                            ? Object.values(groupedEvaluations).map((group, idx) => (
                                <EvaluatedTopicGroup key={group.topic?.refId || idx} topicData={group} />
                            ))
                            : <EmptyState icon="🏆" message="No evaluated essays yet" sub="Complete an evaluation to see results here." />}
                    </div>
                );

            default:
                return null;
        }
    };

    if (loading) return <Layout content={<div className="p-8 text-center text-slate-500 font-bold">Loading Writewise...</div>} />;

    return (
        <Layout content={
            <div className="min-h-screen bg-slate-50/50 -m-4 sm:-m-8 p-4 sm:p-8 font-sans">
                <ToastContainer toasts={toast.toasts} onRemoveToast={toast.removeToast} />
                <CreateTopicModal
                    isOpen={showCreateTopicModal}
                    onClose={() => setShowCreateTopicModal(false)}
                    onSuccess={handleTopicCreatedManually}
                    toast={toast}
                />
                <div className="max-w-5xl mx-auto">

                    {/* Navigation Breadcrumb */}
                    <nav className="mb-6 flex items-center gap-2 text-sm">
                        <button
                            onClick={() => router.back()}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                            title="Go back"
                        >
                            <ArrowLeftIcon className="w-5 h-5" />
                        </button>
                        <Link href="/writewise/dashboard" className="text-indigo-600 hover:text-indigo-700 font-medium">
                            Dashboard
                        </Link>
                        <span className="text-slate-400">/</span>
                        <span className="text-slate-600 font-medium">Topics</span>
                    </nav>

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                            Write<span className="text-indigo-600">Wise</span>
                        </h1>
                        <p className="text-slate-500 mt-1 text-sm">AI-powered writing practice — generate topics, write, and get evaluated.</p>
                        <div className="flex flex-wrap gap-2 mt-4">
                            <StatBadge label="Sets" count={topicsState?.data?.length ?? 0} color="bg-slate-100 text-slate-600 border-slate-200" />
                            <StatBadge label="Topics" count={allTopicsState?.data?.length ?? 0} color="bg-indigo-50 text-indigo-700 border-indigo-200" />
                            <StatBadge label="Submitted" count={submittedState?.data?.length ?? 0} color="bg-amber-50 text-amber-700 border-amber-200" />
                            <StatBadge label="Evaluated" count={evaluatedState?.data?.length ?? 0} color="bg-green-50 text-green-700 border-green-200" />
                        </div>
                    </div>

                    {/* Tabs and Create Button */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
                        <div className="flex gap-1 bg-white border border-slate-200 p-1 rounded-2xl shadow-sm w-fit">
                            {TABS.map(tab => (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                    className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setShowCreateTopicModal(true)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition shadow-sm"
                        >
                            <PlusIcon className="w-5 h-5" />
                            Create Custom Topic
                        </button>
                    </div>

                    {/* Content */}
                    <div className="min-h-[400px]">
                        {renderContent()}
                    </div>
                </div>
            </div>
        } />
    );
}
