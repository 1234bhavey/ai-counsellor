// Document Generator Utility for AI Counsellor System
// Creates comprehensive document checklists for university applications

const { pool } = require('./database');

const generateDocumentChecklist = async (userId, university, profileData) => {
  const universityId = university.id;
  const country = university.country;
  const studyGoals = profileData.study_goals || 'masters';
  
  // Get country-specific document requirements
  const documentCategories = getDocumentsByCountry(country, studyGoals);
  
  // Insert documents into database
  const documents = [];
  
  for (const category of Object.keys(documentCategories)) {
    for (const doc of documentCategories[category]) {
      const document = {
        userId,
        universityId,
        category,
        documentName: doc.name,
        description: doc.description,
        isRequired: doc.required,
        dueDate: calculateDueDate(doc.timeline),
        notes: doc.notes || null
      };
      
      documents.push(document);
    }
  }
  
  // Batch insert documents
  await insertDocuments(documents);
  
  return documents;
};

const getDocumentsByCountry = (country, studyGoals) => {
  const documents = {
    academic: [],
    tests: [],
    essays: [],
    recommendations: [],
    financial: [],
    personal: [],
    additional: []
  };
  
  if (country === 'USA') {
    documents.academic = [
      {
        name: 'Official Transcripts',
        description: 'Sealed official transcripts from all institutions attended',
        required: true,
        timeline: 'immediate',
        notes: 'Request from registrar office, allow 2-3 weeks processing'
      },
      {
        name: 'Degree Certificates',
        description: 'Bachelor\'s/Master\'s degree certificates with official translations',
        required: true,
        timeline: 'immediate',
        notes: 'Notarized translations required for non-English documents'
      },
      {
        name: 'WES Credential Evaluation',
        description: 'World Education Services credential evaluation report',
        required: false,
        timeline: 'early',
        notes: 'Required for international students, takes 4-6 weeks'
      },
      {
        name: 'Course Descriptions',
        description: 'Detailed course descriptions for all completed courses',
        required: false,
        timeline: 'early',
        notes: 'May be required for course equivalency evaluation'
      }
    ];
    
    documents.tests = [
      {
        name: 'GRE General Test Scores',
        description: 'Official GRE General Test score report',
        required: true,
        timeline: 'early',
        notes: 'Valid for 5 years, send official scores to university'
      },
      {
        name: 'TOEFL/IELTS Scores',
        description: 'English proficiency test scores (TOEFL iBT 100+ or IELTS 7.0+)',
        required: true,
        timeline: 'early',
        notes: 'Valid for 2 years, required for non-native English speakers'
      },
      {
        name: 'GRE Subject Test',
        description: 'Subject-specific GRE test (if required by program)',
        required: false,
        timeline: 'early',
        notes: 'Check specific program requirements'
      }
    ];
    
    documents.essays = [
      {
        name: 'Statement of Purpose',
        description: 'Personal statement explaining academic goals and research interests',
        required: true,
        timeline: 'middle',
        notes: '500-1000 words, program-specific, multiple drafts recommended'
      },
      {
        name: 'Personal Statement',
        description: 'Essay about personal background and motivations',
        required: false,
        timeline: 'middle',
        notes: 'If separate from SOP, focus on personal experiences'
      },
      {
        name: 'Research Proposal',
        description: 'Detailed research proposal for PhD programs',
        required: studyGoals === 'phd',
        timeline: 'middle',
        notes: 'Required for PhD applications, 2-5 pages typical'
      },
      {
        name: 'Writing Sample',
        description: 'Academic writing sample demonstrating research ability',
        required: false,
        timeline: 'middle',
        notes: 'Usually 10-25 pages, recent academic work preferred'
      }
    ];
    
    documents.recommendations = [
      {
        name: 'Academic Reference Letters',
        description: '3 letters of recommendation from professors or supervisors',
        required: true,
        timeline: 'early',
        notes: 'Give recommenders 4-6 weeks notice, provide CV and SOP draft'
      },
      {
        name: 'Professional Reference Letters',
        description: 'Letters from employers or professional supervisors',
        required: false,
        timeline: 'early',
        notes: 'Valuable if you have significant work experience'
      },
      {
        name: 'Recommender Information',
        description: 'Contact details and credentials of all recommenders',
        required: true,
        timeline: 'early',
        notes: 'Universities will contact recommenders directly'
      }
    ];
    
    documents.financial = [
      {
        name: 'Bank Statements',
        description: 'Bank statements showing sufficient funds for studies',
        required: true,
        timeline: 'late',
        notes: 'Last 6 months, minimum $60,000 for most programs'
      },
      {
        name: 'Affidavit of Support',
        description: 'Legal document from financial sponsor',
        required: false,
        timeline: 'late',
        notes: 'Required if parents/relatives are sponsoring studies'
      },
      {
        name: 'Scholarship Documentation',
        description: 'Award letters from scholarships or assistantships',
        required: false,
        timeline: 'late',
        notes: 'Include any external funding you\'ve secured'
      },
      {
        name: 'Tax Returns',
        description: 'Income tax returns of sponsor (if applicable)',
        required: false,
        timeline: 'late',
        notes: 'May be required to verify sponsor\'s financial capacity'
      }
    ];
    
    documents.personal = [
      {
        name: 'Valid Passport',
        description: 'Passport with minimum 6 months validity',
        required: true,
        timeline: 'immediate',
        notes: 'Required for F-1 visa application'
      },
      {
        name: 'Passport Photos',
        description: 'Recent passport-size photographs',
        required: true,
        timeline: 'late',
        notes: '2x2 inches, white background, taken within last 6 months'
      },
      {
        name: 'Resume/CV',
        description: 'Academic curriculum vitae highlighting achievements',
        required: true,
        timeline: 'middle',
        notes: 'Academic format, include publications, conferences, awards'
      }
    ];
    
    documents.additional = [
      {
        name: 'Portfolio',
        description: 'Creative portfolio for art, design, or architecture programs',
        required: false,
        timeline: 'middle',
        notes: 'Program-specific requirement, follow submission guidelines'
      },
      {
        name: 'Medical Records',
        description: 'Immunization records and health certificates',
        required: false,
        timeline: 'late',
        notes: 'Required after admission for enrollment'
      },
      {
        name: 'Military Service Records',
        description: 'Military service documentation (if applicable)',
        required: false,
        timeline: 'late',
        notes: 'Required for some countries, may affect visa processing'
      }
    ];
  }
  
  else if (country === 'Canada') {
    documents.academic = [
      {
        name: 'Official Transcripts',
        description: 'Sealed official transcripts in original language and English',
        required: true,
        timeline: 'immediate',
        notes: 'Must be sent directly from institution to university'
      },
      {
        name: 'Degree Certificates',
        description: 'Original degree certificates with certified translations',
        required: true,
        timeline: 'immediate',
        notes: 'Notarized translations required for non-English documents'
      },
      {
        name: 'WES Credential Assessment',
        description: 'Educational Credential Assessment from WES Canada',
        required: false,
        timeline: 'early',
        notes: 'Recommended for international students, takes 4-6 weeks'
      }
    ];
    
    documents.tests = [
      {
        name: 'IELTS Academic Scores',
        description: 'IELTS Academic test scores (minimum 6.5 overall, 6.0 each band)',
        required: true,
        timeline: 'early',
        notes: 'Valid for 2 years, TOEFL iBT (90+) also accepted'
      },
      {
        name: 'GRE Scores',
        description: 'GRE General Test scores (program dependent)',
        required: false,
        timeline: 'early',
        notes: 'Not always required, check specific program requirements'
      }
    ];
    
    documents.essays = [
      {
        name: 'Statement of Intent',
        description: 'Statement explaining academic and research goals',
        required: true,
        timeline: 'middle',
        notes: '750-1500 words, focus on research interests and career goals'
      },
      {
        name: 'Research Proposal',
        description: 'Detailed research proposal for thesis-based programs',
        required: false,
        timeline: 'middle',
        notes: 'Required for research-based master\'s and PhD programs'
      }
    ];
    
    documents.recommendations = [
      {
        name: 'Academic References',
        description: '2-3 letters of recommendation from academic supervisors',
        required: true,
        timeline: 'early',
        notes: 'Academic references preferred, professional acceptable'
      }
    ];
    
    documents.financial = [
      {
        name: 'Proof of Funds',
        description: 'Bank statements showing CAD $25,000+ for living expenses',
        required: true,
        timeline: 'late',
        notes: 'Plus tuition fees, GIC may be required'
      }
    ];
    
    documents.personal = [
      {
        name: 'Valid Passport',
        description: 'Passport with minimum 6 months validity',
        required: true,
        timeline: 'immediate',
        notes: 'Required for study permit application'
      },
      {
        name: 'Resume/CV',
        description: 'Comprehensive curriculum vitae',
        required: true,
        timeline: 'middle',
        notes: 'Include education, work experience, achievements'
      }
    ];
  }
  
  else if (country === 'UK') {
    documents.academic = [
      {
        name: 'Official Transcripts',
        description: 'Official transcripts with degree classifications',
        required: true,
        timeline: 'immediate',
        notes: 'Must show 2:1 or equivalent for most programs'
      },
      {
        name: 'Degree Certificates',
        description: 'Bachelor\'s degree certificate with certified translations',
        required: true,
        timeline: 'immediate',
        notes: 'NARIC statement of comparability may be required'
      }
    ];
    
    documents.tests = [
      {
        name: 'IELTS Academic Scores',
        description: 'IELTS Academic (minimum 6.5 overall, 6.0 each component)',
        required: true,
        timeline: 'early',
        notes: 'TOEFL iBT (92+) or PTE Academic (62+) also accepted'
      },
      {
        name: 'GMAT/GRE Scores',
        description: 'GMAT or GRE scores for business/competitive programs',
        required: false,
        timeline: 'early',
        notes: 'Required for MBA and some competitive master\'s programs'
      }
    ];
    
    documents.essays = [
      {
        name: 'Personal Statement',
        description: 'Personal statement (4,000 characters including spaces)',
        required: true,
        timeline: 'middle',
        notes: 'UCAS format, focus on academic interests and career goals'
      },
      {
        name: 'Research Proposal',
        description: 'Research proposal for research degrees',
        required: false,
        timeline: 'middle',
        notes: 'Required for MPhil/PhD programs'
      }
    ];
    
    documents.recommendations = [
      {
        name: 'Academic References',
        description: '2 academic references from recent supervisors',
        required: true,
        timeline: 'early',
        notes: 'Must be from academic staff who know your work well'
      }
    ];
    
    documents.financial = [
      {
        name: 'Bank Statements',
        description: 'Bank statements showing £15,000+ for living costs',
        required: true,
        timeline: 'late',
        notes: 'Plus tuition fees, 28-day rule applies'
      }
    ];
    
    documents.personal = [
      {
        name: 'Valid Passport',
        description: 'Passport with UK visa eligibility',
        required: true,
        timeline: 'immediate',
        notes: 'Check visa requirements for your nationality'
      },
      {
        name: 'TB Test Results',
        description: 'Tuberculosis test results from approved clinics',
        required: false,
        timeline: 'late',
        notes: 'Required for students from certain countries'
      }
    ];
  }
  
  else if (country === 'Australia') {
    documents.academic = [
      {
        name: 'Official Transcripts',
        description: 'Official academic transcripts with certified translations',
        required: true,
        timeline: 'immediate',
        notes: 'Must include GPA calculations and grading scale'
      },
      {
        name: 'Degree Certificates',
        description: 'Degree certificates with certified English translations',
        required: true,
        timeline: 'immediate',
        notes: 'Notarized translations required for non-English documents'
      }
    ];
    
    documents.tests = [
      {
        name: 'IELTS Academic Scores',
        description: 'IELTS Academic (minimum 6.5 overall, 6.0 each band)',
        required: true,
        timeline: 'early',
        notes: 'TOEFL iBT (79+) or PTE Academic (58+) also accepted'
      },
      {
        name: 'GRE/GMAT Scores',
        description: 'GRE or GMAT scores for competitive programs',
        required: false,
        timeline: 'early',
        notes: 'Required for some business and competitive programs'
      }
    ];
    
    documents.essays = [
      {
        name: 'Statement of Purpose',
        description: 'Statement of Purpose (1000-1500 words)',
        required: true,
        timeline: 'middle',
        notes: 'Focus on academic goals and research interests'
      },
      {
        name: 'Research Proposal',
        description: 'Research proposal for research programs',
        required: false,
        timeline: 'middle',
        notes: 'Required for research master\'s and PhD programs'
      }
    ];
    
    documents.recommendations = [
      {
        name: 'Reference Letters',
        description: '2-3 academic/professional reference letters',
        required: true,
        timeline: 'early',
        notes: 'On official letterhead with contact details'
      }
    ];
    
    documents.financial = [
      {
        name: 'Proof of Funds',
        description: 'Bank statements showing AUD $21,000+ for living expenses',
        required: true,
        timeline: 'late',
        notes: 'Plus tuition fees, last 3 months statements'
      }
    ];
    
    documents.personal = [
      {
        name: 'Valid Passport',
        description: 'Valid passport for student visa application',
        required: true,
        timeline: 'immediate',
        notes: 'Required for student visa (subclass 500)'
      },
      {
        name: 'Health Insurance',
        description: 'Overseas Student Health Cover (OSHC)',
        required: true,
        timeline: 'late',
        notes: 'Must be purchased before visa application'
      }
    ];
  }
  
  return documents;
};

const calculateDueDate = (timeline) => {
  const now = new Date();
  const dueDate = new Date(now);
  
  switch (timeline) {
    case 'immediate':
      dueDate.setDate(now.getDate() + 7); // 1 week
      break;
    case 'early':
      dueDate.setDate(now.getDate() + 21); // 3 weeks
      break;
    case 'middle':
      dueDate.setDate(now.getDate() + 42); // 6 weeks
      break;
    case 'late':
      dueDate.setDate(now.getDate() + 70); // 10 weeks
      break;
    default:
      dueDate.setDate(now.getDate() + 30); // 1 month default
  }
  
  return dueDate.toISOString().split('T')[0]; // Return YYYY-MM-DD format
};

const insertDocuments = async (documents) => {
  const client = await pool.connect();
  
  try {
    for (const doc of documents) {
      await client.query(`
        INSERT INTO documents (
          user_id, university_id, category, document_name, description, 
          is_required, due_date, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        doc.userId, doc.universityId, doc.category, doc.documentName,
        doc.description, doc.isRequired, doc.dueDate, doc.notes
      ]);
    }
  } catch (error) {
    console.error('Error inserting documents:', error);
    throw error;
  } finally {
    client.release();
  }
};

const getDocumentsByUser = async (userId, universityId = null) => {
  const client = await pool.connect();
  
  try {
    let query = `
      SELECT d.*, u.name as university_name 
      FROM documents d
      LEFT JOIN universities u ON d.university_id = u.id
      WHERE d.user_id = $1
    `;
    const params = [userId];
    
    if (universityId) {
      query += ' AND d.university_id = $2';
      params.push(universityId);
    }
    
    query += ' ORDER BY d.category, d.is_required DESC, d.due_date ASC';
    
    const { rows } = await client.query(query, params);
    return rows;
  } catch (error) {
    console.error('Error fetching documents:', error);
    throw error;
  } finally {
    client.release();
  }
};

const updateDocumentStatus = async (documentId, isCompleted, notes = null) => {
  const client = await pool.connect();
  
  try {
    const { rows } = await client.query(`
      UPDATE documents 
      SET is_completed = $1, notes = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `, [isCompleted, notes, documentId]);
    
    return rows[0];
  } catch (error) {
    console.error('Error updating document status:', error);
    throw error;
  } finally {
    client.release();
  }
};

const getDocumentStats = async (userId) => {
  const client = await pool.connect();
  
  try {
    const { rows } = await client.query(`
      SELECT 
        COUNT(*) as total_documents,
        COUNT(CASE WHEN is_completed = true THEN 1 END) as completed_documents,
        COUNT(CASE WHEN is_required = true THEN 1 END) as required_documents,
        COUNT(CASE WHEN is_required = true AND is_completed = true THEN 1 END) as completed_required,
        COUNT(CASE WHEN due_date < CURRENT_DATE AND is_completed = false THEN 1 END) as overdue_documents
      FROM documents 
      WHERE user_id = $1
    `, [userId]);
    
    return rows[0];
  } catch (error) {
    console.error('Error fetching document stats:', error);
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  generateDocumentChecklist,
  getDocumentsByUser,
  updateDocumentStatus,
  getDocumentStats,
  getDocumentsByCountry
};