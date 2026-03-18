# 🎨 Nouvelles Fonctionnalités - Thèmes et Badges

## 📋 Résumé des changements

Deux nouvelles fonctionnalités majeures ont été intégrées à StudyTrack:

### 1. 🎨 Système de Thème (Dark/Light Mode)
### 2. 🏆 Système de Badges et Récompenses

---

## 🎨 Système de Thème (Dark/Light Mode)

### 📂 Fichiers créés/modifiés

| Fichier | Type | Description |
|---------|------|-------------|
| `context/ThemeContext.tsx` | ✨ Nouveau | Context et hook pour gérer le thème |
| `tailwind.config.ts` | 📝 Modifié | Activation du mode sombre avec classe CSS |
| `app/globals.css` | 📝 Modifié | Styles dark mode pour tous les éléments |
| `app/layout.tsx` | 📝 Modifié | Ajout du ThemeProvider au niveau root |
| `components/Navbar.tsx` | 📝 Modifié | Ajout du bouton toggle thème |

### 🚀 Fonctionnalités

- **Basculement automatique**: Détecte la préférence système (light/dark)
- **Persistance**: Sauvegarde la préférence utilisateur dans localStorage
- **Transition fluide**: Animations douces au changement de thème
- **Couverture complète**: Tous les composants supportent dark mode

### 💻 Utilisation

```typescript
'use client';
import { useTheme } from '@/context/ThemeContext';

export function MonComposant() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}
```

### 🎯 Classe Tailwind

```html
<!-- Styles spécifiques au dark mode -->
<div class="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  Contenu adapté au thème
</div>
```

---

## 🏆 Système de Badges et Récompenses

### 📂 Fichiers créés/modifiés

| Fichier | Type | Description |
|---------|------|-------------|
| `types/badges.ts` | ✨ Nouveau | Types et définitions des badges |
| `lib/badges.ts` | ✨ Nouveau | Logique de déblocage des badges |
| `hooks/useBadges.ts` | ✨ Nouveau | Hook pour charger les badges utilisateur |
| `components/BadgeCard.tsx` | ✨ Nouveau | Composant pour afficher un badge |
| `components/BadgesDisplay.tsx` | ✨ Nouveau | Affichage complet des badges et stats |
| `components/MiniBadges.tsx` | ✨ Nouveau | Mini-affichage pour le dashboard |
| `app/badges/page.tsx` | ✨ Nouveau | Page badges dédiée |
| `types/index.ts` | 📝 Modifié | Ajout champs badges à l'interface User |
| `app/dashboard/page.tsx` | 📝 Modifié | Intégration MiniBadges |

### 🏆 Badges Disponibles

| Badge | Icône | Description | Points |
|-------|-------|-------------|--------|
| Premiers Pas | 🚀 | Complétez votre 1ère tâche | 10 |
| Guerrier de la Semaine | ⚔️ | Streak de 7 jours | 25 |
| Maître du Mois | 👑 | Streak de 30 jours | 50 |
| Dompteur de Tâches | 🎯 | 50 tâches complétées | 25 |
| Maître du Focus | 🧠 | 100 sessions de focus | 50 |
| Semaine Parfaite | ✨ | Toutes tâches de la semaine complétées | 100 |
| Expert en Matière | 📚 | 30 tâches dans une seule matière | 25 |
| Démon de Vitesse | ⚡ | 5 tâches en une seule journée | 50 |

### 🎯 Système de Niveaux

- **Points**: Chaque badge débloqué donne des points
- **Niveaux**: Un nouveau niveau tous les 100 points
- **Progression**: Barre de progression vers le prochain niveau visible

### 💾 Données Firestore

Les données suivantes sont stockées pour chaque utilisateur:

```typescript
{
  unlockedBadges: string[];      // IDs des badges débloqués
  totalPoints: number;           // Points totaux accumulés
  level: number;                 // Niveau actuel (calculé à partir des points)
  preferredTheme: 'light' | 'dark';  // Thème préféré
}
```

### 🔍 Vérification Automatique

Les badges sont vérifiés automatiquement quand:
- Une tâche est completée
- Le streak augmente
- Une session focus se termine
- Les statistiques sont mises à jour

### 🚀 Utilisation

#### 1. Afficher tous les badges

```typescript
import BadgesDisplay from '@/components/BadgesDisplay';
import { useBadges } from '@/hooks/useBadges';

export function MesRecompenses() {
  const { badges } = useBadges();
  return <BadgesDisplay {...badges} />;
}
```

#### 2. Afficher les badges récents (dashboard)

```typescript
import MiniBadges from '@/components/MiniBadges';
import { useBadges } from '@/hooks/useBadges';

export function Dashboard() {
  const { badges } = useBadges();
  return <MiniBadges unlockedBadges={badges.unlockedBadges} limit={4} />;
}
```

#### 3. Vérifier et débloquer des badges

```typescript
import { checkAndUnlockBadges } from '@/lib/badges';

const stats = {
  completedTasks: 15,
  currentStreak: 7,
  focusSessions: 50,
  tasksCompletedToday: 3,
  tasksInSubject: { "Math": 10, "French": 8 },
};

const newBadges = await checkAndUnlockBadges(userId, stats);
console.log('Nouveaux badges débloqués:', newBadges);
```

---

## 📱 Pages Principales

### `/badges`
- Page dédiée aux badges et récompenses
- Affiche tous les badges (débloqués et à débloquer)
- Affiche le niveau et les points totaux
- Barre de progression jusqu'au prochain niveau

### `/dashboard`
- Intègre miniature des badges récents
- Lien rapide vers la page complète des badges

---

## 🎨 Personnalisation

### Ajouter un nouveau badge

1. Ajouter le type à `BadgeId` dans `types/badges.ts`
2. Ajouter la définition dans `BADGES` 
3. Ajouter la logique de déblocage dans `checkAndUnlockBadges()`

```typescript
export const BADGES: Record<BadgeId, ...> = {
  mon_badge: {
    id: 'mon_badge',
    title: 'Mon Badge',
    description: 'Description',
    icon: '🎉',
    color: 'gold',
    requirement: 'Condition',
  },
};
```

### Modifier les couleurs du thème

Éditer `tailwind.config.ts`:

```typescript
extend: {
  colors: {
    primary: "#3b82f6",
    // Ajouter vos couleurs...
  },
}
```

---

## 📊 Exemple complet

```typescript
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useBadges } from '@/hooks/useBadges';
import { useTheme } from '@/context/ThemeContext';
import BadgesDisplay from '@/components/BadgesDisplay';

export default function AchievementsPage() {
  const { user } = useAuth();
  const { badges, loading } = useBadges();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="bg-white dark:bg-gray-900">
        <button onClick={toggleTheme}>
          Changer vers {theme === 'light' ? 'dark' : 'light'} mode
        </button>
        
        <BadgesDisplay {...badges} />
      </div>
    </div>
  );
}
```

---

## ✅ Installation et Intégration

### Dépendances
Aucune nouvelle dépendance requise - les fonctionnalités utilisent:
- React 18.3+
- Next.js 15+
- Tailwind CSS 3.4+
- Firebase 11+

### Prochaines étapes

1. **Tester le système de thème**
   ```bash
   npm run dev
   ```
   - Cliquer sur le bouton 🌙/☀️ dans la Navbar
   - Vérifier que le thème change en temps réel

2. **Tester le système de badges**
   - Créer des tâches et les compléter
   - Naviguer vers `/badges` pour voir les badges disponibles
   - Vérifier que les badges se débloquent automatiquement

3. **Vérifier la persistance**
   - Changer de thème et recharger la page
   - La préférence doit être conservée

---

## 🐛 Troubleshooting

### Le thème ne change pas
- Vérifier que ThemeProvider est bien au niveau root dans `layout.tsx`
- Vérifier que `darkMode: "class"` est dans `tailwind.config.ts`

### Les badges ne s'affichent pas
- Vérifier que l'utilisateur a la structure correcte dans Firestore
- S'assurer que `checkAndUnlockBadges()` est appelée au bon moment

### Styles dark mode incomplets
- Vérifier que toutes les classes Tailwind utilisent les modificateurs `dark:`
- Utiliser `dark:bg-*`, `dark:text-*`, etc.

---

## 📝 Checklist d'intégration

- [x] ThemeContext créé et intégré
- [x] Dark mode supporté par Tailwind
- [x] Styles globals mis à jour
- [x] Navbar avec toggle thème
- [x] Types badges créés
- [x] Logique badges implémentée
- [x] Composants badges créés
- [x] Page badges créée
- [x] Dashboard intégré avec Mini-badges
- [x] StatCard mise à jour pour dark mode
- [x] Documentation complète

---

## 🔄 Prochaines améliorations possibles

- Notifications quand un badge est débloqué
- Animation spéciale pour les badges nouvellement débloqués
- Partage des badges sur les réseaux sociaux
- Son de déblocage pour les badges
- Badges saisonniers ou à durée limitée
- Classement des utilisateurs par niveau
- Système de défis quotidiens/hebdomadaires
