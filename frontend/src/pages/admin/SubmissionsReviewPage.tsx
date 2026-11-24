import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  ShieldAlert, 
  ExternalLink,
  RefreshCw,
  FileCheck,
  ChevronDown
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

  // Load Exams for dropdown filter
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

  // Fetch Submissions
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
      // If none selected, default to first exam
      const firstId = exams[0].id;
      setExporting(true);
      try {
        await downloadExamCsv(firstId, exams[0].title);
        toast.success(`Exported CSV for "${exams[0].title}"`);
      } catch (err: any) {
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

  // Filter Submissions
  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch =
      sub.student?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.student?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sub.student?.studentId && sub.student.studentId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      sub.exam?.title?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'PASSED' && sub.passed) ||
      (statusFilter === 'FAILED' && !sub.passed);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center shadow-sm">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">
              Candidate Submissions & Grading
            </h1>
            <p className="text-xs text-[#86868b]">
              Candidate assessments, autograded scoring, and proctoring audit trail
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchSubmissions(true)}
            disabled={loading || refreshing}
            className="apple-btn-secondary px-3.5 py-1.5 text-xs flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportCsv}
            disabled={exporting || (submissions.length === 0 && !selectedExamId)}
            className="apple-btn-primary px-4 py-1.5 text-xs flex items-center gap-1.5 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{exporting ? 'Exporting...' : 'Export Results'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="apple-card p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Exam Filter Dropdown & Search */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
          <div className="relative w-full sm:w-60">
            <select
              value={selectedExamId}
              onChange={(e) => handleExamFilterChange(e.target.value)}
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

          {/* Search Candidate */}
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868b]" />
            <input
              type="text"
              placeholder="Search candidate name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 rounded-full text-xs bg-black/5 dark:bg-white/10 border border-transparent focus:border-black/10 dark:focus:border-white/20 text-[#1d1d1f] dark:text-[#f5f5f7] placeholder-[#86868b] focus:outline-none focus:bg-white dark:focus:bg-[#1c1c1e] transition-all"
            />
          </div>
        </div>

        {/* Right: Pass / Fail Filter iOS Segmented Buttons */}
        <div className="inline-flex p-1 rounded-full bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/5">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all ${
              statusFilter === 'ALL'
                ? 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-white shadow-sm'
                : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white'
            }`}
          >
            All ({submissions.length})
          </button>
          <button
            onClick={() => setStatusFilter('PASSED')}
            className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all ${
              statusFilter === 'PASSED'
                ? 'bg-white dark:bg-[#2c2c2e] text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white'
            }`}
          >
            Passed ({submissions.filter((s) => s.passed).length})
          </button>
          <button
            onClick={() => setStatusFilter('FAILED')}
            className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all ${
              statusFilter === 'FAILED'
                ? 'bg-white dark:bg-[#2c2c2e] text-[#ff3b30] dark:text-[#ff453a] shadow-sm'
                : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white'
            }`}
          >
            Failed ({submissions.filter((s) => !s.passed).length})
          </button>
        </div>
      </div>

      {/* Submissions Roster Table */}
      <div className="apple-card overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-[#86868b]">
            <div className="w-6 h-6 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs">Loading candidate submissions...</p>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="p-16 text-center text-[#86868b]">
            <FileCheck className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#86868b]" />
            <h3 className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">No submissions found</h3>
            <p className="text-xs text-[#86868b] max-w-sm mx-auto mt-1">
              {searchQuery || statusFilter !== 'ALL' || selectedExamId
                ? 'No candidate submissions matched your active filters.'
                : 'Completed assessments will appear here once submitted.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-black/[0.02] dark:bg-white/[0.02] text-[10px] font-semibold text-[#86868b] uppercase tracking-wider border-b border-black/5 dark:border-white/10">
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
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {filteredSubmissions.map((sub) => {
                  const focusLossCount = sub._count?.focusLossLogs ?? (sub.focusLossLogs ? sub.focusLossLogs.length : 0);
                  const threshold = sub.exam?.focusLossThreshold || 3;
                  const isHighRisk = focusLossCount >= threshold;

                  return (
                    <tr
                      key={sub.id}
                      className="hover:bg-black/[0.015] dark:hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Candidate */}
                      <td className="px-6 py-3.5">
                        <div className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                          {sub.student?.name || 'Unknown Candidate'}
                        </div>
                        <div className="text-[11px] text-[#86868b] flex items-center gap-2 mt-0.5">
                          {sub.student?.studentId && (
                            <span className="font-mono bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded text-[10px]">
                              {sub.student.studentId}
                            </span>
                          )}
                          <span>{sub.student?.email}</span>
                        </div>
                      </td>

                      {/* Examination */}
                      <td className="px-4 py-3.5 max-w-xs">
                        <div className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7] truncate">
                          {sub.exam?.title || 'Examination'}
                        </div>
                        <div className="text-[11px] text-[#86868b]">
                          {sub.exam?.subject}
                        </div>
                      </td>

                      {/* Score */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                          {sub.score} <span className="text-xs text-[#86868b] font-normal">/ {sub.exam?.totalMarks || 100}</span>
                        </div>
                        <div className="text-[11px] font-semibold text-[#0071e3] dark:text-[#0a84ff]">
                          {sub.percentage?.toFixed(1)}%
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {sub.passed ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            Passed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
                            <AlertCircle className="w-3 h-3" />
                            Failed
                          </span>
                        )}
                      </td>

                      {/* Answered Count */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-xs">
                        <div className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
                          {sub.totalAnswered} answered
                        </div>
                        {sub.totalUnanswered > 0 && (
                          <div className="text-[11px] text-amber-600 dark:text-amber-400">
                            {sub.totalUnanswered} unanswered
                          </div>
                        )}
                      </td>

                      {/* Proctoring Risk */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {isHighRisk ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
                            <ShieldAlert className="w-3 h-3" />
                            High Risk ({focusLossCount})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium text-[#86868b] bg-black/5 dark:bg-white/10">
                            {focusLossCount} {focusLossCount === 1 ? 'incident' : 'incidents'}
                          </span>
                        )}
                      </td>

                      {/* Submitted At */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-xs text-[#86868b]">
                        {formatDateTime(sub.submittedAt)}
                      </td>

                      {/* Action */}
                      <td className="px-6 py-3.5 whitespace-nowrap text-right">
                        <button
                          onClick={() => setSelectedAttemptId(sub.id)}
                          className="apple-btn-secondary px-3 py-1 text-xs inline-flex items-center gap-1"
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

      {/* Submission Audit Modal */}
      <SubmissionDetailModal
        attemptId={selectedAttemptId}
        onClose={() => setSelectedAttemptId(null)}
      />
    </div>
  );
};
