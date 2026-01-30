const net = require('net');

function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.listen(port, () => {
      server.once('close', () => {
        resolve(true); // Port is available
      });
      server.close();
    });
    
    server.on('error', () => {
      resolve(false); // Port is in use
    });
  });
}

async function findAvailablePort(startPort = 3000) {
  for (let port = startPort; port <= startPort + 100; port++) {
    const isAvailable = await checkPort(port);
    if (isAvailable) {
      console.log(`✅ Available port found: ${port}`);
      return port;
    }
  }
  throw new Error('No available ports found');
}

// Find and display available port
findAvailablePort().then(port => {
  console.log(`🚀 Use this port in your .env file: PORT=${port}`);
}).catch(console.error);