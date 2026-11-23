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
  answers
}) => {
  // Compute counts
  let answeredCount = 0;
  let reviewCount = 0;
  let unansweredCount = 0;

  questions.forEach((q) => {
    const ans = answers[q.id];
    const isAnswered = ans && (ans.selectedOptionId != null || (ans.textAnswer && ans.textAnswer.trim().length > 0 && ans.textAnswer.trim() !== '[]'));
    const isReview = ans?.isMarkedForReview;

    if (isReview) {
      reviewCount++;
    } else if (isAnswered) {
      answeredCount++;
    } else {
      unansweredCount++;
    }
  });

  const getQuestionStatus = (q: Question) => {
    const ans = answers[q.id];
    const isAnswered = ans && (ans.selectedOptionId != null || (ans.textAnswer && ans.textAnswer.trim().length > 0 && ans.textAnswer.trim() !== '[]'));
    const isReview = ans?.isMarkedForReview;

    if (isReview) return 'review';
    if (isAnswered) return 'answered';
    return 'unanswered';
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-3">
        Question Palette
      </h3>

      {/* Status Summary Counters */}
      <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-center text-xs">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 text-emerald-600 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{answeredCount}</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5">Answered</span>
        </div>

        <div className="flex flex-col items-center border-x border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-1 text-amber-600 font-bold">
            <Bookmark className="w-3.5 h-3.5" />
            <span>{reviewCount}</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5">Review</span>
        </div>

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 text-slate-500 font-bold">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{unansweredCount}</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5">Unanswered</span>
        </div>
      </div>

      {/* Number Buttons Grid */}
      <div className="grid grid-cols-5 sm:grid-cols-5 gap-2 max-h-[380px] overflow-y-auto p-1">
        {questions.map((question, index) => {
          const status = getQuestionStatus(question);
          const isActive = index === currentQuestionIndex;

          let btnClasses = 'border text-xs font-bold rounded-xl h-10 w-full flex items-center justify-center transition-all duration-150 ';

          if (isActive) {
            btnClasses += 'ring-2 ring-blue-600 ring-offset-2 dark:ring-offset-slate-900 ';
          }

          if (status === 'answered') {
            btnClasses += 'bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/20';
          } else if (status === 'review') {
            btnClasses += 'bg-amber-500 border-amber-500 text-white hover:bg-amber-600 shadow-sm shadow-amber-500/20';
          } else {
            btnClasses += 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700';
          }

          return (
            <button
              key={question.id}
              onClick={() => onSelectQuestion(index)}
              className={btnClasses}
              title={`Question ${index + 1} (${status})`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded bg-emerald-600 flex-shrink-0" />
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded bg-amber-500 flex-shrink-0" />
          <span>Marked for Review</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
          <span>Unanswered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded border-2 border-blue-600 flex-shrink-0" />
          <span>Active Question</span>
        </div>
      </div>
    </div>
  );
};
