import Layout from "@/components/layout/Layout";
import { useState, useEffect, useCallback } from "react";
import {
    Plus,
    X,
    FolderTree,
    Loader2,
    RefreshCcw,
    Edit2,
    Trash2,
    Tags,
    Check
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import cashflowService from "../../services/cashflow.service";

const CategoriesLogic = () => {
    const { user } = useAuth();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    
    // States for Editing
    const [editingRefId, setEditingRefId] = useState(null);
    const [editName, setEditName] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Form States for Creation
    const [formData, setFormData] = useState({ name: "" });

    const refreshData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await cashflowService.searchCategories({});
            if (res?.data) {
                setCategories(res.data);
            }
        } catch (err) {
            console.error("Failed to fetch categories:", err);
            setError("Failed to load categories.");
        } finally {
            setLoading(false);
        }
    }, [user?.username]);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) return;

        setIsSubmitting(true);
        setError("");
        setSuccess("");

        try {
            const payload = [{ name: formData.name.trim() }];
            const response = await cashflowService.createCategory(payload);
            if (response) {
                setSuccess("Category created successfully!");
                setFormData({ name: "" });
                setTimeout(() => setShowForm(false), 2000);
                refreshData();
            }
        } catch (err) {
            console.error("Failed to create category:", err);
            setError(err.message || "Failed to submit category. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const startEditing = (category) => {
        setEditingRefId(category.refId);
        setEditName(category.name);
    };

    const cancelEditing = () => {
        setEditingRefId(null);
        setEditName("");
    };

    const handleUpdate = async (refId) => {
        if (!editName.trim()) return;
        setIsSubmitting(true);
        setError("");
        setSuccess("");

        try {
            const payload = [{ refId, name: editName.trim() }];
            const response = await cashflowService.updateCategory(payload);
            if (response) {
                setSuccess("Category updated successfully!");
                cancelEditing();
                refreshData();
            }
        } catch (err) {
            console.error("Failed to update category:", err);
            setError(err.message || "Failed to update category. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (refId) => {
        if (!window.confirm("Are you sure you want to delete this category?")) return;
        
        setIsSubmitting(true);
        setError("");
        setSuccess("");

        try {
            const payload = [{ refId }];
            const response = await cashflowService.deleteCategory(payload);
            if (response) {
                setSuccess("Category deleted successfully!");
                refreshData();
            }
        } catch (err) {
            console.error("Failed to delete category:", err);
            setError(err.message || "Failed to delete category. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-100 dark:shadow-none">
                            <Tags size={24} />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Categories</h1>
                    </div>
                    <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Manage definitions of your earnings and expenses</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={refreshData}
                        className="p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-gray-400 hover:text-blue-500 transition-all shadow-sm"
                    >
                        <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
                    </button>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-100 dark:shadow-none transition-all active:scale-95 text-sm"
                    >
                        <Plus size={18} /> New Category
                    </button>
                </div>
            </div>

            {/* Quick Log Form (Expandable) */}
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showForm ? 'max-h-[1000px] opacity-100 mb-8' : 'max-h-0 opacity-0'}`}>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 md:p-8 rounded-3xl border border-blue-100 dark:border-blue-800 shadow-inner">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-600 text-white rounded-lg shadow-lg shadow-blue-200 dark:shadow-none">
                                <Plus size={18} />
                            </div>
                            <h2 className="text-xl font-black text-blue-900 dark:text-blue-100 uppercase tracking-tight">Add Category</h2>
                        </div>
                        <button onClick={() => setShowForm(false)} className="p-2 text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-xl transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleCreateSubmit} className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-end">
                        <div className="space-y-2 lg:col-span-3">
                            <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1">Category Name</label>
                            <div className="relative">
                                <FolderTree size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" />
                                <input
                                    required
                                    name="name"
                                    value={formData.name}
                                    onChange={handleFormChange}
                                    type="text"
                                    placeholder="e.g. Utilities, Entertainment, Salary"
                                    className="w-full bg-white dark:bg-gray-800 border-none rounded-xl pl-12 pr-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 shadow-sm dark:text-white"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col-reverse justify-end gap-3">
                            <button
                                disabled={isSubmitting || !formData.name.trim()}
                                type="submit"
                                className="bg-blue-600 text-white px-10 py-3 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-100 dark:shadow-none hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed h-[44px]"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : null}
                                {isSubmitting ? "Adding..." : "Add"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Error / Success Messages overlay for the whole page ideally, or just inline. Let's put inline below form. */}
            {error && (
                <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 p-4 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-3 border border-rose-100 dark:border-rose-800 mb-6 animate-in slide-in-from-top-2">
                    <div className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 p-4 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-3 border border-blue-200 dark:border-blue-800 mb-6 animate-in slide-in-from-top-2">
                    <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                    {success}
                </div>
            )}

            {/* Categories List */}
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-xl overflow-hidden min-h-[400px]">
                <div className="p-8 border-b border-gray-50 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl flex items-center justify-center">
                            <FolderTree size={20} />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-gray-700 dark:text-gray-300">Category List</h3>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[600px]">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
                                <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Name</th>
                                <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="2" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 size={40} className="animate-spin text-blue-500" />
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading Categories...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : categories.length > 0 ? (
                                categories.map((cat, idx) => {
                                    const isEditing = editingRefId === cat.refId;

                                    return (
                                        <tr key={cat.refId || idx} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors group">
                                            <td className="px-8 py-7">
                                                {isEditing ? (
                                                    <input
                                                        autoFocus
                                                        value={editName}
                                                        onChange={(e) => setEditName(e.target.value)}
                                                        className="w-full bg-white dark:bg-gray-900 border border-blue-200 dark:border-blue-700 rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 outline-none dark:text-white"
                                                    />
                                                ) : (
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-2xl flex items-center justify-center text-blue-600 group-hover:border-blue-200 transition-colors shrink-0">
                                                            <Tags size={20} />
                                                        </div>
                                                        <p className="font-bold text-gray-800 dark:text-white">{cat.name}</p>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-8 py-7 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    {isEditing ? (
                                                        <>
                                                            <button 
                                                                onClick={() => handleUpdate(cat.refId)} 
                                                                className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-xl transition-colors shrink-0"
                                                                title="Save"
                                                            >
                                                                <Check size={18} />
                                                            </button>
                                                            <button 
                                                                onClick={cancelEditing} 
                                                                className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors shrink-0"
                                                                title="Cancel"
                                                            >
                                                                <X size={18} />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button 
                                                                onClick={() => startEditing(cat)} 
                                                                className="p-2 text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-xl transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                                                                title="Edit"
                                                            >
                                                                <Edit2 size={18} />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDelete(cat.refId)} 
                                                                className="p-2 text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-xl transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                                                                title="Delete"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="2" className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center gap-4 text-gray-300 dark:text-gray-600">
                                            <Tags size={64} strokeWidth={1} />
                                            <div className="space-y-1">
                                                <p className="text-lg font-black uppercase tracking-widest">No Categories Found</p>
                                                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 max-w-xs mx-auto">Maintain your metadata. Add a category today.</p>
                                            </div>
                                            <button
                                                onClick={() => setShowForm(true)}
                                                className="mt-4 px-6 py-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all"
                                            >
                                                Add Initial Category
                                            </button>
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

const CategoriesPage = () => {
    return <Layout content={<CategoriesLogic />} />;
};

export default CategoriesPage;
