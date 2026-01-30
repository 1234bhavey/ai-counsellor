# Google OAuth Setup Guide

## Overview
This guide explains how to set up Google OAuth authentication for the AI Counsellor application.

## Prerequisites
1. Google Cloud Console account
2. Project with OAuth 2.0 credentials

## Setup Steps

### 1. Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable Google+ API and Gmail API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Configure OAuth consent screen
6. Add authorized redirect URIs:
   - `http://localhost:3001/auth/google/callback` (development)
   - `https://yourdomain.com/auth/google/callback` (production)

### 2. Environment Variables
Add to your `.env` file:
```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

### 3. Backend Implementation
The backend routes are ready to handle Google OAuth. Install required packages:
```bash
npm install passport passport-google-oauth20 express-session
```

### 4. Frontend Implementation
The login and register pages include Google OAuth buttons that will redirect to:
- `/auth/google` - Initiates Google OAuth flow
- `/auth/google/callback` - Handles OAuth callback

## Current Status
- ✅ Frontend UI components ready
- ✅ Backend route structure prepared
- ⏳ Google OAuth integration (requires Google Cloud setup)
- ✅ Email OTP placeholder ready

## Admin Access Key
For admin login, use the admin access key: `ADMIN2026_BHAVE_SECURE_KEY_XYZ789`

## Features Implemented
1. **Admin/User Login Toggle** - Switch between student and admin login
2. **Admin Access Key** - Special key for admin account creation
3. **Email Masking** - Shows beginning and end of email (e.g., `bh****ja@gmail.com`)
4. **Notifications** - Login/logout success messages
5. **Dynamic Chat Window** - Expands based on message count (max 80% of viewport)
6. **Google OAuth Ready** - UI components ready for OAuth integration

## Next Steps
1. Set up Google Cloud Console project
2. Configure OAuth credentials
3. Add Google Client ID/Secret to environment
4. Test OAuth flow
5. Implement email OTP verification (optional)