# 🔬 ANTI-GRAVITY ANALYSIS — Beauty Parlour Management System

### Prepared by: Senior Software Architect
### Analysis Date: 24 February 2026
### Analysis Type: Top-Down (High-Level → Low-Level) — No Code Written

---

> **What is Anti-Gravity Analysis?**
> It means we analyze the entire system from the *highest altitude* (business goals, architecture vision) and progressively descend to the *lowest altitude* (field-level database design, individual API payloads, security edge cases) — all **without writing a single line of code**. The goal is to achieve 100% conceptual clarity before any implementation begins.

---

## Table of Contents

1. [Business Analysis](#1-business-analysis)
2. [System Architecture Analysis](#2-system-architecture-analysis)
3. [Frontend Architecture Analysis](#3-frontend-architecture-analysis)
4. [Backend Architecture Analysis](#4-backend-architecture-analysis)
5. [Database Analysis](#5-database-analysis)
6. [API Architecture Analysis](#6-api-architecture-analysis)
7. [Security Analysis](#7-security-analysis)
8. [Deployment Architecture Analysis](#8-deployment-architecture-analysis)
9. [Scalability Analysis](#9-scalability-analysis)
10. [Risk Analysis](#10-risk-analysis)

---

---

## 1. Business Analysis

### 1.1 Business Goals

The Beauty Parlour Management System exists to solve a real-world problem: **most beauty salons still operate on phone calls, paper registers, and walk-in chaos.** This system digitizes the entire operation.

| # | Business Goal | What It Means in Simple English |
|---|---|---|
| 1 | **Increase Customer Engagement** | Customers can browse services, book appointments, and buy products from their phone or laptop — 24/7. No phone calls needed. |
| 2 | **Improve Operational Efficiency** | The admin no longer flips through paper registers. Everything — appointments, payments, staff — is on one dashboard. |
| 3 | **Reduce Manual Work** | Automatic appointment scheduling, automatic order tracking, and automatic payment recording eliminate human error and repetitive work. |
| 4 | **Increase Revenue Through Online Booking** | When booking is available 24/7 online, the salon captures customers who would have otherwise gone to a competitor because they couldn't reach the receptionist. |

### 1.2 User Roles — Who Uses This System?

The system identifies **four distinct user roles**, each with a different level of access and responsibility:

| Role | Who They Are | What They Can Do |
|---|---|---|
| **Customer** | A person who visits or wants to visit the salon | Browse services, view products, book appointments, place product orders, make payments, view their booking history |
| **Admin** | The salon manager or front-desk operator | Manage services (add/edit/delete), manage appointments (approve/reject/reschedule), manage products, view all orders, view all customer records |
| **Super Admin** | The business owner or IT administrator | Everything the Admin can do, PLUS manage admins, view business analytics, configure system settings, manage user accounts globally |
| **Staff** | The beauticians, stylists, and therapists | View their assigned appointments, update appointment status (completed/in-progress), view service details |

### 1.3 Core Business Workflows

Here are the **critical business workflows** — the journeys that users will take through the system:

#### Workflow 1: Customer Registration & Login
```
Customer visits website → Clicks "Register" → Fills name, email, password
→ System creates account in database → Customer logs in
→ System generates JWT token → Customer accesses dashboard
```

#### Workflow 2: Appointment Booking (Core Revenue Workflow)
```
Customer browses services → Selects a service (e.g., "Bridal Makeup - ₹5000")
→ Selects date and time → Submits appointment request
→ System saves appointment with status "pending"
→ Admin sees new appointment on dashboard → Approves or rejects it
→ Customer is notified of status change
```

#### Workflow 3: Product Purchase
```
Customer browses products → Adds items to cart → Proceeds to checkout
→ System creates an order → Payment is processed
→ Order status is updated → Admin fulfills the order
```

#### Workflow 4: Admin Service Management
```
Admin logs in → Navigates to "Manage Services"
→ Adds new service (name, description, price, duration, category)
→ Service becomes visible on customer-facing website
→ Admin can edit price, update description, or delete the service
```

#### Workflow 5: Payment Processing
```
Customer completes booking or order → System generates payment record
→ Payment is recorded with userId, amount, and status
→ Admin can view all payment records on dashboard
```

### 1.4 How This System Generates Business Value

```
┌─────────────────────────────────────────────────────┐
│              BUSINESS VALUE CHAIN                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Online Presence → More Visibility → More Customers │
│         ↓                                           │
│  24/7 Booking → No Lost Customers → More Revenue    │
│         ↓                                           │
│  Digital Records → Less Manual Error → Lower Costs  │
│         ↓                                           │
│  Product Sales → Additional Revenue Stream          │
│         ↓                                           │
│  Customer Data → Marketing Insights → Repeat Visits │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

---

## 2. System Architecture Analysis

### 2.1 Architecture Type

The documentation describes an **Enterprise Microservice-Ready Modular Monolithic Architecture**.

Let me break this down in simple English:

| Term | Meaning |
|---|---|
| **Monolithic** | The entire backend runs as a single deployable application (one `main.ts` entry point). It is NOT split into multiple independently deployed microservices. |
| **Modular** | Even though it is monolithic, the code is organized into *independent modules* (auth, users, services, appointments, products). Each module has its own controller, service, and schema. This means it is *easy to maintain and easy to split into microservices later*. |
| **Microservice-Ready** | Because of the modular design, if the salon business grows and needs to handle thousands of users, individual modules (like appointments or payments) can be extracted into independent microservices without rewriting the entire application. |
| **Enterprise-Level** | The architecture uses patterns (dependency injection, guards, interceptors) commonly found in large corporate applications, not simple tutorial-level code. |

### 2.2 The Three-Layer Architecture

```
┌──────────────────────────────────────────────────────┐
│                 PRESENTATION LAYER                    │
│                   (Angular 17)                        │
│                                                      │
│  • What the user sees and interacts with              │
│  • Components, pages, forms, buttons                  │
│  • Runs in the user's browser                         │
│  • Sends HTTP requests to the backend                 │
│  • Uses Angular Material for UI components            │
│  • Uses Tailwind CSS for responsive design            │
└──────────────────────┬───────────────────────────────┘
                       │ HTTP/HTTPS (REST API Calls)
                       ▼
┌──────────────────────────────────────────────────────┐
│                APPLICATION LAYER                      │
│                    (NestJS)                            │
│                                                      │
│  • The brain of the system                            │
│  • Receives HTTP requests from Angular                │
│  • Validates data, applies business logic             │
│  • Authenticates users (JWT), authorizes actions      │
│  • Communicates with the database                     │
│  • Returns JSON responses to Angular                  │
└──────────────────────┬───────────────────────────────┘
                       │ Mongoose ODM (MongoDB Driver)
                       ▼
┌──────────────────────────────────────────────────────┐
│                   DATA LAYER                          │
│                (MongoDB Atlas)                        │
│                                                      │
│  • Stores all persistent data                         │
│  • User accounts, services, appointments, products    │
│  • NoSQL document database (JSON-like documents)      │
│  • Hosted in the cloud (MongoDB Atlas)                │
│  • Horizontally scalable                              │
└──────────────────────────────────────────────────────┘
```

### 2.3 End-to-End Data Flow

Here is exactly how data moves through the system when a customer books an appointment:

```
Step 1: Customer clicks "Book Appointment" button in the browser
           ↓
Step 2: Angular component captures form data (service, date, time)
           ↓
Step 3: Angular service (appointment.service.ts) sends HTTP POST
        request to NestJS backend via HttpClient
           ↓
Step 4: NestJS receives the request at the AppointmentsController
           ↓
Step 5: The JWT AuthGuard intercepts and validates the token
        (Is this user logged in? Is the token valid? Is it expired?)
           ↓
Step 6: If authorized, the controller passes data to AppointmentsService
           ↓
Step 7: The service applies business logic:
        - Is the date in the future?
        - Is the time slot available?
        - Is the service valid?
           ↓
Step 8: The service uses Mongoose to save the document to MongoDB
        (Appointments collection)
           ↓
Step 9: MongoDB returns a success confirmation with the created document
           ↓
Step 10: NestJS sends a JSON response back to Angular
           ↓
Step 11: Angular receives the response and updates the UI
         ("Appointment booked successfully!")
```

### 2.4 Scalability Approach

The system is designed to scale in the following way:

- **Vertical Scaling (Short-term):** Upgrade the server (more RAM, more CPU) on the cloud provider
- **Horizontal Scaling (Long-term):** Run multiple instances of the NestJS backend behind a load balancer
- **Database Scaling:** MongoDB Atlas natively supports replica sets and sharding for horizontal data distribution
- **Frontend Scaling:** Angular is a static SPA (Single Page Application) — it can be served from a CDN (Content Delivery Network) with essentially zero scaling concerns

---

---

## 3. Frontend Architecture Analysis

### 3.1 Technology Stack

| Technology | Role | Why It Was Chosen |
|---|---|---|
| **Angular 17** | Core frontend framework | Component-based, TypeScript-first, enterprise-proven, standalone components support, signals for reactivity |
| **Angular Material** | UI component library | Pre-built, tested, accessible components (buttons, forms, tables, dialogs) that follow Material Design guidelines |
| **Tailwind CSS** | Utility-first CSS framework | Rapid styling, responsive design, consistent spacing and colors without writing custom CSS classes |

### 3.2 Component Architecture (Detailed Breakdown)

The frontend follows a **three-tier component architecture**:

```
src/app/
│
├── core/                          ← TIER 1: CORE (Singleton Services & Infrastructure)
│   ├── services/                  
│   │   ├── auth.service.ts        → Handles login, register, logout, token management
│   │   ├── user.service.ts        → Handles user profile CRUD operations
│   │   ├── product.service.ts     → Handles product listing and ordering
│   │   ├── appointment.service.ts → Handles appointment CRUD operations
│   │   └── admin.service.ts       → Handles admin-specific operations
│   ├── guards/                    
│   │   ├── auth.guard.ts          → Prevents unauthenticated access to protected pages
│   │   └── role.guard.ts          → Prevents unauthorized role access (e.g., customer can't access admin)
│   └── interceptors/              
│       └── auth.interceptor.ts    → Automatically attaches JWT token to every outgoing HTTP request
│
├── shared/                        ← TIER 2: SHARED (Reusable UI Components)
│   ├── navbar/                    → Navigation bar shown on every page
│   ├── footer/                    → Footer shown on every page
│   └── loader/                    → Loading spinner shown during API calls
│
└── features/                      ← TIER 3: FEATURE MODULES (Business Logic Pages)
    ├── auth/                      
    │   ├── login/                 → Login page component
    │   └── register/              → Registration page component
    ├── services/                  
    │   ├── service-list/          → Lists all salon services
    │   └── service-detail/        → Shows details of a single service
    ├── products/                  
    │   ├── product-list/          → Lists all products for sale
    │   ├── product-detail/        → Shows details of a single product
    │   ├── cart/                   → Shopping cart page
    │   └── checkout/              → Checkout and payment page
    ├── appointments/              
    │   └── book-appointment/      → Appointment booking form
    └── admin/                     
        └── dashboard/             → Admin dashboard with management panels
```

#### Why This Structure?

| Tier | Purpose | Rule |
|---|---|---|
| **Core** | Contains services, guards, and interceptors that are used *across the entire app*. These are singleton — only one instance exists. | Never import core into itself. Core is imported by AppModule only once. |
| **Shared** | Contains reusable *UI components* (navbar, footer, loader) that appear on multiple pages. | Any feature module can import shared components. |
| **Features** | Contains the actual *business pages*. Each feature module is independent and lazy-loadable. | Features import from Core and Shared, but never from other Features. |

### 3.3 Full Page List

| # | Page | Route | Who Can Access | Purpose |
|---|---|---|---|---|
| 1 | Home Page | `/` | Everyone | Landing page — showcases the salon, featured services, call-to-action |
| 2 | Services Page | `/services` | Everyone | Lists all available salon services with prices |
| 3 | Service Details | `/services/:id` | Everyone | Detailed view of a single service |
| 4 | Products Page | `/products` | Everyone | Lists all beauty products for sale |
| 5 | Product Details | `/products/:id` | Everyone | Detailed view of a single product |
| 6 | Cart Page | `/cart` | Logged-in Customers | Shopping cart with selected products |
| 7 | Checkout Page | `/checkout` | Logged-in Customers | Payment and order confirmation |
| 8 | Login Page | `/login` | Guests only | User authentication |
| 9 | Register Page | `/register` | Guests only | New user registration |
| 10 | User Dashboard | `/dashboard` | Logged-in Customers | View bookings, orders, profile |
| 11 | Admin Dashboard | `/admin` | Admin / Super Admin | Manage services, appointments, products, users |

### 3.4 Routing Flow

```
AppRoutingModule
│
├── '' (Home)                        → HomeComponent
├── 'login'                          → LoginComponent
├── 'register'                       → RegisterComponent
├── 'services'                       → ServiceListComponent
├── 'services/:id'                   → ServiceDetailComponent
├── 'products'                       → ProductListComponent
├── 'products/:id'                   → ProductDetailComponent
├── 'cart'        [AuthGuard]        → CartComponent
├── 'checkout'    [AuthGuard]        → CheckoutComponent
├── 'dashboard'   [AuthGuard]        → UserDashboardComponent
└── 'admin'       [AuthGuard + RoleGuard('admin')]  → AdminDashboardComponent
```

**Key Point:** Routes marked with `[AuthGuard]` check if the user has a valid JWT token before allowing access. Routes marked with `[RoleGuard]` additionally check if the user's role matches the required role.

### 3.5 State Management Flow

The system uses **RxJS Observables and BehaviorSubject** for state management instead of a dedicated state management library like NgRx. This is a pragmatic choice for a system of this size.

```
How state flows:

┌────────────┐    subscribe()    ┌──────────────┐
│  Component │ ◄──────────────── │ BehaviorSubject │
│  (UI View) │                   │ (in Service)    │
└─────┬──────┘                   └───────┬─────────┘
      │ user action                      │
      │ (click, submit)                  │ .next(newValue)
      ▼                                  │
┌────────────┐    HTTP response   ┌──────┴─────────┐
│  Service   │ ◄───────────────── │  NestJS API    │
│  Method    │ ──────────────────→│  (Backend)     │
└────────────┘    HTTP request    └────────────────┘
```

**Example:** When the user logs in:
1. `LoginComponent` calls `authService.login(email, password)`
2. `AuthService` sends HTTP POST to `/auth/login`
3. NestJS validates credentials and returns a JWT token
4. `AuthService` stores the token in `localStorage` and pushes user data into a `BehaviorSubject`
5. `NavbarComponent` (which is subscribed to the BehaviorSubject) immediately updates to show the user's name and a logout button

---

---

## 4. Backend Architecture Analysis

### 4.1 NestJS Modular Architecture

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

### 4.2 Module Breakdown

| Module | Controller | Service | Schema | Responsibility |
|---|---|---|---|---|
| **AuthModule** | `AuthController` | `AuthService` | `UserSchema` | Registration, login, JWT generation, password hashing |
| **UsersModule** | `UsersController` | `UsersService` | `UserSchema` | User profile CRUD, role management |
| **ServicesModule** | `ServicesController` | `ServicesService` | `ServiceSchema` | Salon service CRUD (add, edit, delete, list services) |
| **AppointmentsModule** | `AppointmentsController` | `AppointmentsService` | `AppointmentSchema` | Appointment booking, approval/rejection, listing |
| **ProductsModule** | `ProductsController` | `ProductsService` | `ProductSchema` | Product catalog CRUD |
| **OrdersModule** | `OrdersController` | `OrdersService` | `OrderSchema` | Order placement, tracking |
| **PaymentsModule** | `PaymentsController` | `PaymentsService` | `PaymentSchema` | Payment recording, status management |

### 4.3 Request Lifecycle — Step by Step

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

### 4.4 Key NestJS Features Used

| Feature | What It Does | Why It Matters |
|---|---|---|
| **Dependency Injection** | Services are automatically created and injected into controllers. You don't manually create instances. | Makes testing easier, reduces coupling between components |
| **Decorators** | `@Controller()`, `@Get()`, `@Post()`, `@UseGuards()`, `@Body()` — these annotations define routes and behavior declaratively | Cleaner code, less boilerplate |
| **Guards** | Run before the route handler to decide if the request should proceed | Centralized authentication/authorization logic |
| **Interceptors** | Can transform request/response and add cross-cutting concerns | Logging, response transformation, caching |
| **Middleware** | Runs before guards for low-level request processing | CORS, request logging, body parsing |

---

---

## 5. Database Analysis

### 5.1 Database Platform

**MongoDB Atlas** — a cloud-hosted, fully managed NoSQL document database.

**Why MongoDB over SQL (like MySQL/PostgreSQL)?**

| Factor | MongoDB (Chosen) | SQL Database |
|---|---|---|
| **Schema flexibility** | Documents can have different shapes. Easy to add new fields without migrations. | Rigid schema — adding a column requires ALTER TABLE migration. |
| **Data model** | Stores JSON-like documents. Natural fit for JavaScript/TypeScript. | Stores rows and tables. Requires ORM mapping. |
| **Scalability** | Native horizontal scaling via sharding. | Horizontal scaling is complex and often requires third-party tools. |
| **Speed for this use case** | Appointments, products, and orders are self-contained documents — reads are fast with no JOINs. | Would require JOINs across multiple tables, which can be slower. |

### 5.2 Collections (Tables) and Their Fields

#### Collection 1: `users`
```
{
  _id:        ObjectId       → Auto-generated unique identifier
  name:       String         → Full name of the user
  email:      String         → Email address (used for login, must be unique)
  password:   String         → bcrypt-hashed password (NEVER stored in plaintext)
  role:       String         → "customer" | "admin" | "superadmin" | "staff"
  createdAt:  Date           → Timestamp of account creation
}
```

#### Collection 2: `services`
```
{
  _id:         ObjectId      → Auto-generated unique identifier
  name:        String        → Service name (e.g., "Hair Cut", "Bridal Makeup")
  description: String        → Detailed description of the service
  price:       Number        → Price in currency units (e.g., ₹500)
  duration:    Number        → Duration in minutes (e.g., 60)
  category:    String        → Category (e.g., "Hair", "Skin", "Nails", "Bridal")
}
```

#### Collection 3: `appointments`
```
{
  _id:       ObjectId        → Auto-generated unique identifier
  userId:    ObjectId        → Reference to the user who booked (FK to users._id)
  serviceId: ObjectId        → Reference to the service booked (FK to services._id)
  date:      Date            → Appointment date
  time:      String          → Appointment time (e.g., "10:00 AM")
  status:    String          → "pending" | "approved" | "rejected" | "completed" | "cancelled"
}
```

#### Collection 4: `products`
```
{
  _id:         ObjectId      → Auto-generated unique identifier
  name:        String        → Product name (e.g., "Lakmé Face Wash")
  price:       Number        → Product price
  description: String        → Product description
  image:       String        → URL or path to product image
}
```

#### Collection 5: `orders`
```
{
  _id:          ObjectId     → Auto-generated unique identifier
  userId:       ObjectId     → Reference to the customer (FK to users._id)
  products:     Array        → Array of product IDs and quantities
  totalAmount:  Number       → Calculated total price
}
```

#### Collection 6: `payments`
```
{
  _id:            ObjectId   → Auto-generated unique identifier
  userId:         ObjectId   → Reference to the user who paid (FK to users._id)
  amount:         Number     → Payment amount
  paymentStatus:  String     → "pending" | "completed" | "failed" | "refunded"
}
```

### 5.3 Relationships Between Collections

```
┌──────────┐         ┌──────────────┐         ┌───────────┐
│  USERS   │────────▶│ APPOINTMENTS │◀────────│ SERVICES  │
│          │ 1:Many  │              │ Many:1   │           │
└────┬─────┘         └──────────────┘         └───────────┘
     │
     │ 1:Many
     ▼
┌──────────┐
│  ORDERS  │──────────▶ products (embedded array of product refs)
└────┬─────┘
     │
     │ 1:1
     ▼
┌──────────┐
│ PAYMENTS │
└──────────┘
```

**Relationships Explained:**
- One **User** can have many **Appointments** (1:Many)
- One **Service** can appear in many **Appointments** (1:Many)
- One **User** can have many **Orders** (1:Many)
- One **Order** can reference many **Products** (Many:Many via embedded array)
- One **User** can have many **Payments** (1:Many)
- Each **Order** generates one **Payment** (1:1)

### 5.4 Recommended Indexing Strategy

> ⚠️ The documentation does not explicitly define indexes, but here is what a Senior Architect would recommend:

| Collection | Field(s) | Index Type | Why |
|---|---|---|---|
| `users` | `email` | Unique Index | Login lookups must be fast; email must be unique |
| `users` | `role` | Standard Index | Admin queries filtering by role |
| `appointments` | `userId` | Standard Index | Customers need to quickly see their appointments |
| `appointments` | `date` | Standard Index | Admin queries by date range |
| `appointments` | `status` | Standard Index | Filter by pending/approved/completed |
| `appointments` | `serviceId` | Standard Index | Analytics — which services are most popular |
| `orders` | `userId` | Standard Index | Customer order history |
| `payments` | `userId` | Standard Index | Customer payment history |
| `payments` | `paymentStatus` | Standard Index | Admin filtering for pending payments |

---

---

## 6. API Architecture Analysis

### 6.1 REST API Design

The API follows **RESTful conventions** meaning:
- Resources are identified by URLs (nouns, not verbs)
- HTTP methods define the operation (GET = read, POST = create, PUT = update, DELETE = remove)
- All communication uses JSON format

### 6.2 Complete API Endpoint Map

#### Authentication APIs
| Method | Endpoint | Access | Request Body | Response | Purpose |
|---|---|---|---|---|---|
| `POST` | `/auth/register` | Public | `{ name, email, password }` | `{ user, token }` | Create a new user account |
| `POST` | `/auth/login` | Public | `{ email, password }` | `{ user, token }` | Authenticate and get JWT |

#### Service APIs
| Method | Endpoint | Access | Request Body | Response | Purpose |
|---|---|---|---|---|---|
| `GET` | `/services` | Public | — | `[{ services }]` | List all salon services |
| `POST` | `/services` | Admin only | `{ name, description, price, duration, category }` | `{ service }` | Create a new service |
| `PUT` | `/services/:id` | Admin only | `{ updated fields }` | `{ service }` | Update an existing service |
| `DELETE` | `/services/:id` | Admin only | — | `{ message }` | Delete a service |

#### Appointment APIs
| Method | Endpoint | Access | Request Body | Response | Purpose |
|---|---|---|---|---|---|
| `POST` | `/appointments` | Authenticated | `{ serviceId, date, time }` | `{ appointment }` | Book a new appointment |
| `GET` | `/appointments` | Authenticated | — | `[{ appointments }]` | Get user's appointments (or all if admin) |
| `PUT` | `/appointments/:id` | Admin only | `{ status }` | `{ appointment }` | Update appointment status (approve/reject) |

#### Product APIs
| Method | Endpoint | Access | Request Body | Response | Purpose |
|---|---|---|---|---|---|
| `GET` | `/products` | Public | — | `[{ products }]` | List all products |
| `POST` | `/products` | Admin only | `{ name, price, description, image }` | `{ product }` | Add a new product |

#### Order APIs
| Method | Endpoint | Access | Request Body | Response | Purpose |
|---|---|---|---|---|---|
| `POST` | `/orders` | Authenticated | `{ products, totalAmount }` | `{ order }` | Place a new order |

#### Payment APIs
| Method | Endpoint | Access | Request Body | Response | Purpose |
|---|---|---|---|---|---|
| `POST` | `/payments` | Authenticated | `{ amount }` | `{ payment }` | Record a payment |

### 6.3 Request and Response Flow (Visual)

```
┌──────────┐     HTTP Request          ┌──────────┐
│  Angular │ ──────────────────────▶   │  NestJS  │
│  Client  │  Headers:                 │  Server  │
│          │   Content-Type: JSON      │          │
│          │   Authorization: Bearer   │          │
│          │  Body: { ... }            │          │
│          │                           │          │
│          │  ◀──────────────────────  │          │
│          │     HTTP Response         │          │
│          │     Status: 200/201/      │          │
│          │            401/403/500    │          │
│          │     Body: { data }        │          │
└──────────┘                           └──────────┘
```

### 6.4 Authentication Flow Using JWT

```
REGISTRATION FLOW:
══════════════════
1. Customer → POST /auth/register { name, email, password }
2. Server validates input (email format, password strength)
3. Server checks if email already exists
4. Server hashes password with bcrypt (salt rounds = 10)
5. Server saves user document to MongoDB
6. Server generates JWT token (payload: { userId, role }, secret, expiry: 24h)
7. Server → Response { user: { name, email, role }, token: "eyJ..." }
8. Angular stores token in localStorage

LOGIN FLOW:
════════════
1. Customer → POST /auth/login { email, password }
2. Server finds user by email in MongoDB
3. Server compares provided password with stored hash (bcrypt.compare)
4. If mismatch → 401 Unauthorized
5. If match → Server generates new JWT token
6. Server → Response { user: { name, email, role }, token: "eyJ..." }
7. Angular stores token in localStorage
8. Angular HttpInterceptor attaches token to all subsequent requests

AUTHENTICATED REQUEST FLOW:
════════════════════════════
1. Angular makes any API call (e.g., GET /appointments)
2. HttpInterceptor adds header: Authorization: Bearer <token>
3. NestJS AuthGuard extracts token from header
4. AuthGuard verifies token using the JWT secret
5. AuthGuard decodes payload { userId, role }
6. If valid → attaches user to request, allows the request to proceed
7. If invalid/expired → returns 401 Unauthorized
```

---

---

## 7. Security Analysis

### 7.1 Authentication Analysis

| Security Measure | Implementation | Strength |
|---|---|---|
| **Password Hashing** | bcrypt with salt rounds | ✅ Strong — bcrypt is deliberately slow, making brute-force attacks impractical |
| **JWT Tokens** | Stateless token-based auth | ✅ Good — no session storage needed on server, scales well |
| **Token Storage** | localStorage in the browser | ⚠️ Risk — vulnerable to XSS (Cross-Site Scripting) attacks; see vulnerabilities below |
| **Token Expiry** | Tokens should have expiry (e.g., 24h) | ✅ Good — limits damage if a token is stolen |

### 7.2 Authorization Analysis

| Security Measure | Implementation | Strength |
|---|---|---|
| **Role-Based Access Control (RBAC)** | User role stored in JWT payload, checked by guards | ✅ Good — centralized, declarative |
| **Route Guards (Frontend)** | Angular AuthGuard and RoleGuard | ⚠️ Defense-in-depth only — frontend guards can be bypassed; backend guards are the real enforcement |
| **API Route Guards (Backend)** | NestJS Guards with `@UseGuards()` decorator | ✅ Strong — server-side enforcement, cannot be bypassed |

### 7.3 Identified Potential Vulnerabilities

| # | Vulnerability | Risk Level | Description | Recommended Mitigation |
|---|---|---|---|---|
| 1 | **JWT stored in localStorage** | 🟡 Medium | If an attacker injects malicious JavaScript (XSS), they can steal the JWT from localStorage | Store JWT in HttpOnly cookies instead (inaccessible to JavaScript) |
| 2 | **No rate limiting mentioned** | 🔴 High | Without rate limiting, attackers can brute-force the login endpoint | Implement rate limiting (e.g., express-rate-limit) — max 5 login attempts per minute per IP |
| 3 | **No input validation details** | 🟡 Medium | If user input isn't validated, the system is vulnerable to injection attacks | Use NestJS `class-validator` and `class-transformer` DTOs for all inputs |
| 4 | **No CSRF protection mentioned** | 🟡 Medium | If cookies are used for auth in the future, CSRF becomes a risk | Implement CSRF tokens if switching to cookie-based auth |
| 5 | **No password policy defined** | 🟡 Medium | Users could set weak passwords like "123" | Enforce minimum 8 characters, 1 uppercase, 1 number, 1 special character |
| 6 | **No refresh token mechanism** | 🟡 Medium | Users have to log in again after token expires | Implement refresh tokens for seamless re-authentication |
| 7 | **No logging/audit trail mentioned** | 🟡 Medium | If there's a security incident, there's no way to trace what happened | Implement structured logging (e.g., Winston) with user action audit trail |
| 8 | **No MongoDB injection protection mentioned** | 🟡 Medium | MongoDB can be vulnerable to NoSQL injection via `$gt`, `$ne` operators in query params | Sanitize all query parameters, use Mongoose schema validation |

---

---

## 8. Deployment Architecture Analysis

### 8.1 Production Deployment Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT ARCHITECTURE                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│    ┌──────────────┐                                         │
│    │   CUSTOMER   │                                         │
│    │   (Browser)  │                                         │
│    └──────┬───────┘                                         │
│           │ HTTPS                                           │
│           ▼                                                 │
│    ┌──────────────┐          ┌──────────────┐               │
│    │  Netlify /   │          │  Render /    │               │
│    │  Vercel      │────────▶│  AWS         │               │
│    │  (Frontend)  │  API     │  (Backend)   │               │
│    │              │  Calls   │              │               │
│    │  Static SPA  │          │  NestJS App  │               │
│    └──────────────┘          └──────┬───────┘               │
│                                     │                       │
│                                     │ MongoDB Driver        │
│                                     ▼                       │
│                              ┌──────────────┐               │
│                              │  MongoDB     │               │
│                              │  Atlas       │               │
│                              │  (Cloud DB)  │               │
│                              └──────────────┘               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 Frontend Deployment (Angular)

| Step | Action | Details |
|---|---|---|
| 1 | **Build the project** | Run `ng build --configuration=production` to generate optimized static files (HTML, CSS, JS) in the `dist/` folder |
| 2 | **Choose a host** | Netlify or Vercel — both are free-tier-friendly, support HTTPS, and auto-deploy from Git |
| 3 | **Configure routing** | Add a `_redirects` file (Netlify) or `vercel.json` (Vercel) to redirect all routes to `index.html` (SPA requirement) |
| 4 | **Set environment variables** | Configure `API_BASE_URL` to point to the deployed NestJS backend URL |
| 5 | **Deploy** | Push to Git → Netlify/Vercel auto-builds and deploys |

**Key Points:**
- Angular produces **static files** — no server needed. Just a file host.
- CDN caching makes the frontend extremely fast globally.
- HTTPS is provided automatically by Netlify/Vercel.

### 8.3 Backend Deployment (NestJS)

| Step | Action | Details |
|---|---|---|
| 1 | **Build the project** | Run `npm run build` to compile TypeScript to JavaScript in the `dist/` folder |
| 2 | **Choose a host** | Render (free tier) or AWS (Elastic Beanstalk, EC2, or ECS for production) |
| 3 | **Configure environment variables** | Set `MONGO_URI`, `JWT_SECRET`, `PORT`, `NODE_ENV=production` as environment variables on the host |
| 4 | **Configure CORS** | Allow requests only from the frontend domain (e.g., `https://salon.netlify.app`) |
| 5 | **Deploy** | Push to Git → Render auto-builds and deploys. For AWS, use CI/CD pipeline. |

**Key Points:**
- NestJS requires a **running Node.js server** — it cannot be hosted as static files.
- Render's free tier sleeps after 15 minutes of inactivity (cold starts of ~30s). For production, use a paid tier.
- AWS provides more control but requires more configuration.

### 8.4 Database Deployment (MongoDB Atlas)

| Step | Action | Details |
|---|---|---|
| 1 | **Create Atlas cluster** | Sign up at `mongodb.com/atlas`, create a free M0 cluster (512 MB) |
| 2 | **Configure network access** | Whitelist the backend server's IP address (or allow all IPs `0.0.0.0/0` for development) |
| 3 | **Create database user** | Create a user with read/write permissions |
| 4 | **Get connection string** | Copy the `mongodb+srv://...` connection string |
| 5 | **Connect from NestJS** | Set `MONGO_URI` environment variable to the connection string |

**Key Points:**
- MongoDB Atlas handles backups, monitoring, and scaling automatically.
- The free tier (M0) is suitable for development and small-scale production.
- For enterprise, use M10+ with dedicated resources and automatic failover.

---

---

## 9. Scalability Analysis

### 9.1 Current Scalability Status

The system as designed is a **modular monolith** — it can handle a single salon's operations well, but it needs adjustments to handle high traffic or multi-salon operations.

### 9.2 Horizontal Scaling Strategy

```
CURRENT STATE (Single Instance):
┌──────────┐    ┌──────────┐    ┌──────────┐
│ Angular  │───▶│ NestJS   │───▶│ MongoDB  │
│ (CDN)    │    │ (1 inst) │    │ Atlas    │
└──────────┘    └──────────┘    └──────────┘

SCALED STATE (Multiple Instances):
                ┌──────────────┐
             ┌─▶│ NestJS #1    │──┐
┌──────────┐ │  └──────────────┘  │  ┌────────────────┐
│ Angular  │─┤  ┌──────────────┐  ├─▶│ MongoDB Atlas  │
│ (CDN)    │ ├─▶│ NestJS #2    │──┤  │ (Replica Set)  │
└──────────┘ │  └──────────────┘  │  └────────────────┘
             │  ┌──────────────┐  │
             └─▶│ NestJS #3    │──┘
                └──────────────┘
                       ▲
                ┌──────┴──────┐
                │ Load        │
                │ Balancer    │
                │ (Nginx/ALB) │
                └─────────────┘
```

### 9.3 Layer-by-Layer Scalability

| Layer | Strategy | How |
|---|---|---|
| **Frontend** | CDN Distribution | Angular SPA is served from edge nodes globally. Netlify/Vercel do this automatically. No scaling concern. |
| **Backend** | Horizontal Pod Scaling | Run multiple NestJS instances behind a load balancer (Nginx, AWS ALB, or Kubernetes). Since JWT is stateless, no sticky sessions needed. |
| **Database** | Replica Sets + Sharding | MongoDB Atlas supports automatic replica sets (for read scaling) and sharding (for write scaling). |

### 9.4 Performance Optimization Strategies

| # | Optimization | What It Does | Impact |
|---|---|---|---|
| 1 | **Lazy Loading (Frontend)** | Feature modules are loaded only when the user navigates to them, not upfront | ⬆️ Faster initial load time |
| 2 | **Ahead-of-Time (AOT) Compilation** | Angular templates are compiled at build time, not in the browser | ⬆️ Faster rendering |
| 3 | **Database Indexing** | Indexes on frequently queried fields (email, userId, date, status) | ⬆️ Faster database queries |
| 4 | **API Response Caching** | Cache GET requests for services and products (rarely change) | ⬇️ Fewer database hits |
| 5 | **Image Optimization** | Compress product images, use WebP format, serve from CDN | ⬆️ Faster page loads |
| 6 | **Gzip Compression** | Compress HTTP responses on the backend | ⬇️ Lower bandwidth usage |
| 7 | **Connection Pooling** | Mongoose connection pool for MongoDB (default: 5 connections) | ⬆️ Better database throughput |

---

---

## 10. Risk Analysis

### 10.1 Technical Risks

| # | Risk | Probability | Impact | Description | Mitigation |
|---|---|---|---|---|---|
| 1 | **Single Point of Failure (Backend)** | 🟡 Medium | 🔴 High | If the single NestJS instance crashes, the entire system goes down | Deploy behind a load balancer with health checks and auto-restart (PM2, Docker Compose, or Kubernetes) |
| 2 | **No Error Handling Strategy** | 🟡 Medium | 🟡 Medium | The documentation does not describe global error handling | Implement NestJS Exception Filters for consistent error responses |
| 3 | **No API Versioning** | 🟡 Medium | 🟡 Medium | If the API changes in the future, old clients will break | Use URL-based versioning (e.g., `/api/v1/services`) |
| 4 | **No Testing Strategy Details** | 🟡 Medium | 🔴 High | The plan mentions testing but doesn't detail unit/integration test coverage | Define minimum 80% code coverage, use Jest for unit tests, Supertest for E2E |
| 5 | **Tight Coupling Risk** | 🟢 Low | 🟡 Medium | If modules aren't properly isolated, extracting microservices later becomes difficult | Enforce module boundaries — modules should communicate via injected services only, never import each other's internal files |

### 10.2 Security Risks

| # | Risk | Probability | Impact | Description | Mitigation |
|---|---|---|---|---|---|
| 1 | **XSS Attack (Token Theft)** | 🟡 Medium | 🔴 High | Injected JavaScript can steal JWT from localStorage | Move JWT to HttpOnly cookie; implement Content Security Policy (CSP) headers |
| 2 | **Brute-Force Login** | 🔴 High | 🔴 High | No rate limiting = unlimited login attempts | Implement rate limiting on `/auth/login` (max 5 per minute per IP) |
| 3 | **Data Exposure** | 🟡 Medium | 🔴 High | If password field is accidentally returned in API responses | Use `select: false` on password field in Mongoose schema; use response serialization |
| 4 | **Missing HTTPS enforcement** | 🟢 Low | 🟡 Medium | If HTTPS is not enforced, data can be intercepted in transit | Netlify/Vercel auto-enforce HTTPS; ensure backend host also uses HTTPS |
| 5 | **No audit logging** | 🟡 Medium | 🟡 Medium | Impossible to investigate security incidents without logs | Implement structured logging with Winston + user action audit trail |

### 10.3 Scalability Risks

| # | Risk | Probability | Impact | Description | Mitigation |
|---|---|---|---|---|---|
| 1 | **MongoDB Free Tier Limits** | 🔴 High | 🟡 Medium | M0 cluster (512MB storage, shared vCPU) will be exhausted quickly with real users | Plan migration to M10+ when user base exceeds ~1000 active users |
| 2 | **Render Free Tier Cold Starts** | 🔴 High | 🟡 Medium | Backend sleeps after 15 mins of inactivity; first request takes ~30 seconds | Use a paid tier or a cron job to keep the backend warm |
| 3 | **No Caching Layer** | 🟡 Medium | 🟡 Medium | Every request hits the database directly | Add Redis as a caching layer for frequently accessed data (services, products) |
| 4 | **Image Storage** | 🟡 Medium | 🟡 Medium | Product images stored on the same server can consume disk space | Use Cloudinary or AWS S3 for image storage with CDN delivery |
| 5 | **No Monitoring** | 🟡 Medium | 🔴 High | Without monitoring, you won't know when the system is approaching limits | Implement APM (Application Performance Monitoring) — e.g., Datadog, New Relic, or free PM2 monitoring |

---

---

## 📊 Executive Summary

| Dimension | Current Status | Architect's Rating | Key Action Needed |
|---|---|---|---|
| **Business Design** | Well-defined roles and workflows | ⭐⭐⭐⭐ | Add customer notifications (email/SMS) for appointments |
| **System Architecture** | Solid modular monolith | ⭐⭐⭐⭐ | Document module boundaries and integration contracts |
| **Frontend Architecture** | Clean 3-tier component structure | ⭐⭐⭐⭐ | Add loading states, error states, and empty states for UX |
| **Backend Architecture** | Standard NestJS patterns | ⭐⭐⭐⭐ | Add Exception Filters, DTOs, and Pipes for validation |
| **Database Design** | Functional schema | ⭐⭐⭐ | Add indexes, timestamps, and field validation rules |
| **API Design** | Basic RESTful | ⭐⭐⭐ | Add API versioning, pagination, error codes, and Swagger docs |
| **Security** | Foundation in place | ⭐⭐⭐ | Critical: Add rate limiting, input validation, move JWT to cookies |
| **Deployment** | Standard cloud deployment | ⭐⭐⭐ | Add CI/CD pipeline, staging environment, monitoring |
| **Scalability** | Cloud-native ready | ⭐⭐⭐ | Add caching (Redis), image CDN, load balancing |
| **Risk Management** | Partially addressed | ⭐⭐ | Create comprehensive testing strategy and monitoring plan |

---

> **🔒 REMINDER: No code has been written in this analysis.** This document serves as the complete conceptual blueprint that must be fully understood before any implementation begins. Each section can now serve as the specification for its corresponding implementation phase.

---

*Analysis conducted using Anti-Gravity Analysis methodology — High-Level Architecture → Low-Level Implementation Details*
