import React from 'react';
import { useTheme, Theme } from '../context/ThemeContext';
import { Sun, Moon, Laptop } from 'lucide-react';

interface ThemeToggleProps {
  variant?: 'segmented' | 'icon-only';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ variant = 'segmented', className = '' }) => {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

  if (variant === 'icon-only') {
    return (
      <button
        onClick={toggleTheme}
        className={`p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all ${className}`}
        aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
        title={`Current: ${theme} (${resolvedTheme}). Click to toggle.`}
      >
        {resolvedTheme === 'dark' ? (
          <Sun className="w-4 h-4 text-amber-400" />
        ) : (
          <Moon className="w-4 h-4 text-slate-700" />
        )}
      </button>
    );
  }

  const options: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: 'Light', icon: <Sun className="w-3.5 h-3.5" /> },
    { value: 'dark', label: 'Dark', icon: <Moon className="w-3.5 h-3.5" /> },
    { value: 'system', label: 'Auto', icon: <Laptop className="w-3.5 h-3.5" /> }
  ];

  return (
    <div
      role="radiogroup"
      aria-label="Color scheme preference"
      className={`inline-flex items-center p-1 rounded-full bg-slate-200/70 dark:bg-zinc-800/80 backdrop-blur-md border border-black/5 dark:border-white/10 shadow-inner ${className}`}
    >
      {options.map((opt) => {
        const isActive = theme === opt.value;
        return (
          <button
            key={opt.value}
            role="radio"
            aria-checked={isActive}
            onClick={() => setTheme(opt.value)}
            className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
              isActive
                ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-sm shadow-black/10'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
            }`}
          >
            <span className={isActive ? (opt.value === 'light' ? 'text-amber-500' : opt.value === 'dark' ? 'text-blue-400' : 'text-slate-700 dark:text-slate-200') : ''}>
              {opt.icon}
            </span>
            <span className="hidden sm:inline">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};
