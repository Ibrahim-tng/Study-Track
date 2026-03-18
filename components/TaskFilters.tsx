"use client";

import { Task, Subject } from "@/types";
import { useState, useEffect, useCallback } from "react";

interface TaskFiltersProps {
  tasks: Task[];
  subjects: Subject[];
  onFilter: (filtered: Task[]) => void;
}

export default function TaskFilters({
  tasks,
  subjects,
  onFilter,
}: TaskFiltersProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "completed" | "pending">("all");
  const [selectedPriority, setSelectedPriority] = useState<"all" | "high" | "medium" | "low">("all");

  // Filter tasks using useEffect to avoid stale closure
  const applyFilters = useCallback(() => {
    let filtered = tasks;

    // Search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Subject filter
    if (selectedSubjectId !== "all") {
      filtered = filtered.filter((task) => task.subjectId === selectedSubjectId);
    }

    // Status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter((task) =>
        selectedStatus === "completed" ? task.completed : !task.completed
      );
    }

    // Priority filter
    if (selectedPriority !== "all") {
      filtered = filtered.filter((task) => task.priority === selectedPriority);
    }

    onFilter(filtered);
  }, [tasks, searchTerm, selectedSubjectId, selectedStatus, selectedPriority, onFilter]);

  // Re-filter whenever any filter state or tasks change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6 border border-gray-200 dark:border-gray-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Recherche */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            🔍 Rechercher
          </label>
          <input
            type="text"
            placeholder="Nom de la tâche..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filtre matière */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            📚 Matière
          </label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Toutes les matières</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filtre statut */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            ✓ Statut
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as "all" | "completed" | "pending")}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Toutes les tâches</option>
            <option value="pending">En cours</option>
            <option value="completed">Complétées</option>
          </select>
        </div>

        {/* Filtre priorité */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            🔥 Priorité
          </label>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value as "all" | "high" | "medium" | "low")}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Toutes les priorités</option>
            <option value="high">Haute 🔴</option>
            <option value="medium">Moyenne 🟡</option>
            <option value="low">Basse 🟢</option>
          </select>
        </div>
      </div>
    </div>
  );
}
