import Layout from "@/components/layout/Layout";
import { useRouter } from "next/router";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
    Home,
    Users,
    BarChart3,
    History,
    Plus,
    Calendar,
    MoreHorizontal,
    ArrowUpRight,
    ArrowDownLeft,
    Wallet,
    TrendingUp,
    Settings,
    ShieldCheck,
    UserCircle,
    CheckCircle2,
    Edit3,
    Trash2,
    Loader2,
    RefreshCcw,
    X,
    UserPlus,
    Shield,
    Zap,
    Activity
} from "lucide-react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell, PieChart, Pie
} from "recharts";
import householdService from "../../../services/household.service";
import userService from "../../../services/user.service";
import categoryService from "../../../services/category.service";
import { useAuth } from "../../../context/AuthContext";

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const formatDate = (dateArray) => {
    if (!dateArray || !Array.isArray(dateArray)) return "N/A";
    return `${dateArray[2]}/${dateArray[1]}/${dateArray[0]}`;
};

const InviteMemberModal = ({ isOpen, onClose, onSuccess, householdRefId }) => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState("");
    const [selectedRole, setSelectedRole] = useState("MEMBER");
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen) {
            const getUsers = async () => {
                setLoadingUsers(true);
                try {
                    const response = await userService.getUsers();
                    if (response?.data) {
                        setUsers(response.data);
                    }
                } catch (err) {
                    console.error("Failed to fetch users:", err);
                } finally {
                    setLoadingUsers(false);
                }
            };
            getUsers();
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedUser) {
            setError("Please select a user to invite.");
            return;
        }

        setIsSubmitting(true);
        setError("");

        const payload = [
            {
                user: selectedUser,
                householdRefId: householdRefId,
                role: selectedRole
            }
        ];

        try {
            await householdService.inviteMember(payload);
            onSuccess();
            onClose();
            setSelectedUser("");
            setSelectedRole("MEMBER");
        } catch (err) {
            console.error("Failed to invite member:", err);
            setError("Failed to send invitation. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

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
                        <UserPlus size={32} />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight uppercase">Invite Member</h2>
                    <p className="text-indigo-100 text-sm font-medium mt-1">Add a new member to your household.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-gray-50 dark:bg-gray-900/50">
                    {error && (
                        <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 p-4 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-3 border border-rose-100 dark:border-rose-800">
                            <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Select User</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                <UserCircle size={20} />
                            </div>
                            <select
                                required
                                className="w-full bg-white dark:bg-gray-800 border-none rounded-2xl pl-12 pr-5 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 shadow-sm appearance-none dark:text-white"
                                value={selectedUser}
                                onChange={(e) => setSelectedUser(e.target.value)}
                                disabled={loadingUsers}
                            >
                                <option value="">{loadingUsers ? "Loading users..." : "Choose a user..."}</option>
                                {users
                                    .filter(u => u.username !== user?.username)
                                    .map(u => (
                                        <option key={u.uuid} value={u.username}>{u.username}</option>
                                    ))
                                }
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Assign Role</label>
                        <div className="grid grid-cols-2 gap-3">
                            {["MEMBER", "ADMIN"].map((role) => (
                                <button
                                    key={role}
                                    type="button"
                                    onClick={() => setSelectedRole(role)}
                                    className={`py-4 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 ${selectedRole === role
                                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none"
                                        : "bg-white dark:bg-gray-800 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        }`}
                                >
                                    {role === "ADMIN" && <Shield size={14} />}
                                    {role}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            disabled={isSubmitting || loadingUsers}
                            type="submit"
                            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all active:scale-95 flex items-center justify-center gap-3"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <UserPlus size={20} />}
                            {isSubmitting ? "Sending Invitation..." : "Invite to Household"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AddBudgetModal = ({ isOpen, onClose, onSuccess, householdRefId }) => {
    const [formData, setFormData] = useState({
        category: "",
        categoryRefId: "",
        amount: "",
        period: "MONTHLY",
        budgetDate: new Date().toISOString().split('T')[0]
    });
    const [categories, setCategories] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [showCategoryList, setShowCategoryList] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen) {
            const fetchCategories = async () => {
                setLoadingCategories(true);
                try {
                    const response = await householdService.searchCategories({});
                    if (response?.data) {
                        setCategories(response.data);
                    }
                } catch (err) {
                    console.error("Failed to fetch categories:", err);
                } finally {
                    setLoadingCategories(false);
                }
            };
            fetchCategories();
        }
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === "category") {
            const filtered = categories.filter(cat =>
                cat.name.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredCategories(filtered);
            setShowCategoryList(true);
        }
    };

    const handleSelectCategory = (cat) => {
        setFormData(prev => ({
            ...prev,
            category: cat.name,
            categoryRefId: cat.refId || cat.uuid
        }));
        setShowCategoryList(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        const payload = [
            {
                amount: parseFloat(formData.amount),
                period: formData.period,
                householdRefId: householdRefId,
                budgetDate: formData.budgetDate,
                categoryRefId: formData.categoryRefId
            }
        ];

        try {
            await householdService.addBudget(payload);
            onSuccess();
            onClose();
            setFormData({
                category: "",
                categoryRefId: "",
                amount: "",
                period: "MONTHLY",
                budgetDate: new Date().toISOString().split('T')[0]
            });
        } catch (err) {
            console.error("Failed to add budget:", err);
            setError("Failed to create budget. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="bg-emerald-600 p-8 text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-xl transition-colors"
                    >
                        <X size={20} />
                    </button>
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md border border-white/30">
                        <TrendingUp size={32} />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight uppercase">Add Budget</h2>
                    <p className="text-emerald-100 text-sm font-medium mt-1">Set spending limits for your categories.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-5 bg-gray-50 dark:bg-gray-900/50">
                    {error && (
                        <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 p-4 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-3 border border-rose-100 dark:border-rose-800">
                            <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-2 relative">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Category Name</label>
                        <div className="relative">
                            <input
                                required
                                autoComplete="off"
                                type="text"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                onFocus={() => formData.category && setShowCategoryList(true)}
                                onBlur={() => setTimeout(() => setShowCategoryList(false), 200)}
                                placeholder="e.g. Groceries, Rent..."
                                className="w-full bg-white dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 shadow-sm dark:text-white"
                            />
                            {showCategoryList && filteredCategories.length > 0 && (
                                <div className="absolute z-[110] left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 max-h-48 overflow-y-auto overflow-x-hidden scrollbar-none animate-in slide-in-from-top-2 duration-200">
                                    {filteredCategories.map((cat) => (
                                        <button
                                            key={cat.uuid}
                                            type="button"
                                            onClick={() => handleSelectCategory(cat)}
                                            className="w-full text-left px-5 py-3 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors flex flex-col"
                                        >
                                            <span className="text-sm font-bold text-gray-800 dark:text-white">{cat.name}</span>
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{cat.status}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Limit Amount</label>
                            <input
                                required
                                type="number"
                                name="amount"
                                value={formData.amount}
                                onChange={handleChange}
                                placeholder="0.00"
                                className="w-full bg-white dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 shadow-sm dark:text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Period</label>
                            <select
                                name="period"
                                value={formData.period}
                                onChange={handleChange}
                                className="w-full bg-white dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 shadow-sm appearance-none dark:text-white"
                            >
                                <option value="MONTHLY">Monthly</option>
                                <option value="YEARLY">Yearly</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Budget Date</label>
                        <input
                            required
                            type="date"
                            name="budgetDate"
                            value={formData.budgetDate}
                            onChange={handleChange}
                            className="w-full bg-white dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 shadow-sm dark:text-white"
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            disabled={isSubmitting}
                            type="submit"
                            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-100 transition-all active:scale-95 flex items-center justify-center gap-3"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <TrendingUp size={20} />}
                            {isSubmitting ? "Creating Budget..." : "Save Budget"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const EditBudgetModal = ({ isOpen, onClose, onSuccess, budget, householdRefId }) => {
    const [formData, setFormData] = useState({
        category: "",
        categoryRefId: "",
        amount: "",
        period: "MONTHLY",
        budgetDate: new Date().toISOString().split('T')[0]
    });
    const [categories, setCategories] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [showCategoryList, setShowCategoryList] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen && budget) {
            setFormData({
                category: budget.category || "",
                categoryRefId: budget.categoryRefId || "",
                amount: budget.amount || "",
                period: budget.period || "MONTHLY",
                budgetDate: budget.budgetDate || (new Date().toISOString().split('T')[0])
            });
        }
    }, [isOpen, budget]);

    useEffect(() => {
        if (isOpen) {
            const fetchCategories = async () => {
                setLoadingCategories(true);
                try {
                    const response = await householdService.searchCategories({});
                    if (response?.data) {
                        setCategories(response.data);
                    }
                } catch (err) {
                    console.error("Failed to fetch categories:", err);
                } finally {
                    setLoadingCategories(false);
                }
            };
            fetchCategories();
        }
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === "category") {
            const filtered = categories.filter(cat =>
                cat.name.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredCategories(filtered);
            setShowCategoryList(true);
        }
    };

    const handleSelectCategory = (cat) => {
        setFormData(prev => ({
            ...prev,
            category: cat.name,
            categoryRefId: cat.refId || cat.uuid
        }));
        setShowCategoryList(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        const payload = [
            {
                refId: budget.refId,
                categoryRefId: formData.categoryRefId,
                amount: parseFloat(formData.amount),
                period: formData.period,
                householdRefId: householdRefId,
                budgetDate: formData.budgetDate
            }
        ];

        try {
            await householdService.updateBudget(payload);
            onSuccess();
            onClose();
        } catch (err) {
            console.error("Failed to update budget:", err);
            setError("Failed to update budget. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

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
                        <Edit3 size={32} />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight uppercase">Edit Budget</h2>
                    <p className="text-indigo-100 text-sm font-medium mt-1">Adjust your spending limit for {budget?.category || 'this category'}.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-5 bg-gray-50 dark:bg-gray-900/50">
                    {error && (
                        <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 p-4 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-3 border border-rose-100 dark:border-rose-800">
                            <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-2 relative">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Category Name</label>
                        <div className="relative">
                            <input
                                required
                                autoComplete="off"
                                type="text"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                onFocus={() => formData.category && setShowCategoryList(true)}
                                onBlur={() => setTimeout(() => setShowCategoryList(false), 200)}
                                placeholder="e.g. Groceries, Rent..."
                                className="w-full bg-white dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 shadow-sm dark:text-white"
                            />
                            {showCategoryList && filteredCategories.length > 0 && (
                                <div className="absolute z-[110] left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 max-h-48 overflow-y-auto overflow-x-hidden scrollbar-none animate-in slide-in-from-top-2 duration-200">
                                    {filteredCategories.map((cat) => (
                                        <button
                                            key={cat.uuid || cat.refId}
                                            type="button"
                                            onClick={() => handleSelectCategory(cat)}
                                            className="w-full text-left px-5 py-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors flex flex-col"
                                        >
                                            <span className="text-sm font-bold text-gray-800 dark:text-white">{cat.name}</span>
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{cat.status}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Limit Amount</label>
                            <input
                                required
                                type="number"
                                name="amount"
                                value={formData.amount}
                                onChange={handleChange}
                                placeholder="0.00"
                                className="w-full bg-white dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 shadow-sm dark:text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Period</label>
                            <select
                                name="period"
                                value={formData.period}
                                onChange={handleChange}
                                className="w-full bg-white dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 shadow-sm appearance-none dark:text-white"
                            >
                                <option value="MONTHLY">Monthly</option>
                                <option value="YEARLY">Yearly</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Budget Date</label>
                        <input
                            required
                            type="date"
                            name="budgetDate"
                            value={formData.budgetDate}
                            onChange={handleChange}
                            className="w-full bg-white dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 shadow-sm dark:text-white"
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            disabled={isSubmitting}
                            type="submit"
                            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all active:scale-95 flex items-center justify-center gap-3"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                            {isSubmitting ? "Updating Budget..." : "Update Budget"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AddDepositModal = ({ isOpen, onClose, onSuccess, householdRefId }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        amount: "",
        depositDate: new Date().toISOString().split('T')[0],
        source: "",
        notes: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        const payload = [
            {
                username: user?.username || "unknown",
                amount: parseFloat(formData.amount),
                householdRefId: householdRefId,
                depositDate: formData.depositDate,
                source: formData.source,
                notes: formData.notes
            }
        ];

        try {
            await householdService.addDeposit(payload);
            onSuccess();
            onClose();
            setFormData({
                amount: "",
                depositDate: new Date().toISOString().split('T')[0],
                source: "",
                notes: ""
            });
        } catch (err) {
            console.error("Failed to log deposit:", err);
            setError("Failed to log deposit. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="bg-emerald-600 p-8 text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-xl transition-colors"
                    >
                        <X size={20} />
                    </button>
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md border border-white/30">
                        <TrendingUp size={32} />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight uppercase">New Deposit</h2>
                    <p className="text-emerald-100 text-sm font-medium mt-1">Add funds to your household account.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-5 bg-gray-50 dark:bg-gray-900/50">
                    {error && (
                        <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 p-4 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-3 border border-rose-100 dark:border-rose-800">
                            <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Amount</label>
                                <input
                                    required
                                    type="number"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    className="w-full bg-white dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 shadow-sm dark:text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Deposit Date</label>
                                <input
                                    required
                                    type="date"
                                    name="depositDate"
                                    value={formData.depositDate}
                                    onChange={handleChange}
                                    className="w-full bg-white dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 shadow-sm dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Source</label>
                            <input
                                required
                                type="text"
                                name="source"
                                value={formData.source}
                                onChange={handleChange}
                                placeholder="e.g. Salary, Freelance..."
                                className="w-full bg-white dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 shadow-sm dark:text-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Notes</label>
                            <input
                                type="text"
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                placeholder="Any additional info..."
                                className="w-full bg-white dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 shadow-sm dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            disabled={isSubmitting}
                            type="submit"
                            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-100 transition-all active:scale-95 flex items-center justify-center gap-3"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <TrendingUp size={20} />}
                            {isSubmitting ? "Logging Deposit..." : "Confirm Deposit"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const AddExpenseModal = ({ isOpen, onClose, onSuccess, householdRefId }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        category: "",
        categoryRefId: "",
        amount: "",
        expenseDate: new Date().toISOString().split('T')[0],
        description: "",
        type: "ONE_TIME",
        expenseFor: "FAMILY",
        paymentMode: "UPI"
    });
    const [categories, setCategories] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [showCategoryList, setShowCategoryList] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen) {
            const fetchCategories = async () => {
                setLoadingCategories(true);
                try {
                    const response = await categoryService.searchCategories({});
                    if (response?.data) {
                        setCategories(response.data);
                    }
                } catch (err) {
                    console.error("Failed to fetch categories:", err);
                } finally {
                    setLoadingCategories(false);
                }
            };
            fetchCategories();
        }
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === "category") {
            const filtered = categories.filter(cat =>
                cat.name.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredCategories(filtered);
            setShowCategoryList(true);
        }
    };

    const handleSelectCategory = (cat) => {
        setFormData(prev => ({
            ...prev,
            category: cat.name,
            categoryRefId: cat.refId || cat.uuid
        }));
        setShowCategoryList(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        const payload = [
            {
                householdRefId: householdRefId,
                owner: user?.username || "unknown",
                amount: parseFloat(formData.amount),
                expenseDate: formData.expenseDate,
                description: formData.description,
                categoryRefId: formData.categoryRefId,
                type: formData.type,
                expenseFor: formData.expenseFor,
                paymentMode: formData.paymentMode
            }
        ];

        try {
            await householdService.addExpense(payload);
            onSuccess();
            onClose();
            setFormData({
                category: "",
                categoryRefId: "",
                amount: "",
                expenseDate: new Date().toISOString().split('T')[0],
                description: "",
                type: "ONE_TIME",
                expenseFor: "FAMILY",
                paymentMode: "UPI"
            });
        } catch (err) {
            console.error("Failed to log expense:", err);
            setError("Failed to log expense. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

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
                        <Plus size={32} />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight uppercase">New Expense</h2>
                    <p className="text-indigo-100 text-sm font-medium mt-1">Log a new spending in your household.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-4 bg-gray-50 dark:bg-gray-900/50">
                    {error && (
                        <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 p-4 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-3 border border-rose-100 dark:border-rose-800">
                            <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Amount</label>
                                <input
                                    required
                                    type="number"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    className="w-full bg-white dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 shadow-sm dark:text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Date</label>
                                <input
                                    required
                                    type="date"
                                    name="expenseDate"
                                    value={formData.expenseDate}
                                    onChange={handleChange}
                                    className="w-full bg-white dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 shadow-sm dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="space-y-2 relative">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Category</label>
                            <div className="relative">
                                <input
                                    required
                                    autoComplete="off"
                                    type="text"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    onFocus={() => formData.category && setShowCategoryList(true)}
                                    onBlur={() => setTimeout(() => setShowCategoryList(false), 200)}
                                    placeholder="Select category..."
                                    className="w-full bg-white dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 shadow-sm dark:text-white"
                                />
                                {showCategoryList && filteredCategories.length > 0 && (
                                    <div className="absolute z-[110] left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 max-h-48 overflow-y-auto overflow-x-hidden scrollbar-none animate-in slide-in-from-top-2 duration-200">
                                        {filteredCategories.map((cat) => (
                                            <button
                                                key={cat.uuid || cat.refId}
                                                type="button"
                                                onClick={() => handleSelectCategory(cat)}
                                                className="w-full text-left px-5 py-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors flex flex-col"
                                            >
                                                <span className="text-sm font-bold text-gray-800 dark:text-white">{cat.name}</span>
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{cat.status}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Type</label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="w-full bg-white dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 shadow-sm appearance-none dark:text-white"
                                >
                                    <option value="ONE_TIME">One-time</option>
                                    <option value="RECURRING">Recurring</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Expense For</label>
                                <select
                                    name="expenseFor"
                                    value={formData.expenseFor}
                                    onChange={handleChange}
                                    className="w-full bg-white dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 shadow-sm appearance-none dark:text-white"
                                >
                                    <option value="FAMILY">Family</option>
                                    <option value="PERSONAL">Personal</option>
                                    <option value="OTHERS">Others</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Payment Mode</label>
                                <select
                                    name="paymentMode"
                                    value={formData.paymentMode}
                                    onChange={handleChange}
                                    className="w-full bg-white dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 shadow-sm appearance-none dark:text-white"
                                >
                                    <option value="UPI">UPI</option>
                                    <option value="INTERNET BANKING">Internet Banking</option>
                                    <option value="DEBIT CARD">Debit Card</option>
                                    <option value="CREDIT CARD">Credit Card</option>
                                    <option value="CASH">Cash</option>
                                    <option value="OTHERS">Others</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Description</label>
                            <input
                                required
                                type="text"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="What was this for?"
                                className="w-full bg-white dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 shadow-sm dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="pt-6">
                        <button
                            disabled={isSubmitting}
                            type="submit"
                            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all active:scale-95 flex items-center justify-center gap-3"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                            {isSubmitting ? "Logging..." : "Log Expense"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const EditExpenseModal = ({ isOpen, onClose, onSuccess, expense, householdRefId }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        category: "",
        categoryRefId: "",
        amount: "",
        expenseDate: "",
        description: "",
        type: "ONE_TIME",
        expenseFor: "FAMILY",
        paymentMode: "UPI"
    });
    const [categories, setCategories] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [showCategoryList, setShowCategoryList] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen && expense) {
            setFormData({
                category: expense.category || "",
                categoryRefId: expense.categoryRefId || "",
                amount: expense.amount || "",
                expenseDate: expense.expenseDate ? (Array.isArray(expense.expenseDate) ? `${expense.expenseDate[0]}-${String(expense.expenseDate[1]).padStart(2, '0')}-${String(expense.expenseDate[2]).padStart(2, '0')}` : expense.expenseDate) : "",
                description: expense.description || "",
                type: expense.type || "ONE_TIME",
                expenseFor: expense.expenseFor || "FAMILY",
                paymentMode: expense.paymentMode || "UPI"
            });
        }
    }, [isOpen, expense]);

    useEffect(() => {
        if (isOpen) {
            const fetchCategories = async () => {
                setLoadingCategories(true);
                try {
                    const response = await householdService.searchCategories({});
                    if (response?.data) {
                        setCategories(response.data);
                    }
                } catch (err) {
                    console.error("Failed to fetch categories:", err);
                } finally {
                    setLoadingCategories(false);
                }
            };
            fetchCategories();
        }
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === "category") {
            const filtered = categories.filter(cat =>
                cat.name.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredCategories(filtered);
            setShowCategoryList(true);
        }
    };

    const handleSelectCategory = (cat) => {
        setFormData(prev => ({
            ...prev,
            category: cat.name,
            categoryRefId: cat.refId || cat.uuid
        }));
        setShowCategoryList(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        const payload = [
            {
                refId: expense.refId,
                householdRefId: householdRefId,
                owner: user?.username || expense.owner,
                amount: parseFloat(formData.amount),
                expenseDate: formData.expenseDate,
                description: formData.description,
                categoryRefId: formData.categoryRefId,
                type: formData.type,
                expenseFor: formData.expenseFor,
                paymentMode: formData.paymentMode
            }
        ];

        try {
            await householdService.updateExpense(payload);
            onSuccess();
            onClose();
        } catch (err) {
            console.error("Failed to update expense:", err);
            setError("Failed to update expense. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="bg-amber-500 p-8 text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-xl transition-colors"
                    >
                        <X size={20} />
                    </button>
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md border border-white/30">
                        <Edit3 size={32} />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight uppercase">Edit Expense</h2>
                    <p className="text-amber-100 text-sm font-medium mt-1">Update the details of this transaction.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-4 bg-gray-50 dark:bg-gray-900/50">
                    {error && (
                        <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 p-4 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-3 border border-rose-100 dark:border-rose-800">
                            <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Amount</label>
                                <input
                                    required
                                    type="number"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    className="w-full bg-white dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-amber-500/20 shadow-sm dark:text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Date</label>
                                <input
                                    required
                                    type="date"
                                    name="expenseDate"
                                    value={formData.expenseDate}
                                    onChange={handleChange}
                                    className="w-full bg-white dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-amber-500/20 shadow-sm dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="space-y-2 relative">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Category</label>
                            <div className="relative">
                                <input
                                    required
                                    autoComplete="off"
                                    type="text"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    onFocus={() => formData.category && setShowCategoryList(true)}
                                    onBlur={() => setTimeout(() => setShowCategoryList(false), 200)}
                                    placeholder="Select category..."
                                    className="w-full bg-white dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-amber-500/20 shadow-sm dark:text-white"
                                />
                                {showCategoryList && filteredCategories.length > 0 && (
                                    <div className="absolute z-[110] left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 max-h-48 overflow-y-auto overflow-x-hidden scrollbar-none animate-in slide-in-from-top-2 duration-200">
                                        {filteredCategories.map((cat) => (
                                            <button
                                                key={cat.uuid || cat.refId}
                                                type="button"
                                                onClick={() => handleSelectCategory(cat)}
                                                className="w-full text-left px-5 py-3 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors flex flex-col"
                                            >
                                                <span className="text-sm font-bold text-gray-800 dark:text-white">{cat.name}</span>
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{cat.status}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Type</label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="w-full bg-white dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-amber-500/20 shadow-sm appearance-none dark:text-white"
                                >
                                    <option value="ONE_TIME">One-time</option>
                                    <option value="RECURRING">Recurring</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Expense For</label>
                                <select
                                    name="expenseFor"
                                    value={formData.expenseFor}
                                    onChange={handleChange}
                                    className="w-full bg-white dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-amber-500/20 shadow-sm appearance-none dark:text-white"
                                >
                                    <option value="FAMILY">Family</option>
                                    <option value="PERSONAL">Personal</option>
                                    <option value="OTHERS">Others</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Payment Mode</label>
                                <select
                                    name="paymentMode"
                                    value={formData.paymentMode}
                                    onChange={handleChange}
                                    className="w-full bg-white dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-amber-500/20 shadow-sm appearance-none dark:text-white"
                                >
                                    <option value="UPI">UPI</option>
                                    <option value="INTERNET BANKING">Internet Banking</option>
                                    <option value="DEBIT CARD">Debit Card</option>
                                    <option value="CREDIT CARD">Credit Card</option>
                                    <option value="OTHERS">Others</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Description</label>
                            <input
                                required
                                type="text"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="What was this for?"
                                className="w-full bg-white dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-amber-500/20 shadow-sm dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="pt-6">
                        <button
                            disabled={isSubmitting}
                            type="submit"
                            className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-amber-100 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-3"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                            {isSubmitting ? "Updating..." : "Update Transaction"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const DeleteExpenseModal = ({ isOpen, onClose, onSuccess, expense }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleDelete = async () => {
        setIsSubmitting(true);
        setError("");

        const payload = [
            {
                refId: expense.refId
            }
        ];

        try {
            await householdService.deleteExpense(payload);
            onSuccess();
            onClose();
        } catch (err) {
            console.error("Failed to delete expense:", err);
            setError("Failed to delete expense. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 border border-rose-100 dark:border-rose-900/30">
                <div className="bg-rose-600 p-8 text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-xl transition-colors"
                    >
                        <X size={20} />
                    </button>
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md border border-white/30 text-white">
                        <Trash2 size={32} />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight uppercase">Delete Expense</h2>
                    <p className="text-rose-100 text-sm font-medium mt-1">Are you sure you want to remove this transaction?</p>
                </div>

                <div className="p-8 space-y-6 bg-gray-50 dark:bg-gray-900/50">
                    <div className="bg-rose-50 dark:bg-rose-900/10 p-5 rounded-2xl border border-rose-100/50 dark:border-rose-800/20">
                        <p className="text-xs font-bold text-rose-600 dark:text-rose-400 leading-relaxed uppercase tracking-wider">
                            Warning: This will permanently remove the record for <span className="underline decoration-2">{expense?.description}</span>. This action cannot be undone.
                        </p>
                    </div>

                    {error && (
                        <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 p-4 rounded-xl text-[10px] font-black uppercase tracking-widest border border-rose-100 dark:border-rose-800 flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all border-2 border-transparent"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={isSubmitting}
                            onClick={handleDelete}
                            className="flex-[2] bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-200 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                            {isSubmitting ? "Deleting..." : "Delete Permanently"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DeleteBudgetModal = ({ isOpen, onClose, onSuccess, budget }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleDelete = async () => {
        setIsSubmitting(true);
        setError("");

        const payload = [
            {
                refId: budget.refId
            }
        ];

        try {
            await householdService.deleteBudget(payload);
            onSuccess();
            onClose();
        } catch (err) {
            console.error("Failed to delete budget:", err);
            setError("Failed to delete budget. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 border border-rose-100 dark:border-rose-900/30">
                <div className="bg-rose-600 p-8 text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-xl transition-colors"
                    >
                        <X size={20} />
                    </button>
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md border border-white/30 text-white">
                        <Trash2 size={32} />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight uppercase">Delete Budget</h2>
                    <p className="text-rose-100 text-sm font-medium mt-1">Are you sure you want to remove this budget?</p>
                </div>

                <div className="p-8 space-y-6 bg-gray-50 dark:bg-gray-900/50">
                    <div className="bg-rose-50 dark:bg-rose-900/10 p-5 rounded-2xl border border-rose-100/50 dark:border-rose-800/20">
                        <p className="text-xs font-bold text-rose-600 dark:text-rose-400 leading-relaxed uppercase tracking-wider">
                            Warning: This will permanently remove the budget for <span className="underline decoration-2">{budget?.category}</span>. This action cannot be undone.
                        </p>
                    </div>

                    {error && (
                        <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 p-4 rounded-xl text-[10px] font-black uppercase tracking-widest border border-rose-100 dark:border-rose-800 flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all border-2 border-transparent"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={isSubmitting}
                            onClick={handleDelete}
                            className="flex-[2] bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-200 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                            {isSubmitting ? "Deleting..." : "Delete Permanently"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const OverviewTab = ({ household }) => {
    const { user } = useAuth();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const currency = household?.currency || 'INR';

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!household?.refId || !user?.username) return;
            setLoading(true);
            try {
                const response = await householdService.getHouseholdDashboardData(household.refId, user.username);
                if (response?.data) {
                    setDashboardData(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch household dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [household?.refId, user?.username]);

    const { totalSpentThisMonth, budgetLeft, chartData, categoryPieData } = useMemo(() => {
        if (!dashboardData) return {
            totalSpentThisMonth: 0,
            budgetLeft: 0,
            chartData: [],
            categoryPieData: [{ name: 'No Spending', value: 1, fill: '#f3f4f6' }]
        };

        const budgetVsActual = dashboardData.budgetVsActual || {};
        const spendingSplit = dashboardData.spendingSplit || {};

        const chart = Object.entries(budgetVsActual).map(([name, data]) => ({
            category: name,
            amount: data.budget || 0,
            spent: data.actual || 0,
            fill: (data.actual || 0) > (data.budget || 0) ? '#ef4444' : '#4f46e5'
        }));

        const pie = Object.entries(spendingSplit).map(([name, value]) => ({
            name,
            value: value || 0
        }));

        return {
            totalSpentThisMonth: dashboardData.totalSpent || 0,
            budgetLeft: dashboardData.budgetLeft || 0,
            chartData: chart,
            categoryPieData: pie.length > 0 ? pie : [{ name: 'No Spending', value: 1, fill: '#f3f4f6' }]
        };
    }, [dashboardData]);

    const balance = dashboardData?.availableBalance || 0;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="animate-spin text-indigo-500 mb-4" size={48} />
                <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Loading Overview...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-3xl text-white shadow-lg shadow-indigo-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4">
                        <Wallet size={120} />
                    </div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                            <Wallet size={24} />
                        </div>
                        <span className="text-[10px] font-black bg-white/20 px-3 py-1.5 rounded-xl uppercase tracking-widest backdrop-blur-sm">Account</span>
                    </div>
                    <div className="relative z-10">
                        <p className="text-indigo-100 text-sm font-medium">Available Balance</p>
                        <h3 className="text-3xl md:text-4xl font-black mt-1 tracking-tight">{currency} {balance.toLocaleString()}</h3>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm relative group hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-rose-50 dark:bg-rose-900/30 text-rose-600 rounded-2xl group-hover:scale-110 transition-transform">
                            <TrendingUp size={24} />
                        </div>
                        <span className="text-[10px] font-black bg-rose-50 dark:bg-rose-900/30 text-rose-600 px-3 py-1.5 rounded-xl uppercase tracking-widest">This Month</span>
                    </div>
                    <div>
                        <p className="text-gray-400 dark:text-gray-500 text-sm font-bold uppercase tracking-wide">Total Spent</p>
                        <h3 className="text-3xl md:text-4xl font-black text-gray-800 dark:text-white mt-1 tracking-tight">{currency} {totalSpentThisMonth.toLocaleString()}</h3>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm relative group hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform">
                            <ShieldCheck size={24} />
                        </div>
                        <span className="text-[10px] font-black bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 px-3 py-1.5 rounded-xl uppercase tracking-widest">Remaining</span>
                    </div>
                    <div>
                        <p className="text-gray-400 dark:text-gray-500 text-sm font-bold uppercase tracking-wide">Budget Left</p>
                        <h3 className={`text-3xl md:text-4xl font-black mt-1 tracking-tight ${budgetLeft < 0 ? 'text-rose-600' : 'text-gray-800 dark:text-white'}`}>
                            {currency} {budgetLeft.toLocaleString()}
                        </h3>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Spending by Category Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm">
                    <h2 className="text-xl font-black text-gray-800 dark:text-white mb-8 uppercase tracking-widest flex items-center gap-3">
                        <BarChart3 size={24} className="text-indigo-500" />
                        Budget vs Actual
                    </h2>
                    <div className="h-[300px]">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} barGap={4}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis
                                        dataKey="category"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 700 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 700 }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#f9fafb' }}
                                        contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', padding: '16px' }}
                                        itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                    />
                                    <Bar dataKey="amount" fill="#e2e8f0" radius={[6, 6, 6, 6]} name="Budget" barSize={20} />
                                    <Bar dataKey="spent" fill="#4f46e5" radius={[6, 6, 6, 6]} name="Actual" barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <div className="bg-gray-50 dark:bg-gray-900 rounded-full p-6 mb-4">
                                    <BarChart3 size={48} className="opacity-20" />
                                </div>
                                <p className="font-black uppercase text-xs tracking-widest">No Budget Data Available</p>
                                <p className="text-xs mt-2">Create budgets to see analytics</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Categories Pie */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-between shadow-sm">
                    <h2 className="self-start text-xl font-black text-gray-800 dark:text-white mb-2 uppercase tracking-widest flex items-center gap-3">
                        <History size={24} className="text-amber-500" />
                        Spending Split
                    </h2>
                    <div className="h-[250px] w-full relative flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryPieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {categoryPieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.name === 'No Spending' ? '#f3f4f6' : COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-black text-gray-800 dark:text-white">{totalSpentThisMonth > 0 ? '100%' : '0%'}</span>
                            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Allocated</span>
                        </div>
                    </div>
                    <div className="w-full space-y-3 mt-4">
                        {categoryPieData.slice(0, 3).map((entry, i) => (
                            entry.name !== 'No Spending' && (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                        <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{entry.name}</span>
                                    </div>
                                    <span className="text-xs font-black text-gray-900 dark:text-white">{currency} {entry.value.toLocaleString()}</span>
                                </div>
                            )
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const AnalyticsTab = ({ household }) => {
    const { user } = useAuth();
    const [analyticsData, setAnalyticsData] = useState({
        core: null,
        behavior: null,
        diagnostic: null,
        planning: null
    });
    const [loading, setLoading] = useState(true);
    const currency = household?.currency || 'INR';

    useEffect(() => {
        const fetchAllAnalytics = async () => {
            if (!household?.refId) return;
            setLoading(true);

            // Calculate Date Ranges
            const now = new Date();
            const firstDayCurrent = new Date(now.getFullYear(), now.getMonth(), 1);
            const lastDayCurrent = new Date(now.getFullYear(), now.getMonth() + 1, 0);

            const firstDayLast = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const lastDayLast = new Date(now.getFullYear(), now.getMonth(), 0);

            const formatDate = (date) => date.toISOString().split('T')[0];

            const payload = {
                householdRefId: household.refId,
                from: formatDate(firstDayCurrent),
                to: formatDate(lastDayCurrent),
                compareFrom: formatDate(firstDayLast),
                compareTo: formatDate(lastDayLast)
            };

            try {
                const types = ['core', 'behavior', 'diagnostic', 'planning'];
                const results = await Promise.allSettled(
                    types.map(type => householdService.getHouseholdAnalytics(payload, type))
                );

                setAnalyticsData(prev => {
                    const nextData = { ...prev };
                    results.forEach((result, index) => {
                        if (result.status === 'fulfilled' && result.value?.data?.data) {
                            nextData[types[index]] = result.value.data.data;
                        } else if (result.status === 'fulfilled' && result.value?.data) {
                            nextData[types[index]] = result.value.data;
                        }
                    });
                    return nextData;
                });
            } catch (error) {
                console.error("Failed to fetch household analytics:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllAnalytics();
    }, [household?.refId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="animate-spin text-indigo-500 mb-4" size={48} />
                <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Generating Deep Insights...</p>
            </div>
        );
    }

    const { core, behavior, diagnostic, planning } = analyticsData;

    if (!core && !behavior && !diagnostic && !planning) {
        return (
            <div className="flex flex-col items-center justify-center py-24 bg-gray-50 dark:bg-gray-900/40 rounded-[3rem] border-4 border-dashed border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-amber-50 dark:bg-amber-900/20 rounded-3xl flex items-center justify-center text-amber-500 mb-6">
                    <BarChart3 size={40} />
                </div>
                <h2 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tight">Analytics Unavailable</h2>
                <p className="text-sm text-gray-400 font-bold mt-2 max-w-xs text-center">We couldn&apos;t retrieve enough historical data to generate insights for this household.</p>
            </div>
        );
    }

    const summary = core?.summary || behavior?.summary || diagnostic?.summary || planning?.summary;
    const runwayForecast = planning?.planning?.runwayForecast;
    const whatIfScenarios = planning?.planning?.whatIfScenarios;
    const goalTracking = planning?.planning?.goalTracking;
    const monthEndProjection = planning?.planning?.monthEndProjection;

    return (
        <div className="space-y-12 animate-in fade-in duration-500 pb-20">
            {/* KPI Summary Strip */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm group hover:scale-[1.02] transition-all">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Total Spent</p>
                    <h3 className="text-2xl font-black text-gray-800 dark:text-white">{currency} {Math.round(summary?.total || 0).toLocaleString()}</h3>
                    <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-tighter">Current Period</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm group hover:scale-[1.02] transition-all">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Average Daily</p>
                    <h3 className="text-2xl font-black text-indigo-600">{currency} {Math.round(summary?.averagePerDay || 0).toLocaleString()}</h3>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm group hover:scale-[1.02] transition-all">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Growth vs Prev</p>
                    <h3 className={`text-2xl font-black ${core?.comparison?.percentage > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {core?.comparison?.percentage > 0 ? '+' : ''}{Math.round(core?.comparison?.percentage || 0)}%
                    </h3>
                </div>
                <div className="bg-indigo-600 p-6 rounded-3xl text-white shadow-lg shadow-indigo-100 group hover:scale-[1.02] transition-all">
                    <p className="text-[10px] font-black text-indigo-100 uppercase tracking-[0.2em] mb-1">Projected Total</p>
                    <h3 className="text-2xl font-black">{currency} {Math.round(monthEndProjection?.projectedTotal || 0).toLocaleString()}</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Behavioral Insights */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Category Leakage */}
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm">
                        <h2 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tight mb-8 flex items-center gap-3">
                            <Zap size={24} className="text-amber-500" />
                            Spending Leakage
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {behavior?.behavior?.leakageCategories?.map((cat, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-50 dark:border-gray-800">
                                    <div>
                                        <p className="text-xs font-black text-gray-700 dark:text-white uppercase tracking-wider">{cat.category}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">{cat.count} Transactions</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-rose-500">{currency} {Math.round(cat.total).toLocaleString()}</p>
                                        <p className="text-[9px] text-gray-400 font-bold">AVG: {Math.round(cat.average)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Planning & Scenarios */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* What-If */}
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm">
                            <h2 className="text-lg font-black text-gray-800 dark:text-white uppercase tracking-tight mb-6 flex items-center gap-3">
                                <RefreshCcw size={20} className="text-indigo-500" />
                                What-If
                            </h2>
                            <div className="space-y-4">
                                {whatIfScenarios?.map((s, i) => (
                                    <div key={i} className="group">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{s.label}</span>
                                            <span className="text-[10px] font-black text-emerald-500">{currency} {Math.abs(s.delta).toLocaleString()} Save</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 group-hover:bg-emerald-400 transition-all duration-700" style={{ width: `${(s.adjustedTotal / (summary?.total || 1)) * 100}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Forecast */}
                        <div className="bg-indigo-900 p-8 rounded-[2.5rem] text-white shadow-xl">
                            <h2 className="text-lg font-black uppercase tracking-tight mb-6">Confidence</h2>
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between text-[10px] font-black text-indigo-300 uppercase mb-2">
                                        <span>Current Range</span>
                                        <span>± {Math.round((monthEndProjection?.upperBound - monthEndProjection?.lowerBound) / 2).toLocaleString()}</span>
                                    </div>
                                    <div className="relative h-6 bg-white/10 rounded-xl overflow-hidden flex items-center px-4">
                                        <div className="absolute inset-0 bg-indigo-500/20" style={{ left: '20%', right: '20%' }} />
                                        <span className="z-10 text-[10px] font-black">{currency} {Math.round(monthEndProjection?.projectedTotal || 0).toLocaleString()}</span>
                                    </div>
                                </div>
                                <p className="text-[10px] text-indigo-300 font-bold leading-relaxed">
                                    Projected total is based on <span className="text-white">{monthEndProjection?.basisDays}</span> days of data with <span className="text-white">AVG_DAILY</span> method.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Diagnostics & Budget */}
                <div className="space-y-8">
                    {/* Diagnostic Summary */}
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm">
                        <h2 className="text-lg font-black text-gray-800 dark:text-white uppercase tracking-tight mb-6 flex items-center gap-3">
                            <Activity size={20} className="text-rose-500" />
                            Diagnostics
                        </h2>
                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Peak Spending Day</p>
                                <p className="text-sm font-black text-gray-800 dark:text-white uppercase">{diagnostic?.diagnostic?.peakSpendDay?.date}</p>
                                <p className="text-xs font-bold text-rose-500">{currency} {Math.round(diagnostic?.diagnostic?.peakSpendDay?.total || 0).toLocaleString()}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl text-center">
                                    <p className="text-[9px] font-black text-gray-400 uppercase mb-1">UPI %</p>
                                    <p className="text-sm font-black text-indigo-600">
                                        {Math.round(diagnostic?.diagnostic?.cashVsCard?.find(m => m.mode === 'UPI')?.percentage || 0)}%
                                    </p>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl text-center">
                                    <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Cash %</p>
                                    <p className="text-sm font-black text-amber-600">
                                        {Math.round(diagnostic?.diagnostic?.cashVsCard?.find(m => m.mode === 'CASH')?.percentage || 0)}%
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Member Breakdown */}
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm">
                        <h2 className="text-lg font-black text-gray-800 dark:text-white uppercase tracking-tight mb-6 flex items-center gap-3">
                            <Users size={20} className="text-indigo-500" />
                            Member Stats
                        </h2>
                        <div className="space-y-4">
                            {core?.members?.map((m, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/40 rounded-full flex items-center justify-center text-indigo-600 font-black text-xs">
                                        {m.key.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[10px] font-black text-gray-700 dark:text-white uppercase truncate max-w-[80px]">{m.key}</span>
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{Math.round(m.percentage)}%</span>
                                        </div>
                                        <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-indigo-500" style={{ width: `${m.percentage}%` }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Trends Section */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <h2 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tight mb-8 flex items-center gap-3">
                    <TrendingUp size={24} className="text-indigo-500" />
                    Daily Trend Analysis
                </h2>
                <div className="flex items-end gap-1 h-32 md:h-48 group">
                    {core?.dailyTrend?.map((d, i) => {
                        const max = Math.max(...core.dailyTrend.map(t => t.total));
                        const height = (d.total / max) * 100;
                        return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                <div
                                    className="w-full bg-indigo-100 dark:bg-indigo-900/30 rounded-t-lg hover:bg-indigo-500 transition-all cursor-crosshair relative group/bar"
                                    style={{ height: `${height}%` }}
                                >
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[8px] font-black px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 pointer-events-none whitespace-nowrap z-20">
                                        {currency} {Math.round(d.total)}
                                    </div>
                                </div>
                                <span className="text-[6px] md:text-[8px] font-black text-gray-400 rotate-45 md:rotate-0">{d.period.split('-').slice(1).join('/')}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const MembersTab = ({ members, household, onInviteClick }) => {
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const currency = household?.currency || 'INR';

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    const analyticsData = useMemo(() => {
        const expenses = household?.allExpenses || household?.expenses || [];

        // 1. Filter by selected period
        const periodExpenses = expenses.filter(exp => {
            if (!exp.expenseDate) return false;
            let m, y;
            if (Array.isArray(exp.expenseDate)) {
                y = exp.expenseDate[0];
                m = exp.expenseDate[1];
            } else {
                const d = new Date(exp.expenseDate);
                y = d.getFullYear();
                m = d.getMonth() + 1;
            }
            return m === parseInt(selectedMonth) && y === parseInt(selectedYear);
        });

        // 2. Aggregate by Member
        const memberAggregation = {};
        // Initialize for all active members
        members?.forEach(m => {
            memberAggregation[m.user] = {
                totalSpent: 0,
                categories: {},
                transactionCount: 0
            };
        });

        periodExpenses.forEach(exp => {
            const owner = exp.owner || "Unknown";
            if (!memberAggregation[owner]) {
                memberAggregation[owner] = { totalSpent: 0, categories: {}, transactionCount: 0 };
            }

            memberAggregation[owner].totalSpent += (Number(exp.amount) || 0);
            memberAggregation[owner].transactionCount += 1;

            const cat = exp.category || "Uncategorized";
            memberAggregation[owner].categories[cat] = (memberAggregation[owner].categories[cat] || 0) + (Number(exp.amount) || 0);
        });

        return {
            memberStats: Object.entries(memberAggregation).map(([user, stats]) => ({
                user,
                ...stats,
                topCategory: Object.entries(stats.categories).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
            })).sort((a, b) => b.totalSpent - a.totalSpent),
            totalPeriodSpent: periodExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
        };
    }, [household?.allExpenses, household?.expenses, members, selectedMonth, selectedYear]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Analytics Header & Controls */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <TrendingUp size={20} className="text-indigo-600" />
                            <h2 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tight">Financial Footprint</h2>
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Member-wise spending analysis</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative">
                            <Calendar size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="bg-gray-50 dark:bg-gray-900/50 border-none rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none"
                            >
                                {months.map((m, i) => (
                                    <option key={m} value={i + 1}>{m}</option>
                                ))}
                            </select>
                        </div>
                        <div className="relative">
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                className="bg-gray-50 dark:bg-gray-900/50 border-none rounded-xl px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none"
                            >
                                {years.map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Member Analytics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {analyticsData.memberStats.map((stat, i) => (
                        <div key={stat.user} className="p-6 bg-gray-50 dark:bg-gray-900/30 rounded-3xl border border-gray-100 dark:border-gray-800 group hover:border-indigo-200 dark:hover:border-indigo-900/40 transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black text-sm uppercase">
                                        {stat.user[0]}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-gray-800 dark:text-white truncate max-w-[120px]">{stat.user}</p>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{stat.transactionCount} Transactions</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black text-indigo-600 uppercase tracking-tighter">
                                        {analyticsData.totalPeriodSpent > 0 ? Math.round((stat.totalSpent / analyticsData.totalPeriodSpent) * 100) : 0}% share
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Spent</span>
                                    <span className="text-lg font-black text-gray-900 dark:text-white">{currency} {stat.totalSpent.toLocaleString()}</span>
                                </div>
                                <div className="w-full h-1.5 bg-white dark:bg-gray-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${analyticsData.totalPeriodSpent > 0 ? (stat.totalSpent / analyticsData.totalPeriodSpent) * 100 : 0}%` }} />
                                </div>

                                <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-2">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Category Breakdown</p>
                                    <div className="grid grid-cols-1 gap-1.5">
                                        {Object.entries(stat.categories).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([cat, amount]) => (
                                            <div key={cat} className="flex flex-col gap-0.5">
                                                <div className="flex justify-between text-[10px] font-bold">
                                                    <span className="text-gray-500 truncate max-w-[100px]">{cat}</span>
                                                    <span className="text-gray-700 dark:text-gray-300">{currency} {amount.toLocaleString()}</span>
                                                </div>
                                                <div className="w-full h-1 bg-white dark:bg-gray-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-indigo-400/50 rounded-full" style={{ width: `${(amount / (stat.totalSpent || 1)) * 100}%` }} />
                                                </div>
                                            </div>
                                        ))}
                                        {Object.keys(stat.categories).length === 0 && <p className="text-[10px] text-gray-300 uppercase py-1 italic">No transactions</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {analyticsData.memberStats.length === 0 && (
                        <div className="col-span-full py-12 text-center text-gray-300 dark:text-gray-700 font-bold uppercase text-xs tracking-[.25em]">
                            No spending data for this period
                        </div>
                    )}
                </div>
            </div>

            {/* Standard Member List */}
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Users size={20} className="text-indigo-600" />
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Household Members</h2>
                    </div>
                    <button
                        onClick={onInviteClick}
                        className="flex items-center justify-center gap-2 text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-6 py-3 rounded-2xl font-bold text-sm hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all w-full sm:w-auto shadow-sm shadow-indigo-100/50 dark:shadow-none"
                    >
                        <Plus size={18} /> Invite Member
                    </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {members?.map((member) => (
                        <div key={member.uuid} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4 relative group hover:shadow-md transition-all">
                            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-tr from-indigo-50 to-white dark:from-gray-700 dark:to-gray-800 border border-gray-100 dark:border-gray-600 flex items-center justify-center text-indigo-600 font-black text-xl">
                                {member.user[0].toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-gray-800 dark:text-white truncate">{member.user}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${member.role === 'ADMIN' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30' : 'bg-gray-50 text-gray-500 dark:bg-gray-700'}`}>
                                        {member.role}
                                    </span>
                                    <span className="text-[9px] text-green-500 font-bold flex items-center gap-1">
                                        <CheckCircle2 size={10} /> Active
                                    </span>
                                </div>
                                <p className="text-[9px] text-gray-400 font-bold mt-1 uppercase">Joined: {formatDate(member.joiningDate)}</p>
                            </div>
                            <button className="absolute top-4 right-4 text-gray-300 hover:text-gray-600 transition-colors">
                                <MoreHorizontal size={20} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const DepositsTab = ({ deposits, onAddClick, onEditClick, onDeleteClick, selectedDeposits, setSelectedDeposits }) => {
    const isAllSelected = deposits?.length > 0 && selectedDeposits.length === deposits.length;

    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedDeposits([]);
        } else {
            setSelectedDeposits(deposits || []);
        }
    };

    const toggleSelectOne = (deposit) => {
        const isSelected = selectedDeposits.some(d => d.refId === deposit.refId);
        if (isSelected) {
            setSelectedDeposits(selectedDeposits.filter(d => d.refId !== deposit.refId));
        } else {
            setSelectedDeposits([...selectedDeposits, deposit]);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-widest flex items-center gap-3">
                        <TrendingUp size={24} className="text-emerald-500" />
                        Deposits Ledger
                    </h2>
                    <p className="text-gray-400 dark:text-gray-500 font-bold text-xs uppercase tracking-widest mt-1">History of funds added to this household</p>
                </div>
                <div className="flex gap-4">
                    {selectedDeposits.length > 0 && (
                        <button
                            onClick={() => onDeleteClick(null)} // null triggers bulk delete in state logic
                            className="flex items-center gap-2 bg-rose-50 text-rose-600 hover:bg-rose-100 px-6 py-3 rounded-xl font-bold transition-all active:scale-95 text-sm border border-rose-200"
                        >
                            <Trash2 size={20} /> Delete ({selectedDeposits.length})
                        </button>
                    )}
                    <button
                        onClick={onAddClick}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-100 dark:shadow-none transition-all active:scale-95 text-sm"
                    >
                        <Plus size={20} /> Add Deposit
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[1000px]">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
                                <th className="px-6 py-6 w-16">
                                    <div className="flex items-center justify-center">
                                        <input
                                            type="checkbox"
                                            checked={isAllSelected}
                                            onChange={toggleSelectAll}
                                            className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                        />
                                    </div>
                                </th>
                                <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Date</th>
                                <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Source</th>
                                <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Added By</th>
                                <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Notes</th>
                                <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Amount</th>
                                <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                            {deposits && deposits.length > 0 ? (
                                [...deposits].sort((a, b) => {
                                    const dateA = Array.isArray(a.depositDate) ? new Date(a.depositDate[0], a.depositDate[1] - 1, a.depositDate[2]) : new Date(a.depositDate);
                                    const dateB = Array.isArray(b.depositDate) ? new Date(b.depositDate[0], b.depositDate[1] - 1, b.depositDate[2]) : new Date(b.depositDate);
                                    return dateB - dateA;
                                }).map((deposit, idx) => {
                                    const isSelected = selectedDeposits.some(d => d.refId === deposit.refId);
                                    return (
                                        <tr key={deposit.uuid || idx} className={`${isSelected ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : 'hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10'} transition-colors group`}>
                                            <td className="px-6 py-7">
                                                <div className="flex items-center justify-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => toggleSelectOne(deposit)}
                                                        className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-8 py-7">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-gray-800 dark:text-white">
                                                        {Array.isArray(deposit.depositDate) ? deposit.depositDate[2] : new Date(deposit.depositDate).getDate()}
                                                    </span>
                                                    <span className="text-[10px] font-black text-gray-400 uppercase">
                                                        {Array.isArray(deposit.depositDate)
                                                            ? new Date(deposit.depositDate[0], deposit.depositDate[1] - 1).toLocaleString('default', { month: 'short' }) + ', ' + deposit.depositDate[0]
                                                            : new Date(deposit.depositDate).toLocaleString('default', { month: 'short' }) + ', ' + new Date(deposit.depositDate).getFullYear()}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-7">
                                                <p className="font-bold text-gray-800 dark:text-white">{deposit.source}</p>
                                            </td>
                                            <td className="px-8 py-7">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-[10px] font-black text-emerald-600">
                                                        {deposit.username?.[0]?.toUpperCase() || "U"}
                                                    </div>
                                                    <span className="text-[11px] text-gray-500 font-black uppercase tracking-tight">{deposit.username || "Unknown"}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-7">
                                                <p className="text-xs font-bold text-gray-400 line-clamp-1">{deposit.notes || "-"}</p>
                                            </td>
                                            <td className="px-8 py-7 text-right">
                                                <p className="text-lg font-black text-emerald-600">+₹{(deposit.amount || 0).toLocaleString()}</p>
                                            </td>
                                            <td className="px-8 py-7">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                    <button
                                                        onClick={() => onEditClick(deposit)}
                                                        className="p-2.5 bg-white dark:bg-gray-800 text-gray-400 hover:text-amber-500 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:scale-110 transition-all"
                                                    >
                                                        <Edit3 size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedDeposits([]); // Clear bulk selection if deleting single
                                                            onDeleteClick(deposit);
                                                        }}
                                                        className="p-2.5 bg-white dark:bg-gray-800 text-gray-400 hover:text-rose-500 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:scale-110 transition-all"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-8 py-24 text-center">
                                        <div className="flex flex-col items-center gap-4 text-gray-300">
                                            <TrendingUp size={48} />
                                            <p className="font-black uppercase tracking-widest text-xs">No deposits recorded yet</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const BudgetsTab = ({ budgets, household, onAddClick, onEditClick, onDeleteClick }) => {
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const currency = household?.currency || 'INR';

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    // Map spend and filter budgets from allExpenses
    const enrichedBudgets = useMemo(() => {
        const expenses = household?.allExpenses || household?.expenses || [];

        // 1. Filter budgets that match the selected period
        const filteredBudgets = (budgets || []).filter(budget => {
            if (!budget.budgetDate) return false;
            let m, y;
            if (Array.isArray(budget.budgetDate)) {
                y = budget.budgetDate[0];
                m = budget.budgetDate[1];
            } else {
                const d = new Date(budget.budgetDate);
                y = d.getFullYear();
                m = d.getMonth() + 1;
            }
            return m === parseInt(selectedMonth) && y === parseInt(selectedYear);
        });

        // 2. Map spend to these filtered budgets
        return filteredBudgets.map(budget => {
            const monthlySpend = expenses.reduce((sum, exp) => {
                let m, y;
                if (Array.isArray(exp.expenseDate)) {
                    y = exp.expenseDate[0];
                    m = exp.expenseDate[1];
                } else {
                    const d = new Date(exp.expenseDate);
                    y = d.getFullYear();
                    m = d.getMonth() + 1;
                }

                // Match category and user-selected period
                if (m === parseInt(selectedMonth) && y === parseInt(selectedYear) && exp.category === budget.category) {
                    return sum + (Number(exp.amount) || 0);
                }
                return sum;
            }, 0);

            return { ...budget, spent: monthlySpend };
        });
    }, [budgets, household?.allExpenses, household?.expenses, selectedMonth, selectedYear]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Category Budgets</h2>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Target vs. Actual Spending</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900/50 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700">
                        <Calendar size={14} className="ml-2 text-gray-400" />
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="bg-transparent border-none text-xs font-bold uppercase text-gray-600 dark:text-gray-300 outline-none focus:ring-0"
                        >
                            {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                        </select>
                        <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1" />
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="bg-transparent border-none text-xs font-bold uppercase text-gray-600 dark:text-gray-300 outline-none focus:ring-0 mr-2"
                        >
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>

                    <button
                        onClick={onAddClick}
                        className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all w-full sm:w-auto"
                    >
                        <Plus size={18} /> Add Budget
                    </button>
                </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm overflow-x-auto">
                {enrichedBudgets?.length > 0 ? (
                    <table className="w-full text-left min-w-[700px]">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-900/50 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">
                                <th className="px-8 py-5">Category</th>
                                <th className="px-8 py-5">Monthly Target</th>
                                <th className="px-8 py-5">Current Spend</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                            {enrichedBudgets.map((budget) => {
                                const progress = (budget.amount || 0) > 0 ? ((budget.spent || 0) / budget.amount) * 100 : 0;
                                return (
                                    <tr key={budget.uuid} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors group">
                                        <td className="px-8 py-6 font-bold text-gray-800 dark:text-white">{budget.category}</td>
                                        <td className="px-8 py-6 font-bold text-gray-600 dark:text-gray-400">{currency} {(budget.amount || 0).toLocaleString()}</td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex justify-between text-[10px] font-black uppercase text-gray-400">
                                                    <span>{currency} {(budget.spent || 0).toLocaleString()}</span>
                                                    <span>{Math.round(progress)}%</span>
                                                </div>
                                                <div className="w-32 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${progress > 90 ? 'bg-rose-500' : 'bg-indigo-500'}`}
                                                        style={{ width: `${Math.min(progress, 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md ${progress < 90 ? 'bg-green-50 text-green-600' : 'bg-rose-50 text-rose-600'}`}>
                                                {progress < 90 ? 'Good' : 'At Risk'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => onEditClick(budget)}
                                                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                >
                                                    <Edit3 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => onDeleteClick(budget)}
                                                    className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
                    <div className="p-20 text-center flex flex-col items-center justify-center">
                        <TrendingUp size={48} className="text-gray-100 dark:text-gray-800 mb-4" />
                        <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">No active budgets for this household.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const LogsTab = ({ expenses, currency, onEditClick, onDeleteClick }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [sortConfig, setSortConfig] = useState({ key: 'expenseDate', direction: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Get unique categories for filter
    const categories = Array.from(new Set(expenses?.map(e => e.category))).filter(Boolean);

    // Filtering logic (client-side for design demonstration)
    const filteredExpenses = (expenses || []).filter(expense => {
        const matchesSearch = expense.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            expense.category?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === "all" || expense.category === categoryFilter;
        const matchesType = typeFilter === "all" || expense.type === typeFilter;
        return matchesSearch && matchesCategory && matchesType;
    });

    // Sorting logic
    const sortedExpenses = [...filteredExpenses].sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        // Handle dates
        if (sortConfig.key === 'expenseDate') {
            valA = new Date(Array.isArray(valA) ? `${valA[0]}-${valA[1]}-${valA[2]}` : valA);
            valB = new Date(Array.isArray(valB) ? `${valB[0]}-${valB[1]}-${valB[2]}` : valB);
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    // Pagination logic
    const totalPages = Math.ceil(sortedExpenses.length / itemsPerPage);
    const paginatedExpenses = sortedExpenses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const SortIcon = ({ column }) => {
        if (sortConfig.key !== column) return <MoreHorizontal size={12} className="ml-1 opacity-20" />;
        return sortConfig.direction === 'asc' ? <ArrowUpRight size={12} className="ml-1" /> : <ArrowDownLeft size={12} className="ml-1" />;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Advanced Filter Toolbar */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Search descriptions or categories..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
                        />
                        <MoreHorizontal className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 rotate-90" size={20} />
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <select
                            value={categoryFilter}
                            onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                            className="bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500 focus:ring-2 focus:ring-indigo-500/20 cursor-pointer shadow-sm"
                        >
                            <option value="all">Every Category</option>
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                        <select
                            value={typeFilter}
                            onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
                            className="bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500 focus:ring-2 focus:ring-indigo-500/20 cursor-pointer shadow-sm"
                        >
                            <option value="all">Any Type</option>
                            <option value="ONE_TIME">One-time</option>
                            <option value="RECURRING">Recurring</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    {paginatedExpenses.length > 0 ? (
                        <table className="w-full text-left min-w-[900px]">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-900/50 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 dark:border-gray-700">
                                    <th className="px-8 py-6 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => handleSort('expenseDate')}>
                                        <div className="flex items-center">Date <SortIcon column="expenseDate" /></div>
                                    </th>
                                    <th className="px-8 py-6">Description</th>
                                    <th className="px-8 py-6 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => handleSort('category')}>
                                        <div className="flex items-center">Category <SortIcon column="category" /></div>
                                    </th>
                                    <th className="px-8 py-6">Owner</th>
                                    <th className="px-8 py-6">Payment Mode</th>
                                    <th className="px-8 py-6 text-right cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => handleSort('amount')}>
                                        <div className="flex items-center justify-end">Amount <SortIcon column="amount" /></div>
                                    </th>
                                    <th className="px-8 py-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                {paginatedExpenses.map((expense) => (
                                    <tr key={expense.uuid} className="hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-all group">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm text-gray-800 dark:text-white font-black">{formatDate(expense.expenseDate)}</span>
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Confirmed</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="max-w-[200px]">
                                                <p className="font-black text-gray-800 dark:text-white truncate">{expense.description}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${expense.type === 'RECURRING' ? 'bg-indigo-500' : 'bg-amber-500'}`} />
                                                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">{expense.type}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300">
                                                {expense.category}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-[10px] font-black text-indigo-600">
                                                    {expense.owner?.[0]?.toUpperCase()}
                                                </div>
                                                <span className="text-[11px] text-gray-500 font-black uppercase tracking-tight">{expense.owner}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-[10px] font-black text-indigo-600">
                                                    {expense.paymentMode?.[0]?.toUpperCase()}
                                                </div>
                                                <span className="text-[11px] text-gray-500 font-black uppercase tracking-tight">{expense.paymentMode}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <span className="font-black text-rose-600 text-lg">-{currency} {(expense.amount || 0).toLocaleString()}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                <button
                                                    onClick={() => onEditClick(expense)}
                                                    className="p-2.5 bg-white dark:bg-gray-800 text-gray-400 hover:text-amber-500 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:scale-110 transition-all"
                                                >
                                                    <Edit3 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => onDeleteClick(expense)}
                                                    className="p-2.5 bg-white dark:bg-gray-800 text-gray-400 hover:text-rose-500 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:scale-110 transition-all"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-32 text-center flex flex-col items-center justify-center">
                            <div className="w-24 h-24 bg-gray-50 dark:bg-gray-900 rounded-[2rem] flex items-center justify-center text-gray-200 dark:text-gray-800 mb-6">
                                <History size={48} />
                            </div>
                            <h3 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tight">No Transactions Found</h3>
                            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-2 max-w-[240px]">Try adjusting your filters or search query to find what you&apos;re looking for.</p>
                        </div>
                    )}
                </div>

                {/* Pagination Footer */}
                {totalPages > 1 && (
                    <div className="px-8 py-6 bg-gray-50/50 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                Page {currentPage} of {totalPages}
                            </span>
                            <div className="flex gap-1">
                                {Array.from({ length: totalPages }).map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-8 h-8 rounded-xl text-[10px] font-black transition-all ${currentPage === i + 1
                                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                                            : "text-gray-400 hover:bg-white dark:hover:bg-gray-800"
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => prev - 1)}
                                className="px-6 py-3 bg-white dark:bg-gray-800 text-[10px] font-black uppercase tracking-widest text-gray-500 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
                            >
                                Previous
                            </button>
                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                className="px-6 py-3 bg-indigo-600 text-[10px] font-black uppercase tracking-widest text-white rounded-xl shadow-md shadow-indigo-100 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-indigo-700 transition-all"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const HouseholdDetailsLogic = () => {
    const router = useRouter();
    const { id } = router.query;
    const [household, setHousehold] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("overview");
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
    const [isEditBudgetModalOpen, setIsEditBudgetModalOpen] = useState(false);
    const [isDeleteBudgetModalOpen, setIsDeleteBudgetModalOpen] = useState(false);
    const [isEditExpenseModalOpen, setIsEditExpenseModalOpen] = useState(false);
    const [isDeleteExpenseModalOpen, setIsDeleteExpenseModalOpen] = useState(false);
    const [isEditDepositModalOpen, setIsEditDepositModalOpen] = useState(false);
    const [isDeleteDepositModalOpen, setIsDeleteDepositModalOpen] = useState(false);
    const [editingBudget, setEditingBudget] = useState(null);
    const [editingExpense, setEditingExpense] = useState(null);
    const [editingDeposit, setEditingDeposit] = useState(null);
    const [selectedDeposits, setSelectedDeposits] = useState([]);

    const handleEditBudget = (budget) => {
        setEditingBudget(budget);
        setIsEditBudgetModalOpen(true);
    };

    const handleDeleteBudget = (budget) => {
        setEditingBudget(budget); // Reusing state for the budget object
        setIsDeleteBudgetModalOpen(true);
    };

    const handleEditExpense = (expense) => {
        setEditingExpense(expense);
        setIsEditExpenseModalOpen(true);
    };

    const handleDeleteExpense = (expense) => {
        setEditingExpense(expense);
        setIsDeleteExpenseModalOpen(true);
    };

    const handleEditDeposit = (deposit) => {
        setEditingDeposit(deposit);
        setIsEditDepositModalOpen(true);
    };

    const handleDeleteDeposit = (deposit) => {
        setEditingDeposit(deposit);
        setIsDeleteDepositModalOpen(true);
    };

    const fetchHouseholdDetails = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        setError("");
        try {
            // Fetch all categories once for mapping names to IDs
            const catResponse = await categoryService.searchCategories({});
            const categoryMap = {};
            if (catResponse?.data && Array.isArray(catResponse.data)) {
                catResponse.data.forEach(cat => {
                    const name = String(cat.name || "").trim();
                    if (!name) return;
                    // Map all common ID fields to the name
                    [cat.refId, cat.uuid, cat.id, cat.categoryRefId].forEach(id => {
                        if (id) categoryMap[String(id).trim()] = name;
                    });
                    categoryMap[name] = name;
                });
                console.log(`[Diagnostic] Category Lookup Map Populated with ${Object.keys(categoryMap).length} keys`);
            }

            const response = await householdService.getHousehold(id);
            console.log("[Diagnostic] getHousehold response:", response);

            // Handle both array and single object responses
            let data = null;
            if (response?.data) {
                if (Array.isArray(response.data)) {
                    data = response.data.length > 0 ? response.data[0] : null;
                } else {
                    data = response.data;
                }
            }

            if (data) {
                console.log("[Diagnostic] Raw Household Data:", data);

                // Final Fallback: Resolve missing categories individually via GET API
                const missingIds = new Set();
                const scanItemsForMissingIds = (items) => {
                    items?.forEach(item => {
                        // Scan ALL properties for anything that looks like a RefID/UUID
                        for (const key in item) {
                            const val = item[key];
                            if (val && typeof val !== 'object') {
                                const sid = String(val).trim();
                                // Pattern: Numeric RefIDs (long) or UUIDs (hex with dashes)
                                const isLongNumeric = sid.length >= 10 && /^\d+$/.test(sid);
                                const isUuid = sid.length >= 32 && /^[a-fA-F0-9-]+$/.test(sid);

                                if (isLongNumeric && !categoryMap[sid]) {
                                    missingIds.add(sid);
                                }
                            }
                        }
                    });
                };
                scanItemsForMissingIds(data.budgets);
                scanItemsForMissingIds(data.expenses);

                if (missingIds.size > 0) {
                    console.log(`[Diagnostic] Triggering individual resolution for ${missingIds.size} missing categories:`, Array.from(missingIds));
                    await Promise.all(Array.from(missingIds).map(async (refId) => {
                        try {
                            const res = await categoryService.getCategory(refId);
                            if (res?.data?.name) {
                                categoryMap[refId] = res.data.name;
                                if (res.data.uuid) categoryMap[res.data.uuid] = res.data.name;
                                if (res.data.refId) categoryMap[res.data.refId] = res.data.name;
                                console.log(`[SUCCESS] Category Resolved: ${refId} -> ${res.data.name}`);
                            }
                        } catch (e) {
                            console.warn(`[FAILURE] Category Fallback Failed for ID: ${refId}`);
                        }
                    }));
                }

                const resolveNames = (items, type) => {
                    if (!items || !Array.isArray(items)) return [];
                    return items.map(item => {
                        let resolvedCategory = null;

                        // Universal search in all properties for a known name in categoryMap
                        for (const key in item) {
                            const val = item[key];
                            if (val) {
                                const sid = String(typeof val === 'object' ? (val.refId || val.uuid || val.id || "") : val).trim();
                                if (categoryMap[sid]) { resolvedCategory = categoryMap[sid]; break; }
                            }
                        }

                        const currentVal = String(item.category || "").trim();
                        const isPlaceholder = !currentVal || ["unknown", "null", "undefined", ""].includes(currentVal.toLowerCase());

                        if (!resolvedCategory && isPlaceholder) {
                            console.warn(`[Diagnostic] Could not resolve ${type} category.`, {
                                item,
                                checkedKeys: Object.keys(item),
                                availableMapKeys: Object.keys(categoryMap).length
                            });
                        }

                        return {
                            ...item,
                            category: resolvedCategory || (isPlaceholder ? "Unknown" : currentVal)
                        };
                    });
                };

                if (data.budgets) data.budgets = resolveNames(data.budgets, "Budget");
                if (data.expenses) data.expenses = resolveNames(data.expenses, "Expense");

                // FETCH FULL BUDGETS FOR ACCURACY
                try {
                    const budgetResponse = await householdService.searchBudgets({
                        householdRefId: data.refId
                    });
                    if (budgetResponse?.data) {
                        data.budgets = resolveNames(budgetResponse.data, "AllBudget");
                        console.log(`[Diagnostic] Fetched ${data.budgets.length} total budgets via Search API.`);
                    }
                } catch (e) {
                    console.warn("[Diagnostic] Failed to fetch budgets via Search API:", e);
                }

                // FETCH FULL EXPENSES FOR ANALYTICS
                try {
                    const expResponse = await householdService.searchExpenses({
                        householdRefId: data.refId
                    });
                    if (expResponse?.data) {
                        data.allExpenses = resolveNames(expResponse.data, "AllExpense");
                        console.log(`[Diagnostic] Fetched ${data.allExpenses.length} total expenses for analytics.`);
                    }
                } catch (e) {
                    console.warn("[Diagnostic] Failed to fetch full expenses for analytics:", e);
                }

                // FETCH DEPOSITS
                try {
                    const depositResponse = await householdService.searchDeposits({
                        householdRefId: data.refId
                    });
                    if (depositResponse?.data) {
                        data.deposits = depositResponse.data;
                        console.log(`[Diagnostic] Fetched ${data.deposits.length} deposits.`);
                    }
                } catch (e) {
                    console.warn("[Diagnostic] Failed to fetch deposits:", e);
                }

                setHousehold(data);
            } else {
                setError("Household not found.");
            }
        } catch (err) {
            console.error("Failed to fetch household details:", err);
            setError("Unable to load household details.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchHouseholdDetails();
    }, [fetchHouseholdDetails]);

    if (loading) return (
        <div className="h-[60vh] flex flex-col items-center justify-center text-indigo-600">
            <Loader2 className="animate-spin mb-4" size={48} />
            <p className="font-black uppercase tracking-widest text-xs">Loading Secure Space...</p>
        </div>
    );

    if (error || !household) return (
        <div className="h-[60vh] flex flex-col items-center justify-center text-center p-8 bg-gray-50 dark:bg-gray-800/50 rounded-[3rem] border-4 border-dashed border-gray-100 dark:border-gray-800">
            <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/20 rounded-3xl flex items-center justify-center text-rose-500 mb-6">
                <X size={40} />
            </div>
            <h2 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-tight">{error || "Something went wrong"}</h2>
            <button onClick={() => router.back()} className="mt-8 text-indigo-600 font-black uppercase text-xs tracking-widest hover:underline flex items-center gap-2">
                <ArrowDownLeft size={16} /> Go Back
            </button>
        </div>
    );

    const tabs = [
        { id: "overview", label: "Overview", icon: BarChart3 },
        { id: "analytics", label: "Analytics", icon: TrendingUp },
        { id: "deposits", label: "Deposits", icon: TrendingUp },
        { id: "members", label: "Members", icon: Users },
        { id: "budgets", label: "Budgets", icon: TrendingUp },
        { id: "logs", label: "Logs", icon: History },
    ];

    return (
        <div className="space-y-8 pb-12">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 md:w-16 md:h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100 shrink-0">
                        <Home size={28} />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase truncate">{household.name}</h1>
                        <p className="text-gray-400 dark:text-gray-500 font-bold uppercase text-[9px] md:text-[10px] tracking-widest flex flex-wrap items-center gap-x-2 mt-1">
                            Ref: {household.refId} <span className="hidden md:inline text-gray-200">|</span>
                            {household.currency} <span className="hidden md:inline text-gray-200">|</span>
                            {household.status}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button className="flex-1 md:flex-none p-3 text-gray-400 hover:text-indigo-600 hover:bg-gray-50 rounded-xl transition-all border border-gray-100 md:border-none flex justify-center items-center">
                        <Settings size={22} />
                    </button>
                    <button
                        onClick={() => setIsExpenseModalOpen(true)}
                        className="flex-[3] md:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 dark:shadow-none transition-all active:scale-95"
                    >
                        <Plus size={20} /> New Expense
                    </button>
                </div>
            </div>

            {/* Custom Tab Bar */}
            <div className="overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 md:mx-0 md:px-0">
                <div className="flex items-center gap-2 bg-gray-100/50 dark:bg-gray-800/50 p-1.5 rounded-2xl w-max border border-gray-200/50 dark:border-gray-700">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs md:text-sm font-bold transition-all duration-300 whitespace-nowrap ${isActive
                                    ? "bg-white dark:bg-700 text-indigo-600 shadow-sm dark:shadow-none translate-y-0"
                                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    }`}
                            >
                                <Icon size={18} className={isActive ? "text-indigo-600" : "text-gray-400"} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab Content */}
            <div className="mt-4">
                {activeTab === "overview" && <OverviewTab household={household} />}
                {activeTab === "analytics" && <AnalyticsTab household={household} />}
                {activeTab === "deposits" && (
                    <DepositsTab
                        deposits={household.deposits}
                        onAddClick={() => setIsDepositModalOpen(true)}
                        onEditClick={handleEditDeposit}
                        onDeleteClick={handleDeleteDeposit}
                        selectedDeposits={selectedDeposits}
                        setSelectedDeposits={setSelectedDeposits}
                    />
                )}
                {activeTab === "members" && (
                    <MembersTab
                        members={household.members}
                        household={household}
                        onInviteClick={() => setIsInviteModalOpen(true)}
                    />
                )}
                {activeTab === "budgets" && (
                    <BudgetsTab
                        budgets={household.budgets}
                        household={household}
                        onAddClick={() => setIsBudgetModalOpen(true)}
                        onEditClick={handleEditBudget}
                        onDeleteClick={handleDeleteBudget}
                    />
                )}
                {activeTab === "logs" && (
                    <LogsTab
                        expenses={household.expenses}
                        currency={household.currency}
                        onEditClick={handleEditExpense}
                        onDeleteClick={handleDeleteExpense}
                    />
                )}
            </div>

            <InviteMemberModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                onSuccess={fetchHouseholdDetails}
                householdRefId={id}
            />

            <AddBudgetModal
                isOpen={isBudgetModalOpen}
                onClose={() => setIsBudgetModalOpen(false)}
                onSuccess={fetchHouseholdDetails}
                householdRefId={id}
            />

            <AddExpenseModal
                isOpen={isExpenseModalOpen}
                onClose={() => setIsExpenseModalOpen(false)}
                onSuccess={fetchHouseholdDetails}
                householdRefId={id}
            />

            <EditBudgetModal
                isOpen={isEditBudgetModalOpen}
                onClose={() => setIsEditBudgetModalOpen(false)}
                onSuccess={fetchHouseholdDetails}
                budget={editingBudget}
                householdRefId={id}
            />

            <DeleteBudgetModal
                isOpen={isDeleteBudgetModalOpen}
                onClose={() => setIsDeleteBudgetModalOpen(false)}
                onSuccess={fetchHouseholdDetails}
                budget={editingBudget}
            />

            <EditExpenseModal
                isOpen={isEditExpenseModalOpen}
                onClose={() => setIsEditExpenseModalOpen(false)}
                onSuccess={fetchHouseholdDetails}
                expense={editingExpense}
                householdRefId={id}
            />

            <DeleteExpenseModal
                isOpen={isDeleteExpenseModalOpen}
                onClose={() => setIsDeleteExpenseModalOpen(false)}
                onSuccess={fetchHouseholdDetails}
                expense={editingExpense}
            />

            <AddDepositModal
                isOpen={isDepositModalOpen}
                onClose={() => setIsDepositModalOpen(false)}
                onSuccess={fetchHouseholdDetails}
                householdRefId={id}
            />

            <EditDepositModal
                isOpen={isEditDepositModalOpen}
                onClose={() => setIsEditDepositModalOpen(false)}
                onSuccess={fetchHouseholdDetails}
                deposit={editingDeposit}
            />

            <DeleteDepositModal
                isOpen={isDeleteDepositModalOpen}
                onClose={() => setIsDeleteDepositModalOpen(false)}
                onSuccess={fetchHouseholdDetails}
                deposits={selectedDeposits.length > 0 ? selectedDeposits : (editingDeposit ? [editingDeposit] : [])}
            />
        </div>
    );
};

const EditDepositModal = ({ isOpen, onClose, onSuccess, deposit }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        amount: "",
        depositDate: "",
        source: "",
        notes: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (deposit) {
            setFormData({
                amount: deposit.amount || "",
                depositDate: Array.isArray(deposit.depositDate)
                    ? `${deposit.depositDate[0]}-${String(deposit.depositDate[1]).padStart(2, '0')}-${String(deposit.depositDate[2]).padStart(2, '0')}`
                    : (deposit.depositDate || ""),
                source: deposit.source || "",
                notes: deposit.notes || ""
            });
        }
    }, [deposit, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        const payload = [
            {
                refId: deposit.refId,
                username: user?.username || deposit.username || "unknown",
                amount: parseFloat(formData.amount),
                depositDate: formData.depositDate,
                source: formData.source,
                notes: formData.notes
            }
        ];

        try {
            await householdService.updateDeposit(payload);
            onSuccess();
            onClose();
        } catch (err) {
            console.error("Failed to update deposit:", err);
            setError("Failed to update deposit. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="bg-amber-600 p-8 text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-xl transition-colors"
                    >
                        <X size={20} />
                    </button>
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md border border-white/30">
                        <Edit3 size={32} />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight uppercase">Edit Deposit</h2>
                    <p className="text-amber-100 text-sm font-medium mt-1">Update deposit details.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-5 bg-gray-50 dark:bg-gray-900/50">
                    {error && (
                        <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 p-4 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-3 border border-rose-100 dark:border-rose-800">
                            <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Amount</label>
                                <input
                                    required
                                    type="number"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    className="w-full bg-white dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-amber-500/20 shadow-sm dark:text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Deposit Date</label>
                                <input
                                    required
                                    type="date"
                                    name="depositDate"
                                    value={formData.depositDate}
                                    onChange={handleChange}
                                    className="w-full bg-white dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-amber-500/20 shadow-sm dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Source</label>
                            <input
                                required
                                type="text"
                                name="source"
                                value={formData.source}
                                onChange={handleChange}
                                placeholder="e.g. Salary, Freelance..."
                                className="w-full bg-white dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-amber-500/20 shadow-sm dark:text-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Notes</label>
                            <input
                                type="text"
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                placeholder="Any additional info..."
                                className="w-full bg-white dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-amber-500/20 shadow-sm dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            disabled={isSubmitting}
                            type="submit"
                            className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-amber-100 transition-all active:scale-95 flex items-center justify-center gap-3"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                            {isSubmitting ? "Updating..." : "Update Deposit"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const DeleteDepositModal = ({ isOpen, onClose, onSuccess, deposits }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleDelete = async () => {
        setIsSubmitting(true);
        setError("");

        const payload = deposits.map(d => ({ refId: d.refId }));

        try {
            await householdService.deleteDeposit(payload);
            onSuccess();
            onClose();
        } catch (err) {
            console.error("Failed to delete deposits:", err);
            setError("Failed to delete records. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="bg-rose-600 p-8 text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-xl transition-colors"
                    >
                        <X size={20} />
                    </button>
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md border border-white/30">
                        <Trash2 size={32} />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight uppercase">Delete Deposit</h2>
                    <p className="text-rose-100 text-sm font-medium mt-1">Are you sure you want to delete {deposits.length > 1 ? `${deposits.length} deposits` : "this deposit"}?</p>
                </div>

                <div className="p-8 space-y-6 bg-gray-50 dark:bg-gray-900/50">
                    {error && (
                        <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 p-4 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-3 border border-rose-100 dark:border-rose-800">
                            <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                            {error}
                        </div>
                    )}

                    <p className="text-gray-500 dark:text-gray-400 text-sm font-bold leading-relaxed">
                        This action cannot be undone. These records will be permanently removed from the household history.
                    </p>

                    <div className="flex gap-4">
                        <button
                            onClick={onClose}
                            className="flex-1 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border border-gray-100 dark:border-gray-700 hover:bg-gray-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={isSubmitting}
                            onClick={handleDelete}
                            className="flex-1 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                            {isSubmitting ? "Deleting..." : "Delete"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const HouseholdPage = () => {
    return <Layout content={<HouseholdDetailsLogic />} />;
};

export default HouseholdPage;
