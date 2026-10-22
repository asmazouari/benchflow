'use client';

import React from 'react';
import { UserProfile } from '../types';
import { MOCK_USERS } from '../lib/mockData';
import { Users, Lightbulb, Clock, Sparkles, LogOut } from 'lucide-react';

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
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      {/* ======================================================== */}
      {/* ÉTAGE 1 : IDENTITÉ DE L'ENTREPRISE & SESSION UTILISATEUR */}
      {/* ======================================================== */}
      <div className="w-full px-4 sm:px-6 lg:px-8 border-b border-slate-100">
        <div className="flex items-center justify-between h-14">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-lg text-slate-900 tracking-tight">BenchFlow</span>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full">
                Tech Talent Hub
              </span>
              <div className="h-3.5 w-px bg-slate-200 hidden md:block" />
              <p className="text-xs text-slate-400 hidden md:block">Anticipation &amp; Valorisation des Inter-projets</p>
            </div>
          </div>

          {/* Statut Système & Profil de Session */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Statut Backend / Keycloak */}
            {isBackendLive !== undefined && (
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border transition-all ${
                  isBackendLive
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isBackendLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                <span className="hidden sm:inline">{isBackendLive ? 'FastAPI Live' : 'Mode Démo'}</span>
              </div>
            )}

            <div className="h-4 w-px bg-slate-200" />

            {/* Profil certifié Keycloak & Bouton Déconnexion */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
                <div className="w-6 h-6 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-xs font-bold text-indigo-700">
                  {currentUser.role === 'manager' ? '👑' : '👤'}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-800 leading-none">{currentUser.nom}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold leading-none ${
                        currentUser.role === 'manager'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-indigo-100 text-indigo-700'
                      }`}
                    >
                      {currentUser.role === 'manager' ? 'Manager' : currentUser.metier || 'Collaborateur'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block leading-tight mt-0.5">{currentUser.email}</span>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
                title="Se déconnecter de Keycloak"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ÉTAGE 2 : SOUS-NAVIGATION AÉRÉE (STYLE VERCEL / GITHUB)   */}
      {/* ======================================================== */}
      <div className="w-full px-4 sm:px-6 lg:px-8 bg-white/70">
        <div className="flex items-center justify-between">
          {/* Onglets avec liseré actif violet/indigo */}
          <nav className="flex items-center gap-6 sm:gap-8 overflow-x-auto no-scrollbar">
            {/* Onglet 1 : Radar Staffings */}
            <button
              onClick={() => setActiveTab('radar')}
              className={`flex items-center gap-2 pt-3 pb-2.5 text-sm font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'radar'
                  ? 'border-indigo-600 text-indigo-700 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Radar des Staffings</span>
              {counts.alerts > 0 && (
                <span className="px-1.5 py-0.5 text-xs font-bold bg-amber-100 text-amber-800 rounded-full">
                  {counts.alerts}
                </span>
              )}
            </button>

            {/* Onglet 2 : Réserve Initiatives */}
            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center gap-2 pt-3 pb-2.5 text-sm font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'catalog'
                  ? 'border-indigo-600 text-indigo-700 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <Lightbulb className="w-4 h-4" />
              <span>Réserve Initiatives</span>
              <span className="px-1.5 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-full">
                {counts.availableInitiatives}
              </span>
            </button>

            {/* Onglet 3 : Suivi & Validations */}
            <button
              onClick={() => setActiveTab('validation')}
              className={`flex items-center gap-2 pt-3 pb-2.5 text-sm font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'validation'
                  ? 'border-indigo-600 text-indigo-700 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Suivi &amp; Validations</span>
              {counts.pendingValidation > 0 && (
                <span className="px-1.5 py-0.5 text-xs font-bold bg-purple-100 text-purple-800 rounded-full">
                  {counts.pendingValidation}
                </span>
              )}
            </button>
          </nav>

          {/* Contexte discret à droite de la sous-barre */}
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 py-2">
            <span>Consultants suivis :</span>
            <span className="font-semibold text-slate-600">6 profils</span>
          </div>
        </div>
      </div>
    </header>
  );
}
