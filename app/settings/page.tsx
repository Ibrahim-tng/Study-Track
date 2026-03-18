"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/context/ThemeContext";
import { setDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [message, setMessage] = useState("");
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    dailyReminders: true,
    weeklyReport: true,
  });

  const handleSavePreferences = async () => {
    try {
      if (!user) return;
      await setDoc(doc(db, "users", user.uid), {
        preferences,
      }, { merge: true });
      setMessage("✅ Settings saved successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage("❌ Error saving settings");
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              ⚙️ Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Customize your StudyTrack experience
            </p>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.includes("✅")
                  ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                  : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
              }`}
            >
              {message}
            </div>
          )}

          {/* Theme Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              🎨 Appearance
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Dark Mode
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Toggle between light and dark theme
                  </p>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`px-6 py-2 rounded-lg font-medium transition ${
                    theme === "dark"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-900"
                  }`}
                >
                  {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
                </button>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              🔔 Notifications
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Email Notifications
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receive email updates about your tasks
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.emailNotifications}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      emailNotifications: e.target.checked,
                    })
                  }
                  className="w-6 h-6 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Daily Reminders
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get daily study reminders
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.dailyReminders}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      dailyReminders: e.target.checked,
                    })
                  }
                  className="w-6 h-6 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Weekly Report
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receive weekly progress summary
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.weeklyReport}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      weeklyReport: e.target.checked,
                    })
                  }
                  className="w-6 h-6 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              ℹ️ About
            </h2>

            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                <strong>StudyTrack</strong> - Your personal study management
                application
              </p>
              <p>
                <strong>Version:</strong> 1.0.0
              </p>
              <p>
                <strong>Features:</strong>
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Task management with priority levels</li>
                <li>Focus timer (Pomodoro)</li>
                <li>Study Statistics & Progress tracking</li>
                <li>Achievement badges system</li>
                <li>Study Goals & Targets</li>
                <li>Dark mode support</li>
                <li>Weekly planning view</li>
              </ul>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-8">
            <button
              onClick={handleSavePreferences}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 rounded-lg transition shadow-lg"
            >
              💾 Save All Settings
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
