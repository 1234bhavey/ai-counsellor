@echo off
echo 🔄 Restarting AI Counsellor Services...

echo 🛑 Stopping existing processes...
powershell -Command "Stop-Process -Name 'node' -Force -ErrorAction SilentlyContinue"
timeout /t 3 /nobreak >nul

echo 🔧 Ensuring database and user setup...
cd backend
node fix-database.js
node ensure-user.js

echo 🚀 Starting Backend...
start "AI Counsellor Backend" cmd /k "node server.js"
timeout /t 5 /nobreak >nul

echo 🌐 Starting Frontend...
cd ../frontend
start "AI Counsellor Frontend" cmd /k "npm run dev"

echo ✅ Services Restarted!
echo 📍 Frontend: http://localhost:3001
echo 📍 Backend:  http://localhost:3000
echo 📧 Email:    bhaveysaluja5656@gmail.com
echo 🔑 Password: 123456
echo 👤 Role:     User (Student)
echo 🎯 Navigation: Dashboard, AI Counsellor, Universities, Shortlisted, Tasks

pause