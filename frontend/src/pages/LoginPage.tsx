import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useRoleGateway } from '../context/RoleGatewayContext';
import { BrandMark } from '../components/BrandMark';
import {
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  KeyRound,
  Eye,
  EyeOff,
  ArrowLeft,
  ShieldCheck,
  GraduationCap,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { success, error: showError } = useToast();
  const { openGateway } = useRoleGateway();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const preselectedRole = searchParams.get('role');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (preselectedRole === 'ADMIN') {
      setEmail('admin@exam.com');
      setPassword('admin123');
    } else if (preselectedRole === 'STUDENT') {
      setEmail('student@exam.com');
      setPassword('student123');
    }
  }, [preselectedRole]);

  const from = (location.state as any)?.from?.pathname;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const user = await login({ email, password });
      success(`Welcome back, ${user.name}!`);

      if (from) {
        navigate(from, { replace: true });
      } else if (user.role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/student', { replace: true });
      }
    } catch (err: any) {
      const message = err.message || 'Login failed. Please check your credentials.';
      setErrorMsg(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[var(--bg-canvas)] grid grid-cols-1 lg:grid-cols-12">
      {/* Left Architectural Context Panel */}
      <div className="hidden lg:flex lg:col-span-5 bg-[#141413] dark:bg-[#0E1016] text-[#F4F3EF] p-12 flex-col justify-between border-r border-white/10 relative overflow-hidden">
        <div className="relative z-10 space-y-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-mono text-xs text-[#9297A5] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Showcase</span>
          </Link>

          <div className="pt-8 space-y-4">
            <BrandMark size="lg" />
            <div className="font-mono text-xs uppercase tracking-widest text-[#FF5A36]">
              Authenticated Access
            </div>
            <h1 className="font-display text-4xl font-bold leading-tight tracking-tight">
              One gateway.{' '}
              <span className="font-serif italic font-normal text-[#22D3EE]">
                Two strictly isolated
              </span>{' '}
              workspaces.
            </h1>
            <p className="text-sm text-[#9297A5] leading-relaxed max-w-md">
              Role-Based Access Control (RBAC) issues signed JWT tokens locked to your Student or Faculty Administrator privileges.
            </p>
          </div>
        </div>

        <div className="relative z-10 space-y-3 pt-8 border-t border-white/10">
          <div className="font-mono text-[11px] uppercase tracking-wider text-[#9297A5]">
            Want instant 1-click access?
          </div>
          <button
            type="button"
            onClick={openGateway}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-semibold text-white transition-colors"
          >
            <span>Open &ldquo;Who are you?&rdquo; Role Selector</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#FF5A36]" />
          </button>
        </div>
      </div>

      {/* Right Sign-In Form */}
      <div className="lg:col-span-7 flex flex-col justify-center py-10 px-4 sm:px-8 lg:px-16">
        <div className="w-full max-w-md mx-auto">
          <div className="mb-7">
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
              Sign in to ExamSecure
            </h2>
            <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
              Enter your institutional email or select a quick-fill demo profile below.
            </p>
          </div>

          <div className="studio-card p-6 sm:p-8 space-y-6">
            {/* Quick-Fill Profiles */}
            <div className="p-3.5 rounded-xl bg-[var(--bg-tray)] border border-[var(--border-hairline)] space-y-2.5">
              <div className="flex items-center justify-between font-mono text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                <span>Demo Credentials Quick-Fill</span>
                <KeyRound className="w-3.5 h-3.5" />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleQuickFill('student@exam.com', 'student123')}
                  className="text-left p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] hover:border-[#22D3EE]/60 transition-all group"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-primary)] group-hover:text-[#0891B2] dark:group-hover:text-[#22D3EE]">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Student</span>
                  </div>
                  <div className="font-mono text-[11px] text-[var(--text-secondary)] truncate mt-0.5">
                    student@exam.com
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill('admin@exam.com', 'admin123')}
                  className="text-left p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] hover:border-[var(--accent-signal)]/60 transition-all group"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-signal)]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Admin</span>
                  </div>
                  <div className="font-mono text-[11px] text-[var(--text-secondary)] truncate mt-0.5">
                    admin@exam.com
                  </div>
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
                  htmlFor="login-email"
                  className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-tertiary)]">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="login-email"
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
                  htmlFor="login-password"
                  className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-tertiary)]">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-10 pr-10 py-2.5 bg-[var(--bg-tray)] focus:bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-signal)] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
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
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="pt-2 border-t border-[var(--border-hairline)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
              <span>New candidate or faculty?</span>
              <Link to="/register" className="font-semibold text-[var(--accent-signal)] hover:underline">
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
