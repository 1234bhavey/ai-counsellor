// Populate Shortlist with More Universities for Better Demo
const { pool } = require('./utils/database');

const populateShortlist = async () => {
  try {
    console.log('🎯 Populating shortlist with more universities...');
    
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
    
    // Clear existing shortlist
    await pool.query('DELETE FROM shortlists WHERE user_id = $1', [userId]);
    
    // Get universities to add to shortlist
    const { rows: universities } = await pool.query(
      'SELECT id, name, country, category FROM universities ORDER BY name'
    );
    
    if (universities.length === 0) {
      console.log('❌ No universities found in database');
      return;
    }
    
    // Add a good mix of universities to shortlist
    const shortlistData = [
      { universityId: 1, isLocked: true },   // Stanford (Dream) - Locked
      { universityId: 2, isLocked: false },  // MIT (Dream)
      { universityId: 3, isLocked: false },  // Toronto (Target)
      { universityId: 4, isLocked: false },  // Edinburgh (Target)
      { universityId: 5, isLocked: false },  // Melbourne (Target)
      { universityId: 6, isLocked: false }   // ASU (Safe)
    ];
    
    for (const item of shortlistData) {
      const university = universities.find(u => u.id === item.universityId);
      if (university) {
        await pool.query(
          'INSERT INTO shortlists (user_id, university_id, is_locked) VALUES ($1, $2, $3)',
          [userId, item.universityId, item.isLocked]
        );
        
        console.log(`✅ Added ${university.name} (${university.country}) ${item.isLocked ? '🔒 LOCKED' : '📋 Shortlisted'}`);
      }
    }
    
    // Get final count
    const { rows: finalCount } = await pool.query(
      'SELECT COUNT(*) as total, COUNT(CASE WHEN is_locked THEN 1 END) as locked FROM shortlists WHERE user_id = $1',
      [userId]
    );
    
    console.log('\n🎉 Shortlist populated successfully!');
    console.log(`📊 Total shortlisted: ${finalCount[0].total}`);
    console.log(`🔒 Locked universities: ${finalCount[0].locked}`);
    console.log(`📋 Pending decisions: ${finalCount[0].total - finalCount[0].locked}`);
    console.log('\n💡 The shortlisted page should now show a rich demo experience!');
    
  } catch (error) {
    console.error('❌ Error populating shortlist:', error);
  } finally {
    process.exit(0);
  }
};

populateShortlist();