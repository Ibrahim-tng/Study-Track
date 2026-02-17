"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import TaskCard from "@/components/TaskCard";
import { useAuth } from "@/hooks/useAuth";
import { Task, Subject } from "@/types";
import {
  getUserTasks,
  completeTask,
  uncompleteTask,
  deleteTask,
} from "@/lib/firestore/tasks";
import { getUserSubjects } from "@/lib/firestore/subjects";
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameDay,
  addWeeks,
  subWeeks,
} from "date-fns";
import { fr } from "date-fns/locale";

export default function PlanningPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(new Date(), { locale: fr })
  );

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      const [tasksData, subjectsData] = await Promise.all([
        getUserTasks(user.uid),
        getUserSubjects(user.uid),
      ]);

      setTasks(tasksData);
      setSubjects(subjectsData);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    try {
      if (completed) {
        await completeTask(taskId);
      } else {
        await uncompleteTask(taskId);
      }
      await loadData();
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la tâche:", error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette tâche ?")) return;

    try {
      await deleteTask(taskId);
      await loadData();
    } catch (error) {
      console.error("Erreur lors de la suppression de la tâche:", error);
    }
  };

  // Calculer les jours de la semaine
  const weekEnd = endOfWeek(currentWeekStart, { locale: fr });
  const daysOfWeek = eachDayOfInterval({
    start: currentWeekStart,
    end: weekEnd,
  });

  // Regrouper les tâches par jour
  const tasksByDay = daysOfWeek.map((day) => {
    const dayTasks = tasks.filter((task) =>
      isSameDay(task.dueDate.toDate(), day)
    );
    return { day, tasks: dayTasks };
  });

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Planning</h1>
            <p className="text-gray-600 mt-2">
              Vue hebdomadaire de vos tâches
            </p>
          </div>

          {/* Navigation semaine */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => setCurrentWeekStart(subWeeks(currentWeekStart, 1))}
              className="bg-white px-4 py-2 rounded-lg border-2 border-gray-200 hover:border-primary transition"
            >
              ← Semaine précédente
            </button>

            <div className="text-center">
              <p className="text-xl font-bold">
                {format(currentWeekStart, "dd MMM", { locale: fr })} -{" "}
                {format(weekEnd, "dd MMM yyyy", { locale: fr })}
              </p>
            </div>

            <button
              onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))}
              className="bg-white px-4 py-2 rounded-lg border-2 border-gray-200 hover:border-primary transition"
            >
              Semaine suivante →
            </button>
          </div>

          {/* Grille hebdomadaire */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
            {tasksByDay.map(({ day, tasks: dayTasks }) => {
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={day.toISOString()}
                  className={`bg-white rounded-lg shadow p-4 ${
                    isToday ? "ring-2 ring-primary" : ""
                  }`}
                >
                  {/* En-tête du jour */}
                  <div className="mb-4 pb-2 border-b">
                    <p className="text-lg font-bold">
                      {format(day, "EEEE", { locale: fr })}
                    </p>
                    <p className="text-sm text-gray-600">
                      {format(day, "dd MMM", { locale: fr })}
                    </p>
                    {isToday && (
                      <span className="inline-block mt-1 text-xs bg-primary text-white px-2 py-1 rounded">
                        Aujourd'hui
                      </span>
                    )}
                  </div>

                  {/* Tâches du jour */}
                  {dayTasks.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">
                      Aucune tâche
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {dayTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          subject={subjects.find((s) => s.id === task.subjectId)}
                          onToggle={handleToggleTask}
                          onDelete={handleDeleteTask}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Résumé de la semaine */}
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Résumé de la semaine</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600">Total tâches</p>
                <p className="text-2xl font-bold">
                  {tasksByDay.reduce((sum, { tasks }) => sum + tasks.length, 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tâches complétées</p>
                <p className="text-2xl font-bold text-success">
                  {tasksByDay.reduce(
                    (sum, { tasks }) =>
                      sum + tasks.filter((t) => t.completed).length,
                    0
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tâches restantes</p>
                <p className="text-2xl font-bold text-primary">
                  {tasksByDay.reduce(
                    (sum, { tasks }) =>
                      sum + tasks.filter((t) => !t.completed).length,
                    0
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
