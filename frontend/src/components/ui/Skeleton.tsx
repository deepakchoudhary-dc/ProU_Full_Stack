/**
 * Skeleton Loading Component
 */

import { clsx } from 'clsx';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

const Skeleton = ({ className, variant = 'text', width, height }: SkeletonProps) => {
  const variants = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  return (
    <div
      className={clsx(
        'skeleton animate-pulse bg-gray-200 dark:bg-gray-700',
        variants[variant],
        className
      )}
      style={{
        width: width ?? (variant === 'text' ? '100%' : undefined),
        height: height ?? (variant === 'text' ? '1em' : undefined),
      }}
    />
  );
};

// Pre-built skeleton layouts
export const TaskCardSkeleton = () => (
  <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
    <Skeleton className="h-5 w-3/4 mb-3" />
    <Skeleton className="h-4 w-1/2 mb-4" />
    <div className="flex items-center gap-2">
      <Skeleton variant="circular" width={24} height={24} />
      <Skeleton className="h-4 w-20" />
    </div>
  </div>
);

export const ProjectCardSkeleton = () => (
  <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
    <div className="flex items-center gap-3 mb-4">
      <Skeleton variant="rectangular" width={40} height={40} />
      <Skeleton className="h-5 w-32" />
    </div>
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-4 w-2/3 mb-4" />
    <div className="flex gap-2">
      <Skeleton className="h-6 w-16" />
      <Skeleton className="h-6 w-20" />
    </div>
  </div>
);

export const StatCardSkeleton = () => (
  <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
    <div className="flex items-center justify-between mb-4">
      <Skeleton className="h-4 w-24" />
      <Skeleton variant="circular" width={32} height={32} />
    </div>
    <Skeleton className="h-8 w-16 mb-2" />
    <Skeleton className="h-3 w-20" />
  </div>
);

export default Skeleton;
