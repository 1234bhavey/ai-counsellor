// Fix Login Database Issues
const { pool } = require('./utils/database');
const bcrypt = require('bcryptjs');

const fixLoginDatabase = async () => {
  try {
    console.log('🔧 Fixing login database issues...');
    
    // Step 1: Check current users table structure
    console.log('\n1️⃣ Checking current users table structure...');
    const { rows: columns } = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    console.log('Current users table columns:');
    columns.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type}`);
    });
    
    // Step 2: Add role column if it doesn't exist
    const hasRoleColumn = columns.some(col => col.column_name === 'role');
    if (!hasRoleColumn) {
      console.log('\n2️⃣ Adding missing role column...');
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN role VARCHAR(50) DEFAULT 'user'
      `);
      console.log('✅ Role column added successfully');
    } else {
      console.log('\n2️⃣ Role column already exists');
    }
    
    // Step 3: Check if test user exists
    console.log('\n3️⃣ Checking test user...');
    const { rows: users } = await pool.query(
      'SELECT id, email, name, role FROM users WHERE email = $1',
      ['bhaveysaluja5656@gmail.com']
    );
    
    if (users.length === 0) {
      console.log('❌ Test user does not exist. Creating...');
      
      // Hash password
      const hashedPassword = await bcrypt.hash('123456', 10);
      
      // Create user
      const { rows: newUser } = await pool.query(`
        INSERT INTO users (name, email, password, role, onboarding_completed) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING id, email, name, role
      `, ['Test User', 'bhaveysaluja5656@gmail.com', hashedPassword, 'user', true]);
      
      console.log('✅ Test user created:');
      console.log(`   ID: ${newUser[0].id}`);
      console.log(`   Email: ${newUser[0].email}`);
      console.log(`   Name: ${newUser[0].name}`);
      console.log(`   Role: ${newUser[0].role}`);
    } else {
      console.log('✅ Test user exists:');
      const user = users[0];
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Role: ${user.role || 'NULL (will be updated)'}`);
      
      // Update role if it's null
      if (!user.role) {
        await pool.query(
          'UPDATE users SET role = $1 WHERE email = $2',
          ['user', 'bhaveysaluja5656@gmail.com']
        );
        console.log('✅ Role updated to "user"');
      }
      
      // Update password to ensure it's correct
      console.log('\n🔄 Updating password to ensure it\'s correct...');
      const hashedPassword = await bcrypt.hash('123456', 10);
      await pool.query(
        'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE email = $2',
        [hashedPassword, 'bhaveysaluja5656@gmail.com']
      );
      console.log('✅ Password updated');
    }
    
    // Step 4: Test password verification
    console.log('\n4️⃣ Testing password verification...');
    const { rows: userTest } = await pool.query(
      'SELECT password FROM users WHERE email = $1',
      ['bhaveysaluja5656@gmail.com']
    );
    
    const isValid = await bcrypt.compare('123456', userTest[0].password);
    if (isValid) {
      console.log('✅ Password verification successful');
    } else {
      console.log('❌ Password verification failed');
    }
    
    // Step 5: Show final user state
    console.log('\n5️⃣ Final user state:');
    const { rows: finalUser } = await pool.query(
      'SELECT id, name, email, role, onboarding_completed, created_at FROM users WHERE email = $1',
      ['bhaveysaluja5656@gmail.com']
    );
    
    const user = finalUser[0];
    console.log('✅ User details:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Onboarding: ${user.onboarding_completed ? 'Completed' : 'Pending'}`);
    console.log(`   Created: ${user.created_at}`);
    
    console.log('\n🎉 Database fix complete!');
    console.log('\n📋 Login Credentials:');
    console.log('   📧 Email: bhaveysaluja5656@gmail.com');
    console.log('   🔑 Password: 123456');
    console.log('\n💡 The login should now work properly!');
    
  } catch (error) {
    console.error('❌ Error fixing database:', error);
  } finally {
    process.exit(0);
  }
};

fixLoginDatabase();