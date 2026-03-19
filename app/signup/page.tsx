"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createUser } from "@/lib/firestore/users";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { checkRateLimit, validateEmail, validatePassword, validateName } from "@/utils/security";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const validateForm = (): string | null => {
    if (!validateName(name)) {
      return "Le nom doit contenir entre 2 et 100 caractères.";
    }
    if (!validateEmail(email)) {
      return "L'adresse email n'est pas valide.";
    }
    const passwordError = validatePassword(password);
    if (passwordError) {
      return passwordError;
    }
    if (password !== confirmPassword) {
      return "Les mots de passe ne correspondent pas.";
    }
    return null;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    // Rate limiting check
    const rateLimit = await checkRateLimit(email, "signup");
    if (!rateLimit.allowed) {
      setError(rateLimit.message);
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      try {
        await fetch("/api/auth/send-verification", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: email.trim() }),
        });
      } catch (emailError: any) {
        console.error('Erreur lors de l\'envoi de l\'email de vérification:', emailError);
      }

      await createUser(userCredential.user.uid, email.trim(), name.trim());
      router.push("/verify-email");
    } catch (error: any) {
      console.error("Erreur lors de l'inscription:", error);

      if (error.code === "auth/email-already-in-use") {
        setError("Cet email est déjà utilisé.");
      } else if (error.code === "auth/weak-password") {
        setError("Le mot de passe n'est pas assez sécurisé.");
      } else if (error.code === "auth/invalid-email") {
        setError("L'adresse email n'est pas valide.");
      } else if (error.code === "auth/network-request-failed") {
        setError("Erreur de connexion. Vérifiez votre connexion internet.");
      } else {
        setError("Une erreur est survenue. Veuillez réessayer.");
      }
      setLoading(false);
    }
  };

  const passwordError = password ? validatePassword(password) : null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-clay-lg border border-white/50 dark:border-slate-700/50 p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2 text-gray-900 dark:text-white">Inscription</h1>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
          Créez votre compte StudyTrack
        </p>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4" noValidate>
          {/* Nom */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Nom complet
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Jean Dupont"
            />
            {name && !validateName(name) && (
              <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                Le nom doit contenir entre 2 et 100 caractères
              </p>
            )}
          </div>

          {/* Email */}
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
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="jean@exemple.com"
            />
            {email && !validateEmail(email) && (
              <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                Format d&apos;email invalide
              </p>
            )}
          </div>

          {/* Mot de passe */}
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
              minLength={8}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="••••••••"
            />
            {passwordError && (
              <p className="text-xs text-red-500 dark:text-red-400 mt-1">{passwordError}</p>
            )}
            {!password && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                • Au moins 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre
              </p>
            )}
          </div>

          {/* Confirmation du mot de passe */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Confirmer le mot de passe
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="••••••••"
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                Les mots de passe ne correspondent pas
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Inscription..." : "S'inscrire"}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600 dark:text-gray-400">
          Vous avez déjà un compte ?{" "}
          <Link href="/login" className="text-primary dark:text-blue-400 font-medium hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
