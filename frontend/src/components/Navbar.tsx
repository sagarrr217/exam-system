import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRoleGateway } from '../context/RoleGatewayContext';
import { ThemeToggle } from './ThemeToggle';
import { BrandMark } from './BrandMark';
import {
  LogOut,
  Menu,
  X,
  BookOpen,
  LayoutDashboard,
  FileText,
  Users,
  Eye,
  ChevronRight,
  ArrowRight,
  ArrowLeftRight,
  Compass,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, isStudent, isAdmin } = useAuth();
  const { openGateway } = useRoleGateway();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Never render global nav inside active restricted exam room
  if (location.pathname.startsWith('/exam/')) {
    return null;
  }

  const isLanding = location.pathname === '/' || location.pathname === '/get-started';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItemClass = (path: string, exact = false) => {
    const isActive = exact
      ? location.pathname === path
      : location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

    return `inline-flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
      isActive
        ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-hairline)] shadow-sm'
        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5 border border-transparent'
    }`;
  };

  // Public or Landing Header
  if (!user || isLanding) {
    return (
      <header className="sticky top-0 z-40 w-full studio-nav transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <BrandMark size="md" className="group-hover:scale-105 transition-transform" />
            <div className="leading-tight">
              <div className="font-display font-bold text-base sm:text-lg tracking-tight text-[var(--text-primary)] flex items-center gap-2">
                <span>ExamSecure</span>
                <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[10px] font-medium px-1.5 py-0.5 rounded bg-[var(--bg-tray)] border border-[var(--border-hairline)] text-[var(--text-secondary)]">
                  v4.2
                </span>
              </div>
              <span className="hidden sm:block font-mono text-[10px] tracking-wider uppercase text-[var(--text-tertiary)]">
                Dual-Interface Assessment Core
              </span>
            </div>
          </Link>

          {/* Center Section Links on Landing */}
          {isLanding && (
            <nav className="hidden lg:flex items-center gap-1 text-xs font-medium text-[var(--text-secondary)]">
              <a
                href="#sandbox"
                className="px-3 py-1.5 rounded-lg hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                Live Sandbox
              </a>
              <a
                href="#architecture"
                className="px-3 py-1.5 rounded-lg hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                Architecture
              </a>
              <a
                href="#interfaces"
                className="px-3 py-1.5 rounded-lg hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                Dual Interfaces
              </a>
              <a
                href="#workflow"
                className="px-3 py-1.5 rounded-lg hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                Workflow
              </a>
            </nav>
          )}

          {/* Right Controls */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <ThemeToggle variant="icon-only" />

            {user ? (
              <>
                <button
                  type="button"
                  onClick={openGateway}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-hairline)] bg-[var(--bg-surface)] transition-colors"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>Switch Role</span>
                </button>
                <Link
                  to={isAdmin ? '/admin' : '/student'}
                  className="btn-signal px-4 py-2 text-xs sm:text-sm inline-flex items-center gap-1.5"
                >
                  <span>{isAdmin ? 'Admin Console' : 'Student Hub'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden sm:inline-flex text-xs sm:text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-3 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  Sign In
                </Link>
                <button
                  type="button"
                  onClick={openGateway}
                  className="btn-signal px-4 py-2 text-xs sm:text-sm inline-flex items-center gap-1.5"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>
    );
  }

  // Authenticated Workspace Navbar (Student or Admin)
  return (
    <header className="sticky top-0 z-40 w-full studio-nav transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand & Nav items */}
        <div className="flex items-center gap-3 xl:gap-5 flex-shrink-0">
          <Link to={isAdmin ? '/admin' : '/student'} className="flex items-center gap-2.5 group flex-shrink-0">
            <BrandMark size="md" className="group-hover:scale-105 transition-transform" />
            <div className="leading-tight">
              <span className="font-display font-bold text-base sm:text-lg tracking-tight text-[var(--text-primary)]">
                ExamSecure
              </span>
              <span className="block font-mono text-[10px] font-semibold uppercase tracking-wider text-[var(--accent-signal)]">
                {isAdmin ? 'Admin Console' : 'Student Workspace'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation (>= lg 1024px) */}
          <nav className="hidden lg:flex items-center gap-1 p-1 rounded-xl bg-[var(--bg-tray)] border border-[var(--border-hairline)] flex-shrink-0">
            {isStudent && (
              <Link to="/student" className={navItemClass('/student')}>
                <BookOpen className="w-3.5 h-3.5" />
                <span>My Examinations</span>
              </Link>
            )}

            {isAdmin && (
              <>
                <Link to="/admin" className={navItemClass('/admin', true)}>
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Overview</span>
                </Link>
                <Link to="/admin/exams" className={navItemClass('/admin/exams')}>
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Exams</span>
                </Link>
                <Link to="/admin/builder" className={navItemClass('/admin/builder')}>
                  <FileText className="w-3.5 h-3.5" />
                  <span>Builder</span>
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

        {/* Right: Showcase, Switch Role, Theme Toggle, Profile & Sign Out */}
        <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
          <Link
            to="/"
            className="w-9 h-9 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-all flex-shrink-0"
            title="3D Showcase Landing"
            aria-label="3D Showcase Landing"
          >
            <Compass className="w-4 h-4" />
          </Link>

          <button
            type="button"
            onClick={openGateway}
            className="inline-flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-tray)] border border-[var(--border-hairline)] hover:border-[var(--border-strong)] transition-all whitespace-nowrap flex-shrink-0"
            title="Switch between Student & Admin Workspaces"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-[var(--accent-signal)]" />
            <span className="hidden xl:inline">Switch Role</span>
          </button>

          <ThemeToggle variant="icon-only" />

          <div className="flex items-center gap-2 pl-2 border-l border-[var(--border-hairline)]">
            <div className="hidden xl:block text-right text-xs leading-tight max-w-[140px]">
              <div className="font-semibold text-[var(--text-primary)] flex items-center justify-end gap-1.5">
                <span className="truncate">{user.name}</span>
                <span
                  className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border flex-shrink-0 ${
                    isAdmin
                      ? 'bg-[var(--accent-signal)]/10 text-[var(--accent-signal)] border-[var(--accent-signal)]/25'
                      : 'bg-[#0891B2]/10 dark:bg-[#22D3EE]/10 text-[#0891B2] dark:text-[#22D3EE] border-[#0891B2]/25 dark:border-[#22D3EE]/25'
                  }`}
                >
                  {user.role}
                </span>
              </div>
              <div className="font-mono text-[10px] text-[var(--text-tertiary)] truncate">
                {user.studentId ? user.studentId : user.email}
              </div>
            </div>
            <span
              className={`xl:hidden font-mono text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border flex-shrink-0 ${
                isAdmin
                  ? 'bg-[var(--accent-signal)]/10 text-[var(--accent-signal)] border-[var(--accent-signal)]/25'
                  : 'bg-[#0891B2]/10 dark:bg-[#22D3EE]/10 text-[#0891B2] dark:text-[#22D3EE] border-[#0891B2]/25 dark:border-[#22D3EE]/25'
              }`}
            >
              {user.role}
            </span>

            <button
              type="button"
              onClick={handleLogout}
              className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-rose-500 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 active:scale-95 transition-all flex-shrink-0"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile & Tablet Controls (< lg 1024px) */}
        <div className="lg:hidden flex items-center gap-2">
          <ThemeToggle variant="icon-only" />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)] active:scale-95 transition-all"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile & Tablet Navigation Sheet */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-[var(--border-hairline)] bg-[var(--bg-surface)] px-4 pt-3 pb-5 space-y-3 animate-fade-in">
          <div className="p-3.5 bg-[var(--bg-tray)] rounded-xl border border-[var(--border-hairline)] flex items-center justify-between">
            <div>
              <div className="font-semibold text-sm text-[var(--text-primary)]">{user.name}</div>
              <div className="font-mono text-[11px] text-[var(--text-secondary)]">{user.email}</div>
              <span
                className={`mt-1.5 inline-block font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  isAdmin
                    ? 'bg-[var(--accent-signal)]/15 text-[var(--accent-signal)]'
                    : 'bg-[#22D3EE]/15 text-[#0891B2] dark:text-[#22D3EE]'
                }`}
              >
                {user.role}
              </span>
            </div>
            <ThemeToggle variant="segmented" />
          </div>

          <div className="space-y-1">
            {isStudent && (
              <Link
                to="/student"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-tray)]"
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-[#0891B2] dark:text-[#22D3EE]" />
                  <span>My Examinations</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--text-tertiary)]" />
              </Link>
            )}

            {isAdmin && (
              <>
                {[
                  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard Overview' },
                  { to: '/admin/exams', icon: BookOpen, label: 'Exams Management' },
                  { to: '/admin/builder', icon: FileText, label: 'Question Builder' },
                  { to: '/admin/submissions', icon: Users, label: 'Submissions & Grading' },
                  { to: '/admin/logs', icon: Eye, label: 'Proctoring Audit Logs' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-tray)]"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-[var(--accent-signal)]" />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[var(--text-tertiary)]" />
                    </Link>
                  );
                })}
              </>
            )}

            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-tray)]"
            >
              <div className="flex items-center gap-2.5">
                <Compass className="w-4 h-4" />
                <span>3D Landing Showcase</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--text-tertiary)]" />
            </Link>
          </div>

          <div className="pt-2 border-t border-[var(--border-hairline)] grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                openGateway();
              }}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-[var(--text-primary)] bg-[var(--bg-tray)] border border-[var(--border-hairline)]"
            >
              <ArrowLeftRight className="w-4 h-4 text-[var(--accent-signal)]" />
              <span>Switch Role</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-rose-500 bg-rose-500/10 border border-rose-500/20"
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
