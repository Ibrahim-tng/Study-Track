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
  onBreakdownTask?: (task: Task) => void;
}

/**
 * Composant pour afficher une tâche
 */
export default function TaskCard({ task, subject, onToggle, onDelete, onBreakdownTask }: TaskCardProps) {
  const isOverdue = isTaskOverdue(task);
  const dueDate = task.dueDate.toDate();

  const priorityStyles = {
    high: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/30",
    medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/30",
    low: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30",
  }[task.priority || "medium"];

  return (
    <div
      className={`group relative overflow-hidden card-premium !p-0 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] ${
        task.completed ? "opacity-60 grayscale-[0.5]" : ""
      }`}
    >
      {/* Background decoration */}
      <div 
        className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full blur-3xl opacity-10 transition-opacity group-hover:opacity-20"
        style={{ backgroundColor: subject?.color || '#3b82f6' }}
      ></div>

      <div className="relative p-5 flex items-start gap-4">
        {/* Checkbox Custom */}
        <div 
          onClick={() => onToggle(task.id, !task.completed)}
          className={`flex-shrink-0 w-8 h-8 rounded-2xl border-2 flex items-center justify-center cursor-pointer transition-all duration-300 ${
            task.completed 
              ? "bg-primary border-primary text-white scale-110 shadow-clay-btn" 
              : "border-slate-300 dark:border-slate-700 hover:border-primary shadow-inner"
          }`}
        >
          {task.completed && <span className="text-sm">✓</span>}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {subject && (
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white" style={{ backgroundColor: subject.color }}>
                {subject.name}
              </span>
            )}
            <span className={`px-3 py-1 rounded-xl text-[10px] font-extrabold uppercase tracking-widest border shadow-sm ${priorityStyles}`}>
              {task.priority === "high" ? "Urgent" : task.priority === "low" ? "Repos" : "Moyen"}
            </span>
          </div>

          <h3 className={`text-lg font-bold text-slate-900 dark:text-white leading-tight mb-1 ${task.completed ? "line-through" : ""}`}>
            {task.title}
          </h3>

          {task.description && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className={`flex items-center gap-1.5 font-medium ${isOverdue && !task.completed ? "text-rose-500" : "text-slate-400 dark:text-slate-500"}`}>
               <span className="text-base">📅</span>
               {format(dueDate, "dd MMM yyyy", { locale: fr })}
            </div>
            <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 font-medium">
               <span className="text-base">⏱️</span>
               {task.plannedDuration} min
            </div>
          </div>
        </div>

        {/* Actions Menu */}
        <div className="flex flex-col items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
           {!task.completed && onBreakdownTask && (
             <button
               onClick={() => onBreakdownTask(task)}
               className="w-9 h-9 flex items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500 hover:text-white transition-all shadow-sm"
               title="Décliner avec l'IA ✨"
             >
               ✨
             </button>
           )}
           {onDelete && (
             <button
               onClick={() => onDelete(task.id)}
               className="w-9 h-9 flex items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
             >
               🗑️
             </button>
           )}
        </div>
      </div>
    </div>
  );
}
