'use client';

import React, { useState } from 'react';
import { Metier, Duree, AiSuggestedInitiative, AiSuggestionResponse } from '../../types';
import { api } from '../../lib/api';
import { Badge } from './Badge';
import { Button } from './Button';
import { Sparkles, Loader2, Plus, Check, X } from 'lucide-react';

interface AiSuggestionModalProps {
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
              {(['Dev', 'QA', 'PO', 'DevOps'] as Metier[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSelectedMetier(m)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    selectedMetier === m
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Thème ou Technologie souhaitée (Optionnel)
            </label>
            <input
              type="text"
              placeholder="ex: Docker, Tests de performance, Refonte API REST..."
              value={contexte}
              onChange={(e) => setContexte(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50/80 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 outline-none transition-all"
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={loading}
            variant="primary"
            className="w-full justify-center py-2.5 shadow-md shadow-indigo-100"
            icon={loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          >
            {loading ? 'Ollama Llama 3.2 est en train de réfléchir...' : 'Générer 2 initiatives avec l’IA'}
          </Button>
        </div>

        {/* Affichage des Résultats */}
        {result && (
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                Propositions générées ({result.suggestions.length}) :
              </span>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  result.source === 'ollama_local'
                    ? 'badge-pastel-emerald'
                    : 'badge-pastel-indigo'
                }`}
              >
                {result.source === 'ollama_local' ? '🟢 Modèle Ollama Local (Llama 3.2)' : '⚡ Moteur Cloud Résilient'}
              </span>
            </div>

            <div className="space-y-3">
              {result.suggestions.map((item, idx) => {
                const isAdopted = adoptedIndices.includes(idx);

                return (
                  <div key={idx} className="card-shell p-4 space-y-2.5 bg-slate-50/40">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <Badge variant="metier" metier={item.metier}>
                          {item.metier}
                        </Badge>
                        <Badge variant="duree" duree={item.duree}>
                          {item.duree === 'Flash' ? '⚡ < 3 jours' : item.duree === 'Sprint' ? '📅 1-2 sem' : '🚀 Projet de fond'}
                        </Badge>
                      </div>

                      <Button
                        size="sm"
                        variant={isAdopted ? 'outline' : 'success'}
                        disabled={isAdopted}
                        onClick={() => handleAdopt(item, idx)}
                        icon={isAdopted ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      >
                        {isAdopted
                          ? 'Ajouté !'
                          : isManager
                          ? 'Ajouter au catalogue'
                          : 'Proposer cette idée'}
                      </Button>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 leading-snug">{item.titre}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                      <span className="text-slate-400">📦 Livrable attendu :</span>
                      <span className="text-indigo-600">{item.livrableAttendu}</span>
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
