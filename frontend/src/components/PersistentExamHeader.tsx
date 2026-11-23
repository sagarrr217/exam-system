import React from 'react';
import { 
  ShieldCheck, 
  Clock, 
  Cloud, 
  RefreshCw, 
  AlertCircle, 
  Send, 
  Maximize, 
  Minimize, 
  User 
} from 'lucide-react';

interface PersistentExamHeaderProps {
  examTitle: string;
  subject: string;
  studentName: string;
  studentId?: string | null;
  remainingSeconds: number;
  totalQuestions: number;
  answeredCount: number;
  saveStatus: 'saved' | 'saving' | 'error';
  onSubmitClick: () => void;
  isSubmitting: boolean;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export const PersistentExamHeader: React.FC<PersistentExamHeaderProps> = ({
  examTitle,
  subject,
  studentName,
  studentId,
  remainingSeconds,
  totalQuestions,
  answeredCount,
  saveStatus,
  onSubmitClick,
  isSubmitting,
  isFullscreen,
  onToggleFullscreen
}) => {
  // Format remaining time into HH:MM:SS or MM:SS
  const formatTime = (seconds: number) => {
    if (seconds <= 0) return '00:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');

    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  const isCriticalTime = remainingSeconds <= 60;
  const isWarningTime = remainingSeconds <= 300 && !isCriticalTime;

  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Brand & Exam Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 flex-shrink-0">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="font-extrabold text-sm sm:text-lg text-slate-900 dark:text-white truncate">
                {examTitle}
              </h1>
              <span className="hidden sm:inline-block text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
                {subject}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
              <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 flex-shrink-0" />
              <span className="font-medium text-slate-700 dark:text-slate-300 truncate">{studentName}</span>
              {studentId && <span className="hidden sm:inline">• ID: {studentId}</span>}
            </div>
          </div>
        </div>

        {/* Center: Live Countdown Timer & Answer Counter */}
        <div className="flex items-center gap-2 sm:gap-6 flex-shrink-0">
          {/* Answered Progress Counter */}
          <div className="hidden md:flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Answered</span>
            <span className="text-sm font-extrabold text-slate-900 dark:text-white">
              <span className="text-emerald-600 dark:text-emerald-400">{answeredCount}</span>
              <span className="text-slate-400"> / {totalQuestions}</span>
            </span>
          </div>

          {/* Countdown Timer */}
          <div
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl border font-mono font-bold text-xs sm:text-base transition-all ${
              isCriticalTime
                ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 animate-pulse ring-2 ring-rose-500/30'
                : isWarningTime
                ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
            }`}
            title="Remaining examination time"
          >
            <Clock className={`w-3.5 h-3.5 sm:w-5 sm:h-5 ${isCriticalTime ? 'text-rose-600' : isWarningTime ? 'text-amber-600' : 'text-slate-500'}`} />
            <span>{formatTime(remainingSeconds)}</span>
          </div>
        </div>

        {/* Right: Autosave Status, Fullscreen & Submit Button */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          {/* Cloud Autosave Indicator */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs">
            {saveStatus === 'saving' && (
              <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                <Cloud className="w-4 h-4" />
                <span>Saved</span>
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="inline-flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Save Error</span>
              </span>
            )}
          </div>

          {/* Fullscreen Toggle */}
          {onToggleFullscreen && (
            <button
              onClick={onToggleFullscreen}
              className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              aria-label="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          )}

          {/* Final Submit Button */}
          <button
            onClick={onSubmitClick}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit<span className="hidden sm:inline"> Exam</span></span>
          </button>
        </div>
      </div>
    </header>
  );
};
