'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  Collaborateur,
  Initiative,
  UserProfile,
  CollaborateurUpdatePayload,
  InitiativeUpdatePayload,
} from '../types';
import { INITIAL_COLLABORATEURS, INITIAL_INITIATIVES } from '../lib/mockData';
import { api } from '../lib/api';

interface UseBenchFlowDataOptions {
  currentUser?: UserProfile | null;
  onNavigateTab?: (tab: 'radar' | 'catalog' | 'validation') => void;
}

/**
 * Hook personnalisé gérant la couche de données de BenchFlow.
 * Centralise les états des collaborateurs, des initiatives et les opérations CRUD
 * avec synchronisation FastAPI et mode dégradé (fallback optimiste).
 */
export function useBenchFlowData({ currentUser, onNavigateTab }: UseBenchFlowDataOptions = {}) {
  const [collaborateurs, setCollaborateurs] = useState<Collaborateur[]>(INITIAL_COLLABORATEURS);
  const [initiatives, setInitiatives] = useState<Initiative[]>(INITIAL_INITIATIVES);
  const [isBackendLive, setIsBackendLive] = useState<boolean>(false);

  // Charge les données fraîches depuis l'API FastAPI
  const loadDashboardData = useCallback(async () => {
    try {
      const [summary, inits] = await Promise.all([
        api.getRadarSummary(),
        api.getInitiatives(),
      ]);
      setCollaborateurs(summary.collaborateurs);
      setInitiatives(inits);
      setIsBackendLive(true);
    } catch (err: unknown) {
      console.warn('Backend FastAPI non connecté ou erreur de chargement, données de secours :', err);
      setIsBackendLive(false);
    }
  }, []);

  // 1. Ajouter un collaborateur (Manager)
  const handleAddCollaborateur = useCallback(
    async (newCollabData: Omit<Collaborateur, 'id' | 'joursRestants' | 'statutAlerte'>) => {
      if (isBackendLive) {
        try {
          await api.createCollaborateur(newCollabData);
          const summary = await api.getRadarSummary();
          setCollaborateurs(summary.collaborateurs);
          return;
        } catch (e: unknown) {
          const message = e instanceof Error ? e.message : 'Échec de connexion';
          console.error('Erreur API createCollaborateur :', e);
          alert(`Erreur d'enregistrement sur le serveur : ${message}`);
          return;
        }
      }

      // Fallback local optimiste
      const diffDays = Math.ceil(
        (new Date(newCollabData.dateFinStaffing).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
      );
      let statutAlerte: Collaborateur['statutAlerte'] = 'stable';
      if (diffDays <= 0) statutAlerte = 'intermission';
      else if (diffDays <= 15) statutAlerte = 'urgent';

      const newCollab: Collaborateur = {
        ...newCollabData,
        id: Date.now(),
        joursRestants: diffDays,
        statutAlerte,
      };
      setCollaborateurs((prev) => [newCollab, ...prev]);
    },
    [isBackendLive]
  );

  // 2. Mettre à jour un collaborateur existant (Manager)
  const handleUpdateCollaborateur = useCallback(
    async (id: number, data: CollaborateurUpdatePayload) => {
      if (isBackendLive) {
        try {
          await api.updateCollaborateur(id, data);
          const summary = await api.getRadarSummary();
          setCollaborateurs(summary.collaborateurs);
          return;
        } catch (e: unknown) {
          console.error('Erreur API updateCollaborateur :', e);
          throw e;
        }
      }

      // Fallback local optimiste
      setCollaborateurs((prev) =>
        prev.map((collab) => {
          if (collab.id !== id) return collab;
          const newDate = data.dateFinStaffing || collab.dateFinStaffing;
          const diffDays = Math.ceil(
            (new Date(newDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
          );
          let statutAlerte: Collaborateur['statutAlerte'] = 'stable';
          if (diffDays <= 0) statutAlerte = 'intermission';
          else if (diffDays <= 15) statutAlerte = 'urgent';

          return {
            ...collab,
            ...data,
            joursRestants: diffDays,
            statutAlerte,
          };
        })
      );
    },
    [isBackendLive]
  );

  // 3. Prendre une initiative disponible (1 clic)
  const handleTakeInitiative = useCallback(
    async (id: number) => {
      const userNom = currentUser?.nom || 'Collaborateur';
      if (isBackendLive) {
        try {
          const updated = await api.takeInitiative(id, userNom);
          setInitiatives((prev) => prev.map((init) => (init.id === id ? updated : init)));
          const summary = await api.getRadarSummary();
          setCollaborateurs(summary.collaborateurs);
          onNavigateTab?.('validation');
          return;
        } catch (e: unknown) {
          console.error('Erreur API takeInitiative :', e);
        }
      }

      // Fallback local
      setInitiatives((prev) =>
        prev.map((init) =>
          init.id === id
            ? {
                ...init,
                statut: 'EN_COURS',
                assigneNom: userNom,
              }
            : init
        )
      );
      onNavigateTab?.('validation');
    },
    [currentUser?.nom, isBackendLive, onNavigateTab]
  );

  // 4. Déposer une initiative pré-validée (Manager)
  const handleAddInitiative = useCallback(
    async (newInitData: Omit<Initiative, 'id' | 'dateCreation' | 'statut' | 'origine'>) => {
      if (isBackendLive) {
        try {
          const created = await api.createInitiative(newInitData, true);
          setInitiatives((prev) => [created, ...prev]);
          return;
        } catch (e: unknown) {
          console.error('Erreur API addInitiative :', e);
        }
      }

      // Fallback local
      const newInit: Initiative = {
        ...newInitData,
        id: Date.now(),
        dateCreation: new Date().toISOString().split('T')[0],
        statut: 'DISPONIBLE',
        origine: 'manager',
      };
      setInitiatives((prev) => [newInit, ...prev]);
    },
    [isBackendLive]
  );

  // 5. Proposer une initiative personnelle avec document de cadrage (Collaborateur)
  const handleProposeIdea = useCallback(
    async (
      newIdeaData: Omit<Initiative, 'id' | 'dateCreation' | 'statut' | 'origine'>,
      file?: File | null
    ) => {
      if (isBackendLive) {
        try {
          let created = await api.createInitiative(newIdeaData, false);
          if (file) {
            try {
              created = await api.uploadInitiativeDocument(created.id, file);
            } catch (uploadErr: unknown) {
              console.error('Erreur upload document cadrage MinIO :', uploadErr);
            }
          }
          onNavigateTab?.('validation');
          setInitiatives((prev) => [created, ...prev]);
          return;
        } catch (e: unknown) {
          console.error('Erreur API proposeIdea :', e);
        }
      }

      // Fallback local
      onNavigateTab?.('validation');
      const newIdea: Initiative = {
        ...newIdeaData,
        id: Date.now(),
        dateCreation: new Date().toISOString().split('T')[0],
        statut: 'A_VALIDER',
        origine: 'collaborateur',
        documentNom: file?.name,
        documentTaille: file?.size,
      };
      setInitiatives((prev) => [newIdea, ...prev]);
    },
    [isBackendLive, onNavigateTab]
  );

  // 6. Mettre à jour une initiative existante (Manager ou Auteur)
  const handleUpdateInitiative = useCallback(
    async (id: number, data: InitiativeUpdatePayload) => {
      if (isBackendLive) {
        try {
          const updated = await api.updateInitiative(id, data);
          setInitiatives((prev) =>
            prev.map((init) => (init.id === id ? updated : init))
          );
          return;
        } catch (e: unknown) {
          console.error('Erreur API updateInitiative :', e);
          throw e;
        }
      }

      // Fallback local
      setInitiatives((prev) =>
        prev.map((init) => (init.id === id ? { ...init, ...data } : init))
      );
    },
    [isBackendLive]
  );

  // 7. Valider une initiative (Manager)
  const handleValidateIdea = useCallback(
    async (id: number) => {
      if (isBackendLive) {
        try {
          const updated = await api.validateInitiative(id);
          setInitiatives((prev) => prev.map((init) => (init.id === id ? updated : init)));
          return;
        } catch (e: unknown) {
          console.error('Erreur API validateIdea :', e);
        }
      }

      // Fallback local
      setInitiatives((prev) =>
        prev.map((init) => (init.id === id ? { ...init, statut: 'EN_COURS' } : init))
      );
    },
    [isBackendLive]
  );

  // 8. Refuser une initiative (Manager)
  const handleRejectIdea = useCallback(
    async (id: number) => {
      if (isBackendLive) {
        try {
          const updated = await api.rejectInitiative(id);
          setInitiatives((prev) => prev.map((init) => (init.id === id ? updated : init)));
          return;
        } catch (e: unknown) {
          console.error('Erreur API rejectIdea :', e);
        }
      }

      // Fallback local
      setInitiatives((prev) =>
        prev.map((init) => (init.id === id ? { ...init, statut: 'REFUSE' } : init))
      );
    },
    [isBackendLive]
  );

  // 9. Clôturer avec livrable
  const handleCompleteInitiative = useCallback(
    async (id: number, livrableUrl: string) => {
      if (isBackendLive) {
        try {
          const updated = await api.completeInitiative(id, livrableUrl);
          setInitiatives((prev) =>
            prev.map((init) => (init.id === id ? updated : init))
          );
          const summary = await api.getRadarSummary();
          setCollaborateurs(summary.collaborateurs);
          return;
        } catch (e: unknown) {
          console.error('Erreur API completeInitiative :', e);
        }
      }

      // Fallback local
      setInitiatives((prev) =>
        prev.map((init) =>
          init.id === id ? { ...init, statut: 'TERMINE', livrableUrl } : init
        )
      );
    },
    [isBackendLive]
  );

  // Indicateurs dynamiques pour les badges d'onglets
  const counts = useMemo(
    () => ({
      alerts: collaborateurs.filter(
        (c) => c.statutAlerte === 'urgent' || c.statutAlerte === 'intermission'
      ).length,
      availableInitiatives: initiatives.filter((i) => i.statut === 'DISPONIBLE').length,
      pendingValidation: initiatives.filter((i) => i.statut === 'A_VALIDER').length,
    }),
    [collaborateurs, initiatives]
  );

  return {
    collaborateurs,
    initiatives,
    isBackendLive,
    counts,
    loadDashboardData,
    handleAddCollaborateur,
    handleUpdateCollaborateur,
    handleTakeInitiative,
    handleAddInitiative,
    handleProposeIdea,
    handleUpdateInitiative,
    handleValidateIdea,
    handleRejectIdea,
    handleCompleteInitiative,
  };
}
