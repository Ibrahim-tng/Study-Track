# 🚀 Guide de déploiement sur Vercel - StudyTrack

## ✅ Configuration Firebase déjà faite

Tes clés Firebase sont déjà configurées dans le projet ! Tu peux passer directement au déploiement.

## 📋 Étapes pour déployer sur Vercel

### Méthode 1 : Déploiement via l'interface Vercel (RECOMMANDÉ)

#### 1. Prépare ton projet sur GitHub

**A. Crée un repo GitHub**
1. Va sur https://github.com/new
2. Nom du repo : `studytrack`
3. Public ou Private (ton choix)
4. Clique "Create repository"

**B. Pousse ton code**
```bash
# Dans le dossier studytrack/
git init
git add .
git commit -m "Initial commit - StudyTrack app"
git branch -M main
git remote add origin https://github.com/TON_USERNAME/studytrack.git
git push -u origin main
```

#### 2. Déploie sur Vercel

1. Va sur https://vercel.com
2. Clique "Sign Up" (ou "Login" si tu as déjà un compte)
3. Connecte-toi avec **GitHub**
4. Clique "Add New Project"
5. Importe ton repo **studytrack**
6. Vercel détectera automatiquement Next.js

#### 3. Configure les variables d'environnement

**IMPORTANT : Dans l'interface Vercel, avant de déployer :**

1. Section "Environment Variables"
2. Ajoute ces 7 variables une par une :

```
NEXT_PUBLIC_FIREBASE_API_KEY = AIzaSyD5IJTvvYCizSSrBtPucdGLxFNX4BorUpo
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = portfolio-5e8e4.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID = portfolio-5e8e4
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = portfolio-5e8e4.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 977845140288
NEXT_PUBLIC_FIREBASE_APP_ID = 1:977845140288:web:e6fc2543ed3eeebfd1d8a5
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID = G-V3DDHH93S5
FIREBASE_CLIENT_EMAIL = firebase-adminsdk-fbsvc@portfolio-5e8e4.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY = "la_clé_privée_totale_avec_les_guillemets"
```

> [!IMPORTANT]
> **FIREBASE_PRIVATE_KEY** : Tu dois copier la clé complète incluant `-----BEGIN PRIVATE KEY-----` et `-----END PRIVATE KEY-----`. Sur Vercel, entoure la valeur de guillemets `"` pour préserver les retours à la ligne `\n`.

3. Pour chaque variable :
   - Name : copie le nom (ex: `NEXT_PUBLIC_FIREBASE_API_KEY`)
   - Value : copie la valeur (ex: `AIzaSyD5IJTvvYCizSSrBtPucdGLxFNX4BorUpo`)
   - Coche "Production", "Preview", et "Development"
   - Clique "Add"

#### 4. Déploie !

1. Clique "Deploy"
2. Attends 2-3 minutes
3. Ton app sera en ligne ! 🎉

Tu auras une URL comme : `https://studytrack-xxx.vercel.app`

---

### Méthode 2 : Déploiement via CLI Vercel

#### 1. Installe Vercel CLI

```bash
npm install -g vercel
```

#### 2. Connecte-toi

```bash
vercel login
```

#### 3. Déploie

```bash
# Depuis le dossier studytrack/
vercel
```

Suis les instructions :
- Set up and deploy? → `Y`
- Which scope? → Choisis ton compte
- Link to existing project? → `N`
- Project name? → `studytrack`
- Directory? → `./`
- Override settings? → `N`

#### 4. Ajoute les variables d'environnement

```bash
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
# Colle la valeur : AIzaSyD5IJTvvYCizSSrBtPucdGLxFNX4BorUpo
# Environnement : Production, Preview, Development

# Répète pour chaque variable :
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID
vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
vercel env add NEXT_PUBLIC_FIREBASE_APP_ID
vercel env add NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
vercel env add FIREBASE_CLIENT_EMAIL
vercel env add FIREBASE_PRIVATE_KEY
```

#### 5. Redéploie avec les variables

```bash
vercel --prod
```

---

## 🔧 Configuration Firebase pour la production

### 1. Ajoute le domaine Vercel à Firebase

1. Va dans Firebase Console → **Authentication**
2. Onglet **"Settings"** (Paramètres)
3. Section **"Authorized domains"** (Domaines autorisés)
4. Clique **"Add domain"**
5. Ajoute ton URL Vercel : `studytrack-xxx.vercel.app`
6. Clique **"Add"**

### 2. Configure les règles Firestore

1. Firebase Console → **Firestore Database**
2. Onglet **"Règles"**
3. Copie le contenu du fichier `firestore.rules`
4. Colle-le dans l'éditeur
5. Clique **"Publier"**

---

## ✅ Vérification post-déploiement

Une fois déployé :

1. Va sur ton URL Vercel
2. Teste l'inscription
3. Teste la connexion
4. Crée une matière
5. Crée une tâche
6. Vérifie les statistiques

---

## 🐛 Problèmes courants

### Erreur : Variables d'environnement non détectées
**Solution** : Redéploie après avoir ajouté les variables
```bash
vercel --prod --force
```

### Erreur : Domaine non autorisé
**Solution** : Ajoute ton domaine Vercel dans Firebase Console → Authentication → Authorized domains

### Erreur 500
**Solution** : Vérifie les logs
1. Dashboard Vercel → Ton projet → "Deployments"
2. Clique sur le dernier déploiement
3. Onglet "Functions" → Regarde les logs

---

## 📝 Commandes utiles

```bash
# Voir les déploiements
vercel ls

# Voir les logs en temps réel
vercel logs

# Voir les variables d'environnement
vercel env ls

# Supprimer un déploiement
vercel rm studytrack

# Déployer en production
vercel --prod
```

---

## 🎯 Domaine personnalisé (optionnel)

Si tu veux utiliser ton propre domaine :

1. Dashboard Vercel → Ton projet → "Settings" → "Domains"
2. Ajoute ton domaine
3. Configure les DNS selon les instructions
4. Ajoute ce domaine dans Firebase → Authentication → Authorized domains

---

## 🔐 Sécurité

⚠️ **IMPORTANT** :

1. **NE PARTAGE JAMAIS** tes clés Firebase publiquement
2. Les clés sont exposées côté client (c'est normal pour Firebase)
3. La sécurité vient des **règles Firestore** (déjà configurées)
4. Assure-toi que les règles Firestore sont bien déployées

---

## 📊 Monitoring

Dans le dashboard Vercel, tu peux voir :
- Nombre de visiteurs
- Performance de l'app
- Erreurs
- Logs en temps réel

---

**🎉 Ton app StudyTrack est maintenant en production !**

URL de ton app : À récupérer après le déploiement
