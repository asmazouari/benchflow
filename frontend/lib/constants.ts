import { Metier, Duree } from '../types';

/**
 * Constantes globales de l'application BenchFlow
 * Source unique de vérité pour les listes, options et seuils.
 */

/**
 * Liste complète des métiers pour les filtres (avec l'option 'Tous')
 */
export const METIERS_FILTER: Metier[] = ['Tous', 'Dev', 'QA', 'PO', 'DevOps'];

/**
 * Liste des métiers cibles pour l'assignation et la création
 */
export const METIERS_PROFILES: Metier[] = ['Dev', 'QA', 'PO', 'DevOps'];

/**
 * Options de durées pour les filtres du catalogue
 */
export interface DureeOption {
  val: Duree | 'Tous';
  label: string;
  badgeLabel: string;
  desc: string;
}

export const DUREES_FILTER: DureeOption[] = [
  { val: 'Tous', label: 'Toutes', badgeLabel: 'Toutes', desc: 'Tous formats' },
  { val: 'Flash', label: '⚡ Flash (< 3j)', badgeLabel: '⚡ < 3 jours', desc: 'Moins de 3 jours' },
  { val: 'Sprint', label: '📅 Sprint (1-2 sem)', badgeLabel: '📅 1-2 sem', desc: '1 à 2 semaines' },
  { val: 'Fond', label: '🚀 Projet de fond', badgeLabel: '🚀 Projet de fond', desc: 'Plus de 2 semaines' },
];

/**
 * Options de durées pour les formulaires de création et d'édition
 */
export const DUREES_CREATION: { val: Duree; label: string; desc: string }[] = [
  { val: 'Flash', label: '⚡ Flash (< 3 jours)', desc: '< 3 jours' },
  { val: 'Sprint', label: '📅 Sprint (1-2 semaines)', desc: '1 à 2 sem.' },
  { val: 'Fond', label: '🚀 Fond (> 2 semaines)', desc: '> 2 sem.' },
];

/**
 * Seuils d'anticipation pour le calcul des alertes de staffing (Radar)
 */
export const ALERT_THRESHOLDS = {
  STABLE_MIN_DAYS: 16,
  URGENT_MAX_DAYS: 15,
  BENCH_THRESHOLD_DAYS: 0,
} as const;

/**
 * Configuration du téléversement de documents de cadrage MinIO S3
 */
export const FILE_UPLOAD_CONFIG = {
  MAX_SIZE_BYTES: 5 * 1024 * 1024, // 5 Mo
  MAX_SIZE_LABEL: '5 Mo',
  ACCEPTED_EXTENSIONS: '.pdf,.doc,.docx,.md,.txt,.pptx,.xlsx',
} as const;
