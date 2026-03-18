"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createFocusSession } from "@/lib/firestore/focus";
import { Subject, Task } from "@/types";

interface FocusModeProps {
  userId: string;
  tasks: Task[];
  subjects: Subject[];
  onClose: () => void;
  onSessionComplete: () => void;
}

export default function FocusMode({
  userId,
  tasks,
  subjects,
  onClose,
  onSessionComplete,
}: FocusModeProps) {
  const WORK_TIME = 25 * 60;
  const BREAK_TIME = 5 * 60;

  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [isWorkSession, setIsWorkSession] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "info" | "warning" } | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-hide notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Gestion de la fin de session — defined BEFORE useEffect that references it
  const handleSessionEnd = useCallback(async () => {
    setIsRunning(false);

    // Play notification sound
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 800;
      oscillator.type = "sine";
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      // Audio not available
    }

    if (isWorkSession) {
      const task = tasks.find((t) => t.id === selectedTaskId);
      await createFocusSession(
        userId,
        WORK_TIME / 60,
        "work",
        selectedTaskId || undefined,
        task?.subjectId
      );

      setSessionsCompleted((prev) => prev + 1);
      onSessionComplete();

      setIsWorkSession(false);
      setTimeLeft(BREAK_TIME);

      setNotification({
        message: "🎉 Session terminée ! Temps de pause.",
        type: "success",
      });

      // Browser notification
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Session terminée ! 🎉", {
          body: "Temps de faire une pause de 5 minutes.",
        });
      }
    } else {
      setIsWorkSession(true);
      setTimeLeft(WORK_TIME);

      setNotification({
        message: "⏰ Pause terminée ! Prêt pour une nouvelle session ?",
        type: "info",
      });

      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Pause terminée ! 💪", {
          body: "Prêt pour une nouvelle session ?",
        });
      }
    }
  }, [isWorkSession, selectedTaskId, tasks, userId, onSessionComplete, WORK_TIME, BREAK_TIME]);

  // Timer
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      handleSessionEnd();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft, handleSessionEnd]);

  const toggleTimer = () => {
    if (!isRunning && isWorkSession && !selectedTaskId && tasks.length > 0) {
      setNotification({
        message: "⚠️ Sélectionne une tâche pour cette session !",
        type: "warning",
      });
      return;
    }

    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    setIsRunning(!isRunning);
    setNotification(null);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(isWorkSession ? WORK_TIME : BREAK_TIME);
    setNotification(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = isWorkSession
    ? ((WORK_TIME - timeLeft) / WORK_TIME) * 100
    : ((BREAK_TIME - timeLeft) / BREAK_TIME) * 100;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 relative border border-gray-200 dark:border-gray-700 max-h-[95vh] overflow-y-auto">
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white text-2xl transition"
        >
          ✕
        </button>

        {/* Notification banner */}
        {notification && (
          <div
            className={`mb-6 p-4 rounded-lg text-sm font-medium animate-slide-in-right ${
              notification.type === "success"
                ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-300 dark:border-green-800"
                : notification.type === "warning"
                ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-800"
                : "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800"
            }`}
          >
            {notification.message}
          </div>
        )}

        {/* Titre */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
            {isWorkSession ? "🔥 Mode Focus" : "☕ Pause"}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {isWorkSession
              ? "Concentre-toi sur ta tâche"
              : "Repose-toi un peu"}
          </p>
        </div>

        {/* Sélection de tâche */}
        {isWorkSession && !isRunning && (
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Tâche à travailler
            </label>
            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Session libre</option>
              {tasks
                .filter((t) => !t.completed)
                .map((task) => {
                  const subject = subjects.find((s) => s.id === task.subjectId);
                  return (
                    <option key={task.id} value={task.id}>
                      {task.title} {subject ? `- ${subject.name}` : ""}
                    </option>
                  );
                })}
            </select>
          </div>
        )}

        {/* Timer circulaire */}
        <div className="flex justify-center mb-8">
          <div className="relative w-64 h-64">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke="currentColor"
                className="text-gray-200 dark:text-gray-700"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke={isWorkSession ? "#3b82f6" : "#10b981"}
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 120}`}
                strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl font-bold mb-2 text-gray-900 dark:text-white">{formatTime(timeLeft)}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {isWorkSession ? `Session ${sessionsCompleted + 1}` : "Pause"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contrôles */}
        <div className="flex gap-4 justify-center mb-6">
          <button
            onClick={toggleTimer}
            className={`px-8 py-3 rounded-xl font-semibold text-white transition shadow-md ${
              isWorkSession
                ? "bg-primary hover:bg-blue-600"
                : "bg-success hover:bg-green-600"
            }`}
          >
            {isRunning ? "⏸️ Pause" : "▶️ Démarrer"}
          </button>
          <button
            onClick={resetTimer}
            className="px-8 py-3 rounded-xl font-semibold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            🔄 Reset
          </button>
        </div>

        {/* Statistiques de la session */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary dark:text-blue-400">
                {sessionsCompleted}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Sessions complétées</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-success">
                {sessionsCompleted * 25}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Minutes travaillées</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-warning">
                {Math.floor((sessionsCompleted * 25) / 60)}h{(sessionsCompleted * 25) % 60}m
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Temps total</div>
            </div>
          </div>
        </div>

        {/* Conseils */}
        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          💡 Astuce : Garde ton téléphone loin pendant la session
        </div>
      </div>
    </div>
  );
}
