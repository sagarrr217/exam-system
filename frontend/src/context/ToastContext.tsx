import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  showToast: (type: ToastType, message: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const toastMeta: Record<
  ToastType,
  { icon: React.ReactNode; barClass: string; badgeClass: string; label: string }
> = {
  success: {
    icon: <CheckCircle2 className="w-5 h-5 text-[var(--accent-success)] shrink-0" aria-hidden="true" />,
    barClass: 'border-l-4 border-l-[var(--accent-success)]',
    badgeClass: 'text-[var(--accent-success)]',
    label: 'Success',
  },
  error: {
    icon: <AlertCircle className="w-5 h-5 text-[var(--accent-danger)] shrink-0" aria-hidden="true" />,
    barClass: 'border-l-4 border-l-[var(--accent-danger)]',
    badgeClass: 'text-[var(--accent-danger)]',
    label: 'Error',
  },
  warning: {
    icon: <AlertTriangle className="w-5 h-5 text-[var(--accent-warning)] shrink-0" aria-hidden="true" />,
    barClass: 'border-l-4 border-l-[var(--accent-warning)]',
    badgeClass: 'text-[var(--accent-warning)]',
    label: 'Warning',
  },
  info: {
    icon: <Info className="w-5 h-5 text-[var(--accent-primary)] shrink-0" aria-hidden="true" />,
    barClass: 'border-l-4 border-l-[var(--accent-primary)]',
    badgeClass: 'text-[var(--accent-primary)]',
    label: 'Notice',
  },
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, message: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      setToasts((prev) => [...prev.slice(-3), { id, type, message }]);
      window.setTimeout(() => removeToast(id), 4500);
    },
    [removeToast]
  );

  const success = useCallback((m: string) => showToast('success', m), [showToast]);
  const error = useCallback((m: string) => showToast('error', m), [showToast]);
  const warning = useCallback((m: string) => showToast('warning', m), [showToast]);
  const info = useCallback((m: string) => showToast('info', m), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info, removeToast }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed bottom-4 right-4 z-[var(--z-toast)] flex flex-col gap-3 w-full max-w-sm px-4 sm:px-0 pointer-events-none"
      >
        {toasts.map((toast) => {
          const meta = toastMeta[toast.type];
          return (
            <div
              key={toast.id}
              role="status"
              className={`pointer-events-auto ui-card ${meta.barClass} bg-[var(--bg-surface)] px-4 py-3 shadow-xl flex items-start gap-3 animate-ui-in`}
            >
              <div className="mt-0.5">{meta.icon}</div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-bold uppercase tracking-wider ${meta.badgeClass}`}>
                  {meta.label}
                </p>
                <p className="text-sm font-medium text-[var(--text-primary)] leading-snug mt-0.5">
                  {toast.message}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                aria-label="Dismiss notification"
                className="min-h-[44px] min-w-[44px] -my-2 -mr-2 inline-flex items-center justify-center rounded-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tray)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--accent-primary)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
