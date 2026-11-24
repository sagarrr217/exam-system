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
  FileText
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
  disabled = false
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

  const getOptionLetter = (idx: number) => String.fromCharCode(65 + idx); // A, B, C, D...

  const isMarkedForReview = !!answer?.isMarkedForReview;

  // Multi-select helpers
  const selectedMultiIds: string[] = useMemo(() => {
    if (!answer?.textAnswer) {
      return answer?.selectedOptionId ? [answer.selectedOptionId] : [];
    }
    try {
      if (answer.textAnswer.trim().startsWith('[')) {
        return JSON.parse(answer.textAnswer);
      }
      return answer.textAnswer.split(',').map((s) => s.trim()).filter(Boolean);
    } catch {
      return answer.textAnswer ? [answer.textAnswer] : [];
    }
  }, [answer?.textAnswer, answer?.selectedOptionId]);

  const handleToggleMulti = (optId: string) => {
    let next: string[];
    if (selectedMultiIds.includes(optId)) {
      next = selectedMultiIds.filter((id) => id !== optId);
    } else {
      next = [...selectedMultiIds, optId];
    }
    const serialized = JSON.stringify(next);
    setLocalText(serialized);
    onTextAnswerChange(serialized);
  };

  const hasAnyAnswer = Boolean(
    answer?.selectedOptionId ||
    (answer?.textAnswer && answer.textAnswer.trim().length > 0 && answer.textAnswer.trim() !== '[]') ||
    (localText.trim().length > 0 && localText.trim() !== '[]')
  );

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'MCQ': return 'Single Choice';
      case 'MULTIPLE_SELECT': return 'Multiple Select';
      case 'TRUE_FALSE': return 'True / False';
      case 'FILL_BLANK': return 'Fill in Blank';
      case 'NUMERICAL': return 'Numerical Answer';
      case 'SHORT_ANSWER': return 'Short Answer';
      case 'LONG_ANSWER': return 'Comprehensive Essay';
      default: return type.replace('_', ' ');
    }
  };

  return (
    <div className="apple-card overflow-hidden flex flex-col">
      {/* Question Header */}
      <div className="px-6 py-4.5 border-b border-black/5 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <span className="px-3 py-1 rounded-full bg-blue-500/10 text-[#0071e3] dark:text-[#0a84ff] font-semibold text-xs">
            Question {questionIndex + 1} of {totalQuestions}
          </span>
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-[#86868b] dark:text-[#98989d]">
            {question.marks} {question.marks === 1 ? 'Mark' : 'Marks'}
          </span>
          <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-black/[0.03] dark:bg-white/[0.05] text-[#1d1d1f] dark:text-[#f5f5f7]">
            {getQuestionTypeLabel(question.type)}
          </span>
        </div>

        {/* Mark for Review Button */}
        <button
          type="button"
          onClick={onToggleReview}
          disabled={disabled}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all active:scale-95 ${
            isMarkedForReview
              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 shadow-sm'
              : 'text-[#86868b] dark:text-[#98989d] border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10'
          }`}
        >
          <Bookmark className={`w-3 h-3 ${isMarkedForReview ? 'fill-current text-amber-500' : ''}`} />
          <span>{isMarkedForReview ? 'Marked' : 'Mark for Review'}</span>
        </button>
      </div>

      {/* Question Content */}
      <div className="p-6 sm:p-8 flex-1 space-y-6">
        {/* Question Text */}
        <div className="text-base sm:text-lg font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] leading-relaxed">
          {question.text}
        </div>

        {/* Question Image if exists */}
        {question.imageUrl && (
          <div className="max-w-xl mx-auto rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] p-2">
            <div className="flex items-center gap-1.5 mb-2 text-[11px] font-medium text-[#86868b]">
              <ImageIcon className="w-3.5 h-3.5 text-[#86868b]" />
              <span>Reference Attachment / Diagram</span>
            </div>
            <img
              src={question.imageUrl}
              alt="Question illustration"
              className="max-h-72 w-full object-contain rounded-xl"
            />
          </div>
        )}

        {/* Question Options / Inputs */}
        <div className="pt-1">
          {/* 1. MCQ Single Select */}
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
                    className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border transition-all flex items-start gap-3.5 active:scale-[0.99] ${
                      isSelected
                        ? 'border-[#0071e3] dark:border-[#0a84ff] bg-blue-500/[0.08] dark:bg-blue-500/[0.15] shadow-sm'
                        : 'border-black/5 dark:border-white/10 bg-black/[0.015] dark:bg-white/[0.02] hover:bg-black/[0.04] dark:hover:bg-white/[0.05]'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-semibold text-xs flex-shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-[#0071e3] dark:bg-[#0a84ff] text-white shadow-sm'
                          : 'bg-black/5 dark:bg-white/10 text-[#86868b]'
                      }`}
                    >
                      {getOptionLetter(idx)}
                    </div>
                    <div className="flex-1 text-xs sm:text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7] leading-relaxed pt-1">
                      {option.text}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* 2. MULTIPLE_SELECT Checkboxes */}
          {question.type === 'MULTIPLE_SELECT' && (
            <div className="space-y-2.5">
              <div className="text-xs font-medium text-[#0071e3] dark:text-[#0a84ff] mb-2">
                * Select all applicable answers:
              </div>
              {question.options.map((option: Option, idx: number) => {
                const isSelected = selectedMultiIds.includes(option.id);
                return (
                  <button
                    key={option.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => handleToggleMulti(option.id)}
                    className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border transition-all flex items-start gap-3.5 active:scale-[0.99] ${
                      isSelected
                        ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-500/[0.08] dark:bg-indigo-500/[0.15] shadow-sm'
                        : 'border-black/5 dark:border-white/10 bg-black/[0.015] dark:bg-white/[0.02] hover:bg-black/[0.04] dark:hover:bg-white/[0.05]'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm'
                          : 'bg-black/5 dark:bg-white/10 text-[#86868b]'
                      }`}
                    >
                      {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 text-xs sm:text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7] leading-relaxed pt-1">
                      <span className="font-semibold mr-2 text-[#86868b]">{getOptionLetter(idx)}.</span>
                      {option.text}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* 3. TRUE / FALSE Options */}
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
                    className={`p-5 rounded-2xl border transition-all flex items-center justify-center gap-2.5 active:scale-98 ${
                      isSelected
                        ? isTrue
                          ? 'border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 shadow-sm'
                          : 'border-rose-500 bg-rose-500/15 text-rose-700 dark:text-rose-300 shadow-sm'
                        : 'border-black/5 dark:border-white/10 bg-black/[0.015] dark:bg-white/[0.02] hover:bg-black/[0.04] dark:hover:bg-white/[0.05] text-[#1d1d1f] dark:text-[#f5f5f7]'
                    }`}
                  >
                    {isTrue ? (
                      <Check className={`w-5 h-5 ${isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#86868b]'}`} />
                    ) : (
                      <X className={`w-5 h-5 ${isSelected ? 'text-rose-600 dark:text-rose-400' : 'text-[#86868b]'}`} />
                    )}
                    <span className="text-base font-semibold">{option.text}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* 4. FILL IN THE BLANK */}
          {question.type === 'FILL_BLANK' && (
            <div className="space-y-2.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-[#86868b] uppercase tracking-wider">
                <PenTool className="w-3.5 h-3.5 text-[#0071e3] dark:text-[#0a84ff]" />
                <span>Fill in the missing answer:</span>
              </label>
              <input
                type="text"
                value={localText}
                disabled={disabled}
                onChange={(e) => setLocalText(e.target.value)}
                onBlur={handleTextBlur}
                placeholder="Type your response..."
                className="w-full px-4 py-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] focus:bg-white dark:focus:bg-[#1c1c1e] border border-black/10 dark:border-white/10 text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7] placeholder-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#0071e3] dark:focus:ring-[#0a84ff] transition-all"
              />
              <div className="flex justify-between items-center text-[11px] text-[#86868b]">
                <span>Case-insensitive standard academic matching</span>
                <span>Autosaved on edit</span>
              </div>
            </div>
          )}

          {/* 5. NUMERICAL ANSWER */}
          {question.type === 'NUMERICAL' && (
            <div className="space-y-2.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-[#86868b] uppercase tracking-wider">
                <Hash className="w-3.5 h-3.5 text-emerald-500" />
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
                className="w-full max-w-sm px-4 py-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] focus:bg-white dark:focus:bg-[#1c1c1e] border border-black/10 dark:border-white/10 font-mono text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] placeholder-[#86868b] focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
              <div className="flex justify-between items-center text-[11px] text-[#86868b]">
                <span>Integer or floating-point decimals accepted</span>
                <span>Autosaved on edit</span>
              </div>
            </div>
          )}

          {/* 6. SHORT ANSWER */}
          {question.type === 'SHORT_ANSWER' && (
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-[#86868b] uppercase tracking-wider">
                <AlignLeft className="w-3.5 h-3.5 text-[#0071e3] dark:text-[#0a84ff]" />
                <span>Short Answer Response</span>
              </label>
              <textarea
                rows={4}
                value={localText}
                disabled={disabled}
                onChange={(e) => setLocalText(e.target.value)}
                onBlur={handleTextBlur}
                placeholder="Type your explanation here..."
                className="w-full p-4 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] focus:bg-white dark:focus:bg-[#1c1c1e] border border-black/10 dark:border-white/10 text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7] placeholder-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#0071e3] dark:focus:ring-[#0a84ff] transition-all leading-relaxed"
              />
              <div className="flex justify-between items-center text-[11px] text-[#86868b]">
                <span>{localText.trim().split(/\s+/).filter(Boolean).length} Words</span>
                <span>{localText.length} Characters</span>
              </div>
            </div>
          )}

          {/* 7. LONG / DETAILED 5-MARKER ANSWER */}
          {question.type === 'LONG_ANSWER' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Comprehensive 5-Marker Essay</span>
                </label>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  Descriptive 5 Marks
                </span>
              </div>
              <textarea
                rows={8}
                value={localText}
                disabled={disabled}
                onChange={(e) => setLocalText(e.target.value)}
                onBlur={handleTextBlur}
                placeholder="Write your comprehensive analysis, architectural breakdown, or derivation here..."
                className="w-full p-4 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] focus:bg-white dark:focus:bg-[#1c1c1e] border border-black/10 dark:border-white/10 text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7] placeholder-[#86868b] focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all leading-relaxed"
              />
              <div className="flex justify-between items-center text-[11px] text-[#86868b]">
                <span>{localText.trim().split(/\s+/).filter(Boolean).length} Words</span>
                <span>{localText.length} Characters</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Question Footer: Clear & Navigations */}
      <div className="p-4 sm:p-5 bg-black/[0.015] dark:bg-white/[0.02] border-t border-black/5 dark:border-white/10 flex items-center justify-between gap-3">
        {/* Clear Answer Button */}
        <button
          type="button"
          onClick={() => {
            setLocalText('');
            onClearAnswer();
          }}
          disabled={disabled || !hasAnyAnswer}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#86868b] hover:text-[#ff3b30] dark:hover:text-[#ff453a] disabled:opacity-30 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Clear Answer</span>
        </button>

        {/* Previous and Next Navigation */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPrev}
            disabled={!hasPrev || disabled}
            className="apple-btn-secondary px-3.5 py-1.5 text-xs flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <button
            type="button"
            onClick={onNext}
            disabled={!hasNext || disabled}
            className="apple-btn-primary px-4 py-1.5 text-xs flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <span>Next</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
