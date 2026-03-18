'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useBadges } from '@/hooks/useBadges';
import BadgesDisplay from '@/components/BadgesDisplay';
import { useEffect } from 'react';

export default function BadgesPage() {
  const { user, loading: authLoading } = useAuth();
  const { badges, loading: badgesLoading } = useBadges();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || badgesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⚙️</div>
          <p className="text-gray-600 dark:text-gray-400">Chargement de vos badges...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            🏆 Badges et Récompenses
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Unlock badges by achieving objectives
          </p>
        </div>

        <BadgesDisplay {...badges} />
      </div>
    </main>
  );
}
