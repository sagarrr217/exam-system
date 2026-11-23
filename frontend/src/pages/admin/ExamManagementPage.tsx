import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  PlusCircle, 
  Search, 
  Filter, 
  Edit3, 
  Copy, 
  Trash2, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Award, 
  FileQuestion, 
  Users, 
  ExternalLink,
  RefreshCw,
  Globe,
  Lock
} from 'lucide-react';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { Exam } from '../../types';
import { downloadExamCsv, formatDuration } from '../../components/admin/adminUtils';
import { ExamDeleteModal } from '../../components/admin/ExamDeleteModal';

export const ExamManagementPage: React.FC = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');
  
  // Action Loading States
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [examToDelete, setExamToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchExams = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await api.getAdminExams();
      setExams(res.exams || []);
      if (isManualRefresh) toast.success('Exam list refreshed');
    } catch (err: any) {
      toast.error(err.message || 'Failed to load examinations');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  // Toggle Publish
  const handleTogglePublish = async (exam: Exam) => {
    setActionLoadingId(exam.id);
    try {
      const res = await api.togglePublish(exam.id);
      setExams((prev) =>
        prev.map((e) => (e.id === exam.id ? { ...e, isPublished: res.isPublished } : e))
      );
      toast.success(res.message || (res.isPublished ? 'Exam published!' : 'Exam unpublished.'));
    } catch (err: any) {
      toast.error(err.message || 'Failed to toggle publication status');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Duplicate Exam
  const handleDuplicate = async (exam: Exam) => {
    setActionLoadingId(exam.id);
    try {
      const res = await api.duplicateExam(exam.id);
      toast.success(res.message || `Exam duplicated as "${res.exam?.title}"`);
      await fetchExams();
    } catch (err: any) {
      toast.error(err.message || 'Failed to duplicate examination');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Export CSV
  const handleExportCsv = async (exam: Exam) => {
    setActionLoadingId(exam.id);
    try {
      await downloadExamCsv(exam.id, exam.title);
      toast.success(`Candidate results exported for "${exam.title}"`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to export CSV results');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete Exam
  const handleConfirmDelete = async () => {
    if (!examToDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteExam(examToDelete.id);
      toast.success('Examination deleted successfully');
      setExams((prev) => prev.filter((e) => e.id !== examToDelete.id));
      setExamToDelete(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete examination');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtering
  const filteredExams = exams.filter((exam) => {
    const matchesSearch =
      exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.subject.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'PUBLISHED' && exam.isPublished) ||
      (statusFilter === 'DRAFT' && !exam.isPublished);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/20">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Exam Management
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Create, configure, publish, duplicate, and audit examinations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchExams(true)}
            disabled={loading || refreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <Link
            to="/admin/builder"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 transition-all hover:shadow"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Exam</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'ALL'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All ({exams.length})
          </button>
          <button
            onClick={() => setStatusFilter('PUBLISHED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'PUBLISHED'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Published ({exams.filter((e) => e.isPublished).length})
          </button>
          <button
            onClick={() => setStatusFilter('DRAFT')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'DRAFT'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Drafts ({exams.filter((e) => !e.isPublished).length})
          </button>
        </div>
      </div>

      {/* Exam Table / Cards */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm font-medium">Loading examinations...</p>
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="p-16 text-center text-slate-500">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40 text-slate-400" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No examinations found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
              {searchQuery || statusFilter !== 'ALL'
                ? 'No examinations matched your active search or filter criteria.'
                : 'Get started by creating your first exam using the Google Forms-inspired question builder.'}
            </p>
            <Link
              to="/admin/builder"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Exam</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/70 dark:bg-slate-800/50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">Examination</th>
                  <th className="px-4 py-4">Duration</th>
                  <th className="px-4 py-4">Marks (Pass / Total)</th>
                  <th className="px-4 py-4">Questions</th>
                  <th className="px-4 py-4">Attempts</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredExams.map((exam) => {
                  const isActionBusy = actionLoadingId === exam.id;
                  const questionCount = exam._count?.questions ?? (exam.questions ? exam.questions.length : 0);
                  const attemptCount = exam._count?.attempts ?? 0;

                  return (
                    <tr
                      key={exam.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Title & Subject */}
                      <td className="px-6 py-4 max-w-xs">
                        <div className="font-bold text-slate-900 dark:text-white leading-snug">
                          {exam.title}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                          <span className="font-medium text-blue-600 dark:text-blue-400">{exam.subject}</span>
                          {exam.description && (
                            <span className="truncate max-w-[160px] text-slate-400">
                              • {exam.description}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Duration */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatDuration(exam.durationMinutes)}</span>
                        </div>
                      </td>

                      {/* Marks */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Award className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-bold text-slate-900 dark:text-white">
                            {exam.passingMarks}
                          </span>
                          <span className="text-slate-400">/</span>
                          <span className="font-semibold text-slate-600 dark:text-slate-300">
                            {exam.totalMarks}
                          </span>
                        </div>
                      </td>

                      {/* Questions Count */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                          <FileQuestion className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-bold">{questionCount}</span>
                          <span className="text-slate-400">item{questionCount === 1 ? '' : 's'}</span>
                        </div>
                      </td>

                      {/* Attempts Count */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Link
                          to={`/admin/submissions?examId=${exam.id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 group"
                        >
                          <Users className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                          <span>{attemptCount}</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        {exam.isPublished ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                            <Globe className="w-3 h-3" />
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                            <Lock className="w-3 h-3" />
                            Draft
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-1">
                          {/* Toggle Publish */}
                          <button
                            onClick={() => handleTogglePublish(exam)}
                            disabled={isActionBusy}
                            title={exam.isPublished ? 'Unpublish Examination' : 'Publish Examination'}
                            className={`p-2 rounded-xl text-xs font-semibold transition-colors ${
                              exam.isPublished
                                ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                                : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                            }`}
                          >
                            {exam.isPublished ? (
                              <Lock className="w-4 h-4" />
                            ) : (
                              <Globe className="w-4 h-4" />
                            )}
                          </button>

                          {/* Edit / Builder */}
                          <Link
                            to={`/admin/builder/${exam.id}`}
                            title="Edit Questions & Settings in Builder"
                            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>

                          {/* Duplicate */}
                          <button
                            onClick={() => handleDuplicate(exam)}
                            disabled={isActionBusy}
                            title="Duplicate Examination"
                            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          {/* Export CSV */}
                          <button
                            onClick={() => handleExportCsv(exam)}
                            disabled={isActionBusy}
                            title="Export Results to CSV"
                            className="p-2 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors disabled:opacity-50"
                          >
                            <Download className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setExamToDelete({ id: exam.id, title: exam.title })}
                            disabled={isActionBusy}
                            title="Delete Examination"
                            className="p-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ExamDeleteModal
        exam={examToDelete}
        isOpen={Boolean(examToDelete)}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setExamToDelete(null)}
      />
    </div>
  );
};
