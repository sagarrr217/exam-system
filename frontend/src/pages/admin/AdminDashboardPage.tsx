import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  CheckCircle2,
  Users,
  FileCheck,
  Award,
  TrendingUp,
  AlertTriangle,
  PlusCircle,
  Eye,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  GraduationCap,
} from 'lucide-react';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { DashboardStats } from '../../types';
import { formatDateTime } from '../../components/admin/adminUtils';
import { SubmissionDetailModal } from '../../components/admin/SubmissionDetailModal';

interface EnrolledStudent {
  id: string;
  name: string;
  email: string;
  studentId?: string | null;
  department?: string | null;
  attempts: {
    id: string;
    status: string;
    score: number;
    percentage: number;
    passed: boolean;
  }[];
}

export const AdminDashboardPage: React.FC = () => {
  const toast = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);
  const [students, setStudents] = useState<EnrolledStudent[]>([]);
  const [activeFeedTab, setActiveFeedTab] = useState<'submissions' | 'students'>('submissions');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);

  const fetchDashboardData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [statsRes, studentsRes] = await Promise.all([
        api.getDashboardStats(),
        api.getStudents().catch(() => ({ students: [] })),
      ]);
      setStats(statsRes.stats);
      setRecentSubmissions(statsRes.recentSubmissions || []);
      setStudents(studentsRes.students || []);
      if (isManualRefresh) {
        toast.success('Console telemetry refreshed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const passRateNum = stats ? Math.min(100, Math.max(0, parseFloat(stats.passRate || '0'))) : 0;
  const avgScoreNum = stats ? Math.min(100, Math.max(0, parseFloat(stats.averageScore || '0'))) : 0;
  const gaugeRadius = 38;
  const gaugeCirc = 2 * Math.PI * gaugeRadius;
  const gaugeOffset = gaugeCirc - (passRateNum / 100) * gaugeCirc;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7 animate-fade-in">
      {/* Executive Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 pb-6 border-b border-[var(--border-hairline)]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded bg-[var(--accent-signal)]/10 text-[var(--accent-signal)] border border-[var(--accent-signal)]/25">
              Faculty Command Console
            </span>
            <span className="font-mono text-[11px] text-[var(--text-tertiary)] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              SYSTEM TELEMETRY LIVE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Administration Overview
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Examination lifecycle, Gemini AI authoring, cohort scoring, and focus-loss integrity auditing.
          </p>
        </div>

        {/* Action Strip */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => fetchDashboardData(true)}
            disabled={loading || refreshing}
            className="btn-ghost-surface px-3.5 py-2 text-xs inline-flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <Link
            to="/admin/submissions"
            className="btn-ghost-surface px-3.5 py-2 text-xs inline-flex items-center gap-1.5"
          >
            <FileCheck className="w-3.5 h-3.5 text-[#0891B2] dark:text-[#22D3EE]" />
            <span>Submissions</span>
          </Link>

          <Link
            to="/admin/logs"
            className="btn-ghost-surface px-3.5 py-2 text-xs inline-flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5 text-amber-500" />
            <span>Proctoring Logs</span>
          </Link>

          <Link
            to="/admin/builder"
            className="btn-signal px-4 py-2 text-xs inline-flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create Exam</span>
          </Link>
        </div>
      </div>

      {/* High-Risk Proctoring Alert Banner */}
      {stats && stats.highRiskAttemptsCount > 0 && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400">
                Integrity Alert: {stats.highRiskAttemptsCount} High-Risk Attempt
                {stats.highRiskAttemptsCount > 1 ? 's' : ''} Flagged
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Candidates exceeded allowed window-blur or tab-switch thresholds during active assessments.
              </p>
            </div>
          </div>
          <Link
            to="/admin/logs"
            className="flex-shrink-0 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 self-start sm:self-auto transition-colors"
          >
            <span>Inspect Audit Trail</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Asymmetric Executive Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Featured 5-Col Cohort Performance Telemetry Card with SVG Ring */}
        <div className="lg:col-span-5 studio-card p-6 flex flex-col justify-between gap-6">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              Cohort Telemetry
            </span>
            <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              {loading ? 'SYNCING' : `${stats?.totalSubmissions ?? 0} GRADED`}
            </span>
          </div>

          <div className="flex items-center gap-6">
            {/* Radial Pass Rate Ring */}
            <div className="relative w-24 h-24 flex-shrink-0 flex items-center justify-center">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 92 92">
                <circle
                  cx="46"
                  cy="46"
                  r={gaugeRadius}
                  strokeWidth="7"
                  fill="none"
                  className="stroke-black/10 dark:stroke-white/10"
                />
                <circle
                  cx="46"
                  cy="46"
                  r={gaugeRadius}
                  strokeWidth="7"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={gaugeCirc}
                  strokeDashoffset={loading ? gaugeCirc : gaugeOffset}
                  className="stroke-emerald-500 transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono text-lg font-bold text-[var(--text-primary)] tabular-nums">
                  {loading ? '—' : `${passRateNum.toFixed(0)}%`}
                </span>
                <span className="font-mono text-[9px] uppercase text-[var(--text-tertiary)]">PASS</span>
              </div>
            </div>

            <div className="flex-1 space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[var(--text-secondary)] flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-emerald-500" />
                    Pass Rate
                  </span>
                  <span className="font-mono font-bold text-[var(--text-primary)] tabular-nums">
                    {loading ? '—' : `${stats?.passRate ?? '0.0'}%`}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-[var(--bg-tray)] overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${passRateNum}%` }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[var(--text-secondary)] flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-[#0891B2] dark:text-[#22D3EE]" />
                    Average Score
                  </span>
                  <span className="font-mono font-bold text-[var(--text-primary)] tabular-nums">
                    {loading ? '—' : `${stats?.averageScore ?? '0.0'}%`}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-[var(--bg-tray)] overflow-hidden">
                  <div
                    className="h-full bg-[#0891B2] dark:bg-[#22D3EE] rounded-full"
                    style={{ width: `${avgScoreNum}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick AI Studio Shortcut */}
          <Link
            to="/admin/builder"
            className="p-3.5 rounded-xl bg-[var(--bg-tray)] hover:bg-[var(--bg-tray)]/80 border border-[var(--border-hairline)] hover:border-[var(--accent-signal)]/40 flex items-center justify-between transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-[var(--accent-signal)]" />
              <div>
                <div className="text-xs font-bold text-[var(--text-primary)]">Gemini Multimodal Studio</div>
                <div className="text-[11px] text-[var(--text-secondary)]">Synthesize exams from syllabus PDFs</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[var(--text-tertiary)] group-hover:translate-x-1 group-hover:text-[var(--accent-signal)] transition-all" />
          </Link>
        </div>

        {/* Right 7-Col Operational KPI Matrix */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="studio-card p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                Total Exams
              </span>
              <BookOpen className="w-4 h-4 text-[var(--accent-signal)]" />
            </div>
            <div className="my-3 font-mono text-3xl font-bold text-[var(--text-primary)] tabular-nums">
              {loading ? '—' : stats?.totalExams ?? 0}
            </div>
            <Link
              to="/admin/exams"
              className="text-xs font-semibold text-[var(--accent-signal)] hover:underline inline-flex items-center gap-1"
            >
              <span>Manage catalog</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="studio-card p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                Published
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="my-3 font-mono text-3xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {loading ? '—' : stats?.publishedExams ?? 0}
            </div>
            <div className="text-[11px] text-[var(--text-secondary)]">Active for candidates</div>
          </div>

          <div className="studio-card p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                Candidates
              </span>
              <Users className="w-4 h-4 text-[#0891B2] dark:text-[#22D3EE]" />
            </div>
            <div className="my-3 font-mono text-3xl font-bold text-[var(--text-primary)] tabular-nums">
              {loading ? '—' : stats?.totalStudents ?? 0}
            </div>
            <button
              type="button"
              onClick={() => setActiveFeedTab('students')}
              className="text-left text-xs font-semibold text-[#0891B2] dark:text-[#22D3EE] hover:underline inline-flex items-center gap-1"
            >
              <span>Inspect roster</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="studio-card p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                Submissions
              </span>
              <FileCheck className="w-4 h-4 text-[var(--text-secondary)]" />
            </div>
            <div className="my-3 font-mono text-3xl font-bold text-[var(--text-primary)] tabular-nums">
              {loading ? '—' : stats?.totalSubmissions ?? 0}
            </div>
            <Link
              to="/admin/submissions"
              className="text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] inline-flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div
            className={`studio-card p-5 col-span-2 flex flex-col justify-between ${
              (stats?.highRiskAttemptsCount ?? 0) > 0 ? 'border-rose-500/40 bg-rose-500/[0.03]' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                Focus-Loss Proctoring Flags
              </span>
              <AlertTriangle
                className={`w-4 h-4 ${
                  (stats?.highRiskAttemptsCount ?? 0) > 0 ? 'text-rose-500' : 'text-[var(--text-tertiary)]'
                }`}
              />
            </div>
            <div className="my-2 flex items-baseline gap-3">
              <span
                className={`font-mono text-3xl font-bold tabular-nums ${
                  (stats?.highRiskAttemptsCount ?? 0) > 0
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-[var(--text-primary)]'
                }`}
              >
                {loading ? '—' : stats?.highRiskAttemptsCount ?? 0}
              </span>
              <span className="text-xs text-[var(--text-secondary)]">
                attempts with {'≥'} 3 focus violations
              </span>
            </div>
            <Link
              to="/admin/logs"
              className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline inline-flex items-center gap-1"
            >
              <span>Open audit logs</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Unified Live Feed: Recent Submissions OR Enrolled Candidates Roster */}
      <div className="studio-card overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-[var(--border-hairline)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="inline-flex p-1 rounded-xl bg-[var(--bg-tray)] border border-[var(--border-hairline)] self-start">
            <button
              type="button"
              onClick={() => setActiveFeedTab('submissions')}
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeFeedTab === 'submissions'
                  ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-hairline)] shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5 text-[var(--accent-signal)]" />
              <span>Recent Submissions ({recentSubmissions.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveFeedTab('students')}
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeFeedTab === 'students'
                  ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-hairline)] shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-[#0891B2] dark:text-[#22D3EE]" />
              <span>Enrolled Students ({students.length})</span>
            </button>
          </div>

          <Link
            to="/admin/submissions"
            className="text-xs font-semibold text-[var(--accent-signal)] hover:underline inline-flex items-center gap-1"
          >
            <span>Open Full Gradebook</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-[var(--text-secondary)]">
            <div className="w-6 h-6 border-2 border-[var(--accent-signal)] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="font-mono text-xs">Loading live telemetry...</p>
          </div>
        ) : activeFeedTab === 'submissions' ? (
          recentSubmissions.length === 0 ? (
            <div className="p-12 text-center text-[var(--text-secondary)]">
              <FileCheck className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-semibold text-[var(--text-primary)]">No submissions recorded yet</p>
              <p className="text-xs mt-0.5">Completed candidate attempts will stream here automatically.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[var(--bg-tray)]/70 font-mono text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-hairline)]">
                  <tr>
                    <th className="px-6 py-3">Candidate</th>
                    <th className="px-6 py-3">Exam</th>
                    <th className="px-6 py-3">Score</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Submitted</th>
                    <th className="px-6 py-3 text-right">Audit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-hairline)]">
                  {recentSubmissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-[var(--bg-tray)]/40 transition-colors">
                      <td className="px-6 py-3.5">
                        <div className="font-semibold text-[var(--text-primary)]">
                          {sub.student?.name || 'Unknown Candidate'}
                        </div>
                        <div className="font-mono text-[11px] text-[var(--text-secondary)] flex items-center gap-2">
                          {sub.student?.studentId && <span>{sub.student.studentId}</span>}
                          <span>{sub.student?.email}</span>
                        </div>
                      </td>

                      <td className="px-6 py-3.5">
                        <div className="font-medium text-[var(--text-primary)]">
                          {sub.exam?.title || 'Examination'}
                        </div>
                        <div className="font-mono text-[11px] text-[var(--text-secondary)]">{sub.exam?.subject}</div>
                      </td>

                      <td className="px-6 py-3.5 font-mono tabular-nums">
                        <div className="font-bold text-[var(--text-primary)]">
                          {sub.score} <span className="text-xs text-[var(--text-tertiary)] font-normal">/ {sub.exam?.totalMarks || 100}</span>
                        </div>
                        <div className="text-[11px] font-semibold text-[#0891B2] dark:text-[#22D3EE]">
                          {sub.percentage?.toFixed(1)}%
                        </div>
                      </td>

                      <td className="px-6 py-3.5">
                        {sub.passed ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded font-mono text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25">
                            <CheckCircle2 className="w-3 h-3" />
                            Passed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded font-mono text-[10px] font-bold uppercase bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/25">
                            <AlertTriangle className="w-3 h-3" />
                            Failed
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-3.5 font-mono text-xs text-[var(--text-secondary)]">
                        {formatDateTime(sub.submittedAt)}
                      </td>

                      <td className="px-6 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedAttemptId(sub.id)}
                          className="btn-ghost-surface px-3 py-1.5 text-xs inline-flex items-center gap-1"
                        >
                          <span>Audit</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-[var(--text-secondary)]">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-semibold text-[var(--text-primary)]">No enrolled students found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[var(--bg-tray)]/70 font-mono text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-hairline)]">
                <tr>
                  <th className="px-6 py-3">Student</th>
                  <th className="px-6 py-3">Student ID</th>
                  <th className="px-6 py-3">Department</th>
                  <th className="px-6 py-3">Submitted Attempts</th>
                  <th className="px-6 py-3">Avg Performance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-hairline)]">
                {students.map((stu) => {
                  const submitted = (stu.attempts || []).filter((a) => a.status === 'SUBMITTED');
                  const avg =
                    submitted.length > 0
                      ? (submitted.reduce((s, a) => s + (a.percentage || 0), 0) / submitted.length).toFixed(1)
                      : '—';
                  const passed = submitted.filter((a) => a.passed).length;

                  return (
                    <tr key={stu.id} className="hover:bg-[var(--bg-tray)]/40 transition-colors">
                      <td className="px-6 py-3.5">
                        <div className="font-semibold text-[var(--text-primary)]">{stu.name}</div>
                        <div className="font-mono text-[11px] text-[var(--text-secondary)]">{stu.email}</div>
                      </td>
                      <td className="px-6 py-3.5 font-mono text-xs text-[var(--text-primary)]">
                        {stu.studentId || '—'}
                      </td>
                      <td className="px-6 py-3.5 text-xs text-[var(--text-secondary)]">
                        {stu.department || 'General'}
                      </td>
                      <td className="px-6 py-3.5 font-mono text-xs tabular-nums">
                        {submitted.length} ({passed} passed)
                      </td>
                      <td className="px-6 py-3.5 font-mono text-xs font-bold text-[#0891B2] dark:text-[#22D3EE] tabular-nums">
                        {avg === '—' ? '—' : `${avg}%`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Submission Audit Modal */}
      <SubmissionDetailModal attemptId={selectedAttemptId} onClose={() => setSelectedAttemptId(null)} />
    </div>
  );
};
