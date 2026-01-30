// Update User Name to Show Proper Name
const { pool } = require('./utils/database');

const updateUserName = async () => {
  try {
    console.log('👤 Updating user name to show proper name...');
    
    // Check current user
    console.log('\n1️⃣ Checking current user details...');
    const { rows: currentUser } = await pool.query(
      'SELECT id, name, email, role FROM users WHERE email = $1',
      ['bhaveysaluja5656@gmail.com']
    );
    
    if (currentUser.length === 0) {
      console.log('❌ User not found!');
      return;
    }
    
    console.log('Current user details:');
    console.log(`   ID: ${currentUser[0].id}`);
    console.log(`   Name: ${currentUser[0].name}`);
    console.log(`   Email: ${currentUser[0].email}`);
    console.log(`   Role: ${currentUser[0].role}`);
    
    // Update user name to proper name
    console.log('\n2️⃣ Updating user name to "Bhavey Saluja"...');
    const { rows: updatedUser } = await pool.query(
      'UPDATE users SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE email = $2 RETURNING id, name, email, role',
      ['Bhavey Saluja', 'bhaveysaluja5656@gmail.com']
    );
    
    console.log('✅ User name updated successfully!');
    console.log('Updated user details:');
    console.log(`   ID: ${updatedUser[0].id}`);
    console.log(`   Name: ${updatedUser[0].name}`);
    console.log(`   Email: ${updatedUser[0].email}`);
    console.log(`   Role: ${updatedUser[0].role}`);
    
    // Test login to verify the change
    console.log('\n3️⃣ Testing login with updated name...');
    const axios = require('axios');
    try {
      const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
        email: 'bhaveysaluja5656@gmail.com',
        password: '123456'
      });
      
      console.log('✅ Login test successful with updated name!');
      console.log('Login response user data:');
      console.log(`   ID: ${loginResponse.data.user.id}`);
      console.log(`   Name: ${loginResponse.data.user.name}`);
      console.log(`   Email: ${loginResponse.data.user.email}`);
      console.log(`   Role: ${loginResponse.data.user.role}`);
      console.log(`   Onboarding: ${loginResponse.data.user.onboardingCompleted}`);
      
    } catch (apiError) {
      console.log('❌ Login test failed:', apiError.response?.data?.message || apiError.message);
    }
    
    console.log('\n🎉 User name update complete!');
    console.log('\n📋 Updated Login Credentials:');
    console.log('   📧 Email: bhaveysaluja5656@gmail.com');
    console.log('   🔑 Password: 123456');
    console.log('   👤 Name: Bhavey Saluja');
    console.log('   🎯 Role: user');
    
    console.log('\n💡 Now when you login, you will see "Bhavey Saluja" instead of "Test User"!');
    
  } catch (error) {
    console.error('❌ Error updating user name:', error);
  } finally {
    process.exit(0);
  }
};

updateUserName();