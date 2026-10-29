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
    showToast(`✓ ${label} copied to clipboard`, '', 'success');
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col h-full overflow-hidden bg-[#181614]">
      {/* View Switcher Header */}
      <div className="h-10 px-3.5 border-b border-[#332e29] flex items-center justify-between bg-[#24201c] shrink-0">
        <div className="flex items-center gap-1 bg-[#1a1715] p-0.5 rounded-md border border-[#332e29] text-xs">
          <button
            onClick={() => setViewMode('preview')}
            className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded font-medium transition-colors ${
              viewMode === 'preview'
                ? 'bg-[#332e29] text-[#f5f0e6]'
                : 'text-[#8c8376] hover:text-[#d6cfc5]'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-[#d97706]" />
            <span>Reading Preview</span>
          </button>

          <button
            onClick={() => setViewMode('html')}
            className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded font-medium transition-colors ${
              viewMode === 'html'
                ? 'bg-[#332e29] text-[#f5f0e6]'
                : 'text-[#8c8376] hover:text-[#d6cfc5]'
            }`}
          >
            <Code className="w-3.5 h-3.5 text-[#a89f91]" />
            <span>Clipboard HTML</span>
          </button>

          <button
            onClick={() => setViewMode('text')}
            className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded font-medium transition-colors ${
              viewMode === 'text'
                ? 'bg-[#332e29] text-[#f5f0e6]'
                : 'text-[#8c8376] hover:text-[#d6cfc5]'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-[#a89f91]" />
            <span>Plain Text</span>
          </button>
        </div>

        {viewMode !== 'preview' && (
          <button
            onClick={() => handleCopySource(viewMode === 'html' ? clipboardHtml : plainText, viewMode === 'html' ? 'HTML' : 'Plain Text')}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium text-[#d6cfc5] hover:text-white bg-[#2e2924] hover:bg-[#38312b] border border-[#3d3731] transition-colors"
          >
            <Copy className="w-3 h-3" />
            <span>Copy {viewMode === 'html' ? 'HTML' : 'Text'}</span>
          </button>
        )}
      </div>

      {/* Main Preview Container */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-8 flex justify-center">
        {viewMode === 'preview' ? (
          <div
            className={`w-full max-w-[720px] rounded-xl p-6 sm:p-12 shadow-md transition-colors duration-200 h-fit ${
              theme === 'dark'
                ? 'bg-[#221e1b] border border-[#38322c] text-[#ede8df]'
                : 'bg-[#fbfaf7] border border-[#e6e0d4] text-[#262320]'
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
          <div className="w-full max-w-3xl p-5 rounded-xl bg-[#221e1b] border border-[#38322c] h-fit">
            <div className="text-xs font-mono text-[#8c8376] mb-3 flex items-center justify-between">
              <span>Clean semantic HTML (written to clipboard on "Copy Article")</span>
              <span>{clipboardHtml.length} characters</span>
            </div>
            <pre className="p-4 rounded-lg bg-[#191715] border border-[#332e29] text-xs font-mono text-[#fde68a] overflow-x-auto whitespace-pre-wrap break-all leading-relaxed max-h-[70vh]">
              {clipboardHtml}
            </pre>
          </div>
        ) : (
          <div className="w-full max-w-3xl p-5 rounded-xl bg-[#221e1b] border border-[#38322c] h-fit">
            <div className="text-xs font-mono text-[#8c8376] mb-3 flex items-center justify-between">
              <span>Plain text fallback</span>
              <span>{plainText.length} characters</span>
            </div>
            <pre className="p-4 rounded-lg bg-[#191715] border border-[#332e29] text-xs font-mono text-[#d6cfc5] overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[70vh]">
              {plainText}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
