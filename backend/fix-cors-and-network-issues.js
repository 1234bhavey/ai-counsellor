const express = require('express');
const cors = require('cors');
const { pool } = require('./utils/database');

async function fixCorsAndNetworkIssues() {
  console.log('🔧 Fixing CORS and Network Issues\n');
  
  try {
    // 1. Test current CORS configuration
    console.log('1️⃣ Testing current CORS configuration...');
    
    // Check if server is running
    const axios = require('axios');
    try {
      const response = await axios.get('http://localhost:3000/api/health');
      console.log('✅ Backend server is running');
      console.log(`   Status: ${response.data.status}`);
    } catch (error) {
      console.log('❌ Backend server is not running or not accessible');
      console.log('   Please start the backend server first');
      return;
    }
    
    // 2. Check database connection
    console.log('\n2️⃣ Checking database connection...');
    const dbTest = await pool.query('SELECT NOW()');
    console.log('✅ Database connected successfully');
    
    // 3. Verify user exists
    console.log('\n3️⃣ Verifying test user exists...');
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', ['bhaveysaluja5656@gmail.com']);
    
    if (userCheck.rows.length === 0) {
      console.log('❌ Test user not found, creating...');
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('123456', salt);
      
      await pool.query(`
        INSERT INTO users (name, email, password, role, onboarding_completed) 
        VALUES ($1, $2, $3, $4, $5)
      `, ['Bhavey Saluja', 'bhaveysaluja5656@gmail.com', hashedPassword, 'user', true]);
      
      console.log('✅ Test user created');
    } else {
      console.log('✅ Test user exists');
      console.log(`   Name: ${userCheck.rows[0].name}`);
      console.log(`   Email: ${userCheck.rows[0].email}`);
    }
    
    // 4. Test API endpoints directly
    console.log('\n4️⃣ Testing API endpoints...');
    
    // Test login
    try {
      const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
        email: 'bhaveysaluja5656@gmail.com',
        password: '123456'
      });
      
      if (loginResponse.data.token) {
        console.log('✅ Login API working');
        console.log(`   Token: ${loginResponse.data.token.substring(0, 20)}...`);
      }
    } catch (loginError) {
      console.log('❌ Login API failed');
      console.log(`   Error: ${loginError.response?.data?.message || loginError.message}`);
    }
    
    // Test register
    try {
      const testEmail = 'test.cors.fix@example.com';
      const registerResponse = await axios.post('http://localhost:3000/api/auth/register', {
        name: 'Test CORS User',
        email: testEmail,
        password: 'testpass123'
      });
      
      if (registerResponse.data.token) {
        console.log('✅ Register API working');
        
        // Clean up test user
        await pool.query('DELETE FROM users WHERE email = $1', [testEmail]);
        console.log('✅ Test user cleaned up');
      }
    } catch (registerError) {
      console.log('❌ Register API failed');
      console.log(`   Error: ${registerError.response?.data?.message || registerError.message}`);
    }
    
    console.log('\n🔧 CORS CONFIGURATION RECOMMENDATIONS:');
    console.log('=====================================');
    console.log('The backend server needs to be restarted with proper CORS configuration.');
    console.log('The server.js file should include:');
    console.log('');
    console.log('app.use(cors({');
    console.log('  origin: ["http://localhost:3001", "http://127.0.0.1:3001"],');
    console.log('  credentials: true,');
    console.log('  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],');
    console.log('  allowedHeaders: ["Content-Type", "Authorization"]');
    console.log('}));');
    console.log('');
    console.log('📋 NEXT STEPS:');
    console.log('1. Stop the current backend server');
    console.log('2. Update server.js with proper CORS configuration');
    console.log('3. Restart the backend server');
    console.log('4. Clear browser cache and try again');
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

fixCorsAndNetworkIssues().then(() => {
  console.log('\n🏁 CORS and network issue diagnosis completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Fix crashed:', error);
  process.exit(1);
});