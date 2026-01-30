const { pool } = require('./utils/database');

const checkUniversitiesWithTasks = async () => {
  try {
    console.log('🔍 Checking universities with application tasks...');
    
    const { rows } = await pool.query(`
      SELECT DISTINCT u.id, u.name, u.country, COUNT(t.id) as task_count
      FROM universities u
      INNER JOIN tasks t ON u.id = t.university_id
      GROUP BY u.id, u.name, u.country
      ORDER BY u.name
    `);
    
    console.log(`\n📊 Found ${rows.length} universities with application tasks:`);
    rows.forEach(row => {
      console.log(`  • ${row.name} (${row.country}) - ${row.task_count} tasks - ID: ${row.id}`);
    });
    
    // Also check shortlisted universities
    console.log('\n🔍 Checking shortlisted universities...');
    const { rows: shortlisted } = await pool.query(`
      SELECT DISTINCT u.id, u.name, u.country, s.is_locked
      FROM universities u
      INNER JOIN shortlists s ON u.id = s.university_id
      ORDER BY u.name
    `);
    
    console.log(`\n📋 Found ${shortlisted.length} shortlisted universities:`);
    shortlisted.forEach(row => {
      console.log(`  • ${row.name} (${row.country}) - ${row.is_locked ? 'LOCKED' : 'Shortlisted'} - ID: ${row.id}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
};

checkUniversitiesWithTasks();