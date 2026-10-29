import React, { useEffect, useRef } from 'react';
import { Star, Heart, ExternalLink } from 'lucide-react';

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
      <div className={`overflow-hidden text-center my-3 ${className}`} ref={adRef}>
        <div className="text-[10px] uppercase tracking-wider text-[#78716c] mb-1 font-mono">Sponsor</div>
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

  // Fallback Minimal Open-Source Link
  return (
    <div className={`rounded-lg border border-[#332e29] bg-[#221e1a] p-2.5 text-center text-xs text-[#8c8376] ${className}`}>
      <div className="flex items-center justify-center gap-2">
        <a
          href="https://github.com/NavinYP/md2medium"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[11px] text-[#a89f91] hover:text-[#f5f0e6] transition-colors"
        >
          <Star className="w-3 h-3 text-[#d97706]" />
          <span>Star on GitHub</span>
          <ExternalLink className="w-2.5 h-2.5 ml-0.5 opacity-60" />
        </a>
        <span className="text-[#443d37]">·</span>
        <a
          href="https://github.com/sponsors/NavinYP"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[11px] text-[#a89f91] hover:text-[#f87171] transition-colors"
        >
          <Heart className="w-3 h-3 text-[#e11d48]" />
          <span>Sponsor</span>
        </a>
      </div>
    </div>
  );
};
