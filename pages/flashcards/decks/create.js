import Layout from "@/components/layout/Layout";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Loader2, Globe, Lock, Save, Layers } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import flashcardService from "../../../services/flashcard.service";
import RichBlockEditor, { BLOCK_TYPES, toApiBlock } from "../../../components/flashcards/RichBlockEditor";

const emptyBlock = () => ({ contentType: 'HTML', content: '', metadata: '' });
const emptyCard  = () => ({ question: '', answerBlocks: [emptyBlock()] });

// ── Single Flashcard Editor ────────────────────────────────────────────────────
const CardEditor = ({ card, cardIdx, onChange, onRemove, canRemove }) => {
    const updateBlock = (bIdx, updated) => {
        const blocks = [...card.answerBlocks];
        blocks[bIdx] = updated;
        onChange({ ...card, answerBlocks: blocks });
    };

    const addBlock = () => onChange({ ...card, answerBlocks: [...card.answerBlocks, emptyBlock()] });
    const removeBlock = (bIdx) => onChange({ ...card, answerBlocks: card.answerBlocks.filter((_, i) => i !== bIdx) });

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Card #{cardIdx + 1}</span>
                {canRemove && (
                    <button
                        type="button"
                        onClick={onRemove}
                        className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-rose-500 transition-colors"
                    >
                        <Trash2 size={13} /> Remove card
                    </button>
                )}
            </div>

            <div className="p-5 space-y-5">
                {/* Question — uses RichBlockEditor in HTML mode inline */}
                <div>
                    <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block mb-2">
                        Question
                    </label>
                    <RichBlockEditor
                        block={{ contentType: 'HTML', content: card.question, metadata: '' }}
                        onChange={updated => onChange({ ...card, question: updated.content })}
                        canRemove={false}
                    />
                </div>

                {/* Answer blocks */}
                <div>
                    <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block mb-2">
                        Answer Blocks
                    </label>
                    <div className="space-y-3">
                        {card.answerBlocks.map((block, bIdx) => (
                            <RichBlockEditor
                                key={bIdx}
                                block={block}
                                onChange={updated => updateBlock(bIdx, updated)}
                                onRemove={() => removeBlock(bIdx)}
                                canRemove={card.answerBlocks.length > 1}
                            />
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={addBlock}
                        className="mt-3 flex items-center gap-1.5 text-xs font-bold text-indigo-500 hover:text-indigo-700 transition-colors"
                    >
                        <Plus size={13} /> Add answer block
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Main Create Page ───────────────────────────────────────────────────────────
const CreateDeckContent = () => {
    const { user } = useAuth();
    const router = useRouter();

    const [genres, setGenres]             = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [deck, setDeck]                 = useState({ title: '', description: '', categoryRefId: '', status: 'ACTIVE', isPublic: false });
    const [selectedGenreRefId, setSelectedGenreRefId] = useState('');
    const [flashcards, setFlashcards]     = useState([emptyCard()]);
    const [saving, setSaving]             = useState(false);
    const [error, setError]               = useState('');

    useEffect(() => {
        flashcardService.getAllGenres()
            .then(res => setGenres(res?.data ?? []))
            .catch(console.error);
    }, []);

    const handleGenreChange = async (refId) => {
        setSelectedGenreRefId(refId);
        setDeck(d => ({ ...d, categoryRefId: refId }));
        setSubCategories([]);
        if (!refId) return;
        try {
            const res = await flashcardService.getCategoryById(refId);
            setSubCategories(res?.data?.subCategories ?? []);
        } catch (err) {
            console.error(err);
        }
    };

    const updateCard = (idx, updated) => {
        const cards = [...flashcards];
        cards[idx] = updated;
        setFlashcards(cards);
    };

    const addCard    = () => setFlashcards(prev => [...prev, emptyCard()]);
    const removeCard = (idx) => setFlashcards(prev => prev.filter((_, i) => i !== idx));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!deck.title.trim()) return setError('Deck title is required.');
        if (flashcards.some(c => !c.question.trim())) return setError('All cards must have a question.');

        setSaving(true);
        try {
            const deckRes = await flashcardService.createDeck({
                title: deck.title,
                description: deck.description,
                categoryRefId: deck.categoryRefId || null,
                status: deck.status,
                isPublic: deck.isPublic,
            });
            const deckRefId = deckRes?.data?.refId;
            if (!deckRefId) throw new Error('Failed to create deck');

            for (let i = 0; i < flashcards.length; i++) {
                const card = flashcards[i];
                await flashcardService.createFlashcard(deckRefId, {
                    question: card.question,
                    answerBlocks: card.answerBlocks
                        .filter(b => b.content?.trim())
                        .map((b, bIdx) => toApiBlock(b, bIdx)),
                    orderIndex: i,
                    tags: [],
                });
            }

            router.push(`/flashcards/decks/${deckRefId}`);
        } catch (err) {
            console.error(err);
            setError('Something went wrong. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/flashcards/decks" className="p-2 rounded-xl text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all">
                    <ArrowLeft size={18} />
                </Link>
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">Create Deck</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-0.5 font-medium text-sm">Fill in deck details and add your flashcards.</p>
                </div>
            </div>

            {error && (
                <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 rounded-xl px-4 py-3 text-sm font-bold text-rose-600">
                    {error}
                </div>
            )}

            {/* ── Section 1: Deck Info ── */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 space-y-5">
                <h2 className="text-base font-black text-gray-800 dark:text-white flex items-center gap-2">
                    <Layers size={18} className="text-indigo-500" /> Deck Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Title *</label>
                        <input
                            type="text"
                            value={deck.title}
                            onChange={e => setDeck(d => ({ ...d, title: e.target.value }))}
                            placeholder="e.g. Linear Algebra Fundamentals"
                            className="w-full text-sm bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-400/30 outline-none"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Description</label>
                        <textarea
                            value={deck.description}
                            onChange={e => setDeck(d => ({ ...d, description: e.target.value }))}
                            rows={2}
                            placeholder="A short description of what this deck covers…"
                            className="w-full text-sm bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-400/30 outline-none resize-none"
                        />
                    </div>

                    {/* Genre */}
                    <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Genre</label>
                        <select
                            value={selectedGenreRefId}
                            onChange={e => handleGenreChange(e.target.value)}
                            className="w-full text-sm bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-400/30 outline-none"
                        >
                            <option value="">— None —</option>
                            {genres.map(g => <option key={g.refId} value={g.refId}>{g.name}</option>)}
                        </select>
                    </div>

                    {/* Sub-category */}
                    <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Topic / Sub-category</label>
                        <select
                            value={deck.categoryRefId}
                            onChange={e => setDeck(d => ({ ...d, categoryRefId: e.target.value }))}
                            disabled={!selectedGenreRefId || subCategories.length === 0}
                            className="w-full text-sm bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-400/30 outline-none disabled:opacity-40"
                        >
                            <option value={selectedGenreRefId || ''}>— Genre level —</option>
                            {subCategories.map(s => <option key={s.refId} value={s.refId}>{s.name}</option>)}
                        </select>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Status</label>
                        <select
                            value={deck.status}
                            onChange={e => setDeck(d => ({ ...d, status: e.target.value }))}
                            className="w-full text-sm bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-400/30 outline-none"
                        >
                            <option value="ACTIVE">Active</option>
                            <option value="DRAFT">Draft</option>
                            <option value="ARCHIVED">Archived</option>
                        </select>
                    </div>

                    {/* Visibility */}
                    <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Visibility</label>
                        <div className="flex gap-2">
                            {[
                                { val: false, label: 'Private', Icon: Lock },
                                { val: true,  label: 'Public',  Icon: Globe },
                            ].map(({ val, label, Icon }) => (
                                <button
                                    key={label}
                                    type="button"
                                    onClick={() => setDeck(d => ({ ...d, isPublic: val }))}
                                    className={`flex items-center gap-2 flex-1 justify-center py-2.5 rounded-xl border text-sm font-bold transition-all ${
                                        deck.isPublic === val
                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100 dark:shadow-none'
                                            : 'bg-gray-50 dark:bg-gray-700 text-gray-400 border-gray-100 dark:border-gray-600 hover:border-indigo-200'
                                    }`}
                                >
                                    <Icon size={14} /> {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Section 2: Flashcards ── */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-black text-gray-800 dark:text-white">
                        Flashcards <span className="text-gray-400 font-bold text-sm">({flashcards.length})</span>
                    </h2>
                </div>

                {flashcards.map((card, idx) => (
                    <CardEditor
                        key={idx}
                        card={card}
                        cardIdx={idx}
                        onChange={updated => updateCard(idx, updated)}
                        onRemove={() => removeCard(idx)}
                        canRemove={flashcards.length > 1}
                    />
                ))}

                <button
                    type="button"
                    onClick={addCard}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-400 hover:border-indigo-300 hover:text-indigo-500 dark:hover:border-indigo-700 dark:hover:text-indigo-400 font-bold text-sm transition-all"
                >
                    <Plus size={18} /> Add Flashcard
                </button>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end gap-3 pb-4">
                <Link href="/flashcards/decks">
                    <button type="button" className="px-6 py-3 rounded-xl border border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                        Cancel
                    </button>
                </Link>
                <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 dark:shadow-none transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {saving ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : <><Save size={16} /> Save Deck</>}
                </button>
            </div>
        </form>
    );
};

const CreateDeckPage = () => <Layout content={<CreateDeckContent />} />;
export default CreateDeckPage;
