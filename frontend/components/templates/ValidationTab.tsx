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
import { Button } from '../atoms';
import { InitiativeCard, InitiativeModal, AiSuggestionModal } from '../organisms';
import {
  Check,
  X,
  Send,
  Award,
  ExternalLink,
  Sparkles,
  MessageSquare,
} from 'lucide-react';

/**
 * Template ValidationTab — Niveau 4 Atomic Design (BenchFlow)
 * Squelette de présentation du workflow de validation des idées, suivi des projets en cours
 * et valorisation des livrables finaux (Wall of Fame).
 * Assemble les atomes, molécules et organismes de façon pure et déclarative.
 */
export interface ValidationTabProps {
  initiatives: Initiative[];
  currentUser: UserProfile;
  onProposeIdea: (
    idea: InitiativeCreatePayload,
    file?: File | null
  ) => void | Promise<void>;
  onValidateIdea: (id: number) => void;
  onRejectIdea: (id: number) => void;
  onCompleteInitiative: (id: number, livrableUrl: string) => void;
  onUpdateInitiative?: (id: number, data: InitiativeUpdatePayload) => Promise<void>;
}

export function ValidationTab({
  initiatives,
  currentUser,
  onProposeIdea,
  onValidateIdea,
  onRejectIdea,
  onCompleteInitiative,
  onUpdateInitiative,
}: ValidationTabProps) {
  const isManager = currentUser.role === 'manager';

  const [showAiModal, setShowAiModal] = useState(false);

  // État unifié du modal initiative (null = proposition, non-null = édition)
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    initiativeToEdit: Initiative | null;
  }>({
    isOpen: false,
    initiativeToEdit: null,
  });

  // Modal de complétion avec livrable
  const [completingId, setCompletingId] = useState<number | null>(null);
  const [livrableUrl, setLivrableUrl] = useState('');

  // Partition des initiatives par statut
  const pendingList = useMemo(
    () => initiatives.filter((i) => i.statut === 'A_VALIDER'),
    [initiatives]
  );
  const inProgressList = useMemo(
    () => initiatives.filter((i) => i.statut === 'EN_COURS'),
    [initiatives]
  );
  const completedList = useMemo(
    () => initiatives.filter((i) => i.statut === 'TERMINE'),
    [initiatives]
  );

  const handleOpenProposeModal = () => {
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
    },
    file?: File | null
  ) => {
    if (modalState.initiativeToEdit && onUpdateInitiative) {
      await onUpdateInitiative(modalState.initiativeToEdit.id, data);
    } else {
      await onProposeIdea(
        {
          ...data,
          auteurNom: currentUser.nom,
          assigneNom: currentUser.nom,
        },
        file
      );
    }
  };

  const handleAdoptAiInitiative = async (init: {
    titre: string;
    description: string;
    metier: Metier;
    duree: Duree;
  }) => {
    await onProposeIdea({
      ...init,
      auteurNom: `${currentUser.nom} (IA Ollama)`,
      assigneNom: currentUser.nom,
    });
  };

  const handleCompleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (completingId && livrableUrl.trim()) {
      onCompleteInitiative(completingId, livrableUrl.trim());
      setCompletingId(null);
      setLivrableUrl('');
    }
  };

  return (
    <div className="space-y-8">
      {/* En-tête de page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Suivi &amp; Validations</h1>
          <p className="text-sm text-slate-500">
            Fini les e-mails perdus : proposez vos initiatives avec cadrage, validez en 1 clic et valorisez vos livrables finaux
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAiModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200 shadow-2xs transition-all cursor-pointer active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Suggérer avec l&apos;IA</span>
          </button>

          <Button
            onClick={handleOpenProposeModal}
            icon={<Send className="w-4 h-4" />}
            variant="ai"
          >
            Proposer mon idée
          </Button>
        </div>
      </div>

      {/* 1. File de Validation (Manager Queue) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-slate-900">
            ⏳ File de Validation ({pendingList.length})
          </h2>
          {isManager && (
            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-semibold">
              Action Manager requise
            </span>
          )}
        </div>

        {pendingList.length === 0 ? (
          <div className="card-shell text-center py-10 bg-slate-50/50 border-dashed">
            <p className="text-xs text-slate-500 font-medium">Aucune proposition en attente de validation.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingList.map((item) => {
              const canEdit = isManager || currentUser.nom === item.auteurNom;

              return (
                <InitiativeCard
                  key={item.id}
                  initiative={item}
                  canEdit={canEdit}
                  onEdit={handleOpenEditModal}
                  footerLeft={
                    <span>
                      Proposé par <strong className="text-slate-700">{item.auteurNom}</strong>
                    </span>
                  }
                  actions={
                    isManager ? (
                      <>
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => onValidateIdea(item.id)}
                          icon={<Check className="w-3.5 h-3.5" />}
                        >
                          Valider
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => onRejectIdea(item.id)}
                          icon={<X className="w-3.5 h-3.5" />}
                        >
                          Refuser
                        </Button>
                      </>
                    ) : (
                      <span className="text-xs text-amber-600 font-medium flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" /> En attente de votre manager
                      </span>
                    )
                  }
                />
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Projets Actuellement en Cours */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">
          🚀 Projets Actuellement en Cours ({inProgressList.length})
        </h2>

        {inProgressList.length === 0 ? (
          <div className="card-shell text-center py-10 bg-slate-50/50 border-dashed">
            <p className="text-xs text-slate-500 font-medium">Aucun projet en cours pour l&apos;instant.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inProgressList.map((item) => (
              <InitiativeCard
                key={item.id}
                initiative={item}
                canEdit={isManager}
                onEdit={handleOpenEditModal}
                footerLeft={
                  <span className="text-xs text-slate-400 font-medium">
                    Démarré le {item.dateCreation}
                  </span>
                }
                actions={
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setCompletingId(item.id)}
                    icon={<Award className="w-3.5 h-3.5" />}
                  >
                    Marquer terminé
                  </Button>
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* 3. Projets Réalisés & Livrables (Wall of Fame) */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span>🏆 Projets Réalisés &amp; Livrables ({completedList.length})</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {completedList.map((item) => (
            <InitiativeCard
              key={item.id}
              initiative={item}
              badgeStatusVariant={false}
              footerLeft={
                <span className="text-xs text-slate-500 font-medium truncate max-w-[150px]">
                  Par {item.assigneNom || item.auteurNom}
                </span>
              }
              actions={
                item.livrableUrl ? (
                  <a
                    href={item.livrableUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Livrable</span>
                  </a>
                ) : undefined
              }
            />
          ))}
        </div>
      </div>

      {/* Modal unifié Initiative (Organisme InitiativeModal) */}
      <InitiativeModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        initialData={modalState.initiativeToEdit}
        onSubmit={handleSubmitInitiative}
        allowFileUpload={true}
        isManager={isManager}
      />

      {/* Modal de Finalisation avec Livrable */}
      {completingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2 mb-1 text-emerald-600">
              <Award className="w-5 h-5" />
              <h2 className="text-lg font-bold text-slate-900">Bravo pour la finalisation !</h2>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Renseignez le lien vers votre livrable (GitHub, Notion, Certification) pour capitaliser sur votre travail.
            </p>

            <form onSubmit={handleCompleteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lien du livrable (URL publique ou interne)
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://github.com/votre-societe/projet-nom"
                  value={livrableUrl}
                  onChange={(e) => setLivrableUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setCompletingId(null)}>
                  Annuler
                </Button>
                <Button type="submit" variant="success">
                  Valider et Clôturer
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

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
