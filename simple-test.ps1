# Simple Beauty Parlour API Testing Script

$baseUrl = "https://beauty-parlour-application.onrender.com/api"
$frontendUrl = "https://beauty-parlour-0124.web.app"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "BEAUTY PARLOUR - API TESTING" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "TEST 1: Backend Health Check" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://beauty-parlour-application.onrender.com/health" -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
    Write-Host "✅ Backend is HEALTHY (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: Login
Write-Host "TEST 2: Authentication (Login)" -ForegroundColor Yellow
try {
    $body = @{ email = "r12@gmail.com"; password = "rajeev@12" } | ConvertTo-Json
    $response = Invoke-WebRequest -Uri "$baseUrl/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body $body -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
    $data = $response.Content | ConvertFrom-Json
    $token = $data.data.token
    
    Write-Host "✅ LOGIN SUCCESSFUL" -ForegroundColor Green
    Write-Host "   User: $($data.data.user.email)" -ForegroundColor White
    Write-Host "   Role: $($data.data.user.role)" -ForegroundColor White
    Write-Host "   Token: $($token.Substring(0,20))..." -ForegroundColor White
    
    $script:token = $token
    $script:userId = $data.data.user._id
} catch {
    Write-Host "❌ Login Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: Services
Write-Host "TEST 3: Get Services" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/services" -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
    $data = $response.Content | ConvertFrom-Json
    $count = $data.data | Measure-Object | Select-Object -ExpandProperty Count
    
    Write-Host "✅ Got $count services" -ForegroundColor Green
    if ($count -gt 0) {
        Write-Host "   First: $($data.data[0].name) - ₹$($data.data[0].price)" -ForegroundColor White
        $script:serviceId = $data.data[0]._id
    }
} catch {
    Write-Host "❌ Services Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 4: User Profile (requires auth)
if ($script:token) {
    Write-Host "TEST 4: Get My Profile" -ForegroundColor Yellow
    try {
        $headers = @{"Authorization"="Bearer $($script:token)"}
        $response = Invoke-WebRequest -Uri "$baseUrl/users/me" -Headers $headers -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
        $data = $response.Content | ConvertFrom-Json
        
        Write-Host "✅ Profile Retrieved" -ForegroundColor Green
        Write-Host "   Email: $($data.data.email)" -ForegroundColor White
        Write-Host "   Name: $($data.data.firstName) $($data.data.lastName)" -ForegroundColor White
        Write-Host "   Phone: $($data.data.phone)" -ForegroundColor White
    } catch {
        Write-Host "❌ Profile Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# Test 5: Appointments (requires auth)
if ($script:token) {
    Write-Host "TEST 5: Get My Appointments" -ForegroundColor Yellow
    try {
        $headers = @{"Authorization"="Bearer $($script:token)"}
        $response = Invoke-WebRequest -Uri "$baseUrl/appointments/my-appointments" -Headers $headers -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
        $data = $response.Content | ConvertFrom-Json
        $count = $data.data | Measure-Object | Select-Object -ExpandProperty Count
        
        Write-Host "✅ Got $count appointments" -ForegroundColor Green
        if ($count -gt 0) {
            Write-Host "   Latest: Date: $($data.data[0].appointmentDate) | Status: $($data.data[0].status)" -ForegroundColor White
        }
    } catch {
        Write-Host "❌ Appointments Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# Test 6: Products
Write-Host "TEST 6: Get Products" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/products" -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
    $data = $response.Content | ConvertFrom-Json
    $count = $data.data | Measure-Object | Select-Object -ExpandProperty Count
    
    Write-Host "✅ Got $count products" -ForegroundColor Green
    if ($count -gt 0) {
        Write-Host "   First: $($data.data[0].name) - ₹$($data.data[0].price)" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Products Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 7: Reviews
Write-Host "TEST 7: Get Reviews" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/reviews" -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
    $data = $response.Content | ConvertFrom-Json
    $count = $data.data | Measure-Object | Select-Object -ExpandProperty Count
    
    Write-Host "✅ Got $count reviews" -ForegroundColor Green
} catch {
    Write-Host "❌ Reviews Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TESTING COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "📱 Next: Test Frontend" -ForegroundColor Yellow
Write-Host "   Open: $frontendUrl" -ForegroundColor White
Write-Host "   Login: r12@gmail.com / rajeev@12" -ForegroundColor White
Write-Host ""
Write-Host "📊 Or Use Postman Collection" -ForegroundColor Yellow
Write-Host "   File: Beauty-Parlour-Collection.json" -ForegroundColor White
Write-Host "   Import & Test all endpoints" -ForegroundColor White
Write-Host ""
