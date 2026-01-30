// Complete Shortlist with All 6 Universities
const { pool } = require('./utils/database');

const completeShortlist = async () => {
  try {
    console.log('🎯 Completing shortlist with all 6 universities...');
    
    // Get user
    const { rows: users } = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      ['bhaveysaluja5656@gmail.com']
    );
    
    const userId = users[0].id;
    
    // Check current shortlist
    const { rows: current } = await pool.query(`
      SELECT s.*, u.name as university_name
      FROM shortlists s
      JOIN universities u ON s.university_id = u.id
      WHERE s.user_id = $1
      ORDER BY u.name
    `, [userId]);
    
    console.log(`\n📋 Current shortlist has ${current.length} universities:`);
    current.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.university_name} - ${item.is_locked ? 'LOCKED' : 'Shortlisted'}`);
    });
    
    // Add missing universities
    const targetUniversities = [
      { name: 'Stanford University', should_be_locked: true },
      { name: 'MIT', should_be_locked: false },
      { name: 'University of Toronto', should_be_locked: false },
      { name: 'University of Edinburgh', should_be_locked: false },
      { name: 'University of Melbourne', should_be_locked: false },
      { name: 'Arizona State University', should_be_locked: false }
    ];
    
    console.log('\n🔄 Adding missing universities...');
    
    for (const target of targetUniversities) {
      // Get university ID
      const { rows: university } = await pool.query(
        'SELECT id FROM universities WHERE name = $1',
        [target.name]
      );
      
      if (university.length === 0) {
        console.log(`   ❌ University not found: ${target.name}`);
        continue;
      }
      
      const universityId = university[0].id;
      
      // Check if already shortlisted
      const { rows: existing } = await pool.query(
        'SELECT * FROM shortlists WHERE user_id = $1 AND university_id = $2',
        [userId, universityId]
      );
      
      if (existing.length === 0) {
        // Add to shortlist
        await pool.query(
          'INSERT INTO shortlists (user_id, university_id, is_locked) VALUES ($1, $2, $3)',
          [userId, universityId, target.should_be_locked]
        );
        console.log(`   ✅ Added ${target.name} to shortlist ${target.should_be_locked ? '(LOCKED)' : ''}`);
      } else {
        // Update lock status if needed
        if (existing[0].is_locked !== target.should_be_locked) {
          await pool.query(
            'UPDATE shortlists SET is_locked = $1 WHERE user_id = $2 AND university_id = $3',
            [target.should_be_locked, userId, universityId]
          );
          console.log(`   🔄 Updated ${target.name} lock status to ${target.should_be_locked ? 'LOCKED' : 'UNLOCKED'}`);
        } else {
          console.log(`   ✅ ${target.name} already in shortlist`);
        }
      }
    }
    
    // Show final shortlist
    const { rows: final } = await pool.query(`
      SELECT s.*, u.name as university_name, u.country
      FROM shortlists s
      JOIN universities u ON s.university_id = u.id
      WHERE s.user_id = $1
      ORDER BY u.name
    `, [userId]);
    
    console.log(`\n🎉 Final shortlist has ${final.length} universities:`);
    final.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.university_name} (${item.country}) - ${item.is_locked ? 'LOCKED' : 'Shortlisted'}`);
    });
    
    console.log('\n✅ Shortlist completed successfully!');
    
  } catch (error) {
    console.error('❌ Error completing shortlist:', error);
  } finally {
    process.exit(0);
  }
};

completeShortlist();