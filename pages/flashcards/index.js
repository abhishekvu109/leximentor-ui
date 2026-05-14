import Layout from "@/components/layout/Layout";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Layers, Plus, BookOpen, Globe, List, TrendingUp, Loader2, ChevronRight, Folder
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import flashcardService from "../../services/flashcard.service";
import DeckCard from "../../components/flashcards/DeckCard";

const StatCard = ({ icon: Icon, label, value, color, bg }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 flex items-center gap-4">
        <div className={`p-3 rounded-xl ${bg}`}>
            <Icon size={22} className={color} />
        </div>
        <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{label}</p>
            <p className="text-2xl font-black text-gray-800 dark:text-white mt-0.5">{value}</p>
        </div>
    </div>
);

const FlashcardDashboard = () => {
    const { user } = useAuth();
    const [decks, setDecks] = useState([]);
    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.username) return;
        const load = async () => {
            setLoading(true);
            try {
                const [decksRes, genresRes] = await Promise.all([
                    flashcardService.getDecks({ userId: user.username, page: 0, size: 6 }),
                    flashcardService.getAllGenres(),
                ]);
                setDecks(decksRes?.data?.content ?? []);
                setGenres(genresRes?.data ?? []);
            } catch (err) {
                console.error('Flashcard dashboard load failed:', err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [user?.username]);

    const totalCards = decks.reduce((sum, d) => sum + (d.flashcardCount ?? 0), 0);
    const publicCount = decks.filter(d => d.isPublic).length;

    const stats = [
        { icon: Layers,      label: 'My Decks',      value: decks.length,  color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/30' },
        { icon: BookOpen,    label: 'Total Cards',    value: totalCards,    color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
        { icon: Folder,      label: 'Genres',         value: genres.length, color: 'text-amber-600',  bg: 'bg-amber-50 dark:bg-amber-900/30' },
        { icon: Globe,       label: 'Public Decks',   value: publicCount,   color: 'text-blue-600',   bg: 'bg-blue-50 dark:bg-blue-900/30' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl">
                            <Layers size={28} className="text-indigo-600" />
                        </div>
                        Flashcards
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium text-sm md:text-base">
                        Build and study decks of rich-content flashcards.
                    </p>
                </div>
                <Link href="/flashcards/decks/create">
                    <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 dark:shadow-none transition-all active:scale-95">
                        <Plus size={18} /> Create Deck
                    </button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map(s => <StatCard key={s.label} {...s} />)}
            </div>

            {/* Recent Decks */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-black text-gray-800 dark:text-white">Recent Decks</h2>
                    <Link href="/flashcards/decks" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                        View all <ChevronRight size={14} />
                    </Link>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <Loader2 className="animate-spin text-indigo-500 mb-2" size={32} />
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading decks…</p>
                    </div>
                ) : decks.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {decks.map(deck => <DeckCard key={deck.id} deck={deck} />)}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                        <Layers size={40} className="text-gray-200 dark:text-gray-700 mb-3" />
                        <p className="font-black text-gray-400 text-sm uppercase tracking-widest">No decks yet</p>
                        <Link href="/flashcards/decks/create">
                            <button className="mt-4 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all">
                                <Plus size={16} /> Create your first deck
                            </button>
                        </Link>
                    </div>
                )}
            </div>

            {/* Browse by Genre */}
            {genres.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-black text-gray-800 dark:text-white">Browse by Genre</h2>
                        <Link href="/flashcards/categories" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                            All categories <ChevronRight size={14} />
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {genres.slice(0, 8).map(genre => (
                            <Link key={genre.id} href={`/flashcards/categories?genreId=${genre.id}`}>
                                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 hover:border-indigo-100 dark:hover:border-indigo-800 hover:shadow-md shadow-sm transition-all group cursor-pointer">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mb-3 group-hover:bg-indigo-100 transition-colors">
                                        <Folder size={18} className="text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <h3 className="font-black text-gray-800 dark:text-white text-sm truncate group-hover:text-indigo-600 transition-colors">
                                        {genre.name}
                                    </h3>
                                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wide">
                                        {genre.subCategoryCount} sub-categories
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const FlashcardsPage = () => <Layout content={<FlashcardDashboard />} />;
export default FlashcardsPage;
