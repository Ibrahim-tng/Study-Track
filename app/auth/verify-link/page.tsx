"use client";

import { useEffect, useState } from "react";
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { getUser, createUser } from "@/lib/firestore/users";

export default function VerifyLinkPage() {
    const [status, setStatus] = useState("Vérification du lien...");
    const [error, setError] = useState("");
    const [email, setEmail] = useState("");
    const [showEmailInput, setShowEmailInput] = useState(false);
    const router = useRouter();

    const handleUserSignIn = async (email: string) => {
        try {
            const result = await signInWithEmailLink(auth, email, window.location.href);
            window.localStorage.removeItem('emailForSignIn');

            // Vérifier si l'utilisateur existe dans Firestore
            const userDoc = await getUser(result.user.uid);
            if (!userDoc) {
                // Créer l'utilisateur s'il n'existe pas (nouveau profil)
                await createUser(result.user.uid, result.user.email || email, email.split("@")[0]);
            }

            setStatus("Connexion réussie ! Redirection...");
            setTimeout(() => router.push("/dashboard"), 1500);
        } catch (err: any) {
            console.error("Erreur de connexion via lien:", err);
            setError("Le lien est invalide ou a expiré. Veuillez en demander un nouveau.");
            setStatus("");
        }
    };

    useEffect(() => {
        const verify = async () => {
            // Vérifier si c'est un lien de connexion Firebase
            if (isSignInWithEmailLink(auth, window.location.href)) {
                let emailForSignIn = window.localStorage.getItem('emailForSignIn') || "";

                // Si l'email n'est pas dans le localStorage (ex: autre navigateur)
                if (!emailForSignIn) {
                    setShowEmailInput(true);
                    setStatus("Veuillez confirmer votre email pour continuer.");
                    return;
                }

                await handleUserSignIn(emailForSignIn);
            } else {
                setStatus("Ce lien n'est pas un lien de connexion valide.");
            }
        };

        verify();
    }, [router]);

    const handleManualEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setStatus("Connexion en cours...");
        await handleUserSignIn(email);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-clay-lg p-8 text-center border border-white/50 dark:border-slate-700/50">
                <div className="mb-6">
                    <span className="text-5xl">🔐</span>
                </div>

                <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                    Authentification StudyTrack
                </h1>

                {status && (
                    <div className="flex flex-col items-center gap-4">
                        <p className="text-gray-600 dark:text-gray-400">{status}</p>
                        {status.includes("Redirection") && (
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        )}
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-4 rounded-xl mb-6">
                        <p className="mb-4">{error}</p>
                        <button
                            onClick={() => router.push("/login")}
                            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
                        >
                            Retour à la connexion
                        </button>
                    </div>
                )}

                {showEmailInput && !error && (
                    <div className="mt-6">
                        <p className="text-sm text-gray-500 mb-4">
                            Pour des raisons de sécurité, veuillez confirmer l&apos;adresse email utilisée pour demander ce lien.
                        </p>
                        <form onSubmit={handleManualEmailSubmit} className="space-y-4">
                            <input
                                type="email"
                                placeholder="votre@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                            />
                            <button
                                type="submit"
                                className="w-full bg-primary text-white py-2 rounded-lg hover:bg-blue-600 transition font-medium"
                            >
                                Confirmer et se connecter
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
