'use client';

import React, { useState, useMemo } from 'react';
import {
  Collaborateur,
  CollaborateurCreatePayload,
  CollaborateurUpdatePayload,
  UserProfile,
  Metier,
  StatutAlerte,
} from '../../types';
import { Button } from '../atoms';
import { KpiCard, SearchBar, FilterPills } from '../molecules';
import { CollaborateursTable, CollaborateurModal } from '../organisms';
import { METIERS_FILTER } from '../../lib/constants';
import { UserPlus } from 'lucide-react';

/**
 * Template RadarTab — Niveau 4 Atomic Design (BenchFlow)
 * Squelette de présentation de la matrice de staffing & anticipation d'inter-projet.
 * Assemble les atomes, molécules et organismes de façon pure et déclarative.
 */
export interface RadarTabProps {
  collaborateurs: Collaborateur[];
  currentUser: UserProfile;
  onAddCollaborateur: (collab: CollaborateurCreatePayload) => void;
  onSelectCollaborateur: (collab: Collaborateur) => void;
  onUpdateCollaborateur?: (id: number, data: CollaborateurUpdatePayload) => Promise<void>;
}

export function RadarTab({
  collaborateurs,
  currentUser,
  onAddCollaborateur,
  onSelectCollaborateur,
  onUpdateCollaborateur,
}: RadarTabProps) {
  const isManager = currentUser.role === 'manager';

  const [selectedMetier, setSelectedMetier] = useState<Metier>('Tous');
  const [filterStatus, setFilterStatus] = useState<'all' | StatutAlerte>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // État unifié du modal collaborateur (création si null, édition si collaborateur sélectionné)
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    collabToEdit: Collaborateur | null;
  }>({
    isOpen: false,
    collabToEdit: null,
  });

  // KPI Metrics data-driven
  const stableCount = useMemo(
    () => collaborateurs.filter((c) => c.statutAlerte === 'stable').length,
    [collaborateurs]
  );
  const urgentCount = useMemo(
    () => collaborateurs.filter((c) => c.statutAlerte === 'urgent').length,
    [collaborateurs]
  );
  const benchCount = useMemo(
    () => collaborateurs.filter((c) => c.statutAlerte === 'intermission').length,
    [collaborateurs]
  );

  // Filtrage mémorisé haute performance
  const filteredCollaborateurs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return collaborateurs.filter((c) => {
      const matchMetier = selectedMetier === 'Tous' || c.metier === selectedMetier;
      const matchStatus = filterStatus === 'all' || c.statutAlerte === filterStatus;
      const matchSearch =
        !query ||
        c.nom.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        (c.clientActuel && c.clientActuel.toLowerCase().includes(query));
      return matchMetier && matchStatus && matchSearch;
    });
  }, [collaborateurs, selectedMetier, filterStatus, searchQuery]);

  const handleOpenCreateModal = () => {
    setModalState({ isOpen: true, collabToEdit: null });
  };

  const handleOpenEditModal = (collab: Collaborateur) => {
    setModalState({ isOpen: true, collabToEdit: collab });
  };

  const handleCloseModal = () => {
    setModalState({ isOpen: false, collabToEdit: null });
  };

  const handleSaveCollaborateur = async (
    data: CollaborateurCreatePayload | CollaborateurUpdatePayload
  ) => {
    if (modalState.collabToEdit && onUpdateCollaborateur) {
      await onUpdateCollaborateur(modalState.collabToEdit.id, data as CollaborateurUpdatePayload);
    } else {
      onAddCollaborateur(data as CollaborateurCreatePayload);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête de la matrice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-[11px] font-bold badge-pastel-indigo rounded-full">
              Matrice de Staffing
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Radar des Staffings &amp; Inter-projets
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Anticipation proactive des fins de mission pour éliminer les temps morts et valoriser les compétences.
          </p>
        </div>

        {isManager && (
          <Button
            onClick={handleOpenCreateModal}
            icon={<UserPlus className="w-4 h-4" />}
            variant="primary"
          >
            Nouveau collaborateur
          </Button>
        )}
      </div>

      {/* Grille des KPI Cards (Molécule réutilisable KpiCard) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          title="Missions Stables"
          count={stableCount}
          badgeLabel="> 15 jours"
          description="Consultants sécurisés sur mission longue"
          status="stable"
          isActive={filterStatus === 'stable'}
          onClick={() => setFilterStatus(filterStatus === 'stable' ? 'all' : 'stable')}
        />
        <KpiCard
          title="Alertes Urgentes"
          count={urgentCount}
          badgeLabel="≤ 15 jours"
          description="Fins de mission imminentes à repositionner"
          status="urgent"
          isActive={filterStatus === 'urgent'}
          onClick={() => setFilterStatus(filterStatus === 'urgent' ? 'all' : 'urgent')}
          hasPulse
        />
        <KpiCard
          title="En Intermission"
          count={benchCount}
          badgeLabel="Immédiat"
          description="Disponibles pour initiatives ou projets internes"
          status="intermission"
          isActive={filterStatus === 'intermission'}
          onClick={() => setFilterStatus(filterStatus === 'intermission' ? 'all' : 'intermission')}
        />
      </div>

      {/* Barre d'outils et de filtrage (Molécules SearchBar & FilterPills) */}
      <div className="card-shell p-3 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <FilterPills<Metier>
            options={METIERS_FILTER}
            selected={selectedMetier}
            onSelect={setSelectedMetier}
          />

          {filterStatus !== 'all' && (
            <button
              type="button"
              onClick={() => setFilterStatus('all')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 px-2 py-1 underline cursor-pointer whitespace-nowrap"
            >
              Effacer filtre statut
            </button>
          )}
        </div>
      </div>

      {/* Tableau principal (Organisme CollaborateursTable) */}
      <CollaborateursTable
        collaborateurs={filteredCollaborateurs}
        currentUser={currentUser}
        onSelectCollaborateur={onSelectCollaborateur}
        onEditCollaborateur={handleOpenEditModal}
      />

      {/* Modal unifié Collaborateur (Organisme CollaborateurModal) */}
      <CollaborateurModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        initialData={modalState.collabToEdit}
        onSave={handleSaveCollaborateur}
      />
    </div>
  );
}
