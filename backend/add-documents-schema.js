const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function addDocumentsSchema() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Creating documents table...');
    
    // Create documents table
    await client.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        university_id INTEGER REFERENCES universities(id) ON DELETE CASCADE,
        category VARCHAR(50) NOT NULL,
        document_name VARCHAR(255) NOT NULL,
        description TEXT,
        is_required BOOLEAN DEFAULT true,
        is_completed BOOLEAN DEFAULT false,
        due_date DATE,
        notes TEXT,
        file_path VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('✅ Documents table created');
    
    console.log('🔄 Creating indexes for documents table...');
    
    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
      CREATE INDEX IF NOT EXISTS idx_documents_university_id ON documents(university_id);
      CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
      CREATE INDEX IF NOT EXISTS idx_documents_required ON documents(is_required);
      CREATE INDEX IF NOT EXISTS idx_documents_completed ON documents(is_completed);
    `);
    
    console.log('✅ Indexes created for documents table');
    console.log('🎉 Documents schema setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error creating documents schema:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

addDocumentsSchema();