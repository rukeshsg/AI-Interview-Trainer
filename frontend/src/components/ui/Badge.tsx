import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple';
  className?: string;
}

const variants = {
  default: 'bg-slate-100 text-slate-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  error:   'bg-red-100 text-red-700',
  info:    'bg-indigo-100 text-indigo-700',
  purple:  'bg-purple-100 text-purple-700',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span className={clsx(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}

export function difficultyBadge(difficulty: string) {
  const map: Record<string, BadgeProps['variant']> = {
    easy: 'success', medium: 'warning', hard: 'error', adaptive: 'info',
  };
  return map[difficulty] || 'default';
}

export function typeBadge(type: string): BadgeProps['variant'] {
  const map: Record<string, BadgeProps['variant']> = {
    technical: 'info', hr: 'purple', behavioral: 'warning', mixed: 'default',
  };
  return map[type] || 'default';
}
