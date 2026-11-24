import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ChevronRight,
  Sparkles
} from 'lucide-react';

export const StudentDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();

  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED'>('AVAILABLE');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected exam for pre-exam instructions modal
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

  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const matchesTab = exam.userExamStatus === activeTab;
      const matchesSearch =
        exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.subject.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [exams, activeTab, searchQuery]);

  const counts = useMemo(() => {
    return {
      available: exams.filter((e) => e.userExamStatus === 'AVAILABLE').length,
      inProgress: exams.filter((e) => e.userExamStatus === 'IN_PROGRESS').length,
      completed: exams.filter((e) => e.userExamStatus === 'COMPLETED').length
    };
  }, [exams]);

  const handleOpenInstructions = (exam: Exam) => {
    setSelectedExam(exam);
    setAgreedToRules(false);
  };

  const handleLaunchExamWindow = (attemptId: string) => {
    const examUrl = `/exam/${attemptId}`;
    const windowFeatures = `width=${window.screen.availWidth},height=${window.screen.availHeight},top=0,left=0,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes`;
    
    // Attempt maximized popup window
    const popup = window.open(examUrl, `ExamWindow_${attemptId}`, windowFeatures);
    
    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      // Popup was blocked or unsupported; fallback to standard in-app navigation
      navigate(examUrl);
    } else {
      popup.focus();
      // Also refresh dashboard state
      fetchExams();
    }
  };

  const handleStartExamConfirm = async () => {
    if (!selectedExam || !agreedToRules) return;

    setStartingExam(true);
    try {
      const res = await api.startExam(selectedExam.id);
      success(res.isResumed ? 'Resuming your active examination session...' : 'Examination started successfully! Good luck.');
      setSelectedExam(null);
      handleLaunchExamWindow(res.attemptId);
    } catch (err: any) {
      showError(err.message || 'Failed to start examination.');
    } finally {
      setStartingExam(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-black pb-20 transition-colors duration-200">
      {/* iOS Top Bar Section */}
      <div className="border-b border-black/5 dark:border-white/10 bg-white/70 dark:bg-[#1c1c1e]/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-blue-500/10 text-[#0071e3] dark:text-[#0a84ff] mb-2">
                <Sparkles className="w-3 h-3" />
                <span>Student Hub</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
                Examinations
              </h1>
              <p className="mt-1 text-sm text-[#86868b] dark:text-[#98989d]">
                Welcome back, <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{user?.name}</span>. Access tests and monitor your academic progress.
              </p>
            </div>

            <button
              onClick={fetchExams}
              disabled={loading}
              className="inline-flex items-center gap-2 self-start md:self-auto px-4 py-2 text-xs sm:text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7] bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 rounded-full transition-all active:scale-95 disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Status</span>
            </button>
          </div>

          {/* iOS Segmented Navigation Tabs & Search Pill */}
          <div className="mt-7 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="inline-flex p-1 rounded-full bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/5 shadow-inner">
              <button
                onClick={() => setActiveTab('AVAILABLE')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                  activeTab === 'AVAILABLE'
                    ? 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-white shadow-sm'
                    : 'text-[#86868b] dark:text-[#98989d] hover:text-[#1d1d1f] dark:hover:text-white'
                }`}
              >
                <span>Available</span>
                <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full ${
                  activeTab === 'AVAILABLE'
                    ? 'bg-[#0071e3]/10 text-[#0071e3] dark:text-[#0a84ff]'
                    : 'bg-black/5 dark:bg-white/10 text-[#86868b]'
                }`}>
                  {counts.available}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('IN_PROGRESS')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                  activeTab === 'IN_PROGRESS'
                    ? 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-white shadow-sm'
                    : 'text-[#86868b] dark:text-[#98989d] hover:text-[#1d1d1f] dark:hover:text-white'
                }`}
              >
                <span>In-Progress</span>
                <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full ${
                  activeTab === 'IN_PROGRESS'
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    : 'bg-black/5 dark:bg-white/10 text-[#86868b]'
                }`}>
                  {counts.inProgress}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('COMPLETED')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                  activeTab === 'COMPLETED'
                    ? 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-white shadow-sm'
                    : 'text-[#86868b] dark:text-[#98989d] hover:text-[#1d1d1f] dark:hover:text-white'
                }`}
              >
                <span>Completed</span>
                <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full ${
                  activeTab === 'COMPLETED'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-black/5 dark:bg-white/10 text-[#86868b]'
                }`}>
                  {counts.completed}
                </span>
              </button>
            </div>

            {/* Apple Search Pill */}
            <div className="relative max-w-xs w-full">
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868b]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search exams or subject..."
                className="w-full pl-9 pr-4 py-1.5 bg-black/5 dark:bg-white/10 border border-transparent focus:border-black/10 dark:focus:border-white/20 rounded-full text-xs sm:text-sm text-[#1d1d1f] dark:text-[#f5f5f7] placeholder-[#86868b] focus:outline-none focus:bg-white dark:focus:bg-[#1c1c1e] transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#0071e3] dark:text-[#0a84ff] mb-3" />
            <p className="text-xs font-medium text-[#86868b] dark:text-[#98989d]">Fetching active examination roster...</p>
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="text-center py-20 apple-card p-8 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center mx-auto mb-3 text-[#86868b]">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">No Examinations Found</h3>
            <p className="mt-1.5 text-xs text-[#86868b] dark:text-[#98989d] max-w-xs mx-auto leading-relaxed">
              {searchQuery
                ? `No examinations matching "${searchQuery}". Clear your search query to view all.`
                : activeTab === 'AVAILABLE'
                ? 'You have completed all scheduled examinations for this cycle.'
                : activeTab === 'IN_PROGRESS'
                ? 'No interrupted or active examination attempts in progress.'
                : 'You have not completed any examination attempts yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExams.map((exam) => (
              <div
                key={exam.id}
                className="apple-card flex flex-col overflow-hidden group"
              >
                <div className="p-6 flex-1 flex flex-col">
                  {/* Top: Subject Pill & Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-[#86868b] dark:text-[#98989d]">
                      {exam.subject}
                    </span>

                    {exam.userExamStatus === 'AVAILABLE' && (
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        Available
                      </span>
                    )}

                    {exam.userExamStatus === 'IN_PROGRESS' && (
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1.5 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        <span>In Progress</span>
                      </span>
                    )}

                    {exam.userExamStatus === 'COMPLETED' && (
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                          exam.submittedAttempt?.passed
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                        }`}
                      >
                        {exam.submittedAttempt?.passed ? 'Passed' : 'Completed'}
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] group-hover:text-[#0071e3] dark:group-hover:text-[#0a84ff] transition-colors line-clamp-2 leading-snug">
                    {exam.title}
                  </h3>
                  {exam.description && (
                    <p className="mt-2 text-xs text-[#86868b] dark:text-[#98989d] line-clamp-2 leading-relaxed">
                      {exam.description}
                    </p>
                  )}

                  {/* iOS Grouped Specs Grid */}
                  <div className="mt-5 grid grid-cols-2 gap-2.5 pt-4 border-t border-black/5 dark:border-white/10 text-xs text-[#86868b] dark:text-[#98989d]">
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.03]">
                      <Clock className="w-3.5 h-3.5 text-[#0071e3] dark:text-[#0a84ff]" />
                      <span className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">{exam.durationMinutes}m</span>
                    </div>

                    <div className="flex items-center gap-2 p-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.03]">
                      <Award className="w-3.5 h-3.5 text-purple-500" />
                      <span className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">{exam.totalMarks} Marks</span>
                    </div>

                    <div className="flex items-center gap-2 p-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.03]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">Pass: {exam.passingMarks}</span>
                    </div>

                    <div className="flex items-center gap-2 p-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.03]">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                      <span className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">{exam._count?.questions ?? exam.totalQuestions ?? 'N/A'} Questions</span>
                    </div>
                  </div>

                  {/* Completed Score Card */}
                  {exam.userExamStatus === 'COMPLETED' && exam.submittedAttempt && (
                    <div className="mt-4 p-3 bg-black/[0.03] dark:bg-white/[0.04] rounded-2xl border border-black/5 dark:border-white/10 flex items-center justify-between text-xs">
                      <div>
                        <div className="text-[11px] text-[#86868b]">Score:</div>
                        <div className="text-sm font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                          {exam.submittedAttempt.score} / {exam.totalMarks}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[11px] text-[#86868b]">Performance:</div>
                        <div
                          className={`text-sm font-bold ${
                            exam.submittedAttempt.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {exam.submittedAttempt.percentage}%
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="p-4 bg-black/[0.015] dark:bg-white/[0.02] border-t border-black/5 dark:border-white/10">
                  {exam.userExamStatus === 'AVAILABLE' && (
                    <button
                      onClick={() => handleOpenInstructions(exam)}
                      className="w-full apple-btn-primary py-2.5 flex items-center justify-center gap-2 text-xs font-semibold"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Start Examination</span>
                    </button>
                  )}

                  {exam.userExamStatus === 'IN_PROGRESS' && exam.activeAttemptId && (
                    <button
                      onClick={() => handleLaunchExamWindow(exam.activeAttemptId!)}
                      className="w-full py-2.5 px-4 rounded-full text-xs font-semibold text-white bg-[#ff9500] hover:bg-[#ff9f0a] shadow-sm flex items-center justify-center gap-2 active:scale-98 transition-all"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Resume Attempt</span>
                    </button>
                  )}

                  {exam.userExamStatus === 'COMPLETED' && exam.submittedAttempt && (
                    <button
                      onClick={() => navigate(`/student/results/${exam.submittedAttempt!.id}`)}
                      className="w-full apple-btn-secondary py-2.5 flex items-center justify-center gap-2 text-xs font-medium"
                    >
                      <FileCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>View Results</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Apple Sheet / Alert Dialog for Pre-Exam Instructions */}
      {selectedExam && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="apple-card max-w-xl w-full overflow-hidden animate-apple-spring border border-black/10 dark:border-white/15">
            {/* Modal Header */}
            <div className="p-6 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-[#0071e3] dark:text-[#0a84ff] flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                    Exam Code of Conduct
                  </h3>
                  <p className="text-xs text-[#86868b] dark:text-[#98989d]">
                    {selectedExam.title} • {selectedExam.subject}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedExam(null)}
                className="p-1.5 rounded-full text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto text-xs leading-relaxed text-[#1d1d1f] dark:text-[#f5f5f7]">
              {/* Specs Pills */}
              <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] text-center">
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#86868b]">Duration</div>
                  <div className="font-semibold text-sm">{selectedExam.durationMinutes} mins</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#86868b]">Total Marks</div>
                  <div className="font-semibold text-sm">{selectedExam.totalMarks} Marks</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#86868b]">Passing Score</div>
                  <div className="font-semibold text-sm">{selectedExam.passingMarks} Marks</div>
                </div>
              </div>

              {/* Specific Instructor Instructions */}
              {selectedExam.instructions && (
                <div className="p-3.5 bg-blue-500/5 dark:bg-blue-500/10 rounded-2xl border border-blue-500/15">
                  <h4 className="font-semibold text-[#0071e3] dark:text-[#0a84ff] text-[11px] uppercase tracking-wider mb-1">
                    Instructor Instructions
                  </h4>
                  <p className="text-xs text-[#1d1d1f] dark:text-[#f5f5f7] whitespace-pre-line">
                    {selectedExam.instructions}
                  </p>
                </div>
              )}

              {/* Automated Proctoring Notice */}
              <div className="p-3.5 bg-amber-500/5 dark:bg-amber-500/10 rounded-2xl border border-amber-500/15 space-y-2">
                <div className="flex items-center gap-1.5 text-[#ff9500] dark:text-[#ff9f0a] font-semibold text-[11px] uppercase tracking-wider">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Proctoring & Focus Loss Rules</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-xs text-[#1d1d1f] dark:text-[#f5f5f7]">
                  <li><strong>Isolated Window:</strong> The exam opens in a dedicated window without browser navigation.</li>
                  <li><strong>Focus Detection:</strong> Switching tabs or switching windows triggers recorded focus-loss alerts.</li>
                  <li><strong>Auto-Submit:</strong> Reaching 0:00 will automatically submit all saved answers.</li>
                </ul>
              </div>

              {/* Honor Pledge Checkbox */}
              <div className="pt-2 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="agreePledge"
                  checked={agreedToRules}
                  onChange={(e) => setAgreedToRules(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded-md border-black/20 dark:border-white/20 text-[#0071e3] focus:ring-[#0071e3]"
                />
                <label htmlFor="agreePledge" className="text-xs text-[#86868b] dark:text-[#98989d] cursor-pointer leading-normal">
                  I agree to complete this test independently in compliance with academic honor principles.
                </label>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-black/5 dark:border-white/10 bg-black/[0.015] dark:bg-white/[0.02] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedExam(null)}
                className="apple-btn-secondary px-4 py-2 text-xs"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={!agreedToRules || startingExam}
                onClick={handleStartExamConfirm}
                className="apple-btn-primary px-5 py-2 text-xs flex items-center gap-1.5 disabled:opacity-50"
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
