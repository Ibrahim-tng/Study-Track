"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface NotificationContextType {
  toasts: Toast[];
  addToast: (type: ToastType, title: string, message?: string) => void;
  removeToast: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev.slice(-4), { id, type, title, message }]); // max 5 toasts
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used inside NotificationProvider");
  return ctx;
}

// Toast icons and colors
const TOAST_STYLES: Record<ToastType, { bg: string; border: string; text: string; icon: string }> = {
  success: {
    bg: "bg-green-50 dark:bg-green-900/30",
    border: "border-green-200 dark:border-green-700",
    text: "text-green-800 dark:text-green-300",
    icon: "✅",
  },
  error: {
    bg: "bg-red-50 dark:bg-red-900/30",
    border: "border-red-200 dark:border-red-700",
    text: "text-red-800 dark:text-red-300",
    icon: "❌",
  },
  warning: {
    bg: "bg-yellow-50 dark:bg-yellow-900/30",
    border: "border-yellow-200 dark:border-yellow-700",
    text: "text-yellow-800 dark:text-yellow-300",
    icon: "⚠️",
  },
  info: {
    bg: "bg-blue-50 dark:bg-blue-900/30",
    border: "border-blue-200 dark:border-blue-700",
    text: "text-blue-800 dark:text-blue-300",
    icon: "💡",
  },
};

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-[200] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const s = TOAST_STYLES[toast.type];
        return (
          <div
            key={toast.id}
            className={`${s.bg} ${s.border} border rounded-xl shadow-lg p-4 flex gap-3 items-start pointer-events-auto animate-slide-in-right`}
          >
            <span className="text-xl shrink-0 mt-0.5">{s.icon}</span>
            <div className="flex-1 min-w-0">
              <p className={`font-semibold text-sm ${s.text}`}>{toast.title}</p>
              {toast.message && (
                <p className={`text-xs mt-0.5 opacity-80 ${s.text}`}>{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className={`shrink-0 opacity-60 hover:opacity-100 transition ${s.text}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}
