const express = require('express');
const { pool } = require('../utils/database');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user tasks
router.get('/', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT t.*, u.name as university_name 
       FROM tasks t 
       LEFT JOIN universities u ON t.university_id = u.id 
       WHERE t.user_id = $1 
       ORDER BY t.due_date ASC, t.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create task
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, due_date, university_id } = req.body;
    
    const { rows } = await pool.query(
      `INSERT INTO tasks (user_id, university_id, title, description, due_date) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.user.id, university_id, title, description, due_date]
    );
    
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update task completion
router.patch('/:id/complete', auth, async (req, res) => {
  try {
    const { completed } = req.body;
    
    const { rows } = await pool.query(
      `UPDATE tasks SET completed = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 AND user_id = $3 RETURNING *`,
      [completed, req.params.id, req.user.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate AI-driven tasks for locked university
router.post('/generate/:universityId', auth, async (req, res) => {
  try {
    const universityId = parseInt(req.params.universityId);
    
    // First, verify this university is actually shortlisted and locked by the user
    const { rows: shortlistCheck } = await pool.query(
      'SELECT * FROM shortlists WHERE user_id = $1 AND university_id = $2 AND is_locked = true',
      [req.user.id, universityId]
    );
    
    if (shortlistCheck.length === 0) {
      return res.status(400).json({ 
        message: 'University must be shortlisted and locked before generating tasks' 
      });
    }
    
    // Get university details
    const { rows: university } = await pool.query(
      'SELECT * FROM universities WHERE id = $1',
      [universityId]
    );
    
    if (university.length === 0) {
      return res.status(404).json({ message: 'University not found' });
    }
    
    // Check if tasks already exist for this university
    const { rows: existingTasks } = await pool.query(
      'SELECT COUNT(*) as count FROM tasks WHERE user_id = $1 AND university_id = $2',
      [req.user.id, universityId]
    );
    
    if (existingTasks[0].count > 0) {
      return res.status(400).json({ 
        message: `Tasks already exist for ${university[0].name}. Delete existing tasks first if you want to regenerate.` 
      });
    }
    
    // Generate university-specific tasks
    const tasks = [
      {
        title: `Write Statement of Purpose for ${university[0].name}`,
        description: `Draft your SOP specifically for ${university[0].name}. Research their programs, faculty, and values. Highlight why you're a perfect fit for their ${university[0].country} campus.`,
        due_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
      },
      {
        title: `Request Recommendation Letters for ${university[0].name}`,
        description: `Contact 2-3 professors or supervisors to write recommendation letters for your ${university[0].name} application. Provide them with your resume and SOP draft.`,
        due_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days from now
      },
      {
        title: `Prepare Academic Transcripts for ${university[0].name}`,
        description: `Get official transcripts from your institutions for ${university[0].name} application. Ensure they meet ${university[0].country} education system requirements.`,
        due_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000) // 45 days from now
      },
      {
        title: `Take English Proficiency Test for ${university[0].name}`,
        description: `Schedule and take IELTS/TOEFL test for ${university[0].name} application. Check their specific score requirements for ${university[0].country}.`,
        due_date: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000) // 75 days from now
      },
      {
        title: `Complete ${university[0].name} Application Form`,
        description: `Fill out the online application form for ${university[0].name}. Double-check all information, upload required documents, and review before submission.`,
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      },
      {
        title: `Submit Application to ${university[0].name}`,
        description: `Final submission of your application to ${university[0].name}. Pay application fee, confirm receipt, and save confirmation details.`,
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days from now
      }
    ];
    
    // Insert tasks into database
    const createdTasks = [];
    for (const task of tasks) {
      const { rows } = await pool.query(
        `INSERT INTO tasks (user_id, university_id, title, description, due_date) 
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [req.user.id, universityId, task.title, task.description, task.due_date]
      );
      createdTasks.push(rows[0]);
    }
    
    res.status(201).json({
      message: `Generated ${createdTasks.length} application tasks for ${university[0].name}`,
      tasks: createdTasks
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;