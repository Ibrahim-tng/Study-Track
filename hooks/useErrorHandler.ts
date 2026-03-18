"use client";

import { useState, useCallback } from "react";

interface ErrorDetails {
  message: string;
  code?: string;
  timestamp: Date;
}

/**
 * Hook personnalisé pour gérer les erreurs
 */
export function useErrorHandler() {
  const [error, setError] = useState<ErrorDetails | null>(null);

  const handleError = useCallback((err: any, context?: string) => {
    let message = "Une erreur est survenue";

    if (typeof err === "string") {
      message = err;
    } else if (err?.message) {
      message = err.message;
    }

    const errorDetails: ErrorDetails = {
      message,
      code: err?.code,
      timestamp: new Date(),
    };

    if (context) {
      console.error(`[${context}]`, errorDetails);
    } else {
      console.error("Error:", errorDetails);
    }

    setError(errorDetails);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getFirebaseErrorMessage = useCallback((code: string): string => {
    const errorMessages: Record<string, string> = {
      "auth/user-not-found": "Cet utilisateur n'existe pas",
      "auth/wrong-password": "Mot de passe incorrect",
      "auth/email-already-in-use": "Cet email est déjà utilisé",
      "auth/weak-password": "Le mot de passe doit contenir au moins 6 caractères",
      "auth/invalid-email": "L'adresse email n'est pas valide",
      "auth/too-many-requests": "Trop de tentatives. Réessayez plus tard",
      "auth/requires-recent-login": "Reconnectez-vous pour cette action",
      "permission-denied": "Vous n'avez pas accès à cette ressource",
      "not-found": "Ressource non trouvée",
    };

    return errorMessages[code] || "Une erreur est survenue";
  }, []);

  return {
    error,
    handleError,
    clearError,
    getFirebaseErrorMessage,
  };
}
