@echo off
echo ===================================================
echo   Deploying Humsafar Web App to Firebase Hosting
echo ===================================================
echo.
cd /d "%~dp0"
echo 1. Building React Frontend...
call npm run build
echo.
echo 2. Uploading to Firebase Hosting...
call npx -y firebase-tools deploy --only hosting --project humsafar-trip-planner-2026
echo.
echo ===================================================
echo   Deployment Finished!
echo   Open: https://humsafar-trip-planner-2026.web.app
echo ===================================================
pause
