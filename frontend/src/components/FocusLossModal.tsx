import React from 'react';
import { AlertTriangle, ShieldAlert, ArrowLeft } from 'lucide-react';

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
  onAcknowledge
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="apple-card max-w-sm sm:max-w-md w-full p-6 text-center animate-apple-spring border border-black/10 dark:border-white/15"
        role="alertdialog"
        aria-modal="true"
      >
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-[#ff3b30] dark:text-[#ff453a] flex items-center justify-center mx-auto mb-3.5 shadow-sm">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <h2 className="text-lg font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
          Focus Departure Alert
        </h2>
        <p className="mt-1 text-xs text-[#86868b] dark:text-[#98989d]">
          The examination portal detected an active window switch.
        </p>

        <div className="mt-4 p-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/10 space-y-2 text-left">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-[#86868b]">Incident Count:</span>
            <span className={`px-2 py-0.5 rounded-full ${
              warningLimitExceeded
                ? 'bg-rose-500/15 text-[#ff3b30] dark:text-[#ff453a]'
                : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
            }`}>
              {focusLossCount} / {threshold} Allowed
            </span>
          </div>

          <p className="text-xs text-[#1d1d1f] dark:text-[#f5f5f7] leading-relaxed">
            Switching tabs, minimizing the browser window, or navigating to another app pauses your session and logs a focus-loss event for instructor audit.
          </p>

          {warningLimitExceeded && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[#ff3b30] dark:text-[#ff453a] text-[11px] font-medium leading-relaxed">
              ⚠️ Warning: You have reached or exceeded the allowed threshold ({threshold}). This attempt has been flagged for integrity review.
            </div>
          )}
        </div>

        <div className="mt-5">
          <button
            type="button"
            onClick={onAcknowledge}
            className="w-full py-2.5 px-4 rounded-full text-xs sm:text-sm font-semibold text-white bg-[#0071e3] hover:bg-[#0077ed] dark:bg-[#0a84ff] dark:hover:bg-[#1a8eff] shadow-sm active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Resume Examination</span>
          </button>
        </div>
      </div>
    </div>
  );
};
