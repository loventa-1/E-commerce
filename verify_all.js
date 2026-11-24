const { spawn } = require('child_process');
const http = require('http');
const net = require('net');
const path = require('path');
const os = require('os');
const fs = require('fs');
const assert = require('assert/strict');

function waitForPort(port, child, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const tryConnect = () => {
      if (child.exitCode !== null) {
        reject(new Error(`Process exited before port ${port} became available (code ${child.exitCode})`));
        return;
      }
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
          setTimeout(tryConnect, 500);
        }
      });
      socket.on('timeout', () => {
        socket.destroy();
        if (Date.now() - start > timeoutMs) {
          reject(new Error(`Timeout waiting for port ${port}`));
        } else {
          setTimeout(tryConnect, 500);
        }
      });
      socket.connect(port, '127.0.0.1');
    };
    tryConnect();
  });
}

function getAvailablePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close(error => error ? reject(error) : resolve(port));
    });
  });
}

function stopProcess(child) {
  if (!child || child.exitCode !== null) return Promise.resolve();
  return new Promise(resolve => {
    child.once('close', resolve);
    child.kill();
  });
}

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function main() {
  const mongoExe = process.env.MONGOD_PATH || 'C:\\Program Files\\MongoDB\\Server\\8.3\\bin\\mongod.exe';
  const dbPath = fs.mkdtempSync(path.join(os.tmpdir(), 'shop-test-mongo-'));
  const mongoPort = await getAvailablePort();
  const backendPort = await getAvailablePort();
  let mongo;
  let backend;
  try {
    assert.ok(fs.existsSync(mongoExe), `MongoDB executable not found: ${mongoExe}. Set MONGOD_PATH to its location.`);
    console.log(`--- Starting MongoDB on port ${mongoPort} ---`);
    mongo = spawn(mongoExe, ['--port', String(mongoPort), '--dbpath', dbPath], { stdio: 'ignore' });
    await waitForPort(mongoPort, mongo);
    console.log('[OK] MongoDB is listening');

    console.log(`--- Starting Backend Server on port ${backendPort} ---`);
    backend = spawn(process.execPath, [path.join(__dirname, 'Backend', 'server.js')], {
      env: {
        ...process.env,
        PORT: String(backendPort),
        MONGODB_URI: `mongodb://127.0.0.1:${mongoPort}/shop_test_db`
      },
      stdio: 'inherit'
    });

    await waitForPort(backendPort, backend);
    console.log('[OK] Backend is listening');

    const api = (path, method = 'GET', data, token) => request({
      hostname: '127.0.0.1',
      port: backendPort,
      path,
      method,
      headers: {
        ...(data ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    }, data);

    console.log('\n================ RUNNING INTEGRATION TESTS ================');
    let passed = 0;
    const check = (name, condition) => {
      assert.ok(condition, name);
      passed += 1;
      console.log(`[PASS ${passed}] ${name}`);
    };

    const health = await api('/api/health');
    check('Health endpoint responds successfully', health.status === 200 && health.data.status === 'ok');

    const cats = await api('/api/categories');
    check('Categories endpoint returns seeded categories', cats.status === 200 && Array.isArray(cats.data.data) && cats.data.data.length > 0);

    const publicItems = await api('/api/items');
    const firstItem = publicItems.data?.data?.[0];
    check('Public items are returned without inventory quantities', publicItems.status === 200 && !!firstItem && firstItem.quantity === undefined);

    const login = await api('/api/auth/login', 'POST', { email: 'manager@shop.com', password: 'manager123' });
    const token = login.data?.data?.token;
    check('Manager can log in', login.status === 200 && login.data.success === true && !!token);

    const managerItems = await api('/api/items', 'GET', undefined, token);
    const managerItem = managerItems.data?.data?.[0];
    check('Manager can see inventory quantities', managerItems.status === 200 && !!managerItem && managerItem.quantity !== undefined);

    const stockBefore = managerItem.quantity;
    const overStockOrder = await api('/api/orders', 'POST', {
      customer: { name: 'Stock Test', email: 'stock.test@example.com', phone: '+1-555-0199', address: '123 Stock Street' },
      items: [{ itemId: firstItem._id, quantity: stockBefore + 1 }],
      notes: 'Insufficient stock integration test'
    });
    check('Customer cannot order more than available stock', overStockOrder.status === 409 && overStockOrder.data.code === 'INSUFFICIENT_STOCK');

    const order = await api('/api/orders', 'POST', {
      customer: { name: 'Test Customer', email: 'test.customer@example.com', phone: '+1-555-0123', address: '456 Market St, Suite 2' },
      items: [{ itemId: firstItem._id, quantity: 2 }],
      notes: 'Automated integration test'
    });
    const orderId = order.data?.data?._id;
    check('Customer can place an order', order.status === 201 && !!orderId && order.data.data.status === 'opened');

    const managerItemsAfterOrder = await api('/api/items', 'GET', undefined, token);
    const managerItemAfterOrder = managerItemsAfterOrder.data?.data?.find(entry => entry._id === firstItem._id);
    check('Successful cash order decreases item stock', managerItemsAfterOrder.status === 200 && managerItemAfterOrder.quantity === stockBefore - 2);

    const orders = await api('/api/orders', 'GET', undefined, token);
    check('Manager can list orders', orders.status === 200 && orders.data.data.some(entry => entry._id === orderId));

    const updateOrder = await api(`/api/orders/${orderId}`, 'PATCH', {
      status: 'closed',
      managerNotes: 'Automated test confirmed delivery'
    }, token);
    check('Manager can close an order and save notes', updateOrder.status === 200 && updateOrder.data.data.status === 'closed' && updateOrder.data.data.managerNotes === 'Automated test confirmed delivery');
    console.log(`================ ALL ${passed} INTEGRATION TESTS PASSED ================\n`);
  } finally {
    await stopProcess(backend);
    await stopProcess(mongo);
    fs.rmSync(dbPath, { recursive: true, force: true });
  }
}

main().catch(err => {
  console.error('[Error during verification]', err);
  process.exit(1);
});
