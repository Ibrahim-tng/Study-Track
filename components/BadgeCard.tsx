'use client';

import { Badge } from '@/types/badges';

interface BadgeCardProps {
  badge: Badge;
  unlocked: boolean;
}

export default function BadgeCard({ badge, unlocked }: BadgeCardProps) {
  const colorClasses = {
    gold: 'bg-yellow-50 border-yellow-300 dark:bg-yellow-900/20 dark:border-yellow-700',
    silver: 'bg-gray-50 border-gray-300 dark:bg-gray-800 dark:border-gray-600',
    bronze: 'bg-orange-50 border-orange-300 dark:bg-orange-900/20 dark:border-orange-700',
    platinum: 'bg-blue-50 border-blue-300 dark:bg-blue-900/20 dark:border-blue-700',
  };

  const textColorClasses = {
    gold: 'text-yellow-700 dark:text-yellow-300',
    silver: 'text-gray-700 dark:text-gray-300',
    bronze: 'text-orange-700 dark:text-orange-300',
    platinum: 'text-blue-700 dark:text-blue-300',
  };

  return (
    <div
      className={`p-4 rounded-lg border-2 transition-all ${colorClasses[badge.color]} ${
        !unlocked && 'opacity-50'
      }`}
    >
      <div className="text-center">
        <div className="text-4xl mb-2">{badge.icon}</div>
        <h3 className={`font-bold text-sm ${textColorClasses[badge.color]}`}>
          {badge.title}
        </h3>
        <p className="text-xs opacity-75 mt-1 text-gray-600 dark:text-gray-400">{badge.description}</p>
        {unlocked && (
          <div className="mt-2 text-xs font-semibold text-green-600 dark:text-green-400">
            Débloqué ✓
          </div>
        )}
        {!unlocked && (
          <div className="mt-2 text-xs opacity-60">{badge.requirement}</div>
        )}
      </div>
    </div>
  );
}
