# Chapter 5: Frontend Architecture

## 5.1 Technology Stack

| Technology | Role | Why It Was Chosen |
|---|---|---|
| **Angular 17** | Core frontend framework | Component-based, TypeScript-first, enterprise-proven, standalone components support, signals for reactivity |
| **Angular Material** | UI component library | Pre-built, tested, accessible components (buttons, forms, tables, dialogs) that follow Material Design guidelines |
| **Tailwind CSS** | Utility-first CSS framework | Rapid styling, responsive design, consistent spacing and colors without writing custom CSS classes |

---

## 5.2 Component Architecture (Three-Tier Structure)

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

### Why This Structure?

| Tier | Purpose | Rule |
|---|---|---|
| **Core** | Contains services, guards, and interceptors that are used *across the entire app*. These are singleton — only one instance exists. | Never import core into itself. Core is imported by AppModule only once. |
| **Shared** | Contains reusable *UI components* (navbar, footer, loader) that appear on multiple pages. | Any feature module can import shared components. |
| **Features** | Contains the actual *business pages*. Each feature module is independent and lazy-loadable. | Features import from Core and Shared, but never from other Features. |

---

## 5.3 Full Page List

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

---

## 5.4 Routing Flow

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

---

## 5.5 State Management Flow

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

## 5.6 Angular Services

| Service | File | Responsibility |
|---|---|---|
| **AuthService** | `auth.service.ts` | Login, register, logout, JWT token management |
| **UserService** | `user.service.ts` | User profile CRUD operations |
| **ProductService** | `product.service.ts` | Product listing, filtering, and ordering |
| **AppointmentService** | `appointment.service.ts` | Appointment CRUD operations |
| **AdminService** | `admin.service.ts` | Admin-specific operations (manage services, users, etc.) |

---

## 5.7 UI Design Principles

The UI is designed based on an **enterprise salon system (Lakmé-style)** with the following principles:

- **Responsive Design** — works seamlessly on desktop, tablet, and mobile devices
- **Modern Material UI** — uses Angular Material components for a consistent, professional look
- **Mobile-First Approach** — designed for mobile screens first, then scaled up for larger screens
- **High Performance** — lazy loading, AOT compilation, and optimized bundle sizes
- **Accessibility** — follows Material Design accessibility guidelines for inclusive design