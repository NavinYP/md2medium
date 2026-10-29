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
        className="hidden lg:flex fixed left-0 top-1/2 -translate-y-1/2 z-20 items-center gap-1.5 px-2 py-3 rounded-r-lg bg-[#2a2622] hover:bg-[#342f2b] text-[#d6cfc5] text-xs font-medium border-y border-r border-[#3f3933] shadow-lg transition-all"
        title="Open Markdown Editor"
      >
        <Edit3 className="w-3.5 h-3.5 text-[#d97706]" />
        <span className="[writing-mode:vertical-lr] rotate-180 text-[11px] tracking-wider uppercase">Editor</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    );
  }

  return (
    <div className="w-full lg:w-[460px] shrink-0 flex flex-col h-full min-h-0 bg-[#1f1c19] border-r border-[#332e29] transition-all duration-200">
      {/* Editor Header */}
      <div className="h-10 px-3.5 border-b border-[#332e29] flex items-center justify-between bg-[#26221e] shrink-0">
        <div className="flex items-center gap-2">
          <Edit3 className="w-3.5 h-3.5 text-[#d97706]" />
          <span className="text-xs font-semibold text-[#ede8df] tracking-wide">Markdown Editor</span>
          <span className="text-[11px] text-[#9c9387]">
            · {wordCount} words · {readTime} min
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onCopyRaw}
            className="p-1 rounded text-[#9c9387] hover:text-[#ede8df] hover:bg-[#342f2b] transition-colors"
            title="Copy Raw Markdown"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded text-[#9c9387] hover:text-[#ede8df] hover:bg-[#342f2b] transition-colors"
            title="Collapse Editor"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Editor Textarea Container */}
      <div className="flex-1 min-h-0 relative flex flex-col bg-[#1c1916]">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="# Write or paste your markdown here..."
          className="w-full h-full min-h-0 flex-1 p-4 font-mono text-[13px] leading-relaxed text-[#ede8df] bg-transparent resize-none border-0 focus:outline-none focus:ring-0 selection:bg-[#92400e]/50 placeholder:text-[#6e675e] overflow-y-auto block"
          spellCheck="false"
        />
      </div>
    </div>
  );
};
