import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { ExamAttemptData, StudentAnswer } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { PersistentExamHeader } from '../../components/PersistentExamHeader';
import { QuestionCard } from '../../components/QuestionCard';
import { QuestionPalette } from '../../components/QuestionPalette';
import { FocusLossModal } from '../../components/FocusLossModal';
import { AlertTriangle, Bookmark, Send, Loader2, X } from 'lucide-react';

export const ExamPortalPage: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const { user } = useAuth();
  const { success, error: showError, warning } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [attemptData, setAttemptData] = useState<ExamAttemptData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [answers, setAnswers] = useState<Record<string, StudentAnswer>>({});
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');

  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const isAutoSubmittingRef = useRef(false);

  const [focusLossCount, setFocusLossCount] = useState(0);
  const [threshold, setThreshold] = useState(3);
  const [warningLimitExceeded, setWarningLimitExceeded] = useState(false);
  const [showFocusModal, setShowFocusModal] = useState(false);
  const lastFocusLossTimestampRef = useRef<number>(0);

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!attemptId) {
      showError('Invalid examination session.');
      navigate('/student', { replace: true });
      return;
    }

    const loadAttempt = async () => {
      try {
        setLoading(true);
        const data = await api.getAttemptData(attemptId);

        if (data.status === 'SUBMITTED') {
          success('This examination attempt has already been submitted.');
          navigate(`/student/results/${attemptId}`, { replace: true });
          return;
        }

        setAttemptData(data);
        setRemainingSeconds(data.remainingSeconds || 0);
        setFocusLossCount(data.focusLossCount || 0);
        setThreshold(data.exam.focusLossThreshold || 3);
        setWarningLimitExceeded((data.focusLossCount || 0) >= (data.exam.focusLossThreshold || 3));

        const answersMap: Record<string, StudentAnswer> = {};
        const restored = data.savedAnswers || data.answers || [];
        restored.forEach((ans: any) => {
          answersMap[ans.questionId] = ans;
        });
        setAnswers(answersMap);
      } catch (err: any) {
        showError(err.message || 'Failed to initialize exam environment.');
        navigate('/student', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    loadAttempt();
  }, [attemptId, navigate]);

  const handleTimeExpired = useCallback(async () => {
    if (isAutoSubmittingRef.current || isLocked) return;
    isAutoSubmittingRef.current = true;
    setIsLocked(true);

    warning('Time has expired! Automatically submitting your examination responses now...');

    try {
      if (attemptId) {
        await api.submitExam(attemptId);
        success('Exam submitted successfully.');
        navigate(`/student/results/${attemptId}`, { replace: true });
      }
    } catch (err: any) {
      showError('Automatic submission failed: ' + (err.message || 'Unknown error'));
      navigate('/student', { replace: true });
    }
  }, [attemptId, isLocked, navigate, success, showError, warning]);

  useEffect(() => {
    if (loading || isLocked || remainingSeconds <= 0) return;

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [loading, isLocked, remainingSeconds, handleTimeExpired]);

  const recordFocusLoss = useCallback(
    async (reason: 'BLUR' | 'VISIBILITY_CHANGE' | 'WINDOW_SWITCH') => {
      if (isLocked || !attemptId) return;

      const now = Date.now();
      if (now - lastFocusLossTimestampRef.current < 2000) {
        return;
      }
      lastFocusLossTimestampRef.current = now;

      try {
        const eventType =
          reason === 'BLUR'
            ? 'WINDOW_BLUR'
            : reason === 'VISIBILITY_CHANGE'
            ? 'VISIBILITY_HIDDEN'
            : 'WINDOW_RESIZE';
        const res = await api.logFocusLoss(attemptId, {
          eventType,
          details: 'Focus lost from exam environment',
        });

        setFocusLossCount(res.focusLossCount);
        setWarningLimitExceeded(res.warningLimitExceeded);
        setShowFocusModal(true);
      } catch {
        // Silently ignore telemetry network blips
      }
    },
    [attemptId, isLocked]
  );

  useEffect(() => {
    const handleWindowBlur = () => recordFocusLoss('BLUR');
    const handleVisibilityChange = () => {
      if (document.hidden) recordFocusLoss('VISIBILITY_CHANGE');
    };

    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [recordFocusLoss]);

  const handleSaveAnswer = async (
    questionId: string,
    optionId?: string | null,
    textAnswer?: string | null,
    isMarkedForReview?: boolean
  ) => {
    if (isLocked || !attemptId) return;

    setSaveStatus('saving');

    try {
      await api.saveAnswer(attemptId, {
        questionId,
        selectedOptionId: optionId !== undefined ? optionId : answers[questionId]?.selectedOptionId,
        textAnswer: textAnswer !== undefined ? textAnswer : answers[questionId]?.textAnswer,
        isMarkedForReview:
          isMarkedForReview !== undefined
            ? isMarkedForReview
            : answers[questionId]?.isMarkedForReview,
      });

      setAnswers((prev) => ({
        ...prev,
        [questionId]: {
          questionId,
          selectedOptionId:
            optionId !== undefined ? optionId : prev[questionId]?.selectedOptionId,
          textAnswer: textAnswer !== undefined ? textAnswer : prev[questionId]?.textAnswer,
          isMarkedForReview:
            isMarkedForReview !== undefined
              ? isMarkedForReview
              : prev[questionId]?.isMarkedForReview || false,
        },
      }));
      setSaveStatus('saved');
    } catch {
      setSaveStatus('error');
    }
  };

  const handleOptionSelect = (optionId: string) => {
    if (!attemptData) return;
    const currentQuestion = attemptData.questions[currentQuestionIndex];
    handleSaveAnswer(currentQuestion.id, optionId, null);
  };

  const handleTextAnswerChange = (text: string) => {
    if (!attemptData) return;
    const currentQuestion = attemptData.questions[currentQuestionIndex];
    handleSaveAnswer(currentQuestion.id, null, text);
  };

  const handleToggleReview = useCallback(() => {
    if (!attemptData) return;
    const currentQuestion = attemptData.questions[currentQuestionIndex];
    const currentAnswer = answers[currentQuestion.id];
    const newReviewState = !currentAnswer?.isMarkedForReview;
    handleSaveAnswer(currentQuestion.id, undefined, undefined, newReviewState);
  }, [attemptData, currentQuestionIndex, answers]);

  const handleClearAnswer = () => {
    if (!attemptData) return;
    const currentQuestion = attemptData.questions[currentQuestionIndex];
    handleSaveAnswer(currentQuestion.id, null, null, false);
  };

  // Keyboard shortcuts (ArrowLeft / ArrowRight / M) outside text fields
  useEffect(() => {
    if (!attemptData || showSubmitModal || showFocusModal) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      if (e.key === 'ArrowLeft') {
        setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentQuestionIndex((prev) => Math.min(attemptData.questions.length - 1, prev + 1));
      } else if (e.key === 'm' || e.key === 'M') {
        handleToggleReview();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [attemptData, showSubmitModal, showFocusModal, handleToggleReview]);

  const handleFinalSubmit = async () => {
    if (!attemptId || submitting) return;

    setSubmitting(true);
    try {
      await api.submitExam(attemptId);
      success('Examination successfully submitted and graded!');
      navigate(`/student/results/${attemptId}`, { replace: true });
    } catch (err: any) {
      showError(err.message || 'Failed to submit examination.');
      setSubmitting(false);
      setShowSubmitModal(false);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else if (document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const stats = React.useMemo(() => {
    if (!attemptData) return { answered: 0, unanswered: 0, review: 0 };

    let answered = 0;
    let review = 0;

    attemptData.questions.forEach((q) => {
      const a = answers[q.id];
      const hasAnswer =
        a &&
        (a.selectedOptionId != null ||
          (a.textAnswer && a.textAnswer.trim().length > 0 && a.textAnswer.trim() !== '[]'));
      if (hasAnswer) answered++;
      if (a?.isMarkedForReview) review++;
    });

    const unanswered = attemptData.questions.length - answered;
    return { answered, unanswered, review };
  }, [attemptData, answers]);

  if (loading || !attemptData) {
    return (
      <div className="min-h-screen bg-[var(--bg-canvas)] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--accent-signal)] mb-4" />
        <h2 className="text-base font-bold text-[var(--text-primary)]">
          Initializing Isolated Exam Environment
        </h2>
        <p className="font-mono text-xs text-[var(--text-secondary)] mt-1">
          Configuring proctoring sentinel...
        </p>
      </div>
    );
  }

  const currentQuestion = attemptData.questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] flex flex-col select-none transition-colors duration-200">
      <PersistentExamHeader
        examTitle={attemptData.exam.title}
        subject={attemptData.exam.subject}
        studentName={user?.name || 'Student Candidate'}
        studentId={user?.studentId}
        remainingSeconds={remainingSeconds}
        totalQuestions={attemptData.questions.length}
        answeredCount={stats.answered}
        saveStatus={saveStatus}
        onSubmitClick={() => setShowSubmitModal(true)}
        isSubmitting={submitting}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
          <div className="lg:col-span-3 flex flex-col">
            {/* Mobile Quick Jump */}
            <div className="lg:hidden mb-4 p-3 studio-card">
              <div className="flex items-center justify-between font-mono text-xs font-semibold text-[var(--text-secondary)] mb-2">
                <span>Quick Jump</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  {stats.answered} / {attemptData.questions.length} Answered
                </span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {attemptData.questions.map((q, idx) => {
                  const ans = answers[q.id];
                  const isAns =
                    ans &&
                    (ans.selectedOptionId != null ||
                      (ans.textAnswer &&
                        ans.textAnswer.trim().length > 0 &&
                        ans.textAnswer.trim() !== '[]'));
                  const isRev = ans?.isMarkedForReview;
                  const isCur = idx === currentQuestionIndex;

                  let bg = 'bg-[var(--bg-tray)] text-[var(--text-primary)]';
                  if (isRev) bg = 'bg-amber-500 text-white';
                  else if (isAns) bg = 'bg-emerald-600 text-white';

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`w-8 h-8 flex-shrink-0 rounded-lg font-mono text-xs font-bold flex items-center justify-center transition-all ${bg} ${
                        isCur
                          ? 'ring-2 ring-[var(--accent-signal)] ring-offset-2 ring-offset-[var(--bg-canvas)] scale-105'
                          : ''
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            <QuestionCard
              question={currentQuestion}
              questionIndex={currentQuestionIndex}
              totalQuestions={attemptData.questions.length}
              answer={answers[currentQuestion.id]}
              onOptionSelect={handleOptionSelect}
              onTextAnswerChange={handleTextAnswerChange}
              onToggleReview={handleToggleReview}
              onClearAnswer={handleClearAnswer}
              onPrev={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
              onNext={() =>
                setCurrentQuestionIndex((prev) =>
                  Math.min(attemptData.questions.length - 1, prev + 1)
                )
              }
              hasPrev={currentQuestionIndex > 0}
              hasNext={currentQuestionIndex < attemptData.questions.length - 1}
              disabled={isLocked}
            />
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <QuestionPalette
                questions={attemptData.questions}
                currentQuestionIndex={currentQuestionIndex}
                onSelectQuestion={(idx) => setCurrentQuestionIndex(idx)}
                answers={answers}
              />
            </div>
          </div>
        </div>
      </main>

      <FocusLossModal
        isOpen={showFocusModal}
        focusLossCount={focusLossCount}
        threshold={threshold}
        warningLimitExceeded={warningLimitExceeded}
        onAcknowledge={() => setShowFocusModal(false)}
      />

      {/* Submission Confirmation Modal */}
      {showSubmitModal && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-lg flex items-center justify-center p-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="studio-card max-w-md w-full overflow-hidden animate-apple-spring border border-[var(--border-strong)]">
            <div className="p-6 border-b border-[var(--border-hairline)] flex items-center justify-between bg-[var(--bg-tray)]/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    Submit Examination?
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Review progress before final evaluation
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl">
                  <div className="font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {stats.answered}
                  </div>
                  <div className="font-mono text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300">
                    Answered
                  </div>
                </div>

                <div
                  className={`p-3 rounded-xl border ${
                    stats.unanswered > 0
                      ? 'bg-rose-500/10 border-rose-500/25'
                      : 'bg-[var(--bg-tray)] border-[var(--border-hairline)]'
                  }`}
                >
                  <div
                    className={`font-mono text-2xl font-bold tabular-nums ${
                      stats.unanswered > 0
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-[var(--text-primary)]'
                    }`}
                  >
                    {stats.unanswered}
                  </div>
                  <div
                    className={`font-mono text-[10px] uppercase font-bold ${
                      stats.unanswered > 0
                        ? 'text-rose-700 dark:text-rose-300'
                        : 'text-[var(--text-secondary)]'
                    }`}
                  >
                    Unanswered
                  </div>
                </div>
              </div>

              {stats.review > 0 && (
                <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/25 rounded-xl text-xs text-amber-700 dark:text-amber-300">
                  <Bookmark className="w-3.5 h-3.5 flex-shrink-0 fill-current text-amber-500" />
                  <span>
                    <strong>{stats.review}</strong> questions still flagged for review.
                  </span>
                </div>
              )}

              {stats.unanswered > 0 && (
                <div className="flex items-start gap-2 p-3 bg-rose-500/10 border border-rose-500/25 rounded-xl text-xs text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Attention:</strong> You have {stats.unanswered} unanswered questions.
                  </div>
                </div>
              )}

              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Confirming will immediately finalize your responses and compute your score. The session will be permanently locked.
              </p>
            </div>

            <div className="p-4 border-t border-[var(--border-hairline)] bg-[var(--bg-tray)]/40 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setShowSubmitModal(false)}
                className="btn-ghost-surface px-4 py-2 text-xs"
              >
                Continue Answering
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={handleFinalSubmit}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Grading...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Exam</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
