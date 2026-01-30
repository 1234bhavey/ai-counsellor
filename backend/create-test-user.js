require('dotenv').config();
const { pool } = require('./utils/database');
const bcrypt = require('bcryptjs');

async function createTestUser() {
  try {
    console.log('🔄 Creating test user...');
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);
    
    // Create user
    const { rows } = await pool.query(
      'INSERT INTO users (name, email, password, onboarding_completed) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO UPDATE SET password = $3 RETURNING *',
      ['Bhavey Saluja', 'bhaveysaluja5656@gmail.com', hashedPassword, false]
    );
    
    console.log('✅ User created/updated successfully');
    console.log('📧 Email: bhaveysaluja5656@gmail.com');
    console.log('🔐 Password: 123456');
    console.log('👤 User ID:', rows[0].id);
    
  } catch (error) {
    console.error('❌ Failed to create user:', error);
  }
  
  process.exit(0);
}

createTestUser();