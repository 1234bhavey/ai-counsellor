// Remove Admin System - Convert to User-Only
const { pool } = require('./utils/database');
const bcrypt = require('bcryptjs');

const removeAdminSystem = async () => {
  try {
    console.log('🧹 Removing Admin System...');
    
    // 1. Delete all admin users
    console.log('❌ Deleting all admin users...');
    const { rows: deletedAdmins } = await pool.query(
      "DELETE FROM users WHERE role IN ('admin', 'super_admin', 'counsellor') RETURNING email"
    );
    
    if (deletedAdmins.length > 0) {
      console.log(`✅ Deleted ${deletedAdmins.length} admin users:`);
      deletedAdmins.forEach(user => console.log(`   - ${user.email}`));
    } else {
      console.log('✅ No admin users found to delete');
    }
    
    // 2. Update role column to only allow 'student' (rename to 'user')
    console.log('🔧 Updating role constraints...');
    await pool.query(`
      ALTER TABLE users 
      DROP CONSTRAINT IF EXISTS users_role_check
    `);
    
    await pool.query(`
      ALTER TABLE users 
      ADD CONSTRAINT users_role_check 
      CHECK (role IN ('student', 'user'))
    `);
    
    // 3. Update any remaining users to 'user' role
    await pool.query(`
      UPDATE users SET role = 'user' WHERE role = 'student'
    `);
    
    // 4. Create new test user as regular user
    console.log('👤 Creating new test user (regular user)...');
    const testEmail = 'bhaveysaluja5656@gmail.com';
    const testPassword = '123456';
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    
    const { rows: newUser } = await pool.query(
      'INSERT INTO users (name, email, password, role, onboarding_completed) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      ['Bhavey Saluja', testEmail, hashedPassword, 'user', true]
    );
    
    // 5. Create profile for test user
    await pool.query(
      `INSERT INTO profiles (user_id, academic_background, study_goals, budget, exam_readiness, preferred_countries, current_stage) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        newUser[0].id,
        'bachelors',
        'masters',
        'medium',
        'preparing',
        ['USA', 'Canada', 'UK'],
        'discovery'
      ]
    );
    
    console.log('✅ New test user created successfully!');
    console.log(`📧 Email: ${testEmail}`);
    console.log(`🔑 Password: ${testPassword}`);
    console.log(`👤 Role: user`);
    
    console.log('\n🎉 Admin system removed successfully!');
    console.log('📝 System is now USER-ONLY');
    console.log('🚫 No admin functionality available');
    
  } catch (error) {
    console.error('❌ Error removing admin system:', error);
  } finally {
    process.exit(0);
  }
};

removeAdminSystem();