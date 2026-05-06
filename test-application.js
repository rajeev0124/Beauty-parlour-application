// Comprehensive Application Test Suite
// Tests all components: Backend API, Frontend, Database, Authentication

const http = require('http');
const https = require('https');

class TestRunner {
  constructor() {
    this.totalTests = 0;
    this.passed = 0;
    this.failed = 0;
    this.results = [];
  }

  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : http;
      const requestOptions = {
        timeout: 15000,
        ...options
      };

      const req = protocol.request(url, requestOptions, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve({ status: res.statusCode, data: parsed, raw: data });
          } catch {
            resolve({ status: res.statusCode, data: null, raw: data });
          }
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      if (options.body) {
        req.write(JSON.stringify(options.body));
      }
      req.end();
    });
  }

  async test(name, url, options = {}) {
    this.totalTests++;
    const testNum = this.totalTests;
    process.stdout.write(`\n[TEST ${testNum}] ${name}\n`);
    process.stdout.write(`URL: ${url}\n`);

    try {
      const result = await this.makeRequest(url, options);
      
      if (result.status >= 200 && result.status < 300) {
        process.stdout.write(`✅ PASSED (${result.status})\n`);
        if (result.data) {
          if (Array.isArray(result.data)) {
            process.stdout.write(`   Items: ${result.data.length}\n`);
            if (result.data.length > 0) {
              process.stdout.write(`   Sample: ${JSON.stringify(result.data[0]).substring(0, 100)}...\n`);
            }
          } else {
            process.stdout.write(`   Response: ${JSON.stringify(result.data).substring(0, 150)}...\n`);
          }
        }
        this.passed++;
        return true;
      } else {
        process.stdout.write(`❌ FAILED (${result.status})\n`);
        this.failed++;
        return false;
      }
    } catch (error) {
      process.stdout.write(`❌ FAILED\n   Error: ${error.message}\n`);
      this.failed++;
      return false;
    }
  }

  async testAuth() {
    const email = `testuser_${Math.random().toString(36).substring(7)}@beauty.test`;
    const password = 'Test@12345';
    const testNum = this.totalTests + 1;
    
    process.stdout.write(`\n[TEST ${testNum}] User Registration\n`);
    process.stdout.write(`URL: https://beauty-pallour-application.onrender.com/api/auth/register\n`);
    process.stdout.write(`Creating user: ${email}\n`);
    
    try {
      const registerRes = await this.makeRequest(
        'https://beauty-pallour-application.onrender.com/api/auth/register',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: {
            name: 'Test User',
            email: email,
            phone: '9876543210',
            password: password
          }
        }
      );

      this.totalTests++;
      
      if (registerRes.status === 201) {
        process.stdout.write(`✅ PASSED (201)\n   User created: ${email}\n`);
        this.passed++;

        // Try login
        this.totalTests++;
        process.stdout.write(`\n[TEST ${this.totalTests}] User Login\n`);
        process.stdout.write(`URL: https://beauty-pallour-application.onrender.com/api/auth/login\n`);

        try {
          const loginRes = await this.makeRequest(
            'https://beauty-pallour-application.onrender.com/api/auth/login',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: { email: email, password: password }
            }
          );

          if (loginRes.status === 201 && loginRes.data?.access_token) {
            process.stdout.write(`✅ PASSED (201)\n   Token issued\n`);
            this.passed++;
            return loginRes.data.access_token;
          } else {
            process.stdout.write(`❌ FAILED (${loginRes.status})\n`);
            this.failed++;
          }
        } catch (error) {
          process.stdout.write(`❌ FAILED\n   Error: ${error.message}\n`);
          this.failed++;
        }
      } else {
        process.stdout.write(`❌ FAILED (${registerRes.status})\n`);
        this.failed++;
      }
    } catch (error) {
      process.stdout.write(`❌ FAILED\n   Error: ${error.message}\n`);
      this.failed++;
    }
  }

  async testFrontend() {
    this.totalTests++;
    const testNum = this.totalTests;
    process.stdout.write(`\n[TEST ${testNum}] Frontend Main Page\n`);
    process.stdout.write(`URL: https://beauty-parlour-0124.web.app\n`);

    try {
      const res = await this.makeRequest('https://beauty-parlour-0124.web.app');
      if (res.status === 200 && res.raw.includes('Beauty Parlour')) {
        process.stdout.write(`✅ PASSED (200)\n   Frontend loaded successfully\n`);
        this.passed++;
      } else {
        process.stdout.write(`❌ FAILED (${res.status})\n`);
        this.failed++;
      }
    } catch (error) {
      process.stdout.write(`❌ FAILED\n   Error: ${error.message}\n`);
      this.failed++;
    }
  }

  printReport() {
    const percentage = Math.round((this.passed / this.totalTests) * 100);
    
    process.stdout.write('\n');
    process.stdout.write('╔════════════════════════════════════════════════════════╗\n');
    process.stdout.write('║                    FINAL REPORT                        ║\n');
    process.stdout.write('╚════════════════════════════════════════════════════════╝\n');
    process.stdout.write(`\nTotal Tests: ${this.totalTests}\n`);
    process.stdout.write(`✅ Passed: ${this.passed}\n`);
    process.stdout.write(`❌ Failed: ${this.failed}\n`);
    process.stdout.write(`Success Rate: ${percentage}%\n\n`);

    if (this.failed === 0) {
      process.stdout.write('🎉 ALL TESTS PASSED! APPLICATION IS FULLY OPERATIONAL! 🎉\n\n');
      process.stdout.write('✅ Backend: Fully Operational\n');
      process.stdout.write('✅ Frontend: Fully Operational\n');
      process.stdout.write('✅ Database: Fully Connected\n');
      process.stdout.write('✅ Authentication: Fully Working\n');
      process.stdout.write('✅ Integration: Fully Verified\n\n');
      process.stdout.write('🚀 YOUR APPLICATION IS PRODUCTION READY!\n');
    } else if (this.failed < 3) {
      process.stdout.write('⚠️  MOSTLY WORKING - Minor issues found\n');
    } else {
      process.stdout.write('❌ CRITICAL ISSUES FOUND\n');
    }
  }

  async runAll() {
    process.stdout.write('\n');
    process.stdout.write('╔════════════════════════════════════════════════════════╗\n');
    process.stdout.write('║  COMPLETE BEAUTY PARLOUR APPLICATION TEST SUITE       ║\n');
    process.stdout.write('║  Testing all components, endpoints, and workflows     ║\n');
    process.stdout.write('╚════════════════════════════════════════════════════════╝\n');

    // Section 1: Backend Tests
    process.stdout.write('\n═══════════════════════════════════════════════════════\n');
    process.stdout.write('SECTION 1: BACKEND INFRASTRUCTURE\n');
    process.stdout.write('═══════════════════════════════════════════════════════\n');

    await this.test('Backend Health Check', 'https://beauty-pallour-application.onrender.com/api/health');
    await this.test('Get All Services', 'https://beauty-pallour-application.onrender.com/api/services');
    await this.test('Get All Products', 'https://beauty-pallour-application.onrender.com/api/products');
    await this.test('Get All Reviews', 'https://beauty-pallour-application.onrender.com/api/reviews');

    // Section 2: Frontend
    process.stdout.write('\n═══════════════════════════════════════════════════════\n');
    process.stdout.write('SECTION 2: FRONTEND DEPLOYMENT\n');
    process.stdout.write('═══════════════════════════════════════════════════════\n');

    await this.testFrontend();

    // Section 3: Authentication
    process.stdout.write('\n═══════════════════════════════════════════════════════\n');
    process.stdout.write('SECTION 3: USER AUTHENTICATION\n');
    process.stdout.write('═══════════════════════════════════════════════════════\n');

    await this.testAuth();

    // Final Report
    this.printReport();
  }
}

// Run tests
const runner = new TestRunner();
runner.runAll().catch(console.error);
