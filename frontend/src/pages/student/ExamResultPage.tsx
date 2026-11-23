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
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-3" />
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Loading your examination results...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-slate-950">
        <XCircle className="w-16 h-16 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Results Not Available</h2>
        <p className="mt-2 text-sm text-slate-500 max-w-sm">
          Unable to locate the results for this attempt.
        </p>
        <Link
          to="/student"
          className="mt-6 px-6 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm"
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Top Header Banner */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {subject}
                </span>
                <span className="text-xs text-slate-400">• Submitted {formattedDate}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {examTitle} — Result Summary
              </h1>
            </div>

            <button
              onClick={() => navigate('/student')}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all self-start sm:self-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-8 space-y-8">
        {/* If Review is allowed, render full score card */}
        {result.allowReview ? (
          <>
            {/* Score Overview Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                {/* Score & Pass Badge */}
                <div className="md:col-span-1 flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-3 shadow-md ${
                      result.passed
                        ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                        : 'bg-rose-600 text-white shadow-rose-600/30'
                    }`}
                  >
                    {result.passed ? <CheckCircle2 className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
                  </div>

                  <div
                    className={`text-sm font-extrabold uppercase tracking-wider px-3 py-1 rounded-full ${
                      result.passed
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {result.passed ? 'PASSED EXAMINATION' : 'NEEDS IMPROVEMENT'}
                  </div>

                  <div className="mt-4 text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                    {result.score} <span className="text-xl font-normal text-slate-400">/ {result.totalMarks}</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-500 mt-1">
                    Passing threshold: {result.passingMarks} Marks
                  </div>
                </div>

                {/* Key Metrics Breakdown */}
                <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
                      <Award className="w-4 h-4 text-blue-500" />
                      <span>Percentage</span>
                    </div>
                    <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      {result.percentage}%
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Answered</span>
                    </div>
                    <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                      {result.totalAnswered} / {result.totalQuestions}
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
                      <HelpCircle className="w-4 h-4 text-amber-500" />
                      <span>Unanswered</span>
                    </div>
                    <div className="text-2xl font-extrabold text-slate-700 dark:text-slate-300">
                      {result.totalUnanswered}
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 sm:col-span-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                        <ShieldAlert className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          Proctoring Focus-Loss Incidents
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Total times window departed active view
                        </div>
                      </div>
                    </div>
                    <div className="text-lg font-bold text-slate-900 dark:text-white">
                      {result.focusLossCount ?? 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Question-by-Question Detailed Review */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Detailed Answer Review
                </h2>
                <span className="text-xs text-slate-500">
                  {result.questions?.length || 0} Questions Evaluated
                </span>
              </div>

              {result.questions && result.questions.length > 0 ? (
                result.questions.map((q, idx) => {
                  return (
                    <div
                      key={q.id}
                      className={`bg-white dark:bg-slate-900 rounded-2xl border shadow-sm overflow-hidden transition-all ${
                        q.isCorrect
                          ? 'border-emerald-200 dark:border-emerald-900/50'
                          : 'border-rose-200 dark:border-rose-900/50'
                      }`}
                    >
                      {/* Question Top Header */}
                      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                        <div className="flex items-center gap-2.5">
                          <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                            Question {idx + 1}
                          </span>
                          <span
                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                              q.isCorrect
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                            }`}
                          >
                            {q.isCorrect ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                            <span>{q.isCorrect ? 'Correct' : 'Incorrect'}</span>
                          </span>
                        </div>

                        <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Score: {q.marksAwarded} / {q.marks} Marks
                        </div>
                      </div>

                      {/* Question Body */}
                      <div className="p-6 space-y-4">
                        <div className="text-base font-semibold text-slate-900 dark:text-white leading-relaxed">
                          {q.text}
                        </div>

                        {q.imageUrl && (
                          <div className="max-w-md rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 p-2 bg-slate-50 dark:bg-slate-950">
                            <img src={q.imageUrl} alt="Question visual" className="max-h-60 rounded-lg object-contain w-full" />
                          </div>
                        )}

                        {/* Options Review for MCQ, TRUE_FALSE, MULTIPLE_SELECT */}
                        {q.options && q.options.length > 0 && (q.type === 'MCQ' || q.type === 'TRUE_FALSE' || q.type === 'MULTIPLE_SELECT') && (
                          <div className="space-y-2.5 pt-2">
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

                              let optBorder = 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900';
                              let badge = null;

                              if (isStudentChoice && isCorrectAnswer) {
                                optBorder = 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500';
                                badge = (
                                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                                    <Check className="w-3.5 h-3.5" /> Your Choice (Correct)
                                  </span>
                                );
                              } else if (isStudentChoice && !isCorrectAnswer) {
                                optBorder = 'border-rose-500 bg-rose-50/80 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 ring-1 ring-rose-500';
                                badge = (
                                  <span className="text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1">
                                    <X className="w-3.5 h-3.5" /> Your Choice (Incorrect)
                                  </span>
                                );
                              } else if (isCorrectAnswer) {
                                optBorder = 'border-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200';
                                badge = (
                                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                    <Check className="w-3.5 h-3.5" /> Correct Answer
                                  </span>
                                );
                              }

                              return (
                                <div
                                  key={opt.id}
                                  className={`p-3.5 rounded-xl border flex items-center justify-between text-sm ${optBorder}`}
                                >
                                  <span className="font-medium">{opt.text}</span>
                                  {badge}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Student Response for FILL_BLANK, NUMERICAL, SHORT_ANSWER, LONG_ANSWER */}
                        {(q.type === 'FILL_BLANK' || q.type === 'NUMERICAL' || q.type === 'SHORT_ANSWER' || q.type === 'LONG_ANSWER') && (
                          <div className="space-y-3 pt-2">
                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1.5">
                              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Your Submitted Response:
                              </span>
                              <div className="text-sm font-medium text-slate-900 dark:text-white whitespace-pre-wrap">
                                {q.textAnswer && q.textAnswer.trim().length > 0 ? (
                                  q.textAnswer
                                ) : (
                                  <span className="italic text-slate-400">No response provided</span>
                                )}
                              </div>
                            </div>

                            {/* Accepted / Correct Answers for FILL_BLANK and NUMERICAL */}
                            {(q.type === 'FILL_BLANK' || q.type === 'NUMERICAL') && q.options && q.options.length > 0 && (
                              <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1">
                                <span className="font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                                  Accepted Correct Answer{q.options.length > 1 ? 's' : ''}:
                                </span>
                                <div className="text-emerald-900 dark:text-emerald-200 font-mono font-semibold">
                                  {q.options.filter(o => o.isCorrect).map(o => o.text).join('  |  ')}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Explanation Box */}
                        {q.explanation && (
                          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200 space-y-1">
                            <div className="font-bold uppercase tracking-wider text-[10px] text-blue-700 dark:text-blue-400 flex items-center gap-1">
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
                <div className="p-6 text-center text-sm text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                  No individual question responses to display.
                </div>
              )}
            </div>
          </>
        ) : (
          /* When allowReview is false */
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 text-center max-w-xl mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Examination Successfully Submitted
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {result.message || 'The instructor has configured this examination so that scores and question answers remain confidential until the evaluation period concludes.'}
            </p>

            {result.summary && (
              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <div>
                  <div className="text-slate-400">Total Answered:</div>
                  <div className="font-bold text-slate-900 dark:text-white text-base">
                    {result.summary.totalAnswered}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">Unanswered:</div>
                  <div className="font-bold text-slate-900 dark:text-white text-base">
                    {result.summary.totalUnanswered}
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4">
              <Link
                to="/student"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to My Examinations</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
