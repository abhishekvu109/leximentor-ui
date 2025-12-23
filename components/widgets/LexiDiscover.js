import React, { useState, useEffect } from "react";
import { Sparkles, RefreshCw, Eye, EyeOff, BookOpen, ChevronRight } from "lucide-react";

const LexiDiscover = ({ wordsData }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isRevealed, setIsRevealed] = useState(false);
    const [currentWord, setCurrentWord] = useState(null);

    const words = wordsData?.data || [];

    useEffect(() => {
        if (words.length > 0) {
            const randomIndex = Math.floor(Math.random() * words.length);
            setCurrentIndex(randomIndex);
            setCurrentWord(words[randomIndex]);
        }
    }, [words]);

    const handleNext = () => {
        setIsRevealed(false);
        const nextIndex = Math.floor(Math.random() * words.length);
        setCurrentIndex(nextIndex);
        setCurrentWord(words[nextIndex]);
    };

    if (!currentWord) return (
        <div className="h-full flex items-center justify-center p-6 bg-indigo-50 rounded-2xl border border-dashed border-indigo-200">
            <div className="text-center">
                <Sparkles className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                <p className="text-sm text-indigo-600 font-medium">Add some words to start discovery!</p>
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
            {/* Background Decoration */}
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500" />

            <div className="flex justify-between items-center mb-6 relative z-10">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-200" />
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-100">Lexi-Discover</span>
                </div>
                <button
                    onClick={handleNext}
                    className="p-2 hover:bg-white/10 rounded-xl transition-colors active:scale-95"
                    title="Next Word"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            <div className="flex-1 flex flex-col justify-center items-center text-center relative z-10">
                <h2 className="text-4xl font-black mb-2 tracking-tight">
                    {currentWord.word}
                </h2>

                <div className="mt-4 w-full">
                    {isRevealed ? (
                        <div className="animate-in fade-in zoom-in duration-300">
                            <p className="text-indigo-100 text-sm leading-relaxed mb-4 max-w-[250px] mx-auto italic">
                                &quot;{currentWord.meaning}&quot;
                            </p>
                            <button
                                onClick={() => setIsRevealed(false)}
                                className="flex items-center gap-2 mx-auto text-xs font-bold text-white/60 hover:text-white transition-colors"
                            >
                                <EyeOff className="w-3 h-3" /> Hide Meaning
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsRevealed(true)}
                            className="px-6 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-xs font-bold transition-all hover:scale-105 active:scale-95 border border-white/20"
                        >
                            <div className="flex items-center gap-2">
                                <Eye className="w-4 h-4" /> Reveal Meaning
                            </div>
                        </button>
                    )}
                </div>
            </div>

            <div className="mt-8 relative z-10">
                <div className="h-px w-full bg-white/10 mb-4" />
                <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-indigo-200/60">
                    <span>Part of speech</span>
                    <span className="bg-indigo-500/30 px-2 py-0.5 rounded text-white">{currentWord.pos || 'N/A'}</span>
                </div>
            </div>
        </div>
    );
};

export default LexiDiscover;
