import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

interface FocusLossModalProps {
  isOpen: boolean;
  focusLossCount: number;
  threshold: number;
  warningLimitExceeded: boolean;
  onAcknowledge: () => void;
}

export const FocusLossModal: React.FC<FocusLossModalProps> = ({
  isOpen,
  focusLossCount,
  threshold,
  warningLimitExceeded,
  onAcknowledge,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-lg flex items-center justify-center p-4 animate-fade-in"
      role="alertdialog"
      aria-modal="true"
    >
      <div className="studio-card max-w-sm sm:max-w-md w-full p-6 text-center animate-apple-spring border border-[var(--border-strong)]">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center mx-auto mb-3.5">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <h2 className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
          Focus Departure Logged
        </h2>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">
          The examination sentinel detected an active window switch.
        </p>

        <div className="mt-4 p-3.5 rounded-xl bg-[var(--bg-tray)] border border-[var(--border-hairline)] space-y-2.5 text-left">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="font-mono text-[var(--text-secondary)] uppercase">Incident Count:</span>
            <span
              className={`font-mono px-2.5 py-0.5 rounded font-bold ${
                warningLimitExceeded
                  ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                  : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
              }`}
            >
              {focusLossCount} / {threshold} Allowed
            </span>
          </div>

          <p className="text-xs text-[var(--text-primary)] leading-relaxed">
            Switching tabs, minimizing the browser window, or navigating away logs a timestamped event for faculty review. Your saved answers remain intact.
          </p>

          {warningLimitExceeded && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 text-[11px] font-medium leading-relaxed">
              Threshold reached ({threshold}). This attempt is flagged for instructor integrity audit.
            </div>
          )}
        </div>

        <div className="mt-5">
          <button
            type="button"
            onClick={onAcknowledge}
            className="w-full btn-signal py-2.5 px-4 text-xs sm:text-sm flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Resume Examination</span>
          </button>
        </div>
      </div>
    </div>
  );
};
