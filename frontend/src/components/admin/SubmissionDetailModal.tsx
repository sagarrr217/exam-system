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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                Attempt Audit
              </span>
              <span className="text-xs text-slate-500 font-mono">ID: {attemptId.slice(0, 8)}...</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {attempt ? attempt.exam.title : 'Loading Submission...'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading && (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-sm text-slate-500">Retrieving candidate attempt & proctoring timeline...</p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {attempt && !loading && (
            <>
              {/* Candidate & Score Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <span>Candidate</span>
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white text-base">{attempt.student.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{attempt.student.email}</div>
                  {attempt.student.studentId && (
                    <div className="text-xs font-mono text-slate-600 dark:text-slate-400 mt-1">
                      ID: {attempt.student.studentId}
                    </div>
                  )}
                  {attempt.student.department && (
                    <div className="text-xs text-slate-500 mt-0.5">Dept: {attempt.student.department}</div>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span>Grading & Score</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">{attempt.score}</span>
                    <span className="text-sm font-semibold text-slate-500">/ {attempt.exam.totalMarks} marks</span>
                    <span className="text-sm font-bold text-blue-600">({attempt.percentage?.toFixed(1)}%)</span>
                  </div>
                  <div className="mt-2">
                    {attempt.passed ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        PASSED (Pass: {attempt.exam.passingMarks})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300">
                        <AlertCircle className="w-3.5 h-3.5" />
                        FAILED (Pass: {attempt.exam.passingMarks})
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    <ShieldAlert className="w-4 h-4 text-purple-600" />
                    <span>Proctoring Summary</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                      {attempt.focusLossLogs?.length || 0}
                    </span>
                    <span className="text-xs text-slate-500">Focus Loss Incidents</span>
                  </div>
                  <div className="mt-2">
                    {(attempt.focusLossLogs?.length || 0) >= (attempt.exam.focusLossThreshold || 3) ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        High Risk ({'>='} {attempt.exam.focusLossThreshold || 3})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Normal (Limit: {attempt.exam.focusLossThreshold || 3})
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Submitted: {formatDateTime(attempt.submittedAt)}</span>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setActiveTab('questions')}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-colors ${
                    activeTab === 'questions'
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Question Responses ({attempt.exam.questions?.length || 0})</span>
                </button>
                <button
                  onClick={() => setActiveTab('logs')}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-colors ${
                    activeTab === 'logs'
                      ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <EyeOff className="w-4 h-4" />
                  <span>Focus-Loss Logs ({attempt.focusLossLogs?.length || 0})</span>
                </button>
              </div>

              {/* Tab Content: Questions */}
              {activeTab === 'questions' && (
                <div className="space-y-4">
                  {attempt.exam.questions?.map((q: any, idx: number) => {
                    const studentAns = attempt.answers?.find((a: any) => a.questionId === q.id);
                    const isAnswered = Boolean(studentAns && (studentAns.selectedOptionId || studentAns.textAnswer));
                    const isCorrect = studentAns?.isCorrect;

                    return (
                      <div
                        key={q.id}
                        className={`p-5 rounded-2xl border transition-all ${
                          isCorrect
                            ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                            : isAnswered
                            ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/60'
                            : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 font-bold text-xs flex items-center justify-center text-slate-800 dark:text-slate-200">
                              {idx + 1}
                            </span>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              {q.type}
                            </span>
                            <span className="text-xs font-medium text-slate-500">
                              {q.marks} {q.marks === 1 ? 'Mark' : 'Marks'}
                            </span>
                          </div>

                          <div>
                            {isCorrect ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                +{studentAns?.marksAwarded ?? q.marks} Marks
                              </span>
                            ) : isAnswered ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300">
                                <AlertCircle className="w-3.5 h-3.5" />
                                0 Marks
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                                Unanswered (0 Marks)
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Question Text */}
                        <p className="text-slate-900 dark:text-white font-medium mb-3 text-sm sm:text-base leading-relaxed">
                          {q.text}
                        </p>

                        {/* Question Image if present */}
                        {q.imageUrl && (
                          <div className="mb-4">
                            <img
                              src={q.imageUrl}
                              alt="Question diagram"
                              className="max-h-48 rounded-xl border border-slate-200 dark:border-slate-700 object-contain"
                            />
                          </div>
                        )}

                        {/* Options List */}
                        {q.options && q.options.length > 0 && (
                          <div className="space-y-2 mt-3">
                            {q.options.map((opt: any) => {
                              const isSelectedByStudent = studentAns?.selectedOptionId === opt.id;
                              const isCorrectAnswer = Boolean(opt.isCorrect);

                              let rowStyle = 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-300';
                              if (isCorrectAnswer && isSelectedByStudent) {
                                rowStyle = 'border-emerald-500 bg-emerald-100/60 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-100 font-semibold';
                              } else if (isCorrectAnswer) {
                                rowStyle = 'border-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 font-medium';
                              } else if (isSelectedByStudent) {
                                rowStyle = 'border-rose-400 bg-rose-50/70 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 font-semibold';
                              }

                              return (
                                <div
                                  key={opt.id}
                                  className={`p-3 rounded-xl border text-sm flex items-center justify-between gap-3 ${rowStyle}`}
                                >
                                  <div className="flex items-center gap-2.5">
                                    <div
                                      className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs ${
                                        isCorrectAnswer
                                          ? 'border-emerald-500 bg-emerald-500 text-white'
                                          : isSelectedByStudent
                                          ? 'border-rose-500 bg-rose-500 text-white'
                                          : 'border-slate-300 dark:border-slate-700'
                                      }`}
                                    >
                                      {isCorrectAnswer ? '✓' : isSelectedByStudent ? '✗' : ''}
                                    </div>
                                    <span>{opt.text}</span>
                                  </div>

                                  <div className="flex items-center gap-1.5 flex-shrink-0">
                                    {isSelectedByStudent && (
                                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                                        Candidate Choice
                                      </span>
                                    )}
                                    {isCorrectAnswer && (
                                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                                        Correct Answer
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Short Answer text if applicable */}
                        {q.type === 'SHORT_ANSWER' && (
                          <div className="mt-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm">
                            <span className="text-xs font-semibold text-slate-500 block mb-1">Candidate Response:</span>
                            <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                              {studentAns?.textAnswer || '(No text answer submitted)'}
                            </p>
                          </div>
                        )}

                        {/* Explanation */}
                        {q.explanation && (
                          <div className="mt-3 p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-300">
                            <span className="font-bold block mb-0.5">Solution Explanation:</span>
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
                <div className="space-y-4">
                  {(!attempt.focusLossLogs || attempt.focusLossLogs.length === 0) ? (
                    <div className="py-12 text-center text-slate-500">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                      <p className="font-semibold text-slate-700 dark:text-slate-300">No Focus-Loss Incidents</p>
                      <p className="text-xs text-slate-500">The candidate maintained continuous exam focus.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                          <tr>
                            <th className="px-4 py-3">#</th>
                            <th className="px-4 py-3">Event Type</th>
                            <th className="px-4 py-3">Timestamp</th>
                            <th className="px-4 py-3">Duration</th>
                            <th className="px-4 py-3">Details</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {attempt.focusLossLogs.map((log: any, idx: number) => {
                            let badgeStyle = 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300';
                            if (log.eventType === 'VISIBILITY_HIDDEN') {
                              badgeStyle = 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300';
                            }

                            return (
                              <tr key={log.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                                <td className="px-4 py-3 font-mono text-xs text-slate-400">{idx + 1}</td>
                                <td className="px-4 py-3">
                                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${badgeStyle}`}>
                                    {log.eventType}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-xs font-mono text-slate-600 dark:text-slate-300">
                                  {formatDateTime(log.timestamp)}
                                </td>
                                <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">
                                  {log.durationSeconds != null ? `${log.durationSeconds}s` : '—'}
                                </td>
                                <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400 max-w-xs truncate">
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
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
          >
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
};
