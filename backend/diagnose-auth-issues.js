const { pool } = require('./utils/database');
const bcrypt = require('bcryptjs');
const axios = require('axios');

async function diagnoseAuthIssues() {
  console.log('🔍 Diagnosing Authentication Issues\n');
  
  try {
    // 1. Check database connection
    console.log('1️⃣ Testing Database Connection...');
    const dbTest = await pool.query('SELECT NOW()');
    console.log('✅ Database connected successfully');
    console.log(`   Current time: ${dbTest.rows[0].now}\n`);
    
    // 2. Check users table structure
    console.log('2️⃣ Checking Users Table Structure...');
    const tableInfo = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    if (tableInfo.rows.length === 0) {
      console.log('❌ Users table does not exist!');
      console.log('   Creating users table...');
      
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'student')),
          onboarding_completed BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Users table created');
    } else {
      console.log('✅ Users table exists with columns:');
      tableInfo.rows.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }
    console.log();
    
    // 3. Check existing users
    console.log('3️⃣ Checking Existing Users...');
    const users = await pool.query('SELECT id, name, email, role, onboarding_completed, created_at FROM users');
    console.log(`   Found ${users.rows.length} users:`);
    
    if (users.rows.length === 0) {
      console.log('   No users found - this explains login failures!');
    } else {
      users.rows.forEach(user => {
        console.log(`   - ${user.name} (${user.email}) - Role: ${user.role} - ID: ${user.id}`);
      });
    }
    console.log();
    
    // 4. Create/verify test user
    console.log('4️⃣ Creating/Verifying Test User...');
    const testEmail = 'bhaveysaluja5656@gmail.com';
    const testPassword = '123456';
    const testName = 'Bhavey Saluja';
    
    // Check if test user exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [testEmail]);
    
    if (existingUser.rows.length === 0) {
      console.log('   Creating test user...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(testPassword, salt);
      
      const newUser = await pool.query(`
        INSERT INTO users (name, email, password, role, onboarding_completed) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING id, name, email, role
      `, [testName, testEmail, hashedPassword, 'user', true]);
      
      console.log('✅ Test user created:');
      console.log(`   ID: ${newUser.rows[0].id}`);
      console.log(`   Name: ${newUser.rows[0].name}`);
      console.log(`   Email: ${newUser.rows[0].email}`);
      console.log(`   Role: ${newUser.rows[0].role}`);
    } else {
      console.log('✅ Test user already exists:');
      console.log(`   ID: ${existingUser.rows[0].id}`);
      console.log(`   Name: ${existingUser.rows[0].name}`);
      console.log(`   Email: ${existingUser.rows[0].email}`);
      console.log(`   Role: ${existingUser.rows[0].role}`);
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(testPassword, existingUser.rows[0].password);
      console.log(`   Password valid: ${isPasswordValid ? '✅' : '❌'}`);
      
      if (!isPasswordValid) {
        console.log('   Updating password...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(testPassword, salt);
        await pool.query('UPDATE users SET password = $1 WHERE email = $2', [hashedPassword, testEmail]);
        console.log('✅ Password updated');
      }
    }
    console.log();
    
    // 5. Test backend authentication endpoints
    console.log('5️⃣ Testing Backend Authentication Endpoints...');
    
    // Test login endpoint
    console.log('   Testing login endpoint...');
    try {
      const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
        email: testEmail,
        password: testPassword
      });
      
      if (loginResponse.data.token) {
        console.log('✅ Login endpoint working');
        console.log(`   Token received: ${loginResponse.data.token.substring(0, 20)}...`);
        console.log(`   User: ${loginResponse.data.user.name}`);
        console.log(`   Role: ${loginResponse.data.user.role}`);
      } else {
        console.log('❌ Login endpoint failed - no token');
        console.log('   Response:', loginResponse.data);
      }
    } catch (loginError) {
      console.log('❌ Login endpoint failed');
      console.log(`   Status: ${loginError.response?.status}`);
      console.log(`   Error: ${loginError.response?.data?.message || loginError.message}`);
    }
    console.log();
    
    // Test register endpoint
    console.log('   Testing register endpoint...');
    const testRegisterEmail = 'test.register@example.com';
    try {
      const registerResponse = await axios.post('http://localhost:3000/api/auth/register', {
        name: 'Test Register User',
        email: testRegisterEmail,
        password: 'testpass123'
      });
      
      if (registerResponse.data.token) {
        console.log('✅ Register endpoint working');
        console.log(`   New user created: ${registerResponse.data.user.name}`);
        
        // Clean up test user
        await pool.query('DELETE FROM users WHERE email = $1', [testRegisterEmail]);
        console.log('   Test registration user cleaned up');
      } else {
        console.log('❌ Register endpoint failed - no token');
        console.log('   Response:', registerResponse.data);
      }
    } catch (registerError) {
      console.log('❌ Register endpoint failed');
      console.log(`   Status: ${registerError.response?.status}`);
      console.log(`   Error: ${registerError.response?.data?.message || registerError.message}`);
    }
    console.log();
    
    // 6. Check frontend-backend connection
    console.log('6️⃣ Testing Frontend-Backend Connection...');
    try {
      const healthResponse = await axios.get('http://localhost:3000/api/health');
      console.log('✅ Backend health check passed');
      console.log(`   Status: ${healthResponse.data.status}`);
      console.log(`   Database: ${healthResponse.data.database}`);
    } catch (healthError) {
      console.log('❌ Backend health check failed');
      console.log(`   Error: ${healthError.message}`);
    }
    
    // 7. Summary and recommendations
    console.log('\n📋 DIAGNOSIS SUMMARY:');
    console.log('=====================================');
    
    const finalUserCheck = await pool.query('SELECT COUNT(*) as count FROM users');
    const userCount = finalUserCheck.rows[0].count;
    
    if (userCount > 0) {
      console.log('✅ Database: Connected and users table exists');
      console.log(`✅ Users: ${userCount} user(s) in database`);
      console.log('✅ Test User: Available for login');
      console.log('✅ Credentials: bhaveysaluja5656@gmail.com / 123456');
    } else {
      console.log('❌ No users in database - this is the main issue!');
    }
    
    console.log('\n🔧 RECOMMENDED ACTIONS:');
    console.log('1. Ensure both backend and frontend servers are running');
    console.log('2. Use credentials: bhaveysaluja5656@gmail.com / 123456');
    console.log('3. Check browser console for any CORS or network errors');
    console.log('4. Verify frontend is making requests to http://localhost:3000');
    
  } catch (error) {
    console.error('❌ Diagnosis failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

diagnoseAuthIssues().then(() => {
  console.log('\n🏁 Authentication diagnosis completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Diagnosis crashed:', error);
  process.exit(1);
});