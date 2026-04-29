# Beauty Parlour Application Startup Script
# Run with: powershell -ExecutionPolicy Bypass -File start.ps1

$Host.UI.RawUI.WindowTitle = "Beauty Parlour Startup"
$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "  ╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "  ║          BEAUTY PARLOUR APPLICATION STARTUP                   ║" -ForegroundColor Magenta
Write-Host "  ╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Magenta
Write-Host ""

# Step 1: Stop existing processes
Write-Host "[1/4] Stopping existing Node processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "      Done." -ForegroundColor Green
Write-Host ""

# Step 2: Check MongoDB
Write-Host "[2/4] Checking Database Connection..." -ForegroundColor Yellow
$envFile = Get-Content "$PSScriptRoot\backend\.env" -Raw
if ($envFile -match "MONGODB_URI=(.+)") {
    $mongoUri = $matches[1].Trim()
    if ($mongoUri -like "*mongodb+srv*") {
        Write-Host "      Using MongoDB Atlas (Cloud)" -ForegroundColor Cyan
        Write-Host "      Make sure your IP is whitelisted in Atlas!" -ForegroundColor Yellow
    } elseif ($mongoUri -like "*localhost*") {
        Write-Host "      Using Local MongoDB" -ForegroundColor Cyan
        # Check if mongod is running
        $mongoProcess = Get-Process mongod -ErrorAction SilentlyContinue
        if (-not $mongoProcess) {
            Write-Host "      WARNING: MongoDB not running locally!" -ForegroundColor Red
            Write-Host "      Options:" -ForegroundColor Yellow
            Write-Host "        1. Install MongoDB: https://www.mongodb.com/try/download/community" -ForegroundColor Gray
            Write-Host "        2. Use Docker: docker run -d -p 27017:27017 mongo:latest" -ForegroundColor Gray
            Write-Host "        3. Edit .env to use MongoDB Atlas" -ForegroundColor Gray
        } else {
            Write-Host "      MongoDB is running." -ForegroundColor Green
        }
    }
}
Write-Host ""

# Step 3: Start Backend
Write-Host "[3/4] Starting Backend Server..." -ForegroundColor Yellow
$backendPath = "$PSScriptRoot\backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host 'Starting Backend...' -ForegroundColor Cyan; npm run start:dev" -WindowStyle Normal
Write-Host "      Backend starting on http://localhost:3000/api" -ForegroundColor Cyan
Write-Host "      API Docs: http://localhost:3000/api/docs" -ForegroundColor Cyan
Start-Sleep -Seconds 5
Write-Host ""

# Step 4: Start Frontend
Write-Host "[4/4] Starting Frontend Server..." -ForegroundColor Yellow
$frontendPath = "$PSScriptRoot\beauty-parlour"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host 'Starting Frontend...' -ForegroundColor Cyan; ng serve --port 4200 --open" -WindowStyle Normal
Write-Host "      Frontend starting on http://localhost:4200" -ForegroundColor Cyan
Write-Host ""

Write-Host "  ╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "  ║                    STARTUP COMPLETE!                          ║" -ForegroundColor Green
Write-Host "  ╠═══════════════════════════════════════════════════════════════╣" -ForegroundColor Green
Write-Host "  ║  Backend API:    http://localhost:3000/api                    ║" -ForegroundColor White
Write-Host "  ║  API Docs:       http://localhost:3000/api/docs               ║" -ForegroundColor White
Write-Host "  ║  Frontend:       http://localhost:4200                        ║" -ForegroundColor White
Write-Host "  ║  Health Check:   http://localhost:3000/api/health             ║" -ForegroundColor White
Write-Host "  ╠═══════════════════════════════════════════════════════════════╣" -ForegroundColor Green
Write-Host "  ║  Two terminal windows opened for Backend & Frontend.          ║" -ForegroundColor Gray
Write-Host "  ║  Keep them open while using the application.                  ║" -ForegroundColor Gray
Write-Host "  ╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to close this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
