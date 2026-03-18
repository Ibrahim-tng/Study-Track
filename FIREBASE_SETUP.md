# 🔥 Firebase Configuration Guide - StudyTrack

## ✅ Setup Checklist

### Step 1: Create Firebase Project
- [ ] Go to https://console.firebase.google.com/
- [ ] Click "Add Project"
- [ ] Enter project name (e.g., "StudyTrack")
- [ ] Accept terms and create project

### Step 2: Enable Authentication
- [ ] In Firebase Console → **Authentication**
- [ ] Click "Get Started"
- [ ] Click "Email/Password"
- [ ] Enable it
- [ ] Save

### Step 3: Create Firestore Database
- [ ] In Firebase Console → **Firestore Database**
- [ ] Click "Create Database"
- [ ] Select region (choose close to you or "us-central1")
- [ ] Choose **Production mode** (IMPORTANT!)
- [ ] Click "Enable"

### Step 4: Configure Firestore Rules
- [ ] In Firestore → **Rules** tab
- [ ] Delete default rules
- [ ] Paste this code:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Subjects collection
    match /subjects/{subjectId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // Tasks collection
    match /tasks/{taskId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // Focus sessions
    match /focusSessions/{sessionId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // Study goals
    match /goals/{goalId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

- [ ] Click "Publish"

### Step 5: Get Firebase Config Keys
- [ ] In Firebase Console → **Settings** (gear icon)
- [ ] Click **Project Settings**
- [ ] Scroll down to "Your apps"
- [ ] Click Web icon **</>** (or create if missing)
- [ ] Copy all values from the config object

### Step 6: Configure Environment Variables
- [ ] In your project root, create `.env.local` file
- [ ] Copy from `.env.example`:

```bash
cp .env.example .env.local
```

- [ ] Open `.env.local`
- [ ] Replace values with your Firebase config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyD...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=studytrack-abc123.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=studytrack-abc123
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=studytrack-abc123.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123def456
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABC123DEF
```

### Step 7: Verify Setup
- [ ] Save `.env.local`
- [ ] Restart development server (Ctrl+C, then `npm run dev`)
- [ ] Open http://localhost:3000
- [ ] Try signing up
- [ ] Check if user appears in Firebase Console → Authentication

---

## 🔍 Troubleshooting

### "Firebase initialization failed"
**Problem**: `.env.local` file not found or keys missing
**Solution**: 
1. Make sure `.env.local` exists in project root
2. Check all keys are filled (not "your_api_key_here")
3. Restart dev server

### "Permission denied" errors in console
**Problem**: Firestore rules not configured correctly
**Solution**:
1. Go to Firestore → Rules
2. Paste the rules from Step 4 above
3. Click "Publish"

### "User signup not working"
**Problem**: Authentication not enabled
**Solution**:
1. Go to Firebase → Authentication
2. Make sure Email/Password is enabled (green toggle)
3. Check authorized domains list

### Database empty in Firebase Console
**Problem**: Collections not appearing
**Solution**:
1. This is normal! Collections auto-create when you add first document
2. Create a task in the app → collection will appear in Firebase
3. This is expected behavior

### "Uncaught Error: Request failed with status code 401"
**Problem**: Authentication mismatch
**Solution**:
1. Sign out (click profile → Logout)
2. Sign up again with a new account
3. Reload page
4. Refresh Firestore console

---

## 📝 Required Collections & Fields

The app automatically creates these collections in Firestore:

### `users` collection
```
{
  id: "uid",
  name: "John",
  email: "john@example.com",
  createdAt: Timestamp,
  streak: 0,
  level: 0,
  totalPoints: 0,
  unlockedBadges: []
}
```

### `subjects` collection
```
{
  id: "auto-generated",
  userId: "uid",
  name: "Mathematics",
  color: "#3b82f6",
  createdAt: Timestamp
}
```

### `tasks` collection
```
{
  id: "auto-generated",
  userId: "uid",
  subjectId: "subject-id",
  title: "Math Homework",
  description: "Chapter 5 exercises",
  type: "Devoir",
  priority: "high",
  dueDate: Timestamp,
  plannedDuration: 60,
  completed: false,
  createdAt: Timestamp
}
```

### `focusSessions` collection
```
{
  id: "auto-generated",
  userId: "uid",
  taskId: "optional-task-id",
  duration: 25,
  type: "work",
  startedAt: Timestamp,
  completedAt: Timestamp
}
```

### `goals` collection
```
{
  id: "auto-generated",
  userId: "uid",
  period: "weekly",
  targetHours: 10,
  achievedHours: 5,
  startDate: Timestamp,
  endDate: Timestamp,
  completed: false,
  createdAt: Timestamp
}
```

---

## 🔒 Security Best Practices

✅ **What we did right**:
- Rules ensure users can only access their own data
- API keys are public (NEXT_PUBLIC prefix) - this is normal for web apps
- All sensitive operations require authentication
- Server-side validation in Firestore rules

⚠️ **For production**:
- Set Firestore to **Production mode** (not test mode)
- Configure authenticated domains in Firebase Console
- Set up backup & monitoring in Firebase Console
- Use Cloud Functions for complex logic
- Enable audit logging

---

## 🚀 After Setup Works

Once everything is configured:

1. **Test signup**: Create an account at `/signup`
2. **Verify email** at `/verify-email`
3. **Create task**: Dashboard → New task
4. **Check Firestore**: Console should show your data
5. **Try focus mode**: Dashboard → Focus button
6. **View stats**: Go to Stats page

---

## 📞 Help

If setup fails:
1. Check `.env.local` has correct values (no spaces!)
2. Verify Firestore rules are published
3. Make sure Email/Password auth is enabled
4. Check browser console for specific error messages
5. Try incognito/private window mode

**Contact**: Check Firebase Console error logs for exact error codes
