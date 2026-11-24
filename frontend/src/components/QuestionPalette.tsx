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
    <div className="apple-card p-5">
      <h3 className="font-semibold text-xs sm:text-sm text-[#1d1d1f] dark:text-[#f5f5f7] mb-3">
        Question Navigation
      </h3>

      {/* iOS Segmented Status Counters */}
      <div className="grid grid-cols-3 gap-1.5 mb-4 p-2 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] text-center text-xs">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 text-[#34c759] dark:text-[#30d158] font-semibold text-xs">
            <CheckCircle2 className="w-3 h-3" />
            <span>{answeredCount}</span>
          </div>
          <span className="text-[10px] text-[#86868b] mt-0.5">Answered</span>
        </div>

        <div className="flex flex-col items-center border-x border-black/5 dark:border-white/10">
          <div className="flex items-center gap-1 text-[#ff9500] dark:text-[#ff9f0a] font-semibold text-xs">
            <Bookmark className="w-3 h-3" />
            <span>{reviewCount}</span>
          </div>
          <span className="text-[10px] text-[#86868b] mt-0.5">Review</span>
        </div>

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 text-[#86868b] font-semibold text-xs">
            <HelpCircle className="w-3 h-3" />
            <span>{unansweredCount}</span>
          </div>
          <span className="text-[10px] text-[#86868b] mt-0.5">Pending</span>
        </div>
      </div>

      {/* Number Buttons Grid */}
      <div className="grid grid-cols-5 gap-2 max-h-[380px] overflow-y-auto p-1">
        {questions.map((question, index) => {
          const status = getQuestionStatus(question);
          const isActive = index === currentQuestionIndex;

          let btnClasses = 'border text-xs font-semibold rounded-xl h-9 w-full flex items-center justify-center active:scale-95 transition-all ';

          if (isActive) {
            btnClasses += 'ring-2 ring-[#0071e3] dark:ring-[#0a84ff] ring-offset-2 ring-offset-[#f5f5f7] dark:ring-offset-black ';
          }

          if (status === 'answered') {
            btnClasses += 'bg-[#34c759] dark:bg-[#30d158] border-transparent text-white shadow-sm shadow-emerald-500/20';
          } else if (status === 'review') {
            btnClasses += 'bg-[#ff9500] dark:bg-[#ff9f0a] border-transparent text-white shadow-sm shadow-amber-500/20';
          } else {
            btnClasses += 'bg-black/5 dark:bg-white/10 border-black/5 dark:border-white/10 text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-black/10 dark:hover:bg-white/15';
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
      <div className="mt-4 pt-3.5 border-t border-black/5 dark:border-white/10 space-y-1.5 text-[11px] text-[#86868b]">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#34c759] flex-shrink-0" />
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff9500] flex-shrink-0" />
          <span>Marked for Review</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-black/15 dark:bg-white/20 flex-shrink-0" />
          <span>Unanswered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full border-2 border-[#0071e3] dark:border-[#0a84ff] flex-shrink-0" />
          <span>Active Target</span>
        </div>
      </div>
    </div>
  );
};
