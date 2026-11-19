'use client';

import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  side?: 'bottom' | 'right';
}

export default function Sheet({ open, onClose, title, children, footer, side = 'bottom' }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const panel =
    side === 'right'
      ? 'h-[100dvh] w-full sm:max-w-md sm:rounded-l-3xl animate-in slide-in-from-right duration-300'
      : 'max-h-[92dvh] w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-300';

  return (
    <div
      className={`fixed inset-0 z-50 flex bg-slate-950/60 backdrop-blur-[2px] animate-in fade-in duration-200 ${
        side === 'right' ? 'justify-end' : 'items-end sm:items-center justify-center'
      }`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className={`flex flex-col bg-white shadow-2xl ${panel}`} onClick={(e) => e.stopPropagation()}>
        <div className="relative flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
          {side === 'bottom' && <span className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-slate-200 sm:hidden" />}
          <h2 className="text-base font-semibold text-slate-900 leading-tight">{title}</h2>
          <button
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>
        {footer && <div className="border-t border-slate-100 bg-white px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">{footer}</div>}
      </div>
    </div>
  );
}
