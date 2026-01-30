@echo off
echo 🧹 Cleaning up existing processes...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im nodemon.exe >nul 2>&1

echo ⏳ Waiting for cleanup...
timeout /t 3 /nobreak >nul

echo 🚀 Starting AI Counsellor Backend...
cd backend
npm run dev