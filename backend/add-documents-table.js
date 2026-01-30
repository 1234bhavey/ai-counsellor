// Add Documents Checklist Table
const { pool } = require('./utils/database');

const addDocumentsTable = async () => {
  try {
    console.log('📋 Creating documents checklist table...');
    
    // Create documents table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        university_id INTEGER REFERENCES universities(id) ON DELETE CASCADE,
        category VARCHAR(100) NOT NULL,
        document_name VARCHAR(255) NOT NULL,
        description TEXT,
        is_required BOOLEAN DEFAULT true,
        is_completed BOOLEAN DEFAULT false,
        file_path VARCHAR(500),
        notes TEXT,
        due_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Documents table created successfully');
    
    // Add some sample documents for Stanford University (locked university)
    console.log('📄 Adding sample document checklist for Stanford University...');
    
    // Get user and Stanford university
    const { rows: users } = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      ['bhaveysaluja5656@gmail.com']
    );
    
    const { rows: universities } = await pool.query(
      'SELECT id FROM universities WHERE name = $1',
      ['Stanford University']
    );
    
    if (users.length === 0 || universities.length === 0) {
      console.log('❌ User or Stanford University not found');
      return;
    }
    
    const userId = users[0].id;
    const universityId = universities[0].id;
    
    // Clear existing documents for clean demo
    await pool.query('DELETE FROM documents WHERE user_id = $1 AND university_id = $2', [userId, universityId]);
    
    const documents = [
      {
        type: 'Academic',
        name: 'Official Transcripts',
        description: 'Official transcripts from all attended institutions, sealed and authenticated',
        required: true,
        due_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
      },
      {
        type: 'Academic',
        name: 'Degree Certificate',
        description: 'Official degree certificate or provisional certificate if final not available',
        required: true,
        due_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
      },
      {
        type: 'Test Scores',
        name: 'TOEFL/IELTS Score Report',
        description: 'Official English proficiency test scores (TOEFL iBT 100+ or IELTS 7.0+)',
        required: true,
        due_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
      },
      {
        type: 'Test Scores',
        name: 'GRE General Test Scores',
        description: 'Official GRE General Test scores sent directly from ETS',
        required: true,
        due_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
      },
      {
        type: 'Essays',
        name: 'Statement of Purpose',
        description: 'Personal statement explaining your academic goals and why Stanford (max 2 pages)',
        required: true,
        due_date: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000)
      },
      {
        type: 'Essays',
        name: 'Personal History Statement',
        description: 'Statement about your background, experiences, and challenges overcome',
        required: false,
        due_date: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000)
      },
      {
        type: 'Recommendations',
        name: 'Letter of Recommendation #1',
        description: 'Academic reference from professor or supervisor who knows your work well',
        required: true,
        due_date: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000)
      },
      {
        type: 'Recommendations',
        name: 'Letter of Recommendation #2',
        description: 'Second academic or professional reference',
        required: true,
        due_date: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000)
      },
      {
        type: 'Recommendations',
        name: 'Letter of Recommendation #3',
        description: 'Third reference (academic or professional)',
        required: false,
        due_date: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000)
      },
      {
        type: 'Financial',
        name: 'Bank Statements',
        description: 'Bank statements showing sufficient funds for tuition and living expenses',
        required: true,
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      {
        type: 'Financial',
        name: 'Affidavit of Support',
        description: 'Financial support affidavit from sponsor if applicable',
        required: false,
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      {
        type: 'Identity',
        name: 'Passport Copy',
        description: 'Clear copy of passport (valid for at least 6 months)',
        required: true,
        due_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000)
      },
      {
        type: 'Additional',
        name: 'Resume/CV',
        description: 'Updated academic/professional resume highlighting relevant experience',
        required: true,
        due_date: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000)
      },
      {
        type: 'Additional',
        name: 'Portfolio/Work Samples',
        description: 'Portfolio or work samples if required by your specific program',
        required: false,
        due_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
      }
    ];
    
    // Insert documents
    for (const doc of documents) {
      await pool.query(`
        INSERT INTO documents (user_id, university_id, category, document_name, description, is_required, due_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [userId, universityId, doc.type, doc.name, doc.description, doc.required, doc.due_date]);
    }
    
    console.log(`✅ Added ${documents.length} document checklist items for Stanford University`);
    
    // Show summary
    const { rows: summary } = await pool.query(`
      SELECT category, COUNT(*) as count, 
             COUNT(CASE WHEN is_required THEN 1 END) as required_count
      FROM documents 
      WHERE user_id = $1 AND university_id = $2 
      GROUP BY category 
      ORDER BY category
    `, [userId, universityId]);
    
    console.log('\n📊 Document checklist summary:');
    summary.forEach(item => {
      console.log(`   ${item.category}: ${item.count} total (${item.required_count} required)`);
    });
    
    console.log('\n🎉 Document checklist system ready!');
    console.log('💡 Users can now track their application documents progress');
    
  } catch (error) {
    console.error('❌ Error creating documents table:', error);
  } finally {
    process.exit(0);
  }
};

addDocumentsTable();