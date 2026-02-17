import { Timestamp } from "firebase/firestore";

// Type pour un utilisateur
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Timestamp;
  streak: number;
}

// Type pour une matière
export interface Subject {
  id: string;
  userId: string;
  name: string;
  color: string; // Code hexadécimal (ex: "#3b82f6")
  createdAt: Timestamp;
}

// Type pour une tâche
export type TaskType = "Devoir" | "Révision" | "Examen" | "Projet";

export interface Task {
  id: string;
  userId: string;
  subjectId: string;
  title: string;
  description: string;
  type: TaskType;
  dueDate: Timestamp;
  plannedDuration: number; // en minutes
  completed: boolean;
  completedAt?: Timestamp;
  createdAt: Timestamp;
}

// Type pour une session Focus (Pomodoro)
export interface FocusSession {
  id: string;
  userId: string;
  taskId?: string; // Optionnel si la session n'est pas liée à une tâche
  subjectId?: string;
  duration: number; // Durée réelle travaillée en minutes
  type: "work" | "break"; // Travail ou pause
  startedAt: Timestamp;
  completedAt: Timestamp;
  createdAt: Timestamp;
}

// Type pour les statistiques du dashboard
export interface DashboardStats {
  totalTasks: number;
  completedPercentage: number;
  overdueTasks: number;
  streak: number;
}

// Type pour les données de graphique
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
  }[];
}
