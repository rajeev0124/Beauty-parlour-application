# Chapter 4: Backend Architecture

## 4.1 Backend Framework: NestJS

NestJS is a progressive Node.js framework for building efficient, reliable, and scalable server-side applications. It uses TypeScript by default and is built on top of Express.js.

---

## 4.2 NestJS Modular Architecture

NestJS is built on **four core building blocks**. Every feature in the backend is organized using these blocks:

```
┌─────────────────────────────────────────────────────┐
│                    MODULE                            │
│  (Organizes related controllers, services, schemas)  │
│                                                     │
│  ┌───────────────┐    ┌───────────────┐             │
│  │  CONTROLLER   │    │   SERVICE     │             │
│  │               │    │               │             │
│  │ • Receives    │───▶│ • Contains    │             │
│  │   HTTP requests│    │   business    │             │
│  │ • Defines     │    │   logic       │             │
│  │   routes      │    │ • Talks to    │             │
│  │ • Returns     │◀───│   database    │             │
│  │   responses   │    │ • Returns     │             │
│  └───────────────┘    │   data        │             │
│                       └───────┬───────┘             │
│                               │                     │
│                       ┌───────▼───────┐             │
│                       │    SCHEMA     │             │
│                       │               │             │
│                       │ • Defines     │             │
│                       │   MongoDB     │             │
│                       │   document    │             │
│                       │   structure   │             │
│                       └───────────────┘             │
│                                                     │
│  ┌───────────────┐                                  │
│  │    GUARD      │                                  │
│  │               │                                  │
│  │ • Runs BEFORE │                                  │
│  │   the handler │                                  │
│  │ • Checks auth │                                  │
│  │   and roles   │                                  │
│  └───────────────┘                                  │
└─────────────────────────────────────────────────────┘
```

---

## 4.3 Module Breakdown

| Module | Controller | Service | Schema | Responsibility |
|---|---|---|---|---|
| **AuthModule** | `AuthController` | `AuthService` | `UserSchema` | Registration, login, JWT generation, password hashing |
| **UsersModule** | `UsersController` | `UsersService` | `UserSchema` | User profile CRUD, role management |
| **ServicesModule** | `ServicesController` | `ServicesService` | `ServiceSchema` | Salon service CRUD (add, edit, delete, list services) |
| **AppointmentsModule** | `AppointmentsController` | `AppointmentsService` | `AppointmentSchema` | Appointment booking, approval/rejection, listing |
| **ProductsModule** | `ProductsController` | `ProductsService` | `ProductSchema` | Product catalog CRUD |
| **OrdersModule** | `OrdersController` | `OrdersService` | `OrderSchema` | Order placement, tracking |
| **PaymentsModule** | `PaymentsController` | `PaymentsService` | `PaymentSchema` | Payment recording, status management |

---

## 4.4 Backend Module Structure

```
src/
├── main.ts                    → Application entry point
├── app.module.ts              → Root module that imports all feature modules
├── modules/
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts
│   │   └── guards/
│   │       ├── jwt-auth.guard.ts
│   │       └── roles.guard.ts
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── schemas/
│   │       └── user.schema.ts
│   ├── services/
│   │   ├── services.module.ts
│   │   ├── services.controller.ts
│   │   ├── services.service.ts
│   │   └── schemas/
│   │       └── service.schema.ts
│   ├── appointments/
│   │   ├── appointments.module.ts
│   │   ├── appointments.controller.ts
│   │   ├── appointments.service.ts
│   │   └── schemas/
│   │       └── appointment.schema.ts
│   ├── products/
│   │   ├── products.module.ts
│   │   ├── products.controller.ts
│   │   ├── products.service.ts
│   │   └── schemas/
│   │       └── product.schema.ts
│   ├── orders/
│   │   ├── orders.module.ts
│   │   ├── orders.controller.ts
│   │   ├── orders.service.ts
│   │   └── schemas/
│   │       └── order.schema.ts
│   └── payments/
│       ├── payments.module.ts
│       ├── payments.controller.ts
│       ├── payments.service.ts
│       └── schemas/
│           └── payment.schema.ts
```

---

## 4.5 Request Lifecycle — Step by Step

When a customer sends a request (e.g., `POST /appointments`), here is the **exact sequence** of what happens inside NestJS:

```
Step 1: INCOMING HTTP REQUEST
        POST /appointments { serviceId: "abc", date: "2026-03-01", time: "10:00" }
        Authorization: Bearer eyJhbGciOiJI...
                    ↓
Step 2: MIDDLEWARE (if any)
        • Logging middleware records the request
        • CORS middleware validates origin
                    ↓
Step 3: GUARD (AuthGuard)
        • Extracts JWT from Authorization header
        • Verifies token signature and expiration
        • Decodes user ID and role from token payload
        • If INVALID → returns 401 Unauthorized immediately
        • If VALID → attaches user info to request object
                    ↓
Step 4: INTERCEPTOR (if any)
        • Can transform the request before it reaches the controller
        • Can log timing, add headers, etc.
                    ↓
Step 5: CONTROLLER (AppointmentsController)
        • Route handler method is executed
        • Extracts body data and user info from request
        • Calls the service method
                    ↓
Step 6: SERVICE (AppointmentsService)
        • Applies business logic validation
        • Calls Mongoose model to save data to MongoDB
        • Returns the result
                    ↓
Step 7: RESPONSE
        • Controller returns the data
        • Interceptor can transform the response (if any)
        • NestJS serializes the data to JSON
        • HTTP response is sent back to Angular
```

---

## 4.6 Key NestJS Features Used

| Feature | What It Does | Why It Matters |
|---|---|---|
| **Dependency Injection** | Services are automatically created and injected into controllers. You don't manually create instances. | Makes testing easier, reduces coupling between components |
| **Decorators** | `@Controller()`, `@Get()`, `@Post()`, `@UseGuards()`, `@Body()` — these annotations define routes and behavior declaratively | Cleaner code, less boilerplate |
| **Guards** | Run before the route handler to decide if the request should proceed | Centralized authentication/authorization logic |
| **Interceptors** | Can transform request/response and add cross-cutting concerns | Logging, response transformation, caching |
| **Middleware** | Runs before guards for low-level request processing | CORS, request logging, body parsing |

---

## 4.7 Security Features

| Feature | Implementation | Description |
|---|---|---|
| **JWT Authentication** | `@nestjs/jwt` + `@nestjs/passport` | Stateless token-based authentication — no server-side sessions needed |
| **Password Hashing** | `bcrypt` | Passwords are hashed with salt rounds before storing in database |
| **Role-Based Authorization** | Custom `RolesGuard` | Restricts API endpoints based on user role (customer, admin, superadmin) |
| **Route Protection** | `@UseGuards(JwtAuthGuard)` decorator | Protects endpoints from unauthenticated access |