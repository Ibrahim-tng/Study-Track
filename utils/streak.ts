import { Task } from "@/types";
import { startOfDay } from "date-fns";

/**
 * Calculer le streak (nombre de jours consécutifs avec au moins une tâche complétée)
 */
export function calculateStreak(tasks: Task[]): number {
  // Filtrer les tâches complétées et les trier par date de complétion
  const completedTasks = tasks
    .filter((task) => task.completed && task.completedAt)
    .sort((a, b) => {
      const dateA = a.completedAt?.toDate() || new Date(0);
      const dateB = b.completedAt?.toDate() || new Date(0);
      return dateB.getTime() - dateA.getTime(); // Du plus récent au plus ancien
    });

  if (completedTasks.length === 0) return 0;

  const today = startOfDay(new Date());
  let streak = 0;
  let currentDate = today;

  // Grouper les tâches par jour
  const tasksByDay = new Map<string, Task[]>();
  completedTasks.forEach((task) => {
    const date = startOfDay(task.completedAt!.toDate());
    const dateKey = date.toISOString();
    if (!tasksByDay.has(dateKey)) {
      tasksByDay.set(dateKey, []);
    }
    tasksByDay.get(dateKey)!.push(task);
  });

  // Vérifier les jours consécutifs
  while (true) {
    const dateKey = currentDate.toISOString();
    if (tasksByDay.has(dateKey)) {
      streak++;
      // Passer au jour précédent
      currentDate = new Date(currentDate);
      currentDate.setDate(currentDate.getDate() - 1);
      currentDate = startOfDay(currentDate);
    } else {
      // Si c'est le premier jour et qu'il n'y a pas de tâche aujourd'hui,
      // vérifier hier
      if (streak === 0) {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        currentDate = startOfDay(yesterday);
        const yesterdayKey = currentDate.toISOString();
        if (tasksByDay.has(yesterdayKey)) {
          continue;
        }
      }
      break;
    }
  }

  return streak;
}

/**
 * Vérifier si une tâche est en retard
 */
export function isTaskOverdue(task: Task): boolean {
  if (task.completed) return false;
  const now = new Date();
  const dueDate = task.dueDate.toDate();
  return dueDate < now;
}
