'use client';

import { BadgeId, BADGES } from '@/types/badges';
import Link from 'next/link';
import { Trophy, ArrowRight } from 'lucide-react';

interface MiniBadgesProps {
  unlockedBadges: BadgeId[];
  limit?: number;
}

export default function MiniBadges({ unlockedBadges, limit = 4 }: MiniBadgesProps) {
  const recentBadges = unlockedBadges.slice(-limit);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Récents Badges <Trophy size={20} className="inline-block text-yellow-500 ml-1" />
        </h3>
        <Link
          href="/badges"
          className="text-sm text-primary dark:text-blue-400 hover:underline"
        >
          Voir tous <ArrowRight size={14} className="inline-block ml-1" />
        </Link>
      </div>

      {recentBadges.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Débloquez des badges en atteignant vos objectifs
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {recentBadges.map((badgeId) => {
            const badge = BADGES[badgeId];
            return (
              <div
                key={badgeId}
                className="flex items-center space-x-2 p-2 rounded bg-gray-100 dark:bg-gray-700"
              >
                <span className="text-xl">{badge.icon}</span>
                <div>
                  <p className="text-xs font-semibold text-gray-900 dark:text-white">
                    {badge.title}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
