'use client';

import React, { useState, useMemo } from 'react';
import {
  Initiative,
  InitiativeCreatePayload,
  InitiativeUpdatePayload,
  UserProfile,
  Metier,
  Duree,
} from '../../types';
import { Button, Card } from '../atoms';
import { FilterPills } from '../molecules';
import { InitiativeCard, InitiativeModal, AiSuggestionModal } from '../organisms';
import { METIERS_FILTER, DUREES_FILTER } from '../../lib/constants';
import { Plus, Check, Sparkles } from 'lucide-react';

/**
 * Template CatalogTab — Niveau 4 Atomic Design (BenchFlow)
 * Squelette de présentation de la réserve d'initiatives internes pré-validées.
 * Assemble les atomes, molécules et organismes de façon pure et déclarative.
 */
export interface CatalogTabProps {
  initiatives: Initiative[];
  currentUser: UserProfile;
  onTakeInitiative: (id: number) => void;
  onAddInitiative: (init: InitiativeCreatePayload) => void;
  onProposeIdea?: (idea: InitiativeCreatePayload, file?: File | null) => void;
  onUpdateInitiative?: (id: number, data: InitiativeUpdatePayload) => Promise<void>;
}

export function CatalogTab({
  initiatives,
  currentUser,
  onTakeInitiative,
  onAddInitiative,
  onProposeIdea,
  onUpdateInitiative,
}: CatalogTabProps) {
  const isManager = currentUser.role === 'manager';

  const [selectedMetier, setSelectedMetier] = useState<Metier>('Tous');
  const [selectedDuree, setSelectedDuree] = useState<Duree | 'Tous'>('Tous');
  const [showAiModal, setShowAiModal] = useState(false);

  // État unifié du modal initiative (null = création, non-null = édition)
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    initiativeToEdit: Initiative | null;
  }>({
    isOpen: false,
    initiativeToEdit: null,
  });

  // Filtre les initiatives disponibles ou en cours
  const catalogList = useMemo(
    () => initiatives.filter((i) => i.statut === 'DISPONIBLE' || i.statut === 'EN_COURS'),
    [initiatives]
  );

  const filteredInitiatives = useMemo(() => {
    return catalogList.filter((init) => {
      const matchesMetier =
        selectedMetier === 'Tous' || init.metier === selectedMetier || init.metier === 'Tous';
      const matchesDuree = selectedDuree === 'Tous' || init.duree === selectedDuree;
      return matchesMetier && matchesDuree;
    });
  }, [catalogList, selectedMetier, selectedDuree]);

  const handleOpenCreateModal = () => {
    setModalState({ isOpen: true, initiativeToEdit: null });
  };

  const handleOpenEditModal = (init: Initiative) => {
    setModalState({ isOpen: true, initiativeToEdit: init });
  };

  const handleCloseModal = () => {
    setModalState({ isOpen: false, initiativeToEdit: null });
  };

  const handleSubmitInitiative = async (
    data: {
      titre: string;
      description: string;
      metier: Metier;
      duree: Duree;
    }
  ) => {
    if (modalState.initiativeToEdit && onUpdateInitiative) {
      await onUpdateInitiative(modalState.initiativeToEdit.id, data);
    } else {
      onAddInitiative({
        ...data,
        auteurNom: `${currentUser.nom} (Manager)`,
      });
    }
  };

  const handleAdoptAiInitiative = (init: {
    titre: string;
    description: string;
    metier: Metier;
    duree: Duree;
  }) => {
    if (isManager) {
      onAddInitiative({
        ...init,
        auteurNom: `${currentUser.nom} (Manager - IA Ollama)`,
      });
    } else if (onProposeIdea) {
      onProposeIdea({
        ...init,
        auteurNom: `${currentUser.nom} (IA Ollama)`,
        assigneNom: currentUser.nom,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête du catalogue */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Réserve d&apos;Initiatives</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Pré-validé par le Management
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Projets internes prêts à l&apos;emploi : choisissez un sujet et démarrez immédiatement sans attendre de validation par e-mail
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAiModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200 shadow-2xs transition-all cursor-pointer active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Générer avec l&apos;IA</span>
          </button>

          {isManager && (
            <Button
              onClick={handleOpenCreateModal}
              icon={<Plus className="w-4 h-4" />}
              variant="primary"
            >
              Déposer un sujet
            </Button>
          )}
        </div>
      </div>

      {/* Barre d'outils et filtres (Molécules FilterPills) */}
      <div className="card-shell p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <FilterPills<Metier>
          options={METIERS_FILTER}
          selected={selectedMetier}
          onSelect={setSelectedMetier}
          label="Métier :"
        />

        <FilterPills<Duree | 'Tous'>
          options={DUREES_FILTER.map((d) => ({ value: d.val, label: d.label }))}
          selected={selectedDuree}
          onSelect={setSelectedDuree}
          label="Durée :"
          activeVariant="indigo"
        />
      </div>

      {/* Grille d'initiatives (Organisme InitiativeCard) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredInitiatives.map((init) => {
          const isAvailable = init.statut === 'DISPONIBLE';

          return (
            <InitiativeCard
              key={init.id}
              initiative={init}
              canEdit={isManager}
              onEdit={handleOpenEditModal}
              actions={
                isAvailable ? (
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => onTakeInitiative(init.id)}
                    icon={<Check className="w-3.5 h-3.5" />}
                  >
                    Prendre le sujet
                  </Button>
                ) : (
                  <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
                    Occupé
                  </span>
                )
              }
            />
          );
        })}
      </div>

      {/* État vide */}
      {filteredInitiatives.length === 0 && (
        <Card className="text-center py-12">
          <p className="text-sm font-semibold text-slate-600 mb-1">Aucune initiative disponible pour ces filtres</p>
          <p className="text-xs text-slate-400">Essayez de sélectionner un autre métier ou une autre durée.</p>
        </Card>
      )}

      {/* Modal unifié Initiative (Organisme InitiativeModal) */}
      <InitiativeModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        initialData={modalState.initiativeToEdit}
        onSubmit={handleSubmitInitiative}
        isManager={isManager}
        allowFileUpload={false}
      />

      {/* Modal suggestion IA (Organisme AiSuggestionModal) */}
      <AiSuggestionModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        defaultMetier={currentUser.metier || 'Dev'}
        onAdoptInitiative={handleAdoptAiInitiative}
        isManager={isManager}
      />
    </div>
  );
}
