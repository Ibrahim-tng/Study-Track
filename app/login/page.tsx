"use client";

import { useState, useEffect } from "react";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { validateEmail, checkRateLimit, clearRateLimit } from "@/utils/security";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState(5);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const router = useRouter();

  // Check if user is rate limited
  useEffect(() => {
    const attemptKey = `ratelimit_login_${email}`;
    const storedData = localStorage.getItem(attemptKey);
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        setRemainingAttempts(Math.max(0, 5 - data.attempts));
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, [email]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation basique
    if (!validateEmail(email)) {
      setError("Veuillez entrer une adresse email valide.");
      return;
    }

    if (password.length < 6) {
      setError("Veuillez entrer votre mot de passe.");
      return;
    }

    // Rate limiting check
    const rateLimit = checkRateLimit(`login_${email}`, 5, 15 * 60 * 1000);
    if (!rateLimit.allowed) {
      setError(rateLimit.message);
      return;
    }

    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      
      // Clear rate limit on successful login
      clearRateLimit(`login_${email}`);
      
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Erreur lors de la connexion:", error);

      // Messages d'erreur en français
      let errorMessage = "Une erreur est survenue. Veuillez réessayer.";

      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        errorMessage = "Email ou mot de passe incorrect.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "L'adresse email n'est pas valide.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Trop de tentatives. Veuillez réessayer plus tard.";
      } else if (error.code === "auth/user-disabled") {
        errorMessage = "Ce compte a été désactivé.";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Erreur de connexion. Vérifiez votre connexion internet.";
      }

      setError(errorMessage);
      
      // Update remaining attempts display
      const newRateLimit = checkRateLimit(`login_${email}`, 5, 15 * 60 * 1000);
      if (!newRateLimit.allowed) {
        setError(newRateLimit.message);
        setRemainingAttempts(0);
      } else {
        const storedData = localStorage.getItem(`ratelimit_login_${email}`);
        if (storedData) {
          try {
            const data = JSON.parse(storedData);
            setRemainingAttempts(Math.max(0, 5 - data.attempts));
          } catch (e) {
            // Ignore
          }
        }
      }
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetMessage("");

    if (!validateEmail(resetEmail)) {
      setResetMessage("❌ Veuillez entrer une adresse email valide.");
      return;
    }

    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail.trim());
      setResetMessage("✅ Email de réinitialisation envoyé ! Vérifiez votre boîte mail.");
    } catch (error: any) {
      if (error.code === "auth/user-not-found") {
        setResetMessage("❌ Aucun compte trouvé avec cet email.");
      } else if (error.code === "auth/too-many-requests") {
        setResetMessage("❌ Trop de demandes. Réessayez plus tard.");
      } else {
        setResetMessage("❌ Une erreur est survenue. Réessayez.");
      }
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-900 dark:text-white">Connexion</h1>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
          Connectez-vous à votre compte StudyTrack
        </p>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {remainingAttempts > 0 && remainingAttempts <= 3 && !error && (
          <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-400 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300 px-4 py-3 rounded-lg mb-4 text-sm">
            Attention: {remainingAttempts} tentative(s) restante(s)
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
              required
              disabled={remainingAttempts === 0}
              className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 ${email && !validateEmail(email) ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
              placeholder="jean@exemple.com"
            />
            {email && !validateEmail(email) && (
              <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                Format d&apos;email invalide
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={remainingAttempts === 0}
              className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 ${password && password.length < 6 ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
              placeholder="••••••••"
            />
            {password && password.length < 6 && (
              <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                Le mot de passe doit faire au moins 6 caractères
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <div className="mt-6 space-y-3 text-sm text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Vous n&apos;avez pas de compte ?{" "}
            <Link href="/signup" className="text-primary dark:text-blue-400 font-medium hover:underline">
              S&apos;inscrire
            </Link>
          </p>
          <p>
            <button
              onClick={() => {
                setShowResetModal(true);
                setResetEmail(email);
                setResetMessage("");
              }}
              className="text-primary dark:text-blue-400 font-medium hover:underline"
            >
              Mot de passe oublié ?
            </button>
          </p>
        </div>
      </div>

      {/* Modal réinitialisation mot de passe */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">🔑</span>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Réinitialiser le mot de passe
              </h3>
            </div>

            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Entrez votre adresse email. Nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </p>

            {resetMessage && (
              <div className={`mb-4 p-3 rounded-lg text-sm ${
                resetMessage.includes("✅")
                  ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                  : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
              }`}>
                {resetMessage}
              </div>
            )}

            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Adresse email
                </label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value.trim())}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="jean@exemple.com"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-blue-600 transition font-medium disabled:opacity-50"
                >
                  {resetLoading ? "Envoi..." : "Envoyer le lien"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition font-medium"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
