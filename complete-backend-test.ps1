# Complete Backend Testing - With User Registration

$baseUrl = "https://beauty-parlour-application.onrender.com/api"
$testEmail = "testuser$(Get-Random)@beauty.test"
$testPassword = "Test@12345"
$testName = "Test User"
$testPhone = "9876543210"

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  COMPLETE BACKEND TESTING - WITH REGISTRATION" -ForegroundColor Cyan
Write-Host "  Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$testResults = @()

# PHASE 1: Health Check
Write-Host "PHASE 1: Server Health" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri "https://beauty-parlour-application.onrender.com/health" -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
    Write-Host "[PASS] Health Check" -ForegroundColor Green
    Write-Host "  Status: $($response.StatusCode)" -ForegroundColor White
    $testResults += @{Name="Health Check"; Status="PASS"}
} catch {
    Write-Host "[FAIL] Health Check" -ForegroundColor Red
    $testResults += @{Name="Health Check"; Status="FAIL"}
}

Write-Host ""

# PHASE 2: User Registration
Write-Host "PHASE 2: User Registration" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Gray

$regBody = @{
    name = $testName
    email = $testEmail
    password = $testPassword
    phone = $testPhone
} | ConvertTo-Json

Write-Host "Registering new test user..."
Write-Host "Email: $testEmail" -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/auth/register" -Method POST -Headers @{"Content-Type"="application/json"} -Body $regBody -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
    $data = $response.Content | ConvertFrom-Json
    
    Write-Host "[PASS] User Registration" -ForegroundColor Green
    Write-Host "  Status: $($response.StatusCode)" -ForegroundColor White
    Write-Host "  Email: $testEmail" -ForegroundColor Cyan
    
    $testResults += @{Name="Register User"; Status="PASS"}
} catch {
    Write-Host "[FAIL] User Registration: $($_.Exception.Message)" -ForegroundColor Red
    $testResults += @{Name="Register User"; Status="FAIL"}
}

Write-Host ""

# PHASE 3: User Login
Write-Host "PHASE 3: User Authentication" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Gray

$loginBody = @{
    email = $testEmail
    password = $testPassword
} | ConvertTo-Json

Write-Host "Logging in with new account..."

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body $loginBody -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
    $data = $response.Content | ConvertFrom-Json
    $script:authToken = $data.data.token
    $script:userId = if ($data.data.user) { $data.data.user._id } else { $data.data._id }
    
    Write-Host "[PASS] User Login" -ForegroundColor Green
    Write-Host "  Status: $($response.StatusCode)" -ForegroundColor White
    if ($data.data.user) {
        Write-Host "  User: $($data.data.user.email)" -ForegroundColor Cyan
        Write-Host "  Role: $($data.data.user.role)" -ForegroundColor Cyan
    } else {
        Write-Host "  User: $testEmail" -ForegroundColor Cyan
    }
    Write-Host "  Token: ****$($script:authToken.Substring($script:authToken.Length-10))" -ForegroundColor Cyan
    
    $testResults += @{Name="Login User"; Status="PASS"}
} catch {
    Write-Host "[FAIL] User Login: $($_.Exception.Message)" -ForegroundColor Red
    $testResults += @{Name="Login User"; Status="FAIL"}
}

Write-Host ""

# PHASE 4: Services
Write-Host "PHASE 4: Services Endpoint" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/services" -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
    $data = $response.Content | ConvertFrom-Json
    $count = if ($data.data) { $data.data.Count } else { 0 }
    
    Write-Host "[PASS] Get Services" -ForegroundColor Green
    Write-Host "  Status: $($response.StatusCode)" -ForegroundColor White
    Write-Host "  Found: $count services" -ForegroundColor Cyan
    
    if ($count -gt 0) {
        $script:serviceId = $data.data[0]._id
        Write-Host "  Sample: $($data.data[0].name)" -ForegroundColor Cyan
    }
    
    $testResults += @{Name="Get Services"; Status="PASS"}
} catch {
    Write-Host "[FAIL] Get Services: $($_.Exception.Message)" -ForegroundColor Red
    $testResults += @{Name="Get Services"; Status="FAIL"}
}

Write-Host ""

# PHASE 5: Get User Profile (Authenticated)
Write-Host "PHASE 5: User Profile (Authenticated)" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Gray

if ($script:authToken) {
    try {
        $headers = @{"Authorization"="Bearer $($script:authToken)"}
        $response = Invoke-WebRequest -Uri "$baseUrl/users/me" -Headers $headers -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
        $data = $response.Content | ConvertFrom-Json
        
        Write-Host "[PASS] Get Profile" -ForegroundColor Green
        Write-Host "  Status: $($response.StatusCode)" -ForegroundColor White
        Write-Host "  Email: $($data.data.email)" -ForegroundColor Cyan
        Write-Host "  Name: $($data.data.name)" -ForegroundColor Cyan
        
        $testResults += @{Name="Get Profile"; Status="PASS"}
    } catch {
        Write-Host "[FAIL] Get Profile: $($_.Exception.Message)" -ForegroundColor Red
        $testResults += @{Name="Get Profile"; Status="FAIL"}
    }
}

Write-Host ""

# PHASE 6: Get Appointments (Authenticated)
Write-Host "PHASE 6: Appointments (Authenticated)" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Gray

if ($script:authToken) {
    try {
        $headers = @{"Authorization"="Bearer $($script:authToken)"}
        $response = Invoke-WebRequest -Uri "$baseUrl/appointments/my-appointments" -Headers $headers -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
        $data = $response.Content | ConvertFrom-Json
        $count = if ($data.data) { $data.data.Count } else { 0 }
        
        Write-Host "[PASS] Get Appointments" -ForegroundColor Green
        Write-Host "  Status: $($response.StatusCode)" -ForegroundColor White
        Write-Host "  Total: $count appointments" -ForegroundColor Cyan
        
        $testResults += @{Name="Get Appointments"; Status="PASS"}
    } catch {
        Write-Host "[FAIL] Get Appointments: $($_.Exception.Message)" -ForegroundColor Red
        $testResults += @{Name="Get Appointments"; Status="FAIL"}
    }
}

Write-Host ""

# PHASE 7: Create Appointment (Authenticated)
Write-Host "PHASE 7: Create Appointment (Authenticated)" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Gray

if ($script:authToken -and $script:serviceId) {
    try {
        $futureDate = (Get-Date).AddDays(5).ToString("yyyy-MM-ddT10:00:00Z")
        $apptBody = @{
            serviceId = $script:serviceId
            appointmentDate = $futureDate
            status = "pending"
            notes = "Test appointment from automated testing"
        } | ConvertTo-Json
        
        $headers = @{"Authorization"="Bearer $($script:authToken)"; "Content-Type"="application/json"}
        $response = Invoke-WebRequest -Uri "$baseUrl/appointments" -Method POST -Headers $headers -Body $apptBody -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
        $data = $response.Content | ConvertFrom-Json
        
        Write-Host "[PASS] Create Appointment" -ForegroundColor Green
        Write-Host "  Status: $($response.StatusCode)" -ForegroundColor White
        Write-Host "  Date: $futureDate" -ForegroundColor Cyan
        Write-Host "  Status: Pending" -ForegroundColor Cyan
        
        $script:appointmentId = $data.data._id
        
        $testResults += @{Name="Create Appointment"; Status="PASS"}
    } catch {
        Write-Host "[FAIL] Create Appointment: $($_.Exception.Message)" -ForegroundColor Red
        $testResults += @{Name="Create Appointment"; Status="FAIL"}
    }
}

Write-Host ""

# PHASE 8: Products
Write-Host "PHASE 8: Products" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/products" -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
    $data = $response.Content | ConvertFrom-Json
    $count = if ($data.data) { $data.data.Count } else { 0 }
    
    Write-Host "[PASS] Get Products" -ForegroundColor Green
    Write-Host "  Status: $($response.StatusCode)" -ForegroundColor White
    Write-Host "  Found: $count products" -ForegroundColor Cyan
    
    $testResults += @{Name="Get Products"; Status="PASS"}
} catch {
    Write-Host "[FAIL] Get Products: $($_.Exception.Message)" -ForegroundColor Red
    $testResults += @{Name="Get Products"; Status="FAIL"}
}

Write-Host ""

# PHASE 9: Reviews
Write-Host "PHASE 9: Reviews (Public)" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/reviews" -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
    $data = $response.Content | ConvertFrom-Json
    $count = if ($data.data) { $data.data.Count } else { 0 }
    
    Write-Host "[PASS] Get Reviews" -ForegroundColor Green
    Write-Host "  Status: $($response.StatusCode)" -ForegroundColor White
    Write-Host "  Found: $count reviews" -ForegroundColor Cyan
    
    $testResults += @{Name="Get Reviews"; Status="PASS"}
} catch {
    Write-Host "[FAIL] Get Reviews: $($_.Exception.Message)" -ForegroundColor Red
    $testResults += @{Name="Get Reviews"; Status="FAIL"}
}

Write-Host ""

# PHASE 10: Create Review (Authenticated)
Write-Host "PHASE 10: Create Review (Authenticated)" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Gray

if ($script:authToken -and $script:serviceId) {
    try {
        $reviewBody = @{
            serviceId = $script:serviceId
            rating = 5
            comment = "Excellent service from automated testing"
        } | ConvertTo-Json
        
        $headers = @{"Authorization"="Bearer $($script:authToken)"; "Content-Type"="application/json"}
        $response = Invoke-WebRequest -Uri "$baseUrl/reviews" -Method POST -Headers $headers -Body $reviewBody -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
        
        Write-Host "[PASS] Create Review" -ForegroundColor Green
        Write-Host "  Status: $($response.StatusCode)" -ForegroundColor White
        Write-Host "  Rating: 5 stars" -ForegroundColor Cyan
        
        $testResults += @{Name="Create Review"; Status="PASS"}
    } catch {
        Write-Host "[FAIL] Create Review: $($_.Exception.Message)" -ForegroundColor Red
        $testResults += @{Name="Create Review"; Status="FAIL"}
    }
}

Write-Host ""

# PHASE 11: Security Tests
Write-Host "PHASE 11: Security" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Gray

# Test unauthorized access
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/users/me" -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
    Write-Host "[FAIL] Should block unauthorized access" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode.Value__ -eq 401) {
        Write-Host "[PASS] Unauthorized Access Blocked" -ForegroundColor Green
        $testResults += @{Name="Unauthorized Blocked"; Status="PASS"}
    }
}

Write-Host ""

# SUMMARY
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  TEST SUMMARY" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

$passCount = ($testResults | Where-Object {$_.Status -eq "PASS"}).Count
$failCount = ($testResults | Where-Object {$_.Status -eq "FAIL"}).Count
$totalCount = $testResults.Count
$passPercentage = if ($totalCount -gt 0) { [math]::Round(($passCount / $totalCount) * 100, 0) } else { 0 }

Write-Host ""
Write-Host "Total Tests: $totalCount" -ForegroundColor White
Write-Host "Passed: $passCount" -ForegroundColor Green
Write-Host "Failed: $failCount" -ForegroundColor $(if ($failCount -eq 0) {'Green'} else {'Red'})
Write-Host "Success Rate: $passPercentage%" -ForegroundColor $(if ($passPercentage -ge 90) {'Green'} else {'Yellow'})

Write-Host ""
Write-Host "Test Results:" -ForegroundColor Yellow

$testResults | ForEach-Object {
    $statusSymbol = if ($_.Status -eq "PASS") { "[+]" } else { "[-]" }
    $statusColor = if ($_.Status -eq "PASS") { "Green" } else { "Red" }
    Write-Host "$statusSymbol $($_.Name)" -ForegroundColor $statusColor
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Gray
Write-Host ""
Write-Host "Test Account Created:" -ForegroundColor Cyan
Write-Host "  Email: $testEmail" -ForegroundColor White
Write-Host "  Password: $testPassword" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Test frontend with these credentials" -ForegroundColor White
Write-Host "2. Visit: https://beauty-parlour-0124.web.app" -ForegroundColor White
Write-Host "3. Sign in with the test account" -ForegroundColor White
Write-Host "4. Complete full user workflow" -ForegroundColor White
Write-Host ""
