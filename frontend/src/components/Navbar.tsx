import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
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
  User as UserIcon,
  ChevronRight
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

  // If not logged in, show sleek Apple-style public header
  if (!user) {
    return (
      <header className="sticky top-0 z-40 w-full apple-glass-nav transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0071e3] to-[#409cff] flex items-center justify-center text-white shadow-sm shadow-[#0071e3]/20 group-hover:scale-105 active:scale-95 transition-all">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="font-semibold text-lg tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
              Exam<span className="text-[#0071e3] dark:text-[#0a84ff]">Secure</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle variant="icon-only" />
            <Link
              to="/login"
              className="text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7] hover:text-[#0071e3] dark:hover:text-[#0a84ff] px-3.5 py-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-all"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-sm font-medium text-white bg-[#0071e3] hover:bg-[#0077ed] dark:bg-[#0a84ff] dark:hover:bg-[#1a8eff] px-4 py-1.5 rounded-full shadow-sm shadow-blue-500/20 active:scale-95 transition-all"
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
    return `inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
      isActive
        ? 'bg-black/8 dark:bg-white/15 text-[#1d1d1f] dark:text-white shadow-sm shadow-black/5'
        : 'text-[#86868b] dark:text-[#98989d] hover:text-[#1d1d1f] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'
    }`;
  };

  return (
    <header className="sticky top-0 z-40 w-full apple-glass-nav transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Logo & Nav items */}
        <div className="flex items-center gap-6 lg:gap-8">
          <Link to={isAdmin ? '/admin' : '/student'} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0071e3] to-[#409cff] flex items-center justify-center text-white shadow-sm shadow-[#0071e3]/20 group-hover:scale-105 active:scale-95 transition-all">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-semibold text-lg tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
                Exam<span className="text-[#0071e3] dark:text-[#0a84ff]">Secure</span>
              </span>
              <span className="block text-[10px] font-medium tracking-wide text-[#86868b] dark:text-[#8e8e93] -mt-1">
                {isAdmin ? 'Admin Console' : 'Student Workspace'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-full bg-black/[0.03] dark:bg-white/[0.06] border border-black/[0.04] dark:border-white/[0.06]">
            {isStudent && (
              <Link to="/student" className={navItemClass('/student')}>
                <BookOpen className="w-3.5 h-3.5" />
                <span>My Examinations</span>
              </Link>
            )}

            {isAdmin && (
              <>
                <Link to="/admin" className={navItemClass('/admin')}>
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Overview</span>
                </Link>
                <Link to="/admin/exams" className={navItemClass('/admin/exams')}>
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Exams</span>
                </Link>
                <Link to="/admin/builder" className={navItemClass('/admin/builder')}>
                  <FileText className="w-3.5 h-3.5" />
                  <span>Question Builder</span>
                </Link>
                <Link to="/admin/submissions" className={navItemClass('/admin/submissions')}>
                  <Users className="w-3.5 h-3.5" />
                  <span>Submissions</span>
                </Link>
                <Link to="/admin/logs" className={navItemClass('/admin/logs')}>
                  <Eye className="w-3.5 h-3.5" />
                  <span>Proctoring</span>
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Right: Theme Toggle, User Profile & Actions */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle variant="segmented" />

          <div className="flex items-center gap-2.5 pl-3 border-l border-black/10 dark:border-white/10">
            <div className="w-8 h-8 rounded-full bg-[#f2f2f7] dark:bg-[#2c2c2e] border border-black/5 dark:border-white/10 flex items-center justify-center text-[#1d1d1f] dark:text-[#f5f5f7] font-medium text-xs">
              <UserIcon className="w-4 h-4 text-[#86868b] dark:text-[#98989d]" />
            </div>
            <div className="text-left text-xs leading-tight">
              <div className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-1.5">
                <span>{user.name}</span>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                    isAdmin
                      ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                      : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                  }`}
                >
                  {user.role}
                </span>
              </div>
              <div className="text-[#86868b] dark:text-[#8e8e93] text-[11px]">
                {user.studentId ? `ID: ${user.studentId}` : user.email}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="ml-1 p-2 rounded-full text-[#86868b] dark:text-[#98989d] hover:text-[#ff3b30] dark:hover:text-[#ff453a] hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile menu and theme toggles */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle variant="icon-only" />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-full text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile sheet navigation menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-black/10 dark:border-white/10 bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-2xl px-4 pt-3 pb-5 space-y-3 animate-fade-in">
          {/* User Info Tile */}
          <div className="p-3.5 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-2xl border border-black/5 dark:border-white/10 flex items-center justify-between">
            <div>
              <div className="font-semibold text-sm text-[#1d1d1f] dark:text-[#f5f5f7]">{user.name}</div>
              <div className="text-xs text-[#86868b] dark:text-[#98989d]">{user.email}</div>
              <div className="mt-1">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  isAdmin
                    ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                    : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                }`}>
                  {user.role}
                </span>
              </div>
            </div>
            <ThemeToggle variant="segmented" />
          </div>

          <div className="space-y-1">
            {isStudent && (
              <Link
                to="/student"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-black/5 dark:hover:bg-white/10"
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-[#0071e3] dark:text-[#0a84ff]" />
                  <span>My Examinations</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#86868b]" />
              </Link>
            )}

            {isAdmin && (
              <>
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <div className="flex items-center gap-2.5">
                    <LayoutDashboard className="w-4 h-4 text-[#0071e3] dark:text-[#0a84ff]" />
                    <span>Dashboard Overview</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#86868b]" />
                </Link>
                <Link
                  to="/admin/exams"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4 text-[#0071e3] dark:text-[#0a84ff]" />
                    <span>Exams Management</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#86868b]" />
                </Link>
                <Link
                  to="/admin/builder"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-[#0071e3] dark:text-[#0a84ff]" />
                    <span>Question Builder</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#86868b]" />
                </Link>
                <Link
                  to="/admin/submissions"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-[#0071e3] dark:text-[#0a84ff]" />
                    <span>Submissions & Grading</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#86868b]" />
                </Link>
                <Link
                  to="/admin/logs"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <div className="flex items-center gap-2.5">
                    <Eye className="w-4 h-4 text-[#0071e3] dark:text-[#0a84ff]" />
                    <span>Proctoring Audit Logs</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#86868b]" />
                </Link>
              </>
            )}
          </div>

          <div className="pt-2 border-t border-black/10 dark:border-white/10">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-[#ff3b30] dark:text-[#ff453a] bg-rose-500/10 hover:bg-rose-500/15 active:scale-98 transition-all"
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
