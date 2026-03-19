/**
 * Utilitaires de sécurité et validation
 */

/**
 * Valide une adresse email
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valide un mot de passe selon les critères de sécurité
 * Retourne null si valide, sinon retourne le message d'erreur
 */
export const validatePassword = (password: string): string | null => {
  if (password.length < 8) {
    return "Le mot de passe doit contenir au moins 8 caractères.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Le mot de passe doit contenir au moins une majuscule (A-Z).";
  }
  if (!/[a-z]/.test(password)) {
    return "Le mot de passe doit contenir au moins une minuscule (a-z).";
  }
  if (!/[0-9]/.test(password)) {
    return "Le mot de passe doit contenir au moins un chiffre (0-9).";
  }
  return null;
};

/**
 * Valide un nom d'utilisateur
 */
export const validateName = (name: string): boolean => {
  const trimmedName = name.trim();
  return trimmedName.length >= 2 && trimmedName.length <= 100;
};

/**
 * Sanitize user input (XSS prevention)
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return "";
  return input
    .trim()
    .replace(/[&<>"']/g, (match) => {
      const map: Record<string, string> = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      };
      return map[match];
    })
    .slice(0, 2000);
};

/**
 * Rate limiting helper
 * Calls the server-side API for robust rate limiting
 */
export const checkRateLimit = async (
  identifier: string,
  type: "login" | "signup" | "default" = "default"
): Promise<{ allowed: boolean; message: string }> => {
  try {
    const response = await fetch("/api/auth/rate-limit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, type }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        const data = await response.json();
        return { allowed: false, message: data.message };
      }
      return { allowed: true, message: "" }; // Fail open
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Rate limit check error:", error);
    return { allowed: true, message: "" }; // Fail open on network error
  }
};

