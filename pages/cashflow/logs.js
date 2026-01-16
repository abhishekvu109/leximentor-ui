import Layout from "@/components/layout/Layout";
import { useState } from "react";
import {
    Plus,
    Search,
    Filter,
    Calendar,
    Download,
    Home,
    ShoppingBag,
    ArrowUpRight,
    Tag,
    User,
    ChevronDown,
    CheckCircle2,
    DollarSign,
    MoreHorizontal
} from "lucide-react";

// --- Mock Data ---
const MOCK_CATEGORIES = ["Groceries", "Utilities", "Entertainment", "Transport", "Rent", "Health", "Shopping"];
const MOCK_HOUSEHOLDS = [
    { id: "1", name: "Abhishek & Priya Home" },
    { id: "2", name: "The Smith Family" },
    { id: "3", name: "Personal Wallet" }
];

const MOCK_EXPENSES = [
    { id: "e1", description: "Fresh Vegetables - Reliance Fresh", amount: 450, date: "2024-11-20", category: "Groceries", owner: "Abhishek V", household: "Abhishek & Priya Home", type: "ONE_TIME" },
    { id: "e2", description: "Airtel Fiber Bill", amount: 1178, date: "2024-11-20", category: "Utilities", owner: "Abhishek V", household: "Abhishek & Priya Home", type: "ONE_TIME" },
    { id: "e3", description: "McDonalds Dinner", amount: 890, date: "2024-11-19", category: "Entertainment", owner: "Priya S", household: "Abhishek & Priya Home", type: "ONE_TIME" },
    { id: "e4", description: "Netflix Premium", amount: 649, date: "2024-11-18", category: "Entertainment", owner: "Abhishek V", household: "Personal Wallet", type: "RECURRING" },
    { id: "e5", description: "Petrol - HP Fuel", amount: 2000, date: "2024-11-18", category: "Transport", owner: "John Smith", household: "The Smith Family", type: "ONE_TIME" },
    { id: "e6", description: "Amazon Prime Subscription", amount: 1499, date: "2024-11-17", category: "Entertainment", owner: "Jane Smith", household: "The Smith Family", type: "RECURRING" },
];

const ExpenseLogsLogic = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [showLogForm, setShowLogForm] = useState(false);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase">Expense Logs</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium text-sm md:text-base">Track and manage every transaction across all households.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-5 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all text-sm">
                        <Download size={18} /> Export
                    </button>
                    <button
                        onClick={() => setShowLogForm(!showLogForm)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 dark:shadow-none transition-all active:scale-95 text-sm"
                    >
                        <Plus size={18} /> Log Expense
                    </button>
                </div>
            </div>

            {/* Quick Log Form (Expandable) */}
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showLogForm ? 'max-h-[800px] opacity-100 mb-8' : 'max-h-0 opacity-0'}`}>
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 md:p-8 rounded-3xl border border-indigo-100 dark:border-indigo-800 shadow-inner">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-indigo-600 text-white rounded-lg">
                            <Plus size={18} />
                        </div>
                        <h2 className="text-xl font-black text-indigo-900 dark:text-indigo-100 uppercase tracking-tight">Quick Log</h2>
                    </div>
                    <form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Description</label>
                            <input type="text" placeholder="e.g. Weekly Groceries" className="w-full bg-white dark:bg-gray-800 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 shadow-sm" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Amount</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">₹</span>
                                <input type="number" placeholder="0.00" className="w-full bg-white dark:bg-gray-800 border-none rounded-xl pl-8 pr-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 shadow-sm" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Category</label>
                            <select className="w-full bg-white dark:bg-gray-800 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 shadow-sm appearance-none">
                                {MOCK_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Household</label>
                            <select className="w-full bg-white dark:bg-gray-800 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 shadow-sm appearance-none">
                                {MOCK_HOUSEHOLDS.map(h => <option key={h.id}>{h.name}</option>)}
                            </select>
                        </div>
                        <div className="sm:col-span-2 lg:col-span-4 flex flex-col-reverse sm:flex-row justify-end gap-3 mt-4">
                            <button type="button" onClick={() => setShowLogForm(false)} className="px-6 py-3 text-gray-500 font-bold text-sm uppercase tracking-wider">Cancel</button>
                            <button type="submit" className="bg-indigo-600 text-white px-10 py-3 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">Submit Entry</button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Filter Hub */}
            <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col lg:flex-row gap-4 md:gap-6 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search transactions..."
                        className="w-full pl-14 pr-6 py-3.5 bg-gray-50 dark:bg-gray-700 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 text-sm font-bold placeholder-gray-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full lg:w-auto">
                    <button className="flex items-center justify-center gap-2 px-4 py-3.5 bg-gray-50 dark:bg-gray-700 text-gray-500 rounded-2xl hover:bg-gray-100 transition-colors font-bold text-[10px] uppercase tracking-widest">
                        <Filter size={14} /> Filters
                    </button>
                    <select className="px-4 py-3.5 bg-gray-50 dark:bg-gray-700 border-none rounded-2xl text-[10px] font-black text-gray-500 uppercase tracking-widest focus:ring-2 focus:ring-indigo-500/20 appearance-none text-center">
                        <option>Categories</option>
                        {MOCK_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                    <select className="col-span-2 md:col-span-1 px-4 py-3.5 bg-gray-50 dark:bg-gray-700 border-none rounded-2xl text-[10px] font-black text-gray-500 uppercase tracking-widest focus:ring-2 focus:ring-indigo-500/20 appearance-none text-center">
                        <option>All Time</option>
                        <option>Last 7 Days</option>
                        <option>This Month</option>
                    </select>
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[900px]">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
                                <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] w-32">Date</th>
                                <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Transaction Details</th>
                                <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Household & Member</th>
                                <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                            {MOCK_EXPENSES.map((expense) => (
                                <tr key={expense.id} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors group">
                                    <td className="px-8 py-7">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-gray-800 dark:text-white">{expense.date.split('-')[2]}</span>
                                            <span className="text-[10px] font-black text-gray-400 uppercase">Nov, 2024</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-7">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-2xl flex items-center justify-center text-gray-400 group-hover:border-indigo-200 transition-colors shrink-0">
                                                <ShoppingBag size={20} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-gray-800 dark:text-white line-clamp-1">{expense.description}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] font-black uppercase text-indigo-500 flex items-center gap-1">
                                                        <Tag size={10} /> {expense.category}
                                                    </span>
                                                    <span className="text-[10px] text-gray-300">•</span>
                                                    <span className={`text-[10px] font-bold uppercase ${expense.type === 'RECURRING' ? 'text-amber-500' : 'text-gray-400'}`}>
                                                        {expense.type}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-7">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-400 shrink-0">
                                                <Home size={14} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate">{expense.household}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase">{expense.owner}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-7">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 size={14} className="text-green-500" />
                                            <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Completed</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-7 text-right">
                                        <p className="text-sm md:text-lg font-black text-rose-600">-₹{expense.amount.toLocaleString()}</p>
                                        <button className="p-1 mt-1 text-gray-300 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-all">
                                            <MoreHorizontal size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Pagination Placeholder */}
                <div className="p-6 md:p-8 border-t border-gray-50 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4 text-gray-400">
                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-center">Showing 6 of 124 transactions</span>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button className="flex-1 sm:flex-none px-4 py-2.5 bg-gray-50 dark:bg-gray-700 rounded-lg font-bold text-[10px] uppercase hover:bg-gray-100 transition-all">Previous</button>
                        <button className="flex-1 sm:flex-none px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-bold text-[10px] uppercase shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-all">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ExpenseLogsPage = () => {
    return <Layout content={<ExpenseLogsLogic />} />;
};

export default ExpenseLogsPage;
