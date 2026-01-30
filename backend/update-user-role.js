const { pool } = require('./utils/database');

async function updateUserRole() {
  try {
    console.log('🔧 Adding role column and updating user role...');
    
    // First add the role column if it doesn't exist
    try {
      await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'counsellor', 'admin', 'super_admin'))`);
      console.log('✅ Role column added/verified in users table');
    } catch (error) {
      console.log('ℹ️  Role column operation:', error.message);
    }
    
    // Update the existing user to admin role
    const { rows } = await pool.query(
      `UPDATE users 
       SET role = 'admin' 
       WHERE email = 'bhaveysaluja5656@gmail.com' 
       RETURNING id, name, email, role`,
    );
    
    if (rows.length > 0) {
      console.log('✅ User role updated successfully:');
      console.log(`   - Name: ${rows[0].name}`);
      console.log(`   - Email: ${rows[0].email}`);
      console.log(`   - Role: ${rows[0].role}`);
    } else {
      console.log('❌ User not found');
    }
    
    console.log('\n🎉 Role update completed!');
    
  } catch (error) {
    console.error('❌ Error updating user role:', error);
  } finally {
    process.exit(0);
  }
}

updateUserRole();