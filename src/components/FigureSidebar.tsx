import React, { useState } from 'react';
import { Layers, CheckCircle2, RotateCcw, Image as ImageIcon } from 'lucide-react';
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
    <aside className="w-full lg:w-96 shrink-0 flex flex-col bg-slate-900/90 border-l border-slate-800 h-full overflow-hidden">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/95 sticky top-0 z-10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-teal-400" />
            <h2 className="text-sm font-bold text-slate-100">Figure & Table Checklist</h2>
          </div>
          <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {completed}/{total} placed
          </span>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1 font-mono">
            <span>{percentage}% complete</span>
            {percentage === 100 && total > 0 && (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> All Figures Ready!
              </span>
            )}
          </div>
        </div>

        {/* Filter Pills and Bulk Actions */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setFilter('all')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                filter === 'all' ? 'bg-slate-800 text-slate-100' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({total})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                filter === 'pending' ? 'bg-slate-800 text-slate-100' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Pending ({total - completed})
            </button>
            <button
              onClick={() => setFilter('done')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                filter === 'done' ? 'bg-slate-800 text-slate-100' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Done ({completed})
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {completed < total ? (
              <button
                onClick={onMarkAllDone}
                className="text-[11px] text-teal-400 hover:text-teal-300 font-medium transition-colors"
                title="Mark all as placed"
              >
                Mark all done
              </button>
            ) : (
              <button
                onClick={onResetAll}
                className="text-[11px] text-slate-400 hover:text-slate-300 flex items-center gap-1 transition-colors"
                title="Reset completion status"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Figures Scroll List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {figures.length === 0 ? (
          <div className="text-center py-12 px-4 border border-dashed border-slate-800 rounded-xl">
            <Layers className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-400">No Figures Detected</p>
            <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
              Add <code className="text-teal-400">![alt](path.png)</code> in your markdown or load the sample article to see live figure cards.
            </p>
          </div>
        ) : filteredFigures.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            No figures match the selected filter.
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

        {/* Bottom Ad / Sponsor slot */}
        <div className="pt-4 border-t border-slate-800/80">
          <AdSlot slotId="figures-sidebar-bottom" format="rectangle" />
        </div>
      </div>
    </aside>
  );
};
