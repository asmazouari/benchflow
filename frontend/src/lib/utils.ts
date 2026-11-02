import { StatutAlerte } from '@/types';
import { ALERT_THRESHOLDS } from './constants';

/**
 * Utilitaires et fonctions pures (BenchFlow)
 * Fonctions de formatage, calcul d'alertes et manipulation de chaînes.
 */

/**
 * Calcule de façon sécurisée les initiales en 2 lettres à partir d'un nom complet
 * ex: "Sophie Martin" -> "SM", "Alex" -> "AL"
 */
export function getInitials(nom: string): string {
  if (!nom || typeof nom !== 'string') return '??';
  const parts = nom.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '??';
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Calcule le nombre de jours restants entre aujourd'hui et une date de fin de staffing (YYYY-MM-DD)
 */
export function calculateDaysRemaining(dateStr: string): number | null {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  if (isNaN(target.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Détermine le statut d'alerte Radar en fonction des jours restants
 */
export function calculateAlertStatus(joursRestants: number): StatutAlerte {
  if (joursRestants <= ALERT_THRESHOLDS.BENCH_THRESHOLD_DAYS) {
    return 'intermission';
  }
  if (joursRestants <= ALERT_THRESHOLDS.URGENT_MAX_DAYS) {
    return 'urgent';
  }
  return 'stable';
}

/**
 * Formate le texte d'affichage du badge d'alerte pour le tableau Radar
 * ex: "Fin aujourd'hui !", "12j restants", "Intermission (J+5)"
 */
export function formatAlertBadgeLabel(joursRestants: number): string {
  if (joursRestants === 0) return "Fin aujourd'hui !";
  if (joursRestants < 0) return `Intermission (J+${Math.abs(joursRestants)})`;
  return `${joursRestants}j restants`;
}

/**
 * Formate une taille en octets en chaîne lisible (Ko / Mo)
 * ex: 1572864 -> "1.5 Mo", 51200 -> "50 Ko"
 */
export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return '0 Ko';
  const megabytes = bytes / (1024 * 1024);
  if (megabytes >= 1) {
    return `${megabytes.toFixed(1)} Mo`;
  }
  const kilobytes = Math.round(bytes / 1024);
  return `${kilobytes} Ko`;
}
