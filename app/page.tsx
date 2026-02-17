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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Organisez vos études avec{" "}
            <span className="text-primary">StudyTrack</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            L'application de gestion de travail étudiant qui vous aide à suivre
            vos devoirs, révisions et examens en un seul endroit.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-primary text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-600 transition shadow-lg"
            >
              Commencer gratuitement
            </Link>
            <Link
              href="/login"
              className="bg-white text-primary border-2 border-primary px-8 py-3 rounded-lg text-lg font-medium hover:bg-primary hover:text-white transition"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-bold mb-2">Gestion des matières</h3>
            <p className="text-gray-600">
              Organisez vos tâches par matière avec des couleurs personnalisées.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">✅</div>
            <h3 className="text-xl font-bold mb-2">Suivi des tâches</h3>
            <p className="text-gray-600">
              Ajoutez vos devoirs, révisions et examens. Cochez-les une fois
              terminés.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2">Statistiques détaillées</h3>
            <p className="text-gray-600">
              Visualisez votre progression avec des graphiques et des
              indicateurs.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">🔥</div>
            <h3 className="text-xl font-bold mb-2">Streak de motivation</h3>
            <p className="text-gray-600">
              Maintenez votre série de jours consécutifs avec au moins une tâche
              complétée.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-xl font-bold mb-2">Planning hebdomadaire</h3>
            <p className="text-gray-600">
              Visualisez toutes vos tâches à venir dans une vue planning claire.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-bold mb-2">Dashboard intuitif</h3>
            <p className="text-gray-600">
              Indicateurs verts/rouges pour voir rapidement votre statut.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">
            Prêt à améliorer votre organisation ?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Rejoignez StudyTrack et prenez le contrôle de vos études dès
            aujourd'hui.
          </p>
          <Link
            href="/signup"
            className="bg-white text-primary px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-100 transition inline-block shadow-lg"
          >
            Créer mon compte
          </Link>
        </div>
      </section>
    </div>
  );
}
