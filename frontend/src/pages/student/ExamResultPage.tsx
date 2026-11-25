import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  XCircle,
  Printer,
  ShieldAlert,
  Clock,
  HelpCircle,
} from 'lucide-react';
import { api } from '../../api/client';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { cn } from '../../components/ui/cn';

export const ExamResultPage: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!attemptId) return;
    let active = true;

    const load = async () => {
      setLoading(true);
      try {
        const res = await api.getExamResult(attemptId);
        if (active) setData(res);
      } catch (err: any) {
        if (active) setErrorMsg(err?.message || 'Unable to load examination results.');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [attemptId]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <Skeleton className="h-52 w-full rounded-[16px]" />
        <Skeleton className="h-36 w-full rounded-[16px]" />
        <Skeleton className="h-36 w-full rounded-[16px]" />
      </div>
    );
  }

  if (errorMsg || !data) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-4">
        <div className="ui-card p-8 space-y-4">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Transcript Unavailable</h1>
          <p className="text-sm text-[var(--text-secondary)]">{errorMsg}</p>
          <Button variant="primary" size="md" onClick={() => navigate('/student')}>
            Back to Student Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const attempt = data.attempt || data;
  const examTitle = data.examTitle || attempt.exam?.title || data.exam?.title || 'Examination Transcript';
  const examSubject = data.subject || attempt.exam?.subject || data.exam?.subject || 'Assessment';
  const totalMarks = Number(data.totalMarks ?? attempt.exam?.totalMarks ?? data.exam?.totalMarks ?? 0);
  const passingMarks = Number(data.passingMarks ?? attempt.exam?.passingMarks ?? data.exam?.passingMarks ?? 0);
  const allowReview = data.allowReview !== false;
  const breakdown: any[] = data.questions || data.breakdown || data.answers || [];
  const percentage = Math.round(Number(attempt.percentage ?? 0));
  const passed = Boolean(attempt.passed);
  const focusCount = Number(attempt.focusLossCount ?? 0);

  const radius = 48;
  const circ = 2 * Math.PI * radius;
  const dashOffset = circ - (Math.min(100, Math.max(0, percentage)) / 100) * circ;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 no-print">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/student')}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Back to Assessments
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => window.print()}
          leftIcon={<Printer className="w-4 h-4" />}
        >
          Print Transcript
        </Button>
      </div>

      {/* Executive Score Header */}
      <section className="ui-card p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
              <circle
                cx="60"
                cy="60"
                r={radius}
                strokeWidth="10"
                className="fill-none stroke-[var(--border-default)]"
              />
              <circle
                cx="60"
                cy="60"
                r={radius}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={dashOffset}
                className={cn(
                  'fill-none transition-all duration-700',
                  passed ? 'stroke-[var(--accent-success)]' : 'stroke-[var(--accent-danger)]'
                )}
              />
            </svg>
            <span className="absolute text-2xl font-mono font-extrabold text-[var(--text-primary)]">
              {percentage}%
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={passed ? 'success' : 'danger'}
                icon={passed ? <Award className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
              >
                {passed ? 'Passed' : 'Below Passing Threshold'}
              </Badge>
              <Badge variant="neutral">{examSubject}</Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
              {examTitle}
            </h1>
            <p className="text-sm text-[var(--text-secondary)]">
              Passing threshold: {passingMarks} / {totalMarks} marks
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 w-full md:w-auto">
          <div className="p-4 rounded-[12px] bg-[var(--bg-tray)] border border-[var(--border-default)] text-center">
            <p className="text-xl font-mono font-bold text-[var(--text-primary)]">
              {attempt.score ?? 0}/{totalMarks}
            </p>
            <p className="text-xs text-[var(--text-muted)]">Score</p>
          </div>
          <div className="p-4 rounded-[12px] bg-[var(--bg-tray)] border border-[var(--border-default)] text-center">
            <p className="text-xl font-mono font-bold text-[var(--text-primary)]">
              {focusCount}
            </p>
            <p className="text-xs text-[var(--text-muted)] flex items-center justify-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" aria-hidden="true" />
              Focus Logs
            </p>
          </div>
          <div className="p-4 rounded-[12px] bg-[var(--bg-tray)] border border-[var(--border-default)] text-center">
            <p className="text-xl font-mono font-bold text-[var(--accent-primary)]">
              {breakdown.length}
            </p>
            <p className="text-xs text-[var(--text-muted)] flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              Items
            </p>
          </div>
        </div>
      </section>

      {/* Detailed Breakdown */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">
          Question-by-Question Review
        </h2>

        {!allowReview || breakdown.length === 0 ? (
          <div className="ui-card p-8 text-center text-sm text-[var(--text-secondary)]">
            {allowReview === false
              ? 'Detailed question review is withheld by your instructor for this examination.'
              : 'Detailed question breakdown is unavailable for this examination.'}
          </div>
        ) : (
          <div className="space-y-4">
            {breakdown.map((item: any, idx: number) => {
              const q = item.question || item;
              const optionsList: any[] = q.options || [];
              const isCorrect = item.isCorrect === true;
              const isPending = item.isCorrect === null || item.isCorrect === undefined;

              let studentVal = '';
              if (item.selectedOption?.text) {
                studentVal = item.selectedOption.text;
              } else if (item.selectedOptionId) {
                const matchedOpt = optionsList.find((o) => o.id === item.selectedOptionId);
                studentVal = matchedOpt?.text || '';
              } else if (item.textAnswer) {
                if (q.type === 'MULTIPLE_SELECT') {
                  try {
                    const ids = JSON.parse(item.textAnswer);
                    if (Array.isArray(ids)) {
                      studentVal = ids
                        .map((id) => optionsList.find((o) => o.id === id)?.text || id)
                        .join(', ');
                    }
                  } catch {
                    studentVal = item.textAnswer;
                  }
                } else {
                  studentVal = item.textAnswer;
                }
              }
              if (!studentVal) studentVal = 'No response recorded';

              const correctOptions = optionsList
                .filter((o: any) => o.isCorrect || o.id === item.correctOptionId)
                .map((o: any) => o.text)
                .join(', ');

              return (
                <article key={item.id || q.id || idx} className="ui-card p-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="neutral">Question {idx + 1}</Badge>
                      {isPending ? (
                        <Badge variant="warning" icon={<HelpCircle className="w-3.5 h-3.5" />}>
                          Manual Review
                        </Badge>
                      ) : isCorrect ? (
                        <Badge variant="success" icon={<CheckCircle2 className="w-3.5 h-3.5" />}>
                          Correct
                        </Badge>
                      ) : (
                        <Badge variant="danger" icon={<XCircle className="w-3.5 h-3.5" />}>
                          Incorrect
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm font-mono font-bold text-[var(--text-primary)]">
                      {item.marksAwarded ?? 0} / {q.marks ?? 0} marks
                    </span>
                  </div>

                  <p className="text-base font-semibold text-[var(--text-primary)] leading-relaxed">
                    {q.text || q.prompt}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="p-3.5 rounded-[12px] bg-[var(--bg-tray)] border border-[var(--border-default)]">
                      <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                        Your Response
                      </p>
                      <p className="font-medium text-[var(--text-primary)]">{studentVal}</p>
                    </div>

                    {(correctOptions || q.correctAnswer) && (
                      <div className="p-3.5 rounded-[12px] bg-emerald-50/70 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800">
                        <p className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 mb-1">
                          Correct Answer
                        </p>
                        <p className="font-medium text-emerald-950 dark:text-emerald-100">
                          {correctOptions || q.correctAnswer}
                        </p>
                      </div>
                    )}
                  </div>

                  {q.explanation && (
                    <div className="p-4 rounded-[12px] bg-blue-50/60 border border-blue-200/80 dark:bg-blue-950/40 dark:border-blue-800/70 text-sm text-[var(--text-secondary)]">
                      <span className="font-semibold text-[var(--accent-primary)]">Explanation: </span>
                      {q.explanation}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
