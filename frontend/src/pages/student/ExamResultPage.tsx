import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import {
  CheckCircle2,
  XCircle,
  Award,
  ArrowLeft,
  ShieldAlert,
  HelpCircle,
  Check,
  X,
  Info,
  Loader2,
  Printer,
} from 'lucide-react';

interface ResultQuestionOption {
  id: string;
  text: string;
  isCorrect?: boolean;
}

interface ResultQuestion {
  id: string;
  text: string;
  type: string;
  marks: number;
  marksAwarded: number;
  isCorrect: boolean;
  explanation?: string | null;
  imageUrl?: string | null;
  selectedOptionId?: string | null;
  textAnswer?: string | null;
  correctOptionId?: string | null;
  options: ResultQuestionOption[];
}

interface ResultData {
  allowReview: boolean;
  message?: string;
  attemptId?: string;
  examTitle?: string;
  subject?: string;
  score?: number;
  totalMarks?: number;
  percentage?: number;
  passed?: boolean;
  passingMarks?: number;
  startTime?: string;
  submittedAt?: string;
  totalQuestions?: number;
  totalAnswered?: number;
  totalUnanswered?: number;
  focusLossCount?: number;
  questions?: ResultQuestion[];
  summary?: {
    examTitle: string;
    subject: string;
    submittedAt: string;
    totalAnswered: number;
    totalUnanswered: number;
  };
}

export const ExamResultPage: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  const { error: showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<ResultData | null>(null);

  useEffect(() => {
    if (!attemptId) {
      showError('Invalid attempt identifier.');
      navigate('/student', { replace: true });
      return;
    }

    const fetchResult = async () => {
      try {
        setLoading(true);
        const data = await api.getExamResult(attemptId);
        setResult(data);
      } catch (err: any) {
        showError(err.message || 'Failed to load examination result.');
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [attemptId, navigate, showError]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-canvas)]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-signal)] mb-3" />
        <p className="font-mono text-xs text-[var(--text-secondary)]">
          Compiling assessment transcript...
        </p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[var(--bg-canvas)]">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center mb-4">
          <XCircle className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Results Not Available</h2>
        <p className="mt-1 text-xs text-[var(--text-secondary)] max-w-xs">
          Unable to locate the score sheet for this attempt.
        </p>
        <Link to="/student" className="mt-5 btn-signal px-5 py-2 text-xs">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const examTitle = result.examTitle || result.summary?.examTitle || 'Examination';
  const subject = result.subject || result.summary?.subject || 'Subject';
  const submittedAt = result.submittedAt || result.summary?.submittedAt;
  const formattedDate = submittedAt ? new Date(submittedAt).toLocaleString() : 'N/A';

  const pct = Math.min(100, Math.max(0, result.percentage ?? 0));
  const pctFormatted = pct.toFixed(1);
  const ringR = 46;
  const ringCirc = 2 * Math.PI * ringR;
  const ringOffset = ringCirc - (pct / 100) * ringCirc;

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] pb-20 transition-colors duration-200">
      {/* Header Banner */}
      <div className="border-b border-[var(--border-hairline)] bg-[var(--bg-surface)]/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5 font-mono">
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded bg-[var(--bg-tray)] text-[var(--text-secondary)] border border-[var(--border-hairline)]">
                  {subject}
                </span>
                <span className="text-[11px] text-[var(--text-tertiary)]">
                  • Submitted {formattedDate}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
                {examTitle} — Assessment Transcript
              </h1>
            </div>

            <div className="flex items-center gap-2 no-print">
              <button
                type="button"
                onClick={() => window.print()}
                className="btn-ghost-surface px-3.5 py-2 text-xs flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/student')}
                className="btn-signal px-4 py-2 text-xs flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-8 space-y-7">
        {result.allowReview ? (
          <>
            {/* Score Overview Card with Radial Activity Ring */}
            <div className="studio-card p-6 sm:p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="md:col-span-1 flex flex-col items-center justify-center p-6 bg-[var(--bg-tray)]/70 rounded-2xl border border-[var(--border-hairline)] text-center">
                  <div className="relative w-28 h-28 flex items-center justify-center mb-3">
                    <svg className="w-28 h-28 -rotate-90" viewBox="0 0 112 112">
                      <circle
                        cx="56"
                        cy="56"
                        r={ringR}
                        strokeWidth="8"
                        fill="none"
                        className="stroke-black/10 dark:stroke-white/10"
                      />
                      <circle
                        cx="56"
                        cy="56"
                        r={ringR}
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={ringCirc}
                        strokeDashoffset={ringOffset}
                        className={`${
                          result.passed ? 'stroke-emerald-500' : 'stroke-rose-500'
                        } transition-all duration-700`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-mono text-2xl font-bold text-[var(--text-primary)] tabular-nums">
                        {pctFormatted}%
                      </span>
                      <span className="font-mono text-[10px] uppercase text-[var(--text-tertiary)]">
                        Score
                      </span>
                    </div>
                  </div>

                  <div
                    className={`font-mono text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded border ${
                      result.passed
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25'
                        : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/25'
                    }`}
                  >
                    {result.passed ? 'PASSED' : 'NEEDS IMPROVEMENT'}
                  </div>

                  <div className="mt-3 font-mono text-2xl font-bold text-[var(--text-primary)] tabular-nums">
                    {result.score}{' '}
                    <span className="text-sm font-normal text-[var(--text-secondary)]">
                      / {result.totalMarks}
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-[var(--text-tertiary)] mt-1">
                    Passing standard: {result.passingMarks} Marks
                  </div>
                </div>

                {/* Metrics Breakdown */}
                <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-4 bg-[var(--bg-tray)]/60 rounded-xl border border-[var(--border-hairline)]">
                    <div className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase text-[var(--text-tertiary)] mb-1">
                      <Award className="w-3.5 h-3.5 text-[#0891B2] dark:text-[#22D3EE]" />
                      <span>Percentage</span>
                    </div>
                    <div className="font-mono text-2xl font-bold text-[var(--text-primary)] tabular-nums">
                      {pctFormatted}%
                    </div>
                  </div>

                  <div className="p-4 bg-[var(--bg-tray)]/60 rounded-xl border border-[var(--border-hairline)]">
                    <div className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase text-[var(--text-tertiary)] mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Answered</span>
                    </div>
                    <div className="font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {result.totalAnswered} / {result.totalQuestions}
                    </div>
                  </div>

                  <div className="p-4 bg-[var(--bg-tray)]/60 rounded-xl border border-[var(--border-hairline)]">
                    <div className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase text-[var(--text-tertiary)] mb-1">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                      <span>Unanswered</span>
                    </div>
                    <div className="font-mono text-2xl font-bold text-[var(--text-primary)] tabular-nums">
                      {result.totalUnanswered}
                    </div>
                  </div>

                  <div className="p-4 bg-[var(--bg-tray)]/60 rounded-xl border border-[var(--border-hairline)] col-span-2 sm:col-span-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[var(--accent-signal)]/10 text-[var(--accent-signal)] flex items-center justify-center">
                        <ShieldAlert className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[var(--text-primary)]">
                          Focus-Loss Incidents
                        </div>
                        <div className="text-[11px] text-[var(--text-secondary)]">
                          Window switches tracked by proctoring sentinel
                        </div>
                      </div>
                    </div>
                    <div className="font-mono text-xl font-bold text-[var(--text-primary)] tabular-nums">
                      {result.focusLossCount ?? 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Question-by-Question Review */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-[var(--text-primary)]">
                  Itemized Question Review
                </h2>
                <span className="font-mono text-xs text-[var(--text-secondary)]">
                  {result.questions?.length || 0} Questions Evaluated
                </span>
              </div>

              {result.questions && result.questions.length > 0 ? (
                result.questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className={`studio-card overflow-hidden ${
                      q.isCorrect ? 'border-emerald-500/35' : 'border-rose-500/35'
                    }`}
                  >
                    <div className="px-5 py-3.5 border-b border-[var(--border-hairline)] flex items-center justify-between bg-[var(--bg-tray)]/50">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold text-xs sm:text-sm text-[var(--text-primary)]">
                          Q{String(idx + 1).padStart(2, '0')}
                        </span>
                        <span
                          className={`font-mono text-[10px] font-bold px-2.5 py-0.5 rounded flex items-center gap-1 border ${
                            q.isCorrect
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25'
                              : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/25'
                          }`}
                        >
                          {q.isCorrect ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          <span>{q.isCorrect ? 'Correct' : 'Incorrect'}</span>
                        </span>
                      </div>

                      <div className="font-mono text-xs font-bold text-[var(--text-primary)] tabular-nums">
                        {q.marksAwarded} / {q.marks} Marks
                      </div>
                    </div>

                    <div className="p-5 sm:p-6 space-y-4">
                      <div className="text-sm sm:text-base font-medium text-[var(--text-primary)] leading-relaxed">
                        {q.text}
                      </div>

                      {q.imageUrl && (
                        <div className="max-w-md rounded-xl overflow-hidden border border-[var(--border-hairline)] p-2 bg-[var(--bg-tray)]">
                          <img
                            src={q.imageUrl}
                            alt="Question visual"
                            className="max-h-60 rounded-lg object-contain w-full"
                          />
                        </div>
                      )}

                      {q.options &&
                        q.options.length > 0 &&
                        (q.type === 'MCQ' ||
                          q.type === 'TRUE_FALSE' ||
                          q.type === 'MULTIPLE_SELECT') && (
                          <div className="space-y-2 pt-1">
                            {q.options.map((opt) => {
                              let isStudentChoice = q.selectedOptionId === opt.id;
                              if (q.type === 'MULTIPLE_SELECT' && q.textAnswer) {
                                try {
                                  const parsed = q.textAnswer.trim().startsWith('[')
                                    ? JSON.parse(q.textAnswer)
                                    : q.textAnswer.split(',');
                                  isStudentChoice =
                                    Array.isArray(parsed) && parsed.includes(opt.id);
                                } catch {
                                  isStudentChoice = q.textAnswer.includes(opt.id);
                                }
                              }
                              const isCorrectAnswer = Boolean(
                                opt.isCorrect || q.correctOptionId === opt.id
                              );

                              let optBorder =
                                'border-[var(--border-hairline)] bg-[var(--bg-tray)]/40';
                              let badge = null;

                              if (isStudentChoice && isCorrectAnswer) {
                                optBorder =
                                  'border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300';
                                badge = (
                                  <span className="font-mono text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                    <Check className="w-3 h-3" /> Your Choice (Correct)
                                  </span>
                                );
                              } else if (isStudentChoice && !isCorrectAnswer) {
                                optBorder =
                                  'border-rose-500 bg-rose-500/10 text-rose-800 dark:text-rose-300';
                                badge = (
                                  <span className="font-mono text-[10px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                                    <X className="w-3 h-3" /> Your Choice (Incorrect)
                                  </span>
                                );
                              } else if (isCorrectAnswer) {
                                optBorder =
                                  'border-emerald-400/50 bg-emerald-500/5 text-emerald-800 dark:text-emerald-300';
                                badge = (
                                  <span className="font-mono text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                    <Check className="w-3 h-3" /> Correct Answer
                                  </span>
                                );
                              }

                              return (
                                <div
                                  key={opt.id}
                                  className={`p-3 rounded-xl border flex items-center justify-between text-xs sm:text-sm ${optBorder}`}
                                >
                                  <span className="font-medium text-[var(--text-primary)]">
                                    {opt.text}
                                  </span>
                                  {badge}
                                </div>
                              );
                            })}
                          </div>
                        )}

                      {(q.type === 'FILL_BLANK' ||
                        q.type === 'NUMERICAL' ||
                        q.type === 'SHORT_ANSWER' ||
                        q.type === 'LONG_ANSWER') && (
                        <div className="space-y-2.5 pt-1">
                          <div className="p-3.5 rounded-xl bg-[var(--bg-tray)] border border-[var(--border-hairline)] space-y-1">
                            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                              Your Submitted Response:
                            </span>
                            <div className="text-xs sm:text-sm font-medium text-[var(--text-primary)] whitespace-pre-wrap">
                              {q.textAnswer && q.textAnswer.trim().length > 0 ? (
                                q.textAnswer
                              ) : (
                                <span className="italic text-[var(--text-tertiary)]">
                                  No response provided
                                </span>
                              )}
                            </div>
                          </div>

                          {(q.type === 'FILL_BLANK' || q.type === 'NUMERICAL') &&
                            q.options &&
                            q.options.length > 0 && (
                              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs space-y-1">
                                <span className="font-mono font-semibold text-emerald-800 dark:text-emerald-300 text-[10px] uppercase tracking-wider">
                                  Accepted Correct Answer{q.options.length > 1 ? 's' : ''}:
                                </span>
                                <div className="text-emerald-700 dark:text-emerald-400 font-mono font-bold">
                                  {q.options
                                    .filter((o) => o.isCorrect)
                                    .map((o) => o.text)
                                    .join('  |  ')}
                                </div>
                              </div>
                            )}
                        </div>
                      )}

                      {q.explanation && (
                        <div className="p-3.5 bg-[#0891B2]/10 rounded-xl border border-[#0891B2]/25 text-xs text-[var(--text-primary)] space-y-1">
                          <div className="font-mono font-semibold uppercase tracking-wider text-[10px] text-[#0891B2] dark:text-[#22D3EE] flex items-center gap-1">
                            <Info className="w-3.5 h-3.5" />
                            <span>Instructor Explanation</span>
                          </div>
                          <p className="leading-relaxed">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-[var(--text-secondary)] studio-card">
                  No individual question responses to display.
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="studio-card p-8 text-center max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#0891B2]/15 text-[#0891B2] dark:text-[#22D3EE] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              Examination Successfully Submitted
            </h2>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {result.message ||
                'Responses are stored securely. Results will be published after the grading period concludes.'}
            </p>

            {result.summary && (
              <div className="grid grid-cols-2 gap-2 p-3.5 bg-[var(--bg-tray)] rounded-xl border border-[var(--border-hairline)] text-xs">
                <div>
                  <div className="text-[var(--text-secondary)]">Answered</div>
                  <div className="font-mono font-bold text-sm text-[var(--text-primary)]">
                    {result.summary.totalAnswered}
                  </div>
                </div>
                <div>
                  <div className="text-[var(--text-secondary)]">Unanswered</div>
                  <div className="font-mono font-bold text-sm text-[var(--text-primary)]">
                    {result.summary.totalUnanswered}
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2">
              <Link
                to="/student"
                className="btn-signal px-6 py-2.5 text-xs inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Dashboard</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
