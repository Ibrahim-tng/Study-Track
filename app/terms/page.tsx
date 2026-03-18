"use client";

import Link from "next/link";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
        <Link href="/" className="text-primary hover:underline mb-8 inline-block">← Retour à l&apos;accueil</Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Conditions Générales d&apos;Utilisation</h1>
        
        <div className="prose dark:prose-invert max-w-none space-y-6 text-gray-600 dark:text-gray-300">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">1. Acceptation des conditions</h2>
            <p>
              En accédant à StudyTrack, vous acceptez d&apos;être lié par les présentes conditions d&apos;utilisation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">2. Description du service</h2>
            <p>
              StudyTrack est une plateforme de gestion de travail étudiant. Le service est fourni &quot;tel quel&quot; sans garantie de disponibilité permanente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">3. Responsabilité de l&apos;utilisateur</h2>
            <p>
              Vous êtes responsable de la sécurité de votre compte et de la confidentialité de vos identifiants. 
              Toute utilisation abusive du service (tentative de piratage, spam de l&apos;IA) pourra entraîner la suspension du compte.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">4. Utilisation de l&apos;IA</h2>
            <p>
              StudyTrack utilise des technologies d&apos;intelligence artificielle pour son coach. 
              Les réponses peuvent contenir des erreurs. Vous devez toujours vérifier les informations importantes par vous-même.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">5. Modifications</h2>
            <p>
              Nous nous réservons le droit de modifier ces conditions à tout moment. La poursuite de l&apos;utilisation du service 
              après modification vaut acceptation.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
