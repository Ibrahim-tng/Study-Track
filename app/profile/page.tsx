"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import {
  updatePassword,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateEmail,
} from "firebase/auth";
import { db } from "@/lib/firebase";
import PushNotificationManager from "@/components/PushNotificationManager";
import {
  User as UserIcon,
  Lock,
  AlertTriangle,
  Mail,
  Key,
  Trash2,
  ChevronRight
} from "lucide-react";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

interface FormErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  email?: string;
}

type ModalType = null | "password" | "email" | "delete";

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();

  // Estados para los modales
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  // Formulario cambio contraseña
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<FormErrors>({});

  // Formulario cambio email
  const [emailForm, setEmailForm] = useState({
    newEmail: "",
    password: "",
  });

  // Mostrar un mensaje
  const showMessage = (msg: string, type: "success" | "error" = "success") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 4000);
  };

  // Validar contraseña
  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return "Min 6 characters";
    }
    return "";
  };

  // Validar formulario de contraseña
  const validatePasswordForm = () => {
    const errors: FormErrors = {};

    if (!passwordForm.currentPassword) {
      errors.currentPassword = "Required";
    }
    if (!passwordForm.newPassword) {
      errors.newPassword = "Required";
    } else {
      const pwdError = validatePassword(passwordForm.newPassword);
      if (pwdError) errors.newPassword = pwdError;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    if (passwordForm.currentPassword === passwordForm.newPassword) {
      errors.newPassword = "Same as current password";
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Cambiar contraseña
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePasswordForm() || !user?.email) return;

    setLoading(true);
    try {
      // Reauthenticate user
      const credential = EmailAuthProvider.credential(
        user.email,
        passwordForm.currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // Change password
      await updatePassword(user, passwordForm.newPassword);

      showMessage("Password changed successfully!", "success");
      setActiveModal(null);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      let errorMsg = "Error changing password";
      if (error.code === "auth/wrong-password") {
        errorMsg = "Current password is incorrect";
      } else if (error.code === "auth/weak-password") {
        errorMsg = "New password is too weak";
      } else if (error.code === "auth/requires-recent-login") {
        errorMsg = "Please log in again";
      }
      showMessage(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  // Cambiar email
  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !emailForm.newEmail || !emailForm.password) return;

    setLoading(true);
    try {
      const credential = EmailAuthProvider.credential(user.email!, emailForm.password);
      await reauthenticateWithCredential(user, credential);
      await updateEmail(user, emailForm.newEmail);

      showMessage("Email updated successfully!", "success");
      setActiveModal(null);
      setEmailForm({ newEmail: "", password: "" });
    } catch (error: any) {
      let errorMsg = "Error updating email";
      if (error.code === "auth/wrong-password") {
        errorMsg = "Password is incorrect";
      } else if (error.code === "auth/email-already-in-use") {
        errorMsg = "Email already in use";
      } else if (error.code === "auth/requires-recent-login") {
        errorMsg = "Please log in again";
      }
      showMessage(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  // Eliminar cuenta
  const handleDeleteAccount = async () => {
    if (!user) return;

    setLoading(true);
    try {
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

      await deleteDoc(doc(db, "users", user.uid));
      await deleteUser(user);

      showMessage("Account deleted", "success");
      setTimeout(() => router.push("/"), 2000);
    } catch (error: any) {
      let errorMsg = "Error deleting account";
      if (error.code === "auth/requires-recent-login") {
        errorMsg = "Please log in again";
      }
      showMessage(errorMsg, "error");
    } finally {
      setLoading(false);
      setActiveModal(null);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                {user?.email?.[0].toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  My Profile
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage your account settings
                </p>
              </div>
            </div>
          </div>

          {/* Message de notification */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg border-l-4 ${messageType === "success"
                  ? "bg-green-50 dark:bg-green-900/20 border-green-500 text-green-800 dark:text-green-200"
                  : "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-800 dark:text-red-200"
                }`}
            >
              {messageType === "success" ? "✓" : "✕"} {message}
            </div>
          )}

          {/* Grille de sections */}
          <div className="grid grid-cols-1 gap-6">
            {/* Section Informations */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-6 text-indigo-500">
                <UserIcon size={24} />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Account Information
                </h2>
              </div>

              <div className="space-y-5">
                <div className="pb-5 border-b border-gray-200 dark:border-gray-700">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-900 dark:text-white font-medium">
                      {user?.email}
                    </p>
                    <span className="text-xs px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full">
                      Verified
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Account Created
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {user?.metadata.creationTime
                      ? new Date(user.metadata.creationTime).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Section Notifications Push */}
            <PushNotificationManager />


            {/* Section Seguridad */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-6 text-indigo-500">
                <Lock size={24} />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Security
                </h2>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setActiveModal("password")}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium transition flex items-center justify-between group"
                >
                  <span className="flex items-center gap-2">
                    <Key size={18} />
                    Change Password
                  </span>
                  <ChevronRight className="group-hover:translate-x-1 transition" size={20} />
                </button>

                <button
                  onClick={() => setActiveModal("email")}
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition flex items-center justify-between group"
                >
                  <span className="flex items-center gap-2">
                    <Mail size={18} />
                    Change Email
                  </span>
                  <ChevronRight className="group-hover:translate-x-1 transition" size={20} />
                </button>
              </div>
            </div>

            {/* Section Peligro */}
            <div className="bg-red-50 dark:bg-red-900/10 rounded-xl shadow-sm p-6 border border-red-200 dark:border-red-900/30">
              <div className="flex items-center gap-2 mb-4 text-red-600 dark:text-red-400">
                <AlertTriangle size={24} />
                <h2 className="text-xl font-bold">
                  Danger Zone
                </h2>
              </div>

              <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                Delete your account and all associated data. This action cannot be undone.
              </p>

              <button
                onClick={() => setActiveModal("delete")}
                className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
              >
                <Trash2 size={18} />
                Delete Account
              </button>
            </div>
          </div>
        </div>

        {/* Modal Cambiar Contraseña */}
        {activeModal === "password" && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">🔑</span>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Change Password
                </h3>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Current Password *
                  </label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        currentPassword: e.target.value,
                      })
                    }
                    className={`w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${passwordErrors.currentPassword
                        ? "border-red-500 dark:border-red-500"
                        : "border-gray-300"
                      }`}
                    placeholder="••••••••"
                  />
                  {passwordErrors.currentPassword && (
                    <p className="text-red-500 text-xs mt-1">
                      {passwordErrors.currentPassword}
                    </p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    New Password *
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: e.target.value,
                      })
                    }
                    className={`w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${passwordErrors.newPassword
                        ? "border-red-500 dark:border-red-500"
                        : "border-gray-300"
                      }`}
                    placeholder="••••••••"
                  />
                  {passwordErrors.newPassword && (
                    <p className="text-red-500 text-xs mt-1">
                      {passwordErrors.newPassword}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    className={`w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${passwordErrors.confirmPassword
                        ? "border-red-500 dark:border-red-500"
                        : "border-gray-300"
                      }`}
                    placeholder="••••••••"
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">
                      {passwordErrors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Botones */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition disabled:opacity-50"
                  >
                    {loading ? "Updating..." : "Update"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveModal(null);
                      setPasswordForm({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      });
                      setPasswordErrors({});
                    }}
                    className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-2 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Cambiar Email */}
        {activeModal === "email" && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">📧</span>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Change Email
                </h3>
              </div>

              <form onSubmit={handleChangeEmail} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    New Email Address *
                  </label>
                  <input
                    type="email"
                    value={emailForm.newEmail}
                    onChange={(e) =>
                      setEmailForm({ ...emailForm, newEmail: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="new@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Current Password *
                  </label>
                  <input
                    type="password"
                    value={emailForm.password}
                    onChange={(e) =>
                      setEmailForm({ ...emailForm, password: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="••••••••"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition disabled:opacity-50"
                  >
                    {loading ? "Updating..." : "Update"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveModal(null);
                      setEmailForm({ newEmail: "", password: "" });
                    }}
                    className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-2 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Confirmar Eliminacion */}
        {activeModal === "delete" && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 border border-red-300 dark:border-red-900 bg-gradient-to-b from-white dark:from-gray-800 to-red-50 dark:to-red-900/20">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">⚠️</span>
                <h3 className="text-2xl font-bold text-red-800 dark:text-red-400">
                  Delete Account?
                </h3>
              </div>

              <p className="text-gray-700 dark:text-gray-300 mb-6 text-sm leading-relaxed">
                This will permanently delete your account and all associated data:
              </p>

              <ul className="space-y-2 mb-6 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <span>•</span> All tasks and subjects
                </li>
                <li className="flex items-center gap-2">
                  <span>•</span> Focus sessions and statistics
                </li>
                <li className="flex items-center gap-2">
                  <span>•</span> Account profile
                </li>
              </ul>

              <p className="text-red-700 dark:text-red-400 font-semibold mb-6 text-sm">
                This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={loading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg transition disabled:opacity-50"
                >
                  {loading ? "Deleting..." : "Delete Now"}
                </button>
                <button
                  onClick={() => setActiveModal(null)}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-2 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
