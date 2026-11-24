import React, { useEffect, useState } from 'react';
import { 
  Eye, 
  Search, 
  ShieldAlert, 
  AlertTriangle, 
  RefreshCw,
  ExternalLink,
  ChevronDown,
  Activity
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
  const [eventTypeFilter, setEventTypeFilter] = useState<'ALL' | 'WINDOW_BLUR' | 'VISIBILITY_HIDDEN' | 'WINDOW_RESIZE'>('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);

  // Load Exams for dropdown filter
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

  // Fetch Focus Loss Logs
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

  // Aggregate stats
  const totalIncidents = logs.length;
  const blurEvents = logs.filter((l) => l.eventType === 'WINDOW_BLUR').length;
  const tabSwitches = logs.filter((l) => l.eventType === 'VISIBILITY_HIDDEN').length;

  // Filter logs
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center shadow-sm">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">
              Proctoring & Focus-Loss Audit
            </h1>
            <p className="text-xs text-[#86868b]">
              Real-time audit log of window blurs, tab switches, and security incidents
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchLogs(true)}
            disabled={loading || refreshing}
            className="apple-btn-secondary px-3.5 py-1.5 text-xs flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Logs</span>
          </button>
        </div>
      </div>

      {/* Aggregate Stats Mini Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="apple-card p-4 flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-semibold text-[#86868b] uppercase tracking-wider">Total Recorded Incidents</div>
            <div className="text-xl sm:text-2xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
              {loading ? '—' : totalIncidents}
            </div>
          </div>
        </div>

        <div className="apple-card p-4 flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-[#0071e3] dark:text-[#0a84ff] flex items-center justify-center">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-semibold text-[#86868b] uppercase tracking-wider">Window Blur Events</div>
            <div className="text-xl sm:text-2xl font-bold text-[#0071e3] dark:text-[#0a84ff]">
              {loading ? '—' : blurEvents}
            </div>
          </div>
        </div>

        <div className="apple-card p-4 flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-[#ff9500] dark:text-[#ff9f0a] flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-semibold text-[#86868b] uppercase tracking-wider">Tab Switches / Hidden</div>
            <div className="text-xl sm:text-2xl font-bold text-[#ff9500] dark:text-[#ff9f0a]">
              {loading ? '—' : tabSwitches}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="apple-card p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Exam Filter & Search */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
          {/* Exam Filter */}
          <div className="relative w-full sm:w-60">
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="w-full appearance-none pl-3.5 pr-8 py-1.5 rounded-full text-xs font-medium bg-black/5 dark:bg-white/10 border border-transparent focus:border-black/10 dark:focus:border-white/20 text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none"
            >
              <option value="">All Examinations ({exams.length})</option>
              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.title}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-[#86868b] pointer-events-none" />
          </div>

          {/* Search Query */}
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#86868b]" />
            <input
              type="text"
              placeholder="Search candidate or exam..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 rounded-full text-xs bg-black/5 dark:bg-white/10 border border-transparent focus:border-black/10 dark:focus:border-white/20 text-[#1d1d1f] dark:text-[#f5f5f7] placeholder-[#86868b] focus:outline-none focus:bg-white dark:focus:bg-[#1c1c1e] transition-all"
            />
          </div>
        </div>

        {/* Right: Event Type iOS Segmented Filters */}
        <div className="inline-flex p-1 rounded-full bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/5">
          <button
            onClick={() => setEventTypeFilter('ALL')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              eventTypeFilter === 'ALL'
                ? 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-white shadow-sm'
                : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white'
            }`}
          >
            All Types
          </button>
          <button
            onClick={() => setEventTypeFilter('WINDOW_BLUR')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              eventTypeFilter === 'WINDOW_BLUR'
                ? 'bg-white dark:bg-[#2c2c2e] text-purple-600 dark:text-purple-400 shadow-sm'
                : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white'
            }`}
          >
            Blur ({blurEvents})
          </button>
          <button
            onClick={() => setEventTypeFilter('VISIBILITY_HIDDEN')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              eventTypeFilter === 'VISIBILITY_HIDDEN'
                ? 'bg-white dark:bg-[#2c2c2e] text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white'
            }`}
          >
            Hidden ({tabSwitches})
          </button>
        </div>
      </div>

      {/* Incident Audit Table */}
      <div className="apple-card overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-[#86868b]">
            <div className="w-6 h-6 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs">Loading proctoring audit logs...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-16 text-center text-[#86868b]">
            <Eye className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#86868b]" />
            <h3 className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">No incident logs found</h3>
            <p className="text-xs text-[#86868b] max-w-sm mx-auto mt-1">
              {searchQuery || eventTypeFilter !== 'ALL' || selectedExamId
                ? 'No proctoring logs matched your active query.'
                : 'Any detected focus loss, tab switch, or window blur will be recorded here.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-black/[0.02] dark:bg-white/[0.02] text-[10px] font-semibold text-[#86868b] uppercase tracking-wider border-b border-black/5 dark:border-white/10">
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
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {filteredLogs.map((log) => {
                  let badgeClass = 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20';
                  if (log.eventType === 'VISIBILITY_HIDDEN') {
                    badgeClass = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20';
                  } else if (log.eventType === 'WINDOW_RESIZE') {
                    badgeClass = 'bg-black/5 dark:bg-white/10 text-[#86868b] border border-black/5 dark:border-white/10';
                  }

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-black/[0.015] dark:hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Timestamp */}
                      <td className="px-6 py-3.5 whitespace-nowrap text-xs text-[#86868b]">
                        {formatDateTime(log.timestamp)}
                      </td>

                      {/* Event Type Badge */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${badgeClass}`}>
                          {log.eventType}
                        </span>
                      </td>

                      {/* Candidate */}
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                          {log.attempt?.student?.name || 'Unknown Student'}
                        </div>
                        <div className="text-[11px] text-[#86868b] flex items-center gap-1.5 mt-0.5">
                          {log.attempt?.student?.studentId && (
                            <span className="font-mono bg-black/5 dark:bg-white/10 px-1 py-0.5 rounded text-[10px]">
                              {log.attempt.student.studentId}
                            </span>
                          )}
                          <span>{log.attempt?.student?.email}</span>
                        </div>
                      </td>

                      {/* Examination */}
                      <td className="px-4 py-3.5 max-w-xs">
                        <div className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7] truncate">
                          {log.attempt?.exam?.title || 'Examination'}
                        </div>
                        <div className="text-[10px] text-[#86868b]">
                          Threshold: {log.attempt?.exam?.focusLossThreshold || 3} incidents
                        </div>
                      </td>

                      {/* Duration */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-xs text-[#86868b]">
                        {log.durationSeconds != null ? `${log.durationSeconds}s away` : '—'}
                      </td>

                      {/* Details */}
                      <td className="px-4 py-3.5 text-xs text-[#86868b] max-w-xs truncate">
                        {log.details || 'Window focus departed'}
                      </td>

                      {/* Audit Action */}
                      <td className="px-6 py-3.5 whitespace-nowrap text-right">
                        {log.attemptId ? (
                          <button
                            onClick={() => setSelectedAttemptId(log.attemptId)}
                            className="apple-btn-secondary px-3 py-1 text-xs inline-flex items-center gap-1"
                          >
                            <span>Inspect</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className="text-[#86868b]">—</span>
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

      {/* Submission Audit Modal */}
      <SubmissionDetailModal
        attemptId={selectedAttemptId}
        onClose={() => setSelectedAttemptId(null)}
      />
    </div>
  );
};
