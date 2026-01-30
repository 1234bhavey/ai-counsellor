const { exec } = require('child_process');
const { spawn } = require('child_process');

console.log('🧹 Cleaning up processes...');

// Kill any existing node processes
exec('taskkill /f /im node.exe /t', (error) => {
  if (error && !error.message.includes('not found')) {
    console.log('⚠️ Some processes might still be running');
  }
  
  setTimeout(() => {
    console.log('🚀 Starting fresh server...');
    
    // Start the server
    const server = spawn('node', ['--no-deprecation', 'server.js'], {
      stdio: 'inherit',
      cwd: __dirname
    });
    
    server.on('error', (err) => {
      console.error('❌ Failed to start server:', err);
    });
    
    server.on('exit', (code) => {
      console.log(`Server exited with code ${code}`);
    });
    
  }, 2000); // Wait 2 seconds for cleanup
});