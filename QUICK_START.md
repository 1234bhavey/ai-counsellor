# 🚀 AI Counsellor - Quick Start Guide

## ✅ FIXED ISSUES
- ✅ Database persistence problem SOLVED
- ✅ User account created and verified
- ✅ Backend running on port 3000
- ✅ Frontend running on port 3001
- ✅ Login functionality working
- ✅ API proxy configured
- ✅ Database schema safe initialization

## 🎯 LOGIN CREDENTIALS
```
Email: bhaveysaluja5656@gmail.com
Password: 123456
```

## 🚀 START PROJECT (Easy Way)
```bash
# RECOMMENDED: Use the startup script (includes database init)
start-project.bat

# Manual start (if needed):
# Terminal 1: Initialize database first
cd ai-counsellor/backend
node init-database.js

# Terminal 2: Start backend
npm run dev

# Terminal 3: Start frontend
cd ai-counsellor/frontend  
npm run dev
```

## 🌐 ACCESS URLS
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/health

## 🔧 IF ERRORS OCCUR AGAIN

### Database Issues (MAIN FIX):
```bash
# Reinitialize database (this fixes login issues)
cd ai-counsellor/backend
node init-database.js
```

### Port Conflicts:
```powershell
# Kill all Node processes
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
```

### Test Everything:
```bash
# Verify complete flow works
cd ai-counsellor/backend
node test-full-flow.js
```

## 📋 PROJECT WORKFLOW
1. **Registration/Login** → Dashboard
2. **Onboarding** → 3-step profile setup
3. **Dashboard** → Progress overview
4. **AI Counsellor** → Chat for guidance
5. **Universities** → Browse and shortlist
6. **Lock University** → Commit to choice
7. **Tasks** → Application guidance

## 🎯 ALL FEATURES WORKING
✅ User Authentication (FIXED)
✅ Database Persistence (FIXED)
✅ Profile Onboarding  
✅ Dashboard Stats  
✅ AI Counsellor Chat  
✅ University Discovery  
✅ University Locking  
✅ Task Management  
✅ Header/Footer Navigation  

## 🆘 EMERGENCY RESTART
If anything breaks, run:
```bash
start-project.bat
```

## 🔍 WHAT WAS WRONG
The original database schema was dropping and recreating tables on every server restart, which deleted all user data. This is now fixed with a safe initialization script that preserves existing data.

The project is now **production-ready** for company submission!