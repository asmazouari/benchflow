'use client';

import React from 'react';

/**
 * Molécule FilterPills — Niveau 2 Atomic Design (BenchFlow)
 * Groupe de boutons pastilles cliquables pour le filtrage rapide (Métiers, Formats).
 * Remplace les boucles de boutons répétées dans RadarTab et CatalogTab.
 */
export interface FilterPillOption<T = string> {
  value: T;
  label: string;
}

export interface FilterPillsProps<T extends string = string> {
  options: (T | FilterPillOption<T>)[];
  selected: T;
  onSelect: (value: T) => void;
  label?: string;
  activeVariant?: 'dark' | 'indigo';
  className?: string;
}

export function FilterPills<T extends string = string>({
  options,
  selected,
  onSelect,
  label,
  activeVariant = 'dark',
  className = '',
}: FilterPillsProps<T>) {
  const activeClass =
    activeVariant === 'dark'
      ? 'bg-slate-900 text-white shadow-xs'
      : 'bg-indigo-600 text-white shadow-xs';

  return (
    <div className={`flex items-center gap-1.5 overflow-x-auto no-scrollbar ${className}`}>
      {label && (
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
          {label}
        </span>
      )}
      {options.map((option) => {
        const value = typeof option === 'string' ? option : option.value;
        const displayLabel = typeof option === 'string' ? option : option.label;
        const isSelected = selected === value;

        return (
          <button
            key={value}
            type="button"
            onClick={() => onSelect(value)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              isSelected
                ? activeClass
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {displayLabel}
          </button>
        );
      })}
    </div>
  );
}
