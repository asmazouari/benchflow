'use client';

import React, { useState, useRef } from 'react';
import { Initiative, UserProfile, Metier, Duree, InitiativeUpdatePayload } from '../../types';
import { api } from '../../lib/api';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  Check,
  X,
  Send,
  Award,
  ExternalLink,
  Sparkles,
  MessageSquare,
  FileText,
  Download,
  UploadCloud,
  Pencil,
  AlertCircle,
  Paperclip,
} from 'lucide-react';
import { AiSuggestionModal } from '../ui/AiSuggestionModal';
import { EditInitiativeModal } from '../ui/EditInitiativeModal';

interface ValidationTabProps {
  initiatives: Initiative[];
  currentUser: UserProfile;
  onProposeIdea: (
    idea: Omit<Initiative, 'id' | 'dateCreation' | 'statut' | 'origine'>,
    file?: File | null
  ) => void | Promise<void>;
  onValidateIdea: (id: number) => void;
  onRejectIdea: (id: number) => void;
  onCompleteInitiative: (id: number, livrableUrl: string) => void;
  onUpdateInitiative?: (id: number, data: InitiativeUpdatePayload) => Promise<void>;
}

export function ValidationTab({
  initiatives,
  currentUser,
  onProposeIdea,
  onValidateIdea,
  onRejectIdea,
  onCompleteInitiative,
  onUpdateInitiative,
}: ValidationTabProps) {
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [editingInitiative, setEditingInitiative] = useState<Initiative | null>(null);

  // Form states
  const [titre, setTitre] = useState('');
  const [desc, setDesc] = useState('');
  const [metier, setMetier] = useState<Metier>(currentUser.metier || 'Dev');
  const [duree, setDuree] = useState<Duree>('Sprint');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Complete modal state
  const [completingId, setCompletingId] = useState<number | null>(null);
  const [livrableUrl, setLivrableUrl] = useState('');

  const pendingList = initiatives.filter((i) => i.statut === 'A_VALIDER');
  const inProgressList = initiatives.filter((i) => i.statut === 'EN_COURS');
  const completedList = initiatives.filter((i) => i.statut === 'TERMINE');

  const handleFileChange = (file: File | undefined | null) => {
    if (!file) return;
    // Vérification de la taille max (5 Mo)
    if (file.size > 5 * 1024 * 1024) {
      setFileError('Le document dépasse la limite autorisée de 5 Mo.');
      setSelectedFile(null);
      return;
    }
    setFileError(null);
    setSelectedFile(file);
  };

  const handleProposeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titre.trim() || !desc.trim()) return;

    setIsSubmitting(true);
    try {
      await onProposeIdea(
        {
          titre: titre.trim(),
          description: desc.trim(),
          metier,
          duree,
          auteurNom: currentUser.nom,
          assigneNom: currentUser.nom,
        },
        selectedFile
      );
      setTitre('');
      setDesc('');
      setSelectedFile(null);
      setFileError(null);
      setShowProposeModal(false);
    } catch (err: any) {
      setFileError(err.message || 'Erreur lors de la proposition de l’initiative.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdoptAiInitiative = async (init: {
    titre: string;
    description: string;
    metier: Metier;
    duree: Duree;
  }) => {
    await onProposeIdea({
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
            Fini les e-mails perdus : proposez vos initiatives avec cadrage, validez en 1 clic et valorisez vos livrables finaux
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
            {pendingList.map((item) => {
              const canEdit =
                currentUser.role === 'manager' || currentUser.nom === item.auteurNom;

              return (
                <div key={item.id} className="card-shell p-5 space-y-3 hover:border-amber-300 transition-all">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Badge variant="metier" metier={item.metier}>
                        {item.metier}
                      </Badge>
                      <Badge variant="duree" duree={item.duree}>
                        {item.duree}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="statut" statut="A_VALIDER">
                        En attente
                      </Badge>
                      {canEdit && onUpdateInitiative && (
                        <button
                          onClick={() => setEditingInitiative(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 transition-colors cursor-pointer"
                          title="Modifier l'initiative"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-base leading-snug">{item.titre}</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.description}</p>
                  </div>

                  {/* Document attaché MinIO */}
                  {item.documentNom && (
                    <div className="pt-1">
                      <a
                        href={api.getInitiativeDocumentDownloadUrl(item.id)}
                        download={item.documentNom}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200 transition-all shadow-2xs group cursor-pointer"
                        title={`Télécharger le cadrage : ${item.documentNom}`}
                      >
                        <FileText className="w-3.5 h-3.5 text-indigo-600 group-hover:scale-110 transition-transform shrink-0" />
                        <span className="truncate max-w-[180px]">{item.documentNom}</span>
                        {item.documentTaille && (
                          <span className="text-[10px] text-indigo-400 font-normal">
                            ({(item.documentTaille / (1024 * 1024)).toFixed(1)} Mo)
                          </span>
                        )}
                        <Download className="w-3 h-3 text-indigo-500 shrink-0" />
                      </a>
                    </div>
                  )}

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
              );
            })}
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
              <div key={item.id} className="card-shell p-5 space-y-3 hover:border-indigo-300 transition-all">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Badge variant="metier" metier={item.metier}>
                      {item.metier}
                    </Badge>
                    <Badge variant="statut" statut="EN_COURS">
                      En cours
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                      Assigné : {item.assigneNom || 'Non assigné'}
                    </span>
                    {currentUser.role === 'manager' && onUpdateInitiative && (
                      <button
                        onClick={() => setEditingInitiative(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 transition-colors cursor-pointer"
                        title="Modifier l'initiative"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-snug">{item.titre}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.description}</p>
                </div>

                {/* Document attaché MinIO */}
                {item.documentNom && (
                  <div className="pt-1">
                    <a
                      href={api.getInitiativeDocumentDownloadUrl(item.id)}
                      download={item.documentNom}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200 transition-all shadow-2xs group cursor-pointer"
                      title={`Télécharger le cadrage : ${item.documentNom}`}
                    >
                      <FileText className="w-3.5 h-3.5 text-indigo-600 group-hover:scale-110 transition-transform shrink-0" />
                      <span className="truncate max-w-[180px]">{item.documentNom}</span>
                      {item.documentTaille && (
                        <span className="text-[10px] text-indigo-400 font-normal">
                          ({(item.documentTaille / (1024 * 1024)).toFixed(1)} Mo)
                        </span>
                      )}
                      <Download className="w-3 h-3 text-indigo-500 shrink-0" />
                    </a>
                  </div>
                )}

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

              {/* Document attaché MinIO */}
              {item.documentNom && (
                <div className="pt-1">
                  <a
                    href={api.getInitiativeDocumentDownloadUrl(item.id)}
                    download={item.documentNom}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer"
                  >
                    <FileText className="w-3 h-3 text-slate-500" />
                    <span className="truncate max-w-[140px]">{item.documentNom}</span>
                    <Download className="w-3 h-3 text-slate-400" />
                  </a>
                </div>
              )}

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

      {/* Modal: Propose Idea (avec upload MinIO) */}
      {showProposeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Proposer une Initiative</h2>
                  <p className="text-xs text-slate-500">
                    Votre manager recevra une alerte pour valider votre proposition.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowProposeModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {fileError && (
              <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{fileError}</span>
              </div>
            )}

            <form onSubmit={handleProposeSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Titre de votre proposition *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex. Préparation Certification AWS Solutions Architect"
                  value={titre}
                  onChange={(e) => setTitre(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Description &amp; Objectifs *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Pourquoi ce sujet vous intéresse et comment il apporte de la valeur à la société..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Métier cible
                  </label>
                  <select
                    value={metier}
                    onChange={(e) => setMetier(e.target.value as Metier)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                  >
                    <option value="Dev">Développeur</option>
                    <option value="QA">Testeur QA</option>
                    <option value="PO">Product Owner</option>
                    <option value="DevOps">DevOps</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Durée estimée
                  </label>
                  <select
                    value={duree}
                    onChange={(e) => setDuree(e.target.value as Duree)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                  >
                    <option value="Flash">⚡ Flash (&lt; 3 jours)</option>
                    <option value="Sprint">📅 Sprint (1-2 sem.)</option>
                    <option value="Fond">🚀 Fond (&gt; 2 sem.)</option>
                  </select>
                </div>
              </div>

              {/* Upload Document de Cadrage (MinIO S3) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                    Document de Cadrage (Optionnel)
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">PDF, Word, Markdown (max 5 Mo)</span>
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleFileChange(e.target.files?.[0])}
                  accept=".pdf,.doc,.docx,.md,.txt,.pptx,.xlsx"
                  className="hidden"
                />

                {selectedFile ? (
                  <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 text-xs">
                        <p className="font-semibold text-indigo-950 truncate">{selectedFile.name}</p>
                        <p className="text-[10px] text-indigo-500">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} Mo
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Supprimer le fichier"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleFileChange(e.dataTransfer.files?.[0]);
                    }}
                    className="border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/20 rounded-xl p-4 text-center cursor-pointer transition-all group"
                  >
                    <UploadCloud className="w-6 h-6 mx-auto text-slate-400 group-hover:text-indigo-600 transition-colors mb-1.5" />
                    <p className="text-xs font-semibold text-slate-700 group-hover:text-indigo-900">
                      Glissez votre document de cadrage ou <span className="text-indigo-600 underline">parcourez</span>
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Stockage sécurisé sur MinIO S3
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowProposeModal(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <Button type="submit" variant="ai" disabled={isSubmitting}>
                  {isSubmitting ? 'Envoi en cours...' : 'Envoyer au Manager'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Complete Initiative with Deliverable Link */}
      {completingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
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
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
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
