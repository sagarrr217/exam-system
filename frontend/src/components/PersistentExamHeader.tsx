import React from 'react';
import {
  Clock,
  ShieldAlert,
  CheckCircle2,
  Loader2,
  Maximize2,
  LayoutGrid,
  Send,
} from 'lucide-react';
import { BrandMark } from './BrandMark';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { cn } from './ui/cn';

interface PersistentExamHeaderProps {
  examTitle: string;
  currentQuestionIndex: number;
  totalQuestions: number;
  remainingSeconds: number;
  focusLossCount: number;
  focusLossThreshold: number;
  saveStatus: 'saved' | 'saving' | 'error';
  isFullscreen: boolean;
  onRequestFullscreen: () => void;
  onTogglePalette: () => void;
  onOpenSubmitModal: () => void;
}

function formatClock(totalSeconds: number) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hrs = Math.floor(safe / 3600);
  const mins = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return hrs > 0 ? `${hrs}:${pad(mins)}:${pad(secs)}` : `${pad(mins)}:${pad(secs)}`;
}

export const PersistentExamHeader: React.FC<PersistentExamHeaderProps> = ({
  examTitle,
  currentQuestionIndex,
  totalQuestions,
  remainingSeconds,
  focusLossCount,
  focusLossThreshold,
  saveStatus,
  isFullscreen,
  onRequestFullscreen,
  onTogglePalette,
  onOpenSubmitModal,
}) => {
  const isCriticalTime = remainingSeconds > 0 && remainingSeconds <= 60;
  const isLowTime = remainingSeconds > 60 && remainingSeconds <= 300;

  return (
    <header className="sticky top-0 z-[var(--z-sticky)] ui-nav border-b border-[var(--border-default)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Left: Title & Progress */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="hidden sm:block">
            <BrandMark size="sm" showLabel={false} />
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-[var(--text-primary)] truncate leading-tight">
              {examTitle}
            </h1>
            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
              <span className="font-mono font-semibold">
                Q{currentQuestionIndex + 1}/{totalQuestions}
              </span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1">
                {saveStatus === 'saving' ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin text-[var(--accent-primary)]" aria-hidden="true" />
                    <span>Saving...</span>
                  </>
                ) : saveStatus === 'error' ? (
                  <span className="text-[var(--accent-danger)] font-semibold">Sync Warning</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-[var(--accent-success)]" aria-hidden="true" />
                    <span>Saved</span>
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Telemetry, Timer & Submit */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Badge
            variant={
              focusLossCount >= focusLossThreshold
                ? 'danger'
                : focusLossCount > 0
                ? 'warning'
                : 'success'
            }
            icon={<ShieldAlert className="w-3.5 h-3.5" />}
            className="hidden md:inline-flex"
          >
            Strikes {focusLossCount}/{focusLossThreshold}
          </Badge>

          {/* Timer Display */}
          <div
            className={cn(
              'min-h-[44px] px-3.5 rounded-[12px] border font-mono font-bold text-sm sm:text-base tabular-nums inline-flex items-center gap-2',
              isCriticalTime
                ? 'bg-rose-50 border-rose-300 text-rose-800 dark:bg-rose-950/60 dark:border-rose-700 dark:text-rose-200 animate-pulse'
                : isLowTime
                ? 'bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-950/60 dark:border-amber-700 dark:text-amber-200'
                : 'bg-[var(--bg-tray)] border-[var(--border-default)] text-[var(--text-primary)]'
            )}
            aria-label={`Remaining time ${formatClock(remainingSeconds)}`}
          >
            <Clock className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{formatClock(remainingSeconds)}</span>
          </div>

          {!isFullscreen && (
            <button
              type="button"
              onClick={onRequestFullscreen}
              title="Enter Fullscreen Mode"
              aria-label="Enter Fullscreen Mode"
              className="hidden lg:inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tray)] transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={onTogglePalette}
            aria-label="Open question navigator"
            className="lg:hidden min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-tray)]"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>

          <Button
            variant="primary"
            size="sm"
            onClick={onOpenSubmitModal}
            leftIcon={<Send className="w-4 h-4" />}
          >
            Submit
          </Button>
        </div>
      </div>
    </header>
  );
};
