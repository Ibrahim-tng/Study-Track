"use client";

import { useState, useEffect, useRef } from "react";
import { createFocusSession } from "@/lib/firestore/focusSessions";
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
  // Configuration
  const WORK_TIME = 25 * 60; // 25 minutes en secondes
  const BREAK_TIME = 5 * 60; // 5 minutes en secondes

  // États
  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [isWorkSession, setIsWorkSession] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Jouer un son à la fin (optionnel)
  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio("/notification.mp3");
    }
  }, []);

  // Timer
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleSessionEnd();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft]);

  // Gestion de la fin de session
  const handleSessionEnd = async () => {
    setIsRunning(false);

    // Jouer le son
    try {
      audioRef.current?.play();
    } catch (e) {
      console.log("Audio notification not available");
    }

    if (isWorkSession) {
      // Enregistrer la session de travail
      const task = tasks.find((t) => t.id === selectedTaskId);
      await createFocusSession(
        userId,
        WORK_TIME / 60, // Convertir en minutes
        "work",
        selectedTaskId || undefined,
        task?.subjectId
      );

      setSessionsCompleted((prev) => prev + 1);
      onSessionComplete();

      // Passer à la pause
      setIsWorkSession(false);
      setTimeLeft(BREAK_TIME);
      
      // Afficher notification
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Session terminée ! 🎉", {
          body: "Temps de faire une pause de 5 minutes.",
        });
      }
    } else {
      // Fin de pause
      setIsWorkSession(true);
      setTimeLeft(WORK_TIME);

      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Pause terminée ! 💪", {
          body: "Prêt pour une nouvelle session ?",
        });
      }
    }
  };

  // Démarrer/Pause
  const toggleTimer = () => {
    if (!isRunning && isWorkSession && !selectedTaskId && tasks.length > 0) {
      alert("Sélectionne une tâche pour cette session !");
      return;
    }

    // Demander permission pour les notifications
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    setIsRunning(!isRunning);
  };

  // Reset
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(isWorkSession ? WORK_TIME : BREAK_TIME);
  };

  // Formater le temps
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculer le pourcentage de progression
  const progress = isWorkSession
    ? ((WORK_TIME - timeLeft) / WORK_TIME) * 100
    : ((BREAK_TIME - timeLeft) / BREAK_TIME) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full p-8 relative">
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
        >
          ✕
        </button>

        {/* Titre */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">
            {isWorkSession ? "🔥 Mode Focus" : "☕ Pause"}
          </h2>
          <p className="text-gray-600">
            {isWorkSession
              ? "Concentre-toi sur ta tâche"
              : "Repose-toi un peu"}
          </p>
        </div>

        {/* Sélection de tâche (seulement en session de travail) */}
        {isWorkSession && !isRunning && (
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Tâche à travailler (optionnel)
            </label>
            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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
            {/* Cercle de fond */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke="#e5e7eb"
                strokeWidth="8"
                fill="none"
              />
              {/* Cercle de progression */}
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

            {/* Temps au centre */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">{formatTime(timeLeft)}</div>
                <div className="text-sm text-gray-500">
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
            className={`px-8 py-3 rounded-lg font-medium text-white transition ${
              isWorkSession
                ? "bg-primary hover:bg-blue-600"
                : "bg-success hover:bg-green-600"
            }`}
          >
            {isRunning ? "⏸️ Pause" : "▶️ Démarrer"}
          </button>
          <button
            onClick={resetTimer}
            className="px-8 py-3 rounded-lg font-medium bg-gray-200 hover:bg-gray-300 transition"
          >
            🔄 Reset
          </button>
        </div>

        {/* Statistiques de la session */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">
                {sessionsCompleted}
              </div>
              <div className="text-xs text-gray-600">Sessions complétées</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-success">
                {sessionsCompleted * 25}
              </div>
              <div className="text-xs text-gray-600">Minutes travaillées</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-warning">
                {Math.floor((sessionsCompleted * 25) / 60)}h{(sessionsCompleted * 25) % 60}m
              </div>
              <div className="text-xs text-gray-600">Temps total</div>
            </div>
          </div>
        </div>

        {/* Conseils */}
        <div className="mt-6 text-center text-sm text-gray-500">
          💡 Astuce : Garde ton téléphone loin pendant la session
        </div>
      </div>
    </div>
  );
}
