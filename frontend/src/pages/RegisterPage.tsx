import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { UserRole } from '../types';
import { ShieldCheck, User, Mail, Lock, Building, IdCard, ArrowRight, Loader2, GraduationCap, ShieldAlert } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        department: department || undefined
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
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#f5f5f7] dark:bg-black transition-colors duration-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0071e3] to-[#409cff] items-center justify-center text-white shadow-lg shadow-blue-500/25 mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
          Create Your Account
        </h1>
        <p className="mt-1.5 text-sm text-[#86868b] dark:text-[#98989d]">
          Set up an institutional exam profile
        </p>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="apple-card p-6 sm:p-8">
          {/* iOS Segmented Role Switcher */}
          <div className="mb-6">
            <label className="block text-xs font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-2 text-center">
              Account Role
            </label>
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-black/5 dark:border-white/10">
              <button
                type="button"
                onClick={() => setRole('STUDENT')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                  role === 'STUDENT'
                    ? 'bg-white dark:bg-[#1c1c1e] text-[#0071e3] dark:text-[#0a84ff] shadow-sm'
                    : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Student</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('ADMIN')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                  role === 'ADMIN'
                    ? 'bg-white dark:bg-[#1c1c1e] text-purple-600 dark:text-purple-400 shadow-sm'
                    : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Administrator</span>
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs sm:text-sm text-[#ff3b30] dark:text-[#ff453a]">
              {errorMsg}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5 ml-1">
                Full Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#86868b]">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Johnson"
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-[#f5f5f7] dark:bg-[#2c2c2e] focus:bg-white dark:focus:bg-[#1c1c1e] border border-black/5 dark:border-white/10 rounded-xl text-sm text-[#1d1d1f] dark:text-[#f5f5f7] placeholder-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#0071e3] dark:focus:ring-[#0a84ff] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5 ml-1">
                Email Address *
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
                Password (min 6 characters) *
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

            {role === 'STUDENT' && (
              <div>
                <label className="block text-xs font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5 ml-1">
                  Student ID Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#86868b]">
                    <IdCard className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="e.g. STU-2026-003"
                    className="block w-full pl-10 pr-3.5 py-2.5 bg-[#f5f5f7] dark:bg-[#2c2c2e] focus:bg-white dark:focus:bg-[#1c1c1e] border border-black/5 dark:border-white/10 rounded-xl text-sm text-[#1d1d1f] dark:text-[#f5f5f7] placeholder-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#0071e3] dark:focus:ring-[#0a84ff] transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5 ml-1">
                Department / Faculty
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#86868b]">
                  <Building className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Computer Science"
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

          <div className="mt-6 text-center text-xs text-[#86868b] dark:text-[#98989d]">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#0071e3] dark:text-[#0a84ff] hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
