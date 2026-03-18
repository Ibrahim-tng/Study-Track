import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { Task, TaskType, TaskPriority } from "@/types";

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
  plannedDuration: number,
  priority?: TaskPriority
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
    priority: priority || "medium",
    completed: false,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

/**
 * Récupérer toutes les tâches d'un utilisateur (triées par date, max 200)
 */
export async function getUserTasks(userId: string): Promise<Task[]> {
  const tasksRef = collection(db, "tasks");
  // Use Firestore server-side ordering + limit (leverages composite index userId+dueDate)
  const q = query(
    tasksRef,
    where("userId", "==", userId),
    orderBy("dueDate", "asc"),
    limit(200)
  );
  const querySnapshot = await getDocs(q);

  const tasks: Task[] = [];
  querySnapshot.forEach((doc) => {
    tasks.push({ id: doc.id, ...doc.data() } as Task);
  });

  return tasks;
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
