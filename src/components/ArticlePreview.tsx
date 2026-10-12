import React, { useState } from 'react';
import { Eye, Code, FileText, Copy } from 'lucide-react';
import { copyText } from '../utils/clipboard';

interface ArticlePreviewProps {
  previewHtml: string;
  clipboardHtml: string;
  plainText: string;
  theme: 'light' | 'dark';
  onSlotClick?: (slotId: string) => void;
  showToast: (msg: string, sub?: string, type?: 'success' | 'warn' | 'info') => void;
}

export const ArticlePreview: React.FC<ArticlePreviewProps> = ({
  previewHtml,
  clipboardHtml,
  plainText,
  theme,
  onSlotClick,
  showToast,
}) => {
  const [viewMode, setViewMode] = useState<'preview' | 'html' | 'text'>('preview');

  const handleCopySource = async (content: string, label: string) => {
    await copyText(content);
    showToast(`✓ ${label} copied to clipboard!`, '', 'success');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950/40">
      {/* View Switcher Header */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setViewMode('preview')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-colors ${
              viewMode === 'preview'
                ? 'bg-slate-800 text-slate-100'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-teal-400" />
            <span>Medium Layout Preview</span>
          </button>

          <button
            onClick={() => setViewMode('html')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-colors ${
              viewMode === 'html'
                ? 'bg-slate-800 text-slate-100'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5 text-sky-400" />
            <span>Semantic Clipboard HTML</span>
          </button>

          <button
            onClick={() => setViewMode('text')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-colors ${
              viewMode === 'text'
                ? 'bg-slate-800 text-slate-100'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>Plain Text</span>
          </button>
        </div>

        {viewMode !== 'preview' && (
          <button
            onClick={() => handleCopySource(viewMode === 'html' ? clipboardHtml : plainText, viewMode === 'html' ? 'HTML' : 'Plain Text')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy {viewMode === 'html' ? 'HTML' : 'Text'}</span>
          </button>
        )}
      </div>

      {/* Main Preview Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center">
        {viewMode === 'preview' ? (
          <div
            className={`w-full max-w-[740px] rounded-2xl p-6 sm:p-12 shadow-2xl transition-colors duration-200 ${
              theme === 'dark'
                ? 'bg-slate-900 border border-slate-800 text-slate-200'
                : 'bg-white border border-slate-200/80 text-[#242424]'
            }`}
          >
            <div
              className={`article-preview-body ${theme === 'dark' ? 'dark-mode' : ''}`}
              dangerouslySetInnerHTML={{ __html: previewHtml }}
              onClick={(e) => {
                const target = (e.target as HTMLElement).closest('[data-fig]');
                if (target) {
                  const figId = target.getAttribute('data-fig');
                  if (figId && onSlotClick) onSlotClick(`fig-${figId}`);
                }
              }}
            />
          </div>
        ) : viewMode === 'html' ? (
          <div className="w-full max-w-4xl p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="text-xs font-mono text-slate-400 mb-3 flex items-center justify-between">
              <span>Clean semantic HTML (written to clipboard on "Copy Full Article")</span>
              <span>{clipboardHtml.length} characters</span>
            </div>
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-teal-300 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed max-h-[70vh]">
              {clipboardHtml}
            </pre>
          </div>
        ) : (
          <div className="w-full max-w-4xl p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="text-xs font-mono text-slate-400 mb-3 flex items-center justify-between">
              <span>Plain text fallback for standard clipboards</span>
              <span>{plainText.length} characters</span>
            </div>
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[70vh]">
              {plainText}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
