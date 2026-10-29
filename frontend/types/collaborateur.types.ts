import { Metier, Role } from './common.types';

/**
 * Statuts d'alerte calculés automatiquement selon la date de fin de staffing :
 * - 'stable' : > 15 jours de mission restants
 * - 'urgent' : 0 à 15 jours restants (fin de mission imminente)
 * - 'intermission' : < 0 jours (consultant en période de bench / inter-projet immédiate)
 */
export type StatutAlerte = 'stable' | 'urgent' | 'intermission';

/**
 * Entité complète Collaborateur reçue depuis l'API FastAPI (/api/collaborateurs)
 */
export interface Collaborateur {
  id: number;
  nom: string;
  email: string;
  metier: Metier;
  dateFinStaffing: string;
  joursRestants: number;
  statutAlerte: StatutAlerte;
  role: Role;
  clientActuel?: string;
  initiativeActiveId?: number;
}

/**
 * Payload envoyé pour la mise à jour d'un collaborateur existant (PUT /api/collaborateurs/{id})
 */
export interface CollaborateurUpdatePayload {
  nom?: string;
  email?: string;
  metier?: Metier;
  dateFinStaffing?: string;
  clientActuel?: string;
  role?: Role;
}

/**
 * Payload envoyé pour la création d'un nouveau collaborateur (POST /api/collaborateurs)
 */
export type CollaborateurCreatePayload = Omit<Collaborateur, 'id' | 'joursRestants' | 'statutAlerte'>;

/**
 * Résumé KPI retourné par la route /api/collaborateurs/radar
 */
export interface RadarSummaryResponse {
  stables: number;
  urgents: number;
  intermissions: number;
  total: number;
  collaborateurs: Collaborateur[];
}
