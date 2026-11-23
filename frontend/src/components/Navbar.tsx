import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  LogOut, 
  Menu, 
  X, 
  BookOpen, 
  LayoutDashboard, 
  FileText, 
  Users, 
  Eye, 
  User as UserIcon 
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, isStudent, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If inside an active exam session (/exam/...), do NOT show standard navigation
  if (location.pathname.startsWith('/exam/')) {
    return null;
  }

  // If not logged in, show minimal public header
  if (!user) {
    return (
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
              Exam<span className="text-blue-600">Secure</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-lg transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg shadow-sm shadow-blue-600/20 transition-all hover:shadow"
            >
              Create Account
            </Link>
          </div>
        </div>
      </header>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItemClass = (path: string) => {
    const isActive = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
    return `inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
      isActive
        ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 shadow-sm'
        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
    }`;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Logo & Nav items */}
        <div className="flex items-center gap-8">
          <Link to={isAdmin ? '/admin' : '/student'} className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                Exam<span className="text-blue-600">Secure</span>
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 -mt-1">
                {isAdmin ? 'Admin Portal' : 'Student Portal'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5">
            {isStudent && (
              <Link to="/student" className={navItemClass('/student')}>
                <BookOpen className="w-4 h-4" />
                <span>My Examinations</span>
              </Link>
            )}

            {isAdmin && (
              <>
                <Link to="/admin" className={navItemClass('/admin')}>
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Overview</span>
                </Link>
                <Link to="/admin/exams" className={navItemClass('/admin/exams')}>
                  <BookOpen className="w-4 h-4" />
                  <span>Exams</span>
                </Link>
                <Link to="/admin/builder" className={navItemClass('/admin/builder')}>
                  <FileText className="w-4 h-4" />
                  <span>Question Builder</span>
                </Link>
                <Link to="/admin/submissions" className={navItemClass('/admin/submissions')}>
                  <Users className="w-4 h-4" />
                  <span>Submissions</span>
                </Link>
                <Link to="/admin/logs" className={navItemClass('/admin/logs')}>
                  <Eye className="w-4 h-4" />
                  <span>Proctoring Logs</span>
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Right: User Profile & Actions */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-3 pr-2 border-r border-slate-200 dark:border-slate-800">
            <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-semibold text-sm">
              <UserIcon className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{user.name}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isAdmin
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                  }`}
                >
                  {user.role}
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {user.studentId ? `ID: ${user.studentId}` : user.email}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
            title="Log out of your account"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-4 space-y-2">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl mb-3">
            <div className="font-semibold text-slate-900 dark:text-white">{user.name}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{user.email}</div>
            <div className="mt-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-blue-100 text-blue-700">
                {user.role}
              </span>
            </div>
          </div>

          {isStudent && (
            <Link
              to="/student"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <BookOpen className="w-4 h-4" />
              <span>My Examinations</span>
            </Link>
          )}

          {isAdmin && (
            <>
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard Overview</span>
              </Link>
              <Link
                to="/admin/exams"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <BookOpen className="w-4 h-4" />
                <span>Exams Management</span>
              </Link>
              <Link
                to="/admin/builder"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <FileText className="w-4 h-4" />
                <span>Question Builder</span>
              </Link>
              <Link
                to="/admin/submissions"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Users className="w-4 h-4" />
                <span>Submissions & Grading</span>
              </Link>
              <Link
                to="/admin/logs"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Eye className="w-4 h-4" />
                <span>Proctoring Audit Logs</span>
              </Link>
            </>
          )}

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
