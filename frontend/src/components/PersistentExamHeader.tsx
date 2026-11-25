import React from 'react';
import {
  Clock,
  Cloud,
  RefreshCw,
  AlertCircle,
  Send,
  Maximize,
  Minimize,
  User,
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { BrandMark } from './BrandMark';

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
  onToggleFullscreen,
}) => {
  const formatTime = (seconds: number) => {
    if (seconds <= 0) return '00:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    if (hrs > 0) return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    return `${pad(mins)}:${pad(secs)}`;
  };

  const isCriticalTime = remainingSeconds <= 60;
  const isWarningTime = remainingSeconds <= 300 && !isCriticalTime;
  const completionPct =
    totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  return (
    <header className="sticky top-0 z-40 w-full studio-nav transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Emblem & Exam Info */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <BrandMark size="sm" className="flex-shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-xs sm:text-base text-[var(--text-primary)] truncate">
                {examTitle}
              </h1>
              <span className="hidden sm:inline-block font-mono text-[10px] font-semibold px-2 py-0.5 rounded bg-[var(--bg-tray)] text-[var(--text-secondary)] uppercase border border-[var(--border-hairline)]">
                {subject}
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-[var(--text-secondary)]">
              <User className="w-3 h-3 text-[var(--text-tertiary)] flex-shrink-0" />
              <span className="font-medium text-[var(--text-primary)] truncate">{studentName}</span>
              {studentId && (
                <span className="hidden sm:inline text-[var(--text-tertiary)]">• {studentId}</span>
              )}
            </div>
          </div>
        </div>

        {/* Center: Progress & Countdown Timer */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <div className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 font-mono text-xs font-semibold tabular-nums">
            <span>Answered:</span>
            <span>
              {answeredCount}/{totalQuestions}
            </span>
          </div>

          <div
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-lg font-mono text-xs sm:text-sm font-bold tabular-nums border transition-all ${
              isCriticalTime
                ? 'bg-rose-500/15 border-rose-500/40 text-rose-600 dark:text-rose-400 animate-pulse'
                : isWarningTime
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400'
                : 'bg-[var(--bg-tray)] border-[var(--border-hairline)] text-[var(--text-primary)]'
            }`}
            title="Remaining examination time"
          >
            <Clock
              className={`w-3.5 h-3.5 ${
                isCriticalTime
                  ? 'text-rose-500'
                  : isWarningTime
                  ? 'text-amber-500'
                  : 'text-[var(--accent-signal)]'
              }`}
            />
            <span>{formatTime(remainingSeconds)}</span>
          </div>
        </div>

        {/* Right: Sync Status, Theme, Fullscreen & Submit */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
          <div className="hidden lg:flex items-center gap-1.5 font-mono text-xs">
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
              <span className="inline-flex items-center gap-1.5 text-rose-500 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Sync Error</span>
              </span>
            )}
          </div>

          <ThemeToggle variant="icon-only" />

          {onToggleFullscreen && (
            <button
              type="button"
              onClick={onToggleFullscreen}
              className="w-9 h-9 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              aria-label="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          )}

          <button
            type="button"
            onClick={onSubmitClick}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm disabled:opacity-50 active:scale-95 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>
              Submit<span className="hidden sm:inline"> Exam</span>
            </span>
          </button>
        </div>
      </div>

      {/* Linear Completion Progress Strip */}
      <div className="h-[2px] w-full bg-[var(--border-hairline)]">
        <div
          className="h-full bg-[#0891B2] dark:bg-[#22D3EE] transition-all duration-300"
          style={{ width: `${completionPct}%` }}
        />
      </div>
    </header>
  );
};
