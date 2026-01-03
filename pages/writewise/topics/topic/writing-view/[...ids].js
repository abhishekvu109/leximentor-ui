import { fetchWithAuth } from "@/dataService";
import { API_WRITEWISE_BASE_URL } from "@/constants";
import Layout from "@/components/layout/Layout";
import { useEffect, useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import "react-quill/dist/quill.snow.css";
import { PlusIcon } from "@heroicons/react/24/solid";

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

    // --- State ---
    const [topic, setTopic] = useState({});
    const [responseVersions, setResponseVersions] = useState({ data: { responseVersionDTOs: [] } });
    const [selectedVersion, setSelectedVersion] = useState(null);
    const [essayContent, setEssayContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    // Derived State
    const wordCount = useMemo(() => {
        if (typeof document === 'undefined') return 0;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = essayContent;
        const text = tempDiv.textContent || tempDiv.innerText || "";
        return text.trim().length > 0 ? text.trim().split(/\s+/).length : 0;
    }, [essayContent]);

    // Data Loading
    const loadData = useCallback(async () => {
        if (!topicRefId) return;
        setLoading(true);
        try {
            const [topicsRes, versionsRes] = await Promise.all([
                fetchWithAuth(`${API_WRITEWISE_BASE_URL}/v1/topics/topic/${topicRefId}`).then(res => res.json()),
                fetchWithAuth(`${API_WRITEWISE_BASE_URL}/v1/response/response-version/${topicRefId}`).then(res => res.json())
            ]);

            setTopic(topicsRes?.data || {});
            setResponseVersions(versionsRes || { data: { responseVersionDTOs: [] } });

            if (versionsRes?.data?.responseVersionDTOs?.length > 0) {
                const firstVersion = versionsRes.data.responseVersionDTOs[0];
                setSelectedVersion(firstVersion);
                setEssayContent(firstVersion.response || '');
            }
        } catch (error) {
            console.error("Failed to load writing pad data:", error);
        } finally {
            setLoading(false);
        }
    }, [topicRefId]);

    useEffect(() => {
        loadData();
    }, [loadData]);


    // --- Handlers ---

    const handleVersionChange = (e) => {
        const index = e.target.selectedIndex;
        const version = responseVersions.data.responseVersionDTOs[index];
        setSelectedVersion(version);
        setEssayContent(version.response || '');
    };

    const handleCreateVersion = () => {
        if (confirm("Create a new version? This will let you start a fresh draft.")) {
            setSelectedVersion(null);
            setEssayContent("");
        }
    };

    const handleSave = async (type = 'Draft') => { // 'Draft' or 'Submit'
        setIsSaving(true);
        const submitType = type === 'Draft' ? 0 : 1;

        const payload = {
            writingSessionRefId: topic.writingSessionRefId,
            topicRefId: topic.refId,
            responseType: submitType,
            response: essayContent
        };

        try {
            const res = await fetchWithAuth(`${API_WRITEWISE_BASE_URL}/v1/response`, {
                method: "POST",
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Failed to save.");

            alert(`Essay ${type === 'Submit' ? 'submitted' : 'saved'} successfully!`);

            // Refresh versions after save
            const newVersionsRes = await fetchWithAuth(`${API_WRITEWISE_BASE_URL}/v1/response/response-version/${topicRefId}`).then(res => res.json());
            setResponseVersions(newVersionsRes || { data: { responseVersionDTOs: [] } });

            if (type === 'Submit') {
                if (selectedVersion) {
                    setSelectedVersion(prev => ({ ...prev, responseStatus: 'SUBMITTED' }));
                }
            }

        } catch (error) {
            console.error(error);
            alert("Error saving essay. Please try again.");
        } finally {
            setIsSaving(false);
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

    return (
        <Layout content={
            <div className="min-h-screen bg-slate-50 font-sans -m-4 sm:-m-8">
                {/* Top Bar */}
                <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row justify-between items-center sticky top-0 z-10 shadow-sm gap-4">
                    <div className="flex items-center gap-4">
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
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition border border-transparent hover:border-indigo-100"
                            title="Create New Version"
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
                            <div className="px-4 py-2 bg-green-50 text-green-700 text-sm font-medium rounded-lg border border-green-200">
                                Essay Submitted
                            </div>
                        )}
                    </div>
                </header>

                <main className="max-w-[1600px] mx-auto p-6 md:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">

                        {/* Left Sidebar: Context & Help */}
                        <aside className="lg:col-span-3 space-y-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Topic Description</h3>
                                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                                    {topic.description || "No description provided."}
                                </p>
                            </div>

                            {topic.recommendations && topic.recommendations.length > 0 && (
                                <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                                    <h3 className="flex items-center gap-2 text-indigo-800 font-bold mb-4">
                                        <span>💡</span> Writing Tips
                                    </h3>
                                    <ul className="space-y-3">
                                        {topic.recommendations.map((rec, i) => (
                                            <li key={i} className="text-sm text-indigo-900/80 flex items-start gap-2">
                                                <span className="mt-1.5 w-1.5 h-1.5 bg-indigo-400 rounded-full shrink-0" />
                                                <span>{rec}</span>
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
