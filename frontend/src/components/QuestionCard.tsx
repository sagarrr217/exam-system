import React, { useState, useEffect, useMemo } from 'react';
import { Question, StudentAnswer, Option } from '../types';
import {
  Bookmark,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  Image as ImageIcon,
  CheckSquare,
  Square,
  Hash,
  PenTool,
  AlignLeft,
  FileText,
} from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  answer?: StudentAnswer;
  onOptionSelect: (optionId: string) => void;
  onTextAnswerChange: (text: string) => void;
  onToggleReview: () => void;
  onClearAnswer: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  disabled?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionIndex,
  totalQuestions,
  answer,
  onOptionSelect,
  onTextAnswerChange,
  onToggleReview,
  onClearAnswer,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  disabled = false,
}) => {
  const [localText, setLocalText] = useState(answer?.textAnswer || '');

  useEffect(() => {
    setLocalText(answer?.textAnswer || '');
  }, [question.id, answer?.textAnswer]);

  const handleTextBlur = () => {
    if (localText !== (answer?.textAnswer || '')) {
      onTextAnswerChange(localText);
    }
  };

  const getOptionLetter = (idx: number) => String.fromCharCode(65 + idx);
  const isMarkedForReview = !!answer?.isMarkedForReview;

  const selectedMultiIds: string[] = useMemo(() => {
    if (!answer?.textAnswer) {
      return answer?.selectedOptionId ? [answer.selectedOptionId] : [];
    }
    try {
      if (answer.textAnswer.trim().startsWith('[')) {
        return JSON.parse(answer.textAnswer);
      }
      return answer.textAnswer
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    } catch {
      return answer.textAnswer ? [answer.textAnswer] : [];
    }
  }, [answer?.textAnswer, answer?.selectedOptionId]);

  const handleToggleMulti = (optId: string) => {
    const next = selectedMultiIds.includes(optId)
      ? selectedMultiIds.filter((id) => id !== optId)
      : [...selectedMultiIds, optId];
    const serialized = JSON.stringify(next);
    setLocalText(serialized);
    onTextAnswerChange(serialized);
  };

  const hasAnyAnswer = Boolean(
    answer?.selectedOptionId ||
      (answer?.textAnswer &&
        answer.textAnswer.trim().length > 0 &&
        answer.textAnswer.trim() !== '[]') ||
      (localText.trim().length > 0 && localText.trim() !== '[]')
  );

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'MCQ':
        return 'Single Choice';
      case 'MULTIPLE_SELECT':
        return 'Multiple Select';
      case 'TRUE_FALSE':
        return 'True / False';
      case 'FILL_BLANK':
        return 'Fill in Blank';
      case 'NUMERICAL':
        return 'Numerical Answer';
      case 'SHORT_ANSWER':
        return 'Short Answer';
      case 'LONG_ANSWER':
        return 'Comprehensive Essay';
      default:
        return type.replace('_', ' ');
    }
  };

  return (
    <div className="studio-card overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[var(--border-hairline)] bg-[var(--bg-tray)]/40 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-2.5 font-mono">
          <span className="px-3 py-1 rounded-lg bg-[var(--accent-signal)]/10 text-[var(--accent-signal)] border border-[var(--accent-signal)]/25 font-bold text-xs">
            Q{String(questionIndex + 1).padStart(2, '0')} / {String(totalQuestions).padStart(2, '0')}
          </span>
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[var(--bg-tray)] text-[var(--text-secondary)] border border-[var(--border-hairline)]">
            {question.marks} {question.marks === 1 ? 'Mark' : 'Marks'}
          </span>
          <span className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-hairline)]">
            {getQuestionTypeLabel(question.type)}
          </span>
        </div>

        <button
          type="button"
          onClick={onToggleReview}
          disabled={disabled}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all active:scale-95 ${
            isMarkedForReview
              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/35'
              : 'text-[var(--text-secondary)] border-[var(--border-hairline)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)]'
          }`}
        >
          <Bookmark className={`w-3.5 h-3.5 ${isMarkedForReview ? 'fill-current text-amber-500' : ''}`} />
          <span>{isMarkedForReview ? 'Flagged for Review' : 'Mark for Review'}</span>
        </button>
      </div>

      {/* Body */}
      <div className="p-6 sm:p-8 flex-1 space-y-6">
        <div className="text-base sm:text-lg font-semibold text-[var(--text-primary)] leading-relaxed">
          {question.text}
        </div>

        {question.imageUrl && (
          <div className="max-w-xl mx-auto rounded-xl overflow-hidden border border-[var(--border-hairline)] bg-[var(--bg-tray)]/50 p-3">
            <div className="flex items-center gap-1.5 mb-2 font-mono text-[10px] uppercase font-medium text-[var(--text-tertiary)]">
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Reference Diagram</span>
            </div>
            <img
              src={question.imageUrl}
              alt="Question illustration"
              className="max-h-72 w-full object-contain rounded-lg"
            />
          </div>
        )}

        <div className="pt-1">
          {/* 1. MCQ */}
          {question.type === 'MCQ' && (
            <div className="space-y-2.5">
              {question.options.map((option: Option, idx: number) => {
                const isSelected = answer?.selectedOptionId === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => onOptionSelect(option.id)}
                    className={`w-full text-left p-3.5 sm:p-4 rounded-xl border transition-all flex items-start gap-3.5 active:scale-[0.99] ${
                      isSelected
                        ? 'border-[var(--accent-signal)] bg-[var(--accent-signal)]/10'
                        : 'border-[var(--border-hairline)] bg-[var(--bg-tray)]/40 hover:border-[var(--border-strong)]'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg font-mono flex items-center justify-center font-bold text-xs flex-shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-[var(--accent-signal)] text-white'
                          : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-hairline)]'
                      }`}
                    >
                      {getOptionLetter(idx)}
                    </div>
                    <div className="flex-1 text-xs sm:text-sm font-medium text-[var(--text-primary)] leading-relaxed pt-1">
                      {option.text}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* 2. MULTIPLE_SELECT */}
          {question.type === 'MULTIPLE_SELECT' && (
            <div className="space-y-2.5">
              <div className="font-mono text-[11px] font-semibold text-[#0891B2] dark:text-[#22D3EE] mb-2">
                * Select all applicable choices:
              </div>
              {question.options.map((option: Option, idx: number) => {
                const isSelected = selectedMultiIds.includes(option.id);
                return (
                  <button
                    key={option.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => handleToggleMulti(option.id)}
                    className={`w-full text-left p-3.5 sm:p-4 rounded-xl border transition-all flex items-start gap-3.5 active:scale-[0.99] ${
                      isSelected
                        ? 'border-[#0891B2] dark:border-[#22D3EE] bg-[#0891B2]/10 dark:bg-[#22D3EE]/10'
                        : 'border-[var(--border-hairline)] bg-[var(--bg-tray)]/40 hover:border-[var(--border-strong)]'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-[#0891B2] dark:bg-[#22D3EE] text-white dark:text-[#0A0B0E]'
                          : 'bg-[var(--bg-surface)] text-[var(--text-tertiary)] border border-[var(--border-hairline)]'
                      }`}
                    >
                      {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 text-xs sm:text-sm font-medium text-[var(--text-primary)] leading-relaxed pt-1">
                      <span className="font-mono font-bold mr-2 text-[var(--text-tertiary)]">
                        {getOptionLetter(idx)}.
                      </span>
                      {option.text}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* 3. TRUE / FALSE */}
          {question.type === 'TRUE_FALSE' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {question.options.map((option: Option) => {
                const isSelected = answer?.selectedOptionId === option.id;
                const isTrue = option.text.toLowerCase().includes('true');

                return (
                  <button
                    key={option.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => onOptionSelect(option.id)}
                    className={`p-5 rounded-xl border transition-all flex items-center justify-center gap-2.5 active:scale-98 ${
                      isSelected
                        ? isTrue
                          ? 'border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                          : 'border-rose-500 bg-rose-500/15 text-rose-700 dark:text-rose-300'
                        : 'border-[var(--border-hairline)] bg-[var(--bg-tray)]/40 hover:border-[var(--border-strong)] text-[var(--text-primary)]'
                    }`}
                  >
                    {isTrue ? (
                      <Check
                        className={`w-5 h-5 ${
                          isSelected ? 'text-emerald-500' : 'text-[var(--text-tertiary)]'
                        }`}
                      />
                    ) : (
                      <X
                        className={`w-5 h-5 ${
                          isSelected ? 'text-rose-500' : 'text-[var(--text-tertiary)]'
                        }`}
                      />
                    )}
                    <span className="text-base font-bold">{option.text}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* 4. FILL_BLANK */}
          {question.type === 'FILL_BLANK' && (
            <div className="space-y-2.5">
              <label className="flex items-center gap-1.5 font-mono text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                <PenTool className="w-3.5 h-3.5 text-[var(--accent-signal)]" />
                <span>Fill in the missing answer:</span>
              </label>
              <input
                type="text"
                value={localText}
                disabled={disabled}
                onChange={(e) => setLocalText(e.target.value)}
                onBlur={handleTextBlur}
                placeholder="Type your response..."
                className="w-full px-4 py-3 rounded-xl bg-[var(--bg-tray)] focus:bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-sm font-medium text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-signal)] transition-all"
              />
              <div className="flex justify-between items-center font-mono text-[11px] text-[var(--text-tertiary)]">
                <span>Case-insensitive academic match</span>
                <span>Autosaves on blur</span>
              </div>
            </div>
          )}

          {/* 5. NUMERICAL */}
          {question.type === 'NUMERICAL' && (
            <div className="space-y-2.5">
              <label className="flex items-center gap-1.5 font-mono text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                <Hash className="w-3.5 h-3.5 text-[#0891B2] dark:text-[#22D3EE]" />
                <span>Enter numerical value:</span>
              </label>
              <input
                type="number"
                step="any"
                value={localText}
                disabled={disabled}
                onChange={(e) => setLocalText(e.target.value)}
                onBlur={handleTextBlur}
                placeholder="e.g. 42 or 3.1415"
                className="w-full max-w-sm px-4 py-3 rounded-xl bg-[var(--bg-tray)] focus:bg-[var(--bg-surface)] border border-[var(--border-hairline)] font-mono text-base font-bold text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[#0891B2] dark:focus:ring-[#22D3EE] transition-all"
              />
              <div className="flex justify-between items-center font-mono text-[11px] text-[var(--text-tertiary)]">
                <span>Tolerance ±0.001</span>
                <span>Autosaves on blur</span>
              </div>
            </div>
          )}

          {/* 6. SHORT_ANSWER */}
          {question.type === 'SHORT_ANSWER' && (
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 font-mono text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                <AlignLeft className="w-3.5 h-3.5 text-[var(--accent-signal)]" />
                <span>Short Answer Response</span>
              </label>
              <textarea
                rows={4}
                value={localText}
                disabled={disabled}
                onChange={(e) => setLocalText(e.target.value)}
                onBlur={handleTextBlur}
                placeholder="Type your explanation here..."
                className="w-full p-4 rounded-xl bg-[var(--bg-tray)] focus:bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-sm font-medium text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-signal)] transition-all leading-relaxed"
              />
              <div className="flex justify-between items-center font-mono text-[11px] text-[var(--text-tertiary)]">
                <span>{localText.trim().split(/\s+/).filter(Boolean).length} Words</span>
                <span>{localText.length} Characters</span>
              </div>
            </div>
          )}

          {/* 7. LONG_ANSWER */}
          {question.type === 'LONG_ANSWER' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 font-mono text-xs font-semibold text-[#0891B2] dark:text-[#22D3EE] uppercase tracking-wider">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Comprehensive 5-Marker Essay</span>
                </label>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#0891B2]/10 text-[#0891B2] dark:text-[#22D3EE] border border-[#0891B2]/25">
                  Descriptive
                </span>
              </div>
              <textarea
                rows={8}
                value={localText}
                disabled={disabled}
                onChange={(e) => setLocalText(e.target.value)}
                onBlur={handleTextBlur}
                placeholder="Write your comprehensive analysis, architectural breakdown, or derivation here..."
                className="w-full p-4 rounded-xl bg-[var(--bg-tray)] focus:bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-sm font-medium text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[#0891B2] dark:focus:ring-[#22D3EE] transition-all leading-relaxed"
              />
              <div className="flex justify-between items-center font-mono text-[11px] text-[var(--text-tertiary)]">
                <span>{localText.trim().split(/\s+/).filter(Boolean).length} Words</span>
                <span>{localText.length} Characters</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="p-4 sm:p-5 bg-[var(--bg-tray)]/40 border-t border-[var(--border-hairline)] flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            setLocalText('');
            onClearAnswer();
          }}
          disabled={disabled || !hasAnyAnswer}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-rose-500 disabled:opacity-30 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Clear</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPrev}
            disabled={!hasPrev || disabled}
            className="btn-ghost-surface px-3.5 py-2 text-xs flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <button
            type="button"
            onClick={onNext}
            disabled={!hasNext || disabled}
            className="btn-signal px-4 py-2 text-xs flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <span>Next</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
