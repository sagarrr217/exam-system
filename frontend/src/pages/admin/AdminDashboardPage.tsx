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
  Sparkles
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7 animate-fade-in">
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center shadow-sm">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">
              Administration Center
            </h1>
            <p className="text-xs text-[#86868b]">
              Examination lifecycle, candidate oversight, and integrity audit console
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={loading || refreshing}
            className="apple-btn-secondary px-3.5 py-1.5 text-xs flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <Link
            to="/admin/builder"
            className="apple-btn-primary px-4 py-1.5 text-xs flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create Exam</span>
          </Link>

          <Link
            to="/admin/submissions"
            className="apple-btn-secondary px-3.5 py-1.5 text-xs flex items-center gap-1.5"
          >
            <FileCheck className="w-3.5 h-3.5 text-purple-500" />
            <span>Submissions</span>
          </Link>

          <Link
            to="/admin/logs"
            className="apple-btn-secondary px-3.5 py-1.5 text-xs flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5 text-amber-500" />
            <span>Proctoring</span>
          </Link>
        </div>
      </div>

      {/* High-Risk Incident Alert Banner */}
      {stats && stats.highRiskAttemptsCount > 0 && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#ff3b30] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-[#ff3b30] dark:text-[#ff453a]">
                Proctoring Alert: {stats.highRiskAttemptsCount} High-Risk Attempt{stats.highRiskAttemptsCount > 1 ? 's' : ''} Flagged
              </h3>
              <p className="text-[11px] text-[#86868b] leading-tight">
                Candidates have repeatedly switched tabs or lost window focus exceeding security thresholds.
              </p>
            </div>
          </div>
          <Link
            to="/admin/logs"
            className="flex-shrink-0 apple-btn-primary bg-[#ff3b30] hover:bg-[#ff453a] px-3 py-1.5 text-xs flex items-center gap-1"
          >
            <span>Review</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* Apple Bento Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Exams */}
        <div className="apple-card p-5">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[10px] font-semibold text-[#86868b] uppercase tracking-wider">Total Exams</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-[#0071e3] dark:text-[#0a84ff] flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
            {loading ? '—' : stats?.totalExams ?? 0}
          </div>
          <div className="text-[11px] text-[#86868b] mt-1">
            <Link to="/admin/exams" className="text-[#0071e3] dark:text-[#0a84ff] hover:underline flex items-center gap-0.5 font-medium">
              <span>View catalog</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Card 2: Published Exams */}
        <div className="apple-card p-5">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[10px] font-semibold text-[#86868b] uppercase tracking-wider">Published</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#34c759] dark:text-[#30d158]">
            {loading ? '—' : stats?.publishedExams ?? 0}
          </div>
          <div className="text-[11px] text-[#86868b] mt-1">
            Live for student candidates
          </div>
        </div>

        {/* Card 3: Total Students */}
        <div className="apple-card p-5">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[10px] font-semibold text-[#86868b] uppercase tracking-wider">Candidates</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
            {loading ? '—' : stats?.totalStudents ?? 0}
          </div>
          <div className="text-[11px] text-[#86868b] mt-1">
            Active student rosters
          </div>
        </div>

        {/* Card 4: Total Submissions */}
        <div className="apple-card p-5">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[10px] font-semibold text-[#86868b] uppercase tracking-wider">Submissions</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
            {loading ? '—' : stats?.totalSubmissions ?? 0}
          </div>
          <div className="text-[11px] text-[#86868b] mt-1">
            Graded assessments
          </div>
        </div>

        {/* Card 5: Pass Rate (%) */}
        <div className="apple-card p-5">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[10px] font-semibold text-[#86868b] uppercase tracking-wider">Pass Rate</span>
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
            {loading ? '—' : `${stats?.passRate ?? '0.0'}%`}
          </div>
          <div className="text-[11px] text-[#86868b] mt-1">
            Meeting passing criteria
          </div>
        </div>

        {/* Card 6: Average Score */}
        <div className="apple-card p-5">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[10px] font-semibold text-[#86868b] uppercase tracking-wider">Average Score</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
            {loading ? '—' : `${stats?.averageScore ?? '0.0'}%`}
          </div>
          <div className="text-[11px] text-[#86868b] mt-1">
            Cohort aggregate average
          </div>
        </div>

        {/* Card 7: High Risk Attempts Count */}
        <div className={`apple-card p-5 col-span-2 sm:col-span-2 lg:col-span-2 ${(stats?.highRiskAttemptsCount ?? 0) > 0 ? 'border-rose-500/30' : ''
          }`}>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#86868b]">
              Integrity & Proctoring Alerts
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${(stats?.highRiskAttemptsCount ?? 0) > 0
              ? 'bg-rose-500/10 text-[#ff3b30]'
              : 'bg-black/5 dark:bg-white/10 text-[#86868b]'
              }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2.5">
            <div className={`text-2xl sm:text-3xl font-bold ${(stats?.highRiskAttemptsCount ?? 0) > 0 ? 'text-[#ff3b30] dark:text-[#ff453a]' : 'text-[#1d1d1f] dark:text-[#f5f5f7]'
              }`}>
              {loading ? '—' : stats?.highRiskAttemptsCount ?? 0}
            </div>
            <span className="text-xs text-[#86868b]">
              attempts with {'>='} 3 recorded focus violations
            </span>
          </div>
          <div className="text-xs mt-1.5">
            <Link to="/admin/logs" className="text-[#ff3b30] dark:text-[#ff453a] font-medium hover:underline flex items-center gap-1">
              <span>Inspect audit trail</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Submissions Section */}
      <div className="apple-card overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">Recent Submissions</h2>
            <p className="text-xs text-[#86868b]">Latest candidate assessments</p>
          </div>
          <Link
            to="/admin/submissions"
            className="text-xs font-semibold text-[#0071e3] dark:text-[#0a84ff] hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-[#86868b]">
            <div className="w-6 h-6 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs">Loading submissions...</p>
          </div>
        ) : recentSubmissions.length === 0 ? (
          <div className="p-12 text-center text-[#86868b]">
            <FileCheck className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">No submissions recorded yet</p>
            <p className="text-[11px] text-[#86868b] mt-0.5">Completed assessments will stream here automatically.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-black/[0.02] dark:bg-white/[0.02] text-[10px] font-semibold text-[#86868b] uppercase tracking-wider border-b border-black/5 dark:border-white/10">
                <tr>
                  <th className="px-6 py-3">Candidate</th>
                  <th className="px-6 py-3">Exam</th>
                  <th className="px-6 py-3">Score</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Submitted</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {recentSubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-black/[0.015] dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                        {sub.student?.name || 'Unknown Candidate'}
                      </div>
                      <div className="text-[11px] text-[#86868b] flex items-center gap-2">
                        {sub.student?.studentId && <span className="font-mono">{sub.student.studentId}</span>}
                        <span>{sub.student?.email}</span>
                      </div>
                    </td>

                    <td className="px-6 py-3.5">
                      <div className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
                        {sub.exam?.title || 'Examination'}
                      </div>
                      <div className="text-[11px] text-[#86868b]">
                        {sub.exam?.subject}
                      </div>
                    </td>

                    <td className="px-6 py-3.5">
                      <div className="font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                        {sub.score} <span className="text-xs text-[#86868b] font-normal">/ {sub.exam?.totalMarks || 100}</span>
                      </div>
                      <div className="text-[11px] font-semibold text-[#0071e3] dark:text-[#0a84ff]">
                        {sub.percentage?.toFixed(1)}%
                      </div>
                    </td>

                    <td className="px-6 py-3.5">
                      {sub.passed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          Passed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
                          <AlertTriangle className="w-3 h-3" />
                          Failed
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-3.5 text-xs text-[#86868b]">
                      {formatDateTime(sub.submittedAt)}
                    </td>

                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => setSelectedAttemptId(sub.id)}
                        className="apple-btn-secondary px-3 py-1 text-xs inline-flex items-center gap-1"
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
