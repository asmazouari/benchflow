'use client';

import React, { useState } from 'react';
import { Initiative, UserProfile, Metier, Duree, InitiativeUpdatePayload } from '../../types';
import { api } from '../../lib/api';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  Plus,
  Check,
  Clock,
  UserCheck,
  ShieldCheck,
  Sparkles,
  Filter,
  Pencil,
  FileText,
  Download,
} from 'lucide-react';
import { AiSuggestionModal } from '../ui/AiSuggestionModal';
import { EditInitiativeModal } from '../ui/EditInitiativeModal';

interface CatalogTabProps {
  initiatives: Initiative[];
  currentUser: UserProfile;
  onTakeInitiative: (id: number) => void;
  onAddInitiative: (init: Omit<Initiative, 'id' | 'dateCreation' | 'statut' | 'origine'>) => void;
  onProposeIdea?: (
    idea: Omit<Initiative, 'id' | 'dateCreation' | 'statut' | 'origine'>,
    file?: File | null
  ) => void;
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
  const [selectedMetier, setSelectedMetier] = useState<Metier>('Tous');
  const [selectedDuree, setSelectedDuree] = useState<string>('Tous');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [editingInitiative, setEditingInitiative] = useState<Initiative | null>(null);

  const [newTitre, setNewTitre] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newMetier, setNewMetier] = useState<Metier>('Dev');
  const [newDuree, setNewDuree] = useState<Duree>('Sprint');

  // Filter only pre-validated manager initiatives or open ones
  const catalogList = initiatives.filter(
    (i) => i.statut === 'DISPONIBLE' || i.statut === 'EN_COURS'
  );

  const filtered = catalogList.filter((init) => {
    const matchesMetier =
      selectedMetier === 'Tous' || init.metier === selectedMetier || init.metier === 'Tous';
    const matchesDuree = selectedDuree === 'Tous' || init.duree === selectedDuree;
    return matchesMetier && matchesDuree;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitre || !newDesc) return;
    onAddInitiative({
      titre: newTitre,
      description: newDesc,
      metier: newMetier,
      duree: newDuree,
      auteurNom: `${currentUser.nom} (Manager)`,
    });
    setNewTitre('');
    setNewDesc('');
    setShowAddModal(false);
  };

  const handleAdoptAiInitiative = (init: {
    titre: string;
    description: string;
    metier: Metier;
    duree: Duree;
  }) => {
    if (currentUser.role === 'manager') {
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
    } else {
      onAddInitiative({
        ...init,
        auteurNom: `${currentUser.nom} (IA Ollama)`,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
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
            onClick={() => setShowAiModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200 shadow-2xs transition-all cursor-pointer active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Générer avec l&apos;IA</span>
          </button>

          {currentUser.role === 'manager' && (
            <Button
              onClick={() => setShowAddModal(true)}
              icon={<Plus className="w-4 h-4" />}
              variant="primary"
            >
              Déposer un sujet
            </Button>
          )}
        </div>
      </div>

      {/* Filter Toolbar (Style Stitch) */}
      <div className="card-shell p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Métiers */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 no-scrollbar">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
            Métier :
          </span>
          {(['Tous', 'Dev', 'QA', 'PO', 'DevOps'] as Metier[]).map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMetier(m)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                selectedMetier === m
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Durée */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 no-scrollbar">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
            Durée :
          </span>
          {[
            { val: 'Tous', label: 'Toutes' },
            { val: 'Flash', label: '⚡ Flash (< 3j)' },
            { val: 'Sprint', label: '📅 Sprint (1-2 sem)' },
            { val: 'Fond', label: '🚀 Projet de fond' },
          ].map((item) => (
            <button
              key={item.val}
              onClick={() => setSelectedDuree(item.val)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                selectedDuree === item.val
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Initiatives */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((init) => {
          const isAvailable = init.statut === 'DISPONIBLE';

          return (
            <div
              key={init.id}
              className={`card-shell flex flex-col justify-between transition-all duration-200 ${
                isAvailable
                  ? 'hover:border-indigo-400 hover:shadow-lg'
                  : 'opacity-75 bg-slate-50/70 border-dashed'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Badge variant="metier" metier={init.metier}>
                      {init.metier}
                    </Badge>
                    <Badge variant="duree" duree={init.duree}>
                      {init.duree === 'Flash' ? '⚡ < 3 jours' : init.duree === 'Sprint' ? '📅 1-2 sem' : '🚀 Projet de fond'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isAvailable ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold badge-pastel-emerald px-2 py-0.5 rounded-full">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" /> Pré-validé
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold badge-pastel-indigo px-2 py-0.5 rounded-full">
                        <UserCheck className="w-3 h-3" /> En cours
                      </span>
                    )}

                    {currentUser.role === 'manager' && onUpdateInitiative && (
                      <button
                        onClick={() => setEditingInitiative(init)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 transition-colors cursor-pointer"
                        title="Modifier l'initiative"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2">
                  {init.titre}
                </h3>

                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                  {init.description}
                </p>

                {/* Document cadrage MinIO */}
                {init.documentNom && (
                  <div className="pt-1">
                    <a
                      href={api.getInitiativeDocumentDownloadUrl(init.id)}
                      download={init.documentNom}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-all cursor-pointer"
                      title={`Télécharger le cadrage : ${init.documentNom}`}
                    >
                      <FileText className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="truncate max-w-[150px]">{init.documentNom}</span>
                      <Download className="w-3 h-3 text-indigo-500 shrink-0" />
                    </a>
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[11px] text-slate-400 font-medium">
                  {isAvailable ? (
                    <span className="truncate max-w-[140px] block">Déposé par {init.auteurNom}</span>
                  ) : (
                    <span className="text-indigo-600 font-semibold truncate max-w-[140px] block">
                      Assigné : {init.assigneNom}
                    </span>
                  )}
                </div>

                {isAvailable ? (
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
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <Card className="text-center py-12">
          <p className="text-sm font-semibold text-slate-600 mb-1">Aucune initiative disponible pour ces filtres</p>
          <p className="text-xs text-slate-400">Essayez de sélectionner un autre métier ou une autre durée.</p>
        </Card>
      )}

      {/* Modal: Add Initiative (Manager) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">Déposer une Initiative Pré-validée</h2>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Ce sujet sera immédiatement disponible dans le catalogue pour que les collaborateurs en fin de mission puissent s&apos;auto-staffer.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Titre du sujet</label>
                <input
                  type="text"
                  required
                  placeholder="ex: POC Migration Micro-Frontend avec Module Federation"
                  value={newTitre}
                  onChange={(e) => setNewTitre(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description &amp; Objectifs</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Détaillez le besoin, les technos clés et le bénéfice pour le pôle technique..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Métier ciblé</label>
                  <select
                    value={newMetier}
                    onChange={(e) => setNewMetier(e.target.value as Metier)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Tous">Tous (Transverse)</option>
                    <option value="Dev">Développeur</option>
                    <option value="QA">Testeur QA</option>
                    <option value="PO">Product Owner</option>
                    <option value="DevOps">DevOps</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Format de durée</label>
                  <select
                    value={newDuree}
                    onChange={(e) => setNewDuree(e.target.value as Duree)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Flash">⚡ Flash (&lt; 3 jours)</option>
                    <option value="Sprint">📅 Sprint (1-2 semaines)</option>
                    <option value="Fond">🚀 Projet de fond (&gt; 2 semaines)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                  Annuler
                </Button>
                <Button type="submit" variant="primary">
                  Publier au Catalogue
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

      {/* Modal: Édition Initiative */}
      <EditInitiativeModal
        isOpen={!!editingInitiative}
        onClose={() => setEditingInitiative(null)}
        initiative={editingInitiative}
        onSave={onUpdateInitiative || (async () => {})}
        currentUser={currentUser}
      />
    </div>
  );
}
