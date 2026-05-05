# Chapter 12: Risk Analysis

## 12.1 Technical Risks

| # | Risk | Probability | Impact | Description | Mitigation |
|---|---|---|---|---|---|
| 1 | **Single Point of Failure (Backend)** | 🟡 Medium | 🔴 High | If the single NestJS instance crashes, the entire system goes down | Deploy behind a load balancer with health checks and auto-restart (PM2, Docker Compose, or Kubernetes) |
| 2 | **No Error Handling Strategy** | 🟡 Medium | 🟡 Medium | The documentation does not describe global error handling | Implement NestJS Exception Filters for consistent error responses |
| 3 | **No API Versioning** | 🟡 Medium | 🟡 Medium | If the API changes in the future, old clients will break | Use URL-based versioning (e.g., `/api/v1/services`) |
| 4 | **No Testing Strategy Details** | 🟡 Medium | 🔴 High | The plan mentions testing but doesn't detail unit/integration test coverage | Define minimum 80% code coverage, use Jest for unit tests, Supertest for E2E |
| 5 | **Tight Coupling Risk** | 🟢 Low | 🟡 Medium | If modules aren't properly isolated, extracting microservices later becomes difficult | Enforce module boundaries — modules should communicate via injected services only, never import each other's internal files |

---

## 12.2 Security Risks

| # | Risk | Probability | Impact | Description | Mitigation |
|---|---|---|---|---|---|
| 1 | **XSS Attack (Token Theft)** | 🟡 Medium | 🔴 High | Injected JavaScript can steal JWT from localStorage | Move JWT to HttpOnly cookie; implement Content Security Policy (CSP) headers |
| 2 | **Brute-Force Login** | 🔴 High | 🔴 High | No rate limiting = unlimited login attempts | Implement rate limiting on `/auth/login` (max 5 per minute per IP) |
| 3 | **Data Exposure** | 🟡 Medium | 🔴 High | If password field is accidentally returned in API responses | Use `select: false` on password field in Mongoose schema; use response serialization |
| 4 | **Missing HTTPS enforcement** | 🟢 Low | 🟡 Medium | If HTTPS is not enforced, data can be intercepted in transit | Netlify/Vercel auto-enforce HTTPS; ensure backend host also uses HTTPS |
| 5 | **No audit logging** | 🟡 Medium | 🟡 Medium | Impossible to investigate security incidents without logs | Implement structured logging with Winston + user action audit trail |

---

## 12.3 Scalability Risks

| # | Risk | Probability | Impact | Description | Mitigation |
|---|---|---|---|---|---|
| 1 | **MongoDB Free Tier Limits** | 🔴 High | 🟡 Medium | M0 cluster (512MB storage, shared vCPU) will be exhausted quickly with real users | Plan migration to M10+ when user base exceeds ~1000 active users |
| 2 | **Render Free Tier Cold Starts** | 🔴 High | 🟡 Medium | Backend sleeps after 15 mins of inactivity; first request takes ~30 seconds | Use a paid tier or a cron job to keep the backend warm |
| 3 | **No Caching Layer** | 🟡 Medium | 🟡 Medium | Every request hits the database directly | Add Redis as a caching layer for frequently accessed data (services, products) |
| 4 | **Image Storage** | 🟡 Medium | 🟡 Medium | Product images stored on the same server can consume disk space | Use Cloudinary or AWS S3 for image storage with CDN delivery |
| 5 | **No Monitoring** | 🟡 Medium | 🔴 High | Without monitoring, you won't know when the system is approaching limits | Implement APM (Application Performance Monitoring) — e.g., Datadog, New Relic, or free PM2 monitoring |

---

## 12.4 Business Risks

| # | Risk | Probability | Impact | Description | Mitigation |
|---|---|---|---|---|---|
| 1 | **Low User Adoption** | 🟡 Medium | 🔴 High | Salon customers may be unfamiliar with online booking | Provide in-salon training, QR code access, and simple onboarding flow |
| 2 | **Data Loss** | 🟢 Low | 🔴 High | Important customer/appointment data could be lost | Enable MongoDB Atlas automatic backups; implement data export features |
| 3 | **Downtime During Peak Hours** | 🟡 Medium | 🔴 High | System unavailability during busy booking periods | Use auto-scaling, health checks, and redundant deployments |
| 4 | **Regulatory Compliance** | 🟢 Low | 🟡 Medium | Customer data handling may need to comply with data protection laws | Implement data privacy features, consent management, and data deletion capabilities |

---

## 12.5 Risk Matrix Summary

```
                    IMPACT
           Low        Medium       High
         ┌──────────┬──────────┬──────────┐
  High   │          │ DB Limits│ Brute-   │
         │          │ Cold     │ Force    │
Prob.    │          │ Start    │ Login    │
         ├──────────┼──────────┼──────────┤
  Medium │          │ No Error │ XSS      │
         │          │ No API   │ SPOF     │
         │          │ Version  │ No Tests │
         │          │ No Cache │ No Mon.  │
         ├──────────┼──────────┼──────────┤
  Low    │          │ HTTPS    │ Data     │
         │          │ Coupling │ Loss     │
         │          │          │          │
         └──────────┴──────────┴──────────┘
```
