// Service Status Checker
const http = require('http');

const checkService = (port, name) => {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}`, (res) => {
      console.log(`✅ ${name} is running on port ${port} (Status: ${res.statusCode})`);
      resolve(true);
    });
    
    req.on('error', (err) => {
      console.log(`❌ ${name} is NOT running on port ${port} (${err.message})`);
      resolve(false);
    });
    
    req.setTimeout(3000, () => {
      console.log(`⏰ ${name} on port ${port} - Connection timeout`);
      req.destroy();
      resolve(false);
    });
  });
};

const checkServices = async () => {
  console.log('🔍 Checking AI Counsellor Services...\n');
  
  const backendRunning = await checkService(3000, 'Backend API');
  const frontendRunning = await checkService(3001, 'Frontend');
  
  console.log('\n📊 Service Status:');
  console.log(`Backend (Port 3000): ${backendRunning ? '✅ Running' : '❌ Not Running'}`);
  console.log(`Frontend (Port 3001): ${frontendRunning ? '✅ Running' : '❌ Not Running'}`);
  
  if (backendRunning && frontendRunning) {
    console.log('\n🎉 All services are running!');
    console.log('📍 Frontend: http://localhost:3001');
    console.log('📍 Backend: http://localhost:3000');
    console.log('📧 Login: bhaveysaluja5656@gmail.com');
    console.log('🔑 Password: 123456');
  } else {
    console.log('\n⚠️ Some services are not running. Please check:');
    if (!backendRunning) console.log('- Start backend: cd backend && node server.js');
    if (!frontendRunning) console.log('- Start frontend: cd frontend && npm run dev');
  }
  
  process.exit(0);
};

checkServices();