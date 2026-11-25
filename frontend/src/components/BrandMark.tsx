import React from 'react';
import { cn } from './ui/cn';

interface BrandMarkProps {
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  subtitle?: string;
  className?: string;
}

export const BrandMark: React.FC<BrandMarkProps> = ({
  size = 'md',
  showLabel = true,
  subtitle = 'Academic Proctoring',
  className = '',
}) => {
  const iconBoxSize = size === 'sm' ? 'w-9 h-9' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10';
  const textSize = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-lg';

  return (
    <div className={cn('inline-flex items-center gap-3 select-none', className)}>
      <div
        className={cn(
          iconBoxSize,
          'rounded-[12px] bg-[var(--accent-primary)] text-white flex items-center justify-center shadow-sm relative overflow-hidden shrink-0'
        )}
        aria-hidden="true"
      >
        <svg viewBox="0 0 32 32" className="w-6 h-6" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M16 3.5L26 7.5V15.2C26 21.6 21.8 27 16 28.5C10.2 27 6 21.6 6 15.2V7.5L16 3.5Z"
            stroke="white"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <path
            d="M11.5 16L14.5 19L20.8 12.5"
            stroke="white"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {showLabel && (
        <div className="flex flex-col leading-none">
          <span
            className={cn(
              textSize,
              'font-display font-bold tracking-tight text-[var(--text-primary)]'
            )}
          >
            Exam<span className="text-[var(--accent-primary)]">Secure</span>
          </span>
          {size !== 'sm' && subtitle && (
            <span className="text-xs font-medium text-[var(--text-muted)] mt-0.5">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
