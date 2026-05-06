# Comprehensive Backend API Testing Script - Simplified

$baseUrl = "https://beauty-parlour-application.onrender.com/api"
$healthUrl = "https://beauty-parlour-application.onrender.com/health"
$loginEmail = "r12@gmail.com"
$loginPassword = "rajeev@12"

# Test results tracking
$testResults = @()

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  BEAUTY PARLOUR - BACKEND API TESTING" -ForegroundColor Cyan
Write-Host "  Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "PHASE 1: Server Health" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri $healthUrl -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
    Write-Host "[PASS] Health Check" -ForegroundColor Green
    Write-Host "  Status: $($response.StatusCode) | Time: ${sw}ms" -ForegroundColor White
    $testResults += @{Name="Health Check"; Status="PASS"; Code=$response.StatusCode}
} catch {
    Write-Host "[FAIL] Health Check: $($_.Exception.Message)" -ForegroundColor Red
    $testResults += @{Name="Health Check"; Status="FAIL"; Code=0}
}

Write-Host ""

# Test 2: Login
Write-Host "PHASE 2: Authentication" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Gray

$loginBody = @{
    email = $loginEmail
    password = $loginPassword
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body $loginBody -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
    $jsonData = $response.Content | ConvertFrom-Json
    $script:authToken = $jsonData.data.token
    $script:userId = $jsonData.data.user._id
    
    Write-Host "[PASS] User Login" -ForegroundColor Green
    Write-Host "  Status: $($response.StatusCode)" -ForegroundColor White
    Write-Host "  User: $($jsonData.data.user.email)" -ForegroundColor Cyan
    Write-Host "  Role: $($jsonData.data.user.role)" -ForegroundColor Cyan
    $testResults += @{Name="Login"; Status="PASS"; Code=$response.StatusCode}
} catch {
    Write-Host "[FAIL] User Login: $($_.Exception.Message)" -ForegroundColor Red
    $testResults += @{Name="Login"; Status="FAIL"; Code=0}
    $script:authToken = $null
}

Write-Host ""

# Test 3: Services
Write-Host "PHASE 3: Services" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/services" -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
    $data = $response.Content | ConvertFrom-Json
    $count = if ($data.data) { $data.data.Count } else { 0 }
    
    Write-Host "[PASS] Get All Services" -ForegroundColor Green
    Write-Host "  Status: $($response.StatusCode)" -ForegroundColor White
    Write-Host "  Found: $count services" -ForegroundColor Cyan
    
    if ($count -gt 0) {
        $script:serviceId = $data.data[0]._id
        Write-Host "  Sample: $($data.data[0].name)" -ForegroundColor Cyan
    }
    
    $testResults += @{Name="Get Services"; Status="PASS"; Code=$response.StatusCode}
} catch {
    Write-Host "[FAIL] Get Services: $($_.Exception.Message)" -ForegroundColor Red
    $testResults += @{Name="Get Services"; Status="FAIL"; Code=0}
}

Write-Host ""

# Test 4: User Profile
Write-Host "PHASE 4: User Profile" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Gray

if ($script:authToken) {
    try {
        $headers = @{"Authorization"="Bearer $($script:authToken)"}
        $response = Invoke-WebRequest -Uri "$baseUrl/users/me" -Headers $headers -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
        $data = $response.Content | ConvertFrom-Json
        
        Write-Host "[PASS] Get My Profile" -ForegroundColor Green
        Write-Host "  Status: $($response.StatusCode)" -ForegroundColor White
        Write-Host "  Email: $($data.data.email)" -ForegroundColor Cyan
        Write-Host "  Name: $($data.data.firstName) $($data.data.lastName)" -ForegroundColor Cyan
        Write-Host "  Phone: $($data.data.phone)" -ForegroundColor Cyan
        
        $testResults += @{Name="Get Profile"; Status="PASS"; Code=$response.StatusCode}
    } catch {
        Write-Host "[FAIL] Get Profile: $($_.Exception.Message)" -ForegroundColor Red
        $testResults += @{Name="Get Profile"; Status="FAIL"; Code=0}
    }
} else {
    Write-Host "[SKIP] Get Profile (Need valid token)" -ForegroundColor Yellow
}

Write-Host ""

# Test 5: Appointments
Write-Host "PHASE 5: Appointments" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Gray

if ($script:authToken) {
    try {
        $headers = @{"Authorization"="Bearer $($script:authToken)"}
        $response = Invoke-WebRequest -Uri "$baseUrl/appointments/my-appointments" -Headers $headers -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
        $data = $response.Content | ConvertFrom-Json
        $count = if ($data.data) { $data.data.Count } else { 0 }
        
        Write-Host "[PASS] Get My Appointments" -ForegroundColor Green
        Write-Host "  Status: $($response.StatusCode)" -ForegroundColor White
        Write-Host "  Total: $count appointments" -ForegroundColor Cyan
        
        $testResults += @{Name="Get Appointments"; Status="PASS"; Code=$response.StatusCode}
    } catch {
        Write-Host "[FAIL] Get Appointments: $($_.Exception.Message)" -ForegroundColor Red
        $testResults += @{Name="Get Appointments"; Status="FAIL"; Code=0}
    }
    
    # Try creating appointment
    if ($script:serviceId) {
        try {
            $futureDate = (Get-Date).AddDays(3).ToString("yyyy-MM-ddT10:00:00Z")
            $apptBody = @{
                serviceId = $script:serviceId
                appointmentDate = $futureDate
                status = "pending"
                notes = "Test appointment"
            } | ConvertTo-Json
            
            $headers = @{"Authorization"="Bearer $($script:authToken)"; "Content-Type"="application/json"}
            $response = Invoke-WebRequest -Uri "$baseUrl/appointments" -Method POST -Headers $headers -Body $apptBody -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
            
            Write-Host "[PASS] Create Appointment" -ForegroundColor Green
            Write-Host "  Status: $($response.StatusCode)" -ForegroundColor White
            
            $testResults += @{Name="Create Appointment"; Status="PASS"; Code=$response.StatusCode}
        } catch {
            Write-Host "[FAIL] Create Appointment: $($_.Exception.Message)" -ForegroundColor Red
            $testResults += @{Name="Create Appointment"; Status="FAIL"; Code=0}
        }
    }
}

Write-Host ""

# Test 6: Products
Write-Host "PHASE 6: Products" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/products" -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
    $data = $response.Content | ConvertFrom-Json
    $count = if ($data.data) { $data.data.Count } else { 0 }
    
    Write-Host "[PASS] Get All Products" -ForegroundColor Green
    Write-Host "  Status: $($response.StatusCode)" -ForegroundColor White
    Write-Host "  Found: $count products" -ForegroundColor Cyan
    
    $testResults += @{Name="Get Products"; Status="PASS"; Code=$response.StatusCode}
} catch {
    Write-Host "[FAIL] Get Products: $($_.Exception.Message)" -ForegroundColor Red
    $testResults += @{Name="Get Products"; Status="FAIL"; Code=0}
}

Write-Host ""

# Test 7: Reviews
Write-Host "PHASE 7: Reviews" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/reviews" -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
    $data = $response.Content | ConvertFrom-Json
    $count = if ($data.data) { $data.data.Count } else { 0 }
    
    Write-Host "[PASS] Get All Reviews" -ForegroundColor Green
    Write-Host "  Status: $($response.StatusCode)" -ForegroundColor White
    Write-Host "  Found: $count reviews" -ForegroundColor Cyan
    
    $testResults += @{Name="Get Reviews"; Status="PASS"; Code=$response.StatusCode}
} catch {
    Write-Host "[FAIL] Get Reviews: $($_.Exception.Message)" -ForegroundColor Red
    $testResults += @{Name="Get Reviews"; Status="FAIL"; Code=0}
}

Write-Host ""

# Test 8: Customers
Write-Host "PHASE 8: Customers" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Gray

if ($script:authToken) {
    try {
        $headers = @{"Authorization"="Bearer $($script:authToken)"}
        $response = Invoke-WebRequest -Uri "$baseUrl/customers" -Headers $headers -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
        $data = $response.Content | ConvertFrom-Json
        $count = if ($data.data) { $data.data.Count } else { 0 }
        
        Write-Host "[PASS] Get Customers" -ForegroundColor Green
        Write-Host "  Status: $($response.StatusCode)" -ForegroundColor White
        Write-Host "  Found: $count customers" -ForegroundColor Cyan
        
        $testResults += @{Name="Get Customers"; Status="PASS"; Code=$response.StatusCode}
    } catch {
        Write-Host "[INFO] Get Customers: $($_.Exception.Message)" -ForegroundColor Yellow
        $testResults += @{Name="Get Customers"; Status="FAIL"; Code=0}
    }
}

Write-Host ""

# Test 9: Error Handling
Write-Host "PHASE 9: Error Handling" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Gray

# Test unauthorized access
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/users/me" -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
    Write-Host "[FAIL] Should have blocked unauthorized access" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode.Value__ -eq 401) {
        Write-Host "[PASS] Unauthorized Access Blocked" -ForegroundColor Green
        Write-Host "  Status: 401 (Expected)" -ForegroundColor White
        $testResults += @{Name="Unauthorized Access"; Status="PASS"; Code=401}
    } else {
        Write-Host "[FAIL] Wrong error code: $($_.Exception.Response.StatusCode.Value__)" -ForegroundColor Red
    }
}

# Test invalid login
$badLoginBody = @{
    email = "wrong@example.com"
    password = "wrongpassword"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body $badLoginBody -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
    Write-Host "[FAIL] Should have rejected invalid credentials" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode.Value__ -eq 401) {
        Write-Host "[PASS] Invalid Credentials Rejected" -ForegroundColor Green
        Write-Host "  Status: 401 (Expected)" -ForegroundColor White
        $testResults += @{Name="Invalid Login"; Status="PASS"; Code=401}
    } else {
        Write-Host "[INFO] Got status: $($_.Exception.Response.StatusCode.Value__)" -ForegroundColor Yellow
    }
}

Write-Host ""

# Summary
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
Write-Host "Failed: $failCount" -ForegroundColor Red
Write-Host "Success Rate: $passPercentage%" -ForegroundColor $(if($passPercentage -ge 80) {'Green'} else {'Yellow'})

Write-Host ""
Write-Host "Test Results:" -ForegroundColor Yellow

$testResults | ForEach-Object {
    $statusSymbol = if ($_.Status -eq "PASS") { "[+]" } else { "[-]" }
    $statusColor = if ($_.Status -eq "PASS") { "Green" } else { "Red" }
    Write-Host "$statusSymbol $($_.Name) | Code: $($_.Code)" -ForegroundColor $statusColor
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Gray
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Use Postman for detailed endpoint testing" -ForegroundColor White
Write-Host "2. Test frontend: https://beauty-parlour-0124.web.app" -ForegroundColor White
Write-Host "3. Test complete user workflow" -ForegroundColor White
Write-Host ""
Write-Host "Test Credentials:" -ForegroundColor Yellow
Write-Host "Email: $loginEmail" -ForegroundColor White
Write-Host "Password: $loginPassword" -ForegroundColor White
Write-Host ""
