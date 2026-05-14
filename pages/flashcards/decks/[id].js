import Layout from "@/components/layout/Layout";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
    ArrowLeft, BookOpen, Globe, Lock, Layers, List, GraduationCap,
    Loader2, Trash2, Plus, ChevronDown, ChevronUp, Edit3, Check, Save, X
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import flashcardService from "../../../services/flashcard.service";
import StudyCard from "../../../components/flashcards/StudyCard";
import ContentBlockRenderer from "../../../components/flashcards/ContentBlockRenderer";

// ── Status badge ───────────────────────────────────────────────────────────────
const STATUS_STYLES = {
    ACTIVE:   { bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-600', label: 'Active' },
    DRAFT:    { bg: 'bg-amber-50 dark:bg-amber-900/30',     text: 'text-amber-600',   label: 'Draft' },
    ARCHIVED: { bg: 'bg-gray-50 dark:bg-gray-700',          text: 'text-gray-400',    label: 'Archived' },
};

// ── List-mode card ─────────────────────────────────────────────────────────────
const FlashcardListItem = ({ card, cardIdx, onDelete }) => {
    const [open, setOpen] = useState(false);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-start gap-4 p-5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
            >
                <span className="shrink-0 w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-[10px] font-black text-indigo-600 mt-0.5">
                    {cardIdx + 1}
                </span>
                <div
                    className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200 prose prose-sm max-w-none dark:prose-invert line-clamp-2"
                    dangerouslySetInnerHTML={{ __html: card.question }}
                />
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={e => { e.stopPropagation(); onDelete(card.id); }}
                        className="p-1.5 text-gray-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                        <Trash2 size={14} />
                    </button>
                    {open ? <ChevronUp size={16} className="text-gray-300" /> : <ChevronDown size={16} className="text-gray-300" />}
                </div>
            </button>

            {open && (
                <div className="border-t border-gray-50 dark:border-gray-700 px-5 py-4 space-y-4 bg-indigo-50/30 dark:bg-indigo-950/10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Answer</p>
                    {card.answerBlocks?.length > 0
                        ? card.answerBlocks.map((block, i) => (
                            <ContentBlockRenderer key={i} block={block} />
                        ))
                        : <p className="text-xs text-gray-400 italic">No answer provided.</p>
                    }
                    {card.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                            {card.tags.map((tag, i) => (
                                <span key={i} className="text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-500 px-2 py-0.5 rounded-full uppercase tracking-wide">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ── Quick add flashcard form ───────────────────────────────────────────────────
const QuickAddForm = ({ deckId, onAdded }) => {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [saving, setSaving] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        if (!question.trim()) return;
        setSaving(true);
        try {
            const res = await flashcardService.createFlashcard(deckId, {
                question,
                answerBlocks: answer.trim() ? [{ contentType: 'HTML', content: answer, orderIndex: 0 }] : [],
                orderIndex: 0,
                tags: [],
            });
            onAdded(res?.data);
            setQuestion('');
            setAnswer('');
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={submit} className="bg-white dark:bg-gray-800 rounded-2xl border border-indigo-100 dark:border-indigo-900 shadow-sm p-5 space-y-3">
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">New Card</p>
            <textarea
                value={question}
                onChange={e => setQuestion(e.target.value)}
                rows={2}
                placeholder="Question (HTML supported)…"
                className="w-full text-sm bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-700 dark:text-gray-300 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            />
            <textarea
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                rows={2}
                placeholder="Answer (HTML supported)…"
                className="w-full text-sm bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-700 dark:text-gray-300 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            />
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={saving || !question.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                    Add Card
                </button>
            </div>
        </form>
    );
};

// ── Main Deck Detail Page ──────────────────────────────────────────────────────
const DeckDetailContent = () => {
    const router = useRouter();
    const { id } = router.query;
    const { user } = useAuth();

    const [deck, setDeck] = useState(null);
    const [flashcards, setFlashcards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mode, setMode] = useState('list');   // 'list' | 'study'
    const [studyIdx, setStudyIdx] = useState(0);
    const [showAddForm, setShowAddForm] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        flashcardService.getDeckById(id)
            .then(res => {
                const d = res?.data;
                setDeck(d);
                setFlashcards(d?.flashcards ?? []);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    const handleDeleteCard = async (cardId) => {
        if (!confirm('Delete this flashcard?')) return;
        try {
            await flashcardService.deleteFlashcard(cardId);
            setFlashcards(prev => prev.filter(c => c.id !== cardId));
        } catch (err) {
            console.error(err);
            alert('Failed to delete card.');
        }
    };

    const handleDeleteDeck = async () => {
        if (!confirm('Delete this entire deck and all its flashcards? This cannot be undone.')) return;
        setDeleting(true);
        try {
            await flashcardService.deleteDeck(id);
            router.push('/flashcards/decks');
        } catch (err) {
            console.error(err);
            alert('Failed to delete deck.');
            setDeleting(false);
        }
    };

    const handleCardAdded = (newCard) => {
        if (newCard) setFlashcards(prev => [...prev, newCard]);
        setShowAddForm(false);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32">
                <Loader2 className="animate-spin text-indigo-500 mb-3" size={36} />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading deck…</p>
            </div>
        );
    }

    if (!deck) {
        return (
            <div className="flex flex-col items-center justify-center py-32">
                <p className="font-black text-gray-400 text-sm uppercase tracking-widest mb-4">Deck not found</p>
                <Link href="/flashcards/decks">
                    <button className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm">
                        <ArrowLeft size={14} /> Back to Decks
                    </button>
                </Link>
            </div>
        );
    }

    const status = STATUS_STYLES[deck.status] || STATUS_STYLES.ACTIVE;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start gap-5 justify-between">
                <div className="flex items-start gap-4">
                    <Link href="/flashcards/decks" className="p-2 rounded-xl text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all mt-1 shrink-0">
                        <ArrowLeft size={18} />
                    </Link>
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg ${status.bg} ${status.text}`}>
                                {status.label}
                            </span>
                            {deck.isPublic
                                ? <span className="flex items-center gap-1 text-[10px] font-black text-emerald-500 uppercase tracking-wide"><Globe size={10} /> Public</span>
                                : <span className="flex items-center gap-1 text-[10px] font-black text-gray-400 uppercase tracking-wide"><Lock size={10} /> Private</span>
                            }
                            {deck.categoryName && (
                                <span className="text-[10px] font-bold bg-slate-50 dark:bg-slate-700 text-slate-500 px-2.5 py-1 rounded-lg uppercase tracking-wide">
                                    {deck.categoryName}
                                </span>
                            )}
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">{deck.title}</h1>
                        {deck.description && (
                            <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium text-sm max-w-2xl">{deck.description}</p>
                        )}
                        <p className="text-xs text-gray-400 font-bold mt-2 flex items-center gap-1">
                            <BookOpen size={12} /> {flashcards.length} card{flashcards.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={handleDeleteDeck}
                        disabled={deleting}
                        className="flex items-center gap-2 px-4 py-2.5 border border-rose-100 dark:border-rose-900 text-rose-500 rounded-xl font-bold text-sm hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all disabled:opacity-50"
                    >
                        {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        Delete Deck
                    </button>
                </div>
            </div>

            {/* Mode toggle */}
            {flashcards.length > 0 && (
                <div className="flex gap-1 bg-gray-50 dark:bg-gray-800 rounded-xl p-1 border border-gray-100 dark:border-gray-700 w-fit">
                    <button
                        onClick={() => { setMode('list'); setStudyIdx(0); }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wide transition-all ${mode === 'list' ? 'bg-white dark:bg-gray-700 text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                    >
                        <List size={14} /> List View
                    </button>
                    <button
                        onClick={() => { setMode('study'); setStudyIdx(0); }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wide transition-all ${mode === 'study' ? 'bg-white dark:bg-gray-700 text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                    >
                        <GraduationCap size={14} /> Study Mode
                    </button>
                </div>
            )}

            {/* ── Study Mode ── */}
            {mode === 'study' && flashcards.length > 0 && (
                <StudyCard
                    flashcard={flashcards[studyIdx]}
                    currentIndex={studyIdx}
                    total={flashcards.length}
                    onPrev={() => setStudyIdx(i => Math.max(0, i - 1))}
                    onNext={() => setStudyIdx(i => Math.min(flashcards.length - 1, i + 1))}
                />
            )}

            {/* ── List Mode ── */}
            {mode === 'list' && (
                <div className="space-y-3">
                    {flashcards.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                            <Layers size={36} className="text-gray-200 dark:text-gray-700 mb-3" />
                            <p className="font-black text-gray-400 text-sm uppercase tracking-widest mb-4">No flashcards yet</p>
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
                            >
                                <Plus size={14} /> Add first card
                            </button>
                        </div>
                    ) : (
                        flashcards.map((card, idx) => (
                            <FlashcardListItem
                                key={card.id}
                                card={card}
                                cardIdx={idx}
                                onDelete={handleDeleteCard}
                            />
                        ))
                    )}

                    {/* Add card button / quick form */}
                    {!showAddForm ? (
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-400 hover:border-indigo-300 hover:text-indigo-500 dark:hover:border-indigo-700 dark:hover:text-indigo-400 font-bold text-sm transition-all"
                        >
                            <Plus size={16} /> Add Flashcard
                        </button>
                    ) : (
                        <div className="relative">
                            <button
                                onClick={() => setShowAddForm(false)}
                                className="absolute top-4 right-4 z-10 p-1.5 text-gray-300 hover:text-gray-500 rounded-lg transition-colors"
                            >
                                <X size={16} />
                            </button>
                            <QuickAddForm deckId={id} onAdded={handleCardAdded} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const DeckDetailPage = () => <Layout content={<DeckDetailContent />} />;
export default DeckDetailPage;
