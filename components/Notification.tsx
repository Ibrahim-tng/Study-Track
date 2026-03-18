import React from "react";

export interface NotificationProps {
  type: "success" | "error" | "warning" | "info";
  message: string;
  duration?: number;
  onClose?: () => void;
}

export default function Notification({
  type,
  message,
  duration = 4000,
  onClose,
}: NotificationProps) {
  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => onClose?.(), duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const colors = {
    success: "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300",
    error: "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300",
    warning: "bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300",
    info: "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300",
  };

  const icons = {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️",
  };

  return (
    <div
      className={`fixed top-4 right-4 max-w-sm p-4 border rounded-lg shadow-lg ${colors[type]} animate-slide-in-right z-50`}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0">{icons[type]}</span>
        <div className="flex-1">{message}</div>
        <button
          onClick={onClose}
          className="text-lg font-bold opacity-70 hover:opacity-100 ml-2"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
