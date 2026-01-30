const { pool } = require('./utils/database');

async function checkDatabaseData() {
  try {
    console.log('🔍 Checking database connection and existing data...\n');

    // Test database connection
    const connectionTest = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Database connection successful');
    console.log('📅 Current time:', connectionTest.rows[0].current_time);
    console.log('');

    // Check if tables exist
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    const tables = await pool.query(tablesQuery);
    
    console.log('📋 Existing tables:');
    tables.rows.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });
    console.log('');

    // Check users table
    try {
      const usersCount = await pool.query('SELECT COUNT(*) as count FROM users');
      console.log('👥 Users table:');
      console.log(`  - Total users: ${usersCount.rows[0].count}`);
      
      if (usersCount.rows[0].count > 0) {
        const users = await pool.query(`
          SELECT id, name, email, role, onboarding_completed, created_at 
          FROM users 
          ORDER BY created_at DESC 
          LIMIT 5
        `);
        
        console.log('  - Recent users:');
        users.rows.forEach(user => {
          console.log(`    • ${user.name} (${user.email}) - Role: ${user.role || 'student'} - Onboarded: ${user.onboarding_completed ? 'Yes' : 'No'}`);
        });
      }
    } catch (error) {
      console.log('❌ Users table not found or error:', error.message);
    }
    console.log('');

    // Check profiles table
    try {
      const profilesCount = await pool.query('SELECT COUNT(*) as count FROM profiles');
      console.log('📝 Profiles table:');
      console.log(`  - Total profiles: ${profilesCount.rows[0].count}`);
      
      if (profilesCount.rows[0].count > 0) {
        const profiles = await pool.query(`
          SELECT p.user_id, u.name, p.academic_background, p.study_goals, p.budget 
          FROM profiles p 
          JOIN users u ON p.user_id = u.id 
          LIMIT 3
        `);
        
        console.log('  - Sample profiles:');
        profiles.rows.forEach(profile => {
          console.log(`    • ${profile.name}: ${profile.academic_background} → ${profile.study_goals} (Budget: ${profile.budget})`);
        });
      }
    } catch (error) {
      console.log('❌ Profiles table not found or error:', error.message);
    }
    console.log('');

    // Check universities table
    try {
      const universitiesCount = await pool.query('SELECT COUNT(*) as count FROM universities');
      console.log('🏫 Universities table:');
      console.log(`  - Total universities: ${universitiesCount.rows[0].count}`);
      
      if (universitiesCount.rows[0].count > 0) {
        const universities = await pool.query(`
          SELECT name, country, world_ranking 
          FROM universities 
          ORDER BY world_ranking ASC 
          LIMIT 5
        `);
        
        console.log('  - Top universities:');
        universities.rows.forEach(uni => {
          console.log(`    • ${uni.name} (${uni.country}) - Rank: ${uni.world_ranking}`);
        });
      }
    } catch (error) {
      console.log('❌ Universities table not found or error:', error.message);
    }
    console.log('');

    // Check shortlists table
    try {
      const shortlistsCount = await pool.query('SELECT COUNT(*) as count FROM shortlists');
      console.log('⭐ Shortlists table:');
      console.log(`  - Total shortlists: ${shortlistsCount.rows[0].count}`);
      
      if (shortlistsCount.rows[0].count > 0) {
        const shortlists = await pool.query(`
          SELECT s.user_id, u.name, COUNT(*) as shortlisted_count,
                 COUNT(CASE WHEN s.is_locked = true THEN 1 END) as locked_count
          FROM shortlists s 
          JOIN users u ON s.user_id = u.id 
          GROUP BY s.user_id, u.name
          LIMIT 3
        `);
        
        console.log('  - User shortlists:');
        shortlists.rows.forEach(shortlist => {
          console.log(`    • ${shortlist.name}: ${shortlist.shortlisted_count} shortlisted, ${shortlist.locked_count} locked`);
        });
      }
    } catch (error) {
      console.log('❌ Shortlists table not found or error:', error.message);
    }
    console.log('');

    // Check tasks table
    try {
      const tasksCount = await pool.query('SELECT COUNT(*) as count FROM tasks');
      console.log('📋 Tasks table:');
      console.log(`  - Total tasks: ${tasksCount.rows[0].count}`);
      
      if (tasksCount.rows[0].count > 0) {
        const tasks = await pool.query(`
          SELECT t.user_id, u.name, COUNT(*) as total_tasks,
                 COUNT(CASE WHEN t.completed = true THEN 1 END) as completed_tasks
          FROM tasks t 
          JOIN users u ON t.user_id = u.id 
          GROUP BY t.user_id, u.name
          LIMIT 3
        `);
        
        console.log('  - User tasks:');
        tasks.rows.forEach(task => {
          console.log(`    • ${task.name}: ${task.completed_tasks}/${task.total_tasks} completed`);
        });
      }
    } catch (error) {
      console.log('❌ Tasks table not found or error:', error.message);
    }
    console.log('');

    // Check for your specific user
    try {
      const yourUser = await pool.query(`
        SELECT u.*, p.academic_background, p.study_goals, p.current_stage
        FROM users u 
        LEFT JOIN profiles p ON u.id = p.user_id 
        WHERE u.email = $1
      `, ['bhaveysaluja5656@gmail.com']);
      
      if (yourUser.rows.length > 0) {
        const user = yourUser.rows[0];
        console.log('🎯 Your user account:');
        console.log(`  - Name: ${user.name}`);
        console.log(`  - Email: ${user.email}`);
        console.log(`  - Role: ${user.role || 'student'}`);
        console.log(`  - Onboarding: ${user.onboarding_completed ? 'Completed' : 'Pending'}`);
        console.log(`  - Academic Background: ${user.academic_background || 'Not set'}`);
        console.log(`  - Study Goals: ${user.study_goals || 'Not set'}`);
        console.log(`  - Current Stage: ${user.current_stage || 'Not set'}`);
        console.log(`  - Created: ${user.created_at}`);
      } else {
        console.log('❌ Your user account (bhaveysaluja5656@gmail.com) not found');
      }
    } catch (error) {
      console.log('❌ Error checking your user account:', error.message);
    }

    console.log('\n🏁 Database check completed!');

  } catch (error) {
    console.error('❌ Database check failed:', error);
  } finally {
    await pool.end();
  }
}

// Run the check
checkDatabaseData();