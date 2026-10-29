import React from 'react';
import {
  ClipboardCheck,
  Sun,
  Moon,
  BookOpen,
  Check,
  Feather,
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
    <header className="sticky top-0 z-40 bg-[#1f1c19] border-b border-[#332e29] text-[#ede8df] px-4 sm:px-6 py-2.5 transition-colors">
      <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Quiet Book Branding */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#b45309] flex items-center justify-center text-[#fbfaf7] shadow-sm">
            <Feather className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-2">
            <h1 className="text-base font-bold tracking-tight text-[#f5f0e6]">
              md2medium
            </h1>
            <span className="text-xs text-[#8c8376] hidden sm:inline">
              Publishing Studio
            </span>
          </div>
        </div>

        {/* Right: Uncluttered Minimal Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          
          {/* Platform Preset */}
          <div className="flex items-center gap-1.5 text-xs text-[#d6cfc5] bg-[#292420] px-2.5 py-1.5 rounded-lg border border-[#3d3731]">
            <span className="text-[#8c8376] font-medium">To:</span>
            <select
              value={settings.platformPreset}
              onChange={(e) => onUpdateSettings({ platformPreset: e.target.value as PlatformPreset })}
              className="bg-transparent text-[#f5f0e6] font-semibold focus:outline-none cursor-pointer text-xs"
            >
              <option value="medium" className="bg-[#26221e] text-[#ede8df]">Medium</option>
              <option value="substack" className="bg-[#26221e] text-[#ede8df]">Substack</option>
              <option value="linkedin" className="bg-[#26221e] text-[#ede8df]">LinkedIn Articles</option>
            </select>
          </div>

          {/* Caption Toggle */}
          <label
            className="flex items-center gap-2 text-xs text-[#d6cfc5] cursor-pointer select-none px-2.5 py-1.5 rounded-lg bg-[#292420] hover:bg-[#332e29] border border-[#3d3731] transition-colors"
            title="Leave unchecked if you paste captions into Medium's native image caption box below each image"
          >
            <input
              type="checkbox"
              checked={settings.captionMode === 'inline'}
              onChange={(e) =>
                onUpdateSettings({ captionMode: e.target.checked ? 'inline' : 'excluded' })
              }
              className="w-3.5 h-3.5 rounded text-[#b45309] focus:ring-0 bg-[#1c1916] border-[#4d453d]"
            />
            <span className="hidden sm:inline">Inline captions</span>
            <span className="sm:hidden">Captions</span>
          </label>

          {/* Guide Modal Trigger */}
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#d6cfc5] hover:text-[#f5f0e6] bg-[#292420] hover:bg-[#332e29] border border-[#3d3731] transition-colors"
            title="Writer's Guide & Tips"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#d97706]" />
            <span className="hidden md:inline">Guide</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => onUpdateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
            className="p-1.5 rounded-lg text-[#9c9387] hover:text-[#f5f0e6] bg-[#292420] hover:bg-[#332e29] border border-[#3d3731] transition-colors"
            title={`Switch to ${settings.theme === 'dark' ? 'Light' : 'Dark'} preview`}
          >
            {settings.theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[#d97706]" />
            ) : (
              <Moon className="w-4 h-4 text-[#ede8df]" />
            )}
          </button>

          {/* GitHub Repo */}
          <a
            href="https://github.com/NavinYP/md2medium"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg text-[#9c9387] hover:text-[#f5f0e6] bg-[#292420] hover:bg-[#332e29] border border-[#3d3731] transition-colors"
            title="GitHub Repository"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </a>

          {/* Primary CTA: Copy Full Article */}
          <button
            onClick={onCopyFullArticle}
            disabled={isCopying}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#b45309] hover:bg-[#92400e] text-[#fbfaf7] text-xs font-semibold shadow-sm transition-all cursor-pointer"
            title="Copies formatted article to clipboard. Paste into Medium with Cmd+V"
          >
            {isCopying ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Copied! Cmd+V</span>
              </>
            ) : (
              <>
                <ClipboardCheck className="w-3.5 h-3.5 text-[#fde68a]" />
                <span>Copy for {settings.platformPreset === 'medium' ? 'Medium' : settings.platformPreset === 'substack' ? 'Substack' : 'LinkedIn'}</span>
              </>
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
