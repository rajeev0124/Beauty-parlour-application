# 📖 Testing Suite Navigation Guide

## 🗺️ Complete File Map

This guide helps you navigate the complete testing suite for the Beauty Parlour Application.

---

## 📁 Strategic Documents

These documents provide the overall testing strategy and approach.

### 1. **TESTING_STRATEGY.md** ⭐
   - **Location**: Root directory
   - **What It Contains**:
     - Testing pyramid and objectives
     - Recommended folder structure
     - Test execution flow
     - Coverage targets
     - Critical test paths
     - Implementation roadmap
   - **When to Read**: First - get the big picture
   - **Time to Read**: 15-20 minutes

### 2. **TESTING_BEST_PRACTICES.md** 📚
   - **Location**: Root directory
   - **What It Contains**:
     - Unit testing patterns
     - Integration testing patterns
     - E2E testing patterns
     - Frontend testing patterns
     - How to avoid flaky tests
     - Coverage goals
     - Debugging techniques
     - Test maintenance checklist
   - **When to Read**: Before implementing tests
   - **Time to Read**: 20-25 minutes

### 3. **SECURITY_TESTING.md** 🔐
   - **Location**: Root directory
   - **What It Contains**:
     - JWT security tests
     - RBAC testing
     - Password security
     - XSS prevention
     - NoSQL injection prevention
     - Rate limiting tests
     - CORS security
     - Sensitive data protection
     - OWASP Top 10 mapping
   - **When to Read**: When implementing security tests
   - **Time to Read**: 25-30 minutes

### 4. **PERFORMANCE_TESTING.md** ⚡
   - **Location**: Root directory
   - **What It Contains**:
     - Performance objectives and benchmarks
     - k6 load testing scripts
     - Stress testing guide
     - Database performance tests
     - Frontend metrics
     - CI/CD integration
     - Performance optimization tips
   - **When to Read**: When setting up performance tests
   - **Time to Read**: 20-25 minutes

### 5. **TESTING_DELIVERABLES.md** 📦
   - **Location**: Root directory
   - **What It Contains**:
     - Complete deliverables checklist
     - Test coverage summary
     - Quick start guide
     - Implementation order
     - What's included
   - **When to Read**: To see what you have
   - **Time to Read**: 10-15 minutes

---

## 🧪 Test Fixtures (Test Data)

These files provide consistent, reusable test data.

### Backend Fixtures Location: `backend/test/fixtures/`

| File | Purpose | Contains |
|------|---------|----------|
| **index.ts** | Main export file | Exports all fixtures |
| **users.fixture.ts** | User test data | Customer, admin, staff, superadmin, blocked users |
| **appointments.fixture.ts** | Appointment test data | Pending, confirmed, completed, cancelled appointments |
| **payments.fixture.ts** | Payment test data | Completed, pending, failed, refunded payments |
| **services.fixture.ts** | Beauty service data | Hair, facial, nail services and variants |
| **staff.fixture.ts** | Staff member data | Staff with specializations and availability |
| **products.fixture.ts** | Product inventory data | Products, low stock, expired products |

### How to Use:
```typescript
import { UserFixtures } from '../fixtures/users.fixture';

it('should register user', async () => {
  const result = await service.register(UserFixtures.VALID_REGISTER_DTO);
});
```

---

## 🛠️ Test Helpers

### Backend Helpers Location: `backend/test/helpers/`

| Helper Class | Methods | Use Case |
|--------------|---------|----------|
| **JwtTestHelper** | generateToken(), generateCustomerToken(), generateAdminToken(), generateExpiredToken(), verifyToken() | JWT token generation and verification |
| **DatabaseTestHelper** | createObjectId(), isValidObjectId(), createMockDocument() | MongoDB ObjectId operations |
| **RequestBuilder** | setMethod(), setUrl(), setBody(), setAuthorization(), addQuery(), build() | Building test HTTP requests |
| **ResponseAssertion** | assertSuccess(), assertError(), assertHasFields(), assertTokenInResponse() | Validating HTTP responses |
| **MockRepositoryHelper** | createMockModel(), createMockModelWithList() | Creating mock Mongoose models |

### How to Use:
```typescript
import { JwtTestHelper, RequestBuilder } from '../helpers/test.helper';

const request = new RequestBuilder()
  .setMethod('GET')
  .setUrl('/appointments')
  .setAuthorization(token)
  .build();
```

---

## 🧬 Unit Tests

### Backend Unit Tests

#### Auth Service: `backend/src/modules/auth/__tests__/auth.service.spec.ts`
- **Test Count**: 20+
- **Covers**:
  - User registration with validation
  - Login with password verification
  - Logout functionality
  - JWT token refresh
  - Password reset flow
  - Profile retrieval
- **Run**: `npm run test auth.service`

#### Appointments Service: `backend/src/modules/appointments/__tests__/appointments.service.spec.ts`
- **Test Count**: 25+
- **Covers**:
  - Create appointments
  - Retrieve appointments (all, by ID, by user, by staff)
  - Update appointments
  - Update appointment status with valid transitions
  - Delete appointments
  - Filter and query operations
- **Run**: `npm run test appointments.service`

### Frontend Unit Tests

#### Appointment Service: `beauty-parlour/src/app/core/services/__tests__/appointment.service.spec.ts`
- **Test Count**: 15+
- **Covers**:
  - HTTP GET requests
  - HTTP POST requests
  - HTTP PUT requests
  - Error handling
  - Observable subscriptions
- **Run**: `ng test`

#### Appointment Form Component: `beauty-parlour/src/app/features/appointments/components/appointment-form/__tests__/appointment-form.component.spec.ts`
- **Test Count**: 20+
- **Covers**:
  - Form validation
  - Required field validation
  - Date validation
  - Form submission
  - Error display
  - Form reset
- **Run**: `ng test`

---

## 🔗 Integration Tests

### Controller Tests: `backend/src/modules/appointments/__tests__/appointments.controller.spec.ts`
- **Test Count**: 15+
- **Covers**:
  - GET endpoints
  - POST endpoints
  - PUT endpoints
  - PATCH endpoints
  - DELETE endpoints
  - Query parameters
  - Path parameters
  - Error responses
- **Run**: `npm run test appointments.controller`

### Database Tests: `backend/test/database.spec.ts`
- **Test Count**: 30+
- **Covers**:
  - Schema validation
  - Required field validation
  - Unique constraints
  - Enum validation
  - Default values
  - Auto-generated fields (timestamps)
  - Field trimming
  - Index creation
- **Run**: `npm run test database`

---

## 🚀 E2E Tests

### Complete Journey: `backend/test/e2e/complete-journey.e2e-spec.ts`
- **Test Count**: 20+
- **Coverage**:
  - **Authentication Flow**: Register → Login → Profile → Logout
  - **Appointment Flow**: Create → Update → Cancel
  - **Payment Flow**: Create payment → Confirm → Get invoice
  - **Complete Journey**: Full user workflow
  - **Error Handling**: Missing auth, invalid tokens, non-existent resources
- **Run**: `npm run test:e2e`
- **Prerequisites**: Application must be running on port 3000

---

## ⚙️ Configuration Files

### Jest Configuration: `backend/jest.config.js`
- **Purpose**: Main Jest configuration for unit tests
- **Features**:
  - TypeScript support
  - Coverage thresholds
  - Module mapping
  - Test patterns
- **Usage**: `npm run test`

### Jest E2E Configuration: `backend/jest.config.e2e.js`
- **Purpose**: Jest configuration for E2E tests
- **Features**:
  - Extended timeouts (30s)
  - Force exit enabled
  - Separate from unit tests
- **Usage**: `npm run test:e2e`

### Jest Setup: `backend/test/jest.setup.ts`
- **Purpose**: Global test setup and utilities
- **Includes**:
  - Global test utilities (sleep, retry, waitFor)
  - Mock console
  - Error handlers
  - Environment setup
- **Loaded automatically** for all tests

---

## 📊 Test Organization by Module

### Authentication Module
```
backend/
├── src/modules/auth/
│   ├── __tests__/
│   │   ├── auth.service.spec.ts
│   │   └── auth.controller.spec.ts (template)
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
└── test/
    └── fixtures/users.fixture.ts
```

### Appointments Module
```
backend/
├── src/modules/appointments/
│   ├── __tests__/
│   │   ├── appointments.service.spec.ts
│   │   └── appointments.controller.spec.ts
│   ├── appointments.controller.ts
│   ├── appointments.service.ts
│   └── appointments.module.ts
└── test/
    ├── fixtures/appointments.fixture.ts
    └── e2e/complete-journey.e2e-spec.ts
```

### Database Tests
```
backend/
├── src/schemas/
│   ├── user.schema.ts
│   ├── appointment.schema.ts
│   └── payment.schema.ts
└── test/
    ├── database.spec.ts
    └── fixtures/ (all fixtures)
```

---

## 🎯 Quick Navigation by Task

### "I want to add tests for a new module"
1. Read: `TESTING_BEST_PRACTICES.md` → Unit Testing section
2. Create: `module/__tests__/module.service.spec.ts`
3. Use: Fixtures from `backend/test/fixtures/`
4. Reference: `auth.service.spec.ts` as template
5. Run: `npm run test module.service`

### "I want to test an API endpoint"
1. Read: `TESTING_BEST_PRACTICES.md` → Integration Testing section
2. Create: `module/__tests__/module.controller.spec.ts`
3. Use: `appointments.controller.spec.ts` as template
4. Reference: Request patterns from `test/helpers/`
5. Run: `npm run test module.controller`

### "I want to test a user workflow"
1. Read: `TESTING_STRATEGY.md` → Critical Test Paths section
2. Create: `test/e2e/workflow-name.e2e-spec.ts`
3. Reference: `complete-journey.e2e-spec.ts` as template
4. Use: Fixtures for test data
5. Run: `npm run test:e2e`

### "I want to ensure security compliance"
1. Read: `SECURITY_TESTING.md` → entire document
2. Implement: Tests from each section
3. Reference: Code examples in guide
4. Verify: OWASP mapping
5. Run: `npm run test -- --testNamePattern="Security|RBAC|Password"`

### "I want to test performance"
1. Read: `PERFORMANCE_TESTING.md` → Load Testing section
2. Create: `test/performance/load-test.k6.js`
3. Modify: URLs and payloads for your endpoints
4. Run: `k6 run test/performance/load-test.k6.js`
5. Analyze: Results and optimize

---

## 📋 Test Checklist by Phase

### Phase 1: Setup
- [ ] Read `TESTING_STRATEGY.md`
- [ ] Install dependencies: `npm install --save-dev jest @nestjs/testing supertest`
- [ ] Copy Jest configuration files
- [ ] Set up fixture directory structure

### Phase 2: Core Module Testing
- [ ] Run existing `auth.service.spec.ts` - `npm run test auth.service`
- [ ] Run existing `appointments.service.spec.ts` - `npm run test appointments.service`
- [ ] Implement tests for other services
- [ ] Achieve 80% coverage

### Phase 3: API Testing
- [ ] Run existing `appointments.controller.spec.ts`
- [ ] Implement tests for other controllers
- [ ] Validate request/response handling
- [ ] Test error scenarios

### Phase 4: Database Testing
- [ ] Run `database.spec.ts` - `npm run test database`
- [ ] Add schema tests for new entities
- [ ] Verify constraints
- [ ] Check indexes

### Phase 5: E2E Testing
- [ ] Run `complete-journey.e2e-spec.ts` - `npm run test:e2e`
- [ ] Add tests for other workflows
- [ ] Test error handling
- [ ] Validate complete user journeys

### Phase 6: Security & Performance
- [ ] Implement security tests from `SECURITY_TESTING.md`
- [ ] Run performance tests from `PERFORMANCE_TESTING.md`
- [ ] Generate coverage reports
- [ ] Analyze metrics

---

## 📚 Recommended Reading Order

For **New Team Members**:
1. `TESTING_STRATEGY.md` (15 min) - Understand approach
2. `TESTING_BEST_PRACTICES.md` (20 min) - Learn patterns
3. Review example test file (10 min) - See real code
4. `TESTING_DELIVERABLES.md` (10 min) - See what's available

For **QA Engineers**:
1. `TESTING_STRATEGY.md` - Complete strategy
2. `SECURITY_TESTING.md` - Security testing
3. `PERFORMANCE_TESTING.md` - Performance testing
4. All test files - For reference

For **Developers**:
1. `TESTING_BEST_PRACTICES.md` - Best practices
2. Example test file related to your module
3. `TESTING_STRATEGY.md` - For reference
4. This file - For navigation

For **DevOps**:
1. `TESTING_STRATEGY.md` - CI/CD section
2. `PERFORMANCE_TESTING.md` - Performance setup
3. Configuration files (jest.config.js)
4. GitHub Actions templates

---

## 🔍 Finding Tests by Topic

### Authentication Tests
- Location: `backend/src/modules/auth/__tests__/auth.service.spec.ts`
- Also see: `SECURITY_TESTING.md` → Authentication section

### Appointment Tests
- Services: `backend/src/modules/appointments/__tests__/appointments.service.spec.ts`
- Controllers: `backend/src/modules/appointments/__tests__/appointments.controller.spec.ts`
- E2E: `backend/test/e2e/complete-journey.e2e-spec.ts`

### Payment Tests
- Fixtures: `backend/test/fixtures/payments.fixture.ts`
- E2E: `backend/test/e2e/complete-journey.e2e-spec.ts`

### Frontend Tests
- Services: `beauty-parlour/src/app/core/services/__tests__/`
- Components: `beauty-parlour/src/app/features/*/components/__tests__/`

### Security Tests
- Guide: `SECURITY_TESTING.md` (entire file)
- Implementation: Code examples in guide

### Performance Tests
- Guide: `PERFORMANCE_TESTING.md` (entire file)
- Scripts: `backend/test/performance/` (k6 files)

### Database Tests
- Schema validation: `backend/test/database.spec.ts`
- Test data: `backend/test/fixtures/`

---

## 💡 Pro Tips

1. **Always use fixtures** for consistent test data
2. **Use helpers** to reduce boilerplate code
3. **Follow AAA pattern** (Arrange, Act, Assert)
4. **Test edge cases** not just happy paths
5. **Keep tests isolated** - no test dependencies
6. **Mock external services** - don't make real calls
7. **Run tests before commit** - catch issues early
8. **Review coverage reports** - identify gaps
9. **Document complex tests** - future-you will thank you
10. **Refactor tests** - same as production code

---

## 🆘 Troubleshooting

### "Tests are timing out"
- Increase timeout in jest.config.js
- Check for infinite loops
- Use proper async/await

### "Tests pass locally but fail in CI"
- Check environment variables
- Verify database setup
- Check port availability
- Review CI logs carefully

### "Mock not working"
- Verify mock is set before test runs
- Check jest.clearAllMocks() in afterEach
- Verify correct module is mocked
- Check import paths

### "Test coverage is low"
- Identify untested branches with coverage report
- Add tests for error cases
- Test edge cases
- Check coverage thresholds

---

**Last Updated**: May 4, 2026  
**Version**: 1.0.0  
**Total Files**: 20+ test/config files
