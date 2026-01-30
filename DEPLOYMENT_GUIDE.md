# 🚀 AI Counsellor - Deployment Guide

## Quick Deployment Options

### Option 1: Vercel (Frontend) + Railway (Backend + DB)
1. **Frontend (Vercel)**:
   - Push code to GitHub
   - Connect Vercel to your repo
   - Deploy frontend automatically

2. **Backend + Database (Railway)**:
   - Create Railway account
   - Deploy PostgreSQL database
   - Deploy Node.js backend
   - Update environment variables

### Option 2: Heroku (Full Stack)
1. Create Heroku apps for frontend and backend
2. Add PostgreSQL addon
3. Configure environment variables
4. Deploy both applications

### Option 3: Local Demo Setup
```bash
# Backend
cd ai-counsellor/backend
npm install
npm run db:setup
npm run dev

# Frontend (new terminal)
cd ai-counsellor/frontend
npm install
npm run dev
```

## Environment Variables for Production
```env
# Update these for production deployment
NODE_ENV=production
DB_HOST=your-production-db-host
DB_PASSWORD=your-production-db-password
CORS_ORIGIN=https://your-frontend-domain.com
```

## Demo Video Script
1. **Landing Page** (10s) - Show clean design and value proposition
2. **Registration** (15s) - Quick signup process
3. **Onboarding** (30s) - Complete 3-step profile setup
4. **Dashboard** (20s) - Show progress indicators and stats
5. **AI Counsellor** (45s) - Demonstrate intelligent conversations
6. **Universities** (30s) - Browse, filter, shortlist universities
7. **University Locking** (20s) - Show commitment feature
8. **Application Guidance** (20s) - Display to-dos and timeline

Total: ~3 minutes (perfect length)