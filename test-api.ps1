# Beauty Parlour API Testing Script
# Run this script to test all endpoints

$baseUrl = "https://beauty-parlour-application.onrender.com/api"
$frontendUrl = "https://beauty-parlour-0124.web.app"

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  BEAUTY PARLOUR - REAL-TIME API TESTING                   ║" -ForegroundColor Cyan
Write-Host "║  Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')                ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  Backend: $baseUrl" -ForegroundColor White
Write-Host "  Frontend: $frontendUrl" -ForegroundColor White
Write-Host ""

# Test 1: Health Check
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "TEST 1: Backend Health Check" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan

try {
    $healthUrl = "https://beauty-parlour-application.onrender.com/health"
    Write-Host "  URL: GET $healthUrl" -ForegroundColor White
    
    $response = Invoke-WebRequest -Uri $healthUrl -UseBasicParsing -TimeoutSec 10
    
    Write-Host "  ✅ Status Code: $($response.StatusCode)" -ForegroundColor Green
    $jsonContent = $response.Content | ConvertFrom-Json
    Write-Host "  ✅ Response: $(($jsonContent | ConvertTo-Json -Compress).Substring(0, 100))..." -ForegroundColor Green
    Write-Host "  ✅ Backend is HEALTHY" -ForegroundColor Green
    
} catch {
    Write-Host "  ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: Login Test
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "TEST 2: User Authentication (Login)" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan

try {
    $loginUrl = "$baseUrl/auth/login"
    Write-Host "  URL: POST $loginUrl" -ForegroundColor White
    
    $loginBody = @{
        email = "r12@gmail.com"
        password = "rajeev@12"
    } | ConvertTo-Json
    
    Write-Host "  Credentials: r12@gmail.com / rajeev@12" -ForegroundColor White
    
    $response = Invoke-WebRequest -Uri $loginUrl `
        -Method POST `
        -Headers @{"Content-Type" = "application/json"} `
        -Body $loginBody `
        -UseBasicParsing `
        -TimeoutSec 10
    
    $jsonData = $response.Content | ConvertFrom-Json
    $token = $jsonData.data.token
    
    Write-Host "  ✅ Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "  ✅ Login Successful" -ForegroundColor Green
    Write-Host "  ✅ Token Received: $($token.Substring(0, 30))..." -ForegroundColor Green
    Write-Host "  ✅ User: $($jsonData.data.user.email)" -ForegroundColor Green
    
    # Save token for next tests
    $script:authToken = $token
    
} catch {
    Write-Host "  ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    $script:authToken = $null
}

Write-Host ""

# Test 3: Get Services
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "TEST 3: Get All Services (No Auth Required)" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan

try {
    $servicesUrl = "$baseUrl/services"
    Write-Host "  URL: GET $servicesUrl" -ForegroundColor White
    
    $response = Invoke-WebRequest -Uri $servicesUrl `
        -UseBasicParsing `
        -TimeoutSec 10
    
    $jsonData = $response.Content | ConvertFrom-Json
    $serviceCount = $jsonData.data.Count
    
    Write-Host "  ✅ Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "  ✅ Services Retrieved: $serviceCount" -ForegroundColor Green
    
    if ($serviceCount -gt 0) {
        $firstService = $jsonData.data[0]
        Write-Host "  ✅ Sample Service: $($firstService.name) - ₹$($firstService.price)" -ForegroundColor Green
        $script:testServiceId = $firstService._id
        Write-Host "  ℹ️  Service ID saved for next tests" -ForegroundColor Cyan
    }
    
} catch {
    Write-Host "  ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 4: Get User Profile
if ($script:authToken) {
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "TEST 4: Get User Profile (Authenticated)" -ForegroundColor Green
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    
    try {
        $profileUrl = "$baseUrl/users/me"
        Write-Host "  URL: GET $profileUrl" -ForegroundColor White
        Write-Host "  Auth: Bearer token" -ForegroundColor White
        
        $response = Invoke-WebRequest -Uri $profileUrl `
            -Headers @{"Authorization" = "Bearer $($script:authToken)"} `
            -UseBasicParsing `
            -TimeoutSec 10
        
        $jsonData = $response.Content | ConvertFrom-Json
        $user = $jsonData.data
        
        Write-Host "  ✅ Status Code: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "  ✅ User Email: $($user.email)" -ForegroundColor Green
        Write-Host "  ✅ User Name: $($user.firstName) $($user.lastName)" -ForegroundColor Green
        Write-Host "  ✅ Role: $($user.role)" -ForegroundColor Green
        
        $script:testUserId = $user._id
        
    } catch {
        Write-Host "  ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
}

# Test 5: Get My Appointments
if ($script:authToken) {
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "TEST 5: Get My Appointments" -ForegroundColor Green
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    
    try {
        $appointmentsUrl = "$baseUrl/appointments/my-appointments"
        Write-Host "  URL: GET $appointmentsUrl" -ForegroundColor White
        
        $response = Invoke-WebRequest -Uri $appointmentsUrl `
            -Headers @{"Authorization" = "Bearer $($script:authToken)"} `
            -UseBasicParsing `
            -TimeoutSec 10
        
        $jsonData = $response.Content | ConvertFrom-Json
        $appointmentCount = $jsonData.data.Count
        
        Write-Host "  ✅ Status Code: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "  ✅ Total Appointments: $appointmentCount" -ForegroundColor Green
        
        if ($appointmentCount -gt 0) {
            $firstAppt = $jsonData.data[0]
            Write-Host "  ✅ Latest Appointment:" -ForegroundColor Green
            Write-Host "     Date: $($firstAppt.appointmentDate)" -ForegroundColor White
            Write-Host "     Status: $($firstAppt.status)" -ForegroundColor White
        } else {
            Write-Host "  ℹ️  No appointments yet" -ForegroundColor Yellow
        }
        
    } catch {
        Write-Host "  ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
}

# Test 6: Get Products
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "TEST 6: Get All Products" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan

try {
    $productsUrl = "$baseUrl/products"
    Write-Host "  URL: GET $productsUrl" -ForegroundColor White
    
    $response = Invoke-WebRequest -Uri $productsUrl `
        -UseBasicParsing `
        -TimeoutSec 10
    
    $jsonData = $response.Content | ConvertFrom-Json
    $productCount = $jsonData.data.Count
    
    Write-Host "  ✅ Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "  ✅ Products Retrieved: $productCount" -ForegroundColor Green
    
    if ($productCount -gt 0) {
        $firstProduct = $jsonData.data[0]
        Write-Host "  ✅ Sample Product: $($firstProduct.name) - ₹$($firstProduct.price)" -ForegroundColor Green
    }
    
} catch {
    Write-Host "  ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 7: Get Reviews
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "TEST 7: Get All Reviews" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan

try {
    $reviewsUrl = "$baseUrl/reviews"
    Write-Host "  URL: GET $reviewsUrl" -ForegroundColor White
    
    $response = Invoke-WebRequest -Uri $reviewsUrl `
        -UseBasicParsing `
        -TimeoutSec 10
    
    $jsonData = $response.Content | ConvertFrom-Json
    $reviewCount = $jsonData.data.Count
    
    Write-Host "  ✅ Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "  ✅ Reviews Retrieved: $reviewCount" -ForegroundColor Green
    
} catch {
    Write-Host "  ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Summary
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  TESTING SUMMARY                                           ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

Write-Host ""
Write-Host "✅ BACKEND TESTING COMPLETE!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Open Browser: $frontendUrl" -ForegroundColor White
Write-Host "  2. Sign In with: r12@gmail.com / rajeev@12" -ForegroundColor White
Write-Host "  3. Browse Services and Book an Appointment" -ForegroundColor White
Write-Host "  4. Check DevTools (F12) for any errors" -ForegroundColor White
Write-Host ""
Write-Host "Postman Testing:" -ForegroundColor Yellow
Write-Host "  1. Import: Beauty-Parlour-Collection.json" -ForegroundColor White
Write-Host "  2. Set environment: base_url = $baseUrl" -ForegroundColor White
Write-Host "  3. Run all tests from the collection" -ForegroundColor White
Write-Host ""
