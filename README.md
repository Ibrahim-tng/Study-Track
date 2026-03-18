# 📚 StudyTrack - Application de Gestion de Travail Étudiant

Application web moderne pour gérer vos devoirs, révisions et examens avec suivi de progression et statistiques détaillées.

## ✨ Fonctionnalités

- 🔐 **Authentification complète** (inscription, connexion, déconnexion)
- 📚 **Gestion des matières** avec couleurs personnalisées
- ✅ **Gestion des tâches** (devoirs, révisions, examens, projets)
- 📊 **Dashboard interactif** avec indicateurs verts/rouges
- 📅 **Planning hebdomadaire** avec vue calendrier
- 📈 **Statistiques détaillées** avec graphiques Chart.js
- 🔥 **Système de streak** pour la motivation
- 📱 **Design responsive** mobile/tablet/desktop

## 🛠 Stack Technique

- **Frontend**: Next.js 15 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore)
- **Graphiques**: Chart.js + react-chartjs-2
- **Dates**: date-fns

## 📋 Prérequis

- Node.js 18+ et npm
- Un compte Firebase (gratuit)

## 🚀 Installation

### 1. Cloner/télécharger le projet

```bash
cd studytrack
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration Firebase

#### a) Créer un projet Firebase

1. Aller sur https://console.firebase.google.com/
2. Cliquer sur "Ajouter un projet"
3. Suivre les étapes (nom du projet, analytics optionnel)

#### b) Activer les services Firebase

**Authentication:**
1. Dans la console Firebase, aller dans "Authentication"
2. Cliquer sur "Commencer"
3. Activer "Email/Password" comme méthode de connexion

**Firestore Database:**
1. Dans la console Firebase, aller dans "Firestore Database"
2. Cliquer sur "Créer une base de données"
3. Choisir "Commencer en mode test" (temporaire)
4. Sélectionner une région proche de vous

#### c) Récupérer les clés de configuration

1. Dans la console Firebase, aller dans "Paramètres du projet" (icône engrenage)
2. Dans l'onglet "Général", descendre jusqu'à "Vos applications"
3. Cliquer sur l'icône `</>` pour créer une application web
4. Donner un nom à votre app (ex: "StudyTrack")
5. Copier les valeurs de configuration affichées

#### d) Configurer les variables d'environnement

Créer un fichier `.env.local` à la racine du projet :

```bash
cp .env.example .env.local
```

Éditer `.env.local` et remplacer par vos vraies valeurs :

```env
NEXT_PUBLIC_FIREBASE_API_KEY=votre_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=votre_projet.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=votre_projet_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=votre_projet.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=votre_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=votre_app_id
```

#### e) Configurer les règles Firestore

1. Dans Firestore Database, aller dans l'onglet "Règles"
2. Copier le contenu du fichier `firestore.rules`
3. Le coller dans l'éditeur
4. Cliquer sur "Publier"

### 4. Lancer l'application

Mode développement :

```bash
npm run dev
```

L'application sera accessible sur http://localhost:3000

## 📦 Build et déploiement

### Build de production

```bash
npm run build
npm start
```

### Déploiement sur Firebase Hosting

#### 1. Installer Firebase CLI

```bash
npm install -g firebase-tools
```

#### 2. Se connecter à Firebase

```bash
firebase login
```

#### 3. Initialiser Firebase Hosting

```bash
firebase init hosting
```

Répondre aux questions :
- What do you want to use as your public directory? → `out`
- Configure as a single-page app? → `Yes`
- Set up automatic builds? → `No`

#### 4. Modifier `next.config.ts`

Ajouter la configuration pour l'export statique :

```typescript
const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
};
```

#### 5. Build et déploiement

```bash
npm run build
firebase deploy
```

Votre app sera en ligne sur `https://votre-projet.web.app`

## 📂 Structure du projet

```
studytrack/
├── app/                      # Pages Next.js (App Router)
│   ├── page.tsx             # Page d'accueil
│   ├── login/               # Page de connexion
│   ├── signup/              # Page d'inscription
│   ├── dashboard/           # Dashboard principal
│   ├── planning/            # Vue planning
│   ├── stats/               # Page statistiques
│   ├── layout.tsx           # Layout principal
│   └── globals.css          # Styles globaux
├── components/              # Composants React réutilisables
│   ├── Navbar.tsx           # Barre de navigation
│   ├── ProtectedRoute.tsx   # Protection des routes
│   ├── StatCard.tsx         # Carte de statistique
│   └── TaskCard.tsx         # Carte de tâche
├── hooks/                   # Hooks React personnalisés
│   └── useAuth.ts           # Hook d'authentification
├── lib/                     # Logique métier
│   ├── firebase.ts          # Configuration Firebase
│   └── firestore/           # Fonctions Firestore
│       ├── users.ts         # Gestion des utilisateurs
│       ├── subjects.ts      # Gestion des matières
│       └── tasks.ts         # Gestion des tâches
├── types/                   # Types TypeScript
│   └── index.ts             # Interfaces et types
├── utils/                   # Utilitaires
│   └── streak.ts            # Calcul du streak
├── firestore.rules          # Règles de sécurité Firestore
├── .env.example             # Exemple de variables d'environnement
└── package.json             # Dépendances
```

## 🗄 Structure de la base de données Firestore

### Collection `users`
```typescript
{
  name: string,
  email: string,
  createdAt: Timestamp,
  streak: number
}
```

### Collection `subjects`
```typescript
{
  userId: string,
  name: string,
  color: string,           // Code hex (ex: "#3b82f6")
  createdAt: Timestamp
}
```

### Collection `tasks`
```typescript
{
  userId: string,
  subjectId: string,
  title: string,
  description: string,
  type: "Devoir" | "Révision" | "Examen" | "Projet",
  dueDate: Timestamp,
  plannedDuration: number, // en minutes
  completed: boolean,
  completedAt?: Timestamp,
  createdAt: Timestamp
}
```

## 🎨 Personnalisation

### Modifier les couleurs

Éditer `tailwind.config.ts` :

```typescript
colors: {
  primary: "#3b82f6",    // Bleu
  success: "#10b981",    // Vert
  warning: "#f59e0b",    // Orange
  danger: "#ef4444",     // Rouge
}
```

### Ajouter de nouveaux types de tâches

Éditer `types/index.ts` :

```typescript
export type TaskType = "Devoir" | "Révision" | "Examen" | "Projet" | "NouveauType";
```

## 🐛 Dépannage

### Erreur "Firebase not initialized"
- Vérifier que le fichier `.env.local` existe et contient les bonnes clés
- Redémarrer le serveur de développement

### Erreur de permissions Firestore
- Vérifier que les règles Firestore sont bien configurées
- Vérifier que l'utilisateur est bien connecté

### Problème d'installation des dépendances
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📝 Licence

Ce projet est open source et disponible sous licence MIT.

## 👤 Auteur

Développé avec fun par votre B.I.T

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

---

**Bon développement ! 🚀**
