import { Metier, Duree } from './common.types';

// Re-export pour commodité
export type { Duree };

/**
 * Cycle de vie d'une initiative
 */
export type StatutInitiative = 'DISPONIBLE' | 'A_VALIDER' | 'EN_COURS' | 'TERMINE' | 'REFUSE';

/**
 * Entité complète Initiative avec métadonnées de document de cadrage MinIO S3
 */
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
  // Métadonnées du document de cadrage stocké sur MinIO
  documentNom?: string;
  documentType?: string;
  documentTaille?: number;
}

/**
 * Payload envoyé pour la mise à jour d'une initiative (PUT /api/initiatives/{id})
 */
export interface InitiativeUpdatePayload {
  titre?: string;
  description?: string;
  metier?: Metier;
  duree?: Duree;
}

/**
 * Payload envoyé pour la création d'une initiative (POST /api/initiatives)
 */
export type InitiativeCreatePayload = Omit<Initiative, 'id' | 'dateCreation' | 'statut' | 'origine'>;
