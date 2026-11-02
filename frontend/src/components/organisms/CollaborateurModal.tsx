'use client';

import React, { useState } from 'react';
import {
  Collaborateur,
  CollaborateurCreatePayload,
  CollaborateurUpdatePayload,
  Metier,
} from '@/types';
import { Button, Badge, Input } from '@/components/atoms';
import { METIERS_PROFILES } from '@/lib/constants';
import {
  calculateDaysRemaining,
  calculateAlertStatus,
  formatAlertBadgeLabel,
} from '@/lib/utils';
import { UserPlus, UserCog, Calendar, Briefcase, Mail, User, X, Loader2, AlertCircle } from 'lucide-react';

/**
 * Organisme CollaborateurModal — Niveau 3 Atomic Design (BenchFlow)
 * Formulaire unifié gérant à la fois la CRÉATION et l'ÉDITION d'un consultant.
 */
export interface CollaborateurModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Collaborateur | null;
  onSave: (data: CollaborateurCreatePayload | CollaborateurUpdatePayload) => Promise<void>;
}

function CollaborateurDialogContent({
  initialData,
  onClose,
  onSave,
}: Omit<CollaborateurModalProps, 'isOpen'>) {
  const isEditMode = Boolean(initialData);

  const [nom, setNom] = useState(initialData?.nom || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [metier, setMetier] = useState<Metier>(
    initialData?.metier === 'Tous' ? 'Dev' : initialData?.metier || 'Dev'
  );
  const [clientActuel, setClientActuel] = useState(initialData?.clientActuel || '');
  const [dateFinStaffing, setDateFinStaffing] = useState(initialData?.dateFinStaffing || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calcul prédictif en direct de l'anticipation Radar
  const previewDays = calculateDaysRemaining(dateFinStaffing);
  const previewStatus = previewDays !== null ? calculateAlertStatus(previewDays) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim() || !email.trim() || !dateFinStaffing) {
      setError('Veuillez renseigner tous les champs obligatoires.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isEditMode) {
        await onSave({
          nom: nom.trim(),
          email: email.trim(),
          metier,
          clientActuel: clientActuel.trim() || 'Mission en cours',
          dateFinStaffing,
        });
      } else {
        await onSave({
          nom: nom.trim(),
          email: email.trim(),
          metier,
          clientActuel: clientActuel.trim() || 'Mission en cours',
          dateFinStaffing,
          role: 'collaborateur',
        });
      }
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Une erreur est survenue lors de l’enregistrement.';
      setError(message);
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              {isEditMode ? <UserCog className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  {isEditMode ? 'Modifier le Collaborateur' : 'Nouveau Collaborateur'}
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full">
                  {isEditMode ? 'Édition' : 'Staffing'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {isEditMode
                  ? 'Ajustez les paramètres de mission et recalculez automatiquement le radar.'
                  : 'Enregistrez un consultant avec sa date de fin de mission pour l’anticipation.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Nom complet */}
          <Input
            label="Nom complet *"
            placeholder="ex. Sophie Martin"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            icon={<User className="w-4 h-4" />}
            required
          />

          {/* Email professionnel */}
          <Input
            label="Email professionnel *"
            type="email"
            placeholder="sophie.martin@esn.fr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="w-4 h-4" />}
            required
          />

          {/* Profil Métier cible */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Métier / Spécialité
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {METIERS_PROFILES.map((m) => (
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

          {/* Mission / Client actuel */}
          <Input
            label="Mission / Client actuel"
            placeholder="ex. BNP Paribas — Refonte API"
            value={clientActuel}
            onChange={(e) => setClientActuel(e.target.value)}
            icon={<Briefcase className="w-4 h-4" />}
          />

          {/* Date de fin de staffing */}
          <Input
            label="Date de fin de staffing prévue *"
            type="date"
            value={dateFinStaffing}
            onChange={(e) => setDateFinStaffing(e.target.value)}
            icon={<Calendar className="w-4 h-4" />}
            required
          />

          {/* Prévisualisation dynamique du statut Radar */}
          {previewDays !== null && previewStatus && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div className="text-xs">
                <span className="text-slate-500 font-medium">Recalcul automatique du radar :</span>
                <p className="font-bold text-slate-900 mt-0.5">
                  {previewStatus === 'stable' && `🟢 Période stable (${previewDays} jours restants)`}
                  {previewStatus === 'urgent' && `🟠 Fin imminente (${previewDays} jours restants)`}
                  {previewStatus === 'intermission' && `🔴 Intermission active (J+${Math.abs(previewDays)} de bench)`}
                </p>
              </div>
              <Badge variant="alerte" alerte={previewStatus}>
                {formatAlertBadgeLabel(previewDays)}
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
              {loading
                ? 'Enregistrement...'
                : isEditMode
                ? 'Enregistrer les modifications'
                : 'Enregistrer le collaborateur'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function CollaborateurModal({
  isOpen,
  onClose,
  initialData,
  onSave,
}: CollaborateurModalProps) {
  if (!isOpen) return null;

  return (
    <CollaborateurDialogContent
      key={initialData?.id ?? 'create-collaborateur'}
      initialData={initialData}
      onClose={onClose}
      onSave={onSave}
    />
  );
}
