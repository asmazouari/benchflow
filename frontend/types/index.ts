export type Metier = 'Dev' | 'QA' | 'PO' | 'DevOps' | 'Tous';

export type Duree = 'Flash' | 'Sprint' | 'Fond';

export type StatutInitiative = 'DISPONIBLE' | 'A_VALIDER' | 'EN_COURS' | 'TERMINE' | 'REFUSE';

export type StatutAlerte = 'stable' | 'urgent' | 'intermission';

export interface Collaborateur {
  id: number;
  nom: string;
  email: string;
  metier: Metier;
  dateFinStaffing: string;
  joursRestants: number;
  statutAlerte: StatutAlerte;
  role: 'collaborateur' | 'manager';
  clientActuel?: string;
  initiativeActiveId?: number;
}

export interface CollaborateurUpdatePayload {
  nom?: string;
  email?: string;
  metier?: Metier;
  dateFinStaffing?: string;
  clientActuel?: string;
  role?: 'collaborateur' | 'manager';
}

export interface Initiative {
  id: number;
  titre: string;
  description: string;
  metier: Metier;
  duree: Duree;
  statut: StatutInitiative;
  origine: 'manager' | 'collaborateur';
  auteurNom: string;
  assigneNom?: string;
  dateCreation: string;
  livrableUrl?: string;
  documentNom?: string;
  documentType?: string;
  documentTaille?: number;
}

export interface InitiativeUpdatePayload {
  titre?: string;
  description?: string;
  metier?: Metier;
  duree?: Duree;
}

export interface UserProfile {
  id?: number;
  sub?: string;
  nom: string;
  email: string;
  role: 'collaborateur' | 'manager';
  metier?: Metier;
  roles?: string[];
}

export interface AiSuggestedInitiative {
  titre: string;
  description: string;
  metier: Metier;
  duree: Duree;
  livrableAttendu: string;
}

export interface AiSuggestionResponse {
  metier: Metier;
  source: 'ollama_local' | 'cloud_resilient';
  suggestions: AiSuggestedInitiative[];
}
