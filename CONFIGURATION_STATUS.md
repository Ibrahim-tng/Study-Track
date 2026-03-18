# ✅ Firebase Configuration Checklist

## Erreurs Corrigées

### ✅ Fixed: React Hook Error
- **Fichier**: `components/StudyGoals.tsx`
- **Problème**: useEffect dependency missing `loadGoals`
- **Solution**: Utilisé `useCallback` pour corriger la dépendance
- **Status**: ✅ FIXED

### ✅ Fixed: Missing Firestore Rules
- **Fichier**: `firestore.rules`
- **Problème**: Collection `goals` manquante
- **Solution**: Ajouté règles pour collection goals
- **Status**: ✅ FIXED

### ⚠️ Missing: Environment Configuration
- **Fichier**: `.env.local`
- **Problème**: Firebase keys non configurées
- **Solution**: Voir "Setup Instructions" ci-dessous

---

## 🚀 Setup Instructions (3 étapes)

### 1️⃣ Créer `.env.local`

```bash
cp .env.example .env.local
```

### 2️⃣ Remplir avec vos clés Firebase

Ouvre `.env.local` et remplace:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=votre_clé
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=votre_projet.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=votre_projet_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=votre_projet.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=votre_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=votre_app_id
```

**Où trouver ces valeurs?**
1. Va sur https://console.firebase.google.com/
2. Sélectionne ton projet
3. Settings (⚙️) → Project Settings
4. Copie les valeurs de config

### 3️⃣ Déployer les Firestore Rules

1. Va su Firestore Database → Rules tab
2. Copie le contenu de `firestore.rules`
3. Colle dans l'éditeur Firebase
4. Clique "Publish"

---

## 📋 Vérification Firebase

### Checklist Authentication
- [ ] Email/Password enabled dans Firebase Console
- [ ] `.env.local` rempli avec les bonnes clés
- [ ] App peut signer up/login

### Checklist Firestore
- [ ] Database en mode **Production**
- [ ] Rules sont publiées
- [ ] Collection `goals` supportée (✅ ajouté)
- [ ] Utilisateur voit ses données

### Checklist Code
- [ ] Pas d'erreurs TypeScript (✅ corrigé)
- [ ] StudyGoals component compile (✅ corrigé)
- [ ] Firestore calls fonctionnent

---

## 🧪 Test Quick

```bash
# 1. Restart dev server
npm run dev

# 2. Go to http://localhost:3000
# 3. Click "Sign Up"
# 4. Create account
# 5. Check Firebase Console → Authentication
# 6. User should appear!
```

---

## 📁 Files Updated

✅ `components/StudyGoals.tsx` - Fixed useCallback hook
✅ `firestore.rules` - Added goals collection rules
✅ `.env.example` - Created template
✅ `FIREBASE_SETUP.md` - Full setup guide

---

## 🆘 Si ça ne marche pas

### Erreur: "Firebase initialization failed"
→ Vérifier `.env.local` a les bonnes clés (pas "your_api_key_here")

### Erreur: "Permission denied" Firestore
→ Aller à Firestore → Rules → Vérifier les rules sont publiées

### User affiche pas après signup
→ Vérifier Authentication est enabled dans Firebase Console

### Dev server crash au démarrage
→ Redémarrer: `Ctrl+C` puis `npm run dev`

---

## 💡 Next Steps

1. ✅ Corriger erreurs (DONE)
2. ⏳ Remplir `.env.local`
3. ⏳ Publier Firestore rules
4. 🧪 Tester signup/login
5. 🚀 Utiliser l'app!
