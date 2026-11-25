import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Wrench,
  GraduationCap,
  ShieldAlert,
  ArrowLeftRight,
  LogOut,
  Plus,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRoleGateway } from '../context/RoleGatewayContext';
import { useToast } from '../context/ToastContext';
import { BrandMark } from './BrandMark';
import { ThemeToggle } from './ThemeToggle';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { cn } from './ui/cn';

interface AdminShellProps {
  children: React.ReactNode;
}

const navItems = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/exams', label: 'Exams', icon: FileText, end: false },
  { to: '/admin/builder', label: 'Question Builder', icon: Wrench, end: false },
  { to: '/admin/submissions', label: 'Submissions', icon: GraduationCap, end: false },
  { to: '/admin/logs', label: 'Integrity Logs', icon: ShieldAlert, end: false },
];

export const AdminShell: React.FC<AdminShellProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { openGateway } = useRoleGateway();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  const handleLogout = () => {
    logout();
    toast.info('Signed out of administrator session');
    navigate('/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[var(--bg-surface)] border-r border-[var(--border-default)]">
      {/* Sidebar Header */}
      <div className="px-5 py-5 border-b border-[var(--border-default)] flex items-center justify-between gap-2">
        <Link to="/admin" className="focus-visible:outline-2 focus-visible:outline-[var(--accent-primary)] rounded-[12px]">
          <BrandMark size="md" subtitle="Faculty Suite" />
        </Link>
        <button
          type="button"
          onClick={() => setDrawerOpen(false)}
          aria-label="Close navigation drawer"
          className="lg:hidden min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-[10px] text-[var(--text-secondary)] hover:bg-[var(--bg-tray)] hover:text-[var(--text-primary)]"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Primary Action */}
      <div className="px-4 pt-5 pb-3">
        <Button
          variant="primary"
          size="md"
          fullWidth
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/admin/builder')}
        >
          New Exam
        </Button>
      </div>

      {/* Navigation */}
      <nav aria-label="Administrator navigation" className="flex-1 px-3 py-2 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'min-h-[44px] px-3.5 py-2.5 rounded-[12px] flex items-center gap-3 text-sm font-medium transition-colors',
                  'focus-visible:outline-2 focus-visible:outline-[var(--accent-primary)]',
                  isActive
                    ? 'bg-blue-50 text-[var(--accent-primary)] font-semibold border border-blue-200/80 dark:bg-blue-950/60 dark:border-blue-800/70'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tray)]'
                )
              }
            >
              <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        <div className="pt-4 mt-4 border-t border-[var(--border-default)]">
          <Link
            to="/"
            className="min-h-[44px] px-3.5 py-2.5 rounded-[12px] flex items-center justify-between gap-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tray)] transition-colors"
          >
            <span>Public Showcase</span>
            <ExternalLink className="w-4 h-4 shrink-0" aria-hidden="true" />
          </Link>
        </div>
      </nav>

      {/* Bottom Profile & Role Controls */}
      <div className="p-4 border-t border-[var(--border-default)] bg-[var(--bg-tray)]/40 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
              {user?.name || 'Administrator'}
            </p>
            <p className="text-xs text-[var(--text-muted)] truncate">
              {user?.email}
            </p>
          </div>
          <Badge variant="brand">Admin</Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            fullWidth
            onClick={openGateway}
            leftIcon={<ArrowLeftRight className="w-4 h-4" />}
          >
            Switch Role
          </Button>
          <ThemeToggle />
        </div>

        <Button
          variant="ghost"
          size="sm"
          fullWidth
          onClick={handleLogout}
          leftIcon={<LogOut className="w-4 h-4 text-[var(--accent-danger)]" />}
          className="text-[var(--accent-danger)] hover:bg-rose-50 dark:hover:bg-rose-950/40"
        >
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:block w-[260px] shrink-0">
        <div className="sticky top-0 h-screen">{sidebarContent}</div>
      </aside>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-[var(--z-modal-backdrop)] lg:hidden bg-slate-950/60 backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)}
        >
          <div
            className="w-[280px] max-w-[85vw] h-full z-[var(--z-modal)] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile Top Bar (<lg) */}
        <header className="lg:hidden sticky top-0 z-[var(--z-sticky)] ui-nav px-3 sm:px-4 h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open administrator menu"
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-tray)] shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>
            <BrandMark size="sm" subtitle="Admin" className="min-w-0" />
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Button variant="secondary" size="sm" onClick={openGateway} className="px-3">
              <span>Switch</span>
              <span className="hidden sm:inline"> Role</span>
            </Button>
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
};
