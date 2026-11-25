import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  ShieldCheck,
  ArrowRight,
  LogIn,
  UserPlus,
  CheckCircle2,
  UserCheck,
} from 'lucide-react';
import { useRoleGateway } from '../context/RoleGatewayContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

interface RoleGatewayModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const RoleGatewayModal: React.FC<RoleGatewayModalProps> = ({ isOpen, onClose }) => {
  const { isGatewayOpen, closeGateway } = useRoleGateway();
  const { user, login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const open = isOpen ?? isGatewayOpen;
  const handleClose = onClose ?? closeGateway;

  const [launchingRole, setLaunchingRole] = useState<'STUDENT' | 'ADMIN' | null>(null);

  const handleQuickEnter = async (role: 'STUDENT' | 'ADMIN') => {
    setLaunchingRole(role);
    try {
      const credentials =
        role === 'STUDENT'
          ? { email: 'student@exam.com', password: 'student123', role: 'STUDENT' as const }
          : { email: 'admin@exam.com', password: 'admin123', role: 'ADMIN' as const };

      const loggedUser = await login(credentials);
      toast.success(
        `Signed in as ${loggedUser.name} (${role === 'ADMIN' ? 'Administrator' : 'Student'})`
      );
      handleClose();
      navigate(role === 'ADMIN' ? '/admin' : '/student');
    } catch (err: any) {
      toast.error(err?.message || 'Unable to sign in with demo profile. Please sign in manually.');
    } finally {
      setLaunchingRole(null);
    }
  };

  const handleGoAuth = (path: '/login' | '/register', role: 'STUDENT' | 'ADMIN') => {
    handleClose();
    navigate(`${path}?role=${role}`);
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      titleId="role-gateway-title"
      maxWidthClass="max-w-3xl"
      headerBadge={
        <Badge variant="brand" icon={<UserCheck className="w-3.5 h-3.5" />}>
          Workspace Selector
        </Badge>
      }
      title="Who are you?"
      subtitle="Select your role to launch directly into the Student Portal or Admin Console, or sign in with your own credentials."
    >
      <div className="space-y-6">
        {user && (
          <div className="p-4 rounded-[12px] bg-[var(--bg-tray)] border border-[var(--border-default)] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[var(--accent-success)] shrink-0" aria-hidden="true" />
              <p className="text-sm text-[var(--text-primary)]">
                Currently active as <span className="font-semibold">{user.name}</span>{' '}
                <span className="text-[var(--text-secondary)]">({user.role})</span>
              </p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                handleClose();
                navigate(user.role === 'ADMIN' ? '/admin' : '/student');
              }}
            >
              Continue to {user.role === 'ADMIN' ? 'Admin' : 'Student'}
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Student Card */}
          <div className="ui-card ui-card-hover p-6 flex flex-col justify-between bg-[var(--bg-surface)]">
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="w-12 h-12 rounded-[12px] bg-teal-50 dark:bg-teal-950/60 text-[var(--accent-secondary)] flex items-center justify-center border border-teal-200 dark:border-teal-800">
                  <GraduationCap className="w-6 h-6" aria-hidden="true" />
                </div>
                <Badge variant="teal">Candidate</Badge>
              </div>

              <h3 className="text-xl font-bold text-[var(--text-primary)]">
                I am a Student
              </h3>
              <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">
                Access active exams, launch locked focus-monitored assessments, and view instant analytical score breakdowns.
              </p>

              <ul className="mt-4 space-y-2 text-sm text-[var(--text-secondary)]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[var(--accent-success)] shrink-0" aria-hidden="true" />
                  <span>Full-screen proctored exam portal</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[var(--accent-success)] shrink-0" aria-hidden="true" />
                  <span>Auto-saved responses across refreshes</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-5 border-t border-[var(--border-default)] space-y-3">
              <Button
                variant="teal"
                size="lg"
                fullWidth
                loading={launchingRole === 'STUDENT'}
                disabled={launchingRole !== null}
                onClick={() => handleQuickEnter('STUDENT')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Enter Student Dashboard
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleGoAuth('/login', 'STUDENT')}
                  leftIcon={<LogIn className="w-3.5 h-3.5" />}
                >
                  Sign In
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleGoAuth('/register', 'STUDENT')}
                  leftIcon={<UserPlus className="w-3.5 h-3.5" />}
                >
                  Register
                </Button>
              </div>
              <p className="text-xs font-mono text-[var(--text-muted)] text-center">
                Demo: student@exam.com
              </p>
            </div>
          </div>

          {/* Admin Card */}
          <div className="ui-card ui-card-hover p-6 flex flex-col justify-between bg-[var(--bg-surface)]">
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="w-12 h-12 rounded-[12px] bg-blue-50 dark:bg-blue-950/60 text-[var(--accent-primary)] flex items-center justify-center border border-blue-200 dark:border-blue-800">
                  <ShieldCheck className="w-6 h-6" aria-hidden="true" />
                </div>
                <Badge variant="brand">Faculty / Admin</Badge>
              </div>

              <h3 className="text-xl font-bold text-[var(--text-primary)]">
                I am an Admin
              </h3>
              <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">
                Design exams across 7 question types, draft questions via Gemini AI Studio, and audit student integrity telemetry.
              </p>

              <ul className="mt-4 space-y-2 text-sm text-[var(--text-secondary)]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[var(--accent-success)] shrink-0" aria-hidden="true" />
                  <span>Gemini AI Question Studio + OCR</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[var(--accent-success)] shrink-0" aria-hidden="true" />
                  <span>Focus-loss audit logs & CSV export</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-5 border-t border-[var(--border-default)] space-y-3">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                loading={launchingRole === 'ADMIN'}
                disabled={launchingRole !== null}
                onClick={() => handleQuickEnter('ADMIN')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Enter Admin Dashboard
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleGoAuth('/login', 'ADMIN')}
                  leftIcon={<LogIn className="w-3.5 h-3.5" />}
                >
                  Sign In
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleGoAuth('/register', 'ADMIN')}
                  leftIcon={<UserPlus className="w-3.5 h-3.5" />}
                >
                  Register
                </Button>
              </div>
              <p className="text-xs font-mono text-[var(--text-muted)] text-center">
                Demo: admin@exam.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
