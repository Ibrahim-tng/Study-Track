import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

/**
 * Initialise Firebase Admin SDK (singleton pattern — safe for serverless cold starts)
 */
function getAdminApp() {
  if (getApps().length > 0) return getApps()[0];

  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (!privateKey || !clientEmail || !projectId) {
    throw new Error(
      "Firebase Admin SDK: variables d'environnement manquantes (FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, NEXT_PUBLIC_FIREBASE_PROJECT_ID)"
    );
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

/**
 * Vérifie un Firebase ID token et retourne le UID décodé.
 * Lève une erreur si le token est invalide ou manquant.
 */
export async function verifyFirebaseToken(authHeader: string | null): Promise<string> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Token d'authentification manquant ou malformé.");
  }
  const idToken = authHeader.slice(7);
  const adminAuth = getAuth(getAdminApp());
  const decoded = await adminAuth.verifyIdToken(idToken);
  return decoded.uid;
}

// Exports functions that initialize the app only when called
export function getAdminDb() {
  return getFirestore(getAdminApp());
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}

