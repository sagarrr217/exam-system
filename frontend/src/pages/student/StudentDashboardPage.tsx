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
  ExternalLink
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Student Examination Portal
              </h1>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Welcome, <span className="font-semibold text-slate-900 dark:text-white">{user?.name}</span>. Access your scheduled tests and review performance.
              </p>
            </div>

            <button
              onClick={fetchExams}
              disabled={loading}
              className="inline-flex items-center gap-2 self-start md:self-auto px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors disabled:opacity-50"
            >
              <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Navigation Tabs & Search */}
          <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                onClick={() => setActiveTab('AVAILABLE')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'AVAILABLE'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>Available</span>
                <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold">
                  {counts.available}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('IN_PROGRESS')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'IN_PROGRESS'
                    ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>In-Progress</span>
                <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold">
                  {counts.inProgress}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('COMPLETED')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'COMPLETED'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>Completed</span>
                <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                  {counts.completed}
                </span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title or subject..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-3" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Loading examinations...</p>
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-8">
            <BookOpen className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No Examinations Found</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {searchQuery
                ? `No examinations matching "${searchQuery}". Try clearing your search.`
                : activeTab === 'AVAILABLE'
                ? 'You have no examinations currently available to take.'
                : activeTab === 'IN_PROGRESS'
                ? 'You do not have any unfinished or active examination sessions.'
                : 'You have not completed any examinations yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExams.map((exam) => (
              <div
                key={exam.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden group"
              >
                <div className="p-6 flex-1 flex flex-col">
                  {/* Card Header: Subject & Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {exam.subject}
                    </span>

                    {exam.userExamStatus === 'AVAILABLE' && (
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        Available
                      </span>
                    )}

                    {exam.userExamStatus === 'IN_PROGRESS' && (
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800 animate-pulse">
                        In Progress
                      </span>
                    )}

                    {exam.userExamStatus === 'COMPLETED' && (
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                          exam.submittedAttempt?.passed
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                        }`}
                      >
                        {exam.submittedAttempt?.passed ? 'Passed' : 'Completed'}
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                    {exam.title}
                  </h3>
                  {exam.description && (
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {exam.description}
                    </p>
                  )}

                  {/* Metadata Grid */}
                  <div className="mt-5 grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <span>{exam.durationMinutes} Minutes</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                      <span>{exam.totalMarks} Total Marks</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>Pass: {exam.passingMarks} Marks</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <span>{exam._count?.questions ?? exam.totalQuestions ?? 'N/A'} Questions</span>
                    </div>
                  </div>

                  {/* If Completed, show student score card */}
                  {exam.userExamStatus === 'COMPLETED' && exam.submittedAttempt && (
                    <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
                      <div>
                        <div className="text-slate-500">Your Score:</div>
                        <div className="text-base font-extrabold text-slate-900 dark:text-white">
                          {exam.submittedAttempt.score} / {exam.totalMarks}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-slate-500">Percentage:</div>
                        <div
                          className={`text-base font-extrabold ${
                            exam.submittedAttempt.passed ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {exam.submittedAttempt.percentage}%
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800">
                  {exam.userExamStatus === 'AVAILABLE' && (
                    <button
                      onClick={() => handleOpenInstructions(exam)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Start Examination</span>
                    </button>
                  )}

                  {exam.userExamStatus === 'IN_PROGRESS' && exam.activeAttemptId && (
                    <button
                      onClick={() => handleLaunchExamWindow(exam.activeAttemptId!)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 shadow-sm transition-all"
                    >
                      <RotateCw className="w-4 h-4" />
                      <span>Resume Active Attempt</span>
                    </button>
                  )}

                  {exam.userExamStatus === 'COMPLETED' && exam.submittedAttempt && (
                    <button
                      onClick={() => navigate(`/student/results/${exam.submittedAttempt!.id}`)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-sm transition-all"
                    >
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      <span>View Results</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pre-Exam Instructions & Agreement Modal */}
      {selectedExam && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden animate-fade-in">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Examination Instructions & Code of Conduct
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedExam.title} • {selectedExam.subject}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedExam(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {/* Exam Specs Box */}
              <div className="grid grid-cols-3 gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 text-center">
                <div>
                  <div className="text-xs text-slate-400">Duration</div>
                  <div className="font-bold text-slate-900 dark:text-white">{selectedExam.durationMinutes} mins</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Total Marks</div>
                  <div className="font-bold text-slate-900 dark:text-white">{selectedExam.totalMarks} Marks</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Passing Score</div>
                  <div className="font-bold text-slate-900 dark:text-white">{selectedExam.passingMarks} Marks</div>
                </div>
              </div>

              {/* Specific Instructor Instructions */}
              {selectedExam.instructions && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900/60">
                  <h4 className="font-bold text-blue-900 dark:text-blue-300 text-xs uppercase tracking-wider mb-1">
                    Instructor Instructions
                  </h4>
                  <p className="text-blue-800 dark:text-blue-200 text-xs whitespace-pre-line">
                    {selectedExam.instructions}
                  </p>
                </div>
              )}

              {/* Automated Proctoring Notice */}
              <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900/60 space-y-2">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>Automated Proctoring & Integrity Rules</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-xs text-amber-900 dark:text-amber-200">
                  <li><strong>Dedicated Exam Environment:</strong> The test runs in an isolated, distraction-free window.</li>
                  <li><strong>Browser Focus-Loss Tracking:</strong> Switching tabs, minimizing the browser, or clicking outside will trigger automated focus-loss alerts logged to the instructor.</li>
                  <li><strong>Warning Threshold:</strong> Exceeding {selectedExam.focusLossThreshold || 3} focus-loss incidents may mark your attempt for academic integrity review.</li>
                  <li><strong>Autosave:</strong> Every question response is automatically saved to the cloud in real time.</li>
                  <li><strong>Strict Timer:</strong> Once the countdown reaches 0:00, the exam automatically finalizes and submits.</li>
                </ul>
              </div>

              {/* Honor Pledge Checkbox */}
              <div className="pt-2 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="agreePledge"
                  checked={agreedToRules}
                  onChange={(e) => setAgreedToRules(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="agreePledge" className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  I confirm that I am taking this examination independently without unauthorized assistance, external browser windows, or collaboration. I understand all focus-loss incidents are monitored.
                </label>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedExam(null)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={!agreedToRules || startingExam}
                onClick={handleStartExamConfirm}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {startingExam ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Launching Environment...</span>
                  </>
                ) : (
                  <>
                    <span>Agree & Launch Exam</span>
                    <ExternalLink className="w-4 h-4" />
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
