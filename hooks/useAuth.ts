"use client";

import { useEffect, useState } from "react";
import { User as FirebaseUser, onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthState {
  user: FirebaseUser | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook personnalisé pour gérer l'état d'authentification
 * Sécurité: Vérifie que l'utilisateur est authentifié ET a vérifié son email
 */
export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let mounted = true;

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        if (mounted) {
          setState({
            user,
            loading: false,
            error: null,
          });
        }
      },
      (error: Error) => {
        if (mounted) {
          setState({
            user: null,
            loading: false,
            error,
          });
          console.error("Auth state change error:", error);
        }
      }
    );

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    // SÉCURITÉ: Requérir la vérification d'email (pas d'utilisateurs anonymes)
    isAuthenticated: !!state.user && state.user.emailVerified,
    logout,
  };
}
