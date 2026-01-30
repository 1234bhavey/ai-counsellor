require('dotenv').config();
const { createUser } = require('./utils/database');
const bcrypt = require('bcryptjs');

async function createTestUser() {
  try {
    const userData = {
      name: 'Bhavey Saluja',
      email: 'bhaveysaluja5656@gmail.com',
      password: await bcrypt.hash('123456', 10) // Using '123456' as password
    };
    
    console.log('🔄 Creating user:', userData.email);
    
    const user = await createUser(userData);
    
    console.log('✅ User created successfully:');
    console.log('- ID:', user.id);
    console.log('- Name:', user.name);
    console.log('- Email:', user.email);
    console.log('- Password: 123456');
    console.log('');
    console.log('🎉 You can now login with:');
    console.log('Email: bhaveysaluja5656@gmail.com');
    console.log('Password: 123456');
    
  } catch (error) {
    if (error.code === '23505') {
      console.log('⚠️ User already exists! Try logging in with existing password.');
    } else {
      console.error('❌ Failed to create user:', error.message);
    }
  }
  
  process.exit(0);
}

createTestUser();