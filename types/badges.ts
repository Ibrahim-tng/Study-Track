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
    description: 'Terminez votre première tâche',
    icon: '🚀',
    color: 'bronze',
    requirement: '1 tâche terminée',
  },
  week_warrior: {
    id: 'week_warrior',
    title: 'Guerrier de la Semaine',
    description: 'Obtenez une série (streak) de 7 jours',
    icon: '⚔️',
    color: 'silver',
    requirement: 'Série de 7 jours',
  },
  month_master: {
    id: 'month_master',
    title: 'Maître du Mois',
    description: 'Obtenez une série (streak) de 30 jours',
    icon: '👑',
    color: 'gold',
    requirement: 'Série de 30 jours',
  },
  task_tamer: {
    id: 'task_tamer',
    title: 'Dompteur de Tâches',
    description: 'Terminez 50 tâches au total',
    icon: '🎯',
    color: 'silver',
    requirement: '50 tâches terminées',
  },
  focus_master: {
    id: 'focus_master',
    title: 'Maître de la Concentration',
    description: 'Réalisez 100 sessions de focus',
    icon: '🧠',
    color: 'gold',
    requirement: '100 sessions de focus',
  },
  perfect_week: {
    id: 'perfect_week',
    title: 'Semaine Parfaite',
    description: 'Terminez toutes vos tâches de la semaine',
    icon: '✨',
    color: 'platinum',
    requirement: 'Toutes les tâches hebdomadaires finies',
  },
  subject_expert: {
    id: 'subject_expert',
    title: 'Expert en Matière',
    description: 'Terminez 30 tâches dans une même matière',
    icon: '📚',
    color: 'silver',
    requirement: '30 tâches dans 1 matière',
  },
  speed_demon: {
    id: 'speed_demon',
    title: 'Démon de la Vitesse',
    description: 'Terminez 5 tâches en une seule journée',
    icon: '⚡',
    color: 'gold',
    requirement: '5 tâches en 1 jour',
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
