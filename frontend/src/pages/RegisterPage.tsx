import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  Building2,
  Hash,
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

export const RegisterPage: React.FC = () => {
  const { user, loading: authLoading, register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialRole = searchParams.get('role') === 'ADMIN' ? 'ADMIN' : 'STUDENT';
  const [role, setRole] = useState<'STUDENT' | 'ADMIN'>(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

    if (!name.trim() || !email.trim() || !password) {
      setErrorMsg('Please complete all required fields.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        department: department.trim() || 'Computer Science',
        ...(role === 'STUDENT' && studentId.trim() ? { studentId: studentId.trim() } : {}),
      });
      toast.success(`Account created — welcome, ${created.name}!`);
      navigate(created.role === 'ADMIN' ? '/admin' : '/student', { replace: true });
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to register account. Please verify your inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-10 sm:py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center bg-subtle-grid">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Context Card */}
        <div className="lg:col-span-5 ui-card p-8 flex flex-col justify-between bg-[var(--bg-surface)]">
          <div className="space-y-5">
            <Badge variant="teal" icon={<GraduationCap className="w-3.5 h-3.5" />}>
              New Account Provisioning
            </Badge>
            <h1 className="text-3xl font-extrabold text-[var(--text-primary)] leading-tight">
              Create your <span className="font-serif italic text-[var(--accent-primary)]">ExamSecure</span> identity.
            </h1>
            <p className="text-base text-[var(--text-secondary)] leading-relaxed">
              Register as a Student candidate to sit assessments immediately, or provision an Instructor/Admin profile to author exams.
            </p>

            <ul className="space-y-3 pt-2 text-sm text-[var(--text-secondary)]">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[var(--accent-success)] shrink-0 mt-0.5" aria-hidden="true" />
                <span>Instant workspace provisioning upon form submission.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[var(--accent-success)] shrink-0 mt-0.5" aria-hidden="true" />
                <span>Published demo assessments immediately accessible in your dashboard.</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-6 border-t border-[var(--border-default)]">
            <p className="text-sm text-[var(--text-secondary)]">
              Already have institutional credentials?{' '}
              <Link to={`/login?role=${role}`} className="font-semibold text-[var(--accent-primary)] hover:underline">
                Sign in instead
              </Link>
            </p>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="lg:col-span-7 ui-card p-6 sm:p-10 bg-[var(--bg-surface)]">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">Registration Details</h2>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Choose your account type below and complete your profile.
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <label htmlFor="reg-name" className="block text-sm font-semibold text-[var(--text-primary)]">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[var(--text-muted)] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                  <input
                    id="reg-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Johnson"
                    className="w-full min-h-[48px] pl-11 pr-4 rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-canvas)] text-base text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label htmlFor="reg-email" className="block text-sm font-semibold text-[var(--text-primary)]">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[var(--text-muted)] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                  <input
                    id="reg-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@university.edu"
                    className="w-full min-h-[48px] pl-11 pr-4 rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-canvas)] text-base text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none"
                  />
                </div>
              </div>

              {role === 'STUDENT' && (
                <div className="space-y-2">
                  <label htmlFor="reg-student-id" className="block text-sm font-semibold text-[var(--text-primary)]">
                    Student Roll ID
                  </label>
                  <div className="relative">
                    <Hash className="w-4 h-4 text-[var(--text-muted)] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                    <input
                      id="reg-student-id"
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="STU-2026-099"
                      className="w-full min-h-[48px] pl-11 pr-4 rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-canvas)] text-base text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div className={cn('space-y-2', role !== 'STUDENT' && 'sm:col-span-2')}>
                <label htmlFor="reg-dept" className="block text-sm font-semibold text-[var(--text-primary)]">
                  Department
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-[var(--text-muted)] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                  <input
                    id="reg-dept"
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Computer Science"
                    className="w-full min-h-[48px] pl-11 pr-4 rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-canvas)] text-base text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="reg-pass" className="block text-sm font-semibold text-[var(--text-primary)]">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[var(--text-muted)] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                  <input
                    id="reg-pass"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
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

              <div className="space-y-2">
                <label htmlFor="reg-confirm" className="block text-sm font-semibold text-[var(--text-primary)]">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[var(--text-muted)] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                  <input
                    id="reg-confirm"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full min-h-[48px] pl-11 pr-4 rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-canvas)] text-base text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none"
                  />
                </div>
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
              Create {role === 'ADMIN' ? 'Administrator' : 'Student'} Account
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
