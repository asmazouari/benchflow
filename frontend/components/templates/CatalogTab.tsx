'use client';

import React, { useState } from 'react';
import { Initiative, UserProfile, Metier, Duree } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Plus, Check, Clock, UserCheck, ShieldCheck, Sparkles, Filter } from 'lucide-react';

interface CatalogTabProps {
  initiatives: Initiative[];
  currentUser: UserProfile;
  onTakeInitiative: (id: number) => void;
  onAddInitiative: (init: Omit<Initiative, 'id' | 'dateCreation' | 'statut' | 'origine'>) => void;
}

export function CatalogTab({
  initiatives,
  currentUser,
  onTakeInitiative,
  onAddInitiative,
}: CatalogTabProps) {
  const [selectedMetier, setSelectedMetier] = useState<Metier>('Tous');
  const [selectedDuree, setSelectedDuree] = useState<string>('Tous');
  const [showAddModal, setShowAddModal] = useState(false);

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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Réserve d Initiatives</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Pré-validé par le Management
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Projets internes prêts à l emploi : choisissez un sujet et démarrez immédiatement sans attendre de validation par e-mail
          </p>
        </div>

        {currentUser.role === 'manager' && (
          <Button
            onClick={() => setShowAddModal(true)}
            icon={<Plus className="w-4 h-4" />}
            variant="primary"
          >
            Déposer une initiative
          </Button>
        )}
      </div>

      {/* Filter Bars */}
      <Card className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4">
        {/* Metier Filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-2">
            <Filter className="w-3.5 h-3.5" /> Métier :
          </span>
          {(['Tous', 'Dev', 'QA', 'PO', 'DevOps'] as Metier[]).map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMetier(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                selectedMetier === m
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Duration Filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-2">
            <Clock className="w-3.5 h-3.5" /> Durée :
          </span>
          {['Tous', 'Flash', 'Sprint', 'Fond'].map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDuree(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                selectedDuree === d
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {d === 'Flash' ? '⚡ Flash (<3j)' : d === 'Sprint' ? '📅 Sprint (1-2s)' : d === 'Fond' ? '🚀 Fond (>2s)' : 'Toutes'}
            </button>
          ))}
        </div>
      </Card>

      {/* Initiatives Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((init) => {
          const isAvailable = init.statut === 'DISPONIBLE';

          return (
            <Card
              key={init.id}
              hoverEffect
              className={`flex flex-col justify-between border-t-4 ${
                isAvailable ? 'border-t-emerald-500' : 'border-t-indigo-400 opacity-90'
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

                  {isAvailable ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" /> Pré-validé
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                      <UserCheck className="w-3 h-3" /> En cours
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2">
                  {init.titre}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {init.description}
                </p>
              </div>

              <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[11px] text-slate-400">
                  {isAvailable ? (
                    <span>Déposé par {init.auteurNom}</span>
                  ) : (
                    <span className="text-indigo-600 font-medium">Assigné à : {init.assigneNom}</span>
                  )}
                </div>

                {isAvailable ? (
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => onTakeInitiative(init.id)}
                    icon={<Check className="w-3.5 h-3.5" />}
                  >
                    Je prends ce sujet
                  </Button>
                ) : (
                  <span className="text-xs font-semibold text-slate-400">Occupé</span>
                )}
              </div>
            </Card>
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
              Ce sujet sera immédiatement disponible dans le catalogue pour que les collaborateurs en fin de mission puissent s auto-staffer.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Titre de l initiative</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Créer une suite de tests E2E avec Playwright"
                  value={newTitre}
                  onChange={(e) => setNewTitre(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Objectifs et description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Décrivez les livrables attendus et pourquoi ce travail est utile à l entreprise..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Métier cible</label>
                  <select
                    value={newMetier}
                    onChange={(e) => setNewMetier(e.target.value as Metier)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Tous">Tous les métiers</option>
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
    </div>
  );
}
