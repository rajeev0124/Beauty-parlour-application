# Chapter 11: Scalability Analysis

## 11.1 Current Scalability Status

The system as designed is a **modular monolith** — it can handle a single salon's operations well, but it needs adjustments to handle high traffic or multi-salon operations.

---

## 11.2 Horizontal Scaling Strategy

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

---

## 11.3 Layer-by-Layer Scalability

| Layer | Strategy | How |
|---|---|---|
| **Frontend** | CDN Distribution | Angular SPA is served from edge nodes globally. Netlify/Vercel do this automatically. No scaling concern. |
| **Backend** | Horizontal Pod Scaling | Run multiple NestJS instances behind a load balancer (Nginx, AWS ALB, or Kubernetes). Since JWT is stateless, no sticky sessions needed. |
| **Database** | Replica Sets + Sharding | MongoDB Atlas supports automatic replica sets (for read scaling) and sharding (for write scaling). |

---

## 11.4 Performance Optimization Strategies

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

## 11.5 Scaling Milestones

| Users | Infrastructure Changes Needed |
|---|---|
| **1–100** | Single NestJS instance + MongoDB M0 (free tier). No scaling needed. |
| **100–1,000** | Upgrade MongoDB to M10. Add monitoring. Optimize queries with indexes. |
| **1,000–10,000** | Run 2–3 NestJS instances behind a load balancer. Add Redis caching for services/products. |
| **10,000+** | MongoDB sharding. Kubernetes for container orchestration. CDN for all static assets. Consider extracting high-traffic modules into microservices. |

---

## 11.6 Caching Strategy

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │────▶│  NestJS  │────▶│  Redis   │────▶│ MongoDB  │
│          │     │          │     │  Cache   │     │  Atlas   │
│          │◀────│          │◀────│          │◀────│          │
└──────────┘     └──────────┘     └──────────┘     └──────────┘

Cache Strategy:
• Services list  → Cache for 1 hour (rarely changes)
• Products list  → Cache for 30 minutes (prices may change)
• User profile   → Cache for 5 minutes (may update)
• Appointments   → No cache (real-time data)
```
