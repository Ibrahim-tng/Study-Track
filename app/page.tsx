"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Rediriger vers le dashboard si l'utilisateur est déjà connecté
  useEffect(() => {
    if (user && !loading) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20"></div>
        <div className="absolute inset-0 opacity-30 dark:opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 dark:bg-blue-400/10 text-primary dark:text-blue-400 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[12px] sm:text-sm font-bold mb-6 animate-fade-in">
              ✨ L&apos;app #1 pour les étudiants organisés
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight px-2">
              Organisez vos études avec{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block sm:inline">
                StudyTrack
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              L&apos;application de gestion de travail étudiant qui vous aide à suivre
              vos devoirs, révisions et examens en un seul endroit.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                🚀 Commencer gratuitement
              </Link>
              <Link
                href="/login"
                className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:border-primary dark:hover:border-blue-400 transition-all"
              >
                Se connecter
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Tout ce dont vous avez besoin
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Des outils puissants pour optimiser votre productivité et réussir vos études.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: "📚", title: "Gestion des matières", desc: "Organisez vos tâches par matière avec des couleurs personnalisées.", color: "from-blue-500/10 to-blue-600/10 dark:from-blue-500/20 dark:to-blue-600/20" },
            { icon: "✅", title: "Suivi des tâches", desc: "Ajoutez vos devoirs, révisions et examens. Cochez-les une fois terminés.", color: "from-green-500/10 to-green-600/10 dark:from-green-500/20 dark:to-green-600/20" },
            { icon: "📊", title: "Statistiques détaillées", desc: "Visualisez votre progression avec des graphiques et des indicateurs.", color: "from-purple-500/10 to-purple-600/10 dark:from-purple-500/20 dark:to-purple-600/20" },
            { icon: "🔥", title: "Streak de motivation", desc: "Maintenez votre série de jours consécutifs avec au moins une tâche complétée.", color: "from-orange-500/10 to-orange-600/10 dark:from-orange-500/20 dark:to-orange-600/20" },
            { icon: "📅", title: "Planning hebdomadaire", desc: "Visualisez toutes vos tâches à venir dans une vue planning claire.", color: "from-indigo-500/10 to-indigo-600/10 dark:from-indigo-500/20 dark:to-indigo-600/20" },
            { icon: "🎯", title: "Dashboard intuitif", desc: "Indicateurs visuels pour voir rapidement votre statut et votre progression.", color: "from-pink-500/10 to-pink-600/10 dark:from-pink-500/20 dark:to-pink-600/20" },
          ].map((feature, i) => (
            <div
              key={i}
              className={`bg-gradient-to-br ${feature.color} backdrop-blur-sm p-6 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group`}
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMCIgY3k9IjEwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L3N2Zz4=')] opacity-50"></div>
        <div className="relative max-w-4xl mx-auto text-center px-4 py-20">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
            Prêt à améliorer votre organisation ?
          </h2>
          <p className="text-xl mb-10 text-white/90">
            Rejoignez StudyTrack et prenez le contrôle de vos études dès
            aujourd&apos;hui.
          </p>
          <Link
            href="/signup"
            className="bg-white text-blue-600 px-10 py-4 rounded-xl text-lg font-bold hover:bg-gray-100 transition-all inline-block shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5"
          >
            Créer mon compte →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">📖 StudyTrack</h3>
              <p className="text-sm leading-relaxed">
                L&apos;application de gestion de travail étudiant pour organiser vos études et booster votre productivité.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Navigation</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/login" className="hover:text-white transition">Connexion</Link></li>
                <li><Link href="/signup" className="hover:text-white transition">Inscription</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition">Confidentialité</Link></li>
                <li><Link href="/terms" className="hover:text-white transition">CGU</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Fonctionnalités</h4>
              <ul className="space-y-2 text-sm">
                <li>Gestion des tâches</li>
                <li>Timer Pomodoro</li>
                <li>Statistiques & Progression</li>
                <li>Système de badges</li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-8 border-t border-gray-800 text-center text-sm">
            <p>© 2026 StudyTrack. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
