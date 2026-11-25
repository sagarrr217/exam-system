import React from 'react';
import { cn } from './cn';

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('ui-skeleton rounded-[10px]', className)} aria-hidden="true" />
);

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="ui-card p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="h-6 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="pt-2 flex items-center justify-between gap-3">
          <Skeleton className="h-11 w-full rounded-[12px]" />
        </div>
      </div>
    ))}
  </div>
);

export const TableRowSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="ui-card p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <Skeleton className="h-10 w-10 rounded-[10px] shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-11 w-24 rounded-[12px]" />
      </div>
    ))}
  </div>
);
