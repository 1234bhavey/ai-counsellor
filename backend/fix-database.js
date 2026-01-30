// Fix Database Schema - Add missing role column
const { pool } = require('./utils/database');

const fixDatabase = async () => {
  try {
    console.log('🔧 Checking database schema...');
    
    // Check if role column exists
    const { rows: columns } = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'role'
    `);
    
    if (columns.length === 0) {
      console.log('❌ Role column missing. Adding...');
      
      // Add role column
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN role VARCHAR(20) DEFAULT 'student' 
        CHECK (role IN ('student', 'counsellor', 'admin', 'super_admin'))
      `);
      
      console.log('✅ Role column added successfully');
    } else {
      console.log('✅ Role column already exists');
    }
    
    // Check if onboarding_completed column exists
    const { rows: onboardingColumns } = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'onboarding_completed'
    `);
    
    if (onboardingColumns.length === 0) {
      console.log('❌ Onboarding_completed column missing. Adding...');
      
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE
      `);
      
      console.log('✅ Onboarding_completed column added successfully');
    } else {
      console.log('✅ Onboarding_completed column already exists');
    }
    
    console.log('✅ Database schema fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing database:', error);
  } finally {
    process.exit(0);
  }
};

fixDatabase();