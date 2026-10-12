import React, { useEffect, useRef } from 'react';
import { Star, Heart, ExternalLink, ShieldCheck } from 'lucide-react';

interface AdSlotProps {
  slotId?: string;
  className?: string;
  format?: 'auto' | 'rectangle' | 'horizontal';
}

export const AdSlot: React.FC<AdSlotProps> = ({
  slotId,
  className = '',
  format = 'auto',
}) => {
  const adRef = useRef<HTMLDivElement>(null);
  const adsEnabled = import.meta.env.VITE_ENABLE_ADS === 'true';
  const clientId = import.meta.env.VITE_ADSENSE_CLIENT_ID;

  useEffect(() => {
    if (adsEnabled && clientId && slotId && typeof window !== 'undefined') {
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (err) {
        console.warn('AdSense push failed', err);
      }
    }
  }, [adsEnabled, clientId, slotId]);

  if (adsEnabled && clientId && slotId) {
    return (
      <div className={`overflow-hidden text-center my-4 ${className}`} ref={adRef}>
        <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1 font-mono">Advertisement</div>
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={clientId}
          data-ad-slot={slotId}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  // Fallback Sponsor & Open-Source Card
  return (
    <div className={`rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 text-center text-xs text-slate-400 ${className}`}>
      <div className="flex items-center justify-center gap-1.5 text-slate-300 font-semibold mb-1">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span>100% Free & Open Source</span>
      </div>
      <p className="text-[11px] text-slate-400 mb-2.5 leading-relaxed">
        md2medium runs entirely in your browser with zero servers. No drafts or images are ever uploaded.
      </p>
      <div className="flex items-center justify-center gap-2">
        <a
          href="https://github.com/NavinYP/md2medium"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-colors border border-slate-700"
        >
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>Star on GitHub</span>
          <ExternalLink className="w-3 h-3 text-slate-400 ml-0.5" />
        </a>
        <a
          href="https://github.com/sponsors/NavinYP"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 text-[11px] font-medium transition-colors border border-rose-800/50"
        >
          <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
          <span>Sponsor</span>
        </a>
      </div>
    </div>
  );
};
