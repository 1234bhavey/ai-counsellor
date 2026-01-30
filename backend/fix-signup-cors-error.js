const fs = require('fs');
const path = require('path');

async function fixSignupCorsError() {
  console.log('🔧 Fixing Signup CORS Error\n');
  
  try {
    // 1. Read current server.js file
    console.log('1️⃣ Reading current server.js configuration...');
    const serverPath = path.join(__dirname, 'server.js');
    let serverContent = fs.readFileSync(serverPath, 'utf8');
    
    // 2. Update CORS configuration to include port 3002
    console.log('2️⃣ Updating CORS configuration...');
    
    const oldCorsConfig = `app.use(cors({
  origin: [
    'http://localhost:3001',
    'http://localhost:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));`;

    const newCorsConfig = `app.use(cors({
  origin: [
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3002',
    'http://127.0.0.1:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));`;

    // Replace the CORS configuration
    if (serverContent.includes(oldCorsConfig)) {
      serverContent = serverContent.replace(oldCorsConfig, newCorsConfig);
      console.log('✅ CORS configuration updated to include port 3002');
    } else {
      // If exact match not found, try to find and replace the CORS section
      const corsRegex = /app\.use\(cors\(\{[\s\S]*?\}\)\);/;
      if (corsRegex.test(serverContent)) {
        serverContent = serverContent.replace(corsRegex, newCorsConfig);
        console.log('✅ CORS configuration updated (regex replacement)');
      } else {
        console.log('⚠️  Could not find CORS configuration to update');
      }
    }
    
    // 3. Write updated server.js
    fs.writeFileSync(serverPath, serverContent);
    console.log('✅ server.js file updated');
    
    // 4. Also update frontend axios configuration to handle port 3002
    console.log('\n3️⃣ Checking frontend axios configuration...');
    const userContextPath = path.join(__dirname, '../frontend/src/context/UserContext.jsx');
    
    if (fs.existsSync(userContextPath)) {
      let userContextContent = fs.readFileSync(userContextPath, 'utf8');
      
      // Ensure axios base URL is correct
      if (userContextContent.includes("axios.defaults.baseURL = 'http://localhost:3000';")) {
        console.log('✅ Frontend axios configuration is correct');
      } else {
        // Update axios configuration
        userContextContent = userContextContent.replace(
          /axios\.defaults\.baseURL = ['"][^'"]*['"];/,
          "axios.defaults.baseURL = 'http://localhost:3000';"
        );
        fs.writeFileSync(userContextPath, userContextContent);
        console.log('✅ Frontend axios configuration updated');
      }
    }
    
    // 5. Test the register endpoint directly
    console.log('\n4️⃣ Testing register endpoint...');
    const axios = require('axios');
    
    try {
      const testEmail = `test.cors.fix.${Date.now()}@example.com`;
      const response = await axios.post('http://localhost:3000/api/auth/register', {
        name: 'Test CORS Fix User',
        email: testEmail,
        password: 'testpass123'
      });
      
      if (response.data.token) {
        console.log('✅ Register endpoint working');
        console.log(`   User created: ${response.data.user.name}`);
        
        // Clean up test user
        const { pool } = require('./utils/database');
        await pool.query('DELETE FROM users WHERE email = $1', [testEmail]);
        console.log('✅ Test user cleaned up');
      }
    } catch (error) {
      console.log('❌ Register endpoint test failed');
      console.log(`   Error: ${error.response?.data?.message || error.message}`);
    }
    
    console.log('\n🔧 IMMEDIATE ACTIONS REQUIRED:');
    console.log('=====================================');
    console.log('1. RESTART BACKEND SERVER (server.js has been updated)');
    console.log('2. Clear browser cache completely');
    console.log('3. Hard refresh frontend page (Ctrl+F5)');
    console.log('4. Try signup again');
    console.log('');
    console.log('📋 RESTART COMMANDS:');
    console.log('Backend: Stop current server and run "node server.js"');
    console.log('Frontend: Should continue running on current port');
    console.log('');
    console.log('🌐 SUPPORTED PORTS NOW:');
    console.log('   Frontend: 3001, 3002 (both supported)');
    console.log('   Backend: 3000');
    console.log('');
    console.log('✅ CORS ERROR SHOULD BE FIXED AFTER RESTART');
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

fixSignupCorsError().then(() => {
  console.log('\n🏁 Signup CORS error fix completed');
  console.log('⚠️  REMEMBER TO RESTART THE BACKEND SERVER!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Fix crashed:', error);
  process.exit(1);
});