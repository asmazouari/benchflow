'use client';

import React, { useState, useEffect } from 'react';
import { Navbar, LoginView } from '../components/organisms';
import { RadarTab, CatalogTab, ValidationTab } from '../components/templates';
import { useAuthSession, useBenchFlowData } from '../hooks';
import { Loader2, Sparkles } from 'lucide-react';

/**
 * Page principale BenchFlow (Niveau 5 - Page Atomic Design).
 * Rôle : Chef d'orchestre visuel. Injecte les données et callbacks
 * dans les templates correspondants (Radar, Catalogue, Validation)
 * en déléguant la gestion d'état et le réseau aux custom hooks.
 */
export default function Home() {
  const [activeTab, setActiveTab] = useState<'radar' | 'catalog' | 'validation'>('radar');

  const {
    currentUser,
    isAuthenticated,
    authChecking,
    handleLoginSuccess,
    handleLogout: rawHandleLogout,
  } = useAuthSession();

  const handleLogout = () => {
    rawHandleLogout();
    setActiveTab('radar');
  };

  const {
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
  } = useBenchFlowData({
    currentUser,
    onNavigateTab: setActiveTab,
  });

  // Dès que l'utilisateur est authentifié, on charge les données fraîches depuis le backend
  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated, loadDashboardData]);

  // Redirection automatique quand on clique sur "Voir initiatives" depuis le Radar
  const handleSelectCollaborateur = () => {
    setActiveTab('catalog');
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
    return (
      <LoginView
        onLoginSuccess={async (session) => {
          handleLoginSuccess(session);
          await loadDashboardData();
        }}
      />
    );
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
            onUpdateCollaborateur={handleUpdateCollaborateur}
          />
        )}

        {activeTab === 'catalog' && (
          <CatalogTab
            initiatives={initiatives}
            currentUser={currentUser}
            onTakeInitiative={handleTakeInitiative}
            onAddInitiative={handleAddInitiative}
            onProposeIdea={handleProposeIdea}
            onUpdateInitiative={handleUpdateInitiative}
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
            onUpdateInitiative={handleUpdateInitiative}
          />
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        <p>BenchFlow © 2026 — Plateforme d&apos;Anticipation &amp; Valorisation des Inter-projets ESN</p>
      </footer>
    </div>
  );
}
