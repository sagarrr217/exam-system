import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { UserRole } from '../types';
import { BrandMark } from '../components/BrandMark';
import {
  User,
  Mail,
  Lock,
  Building,
  IdCard,
  ArrowRight,
  Loader2,
  GraduationCap,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialRole: UserRole = searchParams.get('role') === 'ADMIN' ? 'ADMIN' : 'STUDENT';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(initialRole);
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get('role') === 'ADMIN') setRole('ADMIN');
    else if (searchParams.get('role') === 'STUDENT') setRole('STUDENT');
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!name || !email || !password) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const user = await register({
        name,
        email,
        password,
        role,
        studentId: role === 'STUDENT' ? studentId || undefined : undefined,
        department: department || undefined,
      });

      success(`Account created successfully! Welcome, ${user.name}`);
      if (user.role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/student', { replace: true });
      }
    } catch (err: any) {
      const message = err.message || 'Registration failed. Please check your details.';
      setErrorMsg(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[var(--bg-canvas)] grid grid-cols-1 lg:grid-cols-12">
      {/* Left Architectural Panel */}
      <div className="hidden lg:flex lg:col-span-5 bg-[#141413] dark:bg-[#0E1016] text-[#F4F3EF] p-12 flex-col justify-between border-r border-white/10">
        <div className="space-y-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-mono text-xs text-[#9297A5] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Showcase</span>
          </Link>

          <div className="pt-8 space-y-4">
            <BrandMark size="lg" />
            <div className="font-mono text-xs uppercase tracking-widest text-[#22D3EE]">
              Institutional Onboarding
            </div>
            <h1 className="font-display text-4xl font-bold leading-tight tracking-tight">
              Provision your{' '}
              <span className="font-serif italic font-normal text-[#FF5A36]">
                {role === 'ADMIN' ? 'Faculty Console' : 'Candidate Profile'}
              </span>
              .
            </h1>
            <p className="text-sm text-[#9297A5] leading-relaxed max-w-md">
              {role === 'ADMIN'
                ? 'Faculty accounts gain full access to exam authoring, Gemini Multimodal PDF ingestion, proctoring logs, and CSV grade exports.'
                : 'Student profiles connect directly to published department exams with autosaved attempts and detailed performance reviews.'}
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 font-mono text-[11px] text-[#9297A5]">
          JWT ENCRYPTED • BCRYPT CREDENTIAL HASHING
        </div>
      </div>

      {/* Right Registration Form */}
      <div className="lg:col-span-7 flex flex-col justify-center py-10 px-4 sm:px-8 lg:px-16">
        <div className="w-full max-w-lg mx-auto">
          <div className="mb-6">
            <div className="lg:hidden mb-4">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 font-mono text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Landing</span>
              </Link>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
              Create Your Account
            </h2>
            <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
              Select your account role and complete your profile details.
            </p>
          </div>

          <div className="studio-card p-6 sm:p-8 space-y-5">
            {/* Role Switcher */}
            <div>
              <span className="block font-mono text-[11px] uppercase tracking-wider font-semibold text-[var(--text-secondary)] mb-2">
                Select Workspace Role
              </span>
              <div className="grid grid-cols-2 p-1 rounded-xl bg-[var(--bg-tray)] border border-[var(--border-hairline)]">
                <button
                  type="button"
                  onClick={() => setRole('STUDENT')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                    role === 'STUDENT'
                      ? 'bg-[var(--bg-surface)] text-[#0891B2] dark:text-[#22D3EE] border border-[var(--border-hairline)] shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('ADMIN')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                    role === 'ADMIN'
                      ? 'bg-[var(--bg-surface)] text-[var(--accent-signal)] border border-[var(--border-hairline)] shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Administrator</span>
                </button>
              </div>
            </div>

            {errorMsg && (
              <div
                role="alert"
                className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs sm:text-sm text-rose-600 dark:text-rose-400"
              >
                {errorMsg}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="reg-name"
                  className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5"
                >
                  Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-tertiary)]">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    id="reg-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Johnson"
                    className="block w-full pl-10 pr-3.5 py-2.5 bg-[var(--bg-tray)] focus:bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-signal)] transition-all"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="reg-email"
                  className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5"
                >
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-tertiary)]">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="reg-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@university.edu"
                    className="block w-full pl-10 pr-3.5 py-2.5 bg-[var(--bg-tray)] focus:bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-signal)] transition-all"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="reg-password"
                  className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5"
                >
                  Password (min 6 characters) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-tertiary)]">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="reg-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-10 pr-3.5 py-2.5 bg-[var(--bg-tray)] focus:bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-signal)] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {role === 'STUDENT' && (
                  <div>
                    <label
                      htmlFor="reg-student-id"
                      className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5"
                    >
                      Student ID
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-tertiary)]">
                        <IdCard className="h-4 w-4" />
                      </div>
                      <input
                        id="reg-student-id"
                        type="text"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        placeholder="STU-2026-003"
                        className="block w-full pl-10 pr-3.5 py-2.5 bg-[var(--bg-tray)] focus:bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-signal)] transition-all"
                      />
                    </div>
                  </div>
                )}

                <div className={role === 'STUDENT' ? '' : 'sm:col-span-2'}>
                  <label
                    htmlFor="reg-dept"
                    className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5"
                  >
                    Department / Faculty
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-tertiary)]">
                      <Building className="h-4 w-4" />
                    </div>
                    <input
                      id="reg-dept"
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="Computer Science"
                      className="block w-full pl-10 pr-3.5 py-2.5 bg-[var(--bg-tray)] focus:bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-signal)] transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-signal py-3 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="pt-2 border-t border-[var(--border-hairline)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
              <span>Already have an institutional profile?</span>
              <Link to="/login" className="font-semibold text-[var(--accent-signal)] hover:underline">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
