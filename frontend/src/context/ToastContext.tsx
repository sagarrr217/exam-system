import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration = 3500) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { id, message, type, duration };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const success = useCallback((message: string, duration?: number) => showToast(message, 'success', duration), [showToast]);
  const error = useCallback((message: string, duration?: number) => showToast(message, 'error', duration), [showToast]);
  const warning = useCallback((message: string, duration?: number) => showToast(message, 'warning', duration), [showToast]);
  const info = useCallback((message: string, duration?: number) => showToast(message, 'info', duration), [showToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, success, error, warning, info, removeToast }}>
      {children}
      {/* Apple Dynamic Island Style Notification Banner */}
      <div className="fixed top-5 inset-x-0 z-50 flex flex-col items-center gap-2 pointer-events-none px-4">
        {toasts.map((toast) => {
          let Icon = Info;
          let iconColor = 'text-[#0071e3] dark:text-[#0a84ff]';

          if (toast.type === 'success') {
            Icon = CheckCircle2;
            iconColor = 'text-[#34c759] dark:text-[#30d158]';
          } else if (toast.type === 'error') {
            Icon = AlertCircle;
            iconColor = 'text-[#ff3b30] dark:text-[#ff453a]';
          } else if (toast.type === 'warning') {
            Icon = AlertTriangle;
            iconColor = 'text-[#ff9500] dark:text-[#ff9f0a]';
          }

          return (
            <div
              key={toast.id}
              className="pointer-events-auto flex items-center gap-2.5 py-2.5 px-4 rounded-full apple-glass shadow-apple-card animate-apple-spring max-w-md w-auto text-xs sm:text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7] border border-black/10 dark:border-white/15"
              role="alert"
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${iconColor}`} />
              <div className="flex-1 leading-snug">{toast.message}</div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white p-0.5 rounded-full transition-colors flex-shrink-0 ml-1"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
