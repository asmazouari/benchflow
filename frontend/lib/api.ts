import { Collaborateur, Initiative, UserProfile, AiSuggestionResponse, Metier } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const TOKEN_KEY = 'benchflow_jwt_token';

export interface RadarSummaryResponse {
  stables: number;
  urgents: number;
  intermissions: number;
  total: number;
  collaborateurs: Collaborateur[];
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  refreshToken?: string;
  user: UserProfile;
}

// Gestion sécurisée du Token Keycloak dans le navigateur
export const authStorage = {
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },
  removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
    }
  },
};

function getAuthHeaders(customHeaders: Record<string, string> = {}): HeadersInit {
  const token = authStorage.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponseError(res: Response, defaultMessage: string): Promise<never> {
  let detail = '';
  try {
    const errorData = await res.json();
    detail = errorData.detail || '';
  } catch {
    // Si la réponse n'est pas du JSON
  }

  if (res.status === 401) {
    throw new Error(detail || 'Session expirée. Veuillez vous reconnecter.');
  }
  if (res.status === 403) {
    throw new Error(detail || 'Accès refusé : Privilèges insuffisants pour cette action.');
  }
  throw new Error(detail || `${defaultMessage} (${res.status})`);
}

export const api = {
  // ==========================================
  // AUTHENTIFICATION KEYCLOAK
  // ==========================================

  /**
   * Connexion utilisateur avec email et mot de passe via Keycloak
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('Identifiants incorrects. Accès refusé par Keycloak.');
      }
      await handleResponseError(res, 'Erreur serveur Keycloak');
    }

    const data: any = await res.json();
    const token = data.accessToken || data.access_token;
    if (token) {
      authStorage.setToken(token);
    }
    return {
      accessToken: token,
      tokenType: data.tokenType || data.token_type || 'Bearer',
      expiresIn: data.expiresIn || data.expires_in || 3600,
      refreshToken: data.refreshToken || data.refresh_token,
      user: data.user,
    };
  },

  /**
   * Vérifie la session active de l'utilisateur connecté via son jeton JWT
   */
  async getMe(): Promise<UserProfile> {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`Non authentifié (${res.status})`);
    return res.json();
  },

  /**
   * Déconnexion de l'utilisateur
   */
  logout(): void {
    authStorage.removeToken();
  },

  // ==========================================
  // COLLABORATEURS & RADAR
  // ==========================================

  /**
   * Récupère le résumé Radar avec les 3 KPI et les alertes calculées
   */
  async getRadarSummary(): Promise<RadarSummaryResponse> {
    const res = await fetch(`${API_BASE_URL}/collaborateurs/radar`, {
      headers: getAuthHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) await handleResponseError(res, 'Erreur HTTP radar');
    return res.json();
  },

  /**
   * Ajoute un nouveau collaborateur au Radar (Manager uniquement)
   */
  async createCollaborateur(
    collab: Omit<Collaborateur, 'id' | 'joursRestants' | 'statutAlerte'>
  ): Promise<Collaborateur> {
    const res = await fetch(`${API_BASE_URL}/collaborateurs`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(collab),
    });
    if (!res.ok) await handleResponseError(res, 'Erreur création collaborateur');
    return res.json();
  },

  // ==========================================
  // INITIATIVES & WORKFLOW
  // ==========================================

  /**
   * Récupère le catalogue d'initiatives avec filtres optionnels
   */
  async getInitiatives(filters?: {
    metier?: string;
    duree?: string;
    statut?: string;
  }): Promise<Initiative[]> {
    const params = new URLSearchParams();
    if (filters?.metier && filters.metier !== 'Tous') params.append('metier', filters.metier);
    if (filters?.duree) params.append('duree', filters.duree);
    if (filters?.statut) params.append('statut', filters.statut);

    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE_URL}/initiatives${query}`, {
      headers: getAuthHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) await handleResponseError(res, 'Erreur HTTP initiatives');
    return res.json();
  },

  /**
   * Crée une initiative (Top-down Manager ou Bottom-up Collaborateur)
   */
  async createInitiative(
    initiative: Omit<Initiative, 'id' | 'dateCreation' | 'statut' | 'origine'>,
    isManager: boolean
  ): Promise<Initiative> {
    const res = await fetch(`${API_BASE_URL}/initiatives?is_manager=${isManager}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(initiative),
    });
    if (!res.ok) await handleResponseError(res, 'Erreur création initiative');
    return res.json();
  },

  /**
   * Action 1-clic : s'auto-staffer sur une initiative
   */
  async takeInitiative(id: number, userNom: string): Promise<Initiative> {
    const res = await fetch(`${API_BASE_URL}/initiatives/${id}/take`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userNom }),
    });
    if (!res.ok) await handleResponseError(res, 'Erreur prise initiative');
    return res.json();
  },

  /**
   * Action Manager : approuver une idée bottom-up
   */
  async validateInitiative(id: number): Promise<Initiative> {
    const res = await fetch(`${API_BASE_URL}/initiatives/${id}/validate`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!res.ok) await handleResponseError(res, 'Erreur validation');
    return res.json();
  },

  /**
   * Action Manager : refuser une initiative
   */
  async rejectInitiative(id: number): Promise<Initiative> {
    const res = await fetch(`${API_BASE_URL}/initiatives/${id}/reject`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!res.ok) await handleResponseError(res, 'Erreur refus');
    return res.json();
  },

  /**
   * Clôture avec URL du livrable
   */
  async completeInitiative(id: number, livrableUrl: string): Promise<Initiative> {
    const res = await fetch(`${API_BASE_URL}/initiatives/${id}/complete`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ livrableUrl }),
    });
    if (!res.ok) await handleResponseError(res, 'Erreur complétion');
    return res.json();
  },

  /**
   * Génère des suggestions d'initiatives intelligentes avec l'IA (Ollama)
   */
  async getAiSuggestions(
    metier: Metier = 'Dev',
    contexte?: string
  ): Promise<AiSuggestionResponse> {
    const res = await fetch(`${API_BASE_URL}/ai/suggest`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ metier, contexte }),
    });
    if (!res.ok) {
      await handleResponseError(res, "Erreur lors de la génération d'initiatives IA");
    }
    return res.json();
  },

  /**
   * Teste si le backend FastAPI est accessible
   */
  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/health`, { cache: 'no-store' });
      return res.ok;
    } catch {
      return false;
    }
  },
};
