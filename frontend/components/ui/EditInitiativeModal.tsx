'use client';

import React, { useState, useEffect } from 'react';
import { Initiative, InitiativeUpdatePayload, Metier, Duree, UserProfile } from '../../types';
import { Badge } from './Badge';
import { Button } from './Button';
import { Edit3, X, Loader2, AlertCircle, FileText, Clock, Layers } from 'lucide-react';

interface EditInitiativeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initiative: Initiative | null;
  onSave: (id: number, data: InitiativeUpdatePayload) => Promise<void>;
  currentUser?: UserProfile;
}

export function EditInitiativeModal({
  isOpen,
  onClose,
  initiative,
  onSave,
  currentUser,
}: EditInitiativeModalProps) {
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [metier, setMetier] = useState<Metier>('Dev');
  const [duree, setDuree] = useState<Duree>('Sprint');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initiative) {
      setTitre(initiative.titre || '');
      setDescription(initiative.description || '');
      setMetier(initiative.metier || 'Dev');
      setDuree(initiative.duree || 'Sprint');
      setError(null);
    }
  }, [initiative]);

  if (!isOpen || !initiative) return null;

  const isManager = currentUser?.role === 'manager';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titre.trim() || !description.trim()) {
      setError('Veuillez renseigner un titre et une description.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSave(initiative.id, {
        titre: titre.trim(),
        description: description.trim(),
        metier,
        duree,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Impossible de mettre à jour l’initiative.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        {/* En-tête */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Modifier l&apos;Initiative</h2>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full">
                  {isManager ? 'Édition Manager' : 'Édition Auteur'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Proposé par <span className="font-semibold text-slate-700">{initiative.auteurNom}</span> • Statut : {initiative.statut}
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
          {/* Titre */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Titre du sujet *
            </label>
            <input
              type="text"
              required
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              placeholder="ex. REX Architecture Microservices avec Kafka"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 font-medium text-slate-900"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Description &amp; Objectifs *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez les objectifs, le livrable attendu et la valeur ajoutée pour l'ESN..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 text-slate-800 leading-relaxed"
            />
          </div>

          {/* Profil Métier */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" /> Profil Métier cible
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {(['Tous', 'Dev', 'QA', 'PO', 'DevOps'] as Metier[]).map((m) => (
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

          {/* Durée */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" /> Format &amp; Durée estimée
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: 'Flash' as Duree, label: '⚡ Flash', desc: '< 3 jours' },
                { val: 'Sprint' as Duree, label: '📅 Sprint', desc: '1 à 2 sem.' },
                { val: 'Fond' as Duree, label: '🚀 Fond', desc: '> 2 sem.' },
              ].map((item) => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => setDuree(item.val)}
                  className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                    duree === item.val
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 shadow-2xs'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/70 text-slate-700'
                  }`}
                >
                  <p className="font-bold text-xs">{item.label}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Information document attaché si existant */}
          {initiative.documentNom && (
            <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-200 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0 text-xs">
                <p className="font-semibold text-indigo-950 truncate">{initiative.documentNom}</p>
                <p className="text-[11px] text-indigo-500">
                  Document de cadrage stocké sur MinIO S3
                  {initiative.documentTaille
                    ? ` (${(initiative.documentTaille / (1024 * 1024)).toFixed(2)} Mo)`
                    : ''}
                </p>
              </div>
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
              {loading ? 'Mise à jour...' : 'Enregistrer les modifications'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
