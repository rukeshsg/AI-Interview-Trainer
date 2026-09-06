import React from 'react';
import { Loader2 } from 'lucide-react';

interface SpinnerProps { size?: 'sm' | 'md' | 'lg'; text?: string; }

export function Spinner({ size = 'md', text }: SpinnerProps) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
  return (
    <div className="flex flex-col items-center gap-3">
      <Loader2 className={`${sizes[size]} text-indigo-600 animate-spin`} />
      {text && <p className="text-sm text-slate-500">{text}</p>}
    </div>
  );
}

export function SkeletonLoader({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="bg-slate-200 rounded-lg animate-pulse" style={{ height: 16, width: i === lines - 1 ? '60%' : '100%' }} />
      ))}
    </div>
  );
}

export function ProgressBar({ value, max = 100, color = 'indigo', label }: {
  value: number; max?: number; color?: string; label?: string;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const colorMap: Record<string, string> = {
    indigo: 'bg-indigo-500', green: 'bg-green-500', yellow: 'bg-yellow-500', red: 'bg-red-500',
  };
  return (
    <div className="w-full">
      {label && <div className="flex justify-between text-xs text-slate-600 mb-1"><span>{label}</span><span>{value.toFixed(1)}</span></div>}
      <div className="w-full bg-slate-100 rounded-full h-2">
        <div className={`h-2 rounded-full transition-all ${colorMap[color] || colorMap.indigo}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function EmptyState({ icon, title, description, action }: {
  icon?: React.ReactNode; title: string; description?: string; action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {icon && <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 text-slate-400">{icon}</div>}
      <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-500 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
