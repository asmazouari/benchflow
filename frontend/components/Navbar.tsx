'use client';

import React from 'react';
import { UserProfile } from '../types';
import { Users, Lightbulb, Clock, Sparkles, LogOut, Shield } from 'lucide-react';

interface NavbarProps {
  activeTab: 'radar' | 'catalog' | 'validation';
  setActiveTab: (tab: 'radar' | 'catalog' | 'validation') => void;
  currentUser: UserProfile;
  counts: {
    alerts: number;
    availableInitiatives: number;
    pendingValidation: number;
  };
  isBackendLive?: boolean;
  onLogout: () => void;
}

export function Navbar({
  activeTab,
  setActiveTab,
  currentUser,
  counts,
  isBackendLive,
  onLogout,
}: NavbarProps) {
  // Initiales de l'utilisateur
  const initials = currentUser.nom
    ? currentUser.nom
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';

  return (
    <header className="sticky top-0 z-40 glass-nav">
      {/* ======================================================== */}
      {/* ÉTAGE 1 : BRANDING & SESSION UTILISATEUR                 */}
      {/* ======================================================== */}
      <div className="w-full px-4 sm:px-6 lg:px-8 border-b border-slate-200/70">
        <div className="flex items-center justify-between h-14">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-200/50">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-lg text-slate-900 tracking-tight">BenchFlow</span>
              <span className="px-2 py-0.5 text-[11px] font-semibold badge-pastel-indigo rounded-full">
                Talent Cloud
              </span>
              <div className="h-3.5 w-px bg-slate-200 hidden md:block" />
              <p className="text-xs text-slate-400 hidden md:block font-medium">
                Anticipation &amp; Valorisation des Inter-projets ESN
              </p>
            </div>
          </div>

          {/* Statut Système & Profil de Session */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Statut Backend / Keycloak */}
            {isBackendLive !== undefined && (
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full transition-all ${
                  isBackendLive ? 'badge-pastel-emerald' : 'badge-pastel-amber'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isBackendLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`}
                />
                <span className="hidden sm:inline">
                  {isBackendLive ? 'FastAPI Live' : 'Mode Démo Vercel'}
                </span>
              </div>
            )}

            <div className="h-4 w-px bg-slate-200" />

            {/* Profil certifié & Déconnexion */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2.5 bg-white border border-slate-200/80 px-3 py-1.5 rounded-xl shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 shadow-2xs">
                  {initials}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-800 leading-none">{currentUser.nom}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold leading-none ${
                        currentUser.role === 'manager'
                          ? 'badge-pastel-amber'
                          : 'badge-pastel-indigo'
                      }`}
                    >
                      {currentUser.role === 'manager' ? '👑 Manager' : currentUser.metier || 'Collaborateur'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block leading-tight mt-0.5 font-medium">
                    {currentUser.email}
                  </span>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 rounded-xl transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
                title="Se déconnecter"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ÉTAGE 2 : SOUS-NAVIGATION AÉRÉE                         */}
      {/* ======================================================== */}
      <div className="w-full px-4 sm:px-6 lg:px-8 bg-white/60">
        <div className="flex items-center justify-between">
          {/* Onglets avec liseré actif violet/indigo */}
          <nav className="flex items-center gap-6 sm:gap-8 overflow-x-auto no-scrollbar">
            {/* Onglet 1 : Radar Staffings */}
            <button
              onClick={() => setActiveTab('radar')}
              className={`flex items-center gap-2 pt-3 pb-2.5 text-sm font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'radar'
                  ? 'border-indigo-600 text-indigo-700 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Radar des Staffings</span>
              {counts.alerts > 0 && (
                <span className="px-2 py-0.5 text-[11px] font-bold badge-pastel-amber rounded-full">
                  {counts.alerts}
                </span>
              )}
            </button>

            {/* Onglet 2 : Réserve Initiatives */}
            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center gap-2 pt-3 pb-2.5 text-sm font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'catalog'
                  ? 'border-indigo-600 text-indigo-700 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <Lightbulb className="w-4 h-4" />
              <span>Réserve Initiatives</span>
              <span className="px-2 py-0.5 text-[11px] font-bold badge-pastel-emerald rounded-full">
                {counts.availableInitiatives}
              </span>
            </button>

            {/* Onglet 3 : Suivi & Validations */}
            <button
              onClick={() => setActiveTab('validation')}
              className={`flex items-center gap-2 pt-3 pb-2.5 text-sm font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'validation'
                  ? 'border-indigo-600 text-indigo-700 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Suivi &amp; Validations</span>
              {counts.pendingValidation > 0 && (
                <span className="px-2 py-0.5 text-[11px] font-bold badge-pastel-indigo rounded-full">
                  {counts.pendingValidation}
                </span>
              )}
            </button>
          </nav>

          {/* Tag de conformité B2B */}
          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 py-2 font-medium">
            <Shield className="w-3.5 h-3.5 text-indigo-500" />
            <span>Pilotage ESN Sécurisé</span>
          </div>
        </div>
      </div>
    </header>
  );
}
