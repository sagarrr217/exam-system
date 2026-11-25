import React, { useEffect, useState } from 'react';
import {
  Eye,
  Search,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  Activity,
} from 'lucide-react';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { Exam, FocusLossLog } from '../../types';
import { formatDateTime } from '../../components/admin/adminUtils';
import { SubmissionDetailModal } from '../../components/admin/SubmissionDetailModal';

export const FocusLossLogsPage: React.FC = () => {
  const toast = useToast();
  const [logs, setLogs] = useState<FocusLossLog[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState<
    'ALL' | 'WINDOW_BLUR' | 'VISIBILITY_HIDDEN' | 'WINDOW_RESIZE'
  >('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await api.getAdminExams();
        setExams(res.exams || []);
      } catch (err: any) {
        console.error('Failed to load exams', err);
      }
    };
    fetchExams();
  }, []);

  const fetchLogs = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await api.getFocusLossLogs(selectedExamId || undefined);
      setLogs(res.logs || []);
      if (isManual) toast.success('Proctoring logs refreshed');
    } catch (err: any) {
      toast.error(err.message || 'Failed to load focus-loss audit logs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedExamId]);

  const totalIncidents = logs.length;
  const blurEvents = logs.filter((l) => l.eventType === 'WINDOW_BLUR').length;
  const tabSwitches = logs.filter((l) => l.eventType === 'VISIBILITY_HIDDEN').length;

  const filteredLogs = logs.filter((log) => {
    const candidateName = log.attempt?.student?.name || '';
    const candidateEmail = log.attempt?.student?.email || '';
    const candidateId = log.attempt?.student?.studentId || '';
    const examTitle = log.attempt?.exam?.title || '';

    const matchesSearch =
      candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidateEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidateId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      examTitle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      eventTypeFilter === 'ALL' ||
      (eventTypeFilter === 'WINDOW_BLUR' && log.eventType === 'WINDOW_BLUR') ||
      (eventTypeFilter === 'VISIBILITY_HIDDEN' && log.eventType === 'VISIBILITY_HIDDEN') ||
      (eventTypeFilter === 'WINDOW_RESIZE' && log.eventType === 'WINDOW_RESIZE');

    return matchesSearch && matchesType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[var(--border-hairline)]">
        <div className="space-y-1.5">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25">
            Integrity Sentinel
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
            Proctoring & Focus-Loss Audit
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Real-time audit log of window blurs, tab visibility switches, and session anomalies.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchLogs(true)}
          disabled={loading || refreshing}
          className="btn-ghost-surface px-3.5 py-2 text-xs inline-flex items-center gap-1.5 disabled:opacity-50 self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Telemetry Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="studio-card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-signal)]/10 text-[var(--accent-signal)] flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="font-mono text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
              Total Recorded Incidents
            </div>
            <div className="font-mono text-2xl font-bold text-[var(--text-primary)] tabular-nums">
              {loading ? '—' : totalIncidents}
            </div>
          </div>
        </div>

        <div className="studio-card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#0891B2]/10 dark:bg-[#22D3EE]/10 text-[#0891B2] dark:text-[#22D3EE] flex items-center justify-center">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <div className="font-mono text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
              Window Blur Events
            </div>
            <div className="font-mono text-2xl font-bold text-[#0891B2] dark:text-[#22D3EE] tabular-nums">
              {loading ? '—' : blurEvents}
            </div>
          </div>
        </div>

        <div className="studio-card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="font-mono text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
              Tab Switches / Hidden
            </div>
            <div className="font-mono text-2xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">
              {loading ? '—' : tabSwitches}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="studio-card p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <select
              aria-label="Filter logs by exam"
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
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
              aria-label="Search audit logs"
              placeholder="Search candidate or exam..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs bg-[var(--bg-tray)] focus:bg-[var(--bg-surface)] border border-[var(--border-hairline)] focus:border-[var(--border-strong)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none transition-all"
            />
          </div>
        </div>

        <div className="inline-flex p-1 rounded-xl bg-[var(--bg-tray)] border border-[var(--border-hairline)]">
          {(
            [
              { id: 'ALL', label: 'All Types', color: 'text-[var(--text-primary)]' },
              {
                id: 'WINDOW_BLUR',
                label: `Blur (${blurEvents})`,
                color: 'text-[#0891B2] dark:text-[#22D3EE]',
              },
              {
                id: 'VISIBILITY_HIDDEN',
                label: `Hidden (${tabSwitches})`,
                color: 'text-amber-600 dark:text-amber-400',
              },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setEventTypeFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                eventTypeFilter === f.id
                  ? `bg-[var(--bg-surface)] ${f.color} border border-[var(--border-hairline)] shadow-sm`
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Incident Table */}
      <div className="studio-card overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-[var(--text-secondary)]">
            <div className="w-6 h-6 border-2 border-[var(--accent-signal)] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="font-mono text-xs">Loading proctoring audit logs...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-16 text-center text-[var(--text-secondary)]">
            <Eye className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <h3 className="text-sm font-bold text-[var(--text-primary)]">No incident logs found</h3>
            <p className="text-xs max-w-sm mx-auto mt-1">
              {searchQuery || eventTypeFilter !== 'ALL' || selectedExamId
                ? 'No proctoring logs matched your active query.'
                : 'Any detected focus loss, tab switch, or window blur will be recorded here.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[var(--bg-tray)]/70 font-mono text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-hairline)]">
                <tr>
                  <th className="px-6 py-3.5">Timestamp</th>
                  <th className="px-4 py-3.5">Event Type</th>
                  <th className="px-4 py-3.5">Candidate</th>
                  <th className="px-4 py-3.5">Examination</th>
                  <th className="px-4 py-3.5">Duration</th>
                  <th className="px-4 py-3.5">Details</th>
                  <th className="px-6 py-3.5 text-right">Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-hairline)]">
                {filteredLogs.map((log) => {
                  let badgeClass =
                    'bg-[#0891B2]/10 dark:bg-[#22D3EE]/10 text-[#0891B2] dark:text-[#22D3EE] border-[#0891B2]/25 dark:border-[#22D3EE]/25';
                  if (log.eventType === 'VISIBILITY_HIDDEN') {
                    badgeClass =
                      'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25';
                  } else if (log.eventType === 'WINDOW_RESIZE') {
                    badgeClass =
                      'bg-[var(--bg-tray)] text-[var(--text-secondary)] border-[var(--border-hairline)]';
                  }

                  return (
                    <tr key={log.id} className="hover:bg-[var(--bg-tray)]/40 transition-colors">
                      <td className="px-6 py-3.5 whitespace-nowrap font-mono text-xs text-[var(--text-secondary)]">
                        {formatDateTime(log.timestamp)}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded font-mono text-[10px] font-bold border ${badgeClass}`}
                        >
                          {log.eventType}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-[var(--text-primary)]">
                          {log.attempt?.student?.name || 'Unknown Student'}
                        </div>
                        <div className="font-mono text-[11px] text-[var(--text-secondary)] flex items-center gap-1.5 mt-0.5">
                          {log.attempt?.student?.studentId && (
                            <span className="bg-[var(--bg-tray)] px-1 py-0.5 rounded text-[10px]">
                              {log.attempt.student.studentId}
                            </span>
                          )}
                          <span>{log.attempt?.student?.email}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 max-w-xs">
                        <div className="font-medium text-[var(--text-primary)] truncate">
                          {log.attempt?.exam?.title || 'Examination'}
                        </div>
                        <div className="font-mono text-[10px] text-[var(--text-tertiary)]">
                          Threshold: {log.attempt?.exam?.focusLossThreshold || 3} incidents
                        </div>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs text-[var(--text-secondary)]">
                        {log.durationSeconds != null ? `${log.durationSeconds}s away` : '—'}
                      </td>

                      <td className="px-4 py-3.5 text-xs text-[var(--text-secondary)] max-w-xs truncate">
                        {log.details || 'Window focus departed'}
                      </td>

                      <td className="px-6 py-3.5 whitespace-nowrap text-right">
                        {log.attemptId ? (
                          <button
                            type="button"
                            onClick={() => setSelectedAttemptId(log.attemptId)}
                            className="btn-ghost-surface px-3 py-1.5 text-xs inline-flex items-center gap-1"
                          >
                            <span>Inspect</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className="text-[var(--text-tertiary)]">—</span>
                        )}
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
