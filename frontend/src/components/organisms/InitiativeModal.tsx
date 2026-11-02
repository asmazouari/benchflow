'use client';

import React, { useState } from 'react';
import { Initiative, Metier, Duree } from '@/types';
import { Button, Input } from '@/components/atoms';
import { FileDropzone } from '@/components/molecules';
import { METIERS_FILTER, DUREES_CREATION } from '@/lib/constants';
import { formatFileSize } from '@/lib/utils';
import {
  Sparkles,
  Edit3,
  Send,
  X,
  Loader2,
  AlertCircle,
  FileText,
  Clock,
  Layers,
} from 'lucide-react';

/**
 * Organisme InitiativeModal — Niveau 3 Atomic Design (BenchFlow)
 * Formulaire unifié gérant les 3 cas d'usage d'initiatives :
 * 1. Proposition collaborateur (avec dropzone MinIO S3)
 * 2. Dépôt manager d'initiative pré-validée au catalogue
 * 3. Modification d'une initiative existante (par le manager ou l'auteur)
 */
export interface InitiativeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Initiative | null;
  onSubmit: (
    data: {
      titre: string;
      description: string;
      metier: Metier;
      duree: Duree;
    },
    file?: File | null
  ) => Promise<void>;
  allowFileUpload?: boolean;
  isManager?: boolean;
}

function InitiativeDialogContent({
  initialData,
  onClose,
  onSubmit,
  allowFileUpload = false,
  isManager = false,
}: Omit<InitiativeModalProps, 'isOpen'>) {
  const isEditMode = Boolean(initialData);

  const [titre, setTitre] = useState(initialData?.titre || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [metier, setMetier] = useState<Metier>(initialData?.metier || 'Dev');
  const [duree, setDuree] = useState<Duree>(initialData?.duree || 'Sprint');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titre.trim() || !description.trim()) {
      setError('Veuillez renseigner un titre et une description.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSubmit(
        {
          titre: titre.trim(),
          description: description.trim(),
          metier,
          duree,
        },
        selectedFile
      );
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Une erreur est survenue lors de l’enregistrement de l’initiative.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Titres & sous-titres adaptés au contexte
  let title = 'Proposer une Initiative';
  let badgeLabel = 'Collaborateur';
  let subtitle = 'Votre manager recevra une alerte pour valider votre proposition.';
  let submitLabel = 'Envoyer au Manager';
  let headerIcon = <Sparkles className="w-5 h-5" />;

  if (isEditMode) {
    title = "Modifier l'Initiative";
    badgeLabel = isManager ? 'Édition Manager' : 'Édition Auteur';
    subtitle = `Proposé par ${initialData?.auteurNom || 'Inconnu'} • Statut : ${initialData?.statut || 'N/A'}`;
    submitLabel = 'Enregistrer les modifications';
    headerIcon = <Edit3 className="w-5 h-5" />;
  } else if (!allowFileUpload && isManager) {
    title = 'Déposer une Initiative Pré-validée';
    badgeLabel = 'Manager';
    subtitle = 'Ce sujet sera immédiatement disponible dans le catalogue pour auto-staffing.';
    submitLabel = 'Publier au Catalogue';
    headerIcon = <Sparkles className="w-5 h-5" />;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        {/* En-tête */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              {headerIcon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{title}</h2>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full">
                  {badgeLabel}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
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
          {/* Titre */}
          <Input
            label="Titre de l'initiative *"
            placeholder="ex. REX Architecture Microservices avec Kafka"
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            required
          />

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
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all leading-relaxed"
            />
          </div>

          {/* Profil Métier cible */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" /> Profil Métier cible
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {METIERS_FILTER.map((m) => (
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

          {/* Format de Durée estimée */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" /> Format &amp; Durée estimée
            </label>
            <div className="grid grid-cols-3 gap-2">
              {DUREES_CREATION.map((item) => (
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

          {/* Document existant en mode édition */}
          {isEditMode && initialData?.documentNom && (
            <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-200 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0 text-xs">
                <p className="font-semibold text-indigo-950 truncate">{initialData.documentNom}</p>
                <p className="text-[11px] text-indigo-500">
                  Document stocké sur MinIO S3
                  {initialData.documentTaille ? ` (${formatFileSize(initialData.documentTaille)})` : ''}
                </p>
              </div>
            </div>
          )}

          {/* Zone de téléversement MinIO (si nouveau projet ou proposition) */}
          {allowFileUpload && !isEditMode && (
            <FileDropzone
              file={selectedFile}
              onFileSelect={setSelectedFile}
              label="Document de Cadrage (Optionnel)"
              hint="PDF, Word, Markdown (max 5 Mo)"
            />
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
              variant={isEditMode ? 'primary' : 'ai'}
              icon={
                loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : !isEditMode && allowFileUpload ? (
                  <Send className="w-4 h-4" />
                ) : undefined
              }
            >
              {loading ? 'En cours...' : submitLabel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function InitiativeModal({
  isOpen,
  onClose,
  initialData,
  onSubmit,
  allowFileUpload = false,
  isManager = false,
}: InitiativeModalProps) {
  if (!isOpen) return null;

  return (
    <InitiativeDialogContent
      key={initialData?.id ?? (allowFileUpload ? 'propose-initiative' : 'create-initiative')}
      initialData={initialData}
      onClose={onClose}
      onSubmit={onSubmit}
      allowFileUpload={allowFileUpload}
      isManager={isManager}
    />
  );
}
