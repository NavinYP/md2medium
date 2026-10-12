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
    }, 3800);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-500 shrink-0" />,
    warn: <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-500/30 bg-slate-900/95 text-slate-100 shadow-emerald-500/10',
    info: 'border-sky-500/30 bg-slate-900/95 text-slate-100 shadow-sky-500/10',
    warn: 'border-amber-500/30 bg-slate-900/95 text-slate-100 shadow-amber-500/10',
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md max-w-md animate-in fade-in slide-in-from-bottom-4 transition-all duration-200 ${borders[type]}`}>
      {icons[type]}
      <div className="flex-1 pr-2">
        <p className="text-sm font-semibold leading-tight">{message}</p>
        {subMessage && (
          <p className="text-xs text-slate-400 mt-1 leading-normal">{subMessage}</p>
        )}
      </div>
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-slate-200 p-1 rounded-md transition-colors"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
