// Verify Data Synchronization Between Shortlist and Tasks
const { pool } = require('./utils/database');

const verifyDataSync = async () => {
  try {
    console.log('🔍 Verifying data synchronization...');
    
    // Get the test user
    const { rows: users } = await pool.query(
      'SELECT id, email FROM users WHERE email = $1',
      ['bhaveysaluja5656@gmail.com']
    );
    
    if (users.length === 0) {
      console.log('❌ Test user not found');
      return;
    }
    
    const userId = users[0].id;
    console.log(`👤 User: ${users[0].email} (ID: ${userId})`);
    
    // Get shortlisted universities
    console.log('\n📋 SHORTLISTED UNIVERSITIES:');
    const { rows: shortlisted } = await pool.query(`
      SELECT u.id, u.name, u.country, u.category, s.is_locked
      FROM universities u 
      JOIN shortlists s ON u.id = s.university_id 
      WHERE s.user_id = $1
      ORDER BY s.is_locked DESC, u.name
    `, [userId]);
    
    if (shortlisted.length === 0) {
      console.log('   ❌ No shortlisted universities found');
    } else {
      shortlisted.forEach((uni, index) => {
        const status = uni.is_locked ? '🔒 LOCKED' : '📋 Shortlisted';
        console.log(`   ${index + 1}. ${uni.name} (${uni.country}) - ${uni.category} ${status}`);
      });
    }
    
    // Get application tasks
    console.log('\n📝 APPLICATION TASKS:');
    const { rows: tasks } = await pool.query(`
      SELECT t.id, t.title, u.name as university_name, u.country, t.completed, t.due_date
      FROM tasks t 
      JOIN universities u ON t.university_id = u.id 
      WHERE t.user_id = $1
      ORDER BY u.name, t.due_date
    `, [userId]);
    
    if (tasks.length === 0) {
      console.log('   ❌ No application tasks found');
    } else {
      let currentUniversity = '';
      tasks.forEach((task, index) => {
        if (task.university_name !== currentUniversity) {
          currentUniversity = task.university_name;
          console.log(`\n   📚 ${task.university_name} (${task.country}):`);
        }
        const status = task.completed ? '✅' : '⏳';
        const dueDate = new Date(task.due_date).toLocaleDateString();
        console.log(`      ${status} ${task.title} (Due: ${dueDate})`);
      });
    }
    
    // Verify synchronization
    console.log('\n🔄 SYNCHRONIZATION CHECK:');
    const lockedUniversities = shortlisted.filter(u => u.is_locked);
    const universitiesWithTasks = [...new Set(tasks.map(t => t.university_name))];
    
    console.log(`   🔒 Locked universities: ${lockedUniversities.length}`);
    console.log(`   📝 Universities with tasks: ${universitiesWithTasks.length}`);
    
    if (lockedUniversities.length === universitiesWithTasks.length) {
      console.log('   ✅ PERFECT SYNC: Tasks match locked universities');
    } else {
      console.log('   ⚠️ SYNC ISSUE: Tasks do not match locked universities');
    }
    
    // Show statistics
    console.log('\n📊 STATISTICS:');
    console.log(`   📋 Total shortlisted: ${shortlisted.length}`);
    console.log(`   🔒 Locked: ${lockedUniversities.length}`);
    console.log(`   📝 Total tasks: ${tasks.length}`);
    console.log(`   ✅ Completed tasks: ${tasks.filter(t => t.completed).length}`);
    console.log(`   ⏳ Pending tasks: ${tasks.filter(t => !t.completed).length}`);
    
    console.log('\n🎯 EXPECTED USER EXPERIENCE:');
    console.log('   1. Shortlisted section shows all shortlisted universities');
    console.log('   2. Tasks section shows tasks ONLY for locked universities');
    console.log('   3. No dummy or unrelated tasks should appear');
    console.log('   4. Perfect data consistency across all sections');
    
  } catch (error) {
    console.error('❌ Error verifying data sync:', error);
  } finally {
    process.exit(0);
  }
};

verifyDataSync();