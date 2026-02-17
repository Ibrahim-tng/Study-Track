"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import StatCard from "@/components/StatCard";
import TaskCard from "@/components/TaskCard";
import FocusMode from "@/components/FocusMode";
import { useAuth } from "@/hooks/useAuth";
import { Task, Subject, TaskType } from "@/types";
import {
  getUserTasks,
  completeTask,
  uncompleteTask,
  createTask,
  deleteTask,
} from "@/lib/firestore/tasks";
import {
  getUserSubjects,
  createSubject,
  deleteSubject,
} from "@/lib/firestore/subjects";
import { calculateStreak, isTaskOverdue } from "@/utils/streak";
import { Timestamp } from "firebase/firestore";

export default function DashboardPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showFocusMode, setShowFocusMode] = useState(false);

  // États pour le formulaire de tâche
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    type: "Devoir" as TaskType,
    subjectId: "",
    dueDate: "",
    plannedDuration: 60,
  });

  // États pour le formulaire de matière
  const [subjectForm, setSubjectForm] = useState({
    name: "",
    color: "#3b82f6",
  });

  // Charger les données
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

  // Basculer l'état de complétion d'une tâche
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

  // Créer une nouvelle tâche
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const dueDate = new Date(taskForm.dueDate);
      await createTask(
        user.uid,
        taskForm.subjectId,
        taskForm.title,
        taskForm.description,
        taskForm.type,
        dueDate,
        taskForm.plannedDuration
      );

      // Réinitialiser le formulaire
      setTaskForm({
        title: "",
        description: "",
        type: "Devoir",
        subjectId: "",
        dueDate: "",
        plannedDuration: 60,
      });
      setShowTaskModal(false);
      await loadData();
    } catch (error) {
      console.error("Erreur lors de la création de la tâche:", error);
    }
  };

  // Créer une nouvelle matière
  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await createSubject(user.uid, subjectForm.name, subjectForm.color);

      // Réinitialiser le formulaire
      setSubjectForm({
        name: "",
        color: "#3b82f6",
      });
      setShowSubjectModal(false);
      await loadData();
    } catch (error) {
      console.error("Erreur lors de la création de la matière:", error);
    }
  };

  // Supprimer une tâche
  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette tâche ?")) return;

    try {
      await deleteTask(taskId);
      await loadData();
    } catch (error) {
      console.error("Erreur lors de la suppression de la tâche:", error);
    }
  };

  // Supprimer une matière
  const handleDeleteSubject = async (subjectId: string) => {
    // Vérifier si des tâches utilisent cette matière
    const tasksWithSubject = tasks.filter((t) => t.subjectId === subjectId);
    
    if (tasksWithSubject.length > 0) {
      if (!confirm(`Cette matière contient ${tasksWithSubject.length} tâche(s). Voulez-vous vraiment la supprimer ? Les tâches associées seront également supprimées.`)) {
        return;
      }
      // Supprimer toutes les tâches associées
      for (const task of tasksWithSubject) {
        await deleteTask(task.id);
      }
    } else {
      if (!confirm("Êtes-vous sûr de vouloir supprimer cette matière ?")) return;
    }

    try {
      await deleteSubject(subjectId);
      await loadData();
    } catch (error) {
      console.error("Erreur lors de la suppression de la matière:", error);
    }
  };

  // Calculer les statistiques
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const completedPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const overdueTasks = tasks.filter((t) => isTaskOverdue(t)).length;
  const streak = calculateStreak(tasks);

  // Tâches en retard
  const overduetasksList = tasks
    .filter((t) => isTaskOverdue(t))
    .slice(0, 5);

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
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Bienvenue ! Voici un aperçu de vos tâches.
            </p>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total des tâches"
              value={totalTasks}
              icon="📝"
              color="blue"
            />
            <StatCard
              title="Tâches complétées"
              value={`${completedPercentage}%`}
              icon="✅"
              color={completedPercentage >= 70 ? "green" : completedPercentage >= 40 ? "yellow" : "red"}
            />
            <StatCard
              title="Tâches en retard"
              value={overdueTasks}
              icon="⚠️"
              color={overdueTasks === 0 ? "green" : overdueTasks <= 3 ? "yellow" : "red"}
            />
            <StatCard
              title="Streak"
              value={`${streak} ${streak > 1 ? "jours" : "jour"}`}
              icon="🔥"
              color={streak >= 7 ? "green" : streak >= 3 ? "yellow" : "blue"}
            />
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setShowFocusMode(true)}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition shadow-lg"
            >
              🔥 Mode Focus
            </button>
            <button
              onClick={() => setShowTaskModal(true)}
              className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition"
            >
              ➕ Nouvelle tâche
            </button>
            <button
              onClick={() => setShowSubjectModal(true)}
              className="bg-white text-primary border-2 border-primary px-6 py-3 rounded-lg font-medium hover:bg-primary hover:text-white transition"
            >
              📚 Nouvelle matière
            </button>
          </div>

          {/* Liste des matières */}
          {subjects.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                📚 Mes matières
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjects.map((subject) => (
                  <div
                    key={subject.id}
                    className="bg-white p-4 rounded-lg shadow border-l-4 flex items-center justify-between"
                    style={{ borderLeftColor: subject.color }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: subject.color }}
                      ></div>
                      <span className="font-medium">{subject.name}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteSubject(subject.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded transition"
                      title="Supprimer cette matière"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tâches en retard */}
          {overduetasksList.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                ⚠️ Tâches en retard
              </h2>
              <div className="space-y-3">
                {overduetasksList.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    subject={subjects.find((s) => s.id === task.subjectId)}
                    onToggle={handleToggleTask}
                    onDelete={handleDeleteTask}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Toutes les tâches */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Toutes les tâches
            </h2>
            {tasks.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-500 text-lg mb-4">
                  Aucune tâche pour le moment
                </p>
                <button
                  onClick={() => setShowTaskModal(true)}
                  className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
                >
                  Créer votre première tâche
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
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
        </div>
      </div>

      {/* Modal nouvelle tâche */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Nouvelle tâche</h2>

            {subjects.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">
                  Vous devez d'abord créer une matière
                </p>
                <button
                  onClick={() => {
                    setShowTaskModal(false);
                    setShowSubjectModal(true);
                  }}
                  className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
                >
                  Créer une matière
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Titre *
                  </label>
                  <input
                    type="text"
                    value={taskForm.title}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, title: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Ex: Devoir de mathématiques"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    value={taskForm.description}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, description: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    rows={3}
                    placeholder="Détails de la tâche..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Type *
                  </label>
                  <select
                    value={taskForm.type}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, type: e.target.value as TaskType })
                    }
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="Devoir">Devoir</option>
                    <option value="Révision">Révision</option>
                    <option value="Examen">Examen</option>
                    <option value="Projet">Projet</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Matière *
                  </label>
                  <select
                    value={taskForm.subjectId}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, subjectId: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Sélectionner une matière</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Date d'échéance *
                  </label>
                  <input
                    type="datetime-local"
                    value={taskForm.dueDate}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, dueDate: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Durée prévue (minutes) *
                  </label>
                  <input
                    type="number"
                    value={taskForm.plannedDuration}
                    onChange={(e) =>
                      setTaskForm({
                        ...taskForm,
                        plannedDuration: parseInt(e.target.value),
                      })
                    }
                    required
                    min={1}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-blue-600 transition"
                  >
                    Créer
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTaskModal(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal nouvelle matière */}
      {showSubjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Nouvelle matière</h2>

            <form onSubmit={handleCreateSubject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nom de la matière *
                </label>
                <input
                  type="text"
                  value={subjectForm.name}
                  onChange={(e) =>
                    setSubjectForm({ ...subjectForm, name: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Ex: Mathématiques"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Couleur *
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={subjectForm.color}
                    onChange={(e) =>
                      setSubjectForm({ ...subjectForm, color: e.target.value })
                    }
                    className="w-16 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={subjectForm.color}
                    onChange={(e) =>
                      setSubjectForm({ ...subjectForm, color: e.target.value })
                    }
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="#3b82f6"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-blue-600 transition"
                >
                  Créer
                </button>
                <button
                  type="button"
                  onClick={() => setShowSubjectModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mode Focus */}
      {showFocusMode && user && (
        <FocusMode
          userId={user.uid}
          tasks={tasks}
          subjects={subjects}
          onClose={() => setShowFocusMode(false)}
          onSessionComplete={loadData}
        />
      )}
    </ProtectedRoute>
  );
}
