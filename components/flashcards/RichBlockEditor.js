import dynamic from 'next/dynamic';
import { useRef, useEffect, useState, useCallback } from 'react';
import { Trash2, PenLine, Eraser, RotateCcw } from 'lucide-react';

// ── react-quill must be client-side only ──────────────────────────────────────
const ReactQuill = dynamic(() => import('react-quill'), {
    ssr: false,
    loading: () => (
        <div className="h-32 rounded-xl bg-gray-50 dark:bg-gray-700 animate-pulse border border-gray-100 dark:border-gray-600" />
    ),
});

const QUILL_MODULES = {
    toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ indent: '-1' }, { indent: '+1' }],
        ['blockquote', 'code-block'],
        ['link'],
        ['clean'],
    ],
};

const QUILL_FORMATS = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'list', 'bullet', 'indent',
    'blockquote', 'code-block', 'link',
];

// ── Block type definitions ────────────────────────────────────────────────────
export const BLOCK_TYPES = [
    { value: 'HTML',   label: 'Text / HTML', hint: 'Rich text with formatting toolbar' },
    { value: 'CODE',   label: 'Code',        hint: 'Code snippet with syntax styling' },
    { value: 'LATEX',  label: 'LaTeX',       hint: 'Mathematical expression (live preview)' },
    { value: 'SKETCH', label: 'Sketch',      hint: 'Freehand drawing canvas' },
    { value: 'IMAGE',  label: 'Image URL',   hint: 'Link to a public image' },
    { value: 'AUDIO',  label: 'Audio',       hint: 'Public audio file URL' },
    { value: 'VIDEO',  label: 'Video',       hint: 'Public video file URL' },
];

// Map SKETCH → IMAGE for API submission
export const toApiBlock = (block, orderIndex) => ({
    contentType: block.contentType === 'SKETCH' ? 'IMAGE' : block.contentType,
    content: block.content,
    metadata: block.contentType === 'SKETCH'
        ? JSON.stringify({ type: 'sketch', ...(block.metadata ? tryParse(block.metadata) : {}) })
        : block.metadata || null,
    orderIndex,
});

const tryParse = (str) => { try { return JSON.parse(str); } catch { return {}; } };
const getMeta  = (block, key) => tryParse(block.metadata || '{}')[key] || '';

// ── HTML editor (react-quill) ─────────────────────────────────────────────────
const HtmlEditor = ({ value, onChange }) => (
    <div className="rich-editor-wrap">
        <ReactQuill
            theme="snow"
            value={value}
            onChange={onChange}
            modules={QUILL_MODULES}
            formats={QUILL_FORMATS}
            className="bg-white dark:bg-gray-800 rounded-b-xl"
        />
    </div>
);

// ── Code editor with line numbers ─────────────────────────────────────────────
const CodeEditor = ({ value, onChange }) => {
    const lineCount = Math.max((value || '').split('\n').length, 5);

    return (
        <div className="rounded-xl overflow-hidden border border-gray-700 bg-[#1e1e2e] font-mono text-sm">
            {/* macOS-style title bar */}
            <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[#181825] border-b border-gray-700/60">
                <span className="w-3 h-3 rounded-full bg-red-400/80" />
                <span className="w-3 h-3 rounded-full bg-yellow-400/80" />
                <span className="w-3 h-3 rounded-full bg-green-400/80" />
            </div>
            {/* Code area with line numbers */}
            <div className="flex overflow-auto max-h-80">
                <div
                    aria-hidden
                    className="select-none text-right text-[#45475a] text-xs py-3 pr-3 pl-4 leading-6 border-r border-gray-700/60 bg-[#181825]/60 shrink-0 min-w-[2.5rem]"
                >
                    {Array.from({ length: lineCount }, (_, i) => (
                        <div key={i}>{i + 1}</div>
                    ))}
                </div>
                <textarea
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    spellCheck={false}
                    rows={lineCount}
                    className="flex-1 bg-transparent text-[#cdd6f4] text-xs px-4 py-3 outline-none resize-none leading-6 caret-indigo-400"
                />
            </div>
        </div>
    );
};

// ── LaTeX editor with live katex preview ──────────────────────────────────────
const LatexEditor = ({ value, onChange }) => {
    const [html, setHtml]   = useState('');
    const [err, setErr]     = useState('');

    useEffect(() => {
        if (!value?.trim()) { setHtml(''); setErr(''); return; }
        import('katex').then(({ default: katex }) => {
            try {
                setHtml(katex.renderToString(value, { throwOnError: true, displayMode: true }));
                setErr('');
            } catch (e) {
                setErr(e.message);
            }
        });
    }, [value]);

    return (
        <div className="space-y-2">
            <textarea
                value={value}
                onChange={e => onChange(e.target.value)}
                rows={3}
                spellCheck={false}
                placeholder="\frac{a}{b} + \sqrt{x^2 + y^2}"
                className="w-full text-sm bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-600 rounded-xl px-3 py-2.5 text-gray-700 dark:text-gray-300 font-mono resize-none focus:ring-2 focus:ring-indigo-400/30 outline-none"
            />
            {(html || err) && (
                <div className={`px-5 py-4 rounded-xl border text-center overflow-x-auto ${
                    err
                        ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800'
                        : 'bg-gray-50 dark:bg-gray-800/80 border-gray-100 dark:border-gray-700'
                }`}>
                    {err
                        ? <p className="text-xs text-rose-600 font-mono">{err}</p>
                        : <div dangerouslySetInnerHTML={{ __html: html }} />
                    }
                </div>
            )}
        </div>
    );
};

// ── Sketch canvas ─────────────────────────────────────────────────────────────
const PALETTE = ['#000000', '#374151', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#ffffff'];

const SketchCanvas = ({ value, onChange }) => {
    const canvasRef   = useRef(null);
    const isDown      = useRef(false);
    const lastPt      = useRef(null);
    const [color, setColor]   = useState('#000000');
    const [size, setSize]     = useState(3);
    const [tool, setTool]     = useState('pen');

    // Initialise canvas from existing value (base64 or empty)
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        if (value?.startsWith('data:image')) {
            const img = new Image();
            img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            img.src = value;
        }
    }, []); // intentionally run once on mount

    const getPos = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const sx = canvas.width  / rect.width;
        const sy = canvas.height / rect.height;
        const src = e.touches ? e.touches[0] : e;
        return { x: (src.clientX - rect.left) * sx, y: (src.clientY - rect.top) * sy };
    };

    const startDraw = (e) => {
        e.preventDefault();
        isDown.current = true;
        lastPt.current = getPos(e);
    };

    const draw = useCallback((e) => {
        e.preventDefault();
        if (!isDown.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const pt = getPos(e);
        ctx.beginPath();
        ctx.moveTo(lastPt.current.x, lastPt.current.y);
        ctx.lineTo(pt.x, pt.y);
        ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
        ctx.lineWidth   = tool === 'eraser' ? size * 5 : size;
        ctx.lineCap     = 'round';
        ctx.lineJoin    = 'round';
        ctx.stroke();
        lastPt.current = pt;
    }, [tool, color, size]);

    const endDraw = () => {
        if (!isDown.current) return;
        isDown.current = false;
        lastPt.current = null;
        onChange(canvasRef.current.toDataURL('image/png'));
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        onChange('');
    };

    return (
        <div className="space-y-2.5">
            {/* Toolbar */}
            <div className="flex items-center gap-2 flex-wrap bg-gray-50 dark:bg-gray-700/50 rounded-xl px-3 py-2">
                {/* Tool buttons */}
                <button
                    type="button"
                    onClick={() => setTool('pen')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${tool === 'pen' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:bg-white dark:hover:bg-gray-600'}`}
                >
                    <PenLine size={12} /> Pen
                </button>
                <button
                    type="button"
                    onClick={() => setTool('eraser')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${tool === 'eraser' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:bg-white dark:hover:bg-gray-600'}`}
                >
                    <Eraser size={12} /> Eraser
                </button>

                {/* Colour palette */}
                <div className="flex items-center gap-1 ml-1">
                    {PALETTE.map(c => (
                        <button
                            key={c}
                            type="button"
                            title={c}
                            onClick={() => { setColor(c); setTool('pen'); }}
                            className={`w-5 h-5 rounded-full transition-all ${color === c && tool === 'pen' ? 'ring-2 ring-offset-1 ring-indigo-500 scale-110' : 'hover:scale-110'} ${c === '#ffffff' ? 'border border-gray-300' : ''}`}
                            style={{ backgroundColor: c }}
                        />
                    ))}
                </div>

                {/* Brush size */}
                <div className="flex items-center gap-2 ml-auto">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Size</span>
                    <input
                        type="range" min={1} max={24} value={size}
                        onChange={e => setSize(Number(e.target.value))}
                        className="w-20 accent-indigo-500 h-1"
                    />
                    <span className="text-xs text-gray-400 w-4 text-center">{size}</span>
                </div>

                {/* Clear */}
                <button
                    type="button"
                    onClick={clearCanvas}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
                >
                    <RotateCcw size={12} /> Clear
                </button>
            </div>

            {/* Canvas */}
            <canvas
                ref={canvasRef}
                width={900}
                height={420}
                className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-600 touch-none cursor-crosshair bg-white"
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={endDraw}
                onMouseLeave={endDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={endDraw}
            />
        </div>
    );
};

// ── Main RichBlockEditor ──────────────────────────────────────────────────────
const RichBlockEditor = ({ block, onChange, onRemove, canRemove }) => {
    const setContent  = (val) => onChange({ ...block, content: val });
    const updateMeta  = (key, val) => {
        const m = tryParse(block.metadata || '{}');
        onChange({ ...block, metadata: JSON.stringify({ ...m, [key]: val }) });
    };

    return (
        <div className="border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
            {/* Block header: type selector */}
            <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 dark:bg-gray-700/60 border-b border-gray-100 dark:border-gray-700">
                <select
                    value={block.contentType}
                    onChange={e => onChange({ ...block, contentType: e.target.value, content: '', metadata: '' })}
                    className="text-xs font-black bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg px-2.5 py-1.5 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-400/30 outline-none cursor-pointer"
                >
                    {BLOCK_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                </select>
                <span className="text-[10px] text-gray-400 italic flex-1 hidden sm:block truncate">
                    {BLOCK_TYPES.find(t => t.value === block.contentType)?.hint}
                </span>
                {canRemove && (
                    <button
                        type="button"
                        onClick={onRemove}
                        className="p-1.5 text-gray-300 hover:text-rose-500 dark:text-gray-600 dark:hover:text-rose-400 transition-colors rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20"
                    >
                        <Trash2 size={14} />
                    </button>
                )}
            </div>

            {/* Editor area */}
            <div className="p-3">
                {block.contentType === 'HTML' && (
                    <HtmlEditor value={block.content} onChange={setContent} />
                )}

                {block.contentType === 'CODE' && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                placeholder="Language (e.g. python, java, sql)"
                                value={getMeta(block, 'language')}
                                onChange={e => updateMeta('language', e.target.value)}
                                className="w-48 text-xs bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-lg px-3 py-1.5 text-gray-600 dark:text-gray-300 focus:ring-2 focus:ring-indigo-400/30 outline-none font-mono"
                            />
                            {getMeta(block, 'language') && (
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                                    {getMeta(block, 'language')}
                                </span>
                            )}
                        </div>
                        <CodeEditor value={block.content} onChange={setContent} />
                    </div>
                )}

                {block.contentType === 'LATEX' && (
                    <LatexEditor value={block.content} onChange={setContent} />
                )}

                {block.contentType === 'SKETCH' && (
                    <SketchCanvas value={block.content} onChange={setContent} />
                )}

                {block.contentType === 'IMAGE' && (
                    <div className="space-y-2">
                        <input
                            type="text"
                            placeholder="https://example.com/image.png"
                            value={block.content}
                            onChange={e => setContent(e.target.value)}
                            className="w-full text-sm bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-600 rounded-xl px-3 py-2.5 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-400/30 outline-none"
                        />
                        <input
                            type="text"
                            placeholder="Alt text (optional)"
                            value={getMeta(block, 'altText')}
                            onChange={e => updateMeta('altText', e.target.value)}
                            className="w-full text-xs bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-xl px-3 py-2 text-gray-500 dark:text-gray-400 focus:ring-2 focus:ring-indigo-400/30 outline-none"
                        />
                        {block.content && (
                            <img
                                src={block.content}
                                alt={getMeta(block, 'altText') || 'preview'}
                                className="max-h-40 rounded-xl object-cover border border-gray-100 dark:border-gray-700"
                                onError={e => { e.currentTarget.style.display = 'none'; }}
                            />
                        )}
                    </div>
                )}

                {(block.contentType === 'AUDIO' || block.contentType === 'VIDEO') && (
                    <div className="space-y-2">
                        <input
                            type="text"
                            placeholder={`https://example.com/file.${block.contentType === 'AUDIO' ? 'mp3' : 'mp4'}`}
                            value={block.content}
                            onChange={e => setContent(e.target.value)}
                            className="w-full text-sm bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-600 rounded-xl px-3 py-2.5 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-400/30 outline-none"
                        />
                        {block.content && block.contentType === 'AUDIO' && (
                            <audio controls src={block.content} className="w-full rounded-xl" />
                        )}
                        {block.content && block.contentType === 'VIDEO' && (
                            <video controls src={block.content} className="w-full rounded-xl max-h-40" />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RichBlockEditor;
