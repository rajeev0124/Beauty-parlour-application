// ═══════════════════════════════════════════════════════════════════════════════
// COMPREHENSIVE FRONTEND + BACKEND INTEGRATION TEST SUITE
// Beauty Parlour Application - Full Stack Testing
// ═══════════════════════════════════════════════════════════════════════════════
// Run: node full-integration-test.js

const http = require('http');

// Test Configuration
const BACKEND_URL = 'http://localhost:3000';
const FRONTEND_URL = 'http://localhost:4200';
const API_BASE = BACKEND_URL + '/api';

// Test Results Storage
const results = { passed: 0, failed: 0, tests: [] };
let customerToken = '';
let adminToken = '';
let testUserId = '';
let testServiceId = '';
let testProductId = '';
let testAppointmentId = '';

// Colors
const C = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  bold: '\x1b[1m'
};

// HTTP Request Helper
function request(method, url, body = null, headers = {}) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const payload = body ? JSON.stringify(body) : null;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload && { 'Content-Length': Buffer.byteLength(payload) }),
        ...headers
      },
      timeout: 10000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data), ok: res.statusCode >= 200 && res.statusCode < 300 });
        } catch {
          resolve({ status: res.statusCode, data, ok: res.statusCode >= 200 && res.statusCode < 300 });
        }
      });
    });

    req.on('error', (e) => resolve({ status: 0, error: e.message, ok: false }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 0, error: 'Timeout', ok: false }); });
    
    if (payload) req.write(payload);
    req.end();
  });
}

// Test Function
async function test(category, name, fn) {
  try {
    const result = await fn();
    const passed = result.ok !== false;
    results[passed ? 'passed' : 'failed']++;
    results.tests.push({ category, name, passed, status: result.status, error: result.error });
    
    const icon = passed ? `${C.green}✓${C.reset}` : `${C.red}✗${C.reset}`;
    const statusText = result.status ? `(${result.status})` : result.error ? `(${result.error})` : '';
    console.log(`  ${icon} ${name} ${statusText}`);
    
    return result;
  } catch (err) {
    results.failed++;
    results.tests.push({ category, name, passed: false, error: err.message });
    console.log(`  ${C.red}✗${C.reset} ${name} (Error: ${err.message})`);
    return { ok: false, error: err.message };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST SUITES
// ═══════════════════════════════════════════════════════════════════════════════

async function testServerConnectivity() {
  console.log(`\n${C.cyan}${C.bold}╔═══════════════════════════════════════════════════════════════╗${C.reset}`);
  console.log(`${C.cyan}${C.bold}║  LEVEL 1: SERVER CONNECTIVITY                                 ║${C.reset}`);
  console.log(`${C.cyan}${C.bold}╚═══════════════════════════════════════════════════════════════╝${C.reset}`);
  
  await test('Connectivity', 'Backend Root Endpoint', async () => {
    return await request('GET', BACKEND_URL + '/');
  });
  
  await test('Connectivity', 'Backend Health Check', async () => {
    return await request('GET', BACKEND_URL + '/health');
  });
  
  await test('Connectivity', 'Backend API Info', async () => {
    return await request('GET', API_BASE);
  });
  
  await test('Connectivity', 'Frontend Accessible', async () => {
    return await request('GET', FRONTEND_URL + '/');
  });
}

async function testDatabaseConnection() {
  console.log(`\n${C.cyan}${C.bold}╔═══════════════════════════════════════════════════════════════╗${C.reset}`);
  console.log(`${C.cyan}${C.bold}║  LEVEL 2: DATABASE CONNECTION                                 ║${C.reset}`);
  console.log(`${C.cyan}${C.bold}╚═══════════════════════════════════════════════════════════════╝${C.reset}`);
  
  const healthRes = await test('Database', 'MongoDB Connected', async () => {
    const res = await request('GET', BACKEND_URL + '/health');
    if (res.ok && res.data?.database?.connected) {
      console.log(`    ${C.yellow}→ Host: ${res.data.database.host}${C.reset}`);
      console.log(`    ${C.yellow}→ Database: ${res.data.database.name}${C.reset}`);
      return res;
    }
    return { ok: false, status: res.status, error: 'Database not connected' };
  });
}

async function testAuthentication() {
  console.log(`\n${C.cyan}${C.bold}╔═══════════════════════════════════════════════════════════════╗${C.reset}`);
  console.log(`${C.cyan}${C.bold}║  LEVEL 3: AUTHENTICATION SYSTEM                               ║${C.reset}`);
  console.log(`${C.cyan}${C.bold}╚═══════════════════════════════════════════════════════════════╝${C.reset}`);
  
  // Register new test user
  const testEmail = `test-${Date.now()}@integration.test`;
  const registerRes = await test('Auth', 'Register New User', async () => {
    const res = await request('POST', API_BASE + '/auth/register', {
      name: 'Integration Test User',
      email: testEmail,
      phone: '9876543210',
      password: 'TestPass123!'
    });
    if (res.data?.accessToken) {
      customerToken = res.data.accessToken;
      testUserId = res.data.user?._id;
      console.log(`    ${C.yellow}→ User ID: ${testUserId}${C.reset}`);
    }
    return res;
  });
  
  // Login with registered user
  await test('Auth', 'Login with Registered User', async () => {
    const res = await request('POST', API_BASE + '/auth/login', {
      email: testEmail,
      password: 'TestPass123!'
    });
    if (res.data?.accessToken) {
      customerToken = res.data.accessToken;
    }
    return res;
  });
  
  // Get profile
  await test('Auth', 'Get User Profile', async () => {
    return await request('GET', API_BASE + '/auth/profile', null, {
      Authorization: `Bearer ${customerToken}`
    });
  });
  
  // Admin login
  await test('Auth', 'Admin Login', async () => {
    const res = await request('POST', API_BASE + '/auth/login', {
      email: 'admin@beauty.com',
      password: 'admin123'
    });
    if (res.data?.accessToken) {
      adminToken = res.data.accessToken;
      console.log(`    ${C.yellow}→ Admin role: ${res.data.user?.role}${C.reset}`);
    }
    return res;
  });
  
  // Invalid login
  await test('Auth', 'Reject Invalid Credentials', async () => {
    const res = await request('POST', API_BASE + '/auth/login', {
      email: 'invalid@invalid.com',
      password: 'wrongpassword'
    });
    return { ok: res.status === 401, status: res.status };
  });
  
  // Refresh token
  await test('Auth', 'Refresh Token', async () => {
    const loginRes = await request('POST', API_BASE + '/auth/login', {
      email: testEmail,
      password: 'TestPass123!'
    });
    if (loginRes.data?.refreshToken) {
      const res = await request('POST', API_BASE + '/auth/refresh-token', {
        refreshToken: loginRes.data.refreshToken
      });
      return res;
    }
    return { ok: false, error: 'No refresh token' };
  });
}

async function testPublicEndpoints() {
  console.log(`\n${C.cyan}${C.bold}╔═══════════════════════════════════════════════════════════════╗${C.reset}`);
  console.log(`${C.cyan}${C.bold}║  LEVEL 4: PUBLIC ENDPOINTS (No Auth Required)                 ║${C.reset}`);
  console.log(`${C.cyan}${C.bold}╚═══════════════════════════════════════════════════════════════╝${C.reset}`);
  
  // Services
  const servicesRes = await test('Public', 'Get All Services', async () => {
    const res = await request('GET', API_BASE + '/services');
    if (res.ok && Array.isArray(res.data) && res.data.length > 0) {
      testServiceId = res.data[0]._id;
      console.log(`    ${C.yellow}→ Found ${res.data.length} services${C.reset}`);
    }
    return res;
  });
  
  await test('Public', 'Get Popular Services', async () => {
    return await request('GET', API_BASE + '/services/popular');
  });
  
  // Products
  const productsRes = await test('Public', 'Get All Products', async () => {
    const res = await request('GET', API_BASE + '/products');
    if (res.ok && Array.isArray(res.data) && res.data.length > 0) {
      testProductId = res.data[0]._id;
      console.log(`    ${C.yellow}→ Found ${res.data.length} products${C.reset}`);
    }
    return res;
  });
  
  // Staff
  await test('Public', 'Get All Staff', async () => {
    const res = await request('GET', API_BASE + '/staff');
    if (res.ok) console.log(`    ${C.yellow}→ Found ${res.data?.length || 0} staff members${C.reset}`);
    return res;
  });
  
  await test('Public', 'Get Available Staff', async () => {
    return await request('GET', API_BASE + '/staff/available');
  });
  
  // Packages
  await test('Public', 'Get All Packages', async () => {
    return await request('GET', API_BASE + '/packages');
  });
  
  await test('Public', 'Get Active Packages', async () => {
    return await request('GET', API_BASE + '/packages/active');
  });
  
  await test('Public', 'Get Popular Packages', async () => {
    return await request('GET', API_BASE + '/packages/popular');
  });
  
  // Reviews & Feedback
  await test('Public', 'Get Public Reviews', async () => {
    return await request('GET', API_BASE + '/reviews/public');
  });
  
  await test('Public', 'Get Review Stats', async () => {
    return await request('GET', API_BASE + '/reviews/stats');
  });
  
  await test('Public', 'Get Testimonials', async () => {
    return await request('GET', API_BASE + '/feedback/testimonials');
  });
  
  // Coupons
  await test('Public', 'Get Active Coupons', async () => {
    return await request('GET', API_BASE + '/coupons/active');
  });
  
  // Loyalty Config
  await test('Public', 'Get Loyalty Config', async () => {
    return await request('GET', API_BASE + '/loyalty/config');
  });
}

async function testCustomerEndpoints() {
  console.log(`\n${C.cyan}${C.bold}╔═══════════════════════════════════════════════════════════════╗${C.reset}`);
  console.log(`${C.cyan}${C.bold}║  LEVEL 5: CUSTOMER PORTAL (Customer Auth Required)            ║${C.reset}`);
  console.log(`${C.cyan}${C.bold}╚═══════════════════════════════════════════════════════════════╝${C.reset}`);
  
  const authHeader = { Authorization: `Bearer ${customerToken}` };
  
  // Customer Portal
  await test('Customer', 'Get Customer Services', async () => {
    return await request('GET', API_BASE + '/customer/services', null, authHeader);
  });
  
  await test('Customer', 'Get Service Categories', async () => {
    return await request('GET', API_BASE + '/customer/services/categories', null, authHeader);
  });
  
  await test('Customer', 'Get Customer Products', async () => {
    return await request('GET', API_BASE + '/customer/products', null, authHeader);
  });
  
  await test('Customer', 'Get Product Categories', async () => {
    return await request('GET', API_BASE + '/customer/products/categories', null, authHeader);
  });
  
  await test('Customer', 'Get Customer Profile', async () => {
    return await request('GET', API_BASE + '/customer/profile', null, authHeader);
  });
  
  await test('Customer', 'Get Customer Dashboard', async () => {
    return await request('GET', API_BASE + '/customer/dashboard', null, authHeader);
  });
  
  await test('Customer', 'Get My Appointments', async () => {
    return await request('GET', API_BASE + '/customer/appointments', null, authHeader);
  });
  
  await test('Customer', 'Get My Orders', async () => {
    return await request('GET', API_BASE + '/customer/orders', null, authHeader);
  });
  
  await test('Customer', 'Get My Payments', async () => {
    return await request('GET', API_BASE + '/customer/payments', null, authHeader);
  });
  
  // Wishlist
  await test('Customer', 'Get Wishlist', async () => {
    return await request('GET', API_BASE + '/wishlist', null, authHeader);
  });
  
  await test('Customer', 'Get Wishlist Count', async () => {
    return await request('GET', API_BASE + '/wishlist/count', null, authHeader);
  });
  
  await test('Customer', 'Get On-Sale Items', async () => {
    return await request('GET', API_BASE + '/wishlist/on-sale', null, authHeader);
  });
  
  // Loyalty
  await test('Customer', 'Get Loyalty Account', async () => {
    return await request('GET', API_BASE + '/loyalty/account', null, authHeader);
  });
  
  await test('Customer', 'Get Loyalty History', async () => {
    return await request('GET', API_BASE + '/loyalty/history', null, authHeader);
  });
  
  await test('Customer', 'Get Leaderboard', async () => {
    return await request('GET', API_BASE + '/loyalty/leaderboard', null, authHeader);
  });
  
  // Gift Cards
  await test('Customer', 'Get My Gift Card Purchases', async () => {
    return await request('GET', API_BASE + '/gift-cards/my-purchases', null, authHeader);
  });
  
  await test('Customer', 'Get My Received Gift Cards', async () => {
    return await request('GET', API_BASE + '/gift-cards/my-received', null, authHeader);
  });
  
  // Feedback
  await test('Customer', 'Get My Feedback', async () => {
    return await request('GET', API_BASE + '/feedback/my-feedback', null, authHeader);
  });
  
  // Waitlist
  await test('Customer', 'Get My Waitlist', async () => {
    return await request('GET', API_BASE + '/waitlist/my', null, authHeader);
  });
}

async function testAdminEndpoints() {
  console.log(`\n${C.cyan}${C.bold}╔═══════════════════════════════════════════════════════════════╗${C.reset}`);
  console.log(`${C.cyan}${C.bold}║  LEVEL 6: ADMIN ENDPOINTS (Admin Auth Required)               ║${C.reset}`);
  console.log(`${C.cyan}${C.bold}╚═══════════════════════════════════════════════════════════════╝${C.reset}`);
  
  const authHeader = { Authorization: `Bearer ${adminToken}` };
  
  // Users
  await test('Admin', 'Get All Users', async () => {
    const res = await request('GET', API_BASE + '/users', null, authHeader);
    if (res.ok) console.log(`    ${C.yellow}→ Found ${res.data?.length || 0} users${C.reset}`);
    return res;
  });
  
  await test('Admin', 'Get Customer Users', async () => {
    return await request('GET', API_BASE + '/users?role=customer', null, authHeader);
  });
  
  // Appointments
  await test('Admin', 'Get All Appointments', async () => {
    const res = await request('GET', API_BASE + '/appointments', null, authHeader);
    if (res.ok) console.log(`    ${C.yellow}→ Found ${res.data?.length || 0} appointments${C.reset}`);
    return res;
  });
  
  // Orders
  await test('Admin', 'Get All Orders', async () => {
    const res = await request('GET', API_BASE + '/orders', null, authHeader);
    if (res.ok) console.log(`    ${C.yellow}→ Found ${res.data?.length || 0} orders${C.reset}`);
    return res;
  });
  
  // Payments
  await test('Admin', 'Get All Payments', async () => {
    return await request('GET', API_BASE + '/payments', null, authHeader);
  });
  
  // Inventory
  await test('Admin', 'Get Inventory', async () => {
    return await request('GET', API_BASE + '/inventory', null, authHeader);
  });
  
  // Coupons
  await test('Admin', 'Get All Coupons', async () => {
    return await request('GET', API_BASE + '/coupons', null, authHeader);
  });
  
  // Expenses
  await test('Admin', 'Get All Expenses', async () => {
    return await request('GET', API_BASE + '/expenses', null, authHeader);
  });
  
  await test('Admin', 'Get Expense Stats', async () => {
    return await request('GET', API_BASE + '/expenses/stats', null, authHeader);
  });
  
  await test('Admin', 'Get Recurring Expenses', async () => {
    return await request('GET', API_BASE + '/expenses/recurring', null, authHeader);
  });
  
  // Schedule
  await test('Admin', 'Get Today Schedule', async () => {
    return await request('GET', API_BASE + '/schedule/today', null, authHeader);
  });
  
  await test('Admin', 'Get Schedule Stats', async () => {
    return await request('GET', API_BASE + '/schedule/stats', null, authHeader);
  });
  
  await test('Admin', 'Get Calendar', async () => {
    return await request('GET', API_BASE + '/schedule/calendar?month=4&year=2026', null, authHeader);
  });
  
  // Package Stats
  await test('Admin', 'Get Package Stats', async () => {
    return await request('GET', API_BASE + '/packages/stats', null, authHeader);
  });
  
  // Gift Cards
  await test('Admin', 'Get All Gift Cards', async () => {
    return await request('GET', API_BASE + '/gift-cards', null, authHeader);
  });
  
  await test('Admin', 'Get Gift Card Stats', async () => {
    return await request('GET', API_BASE + '/gift-cards/stats', null, authHeader);
  });
  
  // Feedback
  await test('Admin', 'Get All Feedback', async () => {
    return await request('GET', API_BASE + '/feedback', null, authHeader);
  });
  
  await test('Admin', 'Get Feedback Analytics', async () => {
    return await request('GET', API_BASE + '/feedback/analytics', null, authHeader);
  });
  
  // Audit
  await test('Admin', 'Get Audit Logs', async () => {
    return await request('GET', API_BASE + '/audit', null, authHeader);
  });
  
  await test('Admin', 'Get Audit Stats', async () => {
    return await request('GET', API_BASE + '/audit/stats', null, authHeader);
  });
  
  // Scheduler
  await test('Admin', 'Get Scheduler Jobs', async () => {
    return await request('GET', API_BASE + '/scheduler/jobs', null, authHeader);
  });
  
  // Marketing
  await test('Admin', 'Get Marketing Campaigns', async () => {
    return await request('GET', API_BASE + '/marketing/campaigns', null, authHeader);
  });
  
  await test('Admin', 'Get Marketing Analytics', async () => {
    return await request('GET', API_BASE + '/marketing/analytics', null, authHeader);
  });
  
  // Attendance
  await test('Admin', 'Get Today Attendance', async () => {
    return await request('GET', API_BASE + '/attendance/admin/today', null, authHeader);
  });
  
  // Waitlist
  await test('Admin', 'Get All Waitlist', async () => {
    return await request('GET', API_BASE + '/waitlist/admin/all', null, authHeader);
  });
  
  await test('Admin', 'Get Waitlist Stats', async () => {
    return await request('GET', API_BASE + '/waitlist/admin/stats', null, authHeader);
  });
}

async function testReportsEndpoints() {
  console.log(`\n${C.cyan}${C.bold}╔═══════════════════════════════════════════════════════════════╗${C.reset}`);
  console.log(`${C.cyan}${C.bold}║  LEVEL 7: REPORTS & ANALYTICS                                 ║${C.reset}`);
  console.log(`${C.cyan}${C.bold}╚═══════════════════════════════════════════════════════════════╝${C.reset}`);
  
  const authHeader = { Authorization: `Bearer ${adminToken}` };
  const today = new Date();
  const startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const endDate = today.toISOString().split('T')[0];
  
  await test('Reports', 'Get Dashboard Stats', async () => {
    const res = await request('GET', API_BASE + '/reports/dashboard', null, authHeader);
    if (res.ok && res.data) {
      console.log(`    ${C.yellow}→ Revenue: ₹${res.data.totalRevenue || 0}${C.reset}`);
      console.log(`    ${C.yellow}→ Customers: ${res.data.totalCustomers || 0}${C.reset}`);
      console.log(`    ${C.yellow}→ Appointments: ${res.data.totalAppointments || 0}${C.reset}`);
    }
    return res;
  });
  
  await test('Reports', 'Get Sales Report', async () => {
    return await request('GET', `${API_BASE}/reports/sales?startDate=${startDate}&endDate=${endDate}`, null, authHeader);
  });
  
  await test('Reports', 'Get Customer Report', async () => {
    return await request('GET', API_BASE + '/reports/customers', null, authHeader);
  });
}

async function testCRUDOperations() {
  console.log(`\n${C.cyan}${C.bold}╔═══════════════════════════════════════════════════════════════╗${C.reset}`);
  console.log(`${C.cyan}${C.bold}║  LEVEL 8: CRUD OPERATIONS                                     ║${C.reset}`);
  console.log(`${C.cyan}${C.bold}╚═══════════════════════════════════════════════════════════════╝${C.reset}`);
  
  const authHeader = { Authorization: `Bearer ${adminToken}` };
  
  // Create Service
  let newServiceId = null;
  await test('CRUD', 'Create Service', async () => {
    const res = await request('POST', API_BASE + '/services', {
      name: `Integration Test Service ${Date.now()}`,
      description: 'Test service created by integration test',
      duration: 30,
      price: 500,
      category: 'hair',
      isActive: true
    }, authHeader);
    if (res.ok) newServiceId = res.data._id;
    return res;
  });
  
  // Create Product
  let newProductId = null;
  await test('CRUD', 'Create Product', async () => {
    const res = await request('POST', API_BASE + '/products', {
      name: `Integration Test Product ${Date.now()}`,
      description: 'Test product',
      price: 299,
      category: 'hair',
      stock: 100
    }, authHeader);
    if (res.ok) newProductId = res.data._id;
    return res;
  });
  
  // Create Appointment (as customer)
  const customerAuthHeader = { Authorization: `Bearer ${customerToken}` };
  await test('CRUD', 'Create Appointment', async () => {
    if (!testServiceId) return { ok: false, error: 'No service ID available' };
    const res = await request('POST', API_BASE + '/appointments', {
      userId: testUserId,
      userName: 'Integration Test User',
      serviceId: testServiceId,
      serviceName: 'Test Service',
      date: '2026-04-30',
      time: '10:00 AM',
      notes: 'Integration test appointment'
    }, customerAuthHeader);
    if (res.ok) testAppointmentId = res.data._id;
    return res;
  });
  
  // Create Coupon
  await test('CRUD', 'Create Coupon', async () => {
    const res = await request('POST', API_BASE + '/coupons', {
      code: `INTTEST${Date.now()}`,
      description: 'Integration test coupon',
      discountType: 'percentage',
      discountValue: 10,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30*24*60*60*1000).toISOString()
    }, authHeader);
    return res;
  });
  
  // Update Appointment Status
  if (testAppointmentId) {
    await test('CRUD', 'Update Appointment Status', async () => {
      return await request('PUT', `${API_BASE}/appointments/status/${testAppointmentId}`, {
        status: 'confirmed'
      }, authHeader);
    });
  }
}

async function testErrorHandling() {
  console.log(`\n${C.cyan}${C.bold}╔═══════════════════════════════════════════════════════════════╗${C.reset}`);
  console.log(`${C.cyan}${C.bold}║  LEVEL 9: ERROR HANDLING                                      ║${C.reset}`);
  console.log(`${C.cyan}${C.bold}╚═══════════════════════════════════════════════════════════════╝${C.reset}`);
  
  // 404 Not Found
  await test('Error', '404 for Non-existent Route', async () => {
    const res = await request('GET', API_BASE + '/nonexistent-route-xyz');
    return { ok: res.status === 404, status: res.status };
  });
  
  // 401 Unauthorized
  await test('Error', '401 for Protected Route without Token', async () => {
    const res = await request('GET', API_BASE + '/users');
    return { ok: res.status === 401, status: res.status };
  });
  
  // 403 Forbidden (customer trying admin route)
  await test('Error', '403 for Customer Accessing Admin Route', async () => {
    const res = await request('GET', API_BASE + '/users', null, {
      Authorization: `Bearer ${customerToken}`
    });
    return { ok: res.status === 403, status: res.status };
  });
  
  // Invalid ObjectId
  await test('Error', 'Invalid MongoDB ObjectId', async () => {
    const res = await request('GET', API_BASE + '/services/invalid-id', null, {
      Authorization: `Bearer ${adminToken}`
    });
    return { ok: res.status >= 400, status: res.status };
  });
  
  // Validation Error
  await test('Error', 'Validation Error on Invalid Data', async () => {
    const res = await request('POST', API_BASE + '/auth/register', {
      email: 'not-an-email',
      password: '123' // too short
    });
    return { ok: res.status === 400, status: res.status };
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EXECUTION
// ═══════════════════════════════════════════════════════════════════════════════

async function runAllTests() {
  console.log(`\n${C.magenta}${C.bold}╔═══════════════════════════════════════════════════════════════════════════════╗${C.reset}`);
  console.log(`${C.magenta}${C.bold}║        BEAUTY PARLOUR - FULL STACK INTEGRATION TEST SUITE                     ║${C.reset}`);
  console.log(`${C.magenta}${C.bold}║        Testing Frontend + Backend Connections (Scratch to Advanced)           ║${C.reset}`);
  console.log(`${C.magenta}${C.bold}╚═══════════════════════════════════════════════════════════════════════════════╝${C.reset}`);
  console.log(`\n${C.yellow}Started: ${new Date().toISOString()}${C.reset}`);
  console.log(`${C.yellow}Backend: ${BACKEND_URL}${C.reset}`);
  console.log(`${C.yellow}Frontend: ${FRONTEND_URL}${C.reset}`);
  
  const startTime = Date.now();
  
  // Run all test suites in order
  await testServerConnectivity();
  await testDatabaseConnection();
  await testAuthentication();
  await testPublicEndpoints();
  await testCustomerEndpoints();
  await testAdminEndpoints();
  await testReportsEndpoints();
  await testCRUDOperations();
  await testErrorHandling();
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  // Summary
  console.log(`\n${C.magenta}${C.bold}╔═══════════════════════════════════════════════════════════════════════════════╗${C.reset}`);
  console.log(`${C.magenta}${C.bold}║                           FINAL TEST SUMMARY                                  ║${C.reset}`);
  console.log(`${C.magenta}${C.bold}╚═══════════════════════════════════════════════════════════════════════════════╝${C.reset}`);
  
  const total = results.passed + results.failed;
  const rate = ((results.passed / total) * 100).toFixed(2);
  
  console.log(`\n  Total Tests: ${total}`);
  console.log(`  ${C.green}Passed: ${results.passed}${C.reset}`);
  console.log(`  ${C.red}Failed: ${results.failed}${C.reset}`);
  console.log(`  Success Rate: ${rate >= 95 ? C.green : rate >= 80 ? C.yellow : C.red}${rate}%${C.reset}`);
  console.log(`  Duration: ${duration}s`);
  
  // List failed tests
  const failedTests = results.tests.filter(t => !t.passed);
  if (failedTests.length > 0) {
    console.log(`\n${C.red}━━━ FAILED TESTS ━━━${C.reset}`);
    failedTests.forEach(t => {
      console.log(`  ${C.red}✗${C.reset} [${t.category}] ${t.name}: Status ${t.status || t.error}`);
    });
  }
  
  // Results by category
  console.log(`\n${C.yellow}━━━ RESULTS BY CATEGORY ━━━${C.reset}`);
  const categories = [...new Set(results.tests.map(t => t.category))];
  categories.forEach(cat => {
    const catTests = results.tests.filter(t => t.category === cat);
    const catPassed = catTests.filter(t => t.passed).length;
    const catTotal = catTests.length;
    const icon = catPassed === catTotal ? `${C.green}✓${C.reset}` : `${C.red}✗${C.reset}`;
    console.log(`  ${icon} ${cat}: ${catPassed}/${catTotal}`);
  });
  
  console.log(`\n${C.yellow}Finished: ${new Date().toISOString()}${C.reset}\n`);
}

runAllTests().catch(console.error);
