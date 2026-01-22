import Layout from "@/components/layout/Layout";
import { useState, useEffect, useMemo } from "react";
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
    DollarSign,
    Loader2
} from "lucide-react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { postDataAsJson } from "../../dataService";
import { API_CASHFLOW_BASE_URL } from "../../constants";

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
    const { user } = useAuth();
    const [households, setHouseholds] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [timeRange, setTimeRange] = useState("7"); // Default to 7 days
    const [loadingHouseholds, setLoadingHouseholds] = useState(true);
    const [loadingTransactions, setLoadingTransactions] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user?.username) return;

            setLoadingHouseholds(true);
            setLoadingTransactions(true);

            try {
                // Fetch Households
                const houseResponse = await postDataAsJson(`${API_CASHFLOW_BASE_URL}/households/household/search`, {
                    user: user.username
                });
                if (houseResponse?.data) {
                    setHouseholds(houseResponse.data);
                }

                // Fetch Recent Transactions
                const transResponse = await postDataAsJson(`${API_CASHFLOW_BASE_URL}/expenses/expense/search`, {
                    owner: user.username
                });
                if (transResponse?.data) {
                    // Sorting by date (newest first)
                    const sorted = [...transResponse.data].sort((a, b) => {
                        const dateA = Array.isArray(a.expenseDate) ? new Date(a.expenseDate[0], a.expenseDate[1] - 1, a.expenseDate[2]) : new Date(a.expenseDate);
                        const dateB = Array.isArray(b.expenseDate) ? new Date(b.expenseDate[0], b.expenseDate[1] - 1, b.expenseDate[2]) : new Date(b.expenseDate);
                        return dateB - dateA;
                    });
                    setTransactions(sorted);
                }
            } catch (error) {
                console.error("Dashboard data fetch failed:", error);
            } finally {
                setLoadingHouseholds(false);
                setLoadingTransactions(false);
            }
        };

        fetchDashboardData();
    }, [user?.username]);

    const chartData = useMemo(() => {
        const days = parseInt(timeRange);
        const data = [];
        const now = new Date();

        // Initialize days
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            data.push({
                name: dayName,
                spend: 0,
                fullDate: date.toISOString().split('T')[0]
            });
        }

        // Fill data from transactions
        transactions.forEach(tx => {
            const txDateObj = Array.isArray(tx.expenseDate)
                ? new Date(tx.expenseDate[0], tx.expenseDate[1] - 1, tx.expenseDate[2])
                : new Date(tx.expenseDate);
            // Use local date for matching
            const localY = txDateObj.getFullYear();
            const localM = String(txDateObj.getMonth() + 1).padStart(2, '0');
            const localD = String(txDateObj.getDate()).padStart(2, '0');
            const txDate = `${localY}-${localM}-${localD}`;

            const dayEntry = data.find(d => d.fullDate === txDate);
            if (dayEntry) {
                dayEntry.spend += (tx.amount || 0);
            }
        });

        return data;
    }, [transactions, timeRange]);

    const formatDate = (dateArray) => {
        if (!dateArray) return "N/A";
        if (Array.isArray(dateArray)) {
            const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
            return `${dateArray[2]} ${months[dateArray[1] - 1]} ${dateArray[0]}`;
        }
        return new Date(dateArray).toLocaleDateString();
    };

    const HOUSEHOLD_COLORS = [
        "bg-indigo-500",
        "bg-teal-500",
        "bg-orange-500",
        "bg-rose-500",
        "bg-amber-500",
        "bg-blue-500"
    ];
    const stats = useMemo(() => {
        const totalBalance = households.reduce((sum, h) => sum + (h.balance || 0), 0);

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const monthlySpending = transactions.reduce((sum, tx) => {
            const txDate = Array.isArray(tx.expenseDate)
                ? new Date(tx.expenseDate[0], tx.expenseDate[1] - 1, tx.expenseDate[2])
                : new Date(tx.expenseDate);

            if (txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
                return sum + (tx.amount || 0);
            }
            return sum;
        }, 0);

        return [
            { title: "Total Balance", value: `₹${totalBalance.toLocaleString()}`, change: households.length > 0 ? "Live" : "No Data", icon: Wallet, color: "text-emerald-600", bg: "bg-emerald-50" },
            { title: "Monthly Spending", value: `₹${monthlySpending.toLocaleString()}`, change: transactions.length > 0 ? "Current" : "No Data", icon: ArrowUpRight, color: "text-rose-600", bg: "bg-rose-50" },
            { title: "Active Households", value: households.length.toString(), change: "Active", icon: Home, color: "text-blue-600", bg: "bg-blue-50" },
            { title: "Recent Activity", value: transactions.length.toString(), change: "Total Logs", icon: TrendingUp, color: "text-indigo-600", bg: "bg-indigo-50" },
        ];
    }, [households, transactions]);

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
                {stats.map((stat, i) => (
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
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-xs font-bold text-gray-500 focus:ring-0 px-4 py-2 w-fit cursor-pointer"
                        >
                            <option value="7">Last 7 Days</option>
                            <option value="30">Last 30 Days</option>
                        </select>
                    </div>

                    <div className="h-[250px] md:h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
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
                                    tickFormatter={(value) => `₹${value.toLocaleString()}`}
                                />
                                <Tooltip
                                    formatter={(value) => [`₹${value.toLocaleString()}`, "Spending"]}
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
                                    animationDuration={1500}
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
                        {loadingHouseholds ? (
                            <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 border-dashed">
                                <Loader2 className="animate-spin text-indigo-500 mb-2" size={32} />
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading Households...</p>
                            </div>
                        ) : households.length > 0 ? (
                            households.slice(0, 3).map((house, i) => (
                                <Link href={`/cashflow/households/${house.refId}`} key={house.refId || i} className="block">
                                    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:border-indigo-100 dark:hover:border-indigo-900 transition-all flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${HOUSEHOLD_COLORS[i % HOUSEHOLD_COLORS.length]} flex items-center justify-center text-white shrink-0`}>
                                                <Home size={20} />
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-gray-800 dark:text-white group-hover:text-indigo-600 transition-colors uppercase text-[10px] md:text-xs tracking-wider truncate">{house.name}</h4>
                                                <p className="text-[10px] text-gray-400 font-medium flex items-center gap-1 mt-0.5">
                                                    <Users size={10} /> {house.members?.length || 0} Members
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-sm font-black text-gray-800 dark:text-white">{house.currency || '₹'} {(house.balance || 0).toLocaleString()}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">Balance</p>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 border-dashed">
                                <Home className="text-gray-200 dark:text-gray-700 mb-2" size={32} />
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center px-4">No households found. Create one to get started!</p>
                            </div>
                        )}
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
                        {loadingTransactions ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Loader2 className="animate-spin text-indigo-500 mb-2" size={32} />
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fetching Transactions...</p>
                            </div>
                        ) : transactions.length > 0 ? (
                            transactions.slice(0, 5).map((log) => (
                                <div key={log.uuid || log.refId} className="p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-gray-50 dark:bg-gray-700 text-gray-400 rounded-xl group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-600 transition-all">
                                            <DollarSign size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-800 dark:text-white">{log.description}</h4>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-tight bg-indigo-50 dark:bg-indigo-900/40 px-2.5 py-1 rounded-lg">
                                                    {log.category || 'Expense'}
                                                </span>
                                                <span className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1">
                                                    <Home size={10} /> {log.owner}
                                                </span>
                                                <span className="text-[10px] text-gray-300 font-medium">•</span>
                                                <span className="text-[10px] text-gray-400 font-bold uppercase">{formatDate(log.expenseDate)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-black text-rose-600">-₹{(log.amount || 0).toLocaleString()}</p>
                                        <div className="flex items-center justify-end gap-1 text-[10px] text-green-500 font-bold uppercase">
                                            <ArrowDownLeft size={10} /> Paid
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20">
                                <History className="text-gray-200 dark:text-gray-700 mb-2" size={40} />
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No recent transactions found.</p>
                            </div>
                        )}
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
