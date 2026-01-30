@echo off
echo 🧹 Cleaning up processes...
powershell -Command "Stop-Process -Name 'node' -Force -ErrorAction SilentlyContinue"
timeout /t 2 /nobreak >nul

echo 🔧 Fixing database schema if needed...
cd backend
node fix-database.js
echo.

echo 👤 Ensuring test user exists...
node ensure-user.js
echo.

echo 🎯 Populating shortlist for demo...
node populate-shortlist.js
echo.

echo 📝 Syncing tasks with shortlisted universities...
node sync-tasks-with-shortlist.js
echo.

echo 🔒 Safe database initialization (preserves user data)...
node safe-update-universities.js
echo.

echo 🚀 Starting AI Counsellor Project...
echo.

echo 📡 Starting Backend (Port 3000)...
start "Backend" cmd /k "npm run dev"
timeout /t 5 /nobreak >nul

echo 🌐 Starting Frontend (Port 3001)...
cd ../frontend
start "Frontend" cmd /k "npm run dev"

echo.
echo ✅ Project Started Successfully!
echo 📍 Frontend: http://localhost:3001
echo 📍 Backend:  http://localhost:3000
echo 📧 Login Email: bhaveysaluja5656@gmail.com
echo 🔐 Login Password: 123456
echo 👤 Role: User (Student)
echo.
echo 🔒 USER DATA: ALWAYS PRESERVED
echo 🏫 UNIVERSITY DATA: ENHANCED
echo 💡 LOGIN GUARANTEED: User auto-created on startup
echo 🎯 NAVIGATION: Dashboard, AI Counsellor, Universities, Shortlisted, Tasks
echo.
echo Press any key to exit...
pause >nul