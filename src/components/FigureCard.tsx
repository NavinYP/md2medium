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
        '✓ Image copied to clipboard',
        `Select placeholder in Medium and press Cmd+V`,
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

    showToast('✓ Caption copied', 'Paste into Medium caption input', 'success');
  };

  const handleCopyAlt = async () => {
    if (!figure.alt) return;
    await copyText(figure.alt);
    setCopiedAlt(true);
    setTimeout(() => setCopiedAlt(false), 2000);
    showToast('✓ Alt text copied', 'Paste into Medium alt text field', 'info');
  };

  const targetSlotId = figure.isTable ? `fig-slot-${figure.id}` : `fig-slot-${figure.index}`;

  return (
    <div
      className={`rounded-lg border transition-all duration-150 p-3 ${
        figure.isDone
          ? 'bg-[#1e241f] border-[#2f4233] text-[#cfd8d0]'
          : figure.isTable
          ? 'bg-[#24201c] border-[#44382c] text-[#ede8df]'
          : 'bg-[#221e1a] border-[#332e29] text-[#ede8df] hover:border-[#423c35]'
      }`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider shrink-0 font-bold ${
              figure.isDone
                ? 'bg-[#263b2a] text-[#86efac]'
                : figure.isTable
                ? 'bg-[#3b2b1e] text-[#fde68a]'
                : 'bg-[#2c2722] text-[#a89f91]'
            }`}
          >
            {figure.isTable ? 'Table' : `#${figure.slotNumber}`}
          </span>
          <span
            onClick={() => onLocate(targetSlotId)}
            className="text-xs font-medium truncate hover:text-[#d97706] cursor-pointer font-mono text-[#d6cfc5]"
            title={`Locate ${figure.filename} in article`}
          >
            {figure.filename}
          </span>
        </div>

        <button
          onClick={() => onToggleDone(figure.id)}
          className="text-[#78716c] hover:text-[#86efac] transition-colors p-0.5"
          title={figure.isDone ? 'Mark as pending' : 'Mark as placed'}
        >
          {figure.isDone ? (
            <CheckSquare className="w-4 h-4 text-[#86efac]" />
          ) : (
            <Square className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Thumbnail */}
      <div className="relative group my-1.5 rounded bg-[#171513] border border-[#2c2722] flex items-center justify-center min-h-[80px] max-h-[120px] overflow-hidden">
        {figure.blobUrl ? (
          <img
            src={figure.blobUrl}
            alt={figure.alt}
            className="w-full h-full object-contain max-h-[110px] p-1.5"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-2 text-center text-[#d97706]">
            <AlertCircle className="w-4 h-4 mb-0.5" />
            <span className="text-[11px]">Missing file</span>
            <span className="text-[10px] text-[#78716c] font-mono mt-0.5">{figure.filename}</span>
          </div>
        )}

        {/* Quick locate on hover */}
        <button
          onClick={() => onLocate(targetSlotId)}
          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-xs text-white"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Locate</span>
        </button>
      </div>

      {/* Caption Preview */}
      {figure.caption && (
        <p className="text-[11px] text-[#9c9387] italic line-clamp-2 mb-2 font-serif leading-snug">
          {figure.caption}
        </p>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-[#2e2924]">
        <button
          onClick={handleCopyImage}
          disabled={!figure.blob || copyingImg}
          className={`col-span-2 flex items-center justify-center gap-1.5 py-1 px-2 rounded text-xs font-semibold transition-all ${
            figure.blob
              ? 'bg-[#3b2b1e] hover:bg-[#4a3625] text-[#fde68a] border border-[#523d29]'
              : 'bg-[#1f1c19] text-[#57534e] border border-[#2e2924] cursor-not-allowed'
          }`}
          title="Copies image blob to clipboard. Paste into Medium with Cmd+V"
        >
          <Sparkles className="w-3 h-3 text-[#f59e0b]" />
          <span>{copyingImg ? 'Copying...' : '⚡ Copy Image (Cmd+V)'}</span>
        </button>

        {figure.caption ? (
          <button
            onClick={handleCopyCaption}
            className={`flex items-center justify-center gap-1 py-1 px-2 rounded text-[11px] font-medium transition-colors border ${
              copiedCaption
                ? 'bg-[#223624] text-[#86efac] border-[#2f4f34]'
                : 'bg-[#292420] hover:bg-[#332e29] text-[#d6cfc5] border-[#38322c]'
            }`}
          >
            {copiedCaption ? <Check className="w-3 h-3 text-[#86efac]" /> : <Copy className="w-3 h-3" />}
            <span>{copiedCaption ? 'Copied' : 'Caption'}</span>
          </button>
        ) : (
          <div className="flex items-center justify-center text-[10px] text-[#57534e] italic py-1">
            No caption
          </div>
        )}

        <button
          onClick={handleCopyAlt}
          disabled={!figure.alt}
          className={`flex items-center justify-center gap-1 py-1 px-2 rounded text-[11px] font-medium transition-colors border ${
            copiedAlt
              ? 'bg-[#223624] text-[#86efac] border-[#2f4f34]'
              : 'bg-[#292420] hover:bg-[#332e29] text-[#d6cfc5] border-[#38322c]'
          }`}
        >
          {copiedAlt ? <Check className="w-3 h-3 text-[#86efac]" /> : <Copy className="w-3 h-3" />}
          <span>{copiedAlt ? 'Copied' : 'Alt Text'}</span>
        </button>
      </div>
    </div>
  );
};
