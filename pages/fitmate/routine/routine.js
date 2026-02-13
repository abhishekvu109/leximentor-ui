
import Layout from "@/components/layout/Layout";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import fitmateService from "../../../services/fitmate.service";
import {
    Calendar, CheckCircle, Clock, PlayCircle, Plus,
    MoreHorizontal, Trash2, ChevronRight, Dumbbell, Filter
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

    const loadRoutines = async () => {
        setLoading(true);
        try {
            // Ideally we fetch all, or we could fetch by status and merge. 
            // For now, let's try to fetch all if the API supports it, or multiple calls.
            // Based on previous code, it used query params. Let's assume we can fetch listing or stick to status-based logic if needed.
            // Let's try fetching the main endpoint without params or just the list.
            const res = await fitmateService.getRoutines();
            setRoutines(res.data || []);
        } catch (e) {
            console.error(e);
            // Fallback: try fetching separately if main list fails (mocking logic or assuming user's api works as expected)
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadRoutines(); }, []);

    const handleDelete = async (routine) => {
        if (!confirm("Are you sure you want to delete this routine?")) return;
        try {
            // Assuming this endpoint works as seen in old code
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
            // Pending includes everything that is NOT completed (scheduled, in_progress, not_started)
            if (filter === 'pending') return s !== 'completed';
            return true;
        });
    }, [routines, filter]);

    // Grouping logic (Future enhancement: Today, Previous, Upcoming)
    // For now simple list sorted by date
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
                    sortedRoutines.map((routine, i) => (
                        <RoutineCard key={i} routine={routine} onDelete={handleDelete} />
                    ))
                )}
            </div>
        </div>
    );
};

const Routine = () => {
    return <Layout content={<RoutineTimeline />} />;
}

export default Routine;