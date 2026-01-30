const express = require('express');
const { getUniversities, shortlistUniversity, lockUniversity } = require('../utils/database');
const auth = require('../middleware/auth');

const router = express.Router();

// Get universities with filters
router.get('/', auth, async (req, res) => {
  try {
    const { country, budget, category } = req.query;
    const universities = await getUniversities({ country, budget, category });
    res.json(universities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get shortlisted universities
router.get('/shortlisted', auth, async (req, res) => {
  try {
    const { pool } = require('../utils/database');
    const { rows } = await pool.query(`
      SELECT u.*, s.is_locked, s.created_at as shortlisted_date
      FROM universities u 
      JOIN shortlists s ON u.id = s.university_id 
      WHERE s.user_id = $1
      ORDER BY s.is_locked DESC, s.created_at DESC
    `, [req.user.id]);
    
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Shortlist university
router.post('/:id/shortlist', auth, async (req, res) => {
  try {
    const universityId = parseInt(req.params.id);
    const isShortlisted = await shortlistUniversity(req.user.id, universityId);
    
    res.json({
      message: isShortlisted ? 'University shortlisted' : 'University removed from shortlist',
      isShortlisted
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Lock university
router.post('/:id/lock', auth, async (req, res) => {
  try {
    const universityId = parseInt(req.params.id);
    await lockUniversity(req.user.id, universityId);
    
    res.json({
      message: 'University locked successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;