import { Metier, Duree } from './common.types';

/**
 * Suggestion unitaire d'initiative générée par Ollama (Llama 3.2)
 */
export interface AiSuggestedInitiative {
  titre: string;
  description: string;
  metier: Metier;
  duree: Duree;
  livrableAttendu: string;
}

/**
 * Réponse retournée par l'endpoint /api/ai/suggest
 */
export interface AiSuggestionResponse {
  metier: Metier;
  source: 'ollama_local' | 'cloud_resilient';
  suggestions: AiSuggestedInitiative[];
}
