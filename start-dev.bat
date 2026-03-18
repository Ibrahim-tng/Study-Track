@echo off
REM Quick Verify Script for StudyTrack

cd "C:\Users\hp\Desktop\projet perso\studytrack-projet-fonctionnel\studytrack-final-complet"

echo.
echo ========================================
echo   StudyTrack Dev Server - Quick Start
echo ========================================
echo.

echo [1/3] Checking project files...
if exist "package.json" (
    echo     ✅ package.json found
) else (
    echo     ❌ package.json NOT found
    exit /b 1
)

echo [2/3] Checking .env.local...
if exist ".env.local" (
    echo     ✅ .env.local found
) else (
    echo     ⚠️  .env.local NOT found - config may be missing
)

echo [3/3] Starting dev server...
echo.
echo     Starting: npm run dev
echo     Access: http://localhost:3000
echo.
echo ========================================
echo   Press Ctrl+C to stop server
echo ========================================
echo.

call npm run dev

pause
