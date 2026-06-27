# 🚀 Beauty Parlour - Production Deployment Script (Windows)
# This script automates the deployment to Render (Backend) and Firebase (Frontend)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "[START] Beauty Parlour Production Deployment" -ForegroundColor Cyan
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host ""

# Helper functions
function Write-Success { param([string]$message); Write-Host "[SUCCESS] $message" -ForegroundColor Green }
function Write-Error { param([string]$message); Write-Host "[ERROR] $message" -ForegroundColor Red; exit 1 }
function Write-Warning { param([string]$message); Write-Host "[WARNING] $message" -ForegroundColor Yellow }
function Write-Info { param([string]$message); Write-Host "[INFO] $message" -ForegroundColor Cyan }
function Write-Step { param([string]$message); Write-Host "`n$message" -ForegroundColor Blue; Write-Host "========================================" -ForegroundColor Blue }

# Step 1: Check Git Status
Write-Step "Step 1: Checking Git Status"
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Warning "Uncommitted changes detected:"
    Write-Host $gitStatus -ForegroundColor Yellow
    Write-Error "Please commit all changes before deploying."
}
Write-Success "Repository clean"

# Step 2: Build Backend
Write-Step "Step 2: Building Backend"
Push-Location "backend"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "Backend build failed"
}
Pop-Location
Write-Success "Backend build successful"

# Step 3: Build Frontend
Write-Step "Step 3: Building Frontend for Production"
Push-Location "beauty-parlour"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "Frontend build failed"
}
Pop-Location
Write-Success "Frontend build successful"

# Step 4: Deploy Backend
Write-Step "Step 4: Deploying Backend to Render"
Write-Info "Render will auto-deploy when you push to main"
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Error "Push to Render failed"
}
Write-Success "Backend pushed to Render"
Write-Warning "Monitor deployment at: https://dashboard.render.com"

# Step 5: Deploy Frontend
Write-Step "Step 5: Deploying Frontend to Firebase"
Push-Location "beauty-parlour"
firebase deploy --only hosting
if ($LASTEXITCODE -ne 0) {
    Write-Error "Firebase deployment failed"
}
Pop-Location
Write-Success "Frontend deployed to Firebase"
Write-Warning "Visit: https://beauty-parlour-0124.web.app"

# Step 6: Verify Deployment
Write-Step "Step 6: Verifying Deployment"
Write-Info "Waiting 30 seconds for services to be ready..."
Start-Sleep -Seconds 30

# Test backend health
Write-Host "Testing backend health..." -NoNewline
try {
    $response = Invoke-WebRequest -Uri "https://beauty-parlour-application.onrender.com/api/health" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Success "Backend health check passed"
    }
} catch {
    Write-Warning "Backend health check returned error (may still be initializing)"
}

# Test frontend
Write-Host "Testing frontend..." -NoNewline
try {
    $response = Invoke-WebRequest -Uri "https://beauty-parlour-0124.web.app" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Success "Frontend is accessible"
    }
} catch {
    Write-Warning "Frontend test returned error"
}

# Final Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "[SUCCESS] Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your Beauty Parlour application is now live:" -ForegroundColor Green
Write-Host ""
Write-Host "Frontend:     " -ForegroundColor Cyan -NoNewline
Write-Host "https://beauty-parlour-0124.web.app" -ForegroundColor White

Write-Host "Backend API:  " -ForegroundColor Cyan -NoNewline
Write-Host "https://beauty-parlour-application.onrender.com/api" -ForegroundColor White

Write-Host "API Docs:     " -ForegroundColor Cyan -NoNewline
Write-Host "https://beauty-parlour-application.onrender.com/api/docs" -ForegroundColor White

Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Visit the frontend and login" -ForegroundColor White
Write-Host "2. Test browsing services and products" -ForegroundColor White
Write-Host "3. Test booking an appointment" -ForegroundColor White
Write-Host "4. Monitor logs for any errors" -ForegroundColor White
Write-Host ""
Write-Host "Dashboard Links:" -ForegroundColor Yellow
Write-Host "- Render:   https://dashboard.render.com" -ForegroundColor Cyan
Write-Host "- Firebase: https://console.firebase.google.com" -ForegroundColor Cyan
Write-Host ""
