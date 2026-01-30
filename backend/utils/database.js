const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Use DATABASE_URL for production (Render) or individual vars for development
const pool = process.env.DATABASE_URL 
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    })
  : new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'ai_counsellor',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
    });

const initDB = async () => {
  try {
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('Database connected successfully');
    
    // Run schema if tables don't exist
    const { rows } = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users'
    `);
    
    if (rows.length === 0) {
      console.log('Initializing database schema...');
      const schemaSQL = fs.readFileSync(path.join(__dirname, '../database/init-schema.sql'), 'utf8');
      await pool.query(schemaSQL);
      console.log('Database schema initialized successfully');
    } else {
      console.log('Database schema already exists');
    }
    
    // Ensure test user exists (create if missing)
    await ensureTestUserExists();
    
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
};

const ensureTestUserExists = async () => {
  try {
    const testEmail = 'bhaveysaluja5656@gmail.com';
    const testPassword = '123456'; // Plain text - will be hashed by auth route
    
    // Check if test user exists
    const { rows: existingUser } = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [testEmail]
    );
    
    if (existingUser.length === 0) {
      console.log('Creating test user...');
      
      // Create test user with hashed password (REGULAR USER ONLY)
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      
      const { rows: newUser } = await pool.query(
        'INSERT INTO users (name, email, password, role, onboarding_completed) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        ['Bhavey Saluja', testEmail, hashedPassword, 'user', true]
      );
      
      // Create a basic profile for the test user
      await pool.query(
        `INSERT INTO profiles (user_id, academic_background, study_goals, budget, exam_readiness, preferred_countries, current_stage) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          newUser[0].id,
          'bachelors',
          'masters',
          'medium',
          'preparing',
          ['USA', 'Canada', 'UK'],
          'discovery'
        ]
      );
      
      console.log('✅ Test user created successfully');
      console.log(`📧 Email: ${testEmail}`);
      console.log(`🔑 Password: ${testPassword}`);
      console.log(`👤 Name: Bhavey Saluja`);
      console.log(`🎯 Role: user (NO ADMIN)`);
    } else {
      console.log('✅ Test user already exists');
    }
  } catch (error) {
    console.error('❌ Error ensuring test user exists:', error);
    // Don't throw error - let the app continue even if user creation fails
  }
};

// User operations
const findUser = async (email) => {
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0];
};

const findUserById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return rows[0];
};

const createUser = async (userData) => {
  const { name, email, password } = userData;
  const { rows } = await pool.query(
    'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
    [name, email, password]
  );
  return rows[0];
};

const updateUser = async (id, updates) => {
  const { onboardingCompleted } = updates;
  const { rows } = await pool.query(
    'UPDATE users SET onboarding_completed = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
    [onboardingCompleted, id]
  );
  return rows[0];
};

// Profile operations
const createProfile = async (userId, profileData) => {
  const { academicBackground, studyGoals, budget, examReadiness, preferredCountries, currentStage } = profileData;
  
  const { rows } = await pool.query(
    `INSERT INTO profiles (user_id, academic_background, study_goals, budget, exam_readiness, preferred_countries, current_stage) 
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [userId, academicBackground, studyGoals, budget, examReadiness, preferredCountries, currentStage]
  );
  
  // Update user onboarding status
  await updateUser(userId, { onboardingCompleted: true });
  
  return rows[0];
};

const getProfile = async (userId) => {
  const { rows } = await pool.query('SELECT * FROM profiles WHERE user_id = $1', [userId]);
  return rows[0];
};

// University operations
const getUniversities = async (filters = {}) => {
  let query = 'SELECT * FROM universities';
  const conditions = [];
  const values = [];
  
  if (filters.country) {
    conditions.push(`country = $${values.length + 1}`);
    values.push(filters.country);
  }
  
  if (filters.category && filters.category !== 'all') {
    conditions.push(`category = $${values.length + 1}`);
    values.push(filters.category);
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  
  query += ' ORDER BY category, name';
  
  const { rows } = await pool.query(query, values);
  return rows;
};

// Shortlist operations
const shortlistUniversity = async (userId, universityId) => {
  try {
    // Check if already shortlisted
    const { rows: existing } = await pool.query(
      'SELECT * FROM shortlists WHERE user_id = $1 AND university_id = $2',
      [userId, universityId]
    );
    
    if (existing.length > 0) {
      // Remove from shortlist and clean up associated data
      console.log(`🗑️ Removing university ${universityId} from shortlist for user ${userId}`);
      
      // Delete associated documents
      const { rows: deletedDocs } = await pool.query(
        'DELETE FROM documents WHERE user_id = $1 AND university_id = $2 RETURNING id',
        [userId, universityId]
      );
      console.log(`🗑️ Deleted ${deletedDocs.length} documents`);
      
      // Delete associated tasks
      const { rows: deletedTasks } = await pool.query(
        'DELETE FROM tasks WHERE user_id = $1 AND university_id = $2 RETURNING id',
        [userId, universityId]
      );
      console.log(`🗑️ Deleted ${deletedTasks.length} tasks`);
      
      // Remove from shortlist
      await pool.query(
        'DELETE FROM shortlists WHERE user_id = $1 AND university_id = $2',
        [userId, universityId]
      );
      console.log(`✅ University ${universityId} completely removed from shortlist`);
      
      return false;
    } else {
      // Add to shortlist
      await pool.query(
        'INSERT INTO shortlists (user_id, university_id) VALUES ($1, $2)',
        [userId, universityId]
      );
      console.log(`✅ University ${universityId} added to shortlist for user ${userId}`);
      return true;
    }
  } catch (error) {
    console.error('Shortlist operation failed:', error);
    throw error;
  }
};

const lockUniversity = async (userId, universityId) => {
  try {
    // Remove any existing locks for this user
    await pool.query(
      'UPDATE shortlists SET is_locked = FALSE WHERE user_id = $1',
      [userId]
    );
    
    // Check if university is shortlisted, if not add it
    const { rows: existing } = await pool.query(
      'SELECT * FROM shortlists WHERE user_id = $1 AND university_id = $2',
      [userId, universityId]
    );
    
    if (existing.length === 0) {
      await pool.query(
        'INSERT INTO shortlists (user_id, university_id, is_locked) VALUES ($1, $2, TRUE)',
        [userId, universityId]
      );
    } else {
      await pool.query(
        'UPDATE shortlists SET is_locked = TRUE WHERE user_id = $1 AND university_id = $2',
        [userId, universityId]
      );
    }
    
    return true;
  } catch (error) {
    console.error('Lock operation failed:', error);
    throw error;
  }
};

// Dashboard stats
const getUserStats = async (userId) => {
  try {
    // Get shortlisted universities count
    const { rows: shortlistCount } = await pool.query(
      'SELECT COUNT(*) as count FROM shortlists WHERE user_id = $1',
      [userId]
    );
    
    // Get locked university
    const { rows: lockedUniversity } = await pool.query(
      `SELECT u.* FROM universities u 
       JOIN shortlists s ON u.id = s.university_id 
       WHERE s.user_id = $1 AND s.is_locked = TRUE`,
      [userId]
    );
    
    // Get task counts
    const { rows: taskStats } = await pool.query(
      `SELECT 
         COUNT(*) as total_tasks,
         COUNT(CASE WHEN completed = TRUE THEN 1 END) as completed_tasks,
         COUNT(CASE WHEN completed = FALSE THEN 1 END) as pending_tasks
       FROM tasks WHERE user_id = $1`,
      [userId]
    );
    
    return {
      shortlistedUniversities: parseInt(shortlistCount[0].count),
      lockedUniversity: lockedUniversity[0] || null,
      pendingTasks: parseInt(taskStats[0]?.pending_tasks || 0),
      completedTasks: parseInt(taskStats[0]?.completed_tasks || 0)
    };
  } catch (error) {
    console.error('Stats fetch failed:', error);
    throw error;
  }
};

module.exports = {
  pool,
  initDB,
  findUser,
  findUserById,
  createUser,
  updateUser,
  createProfile,
  getProfile,
  getUniversities,
  shortlistUniversity,
  lockUniversity,
  getUserStats
};