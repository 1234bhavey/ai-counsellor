const { pool } = require('./utils/database');

async function checkTableStructure() {
  try {
    console.log('🔍 Checking table structures...\n');

    // Check universities table structure
    const universitiesColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'universities' 
      ORDER BY ordinal_position;
    `);
    
    console.log('🏫 Universities table structure:');
    universitiesColumns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    console.log('');

    // Check users table structure
    const usersColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position;
    `);
    
    console.log('👥 Users table structure:');
    usersColumns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    console.log('');

    // Sample universities data
    const universities = await pool.query('SELECT * FROM universities LIMIT 3');
    console.log('🏫 Sample universities data:');
    universities.rows.forEach(uni => {
      console.log(`  - ${uni.name} (${uni.country})`);
      console.log(`    ID: ${uni.id}, Programs: ${uni.programs || 'N/A'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

checkTableStructure();