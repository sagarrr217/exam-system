import React, { useEffect, useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ShieldAlert, 
  FileText, 
  Award, 
  User, 
  Calendar,
  EyeOff
} from 'lucide-react';
import { api } from '../../api/client';
import { formatDateTime } from './adminUtils';

interface SubmissionDetailModalProps {
  attemptId: string | null;
  onClose: () => void;
}

export const SubmissionDetailModal: React.FC<SubmissionDetailModalProps> = ({ attemptId, onClose }) => {
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div 
        className="apple-card max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-apple-spring border border-black/10 dark:border-white/15"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-black/5 dark:border-white/10 flex items-center justify-between bg-black/[0.015] dark:bg-white/[0.02]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-blue-500/10 text-[#0071e3] dark:text-[#0a84ff] border border-blue-500/20">
                Attempt Audit
              </span>
              <span className="text-[11px] text-[#86868b] font-mono">ID: {attemptId.slice(0, 8)}...</span>
            </div>
            <h2 className="text-lg font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mt-1">
              {attempt ? attempt.exam.title : 'Loading Submission...'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {loading && (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-6 h-6 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-[#86868b]">Retrieving candidate attempt & audit trail...</p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-[#ff3b30] dark:text-[#ff453a] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {attempt && !loading && (
            <>
              {/* Candidate & Score Summary Bento Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#86868b] uppercase tracking-wider mb-2">
                    <User className="w-3.5 h-3.5 text-[#0071e3]" />
                    <span>Candidate</span>
                  </div>
                  <div className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] text-sm">{attempt.student.name}</div>
                  <div className="text-[11px] text-[#86868b] mt-0.5">{attempt.student.email}</div>
                  {attempt.student.studentId && (
                    <div className="text-[11px] font-mono text-[#86868b] mt-1">
                      ID: {attempt.student.studentId}
                    </div>
                  )}
                  {attempt.student.department && (
                    <div className="text-[11px] text-[#86868b] mt-0.5">Dept: {attempt.student.department}</div>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#86868b] uppercase tracking-wider mb-2">
                    <Award className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Grading & Score</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">{attempt.score}</span>
                    <span className="text-xs text-[#86868b]">/ {attempt.exam.totalMarks} marks</span>
                    <span className="text-xs font-semibold text-[#0071e3] dark:text-[#0a84ff]">({attempt.percentage?.toFixed(1)}%)</span>
                  </div>
                  <div className="mt-2">
                    {attempt.passed ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        PASSED (Pass: {attempt.exam.passingMarks})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
                        <AlertCircle className="w-3 h-3" />
                        FAILED (Pass: {attempt.exam.passingMarks})
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#86868b] uppercase tracking-wider mb-2">
                    <ShieldAlert className="w-3.5 h-3.5 text-purple-500" />
                    <span>Proctoring Summary</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                      {attempt.focusLossLogs?.length || 0}
                    </span>
                    <span className="text-xs text-[#86868b]">Focus Loss Incidents</span>
                  </div>
                  <div className="mt-2">
                    {(attempt.focusLossLogs?.length || 0) >= (attempt.exam.focusLossThreshold || 3) ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
                        <ShieldAlert className="w-3 h-3" />
                        High Risk ({'>='} {attempt.exam.focusLossThreshold || 3})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        Normal (Limit: {attempt.exam.focusLossThreshold || 3})
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[#86868b] mt-2 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Submitted: {formatDateTime(attempt.submittedAt)}</span>
                  </div>
                </div>
              </div>

              {/* iOS Segmented Navigation Tabs */}
              <div className="inline-flex p-1 rounded-full bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/5">
                <button
                  onClick={() => setActiveTab('questions')}
                  className={`flex items-center gap-2 px-4 py-1 rounded-full text-xs font-medium transition-all ${
                    activeTab === 'questions'
                      ? 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-white shadow-sm'
                      : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Question Responses ({attempt.exam.questions?.length || 0})</span>
                </button>
                <button
                  onClick={() => setActiveTab('logs')}
                  className={`flex items-center gap-2 px-4 py-1 rounded-full text-xs font-medium transition-all ${
                    activeTab === 'logs'
                      ? 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-white shadow-sm'
                      : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white'
                  }`}
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Focus-Loss Logs ({attempt.focusLossLogs?.length || 0})</span>
                </button>
              </div>

              {/* Tab Content: Questions */}
              {activeTab === 'questions' && (
                <div className="space-y-3">
                  {attempt.exam.questions?.map((q: any, idx: number) => {
                    const studentAns = attempt.answers?.find((a: any) => a.questionId === q.id);
                    const isAnswered = Boolean(studentAns && (studentAns.selectedOptionId || studentAns.textAnswer));
                    const isCorrect = studentAns?.isCorrect;

                    return (
                      <div
                        key={q.id}
                        className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                          isCorrect
                            ? 'bg-emerald-500/[0.04] border-emerald-500/20'
                            : isAnswered
                            ? 'bg-rose-500/[0.04] border-rose-500/20'
                            : 'bg-black/[0.015] dark:bg-white/[0.02] border-black/5 dark:border-white/10'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-black/5 dark:bg-white/10 font-bold text-xs flex items-center justify-center text-[#1d1d1f] dark:text-[#f5f5f7]">
                              {idx + 1}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider bg-black/5 dark:bg-white/10 text-[#86868b]">
                              {q.type}
                            </span>
                            <span className="text-xs text-[#86868b]">
                              {q.marks} {q.marks === 1 ? 'Mark' : 'Marks'}
                            </span>
                          </div>

                          <div>
                            {isCorrect ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                                <CheckCircle2 className="w-3 h-3" />
                                +{studentAns?.marksAwarded ?? q.marks} Marks
                              </span>
                            ) : isAnswered ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
                                <AlertCircle className="w-3 h-3" />
                                0 Marks
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-black/5 dark:bg-white/10 text-[#86868b]">
                                Unanswered
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Question Text */}
                        <p className="text-[#1d1d1f] dark:text-[#f5f5f7] font-medium mb-3 text-xs sm:text-sm leading-relaxed">
                          {q.text}
                        </p>

                        {/* Question Image if present */}
                        {q.imageUrl && (
                          <div className="mb-3">
                            <img
                              src={q.imageUrl}
                              alt="Question diagram"
                              className="max-h-48 rounded-xl border border-black/10 dark:border-white/10 object-contain"
                            />
                          </div>
                        )}

                        {/* Options List */}
                        {q.options && q.options.length > 0 && (
                          <div className="space-y-1.5 mt-2.5">
                            {q.options.map((opt: any) => {
                              const isSelectedByStudent = studentAns?.selectedOptionId === opt.id;
                              const isCorrectAnswer = Boolean(opt.isCorrect);

                              let rowStyle = 'border-black/5 dark:border-white/10 bg-black/[0.015] dark:bg-white/[0.02] text-[#1d1d1f] dark:text-[#f5f5f7]';
                              if (isCorrectAnswer && isSelectedByStudent) {
                                rowStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-semibold';
                              } else if (isCorrectAnswer) {
                                rowStyle = 'border-emerald-400/50 bg-emerald-500/5 text-emerald-800 dark:text-emerald-300';
                              } else if (isSelectedByStudent) {
                                rowStyle = 'border-rose-500 bg-rose-500/10 text-rose-800 dark:text-rose-300 font-semibold';
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
                                          : 'border-black/20 dark:border-white/20'
                                      }`}
                                    >
                                      {isCorrectAnswer ? '✓' : isSelectedByStudent ? '✗' : ''}
                                    </div>
                                    <span>{opt.text}</span>
                                  </div>

                                  <div className="flex items-center gap-1.5 flex-shrink-0">
                                    {isSelectedByStudent && (
                                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-[#0071e3] dark:text-[#0a84ff]">
                                        Candidate Choice
                                      </span>
                                    )}
                                    {isCorrectAnswer && (
                                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                                        Correct
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Short Answer text if applicable */}
                        {(q.type === 'SHORT_ANSWER' || q.type === 'LONG_ANSWER' || q.type === 'FILL_BLANK' || q.type === 'NUMERICAL') && (
                          <div className="mt-2.5 p-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/10 text-xs">
                            <span className="text-[10px] font-semibold text-[#86868b] block mb-1 uppercase">Candidate Response:</span>
                            <p className="text-[#1d1d1f] dark:text-[#f5f5f7] whitespace-pre-wrap">
                              {studentAns?.textAnswer || '(No text answer submitted)'}
                            </p>
                          </div>
                        )}

                        {/* Explanation */}
                        {q.explanation && (
                          <div className="mt-2.5 p-3 rounded-xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/15 text-xs text-[#1d1d1f] dark:text-[#f5f5f7]">
                            <span className="font-semibold block mb-0.5 text-[#0071e3] dark:text-[#0a84ff] text-[10px] uppercase">Solution Explanation:</span>
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Tab Content: Proctoring Logs */}
              {activeTab === 'logs' && (
                <div className="space-y-3">
                  {(!attempt.focusLossLogs || attempt.focusLossLogs.length === 0) ? (
                    <div className="py-12 text-center text-[#86868b]">
                      <CheckCircle2 className="w-8 h-8 text-[#34c759] mx-auto mb-2 opacity-80" />
                      <p className="font-semibold text-xs text-[#1d1d1f] dark:text-[#f5f5f7]">No Focus-Loss Incidents</p>
                      <p className="text-[11px] text-[#86868b]">The candidate maintained continuous exam focus.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-2xl border border-black/5 dark:border-white/10">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-black/[0.02] dark:bg-white/[0.02] text-[10px] font-semibold text-[#86868b] uppercase tracking-wider border-b border-black/5 dark:border-white/10">
                          <tr>
                            <th className="px-4 py-2.5">#</th>
                            <th className="px-4 py-2.5">Event Type</th>
                            <th className="px-4 py-2.5">Timestamp</th>
                            <th className="px-4 py-2.5">Duration</th>
                            <th className="px-4 py-2.5">Details</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5 dark:divide-white/5">
                          {attempt.focusLossLogs.map((log: any, idx: number) => {
                            let badgeStyle = 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
                            if (log.eventType === 'VISIBILITY_HIDDEN') {
                              badgeStyle = 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
                            }

                            return (
                              <tr key={log.id || idx} className="hover:bg-black/[0.015] dark:hover:bg-white/[0.02]">
                                <td className="px-4 py-2.5 font-mono text-xs text-[#86868b]">{idx + 1}</td>
                                <td className="px-4 py-2.5">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${badgeStyle}`}>
                                    {log.eventType}
                                  </span>
                                </td>
                                <td className="px-4 py-2.5 text-xs text-[#86868b]">
                                  {formatDateTime(log.timestamp)}
                                </td>
                                <td className="px-4 py-2.5 text-xs text-[#86868b]">
                                  {log.durationSeconds != null ? `${log.durationSeconds}s` : '—'}
                                </td>
                                <td className="px-4 py-2.5 text-xs text-[#86868b] max-w-xs truncate">
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

        {/* Footer */}
        <div className="p-4 border-t border-black/5 dark:border-white/10 bg-black/[0.015] dark:bg-white/[0.02] flex justify-end">
          <button
            onClick={onClose}
            className="apple-btn-secondary px-5 py-1.5 text-xs"
          >
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
};
