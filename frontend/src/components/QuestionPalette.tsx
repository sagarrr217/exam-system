import React from 'react';
import { Question, StudentAnswer } from '../types';
import { CheckCircle2, Bookmark, HelpCircle } from 'lucide-react';

interface QuestionPaletteProps {
  questions: Question[];
  currentQuestionIndex: number;
  onSelectQuestion: (index: number) => void;
  answers: Record<string, StudentAnswer>;
}

export const QuestionPalette: React.FC<QuestionPaletteProps> = ({
  questions,
  currentQuestionIndex,
  onSelectQuestion,
  answers,
}) => {
  let answeredCount = 0;
  let reviewCount = 0;
  let unansweredCount = 0;

  questions.forEach((q) => {
    const ans = answers[q.id];
    const isAnswered =
      ans &&
      (ans.selectedOptionId != null ||
        (ans.textAnswer && ans.textAnswer.trim().length > 0 && ans.textAnswer.trim() !== '[]'));
    const isReview = ans?.isMarkedForReview;

    if (isReview) reviewCount++;
    else if (isAnswered) answeredCount++;
    else unansweredCount++;
  });

  const getQuestionStatus = (q: Question) => {
    const ans = answers[q.id];
    const isAnswered =
      ans &&
      (ans.selectedOptionId != null ||
        (ans.textAnswer && ans.textAnswer.trim().length > 0 && ans.textAnswer.trim() !== '[]'));
    const isReview = ans?.isMarkedForReview;

    if (isReview) return 'review';
    if (isAnswered) return 'answered';
    return 'unanswered';
  };

  return (
    <div className="studio-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
          Question Matrix
        </h3>
        <span className="font-mono text-[10px] text-[var(--text-tertiary)]">
          {questions.length} Total
        </span>
      </div>

      {/* Status Counters */}
      <div className="grid grid-cols-3 gap-1.5 p-2.5 rounded-xl bg-[var(--bg-tray)] border border-[var(--border-hairline)] text-center">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs tabular-nums">
            <CheckCircle2 className="w-3 h-3" />
            <span>{answeredCount}</span>
          </div>
          <span className="font-mono text-[9px] uppercase text-[var(--text-tertiary)] mt-0.5">
            Done
          </span>
        </div>

        <div className="flex flex-col items-center border-x border-[var(--border-hairline)]">
          <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-mono font-bold text-xs tabular-nums">
            <Bookmark className="w-3 h-3" />
            <span>{reviewCount}</span>
          </div>
          <span className="font-mono text-[9px] uppercase text-[var(--text-tertiary)] mt-0.5">
            Flagged
          </span>
        </div>

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 text-[var(--text-secondary)] font-mono font-bold text-xs tabular-nums">
            <HelpCircle className="w-3 h-3" />
            <span>{unansweredCount}</span>
          </div>
          <span className="font-mono text-[9px] uppercase text-[var(--text-tertiary)] mt-0.5">
            Open
          </span>
        </div>
      </div>

      {/* Number Grid */}
      <div className="grid grid-cols-5 gap-2 max-h-[360px] overflow-y-auto p-1">
        {questions.map((question, index) => {
          const status = getQuestionStatus(question);
          const isActive = index === currentQuestionIndex;

          let btnClasses =
            'border font-mono text-xs font-bold rounded-lg h-9 w-full flex items-center justify-center active:scale-95 transition-all ';

          if (isActive) {
            btnClasses +=
              'ring-2 ring-[var(--accent-signal)] ring-offset-2 ring-offset-[var(--bg-canvas)] ';
          }

          if (status === 'answered') {
            btnClasses += 'bg-emerald-600 dark:bg-emerald-500 border-transparent text-white';
          } else if (status === 'review') {
            btnClasses += 'bg-amber-500 border-transparent text-white';
          } else {
            btnClasses +=
              'bg-[var(--bg-tray)] border-[var(--border-hairline)] text-[var(--text-primary)] hover:border-[var(--border-strong)]';
          }

          return (
            <button
              key={question.id}
              type="button"
              onClick={() => onSelectQuestion(index)}
              className={btnClasses}
              title={`Question ${index + 1} (${status})`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>

      {/* Legend & Keyboard Hint */}
      <div className="pt-3.5 border-t border-[var(--border-hairline)] space-y-2 text-[11px] text-[var(--text-secondary)]">
        <div className="grid grid-cols-2 gap-1.5">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500 flex-shrink-0" />
            <span>Answered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm bg-amber-500 flex-shrink-0" />
            <span>Flagged</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm bg-[var(--bg-tray)] border border-[var(--border-strong)] flex-shrink-0" />
            <span>Open</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm border-2 border-[var(--accent-signal)] flex-shrink-0" />
            <span>Active</span>
          </div>
        </div>
        <div className="pt-2 border-t border-[var(--border-hairline)] font-mono text-[10px] text-[var(--text-tertiary)] flex items-center justify-between">
          <span>KEYS: ← / → NAV</span>
          <span>M FLAG</span>
        </div>
      </div>
    </div>
  );
};
