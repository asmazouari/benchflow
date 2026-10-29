'use client';

import React from 'react';
import { StatutAlerte } from '../../types';

/**
 * Molécule KpiCard — Niveau 2 Atomic Design (BenchFlow)
 * Carte KPI interactive pour le tableau de bord Radar.
 * Permet de filtrer en 1 clic selon le statut d'alerte (stable, urgent, intermission).
 * 
 * Remplace les 65 lignes de code dupliqué 3 fois dans RadarTab.
 */
export interface KpiCardProps {
  title: string;
  count: number;
  badgeLabel: string;
  description: string;
  status: StatutAlerte;
  isActive?: boolean;
  onClick?: () => void;
  hasPulse?: boolean;
}

export function KpiCard({
  title,
  count,
  badgeLabel,
  description,
  status,
  isActive = false,
  onClick,
  hasPulse = false,
}: KpiCardProps) {
  const stylesByStatus: Record<
    StatutAlerte,
    {
      dot: string;
      badge: string;
      count: string;
      activeRing: string;
    }
  > = {
    stable: {
      dot: 'bg-emerald-500 shadow-sm shadow-emerald-200',
      badge: 'text-emerald-700 bg-emerald-50 border border-emerald-200',
      count: 'text-slate-900',
      activeRing: 'ring-2 ring-emerald-500 bg-emerald-50/20',
    },
    urgent: {
      dot: 'bg-amber-500 shadow-sm shadow-amber-200',
      badge: 'text-amber-800 bg-amber-50 border border-amber-200',
      count: 'text-amber-600',
      activeRing: 'ring-2 ring-amber-500 bg-amber-50/20',
    },
    intermission: {
      dot: 'bg-rose-500 shadow-sm shadow-rose-200',
      badge: 'text-rose-800 bg-rose-50 border border-rose-200',
      count: 'text-rose-600',
      activeRing: 'ring-2 ring-rose-500 bg-rose-50/20',
    },
  };

  const currentStyle = stylesByStatus[status];

  return (
    <div
      onClick={onClick}
      className={`card-shell p-5 cursor-pointer transition-all ${
        isActive ? currentStyle.activeRing : ''
      }`}
      title="Cliquer pour filtrer"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        <span
          className={`w-2.5 h-2.5 rounded-full ${currentStyle.dot} ${
            hasPulse ? 'animate-pulse' : ''
          }`}
        />
      </div>

      <div className="flex items-baseline gap-2">
        <span className={`text-3xl font-extrabold tracking-tight ${currentStyle.count}`}>
          {count}
        </span>
        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${currentStyle.badge}`}>
          {badgeLabel}
        </span>
      </div>

      <p className="text-xs text-slate-400 mt-2 font-medium">{description}</p>
    </div>
  );
}
