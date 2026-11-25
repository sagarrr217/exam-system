import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Eye,
  Download,
  BarChart3,
  CheckCircle2,
  XCircle,
  ShieldAlert,
} from 'lucide-react';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { Exam } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { TableRowSkeleton } from '../../components/ui/Skeleton';
import { SubmissionDetailModal } from '../../components/admin/SubmissionDetailModal';
import { downloadExamCsv, formatDateTime } from '../../components/admin/adminUtils';

export const SubmissionsReviewPage: React.FC = () => {
  const toast = useToast();

  const [submissions, setSubmissions] = useState<any[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [inspectAttemptId, setInspectAttemptId] = useState<string | null>(null);

  const loadData = async (examIdFilter?: string) => {
    setLoading(true);
    try {
      const [subsRes, examsRes] = await Promise.all([
        api.getSubmissions(examIdFilter || undefined),
        api.getAdminExams(),
      ]);
      setSubmissions(subsRes.submissions || []);
      setExams(examsRes.exams || []);
    } catch (err: any) {
      toast.error(err?.message || 'Unable to load candidate submissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedExamId);
  }, [selectedExamId]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return submissions;
    const q = searchQuery.toLowerCase();
    return submissions.filter((s) => {
      const name = (s.student?.name || '').toLowerCase();
      const email = (s.student?.email || '').toLowerCase();
      const examTitle = (s.exam?.title || '').toLowerCase();
      return name.includes(q) || email.includes(q) || examTitle.includes(q);
    });
  }, [submissions, searchQuery]);

  // Cohort Score Distribution Buckets
  const buckets = useMemo(() => {
    const counts = [
      { label: '0–39%', count: 0, color: 'bg-rose-500' },
      { label: '40–59%', count: 0, color: 'bg-amber-500' },
      { label: '60–79%', count: 0, color: 'bg-blue-500' },
      { label: '80–100%', count: 0, color: 'bg-emerald-500' },
    ];
    filtered.forEach((s) => {
      const pct = Number(s.percentage ?? 0);
      if (pct < 40) counts[0].count += 1;
      else if (pct < 60) counts[1].count += 1;
      else if (pct < 80) counts[2].count += 1;
      else counts[3].count += 1;
    });
    const maxCount = Math.max(1, ...counts.map((c) => c.count));
    return counts.map((c) => ({ ...c, pctWidth: Math.round((c.count / maxCount) * 100) }));
  }, [filtered]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Badge variant="brand">Evaluation &amp; Gradebook</Badge>
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Submissions Review
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Inspect detailed candidate answer sheets alongside focus-loss counts and export structured CSVs.
          </p>
        </div>

        {selectedExamId && (
          <Button
            variant="secondary"
            size="md"
            onClick={() => {
              const ex = exams.find((e) => e.id === selectedExamId);
              downloadExamCsv(selectedExamId, ex?.title || 'exam-results');
            }}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export Filtered CSV
          </Button>
        )}
      </header>

      {/* Filters & Histogram */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Filter Controls */}
        <div className="lg:col-span-5 ui-card p-5 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="sub-exam-filter" className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Filter by Assessment
            </label>
            <select
              id="sub-exam-filter"
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="w-full min-h-[44px] px-3.5 rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-canvas)] text-sm text-[var(--text-primary)]"
            >
              <option value="">All Assessments</option>
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.title}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="sub-search" className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Search Candidate
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
              <input
                id="sub-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Name, email, or assessment..."
                className="w-full min-h-[44px] pl-10 pr-4 rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-canvas)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
              />
            </div>
          </div>
        </div>

        {/* Score Distribution Chart */}
        <div className="lg:col-span-7 ui-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[var(--accent-primary)]" aria-hidden="true" />
              Cohort Score Distribution ({filtered.length} submissions)
            </h2>
          </div>

          <div className="space-y-2.5">
            {buckets.map((b) => (
              <div key={b.label} className="flex items-center gap-3 text-xs">
                <span className="w-16 font-mono font-semibold text-[var(--text-secondary)] shrink-0">
                  {b.label}
                </span>
                <div className="flex-1 h-4 rounded-full bg-[var(--bg-tray)] overflow-hidden">
                  <div
                    className={`h-full rounded-full ${b.color} transition-all duration-300`}
                    style={{ width: `${b.pctWidth}%` }}
                  />
                </div>
                <span className="w-8 text-right font-mono font-bold text-[var(--text-primary)]">
                  {b.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      {loading ? (
        <TableRowSkeleton rows={5} />
      ) : filtered.length === 0 ? (
        <div className="ui-card p-10 text-center text-sm text-[var(--text-secondary)]">
          No candidate submissions match your current filters.
        </div>
      ) : (
        <div className="ui-card overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-default)] bg-[var(--bg-tray)]/50 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                <th className="py-3.5 px-6">Candidate</th>
                <th className="py-3.5 px-6">Assessment</th>
                <th className="py-3.5 px-6">Score</th>
                <th className="py-3.5 px-6">Outcome</th>
                <th className="py-3.5 px-6">Focus Alerts</th>
                <th className="py-3.5 px-6">Submitted At</th>
                <th className="py-3.5 px-6 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-default)] text-sm">
              {filtered.map((sub: any) => (
                <tr key={sub.id} className="hover:bg-[var(--bg-tray)]/40 transition-colors">
                  <td className="py-4 px-6">
                    <p className="font-semibold text-[var(--text-primary)]">{sub.student?.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{sub.student?.email}</p>
                  </td>
                  <td className="py-4 px-6 font-medium text-[var(--text-primary)]">
                    {sub.exam?.title}
                  </td>
                  <td className="py-4 px-6 font-mono font-bold text-[var(--text-primary)]">
                    {sub.score ?? 0} / {sub.exam?.totalMarks ?? 0}{' '}
                    <span className="text-[var(--text-muted)] font-normal">
                      ({Math.round(Number(sub.percentage ?? 0))}%)
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <Badge
                      variant={sub.passed ? 'success' : 'danger'}
                      icon={sub.passed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    >
                      {sub.passed ? 'Passed' : 'Failed'}
                    </Badge>
                  </td>
                  <td className="py-4 px-6">
                    <Badge
                      variant={(sub.focusLossCount ?? 0) > 0 ? 'warning' : 'neutral'}
                      icon={<ShieldAlert className="w-3.5 h-3.5" />}
                    >
                      {sub.focusLossCount ?? 0}
                    </Badge>
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
      )}

      <SubmissionDetailModal
        attemptId={inspectAttemptId}
        onClose={() => setInspectAttemptId(null)}
      />
    </div>
  );
};
