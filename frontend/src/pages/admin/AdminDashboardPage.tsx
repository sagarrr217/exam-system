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
  ShieldAlert
} from 'lucide-react';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { DashboardStats } from '../../types';
import { formatDateTime } from '../../components/admin/adminUtils';
import { SubmissionDetailModal } from '../../components/admin/SubmissionDetailModal';

export const AdminDashboardPage: React.FC = () => {
  const toast = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);

  const fetchDashboardData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await api.getDashboardStats();
      setStats(res.stats);
      setRecentSubmissions(res.recentSubmissions || []);
      if (isManualRefresh) {
        toast.success('Dashboard metrics refreshed');
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/20">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Administrator Dashboard
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Examination metrics, candidate oversight, and integrity audit console
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={loading || refreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <Link
            to="/admin/builder"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 transition-all hover:shadow"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Exam</span>
          </Link>

          <Link
            to="/admin/submissions"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-100 transition-colors"
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>View Submissions</span>
          </Link>

          <Link
            to="/admin/logs"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 hover:bg-amber-100 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Proctoring Logs</span>
          </Link>
        </div>
      </div>

      {/* High-Risk Incident Alert Banner (if any detected) */}
      {stats && stats.highRiskAttemptsCount > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 flex items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-rose-600/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-rose-900 dark:text-rose-200">
                Proctoring Alert: {stats.highRiskAttemptsCount} High-Risk Attempt{stats.highRiskAttemptsCount > 1 ? 's' : ''} Flagged
              </h3>
              <p className="text-xs text-rose-700 dark:text-rose-300">
                Candidates have repeatedly switched tabs or lost window focus during examinations exceeding security thresholds.
              </p>
            </div>
          </div>
          <Link
            to="/admin/logs"
            className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-colors"
          >
            <span>Review Logs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Exams */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Exams</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {loading ? '—' : stats?.totalExams ?? 0}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <Link to="/admin/exams" className="text-blue-600 hover:underline flex items-center gap-0.5 font-medium">
              <span>View catalog</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Card 2: Published Exams */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Published Exams</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {loading ? '—' : stats?.publishedExams ?? 0}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Active for candidate access
          </div>
        </div>

        {/* Card 3: Total Students */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Students</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {loading ? '—' : stats?.totalStudents ?? 0}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Registered student accounts
          </div>
        </div>

        {/* Card 4: Total Submissions */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Submissions</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {loading ? '—' : stats?.totalSubmissions ?? 0}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Completed examinations
          </div>
        </div>

        {/* Card 5: Pass Rate (%) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pass Rate</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {loading ? '—' : `${stats?.passRate ?? '0.0'}%`}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Candidates meeting passing marks
          </div>
        </div>

        {/* Card 6: Average Score */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Score</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {loading ? '—' : `${stats?.averageScore ?? '0.0'}%`}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Overall cohort performance
          </div>
        </div>

        {/* Card 7: High Risk Attempts Count */}
        <div className={`p-5 rounded-2xl border shadow-sm col-span-2 sm:col-span-2 lg:col-span-2 ${
          (stats?.highRiskAttemptsCount ?? 0) > 0
            ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Integrity & Proctoring Alerts
            </span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              (stats?.highRiskAttemptsCount ?? 0) > 0
                ? 'bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-3">
            <div className={`text-2xl sm:text-3xl font-black ${
              (stats?.highRiskAttemptsCount ?? 0) > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
            }`}>
              {loading ? '—' : stats?.highRiskAttemptsCount ?? 0}
            </div>
            <span className="text-xs text-slate-500">
              attempt{(stats?.highRiskAttemptsCount ?? 0) === 1 ? '' : 's'} with {'>='} 3 focus loss violations
            </span>
          </div>
          <div className="text-xs mt-2">
            <Link to="/admin/logs" className="text-rose-600 dark:text-rose-400 font-semibold hover:underline flex items-center gap-1">
              <span>Inspect focus loss logs</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Submissions Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Submissions</h2>
            <p className="text-xs text-slate-500">Latest completed student evaluations</p>
          </div>
          <Link
            to="/admin/submissions"
            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs">Loading recent submissions...</p>
          </div>
        ) : recentSubmissions.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <FileCheck className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No submissions recorded yet</p>
            <p className="text-xs text-slate-500 mt-1">Student submissions will appear here once examinations are completed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/70 dark:bg-slate-800/50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Candidate</th>
                  <th className="px-6 py-3.5">Exam</th>
                  <th className="px-6 py-3.5">Score</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Submitted</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentSubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {sub.student?.name || 'Unknown Student'}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2">
                        {sub.student?.studentId && <span className="font-mono">{sub.student.studentId}</span>}
                        <span>{sub.student?.email}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {sub.exam?.title || 'Examination'}
                      </div>
                      <div className="text-xs text-slate-500">
                        {sub.exam?.subject}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {sub.score} <span className="text-xs text-slate-500 font-normal">/ {sub.exam?.totalMarks || 100}</span>
                      </div>
                      <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                        {sub.percentage?.toFixed(1)}%
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {sub.passed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                          <CheckCircle2 className="w-3 h-3" />
                          Passed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300">
                          <AlertTriangle className="w-3 h-3" />
                          Failed
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-xs font-mono text-slate-500">
                      {formatDateTime(sub.submittedAt)}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedAttemptId(sub.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
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
