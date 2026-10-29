import React, { useState } from 'react';
import { RotateCcw, Image as ImageIcon } from 'lucide-react';
import type { FigureItem } from '../types';
import { FigureCard } from './FigureCard';
import { AdSlot } from './AdSlot';

interface FigureSidebarProps {
  figures: FigureItem[];
  onToggleDone: (id: string) => void;
  onMarkAllDone: () => void;
  onResetAll: () => void;
  onLocate: (slotId: string) => void;
  showToast: (msg: string, sub?: string, type?: 'success' | 'warn' | 'info') => void;
}

export const FigureSidebar: React.FC<FigureSidebarProps> = ({
  figures,
  onToggleDone,
  onMarkAllDone,
  onResetAll,
  onLocate,
  showToast,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'done'>('all');

  const total = figures.length;
  const completed = figures.filter(f => f.isDone).length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const filteredFigures = figures.filter(fig => {
    if (filter === 'pending') return !fig.isDone;
    if (filter === 'done') return fig.isDone;
    return true;
  });

  return (
    <aside className="w-full lg:w-80 xl:w-96 shrink-0 flex flex-col bg-[#1f1c19] border-l border-[#332e29] h-full overflow-hidden">
      {/* Sidebar Header */}
      <div className="p-3.5 border-b border-[#332e29] bg-[#24201c] shrink-0 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-[#d97706]" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#ede8df]">Media Checklist</h2>
          </div>
          <span className="text-xs font-mono text-[#a89f91] px-2 py-0.5 rounded bg-[#1c1916] border border-[#332e29]">
            {completed}/{total} placed
          </span>
        </div>

        {/* Minimal Progress Bar */}
        <div className="w-full h-1.5 rounded-full bg-[#171513] overflow-hidden">
          <div
            className="h-full bg-[#b45309] transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Filter Pills and Bulk Actions */}
        <div className="flex items-center justify-between pt-0.5">
          <div className="flex items-center gap-1 bg-[#1a1715] p-0.5 rounded-md border border-[#332e29]">
            <button
              onClick={() => setFilter('all')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                filter === 'all' ? 'bg-[#332e29] text-[#f5f0e6]' : 'text-[#8c8376] hover:text-[#d6cfc5]'
              }`}
            >
              All ({total})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                filter === 'pending' ? 'bg-[#332e29] text-[#f5f0e6]' : 'text-[#8c8376] hover:text-[#d6cfc5]'
              }`}
            >
              Pending ({total - completed})
            </button>
            <button
              onClick={() => setFilter('done')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                filter === 'done' ? 'bg-[#332e29] text-[#f5f0e6]' : 'text-[#8c8376] hover:text-[#d6cfc5]'
              }`}
            >
              Done ({completed})
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {completed < total ? (
              <button
                onClick={onMarkAllDone}
                className="text-[11px] text-[#d97706] hover:text-[#f59e0b] font-medium transition-colors"
                title="Mark all as placed"
              >
                Mark all done
              </button>
            ) : (
              <button
                onClick={onResetAll}
                className="text-[11px] text-[#8c8376] hover:text-[#d6cfc5] flex items-center gap-1 transition-colors"
                title="Reset completion status"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Figures Scroll List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 min-h-0">
        {figures.length === 0 ? (
          <div className="text-center py-10 px-4 border border-dashed border-[#332e29] rounded-lg">
            <p className="text-xs font-medium text-[#8c8376]">No figures in draft</p>
            <p className="text-[11px] text-[#6b645b] mt-1">
              Add <code className="text-[#d97706]">![alt](path.png)</code> to your markdown.
            </p>
          </div>
        ) : filteredFigures.length === 0 ? (
          <div className="text-center py-6 text-xs text-[#8c8376]">
            No figures match this filter.
          </div>
        ) : (
          filteredFigures.map(fig => (
            <FigureCard
              key={fig.id}
              figure={fig}
              onToggleDone={onToggleDone}
              onLocate={onLocate}
              showToast={showToast}
            />
          ))
        )}

        {/* Bottom subtle sponsor link */}
        <div className="pt-2">
          <AdSlot slotId="figures-sidebar-bottom" format="rectangle" />
        </div>
      </div>
    </aside>
  );
};
