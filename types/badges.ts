export type BadgeId = 
  | 'first_steps'
  | 'week_warrior'
  | 'month_master'
  | 'task_tamer'
  | 'focus_master'
  | 'perfect_week'
  | 'subject_expert'
  | 'speed_demon';

export interface Badge {
  id: BadgeId;
  title: string;
  description: string;
  icon: string;
  color: 'gold' | 'silver' | 'bronze' | 'platinum';
  requirement: string;
  unlockedAt?: Date;
}

export const BADGES: Record<BadgeId, Omit<Badge, 'unlockedAt'>> = {
  first_steps: {
    id: 'first_steps',
    title: 'Premiers Pas',
    description: 'Complete your first task',
    icon: '🚀',
    color: 'bronze',
    requirement: '1 task completed',
  },
  week_warrior: {
    id: 'week_warrior',
    title: 'Guerrier de la Semaine',
    description: 'Obtenez une streak de 7 jours',
    icon: '⚔️',
    color: 'silver',
    requirement: '7-day streak',
  },
  month_master: {
    id: 'month_master',
    title: 'Master of the Month',
    description: 'Get a 30-day streak',
    icon: '👑',
    color: 'gold',
    requirement: '30-day streak',
  },
  task_tamer: {
    id: 'task_tamer',
    title: 'Task Master',
    description: 'Complete 50 tasks',
    icon: '🎯',
    color: 'silver',
    requirement: '50 tasks completed',
  },
  focus_master: {
    id: 'focus_master',
    title: 'Focus Master',
    description: 'Complete 100 focus sessions',
    icon: '🧠',
    color: 'gold',
    requirement: '100 focus sessions',
  },
  perfect_week: {
    id: 'perfect_week',
    title: 'Perfect Week',
    description: 'Complete all weekly tasks',
    icon: '✨',
    color: 'platinum',
    requirement: 'Complete all weekly tasks',
  },
  subject_expert: {
    id: 'subject_expert',
    title: 'Subject Expert',
    description: 'Complete 30 tasks in one subject',
    icon: '📚',
    color: 'silver',
    requirement: '30 tasks in 1 subject',
  },
  speed_demon: {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Complete 5 tasks in one day',
    icon: '⚡',
    color: 'gold',
    requirement: '5 tasks in 1 day',
  },
};

export interface UserBadges {
  unlockedBadges: BadgeId[];
  totalPoints: number;
  level: number;
}

// Calculer le nombre de points par badge basé sur sa couleur
export const getBadgePoints = (color: Badge['color']): number => {
  const points: Record<Badge['color'], number> = {
    bronze: 10,
    silver: 25,
    gold: 50,
    platinum: 100,
  };
  return points[color];
};
