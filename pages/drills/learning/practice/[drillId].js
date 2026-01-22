import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchWithAuth } from "@/dataService";
import { API_LEXIMENTOR_BASE_URL } from "@/constants";
import Layout from "@/components/layout/Layout";
import FlashcardView from "@/components/practice/FlashcardView";
import DetailedView from "@/components/practice/DetailedView";
import { ViewColumnsIcon, RectangleStackIcon } from "@heroicons/react/24/outline";
import { ArrowLeft, Trophy } from "lucide-react";



export default function VocabularyCard() {
    const router = useRouter();
    const { drillId } = router.query;
    console.log(drillId);
    const [drillSetData, setDrillSetData] = useState(null);
    const [sourcesData, setSourcesData] = useState({ data: [] });
    const [wordMetadata, setWordMetadata] = useState(null);
    const [loading, setLoading] = useState(true);

    const [isToggleChecked, setIsToggleChecked] = useState(false);
    const [isRendering, setIsRendering] = useState(false);

    useEffect(() => {
        if (!drillId) return;

        const loadData = async () => {
            setLoading(true);
            try {
                const drillSetRes = await fetchWithAuth(`${API_LEXIMENTOR_BASE_URL}/drill/metadata/sets/${drillId}`);
                if (!drillSetRes.ok) throw new Error("Failed to load drill set");
                const drillSetJson = await drillSetRes.json();
                setDrillSetData(drillSetJson);

                if (drillSetJson.data?.[0]?.wordRefId) {
                    const wordRefId = drillSetJson.data[0].wordRefId;
                    const sourcesRes = await fetchWithAuth(`${API_LEXIMENTOR_BASE_URL}/inventory/words/${wordRefId}/sources`);
                    if (sourcesRes.ok) {
                        const sourcesJson = await sourcesRes.json();
                        setSourcesData(sourcesJson);

                        if (sourcesJson.data?.[0]) {
                            const firstSource = sourcesJson.data[0];
                            const metaRes = await fetchWithAuth(`${API_LEXIMENTOR_BASE_URL}/inventory/words/${wordRefId}/sources/${firstSource}`);
                            if (metaRes.ok) {
                                setWordMetadata(await metaRes.json());
                            }
                        }
                    }
                }
            } catch (error) {
                console.error("Error loading practice data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [drillId]);

    useEffect(() => {
        if (typeof window !== "undefined" && window.initFlowbite) {
            window.initFlowbite();
        }
    }, [loading]);

    const handleToggle = () => {
        setIsRendering(true);
        setTimeout(() => {
            setIsToggleChecked(prev => !prev);
            setIsRendering(false);
        }, 300);
    };

    if (loading) {
        return <Layout content={<div className="p-20 text-center text-slate-500 font-bold animate-pulse">Loading drill data...</div>} />;
    }

    if (!drillSetData) {
        return <Layout content={<div className="p-20 text-center text-red-500 font-bold">Drill data not found.</div>} />;
    }

    return (<Layout content={<>
        {/* Header with Toggle */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/drills/drills/list-drills"
                            className="p-2.5 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-slate-600 border border-transparent hover:border-slate-100 group"
                            title="Back to Drills"
                        >
                            <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-black text-slate-800">Practice Mode</h1>
                                <Link
                                    href={`/challenges/${drillId}`}
                                    className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-wider hover:bg-amber-100 transition-colors border border-amber-100 shadow-sm"
                                >
                                    <Trophy size={12} className="fill-amber-500/10" />
                                    Go to Challenges
                                </Link>
                            </div>
                            <p className="text-sm text-slate-500 mt-0.5">
                                {drillSetData?.data?.length || 0} words in this drill
                            </p>
                        </div>
                    </div>

                    {/* Modern Toggle */}
                    <div className="flex items-center gap-3 bg-slate-100 rounded-xl p-1.5">
                        <button
                            onClick={() => !isToggleChecked && handleToggle()}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm transition-all ${!isToggleChecked
                                ? 'bg-white text-indigo-600 shadow-md'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <ViewColumnsIcon className="w-5 h-5" />
                            Detailed View
                        </button>
                        <button
                            onClick={() => isToggleChecked && handleToggle()}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm transition-all ${isToggleChecked
                                ? 'bg-white text-indigo-600 shadow-md'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <RectangleStackIcon className="w-5 h-5" />
                            Flashcard View
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Content Area */}
        <div className="bg-gradient-to-br from-slate-50 via-white to-indigo-50 min-h-screen">
            <div
                className={`transition-all duration-300 ease-in-out transform 
                    ${isRendering ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                {isToggleChecked ? (<FlashcardView
                    drillSetData={drillSetData}
                    sourcesData={sourcesData}
                    wordMetadata={wordMetadata}
                />) : (<DetailedView
                    drillId={drillId}
                    drillSetData={drillSetData}
                    sourcesData={sourcesData}
                    wordMetadata={wordMetadata}
                />)}
            </div>
        </div>
    </>} />);
}
