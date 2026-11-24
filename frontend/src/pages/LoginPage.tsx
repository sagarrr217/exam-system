import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ShieldCheck, Lock, Mail, ArrowRight, Loader2, Sparkles, KeyRound } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#f5f5f7] dark:bg-black transition-colors duration-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0071e3] to-[#409cff] items-center justify-center text-white shadow-lg shadow-blue-500/25 mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
          Sign in to ExamSecure
        </h1>
        <p className="mt-1.5 text-sm text-[#86868b] dark:text-[#98989d]">
          Use your institutional account to continue
        </p>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="apple-card p-6 sm:p-8">
          {/* iOS Quick Fill Segment Card */}
          <div className="mb-6 p-3.5 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-2xl border border-black/5 dark:border-white/10">
            <div className="flex items-center gap-1.5 mb-2.5 text-xs font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
              <Sparkles className="w-3.5 h-3.5 text-[#0071e3] dark:text-[#0a84ff]" />
              <span>Demo Quick-Fill:</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('student@exam.com', 'student123')}
                className="text-left p-2.5 bg-white dark:bg-[#1c1c1e] hover:bg-black/[0.02] dark:hover:bg-white/[0.04] border border-black/5 dark:border-white/10 rounded-xl transition-all active:scale-98 group"
              >
                <div className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] group-hover:text-[#0071e3] dark:group-hover:text-[#0a84ff] flex items-center justify-between">
                  <span>Student</span>
                  <KeyRound className="w-3 h-3 text-[#86868b]" />
                </div>
                <div className="text-[11px] text-[#86868b] dark:text-[#98989d] truncate">student@exam.com</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('admin@exam.com', 'admin123')}
                className="text-left p-2.5 bg-white dark:bg-[#1c1c1e] hover:bg-black/[0.02] dark:hover:bg-white/[0.04] border border-black/5 dark:border-white/10 rounded-xl transition-all active:scale-98 group"
              >
                <div className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] group-hover:text-purple-600 dark:group-hover:text-purple-400 flex items-center justify-between">
                  <span>Admin</span>
                  <KeyRound className="w-3 h-3 text-[#86868b]" />
                </div>
                <div className="text-[11px] text-[#86868b] dark:text-[#98989d] truncate">admin@exam.com</div>
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs sm:text-sm text-[#ff3b30] dark:text-[#ff453a] flex items-center gap-2">
              <span>{errorMsg}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5 ml-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#86868b]">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-[#f5f5f7] dark:bg-[#2c2c2e] focus:bg-white dark:focus:bg-[#1c1c1e] border border-black/5 dark:border-white/10 rounded-xl text-sm text-[#1d1d1f] dark:text-[#f5f5f7] placeholder-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#0071e3] dark:focus:ring-[#0a84ff] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5 ml-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#86868b]">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-[#f5f5f7] dark:bg-[#2c2c2e] focus:bg-white dark:focus:bg-[#1c1c1e] border border-black/5 dark:border-white/10 rounded-xl text-sm text-[#1d1d1f] dark:text-[#f5f5f7] placeholder-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#0071e3] dark:focus:ring-[#0a84ff] transition-all"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full apple-btn-primary py-3 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
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

          <div className="mt-6 text-center text-xs text-[#86868b] dark:text-[#98989d]">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-[#0071e3] dark:text-[#0a84ff] hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
