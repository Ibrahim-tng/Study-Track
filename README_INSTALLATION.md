# 🚀 STUDYTRACK - PROJET COMPLET ET FONCTIONNEL

## ✅ CE QUI EST INCLUS

Ce projet Next.js contient TOUTES les fonctionnalités :

- ✅ **Authentification complète** (inscription, connexion, déconnexion)
- ✅ **Page Profil** (`/profile`) avec changement email/mot de passe et suppression compte
- ✅ **Vérification email** obligatoire à l'inscription
- ✅ **Dashboard** avec statistiques
- ✅ **Gestion tâches et matières** (CRUD complet)
- ✅ **Planning hebdomadaire** avec vue calendrier
- ✅ **Statistiques** avec graphiques Chart.js
- ✅ **Mode Focus** (Pomodoro timer)
- ✅ **Responsive mobile** (menu hamburger + classes adaptatives)
- ✅ **Calcul du streak**

## 📦 INSTALLATION (3 ÉTAPES)

### Étape 1 : Installer les dépendances

```bash
npm install
```

### Étape 2 : Configurer Firebase

**Créer `.env.local` à la racine du projet :**

```env
NEXT_PUBLIC_FIREBASE_API_KEY=votre_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=votre_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=votre_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=votre_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=votre_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=votre_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=votre_measurement_id
```

**Obtenir ces valeurs :**
1. Va sur https://console.firebase.google.com/
2. Crée un projet ou utilise un existant
3. Project Settings → General → Your apps → Web
4. Copie toutes les valeurs

### Étape 3 : Configuration Firebase

**A. Activer Authentication**
1. Firebase Console → **Authentication**
2. Sign-in method → **E-mail/Mot de passe** → Activer

**B. Créer Firestore**
1. Firebase Console → **Firestore Database**
2. Créer une base de données → Mode **Production**
3. Déployer les règles (voir section ci-dessous)

**C. Règles Firestore**

Firebase Console → Firestore → Règles → Copie-colle :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /subjects/{subjectId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    match /tasks/{taskId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    match /focusSessions/{sessionId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
  }
}
```

Clique **"Publier"**.

## 🚀 LANCER L'APPLICATION

```bash
npm run dev
```

Ouvre http://localhost:3000

## 🧪 TESTER LES FONCTIONNALITÉS

1. **Inscription** : `/signup` → Crée un compte
2. **Vérification email** : Vérifie ta boîte mail → Clique sur le lien
3. **Dashboard** : `/dashboard` → Accès après vérification email
4. **Profil** : `/profile` → Toutes les actions fonctionnent
5. **Tâches** : Crée, modifie, supprime des tâches
6. **Matières** : Crée, modifie, supprime des matières
7. **Planning** : `/planning` → Vue hebdomadaire
8. **Stats** : `/stats` → Graphiques Chart.js
9. **Focus** : `/focus` → Timer Pomodoro

## 📱 TEST RESPONSIVE

1. Ouvre DevTools (F12)
2. Active le mode responsive
3. Teste sur iPhone/iPad/Desktop
4. Vérifie le menu hamburger sur mobile

## 🔐 SÉCURITÉ

- ✅ Routes protégées (redirection si non authentifié)
- ✅ Email vérifié obligatoire pour accéder au dashboard
- ✅ Règles Firestore strictes (chaque user = ses données uniquement)
- ✅ Ré-authentification pour actions sensibles

## 📁 STRUCTURE DU PROJET

```
studytrack/
├── app/                    # Pages Next.js
│   ├── dashboard/          # Page principale
│   ├── profile/            # Page profil (NOUVEAU)
│   ├── verify-email/       # Vérification email (NOUVEAU)
│   ├── login/              # Connexion
│   ├── signup/             # Inscription
│   ├── planning/           # Planning hebdomadaire
│   ├── stats/              # Statistiques
│   └── focus/              # Mode Focus
├── components/             # Composants React
│   ├── Navbar.tsx          # Navigation responsive
│   ├── ProtectedRoute.tsx  # Protection routes
│   ├── TaskCard.tsx        # Card de tâche
│   └── ...
├── lib/                    # Logique métier
│   ├── firebase.ts         # Config Firebase
│   └── firestore/          # Fonctions Firestore
├── hooks/                  # Custom hooks
│   └── useAuth.ts          # Hook auth
├── types/                  # Types TypeScript
└── utils/                  # Utilitaires
```

## 🎯 FONCTIONNALITÉS DÉTAILLÉES

### 1. Authentication
- Inscription avec email/password
- Email de vérification automatique
- Connexion sécurisée
- Déconnexion
- Protection des routes

### 2. Profil Utilisateur (`/profile`)
- Affichage des informations
- Changement de mot de passe (email de reset)
- Changement d'email (avec ré-authentification)
- Suppression de compte (+ toutes les données)

### 3. Dashboard
- Statistiques : Total tâches, % complétées, en retard, streak
- Liste des matières avec couleurs
- Liste des tâches (avec filtres)
- Boutons d'action rapides

### 4. Gestion Tâches
- Créer (titre, description, type, date, durée)
- Modifier
- Supprimer (avec confirmation)
- Compléter (checkbox)
- Types : Devoir, Révision, Examen, Projet

### 5. Gestion Matières
- Créer (nom + couleur personnalisée)
- Affichage avec couleur
- Supprimer (avec confirmation)

### 6. Planning Hebdomadaire
- Vue calendrier 7 jours
- Navigation semaine précédente/suivante
- Tâches groupées par jour
- Indication "Aujourd'hui"

### 7. Statistiques
- Graphique complétion (7 derniers jours)
- Graphique par matière (pie chart)
- Graphique temps travaillé
- Tableau détaillé

### 8. Mode Focus (Pomodoro)
- Timer 25 minutes
- Pause 5 minutes
- Sélection de tâche
- Enregistrement des sessions

### 9. Responsive Design
- Mobile-first
- Menu hamburger sur mobile
- Grilles adaptatives
- Boutons accessibles
- Textes adaptés

## 🆘 DÉPANNAGE

**Erreur "Module not found"** :
```bash
rm -rf node_modules package-lock.json
npm install
```

**Erreur Firebase** :
→ Vérifie que `.env.local` contient les bonnes valeurs

**Page blanche** :
→ Ouvre la console (F12) pour voir l'erreur

**Email non reçu** :
→ Vérifie les spams
→ Attends 2-3 minutes
→ Utilise "Renvoyer l'email"

**Erreur "requires-recent-login"** :
→ Déconnecte-toi et reconnecte-toi

## 📞 SUPPORT

Pour toute question ou problème :
1. Vérifie que Firebase est bien configuré (Auth + Firestore)
2. Vérifie que les règles Firestore sont déployées
3. Vérifie la console navigateur (F12) pour voir les erreurs
4. Vérifie que `.env.local` existe et contient les bonnes valeurs

## 🎉 RÉSULTAT

Un projet StudyTrack complet et fonctionnel avec :
- ✅ Toutes les pages
- ✅ Toutes les fonctionnalités
- ✅ 100% responsive
- ✅ Sécurisé
- ✅ Prêt pour production

**Temps d'installation : 10-15 minutes**

Bon développement ! 🚀
