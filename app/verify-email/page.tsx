"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { sendEmailVerification } from "firebase/auth";

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
      await sendEmailVerification(user);
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
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 sm:p-8 text-center">
        {/* Icône */}
        <div className="text-5xl sm:text-6xl mb-4">📧</div>

        {/* Titre */}
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          Vérifie ton email
        </h1>

        {/* Message */}
        <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
          Nous avons envoyé un email de vérification à{" "}
          <strong className="block mt-1">{user?.email}</strong>
        </p>

        <p className="text-xs sm:text-sm text-gray-500 mb-6 sm:mb-8">
          Clique sur le lien dans l'email pour activer ton compte.
        </p>

        {/* Message de statut */}
        {message && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
            {message}
          </div>
        )}

        {/* Boutons */}
        <div className="space-y-3">
          <button
            onClick={checkVerification}
            className="w-full bg-primary text-white py-3 rounded-lg hover:bg-blue-600 transition font-medium text-sm sm:text-base"
          >
            J'ai vérifié mon email
          </button>

          <button
            onClick={resendVerification}
            disabled={sending}
            className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition font-medium disabled:opacity-50 text-sm sm:text-base"
          >
            {sending ? "Envoi..." : "Renvoyer l'email"}
          </button>
        </div>

        {/* Aide */}
        <div className="mt-6 sm:mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2">
            💡 L'email peut prendre quelques minutes à arriver
          </p>
          <p className="text-xs text-gray-500">
            Vérifie aussi tes spams
          </p>
        </div>
      </div>
    </div>
  );
}
