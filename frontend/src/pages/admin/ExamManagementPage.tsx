import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Edit3,
  Copy,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Clock,
  FileText,
  Users,
  CheckCircle2,
  FileEdit,
} from 'lucide-react';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { Exam } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { ExamDeleteModal } from '../../components/admin/ExamDeleteModal';
import { downloadExamCsv } from '../../components/admin/adminUtils';
import { cn } from '../../components/ui/cn';

export const ExamManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');

  const [deleteTarget, setDeleteTarget] = useState<Exam | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadExams = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminExams();
      setExams(res.exams || []);
    } catch (err: any) {
      toast.error(err?.message || 'Unable to fetch examination catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExams();
  }, []);

  const filtered = useMemo(() => {
    return exams.filter((e) => {
      if (statusFilter === 'PUBLISHED' && !e.isPublished) return false;
      if (statusFilter === 'DRAFT' && e.isPublished) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          e.title.toLowerCase().includes(q) ||
          (e.subject || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [exams, statusFilter, searchQuery]);

  const handleTogglePublish = async (exam: Exam) => {
    try {
      await api.togglePublish(exam.id);
      toast.success(exam.isPublished ? 'Assessment moved to Draft.' : 'Assessment published live.');
      loadExams();
    } catch (err: any) {
      toast.error(err?.message || 'Unable to change publication state.');
    }
  };

  const handleDuplicate = async (exam: Exam) => {
    try {
      await api.duplicateExam(exam.id);
      toast.success(`Duplicated "${exam.title}"`);
      loadExams();
    } catch (err: any) {
      toast.error(err?.message || 'Unable to duplicate assessment.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deleteExam(deleteTarget.id);
      toast.success(`Deleted "${deleteTarget.title}"`);
      setDeleteTarget(null);
      loadExams();
    } catch (err: any) {
      toast.error(err?.message || 'Unable to delete assessment.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Badge variant="brand">Curriculum Catalog</Badge>
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Examination Management
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Publish assessments, refine question banks, clone templates, or export graded cohort CSV reports.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/admin/builder')}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create Assessment
        </Button>
      </header>

      {/* Search & Status Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {(['ALL', 'PUBLISHED', 'DRAFT'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={cn(
                'min-h-[44px] px-4 rounded-[12px] text-sm font-semibold border transition-colors',
                statusFilter === tab
                  ? 'bg-[var(--accent-primary)] text-white border-transparent'
                  : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-default)] hover:bg-[var(--bg-tray)]'
              )}
            >
              {tab === 'ALL'
                ? `All (${exams.length})`
                : tab === 'PUBLISHED'
                ? `Published (${exams.filter((e) => e.isPublished).length})`
                : `Drafts (${exams.filter((e) => !e.isPublished).length})`}
            </button>
          ))}
        </div>

        <div className="relative md:w-80">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by title or subject..."
            aria-label="Filter exams"
            className="w-full min-h-[44px] pl-10 pr-4 rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none"
          />
        </div>
      </div>

      {/* Exam Cards */}
      {loading ? (
        <CardSkeleton count={4} />
      ) : filtered.length === 0 ? (
        <div className="ui-card p-10 text-center space-y-4">
          <FileText className="w-10 h-10 text-[var(--text-muted)] mx-auto" />
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">No Assessments Found</h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Create your first assessment manually or with Gemini AI Studio.
            </p>
          </div>
          <Button variant="primary" size="md" onClick={() => navigate('/admin/builder')} leftIcon={<Plus className="w-4 h-4" />}>
            Create New Assessment
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filtered.map((exam) => {
            const qCount = exam._count?.questions ?? exam.totalQuestions ?? 0;
            const aCount = exam._count?.attempts ?? 0;

            return (
              <article key={exam.id} className="ui-card ui-card-hover p-6 flex flex-col justify-between gap-5">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge variant="brand">{exam.subject || 'General'}</Badge>
                    <Badge
                      variant={exam.isPublished ? 'success' : 'neutral'}
                      icon={exam.isPublished ? <CheckCircle2 className="w-3.5 h-3.5" /> : <FileEdit className="w-3.5 h-3.5" />}
                    >
                      {exam.isPublished ? 'Published Live' : 'Draft'}
                    </Badge>
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-[var(--text-primary)]">{exam.title}</h2>
                    <p className="mt-1 text-sm text-[var(--text-secondary)] line-clamp-2">
                      {exam.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-[var(--text-secondary)]">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-[var(--text-muted)]" aria-hidden="true" />
                      {exam.durationMinutes} min
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-[var(--text-muted)]" aria-hidden="true" />
                      {qCount} questions ({exam.totalMarks} pts)
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-[var(--text-muted)]" aria-hidden="true" />
                      {aCount} attempts
                    </span>
                  </div>
                </div>

                {/* Explicit Always-Visible Controls (No hover-only actions) */}
                <div className="pt-4 border-t border-[var(--border-default)] flex flex-wrap items-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(`/admin/builder/${exam.id}`)}
                    leftIcon={<Edit3 className="w-4 h-4" />}
                  >
                    Edit Builder
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleTogglePublish(exam)}
                    leftIcon={exam.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  >
                    {exam.isPublished ? 'Unpublish' : 'Publish'}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDuplicate(exam)}
                    leftIcon={<Copy className="w-4 h-4" />}
                  >
                    Clone
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => downloadExamCsv(exam.id, exam.title)}
                    leftIcon={<Download className="w-4 h-4" />}
                  >
                    CSV
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteTarget(exam)}
                    className="text-[var(--accent-danger)] hover:bg-rose-50 dark:hover:bg-rose-950/40 ml-auto"
                    leftIcon={<Trash2 className="w-4 h-4" />}
                  >
                    Delete
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <ExamDeleteModal
        open={Boolean(deleteTarget)}
        examTitle={deleteTarget?.title || ''}
        deleting={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};
