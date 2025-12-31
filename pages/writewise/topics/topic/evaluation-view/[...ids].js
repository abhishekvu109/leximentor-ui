import Layout from "@/components/layout/Layout";
import { API_WRITEWISE_BASE_URL } from "@/constants";
import { fetchWithAuth, ModelData } from "@/dataService";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Dropdown from "@/components/form/DropDown";
import { ChevronDownIcon, PlayIcon, CheckBadgeIcon, PaperAirplaneIcon, BeakerIcon } from "@heroicons/react/24/solid";

// --- Reusable Components ---

const StatusPill = ({ status }) => {
    let color = 'bg-slate-100 text-slate-600 border-slate-200';
    let icon = null;

    const s = String(status || 'not started').toUpperCase();

    if (s === 'IN-PROGRESS' || s === 'IN PROGRESS') {
        color = 'bg-amber-50 text-amber-700 border-amber-200';
        icon = <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping mr-2" />;
    } else if (s === 'COMPLETED') {
        color = 'bg-green-50 text-green-700 border-green-200';
        icon = <CheckBadgeIcon className="w-4 h-4 mr-1" />;
    }

    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${color}`}>
            {icon}
            {status || 'Not Started'}
        </span>
    );
};

const ActionButton = ({ onClick, label, icon: Icon, colorClass, disabled, loading }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`
            flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all duration-200 border
            ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200 text-slate-400' : `${colorClass} hover:-translate-y-0.5 hover:shadow-md active:translate-y-0`}
        `}
    >
        {loading ? <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" /> : <Icon className="w-4 h-4" />}
        <span>{label}</span>
    </button>
);

const ResultViewer = ({ title, status, content, isValid, validatedStatus }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Determine border color based on validation state
    let borderColor = "border-slate-200";
    if (isValid) {
        borderColor = validatedStatus ? "border-green-300 ring-1 ring-green-100" : "border-red-300 ring-1 ring-red-100";
    }

    return (
        <div className={`bg-white rounded-xl border ${borderColor} shadow-sm overflow-hidden transition-all duration-300`}>
            <div
                className="flex items-center justify-between p-4 bg-slate-50 cursor-pointer hover:bg-slate-100 transition"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${isOpen ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-500'}`}>
                        <ChevronDownIcon className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                    <span className="font-bold text-slate-700">{title}</span>
                </div>
                <StatusPill status={status} />
            </div>

            {isOpen && (
                <div className="p-0 bg-slate-900">
                    <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-96 leading-relaxed custom-scrollbar">
                        {content || "// No data generated yet..."}
                    </pre>
                </div>
            )}
        </div>
    );
};

const EvaluationControlPanel = ({ title, type, topicRefId, versionRefId, model, setModel }) => {
    // Local state for this panel (High level vs Low level)
    const [resultText, setResultText] = useState("");
    const [status, setStatus] = useState("Not Started");
    const [validationStatus, setValidationStatus] = useState(null); // true/false/null
    const [isValidating, setIsValidating] = useState(false);

    // Polling Functionality
    useEffect(() => {
        if (!topicRefId || !versionRefId) return;

        const fetchStatus = async () => {
            try {
                const res = await fetchWithAuth(`${API_WRITEWISE_BASE_URL}/v1/topics/topic/${topicRefId}/versions/version/${versionRefId}`);
                const data = await res.json();

                // Fields depend on type
                const textKey = type === 'High' ? 'llmEvaluationText' : 'lowLevelEvaluationText';
                const statusKey = type === 'High' ? 'llmEvaluationStatus' : 'lowLevelEvaluationStatus';

                const rawText = data.data?.[textKey];
                const rawStatus = data.data?.[statusKey];

                setStatus(rawStatus || 'Not Started');
                if (rawText) {
                    try {
                        setResultText(JSON.stringify(JSON.parse(rawText), null, 2));
                    } catch {
                        setResultText(rawText);
                    }
                }
            } catch (error) {
                console.error('Error fetching status:', error);
            }
        };

        fetchStatus();
        const interval = setInterval(fetchStatus, 30000); // 30s poll
        return () => clearInterval(interval);
    }, [topicRefId, versionRefId, type]);


    const handleAction = async (action) => {
        const isHighLevel = type === 'High';
        let endpoint = "";
        let body = { topicRefId, versionRefId, model, isHighLevel };

        if (!model) {
            alert("Please select a model first!");
            return;
        }

        switch (action) {
            case 'generate':
                endpoint = "/v1/topics/topic/versions/version/evaluate-response";
                break;
            case 'validate':
                endpoint = "/v1/topics/topic/versions/version/evaluate-response/validate";
                setIsValidating(true);
                break;
            case 'submit':
                endpoint = "/v1/topics/topic/versions/version/submit-results";
                break;
        }

        try {
            const res = await fetchWithAuth(`${API_WRITEWISE_BASE_URL}${endpoint}`, {
                method: "POST",
                body: JSON.stringify(body),
            });

            if (!res.ok) throw new Error("Request failed");

            if (action === 'validate') {
                const data = await res.json();
                setValidationStatus(Boolean(data.data));
                setTimeout(() => setValidationStatus(null), 3000); // Clears validation highlight
            } else {
                alert(`${action} triggered successfully!`);
                setStatus('In Progress');
            }

        } catch (e) {
            console.error(e);
            alert("Action failed. Check console.");
        } finally {
            if (action === 'validate') setIsValidating(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <span className={`p-2 rounded-lg ${type === 'High' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        <BeakerIcon className="w-6 h-6" />
                    </span>
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">{title} Analysis</h2>
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">AI Evaluation Pipeline</p>
                    </div>
                </div>

                {/* Action Pipeline */}
                <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                    <ActionButton
                        label="Generate"
                        icon={PlayIcon}
                        onClick={() => handleAction('generate')}
                        colorClass="bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                    />
                    <div className="w-6 h-px bg-slate-300 hidden md:block" />
                    <ActionButton
                        label="Validate"
                        icon={CheckBadgeIcon}
                        onClick={() => handleAction('validate')}
                        loading={isValidating}
                        colorClass="bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                    />
                    <div className="w-6 h-px bg-slate-300 hidden md:block" />
                    <ActionButton
                        label="Submit"
                        icon={PaperAirplaneIcon}
                        onClick={() => handleAction('submit')}
                        colorClass="bg-slate-800 text-white border-transparent hover:bg-slate-700"
                    />
                </div>
            </div>

            <ResultViewer
                title={`${title} Output JSON`}
                status={status}
                content={resultText}
                isValid={validationStatus !== null}
                validatedStatus={validationStatus}
            />
        </div>
    );
};


// --- Main Page ---

const EvaluationView = () => {
    const router = useRouter();
    const { ids } = router.query;
    const topicRefId = ids?.[0];
    const versionRefId = ids?.[1];

    const [selectedModel, setSelectedModel] = useState("");

    const handleModelSelect = (m) => setSelectedModel(m);

    return (
        <Layout content={
            <div className="min-h-screen bg-slate-50/50 p-4 sm:p-8 font-sans">
                <div className="max-w-5xl mx-auto">
                    {/* Page Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">AI Evaluation Lab</h1>
                            <p className="text-slate-500 mt-1">Configure models and run evaluation pipelines.</p>
                        </div>

                        <div className="w-full md:w-64">
                            <Dropdown
                                label={selectedModel || "Select AI Model"}
                                items={ModelData}
                                onSelect={handleModelSelect}
                                ButtonClassName="w-full justify-between bg-white border border-slate-300 text-slate-700 hover:border-indigo-300 focus:ring-4 focus:ring-indigo-100 font-medium rounded-xl px-4 py-2.5 shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Panels */}
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <EvaluationControlPanel
                            title="High-Level"
                            type="High"
                            topicRefId={topicRefId}
                            versionRefId={versionRefId}
                            model={selectedModel}
                            setModel={setSelectedModel}
                        />

                        <EvaluationControlPanel
                            title="Low-Level"
                            type="Low"
                            topicRefId={topicRefId}
                            versionRefId={versionRefId}
                            model={selectedModel}
                            setModel={setSelectedModel}
                        />
                    </div>
                </div>
            </div>
        } />
    );
};

export default EvaluationView;
