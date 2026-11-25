import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Send,
  AlertTriangle,
  CheckCircle2,
  Bookmark,
} from 'lucide-react';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { ExamAttemptData, Question } from '../../types';
import { PersistentExamHeader } from '../../components/PersistentExamHeader';
import { QuestionCard } from '../../components/QuestionCard';
import { QuestionPalette } from '../../components/QuestionPalette';
import { FocusLossModal } from '../../components/FocusLossModal';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';

interface AnswerDraft {
  selectedOptionId?: string;
  textAnswer?: string;
  isMarkedForReview: boolean;
}

export const ExamPortalPage: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [attemptData, setAttemptData] = useState<ExamAttemptData | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, AnswerDraft>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [focusLossCount, setFocusLossCount] = useState(0);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mobilePaletteOpen, setMobilePaletteOpen] = useState(false);
  const [focusModalOpen, setFocusModalOpen] = useState(false);
  const [focusEventDetails, setFocusEventDetails] = useState('');
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const saveTimersRef = useRef<Record<string, number>>({});
  const lastFocusLogRef = useRef<number>(0);
  const submittedRef = useRef(false);

  const handleFinalizeSubmit = useCallback(
    async (reason?: string) => {
      if (!attemptId || submittedRef.current) return;
      submittedRef.current = true;
      setSubmitting(true);
      try {
        await api.submitExam(attemptId);
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
        toast.success(reason || 'Examination submitted successfully.');
        navigate(`/student/results/${attemptId}`, { replace: true });
      } catch (err: any) {
        submittedRef.current = false;
        setSubmitting(false);
        toast.error(err?.message || 'Unable to submit examination. Please retry.');
      }
    },
    [attemptId, navigate, toast]
  );

  // Load Exam Attempt Data
  useEffect(() => {
    if (!attemptId) return;
    let active = true;

    const load = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const data = await api.getAttemptData(attemptId);
        if (!active) return;

        if ((data as any).expired || (data.status && data.status !== 'IN_PROGRESS')) {
          toast.info((data as any).message || 'Examination session finalized. Opening results...');
          navigate(`/student/results/${attemptId}`, { replace: true });
          return;
        }

        const qs = [...(data.questions || [])].sort(
          (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)
        );
        const rawSaved = (data as any).savedAnswers || (data as any).answers || [];
        const hydrated: Record<string, AnswerDraft> = {};

        rawSaved.forEach((sa: any) => {
          hydrated[sa.questionId] = {
            selectedOptionId: sa.selectedOptionId || undefined,
            textAnswer: sa.textAnswer || '',
            isMarkedForReview: Boolean(sa.isMarkedForReview),
          };
        });

        setAttemptData(data);
        setQuestions(qs);
        setAnswers(hydrated);
        setFocusLossCount(data.focusLossCount || 0);

        if (typeof data.remainingSeconds === 'number') {
          setRemainingSeconds(Math.max(0, data.remainingSeconds));
        } else {
          const duration = (data.exam?.durationMinutes || 60) * 60;
          const startedMs = data.startTime ? new Date(data.startTime).getTime() : Date.now();
          const elapsed = Math.floor((Date.now() - startedMs) / 1000);
          setRemainingSeconds(Math.max(0, duration - elapsed));
        }
      } catch (err: any) {
        if (!active) return;
        setErrorMsg(err?.message || 'Unable to load examination session.');
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [attemptId, navigate]);

  // Timer Tick
  useEffect(() => {
    if (loading || !attemptData || submittedRef.current) return;
    if (remainingSeconds <= 0) {
      handleFinalizeSubmit('Time expired — examination auto-submitted.');
      return;
    }

    const interval = window.setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          handleFinalizeSubmit('Time expired — examination auto-submitted.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [loading, attemptData, remainingSeconds, handleFinalizeSubmit]);

  // Request Fullscreen Helper
  const enterFullscreen = useCallback(() => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  }, []);

  // Track Fullscreen & Focus Proctoring Guards
  useEffect(() => {
    if (loading || !attemptData || submittedRef.current) return;

    const threshold = attemptData.exam?.focusLossThreshold ?? 3;
    const focusGuardEnabled = true;
    const shortcutBlockEnabled = true;

    const recordViolation = async (eventType: string, details: string) => {
      if (!attemptId || submittedRef.current || !focusGuardEnabled) return;
      const now = Date.now();
      if (now - lastFocusLogRef.current < 1500) return;
      lastFocusLogRef.current = now;

      setFocusEventDetails(details);
      setFocusModalOpen(true);

      try {
        const res = await api.logFocusLoss(attemptId, { eventType, details });
        setFocusLossCount(res.focusLossCount);
        if (res.warningLimitExceeded || res.focusLossCount >= threshold) {
          handleFinalizeSubmit('Focus violation limit exceeded — examination auto-submitted.');
        }
      } catch {
        // Non-blocking fallback increment
        setFocusLossCount((c) => c + 1);
      }
    };

    const onVisibility = () => {
      if (document.hidden) {
        recordViolation('TAB_SWITCH', 'Switched away from browser tab');
      }
    };

    const onBlur = () => {
      recordViolation('WINDOW_BLUR', 'Browser window lost focus');
    };

    const onFullscreenChange = () => {
      const fs = Boolean(document.fullscreenElement);
      setIsFullscreen(fs);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (shortcutBlockEnabled) {
        if (
          e.key === 'F12' ||
          ((e.ctrlKey || e.metaKey) && ['u', 'U', 'i', 'I'].includes(e.key) && e.shiftKey) ||
          ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'u')
        ) {
          e.preventDefault();
        }
      }

      const tag = (e.target as HTMLElement)?.tagName;
      if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
        if (e.key === 'ArrowRight') {
          setCurrentIndex((i) => Math.min(questions.length - 1, i + 1));
        } else if (e.key === 'ArrowLeft') {
          setCurrentIndex((i) => Math.max(0, i - 1));
        }
      }
    };

    const onContext = (e: MouseEvent) => {
      if (shortcutBlockEnabled) e.preventDefault();
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    window.addEventListener('keydown', onKeyDown);
    document.addEventListener('contextmenu', onContext);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('contextmenu', onContext);
    };
  }, [loading, attemptData, attemptId, questions.length, handleFinalizeSubmit]);

  // Save Answer Handler
  const handleAnswerChange = (questionId: string, patch: Partial<AnswerDraft>) => {
    const prevDraft = answers[questionId] || { isMarkedForReview: false };
    const nextDraft: AnswerDraft = { ...prevDraft, ...patch };

    setAnswers((prev) => ({
      ...prev,
      [questionId]: nextDraft,
    }));

    if (!attemptId) return;
    setSaveStatus('saving');

    const isTextEdit = patch.textAnswer !== undefined && patch.selectedOptionId === undefined;
    const delay = isTextEdit ? 500 : 50;

    if (saveTimersRef.current[questionId]) {
      window.clearTimeout(saveTimersRef.current[questionId]);
    }

    saveTimersRef.current[questionId] = window.setTimeout(async () => {
      try {
        await api.saveAnswer(attemptId, {
          questionId,
          selectedOptionId: nextDraft.selectedOptionId,
          textAnswer: nextDraft.textAnswer,
          isMarkedForReview: nextDraft.isMarkedForReview,
        });
        setSaveStatus('saved');
      } catch {
        setSaveStatus('error');
      }
    }, delay);
  };

  const statusMap = useMemo(() => {
    const map: Record<string, { hasAnswer: boolean; isMarkedForReview: boolean }> = {};
    questions.forEach((q) => {
      const a = answers[q.id];
      const hasOption = Boolean(a?.selectedOptionId);
      let hasText = Boolean((a?.textAnswer || '').trim());
      if (q.type === 'MULTIPLE_SELECT' && a?.textAnswer) {
        try {
          const parsed = JSON.parse(a.textAnswer);
          hasText = Array.isArray(parsed) && parsed.length > 0;
        } catch {
          hasText = a.textAnswer.trim().length > 0;
        }
      }
      map[q.id] = {
        hasAnswer: hasOption || hasText,
        isMarkedForReview: Boolean(a?.isMarkedForReview),
      };
    });
    return map;
  }, [questions, answers]);

  const answeredTotal = questions.filter((q) => statusMap[q.id]?.hasAnswer).length;
  const markedTotal = questions.filter((q) => statusMap[q.id]?.isMarkedForReview).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-canvas)] p-6 sm:p-10">
        <div className="max-w-5xl mx-auto space-y-6">
          <Skeleton className="h-16 w-full rounded-[16px]" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Skeleton className="lg:col-span-8 h-96 rounded-[16px]" />
            <Skeleton className="lg:col-span-4 h-72 rounded-[16px]" />
          </div>
        </div>
      </div>
    );
  }

  if (errorMsg || !attemptData || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="ui-card p-8 max-w-md w-full text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-[var(--accent-danger)] mx-auto" />
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Session Unavailable</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            {errorMsg || 'No questions were found for this examination attempt.'}
          </p>
          <Button variant="primary" size="md" onClick={() => navigate('/student')}>
            Return to Student Portal
          </Button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const currentDraft = answers[currentQuestion.id] || { isMarkedForReview: false };

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] flex flex-col">
      <PersistentExamHeader
        examTitle={attemptData.exam?.title || 'Proctored Assessment'}
        currentQuestionIndex={currentIndex}
        totalQuestions={questions.length}
        remainingSeconds={remainingSeconds}
        focusLossCount={focusLossCount}
        focusLossThreshold={attemptData.exam?.focusLossThreshold ?? 3}
        saveStatus={saveStatus}
        isFullscreen={isFullscreen}
        onRequestFullscreen={enterFullscreen}
        onTogglePalette={() => setMobilePaletteOpen(true)}
        onOpenSubmitModal={() => setSubmitModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Active Question Panel */}
          <div className="lg:col-span-8 space-y-6">
            <QuestionCard
              question={currentQuestion}
              index={currentIndex}
              totalQuestions={questions.length}
              answer={currentDraft}
              onAnswerChange={(patch) => handleAnswerChange(currentQuestion.id, patch)}
            />

            {/* Bottom Step Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button
                variant="secondary"
                size="md"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                leftIcon={<ChevronLeft className="w-4 h-4" />}
              >
                Previous
              </Button>

              {currentIndex < questions.length - 1 ? (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  Save &amp; Next
                </Button>
              ) : (
                <Button
                  variant="teal"
                  size="md"
                  onClick={() => setSubmitModalOpen(true)}
                  leftIcon={<Send className="w-4 h-4" />}
                >
                  Review &amp; Submit Exam
                </Button>
              )}
            </div>
          </div>

          {/* Desktop Question Navigator */}
          <aside className="hidden lg:block lg:col-span-4 sticky top-24">
            <QuestionPalette
              questions={questions}
              currentIndex={currentIndex}
              statusMap={statusMap}
              onSelectQuestion={(idx) => setCurrentIndex(idx)}
            />
          </aside>
        </div>
      </main>

      {/* Mobile Question Palette Drawer Modal */}
      <Modal
        open={mobilePaletteOpen}
        onClose={() => setMobilePaletteOpen(false)}
        title="Question Navigator"
      >
        <QuestionPalette
          questions={questions}
          currentIndex={currentIndex}
          statusMap={statusMap}
          onSelectQuestion={(idx) => {
            setCurrentIndex(idx);
            setMobilePaletteOpen(false);
          }}
        />
      </Modal>

      {/* Focus Loss Alert Modal */}
      <FocusLossModal
        open={focusModalOpen}
        focusLossCount={focusLossCount}
        threshold={attemptData.exam?.focusLossThreshold ?? 3}
        eventDetails={focusEventDetails}
        onAcknowledge={() => {
          setFocusModalOpen(false);
          enterFullscreen();
        }}
      />

      {/* Submit Confirmation Modal */}
      <Modal
        open={submitModalOpen}
        onClose={() => !submitting && setSubmitModalOpen(false)}
        titleId="submit-exam-modal-title"
        dismissible={!submitting}
        headerBadge={<Badge variant="brand">Final Confirmation</Badge>}
        title="Submit Examination?"
        subtitle="Once finalized, answers cannot be edited and grading begins immediately."
        footer={
          <>
            <Button
              variant="secondary"
              size="md"
              disabled={submitting}
              onClick={() => setSubmitModalOpen(false)}
            >
              Continue Reviewing
            </Button>
            <Button
              variant="primary"
              size="md"
              loading={submitting}
              onClick={() => handleFinalizeSubmit()}
              leftIcon={<Send className="w-4 h-4" />}
            >
              Confirm Final Submission
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-4 rounded-[12px] bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-800">
            <CheckCircle2 className="w-5 h-5 text-[var(--accent-success)] mx-auto mb-1" />
            <p className="text-xl font-mono font-bold text-[var(--text-primary)]">{answeredTotal}</p>
            <p className="text-xs text-[var(--text-secondary)]">Answered</p>
          </div>
          <div className="p-4 rounded-[12px] bg-amber-50 border border-amber-200 dark:bg-amber-950/50 dark:border-amber-800">
            <Bookmark className="w-5 h-5 text-[var(--accent-warning)] mx-auto mb-1" />
            <p className="text-xl font-mono font-bold text-[var(--text-primary)]">{markedTotal}</p>
            <p className="text-xs text-[var(--text-secondary)]">Marked</p>
          </div>
          <div className="p-4 rounded-[12px] bg-[var(--bg-tray)] border border-[var(--border-default)]">
            <AlertTriangle className="w-5 h-5 text-[var(--text-muted)] mx-auto mb-1" />
            <p className="text-xl font-mono font-bold text-[var(--text-primary)]">
              {questions.length - answeredTotal}
            </p>
            <p className="text-xs text-[var(--text-secondary)]">Unanswered</p>
          </div>
        </div>
      </Modal>
    </div>
  );
};
