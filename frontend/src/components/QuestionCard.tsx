import React from 'react';
import { Bookmark, Check, Eraser } from 'lucide-react';
import { Question } from '../types';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { cn } from './ui/cn';

interface AnswerDraft {
  selectedOptionId?: string;
  textAnswer?: string;
  isMarkedForReview: boolean;
}

interface QuestionCardProps {
  question: Question;
  index: number;
  totalQuestions: number;
  answer: AnswerDraft;
  onAnswerChange: (next: Partial<AnswerDraft>) => void;
}

const TYPE_LABELS: Record<string, string> = {
  MCQ: 'Multiple Choice',
  MULTIPLE_SELECT: 'Multiple Select',
  TRUE_FALSE: 'True / False',
  FILL_BLANK: 'Fill in the Blank',
  NUMERICAL: 'Numerical Value',
  SHORT_ANSWER: 'Short Answer',
  LONG_ANSWER: 'Long Essay',
};

function parseMultiSelect(textAnswer?: string): string[] {
  if (!textAnswer) return [];
  try {
    const parsed = JSON.parse(textAnswer);
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch {
    // Fallback comma list
  }
  return textAnswer
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  index,
  totalQuestions,
  answer,
  onAnswerChange,
}) => {
  const options = [...(question.options || [])].sort(
    (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)
  );
  const multiSelected =
    question.type === 'MULTIPLE_SELECT' ? parseMultiSelect(answer.textAnswer) : [];

  const handleToggleMulti = (optionId: string) => {
    const exists = multiSelected.includes(optionId);
    const next = exists
      ? multiSelected.filter((id) => id !== optionId)
      : [...multiSelected, optionId];
    onAnswerChange({ textAnswer: JSON.stringify(next), selectedOptionId: undefined });
  };

  const hasValue = Boolean(
    answer.selectedOptionId ||
      (question.type === 'MULTIPLE_SELECT'
        ? multiSelected.length > 0
        : (answer.textAnswer || '').trim().length > 0)
  );

  return (
    <div className="ui-card p-6 sm:p-8 space-y-6 bg-[var(--bg-surface)]">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--border-default)]">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="brand">
            Question {index + 1} of {totalQuestions}
          </Badge>
          <Badge variant="neutral">{TYPE_LABELS[question.type] || question.type}</Badge>
          <Badge variant="success">+{question.marks} marks</Badge>
          {question.isRequired && <Badge variant="warning">Required</Badge>}
        </div>

        <Button
          variant={answer.isMarkedForReview ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => onAnswerChange({ isMarkedForReview: !answer.isMarkedForReview })}
          leftIcon={<Bookmark className="w-4 h-4" />}
        >
          {answer.isMarkedForReview ? 'Marked for Review' : 'Mark for Review'}
        </Button>
      </div>

      {/* Prompt */}
      <div className="space-y-4">
        <p className="text-lg font-medium text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
          {question.text}
        </p>

        {question.imageUrl && (
          <div className="rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-tray)] p-3 inline-block max-w-full">
            <img
              src={question.imageUrl}
              alt={`Diagram for question ${index + 1}`}
              className="max-h-80 w-auto rounded-[8px] object-contain"
            />
          </div>
        )}
      </div>

      {/* Answer Input Area */}
      {(question.type === 'MCQ' || question.type === 'TRUE_FALSE') && (
        <div className="space-y-3" role="radiogroup" aria-label={`Answer choices for question ${index + 1}`}>
          {options.map((opt, optIdx) => {
            const isSelected = answer.selectedOptionId === opt.id;
            const letter =
              question.type === 'TRUE_FALSE'
                ? opt.text.slice(0, 1).toUpperCase()
                : String.fromCharCode(65 + optIdx);

            return (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() =>
                  onAnswerChange({ selectedOptionId: opt.id, textAnswer: opt.text })
                }
                className={cn(
                  'w-full min-h-[52px] px-4 py-3.5 rounded-[12px] border text-left flex items-center gap-4 transition-colors focus-visible:outline-2 focus-visible:outline-[var(--accent-primary)]',
                  isSelected
                    ? 'border-[var(--accent-primary)] bg-blue-50/75 dark:bg-blue-950/50 text-[var(--text-primary)] font-semibold'
                    : 'border-[var(--border-default)] bg-[var(--bg-canvas)] text-[var(--text-primary)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-tray)]/50'
                )}
              >
                <span
                  className={cn(
                    'w-8 h-8 rounded-[8px] font-mono text-sm font-bold flex items-center justify-center shrink-0 border',
                    isSelected
                      ? 'bg-[var(--accent-primary)] text-white border-transparent'
                      : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-default)]'
                  )}
                >
                  {letter}
                </span>
                <span className="flex-1 text-base leading-snug">{opt.text}</span>
              </button>
            );
          })}
        </div>
      )}

      {question.type === 'MULTIPLE_SELECT' && (
        <div className="space-y-3" role="group" aria-label={`Multiple select choices for question ${index + 1}`}>
          <p className="text-sm font-medium text-[var(--text-secondary)]">
            Select all options that apply:
          </p>
          {options.map((opt) => {
            const checked = multiSelected.includes(opt.id);
            return (
              <button
                key={opt.id}
                type="button"
                role="checkbox"
                aria-checked={checked}
                onClick={() => handleToggleMulti(opt.id)}
                className={cn(
                  'w-full min-h-[52px] px-4 py-3.5 rounded-[12px] border text-left flex items-center gap-4 transition-colors focus-visible:outline-2 focus-visible:outline-[var(--accent-primary)]',
                  checked
                    ? 'border-[var(--accent-primary)] bg-blue-50/75 dark:bg-blue-950/50 text-[var(--text-primary)] font-semibold'
                    : 'border-[var(--border-default)] bg-[var(--bg-canvas)] text-[var(--text-primary)] hover:border-[var(--border-strong)]'
                )}
              >
                <span
                  className={cn(
                    'w-6 h-6 rounded-[6px] border-2 flex items-center justify-center shrink-0',
                    checked
                      ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)] text-white'
                      : 'border-[var(--border-strong)] bg-[var(--bg-surface)]'
                  )}
                  aria-hidden="true"
                >
                  {checked && <Check className="w-4 h-4" />}
                </span>
                <span className="flex-1 text-base leading-snug">{opt.text}</span>
              </button>
            );
          })}
        </div>
      )}

      {(question.type === 'FILL_BLANK' || question.type === 'NUMERICAL' || question.type === 'SHORT_ANSWER') && (
        <div className="space-y-2">
          <label
            htmlFor={`q-input-${question.id}`}
            className="block text-sm font-semibold text-[var(--text-secondary)]"
          >
            {question.type === 'NUMERICAL' ? 'Enter numeric value' : 'Enter your response'}
          </label>
          <input
            id={`q-input-${question.id}`}
            type="text"
            inputMode={question.type === 'NUMERICAL' ? 'decimal' : 'text'}
            value={answer.textAnswer || ''}
            onChange={(e) =>
              onAnswerChange({ textAnswer: e.target.value, selectedOptionId: undefined })
            }
            placeholder={
              question.type === 'NUMERICAL'
                ? 'e.g. 42.5'
                : 'Type your concise answer here...'
            }
            className="w-full min-h-[48px] px-4 rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-canvas)] text-base text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none font-sans"
          />
        </div>
      )}

      {question.type === 'LONG_ANSWER' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor={`q-essay-${question.id}`}
              className="block text-sm font-semibold text-[var(--text-secondary)]"
            >
              Written Response
            </label>
            <span className="text-xs font-mono text-[var(--text-muted)]">
              {(answer.textAnswer || '').trim().split(/\s+/).filter(Boolean).length} words
            </span>
          </div>
          <textarea
            id={`q-essay-${question.id}`}
            rows={7}
            value={answer.textAnswer || ''}
            onChange={(e) =>
              onAnswerChange({ textAnswer: e.target.value, selectedOptionId: undefined })
            }
            placeholder="Compose your detailed explanation here..."
            className="w-full p-4 rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-canvas)] text-base text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none leading-relaxed"
          />
        </div>
      )}

      {/* Clear Action */}
      {hasValue && (
        <div className="pt-2 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAnswerChange({ selectedOptionId: undefined, textAnswer: '' })}
            leftIcon={<Eraser className="w-4 h-4" />}
          >
            Clear Response
          </Button>
        </div>
      )}
    </div>
  );
};
