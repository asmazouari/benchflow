'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Collaborateur, Initiative, UserProfile } from '../types';
import { INITIAL_COLLABORATEURS, INITIAL_INITIATIVES } from '../lib/mockData';
import { api, authStorage, LoginResponse } from '../lib/api';
import { Navbar } from '../components/Navbar';
import { LoginView } from '../components/LoginView';
import { RadarTab } from '../components/templates/RadarTab';
import { CatalogTab } from '../components/templates/CatalogTab';
import { ValidationTab } from '../components/templates/ValidationTab';
import { Loader2, Sparkles } from 'lucide-react';

export default function Home() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authChecking, setAuthChecking] = useState<boolean>(true);

  const [activeTab, setActiveTab] = useState<'radar' | 'catalog' | 'validation'>('radar');
  const [collaborateurs, setCollaborateurs] = useState<Collaborateur[]>(INITIAL_COLLABORATEURS);
  const [initiatives, setInitiatives] = useState<Initiative[]>(INITIAL_INITIATIVES);
  const [isBackendLive, setIsBackendLive] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Charge les données fraîches depuis le backend FastAPI
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [summary, inits] = await Promise.all([
        api.getRadarSummary(),
        api.getInitiatives(),
      ]);
      setCollaborateurs(summary.collaborateurs);
      setInitiatives(inits);
      setIsBackendLive(true);
    } catch (err) {
      console.warn('Backend FastAPI non connecté ou erreur de chargement, données de secours :', err);
      setIsBackendLive(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Vérification de la session Keycloak au montage du composant
  useEffect(() => {
    async function checkSession() {
      const token = authStorage.getToken();
      if (!token) {
        setAuthChecking(false);
        return;
      }

      try {
        const profile = await api.getMe();
        setCurrentUser(profile);
        setIsAuthenticated(true);
        await loadDashboardData();
      } catch (err) {
        console.warn('Session Keycloak expirée ou token invalide :', err);
        api.logout();
        setCurrentUser(null);
        setIsAuthenticated(false);
      } finally {
        setAuthChecking(false);
      }
    }

    checkSession();
  }, [loadDashboardData]);

  // Connexion réussie via le formulaire Keycloak
  const handleLoginSuccess = async (session: LoginResponse) => {
    setCurrentUser(session.user);
    setIsAuthenticated(true);
    await loadDashboardData();
  };

  // Déconnexion propre
  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
    setActiveTab('radar');
  };

  // 1. Action : Ajouter un collaborateur (Manager)
  const handleAddCollaborateur = async (
    newCollabData: Omit<Collaborateur, 'id' | 'joursRestants' | 'statutAlerte'>
  ) => {
    if (isBackendLive) {
      try {
        const created = await api.createCollaborateur(newCollabData);
        setCollaborateurs((prev) => [created, ...prev]);
        // Rafraîchit les compteurs du Radar
        const summary = await api.getRadarSummary();
        setCollaborateurs(summary.collaborateurs);
        return;
      } catch (e: any) {
        console.error('Erreur API createCollaborateur :', e);
        alert(`Erreur d'enregistrement sur le serveur : ${e.message || 'Échec de connexion'}`);
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
  };

  // 2. Action : Prendre une initiative disponible (1 clic)
  const handleTakeInitiative = async (id: number) => {
    const userNom = currentUser?.nom || 'Collaborateur';
    if (isBackendLive) {
      try {
        const updated = await api.takeInitiative(id, userNom);
        setInitiatives((prev) => prev.map((init) => (init.id === id ? updated : init)));
        const summary = await api.getRadarSummary();
        setCollaborateurs(summary.collaborateurs);
        setActiveTab('validation');
        return;
      } catch (e) {
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
    setActiveTab('validation');
  };

  // 3. Action : Déposer une initiative pré-validée (Manager)
  const handleAddInitiative = async (
    newInitData: Omit<Initiative, 'id' | 'dateCreation' | 'statut' | 'origine'>
  ) => {
    if (isBackendLive) {
      try {
        const created = await api.createInitiative(newInitData, true);
        setInitiatives((prev) => [created, ...prev]);
        return;
      } catch (e) {
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
  };

  // 4. Action : Proposer une initiative personnelle (Collaborateur)
  const handleProposeIdea = async (
    newIdeaData: Omit<Initiative, 'id' | 'dateCreation' | 'statut' | 'origine'>
  ) => {
    if (isBackendLive) {
      try {
        const created = await api.createInitiative(newIdeaData, false);
        setInitiatives((prev) => [created, ...prev]);
        return;
      } catch (e) {
        console.error('Erreur API proposeIdea :', e);
      }
    }

    // Fallback local
    const newIdea: Initiative = {
      ...newIdeaData,
      id: Date.now(),
      dateCreation: new Date().toISOString().split('T')[0],
      statut: 'A_VALIDER',
      origine: 'collaborateur',
    };
    setInitiatives((prev) => [newIdea, ...prev]);
  };

  // 5. Action : Valider une initiative (Manager)
  const handleValidateIdea = async (id: number) => {
    if (isBackendLive) {
      try {
        const updated = await api.validateInitiative(id);
        setInitiatives((prev) => prev.map((init) => (init.id === id ? updated : init)));
        return;
      } catch (e) {
        console.error('Erreur API validateIdea :', e);
      }
    }

    // Fallback local
    setInitiatives((prev) =>
      prev.map((init) => (init.id === id ? { ...init, statut: 'EN_COURS' } : init))
    );
  };

  // 6. Action : Refuser une initiative (Manager)
  const handleRejectIdea = async (id: number) => {
    if (isBackendLive) {
      try {
        const updated = await api.rejectInitiative(id);
        setInitiatives((prev) => prev.map((init) => (init.id === id ? updated : init)));
        return;
      } catch (e) {
        console.error('Erreur API rejectIdea :', e);
      }
    }

    // Fallback local
    setInitiatives((prev) =>
      prev.map((init) => (init.id === id ? { ...init, statut: 'REFUSE' } : init))
    );
  };

  // 7. Action : Clôturer avec livrable
  const handleCompleteInitiative = async (id: number, livrableUrl: string) => {
    if (isBackendLive) {
      try {
        const updated = await api.completeInitiative(id, livrableUrl);
        setInitiatives((prev) =>
          prev.map((init) => (init.id === id ? updated : init))
        );
        const summary = await api.getRadarSummary();
        setCollaborateurs(summary.collaborateurs);
        return;
      } catch (e) {
        console.error('Erreur API completeInitiative :', e);
      }
    }

    // Fallback local
    setInitiatives((prev) =>
      prev.map((init) =>
        init.id === id ? { ...init, statut: 'TERMINE', livrableUrl } : init
      )
    );
  };

  // Redirection automatique quand on clique sur "Voir initiatives" depuis le Radar
  const handleSelectCollaborateur = (_collab: Collaborateur) => {
    setActiveTab('catalog');
  };

  // Indicateurs dynamiques pour les badges d'onglets
  const counts = {
    alerts: collaborateurs.filter(
      (c) => c.statutAlerte === 'urgent' || c.statutAlerte === 'intermission'
    ).length,
    availableInitiatives: initiatives.filter((i) => i.statut === 'DISPONIBLE').length,
    pendingValidation: initiatives.filter((i) => i.statut === 'A_VALIDER').length,
  };

  // 1. Écran de chargement pendant la vérification du token Keycloak
  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#f8f9ff] flex flex-col items-center justify-center">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-bold text-2xl text-slate-900 tracking-tight">BenchFlow</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
          <span>Vérification de la session Keycloak...</span>
        </div>
      </div>
    );
  }

  // 2. Si l'utilisateur n'est pas authentifié, afficher l'écran de Login B2B Keycloak
  if (!isAuthenticated || !currentUser) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  // 3. Utilisateur authentifié : Dashboard complet avec RBAC et Double-Barre
  return (
    <div className="min-h-screen bg-[#f8f9ff] text-slate-900 antialiased flex flex-col">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        counts={counts}
        isBackendLive={isBackendLive}
        onLogout={handleLogout}
      />

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'radar' && (
          <RadarTab
            collaborateurs={collaborateurs}
            currentUser={currentUser}
            onAddCollaborateur={handleAddCollaborateur}
            onSelectCollaborateur={handleSelectCollaborateur}
          />
        )}

        {activeTab === 'catalog' && (
          <CatalogTab
            initiatives={initiatives}
            currentUser={currentUser}
            onTakeInitiative={handleTakeInitiative}
            onAddInitiative={handleAddInitiative}
          />
        )}

        {activeTab === 'validation' && (
          <ValidationTab
            initiatives={initiatives}
            currentUser={currentUser}
            onProposeIdea={handleProposeIdea}
            onValidateIdea={handleValidateIdea}
            onRejectIdea={handleRejectIdea}
            onCompleteInitiative={handleCompleteInitiative}
          />
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        <p>BenchFlow © 2026 — Plateforme d&apos;Anticipation &amp; Valorisation des Inter-projets ESN</p>
      </footer>
    </div>
  );
}
