import Layout from "@/components/layout/Layout";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Plus, Layers, Loader2, Search, ArrowLeft } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import flashcardService from "../../../services/flashcard.service";
import DeckCard from "../../../components/flashcards/DeckCard";

const STATUSES = ['All', 'ACTIVE', 'DRAFT', 'ARCHIVED'];

const MyDecksContent = () => {
    const { user } = useAuth();
    const router = useRouter();
    const { categoryId } = router.query;

    const [decks, setDecks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [deleting, setDeleting] = useState(null);

    const fetchDecks = async () => {
        if (!user?.username) return;
        setLoading(true);
        try {
            const params = categoryId
                ? { categoryId, page: 0, size: 50 }
                : { userId: user.username, page: 0, size: 50 };
            const res = await flashcardService.getDecks(params);
            setDecks(res?.data?.content ?? []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDecks();
    }, [user?.username, categoryId]);

    const handleDelete = async (id) => {
        if (!confirm('Delete this deck and all its flashcards?')) return;
        setDeleting(id);
        try {
            await flashcardService.deleteDeck(id);
            setDecks(prev => prev.filter(d => d.id !== id));
        } catch (err) {
            console.error(err);
            alert('Failed to delete deck.');
        } finally {
            setDeleting(null);
        }
    };

    const filtered = useMemo(() => {
        return decks
            .filter(d => statusFilter === 'All' || d.status === statusFilter)
            .filter(d => !search || d.title.toLowerCase().includes(search.toLowerCase()));
    }, [decks, statusFilter, search]);

    const STATUS_LABELS = { All: 'All', ACTIVE: 'Active', DRAFT: 'Draft', ARCHIVED: 'Archived' };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link href="/flashcards" className="p-2 rounded-xl text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all">
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                            {categoryId ? 'Decks in Category' : 'My Decks'}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-0.5 font-medium text-sm">
                            {decks.length} deck{decks.length !== 1 ? 's' : ''} found
                        </p>
                    </div>
                </div>
                <Link href="/flashcards/decks/create">
                    <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-100 dark:shadow-none transition-all active:scale-95 text-sm">
                        <Plus size={16} /> Create Deck
                    </button>
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl px-3 py-2.5 flex-1 max-w-sm">
                    <Search size={16} className="text-gray-300 shrink-0" />
                    <input
                        type="text"
                        placeholder="Search decks…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="bg-transparent border-none text-sm focus:ring-0 w-full placeholder-gray-300 dark:placeholder-gray-600 text-gray-700 dark:text-gray-300 font-medium"
                    />
                </div>

                {/* Status tabs */}
                <div className="flex gap-1 bg-gray-50 dark:bg-gray-800 rounded-xl p-1 border border-gray-100 dark:border-gray-700">
                    {STATUSES.map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wide transition-all ${
                                statusFilter === s
                                    ? 'bg-white dark:bg-gray-700 text-indigo-600 shadow-sm'
                                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                            }`}
                        >
                            {STATUS_LABELS[s]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Deck grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="animate-spin text-indigo-500 mb-2" size={32} />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading decks…</p>
                </div>
            ) : filtered.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map(deck => (
                        <div key={deck.id} className={deleting === deck.id ? 'opacity-40 pointer-events-none' : ''}>
                            <DeckCard deck={deck} onDelete={handleDelete} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                    <Layers size={40} className="text-gray-200 dark:text-gray-700 mb-3" />
                    <p className="font-black text-gray-400 text-sm uppercase tracking-widest mb-4">
                        {search || statusFilter !== 'All' ? 'No decks match your filter' : 'No decks yet'}
                    </p>
                    {!search && statusFilter === 'All' && (
                        <Link href="/flashcards/decks/create">
                            <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all">
                                <Plus size={16} /> Create your first deck
                            </button>
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
};

const MyDecksPage = () => <Layout content={<MyDecksContent />} />;
export default MyDecksPage;
