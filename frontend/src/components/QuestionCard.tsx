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
      case 'MCQ': return 'Multiple Choice (Single)';
      case 'MULTIPLE_SELECT': return 'Multiple Select (Checkboxes)';
      case 'TRUE_FALSE': return 'True / False';
      case 'FILL_BLANK': return 'Fill in the Blank';
      case 'NUMERICAL': return 'Numerical Answer';
      case 'SHORT_ANSWER': return 'Short Answer';
      case 'LONG_ANSWER': return 'Detailed 5-Marker Essay';
      default: return type.replace('_', ' ');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
      {/* Question Header */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-extrabold text-sm">
            Question {questionIndex + 1} of {totalQuestions}
          </span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {question.marks} {question.marks === 1 ? 'Mark' : 'Marks'}
          </span>
          <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-blue-50/50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 uppercase tracking-wide">
            {getQuestionTypeLabel(question.type)}
          </span>
        </div>

        {/* Mark for Review Button */}
        <button
          type="button"
          onClick={onToggleReview}
          disabled={disabled}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${isMarkedForReview
            ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800 shadow-sm'
            : 'text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
        >
          <Bookmark className={`w-3.5 h-3.5 ${isMarkedForReview ? 'fill-amber-500 text-amber-500' : ''}`} />
          <span>{isMarkedForReview ? 'Marked for Review' : 'Mark for Review'}</span>
        </button>
      </div>

      {/* Question Content */}
      <div className="p-6 sm:p-8 flex-1 space-y-6">
        {/* Question Text */}
        <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
          {question.text}
        </div>

        {/* Question Image if exists */}
        {question.imageUrl && (
          <div className="max-w-xl mx-auto rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-slate-50 dark:bg-slate-950 p-2">
            <div className="flex items-center gap-2 mb-2 text-xs font-medium text-slate-500">
              <ImageIcon className="w-4 h-4 text-slate-400" />
              <span>Reference Attachment / Diagram</span>
            </div>
            <img
              src={question.imageUrl}
              alt="Question illustration"
              className="max-h-72 w-full object-contain rounded-lg"
            />
          </div>
        )}

        {/* Question Options / Inputs */}
        <div className="pt-2">
          {/* 1. MCQ Single Select */}
          {question.type === 'MCQ' && (
            <div className="space-y-3">
              {question.options.map((option: Option, idx: number) => {
                const isSelected = answer?.selectedOptionId === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => onOptionSelect(option.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-4 group ${isSelected
                      ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 shadow-sm ring-1 ring-blue-600'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                      }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 transition-colors ${isSelected
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-slate-200'
                        }`}
                    >
                      {getOptionLetter(idx)}
                    </div>
                    <div className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed pt-1">
                      {option.text}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* 2. MULTIPLE_SELECT Checkboxes */}
          {question.type === 'MULTIPLE_SELECT' && (
            <div className="space-y-3">
              <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2">
                * Select all options that apply (multiple answers allowed):
              </div>
              {question.options.map((option: Option, idx: number) => {
                const isSelected = selectedMultiIds.includes(option.id);
                return (
                  <button
                    key={option.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => handleToggleMulti(option.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-4 group ${isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-sm ring-1 ring-indigo-600'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                      }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 transition-colors ${isSelected
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-slate-200'
                        }`}
                    >
                      {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed pt-1">
                      <span className="font-bold mr-2 text-slate-400">{getOptionLetter(idx)}.</span>
                      {option.text}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* 3. TRUE / FALSE Options */}
          {question.type === 'TRUE_FALSE' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {question.options.map((option: Option) => {
                const isSelected = answer?.selectedOptionId === option.id;
                const isTrue = option.text.toLowerCase().includes('true');

                return (
                  <button
                    key={option.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => onOptionSelect(option.id)}
                    className={`p-6 rounded-2xl border transition-all flex items-center justify-center gap-3 ${isSelected
                      ? isTrue
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 ring-2 ring-emerald-600 shadow-md'
                        : 'border-rose-600 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 ring-2 ring-rose-600 shadow-md'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                  >
                    {isTrue ? (
                      <Check className={`w-6 h-6 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                    ) : (
                      <X className={`w-6 h-6 ${isSelected ? 'text-rose-600' : 'text-slate-400'}`} />
                    )}
                    <span className="text-lg font-bold">{option.text}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* 4. FILL IN THE BLANK */}
          {question.type === 'FILL_BLANK' && (
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                <PenTool className="w-3.5 h-3.5 text-blue-600" />
                <span>Fill in the missing term or expression</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={localText}
                  disabled={disabled}
                  onChange={(e) => setLocalText(e.target.value)}
                  onBlur={handleTextBlur}
                  placeholder="Type your exact answer here..."
                  className="w-full px-5 py-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 text-base font-semibold shadow-inner transition-colors"
                />
              </div>
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>Case-insensitive standard academic matching</span>
                <span>Autosaved on change / blur</span>
              </div>
            </div>
          )}

          {/* 5. NUMERICAL ANSWER */}
          {question.type === 'NUMERICAL' && (
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                <Hash className="w-4 h-4 text-emerald-600" />
                <span>Enter Numerical Solution</span>
              </label>
              <div className="relative max-w-md">
                <input
                  type="number"
                  step="any"
                  value={localText}
                  disabled={disabled}
                  onChange={(e) => setLocalText(e.target.value)}
                  onBlur={handleTextBlur}
                  placeholder="e.g. 42 or 3.1415"
                  className="w-full px-5 py-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 text-lg font-mono font-bold shadow-inner transition-colors"
                />
              </div>
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>Integer or floating-point precision accepted</span>
                <span>Autosaved on change / blur</span>
              </div>
            </div>
          )}

          {/* 6. SHORT ANSWER */}
          {question.type === 'SHORT_ANSWER' && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <AlignLeft className="w-3.5 h-3.5 text-blue-500" />
                <span>Short Answer Response (Autosaved on blur)</span>
              </label>
              <textarea
                rows={5}
                value={localText}
                disabled={disabled}
                onChange={(e) => setLocalText(e.target.value)}
                onBlur={handleTextBlur}
                placeholder="Type your brief explanation, summary, or response here..."
                className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm leading-relaxed"
              />
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>{localText.trim().split(/\s+/).filter(Boolean).length} Words</span>
                <span>{localText.length} Characters</span>
              </div>
            </div>
          )}

          {/* 7. LONG / DETAILED 5-MARKER ANSWER */}
          {question.type === 'LONG_ANSWER' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  <FileText className="w-4 h-4" />
                  <span>Comprehensive 5-Marker Essay / Detailed Response</span>
                </label>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Descriptive 5 Marks
                </span>
              </div>
              <textarea
                rows={10}
                value={localText}
                disabled={disabled}
                onChange={(e) => setLocalText(e.target.value)}
                onBlur={handleTextBlur}
                placeholder="Write your comprehensive in-depth explanation, architectural analysis, derivation, or code solution here..."
                className="w-full p-5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base sm:text-sm leading-relaxed font-sans"
              />
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>{localText.trim().split(/\s+/).filter(Boolean).length} Words</span>
                <span>{localText.length} Characters</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Question Footer: Clear & Navigations */}
      <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
        {/* Clear Answer Button */}
        <button
          type="button"
          onClick={() => {
            setLocalText('');
            onClearAnswer();
          }}
          disabled={disabled || !hasAnyAnswer}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Clear Answer</span>
        </button>

        {/* Previous and Next Navigation */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onPrev}
            disabled={!hasPrev || disabled}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            type="button"
            onClick={onNext}
            disabled={!hasNext || disabled}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <span>Next</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};