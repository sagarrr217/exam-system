import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Users,
  GraduationCap,
  ShieldAlert,
  Plus,
  ArrowRight,
  Eye,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { DashboardStats } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton, TableRowSkeleton } from '../../components/ui/Skeleton';
import { SubmissionDetailModal } from '../../components/admin/SubmissionDetailModal';
import { formatDateTime } from '../../components/admin/adminUtils';
import { cn } from '../../components/ui/cn';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'submissions' | 'students'>('submissions');

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [inspectAttemptId, setInspectAttemptId] = useState<string | null>(null);

  const loadDashboard = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [statsRes, studentsRes] = await Promise.all([
        api.getDashboardStats(),
        api.getStudents(),
      ]);
      setStats(statsRes.stats);
      setRecentSubmissions(statsRes.recentSubmissions || []);
      setStudents(studentsRes.students || []);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to load dashboard telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const kpis = [
    {
      label: 'Total Exams',
      value: stats?.totalExams ?? 0,
      icon: FileText,
      tone: 'text-[var(--accent-primary)] bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800',
      action: () => navigate('/admin/exams'),
    },
    {
      label: 'Submissions',
      value: stats?.totalSubmissions ?? 0,
      icon: GraduationCap,
      tone: 'text-[var(--accent-secondary)] bg-teal-50 dark:bg-teal-950/60 border-teal-200 dark:border-teal-800',
      action: () => navigate('/admin/submissions'),
    },
    {
      label: 'Enrolled Students',
      value: stats?.totalStudents ?? students.length,
      icon: Users,
      tone: 'text-[var(--accent-success)] bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
      action: () => setActiveTab('students'),
    },
    {
      label: 'Flagged Attempts',
      value: stats?.highRiskAttemptsCount ?? 0,
      icon: ShieldAlert,
      tone: 'text-[var(--accent-warning)] bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800',
      action: () => navigate('/admin/logs'),
    },
  ];

  const passRate = stats?.passRate
    ? Math.round(parseFloat(stats.passRate))
    : recentSubmissions.length > 0
    ? Math.round(
        (recentSubmissions.filter((s) => s.passed).length / recentSubmissions.length) * 100
      )
    : 100;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="brand">Administrator Console</Badge>
            <Badge variant="success" icon={<CheckCircle2 className="w-3.5 h-3.5" />}>
              {passRate}% Pass Integrity
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Cohort Overview
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Welcome back, {user?.name || 'Administrator'}. Monitor submissions, active assessments, and focus logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate('/admin/exams')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Manage Exams
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/admin/builder')}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            New Exam
          </Button>
        </div>
      </header>

      {/* KPI Row */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-[16px]" />
          ))}
        </div>
      ) : errorMsg ? (
        <div className="ui-card p-8 text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-[var(--accent-danger)] mx-auto" />
          <p className="text-sm text-[var(--text-secondary)]">{errorMsg}</p>
          <Button variant="primary" size="md" onClick={loadDashboard} leftIcon={<RotateCcw className="w-4 h-4" />}>
            Retry
          </Button>
        </div>
      ) : (
        <>
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi) => {
              const Icon = kpi.icon;
              return (
                <button
                  key={kpi.label}
                  type="button"
                  onClick={kpi.action}
                  className="ui-card ui-card-hover p-5 text-left flex items-center justify-between gap-4 focus-visible:outline-2 focus-visible:outline-[var(--accent-primary)]"
                >
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                      {kpi.label}
                    </p>
                    <p className="mt-1 text-3xl font-mono font-extrabold tabular-nums text-[var(--text-primary)]">
                      {kpi.value}
                    </p>
                  </div>
                  <div className={cn('w-12 h-12 rounded-[12px] border flex items-center justify-center shrink-0', kpi.tone)}>
                    <Icon className="w-6 h-6" aria-hidden="true" />
                  </div>
                </button>
              );
            })}
          </section>

          {/* Submissions vs Students Table Panel */}
          <section className="ui-card overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--border-default)] flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex p-1 rounded-[12px] bg-[var(--bg-tray)] border border-[var(--border-default)]">
                <button
                  type="button"
                  onClick={() => setActiveTab('submissions')}
                  className={cn(
                    'min-h-[44px] px-4 rounded-[10px] text-sm font-semibold transition-colors',
                    activeTab === 'submissions'
                      ? 'bg-[var(--bg-surface)] text-[var(--accent-primary)] shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  )}
                >
                  Recent Submissions ({recentSubmissions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('students')}
                  className={cn(
                    'min-h-[44px] px-4 rounded-[10px] text-sm font-semibold transition-colors',
                    activeTab === 'students'
                      ? 'bg-[var(--bg-surface)] text-[var(--accent-primary)] shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  )}
                >
                  Enrolled Students ({students.length})
                </button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  navigate(activeTab === 'submissions' ? '/admin/submissions' : '/admin/logs')
                }
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {activeTab === 'submissions' ? 'All Submissions' : 'Proctoring Logs'}
              </Button>
            </div>

            {activeTab === 'submissions' ? (
              recentSubmissions.length === 0 ? (
                <div className="p-10 text-center text-sm text-[var(--text-secondary)]">
                  No candidate submissions recorded yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[var(--border-default)] bg-[var(--bg-tray)]/50 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                        <th className="py-3.5 px-6">Candidate</th>
                        <th className="py-3.5 px-6">Assessment</th>
                        <th className="py-3.5 px-6">Score</th>
                        <th className="py-3.5 px-6">Strikes</th>
                        <th className="py-3.5 px-6">Submitted</th>
                        <th className="py-3.5 px-6 text-right">Transcript</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-default)] text-sm">
                      {recentSubmissions.map((sub: any) => (
                        <tr key={sub.id} className="hover:bg-[var(--bg-tray)]/40 transition-colors">
                          <td className="py-4 px-6">
                            <p className="font-semibold text-[var(--text-primary)]">
                              {sub.student?.name || 'Candidate'}
                            </p>
                            <p className="text-xs text-[var(--text-muted)]">
                              {sub.student?.studentId || sub.student?.email}
                            </p>
                          </td>
                          <td className="py-4 px-6 font-medium text-[var(--text-primary)]">
                            {sub.exam?.title || 'Assessment'}
                          </td>
                          <td className="py-4 px-6">
                            <Badge variant={sub.passed ? 'success' : 'warning'}>
                              {Math.round(Number(sub.percentage ?? 0))}% · {sub.passed ? 'Passed' : 'Review'}
                            </Badge>
                          </td>
                          <td className="py-4 px-6 font-mono font-semibold text-[var(--text-secondary)]">
                            {sub.focusLossCount ?? 0}
                          </td>
                          <td className="py-4 px-6 text-xs font-mono text-[var(--text-muted)]">
                            {formatDateTime(sub.submittedAt || sub.startedAt)}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setInspectAttemptId(sub.id)}
                              leftIcon={<Eye className="w-4 h-4" />}
                            >
                              Inspect
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : students.length === 0 ? (
              <div className="p-10 text-center text-sm text-[var(--text-secondary)]">
                No registered students found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border-default)] bg-[var(--bg-tray)]/50 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      <th className="py-3.5 px-6">Student</th>
                      <th className="py-3.5 px-6">Roll ID</th>
                      <th className="py-3.5 px-6">Department</th>
                      <th className="py-3.5 px-6">Attempts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-default)] text-sm">
                    {students.map((st: any) => (
                      <tr key={st.id} className="hover:bg-[var(--bg-tray)]/40 transition-colors">
                        <td className="py-4 px-6">
                          <p className="font-semibold text-[var(--text-primary)]">{st.name}</p>
                          <p className="text-xs text-[var(--text-muted)]">{st.email}</p>
                        </td>
                        <td className="py-4 px-6 font-mono text-xs text-[var(--text-secondary)]">
                          {st.studentId || '—'}
                        </td>
                        <td className="py-4 px-6 text-[var(--text-secondary)]">
                          {st.department || 'General'}
                        </td>
                        <td className="py-4 px-6 font-mono font-semibold text-[var(--text-primary)]">
                          {st._count?.examAttempts ?? 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      {loading && <TableRowSkeleton rows={3} />}

      <SubmissionDetailModal
        attemptId={inspectAttemptId}
        onClose={() => setInspectAttemptId(null)}
      />
    </div>
  );
};
