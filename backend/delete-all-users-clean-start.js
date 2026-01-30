const { pool } = require('./utils/database');

async function deleteAllUsersCleanStart() {
  console.log('🗑️ Deleting All Users and Data for Clean Start\n');
  
  try {
    // 1. Check current database state
    console.log('1️⃣ Checking current database state...');
    
    const userCount = await pool.query('SELECT COUNT(*) as count FROM users');
    const profileCount = await pool.query('SELECT COUNT(*) as count FROM profiles');
    const shortlistCount = await pool.query('SELECT COUNT(*) as count FROM shortlists');
    const taskCount = await pool.query('SELECT COUNT(*) as count FROM tasks');
    const documentCount = await pool.query('SELECT COUNT(*) as count FROM documents');
    
    console.log('📊 Current data counts:');
    console.log(`   Users: ${userCount.rows[0].count}`);
    console.log(`   Profiles: ${profileCount.rows[0].count}`);
    console.log(`   Shortlists: ${shortlistCount.rows[0].count}`);
    console.log(`   Tasks: ${taskCount.rows[0].count}`);
    console.log(`   Documents: ${documentCount.rows[0].count}\n`);
    
    // 2. Begin transaction for safe deletion
    console.log('2️⃣ Starting complete data deletion...');
    await pool.query('BEGIN');
    
    try {
      // Delete in correct order to respect foreign key constraints
      
      // Delete documents first
      const deletedDocs = await pool.query('DELETE FROM documents RETURNING id');
      console.log(`🗑️ Deleted ${deletedDocs.rows.length} documents`);
      
      // Delete tasks
      const deletedTasks = await pool.query('DELETE FROM tasks RETURNING id');
      console.log(`🗑️ Deleted ${deletedTasks.rows.length} tasks`);
      
      // Delete shortlists
      const deletedShortlists = await pool.query('DELETE FROM shortlists RETURNING id');
      console.log(`🗑️ Deleted ${deletedShortlists.rows.length} shortlist entries`);
      
      // Delete profiles
      const deletedProfiles = await pool.query('DELETE FROM profiles RETURNING id');
      console.log(`🗑️ Deleted ${deletedProfiles.rows.length} profiles`);
      
      // Finally delete all users
      const deletedUsers = await pool.query('DELETE FROM users RETURNING id, name, email');
      console.log(`🗑️ Deleted ${deletedUsers.rows.length} users:`);
      deletedUsers.rows.forEach(user => {
        console.log(`   - ${user.name} (${user.email}) - ID: ${user.id}`);
      });
      
      // Commit transaction
      await pool.query('COMMIT');
      console.log('✅ Transaction committed successfully\n');
      
    } catch (error) {
      // Rollback on error
      await pool.query('ROLLBACK');
      throw error;
    }
    
    // 3. Verify complete deletion
    console.log('3️⃣ Verifying complete deletion...');
    
    const finalUserCount = await pool.query('SELECT COUNT(*) as count FROM users');
    const finalProfileCount = await pool.query('SELECT COUNT(*) as count FROM profiles');
    const finalShortlistCount = await pool.query('SELECT COUNT(*) as count FROM shortlists');
    const finalTaskCount = await pool.query('SELECT COUNT(*) as count FROM tasks');
    const finalDocumentCount = await pool.query('SELECT COUNT(*) as count FROM documents');
    
    console.log('📊 Final data counts:');
    console.log(`   Users: ${finalUserCount.rows[0].count}`);
    console.log(`   Profiles: ${finalProfileCount.rows[0].count}`);
    console.log(`   Shortlists: ${finalShortlistCount.rows[0].count}`);
    console.log(`   Tasks: ${finalTaskCount.rows[0].count}`);
    console.log(`   Documents: ${finalDocumentCount.rows[0].count}\n`);
    
    // Check if all counts are zero
    const allCounts = [
      finalUserCount.rows[0].count,
      finalProfileCount.rows[0].count,
      finalShortlistCount.rows[0].count,
      finalTaskCount.rows[0].count,
      finalDocumentCount.rows[0].count
    ];
    
    const allZero = allCounts.every(count => count === '0');
    
    if (allZero) {
      console.log('✅ SUCCESS: All user data completely deleted!');
      console.log('🎉 Database is now clean and ready for fresh registration\n');
    } else {
      console.log('⚠️  WARNING: Some data may not have been deleted completely');
    }
    
    // 4. Reset auto-increment sequences (optional)
    console.log('4️⃣ Resetting ID sequences...');
    
    try {
      await pool.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
      await pool.query('ALTER SEQUENCE profiles_id_seq RESTART WITH 1');
      await pool.query('ALTER SEQUENCE shortlists_id_seq RESTART WITH 1');
      await pool.query('ALTER SEQUENCE tasks_id_seq RESTART WITH 1');
      await pool.query('ALTER SEQUENCE documents_id_seq RESTART WITH 1');
      console.log('✅ ID sequences reset to start from 1\n');
    } catch (seqError) {
      console.log('⚠️  ID sequence reset failed (not critical):', seqError.message);
    }
    
    // 5. Verify universities table still exists (should not be deleted)
    console.log('5️⃣ Verifying universities table...');
    const universityCount = await pool.query('SELECT COUNT(*) as count FROM universities');
    console.log(`📚 Universities available: ${universityCount.rows[0].count}`);
    
    if (universityCount.rows[0].count === '0') {
      console.log('⚠️  No universities found, creating sample universities...');
      
      await pool.query(`
        INSERT INTO universities (name, country, ranking, tuition_fee, requirements, programs) VALUES
        ('Stanford University', 'USA', 2, '$50,000-60,000', 'GPA 3.8+, IELTS 7.0+', ARRAY['Computer Science', 'Engineering', 'Business']),
        ('MIT', 'USA', 1, '$55,000-65,000', 'GPA 3.9+, IELTS 7.5+', ARRAY['Engineering', 'Computer Science', 'Physics']),
        ('University of Toronto', 'Canada', 25, '$35,000-45,000', 'GPA 3.5+, IELTS 6.5+', ARRAY['Engineering', 'Medicine', 'Business']),
        ('University of Edinburgh', 'UK', 20, '$25,000-35,000', 'GPA 3.6+, IELTS 6.5+', ARRAY['Medicine', 'Engineering', 'Arts']),
        ('University of Melbourne', 'Australia', 33, '$30,000-40,000', 'GPA 3.4+, IELTS 6.5+', ARRAY['Medicine', 'Engineering', 'Business']),
        ('Arizona State University', 'USA', 117, '$28,000-35,000', 'GPA 3.0+, IELTS 6.0+', ARRAY['Business', 'Engineering', 'Arts'])
      `);
      
      console.log('✅ Sample universities created');
    } else {
      console.log('✅ Universities table intact');
    }
    
    console.log('\n🎉 CLEAN START COMPLETE!');
    console.log('=====================================');
    console.log('✅ All user accounts deleted');
    console.log('✅ All user data removed');
    console.log('✅ Database ready for fresh registration');
    console.log('✅ Universities available for selection');
    console.log('✅ ID sequences reset');
    console.log('');
    console.log('📋 NEXT STEPS:');
    console.log('1. Go to frontend registration page');
    console.log('2. Create new account with your details');
    console.log('3. Complete onboarding process');
    console.log('4. Start using the application fresh');
    console.log('');
    console.log('🌐 REGISTRATION URL:');
    console.log('   Frontend: http://localhost:3002/register (or 3001)');
    console.log('   Backend: http://localhost:3000 (ready for new users)');
    console.log('');
    console.log('🔐 NO EXISTING USERS:');
    console.log('   All previous accounts deleted');
    console.log('   Fresh registration required');
    console.log('   First user will get ID: 1');
    
  } catch (error) {
    console.error('❌ Deletion failed:', error.message);
    console.error('Stack:', error.stack);
    
    // Try to rollback if we're still in a transaction
    try {
      await pool.query('ROLLBACK');
      console.log('🔄 Transaction rolled back');
    } catch (rollbackError) {
      console.log('⚠️  Rollback also failed');
    }
  }
}

deleteAllUsersCleanStart().then(() => {
  console.log('\n🏁 Clean start process completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Clean start process crashed:', error);
  process.exit(1);
});