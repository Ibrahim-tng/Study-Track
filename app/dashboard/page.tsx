"use client";

import { StatCardSkeleton, TaskCardSkeleton, Skeleton } from "@/components/Skeleton";
import { useEffect, useState, useCallback, useRef } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import StatCard from "@/components/StatCard";
import TaskCard from "@/components/TaskCard";
import FocusMode from "@/components/FocusMode";
import MiniBadges from "@/components/MiniBadges";
import FloatingActionButton from "@/components/FloatingActionButton";
import TaskFilters from "@/components/TaskFilters";
import StudyGoals from "@/components/StudyGoals";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useAuth } from "@/hooks/useAuth";
import { useBadges } from "@/hooks/useBadges";
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
import { useNotifications } from "@/context/NotificationContext";
import {
  FileText,
  Target,
  Clock,
  Flame,
  Plus,
  AlertTriangle,
  Sparkles,
  Zap,
  Trash2
} from "lucide-react";


export default function DashboardPage() {
  const { user } = useAuth();
  const { badges } = useBadges();
  const { addToast } = useNotifications();
  const hasCheckedNotifications = useRef(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showFocusMode, setShowFocusMode] = useState(false);
  const [sparkleTaskId, setSparkleTaskId] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: "danger" | "warning" | "info";
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    variant: "danger",
    onConfirm: () => { },
  });

  // États pour le formulaire de tâche
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    type: "Devoir" as TaskType,
    subjectId: "",
    dueDate: "",
    plannedDuration: 60,
    priority: "medium" as "high" | "medium" | "low",
  });

  // États pour le formulaire de matière
  const [subjectForm, setSubjectForm] = useState({
    name: "",
    color: "#3b82f6",
  });

  // Charger les données — stabilisé avec useCallback
  const loadData = useCallback(async () => {
    if (!user) return;

    try {
      const [tasksData, subjectsData] = await Promise.all([
        getUserTasks(user.uid),
        getUserSubjects(user.uid),
      ]);

      setTasks(tasksData);
      setFilteredTasks(tasksData);
      setSubjects(subjectsData);

      // --- Smart Notifications for deadlines ---
      if (!hasCheckedNotifications.current) {
        hasCheckedNotifications.current = true;
        const now = new Date();
        const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        const tomorrowEnd = new Date(todayEnd);
        tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);

        const pending = tasksData.filter((t) => !t.completed);
        const overdue = pending.filter((t) => t.dueDate && t.dueDate.toDate() < now);
        const dueToday = pending.filter((t) => {
          if (!t.dueDate) return false;
          const d = t.dueDate.toDate();
          return d >= now && d <= todayEnd;
        });
        const dueTomorrow = pending.filter((t) => {
          if (!t.dueDate) return false;
          const d = t.dueDate.toDate();
          return d > todayEnd && d <= tomorrowEnd;
        });

        if (overdue.length > 0) {
          setTimeout(() => addToast("error", `${overdue.length} tâche${overdue.length > 1 ? 's' : ''} en retard !`, "Pense à les compléter ou à les reporter."), 1000);
        }
        if (dueToday.length > 0) {
          setTimeout(() => addToast("warning", `${dueToday.length} tâche${dueToday.length > 1 ? 's' : ''} à rendre aujourd'hui`, dueToday.map(t => t.title).join(', ')), 2000);
        }
        if (dueTomorrow.length > 0) {
          setTimeout(() => addToast("info", `${dueTomorrow.length} tâche${dueTomorrow.length > 1 ? 's' : ''} à rendre demain`, dueTomorrow.map(t => t.title).join(', ')), 3000);
        }
      }
      // --- End Notifications ---
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    } finally {
      setLoading(false);
    }
  }, [user, addToast]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, loadData]);

  // Basculer l'état de complétion d'une tâche (Optimistic UI)
  const handleToggleTask = async (taskId: string, completed: boolean) => {
    // Optimistic update: update local state immediately
    const updateLocal = (prevTasks: typeof tasks) =>
      prevTasks.map((t) => (t.id === taskId ? { ...t, completed } : t));
    setTasks(updateLocal);
    setFilteredTasks(updateLocal);

    // Sparkle on completion
    if (completed) {
      setSparkleTaskId(taskId);
      setTimeout(() => setSparkleTaskId(null), 1000);
    }

    try {
      if (completed) {
        await completeTask(taskId);
      } else {
        await uncompleteTask(taskId);
      }
    } catch (error) {
      // Rollback on error
      console.error("Erreur lors de la mise à jour de la tâche:", error);
      const rollback = (prevTasks: typeof tasks) =>
        prevTasks.map((t) => (t.id === taskId ? { ...t, completed: !completed } : t));
      setTasks(rollback);
      setFilteredTasks(rollback);
    }
  };

  // Créer une nouvelle tâche
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!taskForm.title.trim()) {
      addToast("error", "Champ requis", "Le titre de la tâche est obligatoire.");
      return;
    }
    if (!taskForm.subjectId) {
      addToast("error", "Champ requis", "Veuillez sélectionner une matière.");
      return;
    }
    if (!taskForm.dueDate) {
      addToast("error", "Champ requis", "La date d'échéance est obligatoire.");
      return;
    }

    setIsCreatingTask(true);
    try {
      const dueDate = new Date(taskForm.dueDate);
      if (isNaN(dueDate.getTime())) {
        throw new Error("Date invalide");
      }

      await createTask(
        user.uid,
        taskForm.subjectId,
        taskForm.title,
        taskForm.description,
        taskForm.type,
        dueDate,
        taskForm.plannedDuration,
        taskForm.priority
      );

      // Réinitialiser le formulaire
      setTaskForm({
        title: "",
        description: "",
        type: "Devoir",
        subjectId: "",
        dueDate: "",
        plannedDuration: 60,
        priority: "medium",
      });
      setShowTaskModal(false);
      addToast("success", "Tâche créée", "Ta nouvelle tâche a été ajoutée avec succès ! ✨");
      await loadData();
    } catch (error) {
      console.error("Erreur lors de la création de la tâche:", error);
      addToast("error", "Erreur", "Impossible de créer la tâche. Vérifie les informations.");
    } finally {
      setIsCreatingTask(false);
    }
  };

  // Créer une nouvelle matière
  const [isCreatingSubject, setIsCreatingSubject] = useState(false);
  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!subjectForm.name.trim()) {
      addToast("error", "Champ requis", "Le nom de la matière est obligatoire.");
      return;
    }

    setIsCreatingSubject(true);
    try {
      await createSubject(user.uid, subjectForm.name, subjectForm.color);

      // Réinitialiser le formulaire
      setSubjectForm({
        name: "",
        color: "#3b82f6",
      });
      setShowSubjectModal(false);
      addToast("success", "Matière créée", `La matière "${subjectForm.name}" est prête ! 🎨`);
      await loadData();
    } catch (error) {
      console.error("Erreur lors de la création de la matière:", error);
      addToast("error", "Erreur", "Impossible de créer la matière.");
    } finally {
      setIsCreatingSubject(false);
    }
  };

  // Supprimer une tâche
  const handleDeleteTask = async (taskId: string) => {
    setConfirmState({
      isOpen: true,
      title: "Supprimer la tâche",
      message: "Es-tu sûr de vouloir supprimer cette tâche ? Cette action est irréversible.",
      variant: "danger",
      onConfirm: async () => {
        setConfirmState((s) => ({ ...s, isOpen: false }));
        try {
          await deleteTask(taskId);
          await loadData();
        } catch (error) {
          console.error("Erreur lors de la suppression:", error);
        }
      },
    });
  };

  // Supprimer une matière
  const handleDeleteSubject = async (subjectId: string) => {
    const tasksWithSubject = tasks.filter((t) => t.subjectId === subjectId);
    const msg = tasksWithSubject.length > 0
      ? `Cette matière contient ${tasksWithSubject.length} tâche(s). Elles seront également supprimées.`
      : "Es-tu sûr de vouloir supprimer cette matière ?";

    setConfirmState({
      isOpen: true,
      title: "Supprimer la matière",
      message: msg,
      variant: "danger",
      onConfirm: async () => {
        setConfirmState((s) => ({ ...s, isOpen: false }));
        try {
          for (const task of tasksWithSubject) {
            await deleteTask(task.id);
          }
          await deleteSubject(subjectId);
          await loadData();
        } catch (error) {
          console.error("Erreur lors de la suppression de la matière:", error);
        }
      },
    });
  };

  // IA: Découper une tâche
  const [isBreakingDown, setIsBreakingDown] = useState(false);
  const handleBreakdownTask = async (task: Task) => {
    if (!user) return;

    setConfirmState({
      isOpen: true,
      title: "Décomposer avec l'IA 🧠",
      message: `Veux-tu que l'IA décompose "${task.title}" en sous-tâches actionnables ?`,
      variant: "info",
      onConfirm: async () => {
        setConfirmState((s) => ({ ...s, isOpen: false }));
        setIsBreakingDown(true);
        try {
          const idToken = await user.getIdToken();
          const response = await fetch("/api/breakdown-task", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify({
              title: task.title.slice(0, 200),
              description: (task.description || "").slice(0, 500),
            }),
          });

          if (!response.ok) throw new Error("Erreur de l'API IA");

          const data = await response.json();

          if (data.subtasks && Array.isArray(data.subtasks)) {
            for (const subtask of data.subtasks) {
              await createTask(
                user.uid,
                task.subjectId,
                `[Plan] ${subtask.title}`,
                subtask.description,
                task.type,
                task.dueDate.toDate(),
                subtask.plannedDuration,
                task.priority
              );
            }
            await completeTask(task.id);
            addToast("success", `Plan d'action généré !`, `${data.subtasks.length} sous-tâches créées 🎉`);
            await loadData();
          }
        } catch (error) {
          console.error("Erreur Breakdown IA:", error);
          addToast("error", "Erreur IA", "Une erreur est survenue lors du découpage.");
        } finally {
          setIsBreakingDown(false);
        }
      },
    });
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
        <div className="min-h-screen pt-20 pb-28 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto space-y-10">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-3">
                <Skeleton className="h-12 w-64" />
                <Skeleton className="h-6 w-48" />
              </div>
              <div className="flex gap-3">
                <Skeleton className="h-11 w-24 rounded-xl" />
                <Skeleton className="h-11 w-24 rounded-xl" />
              </div>
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[1, 2, 3, 4].map((i) => (
                <StatCardSkeleton key={i} />
              ))}
            </div>

            {/* Main Content Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-8">
                <Skeleton className="h-8 w-48" />
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <TaskCardSkeleton key={i} />
                  ))}
                </div>
              </div>
              <div className="space-y-8">
                <Skeleton className="h-8 w-32" />
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-2xl" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      {/* ConfirmDialog */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        variant={confirmState.variant}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState((s) => ({ ...s, isOpen: false }))}
      />

      {isBreakingDown && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center z-[100] text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mb-4"></div>
          <p className="font-bold text-xl">L&apos;IA réfléchit au plan d&apos;action...</p>
          <p className="text-sm opacity-80">Génération des sous-tâches 🧠✨</p>
        </div>
      )}

      <div className="min-h-screen pt-20 pb-28 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-10 sm:space-y-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-spring-in">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                Bonjour, <span className="text-gradient">{user?.displayName?.split(' ')[0] || 'Champion'}</span> <Sparkles className="inline-block text-yellow-400" />
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2 text-base sm:text-lg font-medium">
                Voici ce qui t&apos;attend pour aujourd&apos;hui.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFocusMode(true)}
                className="btn-premium flex-1 sm:flex-none flex items-center justify-center gap-2 group"
              >
                <Zap size={18} className="group-hover:text-yellow-400 transition-colors" />
                Focus
              </button>
              <button
                onClick={() => setShowTaskModal(true)}
                className="btn-premium-outline flex-1 sm:flex-none flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                Tâche
              </button>
            </div>
          </div>

          {/* Statistiques - Grid Modernisée */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 animate-spring-in" style={{ animationDelay: '0.1s' }}>
            <StatCard
              title="Total des tâches"
              value={totalTasks}
              icon={<FileText size={24} className="text-white" />}
              color="blue"
            />
            <StatCard
              title="Progression"
              value={`${completedPercentage}%`}
              icon={<Target size={24} className="text-white" />}
              color={completedPercentage >= 70 ? "green" : completedPercentage >= 40 ? "yellow" : "red"}
            />
            <StatCard
              title="En retard"
              value={overdueTasks}
              icon={<Clock size={24} className="text-white" />}
              color={overdueTasks === 0 ? "green" : overdueTasks <= 3 ? "yellow" : "red"}
            />
            <StatCard
              title="Streak"
              value={streak}
              icon={<Flame size={24} className="text-white" />}
              color={streak >= 7 ? "green" : streak >= 3 ? "yellow" : "blue"}
            />
          </div>

          {/* Section Badges - Glassmorphism */}
          <div className="animate-spring-in" style={{ animationDelay: '0.2s' }}>
            <MiniBadges unlockedBadges={badges.unlockedBadges} />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-spring-in" style={{ animationDelay: '0.3s' }}>
            {/* Left Column: Tasks */}
            <div className="lg:col-span-2 space-y-10">
              {/* Overdue Tasks */}
              {overduetasksList.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <AlertTriangle className="text-rose-500" /> Tâches prioritaires
                    </h2>
                    <span className="px-3 py-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-full text-xs font-bold uppercase tracking-widest border border-rose-200 dark:border-rose-900/30">
                      {overduetasksList.length} en retard
                    </span>
                  </div>
                  <div className="space-y-4">
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
                </section>
              )}

              {/* All Tasks */}
              <section>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="text-indigo-500">📚</span> Toutes les tâches
                  </h2>
                  <TaskFilters
                    tasks={tasks}
                    subjects={subjects}
                    onFilter={setFilteredTasks}
                  />
                </div>

                {filteredTasks.length === 0 ? (
                  <div className="card-premium text-center py-20">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
                      ✨
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-lg font-medium mb-8">
                      Tout est sous contrôle ! Prêt pour une nouvelle tâche ?
                    </p>
                    <button
                      onClick={() => setShowTaskModal(true)}
                      className="btn-premium"
                    >
                      Ajouter une tâche
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredTasks.map((task, index) => (
                      <div
                        key={task.id}
                        className="relative animate-spring-in"
                        style={{ animationDelay: `${(index * 0.05) + 0.4}s`, animationFillMode: 'both' }}
                      >
                        <TaskCard
                          task={task}
                          subject={subjects.find((s) => s.id === task.subjectId)}
                          onToggle={handleToggleTask}
                          onDelete={handleDeleteTask}
                          onBreakdownTask={handleBreakdownTask}
                        />
                        {sparkleTaskId === task.id && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-4xl animate-sparkle">✨</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* Right Column: Subjects & Sidebar */}
            <div className="space-y-10">
              {/* Study Goals Widget */}
              {user && <StudyGoals userId={user.uid} />}

              {/* Subjects Section */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">📚 Matières</h2>
                  <button
                    onClick={() => setShowSubjectModal(true)}
                    className="text-xs font-bold text-indigo-500 hover:text-indigo-600 uppercase tracking-widest"
                  >
                    + Ajouter
                  </button>
                </div>

                <div className="space-y-3">
                  {subjects.length === 0 ? (
                    <div className="p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center">
                      <p className="text-sm text-slate-400">Aucune matière créée encore.</p>
                    </div>
                  ) : (
                    subjects.map((subject, index) => (
                      <div
                        key={subject.id}
                        className="group flex items-center justify-between p-4 glass rounded-2xl hover:bg-white/90 dark:hover:bg-slate-800/90 transition-all border-l-4 animate-spring-in"
                        style={{
                          borderLeftColor: subject.color,
                          animationDelay: `${(index * 0.05) + 0.5}s`,
                          animationFillMode: 'both'
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full ring-4 ring-white dark:ring-slate-900 shadow-sm"
                            style={{ backgroundColor: subject.color }}
                          ></div>
                          <span className="font-bold text-slate-700 dark:text-slate-200">{subject.name}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteSubject(subject.id)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      {showTaskModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end md:items-center justify-center z-[70] md:p-4 transition-all duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-t-[2.5rem] md:rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] w-full max-w-xl px-6 pt-6 pb-24 md:p-8 pb-safe max-h-[90vh] overflow-y-auto border-t md:border border-white/20 dark:border-slate-800 animate-slide-up md:animate-spring-in">
            {/* Grabber handle for mobile */}
            <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-8 md:hidden"></div>

            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Nouvelle tâche</h2>
              <button onClick={() => setShowTaskModal(false)} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                ✕
              </button>
            </div>

            {subjects.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
                  📚
                </div>
                <p className="text-slate-600 dark:text-slate-400 mb-8 font-medium">
                  Hop là ! Tu dois d&apos;abord créer une matière avant d&apos;ajouter des tâches.
                </p>
                <button
                  onClick={() => {
                    setShowTaskModal(false);
                    setShowSubjectModal(true);
                  }}
                  className="btn-premium"
                >
                  Créer ma première matière
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateTask} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-3 ml-1">
                      Titre de la mission
                    </label>
                    <input
                      type="text"
                      value={taskForm.title}
                      onChange={(e) =>
                        setTaskForm({ ...taskForm, title: e.target.value })
                      }
                      required
                      className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 dark:focus:border-indigo-400 rounded-2xl text-slate-900 dark:text-white transition-all outline-none shadow-sm"
                      placeholder="Ex: Réviser l'algèbre linéaire"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-3 ml-1">
                      Description (Optionnel)
                    </label>
                    <textarea
                      value={taskForm.description}
                      onChange={(e) =>
                        setTaskForm({ ...taskForm, description: e.target.value })
                      }
                      className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 dark:focus:border-indigo-400 rounded-2xl text-slate-900 dark:text-white transition-all outline-none shadow-sm"
                      rows={3}
                      placeholder="Quels sont les détails importants ?"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-3 ml-1">
                      Type
                    </label>
                    <select
                      value={taskForm.type}
                      onChange={(e) =>
                        setTaskForm({ ...taskForm, type: e.target.value as TaskType })
                      }
                      required
                      className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 dark:focus:border-indigo-400 rounded-2xl text-slate-900 dark:text-white transition-all outline-none appearance-none cursor-pointer"
                    >
                      <option value="Devoir">Devoir 📝</option>
                      <option value="Révision">Révision 🧠</option>
                      <option value="Examen">Examen 🏁</option>
                      <option value="Projet">Projet 🚀</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-3 ml-1">
                      Matière
                    </label>
                    <select
                      value={taskForm.subjectId}
                      onChange={(e) =>
                        setTaskForm({ ...taskForm, subjectId: e.target.value })
                      }
                      required
                      className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-500 dark:focus:border-indigo-400 rounded-2xl text-slate-900 dark:text-white transition-all outline-none appearance-none cursor-pointer"
                    >
                      <option value="">Sélectionner</option>
                      {subjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-3 ml-1">
                      Échéance
                    </label>
                    <input
                      type="datetime-local"
                      value={taskForm.dueDate}
                      onChange={(e) =>
                        setTaskForm({ ...taskForm, dueDate: e.target.value })
                      }
                      required
                      className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 dark:focus:border-indigo-400 rounded-2xl text-slate-900 dark:text-white transition-all outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-3 ml-1">
                      Durée (min)
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
                      className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 dark:focus:border-indigo-400 rounded-2xl text-slate-900 dark:text-white transition-all outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-3 ml-1">
                      Priorité
                    </label>
                    <div className="flex gap-4">
                      {['low', 'medium', 'high'].map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setTaskForm({ ...taskForm, priority: p as any })}
                          className={`flex-1 py-3 rounded-xl border-2 transition-all font-bold text-sm ${taskForm.priority === p
                            ? "bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                            : "border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-500"
                            }`}
                        >
                          {p === 'low' ? 'Basse' : p === 'medium' ? 'Moyenne' : 'Haute'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    type="submit"
                    disabled={isCreatingTask}
                    className="flex-1 btn-premium flex items-center justify-center gap-2"
                  >
                    {isCreatingTask ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Création...
                      </>
                    ) : (
                      "Créer la tâche"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTaskModal(false)}
                    className="flex-1 btn-premium-outline"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {showSubjectModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end md:items-center justify-center z-[70] md:p-4 transition-all duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-t-[2.5rem] md:rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] w-full max-w-md px-6 pt-6 pb-24 md:p-8 pb-safe max-h-[90vh] overflow-y-auto border-t md:border border-white/20 dark:border-slate-800 animate-slide-up md:animate-spring-in">
            {/* Grabber handle for mobile */}
            <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-8 md:hidden"></div>

            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Nouvelle matière</h2>
              <button onClick={() => setShowSubjectModal(false)} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-8">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-3 ml-1">
                  Nom de la matière
                </label>
                <input
                  type="text"
                  value={subjectForm.name}
                  onChange={(e) =>
                    setSubjectForm({ ...subjectForm, name: e.target.value })
                  }
                  required
                  className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 dark:focus:border-indigo-400 rounded-2xl text-slate-900 dark:text-white transition-all outline-none shadow-sm"
                  placeholder="Ex: Intelligence Artificielle"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-3 ml-1">
                  Identité visuelle (Couleur)
                </label>
                <div className="flex bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl gap-4 items-center border border-slate-100 dark:border-slate-800">
                  <input
                    type="color"
                    value={subjectForm.color}
                    onChange={(e) =>
                      setSubjectForm({ ...subjectForm, color: e.target.value })
                    }
                    className="w-14 h-14 rounded-xl cursor-pointer bg-transparent border-none overflow-hidden"
                  />
                  <input
                    type="text"
                    value={subjectForm.color}
                    onChange={(e) =>
                      setSubjectForm({ ...subjectForm, color: e.target.value })
                    }
                    className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white font-mono font-bold"
                    placeholder="#3b82f6"
                  />
                </div>
                <p className="mt-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider ml-1">
                  Cette couleur sera utilisée pour toutes les tâches associées.
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isCreatingSubject}
                  className="flex-1 btn-premium flex items-center justify-center gap-2"
                >
                  {isCreatingSubject ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Création...
                    </>
                  ) : (
                    "Ajouter la matière"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSubjectModal(false)}
                  className="flex-1 btn-premium-outline"
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

      {/* Floating Action Button (Mobile Only) */}
      <FloatingActionButton onClick={() => setShowTaskModal(true)} />
    </ProtectedRoute>
  );
}
