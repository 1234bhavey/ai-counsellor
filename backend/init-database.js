require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'ai_counsellor',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database...');
    
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connected');
    
    // Run safe schema
    console.log('📋 Creating tables...');
    const schemaSQL = fs.readFileSync(path.join(__dirname, 'database/init-schema.sql'), 'utf8');
    await pool.query(schemaSQL);
    console.log('✅ Tables created successfully');
    
    // Check if user exists
    const { rows: existingUser } = await pool.query('SELECT * FROM users WHERE email = $1', ['bhaveysaluja5656@gmail.com']);
    
    if (existingUser.length === 0) {
      console.log('👤 Creating test user...');
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('123456', salt);
      
      // Create user
      const { rows } = await pool.query(
        'INSERT INTO users (name, email, password, onboarding_completed) VALUES ($1, $2, $3, $4) RETURNING *',
        ['Bhavey Saluja', 'bhaveysaluja5656@gmail.com', hashedPassword, false]
      );
      
      console.log('✅ Test user created successfully');
      console.log('👤 User ID:', rows[0].id);
    } else {
      console.log('✅ Test user already exists');
    }
    
    // Verify universities
    const { rows: universities } = await pool.query('SELECT COUNT(*) as count FROM universities');
    console.log(`🏫 Universities in database: ${universities[0].count}`);
    
    console.log('');
    console.log('🎉 Database initialization complete!');
    console.log('📧 Login Email: bhaveysaluja5656@gmail.com');
    console.log('🔐 Login Password: 123456');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  }
  
  process.exit(0);
}

initializeDatabase();