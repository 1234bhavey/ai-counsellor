const express = require('express');
const bcrypt = require('bcryptjs');
const { pool, findUserById, getProfile } = require('../utils/database');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user profile with all details
router.get('/', auth, async (req, res) => {
  try {
    const user = await findUserById(req.user.id);
    const profile = await getProfile(req.user.id);
    
    // Get user statistics
    const { rows: stats } = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM shortlists WHERE user_id = $1) as shortlisted_count,
        (SELECT COUNT(*) FROM tasks WHERE user_id = $1 AND completed = false) as pending_tasks,
        (SELECT COUNT(*) FROM tasks WHERE user_id = $1 AND completed = true) as completed_tasks
    `, [req.user.id]);
    
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        onboardingCompleted: user.onboarding_completed,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      },
      profile: profile || null,
      statistics: stats[0] || { shortlisted_count: 0, pending_tasks: 0, completed_tasks: 0 }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user basic info
router.patch('/user', auth, async (req, res) => {
  try {
    const { name, email } = req.body;
    
    // Check if email is already taken by another user
    if (email !== req.user.email) {
      const { rows: existingUser } = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, req.user.id]
      );
      
      if (existingUser.length > 0) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }
    
    const { rows } = await pool.query(
      'UPDATE users SET name = $1, email = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [name, email, req.user.id]
    );
    
    res.json({
      user: {
        id: rows[0].id,
        name: rows[0].name,
        email: rows[0].email,
        onboardingCompleted: rows[0].onboarding_completed
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile/preferences
router.patch('/preferences', auth, async (req, res) => {
  try {
    const {
      academicBackground,
      studyGoals,
      budget,
      examReadiness,
      preferredCountries,
      currentStage,
      ieltsOverall,
      ieltsListening,
      ieltsReading,
      ieltsWriting,
      ieltsSpeaking,
      ieltsDate
    } = req.body;
    
    // Check if profile exists
    const existingProfile = await getProfile(req.user.id);
    
    if (existingProfile) {
      // Update existing profile
      const { rows } = await pool.query(`
        UPDATE profiles 
        SET academic_background = $1, study_goals = $2, budget = $3, 
            exam_readiness = $4, preferred_countries = $5, current_stage = $6,
            ielts_overall = $7, ielts_listening = $8, ielts_reading = $9,
            ielts_writing = $10, ielts_speaking = $11, ielts_date = $12,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $13 
        RETURNING *
      `, [academicBackground, studyGoals, budget, examReadiness, preferredCountries, currentStage,
          ieltsOverall, ieltsListening, ieltsReading, ieltsWriting, ieltsSpeaking, ieltsDate, req.user.id]);
      
      res.json({ profile: rows[0] });
    } else {
      // Create new profile
      const { rows } = await pool.query(`
        INSERT INTO profiles (user_id, academic_background, study_goals, budget, exam_readiness, 
                            preferred_countries, current_stage, ielts_overall, ielts_listening, 
                            ielts_reading, ielts_writing, ielts_speaking, ielts_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *
      `, [req.user.id, academicBackground, studyGoals, budget, examReadiness, preferredCountries, 
          currentStage, ieltsOverall, ieltsListening, ieltsReading, ieltsWriting, ieltsSpeaking, ieltsDate]);
      
      res.json({ profile: rows[0] });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password
router.patch('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Get current user with password
    const { rows: userRows } = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    const user = userRows[0];
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password
    await pool.query(
      'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedPassword, req.user.id]
    );
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete account
router.delete('/account', auth, async (req, res) => {
  try {
    const { password } = req.body;
    
    // Get current user with password
    const { rows: userRows } = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    const user = userRows[0];
    
    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Password is incorrect' });
    }
    
    // Delete user (cascade will handle related records)
    await pool.query('DELETE FROM users WHERE id = $1', [req.user.id]);
    
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete profile and all associated data
router.delete('/delete', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log(`🗑️ Starting complete profile deletion for user ${userId}`);
    
    // Begin transaction for data integrity
    await pool.query('BEGIN');
    
    try {
      // Delete all associated data in correct order (respecting foreign keys)
      
      // 1. Delete documents
      const { rows: deletedDocs } = await pool.query(
        'DELETE FROM documents WHERE user_id = $1 RETURNING id',
        [userId]
      );
      console.log(`🗑️ Deleted ${deletedDocs.length} documents`);
      
      // 2. Delete tasks
      const { rows: deletedTasks } = await pool.query(
        'DELETE FROM tasks WHERE user_id = $1 RETURNING id',
        [userId]
      );
      console.log(`🗑️ Deleted ${deletedTasks.length} tasks`);
      
      // 3. Delete shortlists
      const { rows: deletedShortlists } = await pool.query(
        'DELETE FROM shortlists WHERE user_id = $1 RETURNING id',
        [userId]
      );
      console.log(`🗑️ Deleted ${deletedShortlists.length} shortlist entries`);
      
      // 4. Delete profile
      const { rows: deletedProfiles } = await pool.query(
        'DELETE FROM profiles WHERE user_id = $1 RETURNING id',
        [userId]
      );
      console.log(`🗑️ Deleted ${deletedProfiles.length} profile entries`);
      
      // 5. Finally delete the user account
      const { rows: deletedUsers } = await pool.query(
        'DELETE FROM users WHERE id = $1 RETURNING id, name, email',
        [userId]
      );
      console.log(`🗑️ Deleted user account: ${deletedUsers[0]?.name} (${deletedUsers[0]?.email})`);
      
      // Commit transaction
      await pool.query('COMMIT');
      
      console.log(`✅ Complete profile deletion successful for user ${userId}`);
      
      res.json({ 
        message: 'Profile and all associated data deleted successfully',
        deletedData: {
          documents: deletedDocs.length,
          tasks: deletedTasks.length,
          shortlists: deletedShortlists.length,
          profiles: deletedProfiles.length,
          user: deletedUsers.length
        }
      });
      
    } catch (error) {
      // Rollback transaction on error
      await pool.query('ROLLBACK');
      throw error;
    }
    
  } catch (error) {
    console.error('❌ Profile deletion failed:', error);
    res.status(500).json({ message: 'Failed to delete profile. Please try again.' });
  }
});

module.exports = router;