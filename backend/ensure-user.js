// Ensure Test User Script - Run this if login fails
const { pool } = require('./utils/database');
const bcrypt = require('bcryptjs');

const ensureTestUser = async () => {
  try {
    console.log('🔍 Checking for test user...');
    
    const testEmail = 'bhaveysaluja5656@gmail.com';
    const testPassword = '123456';
    
    // Check if user exists
    const { rows: existingUser } = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [testEmail]
    );
    
    if (existingUser.length === 0) {
      console.log('❌ Test user not found. Creating...');
      
      // Hash password
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      
      // Create user (REGULAR USER ONLY)
      const { rows: newUser } = await pool.query(
        'INSERT INTO users (name, email, password, role, onboarding_completed) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        ['Bhavey Saluja', testEmail, hashedPassword, 'user', true]
      );
      
      // Create profile
      await pool.query(
        `INSERT INTO profiles (user_id, academic_background, study_goals, budget, exam_readiness, preferred_countries, current_stage) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          newUser[0].id,
          'bachelors',
          'masters',
          'medium',
          'preparing',
          ['USA', 'Canada', 'UK'],
          'discovery'
        ]
      );
      
      console.log('✅ Test user created successfully!');
      console.log(`📧 Email: ${testEmail}`);
      console.log(`🔑 Password: ${testPassword}`);
      console.log(`👤 Role: user (NO ADMIN)`);
      
    } else {
      console.log('✅ Test user already exists');
      console.log(`📧 Email: ${testEmail}`);
      console.log(`🔑 Password: ${testPassword}`);
      console.log(`👤 Role: ${existingUser[0].role} (NO ADMIN)`);
      
      // Verify password works
      const passwordMatch = await bcrypt.compare(testPassword, existingUser[0].password);
      if (passwordMatch) {
        console.log('✅ Password verification successful');
      } else {
        console.log('❌ Password mismatch - updating password...');
        const hashedPassword = await bcrypt.hash(testPassword, 10);
        await pool.query(
          'UPDATE users SET password = $1 WHERE email = $2',
          [hashedPassword, testEmail]
        );
        console.log('✅ Password updated successfully');
      }
    }
    
    console.log('\n🎯 LOGIN CREDENTIALS:');
    console.log('Email: bhaveysaluja5656@gmail.com');
    console.log('Password: 123456');
    console.log('Role: User (NO ADMIN)');
    console.log('\n✅ You can now login successfully!');
    
  } catch (error) {
    console.error('❌ Error ensuring test user:', error);
  } finally {
    process.exit(0);
  }
};

ensureTestUser();