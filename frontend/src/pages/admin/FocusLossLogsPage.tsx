import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Eye, 
  Search, 
  Filter, 
  ShieldAlert, 
  AlertTriangle, 
  Clock, 
  User, 
  BookOpen, 
  RefreshCw,
  ExternalLink,
  ChevronDown,
  Activity,
  Layers
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
    const studentName = log.attempt?.student?.name?.toLowerCase() || '';
    const studentId = log.attempt?.student?.studentId?.toLowerCase() || '';
    const studentEmail = log.attempt?.student?.email?.toLowerCase() || '';
    const examTitle = log.attempt?.exam?.title?.toLowerCase() || '';
    const details = log.details?.toLowerCase() || '';
    const q = searchQuery.toLowerCase();

    const matchesSearch =
      studentName.includes(q) ||
      studentId.includes(q) ||
      studentEmail.includes(q) ||
      examTitle.includes(q) ||
      details.includes(q);

    const matchesType = eventTypeFilter === 'ALL' || log.eventType === eventTypeFilter;

    return matchesSearch && matchesType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/20">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Proctoring Audit Logs
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              System-wide real-time tracking of candidate browser focus loss and tab switches
            </p>
          </div>
        </div>

        {/* Refresh Action */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchLogs(true)}
            disabled={loading || refreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Logs</span>
          </button>
        </div>
      </div>

      {/* Aggregate Stats Mini-Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Recorded Incidents</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {loading ? '—' : totalIncidents}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Window Blur Events</div>
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
              {loading ? '—' : blurEvents}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tab Switches / Hidden</div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {loading ? '—' : tabSwitches}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Exam Filter & Search */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Exam Filter */}
          <div className="relative w-full sm:w-64">
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="w-full appearance-none pl-3.5 pr-8 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-200"
            >
              <option value="">All Examinations ({exams.length})</option>
              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.title}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Search Query */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search candidate or exam..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-200"
            />
          </div>
        </div>

        {/* Right: Event Type Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto justify-end">
          <button
            onClick={() => setEventTypeFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              eventTypeFilter === 'ALL'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Types
          </button>
          <button
            onClick={() => setEventTypeFilter('WINDOW_BLUR')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              eventTypeFilter === 'WINDOW_BLUR'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Blur ({blurEvents})
          </button>
          <button
            onClick={() => setEventTypeFilter('VISIBILITY_HIDDEN')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              eventTypeFilter === 'VISIBILITY_HIDDEN'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Tab Hidden ({tabSwitches})
          </button>
        </div>
      </div>

      {/* Incident Audit Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm font-medium">Loading proctoring audit logs...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-16 text-center text-slate-500">
            <Eye className="w-10 h-10 mx-auto mb-3 opacity-40 text-slate-400" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No incident logs found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {searchQuery || eventTypeFilter !== 'ALL' || selectedExamId
                ? 'No proctoring logs matched your active search or filter criteria.'
                : 'Any detected focus loss, tab switch, or window blur will be recorded here.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/70 dark:bg-slate-800/50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-4 py-4">Event Type</th>
                  <th className="px-4 py-4">Candidate</th>
                  <th className="px-4 py-4">Examination</th>
                  <th className="px-4 py-4">Duration</th>
                  <th className="px-4 py-4">Details</th>
                  <th className="px-6 py-4 text-right">Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLogs.map((log) => {
                  let badgeClass = 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300';
                  if (log.eventType === 'VISIBILITY_HIDDEN') {
                    badgeClass = 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300';
                  } else if (log.eventType === 'WINDOW_RESIZE') {
                    badgeClass = 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
                  }

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Timestamp */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-slate-600 dark:text-slate-300">
                        {formatDateTime(log.timestamp)}
                      </td>

                      {/* Event Type Badge */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${badgeClass}`}>
                          {log.eventType}
                        </span>
                      </td>

                      {/* Candidate */}
                      <td className="px-4 py-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {log.attempt?.student?.name || 'Unknown Student'}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                          {log.attempt?.student?.studentId && (
                            <span className="font-mono">{log.attempt.student.studentId}</span>
                          )}
                          <span>{log.attempt?.student?.email}</span>
                        </div>
                      </td>

                      {/* Examination */}
                      <td className="px-4 py-4 max-w-xs">
                        <div className="font-medium text-slate-800 dark:text-slate-200 truncate">
                          {log.attempt?.exam?.title || 'Examination'}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Threshold: {log.attempt?.exam?.focusLossThreshold || 3} incidents
                        </div>
                      </td>

                      {/* Duration */}
                      <td className="px-4 py-4 whitespace-nowrap text-xs text-slate-600 dark:text-slate-400">
                        {log.durationSeconds != null ? `${log.durationSeconds}s away` : '—'}
                      </td>

                      {/* Details */}
                      <td className="px-4 py-4 text-xs text-slate-600 dark:text-slate-400 max-w-xs truncate">
                        {log.details || 'Browser window blurred or tab hidden'}
                      </td>

                      {/* Audit Action */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {log.attemptId ? (
                          <button
                            onClick={() => setSelectedAttemptId(log.attemptId)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                          >
                            <span>Inspect</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-700">—</span>
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
