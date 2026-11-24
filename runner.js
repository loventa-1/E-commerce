const { spawn } = require('child_process');
const path = require('path');
const net = require('net');

function waitForPort(port, timeoutMs = 20000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const tryConnect = () => {
      const socket = new net.Socket();
      socket.setTimeout(1000);
      socket.on('connect', () => {
        socket.destroy();
        resolve(true);
      });
      socket.on('error', () => {
        socket.destroy();
        if (Date.now() - start > timeoutMs) {
          reject(new Error(`Timeout waiting for port ${port}`));
        } else {
          setTimeout(tryConnect, 600);
        }
      });
      socket.on('timeout', () => {
        socket.destroy();
        if (Date.now() - start > timeoutMs) {
          reject(new Error(`Timeout waiting for port ${port}`));
        } else {
          setTimeout(tryConnect, 600);
        }
      });
      socket.connect(port, '127.0.0.1');
    };
    tryConnect();
  });
}

console.log('====================================================');
console.log('   LAUNCHING MODERN SHOP PROJECT (SPRINT 01)');
console.log('====================================================\n');

// 1. Start MongoDB on Port 27017
const mongoExe = 'C:\\Program Files\\MongoDB\\Server\\8.3\\bin\\mongod.exe';
const dbPath = path.join(__dirname, 'data', 'db');

console.log('[1/3] Starting MongoDB on port 27017...');
const mongoProcess = spawn(mongoExe, ['--port', '27017', '--dbpath', dbPath], {
  stdio: 'ignore'
});

waitForPort(27017).then(async () => {
  console.log('  -> MongoDB running successfully on port 27017!');

  // 2. Start Backend on Port 5000
  console.log('[2/3] Starting Express Backend (MVC) on port 5000...');
  const backendProcess = spawn('node', [path.join(__dirname, 'Backend', 'server.js')], {
    env: {
      ...process.env,
      PORT: '5000',
      MONGODB_URI: 'mongodb://127.0.0.1:27017/shop_db'
    },
    stdio: 'inherit'
  });

  await waitForPort(5000);
  console.log('  -> Backend running at http://localhost:5000');

  // 3. Start Angular Frontend on Port 4200
  console.log('[3/3] Starting Angular Frontend on port 4200...');
  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const frontendProcess = spawn(npmCmd, ['start', '--', '--port', '4200'], {
    cwd: path.join(__dirname, 'Frontend'),
    stdio: 'inherit',
    shell: true
  });

  console.log('\n====================================================');
  console.log(' Storefront (Public):   http://localhost:4200');
  console.log(' Manager Portal:        http://localhost:4200/login');
  console.log(' Manager Dashboard:     http://localhost:4200/dashboard');
  console.log(' Manager Credentials:   manager@shop.com / manager123');
  console.log(' Backend API:           http://localhost:5000/api');
  console.log(' MongoDB:               mongodb://127.0.0.1:27017/shop_db');
  console.log('====================================================\n');

  process.on('SIGINT', () => {
    console.log('\nShutting down all services...');
    frontendProcess.kill('SIGINT');
    backendProcess.kill('SIGINT');
    mongoProcess.kill('SIGINT');
    process.exit(0);
  });
}).catch(err => {
  console.error('Failed to start services:', err);
  mongoProcess.kill();
  process.exit(1);
});
