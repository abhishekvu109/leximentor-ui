import writewiseService from "../../../../../services/writewise.service";
import Layout from "@/components/layout/Layout";
import { useEffect, useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import Link from "next/link";
import "react-quill/dist/quill.snow.css";
import ToastContainer from "@/components/common/ToastContainer";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { useToast } from "@/hooks/useToast";
import { PlusIcon, ArrowLeftIcon, CheckCircleIcon } from "@heroicons/react/24/solid";
import { MODEL_DATA } from "@/constants";

// Dynamic import for ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

// --- Components ---

const StatusBadge = ({ status }) => {
    let colorClass = "bg-slate-100 text-slate-600";
    if (status === 'SUBMITTED') colorClass = "bg-green-100 text-green-700";
    if (status === 'DRAFT') colorClass = "bg-amber-100 text-amber-700";

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${colorClass}`}>
            {status || 'Draft'}
        </span>
    );
};

const WritingPad = () => {
    const router = useRouter();
    const { ids } = router.query;
    const topicRefId = ids?.[0];
    const toast = useToast();

    // --- State ---
    const [topic, setTopic] = useState({});
    const [responseVersions, setResponseVersions] = useState({ data: { responseVersionDTOs: [] } });
    const [selectedVersion, setSelectedVersion] = useState(null);
    const [essayContent, setEssayContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedModel, setSelectedModel] = useState('');
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [showCreateVersionDialog, setShowCreateVersionDialog] = useState(false);

    // Derived State
    const wordCount = useMemo(() => {
        if (typeof document === 'undefined') return 0;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = essayContent;
        const text = tempDiv.textContent || tempDiv.innerText || "";
        return text.trim().length > 0 ? text.trim().split(/\s+/).length : 0;
    }, [essayContent]);

    // Data Loading - Only load on mount and when topicRefId changes
    useEffect(() => {
        if (!topicRefId) {
            setLoading(false);
            return;
        }

        let isMounted = true;
        setLoading(true);

        const loadData = async () => {
            try {
                const [topicsRes, versionsRes] = await Promise.all([
                    writewiseService.getTopic(topicRefId),
                    writewiseService.getResponseVersions(topicRefId)
                ]);

                if (isMounted) {
                    setTopic(topicsRes?.data || {});
                    setResponseVersions(versionsRes || { data: { responseVersionDTOs: [] } });

                    if (versionsRes?.data?.responseVersionDTOs?.length > 0) {
                        const firstVersion = versionsRes.data.responseVersionDTOs[0];
                        setSelectedVersion(firstVersion);
                        setEssayContent(firstVersion.response || '');

                        // Fetch full version details to get evaluation status
                        if (firstVersion?.refId) {
                            try {
                                const versionDetails = await writewiseService.getResponseVersion(topicRefId, firstVersion.refId);
                                if (versionDetails?.data && isMounted) {
                                    setSelectedVersion(versionDetails.data);
                                }
                            } catch (err) {
                                console.error("Failed to load version details:", err);
                            }
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to load writing pad data:", error);
                if (isMounted) {
                    const errorMsg = error?.response?.data?.data || error?.message || "Failed to load topic data";
                    // Only show error toast if we still have the toast reference
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

        loadData();

        return () => {
            isMounted = false;
        };
    }, [topicRefId]);

    // Auto-refresh selected version data periodically to get latest evaluation status
    useEffect(() => {
        if (!selectedVersion?.refId || !topicRefId) return;

        const interval = setInterval(async () => {
            try {
                const res = await writewiseService.getResponseVersion(topicRefId, selectedVersion.refId);
                if (res?.data) {
                    setSelectedVersion(res.data);
                }
            } catch (error) {
                console.error("Auto-refresh failed:", error);
            }
        }, 5000); // Refresh every 5 seconds

        return () => clearInterval(interval);
    }, [selectedVersion?.refId, topicRefId]);

    // Refresh data when page becomes visible (tab focus)
    useEffect(() => {
        const handleVisibilityChange = async () => {
            if (document.hidden) return;
            // Page is now visible - refresh the version data
            if (selectedVersion?.refId && topicRefId) {
                try {
                    const res = await writewiseService.getResponseVersion(topicRefId, selectedVersion.refId);
                    if (res?.data) {
                        setSelectedVersion(res.data);
                    }
                } catch (error) {
                    console.error("Refresh on focus failed:", error);
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [selectedVersion?.refId, topicRefId]);


    // --- Handlers ---

    const refreshVersionData = useCallback(async (versionRefId) => {
        try {
            const res = await writewiseService.getResponseVersion(topicRefId, versionRefId);
            console.log('Refreshed version data:', res?.data);
            if (res?.data) {
                setSelectedVersion(res.data);
                // Also update the versions list
                const newVersionsRes = await writewiseService.getResponseVersions(topicRefId);
                setResponseVersions(newVersionsRes || { data: { responseVersionDTOs: [] } });
            }
        } catch (error) {
            console.error("Failed to refresh version data:", error);
        }
    }, [topicRefId]);

    const handleVersionChange = (e) => {
        const index = e.target.selectedIndex;
        const version = responseVersions.data.responseVersionDTOs[index];
        setSelectedVersion(version);
        setEssayContent(version.response || '');
        // Refresh the version data to get latest evaluation status
        if (version?.refId) {
            refreshVersionData(version.refId);
        }
    };

    const handleCreateVersion = () => {
        setShowCreateVersionDialog(true);
    };

    const handleConfirmCreateVersion = () => {
        setShowCreateVersionDialog(false);
        setSelectedVersion(null);
        setEssayContent("");
        toast.success("Ready for a fresh draft! Start writing your new version.");
    };

    const handleSave = async (type = 'Draft') => { // 'Draft' or 'Submit'
        if (!essayContent.trim()) {
            toast.warning("Please write some content before saving.");
            return;
        }

        setIsSaving(true);
        const submitType = type === 'Draft' ? 0 : 1;

        const payload = {
            writingSessionRefId: topic.writingSessionRefId,
            topicRefId: topic.refId,
            responseType: submitType,
            response: essayContent
        };

        try {
            await writewiseService.saveResponse(payload);

            toast.success(`Essay ${type === 'Submit' ? 'submitted' : 'saved'} successfully!`);

            // Refresh versions after save
            const newVersionsRes = await writewiseService.getResponseVersions(topicRefId);
            setResponseVersions(newVersionsRes || { data: { responseVersionDTOs: [] } });

            if (type === 'Submit') {
                if (selectedVersion) {
                    setSelectedVersion(prev => ({ ...prev, responseStatus: 'SUBMITTED' }));
                }
            }

        } catch (error) {
            console.error(error);
            const errorMsg = error?.response?.data?.data || error?.message || "Error saving essay. Please try again.";
            toast.error(errorMsg);
        } finally {
            setIsSaving(false);
        }
    };


    const handleEvaluate = async () => {
        if (!selectedModel) {
            toast.error('Please select an AI model first.');
            return;
        }
        if (!selectedVersion?.refId) {
            toast.error('No submitted version found. Please submit your essay first.');
            return;
        }
        if (String(selectedVersion?.responseStatus).toUpperCase() !== 'SUBMITTED') {
            toast.error('You must submit your essay before evaluation. Please submit first.');
            return;
        }

        setIsEvaluating(true);
        const payload = { topicRefId, versionRefId: selectedVersion.refId, model: selectedModel };
        try {
            toast.info("Starting evaluation... This may take a moment.");

            await Promise.all([
                writewiseService.evaluateResponse({ ...payload, isHighLevel: true }),
                writewiseService.evaluateResponse({ ...payload, isHighLevel: false }),
            ]);

            await Promise.all([
                writewiseService.submitEvaluationResults({ ...payload, isHighLevel: true }),
                writewiseService.submitEvaluationResults({ ...payload, isHighLevel: false }),
            ]);

            toast.success("Evaluation submitted! Redirecting to results...");
            setTimeout(() => {
                router.push(`/writewise/topics/topic/evaluation-view/${topicRefId}/${selectedVersion.refId}`);
            }, 1500);
        } catch (err) {
            console.error('Evaluation failed:', err);
            const errorMsg = err?.response?.data?.data || err?.message || 'Evaluation failed. Please try again.';
            toast.error(errorMsg);
        } finally {
            setIsEvaluating(false);
        }
    };

    // --- Editor Config ---
    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'color': [] }, { 'background': [] }],
            ['clean']
        ],
    };


    // --- Render ---
    if (loading) return <Layout content={<div className="p-8 text-center text-slate-500 font-bold">Loading Writing Pad...</div>} />;

    const isSubmitted = String(selectedVersion?.responseStatus).toUpperCase() === 'SUBMITTED';

    // Check if version is evaluated - check the evaluation object status
    // After submission, the llmEvaluationStatus and lowLevelEvaluationStatus are cleared,
    // so we check the evaluation.evaluationStatus field instead
    const isEvaluated = !!(
        selectedVersion?.evaluation?.evaluationStatus === 'COMPLETED' ||
        // Also check if evaluation has been populated with results
        (selectedVersion?.evaluation?.evaluationResult && selectedVersion?.evaluation?.errorList)
    );

    const canCreateNewVersion = isSubmitted && isEvaluated;

    return (
        <Layout content={
            <div className="min-h-screen bg-slate-50 font-sans -m-4 sm:-m-8">
                <ToastContainer toasts={toast.toasts} onRemoveToast={toast.removeToast} />

                <ConfirmDialog
                    isOpen={showCreateVersionDialog}
                    title="Create New Version?"
                    message="This will create a fresh draft for you to start writing a new version. Your current version will remain saved."
                    confirmText="Create Version"
                    cancelText="Keep Current"
                    onConfirm={handleConfirmCreateVersion}
                    onCancel={() => setShowCreateVersionDialog(false)}
                />

                {/* Navigation Breadcrumb */}
                <nav className="bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-2 text-sm">
                    <Link href="/writewise/dashboard" className="text-indigo-600 hover:text-indigo-700 font-medium">
                        Dashboard
                    </Link>
                    <span className="text-slate-400">/</span>
                    <Link href="/writewise/topics/generate-topics" className="text-indigo-600 hover:text-indigo-700 font-medium">
                        Topics
                    </Link>
                    <span className="text-slate-400">/</span>
                    <span className="text-slate-600 font-medium">Writing</span>
                </nav>

                {/* Top Bar */}
                <header className="bg-white border-b border-slate-200 px-6 my-4 py-4 flex flex-col md:flex-row justify-between items-center sticky top-0 z-10 shadow-sm gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                            title="Go back"
                        >
                            <ArrowLeftIcon className="w-5 h-5" />
                        </button>
                        <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-lg">
                            {topic.topicNo || '#'}
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-800 leading-tight line-clamp-1">{topic.topic}</h1>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span>{topic.topicNo}</span>
                                <span>•</span>
                                <StatusBadge status={selectedVersion?.responseStatus} />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        {/* Version Select */}
                        {responseVersions?.data?.responseVersionDTOs?.length > 1 && (
                            <div className="flex items-center gap-1">
                                <select
                                    onChange={handleVersionChange}
                                    value={selectedVersion?.refId}
                                    className="text-sm bg-slate-50 border-slate-200 rounded-lg py-2 pl-3 pr-8 focus:ring-indigo-500"
                                >
                                    {responseVersions.data.responseVersionDTOs.map((v, i) => (
                                        <option key={i} value={v.refId}>Version {v.versionNumber}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <button
                            onClick={handleCreateVersion}
                            disabled={!canCreateNewVersion}
                            className={`p-2 rounded-lg transition border border-transparent ${
                                canCreateNewVersion
                                    ? 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-100 cursor-pointer'
                                    : 'text-slate-300 cursor-not-allowed opacity-50'
                            }`}
                            title={canCreateNewVersion ? "Create New Version" : "Submit and evaluate the current version first"}
                        >
                            <PlusIcon className="w-5 h-5" />
                        </button>

                        <div className="bg-slate-100 px-4 py-2 rounded-lg text-sm font-medium text-slate-600">
                            {wordCount} Words
                        </div>

                        {!isSubmitted && (
                            <>
                                <button
                                    onClick={() => handleSave('Draft')}
                                    disabled={isSaving}
                                    className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium transition shadow-sm"
                                >
                                    {isSaving ? 'Saving...' : 'Save Draft'}
                                </button>
                                <button
                                    onClick={() => handleSave('Submit')}
                                    disabled={isSaving}
                                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition shadow disabled:opacity-50"
                                >
                                    Submit
                                </button>
                            </>
                        )}
                        {isSubmitted && (
                            <span className="px-3 py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded-lg border border-green-200 uppercase tracking-wide">
                                Submitted
                            </span>
                        )}
                    </div>
                </header>

                <main className="max-w-[1600px] mx-auto p-6 md:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">

                        {/* Left Sidebar: Context & Help */}
                        <aside className="lg:col-span-3 space-y-4">
                            {/* Description */}
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">About this topic</h3>
                                <p className="text-slate-700 text-sm leading-relaxed">
                                    {topic.description || "No description provided."}
                                </p>
                            </div>

                            {/* Key Points */}
                            {topic.points?.length > 0 && (
                                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Key points to cover</h3>
                                    <ul className="space-y-2.5">
                                        {topic.points.map((point, i) => (
                                            <li key={i} className="flex gap-2.5 items-start text-sm text-slate-700 leading-relaxed">
                                                <span className="mt-1 shrink-0 w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-[10px] font-black flex items-center justify-center">
                                                    {i + 1}
                                                </span>
                                                {point}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Learning objective */}
                            {topic.learning && (
                                <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
                                    <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">What you will learn</h3>
                                    <p className="text-sm text-emerald-900/80 leading-relaxed">{topic.learning}</p>
                                </div>
                            )}

                            {/* Writing Tips */}
                            {topic.recommendations?.length > 0 && (
                                <div className="bg-indigo-50 p-5 rounded-2xl border border-indigo-100">
                                    <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-3">Writing tips</h3>
                                    <ul className="space-y-2.5">
                                        {topic.recommendations.map((rec, i) => (
                                            <li key={i} className="flex gap-2 items-start text-sm text-indigo-900/80 leading-relaxed">
                                                <span className="mt-1.5 w-1.5 h-1.5 bg-indigo-400 rounded-full shrink-0" />
                                                {rec}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </aside>

                        {/* Center: Editor */}
                        <section className="lg:col-span-9 flex flex-col h-[calc(100vh-200px)] min-h-[500px]">
                            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                                <ReactQuill
                                    theme="snow"
                                    value={essayContent}
                                    onChange={setEssayContent}
                                    modules={modules}
                                    readOnly={isSubmitted}
                                    className="flex-1 flex flex-col h-full"
                                    placeholder="Start writing your essay here..."
                                />
                                {/* Custom CSS override for Quill to make it fill height */}
                                <style jsx global>{`
                                    .quill { display: flex; flex-direction: column; height: 100%; }
                                    .ql-container { flex: 1; display: flex; flex-direction: column; font-family: 'Inter', sans-serif; font-size: 1rem; }
                                    .ql-editor { flex: 1; padding: 2rem; overflow-y: auto; line-height: 1.8; color: #334155; }
                                    .ql-toolbar { border-top: none !important; border-left: none !important; border-right: none !important; border-bottom: 1px solid #e2e8f0 !important; background: #f8fafc; padding: 12px !important; }
                                    .ql-container.ql-snow { border: none !important; }
                                `}</style>
                            </div>
                        </section>

                    </div>
                </main>
            </div>
        } />
    );
};

export default WritingPad;
