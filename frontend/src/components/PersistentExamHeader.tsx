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
import { ThemeToggle } from './ThemeToggle';

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
    <header className="sticky top-0 z-40 w-full apple-glass-nav transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Brand & Exam Title */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-[#0071e3] to-[#409cff] flex items-center justify-center text-white shadow-sm flex-shrink-0">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="font-semibold text-xs sm:text-base text-[#1d1d1f] dark:text-[#f5f5f7] truncate">
                {examTitle}
              </h1>
              <span className="hidden sm:inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-[#86868b] dark:text-[#98989d] uppercase">
                {subject}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#86868b] dark:text-[#98989d]">
              <User className="w-3 h-3 text-[#86868b] flex-shrink-0" />
              <span className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7] truncate">{studentName}</span>
              {studentId && <span className="hidden sm:inline text-[#86868b]">• ID: {studentId}</span>}
            </div>
          </div>
        </div>

        {/* Center: Dynamic Island Countdown Pill & Answered Count */}
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          {/* Answered Progress Pill */}
          <div className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
            <span>Answered:</span>
            <span>{answeredCount} / {totalQuestions}</span>
          </div>

          {/* iOS Countdown Pill */}
          <div
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full font-mono text-xs sm:text-sm font-semibold transition-all ${
              isCriticalTime
                ? 'bg-rose-500/15 border border-rose-500/30 text-[#ff3b30] dark:text-[#ff453a] animate-pulse'
                : isWarningTime
                ? 'bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400'
                : 'bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/10 text-[#1d1d1f] dark:text-[#f5f5f7]'
            }`}
            title="Remaining examination time"
          >
            <Clock className={`w-3.5 h-3.5 ${isCriticalTime ? 'text-[#ff3b30]' : isWarningTime ? 'text-amber-500' : 'text-[#86868b]'}`} />
            <span>{formatTime(remainingSeconds)}</span>
          </div>
        </div>

        {/* Right: Autosave Status, Theme, Fullscreen & Submit Button */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
          {/* Cloud Autosave Indicator */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs">
            {saveStatus === 'saving' && (
              <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Syncing</span>
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                <Cloud className="w-3.5 h-3.5" />
                <span>Saved</span>
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="inline-flex items-center gap-1.5 text-[#ff3b30] dark:text-[#ff453a] font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Sync Error</span>
              </span>
            )}
          </div>

          <ThemeToggle variant="icon-only" />

          {/* Fullscreen Toggle */}
          {onToggleFullscreen && (
            <button
              onClick={onToggleFullscreen}
              className="p-1.5 sm:p-2 rounded-full text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all"
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
            className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold text-white bg-[#34c759] hover:bg-[#30d158] shadow-sm shadow-emerald-500/20 disabled:opacity-50 active:scale-95 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit<span className="hidden sm:inline"> Exam</span></span>
          </button>
        </div>
      </div>
    </header>
  );
};
