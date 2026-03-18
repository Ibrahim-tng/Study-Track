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
  return input
    .trim()
    .replace(/[<>]/g, "")
    .slice(0, 1000); // Limit length
};

/**
 * Rate limiting helper
 * Stores login attempts in localStorage
 */
export const checkRateLimit = (
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): { allowed: boolean; message: string } => {
  const now = Date.now();
  const attemptKey = `ratelimit_${key}`;

  try {
    const storedData = localStorage.getItem(attemptKey);
    const data = storedData ? JSON.parse(storedData) : { attempts: 0, resetTime: now + windowMs };

    if (now > data.resetTime) {
      // Reset window
      localStorage.setItem(
        attemptKey,
        JSON.stringify({ attempts: 1, resetTime: now + windowMs })
      );
      return { allowed: true, message: "" };
    }

    if (data.attempts >= maxAttempts) {
      const remainingMs = data.resetTime - now;
      const remainingMinutes = Math.ceil(remainingMs / 1000 / 60);
      return {
        allowed: false,
        message: `Trop de tentatives. Réessayez dans ${remainingMinutes} minute(s).`,
      };
    }

    // Increment attempts
    data.attempts += 1;
    localStorage.setItem(attemptKey, JSON.stringify(data));
    return { allowed: true, message: "" };
  } catch (error) {
    console.error("Rate limit check error:", error);
    return { allowed: true, message: "" }; // Allow on error
  }
};

/**
 * Clear rate limit for a key
 */
export const clearRateLimit = (key: string): void => {
  try {
    localStorage.removeItem(`ratelimit_${key}`);
  } catch (error) {
    console.error("Clear rate limit error:", error);
  }
};
