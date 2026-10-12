import React from 'react';
import {
  ClipboardCheck,
  ShieldCheck,
  Sun,
  Moon,
  BookOpen,
  Check,
} from 'lucide-react';
import type { PublishSettings, PlatformPreset } from '../types';

interface HeaderProps {
  settings: PublishSettings;
  onUpdateSettings: (updates: Partial<PublishSettings>) => void;
  onCopyFullArticle: () => void;
  isCopying: boolean;
  onOpenGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onUpdateSettings,
  onCopyFullArticle,
  isCopying,
  onOpenGuide,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-slate-100 px-4 sm:px-6 py-3 transition-colors">
      <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-3 sm:gap-4">
        
        {/* Left: Branding & Privacy Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-teal-500/20">
              m²
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
                  md2medium
                </h1>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Studio
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden md:block">
                Zero-backend publishing bridge for technical writers
              </p>
            </div>
          </div>

          <div
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/50 text-[11px] text-emerald-300 font-medium cursor-help"
            title="100% Client-Side: All Markdown parsing, images, and tables are processed strictly inside your local browser via the HTML5 File & Canvas APIs. Zero network calls."
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Client-Side Privacy</span>
          </div>
        </div>

        {/* Center / Right: Options and Controls */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          
          {/* Platform Preset Selector */}
          <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 font-medium">Target:</span>
            <select
              value={settings.platformPreset}
              onChange={(e) => onUpdateSettings({ platformPreset: e.target.value as PlatformPreset })}
              className="bg-transparent text-teal-300 font-semibold focus:outline-none cursor-pointer text-xs"
            >
              <option value="medium" className="bg-slate-900 text-slate-200">Medium</option>
              <option value="substack" className="bg-slate-900 text-slate-200">Substack</option>
              <option value="linkedin" className="bg-slate-900 text-slate-200">LinkedIn Articles</option>
            </select>
          </div>

          {/* Inline Caption Toggle */}
          <label
            className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-colors"
            title="Leave unchecked if you paste captions into Medium's native image caption box below each image"
          >
            <input
              type="checkbox"
              checked={settings.captionMode === 'inline'}
              onChange={(e) =>
                onUpdateSettings({ captionMode: e.target.checked ? 'inline' : 'excluded' })
              }
              className="w-3.5 h-3.5 rounded text-teal-500 focus:ring-0 focus:ring-offset-0 bg-slate-950 border-slate-700"
            />
            <span className="hidden sm:inline">Include captions in body text</span>
            <span className="sm:hidden">Inline captions</span>
          </label>

          {/* Guide & FAQ Button */}
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
            title="Writer's Guide & FAQ"
          >
            <BookOpen className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden md:inline">Guide</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => onUpdateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
            title={`Switch to ${settings.theme === 'dark' ? 'Light' : 'Dark'} article preview`}
          >
            {settings.theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-300" />
            )}
          </button>

          {/* GitHub Repo */}
          <a
            href="https://github.com/NavinYP/md2medium"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
            title="View open-source repository on GitHub"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </a>

          {/* Primary CTA: Copy Full Article */}
          <button
            onClick={onCopyFullArticle}
            disabled={isCopying}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 text-xs sm:text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            title="Writes clean semantic HTML to clipboard. Paste into Medium with Cmd+V"
          >
            {isCopying ? (
              <>
                <Check className="w-4 h-4 text-slate-950 animate-bounce" />
                <span>Copied! Cmd+V in Medium</span>
              </>
            ) : (
              <>
                <ClipboardCheck className="w-4 h-4 text-slate-950" />
                <span>📋 Copy Article for {settings.platformPreset === 'medium' ? 'Medium' : settings.platformPreset === 'substack' ? 'Substack' : 'LinkedIn'}</span>
              </>
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
