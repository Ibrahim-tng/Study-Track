"use client";

import React, { ReactNode, ErrorInfo } from "react";
import Link from "next/link";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center border border-gray-200 dark:border-gray-700">
            <div className="text-5xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Oups ! Une erreur s&apos;est produite
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {this.state.error?.message || "Une erreur inattendue s&apos;est produite."}
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
              >
                🔄 Recharger la page
              </button>
              <Link
                href="/dashboard"
                className="block w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition text-center"
              >
                📊 Retour au tableau de bord
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
