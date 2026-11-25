import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Clock,
  CheckCircle2,
  Play,
  RotateCcw,
  FileText,
  ShieldCheck,
  AlertTriangle,
  LayoutGrid,
  List,
  BookOpen,
  ArrowRight,
  Award,
} from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Exam } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { cn } from '../../components/ui/cn';

type FilterTab = 'ALL' | 'READY' | 'IN_PROGRESS' | 'COMPLETED';

function getAttemptInfo(exam: Exam) {
  const status = exam.userExamStatus || 'AVAILABLE';
  return {
    attemptId: exam.submittedAttempt?.id || exam.activeAttemptId || null,
    status,
    score: exam.submittedAttempt?.score ?? null,
    percentage: exam.submittedAttempt?.percentage ?? null,
    passed: exam.submittedAttempt?.passed ?? null,
  };
}

export const StudentDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Pre-Exam Readiness Modal State
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [agreedToRules, setAgreedToRules] = useState(false);
  const [startingExam, setStartingExam] = useState(false);

  const loadExams = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.getStudentExams();
      setExams(res.exams || []);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to load available assessments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExams();
  }, []);

  const subjects = useMemo(() => {
    const set = new Set<string>();
    exams.forEach((e) => {
      if (e.subject) set.add(e.subject);
    });
    return ['ALL', ...Array.from(set)];
  }, [exams]);

  const metrics = useMemo(() => {
    let ready = 0;
    let inProgress = 0;
    let completed = 0;
    let scoreSum = 0;
    let scoreCount = 0;

    exams.forEach((e) => {
      const info = getAttemptInfo(e);
      if (info.status === 'COMPLETED') {
        completed += 1;
        if (typeof info.percentage === 'number') {
          scoreSum += info.percentage;
          scoreCount += 1;
        }
      } else if (info.status === 'IN_PROGRESS') {
        inProgress += 1;
      } else {
        ready += 1;
      }
    });

    const completionRate = exams.length > 0 ? Math.round((completed / exams.length) * 100) : 0;
    const avgScore = scoreCount > 0 ? Math.round(scoreSum / scoreCount) : 0;
    return { ready, inProgress, completed, completionRate, avgScore };
  }, [exams]);

  const filteredExams = useMemo(() => {
    return exams.filter((e) => {
      const info = getAttemptInfo(e);
      const isCompleted = info.status === 'COMPLETED';
      const isInProgress = info.status === 'IN_PROGRESS';

      if (activeTab === 'READY' && (isCompleted || isInProgress)) return false;
      if (activeTab === 'IN_PROGRESS' && !isInProgress) return false;
      if (activeTab === 'COMPLETED' && !isCompleted) return false;
      if (selectedSubject !== 'ALL' && e.subject !== selectedSubject) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          e.title.toLowerCase().includes(q) ||
          (e.subject || '').toLowerCase().includes(q) ||
          (e.description || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [exams, activeTab, selectedSubject, searchQuery]);

  const openReadinessModal = (exam: Exam) => {
    setSelectedExam(exam);
    setAgreedToRules(false);
  };

  const handleConfirmStart = async () => {
    if (!selectedExam) return;
    setStartingExam(true);
    try {
      const res = await api.startExam(selectedExam.id);
      toast.success(res.isResumed ? 'Resuming existing exam session...' : 'Exam environment initialized.');
      setSelectedExam(null);
      navigate(`/exam/${res.attemptId}`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to start examination attempt.');
    } finally {
      setStartingExam(false);
    }
  };

  const ringRadius = 30;
  const ringCirc = 2 * Math.PI * ringRadius;
  const ringOffset = ringCirc - (metrics.completionRate / 100) * ringCirc;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Header & Academic Pulse Card */}
      <section className="ui-card p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="teal" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
              Candidate Workspace
            </Badge>
            {user?.studentId && <Badge variant="neutral">{user.studentId}</Badge>}
            {user?.department && <Badge variant="neutral">{user.department}</Badge>}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Welcome, {user?.name || 'Student'}
          </h1>
          <p className="text-base text-[var(--text-secondary)]">
            Launch assigned assessments in isolated proctored mode or review your graded performance transcripts.
          </p>
        </div>

        {/* Academic Pulse Strip */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 p-4 rounded-[14px] bg-[var(--bg-tray)] border border-[var(--border-default)]">
          <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 76 76" aria-hidden="true">
              <circle
                cx="38"
                cy="38"
                r={ringRadius}
                strokeWidth="7"
                className="fill-none stroke-[var(--border-default)]"
              />
              <circle
                cx="38"
                cy="38"
                r={ringRadius}
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={ringCirc}
                strokeDashoffset={ringOffset}
                className="fill-none stroke-[var(--accent-secondary)] transition-all duration-500"
              />
            </svg>
            <span className="absolute text-sm font-mono font-bold text-[var(--text-primary)]">
              {metrics.completionRate}%
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 sm:gap-5 pr-2">
            <div>
              <p className="text-xl font-mono font-extrabold text-[var(--text-primary)]">{metrics.ready}</p>
              <p className="text-xs font-medium text-[var(--text-secondary)]">Ready</p>
            </div>
            <div>
              <p className="text-xl font-mono font-extrabold text-[var(--accent-primary)]">{metrics.inProgress}</p>
              <p className="text-xs font-medium text-[var(--text-secondary)]">Active</p>
            </div>
            <div>
              <p className="text-xl font-mono font-extrabold text-[var(--accent-success)]">{metrics.avgScore}%</p>
              <p className="text-xs font-medium text-[var(--text-secondary)]">Avg Score</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filter & Search Toolbar */}
      <section className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { id: 'ALL', label: `All (${exams.length})` },
                { id: 'READY', label: `Ready (${metrics.ready})` },
                { id: 'IN_PROGRESS', label: `In Progress (${metrics.inProgress})` },
                { id: 'COMPLETED', label: `Completed (${metrics.completed})` },
              ] as { id: FilterTab; label: string }[]
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'min-h-[44px] px-4 rounded-[12px] text-sm font-semibold border transition-colors focus-visible:outline-2 focus-visible:outline-[var(--accent-primary)]',
                  activeTab === tab.id
                    ? 'bg-[var(--accent-primary)] text-white border-transparent'
                    : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-default)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tray)]'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & View Switcher */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-72">
              <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search assessments..."
                aria-label="Search assessments"
                className="w-full min-h-[44px] pl-10 pr-4 rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none"
              />
            </div>

            <div className="inline-flex p-1 rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-surface)]">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
                aria-pressed={viewMode === 'grid'}
                className={cn(
                  'min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-[10px] transition-colors',
                  viewMode === 'grid'
                    ? 'bg-[var(--bg-tray)] text-[var(--accent-primary)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                )}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                aria-label="List view"
                aria-pressed={viewMode === 'list'}
                className={cn(
                  'min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-[10px] transition-colors',
                  viewMode === 'list'
                    ? 'bg-[var(--bg-tray)] text-[var(--accent-primary)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Subject Chips */}
        {subjects.length > 2 && (
          <div className="flex flex-wrap items-center gap-2">
            {subjects.map((sub) => (
              <button
                key={sub}
                type="button"
                onClick={() => setSelectedSubject(sub)}
                className={cn(
                  'min-h-[44px] px-3.5 rounded-full text-xs font-semibold border transition-colors',
                  selectedSubject === sub
                    ? 'bg-[var(--bg-tray)] text-[var(--text-primary)] border-[var(--border-strong)]'
                    : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-default)] hover:bg-[var(--bg-tray)]'
                )}
              >
                {sub === 'ALL' ? 'All Subjects' : sub}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Assessments Grid / List */}
      {loading ? (
        <CardSkeleton count={6} />
      ) : errorMsg ? (
        <div className="ui-card p-8 text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-[var(--accent-danger)] mx-auto" aria-hidden="true" />
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Failed to Load Assessments</h2>
            <p className="text-sm text-[var(--text-secondary)]">{errorMsg}</p>
          </div>
          <Button variant="primary" size="md" onClick={loadExams} leftIcon={<RotateCcw className="w-4 h-4" />}>
            Retry Loading
          </Button>
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="ui-card p-10 text-center space-y-4">
          <BookOpen className="w-10 h-10 text-[var(--text-muted)] mx-auto" aria-hidden="true" />
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">No Matching Assessments</h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Try clearing your filters or check back when instructors publish new examinations.
            </p>
          </div>
          {(activeTab !== 'ALL' || selectedSubject !== 'ALL' || searchQuery) && (
            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                setActiveTab('ALL');
                setSelectedSubject('ALL');
                setSearchQuery('');
              }}
            >
              Reset All Filters
            </Button>
          )}
        </div>
      ) : (
        <div
          className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'flex flex-col gap-4'
          )}
        >
          {filteredExams.map((exam) => {
            const info = getAttemptInfo(exam);
            const isCompleted = info.status === 'COMPLETED';
            const isInProgress = info.status === 'IN_PROGRESS';
            const questionCount =
              exam.totalQuestions ?? exam._count?.questions ?? exam.questions?.length ?? 0;

            return (
              <article
                key={exam.id}
                className={cn(
                  'ui-card ui-card-hover p-6 flex flex-col justify-between gap-5',
                  viewMode === 'list' && 'md:flex-row md:items-center'
                )}
              >
                <div className="space-y-3 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge variant="brand">{exam.subject || 'General'}</Badge>
                    {isCompleted ? (
                      <Badge
                        variant={info.passed ? 'success' : 'warning'}
                        icon={<Award className="w-3.5 h-3.5" />}
                      >
                        {typeof info.percentage === 'number'
                          ? `${Math.round(info.percentage)}% · ${info.passed ? 'Passed' : 'Submitted'}`
                          : 'Submitted'}
                      </Badge>
                    ) : isInProgress ? (
                      <Badge variant="warning" icon={<Clock className="w-3.5 h-3.5" />}>
                        In Progress
                      </Badge>
                    ) : (
                      <Badge variant="teal" icon={<CheckCircle2 className="w-3.5 h-3.5" />}>
                        Ready
                      </Badge>
                    )}
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-[var(--text-primary)] leading-snug">
                      {exam.title}
                    </h2>
                    <p className="mt-1.5 text-sm text-[var(--text-secondary)] line-clamp-2">
                      {exam.description || 'Timed proctored institutional assessment.'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-[var(--text-secondary)] pt-1">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-[var(--text-muted)]" aria-hidden="true" />
                      {exam.durationMinutes} min
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-[var(--text-muted)]" aria-hidden="true" />
                      {questionCount} questions
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[var(--text-muted)]" aria-hidden="true" />
                      {exam.totalMarks} marks
                    </span>
                  </div>
                </div>

                <div className={cn('pt-4 border-t border-[var(--border-default)]', viewMode === 'list' && 'md:pt-0 md:border-t-0 md:pl-6 md:border-l md:w-56 shrink-0')}>
                  {isCompleted && info.attemptId ? (
                    <Button
                      variant="secondary"
                      size="md"
                      fullWidth
                      onClick={() => navigate(`/student/results/${info.attemptId}`)}
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      View Transcript
                    </Button>
                  ) : isInProgress ? (
                    <Button
                      variant="primary"
                      size="md"
                      fullWidth
                      onClick={() => openReadinessModal(exam)}
                      leftIcon={<RotateCcw className="w-4 h-4" />}
                    >
                      Resume Exam
                    </Button>
                  ) : (
                    <Button
                      variant="teal"
                      size="md"
                      fullWidth
                      onClick={() => openReadinessModal(exam)}
                      leftIcon={<Play className="w-4 h-4" />}
                    >
                      Start Assessment
                    </Button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Pre-Exam Readiness & Rules Confirmation Modal */}
      <Modal
        open={Boolean(selectedExam)}
        onClose={() => !startingExam && setSelectedExam(null)}
        titleId="readiness-modal-title"
        headerBadge={<Badge variant="teal">Pre-Exam Integrity Check</Badge>}
        title={selectedExam?.title || 'Assessment Rules'}
        subtitle={`Subject: ${selectedExam?.subject || 'General'} · Duration: ${selectedExam?.durationMinutes || 0} minutes`}
        footer={
          <>
            <Button
              variant="secondary"
              size="md"
              disabled={startingExam}
              onClick={() => setSelectedExam(null)}
            >
              Cancel
            </Button>
            <Button
              variant="teal"
              size="md"
              loading={startingExam}
              disabled={!agreedToRules || startingExam}
              onClick={handleConfirmStart}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Launch Proctored Portal
            </Button>
          </>
        }
      >
        {selectedExam && (
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-[12px] bg-[var(--bg-tray)] border border-[var(--border-default)]">
                <p className="text-lg font-mono font-bold text-[var(--text-primary)]">
                  {selectedExam.durationMinutes}m
                </p>
                <p className="text-xs text-[var(--text-muted)]">Time Limit</p>
              </div>
              <div className="p-3 rounded-[12px] bg-[var(--bg-tray)] border border-[var(--border-default)]">
                <p className="text-lg font-mono font-bold text-[var(--text-primary)]">
                  {selectedExam.totalMarks}
                </p>
                <p className="text-xs text-[var(--text-muted)]">Total Marks</p>
              </div>
              <div className="p-3 rounded-[12px] bg-[var(--bg-tray)] border border-[var(--border-default)]">
                <p className="text-lg font-mono font-bold text-[var(--accent-warning)]">
                  {selectedExam.focusLossThreshold ?? 3}
                </p>
                <p className="text-xs text-[var(--text-muted)]">Max Focus Strikes</p>
              </div>
            </div>

            <div className="p-4 rounded-[12px] bg-[var(--bg-tray)]/70 border border-[var(--border-default)] space-y-2 text-sm text-[var(--text-secondary)]">
              <p className="font-semibold text-[var(--text-primary)]">Proctoring Guidelines:</p>
              <ul className="space-y-1.5 list-disc pl-5">
                <li>Your answers auto-save continuously to prevent data loss.</li>
                <li>Switching browser tabs, exiting fullscreen, or losing window focus increments your violation counter.</li>
                <li>Exceeding {selectedExam.focusLossThreshold ?? 3} focus violations triggers automatic submission.</li>
              </ul>
            </div>

            <label className="flex items-start gap-3 p-4 rounded-[12px] border border-[var(--border-default)] cursor-pointer hover:bg-[var(--bg-tray)]/50 transition-colors">
              <input
                type="checkbox"
                checked={agreedToRules}
                onChange={(e) => setAgreedToRules(e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded accent-[var(--accent-secondary)] cursor-pointer"
              />
              <span className="text-sm font-medium text-[var(--text-primary)] leading-snug">
                I understand the integrity policies and am ready to begin this timed examination.
              </span>
            </label>
          </div>
        )}
      </Modal>
    </div>
  );
};
