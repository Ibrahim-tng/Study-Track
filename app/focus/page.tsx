"use client";

import { useEffect, useState, useCallback } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import PomodoroTimer from "@/components/PomodoroTimer";
import { useAuth } from "@/hooks/useAuth";
import { Task, Subject } from "@/types";
import { getUserTasks } from "@/lib/firestore/tasks";
import { getUserSubjects } from "@/lib/firestore/subjects";
import {
  getTodayFocusTime,
  getWeekFocusTime,
} from "@/lib/firestore/focus";

export default function FocusPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTimer, setShowTimer] = useState(false);
  const [todayTime, setTodayTime] = useState(0);
  const [weekTime, setWeekTime] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user) return;

    try {
      const [tasksData, subjectsData, todayMinutes, weekMinutes] = await Promise.all([
        getUserTasks(user.uid),
        getUserSubjects(user.uid),
        getTodayFocusTime(user.uid),
        getWeekFocusTime(user.uid),
      ]);

      // Filtrer uniquement les tâches non complétées
      const incompleteTasks = tasksData.filter((t) => !t.completed);

      setTasks(incompleteTasks);
      setSubjects(subjectsData);
      setTodayTime(todayMinutes);
      setWeekTime(weekMinutes);
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, loadData]);

  const handleSessionComplete = async () => {
    await loadData();
  };

  const startFocusSession = (task?: Task) => {
    setSelectedTask(task || null);
    setShowTimer(true);
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

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
          {!showTimer ? (
            <>
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">🔥 Mode Focus</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Concentre-toi avec la méthode Pomodoro (25 min travail + 5 min pause)
                </p>
              </div>

              {/* Statistiques */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Aujourd&apos;hui</p>
                  <p className="text-3xl font-bold text-primary dark:text-blue-400">{formatTime(todayTime)}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Cette semaine</p>
                  <p className="text-3xl font-bold text-success">{formatTime(weekTime)}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Sessions Focus</p>
                  <p className="text-3xl font-bold text-warning">
                    {Math.floor(weekTime / 25)} 🍅
                  </p>
                </div>
              </div>

              {/* Démarrage rapide */}
              <div className="bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl shadow-lg p-8 mb-8">
                <h2 className="text-2xl font-bold mb-4">Démarrage rapide</h2>
                <p className="mb-6 text-white/90">
                  Commence une session Focus sans lier de tâche spécifique
                </p>
                <button
                  onClick={() => startFocusSession()}
                  className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition text-lg shadow-md"
                >
                  🚀 Démarrer une session libre
                </button>
              </div>

              {/* Sélection de tâche */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Ou travaille sur une tâche
                </h2>

                {tasks.length === 0 ? (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-12 text-center">
                    <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                      Aucune tâche en cours
                    </p>
                    <p className="text-gray-400 dark:text-gray-500">
                      Crée une tâche depuis le Dashboard pour commencer
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tasks.map((task) => {
                      const subject = subjects.find((s) => s.id === task.subjectId);
                      return (
                        <div
                          key={task.id}
                          className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-6 border-l-4 hover:shadow-lg transition"
                          style={{ borderLeftColor: subject?.color || "#3b82f6" }}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {subject && (
                                  <span
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: subject.color }}
                                  ></span>
                                )}
                                <h3 className="font-semibold text-gray-900 dark:text-white">{task.title}</h3>
                              </div>
                              {task.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                  {task.description}
                                </p>
                              )}
                              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                <span>{task.type}</span>
                                <span>⏱️ {task.plannedDuration} min</span>
                                {subject && <span>📚 {subject.name}</span>}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => startFocusSession(task)}
                            className="w-full bg-primary text-white py-2 rounded-lg hover:bg-blue-600 transition font-medium"
                          >
                            🔥 Focus sur cette tâche
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div>
              {/* Timer en cours */}
              <div className="mb-8 text-center">
                <button
                  onClick={() => setShowTimer(false)}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 inline-flex items-center gap-2 transition"
                >
                  ← Retour
                </button>
                {selectedTask && (
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedTask.title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {subjects.find((s) => s.id === selectedTask.subjectId)?.name}
                    </p>
                  </div>
                )}
              </div>

              <PomodoroTimer
                taskId={selectedTask?.id}
                subjectId={selectedTask?.subjectId}
                onSessionComplete={handleSessionComplete}
              />
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
