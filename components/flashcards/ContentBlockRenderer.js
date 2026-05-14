import { useEffect, useState } from 'react';

const parseMeta = (raw) => { try { return raw ? JSON.parse(raw) : {}; } catch { return {}; } };

// ── LaTeX rendered via katex ──────────────────────────────────────────────────
const LatexDisplay = ({ content }) => {
    const [html, setHtml] = useState('');
    const [err, setErr]   = useState('');

    useEffect(() => {
        if (!content?.trim()) return;
        import('katex').then(({ default: katex }) => {
            try {
                setHtml(katex.renderToString(content, { throwOnError: true, displayMode: true }));
                setErr('');
            } catch (e) {
                setErr(content); // fall back to raw source
            }
        });
    }, [content]);

    if (err) {
        return (
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 font-mono text-sm text-slate-700 dark:text-slate-300 overflow-x-auto border border-slate-100 dark:border-slate-700">
                {err}
            </div>
        );
    }
    if (!html) return null;
    return (
        <div
            className="overflow-x-auto text-center py-2"
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
};

// ── Code block with macOS-style chrome ───────────────────────────────────────
const CodeDisplay = ({ content, language }) => {
    const lines = (content || '').split('\n');
    return (
        <div className="rounded-xl overflow-hidden border border-gray-700 bg-[#1e1e2e] font-mono text-xs">
            <div className="flex items-center gap-1.5 px-4 py-2 bg-[#181825] border-b border-gray-700/60">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
                {language && (
                    <span className="ml-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">{language}</span>
                )}
            </div>
            <div className="flex overflow-x-auto max-h-80">
                <div className="select-none text-right text-[#45475a] py-3 pr-3 pl-4 leading-6 border-r border-gray-700/60 bg-[#181825]/60 shrink-0 min-w-[2.5rem]">
                    {lines.map((_, i) => <div key={i}>{i + 1}</div>)}
                </div>
                <pre className="flex-1 text-[#cdd6f4] px-4 py-3 leading-6 overflow-x-auto">
                    <code>{content}</code>
                </pre>
            </div>
        </div>
    );
};

// ── Main renderer ─────────────────────────────────────────────────────────────
const ContentBlockRenderer = ({ block }) => {
    const meta = parseMeta(block.metadata);

    switch (block.contentType) {
        case 'HTML': {
            return (
                <div
                    className="prose prose-sm max-w-none dark:prose-invert text-gray-700 dark:text-gray-300"
                    dangerouslySetInnerHTML={{ __html: block.content }}
                />
            );
        }
        case 'IMAGE': {
            return (
                <div className="flex justify-center">
                    <img
                        src={block.content}
                        alt={meta.altText || (meta.type === 'sketch' ? 'Sketch' : 'Image')}
                        className="max-w-full max-h-72 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm object-contain"
                    />
                </div>
            );
        }
        case 'LATEX': {
            return <LatexDisplay content={block.content} />;
        }
        case 'CODE': {
            return <CodeDisplay content={block.content} language={meta.language} />;
        }
        case 'AUDIO': {
            return (
                <audio controls className="w-full rounded-xl">
                    <source src={block.content} />
                    Your browser does not support audio.
                </audio>
            );
        }
        case 'VIDEO': {
            return (
                <video controls className="w-full rounded-xl max-h-64">
                    <source src={block.content} />
                    Your browser does not support video.
                </video>
            );
        }
        default: {
            return <p className="text-sm text-gray-600 dark:text-gray-400">{block.content}</p>;
        }
    }
};

export default ContentBlockRenderer;
