# 🚀 Guide de Déploiement Sécurisé - StudyTrack

**Version:** 1.0  
**Mise à jour:** 16 Mars 2026

---

## ✅ Pré-Déploiement: Checklist de Sécurité

### 1. Préparation Locale

#### Tests de Build
```bash
# Vérifier que le projet compile
npm run build

# Vérifier qu'il n'y a pas d'erreurs TypeScript
npm run lint

# Nettoyer les dépendances de dev
npm prune --production
```

#### Vérification des Fichiers
```bash
# Vérifier que .env.local n'est PAS versionné
git status

# Vérifier que .gitignore inclut les fichiers sensibles
cat .gitignore
```

#### Audit de Sécurité
```bash
# Vérifier les dépendances
npm audit --omit=dev

# Lister les dépendances
npm list --depth=0
```

### 2. Vérification des Variables d'Environnement

#### Sur la Machine Locale
```bash
# Créer .env.local depuis le template
cp .env.example .env.local

# Remplir les vraies valeurs Firebase
# NE PAS COMMITTER CE FICHIER
echo ".env.local" >> .gitignore
```

#### Sur le Serveur de Déploiement
```bash
# Vercel
vercel env pull .env.local

# Ou définir manuellement dans la console Vercel:
# Settings → Environment Variables
```

### 3. Vérification des Configurations

#### next.config.ts
```typescript
✅ reactStrictMode: true
✅ Headers de sécurité présents
✅ ESLint dirs configuré
```

#### tsconfig.json
```json
✅ "strict": true
✅ "noUnusedLocals": true
✅ "noUnusedParameters": true
```

#### firestore.rules
```
✅ Production mode activé
✅ Règles d'authentification en place
✅ Règles par collection testées
```

### 4. Vérification Firebase

```bash
# Vérifier les règles
firebase rules:test firestore.rules

# Déployer les règles
firebase deploy --only firestore:rules

# Vérifier les indexes
firebase deploy --only firestore:indexes

# Vérifier la configuration
firebase apps:list
```

---

## 🟢 Déploiement sur Vercel

### Via CLI

```bash
# 1. Installer Vercel CLI globalement
npm i -g vercel

# 2. Se connecter à Vercel
vercel login

# 3. Vérifier la configuration
cat vercel.json

# 4. Déployer
vercel --prod
```

### Via GitHub (Recommandé)

```bash
# 1. Pousser le code vers GitHub
git add .
git commit -m "security: Applied security hardening"
git push origin main

# 2. Vercel se redéploie automatiquement
# Vérifier le déploiement sur https://vercel.com
```

### Variables d'Environnement sur Vercel

```bash
# 1. Aller sur https://vercel.com/account/projects
# 2. Sélectionner le projet
# 3. Settings → Environment Variables
# 4. Ajouter les variables:

NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
```

---

## 🔍 Post-Déploiement: Vérifications

### 1. Headers de Sécurité

Ouvrir DevTools (F12) et vérifier:

```bash
# Dans l'onglet Network
# Sélectionner une requête
# Vérifier Response Headers:

X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
```

### 2. SSL/TLS

```bash
# Vérifier HTTPS
curl -I https://your-domain.com
# Doit avoir: HTTP/2 200

# Vérifier le certificat
openssl s_client -connect your-domain.com:443
```

### 3. Performance

```bash
# Tester la vitesse
# https://pagespeed.web.dev/
# Viser: > 90 score
```

### 4. Fonctionnalités Sécurité

```bash
# Teste les formulaires:
# 1. Signup avec email invalide → Erreur
# 2. Signup avec password faible → Erreur
# 3. Login 6 fois → Blocage rate limiting
# 4. Vérification email → Fonctionne
```

### 5. Monitoring

```bash
# Vérifier Google Analytics
# https://analytics.google.com/

# Vérifier les logs
# Vercel: Dashboard → Logs
# Firebase: Console → Logs
```

---

## 🚨 Bonnes Pratiques de Déploiement

### Avant le Déploiement

1. **Migration en Préparation (Staging)**
   ```bash
   # Créer une branche de staging
   git checkout -b deploy/prod
   
   # Tester completement
   npm run build
   npm run lint
   npm audit
   
   # Merger vers main
   git push origin deploy/prod
   # Créer Pull Request
   ```

2. **Backup Firebase**
   ```bash
   firebase firestore backup
   ```

3. **Communication**
   - Informer les utilisateurs
   - Prévoir une fenêtre de maintenance

### Pendant le Déploiement

1. **Monitoring**
   - Vérifier les logs Vercel
   - Vérifier les logs Firebase
   - Surveiller les erreurs

2. **Rollback Préparé**
   ```bash
   # Avoir la version précédente prête
   git tag previous-version
   git checkout previous-version
   vercel --prod
   ```

### Après le Déploiement

1. **Tests Complets**
   - [ ] Signup/ Login
   - [ ] Tous les formulaires
   - [ ] Rate limiting fonctionne
   - [ ] Emails de vérification envoyés

2. **Performance**
   - [ ] Temps de chargement OK
   - [ ] Pas de console errors
   - [ ] Pas de warnings

3. **Sécurité**
   - [ ] Headers présents
   - [ ] HTTPS actif
   - [ ] Pas de données sensibles exposées

---

## 📋 Procédure de Déploiement Complète

### Jour du Déploiement

```bash
# 1. Dernier build local
npm run build
npm run lint

# 2. Vérifier les changements
git diff

# 3. Commit et tag
git add .
git commit -m "security: v1.0 security hardening release"
git tag -a v1.0-security -m "Security hardening release"

# 4. Push
git push origin main
git push origin v1.0-security

# 5. Vérifier Vercel
# → https://vercel.com/deployments

# 6. Tester sur https://your-domain.com
# → Vérifier tous les formulaires
# → Vérifier rate limiting
# → Vérifier les headers
```

### En Cas de Problème

```bash
# 1. Vérifier les logs
vercel logs --prod

# 2. Vérifier les variables d'env
vercel env:list

# 3. Vérifier la configuration
cat vercel.json
cat next.config.ts

# 4. Rebuild
vercel rebuild

# 5. Rollback si nécessaire
git revert <commit-id>
git push
```

---

## 🔒 Déploiement sur D'autres Plateformes

### Docker (Self-Hosted)

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
# Build et run
docker build -t studytrack:latest .
docker run -e NEXT_PUBLIC_FIREBASE_API_KEY=... -p 3000:3000 studytrack:latest
```

### Railway, Render, etc.

```bash
# Connecter le repo GitHub
# Settings → Environment Variables
# Ajouter les variables Firebase
# Déployer automatiquement
```

---

## ⚙️ Configuration HTTPS Obligatoire

### Vercel (Automatique)
- ✅ SSL/TLS gratuit
- ✅ Auto-renew
- ✅ Certificats wildcard

### Serveur Auto-Hébergé

```bash
# Avec Let's Encrypt + Nginx
certbot certonly --standalone -d your-domain.com
certbot renew --dry-run
```

```nginx
# Nginx config
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # Headers de sécurité
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
}
```

---

## 📊 Monitoring Post-Déploiement

### 1. Erreurs et Exceptions
```bash
# Firebase Console
# → Logging → Errors

# Vercel Dashboard
# → Logs → Errors
```

### 2. Performance
```bash
# Google PageSpeed Insights
https://pagespeed.web.dev/

# WebPageTest
https://www.webpagetest.org/
```

### 3. Sécurité
```bash
# SecurityHeaders.com
https://securityheaders.com/

# Scott Helme Tools
https://securityheaders.com/
```

### 4. Uptime
```bash
# Pingdom, StatusCake, ou UptimeRobot
```

---

## 🔄 Rollback Procedure

En cas de problème après déploiement:

```bash
# 1. Identifier le commit précédent
git log --oneline -n 5

# 2. Revert le dernier commit
git revert HEAD
git push

# 3. Vercel se redéploie automatiquement

# 4. Vérifier que tout fonctionne
# Puis investiguer le problème

# 5. Fixer et redéployer
git commit -am "fix: [issue description]"
git push
```

---

## 📞 Support & Assistance

### En Cas de Problème

1. **Vérifier les Logs**
   ```bash
   vercel logs --prod
   firebase logs
   ```

2. **Vérifier les Variables d'Env**
   ```bash
   vercel env --prod
   ```

3. **Tester Localement**
   ```bash
   npm run dev
   # Reproduire le problème
   ```

4. **Contacter Support**
   - Vercel: https://vercel.com/help
   - Firebase: https://firebase.google.com/support
   - GitHub: Issues

---

**Derni Mise à Jour:** 16 Mars 2026  
**Prochaine Révision:** Q2 2026

