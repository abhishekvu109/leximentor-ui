import { API_LEXIMENTOR_BASE_URL } from "@/constants";
import Link from "next/link";
import { useCallback, useEffect, useState, useMemo } from "react";
import { fetchWithAuth } from "@/dataService";
import {
    MagnifyingGlassIcon,
    BookOpenIcon,
    BoltIcon,
    TrashIcon,
    ArrowPathIcon,
    TagIcon,
    ChartBarIcon,
    SparklesIcon
} from "@heroicons/react/24/outline";

// --- Sub-components ---

const StatusPill = ({ status }) => {
    let color = 'bg-slate-100 text-slate-600 border-slate-200';
    const s = String(status || '').toUpperCase();

    if (s === 'COMPLETED') color = 'bg-green-50 text-green-700 border-green-200';
    if (s === 'IN_PROGRESS' || s === 'IN PROGRESS') color = 'bg-amber-50 text-amber-700 border-amber-200';
    if (s === 'NEW' || s === 'NOT STARTED') color = 'bg-blue-50 text-blue-700 border-blue-200';

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${color}`}>
            {status || 'Unknown'}
        </span>
    );
};

const ActionButton = ({ onClick, icon: Icon, colorClass, tooltip, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        title={tooltip}
        className={`p-2 rounded-lg transition-all duration-200 border border-transparent shadow-sm ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : `${colorClass} hover:shadow-md active:scale-95`}`}
    >
        <Icon className="w-4 h-4" />
    </button>
);

const DrillCard = ({ item, index, analytics, onRemove, onGenerateName }) => {
    // Parsing tags safely
    const tags = useMemo(() => {
        const raw = String(item.namedObjectDTO?.tags || "");
        return raw.match(/"([^"]+)"/g)?.map((str) => str.replace(/"/g, '')) || [];
    }, [item.namedObjectDTO?.tags]);

    const drillName = item.namedObjectDTO?.name || "Untitled Drill";
    const hasName = item.namedObjectDTO?.name && item.namedObjectDTO.name !== '';

    return (
        <div className="group bg-white rounded-xl border border-slate-200 p-4 transition-all duration-200 hover:shadow-lg hover:border-indigo-200 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 animate-in fade-in slide-in-from-bottom-2">

            {/* 1. Identity / Serial */}
            <div className="flex items-center gap-4 min-w-[60px]">
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 font-bold flex items-center justify-center text-xs">
                    {index + 1}
                </div>
            </div>

            {/* 2. Main Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-slate-800 truncate" title={drillName}>
                        {hasName ? drillName : <span className="text-slate-400 italic">No Name Generated</span>}
                    </h3>
                    <StatusPill status={item.status} />
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                    <span className="font-mono bg-slate-50 px-1.5 py-0.5 rounded text-slate-400">ID: {item.refId}</span>
                    {tags.length > 0 && (
                        <div className="flex items-center gap-1">
                            <TagIcon className="w-3 h-3" />
                            <span className="truncate max-w-[200px]">{tags.join(", ")}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* 3. Metrics */}
            <div className="flex items-center gap-6 px-4 py-2 bg-slate-50 rounded-lg border border-slate-100 min-w-[240px] justify-between">
                <div className="text-center">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Avg Score</div>
                    <div className="text-sm font-bold text-indigo-600">{analytics?.avgScore ?? '-'}</div>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div className="text-center">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Words</div>
                    <div className="text-sm font-bold text-slate-700">{analytics?.wordCount ?? '-'}</div>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div className="text-center">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Challenges</div>
                    <div className="text-sm font-bold text-slate-700">{analytics?.challengeCount ?? '-'}</div>
                </div>
            </div>

            {/* 4. Actions */}
            <div className="flex items-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <Link href={`/drills/learning/practice/${item.refId}`}>
                    <div title="Learn">
                        <ActionButton icon={BookOpenIcon} colorClass="bg-blue-50 text-blue-600 hover:bg-blue-100" />
                    </div>
                </Link>
                <Link href={`/challenges/${item.refId}`}>
                    <div title="Challenge">
                        <ActionButton icon={BoltIcon} colorClass="bg-amber-50 text-amber-600 hover:bg-amber-100" />
                    </div>
                </Link>

                <div className="w-px h-6 bg-slate-200 mx-1" />

                <ActionButton
                    icon={ArrowPathIcon}
                    colorClass="bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-indigo-600"
                    tooltip="Generate Name"
                    onClick={() => onGenerateName(item.refId)}
                />
                <ActionButton
                    icon={TrashIcon}
                    colorClass="bg-white text-slate-400 border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                    tooltip="Remove Drill"
                    onClick={() => onRemove(item.refId)}
                />
            </div>
        </div>
    );
};

// --- Main Container ---

export const GetAllDrillTable = ({ drillMetadata }) => {
    const [analyticsCache, setAnalyticsCache] = useState({});
    const [searchTerm, setSearchTerm] = useState("");

    // --- Analytics Logic (Preserved) ---
    const GetDrillAnalytics = useCallback(async (drillRefId) => {
        if (analyticsCache[drillRefId]) return;
        try {
            const response = await fetchWithAuth(`${API_LEXIMENTOR_BASE_URL}/analytics/drill/${drillRefId}`, {
                method: 'GET'
            });
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            setAnalyticsCache(prev => ({
                ...prev, [drillRefId]: {
                    avgScore: data.data.avgDrillScore,
                    wordCount: data.data.countOfWordsLearned,
                    challengeCount: data.data.countOfChallenges
                }
            }));
        } catch (error) { console.error('Error:', error); }
    }, [analyticsCache]);

    useEffect(() => {
        drillMetadata.data?.forEach(item => GetDrillAnalytics(item.refId));
    }, [drillMetadata.data, GetDrillAnalytics]);


    // --- Actions ---
    const RemoveDrill = async (drillRefId) => {
        if (!confirm("Are you sure you want to delete this drill?")) return;
        try {
            const response = await fetchWithAuth(`${API_LEXIMENTOR_BASE_URL}/drill/metadata/${drillRefId}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Network response was not ok');
            // Optimistic Update or Page Refresh could happen here. 
            // For now alerting as per original behavior pattern
            alert("Drill deleted.");
            window.location.reload();
        } catch (error) { console.error('Error:', error); }
    };

    const GenerateName = async (drillRefId) => {
        try {
            const response = await fetchWithAuth(`${API_LEXIMENTOR_BASE_URL}/drill/metadata/assign-name/${drillRefId}`, {
                method: 'POST'
            });
            if (!response.ok) throw new Error('Network response was not ok');
            alert("Name generation triggered.");
            window.location.reload();
        } catch (error) { console.error('Error:', error); }
    };

    // --- Filter Logic ---
    const filteredData = useMemo(() => {
        if (!drillMetadata?.data) return [];
        return drillMetadata.data.filter(item => {
            const s = searchTerm.toLowerCase();
            const name = item.namedObjectDTO?.name?.toLowerCase() || "";
            const ref = item.refId?.toLowerCase() || "";
            return name.includes(s) || ref.includes(s);
        });
    }, [drillMetadata, searchTerm]);


    return (
        <div className="space-y-6">

            {/* Header / Filter Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                    <ChartBarIcon className="w-5 h-5 text-indigo-600" />
                    <h2 className="font-bold text-slate-800 text-lg">Drill Management</h2>
                    <span className="bg-slate-100 text-slate-500 text-xs font-bold px-2 py-1 rounded-full">
                        {filteredData.length}
                    </span>
                </div>

                <div className="relative w-full md:w-72">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search drills..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-400 focus:outline-none focus:placeholder-slate-300 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                    />
                </div>
            </div>

            {/* List */}
            <div className="space-y-3">
                {filteredData.length > 0 ? (
                    filteredData.map((item, index) => (
                        <DrillCard
                            key={item.refId}
                            item={item}
                            index={index}
                            analytics={analyticsCache[item.refId]}
                            onRemove={RemoveDrill}
                            onGenerateName={GenerateName}
                        />
                    ))
                ) : (
                    <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                        <SparklesIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-slate-500 font-medium">No drills found</h3>
                        <p className="text-slate-400 text-sm">Try creating a new drill or adjusting filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
};