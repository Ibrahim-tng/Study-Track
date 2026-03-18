import { BADGES, BadgeId } from '@/types/badges';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export async function checkAndUnlockBadges(
  userId: string,
  stats: {
    completedTasks: number;
    currentStreak: number;
    focusSessions: number;
    tasksCompletedToday: number;
    tasksInSubject: { [key: string]: number };
    allWeeklyTasksCompleted?: boolean;
  }
): Promise<BadgeId[]> {
  const userDocRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userDocRef);
  const unlockedBadges: BadgeId[] = userDoc.data()?.unlockedBadges || [];

  const newBadges: BadgeId[] = [];

  // Vérifier chaque badge
  if (stats.completedTasks >= 1 && !unlockedBadges.includes('first_steps')) {
    newBadges.push('first_steps');
  }

  if (stats.currentStreak >= 7 && !unlockedBadges.includes('week_warrior')) {
    newBadges.push('week_warrior');
  }

  if (stats.currentStreak >= 30 && !unlockedBadges.includes('month_master')) {
    newBadges.push('month_master');
  }

  if (stats.completedTasks >= 50 && !unlockedBadges.includes('task_tamer')) {
    newBadges.push('task_tamer');
  }

  if (stats.focusSessions >= 100 && !unlockedBadges.includes('focus_master')) {
    newBadges.push('focus_master');
  }

  if (stats.allWeeklyTasksCompleted && !unlockedBadges.includes('perfect_week')) {
    newBadges.push('perfect_week');
  }

  if (
    Object.values(stats.tasksInSubject).some((count) => count >= 30) &&
    !unlockedBadges.includes('subject_expert')
  ) {
    newBadges.push('subject_expert');
  }

  if (stats.tasksCompletedToday >= 5 && !unlockedBadges.includes('speed_demon')) {
    newBadges.push('speed_demon');
  }

  // Mettre à jour Firestore si de nouveaux badges ont été débloqués
  if (newBadges.length > 0) {
    const updatedBadges = [...unlockedBadges, ...newBadges];
    const totalPoints = updatedBadges.reduce((sum, badgeId) => {
      return sum + (BADGES[badgeId]?.color ? getBadgePoints(badgeId) : 0);
    }, 0);

    const level = Math.floor(totalPoints / 100) + 1;

    await updateDoc(userDocRef, {
      unlockedBadges: updatedBadges,
      totalPoints,
      level,
    });
  }

  return newBadges;
}

function getBadgePoints(badgeId: BadgeId): number {
  const badge = BADGES[badgeId];
  const points: Record<'gold' | 'silver' | 'bronze' | 'platinum', number> = {
    bronze: 10,
    silver: 25,
    gold: 50,
    platinum: 100,
  };
  return points[badge.color];
}

export async function getUserBadges(userId: string) {
  const userDocRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userDocRef);
  return {
    unlockedBadges: userDoc.data()?.unlockedBadges || [],
    totalPoints: userDoc.data()?.totalPoints || 0,
    level: userDoc.data()?.level || 1,
  };
}
