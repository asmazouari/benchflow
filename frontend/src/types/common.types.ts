/**
 * Types transversaux et partagés (BenchFlow)
 * Définitions communes utilisées par plusieurs domaines métier.
 */

/**
 * Spécialités et profils métiers de l'ESN
 */
export type Metier = 'Dev' | 'QA' | 'PO' | 'DevOps' | 'Tous';

/**
 * Rôles d'habilitation dans le système RBAC BenchFlow
 */
export type Role = 'collaborateur' | 'manager';

/**
 * Format et durée estimée d'une initiative
 * - 'Flash' : < 3 jours (POC rapide, veille)
 * - 'Sprint' : 1 à 2 semaines (module d'accélération, refonte)
 * - 'Fond' : > 2 semaines (projet interne structurant, framework)
 */
export type Duree = 'Flash' | 'Sprint' | 'Fond';
