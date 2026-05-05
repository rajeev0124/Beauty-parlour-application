# Chapter 9: Project Structure

## 9.1 Overall Project Structure

```
Beauty-Parlour-Application/
│
├── backend/                       ← NestJS Backend Application
│   ├── src/
│   │   ├── main.ts                → Application entry point
│   │   ├── app.module.ts          → Root module
│   │   └── modules/
│   │       ├── auth/              → Authentication module
│   │       ├── users/             → User management module
│   │       ├── services/          → Salon services module
│   │       ├── appointments/      → Appointment booking module
│   │       ├── products/          → Product catalog module
│   │       ├── orders/            → Order management module
│   │       └── payments/          → Payment processing module
│   ├── .env                       → Environment variables
│   ├── package.json               → Dependencies and scripts
│   └── tsconfig.json              → TypeScript configuration
│
├── frontend/                      ← Angular Frontend Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/              → Singleton services, guards, interceptors
│   │   │   ├── shared/            → Reusable UI components
│   │   │   └── features/          → Feature modules (pages)
│   │   ├── assets/                → Static assets (images, fonts)
│   │   ├── environments/          → Environment configuration
│   │   ├── styles.css             → Global styles
│   │   └── index.html             → SPA entry HTML
│   ├── angular.json               → Angular CLI configuration
│   ├── package.json               → Dependencies and scripts
│   └── tsconfig.json              → TypeScript configuration
│
└── reports/                       ← Project Documentation
    ├── 01-overview.md             → Project overview and objectives
    ├── 02-system-architecture.md  → System architecture design
    ├── 03-database-design.md      → Database schema and relationships
    ├── 04-backend-architecture.md → Backend module structure
    ├── 05-frontend-architecture.md→ Frontend component architecture
    ├── 06-authentication.md       → Auth and authorization system
    ├── 07-api-specification.md    → API endpoint documentation
    ├── 08-deployment.md           → Deployment architecture
    ├── 09-project-structure.md    → This file
    ├── 10-security-analysis.md    → Security analysis
    ├── 11-scalability-analysis.md → Scalability analysis
    ├── 12-risk-analysis.md        → Risk assessment
    └── 13-executive-summary.md    → Executive summary
```

---

## 9.2 Frontend Structure (Detailed)

```
src/app/
│
├── core/                          ← Singleton Services & Infrastructure
│   ├── services/
│   │   ├── auth.service.ts        → Login, register, logout, token management
│   │   ├── user.service.ts        → User profile CRUD
│   │   ├── product.service.ts     → Product listing and ordering
│   │   ├── appointment.service.ts → Appointment CRUD
│   │   └── admin.service.ts       → Admin operations
│   ├── guards/
│   │   ├── auth.guard.ts          → Prevents unauthenticated access
│   │   └── role.guard.ts          → Prevents unauthorized role access
│   └── interceptors/
│       └── auth.interceptor.ts    → Attaches JWT to outgoing requests
│
├── shared/                        ← Reusable UI Components
│   ├── navbar/                    → Navigation bar
│   ├── footer/                    → Footer
│   └── loader/                    → Loading spinner
│
└── features/                      ← Feature Modules (Pages)
    ├── auth/
    │   ├── login/                 → Login page
    │   └── register/              → Registration page
    ├── services/
    │   ├── service-list/          → Service listing
    │   └── service-detail/        → Service details
    ├── products/
    │   ├── product-list/          → Product listing
    │   ├── product-detail/        → Product details
    │   ├── cart/                   → Shopping cart
    │   └── checkout/              → Checkout page
    ├── appointments/
    │   └── book-appointment/      → Booking form
    └── admin/
        └── dashboard/             → Admin management panel
```

---

## 9.3 Backend Structure (Detailed)

```
src/
├── main.ts                        → Bootstraps NestJS application
├── app.module.ts                  → Root module (imports all feature modules)
│
└── modules/
    ├── auth/
    │   ├── auth.module.ts         → Module definition
    │   ├── auth.controller.ts     → /auth/register, /auth/login
    │   ├── auth.service.ts        → Registration, login, JWT logic
    │   ├── strategies/
    │   │   └── jwt.strategy.ts    → JWT validation strategy
    │   └── guards/
    │       ├── jwt-auth.guard.ts  → Authentication guard
    │       └── roles.guard.ts     → Role-based authorization guard
    │
    ├── users/
    │   ├── users.module.ts
    │   ├── users.controller.ts    → /users CRUD endpoints
    │   ├── users.service.ts       → User business logic
    │   └── schemas/
    │       └── user.schema.ts     → Mongoose user schema
    │
    ├── services/
    │   ├── services.module.ts
    │   ├── services.controller.ts → /services CRUD endpoints
    │   ├── services.service.ts    → Service business logic
    │   └── schemas/
    │       └── service.schema.ts  → Mongoose service schema
    │
    ├── appointments/
    │   ├── appointments.module.ts
    │   ├── appointments.controller.ts → /appointments endpoints
    │   ├── appointments.service.ts    → Appointment business logic
    │   └── schemas/
    │       └── appointment.schema.ts  → Mongoose appointment schema
    │
    ├── products/
    │   ├── products.module.ts
    │   ├── products.controller.ts → /products CRUD endpoints
    │   ├── products.service.ts    → Product business logic
    │   └── schemas/
    │       └── product.schema.ts  → Mongoose product schema
    │
    ├── orders/
    │   ├── orders.module.ts
    │   ├── orders.controller.ts   → /orders endpoints
    │   ├── orders.service.ts      → Order business logic
    │   └── schemas/
    │       └── order.schema.ts    → Mongoose order schema
    │
    └── payments/
        ├── payments.module.ts
        ├── payments.controller.ts → /payments endpoints
        ├── payments.service.ts    → Payment business logic
        └── schemas/
            └── payment.schema.ts  → Mongoose payment schema
```

---

## 9.4 Structure Benefits

| Benefit | Description |
|---|---|
| **Maintainable** | Clear separation of concerns — each module handles one domain |
| **Scalable** | New features can be added as new modules without touching existing code |
| **Modular** | Each module is self-contained with its own controller, service, and schema |
| **Enterprise-Ready** | Follows NestJS best practices used in production enterprise applications |
| **Testable** | Each module can be unit-tested independently |
| **Microservice-Ready** | Individual modules can be extracted into microservices if needed |