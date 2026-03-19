"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { BookOpen, User, Moon, Sun, LogOut } from "lucide-react";

export default function Navbar() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  const isActive = (path: string) => pathname === path;

  const navLinkClass = (path: string) =>
    `px-4 py-2 rounded-xl transition-all duration-300 font-bold ${isActive(path)
      ? "bg-primary-soft text-primary shadow-inner"
      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary dark:hover:text-primary-light"
    }`;

  return (
    <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-4 z-40 mx-4 mt-4 rounded-2xl border border-white/40 dark:border-slate-800/50 shadow-clay-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-premium rounded-xl flex items-center justify-center text-xl shadow-premium group-hover:scale-110 transition-transform">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent hidden sm:block">
                StudyTrack
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-2">
            {user && user.emailVerified ? (
              <>
                <Link href="/dashboard" className={navLinkClass("/dashboard")}>
                  Dashboard
                </Link>
                <Link href="/focus" className={navLinkClass("/focus")}>
                  Focus
                </Link>
                <Link href="/planning" className={navLinkClass("/planning")}>
                  Planning
                </Link>
                <Link href="/stats" className={navLinkClass("/stats")}>
                  Stats
                </Link>
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-2"></div>
                <button
                  onClick={toggleTheme}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-yellow-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95 shadow-sm"
                  title={theme === 'light' ? 'Activer mode sombre' : 'Activer mode clair'}
                >
                  {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                </button>
                <Link href="/profile" className="p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                  <div className="w-9 h-9 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center text-lg">
                    <User size={20} className="text-slate-600 dark:text-slate-300" />
                  </div>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="ml-2 text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 p-2 transition-colors"
                  title="Déconnexion"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : user ? (
              <>
                <button
                  onClick={toggleTheme}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-yellow-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                </button>
                <button
                  onClick={handleSignOut}
                  className="bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:text-red-400 px-4 py-2 rounded-xl transition-colors font-medium border border-red-200 dark:border-red-500/20"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium px-4 py-2 transition-colors">
                  Connexion
                </Link>
                <button
                  onClick={toggleTheme}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-yellow-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                </button>
                <Link
                  href="/signup"
                  className="btn-premium"
                >
                  Inscription
                </Link>
              </>
            )}
          </div>

          {/* Mobile Right Action Area */}
          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="w-11 h-11 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-yellow-400 active:scale-95 transition-all shadow-sm"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            {user && (
              <Link href="/profile" className="w-11 h-11 bg-slate-200 dark:bg-slate-800 rounded-xl flex items-center justify-center text-lg active:scale-95 transition-all shadow-sm">
                <User size={22} className="text-slate-600 dark:text-slate-300" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
