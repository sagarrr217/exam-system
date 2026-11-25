import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Download,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  ExternalLink,
  RefreshCw,
  FileCheck,
  ChevronDown,
} from 'lucide-react';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { Exam } from '../../types';
import { downloadExamCsv, formatDateTime } from '../../components/admin/adminUtils';
import { SubmissionDetailModal } from '../../components/admin/SubmissionDetailModal';

export const SubmissionsReviewPage: React.FC = () => {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const examIdParam = searchParams.get('examId') || '';

  const [submissions, setSubmissions] = useState<any[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>(examIdParam);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PASSED' | 'FAILED'>('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await api.getAdminExams();
        setExams(res.exams || []);
      } catch (err: any) {
        console.error('Failed to load exams list', err);
      }
    };
    fetchExams();
  }, []);

  const fetchSubmissions = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await api.getSubmissions(selectedExamId || undefined);
      setSubmissions(res.submissions || []);
      if (isManual) toast.success('Submissions refreshed');
    } catch (err: any) {
      toast.error(err.message || 'Failed to load submissions list');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [selectedExamId]);

  const handleExamFilterChange = (examId: string) => {
    setSelectedExamId(examId);
    if (examId) {
      setSearchParams({ examId });
    } else {
      setSearchParams({});
    }
  };

  const handleExportCsv = async () => {
    if (!selectedExamId && exams.length > 0) {
      const firstId = exams[0].id;
      setExporting(true);
      try {
        await downloadExamCsv(firstId, exams[0].title);
        toast.success(`Exported CSV for "${exams[0].title}"`);
      } catch {
        toast.error('Failed to export CSV');
      } finally {
        setExporting(false);
      }
      return;
    }

    if (!selectedExamId) {
      toast.warning('Please select an examination to export results.');
      return;
    }

    const exam = exams.find((e) => e.id === selectedExamId);
    setExporting(true);
    try {
      await downloadExamCsv(selectedExamId, exam?.title || 'Exam-Submissions');
      toast.success(`Exported CSV for "${exam?.title || 'Exam'}"`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to export CSV');
    } finally {
      setExporting(false);
    }
  };

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      const matchesSearch =
        sub.student?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.student?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sub.student?.studentId &&
          sub.student.studentId.toLowerCase().includes(searchQuery.toLowerCase())) ||
        sub.exam?.title?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'PASSED' && sub.passed) ||
        (statusFilter === 'FAILED' && !sub.passed);

      return matchesSearch && matchesStatus;
    });
  }, [submissions, searchQuery, statusFilter]);

  // Score Distribution Histogram Buckets (0-25, 25-50, 50-75, 75-100)
  const scoreBuckets = useMemo(() => {
    const counts = [0, 0, 0, 0];
    filteredSubmissions.forEach((s) => {
      const pct = Number(s.percentage) || 0;
      if (pct < 25) counts[0]++;
      else if (pct < 50) counts[1]++;
      else if (pct < 75) counts[2]++;
      else counts[3]++;
    });
    const maxCount = Math.max(1, ...counts);
    return [
      { label: '0–24%', count: counts[0], pct: (counts[0] / maxCount) * 100 },
      { label: '25–49%', count: counts[1], pct: (counts[1] / maxCount) * 100 },
      { label: '50–74%', count: counts[2], pct: (counts[2] / maxCount) * 100 },
      { label: '75–100%', count: counts[3], pct: (counts[3] / maxCount) * 100 },
    ];
  }, [filteredSubmissions]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[var(--border-hairline)]">
        <div className="space-y-1.5">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded bg-[#0891B2]/10 dark:bg-[#22D3EE]/10 text-[#0891B2] dark:text-[#22D3EE] border border-[#0891B2]/20 dark:border-[#22D3EE]/25">
            Evaluation & Gradebook
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
            Candidate Submissions & Grading
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Autograded scoring breakdown, proctoring risk classification, and cohort CSV exports.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => fetchSubmissions(true)}
            disabled={loading || refreshing}
            className="btn-ghost-surface px-3.5 py-2 text-xs inline-flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={exporting || (submissions.length === 0 && !selectedExamId)}
            className="btn-signal px-4 py-2 text-xs inline-flex items-center gap-1.5 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{exporting ? 'Exporting...' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* Cohort Score Distribution Telemetry Strip */}
      {!loading && filteredSubmissions.length > 0 && (
        <div className="studio-card p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {scoreBuckets.map((b) => (
            <div key={b.label} className="space-y-1.5">
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-[var(--text-secondary)]">{b.label}</span>
                <span className="font-bold text-[var(--text-primary)] tabular-nums">
                  {b.count} {b.count === 1 ? 'attempt' : 'attempts'}
                </span>
              </div>
              <div className="h-2 rounded-full bg-[var(--bg-tray)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#0891B2] dark:bg-[#22D3EE] transition-all duration-500"
                  style={{ width: `${b.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="studio-card p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <select
              aria-label="Filter by examination"
              value={selectedExamId}
              onChange={(e) => handleExamFilterChange(e.target.value)}
              className="w-full appearance-none pl-3.5 pr-8 py-2 rounded-xl text-xs font-medium bg-[var(--bg-tray)] border border-[var(--border-hairline)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-strong)]"
            >
              <option value="">All Examinations ({exams.length})</option>
              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.title}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none" />
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input
              type="text"
              aria-label="Search candidates"
              placeholder="Search candidate name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs bg-[var(--bg-tray)] focus:bg-[var(--bg-surface)] border border-[var(--border-hairline)] focus:border-[var(--border-strong)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none transition-all"
            />
          </div>
        </div>

        <div className="inline-flex p-1 rounded-xl bg-[var(--bg-tray)] border border-[var(--border-hairline)]">
          {(
            [
              { id: 'ALL', label: `All (${submissions.length})`, color: 'text-[var(--text-primary)]' },
              {
                id: 'PASSED',
                label: `Passed (${submissions.filter((s) => s.passed).length})`,
                color: 'text-emerald-600 dark:text-emerald-400',
              },
              {
                id: 'FAILED',
                label: `Failed (${submissions.filter((s) => !s.passed).length})`,
                color: 'text-rose-600 dark:text-rose-400',
              },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setStatusFilter(f.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === f.id
                  ? `bg-[var(--bg-surface)] ${f.color} border border-[var(--border-hairline)] shadow-sm`
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Submissions Table */}
      <div className="studio-card overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-[var(--text-secondary)]">
            <div className="w-6 h-6 border-2 border-[var(--accent-signal)] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="font-mono text-xs">Loading candidate submissions...</p>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="p-16 text-center text-[var(--text-secondary)]">
            <FileCheck className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <h3 className="text-sm font-bold text-[var(--text-primary)]">No submissions found</h3>
            <p className="text-xs max-w-sm mx-auto mt-1">
              {searchQuery || statusFilter !== 'ALL' || selectedExamId
                ? 'No candidate submissions matched your active filters.'
                : 'Completed assessments will appear here once submitted.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[var(--bg-tray)]/70 font-mono text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-hairline)]">
                <tr>
                  <th className="px-6 py-3.5">Candidate</th>
                  <th className="px-4 py-3.5">Examination</th>
                  <th className="px-4 py-3.5">Score</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Answered</th>
                  <th className="px-4 py-3.5">Proctoring Risk</th>
                  <th className="px-4 py-3.5">Submitted At</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-hairline)]">
                {filteredSubmissions.map((sub) => {
                  const focusLossCount =
                    sub._count?.focusLossLogs ??
                    (sub.focusLossLogs ? sub.focusLossLogs.length : 0);
                  const threshold = sub.exam?.focusLossThreshold || 3;
                  const isHighRisk = focusLossCount >= threshold;

                  return (
                    <tr key={sub.id} className="hover:bg-[var(--bg-tray)]/40 transition-colors">
                      <td className="px-6 py-3.5">
                        <div className="font-semibold text-[var(--text-primary)]">
                          {sub.student?.name || 'Unknown Candidate'}
                        </div>
                        <div className="font-mono text-[11px] text-[var(--text-secondary)] flex items-center gap-2 mt-0.5">
                          {sub.student?.studentId && (
                            <span className="bg-[var(--bg-tray)] px-1.5 py-0.5 rounded text-[10px]">
                              {sub.student.studentId}
                            </span>
                          )}
                          <span>{sub.student?.email}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 max-w-xs">
                        <div className="font-medium text-[var(--text-primary)] truncate">
                          {sub.exam?.title || 'Examination'}
                        </div>
                        <div className="font-mono text-[11px] text-[var(--text-secondary)]">
                          {sub.exam?.subject}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap font-mono tabular-nums">
                        <div className="font-bold text-[var(--text-primary)]">
                          {sub.score}{' '}
                          <span className="text-xs text-[var(--text-tertiary)] font-normal">
                            / {sub.exam?.totalMarks || 100}
                          </span>
                        </div>
                        <div className="text-[11px] font-semibold text-[#0891B2] dark:text-[#22D3EE]">
                          {sub.percentage?.toFixed(1)}%
                        </div>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {sub.passed ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded font-mono text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25">
                            <CheckCircle2 className="w-3 h-3" />
                            Passed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded font-mono text-[10px] font-bold uppercase bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/25">
                            <AlertCircle className="w-3 h-3" />
                            Failed
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs tabular-nums">
                        <div className="font-medium text-[var(--text-primary)]">
                          {sub.totalAnswered} answered
                        </div>
                        {sub.totalUnanswered > 0 && (
                          <div className="text-[11px] text-amber-600 dark:text-amber-400">
                            {sub.totalUnanswered} unanswered
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {isHighRisk ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded font-mono text-[10px] font-bold uppercase bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/25">
                            <ShieldAlert className="w-3 h-3" />
                            High Risk ({focusLossCount})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded font-mono text-[10px] font-medium text-[var(--text-secondary)] bg-[var(--bg-tray)]">
                            {focusLossCount} {focusLossCount === 1 ? 'incident' : 'incidents'}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs text-[var(--text-secondary)]">
                        {formatDateTime(sub.submittedAt)}
                      </td>

                      <td className="px-6 py-3.5 whitespace-nowrap text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedAttemptId(sub.id)}
                          className="btn-ghost-surface px-3 py-1.5 text-xs inline-flex items-center gap-1"
                        >
                          <span>Review</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <SubmissionDetailModal
        attemptId={selectedAttemptId}
        onClose={() => setSelectedAttemptId(null)}
      />
    </div>
  );
};
