'use client';

import React from 'react';
import { Search, X } from 'lucide-react';

/**
 * Molécule SearchBar — Niveau 2 Atomic Design (BenchFlow)
 * Barre de recherche textuelle avec icône loupe et bouton d'effacement rapide.
 */
export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Rechercher par nom, email ou mission...',
  className = '',
}: SearchBarProps) {
  return (
    <div className={`relative flex-1 max-w-md ${className}`}>
      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-50/80 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 transition-all outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full transition-colors cursor-pointer"
          title="Effacer la recherche"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
