import Layout from "@/components/layout/Layout";
import { useState, useEffect, useCallback } from "react";
import {
    Home,
    Plus,
    Users,
    MoreVertical,
    TrendingUp,
    CreditCard,
    ArrowRight,
    Search,
    Filter,
    X,
    Loader2,
    RefreshCcw
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { postDataAsJson } from "../../dataService";
import { API_CASHFLOW_BASE_URL } from "../../constants";

const HouseholdCard = ({ household }) => {
    // derive spent and budget from budgets array if available, otherwise 0
    const totalSpent = household.budgets?.reduce((acc, b) => acc + (b.spent || 0), 0) || 0;
    const totalBudget = household.budgets?.reduce((acc, b) => acc + (b.amount || 0), 0) || 0;
    const progress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    // Formatting date from array [yyyy, mm, dd, ...]
    const formatDate = (dateArray) => {
        if (!dateArray || !Array.isArray(dateArray)) return "N/A";
        return `${dateArray[2]}/${dateArray[1]}/${dateArray[0]}`;
    };

    // Card gradients based on name or index
    const gradients = [
        "from-blue-600 to-indigo-600",
        "from-teal-500 to-emerald-600",
        "from-orange-500 to-rose-500",
        "from-purple-600 to-pink-600"
    ];
    const colorClass = gradients[Math.abs(household.name.length) % gradients.length];

    return (
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all overflow-hidden group">
            <div className={`h-32 bg-gradient-to-br ${colorClass} p-6 relative`}>
                <div className="flex justify-between items-start">
                    <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl text-white">
                        <Home size={24} />
                    </div>
                </div>
                <div className="absolute -bottom-12 right-6 w-24 h-24 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-4 border-white dark:border-gray-800 flex flex-col items-center justify-center p-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Currency</p>
                    <p className="text-xl font-black text-indigo-600">{household.currency || 'INR'}</p>
                </div>
            </div>

            <div className="p-6 pt-14">
                <div className="mb-6">
                    <h3 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tight line-clamp-1">{household.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="flex -space-x-2">
                            {household.members?.slice(0, 3).map((m, i) => (
                                <div key={i} className={`w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-[10px] font-bold text-white ${['bg-red-400', 'bg-blue-400', 'bg-green-400'][i % 3]}`}>
                                    {m.user[0].toUpperCase()}
                                </div>
                            ))}
                            {household.members?.length > 3 && (
                                <div className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                                    +{household.members.length - 3}
                                </div>
                            )}
                        </div>
                        <span className="text-xs font-bold text-gray-400 ml-1 uppercase">{household.members?.length || 0} Members</span>
                    </div>
                </div>

                <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider">
                        <span className="text-gray-400">Monthly Budget</span>
                        <span className={progress > 90 ? 'text-rose-500' : 'text-indigo-500'}>{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-500 rounded-full ${progress > 90 ? 'bg-rose-500' : 'bg-indigo-500'}`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-xs font-bold mt-1 text-gray-400">
                        <span>Created: {formatDate(household.createdAt)}</span>
                        <span>{household.status}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50 dark:border-gray-700">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-1">
                            RefID
                        </p>
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 truncate">{household.refId}</p>
                    </div>
                    <div className="flex items-end justify-end pb-1">
                        <Link href={`/cashflow/households/${household.refId}`}>
                            <button className="flex items-center gap-2 text-indigo-500 hover:text-indigo-600 font-bold text-sm group/btn">
                                Details <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CreateHouseholdModal = ({ isOpen, onClose, onSuccess }) => {
    const { user } = useAuth();
    const [name, setName] = useState("");
    const [currency, setCurrency] = useState("INR");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        const payload = [
            {
                name,
                currency,
                members: [
                    {
                        user: user?.username || "anonymous",
                        role: "ADMIN"
                    }
                ]
            }
        ];

        try {
            await postDataAsJson(`${API_CASHFLOW_BASE_URL}/households/household`, payload);
            alert("Household created successfully!");
            onSuccess();
            onClose();
        } catch (err) {
            console.error("Failed to create household:", err);
            setError("Failed to create household. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="bg-indigo-600 p-8 text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-xl transition-colors"
                    >
                        <X size={20} />
                    </button>
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md border border-white/30">
                        <Home size={32} />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight uppercase">New Household</h2>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-gray-50 dark:bg-gray-900/50">
                    {error && (
                        <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 p-4 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-3">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Household Name</label>
                        <input
                            required
                            type="text"
                            placeholder="e.g. My Awesome Home"
                            className="w-full bg-white dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Currency</label>
                        <div className="grid grid-cols-3 gap-3">
                            {["INR", "USD", "EUR"].map((curr) => (
                                <button
                                    key={curr}
                                    type="button"
                                    onClick={() => setCurrency(curr)}
                                    className={`py-3 rounded-2xl text-xs font-black transition-all ${currency === curr
                                            ? "bg-indigo-600 text-white shadow-lg"
                                            : "bg-white dark:bg-gray-800 text-gray-400"
                                        }`}
                                >
                                    {curr}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        disabled={isSubmitting}
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                        {isSubmitting ? "Creating..." : "Create Household"}
                    </button>
                </form>
            </div>
        </div>
    );
};

const HouseholdsLogic = () => {
    const { user } = useAuth();
    const [households, setHouseholds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState("");

    const fetchHouseholds = useCallback(async () => {
        if (!user?.username) return;

        setLoading(true);
        setError("");
        try {
            const response = await postDataAsJson(`${API_CASHFLOW_BASE_URL}/households/household/search`, {
                user: user.username
            });
            if (response?.data) {
                setHouseholds(response.data);
            }
        } catch (err) {
            console.error("Failed to fetch households:", err);
            setError("Unable to load households.");
        } finally {
            setLoading(false);
        }
    }, [user?.username]);

    useEffect(() => {
        fetchHouseholds();
    }, [fetchHouseholds]);

    const filteredHouseholds = households.filter(h =>
        h.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase">Your Households</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">Manage family entities and shared financial spaces.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchHouseholds}
                        className="p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-gray-400 hover:text-indigo-600 transition-colors"
                        title="Refresh"
                    >
                        <RefreshCcw size={20} className={loading ? "animate-spin" : ""} />
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="w-full md:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all active:scale-95"
                    >
                        <Plus size={20} /> Create Household
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search households..."
                        className="w-full pl-12 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-[350px] bg-gray-100 dark:bg-gray-800 animate-pulse rounded-3xl" />
                    ))}
                </div>
            ) : error ? (
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <p className="text-rose-500 font-bold">{error}</p>
                    <button onClick={fetchHouseholds} className="mt-4 text-indigo-600 font-bold flex items-center gap-2 mx-auto">
                        <RefreshCcw size={16} /> Try Again
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {filteredHouseholds.map(house => (
                        <HouseholdCard key={house.uuid} household={house} />
                    ))}

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="h-full min-h-[350px] border-4 border-dashed border-gray-100 dark:border-gray-800 rounded-3xl flex flex-col items-center justify-center p-8 hover:border-indigo-100 dark:hover:border-indigo-900 group transition-all"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-300 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-600 transition-all mb-4">
                            <Plus size={32} />
                        </div>
                        <span className="text-lg font-bold text-gray-400 group-hover:text-indigo-600 transition-colors">Add New Household</span>
                    </button>
                </div>
            )}

            <CreateHouseholdModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchHouseholds}
            />
        </div>
    );
};

const HouseholdsPage = () => {
    return <Layout content={<HouseholdsLogic />} />;
};

export default HouseholdsPage;
