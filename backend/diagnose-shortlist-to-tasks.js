// Diagnose Shortlisted Universities to Application Tasks Flow
const { pool } = require('./utils/database');
const axios = require('axios');

const diagnoseShortlistToTasks = async () => {
  try {
    console.log('🔍 Diagnosing shortlisted universities to application tasks flow...');
    
    // Step 1: Get user ID
    console.log('\n1️⃣ Getting user information...');
    const { rows: users } = await pool.query(
      'SELECT id, name, email FROM users WHERE email = $1',
      ['bhaveysaluja5656@gmail.com']
    );
    
    if (users.length === 0) {
      console.log('❌ User not found!');
      return;
    }
    
    const userId = users[0].id;
    console.log(`✅ User found: ${users[0].name} (ID: ${userId})`);
    
    // Step 2: Check shortlisted universities
    console.log('\n2️⃣ Checking shortlisted universities...');
    const { rows: shortlisted } = await pool.query(`
      SELECT s.*, u.name as university_name, u.country
      FROM shortlists s
      JOIN universities u ON s.university_id = u.id
      WHERE s.user_id = $1
      ORDER BY u.name
    `, [userId]);
    
    console.log(`✅ Found ${shortlisted.length} shortlisted universities:`);
    shortlisted.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.university_name} (${item.country}) - ${item.is_locked ? 'LOCKED' : 'Shortlisted'} - ID: ${item.university_id}`);
    });
    
    // Step 3: Check existing tasks
    console.log('\n3️⃣ Checking existing application tasks...');
    const { rows: tasks } = await pool.query(`
      SELECT t.*, u.name as university_name
      FROM tasks t
      LEFT JOIN universities u ON t.university_id = u.id
      WHERE t.user_id = $1
      ORDER BY u.name, t.created_at
    `, [userId]);
    
    console.log(`✅ Found ${tasks.length} application tasks:`);
    if (tasks.length === 0) {
      console.log('   No tasks found!');
    } else {
      tasks.forEach((task, index) => {
        console.log(`   ${index + 1}. ${task.title} (${task.university_name}) - ${task.completed ? 'Completed' : 'Pending'}`);
      });
    }
    
    // Step 4: Check documents
    console.log('\n4️⃣ Checking document checklists...');
    const { rows: documents } = await pool.query(`
      SELECT d.university_id, u.name as university_name, COUNT(*) as doc_count
      FROM documents d
      JOIN universities u ON d.university_id = u.id
      WHERE d.user_id = $1
      GROUP BY d.university_id, u.name
      ORDER BY u.name
    `, [userId]);
    
    console.log(`✅ Found documents for ${documents.length} universities:`);
    documents.forEach((doc, index) => {
      console.log(`   ${index + 1}. ${doc.university_name} - ${doc.doc_count} documents`);
    });
    
    // Step 5: Test API endpoints
    console.log('\n5️⃣ Testing API endpoints...');
    
    // Login first
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'bhaveysaluja5656@gmail.com',
      password: '123456'
    });
    
    const token = loginResponse.data.token;
    const api = axios.create({
      baseURL: 'http://localhost:3000/api',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    // Test shortlisted API
    console.log('\n   📋 Testing shortlisted universities API...');
    try {
      const shortlistedResponse = await api.get('/universities/shortlisted');
      console.log(`   ✅ Shortlisted API: ${shortlistedResponse.data.length} universities returned`);
    } catch (error) {
      console.log(`   ❌ Shortlisted API failed: ${error.response?.data?.message || error.message}`);
    }
    
    // Test tasks API
    console.log('\n   📋 Testing tasks API...');
    try {
      const tasksResponse = await api.get('/tasks');
      console.log(`   ✅ Tasks API: ${tasksResponse.data.length} tasks returned`);
      if (tasksResponse.data.length > 0) {
        console.log(`   First task: ${tasksResponse.data[0].title} (${tasksResponse.data[0].university_name})`);
      }
    } catch (error) {
      console.log(`   ❌ Tasks API failed: ${error.response?.data?.message || error.message}`);
    }
    
    // Test documents API
    console.log('\n   📋 Testing documents API...');
    try {
      const documentsResponse = await api.get('/documents');
      console.log(`   ✅ Documents API: ${documentsResponse.data.length} documents returned`);
      if (documentsResponse.data.length > 0) {
        const universities = [...new Set(documentsResponse.data.map(d => d.university_name))];
        console.log(`   Universities with documents: ${universities.join(', ')}`);
      }
    } catch (error) {
      console.log(`   ❌ Documents API failed: ${error.response?.data?.message || error.message}`);
    }
    
    // Step 6: Identify the problem
    console.log('\n6️⃣ Problem Analysis...');
    
    const lockedUniversities = shortlisted.filter(s => s.is_locked);
    const universitiesWithTasks = [...new Set(tasks.map(t => t.university_id))];
    const universitiesWithDocs = documents.map(d => d.university_id);
    
    console.log('\n📊 Analysis Results:');
    console.log(`   Shortlisted Universities: ${shortlisted.length}`);
    console.log(`   Locked Universities: ${lockedUniversities.length}`);
    console.log(`   Universities with Tasks: ${universitiesWithTasks.length}`);
    console.log(`   Universities with Documents: ${universitiesWithDocs.length}`);
    
    if (shortlisted.length > 0 && tasks.length === 0) {
      console.log('\n❌ PROBLEM IDENTIFIED: Shortlisted universities exist but no tasks found!');
      console.log('💡 SOLUTION: Need to generate tasks for shortlisted universities');
    } else if (shortlisted.length > 0 && documents.length === 0) {
      console.log('\n❌ PROBLEM IDENTIFIED: Shortlisted universities exist but no documents found!');
      console.log('💡 SOLUTION: Need to generate documents for shortlisted universities');
    } else if (shortlisted.length === 0) {
      console.log('\n❌ PROBLEM IDENTIFIED: No shortlisted universities found!');
      console.log('💡 SOLUTION: Need to populate shortlisted universities');
    } else {
      console.log('\n✅ Data looks good - checking frontend integration...');
    }
    
    // Step 7: Provide recommendations
    console.log('\n7️⃣ Recommendations:');
    
    if (shortlisted.length === 0) {
      console.log('   1. Run: node add-test-shortlist.js (to add shortlisted universities)');
    }
    
    if (tasks.length === 0 && shortlisted.length > 0) {
      console.log('   2. Run: node sync-tasks-with-shortlist.js (to generate tasks)');
    }
    
    if (documents.length === 0 && shortlisted.length > 0) {
      console.log('   3. Run: node create-documents-for-all-universities.js (to generate documents)');
    }
    
    console.log('   4. Check frontend axios configuration');
    console.log('   5. Verify authentication token is being sent');
    
    console.log('\n🎉 Diagnosis complete!');
    
  } catch (error) {
    console.error('❌ Diagnosis failed:', error);
  } finally {
    process.exit(0);
  }
};

diagnoseShortlistToTasks();