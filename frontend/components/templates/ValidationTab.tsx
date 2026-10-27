'use client';

import React, { useState } from 'react';
import { Initiative, UserProfile, Metier, Duree } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Check, X, Send, Award, ExternalLink, Sparkles, MessageSquare } from 'lucide-react';
import { AiSuggestionModal } from '../ui/AiSuggestionModal';

interface ValidationTabProps {
  initiatives: Initiative[];
  currentUser: UserProfile;
  onProposeIdea: (idea: Omit<Initiative, 'id' | 'dateCreation' | 'statut' | 'origine'>) => void;
  onValidateIdea: (id: number) => void;
  onRejectIdea: (id: number) => void;
  onCompleteInitiative: (id: number, livrableUrl: string) => void;
}

export function ValidationTab({
  initiatives,
  currentUser,
  onProposeIdea,
  onValidateIdea,
  onRejectIdea,
  onCompleteInitiative,
}: ValidationTabProps) {
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [titre, setTitre] = useState('');
  const [desc, setDesc] = useState('');
  const [metier, setMetier] = useState<Metier>(currentUser.metier || 'Dev');
  const [duree, setDuree] = useState<Duree>('Sprint');

  // Complete modal state
  const [completingId, setCompletingId] = useState<number | null>(null);
  const [livrableUrl, setLivrableUrl] = useState('');

  const pendingList = initiatives.filter((i) => i.statut === 'A_VALIDER');
  const inProgressList = initiatives.filter((i) => i.statut === 'EN_COURS');
  const completedList = initiatives.filter((i) => i.statut === 'TERMINE');

  const handleProposeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titre || !desc) return;
    onProposeIdea({
      titre,
      description: desc,
      metier,
      duree,
      auteurNom: currentUser.nom,
      assigneNom: currentUser.nom,
    });
    setTitre('');
    setDesc('');
    setShowProposeModal(false);
  };

  const handleAdoptAiInitiative = (init: {
    titre: string;
    description: string;
    metier: Metier;
    duree: Duree;
  }) => {
    onProposeIdea({
      ...init,
      auteurNom: `${currentUser.nom} (IA Ollama)`,
      assigneNom: currentUser.nom,
    });
  };

  const handleCompleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (completingId && livrableUrl) {
      onCompleteInitiative(completingId, livrableUrl);
      setCompletingId(null);
      setLivrableUrl('');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header & Propose Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Suivi & Validations</h1>
          <p className="text-sm text-slate-500">
            Fini les e-mails perdus : proposez vos initiatives, validez en 1 clic et valorisez vos livrables finaux
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAiModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200 shadow-2xs transition-all cursor-pointer active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Suggérer avec l&apos;IA</span>
          </button>

          <Button
            onClick={() => setShowProposeModal(true)}
            icon={<Send className="w-4 h-4" />}
            variant="ai"
          >
            Proposer mon idée
          </Button>
        </div>
      </div>

      {/* 1. Manager Queue: Ideas to Validate */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-slate-900">
            ⏳ File de Validation ({pendingList.length})
          </h2>
          {currentUser.role === 'manager' && (
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
            {pendingList.map((item) => (
              <div key={item.id} className="card-shell p-5 space-y-3 hover:border-amber-300">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Badge variant="metier" metier={item.metier}>
                      {item.metier}
                    </Badge>
                    <Badge variant="duree" duree={item.duree}>
                      {item.duree}
                    </Badge>
                  </div>
                  <Badge variant="statut" statut="A_VALIDER">
                    En attente
                  </Badge>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-snug">{item.titre}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">
                    Proposé par <strong className="text-slate-700">{item.auteurNom}</strong>
                  </span>

                  {currentUser.role === 'manager' ? (
                    <div className="flex items-center gap-2">
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
                    </div>
                  ) : (
                    <span className="text-xs text-amber-600 font-medium flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5" /> En attente de votre manager
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Active Projects in Progress */}
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
              <div key={item.id} className="card-shell p-5 space-y-3 hover:border-indigo-300">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Badge variant="metier" metier={item.metier}>
                      {item.metier}
                    </Badge>
                    <Badge variant="statut" statut="EN_COURS">
                      En cours
                    </Badge>
                  </div>
                  <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                    Assigné : {item.assigneNom || 'Non assigné'}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-snug">{item.titre}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Démarré le {item.dateCreation}</span>

                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setCompletingId(item.id)}
                    icon={<Award className="w-3.5 h-3.5" />}
                  >
                    Marquer terminé
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Completed Initiatives (Wall of Fame) */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span>🏆 Projets Réalisés &amp; Livrables ({completedList.length})</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {completedList.map((item) => (
            <div key={item.id} className="card-shell p-5 space-y-2.5 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <Badge variant="metier" metier={item.metier}>
                  {item.metier}
                </Badge>
                <span className="text-[11px] font-bold badge-pastel-emerald px-2 py-0.5 rounded-full">
                  ✓ Livré
                </span>
              </div>

              <h4 className="font-bold text-slate-900 text-sm leading-snug">{item.titre}</h4>
              <p className="text-xs text-slate-500 font-medium">Par {item.assigneNom}</p>

              {item.livrableUrl && (
                <div className="pt-2.5 border-t border-slate-200/80">
                  <a
                    href={item.livrableUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Voir le livrable
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Propose Idea */}
      {showProposeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">Proposer une Initiative Personnelle</h2>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Votre manager recevra une alerte instantanée pour valider votre sujet en 1 clic sans échange d e-mails.
            </p>

            <form onSubmit={handleProposeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Titre de votre proposition</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Préparation Certification AWS Solutions Architect"
                  value={titre}
                  onChange={(e) => setTitre(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description &amp; Objectifs</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Pourquoi ce sujet vous intéresse et comment il apporte de la valeur à la société..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Métier</label>
                  <select
                    value={metier}
                    onChange={(e) => setMetier(e.target.value as Metier)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Dev">Développeur</option>
                    <option value="QA">Testeur QA</option>
                    <option value="PO">Product Owner</option>
                    <option value="DevOps">DevOps</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Durée estimée</label>
                  <select
                    value={duree}
                    onChange={(e) => setDuree(e.target.value as Duree)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Flash">⚡ Flash (&lt; 3 jours)</option>
                    <option value="Sprint">📅 Sprint (1-2 semaines)</option>
                    <option value="Fond">🚀 Projet de fond (&gt; 2 semaines)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowProposeModal(false)}>
                  Annuler
                </Button>
                <Button type="submit" variant="ai">
                  Envoyer au Manager
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Complete Initiative with Deliverable Link */}
      {completingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
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
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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

      {/* Modal: Suggestion IA (Ollama) */}
      <AiSuggestionModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        defaultMetier={currentUser.metier || 'Dev'}
        onAdoptInitiative={handleAdoptAiInitiative}
        isManager={currentUser.role === 'manager'}
      />
    </div>
  );
}
