import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../../api/client';
import { Exam } from '../../types';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import {
  BookOpen,
  Clock,
  Award,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCw,
  Search,
  ShieldAlert,
  FileCheck,
  HelpCircle,
  X,
  Loader2,
  ExternalLink,
  LayoutGrid,
  List,
  ShieldCheck,
  Wifi,
  Maximize2,
} from 'lucide-react';

export const StudentDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();

  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED'>('AVAILABLE');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  // Pre-exam instructions modal state
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [agreedToRules, setAgreedToRules] = useState(false);
  const [startingExam, setStartingExam] = useState(false);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await api.getStudentExams();
      setExams(res.exams || []);
    } catch (err: any) {
      showError(err.message || 'Failed to load examinations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const subjects = useMemo(() => {
    const unique = Array.from(new Set(exams.map((e) => e.subject).filter(Boolean)));
    return ['ALL', ...unique];
  }, [exams]);

  const counts = useMemo(() => {
    return {
      available: exams.filter((e) => e.userExamStatus === 'AVAILABLE').length,
      inProgress: exams.filter((e) => e.userExamStatus === 'IN_PROGRESS').length,
      completed: exams.filter((e) => e.userExamStatus === 'COMPLETED').length,
    };
  }, [exams]);

  // Performance summary derived from real completed attempts
  const academicMetrics = useMemo(() => {
    const completed = exams.filter((e) => e.userExamStatus === 'COMPLETED' && e.submittedAttempt);
    if (completed.length === 0) {
      return { avgPct: 0, passedCount: 0, totalCompleted: 0 };
    }
    const sumPct = completed.reduce((acc, e) => acc + (e.submittedAttempt?.percentage || 0), 0);
    const passedCount = completed.filter((e) => e.submittedAttempt?.passed).length;
    return {
      avgPct: Math.round((sumPct / completed.length) * 10) / 10,
      passedCount,
      totalCompleted: completed.length,
    };
  }, [exams]);

  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const matchesTab = exam.userExamStatus === activeTab;
      const matchesSubject = selectedSubject === 'ALL' || exam.subject === selectedSubject;
      const matchesSearch =
        exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.subject.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSubject && matchesSearch;
    });
  }, [exams, activeTab, selectedSubject, searchQuery]);

  const handleOpenInstructions = (exam: Exam) => {
    setSelectedExam(exam);
    setAgreedToRules(false);
  };

  const handleLaunchExamWindow = (attemptId: string) => {
    const examUrl = `/exam/${attemptId}`;
    const windowFeatures = `width=${window.screen.availWidth},height=${window.screen.availHeight},top=0,left=0,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes`;

    const popup = window.open(examUrl, `ExamWindow_${attemptId}`, windowFeatures);

    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      navigate(examUrl);
    } else {
      popup.focus();
      fetchExams();
    }
  };

  const handleStartExamConfirm = async () => {
    if (!selectedExam || !agreedToRules) return;

    setStartingExam(true);
    try {
      const res = await api.startExam(selectedExam.id);
      success(
        res.isResumed
          ? 'Resuming your active examination session...'
          : 'Examination started successfully! Good luck.'
      );
      setSelectedExam(null);
      handleLaunchExamWindow(res.attemptId);
    } catch (err: any) {
      showError(err.message || 'Failed to start examination.');
    } finally {
      setStartingExam(false);
    }
  };

  // SVG Ring calculation
  const ringRadius = 30;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset =
    ringCircumference - (Math.min(100, academicMetrics.avgPct) / 100) * ringCircumference;

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] pb-20 transition-colors duration-200">
      {/* Top Architectural Workspace Header */}
      <div className="border-b border-[var(--border-hairline)] bg-[var(--bg-surface)]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Identity & Title */}
            <div className="lg:col-span-7 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded bg-[#0891B2]/10 dark:bg-[#22D3EE]/10 text-[#0891B2] dark:text-[#22D3EE] border border-[#0891B2]/20 dark:border-[#22D3EE]/25">
                  Candidate Hub
                </span>
                {user?.studentId && (
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[var(--bg-tray)] text-[var(--text-secondary)] border border-[var(--border-hairline)]">
                    ID: {user.studentId}
                  </span>
                )}
                {user?.department && (
                  <span className="font-mono text-[11px] text-[var(--text-tertiary)]">
                    • {user.department}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                Examination Roster
              </h1>
              <p className="text-sm text-[var(--text-secondary)]">
                Welcome back, <span className="font-semibold text-[var(--text-primary)]">{user?.name}</span>. Launch scheduled tests, resume interrupted sessions, or review graded transcripts.
              </p>
            </div>

            {/* Right Academic Pulse Telemetry Card */}
            <div className="lg:col-span-5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--bg-tray)]/70 border border-[var(--border-hairline)]">
              <div className="flex items-center gap-4">
                {/* SVG Performance Ring */}
                <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 76 76">
                    <circle
                      cx="38"
                      cy="38"
                      r={ringRadius}
                      strokeWidth="6"
                      fill="none"
                      className="stroke-black/10 dark:stroke-white/10"
                    />
                    <circle
                      cx="38"
                      cy="38"
                      r={ringRadius}
                      strokeWidth="6"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={ringCircumference}
                      strokeDashoffset={academicMetrics.totalCompleted > 0 ? ringOffset : ringCircumference}
                      className="stroke-[#0891B2] dark:stroke-[#22D3EE] transition-all duration-700"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-mono text-sm font-bold text-[var(--text-primary)] tabular-nums">
                      {academicMetrics.totalCompleted > 0 ? `${academicMetrics.avgPct}%` : '—'}
                    </span>
                    <span className="font-mono text-[9px] uppercase text-[var(--text-tertiary)]">AVG</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">
                    Academic Pulse
                  </div>
                  <div className="text-sm font-bold text-[var(--text-primary)]">
                    {academicMetrics.passedCount} / {academicMetrics.totalCompleted} Passed
                  </div>
                  <div className="font-mono text-[11px] text-[var(--text-secondary)]">
                    {counts.available} pending • {counts.inProgress} active
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={fetchExams}
                disabled={loading}
                className="btn-ghost-surface px-3.5 py-2 text-xs inline-flex items-center gap-1.5 disabled:opacity-50"
              >
                <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Sync</span>
              </button>
            </div>
          </div>

          {/* Segmented Tabs, Subject Filters & View Switcher */}
          <div className="mt-7 flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
            <div className="flex flex-wrap items-center gap-3">
              {/* Status Segmented Control */}
              <div className="inline-flex p-1 rounded-xl bg-[var(--bg-tray)] border border-[var(--border-hairline)]">
                {(
                  [
                    { id: 'AVAILABLE', label: 'Available', count: counts.available, badge: 'text-[#0891B2] dark:text-[#22D3EE] bg-[#0891B2]/10 dark:bg-[#22D3EE]/10' },
                    { id: 'IN_PROGRESS', label: 'In-Progress', count: counts.inProgress, badge: 'text-amber-600 dark:text-amber-400 bg-amber-500/10' },
                    { id: 'COMPLETED', label: 'Completed', count: counts.completed, badge: 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10' },
                  ] as const
                ).map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                        isActive
                          ? 'text-[var(--text-primary)]'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="student-tab-pill"
                          transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                          className="absolute inset-0 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-sm"
                        />
                      )}
                      <span className="relative z-10">{tab.label}</span>
                      <span className={`relative z-10 font-mono px-1.5 py-0.5 text-[11px] font-bold rounded ${tab.badge}`}>
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Subject Chips */}
              {subjects.length > 2 && (
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {subjects.map((subj) => (
                    <button
                      key={subj}
                      type="button"
                      onClick={() => setSelectedSubject(subj)}
                      className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-medium border transition-colors whitespace-nowrap ${
                        selectedSubject === subj
                          ? 'bg-[var(--text-primary)] text-[var(--bg-canvas)] border-transparent'
                          : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-hairline)] hover:border-[var(--border-strong)]'
                      }`}
                    >
                      {subj === 'ALL' ? 'All Subjects' : subj}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search & Grid/List Switcher */}
            <div className="flex items-center gap-2.5">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                <input
                  type="text"
                  aria-label="Search examinations"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search exams or subject..."
                  className="w-full pl-9 pr-4 py-2 bg-[var(--bg-tray)] focus:bg-[var(--bg-surface)] border border-[var(--border-hairline)] focus:border-[var(--border-strong)] rounded-xl text-xs sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none transition-all"
                />
              </div>

              <div className="hidden sm:inline-flex p-1 rounded-xl bg-[var(--bg-tray)] border border-[var(--border-hairline)]">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm'
                      : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'list'
                      ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm'
                      : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Roster Grid / List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" role="status" aria-busy="true">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="studio-card p-6 space-y-4 animate-pulse">
                <div className="h-4 w-1/3 rounded bg-[var(--bg-tray)]" />
                <div className="h-6 w-5/6 rounded bg-[var(--bg-tray)]" />
                <div className="grid grid-cols-2 gap-2.5 pt-3">
                  <div className="h-10 rounded-xl bg-[var(--bg-tray)]" />
                  <div className="h-10 rounded-xl bg-[var(--bg-tray)]" />
                </div>
                <div className="h-10 rounded-xl bg-[var(--bg-tray)]" />
              </div>
            ))}
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="text-center py-16 studio-card p-8 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-xl bg-[var(--bg-tray)] border border-[var(--border-hairline)] flex items-center justify-center mx-auto mb-3 text-[var(--text-tertiary)]">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">No Examinations Found</h3>
            <p className="mt-1.5 text-xs text-[var(--text-secondary)] max-w-xs mx-auto leading-relaxed">
              {searchQuery || selectedSubject !== 'ALL'
                ? 'No examinations matched your active filter criteria.'
                : activeTab === 'AVAILABLE'
                ? 'You have completed all scheduled examinations for this cycle.'
                : activeTab === 'IN_PROGRESS'
                ? 'No active examination attempts currently in progress.'
                : 'You have not completed any examination attempts yet.'}
            </p>
          </div>
        ) : viewMode === 'list' ? (
          <div className="studio-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[var(--bg-tray)]/70 font-mono text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] border-b border-[var(--border-hairline)]">
                  <tr>
                    <th className="px-5 py-3.5">#</th>
                    <th className="px-5 py-3.5">Examination</th>
                    <th className="px-4 py-3.5">Duration</th>
                    <th className="px-4 py-3.5">Marks</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-hairline)]">
                  {filteredExams.map((exam, idx) => (
                    <tr key={exam.id} className="hover:bg-[var(--bg-tray)]/40 transition-colors">
                      <td className="px-5 py-4 font-mono text-xs text-[var(--text-tertiary)]">
                        EX-{String(idx + 1).padStart(2, '0')}
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-[var(--text-primary)]">{exam.title}</div>
                        <div className="font-mono text-[11px] text-[var(--text-secondary)]">{exam.subject}</div>
                      </td>
                      <td className="px-4 py-4 font-mono text-xs tabular-nums">{exam.durationMinutes}m</td>
                      <td className="px-4 py-4 font-mono text-xs tabular-nums">
                        {exam.submittedAttempt
                          ? `${exam.submittedAttempt.score}/${exam.totalMarks} (${Number(exam.submittedAttempt.percentage).toFixed(1)}%)`
                          : `${exam.totalMarks} (Pass: ${exam.passingMarks})`}
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-[var(--bg-tray)] border border-[var(--border-hairline)]">
                          {exam.userExamStatus}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        {exam.userExamStatus === 'AVAILABLE' && (
                          <button
                            type="button"
                            onClick={() => handleOpenInstructions(exam)}
                            className="btn-signal px-3.5 py-1.5 text-xs inline-flex items-center gap-1.5"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>Start</span>
                          </button>
                        )}
                        {exam.userExamStatus === 'IN_PROGRESS' && exam.activeAttemptId && (
                          <button
                            type="button"
                            onClick={() => handleLaunchExamWindow(exam.activeAttemptId!)}
                            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white inline-flex items-center gap-1.5"
                          >
                            <RotateCw className="w-3 h-3" />
                            <span>Resume</span>
                          </button>
                        )}
                        {exam.userExamStatus === 'COMPLETED' && exam.submittedAttempt && (
                          <button
                            type="button"
                            onClick={() => navigate(`/student/results/${exam.submittedAttempt!.id}`)}
                            className="btn-ghost-surface px-3.5 py-1.5 text-xs inline-flex items-center gap-1.5"
                          >
                            <FileCheck className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Results</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredExams.map((exam, idx) => (
              <div
                key={exam.id}
                className="studio-card studio-card-interactive flex flex-col overflow-hidden group"
              >
                {/* Top Status Hairline Accent */}
                <div
                  className={`h-1 w-full ${
                    exam.userExamStatus === 'AVAILABLE'
                      ? 'bg-[#0891B2] dark:bg-[#22D3EE]'
                      : exam.userExamStatus === 'IN_PROGRESS'
                      ? 'bg-amber-500'
                      : exam.submittedAttempt?.passed
                      ? 'bg-emerald-500'
                      : 'bg-rose-500'
                  }`}
                />

                <div className="p-6 flex-1 flex flex-col">
                  {/* Index, Subject & Status Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-[10px] font-bold text-[var(--text-tertiary)]">
                        EX-{String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="font-mono text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--bg-tray)] text-[var(--text-secondary)] border border-[var(--border-hairline)] truncate">
                        {exam.subject}
                      </span>
                    </div>

                    {exam.userExamStatus === 'AVAILABLE' && (
                      <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#0891B2]/10 dark:bg-[#22D3EE]/10 text-[#0891B2] dark:text-[#22D3EE] border border-[#0891B2]/20 dark:border-[#22D3EE]/25">
                        Available
                      </span>
                    )}

                    {exam.userExamStatus === 'IN_PROGRESS' && (
                      <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <span>Active</span>
                      </span>
                    )}

                    {exam.userExamStatus === 'COMPLETED' && (
                      <span
                        className={`font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                          exam.submittedAttempt?.passed
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25'
                            : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/25'
                        }`}
                      >
                        {exam.submittedAttempt?.passed ? 'Passed' : 'Completed'}
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-signal)] transition-colors line-clamp-2 leading-snug">
                    {exam.title}
                  </h3>
                  {exam.description && (
                    <p className="mt-2 text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                      {exam.description}
                    </p>
                  )}

                  {/* Technical Spec Grid */}
                  <div className="mt-5 grid grid-cols-2 gap-2 pt-4 border-t border-[var(--border-hairline)] text-xs">
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[var(--bg-tray)]/60 border border-[var(--border-hairline)]">
                      <Clock className="w-3.5 h-3.5 text-[#0891B2] dark:text-[#22D3EE]" />
                      <span className="font-mono font-semibold text-[var(--text-primary)] tabular-nums">
                        {exam.durationMinutes}m
                      </span>
                    </div>

                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[var(--bg-tray)]/60 border border-[var(--border-hairline)]">
                      <Award className="w-3.5 h-3.5 text-[var(--accent-signal)]" />
                      <span className="font-mono font-semibold text-[var(--text-primary)] tabular-nums">
                        {exam.totalMarks} Marks
                      </span>
                    </div>

                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[var(--bg-tray)]/60 border border-[var(--border-hairline)]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="font-mono font-semibold text-[var(--text-primary)] tabular-nums">
                        Pass: {exam.passingMarks}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[var(--bg-tray)]/60 border border-[var(--border-hairline)]">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                      <span className="font-mono font-semibold text-[var(--text-primary)] tabular-nums">
                        {exam._count?.questions ?? exam.totalQuestions ?? 'N/A'} Items
                      </span>
                    </div>
                  </div>

                  {/* Completed Score Readout */}
                  {exam.userExamStatus === 'COMPLETED' && exam.submittedAttempt && (
                    <div className="mt-4 p-3 rounded-xl bg-[var(--bg-tray)] border border-[var(--border-hairline)] space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-[var(--text-secondary)]">
                          SCORE: <strong className="text-[var(--text-primary)]">{exam.submittedAttempt.score}/{exam.totalMarks}</strong>
                        </span>
                        <span
                          className={`font-mono font-bold tabular-nums ${
                            exam.submittedAttempt.passed
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {Number(exam.submittedAttempt.percentage).toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            exam.submittedAttempt.passed ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(0, exam.submittedAttempt.percentage))}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer CTA */}
                <div className="p-4 bg-[var(--bg-tray)]/40 border-t border-[var(--border-hairline)]">
                  {exam.userExamStatus === 'AVAILABLE' && (
                    <button
                      type="button"
                      onClick={() => handleOpenInstructions(exam)}
                      className="w-full btn-signal py-2.5 flex items-center justify-center gap-2 text-xs font-semibold"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Review Rules & Start</span>
                    </button>
                  )}

                  {exam.userExamStatus === 'IN_PROGRESS' && exam.activeAttemptId && (
                    <button
                      type="button"
                      onClick={() => handleLaunchExamWindow(exam.activeAttemptId!)}
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 shadow-sm flex items-center justify-center gap-2 active:scale-98 transition-all"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Resume Active Session</span>
                    </button>
                  )}

                  {exam.userExamStatus === 'COMPLETED' && exam.submittedAttempt && (
                    <button
                      type="button"
                      onClick={() => navigate(`/student/results/${exam.submittedAttempt!.id}`)}
                      className="w-full btn-ghost-surface py-2.5 flex items-center justify-center gap-2 text-xs"
                    >
                      <FileCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Inspect Score Sheet</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pre-Exam Readiness & Conduct Modal */}
      {selectedExam && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-lg flex items-center justify-center p-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="studio-card max-w-xl w-full overflow-hidden animate-apple-spring border border-[var(--border-strong)]">
            <div className="p-6 border-b border-[var(--border-hairline)] flex items-center justify-between bg-[var(--bg-tray)]/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--accent-signal)]/15 text-[var(--accent-signal)] flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    Pre-Exam Readiness & Code of Conduct
                  </h3>
                  <p className="font-mono text-[11px] text-[var(--text-secondary)]">
                    {selectedExam.title} • {selectedExam.subject}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedExam(null)}
                className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/10"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto text-xs leading-relaxed">
              {/* System Pre-Flight Checks (Thoughtful UX Add-on) */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-mono text-[10px]">
                  <Wifi className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>API Sync OK</span>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-mono text-[10px]">
                  <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Sentinel Armed</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#0891B2]/10 dark:bg-[#22D3EE]/10 border border-[#0891B2]/20 dark:border-[#22D3EE]/25 flex items-center gap-2 text-[#0891B2] dark:text-[#22D3EE] font-mono text-[10px]">
                  <Maximize2 className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Isolated Room</span>
                </div>
              </div>

              {/* Specs Bar */}
              <div className="grid grid-cols-3 gap-2.5 p-3 rounded-xl bg-[var(--bg-tray)] border border-[var(--border-hairline)] text-center">
                <div>
                  <div className="font-mono text-[10px] uppercase text-[var(--text-tertiary)]">Duration</div>
                  <div className="font-mono font-bold text-sm text-[var(--text-primary)]">
                    {selectedExam.durationMinutes} mins
                  </div>
                </div>
                <div>
                  <div className="font-mono text-[10px] uppercase text-[var(--text-tertiary)]">Total Marks</div>
                  <div className="font-mono font-bold text-sm text-[var(--text-primary)]">
                    {selectedExam.totalMarks}
                  </div>
                </div>
                <div>
                  <div className="font-mono text-[10px] uppercase text-[var(--text-tertiary)]">Passing</div>
                  <div className="font-mono font-bold text-sm text-[var(--text-primary)]">
                    {selectedExam.passingMarks}
                  </div>
                </div>
              </div>

              {selectedExam.instructions && (
                <div className="p-3.5 rounded-xl bg-[#0891B2]/10 dark:bg-[#22D3EE]/10 border border-[#0891B2]/20 dark:border-[#22D3EE]/20">
                  <h4 className="font-mono font-bold text-[#0891B2] dark:text-[#22D3EE] text-[10px] uppercase tracking-wider mb-1">
                    Instructor Instructions
                  </h4>
                  <p className="text-xs text-[var(--text-primary)] whitespace-pre-line">
                    {selectedExam.instructions}
                  </p>
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-mono font-bold text-[10px] uppercase tracking-wider">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Proctoring & Focus-Loss Protocol</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-xs text-[var(--text-primary)]">
                  <li>
                    <strong>Isolated Window:</strong> Launches in a dedicated room without global navigation.
                  </li>
                  <li>
                    <strong>Focus Sentinel:</strong> Switching tabs or leaving the window logs a timestamped incident.
                  </li>
                  <li>
                    <strong>Auto-Submit:</strong> Reaching 00:00 automatically submits all autosaved responses.
                  </li>
                </ul>
              </div>

              <label
                htmlFor="agreePledge"
                className="pt-1 flex items-start gap-2.5 cursor-pointer text-xs text-[var(--text-secondary)]"
              >
                <input
                  type="checkbox"
                  id="agreePledge"
                  checked={agreedToRules}
                  onChange={(e) => setAgreedToRules(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-[var(--border-strong)] accent-[var(--accent-signal)]"
                />
                <span>
                  I agree to complete this examination independently in compliance with academic honor principles.
                </span>
              </label>
            </div>

            <div className="p-4 border-t border-[var(--border-hairline)] bg-[var(--bg-tray)]/40 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedExam(null)}
                className="btn-ghost-surface px-4 py-2 text-xs"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={!agreedToRules || startingExam}
                onClick={handleStartExamConfirm}
                className="btn-signal px-5 py-2 text-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                {startingExam ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Launching...</span>
                  </>
                ) : (
                  <>
                    <span>Agree & Launch Exam</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
