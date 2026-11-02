'use client';

import React from 'react';

/**
 * Atome Select — Design System Stitch (BenchFlow)
 * Menu déroulant standardisé avec label et gestion d'erreurs.
 */
export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: SelectOption[];
  containerClassName?: string;
}

export function Select({
  label,
  error,
  options,
  children,
  className = '',
  containerClassName = '',
  id,
  ...props
}: SelectProps) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full px-3.5 py-2.5 bg-slate-50 border ${
          error ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'
        } rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        {...props}
      >
        {options
          ? options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))
          : children}
      </select>
      {error && <p className="mt-1 text-xs text-rose-500 font-medium">{error}</p>}
    </div>
  );
}
