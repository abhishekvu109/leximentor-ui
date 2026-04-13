import React, { useEffect, useState, useMemo } from 'react';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/context/AuthContext';
import fitmateService from '@/services/fitmate.service';
import {
    ClipboardList,
    Calendar,
    Dumbbell,
    ChevronRight,
    Search,
    Filter,
    Activity,
    Clock,
    Target,
    Layers,
    LayoutGrid,
    Table,
    ChevronLeft,
    ChevronsLeft,
    ChevronsRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const WorkoutLogs = () => {
    const { user } = useAuth();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTraining, setSelectedTraining] = useState("All");
    const [viewMode, setViewMode] = useState("cards"); // "cards" or "table"
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        const fetchLogs = async () => {
            if (user?.username) {
                try {
                    const response = await fitmateService.getWorkoutLogs(user.username);
                    if (response && response.data) {
                        setLogs(response.data);
                    }
                } catch (error) {
                    console.error("Failed to fetch workout logs:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchLogs();
    }, [user?.username]);

    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            const matchesSearch = log.exerciseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.bodyPartName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesTraining = selectedTraining === "All" || log.training === selectedTraining;
            return matchesSearch && matchesTraining;
        });
    }, [logs, searchTerm, selectedTraining]);

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedTraining]);

    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
    const paginatedLogs = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredLogs.slice(start, start + itemsPerPage);
    }, [filteredLogs, currentPage, itemsPerPage]);

    const groupedLogs = useMemo(() => {
        const groups = {};
        paginatedLogs.forEach(log => {
            if (!groups[log.routineDate]) {
                groups[log.routineDate] = [];
            }
            groups[log.routineDate].push(log);
        });
        // Sort dates descending within the page
        return Object.keys(groups)
            .sort((a, b) => new Date(b) - new Date(a))
            .map(date => ({
                date,
                logs: groups[date]
            }));
    }, [paginatedLogs]);

    const trainings = useMemo(() => {
        const unique = new Set(logs.map(l => l.training));
        return ["All", ...Array.from(unique)];
    }, [logs]);

    const Pagination = () => {
        if (totalPages <= 1) return null;

        return (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-slate-100">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                    Showing <span className="text-slate-900">{Math.min(filteredLogs.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(filteredLogs.length, currentPage * itemsPerPage)}</span> of <span className="text-slate-900">{filteredLogs.length}</span> Logs
                </p>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:border-slate-200 transition-all bg-white shadow-sm"
                    >
                        <ChevronsLeft size={18} />
                    </button>
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:border-slate-200 transition-all bg-white shadow-sm"
                    >
                        <ChevronLeft size={18} />
                    </button>

                    <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
                        {[...Array(totalPages)].map((_, i) => {
                            const pageNum = i + 1;
                            // Only show current page, first, last, and neighbors
                            if (
                                pageNum === 1 ||
                                pageNum === totalPages ||
                                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                            ) {
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`w-10 h-10 rounded-lg text-sm font-black transition-all ${currentPage === pageNum ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-slate-600 hover:bg-white'}`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            } else if (
                                (pageNum === currentPage - 2 && pageNum > 1) ||
                                (pageNum === currentPage + 2 && pageNum < totalPages)
                            ) {
                                return <span key={pageNum} className="w-6 text-center text-slate-300 font-bold">...</span>;
                            }
                            return null;
                        })}
                    </div>

                    <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:border-slate-200 transition-all bg-white shadow-sm"
                    >
                        <ChevronRight size={18} />
                    </button>
                    <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:border-slate-200 transition-all bg-white shadow-sm"
                    >
                        <ChevronsRight size={18} />
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Show</span>
                    <select
                        value={itemsPerPage}
                        onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                        className="bg-white border border-slate-200 text-slate-700 text-sm font-black rounded-xl p-2 outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
                    >
                        {[10, 20, 50].map(val => (
                            <option key={val} value={val}>{val}</option>
                        ))}
                    </select>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <Layout content={
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
                        <p className="text-slate-500 font-medium">Loading your workout logs...</p>
                    </div>
                </div>
            } />
        );
    }

    const TableView = () => (
        <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Date</th>
                        <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Training</th>
                        <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Exercise</th>
                        <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Body Part</th>
                        <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-center">Measurement</th>
                        <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-center">Reps</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {paginatedLogs.map((log, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-6 py-4">
                                <span className="text-sm font-bold text-slate-600">
                                    {new Date(log.routineDate).toLocaleDateString()}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-wider rounded-lg border border-indigo-100">
                                    {log.training}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <span className="text-sm font-black text-slate-800">{log.exerciseName}</span>
                            </td>
                            <td className="px-6 py-4">
                                <span className="text-sm font-bold text-slate-500">{log.bodyPartName}</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <div className="flex items-center justify-center gap-1">
                                    <span className="text-sm font-black text-slate-900">{log.measurement}</span>
                                    <span className="text-[10px] font-black text-slate-400 uppercase">{log.unit}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <span className="text-sm font-black text-slate-700">{log.repetition}</span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <Layout content={
            <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-100 pb-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm uppercase tracking-wider">
                            <Activity size={18} />
                            <span>Fitmate Progress</span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Workout Logs</h1>
                        <p className="text-slate-500 font-medium text-lg">Track your journey and consistency over time.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                        {/* View Switcher */}
                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl shadow-inner border border-slate-200">
                            <button
                                onClick={() => setViewMode("cards")}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${viewMode === "cards" ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <LayoutGrid size={18} />
                                <span className="hidden sm:inline">Cards</span>
                            </button>
                            <button
                                onClick={() => setViewMode("table")}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${viewMode === "table" ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <Table size={18} />
                                <span className="hidden sm:inline">Table</span>
                            </button>
                        </div>

                        {/* Search */}
                        <div className="relative flex-1 md:w-72">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search exercises..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-medium text-slate-700 shadow-sm"
                            />
                        </div>

                        {/* Filter */}
                        <div className="flex items-center gap-2 bg-white p-1.5 border border-slate-200 rounded-2xl shadow-sm">
                            {trainings.map(t => (
                                <button
                                    key={t}
                                    onClick={() => setSelectedTraining(t)}
                                    className={`px-4 py-1.5 rounded-xl text-sm font-bold transition-all ${selectedTraining === t ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Content View */}
                <div className="space-y-12">
                    {filteredLogs.length > 0 ? (
                        <>
                            {viewMode === "cards" ? (
                                groupedLogs.map((group, groupIdx) => (
                                    <div key={group.date} className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                                <Calendar size={24} className="text-indigo-600" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-black text-slate-800">
                                                    {new Date(group.date).toLocaleDateString('en-US', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </h2>
                                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                                                    {group.logs.length} Exercises Recorded
                                                </p>
                                            </div>
                                            <div className="flex-1 h-px bg-slate-100" />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            <AnimatePresence mode='popLayout'>
                                                {group.logs.map((log, index) => (
                                                    <motion.div
                                                        key={`${group.date}-${log.exerciseName}-${index}`}
                                                        layout
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: index * 0.05 }}
                                                        className="group bg-white border border-slate-200 rounded-[2rem] p-6 hover:shadow-xl hover:shadow-slate-100 hover:border-indigo-100 transition-all duration-300 relative overflow-hidden"
                                                    >
                                                        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[4rem] -z-0 opacity-50 transition-colors group-hover:bg-indigo-50/30" />

                                                        <div className="relative z-10 space-y-6">
                                                            <div className="flex justify-between items-start">
                                                                <div className="space-y-1">
                                                                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-wider rounded-lg border border-indigo-100">
                                                                        {log.training}
                                                                    </span>
                                                                    <h3 className="text-lg font-black text-slate-800 leading-tight">
                                                                        {log.exerciseName}
                                                                    </h3>
                                                                </div>
                                                                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                                                    <Dumbbell size={24} />
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                                                        <Target size={12} /> Target
                                                                    </p>
                                                                    <p className="text-sm font-bold text-slate-700">{log.bodyPartName}</p>
                                                                </div>
                                                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                                                        <Layers size={12} /> Sets
                                                                    </p>
                                                                    <p className="text-sm font-bold text-slate-700">{log.repetition} Reps</p>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                                                <div className="flex items-baseline gap-1">
                                                                    <span className="text-2xl font-black text-slate-900">{log.measurement}</span>
                                                                    <span className="text-sm font-black text-slate-400 uppercase">{log.unit}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs">
                                                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">Details</span>
                                                                    <ChevronRight size={16} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <TableView />
                            )}
                            <Pagination />
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-32 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                            <div className="w-20 h-20 bg-white rounded-[2rem] shadow-xl flex items-center justify-center mb-6 text-slate-300 animate-bounce">
                                <ClipboardList size={40} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 mb-2">No workout logs found</h3>
                            <p className="text-slate-500 max-w-sm text-center font-medium">
                                Start your fitness journey by creating and completing workout routines!
                            </p>
                        </div>
                    )}
                </div>
            </div>
        } />
    );
};

export default WorkoutLogs;
