# 🔐 Security Testing Guide

## Overview

This guide covers comprehensive security testing strategies for the beauty parlour application, ensuring protection against common vulnerabilities and compliance with OWASP standards.

---

## 📋 Security Testing Checklist

### 1. **Authentication & Authorization**

#### JWT Token Security Tests
```typescript
describe('JWT Security Tests', () => {
  it('should reject expired tokens', async () => {
    const expiredToken = generateExpiredToken(payload);
    const response = await request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(401);
  });

  it('should reject modified tokens', async () => {
    const token = 'valid.token.here';
    const modifiedToken = token.slice(0, -5) + 'XXXXX'; // Tamper with token
    
    await request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer ${modifiedToken}`)
      .expect(401);
  });

  it('should reject token with invalid signature', async () => {
    const token = jwtService.sign(payload, { secret: 'wrong-secret' });
    
    await request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .expect(401);
  });
});
```

#### Role-Based Access Control (RBAC) Tests
```typescript
describe('RBAC Security Tests', () => {
  it('should prevent customer from accessing admin endpoints', async () => {
    const customerToken = generateCustomerToken();
    
    await request(app.getHttpServer())
      .get('/admin/users')
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(403);
  });

  it('should allow staff to access staff endpoints', async () => {
    const staffToken = generateStaffToken();
    
    await request(app.getHttpServer())
      .get('/appointments')
      .set('Authorization', `Bearer ${staffToken}`)
      .expect(200);
  });

  it('should prevent privilege escalation', async () => {
    const token = generateCustomerToken();
    const modifiedPayload = { ...payload, role: 'admin' };
    // Token should not be modifiable on client side
  });
});
```

### 2. **Password Security**

#### Password Hashing Tests
```typescript
describe('Password Security Tests', () => {
  it('should hash passwords with bcrypt', async () => {
    const plainPassword = 'SecurePassword123!';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    
    expect(hashedPassword).not.toBe(plainPassword);
    expect(await bcrypt.compare(plainPassword, hashedPassword)).toBe(true);
  });

  it('should reject weak passwords', async () => {
    const weakPassword = '123'; // Too weak
    
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'User',
        email: 'user@example.com',
        phone: '9876543210',
        password: weakPassword,
      })
      .expect(400);
    
    expect(response.body.message).toContain('password');
  });

  it('should enforce password minimum requirements', async () => {
    const requirements = {
      minLength: 8,
      requireUppercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
    };
  });

  it('should hash password before storing', async () => {
    const plainPassword = 'ValidPassword123!';
    const user = await service.register({
      name: 'Test User',
      email: `pwd-test-${Date.now()}@example.com`,
      phone: '9876543210',
      password: plainPassword,
    });
    
    const dbUser = await userModel.findById(user._id);
    expect(dbUser.password).not.toBe(plainPassword);
    expect(await bcrypt.compare(plainPassword, dbUser.password)).toBe(true);
  });
});
```

### 3. **Input Validation & Sanitization**

#### XSS Prevention Tests
```typescript
describe('XSS Prevention Tests', () => {
  it('should sanitize user input to prevent XSS', async () => {
    const maliciousInput = '<img src=x onerror="alert(\'XSS\')">';
    
    const response = await request(app.getHttpServer())
      .post('/appointments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        serviceId: '607f1f77bcf86cd799439030',
        date: '2024-05-15',
        time: '10:00 AM',
        notes: maliciousInput,
      });
    
    // Should be sanitized or rejected
    const appointment = response.body;
    expect(appointment.notes).not.toContain('onerror');
  });

  it('should encode HTML special characters', async () => {
    const input = '<script>alert("XSS")</script>';
    const sanitized = sanitizeHtml(input);
    
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).not.toContain('</script>');
  });
});
```

#### NoSQL Injection Prevention Tests
```typescript
describe('NoSQL Injection Prevention Tests', () => {
  it('should prevent NoSQL injection in login', async () => {
    const maliciousEmail = { $ne: null }; // NoSQL injection attempt
    
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: maliciousEmail,
        password: 'anypassword',
      })
      .expect(400); // Should reject
  });

  it('should prevent NoSQL injection in queries', async () => {
    const maliciousQuery = { $where: 'return this.password == "admin"' };
    
    // Service should validate and reject
    expect(() => {
      appointmentModel.find(maliciousQuery);
    }).toThrow();
  });
});
```

### 4. **API Security**

#### Rate Limiting Tests
```typescript
describe('Rate Limiting Tests', () => {
  it('should enforce rate limiting on login endpoint', async () => {
    const credentials = {
      email: 'user@example.com',
      password: 'password123',
    };
    
    // Send multiple requests quickly
    for (let i = 0; i < 11; i++) {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(credentials);
      
      if (i < 10) {
        expect(response.status).not.toBe(429);
      } else {
        expect(response.status).toBe(429); // Too Many Requests
      }
    }
  });

  it('should implement exponential backoff for rate limiting', async () => {
    // First request succeeds
    let response = await request(app.getHttpServer())
      .get('/appointments');
    
    expect(response.status).toBe(200);
    
    // Subsequent rapid requests should be throttled
  });
});
```

#### CORS Security Tests
```typescript
describe('CORS Security Tests', () => {
  it('should reject requests from unauthorized origins', async () => {
    const response = await request(app.getHttpServer())
      .get('/appointments')
      .set('Origin', 'https://malicious-site.com')
      .expect(403); // Forbidden
  });

  it('should allow requests from whitelisted origins', async () => {
    const response = await request(app.getHttpServer())
      .get('/appointments')
      .set('Origin', 'https://beauty-parlour.com')
      .expect(200);
  });
});
```

### 5. **Data Protection**

#### Sensitive Data Exposure Tests
```typescript
describe('Sensitive Data Protection Tests', () => {
  it('should not expose passwords in API responses', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.body).not.toHaveProperty('password');
  });

  it('should not expose refresh tokens in list endpoints', async () => {
    const response = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${adminToken}`);
    
    response.body.forEach((user) => {
      expect(user).not.toHaveProperty('refreshToken');
    });
  });

  it('should use HTTPS in production', () => {
    expect(process.env.NODE_ENV).toBe('production');
    // Verify SSL/TLS is configured
  });

  it('should set secure HTTP headers', async () => {
    const response = await request(app.getHttpServer())
      .get('/appointments');
    
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-frame-options']).toBe('DENY');
    expect(response.headers['strict-transport-security']).toBeDefined();
  });
});
```

### 6. **Access Control Tests**

#### Unauthorized Access Prevention
```typescript
describe('Unauthorized Access Tests', () => {
  it('should prevent accessing other users\' appointments', async () => {
    const user1Token = generateCustomerToken(user1Id);
    const user2Token = generateCustomerToken(user2Id);
    
    // User1 creates appointment
    const appointment = await createAppointment(user1Token);
    
    // User2 tries to access User1's appointment
    const response = await request(app.getHttpServer())
      .get(`/appointments/${appointment._id}`)
      .set('Authorization', `Bearer ${user2Token}`)
      .expect(403); // Forbidden
  });

  it('should prevent modifying other users\' data', async () => {
    const user1Token = generateCustomerToken(user1Id);
    const user2Token = generateCustomerToken(user2Id);
    
    const appointment = await createAppointment(user1Token, user1Id);
    
    await request(app.getHttpServer())
      .put(`/appointments/${appointment._id}`)
      .set('Authorization', `Bearer ${user2Token}`)
      .send({ status: 'cancelled' })
      .expect(403);
  });
});
```

---

## 🛠️ Running Security Tests

```bash
# Run all security tests
npm run test -- --testPathPattern="security"

# Run with coverage for security
npm run test:cov -- --testPathPattern="security"

# Run security tests in isolation
npm run test -- --testNamePattern="Security|RBAC|Password|XSS|Injection"
```

---

## 📊 Security Scanning Tools

### OWASP ZAP
```bash
# Install OWASP ZAP
docker pull owasp/zap2docker-stable

# Run automated security scan
docker run -t owasp/zap2docker-stable zap-baseline.py -t http://localhost:3000
```

### npm audit
```bash
# Check for vulnerable dependencies
npm audit

# Fix vulnerabilities automatically
npm audit fix
```

### Snyk
```bash
# Install Snyk
npm install -g snyk

# Test for vulnerabilities
snyk test

# Monitor continuously
snyk monitor
```

---

## 🔐 Security Best Practices

1. **Always use HTTPS** in production
2. **Rotate secrets** regularly
3. **Keep dependencies updated** - run `npm audit` regularly
4. **Use environment variables** for sensitive configuration
5. **Implement logging** for security events
6. **Use strong password requirements** (minimum 8 characters, mixed case, numbers, symbols)
7. **Set secure cookies** - HttpOnly, Secure, SameSite flags
8. **Validate all inputs** - both on frontend and backend
9. **Implement rate limiting** on sensitive endpoints
10. **Use prepared statements** to prevent SQL/NoSQL injection

---

## 📝 OWASP Top 10 Mapping

| OWASP Top 10 | Coverage | Test Location |
|--------------|----------|---------------|
| Injection | ✅ | NoSQL Injection tests |
| Broken Auth | ✅ | JWT Security & RBAC tests |
| Sensitive Data | ✅ | Data Protection tests |
| XML External | ⚠️ | N/A (not applicable) |
| Broken Access | ✅ | Access Control tests |
| Security Config | ✅ | HTTP Headers tests |
| XSS | ✅ | XSS Prevention tests |
| Deserialization | ⚠️ | Limited |
| Components | ✅ | npm audit |
| Logging | ✅ | Audit logging |

---

**Last Updated**: May 4, 2026
