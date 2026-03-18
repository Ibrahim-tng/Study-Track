"use client";

import { ReactNode } from "react";

interface FloatingActionButtonProps {
  onClick: () => void;
  icon?: ReactNode;
  label?: string;
  className?: string;
}

export default function FloatingActionButton({ 
  onClick, 
  icon = (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  ),
  label = "Nouvelle tâche",
  className = ""
}: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`fixed left-6 bottom-24 z-40 flex items-center justify-center w-16 h-16 bg-primary dark:bg-blue-500 text-white rounded-2xl shadow-lg hover:shadow-xl hover:bg-blue-600 active:scale-95 transition-all duration-300 md:hidden ${className}`}
      aria-label={label}
    >
      {icon}
    </button>
  );
}
