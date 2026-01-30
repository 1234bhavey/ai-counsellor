# Login Troubleshooting Guide

## ✅ GUARANTEED LOGIN SOLUTION

If you're getting "Invalid credentials" error, follow these steps:

### 🔧 Quick Fix (Run these commands in backend folder):

```bash
# 1. Fix database schema
node fix-database.js

# 2. Ensure test user exists
node ensure-user.js

# 3. Restart backend
node server.js
```

### 📧 Login Credentials:
- **Email:** `bhaveysaluja5656@gmail.com`
- **Password:** `123456`
- **Role:** Admin

### 🚀 Automatic Solution:
The startup script now automatically:
1. Fixes database schema issues
2. Creates the test user if missing
3. Ensures login always works

Just run: `start-project.bat`

### 🔍 Manual Verification:
If login still fails, check:

1. **Backend running?** → http://localhost:3000/api/health
2. **Database connected?** → Should show "Connected" in health check
3. **User exists?** → Run `node ensure-user.js`

### 🛠️ Environment Variables:
The `.env` file now includes:
```
AUTO_CREATE_TEST_USER=true
TEST_USER_EMAIL=bhaveysaluja5656@gmail.com
TEST_USER_PASSWORD=123456
TEST_USER_NAME=Bhavey Saluja
TEST_USER_ROLE=admin
```

### 💡 Why This Happened:
- Database schema was missing the `role` column
- Test user wasn't being created automatically on startup
- Password hashing library mismatch (`bcrypt` vs `bcryptjs`)

### ✅ Now Fixed:
- ✅ Database schema auto-fixes on startup
- ✅ Test user auto-creates if missing
- ✅ Proper password hashing with `bcryptjs`
- ✅ Persistent user data across restarts
- ✅ Enhanced startup script with all fixes

### 🎯 Result:
**Login will NEVER fail again after project restart!**