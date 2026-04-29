// Frontend API Connection Tester
// This script tests all the API endpoints that the Angular frontend services use
// Run: node test-frontend-apis.js

const http = require('http');

const API_BASE = 'http://localhost:3000/api';
let authToken = '';
let testResults = [];

// Colors for console
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function request(method, path, body = null, useAuth = false) {
  return new Promise((resolve) => {
    const url = new URL(API_BASE + path);
    const payload = body ? JSON.stringify(body) : null;
    
    const options = {
      hostname: url.hostname,
      port: url.port || 3000,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload && { 'Content-Length': Buffer.byteLength(payload) }),
        ...(useAuth && authToken && { 'Authorization': `Bearer ${authToken}` })
      }
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
    if (payload) req.write(payload);
    req.end();
  });
}

async function test(category, name, method, path, body = null, useAuth = false, expectedStatus = [200, 201]) {
  const result = await request(method, path, body, useAuth);
  const passed = expectedStatus.includes(result.status);
  const status = passed ? 'PASS' : 'FAIL';
  const color = passed ? colors.green : colors.red;
  
  console.log(`${color}[${status}]${colors.reset} ${name} - ${method} ${path} (${result.status})`);
  
  testResults.push({ category, name, method, path, status, statusCode: result.status, passed });
  return result;
}

async function runTests() {
  console.log(`\n${colors.cyan}╔═══════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║       FRONTEND API CONNECTION TEST SUITE                      ║${colors.reset}`);
  console.log(`${colors.cyan}╠═══════════════════════════════════════════════════════════════╣${colors.reset}`);
  console.log(`${colors.cyan}║  Testing all Angular service API endpoints against backend    ║${colors.reset}`);
  console.log(`${colors.cyan}╚═══════════════════════════════════════════════════════════════╝${colors.reset}\n`);

  // ═══════════════════════════════════════════════════════════════
  // 1. BASIC CONNECTIVITY
  // ═══════════════════════════════════════════════════════════════
  console.log(`\n${colors.yellow}━━━ 1. BASIC CONNECTIVITY ━━━${colors.reset}`);
  await test('Connectivity', 'Health Check (Root)', 'GET', '/../');
  await test('Connectivity', 'Health Check (Detailed)', 'GET', '/../health');

  // ═══════════════════════════════════════════════════════════════
  // 2. AUTH SERVICE (auth.service.ts)
  // ═══════════════════════════════════════════════════════════════
  console.log(`\n${colors.yellow}━━━ 2. AUTH SERVICE ━━━${colors.reset}`);
  
  // Register new user
  const testEmail = `frontend-test-${Date.now()}@test.com`;
  const registerRes = await test('Auth', 'Register User', 'POST', '/auth/register', {
    name: 'Frontend Test User',
    email: testEmail,
    phone: '9876543210',
    password: 'TestPass123!'
  });

  // Login with new user
  const loginRes = await test('Auth', 'Login User', 'POST', '/auth/login', {
    email: testEmail,
    password: 'TestPass123!'
  });

  if (loginRes.data?.accessToken) {
    authToken = loginRes.data.accessToken;
    console.log(`    ${colors.green}✓ Customer token obtained${colors.reset}`);
  }

  // Get profile
  await test('Auth', 'Get Profile', 'GET', '/auth/profile', null, true);

  // Admin login for admin tests
  const adminLoginRes = await test('Auth', 'Admin Login', 'POST', '/auth/login', {
    email: 'admin@beauty.com',
    password: 'admin123'
  });

  let adminToken = '';
  if (adminLoginRes.data?.accessToken) {
    adminToken = adminLoginRes.data.accessToken;
    console.log(`    ${colors.green}✓ Admin token obtained${colors.reset}`);
  }

  // ═══════════════════════════════════════════════════════════════
  // 3. SERVICE SERVICE (service.service.ts)
  // ═══════════════════════════════════════════════════════════════
  console.log(`\n${colors.yellow}━━━ 3. SERVICE SERVICE (Beauty Services) ━━━${colors.reset}`);
  await test('Services', 'Get All Services', 'GET', '/services');
  // Note: /services/popular may not exist - let's check
  await test('Services', 'Get Popular Services', 'GET', '/services?popular=true');

  // ═══════════════════════════════════════════════════════════════
  // 4. PRODUCT SERVICE (product.service.ts)
  // ═══════════════════════════════════════════════════════════════
  console.log(`\n${colors.yellow}━━━ 4. PRODUCT SERVICE ━━━${colors.reset}`);
  await test('Products', 'Get All Products', 'GET', '/products');
  const productsRes = await request('GET', '/products');
  const firstProductId = productsRes.data?.[0]?._id;
  if (firstProductId) {
    await test('Products', 'Get Product by ID', 'GET', `/products/${firstProductId}`);
  }

  // ═══════════════════════════════════════════════════════════════
  // 5. STAFF SERVICE (staff.service.ts)
  // ═══════════════════════════════════════════════════════════════
  console.log(`\n${colors.yellow}━━━ 5. STAFF SERVICE ━━━${colors.reset}`);
  await test('Staff', 'Get All Staff', 'GET', '/staff');
  await test('Staff', 'Get Available Staff', 'GET', '/staff/available');

  // ═══════════════════════════════════════════════════════════════
  // 6. CUSTOMER PORTAL (customer-portal)
  // ═══════════════════════════════════════════════════════════════
  console.log(`\n${colors.yellow}━━━ 6. CUSTOMER PORTAL ━━━${colors.reset}`);
  await test('Customer', 'Get Customer Services', 'GET', '/customer/services');
  await test('Customer', 'Get Service Categories', 'GET', '/customer/services/categories');
  await test('Customer', 'Get Customer Products', 'GET', '/customer/products');
  await test('Customer', 'Get Products Categories', 'GET', '/customer/products/categories');
  await test('Customer', 'Get Available Staff', 'GET', '/customer/staff');
  
  // Authenticated customer endpoints
  if (authToken) {
    await test('Customer', 'Get Customer Profile', 'GET', '/customer/profile', null, true);
    await test('Customer', 'Get Customer Dashboard', 'GET', '/customer/dashboard', null, true);
    await test('Customer', 'Get Customer Appointments', 'GET', '/customer/appointments', null, true);
    await test('Customer', 'Get Customer Orders', 'GET', '/customer/orders', null, true);
    await test('Customer', 'Get Customer Payments', 'GET', '/customer/payments', null, true);
  }

  // ═══════════════════════════════════════════════════════════════
  // 7. APPOINTMENT SERVICE (appointment.service.ts)
  // ═══════════════════════════════════════════════════════════════
  console.log(`\n${colors.yellow}━━━ 7. APPOINTMENT SERVICE (Admin) ━━━${colors.reset}`);
  const prevToken = authToken;
  authToken = adminToken;
  
  await test('Appointments', 'Get All Appointments', 'GET', '/appointments', null, true);
  
  authToken = prevToken; // Restore customer token

  // ═══════════════════════════════════════════════════════════════
  // 8. ORDER SERVICE (order.service.ts)
  // ═══════════════════════════════════════════════════════════════
  console.log(`\n${colors.yellow}━━━ 8. ORDER SERVICE (Admin) ━━━${colors.reset}`);
  authToken = adminToken;
  await test('Orders', 'Get All Orders', 'GET', '/orders', null, true);
  authToken = prevToken;

  // ═══════════════════════════════════════════════════════════════
  // 9. WISHLIST SERVICE (wishlist.service.ts)
  // ═══════════════════════════════════════════════════════════════
  console.log(`\n${colors.yellow}━━━ 9. WISHLIST SERVICE ━━━${colors.reset}`);
  if (authToken) {
    await test('Wishlist', 'Get Wishlist', 'GET', '/wishlist', null, true);
    await test('Wishlist', 'Get Wishlist Count', 'GET', '/wishlist/count', null, true);
    await test('Wishlist', 'Get On-Sale Items', 'GET', '/wishlist/on-sale', null, true);
  }

  // ═══════════════════════════════════════════════════════════════
  // 10. LOYALTY SERVICE (loyalty.service.ts)
  // ═══════════════════════════════════════════════════════════════
  console.log(`\n${colors.yellow}━━━ 10. LOYALTY SERVICE ━━━${colors.reset}`);
  await test('Loyalty', 'Get Loyalty Config', 'GET', '/loyalty/config');
  if (authToken) {
    await test('Loyalty', 'Get My Loyalty Account', 'GET', '/loyalty/account', null, true);
    await test('Loyalty', 'Get Loyalty History', 'GET', '/loyalty/history', null, true);
    await test('Loyalty', 'Get Leaderboard', 'GET', '/loyalty/leaderboard', null, true);
  }

  // ═══════════════════════════════════════════════════════════════
  // 11. PACKAGE SERVICE (package.service.ts)
  // ═══════════════════════════════════════════════════════════════
  console.log(`\n${colors.yellow}━━━ 11. PACKAGE SERVICE ━━━${colors.reset}`);
  await test('Packages', 'Get All Packages', 'GET', '/packages');
  await test('Packages', 'Get Active Packages', 'GET', '/packages/active');
  await test('Packages', 'Get Popular Packages', 'GET', '/packages/popular');
  
  authToken = adminToken;
  await test('Packages', 'Get Package Stats', 'GET', '/packages/stats', null, true);
  authToken = prevToken;

  // ═══════════════════════════════════════════════════════════════
  // 12. SCHEDULE SERVICE (schedule.service.ts)
  // ═══════════════════════════════════════════════════════════════
  console.log(`\n${colors.yellow}━━━ 12. SCHEDULE SERVICE (Admin) ━━━${colors.reset}`);
  authToken = adminToken;
  await test('Schedule', 'Get All Schedules', 'GET', '/schedule', null, true);
  await test('Schedule', 'Get Today Schedule', 'GET', '/schedule/today', null, true);
  await test('Schedule', 'Get Schedule Stats', 'GET', '/schedule/stats', null, true);
  await test('Schedule', 'Get Calendar (April 2026)', 'GET', '/schedule/calendar?month=4&year=2026', null, true);
  authToken = prevToken;

  // ═══════════════════════════════════════════════════════════════
  // 13. COUPON SERVICE (coupon.service.ts)
  // ═══════════════════════════════════════════════════════════════
  console.log(`\n${colors.yellow}━━━ 13. COUPON SERVICE ━━━${colors.reset}`);
  await test('Coupons', 'Get Active Coupons', 'GET', '/coupons/active');
  
  authToken = adminToken;
  await test('Coupons', 'Get All Coupons (Admin)', 'GET', '/coupons', null, true);
  authToken = prevToken;

  // ═══════════════════════════════════════════════════════════════
  // 14. EXPENSE SERVICE (expense.service.ts)
  // ═══════════════════════════════════════════════════════════════
  console.log(`\n${colors.yellow}━━━ 14. EXPENSE SERVICE (Admin) ━━━${colors.reset}`);
  authToken = adminToken;
  await test('Expenses', 'Get All Expenses', 'GET', '/expenses', null, true);
  await test('Expenses', 'Get Expense Stats', 'GET', '/expenses/stats', null, true);
  await test('Expenses', 'Get Recurring Expenses', 'GET', '/expenses/recurring', null, true);
  authToken = prevToken;

  // ═══════════════════════════════════════════════════════════════
  // 15. INVENTORY SERVICE (inventory.service.ts)
  // ═══════════════════════════════════════════════════════════════
  console.log(`\n${colors.yellow}━━━ 15. INVENTORY SERVICE (Admin) ━━━${colors.reset}`);
  authToken = adminToken;
  await test('Inventory', 'Get All Inventory', 'GET', '/inventory', null, true);
  authToken = prevToken;

  // ═══════════════════════════════════════════════════════════════
  // 16. PAYMENT SERVICE (payment.service.ts)
  // ═══════════════════════════════════════════════════════════════
  console.log(`\n${colors.yellow}━━━ 16. PAYMENT SERVICE (Admin) ━━━${colors.reset}`);
  authToken = adminToken;
  await test('Payments', 'Get All Payments', 'GET', '/payments', null, true);
  authToken = prevToken;

  // ═══════════════════════════════════════════════════════════════
  // 17. REPORTS SERVICE (reports.service.ts)
  // ═══════════════════════════════════════════════════════════════
  console.log(`\n${colors.yellow}━━━ 17. REPORTS SERVICE (Admin) ━━━${colors.reset}`);
  authToken = adminToken;
  await test('Reports', 'Get Dashboard Stats', 'GET', '/reports/dashboard', null, true);
  await test('Reports', 'Get Customer Report', 'GET', '/reports/customers', null, true);
  
  const today = new Date();
  const startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const endDate = today.toISOString().split('T')[0];
  await test('Reports', 'Get Sales Report', 'GET', `/reports/sales?startDate=${startDate}&endDate=${endDate}`, null, true);
  authToken = prevToken;

  // ═══════════════════════════════════════════════════════════════
  // 18. USER SERVICE (user.service.ts)
  // ═══════════════════════════════════════════════════════════════
  console.log(`\n${colors.yellow}━━━ 18. USER SERVICE (Admin) ━━━${colors.reset}`);
  authToken = adminToken;
  await test('Users', 'Get All Users', 'GET', '/users', null, true);
  await test('Users', 'Get All Customers', 'GET', '/users?role=customer', null, true);
  authToken = prevToken;

  // ═══════════════════════════════════════════════════════════════
  // 19. REVIEW SERVICE (review.service.ts)
  // ═══════════════════════════════════════════════════════════════
  console.log(`\n${colors.yellow}━━━ 19. REVIEW SERVICE ━━━${colors.reset}`);
  await test('Reviews', 'Get Public Reviews', 'GET', '/reviews/public');
  await test('Reviews', 'Get Review Stats', 'GET', '/reviews/stats');

  // ═══════════════════════════════════════════════════════════════
  // 20. FEEDBACK SERVICE (feedback.service.ts)
  // ═══════════════════════════════════════════════════════════════
  console.log(`\n${colors.yellow}━━━ 20. FEEDBACK SERVICE ━━━${colors.reset}`);
  await test('Feedback', 'Get Public Feedback', 'GET', '/feedback/public');
  await test('Feedback', 'Get Testimonials', 'GET', '/feedback/testimonials');

  // ═══════════════════════════════════════════════════════════════
  // 21. GIFT CARD SERVICE (gift-card.service.ts)
  // ═══════════════════════════════════════════════════════════════
  console.log(`\n${colors.yellow}━━━ 21. GIFT CARD SERVICE ━━━${colors.reset}`);
  if (authToken) {
    await test('GiftCards', 'Get My Purchases', 'GET', '/gift-cards/my-purchases', null, true);
    await test('GiftCards', 'Get My Received', 'GET', '/gift-cards/my-received', null, true);
  }
  
  authToken = adminToken;
  await test('GiftCards', 'Get All Gift Cards (Admin)', 'GET', '/gift-cards', null, true);
  await test('GiftCards', 'Get Gift Card Stats', 'GET', '/gift-cards/stats', null, true);
  authToken = prevToken;

  // ═══════════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════════
  console.log(`\n${colors.cyan}╔═══════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║                      TEST SUMMARY                             ║${colors.reset}`);
  console.log(`${colors.cyan}╚═══════════════════════════════════════════════════════════════╝${colors.reset}`);

  const passed = testResults.filter(t => t.passed).length;
  const failed = testResults.filter(t => !t.passed).length;
  const total = testResults.length;
  const rate = ((passed / total) * 100).toFixed(2);

  console.log(`\nTotal Tests: ${total}`);
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
  console.log(`Success Rate: ${rate}%\n`);

  if (failed > 0) {
    console.log(`${colors.red}━━━ FAILED TESTS ━━━${colors.reset}`);
    testResults.filter(t => !t.passed).forEach(t => {
      console.log(`${colors.red}✗${colors.reset} [${t.category}] ${t.name}: ${t.method} ${t.path} - Status ${t.statusCode}`);
    });
  }

  // Group results by category
  console.log(`\n${colors.yellow}━━━ RESULTS BY SERVICE ━━━${colors.reset}`);
  const categories = [...new Set(testResults.map(t => t.category))];
  categories.forEach(cat => {
    const catTests = testResults.filter(t => t.category === cat);
    const catPassed = catTests.filter(t => t.passed).length;
    const catTotal = catTests.length;
    const icon = catPassed === catTotal ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`;
    console.log(`${icon} ${cat}: ${catPassed}/${catTotal}`);
  });

  console.log('');
}

runTests().catch(console.error);
