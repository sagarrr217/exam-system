import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  ShieldCheck,
  ArrowRight,
  X,
  CheckCircle2,
  Sparkles,
  Lock,
  Loader2,
  KeyRound,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { UserRole } from '../types';

interface RoleGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoleGatewayModal: React.FC<RoleGatewayModalProps> = ({ isOpen, onClose }) => {
  const { user, login } = useAuth();
  const { success, error: showError, info } = useToast();
  const navigate = useNavigate();

  const [authenticatingRole, setAuthenticatingRole] = useState<UserRole | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !authenticatingRole) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, authenticatingRole, onClose]);

  const handleSelectRole = async (selectedRole: UserRole) => {
    if (authenticatingRole) return;

    // If already signed in with the chosen role, jump straight to its dashboard
    if (user && user.role === selectedRole) {
      onClose();
      navigate(selectedRole === 'ADMIN' ? '/admin' : '/student');
      return;
    }

    setAuthenticatingRole(selectedRole);

    const demoCreds =
      selectedRole === 'ADMIN'
        ? { email: 'admin@exam.com', password: 'admin123', role: 'ADMIN' }
        : { email: 'student@exam.com', password: 'student123', role: 'STUDENT' };

    try {
      const loggedInUser = await login(demoCreds);
      success(
        selectedRole === 'ADMIN'
          ? `Admin Console ready — ${loggedInUser.name}`
          : `Student Workspace ready — ${loggedInUser.name}`
      );
      onClose();
      navigate(loggedInUser.role === 'ADMIN' ? '/admin' : '/student');
    } catch (err: any) {
      showError(err?.message || 'Unable to auto-connect demo session. Redirecting to sign in...');
      info(`Please sign in as ${selectedRole.toLowerCase()} with your credentials.`);
      onClose();
      navigate(`/login?role=${selectedRole}`);
    } finally {
      setAuthenticatingRole(null);
    }
  };

  const handleCustomAuth = (role: UserRole, path: '/login' | '/register') => {
    onClose();
    navigate(`${path}?role=${role}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[65] flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-xl overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="role-gateway-title"
          onClick={() => !authenticatingRole && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="relative w-full max-w-4xl rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-strong)] shadow-2xl overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Architectural Bar */}
            <div className="px-6 sm:px-8 py-5 border-b border-[var(--border-hairline)] flex items-center justify-between bg-[var(--bg-tray)]/50">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest px-2.5 py-1 rounded-md bg-[var(--accent-signal)]/10 text-[var(--accent-signal)] border border-[var(--accent-signal)]/25 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-signal)] animate-pulse" />
                  Access Gateway
                </span>
                <span className="hidden sm:inline font-mono text-xs text-[var(--text-tertiary)]">
                  DUAL-INTERFACE SESSION ROUTER
                </span>
              </div>

              <button
                type="button"
                disabled={Boolean(authenticatingRole)}
                onClick={onClose}
                className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/10 transition-colors disabled:opacity-40"
                aria-label="Close role selector"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Header Prompt: "Who are you?" */}
            <div className="px-6 sm:px-8 pt-7 pb-4">
              <h2
                id="role-gateway-title"
                className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]"
              >
                Who are you?
              </h2>
              <p className="mt-2 text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl">
                Choose your role to launch directly into your live dashboard, or sign in with your institutional credentials.
              </p>
            </div>

            {/* Two Tactile Role Portals */}
            <div className="px-6 sm:px-8 pb-8 pt-2 grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* STUDENT PORTAL CARD */}
              <div className="group flex flex-col rounded-2xl border border-[var(--border-hairline)] hover:border-[#22D3EE]/60 bg-[var(--bg-tray)]/40 hover:bg-[var(--bg-tray)]/80 transition-all duration-200 overflow-hidden">
                <button
                  type="button"
                  disabled={Boolean(authenticatingRole)}
                  onClick={() => handleSelectRole('STUDENT')}
                  className="flex-1 p-6 text-left flex flex-col justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-[#22D3EE]"
                >
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-5">
                      <div className="w-12 h-12 rounded-xl bg-[#0891B2]/15 dark:bg-[#22D3EE]/15 border border-[#0891B2]/30 dark:border-[#22D3EE]/30 text-[#0891B2] dark:text-[#22D3EE] flex items-center justify-center group-hover:scale-105 transition-transform">
                        <GraduationCap className="w-6 h-6" />
                      </div>
                      <span className="font-mono text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md bg-black/5 dark:bg-white/5 text-[var(--text-secondary)]">
                        Candidate Mode
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                      <span>Student</span>
                      <ArrowRight className="w-5 h-5 text-[#0891B2] dark:text-[#22D3EE] opacity-70 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
                    </h3>
                    <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">
                      Enter your personal examination hub to take timed proctored assessments, resume active sessions, and inspect graded breakdowns.
                    </p>

                    <ul className="mt-5 space-y-2 text-xs text-[var(--text-secondary)]">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D] dark:text-[#10B981] flex-shrink-0" />
                        <span>Distraction-free fullscreen exam portal & autosave</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D] dark:text-[#10B981] flex-shrink-0" />
                        <span>Instant performance rings & instructor rationales</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[var(--border-hairline)] flex items-center justify-between">
                    <div className="font-mono text-[11px] text-[var(--text-tertiary)]">
                      {user?.role === 'STUDENT'
                        ? `Signed in: ${user.name}`
                        : 'Demo: Alex Johnson (STU-2026-001)'}
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#0891B2] dark:bg-[#22D3EE] text-white dark:text-[#0A0B0E] shadow-sm">
                      {authenticatingRole === 'STUDENT' ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Entering...</span>
                        </>
                      ) : (
                        <>
                          <span>Open Student Dashboard</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </span>
                  </div>
                </button>

                <div className="px-6 py-3 bg-[var(--bg-surface)] border-t border-[var(--border-hairline)] flex items-center justify-between text-xs">
                  <button
                    type="button"
                    disabled={Boolean(authenticatingRole)}
                    onClick={() => handleCustomAuth('STUDENT', '/login')}
                    className="inline-flex items-center gap-1.5 font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Custom Student Sign In</span>
                  </button>
                  <button
                    type="button"
                    disabled={Boolean(authenticatingRole)}
                    onClick={() => handleCustomAuth('STUDENT', '/register')}
                    className="inline-flex items-center gap-1 font-medium text-[#0891B2] dark:text-[#22D3EE] hover:underline"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Register</span>
                  </button>
                </div>
              </div>

              {/* ADMIN PORTAL CARD */}
              <div className="group flex flex-col rounded-2xl border border-[var(--border-hairline)] hover:border-[var(--accent-signal)]/60 bg-[var(--bg-tray)]/40 hover:bg-[var(--bg-tray)]/80 transition-all duration-200 overflow-hidden">
                <button
                  type="button"
                  disabled={Boolean(authenticatingRole)}
                  onClick={() => handleSelectRole('ADMIN')}
                  className="flex-1 p-6 text-left flex flex-col justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-signal)]"
                >
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-5">
                      <div className="w-12 h-12 rounded-xl bg-[var(--accent-signal)]/15 border border-[var(--accent-signal)]/30 text-[var(--accent-signal)] flex items-center justify-center group-hover:scale-105 transition-transform">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <span className="font-mono text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md bg-black/5 dark:bg-white/5 text-[var(--text-secondary)]">
                        Faculty Mode
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                      <span>Admin</span>
                      <ArrowRight className="w-5 h-5 text-[var(--accent-signal)] opacity-70 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
                    </h3>
                    <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">
                      Launch the Faculty Command Console to architect exams, synthesize questions from syllabus PDFs via Gemini AI, and audit proctoring logs.
                    </p>

                    <ul className="mt-5 space-y-2 text-xs text-[var(--text-secondary)]">
                      <li className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-[var(--accent-signal)] flex-shrink-0" />
                        <span>Gemini Multimodal PDF/Image Question Studio</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Lock className="w-3.5 h-3.5 text-[var(--accent-signal)] flex-shrink-0" />
                        <span>Focus-loss audit logs, cohort metrics & CSV export</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[var(--border-hairline)] flex items-center justify-between">
                    <div className="font-mono text-[11px] text-[var(--text-tertiary)]">
                      {user?.role === 'ADMIN'
                        ? `Signed in: ${user.name}`
                        : 'Demo: Dr. Sarah Connor (Faculty)'}
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[var(--accent-signal)] text-white shadow-sm">
                      {authenticatingRole === 'ADMIN' ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Entering...</span>
                        </>
                      ) : (
                        <>
                          <span>Open Admin Dashboard</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </span>
                  </div>
                </button>

                <div className="px-6 py-3 bg-[var(--bg-surface)] border-t border-[var(--border-hairline)] flex items-center justify-between text-xs">
                  <button
                    type="button"
                    disabled={Boolean(authenticatingRole)}
                    onClick={() => handleCustomAuth('ADMIN', '/login')}
                    className="inline-flex items-center gap-1.5 font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Custom Admin Sign In</span>
                  </button>
                  <button
                    type="button"
                    disabled={Boolean(authenticatingRole)}
                    onClick={() => handleCustomAuth('ADMIN', '/register')}
                    className="inline-flex items-center gap-1 font-medium text-[var(--accent-signal)] hover:underline"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Register</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
