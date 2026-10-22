'use client';

import React, { useState } from 'react';
import { Collaborateur, UserProfile, Metier } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { AlertCircle, CheckCircle2, AlertTriangle, UserPlus, Calendar, Briefcase, Filter } from 'lucide-react';

interface RadarTabProps {
  collaborateurs: Collaborateur[];
  currentUser: UserProfile;
  onAddCollaborateur: (collab: Omit<Collaborateur, 'id' | 'joursRestants' | 'statutAlerte'>) => void;
  onSelectCollaborateur: (collab: Collaborateur) => void;
}

export function RadarTab({
  collaborateurs,
  currentUser,
  onAddCollaborateur,
  onSelectCollaborateur,
}: RadarTabProps) {
  const [selectedMetier, setSelectedMetier] = useState<Metier>('Tous');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNom, setNewNom] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newMetier, setNewMetier] = useState<Metier>('Dev');
  const [newDate, setNewDate] = useState('');
  const [newClient, setNewClient] = useState('');

  // Count metrics
  const stableCount = collaborateurs.filter((c) => c.statutAlerte === 'stable').length;
  const urgentCount = collaborateurs.filter((c) => c.statutAlerte === 'urgent').length;
  const benchCount = collaborateurs.filter((c) => c.statutAlerte === 'intermission').length;

  const filtered = collaborateurs.filter(
    (c) => selectedMetier === 'Tous' || c.metier === selectedMetier
  );

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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Radar des Staffings</h1>
          <p className="text-sm text-slate-500">
            Anticipation proactive des fins de mission pour éliminer les temps d attente
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

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-emerald-500 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-900">{stableCount}</span>
            <p className="text-xs font-medium text-slate-500">Missions stables (&gt; 30 jours)</p>
          </div>
        </Card>

        <Card className="border-l-4 border-l-amber-500 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-bold text-amber-600">{urgentCount}</span>
            <p className="text-xs font-medium text-slate-500">Fins imminentes (&lt; 15 jours — Action !)</p>
          </div>
        </Card>

        <Card className="border-l-4 border-l-rose-500 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-bold text-rose-600">{benchCount}</span>
            <p className="text-xs font-medium text-slate-500">En inter-projet disponible</p>
          </div>
        </Card>
      </div>

      {/* Filter Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-2">
          <Filter className="w-3.5 h-3.5" /> Métier :
        </span>
        {(['Tous', 'Dev', 'QA', 'PO', 'DevOps'] as Metier[]).map((m) => (
          <button
            key={m}
            onClick={() => setSelectedMetier(m)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              selectedMetier === m
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Collaborators Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Collaborateur</th>
                <th className="px-6 py-4">Métier</th>
                <th className="px-6 py-4">Mission Client Actuelle</th>
                <th className="px-6 py-4">Date de Fin</th>
                <th className="px-6 py-4">Statut d Anticipation</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((collab) => {
                let badgeLabel = `${collab.joursRestants} jours restants`;
                if (collab.joursRestants === 0) badgeLabel = "Fin aujourd hui !";
                if (collab.joursRestants < 0) badgeLabel = `En intermission (J+${Math.abs(collab.joursRestants)})`;

                return (
                  <tr key={collab.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                          {collab.nom.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{collab.nom}</p>
                          <p className="text-xs text-slate-400">{collab.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="metier" metier={collab.metier}>
                        {collab.metier}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-600 flex items-center gap-1.5 pt-6">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate max-w-xs">{collab.clientActuel || 'Mission client'}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="flex items-center gap-1.5">
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
                      <Button
                        size="sm"
                        variant={collab.statutAlerte === 'urgent' ? 'primary' : 'outline'}
                        onClick={() => onSelectCollaborateur(collab)}
                      >
                        Voir initiatives
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal: Add Collaborator */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Ajouter un Collaborateur</h2>
            <p className="text-xs text-slate-500 mb-4">
              Enregistrez un membre de l équipe avec sa date de fin de staffing pour le radar.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nom & Prénom</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Yassine Belhadj"
                  value={newNom}
                  onChange={(e) => setNewNom(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email professionnel</label>
                <input
                  type="email"
                  required
                  placeholder="ex: yassine@benchflow.tech"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Métier</label>
                  <select
                    value={newMetier}
                    onChange={(e) => setNewMetier(e.target.value as Metier)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Dev">Développeur</option>
                    <option value="QA">Testeur QA</option>
                    <option value="PO">Product Owner</option>
                    <option value="DevOps">DevOps</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date fin de mission</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Client ou Projet actuel</label>
                <input
                  type="text"
                  placeholder="ex: Projet E-Santé"
                  value={newClient}
                  onChange={(e) => setNewClient(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
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
    </div>
  );
}
