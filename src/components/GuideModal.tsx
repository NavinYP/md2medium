import React from 'react';
import { X, BookOpen, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-xl bg-[#231f1c] border border-[#3d3731] text-[#ede8df] shadow-2xl p-6 sm:p-7">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#38322c]">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#d97706]" />
            <h2 className="text-base font-bold text-[#f5f0e6]">Writer's Guide</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#8c8376] hover:text-[#ede8df] hover:bg-[#2c2722] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-5 space-y-5 text-xs sm:text-[13px] text-[#d6cfc5] leading-relaxed">
          
          {/* Step by step */}
          <div className="p-3.5 rounded-lg bg-[#1a1715] border border-[#332e29]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#d97706] mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Publishing Workflow
            </h3>
            <ol className="list-decimal pl-4 space-y-1.5 text-[#d6cfc5]">
              <li>
                <strong>Copy Full Article:</strong> Click <span className="text-[#fde68a]">"Copy Article for Medium"</span>, open your draft on <code className="text-[#e2d8cd]">medium.com/new-story</code>, and press <kbd className="px-1 py-0.5 rounded bg-[#2e2924] text-[11px]">Cmd+V</kbd>. All headers, code blocks, blockquotes, and lists format automatically.
              </li>
              <li>
                <strong>Paste Images:</strong> For each <code className="text-[#fde68a]">[DROP IMAGE...]</code> line, click <span className="text-[#fde68a]">"⚡ Copy Image"</span> on the sidebar card, select the line in Medium, and press <kbd className="px-1 py-0.5 rounded bg-[#2e2924] text-[11px]">Cmd+V</kbd>.
              </li>
              <li>
                <strong>Paste Captions:</strong> Click <span className="text-[#ede8df]">"Caption"</span> and paste into Medium's native caption box below the image. The card marks as placed.
              </li>
            </ol>
          </div>

          {/* Tables explanation */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#d97706] mb-1.5 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-[#d97706]" />
              Handling Tables in Medium
            </h3>
            <p className="text-[#a89f91] mb-2">
              Medium strips standard HTML <code className="text-[#ede8df]">&lt;table&gt;</code> tags on paste. md2medium provides two reliable solutions:
            </p>
            <div className="grid sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded bg-[#1f1c19] border border-[#332e29]">
                <strong className="text-[#ede8df] block mb-0.5">Aligned ASCII Monospace</strong>
                Formats rows into a clean code block with aligned column widths.
              </div>
              <div className="p-2.5 rounded bg-[#1f1c19] border border-[#332e29]">
                <strong className="text-[#ede8df] block mb-0.5">2x Retina PNG Card</strong>
                Generates a crisp visual table image card you can paste directly into Medium as a graphic.
              </div>
            </div>
          </div>

          {/* Canonical tip */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#a89f91] mb-1 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-[#a89f91]" />
              Draft Privacy & SEO
            </h3>
            <p className="text-[#8c8376]">
              All draft parsing and image handling run entirely in your local browser. Never host drafts publicly just to use Medium's URL importer, as it sets permanent canonical tags that harm article search rankings.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-6 pt-3 border-t border-[#38322c] flex justify-end">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-[#b45309] hover:bg-[#92400e] text-[#fbfaf7] text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
