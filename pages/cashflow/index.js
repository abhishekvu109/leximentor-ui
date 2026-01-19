import Layout from "@/components/layout/Layout";
import { useState, useEffect } from "react";
import {
    Wallet,
    ArrowUpRight,
    ArrowDownLeft,
    TrendingUp,
    Plus,
    Home,
    Users,
    History,
    PieChart as PieIcon,
    DollarSign
} from "lucide-react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell
} from "recharts";
import Link from "next/link";

// --- Mock Data ---
const MOCK_STATS = [
    { title: "Total Balance", value: "₹45,250", change: "+12.5%", icon: Wallet, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "Monthly Spending", value: "₹12,800", change: "+4.3%", icon: ArrowUpRight, color: "text-rose-600", bg: "bg-rose-50" },
    { title: "Active Households", value: "3", change: "0%", icon: Home, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Budget Status", value: "72%", change: "On Track", icon: TrendingUp, color: "text-indigo-600", bg: "bg-indigo-50" },
];

const MOCK_CHART_DATA = [
    { name: 'Mon', spend: 1200 },
    { name: 'Tue', spend: 2100 },
    { name: 'Wed', spend: 800 },
    { name: 'Thu', spend: 1600 },
    { name: 'Fri', spend: 2800 },
    { name: 'Sat', spend: 3200 },
    { name: 'Sun', spend: 1100 },
];

const MOCK_HOUSEHOLDS = [
    { name: "Abhishek & Priya Home", members: 2, balance: "₹28,500", color: "bg-indigo-500" },
    { name: "The Smith Family", members: 4, balance: "₹12,200", color: "bg-teal-500" },
    { name: "My Personal Wallet", members: 1, balance: "₹4,550", color: "bg-orange-500" },
];

const MOCK_RECENT_LOGS = [
    { id: 1, description: "Groceries - BigBasket", amount: "₹1,250", date: "2 mins ago", category: "Food", household: "Home" },
    { id: 2, description: "Electricity Bill", amount: "₹3,400", date: "1 hour ago", category: "Utilities", household: "Home" },
    { id: 3, description: "Netflix Subscription", amount: "₹499", date: "4 hours ago", category: "Entertainment", household: "Personal" },
];

const StatCard = ({ title, value, change, icon: Icon, color, bg }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${bg} ${color} transition-colors`}>
                <Icon size={24} />
            </div>
            <span className={`text-xs font-bold px-2 py-1 rounded-lg ${change.includes('+') || change === 'On Track' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-500'}`}>
                {change}
            </span>
        </div>
        <div>
            <p className="text-sm font-medium text-gray-400 dark:text-gray-500">{title}</p>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{value}</h3>
        </div>
    </div>
);

const CashflowDashboard = () => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">Financial Overview</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium text-sm md:text-base">Manage your family expenses and budgets in one place.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/cashflow/logs" className="w-full md:w-auto">
                        <button className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 dark:shadow-none transition-all active:scale-95">
                            <Plus size={20} /> Log Expense
                        </button>
                    </Link>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {MOCK_STATS.map((stat, i) => (
                    <StatCard key={i} {...stat} />
                ))}
            </div>

            {/* Charts & Households Column */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Spending Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Spending Trend</h2>
                            <p className="text-sm text-gray-400 font-medium">Daily expense tracking for this week</p>
                        </div>
                        <select className="bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-xs font-bold text-gray-500 focus:ring-0 px-4 py-2 w-fit">
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                        </select>
                    </div>

                    <div className="h-[250px] md:h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={MOCK_CHART_DATA}>
                                <defs>
                                    <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 500 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 500 }}
                                    tickFormatter={(value) => `₹${value}`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '16px',
                                        border: 'none',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                        padding: '12px'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="spend"
                                    stroke="#4f46e5"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorSpend)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Households Quick Access */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Households</h2>
                        <Link href="/cashflow/households" className="text-sm font-bold text-indigo-600 hover:text-indigo-700">View All</Link>
                    </div>
                    <div className="space-y-4">
                        {MOCK_HOUSEHOLDS.map((house, i) => (
                            <Link href={`/cashflow/households/${i + 1}`} key={i} className="block">
                                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:border-indigo-100 dark:hover:border-indigo-900 transition-all flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${house.color} flex items-center justify-center text-white shrink-0`}>
                                            <Home size={20} />
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-bold text-gray-800 dark:text-white group-hover:text-indigo-600 transition-colors uppercase text-[10px] md:text-xs tracking-wider truncate">{house.name}</h4>
                                            <p className="text-[10px] text-gray-400 font-medium flex items-center gap-1 mt-0.5">
                                                <Users size={10} /> {house.members} Members
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-sm font-black text-gray-800 dark:text-white">{house.balance}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Balance</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Section: Recent Logs */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 dark:border-gray-700 flex justify-between items-center">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-lg shrink-0">
                            <History size={18} />
                        </div>
                        <h2 className="font-black text-gray-800 dark:text-white text-lg truncate">Recent Transactions</h2>
                    </div>
                    <Link href="/cashflow/logs" className="text-sm font-bold text-gray-400 hover:text-indigo-600 transition-colors shrink-0 ml-2">View All</Link>
                </div>
                <div className="divide-y divide-gray-50 dark:divide-gray-700 overflow-x-auto">
                    <div className="min-w-[700px] lg:min-w-0">
                        {MOCK_RECENT_LOGS.map((log) => (
                            <div key={log.id} className="p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-gray-50 dark:bg-gray-700 text-gray-400 rounded-xl group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-600 transition-all">
                                        <DollarSign size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800 dark:text-white">{log.description}</h4>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-xs font-bold text-indigo-500 uppercase tracking-tight bg-indigo-50 dark:bg-indigo-900/40 px-2 py-0.5 rounded-md">
                                                {log.category}
                                            </span>
                                            <span className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1">
                                                <Home size={10} /> {log.household}
                                            </span>
                                            <span className="text-[10px] text-gray-300 font-medium">•</span>
                                            <span className="text-[10px] text-gray-400 font-bold uppercase">{log.date}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black text-rose-600">-{log.amount}</p>
                                    <div className="flex items-center justify-end gap-1 text-[10px] text-green-500 font-bold uppercase">
                                        <ArrowDownLeft size={10} /> Paid
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const DashboardPage = () => {
    return <Layout content={<CashflowDashboard />} />;
};

export default DashboardPage;
