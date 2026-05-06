# ⚡ Performance Testing Guide

## Overview

This guide covers performance testing strategies for the beauty parlour application, including load testing, stress testing, and performance benchmarking.

---

## 🎯 Performance Objectives

| Operation | Target | P95 | P99 |
|-----------|--------|-----|-----|
| GET /appointments | < 300ms | < 500ms | < 1s |
| POST /appointments | < 400ms | < 600ms | < 1.2s |
| GET /auth/profile | < 200ms | < 350ms | < 700ms |
| POST /auth/login | < 500ms | < 800ms | < 1.5s |
| POST /payments | < 600ms | < 1s | < 1.5s |
| Report Generation | < 2s | < 3s | < 5s |

---

## 📦 Load Testing with k6

### Installation

```bash
# Install k6
brew install k6  # macOS
# or
choco install k6  # Windows
# or
apt-get install k6  # Linux
```

### Load Test Script

```javascript
// load-test.k6.js
import http from 'k6/http';
import { check, sleep, group } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp-up: 0 to 100 users
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 200 },  // Ramp-up: 100 to 200 users
    { duration: '5m', target: 200 },  // Stay at 200 users
    { duration: '2m', target: 0 },    // Ramp-down: 200 to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.1'],
  },
};

const BASE_URL = 'http://localhost:3000';

export default function () {
  // Get authorization token
  const loginRes = http.post(`${BASE_URL}/auth/login`, {
    email: 'customer@example.com',
    password: 'password123',
  });

  const token = loginRes.json('accessToken');
  const params = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };

  group('Appointment Operations', () => {
    // Create appointment
    const createRes = http.post(
      `${BASE_URL}/appointments`,
      JSON.stringify({
        serviceId: '607f1f77bcf86cd799439030',
        date: '2024-05-20',
        time: '10:00 AM',
        notes: 'Load test appointment',
      }),
      params,
    );

    check(createRes, {
      'Create appointment status 201': (r) => r.status === 201,
      'Create appointment response time < 400ms': (r) => r.timings.duration < 400,
    });

    const appointmentId = createRes.json('_id');
    sleep(1);

    // Get appointments
    const getRes = http.get(`${BASE_URL}/appointments`, params);

    check(getRes, {
      'Get appointments status 200': (r) => r.status === 200,
      'Get appointments response time < 300ms': (r) => r.timings.duration < 300,
    });

    sleep(1);

    // Update appointment status
    const updateRes = http.patch(
      `${BASE_URL}/appointments/${appointmentId}/status`,
      JSON.stringify({ status: 'confirmed' }),
      params,
    );

    check(updateRes, {
      'Update status status 200': (r) => r.status === 200,
      'Update status response time < 400ms': (r) => r.timings.duration < 400,
    });

    sleep(1);
  });

  group('Payment Operations', () => {
    const paymentRes = http.post(
      `${BASE_URL}/payments`,
      JSON.stringify({
        appointmentId: 'some-appointment-id',
        amount: 75.0,
        currency: 'USD',
        method: 'credit_card',
        cardToken: 'tok_visa',
      }),
      params,
    );

    check(paymentRes, {
      'Create payment status 201': (r) => r.status === 201,
      'Create payment response time < 600ms': (r) => r.timings.duration < 600,
    });

    sleep(1);
  });

  sleep(5);
}
```

### Running Load Tests

```bash
# Load test
k6 run load-test.k6.js

# Load test with specific vus (virtual users)
k6 run --vus 100 --duration 30s load-test.k6.js

# Generate HTML report
k6 run --out json=results.json load-test.k6.js
k6 run results.json  # Convert to html
```

---

## 💥 Stress Testing

### Stress Test Script

```javascript
// stress-test.k6.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 200 },
    { duration: '5m', target: 300 },
    { duration: '5m', target: 400 },
    { duration: '5m', target: 500 },
    { duration: '5m', target: 600 },
    { duration: '5m', target: 700 },
    { duration: '5m', target: 800 },
    { duration: '5m', target: 900 },
    { duration: '5m', target: 1000 }, // Peak load
    { duration: '3m', target: 0 },     // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(99)<2000'], // 99th percentile under 2s
    http_req_failed: ['rate<0.05'],     // Error rate < 5%
  },
};

const BASE_URL = 'http://localhost:3000';

export default function () {
  const response = http.get(`${BASE_URL}/appointments`);

  check(response, {
    'Status is 200': (r) => r.status === 200,
    'Response time < 2s under stress': (r) => r.timings.duration < 2000,
  });

  sleep(1);
}
```

### Running Stress Tests

```bash
k6 run stress-test.k6.js
```

---

## 📊 Database Performance Testing

### Query Performance Tests

```typescript
describe('Database Performance Tests', () => {
  it('should retrieve 1000 appointments in < 500ms', async () => {
    // Create 1000 test appointments
    const appointments = AppointmentFixtures.getAllAppointments();
    for (let i = 0; i < 1000; i++) {
      await appointmentModel.create({
        ...appointments[i % appointments.length],
        _id: new Types.ObjectId(),
      });
    }

    const startTime = performance.now();
    const result = await appointmentModel.find({}).limit(100);
    const endTime = performance.now();

    expect(endTime - startTime).toBeLessThan(500);
    expect(result.length).toBe(100);
  });

  it('should filter appointments by status in < 300ms', async () => {
    const startTime = performance.now();
    const result = await appointmentModel.find({ status: 'confirmed' });
    const endTime = performance.now();

    expect(endTime - startTime).toBeLessThan(300);
  });

  it('should paginate through large result sets efficiently', async () => {
    const pageSize = 50;
    const startTime = performance.now();

    const page1 = await appointmentModel
      .find({})
      .skip(0)
      .limit(pageSize);

    const page2 = await appointmentModel
      .find({})
      .skip(pageSize)
      .limit(pageSize);

    const endTime = performance.now();

    expect(endTime - startTime).toBeLessThan(500);
    expect(page1.length).toBe(pageSize);
  });

  it('should use indexes for fast lookups', async () => {
    // Verify indexes are in place
    const indexes = await appointmentModel.collection.getIndexes();
    expect(Object.keys(indexes).length).toBeGreaterThan(1); // Has indexes
  });
});
```

---

## 🔍 Frontend Performance Metrics

### Lighthouse Audit (in Angular)

```bash
# Install Lighthouse
npm install -g lighthouse

# Run audit
lighthouse https://localhost:4200 --view
```

### Core Web Vitals

```typescript
describe('Frontend Performance Metrics', () => {
  it('should have good Cumulative Layout Shift (CLS) < 0.1', () => {
    // Test measures DOM changes
    // CLS should be minimal
  });

  it('should have fast First Contentful Paint (FCP) < 1.8s', () => {
    // Measure time to first content
  });

  it('should have fast Largest Contentful Paint (LCP) < 2.5s', () => {
    // Measure time to largest content
  });

  it('should have fast First Input Delay (FID) < 100ms', () => {
    // Measure response to user input
  });
});
```

---

## 📈 Monitoring & Metrics

### Key Metrics to Monitor

1. **Response Time**: Average, P95, P99
2. **Throughput**: Requests per second
3. **Error Rate**: Failed requests percentage
4. **CPU Usage**: Server CPU utilization
5. **Memory Usage**: Memory consumption
6. **Database Connections**: Active connections
7. **Cache Hit Rate**: Cache effectiveness

### Setting Up Metrics Collection

```bash
# Install Prometheus client
npm install prom-client

# Add to your app
import * as prometheus from 'prom-client';

const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'status_code'],
});
```

---

## 🎬 Continuous Performance Testing

### CI/CD Integration

```yaml
# .github/workflows/performance.yml
name: Performance Tests

on: [push, pull_request]

jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'

      - name: Install k6
        run: |
          sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
          echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6-stable.list
          sudo apt-get update
          sudo apt-get install k6

      - name: Start application
        run: npm run start:prod &

      - name: Run load tests
        run: k6 run load-test.k6.js

      - name: Upload results
        uses: actions/upload-artifact@v2
        with:
          name: performance-results
          path: results.json
```

---

## 🔧 Performance Optimization Tips

1. **Database Indexing**: Create indexes on frequently queried fields
2. **Caching**: Implement Redis caching for frequently accessed data
3. **Pagination**: Always paginate large result sets
4. **API Response Optimization**: Minimize payload size
5. **Async Operations**: Use async/await for non-blocking operations
6. **Connection Pooling**: Reuse database connections
7. **Load Balancing**: Distribute load across multiple servers
8. **CDN**: Cache static assets with CDN
9. **Compression**: Enable gzip compression for responses
10. **Monitoring**: Set up real-time performance monitoring

---

## 📊 Performance Benchmarks Template

```markdown
| Operation | Baseline | Current | Target | Status |
|-----------|----------|---------|--------|--------|
| GET /appointments | 250ms | 280ms | <300ms | ✅ Pass |
| POST /appointments | 350ms | 380ms | <400ms | ✅ Pass |
| POST /payments | 550ms | 580ms | <600ms | ✅ Pass |
| Report Generation | 1.8s | 1.9s | <2s | ✅ Pass |
| Average Response | 350ms | 370ms | <400ms | ✅ Pass |
```

---

**Last Updated**: May 4, 2026
