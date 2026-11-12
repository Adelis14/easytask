import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ICONS = {
  success: <CheckCircle2 className="w-4 h-4 shrink-0" />,
  error:   <AlertCircle className="w-4 h-4 shrink-0" />,
  info:    <Info className="w-4 h-4 shrink-0" />,
};

const TOAST_STYLES = {
  success: { background:'rgba(16,185,129,0.12)', color:'#6ee7b7', border:'1px solid rgba(16,185,129,0.3)' },
  error:   { background:'rgba(239,68,68,0.12)',  color:'#fca5a5', border:'1px solid rgba(239,68,68,0.3)' },
  info:    { background:'rgba(99,102,241,0.12)', color:'#a5b4fc', border:'1px solid rgba(99,102,241,0.3)' },
};

export default function ToastContainer({ toasts, onDismiss }) {
  if (!toasts.length) return null;
  return (
    <div
      className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none"
      style={{maxWidth:'320px'}}
    >
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="flex items-center gap-3 px-4 py-3 rounded-xl pointer-events-auto animate-fade-in"
          style={{
            ...TOAST_STYLES[toast.type] || TOAST_STYLES.info,
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '0.8125rem',
            fontWeight: 500,
          }}
        >
          {ICONS[toast.type]}
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => onDismiss(toast.id)}
            className="opacity-60 hover:opacity-100 transition-opacity shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
