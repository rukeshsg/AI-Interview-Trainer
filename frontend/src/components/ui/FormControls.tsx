import React from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, className, id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="w-full">
      {label && <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>}
      <input
        id={inputId}
        className={clsx(
          'w-full px-4 py-2.5 rounded-xl border text-sm bg-white text-slate-900',
          'placeholder:text-slate-400 transition-shadow',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
          error ? 'border-red-400' : 'border-slate-200',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, options, className, id, ...props }: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="w-full">
      {label && <label htmlFor={selectId} className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>}
      <select
        id={selectId}
        className={clsx(
          'w-full px-4 py-2.5 rounded-xl border text-sm bg-white text-slate-900',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow',
          error ? 'border-red-400' : 'border-slate-200',
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  showCount?: boolean;
  maxCount?: number;
}

export function Textarea({ label, error, showCount, maxCount, className, id, value, ...props }: TextareaProps) {
  const taId = id || label?.toLowerCase().replace(/\s+/g, '-');
  const count = typeof value === 'string' ? value.length : 0;
  return (
    <div className="w-full">
      {label && <label htmlFor={taId} className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>}
      <textarea
        id={taId}
        value={value}
        className={clsx(
          'w-full px-4 py-3 rounded-xl border text-sm bg-white text-slate-900 resize-none',
          'placeholder:text-slate-400 transition-shadow',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
          error ? 'border-red-400' : 'border-slate-200',
          className
        )}
        {...props}
      />
      <div className="flex justify-between mt-1">
        {error ? <p className="text-xs text-red-600">{error}</p> : <span />}
        {showCount && <p className="text-xs text-slate-400">{count}{maxCount ? `/${maxCount}` : ''}</p>}
      </div>
    </div>
  );
}
