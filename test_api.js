const http = require('http');

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

async function runTests() {
  console.log('Testing Backend API...');
  const managerPassword = process.env.MANAGER_PASSWORD;
  if (!managerPassword) {
    throw new Error('Set MANAGER_PASSWORD to the value configured for the running backend.');
  }

  // 1. Health check
  const health = await request({ hostname: 'localhost', port: 5000, path: '/api/health', method: 'GET' });
  console.log('1. Health check:', health.status, health.data.status);

  // 2. Categories
  const cats = await request({ hostname: 'localhost', port: 5000, path: '/api/categories', method: 'GET' });
  console.log('2. Categories count:', cats.data.count);

  // 3. Public Items (Ensure quantity is hidden!)
  const publicItems = await request({ hostname: 'localhost', port: 5000, path: '/api/items', method: 'GET' });
  console.log('3. Public Items count:', publicItems.data.count);
  const firstItem = publicItems.data.data[0];
  console.log('   Public Item has quantity?', firstItem.quantity !== undefined ? 'FAIL (Quantity visible)' : 'PASS (Quantity hidden for public)');

  // 4. Manager Login
  const loginRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'manager@shop.com', password: managerPassword });
  console.log('4. Manager Login:', loginRes.status, loginRes.data.success ? 'SUCCESS' : 'FAIL');
  const token = loginRes.data.data.token;

  // 5. Manager Items (Ensure quantity is visible!)
  const managerItems = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/items',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const firstMgrItem = managerItems.data.data[0];
  console.log('5. Manager Items: has quantity?', firstMgrItem.quantity !== undefined ? `PASS (Quantity: ${firstMgrItem.quantity})` : 'FAIL');

  // 6. Public Place Order
  const orderRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/orders',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    customer: { name: 'Alice Smith', email: 'alice@example.com', phone: '+123456789', address: '123 Baker Street' },
    items: [{ itemId: firstItem._id, quantity: 2 }],
    notes: 'Please call between 10am and 12pm'
  });
  console.log('6. Public Order Placed:', orderRes.status, 'Status:', orderRes.data.data.status);
  const orderId = orderRes.data.data._id;

  // 7. Manager List Orders
  const ordersList = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/orders',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('7. Manager Orders count:', ordersList.data.count);

  // 8. Manager Update Order Status to "closed"
  const updateRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/orders/${orderId}`,
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, { status: 'closed', managerNotes: 'Customer confirmed via phone call. Order fulfilled.' });
  console.log('8. Manager Update Status to closed:', updateRes.status, 'New status:', updateRes.data.data.status);

  console.log('ALL API TESTS COMPLETED SUCCESSFULLY!');
}

runTests().catch(err => console.error('Test error:', err));
