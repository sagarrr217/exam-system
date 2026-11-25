import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  ShieldAlert,
  HelpCircle,
  User,
  FileText,
} from 'lucide-react';
import { api } from '../../api/client';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Skeleton } from '../ui/Skeleton';
import { formatDateTime } from './adminUtils';

interface SubmissionDetailModalProps {
  attemptId: string | null;
  onClose: () => void;
}

export const SubmissionDetailModal: React.FC<SubmissionDetailModalProps> = ({
  attemptId,
  onClose,
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!attemptId) {
      setData(null);
      return;
    }

    let active = true;
    const load = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const res = await api.getSubmissionDetails(attemptId);
        if (active) setData(res);
      } catch (err: any) {
        if (active) setErrorMsg(err?.message || 'Unable to load submission transcript.');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [attemptId]);

  const submission = data?.attempt || data?.submission || data;
  const student = submission?.student || {};
  const exam = submission?.exam || {};
  const questionsList: any[] = exam?.questions || [];
  const questionMap = new Map<string, any>(questionsList.map((q) => [q.id, q]));
  const answers: any[] = data?.answers || submission?.answers || [];
  const logs: any[] = data?.focusLogs || submission?.focusLossLogs || [];

  return (
    <Modal
      open={Boolean(attemptId)}
      onClose={onClose}
      maxWidthClass="max-w-3xl"
      titleId="submission-detail-modal-title"
      headerBadge={
        <Badge variant="brand" icon={<FileText className="w-3.5 h-3.5" />}>
          Candidate Transcript Audit
        </Badge>
      }
      title={exam.title || 'Submission Details'}
      subtitle={
        student.name
          ? `${student.name} (${student.email || student.studentId || 'Student'})`
          : undefined
      }
      footer={
        <Button variant="secondary" size="md" onClick={onClose}>
          Close Inspection
        </Button>
      }
    >
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-[12px]" />
          <Skeleton className="h-32 w-full rounded-[12px]" />
          <Skeleton className="h-32 w-full rounded-[12px]" />
        </div>
      ) : errorMsg ? (
        <div className="p-4 rounded-[12px] bg-rose-50 border border-rose-200 text-rose-900 dark:bg-rose-950/60 dark:border-rose-800 dark:text-rose-100 text-sm">
          {errorMsg}
        </div>
      ) : submission ? (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-[12px] bg-[var(--bg-tray)] border border-[var(--border-default)]">
              <p className="text-xs font-medium text-[var(--text-muted)]">Score</p>
              <p className="text-lg font-mono font-bold text-[var(--text-primary)]">
                {submission.score ?? 0} / {exam.totalMarks ?? 0}
              </p>
            </div>
            <div className="p-3.5 rounded-[12px] bg-[var(--bg-tray)] border border-[var(--border-default)]">
              <p className="text-xs font-medium text-[var(--text-muted)]">Percentage</p>
              <p className="text-lg font-mono font-bold text-[var(--accent-primary)]">
                {Math.round(Number(submission.percentage ?? 0))}%
              </p>
            </div>
            <div className="p-3.5 rounded-[12px] bg-[var(--bg-tray)] border border-[var(--border-default)]">
              <p className="text-xs font-medium text-[var(--text-muted)]">Outcome</p>
              <div className="mt-1">
                <Badge variant={submission.passed ? 'success' : 'danger'}>
                  {submission.passed ? 'Passed' : 'Failed'}
                </Badge>
              </div>
            </div>
            <div className="p-3.5 rounded-[12px] bg-[var(--bg-tray)] border border-[var(--border-default)]">
              <p className="text-xs font-medium text-[var(--text-muted)]">Focus Strikes</p>
              <p className="text-lg font-mono font-bold text-[var(--accent-warning)]">
                {submission.focusLossCount ?? logs.length ?? 0}
              </p>
            </div>
          </div>

          {/* Focus Logs Timeline */}
          {logs.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[var(--accent-warning)]" aria-hidden="true" />
                Proctoring Event Timeline ({logs.length})
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {logs.map((log: any, idx: number) => (
                  <div
                    key={log.id || idx}
                    className="px-3.5 py-2.5 rounded-[10px] bg-amber-50/70 border border-amber-200 text-xs text-amber-950 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-100 flex items-center justify-between gap-3"
                  >
                    <span className="font-semibold">
                      {log.eventType}: {log.details || 'Focus lost'}
                    </span>
                    <span className="font-mono shrink-0">{formatDateTime(log.timestamp || log.createdAt)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Answer Breakdown */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <User className="w-4 h-4 text-[var(--accent-primary)]" aria-hidden="true" />
              Submitted Answers ({answers.length})
            </h3>
            <div className="space-y-3">
              {answers.map((ans: any, i: number) => {
                const q = ans.question || questionMap.get(ans.questionId) || {};
                const opts: any[] = q.options || [];
                let studentVal = '';
                if (ans.selectedOption?.text) {
                  studentVal = ans.selectedOption.text;
                } else if (ans.selectedOptionId) {
                  studentVal = opts.find((o) => o.id === ans.selectedOptionId)?.text || '';
                } else if (ans.textAnswer) {
                  if (q.type === 'MULTIPLE_SELECT') {
                    try {
                      const ids = JSON.parse(ans.textAnswer);
                      if (Array.isArray(ids)) {
                        studentVal = ids
                          .map((id) => opts.find((o) => o.id === id)?.text || id)
                          .join(', ');
                      }
                    } catch {
                      studentVal = ans.textAnswer;
                    }
                  } else {
                    studentVal = ans.textAnswer;
                  }
                }
                if (!studentVal) studentVal = 'No response';
                const correct = ans.isCorrect;

                return (
                  <div
                    key={ans.id || i}
                    className="p-4 rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-canvas)] space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono font-bold text-[var(--text-muted)]">
                        Q{i + 1} · {q.type || 'Item'}
                      </span>
                      {correct === true ? (
                        <Badge variant="success" icon={<CheckCircle2 className="w-3.5 h-3.5" />}>
                          +{ans.marksAwarded ?? 0}
                        </Badge>
                      ) : correct === false ? (
                        <Badge variant="danger" icon={<XCircle className="w-3.5 h-3.5" />}>
                          {ans.marksAwarded ?? 0}
                        </Badge>
                      ) : (
                        <Badge variant="warning" icon={<HelpCircle className="w-3.5 h-3.5" />}>
                          Pending
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{q.text || q.prompt}</p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      Response: <span className="font-semibold text-[var(--text-primary)]">{studentVal}</span>
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
};
