import Layout from "@/components/layout/Layout";
import { useState, useEffect, useMemo, useCallback } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
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
    MoreHorizontal,
    Loader2,
    X,
    RefreshCcw,
    History,
    ChevronUp,
    ArrowUpDown,
    ArrowDown,
    ArrowUp,
    Trash2
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { postDataAsJson, fetchData, DeleteByObject } from "../../dataService";
import { API_CASHFLOW_BASE_URL, API_CATEGORY_SEARCH_URL } from "../../constants";

const formatDateArray = (dateArray) => {
    if (!dateArray || !Array.isArray(dateArray)) return "N/A";
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    return `${dateArray[2]} ${months[dateArray[1] - 1]}, ${dateArray[0]}`;
};

const ExpenseLogsLogic = () => {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");
    const [showLogForm, setShowLogForm] = useState(false);

    // Data States
    const [households, setHouseholds] = useState([]);
    const [categories, setCategories] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showExportOptions, setShowExportOptions] = useState(false);
    const [error, setError] = useState("");

    // Form States
    const [formData, setFormData] = useState({
        description: "",
        amount: "",
        category: "",
        categoryRefId: "",
        householdRefId: "",
        expenseDate: new Date().toISOString().split('T')[0],
        type: "ONE_TIME",
        expenseFor: "FAMILY",
        paymentMode: "UPI"
    });
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [showCategoryList, setShowCategoryList] = useState(false);

    // Advanced Filter State
    const [showFilters, setShowFilters] = useState(false);
    const [filterForm, setFilterForm] = useState({
        householdRefId: "",
        amountFrom: "",
        amountTo: "",
        expenseDateFrom: "",
        expenseDateTo: "",
        categoryRefId: "",
        expenseType: ""
    });
    const [appliedFilters, setAppliedFilters] = useState({});

    // Sorting State
    const [sortConfig, setSortConfig] = useState({ key: 'expenseDate', direction: 'desc' });

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    // Selection State
    const [selectedRefIds, setSelectedRefIds] = useState([]);
    const [isDeleting, setIsDeleting] = useState(false);

    const refreshData = useCallback(async (currentFilters = appliedFilters) => {
        if (!user?.username) return;
        setLoading(true);
        try {
            // Fetch Households (Keep these cached or only fetch if empty)
            if (households.length === 0) {
                const houseRes = await postDataAsJson(`${API_CASHFLOW_BASE_URL}/households/household/search`, {
                    owner: user.username
                });
                if (houseRes?.data) setHouseholds(houseRes.data);
            }

            // Fetch Categories (Cache if possible)
            if (categories.length === 0) {
                const catRes = await postDataAsJson(API_CATEGORY_SEARCH_URL, {});
                if (catRes?.data) setCategories(catRes.data);
            }

            // Build search payload
            const searchPayload = {
                owner: user.username,
                ...Object.fromEntries(
                    Object.entries(currentFilters).filter(([_, v]) => v !== "" && v !== null)
                )
            };

            // Fetch Transactions with Filters
            const transRes = await postDataAsJson(`${API_CASHFLOW_BASE_URL}/expenses/expense/search`, searchPayload);
            if (transRes?.data) {
                setTransactions(transRes.data);
                setCurrentPage(1); // Reset to first page on new search
            }
        } catch (err) {
            console.error("Failed to fetch logs data:", err);
            setError("Failed to load dashboard data.");
        } finally {
            setLoading(false);
        }
    }, [user?.username, appliedFilters, households.length, categories.length]);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    const handleFormChange = (e) => {
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
        if (!formData.description || !formData.amount || !formData.categoryRefId || !formData.householdRefId) {
            setError("Please fill all required fields.");
            return;
        }

        setIsSubmitting(true);
        setError("");

        const payload = [
            {
                householdRefId: formData.householdRefId,
                owner: user?.username,
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
            await postDataAsJson(`${API_CASHFLOW_BASE_URL}/expenses/expense`, payload);
            setFormData({
                description: "",
                amount: "",
                category: "",
                categoryRefId: "",
                householdRefId: "",
                expenseDate: new Date().toISOString().split('T')[0],
                type: "ONE_TIME",
                expenseFor: "FAMILY",
                paymentMode: "UPI"
            });
            setShowLogForm(false);
            refreshData();
        } catch (err) {
            console.error("Failed to log expense:", err);
            setError("Failed to log expense. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleApplyFilters = () => {
        setAppliedFilters(filterForm);
        refreshData(filterForm);
        setShowFilters(false);
    };

    const handleResetFilters = () => {
        const resetForm = {
            householdRefId: "",
            amountFrom: "",
            amountTo: "",
            expenseDateFrom: "",
            expenseDateTo: "",
            categoryRefId: "",
            expenseType: ""
        };
        setFilterForm(resetForm);
        setAppliedFilters({});
        refreshData(resetForm);
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedTransactions = useMemo(() => {
        return [...transactions].sort((a, b) => {
            let valA = a[sortConfig.key];
            let valB = b[sortConfig.key];

            // Special handling for dates
            if (sortConfig.key === 'expenseDate') {
                valA = Array.isArray(a.expenseDate) ? new Date(a.expenseDate[0], a.expenseDate[1] - 1, a.expenseDate[2]) : new Date(a.expenseDate);
                valB = Array.isArray(b.expenseDate) ? new Date(b.expenseDate[0], b.expenseDate[1] - 1, b.expenseDate[2]) : new Date(b.expenseDate);
            }

            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [transactions, sortConfig]);

    const filteredTransactions = useMemo(() => {
        return sortedTransactions.filter(tx =>
            tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.owner?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [sortedTransactions, searchTerm]);

    const paginatedTransactions = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return filteredTransactions.slice(startIndex, startIndex + pageSize);
    }, [filteredTransactions, currentPage]);

    const totalPages = Math.ceil(filteredTransactions.length / pageSize);

    // Selection Helpers
    const handleSelectRow = (refId) => {
        setSelectedRefIds(prev =>
            prev.includes(refId) ? prev.filter(id => id !== refId) : [...prev, refId]
        );
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allIds = paginatedTransactions.map(tx => tx.refId || tx.uuid);
            setSelectedRefIds(allIds);
        } else {
            setSelectedRefIds([]);
        }
    };

    const handleDeleteSelected = async () => {
        if (!selectedRefIds.length || isDeleting) return;

        if (!confirm(`Are you sure you want to delete ${selectedRefIds.length} selected expenses?`)) return;

        setIsDeleting(true);
        setError("");

        try {
            const payload = selectedRefIds.map(refId => ({ refId }));
            await DeleteByObject(`${API_CASHFLOW_BASE_URL}/expenses/expense`, payload);
            setSelectedRefIds([]);
            refreshData();
        } catch (err) {
            console.error("Failed to delete expenses:", err);
            setError("Failed to delete selected items. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    // Export Logic
    const exportToCSV = () => {
        const headers = ["Date", "Description", "Category", "Type", "Payer", "Amount (₹)"];
        const rows = filteredTransactions.map(tx => [
            formatDateArray(tx.expenseDate),
            tx.description,
            tx.categoryName || 'Expense',
            tx.type,
            tx.owner,
            tx.amount
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `expenses_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setShowExportOptions(false);
    };

    const exportToPDF = () => {
        const doc = new jsPDF();

        // Add Title
        doc.setFontSize(20);
        doc.text("Expense Logs Report", 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);

        // Add Meta Information
        const dateStr = new Date().toLocaleDateString();
        doc.text(`Generated on: ${dateStr}`, 14, 30);
        doc.text(`Total Transactions: ${filteredTransactions.length}`, 14, 38);
        const totalAmount = filteredTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
        doc.text(`Total Amount: INR ${totalAmount.toLocaleString()}`, 14, 46);

        // Add Table
        const tableColumn = ["Date", "Description", "Category", "Type", "Amount"];
        const tableRows = filteredTransactions.map(tx => [
            formatDateArray(tx.expenseDate),
            tx.description,
            tx.categoryName || 'Expense',
            tx.type,
            `INR ${tx.amount.toLocaleString()}`
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 55,
            theme: 'grid',
            headStyles: { fillColor: [79, 70, 229] }, // Indigo-600
        });

        doc.save(`expenses_report_${new Date().toISOString().split('T')[0]}.pdf`);
        setShowExportOptions(false);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase">Expense Logs</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium text-sm md:text-base">Track and manage every transaction across all households.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={() => refreshData()}
                        className="p-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-200 transition-all shrink-0"
                        title="Refresh Data"
                    >
                        <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
                    </button>

                    <div className="relative">
                        <button
                            onClick={() => setShowExportOptions(!showExportOptions)}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-5 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all text-sm"
                        >
                            <Download size={18} /> Export
                        </button>

                        {showExportOptions && (
                            <>
                                <div
                                    className="fixed inset-0 z-[120]"
                                    onClick={() => setShowExportOptions(false)}
                                />
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 z-[130] py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                    <button
                                        onClick={exportToCSV}
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                                    >
                                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-lg">
                                            <Download size={16} />
                                        </div>
                                        <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Export as CSV</span>
                                    </button>
                                    <button
                                        onClick={exportToPDF}
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left border-t border-gray-50 dark:border-gray-700"
                                    >
                                        <div className="p-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-lg">
                                            <Download size={16} />
                                        </div>
                                        <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Export as PDF</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    <button
                        onClick={() => setShowLogForm(!showLogForm)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 dark:shadow-none transition-all active:scale-95 text-sm"
                    >
                        <Plus size={18} /> Log Expense
                    </button>
                </div>
            </div>

            {/* Quick Log Form (Expandable) */}
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showLogForm ? 'max-h-[1000px] opacity-100 mb-8' : 'max-h-0 opacity-0'}`}>
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 md:p-8 rounded-3xl border border-indigo-100 dark:border-indigo-800 shadow-inner">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-lg shadow-indigo-200 dark:shadow-none">
                                <Plus size={18} />
                            </div>
                            <h2 className="text-xl font-black text-indigo-900 dark:text-indigo-100 uppercase tracking-tight">Quick Log</h2>
                        </div>
                        <button onClick={() => setShowLogForm(false)} className="p-2 text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-xl transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {error && (
                        <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 p-4 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-3 border border-rose-100 dark:border-rose-800 mb-6 animate-in slide-in-from-top-2">
                            <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Description</label>
                            <input
                                required
                                name="description"
                                value={formData.description}
                                onChange={handleFormChange}
                                type="text"
                                placeholder="e.g. Weekly Groceries"
                                className="w-full bg-white dark:bg-gray-800 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 shadow-sm dark:text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Amount</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">₹</span>
                                <input
                                    required
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleFormChange}
                                    type="number"
                                    placeholder="0.00"
                                    className="w-full bg-white dark:bg-gray-800 border-none rounded-xl pl-8 pr-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 shadow-sm dark:text-white"
                                />
                            </div>
                        </div>
                        <div className="space-y-2 relative">
                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Category</label>
                            <input
                                required
                                name="category"
                                value={formData.category}
                                onChange={handleFormChange}
                                onFocus={() => formData.category && setShowCategoryList(true)}
                                onBlur={() => setTimeout(() => setShowCategoryList(false), 200)}
                                autoComplete="off"
                                type="text"
                                placeholder="Search category..."
                                className="w-full bg-white dark:bg-gray-800 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 shadow-sm dark:text-white"
                            />
                            {showCategoryList && filteredCategories.length > 0 && (
                                <div className="absolute z-[110] left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 max-h-48 overflow-y-auto scrollbar-none animate-in slide-in-from-top-2">
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
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Date</label>
                            <input
                                required
                                name="expenseDate"
                                value={formData.expenseDate}
                                onChange={handleFormChange}
                                type="date"
                                className="w-full bg-white dark:bg-gray-800 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 shadow-sm dark:text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Expense Type</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleFormChange}
                                className="w-full bg-white dark:bg-gray-800 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 shadow-sm appearance-none dark:text-white cursor-pointer"
                            >
                                <option value="ONE_TIME">One Time</option>
                                <option value="RECURRING">Recurring</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Expense For</label>
                            <select
                                name="expenseFor"
                                value={formData.expenseFor}
                                onChange={handleFormChange}
                                className="w-full bg-white dark:bg-gray-800 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 shadow-sm appearance-none dark:text-white cursor-pointer"
                            >
                                <option value="FAMILY">Family</option>
                                <option value="PERSONAL">Personal</option>
                                <option value="OTHERS">Others</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Payment Mode</label>
                            <select
                                name="paymentMode"
                                value={formData.paymentMode}
                                onChange={handleFormChange}
                                className="w-full bg-white dark:bg-gray-800 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 shadow-sm appearance-none dark:text-white cursor-pointer"
                            >
                                <option value="UPI">UPI</option>
                                <option value="INTERNET BANKING">Internet Banking</option>
                                <option value="DEBIT CARD">Debit Card</option>
                                <option value="CREDIT CARD">Credit Card</option>
                                <option value="CASH">Cash</option>
                                <option value="OTHERS">Others</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Household</label>
                            <select
                                required
                                name="householdRefId"
                                value={formData.householdRefId}
                                onChange={handleFormChange}
                                className="w-full bg-white dark:bg-gray-800 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 shadow-sm appearance-none dark:text-white cursor-pointer"
                            >
                                <option value="">Select Household</option>
                                {households.map(h => <option key={h.uuid || h.refId} value={h.refId}>{h.name}</option>)}
                            </select>
                        </div>
                        <div className="lg:col-span-3 flex flex-col-reverse sm:flex-row justify-end gap-3 mt-4">
                            <button type="button" onClick={() => setShowLogForm(false)} className="px-6 py-3 text-gray-500 font-bold text-sm uppercase tracking-wider">Cancel</button>
                            <button
                                disabled={isSubmitting}
                                type="submit"
                                className="bg-indigo-600 text-white px-10 py-3 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : null}
                                {isSubmitting ? "Processing..." : "Submit Entry"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Advanced Filter Hub (Expandable) */}
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showFilters ? 'max-h-[800px] opacity-100 mb-8' : 'max-h-0 opacity-0'}`}>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 md:p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Filter size={18} className="text-indigo-600" />
                            <h3 className="text-sm font-black uppercase tracking-widest text-gray-700 dark:text-gray-300">Advanced Filters</h3>
                        </div>
                        <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Household</label>
                            <select
                                value={filterForm.householdRefId}
                                onChange={(e) => setFilterForm({ ...filterForm, householdRefId: e.target.value })}
                                className="w-full bg-white dark:bg-gray-800 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 shadow-sm dark:text-white appearance-none"
                            >
                                <option value="">All Households</option>
                                {households.map(h => <option key={h.uuid || h.refId} value={h.refId}>{h.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
                            <select
                                value={filterForm.categoryRefId}
                                onChange={(e) => setFilterForm({ ...filterForm, categoryRefId: e.target.value })}
                                className="w-full bg-white dark:bg-gray-800 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 shadow-sm dark:text-white appearance-none"
                            >
                                <option value="">All Categories</option>
                                {categories.map(c => <option key={c.uuid || c.refId} value={c.refId}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Amount From (₹)</label>
                            <input
                                type="number"
                                value={filterForm.amountFrom}
                                onChange={(e) => setFilterForm({ ...filterForm, amountFrom: e.target.value })}
                                className="w-full bg-white dark:bg-gray-800 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 shadow-sm dark:text-white"
                                placeholder="Min"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Amount To (₹)</label>
                            <input
                                type="number"
                                value={filterForm.amountTo}
                                onChange={(e) => setFilterForm({ ...filterForm, amountTo: e.target.value })}
                                className="w-full bg-white dark:bg-gray-800 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 shadow-sm dark:text-white"
                                placeholder="Max"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Date From</label>
                            <input
                                type="date"
                                value={filterForm.expenseDateFrom}
                                onChange={(e) => setFilterForm({ ...filterForm, expenseDateFrom: e.target.value })}
                                className="w-full bg-white dark:bg-gray-800 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 shadow-sm dark:text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Date To</label>
                            <input
                                type="date"
                                value={filterForm.expenseDateTo}
                                onChange={(e) => setFilterForm({ ...filterForm, expenseDateTo: e.target.value })}
                                className="w-full bg-white dark:bg-gray-800 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 shadow-sm dark:text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Expense Type</label>
                            <select
                                value={filterForm.expenseType}
                                onChange={(e) => setFilterForm({ ...filterForm, expenseType: e.target.value })}
                                className="w-full bg-white dark:bg-gray-800 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 shadow-sm dark:text-white appearance-none"
                            >
                                <option value="">All Types</option>
                                <option value="ONE_TIME">One Time</option>
                                <option value="RECURRING">Recurring</option>
                            </select>
                        </div>
                        <div className="flex items-end gap-3">
                            <button
                                onClick={handleResetFilters}
                                className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-500 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
                            >
                                Reset
                            </button>
                            <button
                                onClick={handleApplyFilters}
                                className="flex-1 bg-indigo-600 text-white px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all"
                            >
                                Apply
                            </button>
                        </div>
                    </div>
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
                <div className="grid grid-cols-2 lg:flex gap-3 w-full lg:w-auto">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl transition-all font-bold text-[10px] uppercase tracking-widest border ${showFilters ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-gray-50 border-transparent dark:bg-gray-700 text-gray-500'}`}
                    >
                        <Filter size={14} /> {Object.keys(appliedFilters).length > 0 ? `Filters (${Object.keys(appliedFilters).filter(k => appliedFilters[k]).length})` : 'Filters'}
                        <ChevronDown size={14} className={`transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-xl overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[900px]">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
                                <th className="px-8 py-6 w-12">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                        checked={selectedRefIds.length === paginatedTransactions.length && paginatedTransactions.length > 0}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th
                                    className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] w-32 cursor-pointer hover:text-indigo-600 transition-colors"
                                    onClick={() => handleSort('expenseDate')}
                                >
                                    <div className="flex items-center gap-2">
                                        Date
                                        {sortConfig.key === 'expenseDate' ? (
                                            sortConfig.direction === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                                        ) : <ArrowUpDown size={12} className="opacity-30" />}
                                    </div>
                                </th>
                                <th
                                    className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] cursor-pointer hover:text-indigo-600 transition-colors"
                                    onClick={() => handleSort('description')}
                                >
                                    <div className="flex items-center gap-2">
                                        Transaction Details
                                        {sortConfig.key === 'description' ? (
                                            sortConfig.direction === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                                        ) : <ArrowUpDown size={12} className="opacity-30" />}
                                    </div>
                                </th>
                                <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Payer</th>
                                <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Payment Mode</th>
                                <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                                <th
                                    className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] text-right cursor-pointer hover:text-indigo-600 transition-colors"
                                    onClick={() => handleSort('amount')}
                                >
                                    <div className="flex items-center justify-end gap-2">
                                        Amount
                                        {sortConfig.key === 'amount' ? (
                                            sortConfig.direction === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                                        ) : <ArrowUpDown size={12} className="opacity-30" />}
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 size={40} className="animate-spin text-indigo-500" />
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Initialising Ledger...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedTransactions.length > 0 ? (
                                paginatedTransactions.map((expense) => (
                                    <tr key={expense.uuid || expense.refId} className={`hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors group ${selectedRefIds.includes(expense.refId || expense.uuid) ? 'bg-indigo-50/50 dark:bg-indigo-900/20' : ''}`}>
                                        <td className="px-8 py-7">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                                checked={selectedRefIds.includes(expense.refId || expense.uuid)}
                                                onChange={() => handleSelectRow(expense.refId || expense.uuid)}
                                            />
                                        </td>
                                        <td className="px-8 py-7">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-gray-800 dark:text-white">
                                                    {Array.isArray(expense.expenseDate) ? expense.expenseDate[2] : new Date(expense.expenseDate).getDate()}
                                                </span>
                                                <span className="text-[10px] font-black text-gray-400 uppercase">
                                                    {Array.isArray(expense.expenseDate)
                                                        ? new Date(expense.expenseDate[0], expense.expenseDate[1] - 1).toLocaleString('default', { month: 'short' }) + ', ' + expense.expenseDate[0]
                                                        : new Date(expense.expenseDate).toLocaleString('default', { month: 'short' }) + ', ' + new Date(expense.expenseDate).getFullYear()
                                                    }
                                                </span>
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
                                                            <Tag size={10} /> {expense.categoryName || expense.categoryRefId || 'Expense'}
                                                        </span>
                                                        <span className="text-[10px] text-gray-300">•</span>
                                                        <span className={`text-[10px] font-bold uppercase ${expense.type === 'RECURRING' ? 'text-amber-500' : 'text-gray-400'}`}>
                                                            {expense.type?.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-7">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-400 shrink-0">
                                                    <User size={14} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate uppercase tracking-tight">{expense.owner}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-7">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-400 shrink-0">
                                                    <User size={14} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate uppercase tracking-tight">{expense.paymentMode}</p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-8 py-7">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 size={14} className="text-green-500" />
                                                <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Verified</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-7 text-right">
                                            <p className="text-sm md:text-lg font-black text-rose-600">-₹{(expense.amount || 0).toLocaleString()}</p>
                                            <button className="p-1 mt-1 text-gray-300 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-all">
                                                <MoreHorizontal size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center gap-4 text-gray-300 dark:text-gray-600">
                                            <History size={64} strokeWidth={1} />
                                            <div className="space-y-1">
                                                <p className="text-lg font-black uppercase tracking-widest">No Logs Found</p>
                                                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 max-w-xs mx-auto">We couldn&apos;t find any transactions for your account. Start by logging your first expense!</p>
                                            </div>
                                            <button
                                                onClick={() => setShowLogForm(true)}
                                                className="mt-4 px-6 py-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all"
                                            >
                                                Log New Expense
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination Controls */}
                {!loading && filteredTransactions.length > 0 && (
                    <div className="p-6 md:p-8 border-t border-gray-50 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4 text-gray-400">
                        <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-center">
                            Showing {Math.min(filteredTransactions.length, (currentPage - 1) * pageSize + 1)} to {Math.min(filteredTransactions.length, currentPage * pageSize)} of {filteredTransactions.length} results
                        </span>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                className="flex-1 sm:flex-none px-6 py-2.5 bg-gray-50 dark:bg-gray-700 rounded-lg font-bold text-[10px] uppercase hover:bg-gray-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <div className="flex items-center px-4 text-[10px] font-black">
                                {currentPage} / {totalPages}
                            </div>
                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                className="flex-1 sm:flex-none px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-bold text-[10px] uppercase shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Floating Bulk Action Bar */}
            {selectedRefIds.length > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-bottom-8 duration-500">
                    <div className="bg-gray-900 dark:bg-indigo-950 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 border border-white/10 backdrop-blur-xl">
                        <div className="flex items-center gap-3 pr-6 border-r border-white/10">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-black text-sm">
                                {selectedRefIds.length}
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest text-gray-300">Items Selected</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setSelectedRefIds([])}
                                className="px-4 py-2 text-xs font-bold uppercase tracking-widest hover:text-indigo-400 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteSelected}
                                disabled={isDeleting}
                                className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-900/20 transition-all flex items-center gap-2"
                            >
                                {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                {isDeleting ? "Deleting..." : "Delete Permanently"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};

const ExpenseLogsPage = () => {
    return <Layout content={<ExpenseLogsLogic />} />;
};

export default ExpenseLogsPage;
