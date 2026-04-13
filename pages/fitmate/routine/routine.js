
import Layout from "@/components/layout/Layout";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import fitmateService from "../../../services/fitmate.service";
import {
    Calendar, CheckCircle, Clock, PlayCircle, Plus,
    MoreHorizontal, Trash2, ChevronRight, ChevronLeft, ChevronsLeft, ChevronsRight, Dumbbell, Filter
} from "lucide-react";

const RoutineCard = ({ routine, onDelete }) => {
    const statusColors = {
        'completed': 'bg-green-100 text-green-700',
        'in_progress': 'bg-blue-100 text-blue-700',
        'not_started': 'bg-gray-100 text-gray-700',
        'scheduled': 'bg-purple-100 text-purple-700'
    };

    const statusLabel = {
        'completed': 'Completed',
        'in_progress': 'In Progress',
        'not_started': 'Not Started',
        'scheduled': 'Scheduled'
    };

    const status = routine.status?.toLowerCase() || 'not_started';

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5 flex flex-col md:flex-row gap-5 items-start md:items-center group">
            {/* Icon / Date Box */}
            <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex flex-col items-center justify-center border border-blue-100">
                    <span className="text-xs font-bold uppercase">{new Date(routine.workoutDate).toLocaleString('default', { month: 'short' })}</span>
                    <span className="text-xl font-bold">{new Date(routine.workoutDate).getDate()}</span>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusColors[status] || 'bg-gray-100 text-gray-600'}`}>
                        {statusLabel[status] || status}
                    </span>
                    <span className="text-gray-400 text-xs flex items-center gap-1">
                        <Dumbbell size={12} />
                        {routine.training?.name || 'General Training'}
                    </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 truncate">
                    {routine.description || routine.training?.name || "Untitled Workout"}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                    {routine.key || `ID: ${routine.refId}`}
                </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                <Link href={`/fitmate/routine/routine-details/${routine.refId}`}>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-white border border-gray-200 hover:border-blue-200 text-gray-700 hover:text-blue-600 rounded-xl text-sm font-medium transition-all w-full md:w-auto justify-center">
                        View Details
                    </button>
                </Link>

                <button
                    onClick={() => onDelete(routine)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Routine"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
}

const RoutineTimeline = () => {
    const [routines, setRoutines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, completed, pending

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const itemsPerPage = 10;

    const loadRoutines = async () => {
        setLoading(true);
        try {
            const res = await fitmateService.getRoutines(currentPage - 1, itemsPerPage);
            const dataObj = res.data;
            if (dataObj && typeof dataObj === 'object' && 'content' in dataObj) {
                setRoutines(dataObj.content);
                setTotalPages(dataObj.totalPages || 0);
                setTotalElements(dataObj.totalElements || 0);
            } else if (Array.isArray(dataObj)) {
                setRoutines(dataObj);
                setTotalPages(Math.ceil(dataObj.length / itemsPerPage));
                setTotalElements(dataObj.length);
            } else {
                setRoutines([]);
                setTotalPages(0);
                setTotalElements(0);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRoutines();
    }, [currentPage]);

    // Reset pagination to page 1 if local filter logic changes to avoid getting stuck on an empty filtered page
    useEffect(() => {
        setCurrentPage(1);
    }, [filter]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleDelete = async (routine) => {
        if (!confirm("Are you sure you want to delete this routine?")) return;
        try {
            await fitmateService.deleteRoutine(routine.refId);
            loadRoutines(); // Reload
        } catch (e) {
            console.error(e);
            alert("Failed to delete");
        }
    };

    const filteredRoutines = useMemo(() => {
        if (filter === 'all') return routines;

        return routines.filter(r => {
            const s = (r.status || 'not_started').toLowerCase();
            if (filter === 'completed') return s === 'completed';
            if (filter === 'pending') return s !== 'completed';
            return true;
        });
    }, [routines, filter]);

    const sortedRoutines = [...filteredRoutines].sort((a, b) => new Date(b.workoutDate) - new Date(a.workoutDate));

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Routines</h1>
                    <p className="text-gray-500 mt-1">Track your fitness journey and manage your schedule</p>
                </div>
                <Link href="/fitmate/routine/make-routine">
                    <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95 w-full md:w-auto justify-center">
                        <Plus size={20} /> Log Workout
                    </button>
                </Link>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {['all', 'pending', 'completed'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-full text-sm font-bold capitalize transition-all whitespace-nowrap ${filter === f
                            ? 'bg-gray-900 text-white shadow-md'
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="space-y-4">
                {loading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-50 rounded-2xl animate-pulse" />)
                ) : sortedRoutines.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-gray-300 mx-auto mb-4 shadow-sm">
                            <Calendar size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">No routines found</h3>
                        <p className="text-gray-500 mb-6">Looks like you haven&apos;t logged any workouts yet.</p>
                        <Link href="/fitmate/routine/make-routine">
                            <button className="text-blue-600 font-bold hover:underline">Start your first workout</button>
                        </Link>
                    </div>
                ) : (
                    <>
                        {sortedRoutines.map((routine, i) => (
                            <RoutineCard key={i} routine={routine} onDelete={handleDelete} />
                        ))}

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center pt-8 pb-4">
                                <div className="flex items-center gap-2 bg-white px-2 py-2 rounded-2xl border border-gray-100 shadow-sm">
                                    <button
                                        onClick={() => handlePageChange(1)}
                                        disabled={currentPage === 1}
                                        className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        title="First Page"
                                    >
                                        <ChevronsLeft size={18} />
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        title="Previous Page"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>

                                    <div className="flex items-center gap-1 mx-2">
                                        {(() => {
                                            let startPage = 1;
                                            if (totalPages > 5) {
                                                if (currentPage <= 3) {
                                                    startPage = 1;
                                                } else if (currentPage >= totalPages - 2) {
                                                    startPage = totalPages - 4;
                                                } else {
                                                    startPage = currentPage - 2;
                                                }
                                            }

                                            return Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                let pageNum = startPage + i;
                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => handlePageChange(pageNum)}
                                                        className={`w-10 h-10 rounded-lg text-sm font-bold transition-all
                                                            ${currentPage === pageNum
                                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105'
                                                                : 'text-gray-600 hover:bg-gray-100'
                                                            }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            });
                                        })()}
                                    </div>

                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === Math.max(1, totalPages)}
                                        className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        title="Next Page"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(totalPages)}
                                        disabled={currentPage === Math.max(1, totalPages)}
                                        className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        title="Last Page"
                                    >
                                        <ChevronsRight size={18} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

const Routine = () => {
    return <Layout content={<RoutineTimeline />} />;
}

export default Routine;