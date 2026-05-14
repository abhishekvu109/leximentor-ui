import { useState, useEffect } from 'react';
import ContentBlockRenderer from './ContentBlockRenderer';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

const StudyCard = ({ flashcard, currentIndex, total, onNext, onPrev }) => {
    const [flipped, setFlipped] = useState(false);

    // Reset flip whenever the card changes
    useEffect(() => {
        setFlipped(false);
    }, [currentIndex]);

    return (
        <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto">
            {/* Progress */}
            <div className="w-full flex items-center gap-3">
                <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                    <div
                        className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                        style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
                    />
                </div>
                <span className="text-xs font-black text-gray-400 shrink-0">
                    {currentIndex + 1} / {total}
                </span>
            </div>

            {/* 3-D flip card */}
            <div
                className="w-full cursor-pointer select-none"
                style={{ perspective: '1200px', minHeight: '300px' }}
                onClick={() => setFlipped(f => !f)}
            >
                <div
                    className="relative w-full"
                    style={{
                        transformStyle: 'preserve-3d',
                        transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                        transition: 'transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)',
                        minHeight: '300px',
                    }}
                >
                    {/* ── Front (Question) ── */}
                    <div
                        className="absolute inset-0 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-lg p-8 flex flex-col"
                        style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                    >
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-5">
                            Question
                        </span>
                        <div
                            className="flex-1 prose prose-sm max-w-none dark:prose-invert text-gray-800 dark:text-white overflow-auto"
                            dangerouslySetInnerHTML={{ __html: flashcard.question }}
                        />
                        <p className="text-[10px] text-gray-300 dark:text-gray-600 text-center mt-6 font-medium">
                            Click anywhere to reveal answer
                        </p>
                    </div>

                    {/* ── Back (Answer) ── */}
                    <div
                        className="absolute inset-0 bg-indigo-50 dark:bg-indigo-950/30 rounded-3xl border border-indigo-100 dark:border-indigo-900 shadow-lg p-8 flex flex-col"
                        style={{
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)',
                        }}
                    >
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-5">
                            Answer
                        </span>
                        <div className="flex-1 space-y-4 overflow-auto">
                            {flashcard.answerBlocks?.length > 0
                                ? flashcard.answerBlocks.map((block, i) => (
                                    <ContentBlockRenderer key={i} block={block} />
                                ))
                                : (
                                    <p className="text-sm text-gray-400 italic">No answer provided for this card.</p>
                                )
                            }
                        </div>
                    </div>
                </div>
            </div>

            {/* Tags */}
            {flashcard.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center">
                    {flashcard.tags.map((tag, i) => (
                        <span key={i} className="text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-full uppercase tracking-wide">
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center gap-3">
                <button
                    onClick={onPrev}
                    disabled={currentIndex === 0}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                    <ChevronLeft size={16} /> Prev
                </button>
                <button
                    onClick={() => setFlipped(f => !f)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-indigo-600 dark:text-indigo-400 font-bold text-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all"
                >
                    <RotateCcw size={14} /> Flip
                </button>
                <button
                    onClick={onNext}
                    disabled={currentIndex === total - 1}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-100 dark:shadow-none"
                >
                    Next <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default StudyCard;
