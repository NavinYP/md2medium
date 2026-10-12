import React from 'react';
import { Table, Code, Globe, Sparkles } from 'lucide-react';
import type { TableMode } from '../types';

interface TableSettingsBarProps {
  tableCount: number;
  globalMode: TableMode;
  onChangeGlobalMode: (mode: TableMode) => void;
}

export const TableSettingsBar: React.FC<TableSettingsBarProps> = ({
  tableCount,
  globalMode,
  onChangeGlobalMode,
}) => {
  if (tableCount === 0) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-3 mb-4 rounded-xl border border-slate-800 bg-slate-900/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
          <Table className="w-4 h-4" />
        </div>
        <div>
          <span className="font-semibold text-slate-200">
            {tableCount} {tableCount === 1 ? 'Table' : 'Tables'} Detected
          </span>
          <span className="text-[11px] text-slate-400 block sm:inline sm:ml-2">
            (Medium strips HTML &lt;table&gt; tags on paste)
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
        <span className="text-[10px] uppercase font-mono text-slate-400 px-1.5 font-bold">Format:</span>
        
        <button
          onClick={() => onChangeGlobalMode('ascii')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
            globalMode === 'ascii'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
          title="Monospace ASCII code block (Pastes natively into Medium without being stripped)"
        >
          <Code className="w-3.5 h-3.5" />
          <span>Aligned ASCII</span>
        </button>

        <button
          onClick={() => onChangeGlobalMode('png')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
            globalMode === 'png'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
          title="Generate 2x Retina PNG card and add to Figure Checklist with Copy Image"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>2x Retina PNG Card</span>
        </button>

        <button
          onClick={() => onChangeGlobalMode('html')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
            globalMode === 'html'
              ? 'bg-slate-700 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
          title="Semantic HTML <table> for Substack or Notion"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Native HTML</span>
        </button>
      </div>
    </div>
  );
};
