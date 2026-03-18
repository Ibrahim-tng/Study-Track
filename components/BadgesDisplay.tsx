'use client';

import { BADGES, BadgeId } from '@/types/badges';
import BadgeCard from './BadgeCard';

interface BadgesDisplayProps {
  unlockedBadges: BadgeId[];
  totalPoints: number;
  level: number;
}

export default function BadgesDisplay({
  unlockedBadges,
  totalPoints,
  level,
}: BadgesDisplayProps) {
  const progressToNextLevel = ((totalPoints % 100) / 100) * 100;

  return (
    <div className="space-y-6">
      {/* Niveau et Points */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-700 dark:to-purple-700 rounded-lg p-6 text-white">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-3xl font-bold">Niveau {level}</h2>
            <p className="text-blue-100">Total: {totalPoints} points</p>
          </div>
          <div className="text-4xl">🏆</div>
        </div>

        {/* Barre de progression */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Prochain niveau</span>
            <span>{Math.floor(totalPoints % 100)}/100</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
            <div
              className="bg-white h-full transition-all duration-300"
              style={{ width: `${progressToNextLevel}%` }}
            />
          </div>
        </div>
      </div>

      {/* Statistiques des badges */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-700">
          <div className="text-3xl font-bold text-primary">{unlockedBadges.length}</div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Badges</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-700">
          <div className="text-3xl font-bold text-warning">{totalPoints}</div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Points</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-700">
          <div className="text-3xl font-bold text-success">{Object.keys(BADGES).length - unlockedBadges.length}</div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Verrouillés</p>
        </div>
      </div>

      {/* Grille de badges */}
      <div>
        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          Tous les Badges
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(BADGES).map(([_, badge]) => (
            <BadgeCard
              key={badge.id}
              badge={{ ...badge, unlockedAt: undefined }}
              unlocked={unlockedBadges.includes(badge.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
