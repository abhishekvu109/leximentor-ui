import { useRef, useState, useMemo } from 'react';
import Layout from "@/components/layout/Layout";
import { fetchData } from "@/dataService";
import { API_WRITEWISE_BASE_URL } from "@/constants";

// --- Components ---

const ScoreRing = ({ score, size = "large" }) => {
    const radius = size === "large" ? 50 : 20;
    const stroke = size === "large" ? 8 : 4;
    const normalizedScore = Math.max(0, Math.min(score, 100));
    const circumference = normalizedScore * 2 * Math.PI;
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

const FeedbackCard = ({ title, score, comments = [], suggestions = [], color = "indigo" }) => {
    const colorClasses = {
        indigo: "border-indigo-200 bg-indigo-50/50 text-indigo-900",
        green: "border-green-200 bg-green-50/50 text-green-900",
        yellow: "border-yellow-200 bg-yellow-50/50 text-yellow-900",
    }
    const safeColor = colorClasses[color] || colorClasses.indigo;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:border-indigo-200 transition duration-200 h-full">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-bold text-slate-700">{title}</h3>
                <ScoreRing score={score || 0} size="small" />
            </div>
            <div className="p-5 space-y-4">
                {comments.length > 0 && (
                    <div>
                        <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">Analysis</h4>
                        <ul className="space-y-2">
                            {comments.map((c, i) => (
                                <li key={i} className="text-sm text-slate-600 flex gap-2 items-start">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                                    {c}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {suggestions.length > 0 && (
                    <div className={`rounded-lg p-3 ${safeColor} border`}>
                        <h4 className="text-xs font-bold uppercase opacity-70 mb-2">My Suggestion</h4>
                        <ul className="space-y-1">
                            {suggestions.map((s, i) => (
                                <li key={i} className="text-sm font-medium flex gap-2 items-start">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                                    {s}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {comments.length === 0 && suggestions.length === 0 && (
                    <div className="text-center text-slate-400 italic text-sm py-4">No specific feedback created.</div>
                )}
            </div>
        </div>
    );
};

const AnnotatedText = ({ text = "", errors = [] }) => {
    const renderText = useMemo(() => {
        if (!text) return null;
        if (!errors || errors.length === 0) return <p className="whitespace-pre-line text-lg leading-relaxed text-slate-600 font-serif max-w-3xl mx-auto">{text}</p>;

        const segments = [];
        let currentIndex = 0;
        const sortedErrors = [...errors].sort((a, b) => a.start - b.start);

        for (const err of sortedErrors) {
            if (currentIndex < err.start) {
                segments.push({ text: text.slice(currentIndex, err.start), type: 'text' });
            }
            segments.push({ text: text.slice(err.start, err.end), type: 'error', data: err });
            currentIndex = err.end;
        }
        if (currentIndex < text.length) {
            segments.push({ text: text.slice(currentIndex), type: 'text' });
        }

        return (
            <div className="whitespace-pre-line text-lg leading-relaxed text-slate-600 font-serif max-w-3xl mx-auto">
                {segments.map((seg, i) => {
                    if (seg.type === 'text') return <span key={i}>{seg.text}</span>;
                    return (
                        <span key={i} className="relative group inline-block cursor-help border-b-2 border-red-300 bg-red-50 hover:bg-red-100 transition rounded-sm px-0.5">
                            {seg.text}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-slate-800 text-white text-sm rounded-xl p-4 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition z-50 pointer-events-none transform translate-y-2 group-hover:translate-y-0">
                                <div className="font-bold text-red-300 capitalize text-xs mb-1 tracking-wider">{seg.data.type}</div>
                                <div className="mb-2 line-through opacity-60 text-xs">{seg.data.incorrectText}</div>
                                <div className="text-green-300 font-bold mb-2 text-base">
                                    {seg.data.correctedText && `${seg.data.correctedText}`}
                                </div>
                                <div className="text-xs text-slate-300 leading-snug">{seg.data.explanation}</div>
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-800"></div>
                            </div>
                        </span>
                    );
                })}
            </div>
        );
    }, [text, errors]);

    return renderText;
};


// --- Views ---

const AnalysisView = ({ evaluation }) => {
    const getResult = (key) => evaluation.evaluationResult?.[key] || { score: 0, comments: [], alternateSuggestion: [] };
    const metrics = [
        { key: 'grammar', label: 'Grammar', color: 'indigo' },
        { key: 'vocabulary', label: 'Vocabulary', color: 'green' },
        { key: 'spelling', label: 'Spelling', color: 'yellow' },
        { key: 'punctuation', label: 'Punctuation', color: 'indigo' },
        { key: 'styleAndTone', label: 'Style & Tone', color: 'green' },
        { key: 'creativityAndThinking', label: 'Creativity', color: 'yellow' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {metrics.map((m) => {
                const res = getResult(m.key);
                return (
                    <FeedbackCard
                        key={m.key}
                        title={m.label}
                        score={res.score}
                        comments={res.comments}
                        suggestions={res.alternateSuggestion}
                        color={m.color}
                    />
                );
            })}
        </div>
    );
};

// --- Main Page Component ---

const EvaluationResult = ({ data }) => {
    const topic = data?.topic || {};
    const responseVersion = data?.responseVersionDTOs?.[0] || {};
    const evaluations = responseVersion?.evaluations || [];
    const evaluation = evaluations[0] || {};
    const overallScore = evaluation?.evaluationResult?.score || 0;

    const [activeTab, setActiveTab] = useState('HighLevel');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'HighLevel':
                return <AnalysisView evaluation={evaluation} />;
            case 'LowLevel':
                // Fallback or specific data field if available. Using same evaluation as placeholder/mirror
                return <AnalysisView evaluation={evaluation} />;
            case 'Annotations':
                return (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 sm:p-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <AnnotatedText text={responseVersion.response} errors={evaluation.evaluationResult?.errorList || []} />
                    </div>
                );
            default: return null;
        }
    }

    return (
        <Layout content={
            <div className="min-h-screen bg-slate-50 font-sans -m-4 sm:-m-8 pb-20">

                {/* Header */}
                <div className="bg-white border-b border-slate-200 pt-8 pb-8 px-6 sticky top-0 z-10 shadow-sm">
                    <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-center md:text-left">
                            <h1 className="text-3xl font-extrabold text-slate-800 mb-1">{topic.topic || 'Untitled Topic'}</h1>
                            <p className="text-slate-500 font-medium">
                                {topic.subject} • {responseVersion.wordCount || 0} words
                            </p>
                        </div>

                        {/* Score Badge */}
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
                            <button
                                onClick={() => setActiveTab('HighLevel')}
                                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'HighLevel' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                High-Level Analysis
                            </button>
                            <button
                                onClick={() => setActiveTab('LowLevel')}
                                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'LowLevel' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Low-Level Analysis
                            </button>
                            <button
                                onClick={() => setActiveTab('Annotations')}
                                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'Annotations' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Annotations
                            </button>
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


export async function getServerSideProps(context) {
    const { params } = context;
    const ids = params.ids;
    const responseRefId = ids[0];
    const versionRefId = ids[1];

    try {
        const data = await fetchData(`${API_WRITEWISE_BASE_URL}/v1/responses/response/${responseRefId}/versions/version/${versionRefId}`);
        return { props: { data: data?.data || null } };
    } catch (e) {
        console.error("Error fetching evaluation result:", e);
        return { props: { data: null } };
    }
}