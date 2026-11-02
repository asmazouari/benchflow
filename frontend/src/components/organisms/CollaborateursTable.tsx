'use client';

import React from 'react';
import { Collaborateur, UserProfile } from '@/types';
import { Badge } from '@/components/atoms';
import { getInitials, formatAlertBadgeLabel } from '@/lib/utils';
import { Briefcase, Calendar, ArrowUpRight, Pencil } from 'lucide-react';

/**
 * Organisme CollaborateursTable — Niveau 3 Atomic Design (BenchFlow)
 * Tableau principal de la matrice de staffing affichant les consultants,
 * leurs missions, leurs alertes calculées et les actions contextuelles.
 */
export interface CollaborateursTableProps {
  collaborateurs: Collaborateur[];
  currentUser: UserProfile;
  onSelectCollaborateur: (collab: Collaborateur) => void;
  onEditCollaborateur?: (collab: Collaborateur) => void;
}

export function CollaborateursTable({
  collaborateurs,
  currentUser,
  onSelectCollaborateur,
  onEditCollaborateur,
}: CollaborateursTableProps) {
  const isManager = currentUser.role === 'manager';

  return (
    <div className="card-shell p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/80">
            <tr>
              <th className="px-6 py-3.5">Collaborateur</th>
              <th className="px-6 py-3.5">Métier</th>
              <th className="px-6 py-3.5">Mission Client Actuelle</th>
              <th className="px-6 py-3.5">Date de Fin</th>
              <th className="px-6 py-3.5">Statut d&apos;Anticipation</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {collaborateurs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-xs">
                  Aucun collaborateur ne correspond à ces critères de recherche.
                </td>
              </tr>
            ) : (
              collaborateurs.map((collab) => {
                const badgeLabel = formatAlertBadgeLabel(collab.joursRestants);
                const initials = getInitials(collab.nom);

                return (
                  <tr key={collab.id} className="hover:bg-slate-50/60 transition-colors group">
                    {/* Nom & Email */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shadow-2xs">
                          {initials}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {collab.nom}
                          </p>
                          <p className="text-[11px] text-slate-400 font-medium">{collab.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Métier */}
                    <td className="px-6 py-4">
                      <Badge variant="metier" metier={collab.metier}>
                        {collab.metier}
                      </Badge>
                    </td>

                    {/* Client Actuel */}
                    <td className="px-6 py-4 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-medium text-xs truncate max-w-xs">
                          {collab.clientActuel || 'Mission client'}
                        </span>
                      </div>
                    </td>

                    {/* Date de fin */}
                    <td className="px-6 py-4 text-slate-600">
                      <div className="flex items-center gap-1.5 text-xs font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{collab.dateFinStaffing}</span>
                      </div>
                    </td>

                    {/* Badge alerte calculé */}
                    <td className="px-6 py-4">
                      <Badge variant="alerte" alerte={collab.statutAlerte}>
                        {badgeLabel}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isManager && onEditCollaborateur && (
                          <button
                            type="button"
                            onClick={() => onEditCollaborateur(collab)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 transition-all cursor-pointer"
                            title="Modifier le profil & la mission"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Modifier</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onSelectCollaborateur(collab)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border border-transparent hover:border-indigo-200 transition-all cursor-pointer"
                        >
                          <span>Voir initiatives</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
