"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function VerifyEmailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
    if (user?.emailVerified) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const checkVerification = async () => {
    if (!user) return;

    try {
      await user.reload();
      
      if (user.emailVerified) {
        setMessage("✅ Email vérifié ! Redirection...");
        setTimeout(() => router.push("/dashboard"), 2000);
      } else {
        setMessage("⚠️ Email pas encore vérifié. Vérifie ta boîte mail.");
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const resendVerification = async () => {
    if (!user) return;

    setSending(true);
    try {
      const response = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: user.email }),
      });

      if (!response.ok) {
        throw new Error("Failed to send email");
      }

      setMessage("✅ Email de vérification renvoyé !");
    } catch (error: any) {
      let errorMsg = "Erreur lors de l'envoi";
      if (error.code === "auth/too-many-requests") {
        errorMsg = "Trop de demandes. Réessayez plus tard.";
      }
      setMessage("❌ " + errorMsg);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 sm:p-8 text-center">
        {/* Icône */}
        <div className="text-5xl sm:text-6xl mb-4">📧</div>

        {/* Titre */}
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Vérifie ton email
        </h1>

        {/* Message */}
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
          Nous avons envoyé un email de vérification à{" "}
          <strong className="block mt-1 text-gray-900 dark:text-white">{user?.email}</strong>
        </p>

        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-6 sm:mb-8">
          Clique sur le lien dans l&apos;email pour activer ton compte.
        </p>

        {/* Message de statut */}
        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            message.includes("✅")
              ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300"
              : message.includes("⚠️")
              ? "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300"
              : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300"
          }`}>
            {message}
          </div>
        )}

        {/* Boutons */}
        <div className="space-y-3">
          <button
            onClick={checkVerification}
            className="w-full bg-primary text-white py-3 rounded-lg hover:bg-blue-600 transition font-medium text-sm sm:text-base"
          >
            J&apos;ai vérifié mon email
          </button>

          <button
            onClick={resendVerification}
            disabled={sending}
            className="w-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition font-medium disabled:opacity-50 text-sm sm:text-base"
          >
            {sending ? "Envoi..." : "Renvoyer l'email"}
          </button>
        </div>

        {/* Aide */}
        <div className="mt-6 sm:mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            💡 L&apos;email peut prendre quelques minutes à arriver
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Vérifie aussi tes spams
          </p>
        </div>
      </div>
    </div>
  );
}
