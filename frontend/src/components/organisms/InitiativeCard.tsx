'use client';

import React from 'react';
import { Initiative } from '@/types';
import { Badge } from '@/components/atoms';
import { DocumentBadge } from '@/components/molecules';
import { ShieldCheck, UserCheck, Pencil } from 'lucide-react';

/**
 * Organisme InitiativeCard — Niveau 3 Atomic Design (BenchFlow)
 * Carte d'affichage standardisée d'une initiative pour le catalogue et le workflow de validation.
 * Intègre automatiquement la molécule DocumentBadge (MinIO) et supporte un slot d'actions contextuelles.
 */
export interface InitiativeCardProps {
  initiative: Initiative;
  canEdit?: boolean;
  onEdit?: (initiative: Initiative) => void;
  actions?: React.ReactNode;
  footerLeft?: React.ReactNode;
  className?: string;
  badgeStatusVariant?: boolean;
}

export function InitiativeCard({
  initiative,
  canEdit = false,
  onEdit,
  actions,
  footerLeft,
  className = '',
  badgeStatusVariant = true,
}: InitiativeCardProps) {
  const isAvailable = initiative.statut === 'DISPONIBLE';

  return (
    <div
      className={`card-shell flex flex-col justify-between transition-all duration-200 ${
        isAvailable
          ? 'hover:border-indigo-400 hover:shadow-lg'
          : initiative.statut === 'A_VALIDER'
          ? 'hover:border-amber-300'
          : initiative.statut === 'EN_COURS'
          ? 'hover:border-indigo-300'
          : 'bg-slate-50/70 border-dashed'
      } ${className}`}
    >
      <div className="space-y-3">
        {/* En-tête de la carte */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Badge variant="metier" metier={initiative.metier}>
              {initiative.metier}
            </Badge>
            <Badge variant="duree" duree={initiative.duree}>
              {initiative.duree === 'Flash'
                ? '⚡ < 3 jours'
                : initiative.duree === 'Sprint'
                ? '📅 1-2 sem'
                : '🚀 Projet de fond'}
            </Badge>
          </div>

          <div className="flex items-center gap-1.5">
            {badgeStatusVariant && (
              <>
                {isAvailable && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold badge-pastel-emerald px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> Pré-validé
                  </span>
                )}
                {initiative.statut === 'A_VALIDER' && (
                  <Badge variant="statut" statut="A_VALIDER">
                    En attente
                  </Badge>
                )}
                {initiative.statut === 'EN_COURS' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold badge-pastel-indigo px-2 py-0.5 rounded-full">
                    <UserCheck className="w-3 h-3" /> En cours
                  </span>
                )}
                {initiative.statut === 'TERMINE' && (
                  <span className="text-[11px] font-bold badge-pastel-emerald px-2 py-0.5 rounded-full">
                    ✓ Livré
                  </span>
                )}
                {initiative.statut === 'REFUSE' && (
                  <Badge variant="statut" statut="REFUSE">
                    Refusé
                  </Badge>
                )}
              </>
            )}

            {canEdit && onEdit && (
              <button
                type="button"
                onClick={() => onEdit(initiative)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 transition-colors cursor-pointer"
                title="Modifier l'initiative"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Titre & Description */}
        <div>
          <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2">
            {initiative.titre}
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-3">
            {initiative.description}
          </p>
        </div>

        {/* Document de cadrage MinIO (Molécule DocumentBadge) */}
        {initiative.documentNom && (
          <div className="pt-1">
            <DocumentBadge
              initiativeId={initiative.id}
              documentNom={initiative.documentNom}
              documentTaille={initiative.documentTaille}
            />
          </div>
        )}
      </div>

      {/* Pied de carte avec slot d'actions contextuelles */}
      {(footerLeft || actions) && (
        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="text-[11px] text-slate-400 font-medium truncate max-w-[200px]">
            {footerLeft ? (
              footerLeft
            ) : isAvailable ? (
              <span>Déposé par {initiative.auteurNom}</span>
            ) : initiative.assigneNom ? (
              <span className="text-indigo-600 font-semibold">
                Assigné : {initiative.assigneNom}
              </span>
            ) : (
              <span>Proposé par {initiative.auteurNom}</span>
            )}
          </div>

          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
    </div>
  );
}
