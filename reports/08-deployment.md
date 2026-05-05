# Chapter 8: Deployment Architecture

## 8.1 Production Deployment Overview

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

---

## 8.2 Frontend Deployment (Angular)

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

---

## 8.3 Backend Deployment (NestJS)

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

---

## 8.4 Database Deployment (MongoDB Atlas)

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

## 8.5 Environment Variables

| Variable | Purpose | Example Value |
|---|---|---|
| `MONGO_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/salon` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `your-super-secret-key-here` |
| `PORT` | Backend server port | `3000` |
| `NODE_ENV` | Environment mode | `production` |
| `API_BASE_URL` | Backend URL (used by frontend) | `https://api.salon.com` |

---

## 8.6 Production Checklist

- [ ] Build Angular project with production configuration
- [ ] Build NestJS project (TypeScript → JavaScript)
- [ ] Set up MongoDB Atlas cluster with proper network access
- [ ] Configure all environment variables on hosting platforms
- [ ] Enable HTTPS on both frontend and backend
- [ ] Configure CORS to allow only the frontend domain
- [ ] Test all API endpoints from the deployed frontend
- [ ] Set up monitoring and alerting
- [ ] Configure automatic backups for MongoDB
- [ ] Document deployment URLs for the team