import React from 'react';
import { Edit3, ChevronLeft, ChevronRight, Copy } from 'lucide-react';

interface MarkdownEditorProps {
  value: string;
  onChange: (val: string) => void;
  wordCount: number;
  readTime: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onCopyRaw: () => void;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  wordCount,
  readTime,
  isCollapsed,
  onToggleCollapse,
  onCopyRaw,
}) => {
  if (isCollapsed) {
    return (
      <button
        onClick={onToggleCollapse}
        className="hidden lg:flex fixed left-0 top-1/2 -translate-y-1/2 z-20 items-center gap-1.5 px-2 py-3 rounded-r-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border-y border-r border-slate-700 shadow-xl transition-all"
        title="Open Markdown Editor Drawer"
      >
        <Edit3 className="w-4 h-4 text-teal-400" />
        <span className="[writing-mode:vertical-lr] rotate-180">Markdown Editor</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    );
  }

  return (
    <div className="w-full lg:w-[480px] shrink-0 flex flex-col bg-slate-900 border-r border-slate-800 h-full overflow-hidden transition-all duration-200">
      {/* Editor Header */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/95 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Edit3 className="w-4 h-4 text-teal-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">Markdown Editor</h2>
          <span className="text-[11px] font-mono text-slate-500">
            {wordCount} words · {readTime} min read
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onCopyRaw}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Copy Raw Markdown"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Collapse Editor to focus on publishing"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor Textarea */}
      <div className="flex-1 p-3 flex flex-col bg-slate-950/70">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="# Write or paste your markdown here..."
          className="flex-1 w-full h-full p-3 font-mono text-xs sm:text-[13px] leading-relaxed text-slate-200 bg-transparent resize-none border-0 focus:outline-none focus:ring-0 selection:bg-teal-500/30 placeholder:text-slate-600"
          spellCheck="false"
        />
      </div>
    </div>
  );
};
