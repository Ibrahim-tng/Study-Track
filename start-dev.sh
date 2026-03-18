#!/bin/bash
# Quick test script for StudyTrack

cd "C:\Users\hp\Desktop\projet perso\studytrack-projet-fonctionnel\studytrack-final-complet"

echo "🧹 Cleaning build artifacts..."
if [ -d ".next" ]; then
  rm -rf .next
fi
if [ -d ".turbo" ]; then
  rm -rf .turbo
fi

echo "✅ Starting dev server..."
npm run dev -- --port 3000

