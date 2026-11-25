import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  LogOut,
  ArrowLeftRight,
  Menu,
  X,
  ClipboardList,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRoleGateway } from '../context/RoleGatewayContext';
import { useToast } from '../context/ToastContext';
import { BrandMark } from './BrandMark';
import { ThemeToggle } from './ThemeToggle';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { cn } from './ui/cn';

export const Navbar: React.FC = () => {
  const { user, isStudent, logout } = useAuth();
  const { openGateway } = useRoleGateway();
  const toast = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, location.hash]);

  // Dedicated workspace chromes own their navigation
  if (location.pathname.startsWith('/exam') || location.pathname.startsWith('/admin')) {
    return null;
  }

  const handleLogout = () => {
    logout();
    toast.info('Signed out successfully');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-[var(--z-sticky)] ui-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand */}
        <Link
          to={isStudent && location.pathname.startsWith('/student') ? '/student' : '/'}
          className="shrink-0 rounded-[12px] focus-visible:outline-2 focus-visible:outline-[var(--accent-primary)]"
        >
          <BrandMark size="md" />
        </Link>

        {/* Center Navigation (desktop only — zero multi-line wrapping) */}
        <nav aria-label="Main navigation" className="hidden md:flex items-center gap-2">
          {location.pathname === '/' ? (
            <>
              <a
                href="#sandbox"
                className="min-h-[44px] px-3.5 inline-flex items-center rounded-[10px] text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tray)] transition-colors"
              >
                Live Sandbox
              </a>
              <a
                href="#capabilities"
                className="min-h-[44px] px-3.5 inline-flex items-center rounded-[10px] text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tray)] transition-colors"
              >
                Capabilities
              </a>
              <a
                href="#workflow"
                className="min-h-[44px] px-3.5 inline-flex items-center rounded-[10px] text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tray)] transition-colors"
              >
                How It Works
              </a>
            </>
          ) : isStudent ? (
            <>
              <NavLink
                to="/student"
                end
                className={({ isActive }) =>
                  cn(
                    'min-h-[44px] px-3.5 inline-flex items-center gap-2 rounded-[10px] text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-teal-50 text-[var(--accent-secondary)] font-semibold dark:bg-teal-950/60'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tray)]'
                  )
                }
              >
                <ClipboardList className="w-4 h-4" aria-hidden="true" />
                My Assessments
              </NavLink>
              <Link
                to="/"
                className="min-h-[44px] px-3.5 inline-flex items-center gap-2 rounded-[10px] text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tray)] transition-colors"
              >
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                3D Overview
              </Link>
            </>
          ) : (
            <Link
              to="/"
              className="min-h-[44px] px-3.5 inline-flex items-center rounded-[10px] text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tray)] transition-colors"
            >
              Overview
            </Link>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <ThemeToggle />

          {user ? (
            <div className="hidden md:flex items-center gap-2.5">
              <Button
                variant="secondary"
                size="sm"
                onClick={openGateway}
                leftIcon={<ArrowLeftRight className="w-4 h-4" />}
              >
                Switch Role
              </Button>
              <Link
                to={user.role === 'ADMIN' ? '/admin' : '/student'}
                className="min-h-[44px] px-3.5 inline-flex items-center gap-2 rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-surface)] hover:bg-[var(--bg-tray)] transition-colors"
              >
                <span className="text-sm font-semibold text-[var(--text-primary)] max-w-[140px] truncate">
                  {user.name}
                </span>
                <Badge variant={user.role === 'ADMIN' ? 'brand' : 'teal'}>
                  {user.role === 'ADMIN' ? 'Admin' : 'Student'}
                </Badge>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Sign out"
                title="Sign out"
                className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-[12px] border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--accent-danger)] hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to="/login"
                className="min-h-[44px] px-4 inline-flex items-center rounded-[12px] text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tray)] transition-colors"
              >
                Sign In
              </Link>
              <Button
                variant="primary"
                size="md"
                onClick={openGateway}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Get Started
              </Button>
            </div>
          )}

          {/* Mobile Compact CTA + Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            {!user && (
              <Button variant="primary" size="sm" onClick={openGateway}>
                Get Started
              </Button>
            )}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-tray)]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-4 space-y-2 animate-ui-in">
          {location.pathname === '/' && (
            <>
              <a
                href="#sandbox"
                className="min-h-[44px] px-3 rounded-[10px] flex items-center text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-tray)]"
              >
                Live Sandbox
              </a>
              <a
                href="#capabilities"
                className="min-h-[44px] px-3 rounded-[10px] flex items-center text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-tray)]"
              >
                Capabilities
              </a>
              <a
                href="#workflow"
                className="min-h-[44px] px-3 rounded-[10px] flex items-center text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-tray)]"
              >
                How It Works
              </a>
            </>
          )}

          {user ? (
            <div className="pt-2 border-t border-[var(--border-default)] space-y-2">
              <Link
                to={user.role === 'ADMIN' ? '/admin' : '/student'}
                className="min-h-[44px] px-3 rounded-[10px] flex items-center justify-between text-sm font-semibold text-[var(--text-primary)] bg-[var(--bg-tray)]"
              >
                <span>{user.name}</span>
                <Badge variant={user.role === 'ADMIN' ? 'brand' : 'teal'}>
                  {user.role === 'ADMIN' ? 'Admin' : 'Student'}
                </Badge>
              </Link>
              <Button variant="secondary" size="md" fullWidth onClick={openGateway}>
                Switch Role (Student / Admin)
              </Button>
              <Button
                variant="ghost"
                size="md"
                fullWidth
                onClick={handleLogout}
                leftIcon={<LogOut className="w-4 h-4 text-[var(--accent-danger)]" />}
                className="text-[var(--accent-danger)]"
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="pt-2 border-t border-[var(--border-default)] flex flex-col gap-2">
              <Link
                to="/login"
                className="min-h-[44px] px-4 rounded-[12px] border border-[var(--border-default)] flex items-center justify-center text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-tray)]"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="min-h-[44px] px-4 rounded-[12px] bg-[var(--bg-tray)] flex items-center justify-center text-sm font-semibold text-[var(--text-primary)]"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
