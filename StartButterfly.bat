@echo off
title Social Butterfly
cd /d "%~dp0"
where node >nul 2>nul || (echo Node.js is required - install it from nodejs.org, then run this again. & pause & exit /b 1)
if not exist node_modules (echo First-time setup, one minute... & call npm install & call npx playwright install chromium)
echo Starting the dashboard - your browser will open. Keep this window open.
call npm start
pause
