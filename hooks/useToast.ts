"use client";

import { useState, useCallback } from "react";

export interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
  duration?: number;
}

/**
 * Hook pour gérer les notifications toast
 */
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (
      message: string,
      type: "success" | "error" | "warning" | "info" = "info",
      duration = 4000
    ) => {
      const id = Date.now().toString();
      const toast: Toast = { id, type, message, duration };

      setToasts((prev) => [...prev, toast]);

      if (duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
      }

      return id;
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback(
    (message: string, duration?: number) =>
      addToast(message, "success", duration),
    [addToast]
  );

  const error = useCallback(
    (message: string, duration?: number) =>
      addToast(message, "error", duration),
    [addToast]
  );

  const warning = useCallback(
    (message: string, duration?: number) =>
      addToast(message, "warning", duration),
    [addToast]
  );

  const info = useCallback(
    (message: string, duration?: number) =>
      addToast(message, "info", duration),
    [addToast]
  );

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
}
