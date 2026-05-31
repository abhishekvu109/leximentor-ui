import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import writewiseService from "../../../../../services/writewise.service";
import Layout from "@/components/layout/Layout";
import { useRouter } from "next/router";

// --- Utilities ---

const stripHtml = (html) => {
    if (!html) return '';
    return html
        .replace(/<\/p>/gi, '\n')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .trim();
};

// --- Components ---

const ScoreRing = ({ score, size = "large" }) => {
    const radius = size === "large" ? 50 : 20;
    const stroke = size === "large" ? 8 : 4;
    const normalizedScore = Math.max(0, Math.min(score, 100));
    const strokeDasharray = `${(normalizedScore / 100) * (2 * Math.PI * radius)} ${2 * Math.PI * radius}`;

    let color = "text-indigo-600";
    if (score >= 80) color = "text-green-500";
    else if (score >= 60) color = "text-indigo-500";
    else if (score >= 40) color = "text-yellow-500";
    else color = "text-red-500";

    return (
        <div className={`relative flex items-center justify-center ${size === 'large' ? 'w-32 h-32' : 'w-12 h-12'}`}>
            <svg className="w-full h-full transform -rotate-90">
                <circle cx="50%" cy="50%" r={radius} stroke="currentColor" strokeWidth={stroke} fill="transparent" className="text-slate-100" />
                <circle cx="50%" cy="50%" r={radius} stroke="currentColor" strokeWidth={stroke} fill="transparent" strokeDasharray={strokeDasharray} strokeLinecap="round" className={color} />
            </svg>
            <div className={`absolute inset-0 flex items-center justify-center font-bold text-slate-700 ${size === 'large' ? 'text-3xl' : 'text-xs'}`}>
                {Math.round(score)}
            </div>
        </div>
    );
};

const scoreColor = (s) => {
    if (s >= 80) return { bar: 'bg-green-500',  text: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-200',  badge: 'bg-green-100 text-green-700',  label: 'Good' };
    if (s >= 60) return { bar: 'bg-amber-400',  text: 'text-amber-700',  bg: 'bg-amber-50',  border: 'border-amber-200',  badge: 'bg-amber-100 text-amber-700',  label: 'Fair' };
    return         { bar: 'bg-red-500',    text: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-200',    badge: 'bg-red-100 text-red-700',    label: 'Needs Work' };
};

const MetricCard = ({ title, icon, score, comments = [], suggestions = [] }) => {
    const [open, setOpen] = useState(true);
    const sc = scoreColor(score || 0);
    const hasSuggestions = suggestions.length > 0;
    const hasComments = comments.length > 0;

    return (
        <div className={`rounded-2xl border ${sc.border} overflow-hidden transition-all duration-200 bg-white shadow-sm`}>
            {/* Header */}
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-50/70 transition text-left"
            >
                <span className="text-xl">{icon}</span>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-slate-800 text-sm">{title}</span>
                        <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${sc.badge}`}>
                                {sc.label}
                            </span>
                            <span className={`text-sm font-black ${sc.text}`}>{score ?? 0}</span>
                        </div>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-700 ${sc.bar}`} style={{ width: `${score ?? 0}%` }} />
                    </div>
                </div>
                <span className={`text-slate-400 text-xs transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>▲</span>
            </button>

            {/* Body */}
            {open && (hasComments || hasSuggestions) && (
                <div className={`border-t ${sc.border} ${sc.bg} divide-y divide-slate-100/60`}>
                    {hasComments && (
                        <div className="px-5 py-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">What was found</p>
                            <ul className="space-y-2">
                                {comments.map((c, i) => (
                                    <li key={i} className="flex gap-2.5 items-start text-sm text-slate-700 leading-relaxed">
                                        <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${sc.bar}`} />
                                        {c}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {hasSuggestions && (
                        <div className="px-5 py-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">How to fix it</p>
                            <ul className="space-y-2">
                                {suggestions.map((s, i) => (
                                    <li key={i} className="flex gap-2.5 items-start text-sm text-slate-700 font-medium leading-relaxed">
                                        <span className="mt-1 shrink-0 text-green-500 font-black">✓</span>
                                        {s}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const ERROR_TYPE_META = {
    GRAMMAR:     { label: 'Grammar',     color: 'red',    bg: 'bg-red-50',     border: 'border-red-200',     text: 'text-red-700',     dot: 'bg-red-400' },
    TYPOS:       { label: 'Spelling',    color: 'orange', bg: 'bg-orange-50',  border: 'border-orange-200',  text: 'text-orange-700',  dot: 'bg-orange-400' },
    PUNCTUATION: { label: 'Punctuation', color: 'yellow', bg: 'bg-yellow-50',  border: 'border-yellow-200',  text: 'text-yellow-700',  dot: 'bg-yellow-400' },
    STYLE:       { label: 'Style',       color: 'indigo', bg: 'bg-indigo-50',  border: 'border-indigo-200',  text: 'text-indigo-700',  dot: 'bg-indigo-400' },
};

const getTypeMeta = (type) => ERROR_TYPE_META[type?.toUpperCase()] || {
    label: type || 'Other',
    bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', dot: 'bg-slate-400',
};

const TYPE_STYLE = {
    GRAMMAR:     { label: 'Grammar',     underline: 'border-red-400',    bg: 'bg-red-50',     activeBg: 'bg-red-100',     badge: 'bg-red-100 text-red-700 border-red-200',     dot: 'bg-red-400'    },
    TYPOS:       { label: 'Spelling',    underline: 'border-orange-400', bg: 'bg-orange-50',  activeBg: 'bg-orange-100',  badge: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-400' },
    PUNCTUATION: { label: 'Punctuation', underline: 'border-amber-400',  bg: 'bg-amber-50',   activeBg: 'bg-amber-100',   badge: 'bg-amber-100 text-amber-700 border-amber-200',   dot: 'bg-amber-400'  },
    STYLE:       { label: 'Style',       underline: 'border-indigo-400', bg: 'bg-indigo-50',  activeBg: 'bg-indigo-100',  badge: 'bg-indigo-100 text-indigo-700 border-indigo-200', dot: 'bg-indigo-400' },
};
const getStyle = (type) => TYPE_STYLE[type?.toUpperCase()] || {
    label: type || 'Other', underline: 'border-slate-400', bg: 'bg-slate-50', activeBg: 'bg-slate-100',
    badge: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-400',
};

const AnnotationsView = ({ text = "", errors = [] }) => {
    const [selectedIdx, setSelectedIdx] = useState(null);
    const [typeFilter, setTypeFilter] = useState('ALL');
    const textErrRefs = useRef({});
    const sidebarErrRefs = useRef({});

    const sortedErrors = useMemo(
        () => [...errors].sort((a, b) => a.start - b.start),
        [errors]
    );

    const typeCounts = useMemo(() => sortedErrors.reduce((acc, e) => {
        const k = e.type?.toUpperCase() || 'OTHER';
        acc[k] = (acc[k] || 0) + 1;
        return acc;
    }, {}), [sortedErrors]);

    const visibleErrors = useMemo(() =>
        typeFilter === 'ALL' ? sortedErrors : sortedErrors.filter(e => (e.type?.toUpperCase() || 'OTHER') === typeFilter),
        [sortedErrors, typeFilter]
    );

    const selectError = useCallback((idx, source) => {
        setSelectedIdx(idx);
        if (source === 'sidebar' && textErrRefs.current[idx]) {
            textErrRefs.current[idx].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        if (source === 'text' && sidebarErrRefs.current[idx]) {
            sidebarErrRefs.current[idx].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, []);

    // Build text segments using sortedErrors (positions always refer to full error list)
    const segments = useMemo(() => {
        if (!text) return [];
        const segs = [];
        let cur = 0;
        for (let i = 0; i < sortedErrors.length; i++) {
            const err = sortedErrors[i];
            if (err.start > cur) segs.push({ type: 'text', text: text.slice(cur, err.start) });
            if (err.end > err.start) segs.push({ type: 'error', text: text.slice(err.start, err.end), err, idx: i });
            cur = Math.max(cur, err.end);
        }
        if (cur < text.length) segs.push({ type: 'text', text: text.slice(cur) });
        return segs;
    }, [text, sortedErrors]);

    if (!text && errors.length === 0) return (
        <div className="text-center py-20 text-slate-400 font-medium">No essay content to annotate.</div>
    );

    const filterTypes = ['ALL', ...Object.keys(typeCounts)];

    return (
        <div className="animate-in fade-in duration-400 space-y-4 my-6">
            {/* Filter chips */}
            <div className="flex flex-wrap gap-2 items-center">
                {filterTypes.map(t => {
                    const st = t === 'ALL' ? null : getStyle(t);
                    const active = typeFilter === t;
                    return (
                        <button key={t} onClick={() => setTypeFilter(t)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                                active
                                    ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                            }`}>
                            {st && <span className={`w-2 h-2 rounded-full ${st.dot}`} />}
                            {t === 'ALL' ? 'All Issues' : st?.label ?? t}
                            <span className={`ml-0.5 ${active ? 'text-white/70' : 'text-slate-400'}`}>
                                {t === 'ALL' ? sortedErrors.length : typeCounts[t]}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Split layout */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 items-start">

                {/* Left — Annotated essay */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 lg:p-10">
                    {errors.length === 0 ? (
                        <p className="whitespace-pre-line text-base leading-relaxed text-slate-600 font-serif">{text}</p>
                    ) : (
                        <div className="whitespace-pre-line text-base leading-relaxed text-slate-700 font-serif">
                            {segments.map((seg, i) => {
                                if (seg.type === 'text') return <span key={i}>{seg.text}</span>;
                                const st = getStyle(seg.err.type);
                                const isHidden = typeFilter !== 'ALL' && (seg.err.type?.toUpperCase() || 'OTHER') !== typeFilter;
                                const isSelected = selectedIdx === seg.idx;
                                if (isHidden) return <span key={i}>{seg.text}</span>;
                                return (
                                    <span
                                        key={i}
                                        ref={el => textErrRefs.current[seg.idx] = el}
                                        onClick={() => selectError(seg.idx, 'text')}
                                        className={`cursor-pointer border-b-2 ${st.underline} ${isSelected ? st.activeBg + ' ring-1 ring-offset-1 ring-current rounded-sm' : st.bg} hover:${st.activeBg} transition-all rounded-sm px-0.5`}
                                    >
                                        {seg.text}
                                    </span>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Right — Error sidebar */}
                <div className="lg:sticky lg:top-4 flex flex-col gap-2 overflow-y-auto pr-1" style={{ maxHeight: 'calc(100vh - 120px)' }}>
                    {visibleErrors.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-sm font-medium">
                            No issues in this category.
                        </div>
                    ) : visibleErrors.map((err, listIdx) => {
                        const origIdx = sortedErrors.indexOf(err);
                        const st = getStyle(err.type);
                        const isSelected = selectedIdx === origIdx;

                        // Field-name fallbacks for different backend shapes
                        const incorrectText = err.incorrectText || (text ? text.slice(err.start, err.end) : '');
                        const correctText = err.correctText || err.replacement || err.replacements?.[0]?.value || '';
                        const explanation = err.explanation || err.message || err.shortMessage || '';

                        return (
                            <div
                                key={origIdx}
                                ref={el => sidebarErrRefs.current[origIdx] = el}
                                onClick={() => selectError(origIdx, 'sidebar')}
                                className={`rounded-xl border cursor-pointer transition-all duration-150 ${
                                    isSelected
                                        ? `${st.bg} ${st.badge.split(' ')[1]} border-current shadow-md`
                                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                                }`}
                            >
                                <div className="px-4 py-3 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${st.badge}`}>
                                            {st.label}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-mono">#{listIdx + 1}</span>
                                    </div>

                                    {(incorrectText || correctText) && (
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {incorrectText && (
                                                <span className="font-mono text-xs line-through text-red-500 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
                                                    {incorrectText}
                                                </span>
                                            )}
                                            {correctText && (
                                                <>
                                                    <span className="text-slate-300 text-xs">→</span>
                                                    <span className="font-mono text-xs text-green-700 font-bold bg-green-50 px-1.5 py-0.5 rounded border border-green-100">
                                                        {correctText}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    )}

                                    {explanation && (
                                        <p className="text-xs text-slate-500 leading-relaxed">{explanation}</p>
                                    )}

                                    {!incorrectText && !correctText && !explanation && (
                                        <p className="text-xs text-slate-400 italic">No additional details available.</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// --- Views ---

const METRICS = [
    { key: 'grammar',              label: 'Grammar',       icon: '📝' },
    { key: 'vocabulary',           label: 'Vocabulary',    icon: '📖' },
    { key: 'spelling',             label: 'Spelling',      icon: '🔤' },
    { key: 'punctuation',          label: 'Punctuation',   icon: '✏️' },
    { key: 'styleAndTone',         label: 'Style & Tone',  icon: '🎨' },
    { key: 'creativityAndThinking',label: 'Creativity',    icon: '💡' },
];

const AnalysisView = ({ evaluation }) => {
    const er = evaluation.evaluationResult || {};
    const getResult = (key) => er[key] || { score: 0, comments: [], alternateSuggestions: [], alternateSuggestion: [] };
    const recommendations = er.OverallRecommendations || er.overallRecommendations || [];

    const scores = METRICS.map(m => ({ ...m, score: getResult(m.key).score || 0 }));
    const weakest = [...scores].sort((a, b) => a.score - b.score).slice(0, 2);

    return (
        <div className="space-y-6 my-6 animate-in fade-in duration-400">

            {/* Score Overview Panel */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Score Overview</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    {scores.map(m => {
                        const sc = scoreColor(m.score);
                        return (
                            <div key={m.key} className="flex flex-col items-center gap-2">
                                <span className="text-2xl">{m.icon}</span>
                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${sc.bar}`} style={{ width: `${m.score}%` }} />
                                </div>
                                <div className="text-center">
                                    <div className={`text-sm font-black ${sc.text}`}>{m.score}</div>
                                    <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-tight">{m.label}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {weakest.length > 0 && (
                    <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 self-center">Focus areas:</span>
                        {weakest.map(m => (
                            <span key={m.key} className="text-xs font-bold px-3 py-1 rounded-full bg-red-50 text-red-600 border border-red-200">
                                {m.icon} {m.label} — {m.score}/100
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Per-Metric Cards — sorted weakest first */}
            <div className="space-y-3">
                {[...METRICS]
                    .sort((a, b) => (getResult(a.key).score || 0) - (getResult(b.key).score || 0))
                    .map(m => {
                        const res = getResult(m.key);
                        const suggestions = res.alternateSuggestions || res.alternateSuggestion || [];
                        return (
                            <MetricCard
                                key={m.key}
                                title={m.label}
                                icon={m.icon}
                                score={res.score}
                                comments={res.comments || []}
                                suggestions={suggestions}
                            />
                        );
                    })}
            </div>

            {/* Overall Recommendations */}
            {recommendations.length > 0 && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6">
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-4">Overall Recommendations</p>
                    <ul className="space-y-3">
                        {recommendations.map((r, i) => (
                            <li key={i} className="flex gap-3 items-start text-sm text-indigo-900 leading-relaxed">
                                <span className="mt-0.5 w-5 h-5 rounded-full bg-indigo-200 text-indigo-700 text-[10px] font-black flex items-center justify-center shrink-0">
                                    {i + 1}
                                </span>
                                {r}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

const LowLevelView = ({ errorList = [] }) => {
    const grouped = useMemo(() => {
        return errorList.reduce((acc, err) => {
            const key = err.type || 'OTHER';
            if (!acc[key]) acc[key] = [];
            acc[key].push(err);
            return acc;
        }, {});
    }, [errorList]);

    if (errorList.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center animate-in fade-in duration-500">
                <div className="text-5xl mb-4">✅</div>
                <p className="text-slate-500 font-medium">No grammar or spelling issues detected.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 my-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Object.entries(grouped).map(([type, errors]) => {
                    const meta = getTypeMeta(type);
                    return (
                        <div key={type} className={`rounded-xl border p-4 ${meta.bg} ${meta.border}`}>
                            <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${meta.text}`}>{meta.label}</div>
                            <div className={`text-3xl font-extrabold ${meta.text}`}>{errors.length}</div>
                        </div>
                    );
                })}
            </div>

            {Object.entries(grouped).map(([type, errors]) => {
                const meta = getTypeMeta(type);
                return (
                    <div key={type} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className={`px-5 py-3 border-b flex items-center gap-2 ${meta.bg} ${meta.border}`}>
                            <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
                            <span className={`font-bold text-sm ${meta.text}`}>{meta.label}</span>
                            <span className={`ml-auto text-xs font-bold ${meta.text}`}>{errors.length} issue{errors.length !== 1 ? 's' : ''}</span>
                        </div>
                        <ul className="divide-y divide-slate-100">
                            {errors.map((err, i) => (
                                <li key={i} className="px-5 py-4 flex flex-col sm:flex-row sm:items-start gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <span className="font-mono text-sm line-through text-red-500 bg-red-50 px-2 py-0.5 rounded">
                                                {err.incorrectText}
                                            </span>
                                            {err.correctText && (
                                                <>
                                                    <span className="text-slate-400">→</span>
                                                    <span className="font-mono text-sm text-green-700 bg-green-50 px-2 py-0.5 rounded font-bold">
                                                        {err.correctText}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-500">{err.explanation}</p>
                                    </div>
                                    <div className="text-xs text-slate-400 whitespace-nowrap shrink-0 font-mono mt-1">
                                        pos {err.start}–{err.end}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                );
            })}
        </div>
    );
};

// --- Main Page Component ---

const EvaluationResult = () => {
    const router = useRouter();
    const { ids } = router.query;
    const responseRefId = ids?.[0];
    const versionRefId = ids?.[1];

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('HighLevel');

    useEffect(() => {
        if (responseRefId && versionRefId) {
            const loadData = async () => {
                setLoading(true);
                try {
                    const result = await writewiseService.getEvaluationResult(responseRefId, versionRefId);
                    setData(result?.data || null);
                } catch (error) {
                    console.error("Error fetching evaluation result:", error);
                } finally {
                    setLoading(false);
                }
            };
            loadData();
        }
    }, [responseRefId, versionRefId]);

    if (loading) return <Layout content={<div className="p-8 text-center text-slate-500 font-bold">Loading Results...</div>} />;
    if (!data) return <Layout content={<div className="p-8 text-center text-red-500 font-bold">Result not found.</div>} />;

    const topic = data.topic || {};
    const responseVersion = data.responseVersionDTOs?.[0] || {};

    // LLM evaluation (high-level scoring)
    const llmEvaluation = responseVersion.evaluations?.[0] || {};
    const overallScore = llmEvaluation.evaluationResult?.score || 0;

    // LanguageTool evaluation (low-level inline errors)
    const ltEvaluation = responseVersion.evaluation || {};
    const errorList = ltEvaluation.errorList || [];
    const plainText = stripHtml(responseVersion.response || '');

    const TABS = [
        { id: 'HighLevel', label: 'High-Level Analysis' },
        { id: 'LowLevel', label: `Low-Level Analysis${errorList.length > 0 ? ` (${errorList.length})` : ''}` },
        { id: 'Annotations', label: 'Annotations' },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'HighLevel':
                return <AnalysisView evaluation={llmEvaluation} />;
            case 'LowLevel':
                return <LowLevelView errorList={errorList} />;
            case 'Annotations':
                return <AnnotationsView text={plainText} errors={errorList} />;
            default:
                return null;
        }
    };

    return (
        <Layout content={
            <div className="min-h-screen bg-slate-50 font-sans -m-4 sm:-m-8 pb-20">

                {/* Header */}
                <div className="bg-white border-b border-slate-200 pt-8 pb-8 px-6 sticky top-0 z-10 shadow-sm">
                    <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-center md:text-left">
                            <h1 className="text-3xl font-extrabold text-slate-800 mb-1">{topic.topic || 'Untitled Topic'}</h1>
                            <p className="text-slate-500 font-medium">{topic.subject}</p>
                        </div>
                        <div className="flex items-center gap-4 bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">
                            <div className="text-right">
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Overall Score</div>
                                <div className="text-xl font-bold text-slate-700">{overallScore}/100</div>
                            </div>
                            <div className="w-12 h-12">
                                <ScoreRing score={overallScore} size="small" />
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="max-w-6xl mx-auto mt-8 flex justify-center md:justify-start">
                        <div className="bg-slate-100 p-1 rounded-xl inline-flex gap-1">
                            {TABS.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <main className="max-w-6xl mx-auto px-6 py-8">
                    {renderTabContent()}
                </main>
            </div>
        } />
    );
};

export default EvaluationResult;
