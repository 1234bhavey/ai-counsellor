const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const setupDatabase = async () => {
  // First connect to postgres database to create our database
  const adminPool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: 'postgres',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
  });

  try {
    console.log('Connecting to PostgreSQL...');
    
    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME || 'ai_counsellor';
    await adminPool.query(`CREATE DATABASE ${dbName}`);
    console.log(`Database '${dbName}' created successfully`);
  } catch (error) {
    if (error.code === '42P04') {
      console.log('Database already exists, continuing...');
    } else {
      console.error('Error creating database:', error);
      throw error;
    }
  } finally {
    await adminPool.end();
  }

  // Now connect to our database and run schema
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'ai_counsellor',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
  });

  try {
    console.log('Running database schema...');
    const schemaSQL = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(schemaSQL);
    console.log('Database schema created successfully');
    console.log('✅ Database setup complete!');
  } catch (error) {
    console.error('Error running schema:', error);
    throw error;
  } finally {
    await pool.end();
  }
};

// Run setup if called directly
if (require.main === module) {
  setupDatabase().catch(console.error);
}

module.exports = { setupDatabase };