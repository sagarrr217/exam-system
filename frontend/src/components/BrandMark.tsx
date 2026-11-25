import React from 'react';

interface BrandMarkProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const BrandMark: React.FC<BrandMarkProps> = ({ size = 'md', className = '' }) => {
  const dim =
    size === 'sm' ? 'w-8 h-8 rounded-lg' : size === 'lg' ? 'w-12 h-12 rounded-xl' : 'w-9 h-9 rounded-xl';
  const svgDim = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';

  return (
    <div
      className={`${dim} bg-[#141413] dark:bg-[#161922] border border-black/15 dark:border-white/15 flex items-center justify-center relative overflow-hidden shadow-sm ${className}`}
    >
      <svg viewBox="0 0 28 28" fill="none" className={svgDim} aria-hidden="true">
        <path
          d="M14 2.5L24.5 8.5V19.5L14 25.5L3.5 19.5V8.5L14 2.5Z"
          stroke="currentColor"
          className="text-[#FF5A36]"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M14 7.5L19.8 10.8V17.2L14 20.5L8.2 17.2V10.8L14 7.5Z"
          stroke="currentColor"
          className="text-white/40"
          strokeWidth="1.25"
          strokeLinejoin="round"
        />
        <circle cx="14" cy="14" r="2.6" className="fill-[#22D3EE]" />
      </svg>
    </div>
  );
};
