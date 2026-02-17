# 🚀 Guide de démarrage rapide - StudyTrack

## Installation en 5 minutes

### 1️⃣ Installer les dépendances
```bash
npm install
```

### 2️⃣ Créer un projet Firebase

1. Aller sur https://console.firebase.google.com/
2. Créer un nouveau projet
3. Activer **Authentication** (Email/Password)
4. Activer **Firestore Database** (mode test)

### 3️⃣ Configurer les variables d'environnement

Créer `.env.local` avec vos clés Firebase :

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4️⃣ Configurer les règles Firestore

Dans Firebase Console > Firestore > Règles, copier le contenu de `firestore.rules` et publier.

### 5️⃣ Lancer l'application

```bash
npm run dev
```

Ouvrir http://localhost:3000

## ✅ Checklist de vérification

- [ ] Node.js 18+ installé
- [ ] Dépendances npm installées
- [ ] Projet Firebase créé
- [ ] Authentication activée (Email/Password)
- [ ] Firestore activé
- [ ] Variables d'environnement configurées (.env.local)
- [ ] Règles Firestore déployées
- [ ] Application lancée sur localhost:3000

## 🎯 Premiers pas

1. Créer un compte sur la page d'inscription
2. Ajouter votre première matière
3. Créer votre première tâche
4. Cocher la tâche une fois terminée
5. Voir vos statistiques évoluer !

## 🆘 Besoin d'aide ?

Consultez le README.md complet pour des instructions détaillées.
