import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { Subject } from "@/types";

/**
 * Créer une nouvelle matière
 */
export async function createSubject(
  userId: string,
  name: string,
  color: string
): Promise<string> {
  const subjectsRef = collection(db, "subjects");
  const docRef = await addDoc(subjectsRef, {
    userId,
    name,
    color,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

/**
 * Récupérer toutes les matières d'un utilisateur
 */
export async function getUserSubjects(userId: string): Promise<Subject[]> {
  const subjectsRef = collection(db, "subjects");
  const q = query(subjectsRef, where("userId", "==", userId));
  const querySnapshot = await getDocs(q);

  const subjects: Subject[] = [];
  querySnapshot.forEach((doc) => {
    subjects.push({ id: doc.id, ...doc.data() } as Subject);
  });

  return subjects;
}

/**
 * Supprimer une matière
 */
export async function deleteSubject(subjectId: string): Promise<void> {
  const subjectRef = doc(db, "subjects", subjectId);
  await deleteDoc(subjectRef);
}
