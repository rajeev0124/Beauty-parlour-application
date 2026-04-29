# 🚀 Deployment Guide - Beauty Parlour Application

## Overview

This guide will help you deploy the Beauty Parlour application to the cloud.

| Component | Platform | URL |
|-----------|----------|-----|
| Frontend | Vercel | https://beauty-parlour.vercel.app |
| Backend | Render | https://beauty-parlour-api.onrender.com |
| Database | MongoDB Atlas | Already configured ✅ |

---

## Step 1: Push Code to GitHub

```bash
cd "D:\Beauty parlour application"
git init  # If not already initialized
git add .
git commit -m "Initial commit - Beauty Parlour Application"
git remote add origin https://github.com/YOUR_USERNAME/beauty-parlour.git
git push -u origin main
```

---

## Step 2: Deploy Backend to Render

### 2.1 Create Render Account
1. Go to https://render.com
2. Sign up with GitHub account

### 2.2 Create New Web Service
1. Click "New" → "Web Service"
2. Connect your GitHub repository
3. Select the `backend` folder as root directory
4. Configure:
   - **Name**: `beauty-parlour-api`
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`
   - **Plan**: Free

### 2.3 Add Environment Variables
In Render Dashboard → Environment → Add the following:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `MONGODB_URI` | `mongodb+srv://beautyadmin:Beauty-parlour@beauty-parlour-cluster.q2pjx8q.mongodb.net/beauty-parlour?retryWrites=true&w=majority` |
| `JWT_SECRET` | `your-secure-jwt-secret-here` |
| `JWT_EXPIRES_IN` | `7d` |
| `JWT_REFRESH_SECRET` | `your-secure-refresh-secret-here` |
| `JWT_REFRESH_EXPIRES_IN` | `30d` |
| `CORS_ORIGINS` | `https://beauty-parlour.vercel.app` |

### 2.4 Deploy
Click "Create Web Service" and wait for deployment (~5-10 minutes)

**Your Backend URL**: `https://beauty-parlour-api.onrender.com`

---

## Step 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub account

### 3.2 Import Project
1. Click "Add New" → "Project"
2. Import your GitHub repository
3. Select the `beauty-parlour` folder as root directory

### 3.3 Configure Build Settings
- **Framework Preset**: Angular
- **Build Command**: `npm run build`
- **Output Directory**: `dist/beauty-parlour/browser`

### 3.4 Update API URL
Before deploying, update `environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://beauty-parlour-api.onrender.com/api'
};
```

### 3.5 Deploy
Click "Deploy" and wait (~2-5 minutes)

**Your Frontend URL**: `https://beauty-parlour.vercel.app`

---

## Step 4: Update CORS (Important!)

After getting your Vercel URL, update Render environment:

1. Go to Render Dashboard → Your Service → Environment
2. Update `CORS_ORIGINS` to include your Vercel URL:
   ```
   https://beauty-parlour.vercel.app,https://your-custom-domain.com
   ```
3. Click "Save Changes" - Render will auto-redeploy

---

## Step 5: Test Your Deployment

1. Open your Vercel URL: `https://beauty-parlour.vercel.app`
2. Try to login/register
3. Test all features

### API Health Check
```
https://beauty-parlour-api.onrender.com/api/health
```

### Swagger Docs
```
https://beauty-parlour-api.onrender.com/api/docs
```

---

## Common Issues & Solutions

### Issue: CORS Error
**Solution**: Make sure `CORS_ORIGINS` in Render includes your Vercel URL

### Issue: Database Connection Failed
**Solution**: 
1. Check MongoDB Atlas → Network Access → Ensure 0.0.0.0/0 is added
2. Verify `MONGODB_URI` in Render environment variables

### Issue: 404 on Page Refresh
**Solution**: Vercel config already handles this via `vercel.json` routes

### Issue: Slow First Load
**Note**: Render free tier sleeps after 15 minutes of inactivity. First request takes ~30 seconds to wake up.

---

## Custom Domain (Optional)

### For Vercel (Frontend):
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed

### For Render (Backend):
1. Go to Service Settings → Custom Domains
2. Add your domain
3. Update DNS records as instructed

---

## Environment Variables Summary

### Backend (Render)
```env
NODE_ENV=production
PORT=3000
MONGODB_URI=your-mongodb-atlas-uri
JWT_SECRET=your-secure-secret
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-secure-refresh-secret
JWT_REFRESH_EXPIRES_IN=30d
CORS_ORIGINS=https://your-vercel-url.vercel.app
```

### Frontend (Vercel)
No environment variables needed - API URL is in `environment.prod.ts`

---

## 🎉 Done!

Your application is now live and accessible from anywhere!

**Share these URLs:**
- 🌐 **App**: https://beauty-parlour.vercel.app
- 📚 **API Docs**: https://beauty-parlour-api.onrender.com/api/docs
