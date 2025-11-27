/**
 * Card Component
 * Reusable card container
 */

import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card = ({ children, className, hover = false, padding = 'md' }: CardProps) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4 md:p-6',
    lg: 'p-6 md:p-8',
  };

  return (
    <div
      className={clsx(
        'bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700',
        paddingClasses[padding],
        hover && 'hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200',
        className
      )}
    >
      {children}
    </div>
  );
};

export default Card;
