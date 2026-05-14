import Layout from "@/components/layout/Layout";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
    Folder, FolderOpen, ChevronRight, ChevronDown, Loader2, Layers, ArrowLeft, BookOpen, Settings
} from "lucide-react";
import flashcardService from "../../services/flashcard.service";

const CategoriesContent = () => {
    const router = useRouter();
    const { genreId } = router.query;

    const [genres, setGenres] = useState([]);
    const [expandedGenre, setExpandedGenre] = useState(null);
    const [subCategories, setSubCategories] = useState({});
    const [loadingGenres, setLoadingGenres] = useState(true);
    const [loadingSubs, setLoadingSubs] = useState({});

    useEffect(() => {
        flashcardService.getAllGenres()
            .then(res => setGenres(res?.data ?? []))
            .catch(err => console.error(err))
            .finally(() => setLoadingGenres(false));
    }, []);

    // Auto-expand if genreId is in query
    useEffect(() => {
        if (genreId && genres.length > 0) {
            handleToggleGenre(genreId);
        }
    }, [genreId, genres.length]);

    const handleToggleGenre = async (refId) => {
        if (expandedGenre === refId) {
            setExpandedGenre(null);
            return;
        }
        setExpandedGenre(refId);
        if (subCategories[refId]) return; // already fetched

        setLoadingSubs(prev => ({ ...prev, [refId]: true }));
        try {
            const res = await flashcardService.getCategoryById(refId);
            setSubCategories(prev => ({ ...prev, [refId]: res?.data?.subCategories ?? [] }));
        } catch (err) {
            console.error(err);
            setSubCategories(prev => ({ ...prev, [refId]: [] }));
        } finally {
            setLoadingSubs(prev => ({ ...prev, [refId]: false }));
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/flashcards" className="p-2 rounded-xl text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all">
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                            Browse Categories
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-0.5 font-medium text-sm">
                            Browse flashcard decks by genre and topic.
                        </p>
                    </div>
                </div>
                <Link
                    href="/flashcards/categories-manage"
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-gray-500 dark:text-gray-400 hover:text-indigo-600 hover:border-indigo-100 dark:hover:border-indigo-800 text-sm font-bold transition-all shadow-sm"
                >
                    <Settings size={15} /> Manage
                </Link>
            </div>

            {/* Genre list */}
            {loadingGenres ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="animate-spin text-indigo-500 mb-2" size={32} />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading categories…</p>
                </div>
            ) : genres.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                    <Folder size={40} className="text-gray-200 dark:text-gray-700 mb-3" />
                    <p className="font-black text-gray-400 text-sm uppercase tracking-widest">No categories yet</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {genres.map(genre => {
                        const isOpen = expandedGenre === genre.refId;
                        const subs = subCategories[genre.refId] ?? [];
                        const isLoadingSubs = loadingSubs[genre.refId];

                        return (
                            <div key={genre.refId} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                                {/* Genre row */}
                                <button
                                    type="button"
                                    onClick={() => handleToggleGenre(genre.refId)}
                                    className="w-full flex items-center gap-4 p-5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group text-left"
                                >
                                    <div className={`p-2.5 rounded-xl transition-colors ${isOpen ? 'bg-indigo-50 dark:bg-indigo-900/30' : 'bg-gray-50 dark:bg-gray-700'}`}>
                                        {isOpen
                                            ? <FolderOpen size={20} className="text-indigo-600 dark:text-indigo-400" />
                                            : <Folder size={20} className="text-gray-400 dark:text-gray-500" />
                                        }
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className={`font-black text-base truncate transition-colors ${isOpen ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-800 dark:text-white group-hover:text-indigo-600'}`}>
                                            {genre.name}
                                        </h3>
                                        {genre.description && (
                                            <p className="text-xs text-gray-400 mt-0.5 truncate">{genre.description}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 shrink-0">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-wide hidden sm:block">
                                            {genre.subCategoryCount} topics
                                        </span>
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-wide hidden sm:block">
                                            {genre.deckCount} decks
                                        </span>
                                        {isOpen
                                            ? <ChevronDown size={16} className="text-indigo-400" />
                                            : <ChevronRight size={16} className="text-gray-300" />
                                        }
                                    </div>
                                </button>

                                {/* Sub-categories */}
                                {isOpen && (
                                    <div className="border-t border-gray-50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/20 px-5 py-4">
                                        {isLoadingSubs ? (
                                            <div className="flex items-center gap-2 py-3">
                                                <Loader2 size={16} className="animate-spin text-indigo-400" />
                                                <span className="text-xs text-gray-400 font-medium">Loading topics…</span>
                                            </div>
                                        ) : subs.length === 0 ? (
                                            <p className="text-xs text-gray-400 font-medium py-2 italic">No sub-categories in this genre yet.</p>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                {subs.map(sub => (
                                                    <Link
                                                        key={sub.refId}
                                                        href={`/flashcards/decks?categoryRefId=${sub.refId}`}
                                                        className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3.5 hover:border-indigo-100 dark:hover:border-indigo-800 hover:shadow-sm transition-all group/sub"
                                                    >
                                                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg group-hover/sub:bg-indigo-100 transition-colors shrink-0">
                                                            <Layers size={14} className="text-indigo-600 dark:text-indigo-400" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="font-black text-gray-800 dark:text-white text-sm truncate group-hover/sub:text-indigo-600 transition-colors">
                                                                {sub.name}
                                                            </p>
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1 mt-0.5">
                                                                <BookOpen size={9} /> {sub.deckCount} decks
                                                            </p>
                                                        </div>
                                                        <ChevronRight size={14} className="text-gray-300 group-hover/sub:text-indigo-400 shrink-0 transition-colors" />
                                                    </Link>
                                                ))}
                                            </div>
                                        )}

                                        {/* View all decks in genre */}
                                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                                            <Link
                                                href={`/flashcards/decks?categoryRefId=${genre.refId}`}
                                                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                                            >
                                                View all decks in {genre.name} <ChevronRight size={12} />
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const CategoriesPage = () => <Layout content={<CategoriesContent />} />;
export default CategoriesPage;
