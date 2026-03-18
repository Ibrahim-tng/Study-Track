"use client";

import { useEffect, useState, useCallback } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { Task, Subject } from "@/types";
import { getUserTasks } from "@/lib/firestore/tasks";
import { getUserSubjects } from "@/lib/firestore/subjects";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
} from "chart.js";
import { Bar, Pie, Line } from "react-chartjs-2";
import { subDays, format, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";

// Enregistrer les composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
);

export default function StatsPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
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
  }, [user]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, loadData]);

  // Graphique 1 : Tâches complétées sur 7 jours
  const last7Days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), 6 - i));
  const tasksPerDay = last7Days.map((day) => {
    return tasks.filter(
      (task) =>
        task.completed &&
        task.completedAt &&
        isSameDay(task.completedAt.toDate(), day)
    ).length;
  });

  const completedTasksChartData = {
    labels: last7Days.map((day) => format(day, "EEE dd", { locale: fr })),
    datasets: [
      {
        label: "Tâches complétées",
        data: tasksPerDay,
        backgroundColor: "rgba(16, 185, 129, 0.6)",
        borderColor: "rgba(16, 185, 129, 1)",
        borderWidth: 2,
      },
    ],
  };

  // Graphique 2 : Répartition par matière
  const tasksBySubject = subjects.map((subject) => {
    return tasks.filter((task) => task.subjectId === subject.id).length;
  });

  const subjectChartData = {
    labels: subjects.map((s) => s.name),
    datasets: [
      {
        label: "Nombre de tâches",
        data: tasksBySubject,
        backgroundColor: subjects.map((s) => s.color + "99"),
        borderColor: subjects.map((s) => s.color),
        borderWidth: 2,
      },
    ],
  };

  // Graphique 3 : Temps total travaillé
  const totalMinutes = tasks
    .filter((t) => t.completed)
    .reduce((sum, t) => sum + t.plannedDuration, 0);
  const totalHours = Math.round(totalMinutes / 60);

  const timeBySubject = subjects.map((subject) => {
    const subjectTasks = tasks.filter(
      (task) => task.subjectId === subject.id && task.completed
    );
    return subjectTasks.reduce((sum, task) => sum + task.plannedDuration, 0);
  });

  const timeChartData = {
    labels: subjects.map((s) => s.name),
    datasets: [
      {
        label: "Temps (minutes)",
        data: timeBySubject,
        backgroundColor: subjects.map((s) => s.color + "99"),
        borderColor: subjects.map((s) => s.color),
        borderWidth: 2,
      },
    ],
  };

  // Options des graphiques
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
        labels: {
          color: "#9ca3af",
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#9ca3af" },
        grid: { color: "rgba(156, 163, 175, 0.1)" },
      },
      y: {
        ticks: { color: "#9ca3af" },
        grid: { color: "rgba(156, 163, 175, 0.1)" },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
        labels: {
          color: "#9ca3af",
        },
      },
    },
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
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">📈 Statistiques</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Visualisez votre progression et performance
            </p>
          </div>

          {/* Statistiques générales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total de tâches</p>
              <p className="text-3xl font-bold text-primary dark:text-blue-400">{tasks.length}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tâches complétées</p>
              <p className="text-3xl font-bold text-success">
                {tasks.filter((t) => t.completed).length}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Temps total travaillé
              </p>
              <p className="text-3xl font-bold text-warning">
                {totalHours} heures
              </p>
            </div>
          </div>

          {/* Graphiques */}
          <div className="space-y-8">
            {/* Graphique des tâches complétées sur 7 jours */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Tâches complétées (7 derniers jours)
              </h2>
              <div className="h-80">
                <Line data={completedTasksChartData} options={chartOptions} />
              </div>
            </div>

            {/* Graphiques côte à côte */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Répartition par matière */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Répartition par matière
                </h2>
                {subjects.length > 0 ? (
                  <div className="h-80">
                    <Pie data={subjectChartData} options={pieOptions} />
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-12">
                    Aucune matière créée
                  </p>
                )}
              </div>

              {/* Temps par matière */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Temps travaillé par matière
                </h2>
                {subjects.length > 0 ? (
                  <div className="h-80">
                    <Bar data={timeChartData} options={chartOptions} />
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-12">
                    Aucune matière créée
                  </p>
                )}
              </div>
            </div>

            {/* Tableau détaillé */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Détails par matière</h2>
              {subjects.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                          Matière
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                          Total tâches
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                          Complétées
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                          Temps (min)
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                          Progression
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {subjects.map((subject, index) => {
                        const subjectTasks = tasks.filter(
                          (t) => t.subjectId === subject.id
                        );
                        const completedCount = subjectTasks.filter(
                          (t) => t.completed
                        ).length;
                        const percentage =
                          subjectTasks.length > 0
                            ? Math.round(
                                (completedCount / subjectTasks.length) * 100
                              )
                            : 0;

                        return (
                          <tr key={subject.id}>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span
                                  className="w-4 h-4 rounded"
                                  style={{ backgroundColor: subject.color }}
                                ></span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {subject.name}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-900 dark:text-white">{subjectTasks.length}</td>
                            <td className="px-4 py-3 text-success">
                              {completedCount}
                            </td>
                            <td className="px-4 py-3 text-gray-900 dark:text-white">{timeBySubject[index]}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                  <div
                                    className="bg-success h-2 rounded-full transition-all"
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {percentage}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-12">
                  Aucune matière créée
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
