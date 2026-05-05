# Chapter 6: Authentication & Authorization

## 6.1 Authentication System Overview

The system uses **JWT (JSON Web Token)** based authentication combined with **bcrypt** password hashing to provide a secure, stateless authentication mechanism.

| Technology | Purpose |
|---|---|
| **JWT (JSON Web Token)** | Stateless token-based authentication — no server-side sessions needed |
| **bcrypt** | Password hashing with salt rounds — makes brute-force attacks impractical |
| **Passport.js** | Authentication middleware for NestJS — provides JWT strategy |

---

## 6.2 Registration Flow

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
```

---

## 6.3 Login Flow

```
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
```

---

## 6.4 Authenticated Request Flow

```
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

## 6.5 Authorization — Role-Based Access Control (RBAC)

The system implements **Role-Based Access Control** where each user is assigned a role, and API endpoints check the role before allowing access.

| Role | Access Level | Protected By |
|---|---|---|
| **Customer** | Can access customer-facing pages and APIs (booking, ordering) | `JwtAuthGuard` |
| **Admin** | Can access admin dashboard and management APIs | `JwtAuthGuard` + `RolesGuard('admin')` |
| **Super Admin** | Can access everything including user management | `JwtAuthGuard` + `RolesGuard('superadmin')` |
| **Staff** | Can access assigned appointments and update statuses | `JwtAuthGuard` + `RolesGuard('staff')` |

---

## 6.6 Security Features

| Feature | Implementation | Description |
|---|---|---|
| **Protected Routes (Backend)** | `@UseGuards(JwtAuthGuard)` decorator | Server-side enforcement — cannot be bypassed by clients |
| **Protected Routes (Frontend)** | Angular `AuthGuard` and `RoleGuard` | Defense-in-depth — frontend guards prevent unauthorized navigation but backend is the real enforcement |
| **Secure Token Validation** | JWT signature verification with secret key | Ensures token integrity and prevents tampering |
| **Encrypted Password Storage** | bcrypt with configurable salt rounds | Passwords are never stored in plaintext |
| **Token Expiry** | JWT tokens have 24-hour expiry | Limits damage if a token is stolen |

---

## 6.7 JWT Token Structure

```
┌─────────────────────────────────────────────────────┐
│                  JWT TOKEN                           │
├──────────────┬──────────────────┬───────────────────┤
│   HEADER     │    PAYLOAD       │    SIGNATURE      │
│              │                  │                   │
│ {            │ {                │ HMACSHA256(       │
│  "alg":      │  "userId": "...",│  base64(header) + │
│   "HS256",   │  "role":         │  "." +            │
│  "typ":      │   "customer",   │  base64(payload), │
│   "JWT"      │  "iat": 17...,  │  secret           │
│ }            │  "exp": 17...   │ )                 │
│              │ }                │                   │
└──────────────┴──────────────────┴───────────────────┘
```

---

## 6.8 Security Flow Diagram

```
┌──────────┐         ┌──────────┐         ┌──────────┐
│  Client  │  Login  │  NestJS  │  Verify  │ MongoDB  │
│ (Angular)│────────▶│  Server  │────────▶│  Atlas   │
│          │         │          │         │          │
│          │◀────────│          │◀────────│          │
│          │  JWT    │          │  User   │          │
│          │  Token  │          │  Data   │          │
└────┬─────┘         └──────────┘         └──────────┘
     │
     │  Stores JWT in localStorage
     │
     │  Every subsequent request includes:
     │  Authorization: Bearer <token>
     ▼
┌──────────┐
│ Protected│
│   API    │
│  Access  │
└──────────┘
```