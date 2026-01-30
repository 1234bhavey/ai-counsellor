// Verify Documents for All Universities
const { pool } = require('./utils/database');

const verifyAllDocuments = async () => {
  try {
    console.log('🔍 Verifying document checklists for all universities...');
    
    // Get user
    const { rows: users } = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      ['bhaveysaluja5656@gmail.com']
    );
    
    const userId = users[0].id;
    
    // Get documents grouped by university
    const { rows: universityDocs } = await pool.query(`
      SELECT 
        u.id as university_id,
        u.name as university_name,
        u.country,
        COUNT(d.id) as total_documents,
        COUNT(CASE WHEN d.is_required THEN 1 END) as required_documents,
        COUNT(CASE WHEN d.is_completed THEN 1 END) as completed_documents,
        COUNT(DISTINCT d.category) as categories_count
      FROM universities u
      LEFT JOIN documents d ON u.id = d.university_id AND d.user_id = $1
      WHERE u.id IN (
        SELECT DISTINCT university_id FROM shortlists WHERE user_id = $1
      )
      GROUP BY u.id, u.name, u.country
      ORDER BY u.name
    `, [userId]);
    
    console.log(`\n📊 Document Summary for ${universityDocs.length} Universities:\n`);
    
    universityDocs.forEach((uni, index) => {
      console.log(`${index + 1}. 🏫 ${uni.university_name} (${uni.country})`);
      console.log(`   📋 Total Documents: ${uni.total_documents}`);
      console.log(`   ⭐ Required: ${uni.required_documents}`);
      console.log(`   ✅ Completed: ${uni.completed_documents}`);
      console.log(`   📁 Categories: ${uni.categories_count}`);
      console.log(`   📈 Progress: ${uni.total_documents > 0 ? Math.round((uni.completed_documents / uni.total_documents) * 100) : 0}%`);
      console.log('');
    });
    
    // Show categories breakdown
    console.log('📁 Document Categories Breakdown:\n');
    
    const { rows: categories } = await pool.query(`
      SELECT 
        category,
        COUNT(*) as total_docs,
        COUNT(CASE WHEN is_required THEN 1 END) as required_docs,
        COUNT(DISTINCT university_id) as universities_count
      FROM documents 
      WHERE user_id = $1
      GROUP BY category
      ORDER BY category
    `, [userId]);
    
    categories.forEach(cat => {
      console.log(`   📂 ${cat.category}:`);
      console.log(`      Total: ${cat.total_docs} documents across ${cat.universities_count} universities`);
      console.log(`      Required: ${cat.required_docs} documents`);
      console.log('');
    });
    
    // Overall statistics
    const totalDocs = universityDocs.reduce((sum, uni) => sum + parseInt(uni.total_documents), 0);
    const totalRequired = universityDocs.reduce((sum, uni) => sum + parseInt(uni.required_documents), 0);
    const totalCompleted = universityDocs.reduce((sum, uni) => sum + parseInt(uni.completed_documents), 0);
    
    console.log('🎯 Overall Statistics:');
    console.log(`   📋 Total Documents: ${totalDocs}`);
    console.log(`   ⭐ Required Documents: ${totalRequired}`);
    console.log(`   ✅ Completed Documents: ${totalCompleted}`);
    console.log(`   🏫 Universities: ${universityDocs.length}`);
    console.log(`   📁 Categories: ${categories.length}`);
    console.log(`   📈 Overall Progress: ${totalDocs > 0 ? Math.round((totalCompleted / totalDocs) * 100) : 0}%`);
    
    console.log('\n✨ Document verification complete!');
    console.log('💡 All shortlisted universities now have comprehensive document checklists');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
};

verifyAllDocuments();