const net = require('net');
const { spawn } = require('child_process');

function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.once('close', () => {
        resolve(true);
      });
      server.close();
    });
    server.on('error', () => {
      resolve(false);
    });
  });
}

async function findAvailablePort(startPort) {
  let port = startPort;
  while (true) {
    const available = await checkPort(port);
    if (available) {
      return port;
    }
    port++;
  }
}

async function startDev() {
  const startPort = 4422;
  const port = await findAvailablePort(startPort);
  
  console.log(`Starting Next.js dev server on port ${port}`);
  
  // Use npx to run next dev with the port
  const isWindows = process.platform === 'win32';
  const command = isWindows ? 'cmd' : 'npx';
  const args = isWindows 
    ? ['/c', 'npx', 'next', 'dev', '-p', port.toString()]
    : ['next', 'dev', '-p', port.toString()];
  
  const dev = spawn(command, args, {
    stdio: 'inherit',
    shell: isWindows,
    windowsHide: true
  });

  dev.on('error', (err) => {
    console.error('Failed to start dev server:', err);
    process.exit(1);
  });

  process.on('SIGINT', () => {
    dev.kill('SIGINT');
  });

  process.on('SIGTERM', () => {
    dev.kill('SIGTERM');
  });
}

startDev();
