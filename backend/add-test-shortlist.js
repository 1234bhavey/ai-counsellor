// Add Test Shortlisted Universities for Demo
const { pool } = require('./utils/database');

const addTestShortlist = async () => {
  try {
    console.log('🎯 Adding test shortlisted universities...');
    
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
    
    // Get some universities to shortlist
    const { rows: universities } = await pool.query(
      'SELECT id, name FROM universities LIMIT 5'
    );
    
    if (universities.length === 0) {
      console.log('❌ No universities found in database');
      return;
    }
    
    // Clear existing shortlist for clean demo
    await pool.query('DELETE FROM shortlists WHERE user_id = $1', [userId]);
    
    // Add universities to shortlist
    for (let i = 0; i < Math.min(4, universities.length); i++) {
      const university = universities[i];
      const isLocked = i === 0; // Lock the first one for demo
      
      await pool.query(
        'INSERT INTO shortlists (user_id, university_id, is_locked) VALUES ($1, $2, $3)',
        [userId, university.id, isLocked]
      );
      
      console.log(`✅ Added ${university.name} to shortlist ${isLocked ? '(LOCKED)' : ''}`);
    }
    
    console.log('\n🎉 Test shortlist created successfully!');
    console.log('📝 You now have sample shortlisted universities to view');
    console.log('🔒 One university is locked to demonstrate the application flow');
    
  } catch (error) {
    console.error('❌ Error adding test shortlist:', error);
  } finally {
    process.exit(0);
  }
};

addTestShortlist();