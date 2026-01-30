// Create Document Checklists for ALL Shortlisted Universities
const { pool } = require('./utils/database');

const createDocumentsForAllUniversities = async () => {
  try {
    console.log('📋 Creating document checklists for ALL shortlisted universities...');
    
    // Get user
    const { rows: users } = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      ['bhaveysaluja5656@gmail.com']
    );
    
    if (users.length === 0) {
      console.log('❌ User not found');
      return;
    }
    
    const userId = users[0].id;
    
    // Get all shortlisted universities
    const { rows: universities } = await pool.query(`
      SELECT DISTINCT u.id, u.name, u.country
      FROM universities u
      INNER JOIN shortlists s ON u.id = s.university_id
      WHERE s.user_id = $1
      ORDER BY u.name
    `, [userId]);
    
    console.log(`\n🎯 Found ${universities.length} shortlisted universities:`);
    universities.forEach(uni => {
      console.log(`   • ${uni.name} (${uni.country}) - ID: ${uni.id}`);
    });
    
    // Clear existing documents for clean demo
    console.log('\n🧹 Clearing existing documents...');
    await pool.query('DELETE FROM documents WHERE user_id = $1', [userId]);
    console.log('✅ Existing documents cleared');
    
    // Document templates for different countries/regions
    const getDocumentTemplate = (universityName, country) => {
      const baseDocuments = [
        {
          category: 'Academic',
          name: 'Official Transcripts',
          description: `Official transcripts from all attended institutions for ${universityName} application`,
          required: true,
          due_days: 45
        },
        {
          category: 'Academic',
          name: 'Degree Certificate',
          description: `Official degree certificate or provisional certificate for ${universityName}`,
          required: true,
          due_days: 45
        },
        {
          category: 'Test Scores',
          name: 'English Proficiency Test',
          description: `TOEFL/IELTS scores for ${universityName} (${country} requirements)`,
          required: true,
          due_days: 60
        },
        {
          category: 'Essays',
          name: 'Statement of Purpose',
          description: `Personal statement explaining your goals and why ${universityName} (max 2 pages)`,
          required: true,
          due_days: 75
        },
        {
          category: 'Essays',
          name: 'Personal Statement',
          description: `Statement about your background and experiences for ${universityName}`,
          required: false,
          due_days: 75
        },
        {
          category: 'Recommendations',
          name: 'Letter of Recommendation #1',
          description: `Academic reference from professor for ${universityName} application`,
          required: true,
          due_days: 50
        },
        {
          category: 'Recommendations',
          name: 'Letter of Recommendation #2',
          description: `Second academic or professional reference for ${universityName}`,
          required: true,
          due_days: 50
        },
        {
          category: 'Financial',
          name: 'Bank Statements',
          description: `Financial documents showing funds for ${universityName} tuition and living costs`,
          required: true,
          due_days: 30
        },
        {
          category: 'Identity',
          name: 'Passport Copy',
          description: `Valid passport copy for ${universityName} application (6+ months validity)`,
          required: true,
          due_days: 20
        },
        {
          category: 'Additional',
          name: 'Resume/CV',
          description: `Updated academic/professional resume for ${universityName}`,
          required: true,
          due_days: 40
        }
      ];
      
      // Add country-specific documents
      if (country === 'USA') {
        baseDocuments.push(
          {
            category: 'Test Scores',
            name: 'GRE/GMAT Scores',
            description: `Standardized test scores for ${universityName} (USA requirement)`,
            required: true,
            due_days: 60
          },
          {
            category: 'Financial',
            name: 'I-20 Financial Support',
            description: `Financial support documentation for I-20 form (${universityName})`,
            required: true,
            due_days: 30
          }
        );
      } else if (country === 'UK') {
        baseDocuments.push(
          {
            category: 'Additional',
            name: 'UCAS Personal Statement',
            description: `UCAS-style personal statement for ${universityName} (UK format)`,
            required: true,
            due_days: 70
          },
          {
            category: 'Financial',
            name: 'CAS Financial Evidence',
            description: `Financial evidence for CAS (Confirmation of Acceptance) - ${universityName}`,
            required: true,
            due_days: 25
          }
        );
      } else if (country === 'Canada') {
        baseDocuments.push(
          {
            category: 'Additional',
            name: 'Study Permit Documents',
            description: `Documents required for Canadian study permit application (${universityName})`,
            required: true,
            due_days: 35
          }
        );
      } else if (country === 'Australia') {
        baseDocuments.push(
          {
            category: 'Additional',
            name: 'Student Visa Documents',
            description: `Documents for Australian student visa application (${universityName})`,
            required: true,
            due_days: 35
          }
        );
      }
      
      return baseDocuments;
    };
    
    // Create documents for each university
    let totalDocuments = 0;
    
    for (const university of universities) {
      console.log(`\n📄 Creating documents for ${university.name}...`);
      
      const documents = getDocumentTemplate(university.name, university.country);
      
      for (const doc of documents) {
        const dueDate = new Date(Date.now() + doc.due_days * 24 * 60 * 60 * 1000);
        
        await pool.query(`
          INSERT INTO documents (user_id, university_id, category, document_name, description, is_required, due_date)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [userId, university.id, doc.category, doc.name, doc.description, doc.required, dueDate]);
        
        totalDocuments++;
      }
      
      console.log(`   ✅ Created ${documents.length} documents for ${university.name}`);
    }
    
    console.log(`\n🎉 Successfully created ${totalDocuments} documents across ${universities.length} universities!`);
    
    // Show summary by university
    console.log('\n📊 Document Summary by University:');
    for (const university of universities) {
      const { rows: summary } = await pool.query(`
        SELECT 
          category,
          COUNT(*) as total,
          COUNT(CASE WHEN is_required THEN 1 END) as required
        FROM documents 
        WHERE user_id = $1 AND university_id = $2 
        GROUP BY category 
        ORDER BY category
      `, [userId, university.id]);
      
      const totalDocs = summary.reduce((sum, cat) => sum + parseInt(cat.total), 0);
      const requiredDocs = summary.reduce((sum, cat) => sum + parseInt(cat.required), 0);
      
      console.log(`\n   🏫 ${university.name} (${university.country}): ${totalDocs} total (${requiredDocs} required)`);
      summary.forEach(cat => {
        console.log(`      ${cat.category}: ${cat.total} total (${cat.required} required)`);
      });
    }
    
    // Overall statistics
    const { rows: overallStats } = await pool.query(`
      SELECT 
        COUNT(*) as total_documents,
        COUNT(CASE WHEN is_required THEN 1 END) as required_documents,
        COUNT(DISTINCT university_id) as universities_count,
        COUNT(DISTINCT category) as categories_count
      FROM documents 
      WHERE user_id = $1
    `, [userId]);
    
    const stats = overallStats[0];
    console.log('\n🎯 Overall Statistics:');
    console.log(`   📋 Total Documents: ${stats.total_documents}`);
    console.log(`   ⭐ Required Documents: ${stats.required_documents}`);
    console.log(`   🏫 Universities: ${stats.universities_count}`);
    console.log(`   📁 Categories: ${stats.categories_count}`);
    
    console.log('\n✨ Document checklists are ready for all shortlisted universities!');
    console.log('💡 Users can now track documents for ALL their university applications');
    
  } catch (error) {
    console.error('❌ Error creating documents:', error);
  } finally {
    process.exit(0);
  }
};

createDocumentsForAllUniversities();