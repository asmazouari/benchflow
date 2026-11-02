'use client';

import React, { useState } from 'react';
import { Metier, Duree, AiSuggestedInitiative, AiSuggestionResponse } from '../../types';
import { api } from '../../lib/api';
import { Badge, Button } from '../atoms';
import { METIERS_PROFILES } from '../../lib/constants';
import { Sparkles, Loader2, Plus, Check, X } from 'lucide-react';

/**
 * Organisme AiSuggestionModal — Niveau 3 Atomic Design (BenchFlow)
 * Boîte de dialogue interactive pour la génération et l'adoption d'initiatives
 * suggérées en direct par le moteur LLM Ollama (Llama 3.2 local).
 */
export interface AiSuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMetier?: Metier;
  onAdoptInitiative: (init: {
    titre: string;
    description: string;
    metier: Metier;
    duree: Duree;
  }) => void;
  isManager: boolean;
}

export function AiSuggestionModal({
  isOpen,
  onClose,
  defaultMetier = 'Dev',
  onAdoptInitiative,
  isManager,
}: AiSuggestionModalProps) {
  const [selectedMetier, setSelectedMetier] = useState<Metier>(
    defaultMetier === 'Tous' ? 'Dev' : defaultMetier
  );
  const [contexte, setContexte] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiSuggestionResponse | null>(null);
  const [adoptedIndices, setAdoptedIndices] = useState<number[]>([]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    setAdoptedIndices([]);
    try {
      const data = await api.getAiSuggestions(selectedMetier, contexte.trim() || undefined);
      setResult(data);
    } catch (err: any) {
      alert(`Erreur de génération : ${err.message || 'Impossible de contacter le moteur IA'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAdopt = (item: AiSuggestedInitiative, index: number) => {
    onAdoptInitiative({
      titre: item.titre,
      description: `${item.description}\n\nLivrable attendu : ${item.livrableAttendu}`,
      metier: item.metier,
      duree: item.duree,
    });
    setAdoptedIndices((prev) => [...prev, index]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        {/* En-tête */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Assistant IA — Suggestions d&apos;Initiatives
              </h2>
              <p className="text-xs text-slate-500">
                Génération en direct via Ollama (Llama 3.2) pour vos périodes d&apos;inter-projet
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

        {/* Formulaire de paramétrage */}
        <div className="py-4 space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Profil Métier cible
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {METIERS_PROFILES.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSelectedMetier(m)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    selectedMetier === m
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Contexte ou centres d&apos;intérêt particuliers (Optionnel)
            </label>
            <textarea
              rows={2}
              placeholder="ex: Migration Cloud AWS, Tests automatisés Playwright, Kafka streaming..."
              value={contexte}
              onChange={(e) => setContexte(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 transition-all outline-none"
            />
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleGenerate}
              isLoading={loading}
              variant="ai"
              icon={<Sparkles className="w-4 h-4" />}
            >
              {loading ? "Génération en cours avec l'IA..." : 'Générer 3 suggestions personnalisées'}
            </Button>
          </div>
        </div>

        {/* Résultats générés */}
        {result && (
          <div className="pt-4 border-t border-slate-100 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Suggestions pour le profil {result.metier}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  result.source === 'ollama_local'
                    ? 'badge-pastel-emerald text-emerald-800'
                    : 'badge-pastel-indigo text-indigo-800'
                }`}
              >
                {result.source === 'ollama_local' ? '● Ollama Local (Llama 3.2)' : '● Cloud Résilient'}
              </span>
            </div>

            <div className="space-y-3">
              {result.suggestions.map((item, idx) => {
                const isAdopted = adoptedIndices.includes(idx);
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-indigo-300 hover:shadow-xs transition-all space-y-2 group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <Badge variant="metier" metier={item.metier}>
                          {item.metier}
                        </Badge>
                        <Badge variant="duree" duree={item.duree}>
                          {item.duree}
                        </Badge>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAdopt(item, idx)}
                        disabled={isAdopted}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isAdopted
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-2xs'
                        }`}
                      >
                        {isAdopted ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Adopté !</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>{isManager ? 'Publier ce sujet' : 'Proposer ce sujet'}</span>
                          </>
                        )}
                      </button>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm">{item.titre}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center gap-1.5 text-[11px] text-indigo-700 font-medium">
                      <span className="font-bold">Livrable :</span>
                      <span>{item.livrableAttendu}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
