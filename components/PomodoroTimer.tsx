"use client";

import { useState, useEffect, useRef } from "react";
import { createFocusSession } from "@/lib/firestore/focus";
import { useAuth } from "@/hooks/useAuth";

interface PomodoroTimerProps {
  taskId?: string;
  subjectId?: string;
  onSessionComplete?: () => void;
}

export default function PomodoroTimer({
  taskId,
  subjectId,
  onSessionComplete,
}: PomodoroTimerProps) {
  const { user } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes en secondes
  const [isWorkSession, setIsWorkSession] = useState(true);
  const [sessionCount, setSessionCount] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const WORK_TIME = 25 * 60; // 25 minutes
  const BREAK_TIME = 5 * 60; // 5 minutes

  // Nettoyer l'intervalle quand le composant est démonté
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
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
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const handleSessionEnd = async () => {
    setIsRunning(false);

    // Sauvegarder la session dans Firestore
    if (user) {
      const duration = isWorkSession ? WORK_TIME / 60 : BREAK_TIME / 60;
      await createFocusSession(
        user.uid,
        duration,
        isWorkSession ? "work" : "break",
        taskId,
        subjectId
      );
    }

    // Jouer un son (optionnel)
    playNotificationSound();

    // Passer à la pause ou au travail
    if (isWorkSession) {
      setIsWorkSession(false);
      setTimeLeft(BREAK_TIME);
      setSessionCount((prev) => prev + 1);
      alert("🎉 Bravo ! Session terminée. Temps de pause !");
    } else {
      setIsWorkSession(true);
      setTimeLeft(WORK_TIME);
      alert("⏰ Pause terminée ! Prêt pour la prochaine session ?");
    }

    if (onSessionComplete) {
      onSessionComplete();
    }
  };

  const playNotificationSound = () => {
    // Simple beep avec Web Audio API
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
  };

  const startTimer = () => {
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(isWorkSession ? WORK_TIME : BREAK_TIME);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
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
    <div
      className={`${
        isFullscreen
          ? "fixed inset-0 bg-gray-900 z-50 flex items-center justify-center"
          : "bg-white rounded-lg shadow-lg p-8"
      }`}
    >
      <div className="max-w-md w-full text-center">
        {/* En-tête */}
        <div className="mb-8">
          <h2
            className={`text-2xl font-bold mb-2 ${
              isFullscreen ? "text-white" : "text-gray-900"
            }`}
          >
            {isWorkSession ? "🔥 Mode Focus" : "☕ Pause"}
          </h2>
          <p
            className={`${
              isFullscreen ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Session #{sessionCount + 1}
          </p>
        </div>

        {/* Timer circulaire */}
        <div className="relative w-64 h-64 mx-auto mb-8">
          {/* Cercle de progression */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke={isFullscreen ? "#374151" : "#e5e7eb"}
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

          {/* Temps */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className={`text-6xl font-bold ${
                isFullscreen ? "text-white" : "text-gray-900"
              }`}
            >
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {/* Contrôles */}
        <div className="flex justify-center gap-4 mb-6">
          {!isRunning ? (
            <button
              onClick={startTimer}
              className="bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-600 transition text-lg"
            >
              ▶️ Démarrer
            </button>
          ) : (
            <button
              onClick={pauseTimer}
              className="bg-warning text-white px-8 py-3 rounded-lg font-medium hover:bg-yellow-600 transition text-lg"
            >
              ⏸️ Pause
            </button>
          )}
          <button
            onClick={resetTimer}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              isFullscreen
                ? "bg-gray-700 text-white hover:bg-gray-600"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            🔄 Reset
          </button>
        </div>

        {/* Mode plein écran */}
        <button
          onClick={toggleFullscreen}
          className={`text-sm ${
            isFullscreen ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"
          } transition`}
        >
          {isFullscreen ? "🔙 Quitter plein écran" : "🖥️ Mode plein écran"}
        </button>

        {/* Instructions */}
        {!isRunning && (
          <div
            className={`mt-8 text-sm ${
              isFullscreen ? "text-gray-400" : "text-gray-500"
            }`}
          >
            <p className="mb-2">🍅 Méthode Pomodoro :</p>
            <p>25 min de travail intense</p>
            <p>5 min de pause</p>
          </div>
        )}
      </div>
    </div>
  );
}
