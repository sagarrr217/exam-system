import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { cn } from './ui/cn';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={cn(
        'min-h-[44px] min-w-[44px] px-3 inline-flex items-center justify-center gap-2 rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-tray)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--accent-primary)]',
        className
      )}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" />
      ) : (
        <Moon className="w-4 h-4 text-[var(--accent-primary)]" aria-hidden="true" />
      )}
      <span className="hidden xl:inline text-xs font-semibold">
        {isDark ? 'Light' : 'Dark'}
      </span>
    </button>
  );
};
