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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full border border-rose-500/30 overflow-hidden animate-fade-in"
        role="alertdialog"
        aria-modal="true"
      >
        <div className="bg-gradient-to-r from-rose-600 to-red-600 p-6 text-white text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-3 shadow-inner">
            <ShieldAlert className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">
            Security & Focus-Loss Alert!
          </h2>
          <p className="mt-1 text-xs text-rose-100 font-medium">
            Proctoring system detected an unauthorized window or tab departure.
          </p>
        </div>

        <div className="p-6 space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 font-bold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>
              Incident Count: {focusLossCount} of {threshold} Allowed
            </span>
          </div>

          <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed text-left space-y-2">
            <p>
              Your exam session was paused because the window lost focus. This occurs when switching tabs, minimizing the browser window, or navigating to another application.
            </p>
            {warningLimitExceeded ? (
              <div className="p-3 bg-red-50 dark:bg-red-950/50 rounded-xl border border-red-300 dark:border-red-900 text-red-800 dark:text-red-200 text-xs font-semibold">
                ⚠️ Warning: You have reached or exceeded the allowed focus-loss threshold ({threshold}). This examination attempt has been flagged for academic integrity review by the proctor.
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Please remain on this examination window until you have finished and formally submitted your responses.
              </p>
            )}
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={onAcknowledge}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-600/30 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>I Understand & Return to Exam</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
