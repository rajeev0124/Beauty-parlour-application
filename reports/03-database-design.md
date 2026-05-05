# Chapter 3: Database Design

## 3.1 Database Platform

**MongoDB Atlas** — a cloud-hosted, fully managed NoSQL document database.

### Why MongoDB over SQL (like MySQL/PostgreSQL)?

| Factor | MongoDB (Chosen) | SQL Database |
|---|---|---|
| **Schema flexibility** | Documents can have different shapes. Easy to add new fields without migrations. | Rigid schema — adding a column requires ALTER TABLE migration. |
| **Data model** | Stores JSON-like documents. Natural fit for JavaScript/TypeScript. | Stores rows and tables. Requires ORM mapping. |
| **Scalability** | Native horizontal scaling via sharding. | Horizontal scaling is complex and often requires third-party tools. |
| **Speed for this use case** | Appointments, products, and orders are self-contained documents — reads are fast with no JOINs. | Would require JOINs across multiple tables, which can be slower. |

---

## 3.2 Collections (Tables) and Their Fields

### Collection 1: `users`
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

### Collection 2: `services`
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

### Collection 3: `appointments`
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

### Collection 4: `products`
```
{
  _id:         ObjectId      → Auto-generated unique identifier
  name:        String        → Product name (e.g., "Lakmé Face Wash")
  price:       Number        → Product price
  description: String        → Product description
  image:       String        → URL or path to product image
}
```

### Collection 5: `orders`
```
{
  _id:          ObjectId     → Auto-generated unique identifier
  userId:       ObjectId     → Reference to the customer (FK to users._id)
  products:     Array        → Array of product IDs and quantities
  totalAmount:  Number       → Calculated total price
}
```

### Collection 6: `payments`
```
{
  _id:            ObjectId   → Auto-generated unique identifier
  userId:         ObjectId   → Reference to the user who paid (FK to users._id)
  amount:         Number     → Payment amount
  paymentStatus:  String     → "pending" | "completed" | "failed" | "refunded"
}
```

---

## 3.3 Relationships Between Collections

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

### Relationships Explained:
- One **User** can have many **Appointments** (1:Many)
- One **Service** can appear in many **Appointments** (1:Many)
- One **User** can have many **Orders** (1:Many)
- One **Order** can reference many **Products** (Many:Many via embedded array)
- One **User** can have many **Payments** (1:Many)
- Each **Order** generates one **Payment** (1:1)

---

## 3.4 Recommended Indexing Strategy

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

## 3.5 Database Features

- **NoSQL Flexible Schema** — documents can have different shapes; easy to evolve over time
- **Horizontal Scalability** — MongoDB Atlas supports replica sets and sharding for data distribution
- **High Performance** — self-contained documents eliminate the need for JOINs
- **Cloud Hosting** — MongoDB Atlas handles backups, monitoring, and scaling automatically
- **Free Tier** — M0 cluster (512 MB) is suitable for development and small-scale production
- **Mongoose ODM** — provides schema validation, middleware hooks, and query building in TypeScript