import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { StudyGoal } from "@/types";

/**
 * Créer un nouvel objectif d'étude
 */
export async function createGoal(
  userId: string,
  period: "daily" | "weekly" | "monthly",
  targetHours: number
): Promise<StudyGoal> {
  const now = new Date();
  const startDate = new Date(now);
  const endDate = new Date(now);

  // Définir les dates selon la période
  if (period === "daily") {
    endDate.setDate(endDate.getDate() + 1);
  } else if (period === "weekly") {
    endDate.setDate(endDate.getDate() + 7);
  } else if (period === "monthly") {
    endDate.setMonth(endDate.getMonth() + 1);
  }

  const docRef = await addDoc(collection(db, "goals"), {
    userId,
    period,
    targetHours,
    achievedHours: 0,
    startDate: Timestamp.fromDate(startDate),
    endDate: Timestamp.fromDate(endDate),
    completed: false,
    createdAt: Timestamp.now(),
  });

  return {
    id: docRef.id,
    userId,
    period,
    targetHours,
    achievedHours: 0,
    startDate: Timestamp.fromDate(startDate),
    endDate: Timestamp.fromDate(endDate),
    completed: false,
    createdAt: Timestamp.now(),
  };
}

/**
 * Récupérer tous les objectifs d'un utilisateur
 */
export async function getUserGoals(userId: string): Promise<StudyGoal[]> {
  const q = query(collection(db, "goals"), where("userId", "==", userId));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  } as StudyGoal));
}

/**
 * Mettre à jour le nombre d'heures accomplies
 */
export async function updateGoalProgress(
  goalId: string,
  achievedHours: number
): Promise<void> {
  const goalRef = doc(db, "goals", goalId);
  await updateDoc(goalRef, { achievedHours });
}

/**
 * Marquer un objectif comme complété
 */
export async function completeGoal(goalId: string): Promise<void> {
  const goalRef = doc(db, "goals", goalId);
  await updateDoc(goalRef, { completed: true });
}

/**
 * Supprimer un objectif
 */
export async function deleteGoal(goalId: string): Promise<void> {
  await deleteDoc(doc(db, "goals", goalId));
}
