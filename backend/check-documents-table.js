const { pool } = require('./utils/database');

const checkTable = async () => {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'documents'
      ORDER BY ordinal_position
    `);
    
    if (result.rows.length === 0) {
      console.log('Documents table does not exist yet');
    } else {
      console.log('Documents table columns:');
      result.rows.forEach(row => {
        console.log(`  ${row.column_name}: ${row.data_type}`);
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit(0);
  }
};

checkTable();