import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from './cn';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  titleId?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  dismissible?: boolean;
  maxWidthClass?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  headerBadge?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  titleId = 'modal-dialog-title',
  title,
  subtitle,
  dismissible = true,
  maxWidthClass = 'max-w-xl',
  children,
  footer,
  headerBadge,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusTimer = window.setTimeout(() => {
      panelRef.current?.focus();
    }, 10);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dismissible) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus();
      }
    };
  }, [open, dismissible, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[var(--z-modal-backdrop)] flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (dismissible && e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={cn(
          'relative w-full z-[var(--z-modal)] ui-card bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-2xl animate-ui-in focus:outline-none my-auto',
          maxWidthClass
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || dismissible) && (
          <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-[var(--border-default)]">
            <div className="min-w-0 flex-1">
              {headerBadge && <div className="mb-2">{headerBadge}</div>}
              {title && (
                <h2
                  id={titleId}
                  className="text-xl font-bold text-[var(--text-primary)] tracking-tight leading-snug"
                >
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="mt-1 text-sm text-[var(--text-secondary)] leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>
            {dismissible && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-[12px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tray)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--accent-primary)] shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        <div className="px-6 py-5 max-h-[75vh] overflow-y-auto">{children}</div>

        {footer && (
          <div className="px-6 py-4 border-t border-[var(--border-default)] bg-[var(--bg-tray)]/50 rounded-b-[16px] flex flex-wrap items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
