import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { 
  CheckCircle2, 
  XCircle, 
  Award, 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  ShieldAlert, 
  HelpCircle, 
  Check, 
  X, 
  Info, 
  Loader2 
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f5f7] dark:bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-[#0071e3] dark:text-[#0a84ff] mb-3" />
        <p className="text-xs font-medium text-[#86868b]">Compiling assessment performance...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[#f5f5f7] dark:bg-black">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-[#ff3b30] flex items-center justify-center mb-4">
          <XCircle className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">Results Not Available</h2>
        <p className="mt-1 text-xs text-[#86868b] max-w-xs">
          Unable to locate the score sheet for this attempt.
        </p>
        <Link
          to="/student"
          className="mt-5 apple-btn-primary px-5 py-2 text-xs"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const examTitle = result.examTitle || result.summary?.examTitle || 'Examination';
  const subject = result.subject || result.summary?.subject || 'Subject';
  const submittedAt = result.submittedAt || result.summary?.submittedAt;
  const formattedDate = submittedAt ? new Date(submittedAt).toLocaleString() : 'N/A';

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-black pb-20 transition-colors duration-200">
      {/* Top Header Banner */}
      <div className="border-b border-black/5 dark:border-white/10 bg-white/70 dark:bg-[#1c1c1e]/70 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-[#86868b]">
                  {subject}
                </span>
                <span className="text-[11px] text-[#86868b]">• Submitted {formattedDate}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">
                {examTitle} — Assessment Report
              </h1>
            </div>

            <button
              onClick={() => navigate('/student')}
              className="apple-btn-secondary px-4 py-2 text-xs flex items-center gap-1.5 self-start sm:self-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-8 space-y-7">
        {result.allowReview ? (
          <>
            {/* Apple Activity / Fitness Style Score Overview Card */}
            <div className="apple-card p-6 sm:p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                {/* Score & Pass Badge */}
                <div className="md:col-span-1 flex flex-col items-center justify-center p-6 bg-black/[0.02] dark:bg-white/[0.03] rounded-2xl border border-black/5 dark:border-white/5 text-center">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-sm ${
                      result.passed
                        ? 'bg-[#34c759] text-white shadow-emerald-500/20'
                        : 'bg-[#ff3b30] text-white shadow-rose-500/20'
                    }`}
                  >
                    {result.passed ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
                  </div>

                  <div
                    className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                      result.passed
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {result.passed ? 'PASSED' : 'NEEDS IMPROVEMENT'}
                  </div>

                  <div className="mt-3 text-3xl sm:text-4xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                    {result.score} <span className="text-lg font-normal text-[#86868b]">/ {result.totalMarks}</span>
                  </div>
                  <div className="text-[11px] font-medium text-[#86868b] mt-1">
                    Passing standard: {result.passingMarks} Marks
                  </div>
                </div>

                {/* Key Metrics Breakdown Bento */}
                <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-4 bg-black/[0.02] dark:bg-white/[0.03] rounded-2xl border border-black/5 dark:border-white/5">
                    <div className="flex items-center gap-1.5 text-[#86868b] text-[11px] font-medium uppercase mb-1">
                      <Award className="w-3.5 h-3.5 text-[#0071e3] dark:text-[#0a84ff]" />
                      <span>Percentage</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                      {result.percentage}%
                    </div>
                  </div>

                  <div className="p-4 bg-black/[0.02] dark:bg-white/[0.03] rounded-2xl border border-black/5 dark:border-white/5">
                    <div className="flex items-center gap-1.5 text-[#86868b] text-[11px] font-medium uppercase mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Answered</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-[#34c759] dark:text-[#30d158]">
                      {result.totalAnswered} / {result.totalQuestions}
                    </div>
                  </div>

                  <div className="p-4 bg-black/[0.02] dark:bg-white/[0.03] rounded-2xl border border-black/5 dark:border-white/5">
                    <div className="flex items-center gap-1.5 text-[#86868b] text-[11px] font-medium uppercase mb-1">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                      <span>Unanswered</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                      {result.totalUnanswered}
                    </div>
                  </div>

                  <div className="p-4 bg-black/[0.02] dark:bg-white/[0.03] rounded-2xl border border-black/5 dark:border-white/5 sm:col-span-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-[#0071e3] dark:text-[#0a84ff] flex items-center justify-center">
                        <ShieldAlert className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                          Focus-Loss Incidents
                        </div>
                        <div className="text-[11px] text-[#86868b]">
                          Window switches tracked by proctoring
                        </div>
                      </div>
                    </div>
                    <div className="text-base font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                      {result.focusLossCount ?? 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Question-by-Question Detailed Review */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                  Itemized Question Review
                </h2>
                <span className="text-xs text-[#86868b]">
                  {result.questions?.length || 0} Questions Evaluated
                </span>
              </div>

              {result.questions && result.questions.length > 0 ? (
                result.questions.map((q, idx) => {
                  return (
                    <div
                      key={q.id}
                      className={`apple-card overflow-hidden transition-all ${
                        q.isCorrect
                          ? 'border-emerald-500/30'
                          : 'border-rose-500/30'
                      }`}
                    >
                      {/* Question Top Header */}
                      <div className="px-5 py-3.5 border-b border-black/5 dark:border-white/10 flex items-center justify-between bg-black/[0.015] dark:bg-white/[0.02]">
                        <div className="flex items-center gap-2.5">
                          <span className="font-semibold text-xs sm:text-sm text-[#1d1d1f] dark:text-[#f5f5f7]">
                            Question {idx + 1}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                              q.isCorrect
                                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            {q.isCorrect ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                            <span>{q.isCorrect ? 'Correct' : 'Incorrect'}</span>
                          </span>
                        </div>

                        <div className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                          Score: {q.marksAwarded} / {q.marks} Marks
                        </div>
                      </div>

                      {/* Question Body */}
                      <div className="p-5 sm:p-6 space-y-4">
                        <div className="text-sm sm:text-base font-medium text-[#1d1d1f] dark:text-[#f5f5f7] leading-relaxed">
                          {q.text}
                        </div>

                        {q.imageUrl && (
                          <div className="max-w-md rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 p-2 bg-black/[0.02] dark:bg-white/[0.02]">
                            <img src={q.imageUrl} alt="Question visual" className="max-h-60 rounded-xl object-contain w-full" />
                          </div>
                        )}

                        {/* Options Review for MCQ, TRUE_FALSE, MULTIPLE_SELECT */}
                        {q.options && q.options.length > 0 && (q.type === 'MCQ' || q.type === 'TRUE_FALSE' || q.type === 'MULTIPLE_SELECT') && (
                          <div className="space-y-2 pt-1">
                            {q.options.map((opt) => {
                              let isStudentChoice = q.selectedOptionId === opt.id;
                              if (q.type === 'MULTIPLE_SELECT' && q.textAnswer) {
                                try {
                                  const parsed = q.textAnswer.trim().startsWith('[') ? JSON.parse(q.textAnswer) : q.textAnswer.split(',');
                                  isStudentChoice = Array.isArray(parsed) && parsed.includes(opt.id);
                                } catch {
                                  isStudentChoice = q.textAnswer.includes(opt.id);
                                }
                              }
                              const isCorrectAnswer = Boolean(opt.isCorrect || q.correctOptionId === opt.id);

                              let optBorder = 'border-black/5 dark:border-white/10 bg-black/[0.015] dark:bg-white/[0.02]';
                              let badge = null;

                              if (isStudentChoice && isCorrectAnswer) {
                                optBorder = 'border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300';
                                badge = (
                                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                    <Check className="w-3 h-3" /> Your Choice (Correct)
                                  </span>
                                );
                              } else if (isStudentChoice && !isCorrectAnswer) {
                                optBorder = 'border-rose-500 bg-rose-500/10 text-rose-800 dark:text-rose-300';
                                badge = (
                                  <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                                    <X className="w-3 h-3" /> Your Choice (Incorrect)
                                  </span>
                                );
                              } else if (isCorrectAnswer) {
                                optBorder = 'border-emerald-400/50 bg-emerald-500/5 text-emerald-800 dark:text-emerald-300';
                                badge = (
                                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                    <Check className="w-3 h-3" /> Correct Answer
                                  </span>
                                );
                              }

                              return (
                                <div
                                  key={opt.id}
                                  className={`p-3 rounded-2xl border flex items-center justify-between text-xs sm:text-sm ${optBorder}`}
                                >
                                  <span className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">{opt.text}</span>
                                  {badge}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Student Response for FILL_BLANK, NUMERICAL, SHORT_ANSWER, LONG_ANSWER */}
                        {(q.type === 'FILL_BLANK' || q.type === 'NUMERICAL' || q.type === 'SHORT_ANSWER' || q.type === 'LONG_ANSWER') && (
                          <div className="space-y-2.5 pt-1">
                            <div className="p-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/10 space-y-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#86868b]">
                                Your Submitted Response:
                              </span>
                              <div className="text-xs sm:text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7] whitespace-pre-wrap">
                                {q.textAnswer && q.textAnswer.trim().length > 0 ? (
                                  q.textAnswer
                                ) : (
                                  <span className="italic text-[#86868b]">No response provided</span>
                                )}
                              </div>
                            </div>

                            {/* Accepted / Correct Answers for FILL_BLANK and NUMERICAL */}
                            {(q.type === 'FILL_BLANK' || q.type === 'NUMERICAL') && q.options && q.options.length > 0 && (
                              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1">
                                <span className="font-semibold text-emerald-800 dark:text-emerald-300 text-[10px] uppercase tracking-wider">
                                  Accepted Correct Answer{q.options.length > 1 ? 's' : ''}:
                                </span>
                                <div className="text-emerald-700 dark:text-emerald-400 font-mono font-semibold">
                                  {q.options.filter(o => o.isCorrect).map(o => o.text).join('  |  ')}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Explanation Box */}
                        {q.explanation && (
                          <div className="p-3.5 bg-blue-500/5 dark:bg-blue-500/10 rounded-2xl border border-blue-500/15 text-xs text-[#1d1d1f] dark:text-[#f5f5f7] space-y-1">
                            <div className="font-semibold uppercase tracking-wider text-[10px] text-[#0071e3] dark:text-[#0a84ff] flex items-center gap-1">
                              <Info className="w-3.5 h-3.5" />
                              <span>Instructor Explanation</span>
                            </div>
                            <p className="leading-relaxed">{q.explanation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-6 text-center text-xs text-[#86868b] apple-card">
                  No individual question responses to display.
                </div>
              )}
            </div>
          </>
        ) : (
          /* When allowReview is false */
          <div className="apple-card p-8 text-center max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-[#0071e3] dark:text-[#0a84ff] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
              Examination Successfully Submitted
            </h2>
            <p className="text-xs text-[#86868b] leading-relaxed">
              {result.message || 'Responses are stored securely. Results will be published after the grading period concludes.'}
            </p>

            {result.summary && (
              <div className="grid grid-cols-2 gap-2 p-3.5 bg-black/[0.03] dark:bg-white/[0.04] rounded-2xl border border-black/5 dark:border-white/10 text-xs">
                <div>
                  <div className="text-[#86868b]">Answered:</div>
                  <div className="font-bold text-sm text-[#1d1d1f] dark:text-[#f5f5f7]">
                    {result.summary.totalAnswered}
                  </div>
                </div>
                <div>
                  <div className="text-[#86868b]">Unanswered:</div>
                  <div className="font-bold text-sm text-[#1d1d1f] dark:text-[#f5f5f7]">
                    {result.summary.totalUnanswered}
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2">
              <Link
                to="/student"
                className="apple-btn-primary px-6 py-2.5 text-xs inline-flex items-center gap-1.5"
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
