import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  GraduationCap,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { cn } from '../components/ui/cn';

export const LoginPage: React.FC = () => {
  const { user, loading: authLoading, login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialRole = searchParams.get('role') === 'ADMIN' ? 'ADMIN' : 'STUDENT';
  const [role, setRole] = useState<'STUDENT' | 'ADMIN'>(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && user && !submitting) {
      navigate(user.role === 'ADMIN' ? '/admin' : '/student', { replace: true });
    }
  }, [authLoading, user, submitting, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }

    setSubmitting(true);
    try {
      const signedIn = await login({ email: email.trim(), password, role });
      toast.success(`Welcome back, ${signedIn.name}`);
      navigate(signedIn.role === 'ADMIN' ? '/admin' : '/student', { replace: true });
    } catch (err: any) {
      setErrorMsg(err?.message || 'Invalid email, password, or role selection.');
    } finally {
      setSubmitting(false);
    }
  };

  const applyDemo = (demoRole: 'STUDENT' | 'ADMIN') => {
    setRole(demoRole);
    setErrorMsg('');
    if (demoRole === 'STUDENT') {
      setEmail('student@exam.com');
      setPassword('student123');
    } else {
      setEmail('admin@exam.com');
      setPassword('admin123');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-10 sm:py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center bg-subtle-grid">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Informational Context Panel */}
        <div className="lg:col-span-5 ui-card p-8 flex flex-col justify-between bg-[var(--bg-surface)]">
          <div className="space-y-5">
            <Badge variant="brand" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
              Role-Enforced Sign In
            </Badge>
            <h1 className="text-3xl font-extrabold text-[var(--text-primary)] leading-tight">
              Sign in to <span className="font-serif italic text-[var(--accent-primary)]">ExamSecure.</span>
            </h1>
            <p className="text-base text-[var(--text-secondary)] leading-relaxed">
              Authenticate directly into your isolated Student exam portal or Administrator authoring workspace.
            </p>

            <ul className="space-y-3 pt-2 text-sm text-[var(--text-secondary)]">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[var(--accent-success)] shrink-0 mt-0.5" aria-hidden="true" />
                <span>Role selection verified server-side against your institutional profile.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[var(--accent-success)] shrink-0 mt-0.5" aria-hidden="true" />
                <span>Exam progress auto-saved across network disconnects and refreshes.</span>
              </li>
            </ul>
          </div>

          {/* Demo Credential Quick-Fill */}
          <div className="mt-8 pt-6 border-t border-[var(--border-default)] space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Quick-Fill Demo Accounts
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                fullWidth
                onClick={() => applyDemo('STUDENT')}
                leftIcon={<GraduationCap className="w-4 h-4 text-[var(--accent-secondary)]" />}
              >
                Fill Student Demo (student@exam.com)
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                fullWidth
                onClick={() => applyDemo('ADMIN')}
                leftIcon={<ShieldCheck className="w-4 h-4 text-[var(--accent-primary)]" />}
              >
                Fill Admin Demo (admin@exam.com)
              </Button>
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="lg:col-span-7 ui-card p-6 sm:p-10 bg-[var(--bg-surface)]">
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div>
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">Account Credentials</h2>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Select your role and enter your email and password.
              </p>
            </div>

            {/* Role Toggle */}
            <div className="grid grid-cols-2 gap-3 p-1.5 rounded-[14px] bg-[var(--bg-tray)] border border-[var(--border-default)]">
              <button
                type="button"
                onClick={() => setRole('STUDENT')}
                className={cn(
                  'min-h-[44px] px-4 rounded-[10px] text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors focus-visible:outline-2 focus-visible:outline-[var(--accent-primary)]',
                  role === 'STUDENT'
                    ? 'bg-[var(--bg-surface)] text-[var(--accent-secondary)] shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                )}
              >
                <GraduationCap className="w-4 h-4" aria-hidden="true" />
                Student
              </button>
              <button
                type="button"
                onClick={() => setRole('ADMIN')}
                className={cn(
                  'min-h-[44px] px-4 rounded-[10px] text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors focus-visible:outline-2 focus-visible:outline-[var(--accent-primary)]',
                  role === 'ADMIN'
                    ? 'bg-[var(--bg-surface)] text-[var(--accent-primary)] shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                )}
              >
                <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                Administrator
              </button>
            </div>

            {errorMsg && (
              <div
                role="alert"
                className="p-4 rounded-[12px] bg-rose-50 border border-rose-200 text-rose-900 dark:bg-rose-950/60 dark:border-rose-800 dark:text-rose-100 flex items-start gap-3 text-sm"
              >
                <AlertCircle className="w-5 h-5 text-[var(--accent-danger)] shrink-0 mt-0.5" aria-hidden="true" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="login-email" className="block text-sm font-semibold text-[var(--text-primary)]">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[var(--text-muted)] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@exam.com"
                  className="w-full min-h-[48px] pl-11 pr-4 rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-canvas)] text-base text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="login-password" className="block text-sm font-semibold text-[var(--text-primary)]">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[var(--text-muted)] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full min-h-[48px] pl-11 pr-12 rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-canvas)] text-base text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="min-h-[44px] min-w-[44px] absolute right-1 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-[10px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tray)] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant={role === 'ADMIN' ? 'primary' : 'teal'}
              size="lg"
              fullWidth
              loading={submitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In as {role === 'ADMIN' ? 'Administrator' : 'Student'}
            </Button>

            <p className="text-sm text-center text-[var(--text-secondary)]">
              Don&apos;t have an account yet?{' '}
              <Link
                to={`/register?role=${role}`}
                className="font-semibold text-[var(--accent-primary)] hover:underline"
              >
                Create an account
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};
