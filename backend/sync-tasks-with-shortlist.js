// Sync Application Tasks with Shortlisted Universities
const { pool } = require('./utils/database');

const syncTasksWithShortlist = async () => {
  try {
    console.log('🔄 Syncing application tasks with shortlisted universities...');
    
    // Get the test user
    const { rows: users } = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      ['bhaveysaluja5656@gmail.com']
    );
    
    if (users.length === 0) {
      console.log('❌ Test user not found');
      return;
    }
    
    const userId = users[0].id;
    
    // 1. First, delete ALL existing tasks for clean slate
    console.log('🗑️ Removing all existing tasks...');
    const { rows: deletedTasks } = await pool.query(
      'DELETE FROM tasks WHERE user_id = $1 RETURNING title',
      [userId]
    );
    
    console.log(`✅ Deleted ${deletedTasks.length} old tasks`);
    
    // 2. Get locked shortlisted universities
    console.log('🔍 Finding locked shortlisted universities...');
    const { rows: lockedUniversities } = await pool.query(`
      SELECT u.id, u.name, u.country, u.category
      FROM universities u 
      JOIN shortlists s ON u.id = s.university_id 
      WHERE s.user_id = $1 AND s.is_locked = true
      ORDER BY u.name
    `, [userId]);
    
    if (lockedUniversities.length === 0) {
      console.log('⚠️ No locked universities found. Tasks will be empty until user locks a university.');
      console.log('💡 This is correct behavior - tasks should only exist for locked universities.');
      return;
    }
    
    console.log(`🔒 Found ${lockedUniversities.length} locked universities:`);
    lockedUniversities.forEach(uni => {
      console.log(`   - ${uni.name} (${uni.country})`);
    });
    
    // 3. Generate tasks ONLY for locked universities
    console.log('\n📝 Generating application tasks for locked universities...');
    
    for (const university of lockedUniversities) {
      console.log(`\n🎯 Creating tasks for ${university.name}...`);
      
      const tasks = [
        {
          title: `Write Statement of Purpose for ${university.name}`,
          description: `Draft your SOP specifically for ${university.name}. Research their programs, faculty, and values. Highlight why you're a perfect fit for their ${university.country} campus.`,
          due_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
        },
        {
          title: `Request Recommendation Letters for ${university.name}`,
          description: `Contact 2-3 professors or supervisors to write recommendation letters for your ${university.name} application. Provide them with your resume and SOP draft.`,
          due_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days from now
        },
        {
          title: `Prepare Academic Transcripts for ${university.name}`,
          description: `Get official transcripts from your institutions for ${university.name} application. Ensure they meet ${university.country} education system requirements.`,
          due_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000) // 45 days from now
        },
        {
          title: `Complete ${university.name} Application Form`,
          description: `Fill out the online application form for ${university.name}. Double-check all information, upload required documents, and review before submission.`,
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        },
        {
          title: `Submit Application to ${university.name}`,
          description: `Final submission of your application to ${university.name}. Pay application fee, confirm receipt, and save confirmation details.`,
          due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days from now
        }
      ];
      
      // Insert tasks for this university
      for (const task of tasks) {
        await pool.query(
          `INSERT INTO tasks (user_id, university_id, title, description, due_date) 
           VALUES ($1, $2, $3, $4, $5)`,
          [userId, university.id, task.title, task.description, task.due_date]
        );
      }
      
      console.log(`   ✅ Created ${tasks.length} tasks for ${university.name}`);
    }
    
    // 4. Show final summary
    const { rows: finalTasks } = await pool.query(
      `SELECT t.title, u.name as university_name 
       FROM tasks t 
       JOIN universities u ON t.university_id = u.id 
       WHERE t.user_id = $1 
       ORDER BY u.name, t.due_date`,
      [userId]
    );
    
    console.log('\n🎉 Task synchronization completed!');
    console.log(`📊 Total tasks created: ${finalTasks.length}`);
    console.log(`🏫 For universities: ${lockedUniversities.map(u => u.name).join(', ')}`);
    
    console.log('\n📋 Tasks created:');
    finalTasks.forEach((task, index) => {
      console.log(`   ${index + 1}. ${task.title}`);
    });
    
    console.log('\n✅ Application Tasks now perfectly match your shortlisted & locked universities!');
    
  } catch (error) {
    console.error('❌ Error syncing tasks with shortlist:', error);
  } finally {
    process.exit(0);
  }
};

syncTasksWithShortlist();