# 🚀 How to Start the Beauty Parlour Application

## ⚠️ IMPORTANT: Database Setup Required First!

The application uses MongoDB. You need ONE of these options:

---

## Option 1: MongoDB Atlas (Cloud) - EASIEST ✅

### Step 1: Whitelist Your IP Address
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Log in with:
   - Email: Your MongoDB Atlas email
   - Password: Your password
3. Click **Network Access** in left sidebar
4. Click **+ Add IP Address**
5. Click **"Allow Access From Anywhere"** (adds 0.0.0.0/0)
   - This allows all IPs for development
6. Click **Confirm**

### Step 2: Start the Application
```powershell
# Run this in PowerShell
cd "D:\Beauty parlour application"
.\start.ps1
```
Or double-click `start-all.bat`

---

## Option 2: Local MongoDB with Docker 🐳

### Step 1: Install Docker Desktop
Download from: https://www.docker.com/products/docker-desktop/

### Step 2: Start MongoDB Container
```powershell
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Step 3: Update .env file
Edit `backend\.env` and change:
```
MONGODB_URI=mongodb://localhost:27017/beauty-parlour
```

### Step 4: Start the Application
```powershell
cd "D:\Beauty parlour application"
.\start.ps1
```

---

## Option 3: Install MongoDB Locally

### Step 1: Download MongoDB
https://www.mongodb.com/try/download/community

### Step 2: Install and start MongoDB service

### Step 3: Update .env file
```
MONGODB_URI=mongodb://localhost:27017/beauty-parlour
```

### Step 4: Start the Application
```powershell
cd "D:\Beauty parlour application"
.\start.ps1
```

---

## 🔗 Application URLs (After Starting)

| Service | URL |
|---------|-----|
| Frontend App | http://localhost:4200 |
| Backend API | http://localhost:3000/api |
| API Documentation | http://localhost:3000/api/docs |
| Health Check | http://localhost:3000/api/health |

---

## 🛠️ Troubleshooting

### "Cannot connect to MongoDB Atlas"
- Make sure your IP is whitelisted in Atlas → Network Access

### "Connection refused" error
- Make sure MongoDB is running (local or Docker)
- Check if port 27017 is not blocked by firewall

### Frontend not loading
- Wait 30-60 seconds after starting
- Check if http://localhost:4200 is accessible
