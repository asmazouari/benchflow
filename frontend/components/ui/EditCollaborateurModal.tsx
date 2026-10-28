'use client';

import React, { useState, useEffect } from 'react';
import { Collaborateur, CollaborateurUpdatePayload, Metier } from '../../types';
import { Badge } from './Badge';
import { Button } from './Button';
import { UserCog, Calendar, Briefcase, Mail, User, X, Loader2, AlertCircle } from 'lucide-react';

interface EditCollaborateurModalProps {
  isOpen: boolean;
  onClose: () => void;
  collaborateur: Collaborateur | null;
  onSave: (id: number, data: CollaborateurUpdatePayload) => Promise<void>;
}

export function EditCollaborateurModal({
  isOpen,
  onClose,
  collaborateur,
  onSave,
}: EditCollaborateurModalProps) {
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [metier, setMetier] = useState<Metier>('Dev');
  const [clientActuel, setClientActuel] = useState('');
  const [dateFinStaffing, setDateFinStaffing] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (collaborateur) {
      setNom(collaborateur.nom || '');
      setEmail(collaborateur.email || '');
      setMetier(collaborateur.metier === 'Tous' ? 'Dev' : (collaborateur.metier || 'Dev'));
      setClientActuel(collaborateur.clientActuel || '');
      setDateFinStaffing(collaborateur.dateFinStaffing || '');
      setError(null);
    }
  }, [collaborateur]);

  if (!isOpen || !collaborateur) return null;

  // Calcul dynamique en direct des jours restants et du statut d'alerte anticipé
  const calculateDaysRemaining = (dateStr: string): number | null => {
    if (!dateStr) return null;
    const target = new Date(dateStr);
    if (isNaN(target.getTime())) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  };

  const previewDays = calculateDaysRemaining(dateFinStaffing);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim() || !email.trim() || !dateFinStaffing) {
      setError('Veuillez renseigner tous les champs obligatoires.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSave(collaborateur.id, {
        nom: nom.trim(),
        email: email.trim(),
        metier,
        clientActuel: clientActuel.trim() || 'Mission en cours',
        dateFinStaffing,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Impossible de mettre à jour le collaborateur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        {/* En-tête */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <UserCog className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Modifier le Collaborateur</h2>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full">
                  Manager
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Ajustez les paramètres de mission et recalculez automatiquement le radar d&apos;alerte.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Nom complet */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Nom complet *
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                required
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="ex. Sophie Martin"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Email professionnel *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sophie.martin@esn.fr"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Profil Métier */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Métier / Spécialité
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {(['Dev', 'QA', 'PO', 'DevOps'] as Metier[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMetier(m)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    metier === m
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Client Actuel */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Mission / Client actuel
            </label>
            <div className="relative">
              <Briefcase className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={clientActuel}
                onChange={(e) => setClientActuel(e.target.value)}
                placeholder="ex. BNP Paribas — Refonte API"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Date de Fin de Staffing */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Date de fin de staffing prévue *
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="date"
                required
                value={dateFinStaffing}
                onChange={(e) => setDateFinStaffing(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
              />
            </div>
          </div>

          {/* Calcul en direct de l'alerte Radar */}
          {previewDays !== null && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div className="text-xs">
                <span className="text-slate-500 font-medium">Recalcul automatique de l&apos;alerte :</span>
                <p className="font-bold text-slate-900 mt-0.5">
                  {previewDays > 15 && `🟢 Période stable (${previewDays} jours restants)`}
                  {previewDays >= 0 && previewDays <= 15 && `🟠 Fin de mission imminente (${previewDays} jours restants)`}
                  {previewDays < 0 && `🔴 Intermission active (J+${Math.abs(previewDays)} de bench)`}
                </p>
              </div>
              <Badge
                variant="alerte"
                alerte={
                  previewDays > 15 ? 'stable' : previewDays >= 0 ? 'urgent' : 'intermission'
                }
              >
                {previewDays > 15 ? 'Stable' : previewDays >= 0 ? 'Urgent' : 'Intermission'}
              </Badge>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <Button
              type="submit"
              disabled={loading}
              variant="primary"
              icon={loading ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
            >
              {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
