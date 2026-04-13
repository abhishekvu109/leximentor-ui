import { useState, useCallback, useEffect, useMemo } from "react";
import synapsterService from "../../services/synapster.service";
import {
    MagnifyingGlassIcon,
    AcademicCapIcon,
    TrashIcon,
    PlusIcon,
    TagIcon,
    ChartBarIcon,
    SparklesIcon
} from "@heroicons/react/24/outline";
import Link from "next/link";

const StatusPill = ({ status }) => {
    let color = 'bg-slate-100 text-slate-600 border-slate-200';
    const s = String(status || '').toUpperCase();

    if (s === 'ACTIVE') color = 'bg-green-50 text-green-700 border-green-200';
    if (s === 'INACTIVE') color = 'bg-red-50 text-red-700 border-red-200';

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${color}`}>
            {status || 'Unknown'}
        </span>
    );
};

const SubjectCard = ({ item, index, onRemove }) => {
    return (
        <div className="group bg-white rounded-xl border border-slate-200 p-4 transition-all duration-200 hover:shadow-lg hover:border-indigo-200 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 animate-in fade-in slide-in-from-bottom-2">

            <div className="flex items-center gap-4 min-w-[60px]">
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 font-bold flex items-center justify-center text-xs">
                    {index + 1}
                </div>
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-slate-800 truncate">
                        {item.name}
                    </h3>
                    <StatusPill status={item.status} />
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                        <TagIcon className="w-3 h-3" />
                        <span className="truncate">{item.category || 'General'}</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 text-sm text-slate-400 truncate max-w-md hidden md:block">
                {item.description}
            </div>

            <div className="flex items-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => onRemove(item.refId || item.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Remove Subject"
                >
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export const SubjectTable = () => {
    const [subjects, setSubjects] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchSubjects = useCallback(async () => {
        setLoading(true);
        try {
            const data = await synapsterService.getAllSubjects();
            setSubjects(data.data || []);
        } catch (error) {
            console.error('Error fetching subjects:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSubjects();
    }, [fetchSubjects]);

    const handleRemove = async (id) => {
        if (!confirm("Are you sure you want to delete this subject?")) return;
        try {
            await synapsterService.deleteSubject(id);
            fetchSubjects();
        } catch (error) {
            console.error('Error deleting subject:', error);
        }
    };

    const filteredData = useMemo(() => {
        return subjects.filter(item => {
            const s = searchTerm.toLowerCase();
            const name = item.name?.toLowerCase() || "";
            const cat = item.category?.toLowerCase() || "";
            return name.includes(s) || cat.includes(s);
        });
    }, [subjects, searchTerm]);

    if (loading) return <div className="text-center py-20 animate-pulse text-slate-400">Loading subjects...</div>;

    return (
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                    <AcademicCapIcon className="w-5 h-5 text-indigo-600" />
                    <h2 className="font-bold text-slate-800 text-lg">Subject Inventory</h2>
                    <span className="bg-slate-100 text-slate-500 text-xs font-bold px-2 py-1 rounded-full">
                        {filteredData.length}
                    </span>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-72">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search subjects..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                {filteredData.length > 0 ? (
                    filteredData.map((item, index) => (
                        <SubjectCard
                            key={item.refId || item.id}
                            item={item}
                            index={index}
                            onRemove={handleRemove}
                        />
                    ))
                ) : (
                    <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                        <SparklesIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-slate-500 font-medium">No subjects found</h3>
                        <Link href="/synapster/subject/subject">
                            <button className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition-all">
                                <PlusIcon className="w-4 h-4" />
                                Add Your First Subject
                            </button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};
