'use client';

import React from 'react';
import { Metier, StatutAlerte, StatutInitiative, Duree } from '../../types';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'metier' | 'alerte' | 'statut' | 'duree';
  metier?: Metier;
  alerte?: StatutAlerte;
  statut?: StatutInitiative;
  duree?: Duree;
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  metier,
  alerte,
  statut,
  duree,
  className = '',
}: BadgeProps) {
  let colorStyles = 'bg-slate-100 text-slate-700 border-slate-200';

  if (variant === 'metier' && metier) {
    const metierColors: Record<Metier, string> = {
      Dev: 'bg-blue-50 text-blue-700 border-blue-200',
      QA: 'bg-purple-50 text-purple-700 border-purple-200',
      PO: 'bg-amber-50 text-amber-700 border-amber-200',
      DevOps: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      Tous: 'bg-slate-50 text-slate-700 border-slate-200',
    };
    colorStyles = metierColors[metier] || colorStyles;
  }

  if (variant === 'alerte' && alerte) {
    const alerteColors: Record<StatutAlerte, string> = {
      stable: 'badge-pastel-emerald font-semibold',
      urgent: 'badge-pastel-amber font-semibold',
      intermission: 'badge-pastel-rose font-bold',
    };
    colorStyles = alerteColors[alerte] || colorStyles;
  }

  if (variant === 'statut' && statut) {
    const statutColors: Record<StatutInitiative, string> = {
      DISPONIBLE: 'badge-pastel-emerald font-semibold',
      A_VALIDER: 'badge-pastel-amber font-semibold',
      EN_COURS: 'badge-pastel-indigo font-semibold',
      TERMINE: 'bg-slate-100 text-slate-600 border border-slate-200 font-medium',
      REFUSE: 'badge-pastel-rose font-semibold',
    };
    colorStyles = statutColors[statut] || colorStyles;
  }

  if (variant === 'duree' && duree) {
    const dureeColors: Record<Duree, string> = {
      Flash: 'bg-sky-50 text-sky-700 border-sky-200',
      Sprint: 'bg-violet-50 text-violet-700 border-violet-200',
      Fond: 'bg-slate-100 text-slate-800 border-slate-200',
    };
    colorStyles = dureeColors[duree] || colorStyles;
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorStyles} ${className}`}
    >
      {children}
    </span>
  );
}
