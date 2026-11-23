import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Download, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  ShieldAlert, 
  Calendar, 
  Award, 
  ExternalLink,
  RefreshCw,
  Eye,
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
      if (isManual) toast.success('Submissions list refreshed');
    } catch (err: any) {
      toast.error(err.message || 'Failed to load submissions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [selectedExamId]);

  // Handle Exam Selection Change
  const handleExamFilterChange = (newExamId: string) => {
    setSelectedExamId(newExamId);
    if (newExamId) {
      setSearchParams({ examId: newExamId });
    } else {
      setSearchParams({});
    }
  };

  // Export CSV for selected or first available exam
  const handleExportCsv = async () => {
    const targetExamId = selectedExamId || (submissions.length > 0 ? submissions[0].examId : null);
    if (!targetExamId) {
      toast.warning('Please select an examination to export results.');
      return;
    }
    const targetExam = exams.find((e) => e.id === targetExamId);
    const examTitle = targetExam ? targetExam.title : 'examination';

    setExporting(true);
    try {
      await downloadExamCsv(targetExamId, examTitle);
      toast.success(`Exported candidate results for "${examTitle}"`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to export CSV results');
    } finally {
      setExporting(false);
    }
  };

  // Filter submissions by candidate search and pass/fail status
  const filteredSubmissions = submissions.filter((sub) => {
    const studentName = sub.student?.name?.toLowerCase() || '';
    const studentId = sub.student?.studentId?.toLowerCase() || '';
    const studentEmail = sub.student?.email?.toLowerCase() || '';
    const examTitle = sub.exam?.title?.toLowerCase() || '';
    const q = searchQuery.toLowerCase();

    const matchesSearch =
      studentName.includes(q) ||
      studentId.includes(q) ||
      studentEmail.includes(q) ||
      examTitle.includes(q);

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
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/20">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Candidate Submissions & Grading
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Review completed student evaluations, question responses, and proctoring metrics
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchSubmissions(true)}
            disabled={loading || refreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportCsv}
            disabled={exporting || (submissions.length === 0 && !selectedExamId)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 transition-all hover:shadow disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{exporting ? 'Exporting...' : 'Export Results (CSV)'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Exam Filter Dropdown */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <select
              value={selectedExamId}
              onChange={(e) => handleExamFilterChange(e.target.value)}
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

          {/* Search Candidate */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search candidate name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-200"
            />
          </div>
        </div>

        {/* Right: Pass / Fail Filter Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'ALL'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All ({submissions.length})
          </button>
          <button
            onClick={() => setStatusFilter('PASSED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'PASSED'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Passed ({submissions.filter((s) => s.passed).length})
          </button>
          <button
            onClick={() => setStatusFilter('FAILED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'FAILED'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Failed ({submissions.filter((s) => !s.passed).length})
          </button>
        </div>
      </div>

      {/* Submissions Roster Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm font-medium">Loading candidate submissions...</p>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="p-16 text-center text-slate-500">
            <FileCheck className="w-10 h-10 mx-auto mb-3 opacity-40 text-slate-400" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No submissions found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {searchQuery || statusFilter !== 'ALL' || selectedExamId
                ? 'No candidate submissions matched your active filters.'
                : 'Submissions will appear here once students complete examinations.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/70 dark:bg-slate-800/50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">Candidate</th>
                  <th className="px-4 py-4">Examination</th>
                  <th className="px-4 py-4">Score</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Answered</th>
                  <th className="px-4 py-4">Proctoring Risk</th>
                  <th className="px-4 py-4">Submitted At</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredSubmissions.map((sub) => {
                  const focusLossCount = sub._count?.focusLossLogs ?? (sub.focusLossLogs ? sub.focusLossLogs.length : 0);
                  const threshold = sub.exam?.focusLossThreshold || 3;
                  const isHighRisk = focusLossCount >= threshold;

                  return (
                    <tr
                      key={sub.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Candidate */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {sub.student?.name || 'Unknown Candidate'}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          {sub.student?.studentId && (
                            <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">
                              {sub.student.studentId}
                            </span>
                          )}
                          <span>{sub.student?.email}</span>
                        </div>
                      </td>

                      {/* Examination */}
                      <td className="px-4 py-4 max-w-xs">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {sub.exam?.title || 'Examination'}
                        </div>
                        <div className="text-xs text-slate-500">
                          {sub.exam?.subject}
                        </div>
                      </td>

                      {/* Score */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {sub.score} <span className="text-xs text-slate-400 font-normal">/ {sub.exam?.totalMarks || 100}</span>
                        </div>
                        <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                          {sub.percentage?.toFixed(1)}%
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        {sub.passed ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Passed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Failed
                          </span>
                        )}
                      </td>

                      {/* Answered Count */}
                      <td className="px-4 py-4 whitespace-nowrap text-xs">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {sub.totalAnswered} answered
                        </div>
                        {sub.totalUnanswered > 0 && (
                          <div className="text-[11px] text-amber-600 dark:text-amber-400">
                            {sub.totalUnanswered} unanswered
                          </div>
                        )}
                      </td>

                      {/* Proctoring Risk */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        {isHighRisk ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            High Risk ({focusLossCount})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800">
                            {focusLossCount} {focusLossCount === 1 ? 'incident' : 'incidents'}
                          </span>
                        )}
                      </td>

                      {/* Submitted At */}
                      <td className="px-4 py-4 whitespace-nowrap text-xs font-mono text-slate-500">
                        {formatDateTime(sub.submittedAt)}
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => setSelectedAttemptId(sub.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition-colors"
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
