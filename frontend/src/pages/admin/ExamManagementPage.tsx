import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  PlusCircle, 
  Search, 
  Edit3, 
  Copy, 
  Trash2, 
  Download, 
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
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#0071e3] to-[#409cff] text-white flex items-center justify-center shadow-sm">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">
              Exam Management
            </h1>
            <p className="text-xs text-[#86868b]">
              Configure curriculum, question palettes, publishing states, and exports
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchExams(true)}
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
            <span>Create New Exam</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="apple-card p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Apple Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868b]" />
          <input
            type="text"
            placeholder="Search by title or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 rounded-full text-xs sm:text-sm bg-black/5 dark:bg-white/10 border border-transparent focus:border-black/10 dark:focus:border-white/20 text-[#1d1d1f] dark:text-[#f5f5f7] placeholder-[#86868b] focus:outline-none focus:bg-white dark:focus:bg-[#1c1c1e] transition-all"
          />
        </div>

        {/* Status Filters - iOS Segmented Bar */}
        <div className="inline-flex p-1 rounded-full bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/5">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all ${
              statusFilter === 'ALL'
                ? 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-white shadow-sm'
                : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white'
            }`}
          >
            All ({exams.length})
          </button>
          <button
            onClick={() => setStatusFilter('PUBLISHED')}
            className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all ${
              statusFilter === 'PUBLISHED'
                ? 'bg-white dark:bg-[#2c2c2e] text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white'
            }`}
          >
            Published ({exams.filter((e) => e.isPublished).length})
          </button>
          <button
            onClick={() => setStatusFilter('DRAFT')}
            className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all ${
              statusFilter === 'DRAFT'
                ? 'bg-white dark:bg-[#2c2c2e] text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white'
            }`}
          >
            Drafts ({exams.filter((e) => !e.isPublished).length})
          </button>
        </div>
      </div>

      {/* Exam Table / Cards */}
      <div className="apple-card overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-[#86868b]">
            <div className="w-6 h-6 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs">Loading examinations...</p>
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="p-16 text-center text-[#86868b]">
            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#86868b]" />
            <h3 className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">No examinations found</h3>
            <p className="text-xs text-[#86868b] max-w-sm mx-auto mt-1 mb-4">
              {searchQuery || statusFilter !== 'ALL'
                ? 'No examinations matched your active query.'
                : 'Get started by creating your first exam with all 7 question formats.'}
            </p>
            <Link
              to="/admin/builder"
              className="apple-btn-primary px-4 py-2 text-xs inline-flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create New Exam</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-black/[0.02] dark:bg-white/[0.02] text-[10px] font-semibold text-[#86868b] uppercase tracking-wider border-b border-black/5 dark:border-white/10">
                <tr>
                  <th className="px-6 py-3.5">Examination</th>
                  <th className="px-4 py-3.5">Duration</th>
                  <th className="px-4 py-3.5">Marks (Pass / Total)</th>
                  <th className="px-4 py-3.5">Questions</th>
                  <th className="px-4 py-3.5">Attempts</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {filteredExams.map((exam) => {
                  const isActionBusy = actionLoadingId === exam.id;
                  const questionCount = exam._count?.questions ?? (exam.questions ? exam.questions.length : 0);
                  const attemptCount = exam._count?.attempts ?? 0;

                  return (
                    <tr
                      key={exam.id}
                      className="hover:bg-black/[0.015] dark:hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Title & Subject */}
                      <td className="px-6 py-3.5 max-w-xs">
                        <div className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] leading-snug">
                          {exam.title}
                        </div>
                        <div className="text-[11px] text-[#86868b] mt-0.5 flex items-center gap-2">
                          <span className="font-medium text-[#0071e3] dark:text-[#0a84ff]">{exam.subject}</span>
                          {exam.description && (
                            <span className="truncate max-w-[160px] text-[#86868b]">
                              • {exam.description}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Duration */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs text-[#1d1d1f] dark:text-[#f5f5f7]">
                          <Clock className="w-3.5 h-3.5 text-[#86868b]" />
                          <span>{formatDuration(exam.durationMinutes)}</span>
                        </div>
                      </td>

                      {/* Marks */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-xs">
                          <Award className="w-3.5 h-3.5 text-[#86868b]" />
                          <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                            {exam.passingMarks}
                          </span>
                          <span className="text-[#86868b]">/</span>
                          <span className="text-[#86868b]">
                            {exam.totalMarks}
                          </span>
                        </div>
                      </td>

                      {/* Questions Count */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-xs text-[#1d1d1f] dark:text-[#f5f5f7]">
                          <FileQuestion className="w-3.5 h-3.5 text-[#86868b]" />
                          <span className="font-semibold">{questionCount}</span>
                          <span className="text-[#86868b]">items</span>
                        </div>
                      </td>

                      {/* Attempts Count */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <Link
                          to={`/admin/submissions?examId=${exam.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] hover:text-[#0071e3] dark:hover:text-[#0a84ff] group"
                        >
                          <Users className="w-3.5 h-3.5 text-[#86868b] group-hover:text-[#0071e3]" />
                          <span>{attemptCount}</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {exam.isPublished ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                            <Globe className="w-3 h-3" />
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                            <Lock className="w-3 h-3" />
                            Draft
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="px-6 py-3.5 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-1">
                          {/* Toggle Publish */}
                          <button
                            onClick={() => handleTogglePublish(exam)}
                            disabled={isActionBusy}
                            title={exam.isPublished ? 'Unpublish' : 'Publish'}
                            className={`p-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 ${
                              exam.isPublished
                                ? 'text-amber-600 hover:bg-amber-500/10'
                                : 'text-emerald-600 hover:bg-emerald-500/10'
                            }`}
                          >
                            {exam.isPublished ? <Lock className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                          </button>

                          {/* Edit / Builder */}
                          <Link
                            to={`/admin/builder/${exam.id}`}
                            title="Edit Questions in Builder"
                            className="p-1.5 rounded-full text-[#86868b] hover:text-[#0071e3] hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </Link>

                          {/* Duplicate */}
                          <button
                            onClick={() => handleDuplicate(exam)}
                            disabled={isActionBusy}
                            title="Duplicate Exam"
                            className="p-1.5 rounded-full text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all disabled:opacity-50"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {/* Export CSV */}
                          <button
                            onClick={() => handleExportCsv(exam)}
                            disabled={isActionBusy}
                            title="Export Results to CSV"
                            className="p-1.5 rounded-full text-[#86868b] hover:text-[#0071e3] hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all disabled:opacity-50"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setExamToDelete({ id: exam.id, title: exam.title })}
                            disabled={isActionBusy}
                            title="Delete Examination"
                            className="p-1.5 rounded-full text-[#86868b] hover:text-[#ff3b30] hover:bg-rose-500/10 active:scale-95 transition-all disabled:opacity-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
