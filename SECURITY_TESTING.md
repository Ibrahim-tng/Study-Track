# 🧪 Guide de Test - Vérifications Sécurité

**Date:** 16 Mars 2026  
**Objectif:** Valider que toutes les corrections de sécurité fonctionnent correctement

---

## ✅ Étapes de Validation

### 1. Nettoyage et Build

```bash
# Supprimer le cache de build
Remove-Item -Path .next -Recurse -Force -ErrorAction SilentlyContinue

# Nettoyer npm cache (optionnel)
npm cache clean --force

# Réinstaller les dépendances (si nécessaire)
npm ci

# Tester le lint
npm run lint

# Tester la compilation
npm run build
```

### 2. Tests Locaux

```bash
# Démarrer le serveur de développement
npm run dev

# Visiter http://localhost:3000
```

### 3. Tester la Page d'Inscription

#### ✅ Test 1: Email Invalide
- [ ] Entrer: `test` (pas d'@)
- [ ] Résultat: ❌ Message d'erreur "Format d'email invalide"

#### ✅ Test 2: Password Faible
- [ ] Entrer: `test123` (pas de majuscule)
- [ ] Résultat: ❌ Message "Le mot de passe doit contenir au moins une majuscule."

#### ✅ Test 3: Password Sans Chiffre
- [ ] Entrer: `testTest` (pas de chiffre)
- [ ] Résultat: ❌ Message "Le mot de passe doit contenir au moins un chiffre."

#### ✅ Test 4: Password Trop Court
- [ ] Entrer: `Tt123` (5 caractères)
- [ ] Résultat: ❌ Message "Le mot de passe doit contenir au moins 8 caractères."

#### ✅ Test 5: Passwords Non Identiques
- [ ] Password: `TestPass123`
- [ ] Confirmer: `TestPass124`
- [ ] Résultat: ❌ Message "Les mots de passe ne correspondent pas"

#### ✅ Test 6: Signup Réussi
- [ ] Nom: `Jean Dupont`
- [ ] Email: `test@example.com`
- [ ] Password: `SecurePass123`
- [ ] Confirmer: `SecurePass123`
- [ ] Résultat: ✅ Redirection vers `/verify-email`

### 4. Tester la Page de Connexion

#### ✅ Test 1: Email Invalide
- [ ] Entrer: `notanemail`
- [ ] Résultat: ❌ Message "Veuillez entrer une adresse email valide."

#### ✅ Test 2: Tentative Échouée 1-4
- [ ] Email/Password incorrect
- [ ] Résultat: ✅ Message d'erreur + Compteur visible

#### ✅ Test 3: Tentative 5 - Blocage
- [ ] 5ème tentative
- [ ] Résultat: ❌ Formulaire bloqué, message "Trop de tentatives. Réessayez dans 15 minute(s)."
- [ ] Résultat: ❌ Champs email/password désactivés

#### ✅ Test 4: Rate Limit Reset
- [ ] Attendre 15 minutes OU effacer localStorage
- [ ] Résultat: ✅ Formulaire débloqué

### 5. Vérifier les Headers de Sécurité

#### Vérification dans DevTools

```bash
# 1. Ouvrir DevTools (F12)
# 2. Aller à Network tab
# 3. Recharger la page (F5)
# 4. Cliquer sur la première requête (document)
# 5. Aller à Response Headers
```

#### Headers À Vérifier ✅
- [ ] `X-Content-Type-Options: nosniff` - Présent
- [ ] `X-Frame-Options: DENY` - Présent
- [ ] `X-XSS-Protection: 1; mode=block` - Présent

### 6. Vérifier TypeScript Strict Mode

```bash
# Créer un fichier de test avec erreur TypeScript
echo 'const x: string = 123;' > test.ts

# Lancer le lint
npm run lint

# ❌ Doit afficher une erreur de type
```

```bash
# Supprimer le fichier de test
Remove-Item test.ts
```

### 7. Vérifier ESLint

```bash
# Lancer le lint
npm run lint

# Doit afficher des avertissements/erreurs si présentes
# (ne doit pas être ignoré)
```

---

## 🐛 Troubleshooting

### Build Échoue avec "Unterminated regexp literal"

```bash
# Solution: Vérifier le fichier app/login/page.tsx
# Ne doit pas avoir de code dupliqué à la fin
```

### TypeScript Errors Après Build

```bash
# Vérifier tsconfig.json
# "strict": true doit être activé

# Nettoyer et rebuilder
Remove-Item .next -Recurse -Force -ErrorAction SilentlyContinue
npm run build
```

### Rate Limiting Ne Fonctionne Pas

```bash
# Vérifier que localStorage est activé
# Vérifier la console (F12) pour errors JavaScript
# Nettoyer localStorage: localStorage.clear()
```

### Security Headers Absents

```bash
# Vérifier next.config.ts
# La section "headers" doit être présente
# Redémarrer le serveur: npm run dev
```

---

## 📊 Checklist Finale

- [ ] `npm run build` passe sans erreurs
- [ ] `npm run lint` passe ou n'ignore pas les erreurs
- [ ] Signup: Validation email fonctionne ✅
- [ ] Signup: Validation password fonctionne ✅
- [ ] Login: Rate limiting bloque après 5 tentatives ✅
- [ ] Headers de sécurité présents dans DevTools ✅
- [ ] TypeScript strict mode actif ✅
- [ ] Firebase authentication fonctionne ✅
- [ ] Email de vérification reçu ✅
- [ ] Pas de console errors/warnings critiques ✅

---

## 🚀 Après Validation

Si tous les tests passent:

```bash
# 1. Commiter les changements
git add -A
git commit -m "security: Applied comprehensive security hardening"

# 2. Pousser vers production
git push origin main

# 3. Vercel se redéploie automatiquement
```

---

## 📞 Support

En cas de problème:

1. Vérifier la console (F12)
2. Vérifier les logs: `npm run build 2>&1 | tail -50`
3. Lire SECURITY_DEPLOYMENT.md
4. Contacter l'équipe support

---

**Bon Testing! 🎉**
