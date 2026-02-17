"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import {
  sendPasswordResetEmail,
  updateEmail,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChangePassword = async () => {
    if (!user?.email) return;

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, user.email);
      setMessage("✅ Email de réinitialisation envoyé !");
      setTimeout(() => setMessage(""), 3000);
    } catch (error: any) {
      setMessage("❌ Erreur : " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newEmail || !password) return;

    setLoading(true);
    try {
      const credential = EmailAuthProvider.credential(user.email!, password);
      await reauthenticateWithCredential(user, credential);
      await updateEmail(user, newEmail);
      
      setMessage("✅ Email mis à jour avec succès !");
      setShowEmailModal(false);
      setNewEmail("");
      setPassword("");
    } catch (error: any) {
      let errorMsg = "Erreur lors de la mise à jour";
      if (error.code === "auth/wrong-password") {
        errorMsg = "Mot de passe incorrect";
      } else if (error.code === "auth/email-already-in-use") {
        errorMsg = "Cet email est déjà utilisé";
      } else if (error.code === "auth/requires-recent-login") {
        errorMsg = "Reconnectez-vous puis réessayez";
      }
      setMessage("❌ " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Supprimer toutes les données Firestore
      const collections = ["subjects", "tasks", "focusSessions"];
      
      for (const collectionName of collections) {
        const q = query(
          collection(db, collectionName),
          where("userId", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);
        
        const deletePromises = querySnapshot.docs.map((document) =>
          deleteDoc(doc(db, collectionName, document.id))
        );
        
        await Promise.all(deletePromises);
      }

      // Supprimer le document utilisateur
      await deleteDoc(doc(db, "users", user.uid));

      // Supprimer le compte Firebase Auth
      await deleteUser(user);

      setMessage("✅ Compte supprimé");
      setTimeout(() => router.push("/"), 2000);
    } catch (error: any) {
      let errorMsg = "Erreur lors de la suppression";
      if (error.code === "auth/requires-recent-login") {
        errorMsg = "Reconnectez-vous puis réessayez";
      }
      setMessage("❌ " + errorMsg);
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen py-4 px-4 sm:py-8 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mon Profil</h1>
            <p className="text-gray-600 mt-2">
              Gérez vos informations personnelles
            </p>
          </div>

          {/* Message */}
          {message && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              {message}
            </div>
          )}

          {/* Informations */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold mb-4">Informations</h2>
            
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <p className="text-gray-900">{user?.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Compte créé le
                </label>
                <p className="text-gray-900">
                  {user?.metadata.creationTime
                    ? new Date(user.metadata.creationTime).toLocaleDateString("fr-FR")
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold mb-4">Actions</h2>
            
            <div className="space-y-3">
              <button
                onClick={handleChangePassword}
                disabled={loading}
                className="w-full bg-primary text-white py-3 rounded-lg hover:bg-blue-600 transition disabled:opacity-50 text-sm sm:text-base"
              >
                🔑 Changer le mot de passe
              </button>

              <button
                onClick={() => setShowEmailModal(true)}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition text-sm sm:text-base"
              >
                📧 Changer l'email
              </button>
            </div>
          </div>

          {/* Zone danger */}
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-red-800 mb-4">
              Zone de danger
            </h2>
            <p className="text-sm text-red-700 mb-4">
              Cette action est irréversible. Toutes vos données seront supprimées.
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="bg-red-600 text-white py-3 px-4 sm:px-6 rounded-lg hover:bg-red-700 transition text-sm sm:text-base"
            >
              🗑️ Supprimer mon compte
            </button>
          </div>

          {/* Modal Changer Email */}
          {showEmailModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold mb-4">Changer l'email</h3>
                <form onSubmit={handleChangeEmail} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Nouvel email
                    </label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary text-sm sm:text-base"
                      placeholder="nouveau@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Mot de passe actuel (pour confirmer)
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary text-sm sm:text-base"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 text-sm sm:text-base"
                    >
                      {loading ? "..." : "Confirmer"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowEmailModal(false);
                        setNewEmail("");
                        setPassword("");
                      }}
                      className="flex-1 bg-gray-200 py-2 rounded-lg hover:bg-gray-300 text-sm sm:text-base"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal Supprimer Compte */}
          {showDeleteModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-red-800 mb-4">
                  Supprimer le compte ?
                </h3>
                <p className="text-gray-700 mb-6 text-sm sm:text-base">
                  Cette action est <strong>irréversible</strong>. Toutes vos données seront définitivement supprimées.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={loading}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm sm:text-base"
                  >
                    {loading ? "Suppression..." : "Oui, supprimer"}
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 bg-gray-200 py-2 rounded-lg hover:bg-gray-300 text-sm sm:text-base"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
