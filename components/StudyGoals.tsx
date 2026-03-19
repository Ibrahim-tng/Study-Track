"use client";

import { useState, useEffect, useCallback } from "react";
import { StudyGoal } from "@/types";
import {
  getUserGoals,
  createGoal,
  deleteGoal,
  completeGoal,
} from "@/lib/firestore/goals";
import { Target, Check, X, CheckCircle2 } from "lucide-react";

interface StudyGoalsProps {
  userId: string;
}

export default function StudyGoals({ userId }: StudyGoalsProps) {
  const [goals, setGoals] = useState<StudyGoal[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    period: "weekly" as "daily" | "weekly" | "monthly",
    targetHours: 10,
  });

  const loadGoals = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUserGoals(userId);
      setGoals(data);
    } catch (error) {
      console.error("Error loading goals:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newGoal = await createGoal(
        userId,
        formData.period,
        formData.targetHours
      );
      setGoals([...goals, newGoal]);
      setFormData({ period: "weekly", targetHours: 10 });
      setShowForm(false);
    } catch (error) {
      console.error("Error creating goal:", error);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      await deleteGoal(goalId);
      setGoals(goals.filter((g) => g.id !== goalId));
    } catch (error) {
      console.error("Error deleting goal:", error);
    }
  };

  const handleCompleteGoal = async (goalId: string) => {
    try {
      await completeGoal(goalId);
      setGoals(
        goals.map((g) => (g.id === goalId ? { ...g, completed: true } : g))
      );
    } catch (error) {
      console.error("Error completing goal:", error);
    }
  };

  const getPeriodLabel = (period: string): string => {
    return period === "daily"
      ? "Quotidien"
      : period === "weekly"
        ? "Hebdomadaire"
        : "Mensuel";
  };

  const getProgressPercentage = (goal: StudyGoal): number => {
    return Math.min(((goal.achievedHours || 0) / goal.targetHours) * 100, 100);
  };

  return (
    <div className="clay-card animate-spring-in">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Target className="text-primary" /> Objectifs d&apos;étude
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="clay-button"
        >
          {showForm ? "Annuler" : "+ Ajouter"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form
          onSubmit={handleCreateGoal}
          className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Période
              </label>
              <select
                value={formData.period}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    period: e.target.value as any,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">Quotidien</option>
                <option value="weekly">Hebdomadaire</option>
                <option value="monthly">Mensuel</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Heures cibles
              </label>
              <input
                type="number"
                min="1"
                max="168"
                value={formData.targetHours}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    targetHours: parseInt(e.target.value),
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition"
          >
            Créer l&apos;objectif
          </button>
        </form>
      )}

      {/* Goals List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : goals.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Aucun objectif. Créez-en un pour commencer ! 🚀
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => {
            const progress = getProgressPercentage(goal);
            const daysLeft = Math.ceil(
              (goal.endDate.toDate().getTime() - Date.now()) /
              (1000 * 60 * 60 * 24)
            );

            return (
              <div
                key={goal.id}
                className={`p-4 border-l-4 rounded-lg ${goal.completed
                    ? "bg-green-500/10 dark:bg-green-900/20 border-l-green-500"
                    : "bg-indigo-500/5 dark:bg-slate-800/50 border-l-primary shadow-clay-sm"
                  }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">
                      Objectif {getPeriodLabel(goal.period)} :{" "}
                      <span className="text-blue-600 dark:text-blue-400">
                        {goal.targetHours}<span className="text-xs sm:text-sm ml-1">heures</span>
                      </span>
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {daysLeft > 0
                        ? `${daysLeft} jour(s) restant(s)`
                        : "Période terminée"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!goal.completed && (
                      <button
                        onClick={() => handleCompleteGoal(goal.id)}
                        className="text-green-600 hover:text-green-700 font-semibold text-sm"
                      >
                        <Check size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="text-red-600 hover:text-red-700 font-semibold text-sm"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full transition-all ${progress >= 100
                        ? "bg-green-500"
                        : progress >= 50
                          ? "bg-blue-500"
                          : "bg-yellow-500"
                      }`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>

                {/* Stats */}
                <div className="mt-3 flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {goal.achievedHours || 0} / {goal.targetHours} heures
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {Math.round(progress)}%
                  </span>
                </div>

                {goal.completed && (
                  <div className="mt-3 text-center text-green-600 dark:text-green-400 font-semibold flex items-center justify-center gap-2">
                    <CheckCircle2 size={16} /> Objectif atteint !
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
