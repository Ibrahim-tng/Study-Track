import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";
import { Task, TaskType } from "@/types";

/**
 * Créer une nouvelle tâche
 */
export async function createTask(
  userId: string,
  subjectId: string,
  title: string,
  description: string,
  type: TaskType,
  dueDate: Date,
  plannedDuration: number
): Promise<string> {
  const tasksRef = collection(db, "tasks");
  const docRef = await addDoc(tasksRef, {
    userId,
    subjectId,
    title,
    description,
    type,
    dueDate: Timestamp.fromDate(dueDate),
    plannedDuration,
    completed: false,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

/**
 * Récupérer toutes les tâches d'un utilisateur
 */
export async function getUserTasks(userId: string): Promise<Task[]> {
  const tasksRef = collection(db, "tasks");
  // Requête simple sans orderBy pour éviter l'index composite
  const q = query(
    tasksRef,
    where("userId", "==", userId)
  );
  const querySnapshot = await getDocs(q);

  const tasks: Task[] = [];
  querySnapshot.forEach((doc) => {
    tasks.push({ id: doc.id, ...doc.data() } as Task);
  });

  // Trier côté client par date d'échéance
  return tasks.sort((a, b) => {
    const dateA = a.dueDate.toDate().getTime();
    const dateB = b.dueDate.toDate().getTime();
    return dateA - dateB;
  });
}

/**
 * Marquer une tâche comme terminée
 */
export async function completeTask(taskId: string): Promise<void> {
  const taskRef = doc(db, "tasks", taskId);
  await updateDoc(taskRef, {
    completed: true,
    completedAt: Timestamp.now(),
  });
}

/**
 * Marquer une tâche comme non terminée
 */
export async function uncompleteTask(taskId: string): Promise<void> {
  const taskRef = doc(db, "tasks", taskId);
  await updateDoc(taskRef, {
    completed: false,
    completedAt: null,
  });
}

/**
 * Supprimer une tâche
 */
export async function deleteTask(taskId: string): Promise<void> {
  const taskRef = doc(db, "tasks", taskId);
  await deleteDoc(taskRef);
}

/**
 * Récupérer les tâches en retard d'un utilisateur
 */
export async function getOverdueTasks(userId: string): Promise<Task[]> {
  const tasks = await getUserTasks(userId);
  const now = new Date();

  return tasks.filter((task) => {
    const dueDate = task.dueDate.toDate();
    return !task.completed && dueDate < now;
  });
}

/**
 * Calculer le pourcentage de tâches complétées
 */
export async function getCompletionPercentage(
  userId: string
): Promise<number> {
  const tasks = await getUserTasks(userId);
  if (tasks.length === 0) return 0;

  const completedTasks = tasks.filter((task) => task.completed).length;
  return Math.round((completedTasks / tasks.length) * 100);
}
