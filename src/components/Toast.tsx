import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastProps {
  message: string;
  type?: 'success' | 'info' | 'warn';
  subMessage?: string;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'success',
  subMessage,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3200);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-[#86efac] shrink-0" />,
    info: <Info className="w-4 h-4 text-[#f59e0b] shrink-0" />,
    warn: <AlertCircle className="w-4 h-4 text-[#f87171] shrink-0" />,
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-start gap-2.5 px-3.5 py-2.5 rounded-lg border border-[#3d3731] bg-[#221e1a] text-[#ede8df] shadow-xl backdrop-blur-xs max-w-sm animate-in fade-in slide-in-from-bottom-2 transition-all">
      {icons[type]}
      <div className="flex-1 pr-1">
        <p className="text-xs font-semibold leading-tight">{message}</p>
        {subMessage && (
          <p className="text-[11px] text-[#a89f91] mt-0.5 leading-snug">{subMessage}</p>
        )}
      </div>
      <button
        onClick={onClose}
        className="text-[#78716c] hover:text-[#ede8df] p-0.5 rounded transition-colors"
        aria-label="Close"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
