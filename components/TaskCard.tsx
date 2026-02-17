"use client";

import { Task, Subject } from "@/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { isTaskOverdue } from "@/utils/streak";

interface TaskCardProps {
  task: Task;
  subject?: Subject;
  onToggle: (taskId: string, completed: boolean) => void;
  onDelete?: (taskId: string) => void;
}

/**
 * Composant pour afficher une tâche
 */
export default function TaskCard({ task, subject, onToggle, onDelete }: TaskCardProps) {
  const isOverdue = isTaskOverdue(task);
  const dueDate = task.dueDate.toDate();

  return (
    <div
      className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${
        task.completed
          ? "bg-success/5 border-success"
          : isOverdue
          ? "bg-danger/5 border-danger"
          : "bg-gray-50 border-gray-200"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id, !task.completed)}
          className="mt-1 w-5 h-5 rounded cursor-pointer"
        />

        {/* Contenu */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {subject && (
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: subject.color }}
              ></span>
            )}
            <h3
              className={`font-semibold ${
                task.completed ? "line-through text-gray-500" : ""
              }`}
            >
              {task.title}
            </h3>
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
              {task.type}
            </span>
          </div>

          {task.description && (
            <p className="text-sm text-gray-600 mb-2">{task.description}</p>
          )}

          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className={isOverdue && !task.completed ? "text-danger font-medium" : ""}>
              📅 {format(dueDate, "dd MMM yyyy", { locale: fr })}
            </span>
            <span>⏱️ {task.plannedDuration} min</span>
            {subject && <span>📚 {subject.name}</span>}
          </div>
        </div>

        {/* Bouton supprimer */}
        {onDelete && (
          <button
            onClick={() => onDelete(task.id)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded transition"
            title="Supprimer cette tâche"
          >
            🗑️
          </button>
        )}
      </div>
    </div>
  );
}
