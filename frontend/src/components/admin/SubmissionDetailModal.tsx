import React, { useEffect, useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  FileText,
  Award,
  User,
  Calendar,
  EyeOff,
} from 'lucide-react';
import { api } from '../../api/client';
import { formatDateTime } from './adminUtils';

interface SubmissionDetailModalProps {
  attemptId: string | null;
  onClose: () => void;
}

export const SubmissionDetailModal: React.FC<SubmissionDetailModalProps> = ({
  attemptId,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'questions' | 'logs'>('questions');

  useEffect(() => {
    if (!attemptId) {
      setAttempt(null);
      return;
    }

    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getSubmissionDetails(attemptId);
        setAttempt(res.attempt);
      } catch (err: any) {
        setError(err.message || 'Failed to load submission details.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [attemptId]);

  if (!attemptId) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-lg flex items-center justify-center p-4 sm:p-6 animate-fade-in"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="studio-card max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-apple-spring border border-[var(--border-strong)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[var(--border-hairline)] flex items-center justify-between bg-[var(--bg-tray)]/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-[#0891B2]/10 dark:bg-[#22D3EE]/10 text-[#0891B2] dark:text-[#22D3EE] border border-[#0891B2]/25 dark:border-[#22D3EE]/25">
                Attempt Audit
              </span>
              <span className="font-mono text-[11px] text-[var(--text-tertiary)]">
                ID: {attemptId.slice(0, 8)}...
              </span>
            </div>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mt-1">
              {attempt ? attempt.exam.title : 'Loading Submission...'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            aria-label="Close audit modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {loading && (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-6 h-6 border-2 border-[var(--accent-signal)] border-t-transparent rounded-full animate-spin" />
              <p className="font-mono text-xs text-[var(--text-secondary)]">
                Retrieving candidate attempt & audit trail...
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {attempt && !loading && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <div className="p-4 rounded-xl bg-[var(--bg-tray)]/70 border border-[var(--border-hairline)]">
                  <div className="flex items-center gap-1.5 font-mono text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
                    <User className="w-3.5 h-3.5 text-[#0891B2] dark:text-[#22D3EE]" />
                    <span>Candidate</span>
                  </div>
                  <div className="font-bold text-[var(--text-primary)] text-sm">
                    {attempt.student.name}
                  </div>
                  <div className="font-mono text-[11px] text-[var(--text-secondary)] mt-0.5">
                    {attempt.student.email}
                  </div>
                  {attempt.student.studentId && (
                    <div className="font-mono text-[11px] text-[var(--text-tertiary)] mt-1">
                      ID: {attempt.student.studentId}
                    </div>
                  )}
                  {attempt.student.department && (
                    <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                      Dept: {attempt.student.department}
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-[var(--bg-tray)]/70 border border-[var(--border-hairline)]">
                  <div className="flex items-center gap-1.5 font-mono text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
                    <Award className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Grading & Score</span>
                  </div>
                  <div className="flex items-baseline gap-2 font-mono tabular-nums">
                    <span className="text-2xl font-bold text-[var(--text-primary)]">
                      {attempt.score}
                    </span>
                    <span className="text-xs text-[var(--text-secondary)]">
                      / {attempt.exam.totalMarks} marks
                    </span>
                    <span className="text-xs font-semibold text-[#0891B2] dark:text-[#22D3EE]">
                      ({attempt.percentage?.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="mt-2">
                    {attempt.passed ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded font-mono text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25">
                        <CheckCircle2 className="w-3 h-3" />
                        PASSED (Min: {attempt.exam.passingMarks})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded font-mono text-[10px] font-bold uppercase bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/25">
                        <AlertCircle className="w-3 h-3" />
                        FAILED (Min: {attempt.exam.passingMarks})
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[var(--bg-tray)]/70 border border-[var(--border-hairline)]">
                  <div className="flex items-center gap-1.5 font-mono text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
                    <ShieldAlert className="w-3.5 h-3.5 text-[var(--accent-signal)]" />
                    <span>Proctoring Summary</span>
                  </div>
                  <div className="flex items-baseline gap-2 font-mono tabular-nums">
                    <span className="text-2xl font-bold text-[var(--text-primary)]">
                      {attempt.focusLossLogs?.length || 0}
                    </span>
                    <span className="text-xs text-[var(--text-secondary)]">Incidents</span>
                  </div>
                  <div className="mt-2">
                    {(attempt.focusLossLogs?.length || 0) >=
                    (attempt.exam.focusLossThreshold || 3) ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded font-mono text-[10px] font-bold uppercase bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/25">
                        <ShieldAlert className="w-3 h-3" />
                        High Risk ({'≥'} {attempt.exam.focusLossThreshold || 3})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded font-mono text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25">
                        <CheckCircle2 className="w-3 h-3" />
                        Normal (Limit: {attempt.exam.focusLossThreshold || 3})
                      </span>
                    )}
                  </div>
                  <div className="font-mono text-[10px] text-[var(--text-tertiary)] mt-2 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDateTime(attempt.submittedAt)}</span>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="inline-flex p-1 rounded-xl bg-[var(--bg-tray)] border border-[var(--border-hairline)]">
                <button
                  type="button"
                  onClick={() => setActiveTab('questions')}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'questions'
                      ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-hairline)] shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Question Responses ({attempt.exam.questions?.length || 0})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('logs')}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'logs'
                      ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-hairline)] shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Focus-Loss Logs ({attempt.focusLossLogs?.length || 0})</span>
                </button>
              </div>

              {activeTab === 'questions' && (
                <div className="space-y-3">
                  {attempt.exam.questions?.map((q: any, idx: number) => {
                    const studentAns = attempt.answers?.find((a: any) => a.questionId === q.id);
                    const isAnswered = Boolean(
                      studentAns && (studentAns.selectedOptionId || studentAns.textAnswer)
                    );
                    const isCorrect = studentAns?.isCorrect;

                    return (
                      <div
                        key={q.id}
                        className={`p-4 sm:p-5 rounded-xl border transition-all ${
                          isCorrect
                            ? 'bg-emerald-500/[0.04] border-emerald-500/25'
                            : isAnswered
                            ? 'bg-rose-500/[0.04] border-rose-500/25'
                            : 'bg-[var(--bg-tray)]/40 border-[var(--border-hairline)]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-[var(--bg-tray)] font-mono font-bold text-xs flex items-center justify-center text-[var(--text-primary)]">
                              {idx + 1}
                            </span>
                            <span className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded uppercase bg-[var(--bg-tray)] text-[var(--text-secondary)]">
                              {q.type}
                            </span>
                            <span className="font-mono text-xs text-[var(--text-tertiary)]">
                              {q.marks} {q.marks === 1 ? 'Mark' : 'Marks'}
                            </span>
                          </div>

                          <div>
                            {isCorrect ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded font-mono text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25">
                                <CheckCircle2 className="w-3 h-3" />+{studentAns?.marksAwarded ?? q.marks} Marks
                              </span>
                            ) : isAnswered ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded font-mono text-[10px] font-bold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/25">
                                <AlertCircle className="w-3 h-3" />0 Marks
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded font-mono text-[10px] font-semibold bg-[var(--bg-tray)] text-[var(--text-secondary)]">
                                Unanswered
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-[var(--text-primary)] font-medium mb-3 text-xs sm:text-sm leading-relaxed">
                          {q.text}
                        </p>

                        {q.imageUrl && (
                          <div className="mb-3">
                            <img
                              src={q.imageUrl}
                              alt="Question diagram"
                              className="max-h-48 rounded-xl border border-[var(--border-hairline)] object-contain"
                            />
                          </div>
                        )}

                        {q.options && q.options.length > 0 && (
                          <div className="space-y-1.5 mt-2.5">
                            {q.options.map((opt: any) => {
                              const isSelectedByStudent = studentAns?.selectedOptionId === opt.id;
                              const isCorrectAnswer = Boolean(opt.isCorrect);

                              let rowStyle =
                                'border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]';
                              if (isCorrectAnswer && isSelectedByStudent) {
                                rowStyle =
                                  'border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-semibold';
                              } else if (isCorrectAnswer) {
                                rowStyle =
                                  'border-emerald-400/50 bg-emerald-500/5 text-emerald-800 dark:text-emerald-300';
                              } else if (isSelectedByStudent) {
                                rowStyle =
                                  'border-rose-500 bg-rose-500/10 text-rose-800 dark:text-rose-300 font-semibold';
                              }

                              return (
                                <div
                                  key={opt.id}
                                  className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2.5 ${rowStyle}`}
                                >
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                                        isCorrectAnswer
                                          ? 'border-emerald-500 bg-emerald-500 text-white'
                                          : isSelectedByStudent
                                          ? 'border-rose-500 bg-rose-500 text-white'
                                          : 'border-[var(--border-strong)]'
                                      }`}
                                    >
                                      {isCorrectAnswer ? '✓' : isSelectedByStudent ? '✗' : ''}
                                    </div>
                                    <span>{opt.text}</span>
                                  </div>

                                  <div className="flex items-center gap-1.5 flex-shrink-0">
                                    {isSelectedByStudent && (
                                      <span className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded bg-[#0891B2]/10 text-[#0891B2] dark:text-[#22D3EE]">
                                        Candidate
                                      </span>
                                    )}
                                    {isCorrectAnswer && (
                                      <span className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                                        Correct
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {(q.type === 'SHORT_ANSWER' ||
                          q.type === 'LONG_ANSWER' ||
                          q.type === 'FILL_BLANK' ||
                          q.type === 'NUMERICAL') && (
                          <div className="mt-2.5 p-3 rounded-xl bg-[var(--bg-tray)] border border-[var(--border-hairline)] text-xs">
                            <span className="font-mono text-[10px] font-semibold text-[var(--text-tertiary)] block mb-1 uppercase">
                              Candidate Response:
                            </span>
                            <p className="text-[var(--text-primary)] whitespace-pre-wrap">
                              {studentAns?.textAnswer || '(No text answer submitted)'}
                            </p>
                          </div>
                        )}

                        {q.explanation && (
                          <div className="mt-2.5 p-3 rounded-xl bg-[#0891B2]/10 border border-[#0891B2]/20 text-xs text-[var(--text-primary)]">
                            <span className="font-mono font-semibold block mb-0.5 text-[#0891B2] dark:text-[#22D3EE] text-[10px] uppercase">
                              Solution Explanation:
                            </span>
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === 'logs' && (
                <div className="space-y-3">
                  {!attempt.focusLossLogs || attempt.focusLossLogs.length === 0 ? (
                    <div className="py-12 text-center text-[var(--text-secondary)]">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                      <p className="font-semibold text-xs text-[var(--text-primary)]">
                        No Focus-Loss Incidents
                      </p>
                      <p className="text-[11px] text-[var(--text-secondary)]">
                        The candidate maintained continuous exam focus.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-[var(--border-hairline)]">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[var(--bg-tray)] font-mono text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-hairline)]">
                          <tr>
                            <th className="px-4 py-2.5">#</th>
                            <th className="px-4 py-2.5">Event Type</th>
                            <th className="px-4 py-2.5">Timestamp</th>
                            <th className="px-4 py-2.5">Duration</th>
                            <th className="px-4 py-2.5">Details</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-hairline)]">
                          {attempt.focusLossLogs.map((log: any, idx: number) => {
                            const badgeStyle =
                              log.eventType === 'VISIBILITY_HIDDEN'
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                : 'bg-[#0891B2]/10 text-[#0891B2] dark:text-[#22D3EE]';

                            return (
                              <tr key={log.id || idx} className="hover:bg-[var(--bg-tray)]/40">
                                <td className="px-4 py-2.5 font-mono text-xs text-[var(--text-tertiary)]">
                                  {idx + 1}
                                </td>
                                <td className="px-4 py-2.5">
                                  <span
                                    className={`px-2 py-0.5 rounded font-mono text-[10px] font-semibold ${badgeStyle}`}
                                  >
                                    {log.eventType}
                                  </span>
                                </td>
                                <td className="px-4 py-2.5 font-mono text-xs text-[var(--text-secondary)]">
                                  {formatDateTime(log.timestamp)}
                                </td>
                                <td className="px-4 py-2.5 font-mono text-xs text-[var(--text-secondary)]">
                                  {log.durationSeconds != null ? `${log.durationSeconds}s` : '—'}
                                </td>
                                <td className="px-4 py-2.5 text-xs text-[var(--text-secondary)] max-w-xs truncate">
                                  {log.details || 'Window focus lost / tab changed'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-4 border-t border-[var(--border-hairline)] bg-[var(--bg-tray)]/40 flex justify-end">
          <button type="button" onClick={onClose} className="btn-ghost-surface px-5 py-2 text-xs">
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
};
