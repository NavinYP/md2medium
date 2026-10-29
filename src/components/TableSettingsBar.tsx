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
    <div className="px-3 py-1.5 rounded-lg border border-[#332e29] bg-[#221e1a] flex flex-wrap items-center justify-between gap-2 text-xs">
      <div className="flex items-center gap-1.5 text-[#a89f91]">
        <Table className="w-3.5 h-3.5 text-[#d97706]" />
        <span className="font-medium text-[#ede8df]">
          {tableCount} {tableCount === 1 ? 'Table' : 'Tables'}
        </span>
        <span className="text-[11px] text-[#78716c] hidden md:inline">
          · Medium strips standard &lt;table&gt; tags
        </span>
      </div>

      <div className="flex items-center gap-1 bg-[#1a1715] p-0.5 rounded-md border border-[#332e29]">
        <span className="text-[10px] uppercase font-mono text-[#78716c] px-1.5">Table Output:</span>
        
        <button
          onClick={() => onChangeGlobalMode('ascii')}
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
            globalMode === 'ascii'
              ? 'bg-[#b45309] text-white shadow-sm'
              : 'text-[#a89f91] hover:text-[#ede8df] hover:bg-[#2c2722]'
          }`}
          title="Monospace ASCII code block (Pastes natively into Medium without being stripped)"
        >
          <Code className="w-3 h-3" />
          <span>Aligned ASCII</span>
        </button>

        <button
          onClick={() => onChangeGlobalMode('png')}
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
            globalMode === 'png'
              ? 'bg-[#b45309] text-white shadow-sm'
              : 'text-[#a89f91] hover:text-[#ede8df] hover:bg-[#2c2722]'
          }`}
          title="Generate 2x Retina PNG card and add to Figure Checklist with Copy Image"
        >
          <Sparkles className="w-3 h-3 text-[#fde68a]" />
          <span>2x Retina Card</span>
        </button>

        <button
          onClick={() => onChangeGlobalMode('html')}
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
            globalMode === 'html'
              ? 'bg-[#b45309] text-white shadow-sm'
              : 'text-[#a89f91] hover:text-[#ede8df] hover:bg-[#2c2722]'
          }`}
          title="Semantic HTML <table> for Substack or Notion"
        >
          <Globe className="w-3 h-3" />
          <span>Native HTML</span>
        </button>
      </div>
    </div>
  );
};
