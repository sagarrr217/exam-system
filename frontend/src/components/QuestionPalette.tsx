import React from 'react';
import { Bookmark, CheckCircle2 } from 'lucide-react';
import { Question } from '../types';
import { cn } from './ui/cn';

interface AnswerStatusMap {
  [questionId: string]: {
    hasAnswer: boolean;
    isMarkedForReview: boolean;
  };
}

interface QuestionPaletteProps {
  questions: Question[];
  currentIndex: number;
  statusMap: AnswerStatusMap;
  onSelectQuestion: (index: number) => void;
}

export const QuestionPalette: React.FC<QuestionPaletteProps> = ({
  questions,
  currentIndex,
  statusMap,
  onSelectQuestion,
}) => {
  const answeredCount = questions.filter((q) => statusMap[q.id]?.hasAnswer).length;
  const markedCount = questions.filter((q) => statusMap[q.id]?.isMarkedForReview).length;

  return (
    <div className="ui-card p-5 space-y-5 bg-[var(--bg-surface)]">
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-[var(--border-default)]">
        <h2 className="text-base font-bold text-[var(--text-primary)]">Question Navigator</h2>
        <span className="text-xs font-mono font-semibold text-[var(--text-secondary)]">
          {answeredCount}/{questions.length} Done
        </span>
      </div>

      {/* Number Grid */}
      <div className="grid grid-cols-5 gap-2">
        {questions.map((q, idx) => {
          const st = statusMap[q.id];
          const isCurrent = idx === currentIndex;
          const isAnswered = Boolean(st?.hasAnswer);
          const isMarked = Boolean(st?.isMarkedForReview);

          return (
            <button
              key={q.id}
              type="button"
              onClick={() => onSelectQuestion(idx)}
              aria-label={`Question ${idx + 1}${isAnswered ? ', answered' : ''}${isMarked ? ', marked for review' : ''}`}
              aria-current={isCurrent ? 'step' : undefined}
              className={cn(
                'relative min-h-[44px] rounded-[10px] font-mono text-sm font-bold border transition-all flex items-center justify-center focus-visible:outline-2 focus-visible:outline-[var(--accent-primary)]',
                isCurrent && 'ring-2 ring-[var(--accent-primary)] ring-offset-2 ring-offset-[var(--bg-surface)]',
                isMarked
                  ? 'bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-700'
                  : isAnswered
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-700'
                  : 'bg-[var(--bg-tray)] text-[var(--text-secondary)] border-[var(--border-default)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]'
              )}
            >
              <span>{idx + 1}</span>
              {isMarked && (
                <Bookmark
                  className="w-3 h-3 text-[var(--accent-warning)] absolute top-1 right-1"
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Accessible Legend */}
      <div className="pt-3 border-t border-[var(--border-default)] space-y-2 text-xs text-[var(--text-secondary)]">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent-success)]" aria-hidden="true" />
            Answered
          </span>
          <span className="font-mono font-semibold text-[var(--text-primary)]">{answeredCount}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-2">
            <Bookmark className="w-3.5 h-3.5 text-[var(--accent-warning)]" aria-hidden="true" />
            Marked for Review
          </span>
          <span className="font-mono font-semibold text-[var(--text-primary)]">{markedCount}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Remaining Unanswered</span>
          <span className="font-mono font-semibold text-[var(--text-primary)]">
            {questions.length - answeredCount}
          </span>
        </div>
      </div>
    </div>
  );
};
