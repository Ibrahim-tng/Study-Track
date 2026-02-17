import { doc, setDoc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebase";
import { User } from "@/types";

/**
 * Créer un nouvel utilisateur dans Firestore
 */
export async function createUser(
  userId: string,
  email: string,
  name: string
): Promise<void> {
  const userRef = doc(db, "users", userId);
  await setDoc(userRef, {
    name,
    email,
    createdAt: Timestamp.now(),
    streak: 0,
  });
}

/**
 * Récupérer un utilisateur par son ID
 */
export async function getUser(userId: string): Promise<User | null> {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return { id: userSnap.id, ...userSnap.data() } as User;
  }
  return null;
}

/**
 * Mettre à jour le streak de l'utilisateur
 */
export async function updateUserStreak(
  userId: string,
  streak: number
): Promise<void> {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, { streak });
}
