import React, { useEffect, useMemo, useState } from 'react';
import { Search, ShieldAlert, AlertTriangle, Clock } from 'lucide-react';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { Exam } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { TableRowSkeleton } from '../../components/ui/Skeleton';
import { formatDateTime } from '../../components/admin/adminUtils';

export const FocusLossLogsPage: React.FC = () => {
  const toast = useToast();

  const [logs, setLogs] = useState<any[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const [logsRes, examsRes] = await Promise.all([
          api.getFocusLossLogs(selectedExamId || undefined),
          api.getAdminExams(),
        ]);
        if (active) {
          setLogs(logsRes.logs || []);
          setExams(examsRes.exams || []);
        }
      } catch (err: any) {
        if (active) toast.error(err?.message || 'Unable to load integrity telemetry logs.');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [selectedExamId]);

  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return logs;
    const q = searchQuery.toLowerCase();
    return logs.filter((l) => {
      const studentName = (l.attempt?.student?.name || l.student?.name || '').toLowerCase();
      const examTitle = (l.attempt?.exam?.title || l.exam?.title || '').toLowerCase();
      const details = (l.details || l.eventType || '').toLowerCase();
      return studentName.includes(q) || examTitle.includes(q) || details.includes(q);
    });
  }, [logs, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <header className="space-y-1">
        <Badge variant="warning" icon={<ShieldAlert className="w-3.5 h-3.5" />}>
          Proctoring Audit Trail
        </Badge>
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
          Focus-Loss &amp; Security Logs
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Timestamped ledger of tab switches, window blurs, and fullscreen exits across candidate sessions.
        </p>
      </header>

      {/* Filters */}
      <div className="ui-card p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="log-exam-select" className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Filter by Assessment
          </label>
          <select
            id="log-exam-select"
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
          <label htmlFor="log-search" className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Search Events
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
            <input
              id="log-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student, exam, or event details..."
              className="w-full min-h-[44px] pl-10 pr-4 rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-canvas)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <TableRowSkeleton rows={5} />
      ) : filteredLogs.length === 0 ? (
        <div className="ui-card p-10 text-center space-y-2">
          <ShieldAlert className="w-10 h-10 text-[var(--accent-success)] mx-auto" />
          <p className="text-base font-bold text-[var(--text-primary)]">Zero Focus Alerts</p>
          <p className="text-sm text-[var(--text-secondary)]">
            No proctoring focus-loss incidents match the active filter.
          </p>
        </div>
      ) : (
        <div className="ui-card overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-default)] bg-[var(--bg-tray)]/50 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                <th className="py-3.5 px-6">Timestamp</th>
                <th className="py-3.5 px-6">Candidate</th>
                <th className="py-3.5 px-6">Assessment</th>
                <th className="py-3.5 px-6">Event Type</th>
                <th className="py-3.5 px-6">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-default)] text-sm">
              {filteredLogs.map((log: any, idx: number) => {
                const student = log.attempt?.student || log.student || {};
                const exam = log.attempt?.exam || log.exam || {};
                return (
                  <tr key={log.id || idx} className="hover:bg-[var(--bg-tray)]/40 transition-colors">
                    <td className="py-4 px-6 font-mono text-xs text-[var(--text-muted)] whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                        {formatDateTime(log.timestamp || log.createdAt)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-semibold text-[var(--text-primary)]">
                        {student.name || 'Candidate'}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {student.studentId || student.email}
                      </p>
                    </td>
                    <td className="py-4 px-6 font-medium text-[var(--text-primary)]">
                      {exam.title || 'Assessment'}
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant="warning" icon={<AlertTriangle className="w-3.5 h-3.5" />}>
                        {log.eventType || 'FOCUS_LOSS'}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-[var(--text-secondary)]">
                      {log.details || 'Focus left active viewport'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
