'use client';

import React, { useState } from 'react';
import { Collaborateur, CollaborateurUpdatePayload, UserProfile, Metier } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  UserPlus,
  Calendar,
  Briefcase,
  Filter,
  Search,
  Sparkles,
  ArrowUpRight,
  Pencil,
} from 'lucide-react';
import { EditCollaborateurModal } from '../ui/EditCollaborateurModal';

interface RadarTabProps {
  collaborateurs: Collaborateur[];
  currentUser: UserProfile;
  onAddCollaborateur: (collab: Omit<Collaborateur, 'id' | 'joursRestants' | 'statutAlerte'>) => void;
  onSelectCollaborateur: (collab: Collaborateur) => void;
  onUpdateCollaborateur?: (id: number, data: CollaborateurUpdatePayload) => Promise<void>;
}

export function RadarTab({
  collaborateurs,
  currentUser,
  onAddCollaborateur,
  onSelectCollaborateur,
  onUpdateCollaborateur,
}: RadarTabProps) {
  const [selectedMetier, setSelectedMetier] = useState<Metier>('Tous');
  const [filterStatus, setFilterStatus] = useState<'all' | 'stable' | 'urgent' | 'intermission'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCollab, setEditingCollab] = useState<Collaborateur | null>(null);

  // Form states
  const [newNom, setNewNom] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newMetier, setNewMetier] = useState<Metier>('Dev');
  const [newDate, setNewDate] = useState('');
  const [newClient, setNewClient] = useState('');

  // Metrics
  const stableCount = collaborateurs.filter((c) => c.statutAlerte === 'stable').length;
  const urgentCount = collaborateurs.filter((c) => c.statutAlerte === 'urgent').length;
  const benchCount = collaborateurs.filter((c) => c.statutAlerte === 'intermission').length;

  // Filtered List
  const filtered = collaborateurs.filter((c) => {
    const matchMetier = selectedMetier === 'Tous' || c.metier === selectedMetier;
    const matchStatus = filterStatus === 'all' || c.statutAlerte === filterStatus;
    const matchSearch =
      searchQuery === '' ||
      c.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.clientActuel && c.clientActuel.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchMetier && matchStatus && matchSearch;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNom || !newEmail || !newDate) return;
    onAddCollaborateur({
      nom: newNom,
      email: newEmail,
      metier: newMetier,
      dateFinStaffing: newDate,
      role: 'collaborateur',
      clientActuel: newClient || 'Mission en cours',
    });
    setNewNom('');
    setNewEmail('');
    setNewDate('');
    setNewClient('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-[11px] font-bold badge-pastel-indigo rounded-full">
              Matrice de Staffing
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Radar des Staffings &amp; Inter-projets
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Anticipation proactive des fins de mission pour éliminer les temps morts et valoriser les compétences.
          </p>
        </div>

        {currentUser.role === 'manager' && (
          <Button
            onClick={() => setShowAddModal(true)}
            icon={<UserPlus className="w-4 h-4" />}
            variant="primary"
          >
            Nouveau collaborateur
          </Button>
        )}
      </div>

      {/* Summary KPI Cards (Style Stitch Modern) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1 : Stables */}
        <div
          onClick={() => setFilterStatus(filterStatus === 'stable' ? 'all' : 'stable')}
          className={`card-shell p-5 cursor-pointer transition-all ${
            filterStatus === 'stable' ? 'ring-2 ring-emerald-500 bg-emerald-50/20' : ''
          }`}
          title="Cliquer pour filtrer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Missions Stables</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{stableCount}</span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              &gt; 15 jours
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2 font-medium">Consultants sécurisés sur mission longue</p>
        </div>

        {/* Card 2 : Urgents */}
        <div
          onClick={() => setFilterStatus(filterStatus === 'urgent' ? 'all' : 'urgent')}
          className={`card-shell p-5 cursor-pointer transition-all ${
            filterStatus === 'urgent' ? 'ring-2 ring-amber-500 bg-amber-50/20' : ''
          }`}
          title="Cliquer pour filtrer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Alertes Urgentes</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shadow-sm shadow-amber-200" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-600 tracking-tight">{urgentCount}</span>
            <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              &le; 15 jours
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2 font-medium">Fins de mission imminentes à repositionner</p>
        </div>

        {/* Card 3 : Intermissions */}
        <div
          onClick={() => setFilterStatus(filterStatus === 'intermission' ? 'all' : 'intermission')}
          className={`card-shell p-5 cursor-pointer transition-all ${
            filterStatus === 'intermission' ? 'ring-2 ring-rose-500 bg-rose-50/20' : ''
          }`}
          title="Cliquer pour filtrer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">En Intermission</span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-200" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-600 tracking-tight">{benchCount}</span>
            <span className="text-xs font-semibold text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
              Immédiat
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2 font-medium">Disponibles pour initiatives ou projets internes</p>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="card-shell p-3 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Recherche textuelle */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, email ou client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-slate-50/80 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 transition-all outline-none"
          />
        </div>

        {/* Filtres par Métier */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
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

          {filterStatus !== 'all' && (
            <button
              onClick={() => setFilterStatus('all')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 px-2 py-1 underline cursor-pointer whitespace-nowrap"
            >
              Effacer filtre statut
            </button>
          )}
        </div>
      </div>

      {/* Collaborators Table (Style Stitch) */}
      <div className="card-shell p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="px-6 py-3.5">Collaborateur</th>
                <th className="px-6 py-3.5">Métier</th>
                <th className="px-6 py-3.5">Mission Client Actuelle</th>
                <th className="px-6 py-3.5">Date de Fin</th>
                <th className="px-6 py-3.5">Statut d&apos;Anticipation</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-xs">
                    Aucun collaborateur ne correspond à ces critères de recherche.
                  </td>
                </tr>
              ) : (
                filtered.map((collab) => {
                  let badgeLabel = `${collab.joursRestants}j restants`;
                  if (collab.joursRestants === 0) badgeLabel = "Fin aujourd'hui !";
                  if (collab.joursRestants < 0) badgeLabel = `Intermission (J+${Math.abs(collab.joursRestants)})`;

                  const initials = collab.nom
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2);

                  return (
                    <tr key={collab.id} className="hover:bg-slate-50/60 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shadow-2xs">
                            {initials}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {collab.nom}
                            </p>
                            <p className="text-[11px] text-slate-400 font-medium">{collab.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="metier" metier={collab.metier}>
                          {collab.metier}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-medium text-xs truncate max-w-xs">
                            {collab.clientActuel || 'Mission client'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        <div className="flex items-center gap-1.5 text-xs font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{collab.dateFinStaffing}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="alerte" alerte={collab.statutAlerte}>
                          {badgeLabel}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {currentUser.role === 'manager' && onUpdateCollaborateur && (
                            <button
                              onClick={() => setEditingCollab(collab)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 transition-all cursor-pointer"
                              title="Modifier le profil & la mission"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Modifier</span>
                            </button>
                          )}
                          <button
                            onClick={() => onSelectCollaborateur(collab)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border border-transparent hover:border-indigo-200 transition-all cursor-pointer"
                          >
                            <span>Voir initiatives</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Collaborator */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <UserPlus className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Ajouter un Collaborateur</h2>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Enregistrez un consultant avec sa date de fin de staffing pour le radar d&apos;anticipation.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nom complet
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Alex Dupont"
                  value={newNom}
                  onChange={(e) => setNewNom(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="alex.dupont@societe.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Métier
                  </label>
                  <select
                    value={newMetier}
                    onChange={(e) => setNewMetier(e.target.value as Metier)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 outline-none"
                  >
                    <option value="Dev">Dev</option>
                    <option value="QA">QA</option>
                    <option value="PO">PO</option>
                    <option value="DevOps">DevOps</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Fin de Staffing
                  </label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 outline-none"
                  >
                  </input>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Client ou Projet actuel
                </label>
                <input
                  type="text"
                  placeholder="ex: BNP Paribas (API Cloud)"
                  value={newClient}
                  onChange={(e) => setNewClient(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                  Annuler
                </Button>
                <Button type="submit" variant="primary">
                  Enregistrer
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Collaborator */}
      <EditCollaborateurModal
        isOpen={!!editingCollab}
        onClose={() => setEditingCollab(null)}
        collaborateur={editingCollab}
        onSave={onUpdateCollaborateur || (async () => {})}
      />
    </div>
  );
}
