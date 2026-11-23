import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ShieldCheck, Lock, Mail, ArrowRight, Loader2, KeyRound, Sparkles } from 'lucide-react';

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
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/25">
            <ShieldCheck className="w-8 h-8" />
          </div>
        </div>
        <h2 className="mt-5 text-center text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Sign In to ExamSecure
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
          Secure, Proctor-Enabled Examination Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 shadow-xl shadow-slate-200/50 dark:shadow-none sm:rounded-2xl border border-slate-200/80 dark:border-slate-800">
          {/* Quick Fill Demo Banner */}
          <div className="mb-6 p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800/60 dark:to-indigo-950/40 rounded-xl border border-blue-100 dark:border-blue-900/50">
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-blue-900 dark:text-blue-300">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Demo Quick Fill:</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('student@exam.com', 'student123')}
                className="text-left px-3 py-2 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 rounded-lg transition-all group"
              >
                <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 flex items-center justify-between">
                  <span>Student</span>
                  <KeyRound className="w-3 h-3 text-slate-400 group-hover:text-blue-500" />
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">student@exam.com</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('admin@exam.com', 'admin123')}
                className="text-left px-3 py-2 bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 rounded-lg transition-all group"
              >
                <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-600 flex items-center justify-between">
                  <span>Admin</span>
                  <KeyRound className="w-3 h-3 text-slate-400 group-hover:text-purple-500" />
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">admin@exam.com</div>
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-sm text-rose-700 dark:text-rose-300">
              {errorMsg}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-5 h-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-5 h-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
          </form>

          <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
