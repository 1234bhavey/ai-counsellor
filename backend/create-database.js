const { Pool } = require('pg');

// Connect to default postgres database first
const pool = new Pool({
  host: '127.0.0.1',
  port: 5432,
  database: 'postgres', // Connect to default database
  user: 'postgres',
  password: '12345678',
});

async function createDatabase() {
  try {
    const client = await pool.connect();
    console.log('Connected to PostgreSQL...');
    
    // Check if database exists
    const checkDB = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = 'ai_counsellor'"
    );
    
    if (checkDB.rows.length === 0) {
      // Create the database
      await client.query('CREATE DATABASE ai_counsellor');
      console.log('✅ Database "ai_counsellor" created successfully!');
    } else {
      console.log('✅ Database "ai_counsellor" already exists!');
    }
    
    client.release();
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to create database:', error.message);
    process.exit(1);
  }
}

createDatabase();