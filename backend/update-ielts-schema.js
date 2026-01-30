const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function updateIeltsSchema() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Adding IELTS columns to profiles table...');
    
    // Add IELTS columns to profiles table
    await client.query(`
      ALTER TABLE profiles 
      ADD COLUMN IF NOT EXISTS ielts_overall DECIMAL(2,1),
      ADD COLUMN IF NOT EXISTS ielts_listening DECIMAL(2,1),
      ADD COLUMN IF NOT EXISTS ielts_reading DECIMAL(2,1),
      ADD COLUMN IF NOT EXISTS ielts_writing DECIMAL(2,1),
      ADD COLUMN IF NOT EXISTS ielts_speaking DECIMAL(2,1),
      ADD COLUMN IF NOT EXISTS ielts_date DATE;
    `);
    
    console.log('✅ IELTS columns added to profiles table');
    
    console.log('🔄 Adding IELTS requirements to universities table...');
    
    // Add IELTS requirement columns to universities table
    await client.query(`
      ALTER TABLE universities 
      ADD COLUMN IF NOT EXISTS ielts_requirement DECIMAL(2,1) DEFAULT 6.5,
      ADD COLUMN IF NOT EXISTS ielts_minimum DECIMAL(2,1) DEFAULT 6.0;
    `);
    
    console.log('✅ IELTS requirement columns added to universities table');
    
    console.log('🔄 Updating existing universities with IELTS requirements...');
    
    // Update existing universities with IELTS requirements
    const universityUpdates = [
      { name: 'Stanford University', requirement: 7.0, minimum: 6.5 },
      { name: 'MIT', requirement: 7.0, minimum: 6.5 },
      { name: 'University of Toronto', requirement: 6.5, minimum: 6.0 },
      { name: 'University of Edinburgh', requirement: 6.5, minimum: 6.0 },
      { name: 'University of Melbourne', requirement: 6.5, minimum: 6.0 },
      { name: 'Arizona State University', requirement: 6.0, minimum: 5.5 },
      { name: 'University of Ottawa', requirement: 6.0, minimum: 5.5 },
      { name: 'Griffith University', requirement: 6.0, minimum: 5.5 }
    ];
    
    for (const uni of universityUpdates) {
      await client.query(
        'UPDATE universities SET ielts_requirement = $1, ielts_minimum = $2 WHERE name = $3',
        [uni.requirement, uni.minimum, uni.name]
      );
    }
    
    console.log('✅ Universities updated with IELTS requirements');
    console.log('🎉 IELTS schema update completed successfully!');
    
  } catch (error) {
    console.error('❌ Error updating IELTS schema:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

updateIeltsSchema();