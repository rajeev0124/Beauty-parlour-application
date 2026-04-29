// API Test Script for Beauty Parlour Application
// Run: node test/api-test.js

const http = require('http');
const https = require('https');

const BASE_URL = 'http://localhost:3000/api';
const results = [];
let authToken = '';

// Colors for console
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

// Routes excluded from /api prefix (based on app.setGlobalPrefix exclude list)
const EXCLUDED_ROUTES = ['/', '/health', '/favicon.ico', '/api'];

function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve) => {
    // Check if path should be excluded from /api prefix
    const normalizedPath = path.startsWith('/') ? path : '/' + path;
    const isExcluded = EXCLUDED_ROUTES.includes(normalizedPath);
    const fullPath = isExcluded ? normalizedPath : '/api' + normalizedPath;
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: fullPath,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (e) => {
      resolve({ status: 0, error: e.message });
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function test(name, method, path, body = null, headers = {}, expectedStatus = [200, 201]) {
  const result = { name, method, path, status: 'PENDING' };
  
  try {
    const response = await makeRequest(method, path, body, headers);
    result.statusCode = response.status;
    result.response = response.data;
    
    if (expectedStatus.includes(response.status) || response.status === 200 || response.status === 201) {
      result.status = 'PASS';
    } else {
      result.status = 'FAIL';
    }
  } catch (error) {
    result.status = 'FAIL';
    result.error = error.message;
  }
  
  const color = result.status === 'PASS' ? colors.green : colors.red;
  console.log(`${color}[${result.status}]${colors.reset} ${name} - ${method} ${path} (${result.statusCode || 'N/A'})`);
  
  results.push(result);
  return result;
}

async function runTests() {
  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.cyan}  BEAUTY PARLOUR API TEST SUITE${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}\n`);

  // ============================================
  // 1. HEALTH & DATABASE
  // ============================================
  console.log(`\n${colors.yellow}--- HEALTH & DATABASE ---${colors.reset}`);
  await test('Health Check', 'GET', '/health');
  await test('Root Endpoint', 'GET', '/');

  // ============================================
  // 2. AUTHENTICATION
  // ============================================
  console.log(`\n${colors.yellow}--- AUTHENTICATION ---${colors.reset}`);
  
  const testEmail = `test${Date.now()}@test.com`;
  const registerResult = await test('Register User', 'POST', '/auth/register', {
    email: testEmail,
    password: 'Test@123456',
    name: 'Test User',
    phone: '9876543210'
  });

  const loginResult = await test('Login User', 'POST', '/auth/login', {
    email: testEmail,
    password: 'Test@123456'
  });

  if (loginResult.response && loginResult.response.accessToken) {
    authToken = loginResult.response.accessToken;
    console.log(`    ${colors.green}✓ Token obtained${colors.reset}`);
  }

  await test('Invalid Login', 'POST', '/auth/login', {
    email: 'invalid@test.com',
    password: 'wrongpassword'
  }, {}, [401]);

  // ============================================
  // 3. PUBLIC ENDPOINTS
  // ============================================
  console.log(`\n${colors.yellow}--- PUBLIC ENDPOINTS ---${colors.reset}`);
  await test('Get Services', 'GET', '/services');
  await test('Get Products', 'GET', '/products');
  await test('Get Staff', 'GET', '/staff');
  await test('Get Service Categories', 'GET', '/customer/services/categories');
  await test('Get Public Reviews', 'GET', '/reviews/public');
  await test('Get Review Stats', 'GET', '/reviews/stats');
  await test('Get Active Coupons', 'GET', '/coupons/active');
  await test('Get Packages', 'GET', '/packages');
  await test('Get Popular Packages', 'GET', '/packages/popular');

  // ============================================
  // 4. AUTHENTICATED ENDPOINTS
  // ============================================
  if (authToken) {
    const authHeaders = { 'Authorization': `Bearer ${authToken}` };
    
    console.log(`\n${colors.yellow}--- AUTHENTICATED ENDPOINTS ---${colors.reset}`);
    await test('Get Profile', 'GET', '/auth/profile', null, authHeaders);
    await test('Get Customer Profile', 'GET', '/customer/profile', null, authHeaders);
    await test('Get Customer Services', 'GET', '/customer/services', null, authHeaders);
    await test('Get Customer Products', 'GET', '/customer/products', null, authHeaders);
    await test('Get Customer Appointments', 'GET', '/customer/appointments', null, authHeaders);
    await test('Get Customer Orders', 'GET', '/customer/orders', null, authHeaders);
    await test('Get Customer Payments', 'GET', '/customer/payments', null, authHeaders);
    await test('Get Wishlist', 'GET', '/wishlist', null, authHeaders);
    await test('Get Wishlist Count', 'GET', '/wishlist/count', null, authHeaders);
    await test('Get Loyalty Account', 'GET', '/loyalty/account', null, authHeaders);
    await test('Get Loyalty History', 'GET', '/loyalty/history', null, authHeaders);
    await test('Get Loyalty Config', 'GET', '/loyalty/config', null, authHeaders);
  }

  // ============================================
  // 5. ADMIN LOGIN & TESTS
  // ============================================
  console.log(`\n${colors.yellow}--- ADMIN TESTS ---${colors.reset}`);
  
  const adminLogin = await test('Admin Login', 'POST', '/auth/login', {
    email: 'admin@beauty.com',
    password: 'admin123'
  });

  if (adminLogin.response && adminLogin.response.accessToken) {
    const adminHeaders = { 'Authorization': `Bearer ${adminLogin.response.accessToken}` };
    
    await test('Get All Users (Admin)', 'GET', '/users', null, adminHeaders);
    await test('Get Appointments (Admin)', 'GET', '/appointments', null, adminHeaders);
    await test('Get Orders (Admin)', 'GET', '/orders', null, adminHeaders);
    await test('Get Payments (Admin)', 'GET', '/payments', null, adminHeaders);
    await test('Get Inventory (Admin)', 'GET', '/inventory', null, adminHeaders);
    await test('Get Coupons (Admin)', 'GET', '/coupons', null, adminHeaders);
    await test('Get Expenses (Admin)', 'GET', '/expenses', null, adminHeaders);
    await test('Get Dashboard Report', 'GET', '/reports/dashboard', null, adminHeaders);
    // Sales report requires date range
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];
    await test('Get Sales Report', 'GET', `/reports/sales?startDate=${startDate}&endDate=${endDate}`, null, adminHeaders);
    await test('Get Schedule Today', 'GET', '/schedule/today', null, adminHeaders);
    
    // CRUD Tests
    console.log(`\n${colors.yellow}--- CRUD OPERATIONS ---${colors.reset}`);
    
    // Create Service
    const serviceResult = await test('Create Service', 'POST', '/services', {
      name: `Test Service ${Date.now()}`,
      description: 'Test description',
      duration: 30,
      price: 500,
      category: 'Hair',
      isActive: true
    }, adminHeaders);
    
    // Create Product (note: isActive is set automatically, not in DTO)
    const productResult = await test('Create Product', 'POST', '/products', {
      name: `Test Product ${Date.now()}`,
      description: 'Test product',
      price: 299,
      category: 'Skincare',
      stock: 100
    }, adminHeaders);
    
    // Create Coupon (use correct field names from DTO)
    const couponResult = await test('Create Coupon', 'POST', '/coupons', {
      code: `TEST${Date.now()}`,
      description: 'Test coupon',
      discountType: 'percentage',
      discountValue: 10,
      minOrderAmount: 500,
      maxDiscount: 100,
      maxUsage: 100,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30*24*60*60*1000).toISOString()
    }, adminHeaders);
  } else {
    console.log(`    ${colors.yellow}Admin not found - run seed command first${colors.reset}`);
  }

  // ============================================
  // 6. ERROR HANDLING
  // ============================================
  console.log(`\n${colors.yellow}--- ERROR HANDLING ---${colors.reset}`);
  await test('404 Not Found', 'GET', '/nonexistent', null, {}, [404]);
  await test('401 Unauthorized', 'GET', '/users', null, {}, [401]);

  // ============================================
  // SUMMARY
  // ============================================
  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.cyan}            TEST SUMMARY${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}`);
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const total = results.length;
  
  console.log(`\nTotal Tests: ${total}`);
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
  console.log(`\nSuccess Rate: ${((passed/total)*100).toFixed(2)}%`);
  
  if (failed > 0) {
    console.log(`\n${colors.red}--- FAILED TESTS ---${colors.reset}`);
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`${colors.red}- ${r.name}: ${r.error || `Status ${r.statusCode}`}${colors.reset}`);
    });
  }
  
  console.log(`\n${colors.cyan}========================================${colors.reset}\n`);
}

runTests().catch(console.error);
