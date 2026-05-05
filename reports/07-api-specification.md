# Chapter 7: API Specification

## 7.1 REST API Design Principles

The API follows **RESTful conventions** meaning:
- Resources are identified by URLs (nouns, not verbs)
- HTTP methods define the operation (GET = read, POST = create, PUT = update, DELETE = remove)
- All communication uses JSON format
- Each endpoint returns appropriate HTTP status codes

---

## 7.2 Complete API Endpoint Map

### Authentication APIs

| Method | Endpoint | Access | Request Body | Response | Purpose |
|---|---|---|---|---|---|
| `POST` | `/auth/register` | Public | `{ name, email, password }` | `{ user, token }` | Create a new user account |
| `POST` | `/auth/login` | Public | `{ email, password }` | `{ user, token }` | Authenticate and get JWT |

### Service APIs

| Method | Endpoint | Access | Request Body | Response | Purpose |
|---|---|---|---|---|---|
| `GET` | `/services` | Public | — | `[{ services }]` | List all salon services |
| `POST` | `/services` | Admin only | `{ name, description, price, duration, category }` | `{ service }` | Create a new service |
| `PUT` | `/services/:id` | Admin only | `{ updated fields }` | `{ service }` | Update an existing service |
| `DELETE` | `/services/:id` | Admin only | — | `{ message }` | Delete a service |

### Appointment APIs

| Method | Endpoint | Access | Request Body | Response | Purpose |
|---|---|---|---|---|---|
| `POST` | `/appointments` | Authenticated | `{ serviceId, date, time }` | `{ appointment }` | Book a new appointment |
| `GET` | `/appointments` | Authenticated | — | `[{ appointments }]` | Get user's appointments (or all if admin) |
| `PUT` | `/appointments/:id` | Admin only | `{ status }` | `{ appointment }` | Update appointment status (approve/reject) |

### Product APIs

| Method | Endpoint | Access | Request Body | Response | Purpose |
|---|---|---|---|---|---|
| `GET` | `/products` | Public | — | `[{ products }]` | List all products |
| `POST` | `/products` | Admin only | `{ name, price, description, image }` | `{ product }` | Add a new product |

### Order APIs

| Method | Endpoint | Access | Request Body | Response | Purpose |
|---|---|---|---|---|---|
| `POST` | `/orders` | Authenticated | `{ products, totalAmount }` | `{ order }` | Place a new order |

### Payment APIs

| Method | Endpoint | Access | Request Body | Response | Purpose |
|---|---|---|---|---|---|
| `POST` | `/payments` | Authenticated | `{ amount }` | `{ payment }` | Record a payment |

---

## 7.3 Request and Response Flow

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

---

## 7.4 HTTP Status Codes Used

| Status Code | Meaning | When It's Used |
|---|---|---|
| `200 OK` | Request succeeded | Successful GET, PUT requests |
| `201 Created` | Resource created | Successful POST requests (new user, appointment, order) |
| `400 Bad Request` | Invalid input | Missing required fields, invalid data format |
| `401 Unauthorized` | Not authenticated | No token, invalid token, expired token |
| `403 Forbidden` | Not authorized | User doesn't have the required role |
| `404 Not Found` | Resource not found | Service/product/appointment doesn't exist |
| `500 Internal Server Error` | Server error | Unhandled exceptions, database connection failures |

---

## 7.5 API Features

| Feature | Description |
|---|---|
| **RESTful Architecture** | Standard HTTP methods, resource-based URLs, stateless communication |
| **JSON Communication** | All request bodies and responses use JSON format |
| **Secure Endpoints** | Protected routes require JWT authentication |
| **Role-Based Access** | Admin-only endpoints reject requests from non-admin users |
| **CORS Support** | Cross-Origin Resource Sharing enabled for frontend domain |

---

## 7.6 Sample API Request/Response Examples

### Register a New User
```
POST /auth/register
Content-Type: application/json

{
  "name": "Priya Sharma",
  "email": "priya@example.com",
  "password": "SecurePass123!"
}

Response (201 Created):
{
  "user": {
    "_id": "65abc123...",
    "name": "Priya Sharma",
    "email": "priya@example.com",
    "role": "customer"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Book an Appointment
```
POST /appointments
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJI...

{
  "serviceId": "65def456...",
  "date": "2026-03-15",
  "time": "10:00 AM"
}

Response (201 Created):
{
  "_id": "65ghi789...",
  "userId": "65abc123...",
  "serviceId": "65def456...",
  "date": "2026-03-15T00:00:00.000Z",
  "time": "10:00 AM",
  "status": "pending"
}
```