const express = require('express');
const { pool } = require('../utils/database');
const auth = require('../middleware/auth');

const router = express.Router();

// Get documents for a specific university
router.get('/university/:universityId', auth, async (req, res) => {
  try {
    const universityId = parseInt(req.params.universityId);
    
    const { rows } = await pool.query(
      `SELECT d.*, u.name as university_name 
       FROM documents d 
       LEFT JOIN universities u ON d.university_id = u.id 
       WHERE d.user_id = $1 AND d.university_id = $2 
       ORDER BY d.category, d.is_required DESC, d.due_date ASC`,
      [req.user.id, universityId]
    );
    
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all documents for user
router.get('/', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT d.*, u.name as university_name 
       FROM documents d 
       LEFT JOIN universities u ON d.university_id = u.id 
       WHERE d.user_id = $1 
       ORDER BY d.university_id, d.category, d.is_required DESC, d.due_date ASC`,
      [req.user.id]
    );
    
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update document completion status
router.patch('/:id/complete', auth, async (req, res) => {
  try {
    const { is_completed, notes } = req.body;
    
    const { rows } = await pool.query(
      `UPDATE documents 
       SET is_completed = $1, notes = $2, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $3 AND user_id = $4 
       RETURNING *`,
      [is_completed, notes || null, req.params.id, req.user.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update document file path (for file uploads)
router.patch('/:id/upload', auth, async (req, res) => {
  try {
    const { file_path } = req.body;
    
    const { rows } = await pool.query(
      `UPDATE documents 
       SET file_path = $1, is_completed = true, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 AND user_id = $3 
       RETURNING *`,
      [file_path, req.params.id, req.user.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get document statistics for user
router.get('/stats', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT 
         COUNT(*) as total_documents,
         COUNT(CASE WHEN is_completed THEN 1 END) as completed_documents,
         COUNT(CASE WHEN is_required AND NOT is_completed THEN 1 END) as required_pending,
         COUNT(CASE WHEN due_date < CURRENT_DATE AND NOT is_completed THEN 1 END) as overdue_documents
       FROM documents 
       WHERE user_id = $1`,
      [req.user.id]
    );
    
    const stats = rows[0];
    stats.completion_percentage = stats.total_documents > 0 
      ? Math.round((stats.completed_documents / stats.total_documents) * 100) 
      : 0;
    
    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get documents grouped by category for a university
router.get('/university/:universityId/grouped', auth, async (req, res) => {
  try {
    const universityId = parseInt(req.params.universityId);
    
    const { rows } = await pool.query(
      `SELECT 
         category,
         COUNT(*) as total_count,
         COUNT(CASE WHEN is_required THEN 1 END) as required_count,
         COUNT(CASE WHEN is_completed THEN 1 END) as completed_count,
         COUNT(CASE WHEN is_required AND NOT is_completed THEN 1 END) as required_pending,
         json_agg(
           json_build_object(
             'id', id,
             'document_name', document_name,
             'description', description,
             'is_required', is_required,
             'is_completed', is_completed,
             'due_date', due_date,
             'notes', notes,
             'file_path', file_path
           ) ORDER BY is_required DESC, due_date ASC
         ) as documents
       FROM documents 
       WHERE user_id = $1 AND university_id = $2 
       GROUP BY category 
       ORDER BY category`,
      [req.user.id, universityId]
    );
    
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;