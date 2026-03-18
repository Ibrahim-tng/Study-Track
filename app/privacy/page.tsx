"use client";

import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
        <Link href="/" className="text-primary hover:underline mb-8 inline-block">← Retour à l&apos;accueil</Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Politique de Confidentialité</h1>
        
        <div className="prose dark:prose-invert max-w-none space-y-6 text-gray-600 dark:text-gray-300">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">1. Introduction</h2>
            <p>
              Bienvenue sur StudyTrack. Nous attachons une grande importance à la protection de vos données personnelles. 
              Cette politique explique comment nous collectons, utilisons et protégeons vos informations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">2. Données collectées</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Informations de compte :</strong> Nom, adresse e-mail (via Firebase Authentication).</li>
              <li><strong>Données d&apos;utilisation :</strong> Tâches, matières, sessions de focus, objectifs que vous créez dans l&apos;application.</li>
              <li><strong>Informations techniques :</strong> Adresse IP, type de navigateur (via Vercel Analytics).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">3. Utilisation des données</h2>
            <p>Vos données sont utilisées exclusivement pour :</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Fournir les services de gestion de travail et statistiques.</li>
              <li>Améliorer l&apos;expérience utilisateur et les performances de l&apos;application.</li>
              <li>Sécuriser votre compte et prévenir la fraude.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">4. Partage des données</h2>
            <p>
              Nous ne vendons jamais vos données. Nous utilisons des services tiers de confiance pour le fonctionnement de l&apos;app :
              <strong> Firebase (Google)</strong> pour l&apos;hébergement et les données, et <strong>Vercel</strong> pour le déploiement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">5. Vos droits</h2>
            <p>
              Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression de vos données. 
              Vous pouvez supprimer votre compte directement depuis les paramètres de l&apos;application.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">6. Contact</h2>
            <p>Pour toute question : privacy@studytrack.app</p>
          </section>
        </div>
      </div>
    </div>
  );
}
