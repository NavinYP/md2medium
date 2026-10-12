import React, { useState } from 'react';
import { Copy, Check, CheckSquare, Square, Eye, Sparkles, AlertCircle } from 'lucide-react';
import type { FigureItem } from '../types';
import { copyImageToClipboard, copyText } from '../utils/clipboard';

interface FigureCardProps {
  figure: FigureItem;
  onToggleDone: (id: string) => void;
  onLocate: (slotId: string) => void;
  showToast: (msg: string, sub?: string, type?: 'success' | 'warn' | 'info') => void;
}

export const FigureCard: React.FC<FigureCardProps> = ({
  figure,
  onToggleDone,
  onLocate,
  showToast,
}) => {
  const [copyingImg, setCopyingImg] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedAlt, setCopiedAlt] = useState(false);

  const handleCopyImage = async () => {
    if (!figure.blob) {
      showToast('Image file missing', `Please drop ${figure.filename} into the drop zone`, 'warn');
      return;
    }
    setCopyingImg(true);
    const success = await copyImageToClipboard(figure.blob);
    setCopyingImg(false);

    if (success) {
      showToast(
        '✓ Image copied to clipboard!',
        `Select the [DROP IMAGE...] placeholder line in Medium and press Cmd+V`,
        'success'
      );
    } else {
      showToast(
        'Image clipboard copy failed',
        'Your browser might block image clipboard writes. You can drag the thumbnail directly into Medium.',
        'warn'
      );
    }
  };

  const handleCopyCaption = async () => {
    if (!figure.caption) return;
    const cleanCap = figure.caption.replace(/^(\*|_)+|(\*|_)+$/g, '').trim();
    await copyText(cleanCap);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);

    // Auto-mark as done
    if (!figure.isDone) {
      onToggleDone(figure.id);
    }

    showToast('✓ Caption copied!', 'Paste into Medium’s native image caption field', 'success');
  };

  const handleCopyAlt = async () => {
    if (!figure.alt) return;
    await copyText(figure.alt);
    setCopiedAlt(true);
    setTimeout(() => setCopiedAlt(false), 2000);
    showToast('✓ Alt text copied!', 'Paste into Medium’s Alt Text accessibility modal', 'info');
  };

  const targetSlotId = figure.isTable ? `fig-slot-${figure.id}` : `fig-slot-${figure.index}`;

  return (
    <div
      className={`rounded-xl border transition-all duration-200 p-3.5 ${
        figure.isDone
          ? 'bg-emerald-950/20 border-emerald-800/50 text-slate-300'
          : figure.isTable
          ? 'bg-sky-950/20 border-sky-800/40 text-slate-200 hover:border-sky-700/60'
          : 'bg-slate-900/80 border-slate-800 text-slate-200 hover:border-slate-700'
      }`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${
              figure.isDone
                ? 'bg-emerald-900/60 text-emerald-300'
                : figure.isTable
                ? 'bg-sky-900/60 text-sky-300'
                : 'bg-slate-800 text-slate-300'
            }`}
          >
            {figure.isTable ? 'Table' : `#${figure.slotNumber}`}
          </span>
          <span
            onClick={() => onLocate(targetSlotId)}
            className="text-xs font-semibold truncate hover:text-teal-400 cursor-pointer font-mono"
            title={`Locate ${figure.filename} in article`}
          >
            {figure.filename}
          </span>
        </div>

        <button
          onClick={() => onToggleDone(figure.id)}
          className="text-slate-400 hover:text-emerald-400 transition-colors p-1"
          title={figure.isDone ? 'Mark as pending' : 'Mark as placed'}
        >
          {figure.isDone ? (
            <CheckSquare className="w-4 h-4 text-emerald-400" />
          ) : (
            <Square className="w-4 h-4 text-slate-500 hover:text-slate-300" />
          )}
        </button>
      </div>

      {/* Thumbnail */}
      <div className="relative group my-2 rounded-lg overflow-hidden bg-slate-950 border border-slate-800/80 flex items-center justify-center min-h-[90px] max-h-[140px]">
        {figure.blobUrl ? (
          <img
            src={figure.blobUrl}
            alt={figure.alt}
            className="w-full h-full object-contain max-h-[130px] p-1.5"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-3 text-center text-amber-400/80">
            <AlertCircle className="w-5 h-5 mb-1" />
            <span className="text-[11px] font-medium">Missing file</span>
            <span className="text-[10px] text-slate-500 font-mono mt-0.5">{figure.filename}</span>
          </div>
        )}

        {/* Quick locate button on hover */}
        <button
          onClick={() => onLocate(targetSlotId)}
          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-xs text-white font-medium"
        >
          <Eye className="w-4 h-4" />
          <span>Locate in Preview</span>
        </button>
      </div>

      {/* Caption Preview */}
      {figure.caption && (
        <p className="text-[11px] text-slate-400 italic line-clamp-2 mb-2.5 font-serif leading-relaxed">
          {figure.caption}
        </p>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-800/60">
        <button
          onClick={handleCopyImage}
          disabled={!figure.blob || copyingImg}
          className={`col-span-2 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
            figure.blob
              ? 'bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30'
              : 'bg-slate-800/40 text-slate-500 border border-slate-800 cursor-not-allowed'
          }`}
          title="Copies image blob to clipboard. Paste directly into Medium with Cmd+V"
        >
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span>{copyingImg ? 'Copying...' : '⚡ Copy Image (Cmd+V)'}</span>
        </button>

        {figure.caption ? (
          <button
            onClick={handleCopyCaption}
            className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[11px] font-medium transition-colors border ${
              copiedCaption
                ? 'bg-emerald-900/40 text-emerald-300 border-emerald-700/50'
                : 'bg-slate-800/70 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            {copiedCaption ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copiedCaption ? 'Copied!' : 'Copy Caption'}</span>
          </button>
        ) : (
          <div className="flex items-center justify-center text-[10px] text-slate-500 italic py-1.5">
            No caption
          </div>
        )}

        <button
          onClick={handleCopyAlt}
          disabled={!figure.alt}
          className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[11px] font-medium transition-colors border ${
            copiedAlt
              ? 'bg-emerald-900/40 text-emerald-300 border-emerald-700/50'
              : 'bg-slate-800/70 hover:bg-slate-700 text-slate-300 border-slate-700'
          }`}
        >
          {copiedAlt ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copiedAlt ? 'Copied!' : 'Copy Alt Text'}</span>
        </button>
      </div>
    </div>
  );
};
