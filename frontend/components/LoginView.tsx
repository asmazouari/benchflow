'use client';

import React, { useState } from 'react';
import { Sparkles, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { api, LoginResponse } from '../lib/api';

interface LoginViewProps {
  onLoginSuccess: (session: LoginResponse) => void;
}

export function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const response = await api.login(email.trim(), password);
      onLoginSuccess(response);
    } catch (err: any) {
      setErrorMessage(err.message || 'Identifiants incorrects. Accès refusé par Keycloak.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-slate-900 antialiased flex flex-col justify-between relative overflow-hidden select-none">
      {/* Reflets ambiants d'arrière-plan */}
      <div className="absolute -top-32 -left-20 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-20 w-[28rem] h-[28rem] bg-violet-200/40 rounded-full blur-3xl pointer-events-none" />

      {/* Barre supérieure minimale */}
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-slate-200/60 bg-white/70 backdrop-blur-md z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-900 tracking-tight text-base">BenchFlow</span>
          <span className="text-xs text-slate-400 hidden sm:inline">• Portail d&apos;Authentification SSO</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Serveur Keycloak En Ligne</span>
        </div>
      </header>

      {/* Conteneur central surélevé */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10">
        <div className="w-full max-w-[460px] bg-white border border-slate-200 rounded-2xl shadow-xl p-6 sm:p-8 relative">
          {/* En-tête de la carte */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 mb-3 shadow-2xs">
              <Sparkles className="w-6 h-6" />
            </div>

            {/* Pill Keycloak */}
            <div className="flex justify-center mb-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-[11px] font-semibold text-indigo-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Authentification Sécurisée Keycloak</span>
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Portail Collaborateur &amp; Manager
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
              Connectez-vous avec vos identifiants d&apos;entreprise pour piloter les missions et initiatives internes.
            </p>
          </div>

          {/* Bannière d'erreur si échec */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Formulaire d'authentification officiel */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Champ Email */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5" htmlFor="email">
                Email professionnel
              </label>
              <div className="relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="prenom.nom@benchflow.tech"
                  required
                  className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 transition-all outline-none font-medium"
                />
              </div>
            </div>

            {/* Champ Mot de passe */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider" htmlFor="password">
                  Mot de passe
                </label>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Pour réinitialiser votre mot de passe, contactez l’administrateur Keycloak de votre entreprise.');
                  }}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                >
                  Mot de passe oublié ?
                </a>
              </div>
              <div className="relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-9 pr-10 py-2.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 transition-all outline-none font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Options */}
            <div className="flex items-center">
              <input
                id="remember_me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20 cursor-pointer"
              />
              <label htmlFor="remember_me" className="ml-2 block text-xs text-slate-600 cursor-pointer">
                Se souvenir de moi sur cet appareil
              </label>
            </div>

            {/* Bouton de soumission */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold shadow-md shadow-indigo-100 transition-all cursor-pointer active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Vérification Keycloak en cours...</span>
                </>
              ) : (
                <>
                  <span>Se connecter à BenchFlow</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Raccourcis Accès Démo V1 */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-400 text-center uppercase tracking-wider mb-2.5">
              Accès rapide Démo V1 (Remplissage 1-Clic)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail('thomas.laurent@benchflow.tech');
                  setPassword('password123');
                }}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200 rounded-lg transition-all cursor-pointer shadow-2xs"
              >
                <span>👔 Thomas (Manager)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('sara.benali@benchflow.tech');
                  setPassword('password123');
                }}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200 rounded-lg transition-all cursor-pointer shadow-2xs"
              >
                <span>💻 Sara (Dev)</span>
              </button>
            </div>
          </div>

          {/* Micro-mention de sécurité */}
          <div className="mt-5 pt-4 border-t border-slate-100 text-center flex items-center justify-center gap-1.5 text-slate-400 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Protégé par Keycloak OpenID Connect • Chiffrement RS256</span>
          </div>


        </div>
      </main>

      {/* Pied de page de conformité B2B */}
      <footer className="w-full py-4 px-6 border-t border-slate-200/60 bg-white/50 text-center text-xs text-slate-400 z-10 flex flex-wrap justify-between items-center gap-3">
        <p>BenchFlow © 2026 — Plateforme d&apos;Anticipation &amp; Valorisation des Inter-projets ESN</p>
        <div className="flex items-center gap-3 text-[11px]">
          <span>Conforme RGPD</span>
          <span>•</span>
          <span>Certifié ISO 27001</span>
          <span>•</span>
          <span>Audit Trail Actif</span>
        </div>
      </footer>
    </div>
  );
}
