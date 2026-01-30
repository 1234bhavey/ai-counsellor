require('dotenv').config();
const { pool } = require('./utils/database');
const bcrypt = require('bcryptjs');

async function debugDatabase() {
  try {
    console.log('🔍 Checking database connection...');
    
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connected');
    
    // Check all users
    const { rows: allUsers } = await pool.query('SELECT id, name, email, onboarding_completed FROM users');
    console.log(`📊 Total users in database: ${allUsers.length}`);
    
    if (allUsers.length > 0) {
      console.log('👥 All users:');
      allUsers.forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user.id}, Name: ${user.name}, Email: ${user.email}`);
      });
    }
    
    // Check specific user
    const email = 'bhaveysaluja5656@gmail.com';
    const { rows: specificUser } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (specificUser.length > 0) {
      const user = specificUser[0];
      console.log(`\n✅ Found user: ${email}`);
      console.log('- ID:', user.id);
      console.log('- Name:', user.name);
      console.log('- Email:', user.email);
      console.log('- Onboarding:', user.onboarding_completed);
      
      // Test common passwords
      const passwords = ['123456', 'password', '12345678', 'bhavey123'];
      
      for (const pwd of passwords) {
        try {
          const isMatch = await bcrypt.compare(pwd, user.password);
          console.log(`🔐 Password '${pwd}': ${isMatch ? '✅ MATCH' : '❌ No match'}`);
          if (isMatch) {
            console.log(`\n🎉 LOGIN CREDENTIALS:`);
            console.log(`Email: ${email}`);
            console.log(`Password: ${pwd}`);
            break;
          }
        } catch (err) {
          console.log(`🔐 Password '${pwd}': Error testing`);
        }
      }
    } else {
      console.log(`❌ User not found: ${email}`);
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
  
  process.exit(0);
}

debugDatabase();