"use client";

import { useEffect } from "react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: "🗑️",
      bg: "bg-rose-500",
      hoverBg: "hover:bg-rose-600",
      ring: "ring-rose-500/30",
      iconBg: "bg-rose-500/10 text-rose-500",
    },
    warning: {
      icon: "⚠️",
      bg: "bg-amber-500",
      hoverBg: "hover:bg-amber-600",
      ring: "ring-amber-500/30",
      iconBg: "bg-amber-500/10 text-amber-500",
    },
    info: {
      icon: "💡",
      bg: "bg-indigo-500",
      hoverBg: "hover:bg-indigo-600",
      ring: "ring-indigo-500/30",
      iconBg: "bg-indigo-500/10 text-indigo-500",
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-white/20 dark:border-slate-800 p-8 animate-spring-in">
        {/* Icon */}
        <div className={`w-16 h-16 ${styles.iconBg} rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6`}>
          {styles.icon}
        </div>

        {/* Content */}
        <h2
          id="confirm-dialog-title"
          className="text-xl font-black text-slate-900 dark:text-white text-center mb-3"
        >
          {title}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center leading-relaxed mb-8">
          {message}
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 rounded-2xl ${styles.bg} ${styles.hoverBg} text-white font-bold text-sm shadow-lg ${styles.ring} ring-4 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 transition-all active:scale-95`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
