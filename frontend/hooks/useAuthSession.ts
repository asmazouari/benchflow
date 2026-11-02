'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../types';
import { api, authStorage, LoginResponse } from '../lib/api';

/**
 * Hook personnalisé gérant la session d'authentification Keycloak / JWT.
 * Encapsule la vérification du token, la connexion et la déconnexion.
 */
export function useAuthSession() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authChecking, setAuthChecking] = useState<boolean>(true);

  // Vérification de la session active au montage
  useEffect(() => {
    async function checkSession() {
      const token = authStorage.getToken();
      if (!token) {
        setAuthChecking(false);
        return;
      }

      try {
        const profile = await api.getMe();
        setCurrentUser(profile);
        setIsAuthenticated(true);
      } catch (err: unknown) {
        console.warn('Session Keycloak expirée ou token invalide :', err);
        api.logout();
        setCurrentUser(null);
        setIsAuthenticated(false);
      } finally {
        setAuthChecking(false);
      }
    }

    checkSession();
  }, []);

  // Callback de connexion réussie via le formulaire
  const handleLoginSuccess = useCallback((session: LoginResponse) => {
    setCurrentUser(session.user);
    setIsAuthenticated(true);
  }, []);

  // Déconnexion propre
  const handleLogout = useCallback(() => {
    api.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
  }, []);

  return {
    currentUser,
    isAuthenticated,
    authChecking,
    handleLoginSuccess,
    handleLogout,
  };
}
