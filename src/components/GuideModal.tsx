import React from 'react';
import { X, BookOpen, ShieldCheck, HelpCircle, CheckCircle2, AlertTriangle } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 shadow-2xl p-6 sm:p-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Writer's Guide & FAQ</h2>
              <p className="text-xs text-slate-400">Mastering technical article publishing on Medium, Substack & LinkedIn</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-6 space-y-6 text-sm text-slate-300">
          
          {/* Section 1: The Medium Publishing Workflow */}
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <h3 className="text-base font-semibold text-teal-300 flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              The 3-Step Zero-Friction Workflow
            </h3>
            <ol className="list-decimal pl-5 space-y-2 text-xs sm:text-sm text-slate-300">
              <li>
                <strong>Copy Full Article:</strong> Click <span className="text-emerald-400 font-semibold">"📋 Copy Full Article for Medium"</span>. Open Medium's editor (<code className="text-teal-300">medium.com/new-story</code>) and press <kbd className="px-1.5 py-0.5 rounded bg-slate-700 text-slate-200 text-xs">Cmd+V</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-slate-700 text-slate-200 text-xs">Ctrl+V</kbd>. All headers, code blocks, lists, and formatting paste seamlessly.
              </li>
              <li>
                <strong>Paste Images Inline:</strong> Find each highlighted placeholder line in Medium (e.g. <code className="text-amber-300">[DROP IMAGE 1/14: fig1.png]</code>). In md2medium's sidebar, click <span className="text-sky-300 font-semibold">"⚡ Copy Image"</span>, select the placeholder line in Medium, and press <kbd className="px-1.5 py-0.5 rounded bg-slate-700 text-slate-200 text-xs">Cmd+V</kbd>. Medium pastes the image blob directly!
              </li>
              <li>
                <strong>Attach Captions & Alt Text:</strong> Click <span className="text-slate-200 font-semibold">"Copy Caption"</span> and paste into Medium's native image caption box below the image. The figure card is automatically marked as <span className="text-emerald-400 font-semibold">✓ Done</span>.
              </li>
            </ol>
          </div>

          {/* Section 2: Why Medium Strips Tables */}
          <div>
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Why Does Medium Strip Tables?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-3">
              Medium deliberately does not support HTML <code className="text-slate-200">&lt;table&gt;</code> tags. When you paste an HTML table into Medium, its editor flattens table cells into disorganized plain text.
            </p>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              <strong>md2medium provides two perfect solutions:</strong>
            </p>
            <div className="grid sm:grid-cols-2 gap-3 mt-2.5">
              <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700 text-xs">
                <strong className="text-slate-100 block mb-1">1. Aligned ASCII Monospace Table</strong>
                Formats the table into a clean <code className="text-teal-300">&lt;pre&gt;&lt;code&gt;</code> block with calculated column widths. Pastes natively as a beautiful monospace code block in Medium!
              </div>
              <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700 text-xs">
                <strong className="text-slate-100 block mb-1">2. 2x Retina PNG Table Card</strong>
                Renders a crisp, publication-grade table image in your browser. md2medium injects it into your Figure Checklist so you can paste it directly as an image graphic!
              </div>
            </div>
          </div>

          {/* Section 3: Privacy & Security Guarantee */}
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40">
            <h3 className="text-base font-semibold text-emerald-400 flex items-center gap-2 mb-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              100% Privacy-First Guarantee
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              All Markdown parsing, image resolution, and table card rendering occur <strong>exclusively inside your local web browser</strong> using client-side JavaScript, the HTML5 File API, and Canvas. <strong>No text, drafts, or images are ever transmitted to any remote server or third party.</strong>
            </p>
          </div>

          {/* Section 4: Medium SEO Canonical Warning */}
          <div>
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2 mb-2">
              <HelpCircle className="w-4 h-4 text-sky-400" />
              Why Avoid Medium's URL Importer?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Medium offers a URL import tool (<code className="text-slate-200">medium.com/p/import</code>). However, using it requires hosting your private draft publicly first on another website, and Medium hardcodes a permanent <code className="text-slate-200">rel="canonical"</code> tag pointing to that staging URL, which permanently harms your article's search engine ranking on Medium.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">md2medium Studio · Open Source</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold transition-colors"
          >
            Got it, let's write!
          </button>
        </div>

      </div>
    </div>
  );
};
