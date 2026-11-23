import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { ExamAttemptData, Question, StudentAnswer } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { PersistentExamHeader } from '../../components/PersistentExamHeader';
import { QuestionCard } from '../../components/QuestionCard';
import { QuestionPalette } from '../../components/QuestionPalette';
import { FocusLossModal } from '../../components/FocusLossModal';
import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Bookmark,
  Send,
  Loader2,
  ShieldAlert,
  X
} from 'lucide-react';

export const ExamPortalPage: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const { user } = useAuth();
  const { success, error: showError, warning } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [attemptData, setAttemptData] = useState<ExamAttemptData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Map of questionId -> StudentAnswer
  const [answers, setAnswers] = useState<Record<string, StudentAnswer>>({});
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');

  // Real-time countdown timer state
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const isAutoSubmittingRef = useRef(false);

  // Proctoring focus-loss state
  const [focusLossCount, setFocusLossCount] = useState(0);
  const [threshold, setThreshold] = useState(3);
  const [warningLimitExceeded, setWarningLimitExceeded] = useState(false);
  const [showFocusModal, setShowFocusModal] = useState(false);
  const lastFocusLossTimestampRef = useRef<number>(0);

  // Submission modal state
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 1. Fetch Attempt Data on Mount
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

        // Populate answers map
        const answersMap: Record<string, StudentAnswer> = {};
        if (data.savedAnswers && Array.isArray(data.savedAnswers)) {
          data.savedAnswers.forEach((ans: StudentAnswer) => {
            answersMap[ans.questionId] = ans;
          });
        }
        setAnswers(answersMap);
      } catch (err: any) {
        showError(err.message || 'Failed to load examination attempt.');
        navigate('/student', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    loadAttempt();
  }, [attemptId, navigate, showError, success]);

  // 2. Accidental Tab Close / Reload Protection
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isLocked && !isAutoSubmittingRef.current) {
        e.preventDefault();
        e.returnValue = 'You have an active examination in progress. Leaving will not pause your timer.';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isLocked]);

  // 3. Final Submission Handler
  const handleFinalSubmit = useCallback(async () => {
    if (!attemptId || isAutoSubmittingRef.current) return;
    isAutoSubmittingRef.current = true;
    setSubmitting(true);
    setIsLocked(true);

    try {
      const res = await api.submitExam(attemptId);
      success(res.message || 'Examination submitted successfully!');
      setShowSubmitModal(false);
      navigate(`/student/results/${attemptId}`, { replace: true });
    } catch (err: any) {
      showError(err.message || 'Failed to submit examination.');
      isAutoSubmittingRef.current = false;
      setIsLocked(false);
      setSubmitting(false);
    }
  }, [attemptId, navigate, showError, success]);

  // 4. Timer Countdown & Auto-Submission
  useEffect(() => {
    if (loading || isLocked || remainingSeconds <= 0) return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto submit when time reaches 0
          if (!isAutoSubmittingRef.current) {
            warning('Time expired! Auto-submitting your examination now...');
            handleFinalSubmit();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, isLocked, remainingSeconds, handleFinalSubmit, warning]);

  // 5. Proctoring Focus-Loss Detection
  const handleFocusLoss = useCallback(
    async (eventType: 'WINDOW_BLUR' | 'VISIBILITY_HIDDEN') => {
      if (isLocked || isAutoSubmittingRef.current || !attemptId) return;

      const now = Date.now();
      // Debounce: minimum 1500ms between focus-loss event triggers
      if (now - lastFocusLossTimestampRef.current < 1500) {
        return;
      }
      lastFocusLossTimestampRef.current = now;

      try {
        const res = await api.logFocusLoss(attemptId, {
          eventType,
          details: eventType === 'VISIBILITY_HIDDEN' ? 'Student navigated away from tab' : 'Window lost focus'
        });

        setFocusLossCount(res.focusLossCount);
        setThreshold(res.threshold);
        setWarningLimitExceeded(res.warningLimitExceeded);
        setShowFocusModal(true);
      } catch (err) {
        console.error('Focus loss logging failed:', err);
      }
    },
    [attemptId, isLocked]
  );

  useEffect(() => {
    const onBlur = () => handleFocusLoss('WINDOW_BLUR');
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleFocusLoss('VISIBILITY_HIDDEN');
      }
    };

    window.addEventListener('blur', onBlur);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [handleFocusLoss]);

  // 6. Fullscreen Handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => { });
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => { });
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // 7. Answer Modification & Autosave
  const saveAnswerToServer = async (payload: {
    questionId: string;
    selectedOptionId?: string | null;
    textAnswer?: string | null;
    isMarkedForReview?: boolean;
  }) => {
    if (!attemptId || isLocked) return;
    setSaveStatus('saving');
    try {
      await api.saveAnswer(attemptId, payload);
      setSaveStatus('saved');
    } catch (err) {
      console.error('Failed to autosave response:', err);
      setSaveStatus('error');
    }
  };

  const handleOptionSelect = (optionId: string) => {
    if (!attemptData || isLocked) return;
    const currentQ = attemptData.questions[currentQuestionIndex];
    if (!currentQ) return;

    const existingAns = answers[currentQ.id];
    const newAns: StudentAnswer = {
      ...existingAns,
      questionId: currentQ.id,
      selectedOptionId: optionId,
      isMarkedForReview: existingAns?.isMarkedForReview || false
    };

    setAnswers((prev) => ({ ...prev, [currentQ.id]: newAns }));
    saveAnswerToServer({
      questionId: currentQ.id,
      selectedOptionId: optionId,
      isMarkedForReview: newAns.isMarkedForReview
    });
  };

  const handleTextAnswerChange = (text: string) => {
    if (!attemptData || isLocked) return;
    const currentQ = attemptData.questions[currentQuestionIndex];
    if (!currentQ) return;

    const existingAns = answers[currentQ.id];
    const newAns: StudentAnswer = {
      ...existingAns,
      questionId: currentQ.id,
      textAnswer: text,
      isMarkedForReview: existingAns?.isMarkedForReview || false
    };

    setAnswers((prev) => ({ ...prev, [currentQ.id]: newAns }));
    saveAnswerToServer({
      questionId: currentQ.id,
      textAnswer: text,
      isMarkedForReview: newAns.isMarkedForReview
    });
  };

  const handleToggleReview = () => {
    if (!attemptData || isLocked) return;
    const currentQ = attemptData.questions[currentQuestionIndex];
    if (!currentQ) return;

    const existingAns = answers[currentQ.id];
    const newReviewState = !existingAns?.isMarkedForReview;

    const newAns: StudentAnswer = {
      ...existingAns,
      questionId: currentQ.id,
      isMarkedForReview: newReviewState
    };

    setAnswers((prev) => ({ ...prev, [currentQ.id]: newAns }));
    saveAnswerToServer({
      questionId: currentQ.id,
      selectedOptionId: newAns.selectedOptionId,
      textAnswer: newAns.textAnswer,
      isMarkedForReview: newReviewState
    });
  };

  const handleClearAnswer = () => {
    if (!attemptData || isLocked) return;
    const currentQ = attemptData.questions[currentQuestionIndex];
    if (!currentQ) return;

    const existingAns = answers[currentQ.id];
    const newAns: StudentAnswer = {
      ...existingAns,
      questionId: currentQ.id,
      selectedOptionId: null,
      textAnswer: ''
    };

    setAnswers((prev) => ({ ...prev, [currentQ.id]: newAns }));
    saveAnswerToServer({
      questionId: currentQ.id,
      selectedOptionId: null,
      textAnswer: '',
      isMarkedForReview: newAns.isMarkedForReview
    });
  };

  // 8. Stats for Submission Summary Dialog
  const submissionStats = () => {
    if (!attemptData) return { total: 0, answered: 0, unanswered: 0, review: 0 };
    const total = attemptData.questions.length;
    let answered = 0;
    let review = 0;

    attemptData.questions.forEach((q) => {
      const ans = answers[q.id];
      if (ans && (ans.selectedOptionId != null || (ans.textAnswer && ans.textAnswer.trim().length > 0 && ans.textAnswer.trim() !== '[]'))) {
        answered++;
      }
      if (ans?.isMarkedForReview) {
        review++;
      }
    });

    return {
      total,
      answered,
      unanswered: total - answered,
      review
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
        <p className="text-base font-semibold">Initializing secure examination environment...</p>
        <p className="text-xs text-slate-400 mt-1">Authenticating session & syncing server time</p>
      </div>
    );
  }

  if (!attemptData || !attemptData.questions || attemptData.questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-slate-950">
        <ShieldAlert className="w-16 h-16 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Examination Not Found</h2>
        <p className="mt-2 text-sm text-slate-500 max-w-md">
          Unable to retrieve the examination session. Please return to your student dashboard.
        </p>
        <button
          onClick={() => navigate('/student')}
          className="mt-6 px-6 py-2.5 rounded-xl bg-blue-600 text-white font-semibold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const currentQuestion = attemptData.questions[currentQuestionIndex];
  const stats = submissionStats();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col select-none">
      {/* Persistent Exam Header */}
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

      {/* Main Examination Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
          {/* Left Column: Current Question Card (takes 3 cols) */}
          <div className="lg:col-span-3 flex flex-col">
            {/* Mobile Question Quick-Jump Strip (visible on mobile < lg) */}
            <div className="lg:hidden mb-4 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
                <span>Jump to Question:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                  {stats.answered} of {attemptData.questions.length} Answered
                </span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {attemptData.questions.map((q, idx) => {
                  const ans = answers[q.id];
                  const isAns = ans && (ans.selectedOptionId != null || (ans.textAnswer && ans.textAnswer.trim().length > 0 && ans.textAnswer.trim() !== '[]'));
                  const isRev = ans?.isMarkedForReview;
                  const isCur = idx === currentQuestionIndex;

                  let bg = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
                  if (isRev) bg = 'bg-amber-500 text-white';
                  else if (isAns) bg = 'bg-emerald-600 text-white';

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`w-9 h-9 flex-shrink-0 rounded-xl text-xs font-bold flex items-center justify-center transition-all ${bg} ${isCur ? 'ring-2 ring-blue-600 ring-offset-2 dark:ring-offset-slate-900 font-extrabold scale-105' : ''
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
              onNext={() => setCurrentQuestionIndex((prev) => Math.min(attemptData.questions.length - 1, prev + 1))}
              hasPrev={currentQuestionIndex > 0}
              hasNext={currentQuestionIndex < attemptData.questions.length - 1}
              disabled={isLocked}
            />
          </div>

          {/* Right Column: Question Palette Sidebar (takes 1 col) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
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

      {/* Proctoring Focus-Loss Alert Modal */}
      <FocusLossModal
        isOpen={showFocusModal}
        focusLossCount={focusLossCount}
        threshold={threshold}
        warningLimitExceeded={warningLimitExceeded}
        onAcknowledge={() => setShowFocusModal(false)}
      />

      {/* Submission Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 overflow-hidden animate-fade-in">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Submit Examination?
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Review your answering progress before final submission
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body & Statistics */}
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl">
                  <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    {stats.answered}
                  </div>
                  <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                    Questions Answered
                  </div>
                </div>

                <div
                  className={`p-3 rounded-xl border ${stats.unanswered > 0
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                    }`}
                >
                  <div
                    className={`text-2xl font-extrabold ${stats.unanswered > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'
                      }`}
                  >
                    {stats.unanswered}
                  </div>
                  <div
                    className={`text-xs font-semibold ${stats.unanswered > 0 ? 'text-rose-800 dark:text-rose-300' : 'text-slate-500'
                      }`}
                  >
                    Unanswered
                  </div>
                </div>
              </div>

              {stats.review > 0 && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl text-xs text-amber-800 dark:text-amber-300">
                  <Bookmark className="w-4 h-4 flex-shrink-0 fill-amber-500 text-amber-500" />
                  <span>
                    You still have <strong>{stats.review}</strong> {stats.review === 1 ? 'question' : 'questions'} marked for review.
                  </span>
                </div>
              )}

              {stats.unanswered > 0 && (
                <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl text-xs text-rose-800 dark:text-rose-300">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
                  <div>
                    <strong>Attention:</strong> You have {stats.unanswered} unanswered {stats.unanswered === 1 ? 'question' : 'questions'}. Are you sure you wish to submit now?
                  </div>
                </div>
              )}

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Once confirmed, your responses will be submitted for immediate automated evaluation. Your attempt will be permanently locked and you cannot modify your answers.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Continue Answering
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={handleFinalSubmit}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/30 disabled:opacity-50 transition-all"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Grading & Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Yes, Submit Examination</span>
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
