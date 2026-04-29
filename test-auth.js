const http = require('http');

// Test Login
console.log('Testing Login API...');
const loginData = JSON.stringify({
  email: 'admin@beauty.com',
  password: 'admin123'
});

const loginOptions = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
};

const loginReq = http.request(loginOptions, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Login Status:', res.statusCode);
    console.log('Login Response:', body);
    
    // Test Register
    console.log('\nTesting Register API...');
    const registerData = JSON.stringify({
      name: 'Test User',
      email: 'test' + Date.now() + '@example.com',
      phone: '9876543210',
      password: 'Test123!'
    });
    
    const registerOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': registerData.length
      }
    };
    
    const registerReq = http.request(registerOptions, (res2) => {
      let body2 = '';
      res2.on('data', chunk => body2 += chunk);
      res2.on('end', () => {
        console.log('Register Status:', res2.statusCode);
        console.log('Register Response:', body2);
      });
    });
    
    registerReq.on('error', (e) => console.log('Register Error:', e.message));
    registerReq.write(registerData);
    registerReq.end();
  });
});

loginReq.on('error', (e) => console.log('Login Error:', e.message));
loginReq.write(loginData);
loginReq.end();
