import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export function Card({ children, className, padding = 'md', hover = false }: CardProps) {
  const paddings = { none: '', sm: 'p-4', md: 'p-6', lg: 'p-8' };
  return (
    <div className={clsx(
      'bg-white rounded-2xl border border-slate-200 shadow-sm',
      paddings[padding],
      hover && 'hover:shadow-md hover:border-slate-300 transition-shadow cursor-pointer',
      className
    )}>
      {children}
    </div>
  );
}
