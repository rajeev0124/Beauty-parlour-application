# ✅ Testing Best Practices & Guidelines

## 1. Unit Testing Best Practices

### Naming Conventions

```typescript
// ✅ GOOD
describe('AppointmentService', () => {
  describe('createAppointment', () => {
    it('should create a new appointment with pending status', () => {
      // Test implementation
    });

    it('should throw error if serviceId is missing', () => {
      // Test implementation
    });
  });
});

// ❌ AVOID
describe('Appointments', () => {
  it('works', () => {
    // Vague test name
  });
});
```

### Arrange-Act-Assert (AAA) Pattern

```typescript
// ✅ GOOD - Clear structure
it('should update appointment status', async () => {
  // Arrange
  const appointmentId = '123';
  const updateDto = { status: 'confirmed' };
  jest.spyOn(appointmentModel, 'findByIdAndUpdate').mockResolvedValue(updatedAppointment);

  // Act
  const result = await service.updateStatus(appointmentId, updateDto);

  // Assert
  expect(result.status).toBe('confirmed');
  expect(appointmentModel.findByIdAndUpdate).toHaveBeenCalledWith(
    appointmentId,
    updateDto,
    { new: true },
  );
});

// ❌ AVOID - Mixed concerns
it('should work', async () => {
  const id = '123';
  service.updateStatus(id, { status: 'confirmed' });
  const result = appointmentModel.findById(id);
  if (result.status === 'confirmed') {
    console.log('passed');
  }
});
```

### Mocking Best Practices

```typescript
// ✅ GOOD - Clear mocks with proper setup
beforeEach(() => {
  const mockUserModel = {
    findById: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };

  const module: TestingModule = await Test.createTestingModule({
    providers: [
      Service,
      { provide: getModelToken(User.name), useValue: mockUserModel },
    ],
  }).compile();
});

// ❌ AVOID - Complex mock chains
beforeEach(() => {
  userModel.findById = jest.fn()
    .mockResolvedValueOnce(user1)
    .mockResolvedValueOnce(user2)
    .mockRejectedValueOnce(new Error('fail'));
});
```

### Test Data Management

```typescript
// ✅ GOOD - Use fixtures for consistent test data
import { UserFixtures } from '../fixtures/users.fixture';

it('should register a new user', async () => {
  const result = await service.register(UserFixtures.VALID_REGISTER_DTO);
  expect(result.user.email).toBe(UserFixtures.VALID_REGISTER_DTO.email);
});

// ❌ AVOID - Hardcoded test data scattered throughout
it('should register a new user', async () => {
  const result = await service.register({
    name: 'Test User',
    email: 'test@example.com',
    phone: '9876543210',
    password: 'SecurePassword123!',
  });
});
```

---

## 2. Integration Testing Best Practices

### Isolated Test Modules

```typescript
// ✅ GOOD - Each module is independent
describe('AppointmentsController', () => {
  let app: INestApplication;
  let service: AppointmentsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [AppointmentsController],
      providers: [AppointmentsService],
    }).compile();

    app = module.createNestApplication();
  });

  afterEach(async () => {
    await app.close();
  });
});
```

### Database Cleanup

```typescript
// ✅ GOOD - Clean up after each test
afterEach(async () => {
  await appointmentModel.deleteMany({});
  await userModel.deleteMany({});
});

// ✅ GOOD - Use transactions for cleanup
it('should create appointment', async () => {
  // Use within transaction that rolls back
});
```

---

## 3. E2E Testing Best Practices

### Realistic User Flows

```typescript
// ✅ GOOD - Complete user journey
it('should complete full user journey: register -> book appointment -> pay', async () => {
  // Register
  const registerRes = await request(app.getHttpServer())
    .post('/auth/register')
    .send(registerDto);

  const token = registerRes.body.accessToken;

  // Book appointment
  const appointmentRes = await request(app.getHttpServer())
    .post('/appointments')
    .set('Authorization', `Bearer ${token}`)
    .send(appointmentDto);

  // Pay
  const paymentRes = await request(app.getHttpServer())
    .post('/payments')
    .set('Authorization', `Bearer ${token}`)
    .send(paymentDto);

  expect(paymentRes.status).toBe(201);
});

// ❌ AVOID - Fragmented tests that don't represent real usage
it('registers user', () => { /* ... */ });
it('books appointment', () => { /* ... */ });
it('processes payment', () => { /* ... */ });
```

### Proper Error Handling

```typescript
// ✅ GOOD - Test error scenarios
it('should handle authentication failure gracefully', async () => {
  const response = await request(app.getHttpServer())
    .get('/appointments')
    .expect(401);

  expect(response.body.message).toContain('Unauthorized');
});

// ❌ AVOID - Ignoring error cases
it('should get appointments', async () => {
  const response = await request(app.getHttpServer())
    .get('/appointments')
    .expect(200); // Only tests success case
});
```

---

## 4. Frontend Testing Best Practices

### Component Testing with Shallow Rendering

```typescript
// ✅ GOOD - Test component in isolation
it('should display appointment form', () => {
  fixture.detectChanges();
  const form = fixture.debugElement.query(By.css('form'));
  expect(form).toBeTruthy();
});

// ❌ AVOID - Testing entire component tree
describe('AppointmentModule', () => {
  // Testing everything at once
});
```

### Testing Observable Subscriptions

```typescript
// ✅ GOOD - Properly handle observables
it('should handle appointment updates', (done) => {
  appointmentService.getAppointment(id).subscribe((appointment) => {
    expect(appointment.status).toBe('confirmed');
    done();
  });

  // Trigger the observable
});

// ❌ AVOID - Not waiting for async operations
it('should load appointments', () => {
  component.loadAppointments();
  expect(component.appointments).toBeDefined(); // May not be loaded yet
});
```

---

## 5. Avoiding Flaky Tests

### Problems and Solutions

```typescript
// ❌ FLAKY - Depends on timing
it('should eventually receive data', (done) => {
  setTimeout(() => {
    expect(component.data).toBeDefined();
    done();
  }, 100); // Arbitrary timeout
});

// ✅ FIXED - Use proper async handling
it('should receive data', fakeAsync(() => {
  service.getData().subscribe((data) => {
    expect(data).toBeDefined();
  });
  tick();
}));

// ❌ FLAKY - Depends on test execution order
let sharedAppointment;

it('test 1', async () => {
  sharedAppointment = await createAppointment();
});

it('test 2', async () => {
  // Depends on test 1 executing first
  const result = await updateAppointment(sharedAppointment);
});

// ✅ FIXED - Independent tests
it('test 1', async () => {
  const appointment = await createAppointment();
  const result = await updateAppointment(appointment);
  expect(result).toBeDefined();
});

it('test 2', async () => {
  const appointment = await createAppointment();
  const result = await updateAppointment(appointment);
  expect(result).toBeDefined();
});
```

---

## 6. Coverage Goals

### Coverage Thresholds

```json
{
  "coverageThreshold": {
    "global": {
      "branches": 75,
      "functions": 80,
      "lines": 80,
      "statements": 80
    },
    "each": {
      "branches": 70,
      "functions": 75,
      "lines": 75,
      "statements": 75
    }
  }
}
```

### What to Test

```typescript
// ✅ Always test
- Critical business logic
- Error handling paths
- Edge cases
- Security-sensitive operations
- Public APIs

// ⚠️ Lower priority
- Getters/setters
- Utility functions
- UI interactions (basic)
- Third-party library calls

// ❌ Don't test
- Framework code
- External APIs directly (mock them)
- Private methods (test through public API)
- Auto-generated code
```

---

## 7. Debugging Failed Tests

### Useful Debugging Techniques

```typescript
// Log intermediate values
it('should process payment', async () => {
  const payment = await service.createPayment(dto);
  console.log('Payment created:', JSON.stringify(payment, null, 2));
  
  const confirmed = await service.confirmPayment(payment._id);
  console.log('Payment confirmed:', JSON.stringify(confirmed, null, 2));
  
  expect(confirmed.status).toBe('completed');
});

// Use focused tests
fdescribe('Payment Service', () => { // Only runs this suite
  fit('should process payment', () => { // Only runs this test
    // ...
  });
});

// Skip problematic tests temporarily
xit('should handle rare edge case', () => {
  // Fix this later
});

// Increase timeout for debugging
it('should process large dataset', async () => {
  // ...
}, 30000); // 30 second timeout
```

---

## 8. Test Performance Optimization

```typescript
// ❌ SLOW - Creating new module for each test
describe('Service', () => {
  let service: Service;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [Service, ...allDependencies],
    }).compile();
    service = module.get(Service);
  });
});

// ✅ FAST - Create module once per describe block
describe('Service', () => {
  let service: Service;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [Service, ...allDependencies],
    }).compile();
    service = module.get(Service);
  });
});

// ✅ FAST - Use connection pooling
beforeAll(async () => {
  const module = await Test.createTestingModule({
    imports: [
      MongooseModule.forRoot(mongoUri, {
        maxPoolSize: 10,
        minPoolSize: 5,
      }),
    ],
  }).compile();
});
```

---

## 9. Test Documentation

### Clear Test Descriptions

```typescript
// ✅ GOOD - Self-documenting test names
it('should reject login when email does not exist in database', () => {});
it('should throw UnauthorizedException with message "Invalid credentials" when password is incorrect', () => {});
it('should update appointment status and trigger notification email', () => {});

// ❌ POOR - Vague descriptions
it('should work', () => {});
it('test login', () => {});
it('checks status', () => {});
```

---

## 10. Continuous Integration Tips

```bash
# Run tests before commit
npm run lint && npm run test

# Run all tests with coverage
npm run test:cov

# Run specific test suites
npm run test -- auth
npm run test -- appointments

# Run in CI environment
CI=true npm run test -- --coverage --watchAll=false

# Generate coverage badge
npm install -g coverage-badge
coverage-badge -o coverage.svg
```

---

## Test Maintenance Checklist

- [ ] All tests have descriptive names
- [ ] No hardcoded test data (use fixtures)
- [ ] Proper test isolation (no test dependencies)
- [ ] Adequate error handling tests
- [ ] Happy path and sad path tests exist
- [ ] Mock external dependencies
- [ ] Clean up resources in afterEach
- [ ] No skipped tests (`xit`, `xdescribe`)
- [ ] Coverage thresholds met
- [ ] CI/CD tests passing

---

**Last Updated**: May 4, 2026
