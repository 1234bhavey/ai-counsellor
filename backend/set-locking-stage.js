// Set user to locking stage for testing
const { pool } = require('./utils/database');

async function setLockingStage() {
  try {
    console.log('🔧 Setting up user for locking stage testing...');

    // Get user ID
    const { rows: users } = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      ['bhaveysaluja5656@gmail.com']
    );

    if (users.length === 0) {
      console.log('❌ User not found');
      return;
    }

    const userId = users[0].id;
    console.log(`✅ Found user ID: ${userId}`);

    // Ensure onboarding is completed
    await pool.query(
      'UPDATE users SET onboarding_completed = true WHERE id = $1',
      [userId]
    );
    console.log('✅ Onboarding marked as completed');

    // Add some universities to shortlist (but not locked)
    const { rows: universities } = await pool.query(
      'SELECT id, name FROM universities LIMIT 3'
    );

    for (const university of universities) {
      // Check if already in shortlist
      const { rows: existing } = await pool.query(
        'SELECT id FROM shortlists WHERE user_id = $1 AND university_id = $2',
        [userId, university.id]
      );

      if (existing.length === 0) {
        await pool.query(
          'INSERT INTO shortlists (user_id, university_id, is_locked) VALUES ($1, $2, false)',
          [userId, university.id]
        );
        console.log(`✅ Added ${university.name} to shortlist`);
      } else {
        console.log(`ℹ️ ${university.name} already in shortlist`);
      }
    }

    // Check current stage
    const { rows: userCheck } = await pool.query(
      'SELECT onboarding_completed FROM users WHERE id = $1',
      [userId]
    );

    const { rows: shortlistCheck } = await pool.query(
      'SELECT COUNT(*) as count FROM shortlists WHERE user_id = $1',
      [userId]
    );

    const { rows: lockedCheck } = await pool.query(
      'SELECT COUNT(*) as count FROM shortlists WHERE user_id = $1 AND is_locked = true',
      [userId]
    );

    console.log('\n📊 Current Status:');
    console.log(`- Onboarding completed: ${userCheck[0]?.onboarding_completed}`);
    console.log(`- Universities in shortlist: ${shortlistCheck[0]?.count}`);
    console.log(`- Locked universities: ${lockedCheck[0]?.count}`);

    const shortlistCount = parseInt(shortlistCheck[0]?.count) || 0;
    const lockedCount = parseInt(lockedCheck[0]?.count) || 0;

    let expectedStage = 'onboarding';
    if (userCheck[0]?.onboarding_completed) {
      if (lockedCount > 0) {
        expectedStage = 'application';
      } else if (shortlistCount > 0) {
        expectedStage = 'locking';
      } else {
        expectedStage = 'discovery';
      }
    }

    console.log(`\n🎯 Expected stage: ${expectedStage}`);

    if (expectedStage === 'locking') {
      console.log('\n✅ User is now ready for locking stage testing!');
      console.log('You can run: node test-university-locking.js');
    } else {
      console.log(`\n⚠️ User is in ${expectedStage} stage, not locking`);
    }

    await pool.end();

  } catch (error) {
    console.error('❌ Error setting up locking stage:', error);
    await pool.end();
  }
}

setLockingStage();