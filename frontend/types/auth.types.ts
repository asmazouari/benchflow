import { Metier, Role } from './common.types';

/**
 * Profil utilisateur extrait de la session Keycloak OAuth2 / JWT
 */
export interface UserProfile {
  id?: number;
  sub?: string;
  nom: string;
  email: string;
  role: Role;
  metier?: Metier;
  roles?: string[];
}

/**
 * Réponse retournée par l'endpoint d'authentification /api/auth/login
 */
export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  refreshToken?: string;
  user: UserProfile;
}
