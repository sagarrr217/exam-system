import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
  Lock,
} from 'lucide-react';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { Exam } from '../../types';
import { downloadExamCsv, formatDuration } from '../../components/admin/adminUtils';
import { ExamDeleteModal } from '../../components/admin/ExamDeleteModal';

export const ExamManagementPage: React.FC = () => {
  const toast = useToast();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [examToDelete, setExamToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchExams = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await api.getAdminExams();
      setExams(res.exams || []);
      if (isManualRefresh) toast.success('Exam catalog refreshed');
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[var(--border-hairline)]">
        <div className="space-y-1.5">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded bg-[var(--accent-signal)]/10 text-[var(--accent-signal)] border border-[var(--accent-signal)]/25">
            Assessment Catalog
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
            Exam Management
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Configure curriculum, publishing state, duplication, and RFC 4180 CSV gradebooks.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => fetchExams(true)}
            disabled={loading || refreshing}
            className="btn-ghost-surface px-3.5 py-2 text-xs inline-flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <Link
            to="/admin/builder"
            className="btn-signal px-4 py-2 text-xs inline-flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create New Exam</span>
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="studio-card p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            type="text"
            aria-label="Search examinations"
            placeholder="Search by title or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs sm:text-sm bg-[var(--bg-tray)] focus:bg-[var(--bg-surface)] border border-[var(--border-hairline)] focus:border-[var(--border-strong)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none transition-all"
          />
        </div>

        <div className="inline-flex p-1 rounded-xl bg-[var(--bg-tray)] border border-[var(--border-hairline)]">
          {(
            [
              { id: 'ALL', label: `All (${exams.length})`, color: 'text-[var(--text-primary)]' },
              {
                id: 'PUBLISHED',
                label: `Published (${exams.filter((e) => e.isPublished).length})`,
                color: 'text-emerald-600 dark:text-emerald-400',
              },
              {
                id: 'DRAFT',
                label: `Drafts (${exams.filter((e) => !e.isPublished).length})`,
                color: 'text-amber-600 dark:text-amber-400',
              },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setStatusFilter(f.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === f.id
                  ? `bg-[var(--bg-surface)] ${f.color} border border-[var(--border-hairline)] shadow-sm`
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Exam Catalog Table */}
      <div className="studio-card overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-[var(--text-secondary)]">
            <div className="w-6 h-6 border-2 border-[var(--accent-signal)] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="font-mono text-xs">Loading examinations...</p>
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="p-16 text-center text-[var(--text-secondary)]">
            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <h3 className="text-sm font-bold text-[var(--text-primary)]">No examinations found</h3>
            <p className="text-xs max-w-sm mx-auto mt-1 mb-4">
              {searchQuery || statusFilter !== 'ALL'
                ? 'No examinations matched your active query.'
                : 'Get started by creating your first exam with all 7 question formats.'}
            </p>
            <Link
              to="/admin/builder"
              className="btn-signal px-4 py-2 text-xs inline-flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create New Exam</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[var(--bg-tray)]/70 font-mono text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-hairline)]">
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
              <tbody className="divide-y divide-[var(--border-hairline)]">
                {filteredExams.map((exam) => {
                  const isActionBusy = actionLoadingId === exam.id;
                  const questionCount =
                    exam._count?.questions ?? (exam.questions ? exam.questions.length : 0);
                  const attemptCount = exam._count?.attempts ?? 0;

                  return (
                    <tr key={exam.id} className="hover:bg-[var(--bg-tray)]/40 transition-colors">
                      <td className="px-6 py-3.5 max-w-xs">
                        <div className="font-semibold text-[var(--text-primary)] leading-snug">
                          {exam.title}
                        </div>
                        <div className="font-mono text-[11px] text-[var(--text-secondary)] mt-0.5 flex items-center gap-2">
                          <span className="text-[#0891B2] dark:text-[#22D3EE]">{exam.subject}</span>
                          {exam.description && (
                            <span className="truncate max-w-[160px] text-[var(--text-tertiary)]">
                              • {exam.description}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs tabular-nums">
                        <div className="flex items-center gap-1.5 text-[var(--text-primary)]">
                          <Clock className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                          <span>{formatDuration(exam.durationMinutes)}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs tabular-nums">
                        <div className="flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                          <span className="font-semibold text-[var(--text-primary)]">
                            {exam.passingMarks}
                          </span>
                          <span className="text-[var(--text-tertiary)]">/</span>
                          <span className="text-[var(--text-secondary)]">{exam.totalMarks}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs tabular-nums">
                        <div className="flex items-center gap-1.5 text-[var(--text-primary)]">
                          <FileQuestion className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                          <span className="font-semibold">{questionCount}</span>
                          <span className="text-[var(--text-secondary)]">items</span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap font-mono">
                        <Link
                          to={`/admin/submissions?examId=${exam.id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-primary)] hover:text-[var(--accent-signal)] group"
                        >
                          <Users className="w-3.5 h-3.5 text-[var(--text-tertiary)] group-hover:text-[var(--accent-signal)]" />
                          <span>{attemptCount}</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {exam.isPublished ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded font-mono text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25">
                            <Globe className="w-3 h-3" />
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded font-mono text-[10px] font-bold uppercase bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/25">
                            <Lock className="w-3 h-3" />
                            Draft
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-3.5 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleTogglePublish(exam)}
                            disabled={isActionBusy}
                            title={exam.isPublished ? 'Unpublish' : 'Publish'}
                            className={`p-1.5 rounded-lg transition-all ${
                              exam.isPublished
                                ? 'text-amber-600 hover:bg-amber-500/10'
                                : 'text-emerald-600 hover:bg-emerald-500/10'
                            }`}
                          >
                            {exam.isPublished ? (
                              <Lock className="w-4 h-4" />
                            ) : (
                              <Globe className="w-4 h-4" />
                            )}
                          </button>

                          <Link
                            to={`/admin/builder/${exam.id}`}
                            title="Edit Questions in Builder"
                            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--accent-signal)] hover:bg-[var(--bg-tray)] transition-all"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleDuplicate(exam)}
                            disabled={isActionBusy}
                            title="Duplicate Exam"
                            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tray)] transition-all disabled:opacity-50"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleExportCsv(exam)}
                            disabled={isActionBusy}
                            title="Export Results to CSV"
                            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[#0891B2] dark:hover:text-[#22D3EE] hover:bg-[var(--bg-tray)] transition-all disabled:opacity-50"
                          >
                            <Download className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setExamToDelete({ id: exam.id, title: exam.title })}
                            disabled={isActionBusy}
                            title="Delete Examination"
                            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-rose-500 hover:bg-rose-500/10 transition-all disabled:opacity-50"
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
