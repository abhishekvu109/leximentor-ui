import Link from 'next/link';
import { Layers, BookOpen, Globe, Lock, ChevronRight } from 'lucide-react';

const STATUS_STYLES = {
    ACTIVE:   { bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-600', label: 'Active' },
    DRAFT:    { bg: 'bg-amber-50 dark:bg-amber-900/30',   text: 'text-amber-600',   label: 'Draft' },
    ARCHIVED: { bg: 'bg-gray-50 dark:bg-gray-700',        text: 'text-gray-400',    label: 'Archived' },
};

const DeckCard = ({ deck, onDelete }) => {
    const status = STATUS_STYLES[deck.status] || STATUS_STYLES.ACTIVE;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-800 transition-all group flex flex-col gap-4 p-6">
            {/* Top row */}
            <div className="flex items-start justify-between">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
                    <Layers size={20} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg ${status.bg} ${status.text}`}>
                        {status.label}
                    </span>
                    {deck.isPublic
                        ? <Globe size={14} className="text-emerald-500" title="Public" />
                        : <Lock size={14} className="text-gray-300 dark:text-gray-600" title="Private" />
                    }
                </div>
            </div>

            {/* Title + description */}
            <div className="flex-1 min-w-0">
                <h3 className="font-black text-gray-800 dark:text-white truncate text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {deck.title}
                </h3>
                {deck.description && (
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                        {deck.description}
                    </p>
                )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                        <BookOpen size={12} />
                        {deck.flashcardCount ?? 0} cards
                    </span>
                    {deck.categoryName && (
                        <span className="text-[10px] font-bold bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-lg uppercase tracking-wide truncate max-w-[120px]">
                            {deck.categoryName}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-1">
                    {onDelete && (
                        <button
                            onClick={(e) => { e.preventDefault(); onDelete(deck.id); }}
                            className="p-1.5 text-gray-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            title="Delete deck"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                        </button>
                    )}
                    <Link href={`/flashcards/decks/${deck.id}`}>
                        <span className="p-1.5 text-gray-300 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all flex items-center">
                            <ChevronRight size={16} />
                        </span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default DeckCard;
