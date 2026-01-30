// Clean up orphaned documents and tasks
const { pool } = require('./utils/database');

const cleanupOrphanedData = async () => {
  try {
    console.log('🧹 Cleaning up orphaned documents and tasks...');
    
    // Get user ID
    const { rows: users } = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      ['bhaveysaluja5656@gmail.com']
    );
    
    const userId = users[0].id;
    
    // Find orphaned documents (documents for universities not in shortlist)
    const { rows: orphanedDocs } = await pool.query(`
      SELECT d.id, d.university_id, u.name as university_name, COUNT(*) as count
      FROM documents d
      LEFT JOIN universities u ON d.university_id = u.id
      LEFT JOIN shortlists s ON d.university_id = s.university_id AND d.user_id = s.user_id
      WHERE d.user_id = $1 AND s.id IS NULL
      GROUP BY d.id, d.university_id, u.name
    `, [userId]);
    
    if (orphanedDocs.length > 0) {
      console.log(`Found ${orphanedDocs.length} orphaned documents:`);
      orphanedDocs.forEach(doc => {
        console.log(`   - Document ID ${doc.id} for ${doc.university_name || 'Unknown University'} (University ID: ${doc.university_id})`);
      });
      
      // Delete orphaned documents
      const { rows: deletedDocs } = await pool.query(
        `DELETE FROM documents d 
         WHERE d.user_id = $1 
         AND NOT EXISTS (
           SELECT 1 FROM shortlists s 
           WHERE s.user_id = d.user_id AND s.university_id = d.university_id
         )
         RETURNING id, university_id`,
        [userId]
      );
      
      console.log(`✅ Deleted ${deletedDocs.length} orphaned documents`);
    } else {
      console.log('✅ No orphaned documents found');
    }
    
    // Find orphaned tasks
    const { rows: orphanedTasks } = await pool.query(`
      SELECT t.id, t.university_id, u.name as university_name
      FROM tasks t
      LEFT JOIN universities u ON t.university_id = u.id
      LEFT JOIN shortlists s ON t.university_id = s.university_id AND t.user_id = s.user_id
      WHERE t.user_id = $1 AND s.id IS NULL
    `, [userId]);
    
    if (orphanedTasks.length > 0) {
      console.log(`Found ${orphanedTasks.length} orphaned tasks:`);
      orphanedTasks.forEach(task => {
        console.log(`   - Task ID ${task.id} for ${task.university_name || 'Unknown University'} (University ID: ${task.university_id})`);
      });
      
      // Delete orphaned tasks
      const { rows: deletedTasks } = await pool.query(
        `DELETE FROM tasks t 
         WHERE t.user_id = $1 
         AND NOT EXISTS (
           SELECT 1 FROM shortlists s 
           WHERE s.user_id = t.user_id AND s.university_id = t.university_id
         )
         RETURNING id, university_id`,
        [userId]
      );
      
      console.log(`✅ Deleted ${deletedTasks.length} orphaned tasks`);
    } else {
      console.log('✅ No orphaned tasks found');
    }
    
    // Show final clean state
    console.log('\n📊 Final clean state:');
    
    const { rows: finalShortlist } = await pool.query(
      'SELECT s.*, u.name FROM shortlists s JOIN universities u ON s.university_id = u.id WHERE s.user_id = $1',
      [userId]
    );
    console.log(`Shortlisted universities: ${finalShortlist.length}`);
    finalShortlist.forEach(uni => console.log(`   - ${uni.name} (${uni.is_locked ? 'LOCKED' : 'Shortlisted'})`));
    
    const { rows: finalDocs } = await pool.query(
      'SELECT COUNT(*) as count FROM documents WHERE user_id = $1',
      [userId]
    );
    console.log(`Total documents: ${finalDocs[0].count}`);
    
    const { rows: finalTasks } = await pool.query(
      'SELECT COUNT(*) as count FROM tasks WHERE user_id = $1',
      [userId]
    );
    console.log(`Total tasks: ${finalTasks[0].count}`);
    
    console.log('\n🎉 Cleanup complete!');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  } finally {
    process.exit(0);
  }
};

cleanupOrphanedData();