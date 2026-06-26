import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/context/AuthContext';
import cashflowService from '@/services/cashflow.service';
import {
    Download,
    ShoppingBag,
    TrendingUp,
    Wallet,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Sparkles,
    FileDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const todayIso = () => new Date().toISOString().split('T')[0];
const monthsAgo = (n) => {
    const d = new Date();
    d.setMonth(d.getMonth() - n);
    return d.toISOString().split('T')[0];
};

const triggerDownload = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

const TABS = [
    {
        id: 'expenses',
        label: 'Expenses',
        icon: ShoppingBag,
        badge: 'ML Primary',
        badgeColor: 'bg-indigo-600 text-white',
    },
    {
        id: 'earnings',
        label: 'Earnings',
        icon: TrendingUp,
        badge: 'Income',
        badgeColor: 'bg-emerald-100 text-emerald-700',
    },
    {
        id: 'deposits',
        label: 'Deposits',
        icon: Wallet,
        badge: 'Household',
        badgeColor: 'bg-amber-100 text-amber-700',
    },
];

const EXPORT_CONFIG = {
    expenses: {
        description: 'One row per expense — the richest dataset for spending behaviour analysis. Includes temporal features, category, payment mode, and itemised shopping lists.',
        columnGroups: [
            {
                label: 'Identity',
                color: 'bg-slate-50 text-slate-600 border border-slate-100',
                cols: ['refId', 'uuid', 'owner'],
            },
            {
                label: 'Household',
                color: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
                cols: ['householdRefId', 'householdName', 'householdCurrency'],
            },
            {
                label: 'Temporal Features',
                color: 'bg-violet-50 text-violet-700 border border-violet-100',
                cols: ['expenseDate', 'expenseYear', 'expenseMonth', 'expenseMonthName', 'expenseDay', 'expenseDayOfWeek', 'expenseDayOfWeekName'],
            },
            {
                label: 'Transaction',
                color: 'bg-rose-50 text-rose-700 border border-rose-100',
                cols: ['description', 'categoryRefId', 'categoryName', 'amount', 'type', 'expenseFor', 'paymentMode'],
            },
            {
                label: 'Items (Basket)',
                color: 'bg-amber-50 text-amber-700 border border-amber-100',
                cols: ['itemCount', 'items'],
            },
        ],
        tips: [
            { bold: 'expenseMonth + expenseDayOfWeek', rest: ' — temporal features for seasonality and weekday/weekend spending models.' },
            { bold: 'categoryName + paymentMode', rest: ' — strong categorical features; label-encode or one-hot for classification.' },
            { bold: 'type = RECURRING', rest: ' — filter to detect subscriptions and fixed obligations automatically.' },
            { bold: 'items (pipe-delimited)', rest: ' — split on "|" and vectorize with TF-IDF or embeddings for basket analysis.' },
            { bold: 'amount', rest: ' — natural regression target for budget forecasting and anomaly detection.' },
        ],
    },
    earnings: {
        description: 'One row per earning entry — income patterns over time. Use with expenses to compute savings rate and net cashflow.',
        columnGroups: [
            {
                label: 'Identity',
                color: 'bg-slate-50 text-slate-600 border border-slate-100',
                cols: ['refId', 'uuid', 'username'],
            },
            {
                label: 'Temporal Features',
                color: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
                cols: ['depositDate', 'depositYear', 'depositMonth', 'depositMonthName', 'depositDay', 'depositDayOfWeek', 'depositDayOfWeekName'],
            },
            {
                label: 'Transaction',
                color: 'bg-teal-50 text-teal-700 border border-teal-100',
                cols: ['amount', 'source', 'notes', 'createdAt'],
            },
        ],
        tips: [
            { bold: 'source', rest: ' — categorical feature for income stream classification (salary, freelance, investment).' },
            { bold: 'amount over depositDate', rest: ' — time series target for income forecasting models.' },
            { bold: 'depositMonth', rest: ' — detect seasonal income patterns (bonuses, quarterly payouts).' },
            { bold: 'Join with expenses', rest: ' on username + month to compute monthly savings rate.' },
            { bold: 'notes', rest: ' — free text; feed into an LLM for income source categorisation.' },
        ],
    },
    deposits: {
        description: 'One row per household deposit — tracks who is contributing to shared household funds and when.',
        columnGroups: [
            {
                label: 'Identity',
                color: 'bg-slate-50 text-slate-600 border border-slate-100',
                cols: ['refId', 'uuid', 'username'],
            },
            {
                label: 'Household',
                color: 'bg-amber-50 text-amber-700 border border-amber-100',
                cols: ['householdRefId', 'householdName', 'householdCurrency'],
            },
            {
                label: 'Temporal Features',
                color: 'bg-orange-50 text-orange-700 border border-orange-100',
                cols: ['depositDate', 'depositYear', 'depositMonth', 'depositMonthName', 'depositDay', 'depositDayOfWeek', 'depositDayOfWeekName'],
            },
            {
                label: 'Transaction',
                color: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
                cols: ['amount', 'source', 'notes', 'createdAt'],
            },
        ],
        tips: [
            { bold: 'source + amount', rest: ' — features for modelling household contribution behaviour per member.' },
            { bold: 'depositDayOfWeek', rest: ' — reveals payment timing patterns (e.g. payday clustering).' },
            { bold: 'Join with expenses', rest: ' on householdRefId to compute spending-vs-contribution ratio.' },
            { bold: 'householdCurrency', rest: ' — normalise amounts to a common currency before joining datasets.' },
            { bold: 'username', rest: ' — group by to study per-member contribution fairness.' },
        ],
    },
};

const InputLabel = ({ children }) => (
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{children}</p>
);

const inputClass = "w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-white transition-all";

const ExportPage = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('expenses');
    const [fromDate, setFromDate] = useState(monthsAgo(3));
    const [toDate, setToDate] = useState(todayIso());
    const [householdRefId, setHouseholdRefId] = useState('');
    const [loading, setLoading] = useState(false);
    const [downloadState, setDownloadState] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');

    const cfg = EXPORT_CONFIG[activeTab];
    const username = user?.username || '';

    const handleDownload = async () => {
        setLoading(true);
        setDownloadState(null);
        setErrorMsg('');
        try {
            const filter = {
                owner: username || undefined,
                dateFrom: fromDate || undefined,
                dateTo: toDate || undefined,
                householdRefId: householdRefId || undefined,
            };

            let blob;
            let filename;

            if (activeTab === 'expenses') {
                blob = await cashflowService.exportExpenses(filter);
                filename = `cashflow_expenses_${username}_${fromDate}_to_${toDate}.csv`;
            } else if (activeTab === 'earnings') {
                blob = await cashflowService.exportEarnings(filter);
                filename = `cashflow_earnings_${username}_${fromDate}_to_${toDate}.csv`;
            } else {
                blob = await cashflowService.exportDeposits(filter);
                filename = `cashflow_deposits_${username}_${fromDate}_to_${toDate}.csv`;
            }

            triggerDownload(blob, filename);
            setDownloadState('success');
        } catch (e) {
            setDownloadState('error');
            setErrorMsg(e?.response?.data?.message || e?.message || 'Export failed. Check your filters and try again.');
        } finally {
            setLoading(false);
        }
    };

    const showHouseholdFilter = activeTab === 'expenses' || activeTab === 'deposits';

    return (
        <Layout content={
            <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">

                {/* Header */}
                <div className="flex flex-col gap-2 border-b border-slate-100 pb-8">
                    <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm uppercase tracking-wider">
                        <FileDown size={18} />
                        <span>Cashflow · Data Export</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Export Your Data</h1>
                    <p className="text-slate-500 font-medium text-lg max-w-2xl">
                        Download your cashflow data as CSV for AI, ML, and LLM-based behaviour analysis.
                        All exports are structured for direct use with pandas, Excel, or any data pipeline.
                    </p>
                </div>

                {/* Tab Bar */}
                <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200 w-fit">
                    {TABS.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id); setDownloadState(null); }}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${isActive ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <Icon size={15} />
                                {tab.label}
                                {isActive && (
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${tab.badgeColor}`}>
                                        {tab.badge}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                        className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start"
                    >
                        {/* LEFT: Filters + Download */}
                        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                            <div>
                                <h2 className="text-lg font-black text-slate-800">Filters</h2>
                                <p className="text-sm text-slate-400 font-medium mt-1 leading-relaxed">{cfg.description}</p>
                            </div>

                            <div className="space-y-4">

                                {/* Username (auto) */}
                                <div>
                                    <InputLabel>Username</InputLabel>
                                    <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                                        <span className="text-sm font-black text-slate-700 flex-1">{username || '—'}</span>
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider bg-slate-200 px-1.5 py-0.5 rounded">Auto</span>
                                    </div>
                                </div>

                                {/* Date range */}
                                <div>
                                    <InputLabel>Date Range</InputLabel>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="date"
                                            value={fromDate}
                                            onChange={e => setFromDate(e.target.value)}
                                            className={inputClass}
                                        />
                                        <input
                                            type="date"
                                            value={toDate}
                                            onChange={e => setToDate(e.target.value)}
                                            className={inputClass}
                                        />
                                    </div>
                                    <p className="text-[11px] text-slate-400 font-medium mt-1.5">Defaults to last 3 months.</p>
                                </div>

                                {/* Household RefID (expenses + deposits only) */}
                                {showHouseholdFilter && (
                                    <div>
                                        <InputLabel>Household Ref ID <span className="normal-case font-medium text-slate-300">(optional)</span></InputLabel>
                                        <input
                                            type="text"
                                            value={householdRefId}
                                            onChange={e => setHouseholdRefId(e.target.value)}
                                            placeholder="e.g. 1001"
                                            className={inputClass}
                                        />
                                        <p className="text-[11px] text-slate-400 font-medium mt-1.5">Leave blank to export across all households.</p>
                                    </div>
                                )}
                            </div>

                            {/* Feedback */}
                            {downloadState === 'success' && (
                                <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm font-bold text-emerald-700">
                                    <CheckCircle2 size={16} className="shrink-0" />
                                    Download started successfully!
                                </div>
                            )}
                            {downloadState === 'error' && (
                                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm font-bold text-red-700">
                                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                    <span>{errorMsg}</span>
                                </div>
                            )}

                            {/* Download Button */}
                            <button
                                onClick={handleDownload}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-black text-sm shadow-lg shadow-indigo-100 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Generating CSV...
                                    </>
                                ) : (
                                    <>
                                        <Download size={18} />
                                        Download CSV
                                    </>
                                )}
                            </button>
                        </div>

                        {/* RIGHT: Column preview + ML tips */}
                        <div className="lg:col-span-3 space-y-5">

                            {/* Columns card */}
                            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
                                        <Download size={18} />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-black text-slate-800">Export Columns</h2>
                                        <p className="text-sm font-medium text-slate-400">Structured for pandas, Excel, and LLM pipelines</p>
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    {cfg.columnGroups.map((group, gi) => (
                                        <div key={gi}>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">{group.label}</p>
                                            <div className="flex flex-wrap gap-2">
                                                {group.cols.map((col, ci) => (
                                                    <span
                                                        key={ci}
                                                        className={`px-2.5 py-1 text-xs font-black rounded-lg ${group.color}`}
                                                    >
                                                        {col}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* ML tips card */}
                            <div className="bg-gradient-to-br from-indigo-50 via-violet-50 to-slate-50 border border-indigo-100 rounded-3xl p-6 space-y-4">
                                <div className="flex items-center gap-2">
                                    <Sparkles size={16} className="text-indigo-500" />
                                    <h3 className="text-xs font-black text-indigo-700 uppercase tracking-wider">AI / ML Usage Tips</h3>
                                </div>
                                <ul className="space-y-3">
                                    {cfg.tips.map((tip, ti) => (
                                        <li key={ti} className="flex items-start gap-2.5 text-sm text-indigo-700 font-semibold">
                                            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                                            <span>
                                                <span className="font-black">{tip.bold}</span>
                                                {tip.rest}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        } />
    );
};

export default ExportPage;
