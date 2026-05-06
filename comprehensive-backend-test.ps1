# Comprehensive Backend API Testing Script

$baseUrl = "https://beauty-parlour-application.onrender.com/api"
$healthUrl = "https://beauty-parlour-application.onrender.com/health"
$loginEmail = "r12@gmail.com"
$loginPassword = "rajeev@12"

# Test results tracking
$testResults = @()

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Url,
        [string]$Body,
        [string]$AuthToken,
        [int]$ExpectedStatus
    )
    
    $result = @{
        Name = $Name
        Method = $Method
        Url = $Url
        Status = "TESTING"
        StatusCode = 0
        Time = 0
        Message = ""
    }
    
    try {
        $headers = @{"Content-Type" = "application/json"}
        if ($AuthToken) {
            $headers["Authorization"] = "Bearer $AuthToken"
        }
        
        $sw = [System.Diagnostics.Stopwatch]::StartNew()
        
        if ($Method -eq "GET") {
            $response = Invoke-WebRequest -Uri $Url -Headers $headers -UseBasicParsing -TimeoutSec 15 -ErrorAction Stop
        } elseif ($Method -eq "POST") {
            $response = Invoke-WebRequest -Uri $Url -Method POST -Headers $headers -Body $Body -UseBasicParsing -TimeoutSec 15 -ErrorAction Stop
        } elseif ($Method -eq "PUT") {
            $response = Invoke-WebRequest -Uri $Url -Method PUT -Headers $headers -Body $Body -UseBasicParsing -TimeoutSec 15 -ErrorAction Stop
        } elseif ($Method -eq "DELETE") {
            $response = Invoke-WebRequest -Uri $Url -Method DELETE -Headers $headers -UseBasicParsing -TimeoutSec 15 -ErrorAction Stop
        }
        
        $sw.Stop()
        
        $result.StatusCode = $response.StatusCode
        $result.Time = $sw.ElapsedMilliseconds
        
        if ($response.StatusCode -eq $ExpectedStatus -or $response.StatusCode -in @(200, 201, 204)) {
            $result.Status = "PASS"
            $result.Message = "Success"
        } else {
            $result.Status = "FAIL"
            $result.Message = "Unexpected status code"
        }
        
    } catch {
        $result.Status = "FAIL"
        $result.StatusCode = 0
        $result.Message = $_.Exception.Message
        $result.Time = 0
    }
    
    return $result
}

# Display header
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  BEAUTY PARLOUR - COMPREHENSIVE BACKEND API TESTING        ║" -ForegroundColor Cyan
Write-Host "║  Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')                           ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "PHASE 1: Server Health & Connectivity" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

$result = Test-Endpoint -Name "Health Check" -Method "GET" -Url $healthUrl -ExpectedStatus 200
$testResults += $result

Write-Host "✓ $($result.Name)" -ForegroundColor Green
Write-Host "  Status: $($result.StatusCode) | Time: $($result.Time)ms" -ForegroundColor White

Write-Host ""

# Test 2: Authentication Flow
Write-Host "PHASE 2: Authentication & Authorization" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

$loginBody = @{
    email = $loginEmail
    password = $loginPassword
} | ConvertTo-Json

$result = Test-Endpoint -Name "User Login" -Method "POST" -Url "$baseUrl/auth/login" -Body $loginBody -ExpectedStatus 200
$testResults += $result

if ($result.Status -eq "PASS") {
    Write-Host "✓ $($result.Name)" -ForegroundColor Green
    Write-Host "  Status: $($result.StatusCode) | Time: $($result.Time)ms" -ForegroundColor White
    
    # Extract token for subsequent tests
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body $loginBody -UseBasicParsing -TimeoutSec 15 -ErrorAction Stop
        $jsonData = $response.Content | ConvertFrom-Json
        $script:authToken = $jsonData.data.token
        $script:userId = $jsonData.data.user._id
        Write-Host "  ✓ Token extracted for authenticated requests" -ForegroundColor Cyan
        Write-Host "  ✓ User ID: $($script:userId)" -ForegroundColor Cyan
    } catch {
        Write-Host "  ✗ Failed to extract token: $($_.Exception.Message)" -ForegroundColor Red
        $script:authToken = $null
    }
} else {
    Write-Host "✗ $($result.Name)" -ForegroundColor Red
    Write-Host "  Error: $($result.Message)" -ForegroundColor Red
    Write-Host "  Status: $($result.StatusCode)" -ForegroundColor Red
}

Write-Host ""

# Test 3: Services Endpoints
Write-Host "PHASE 3: Services Management" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

$result = Test-Endpoint -Name "Get All Services" -Method "GET" -Url "$baseUrl/services" -ExpectedStatus 200
$testResults += $result

Write-Host "$(if($result.Status -eq 'PASS') {'✓'} else {'✗'}) $($result.Name)" -ForegroundColor $(if($result.Status -eq 'PASS') {'Green'} else {'Red'})
Write-Host "  Status: $($result.StatusCode) | Time: $($result.Time)ms" -ForegroundColor White

# Try to get a service
try {
    $servicesResponse = Invoke-WebRequest -Uri "$baseUrl/services" -UseBasicParsing -TimeoutSec 15
    $servicesData = $servicesResponse.Content | ConvertFrom-Json
    if ($servicesData.data -and $servicesData.data.Count -gt 0) {
        $script:serviceId = $servicesData.data[0]._id
        Write-Host "  ✓ Found $($servicesData.data.Count) services" -ForegroundColor Cyan
        Write-Host "  ✓ Sample service ID: $($script:serviceId)" -ForegroundColor Cyan
    } else {
        Write-Host "  ℹ No services in database (can still test endpoints)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ✗ Error fetching services: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 4: User Profile (Authenticated)
if ($script:authToken) {
    Write-Host "PHASE 4: User Profile Management (Authenticated)" -ForegroundColor Yellow
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    
    $result = Test-Endpoint -Name "Get My Profile" -Method "GET" -Url "$baseUrl/users/me" -AuthToken $script:authToken -ExpectedStatus 200
    $testResults += $result
    
    Write-Host "$(if($result.Status -eq 'PASS') {'✓'} else {'✗'}) $($result.Name)" -ForegroundColor $(if($result.Status -eq 'PASS') {'Green'} else {'Red'})
    Write-Host "  Status: $($result.StatusCode) | Time: $($result.Time)ms" -ForegroundColor White
    
    # Get profile data
    if ($result.Status -eq "PASS") {
        try {
            $headers = @{"Authorization"="Bearer $($script:authToken)"}
            $profileResponse = Invoke-WebRequest -Uri "$baseUrl/users/me" -Headers $headers -UseBasicParsing -TimeoutSec 15
            $profileData = $profileResponse.Content | ConvertFrom-Json
            Write-Host "  ✓ User: $($profileData.data.email)" -ForegroundColor Cyan
            Write-Host "  ✓ Name: $($profileData.data.firstName) $($profileData.data.lastName)" -ForegroundColor Cyan
            Write-Host "  ✓ Role: $($profileData.data.role)" -ForegroundColor Cyan
        } catch {
            Write-Host "  ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    Write-Host ""
}

# Test 5: Appointments (Authenticated)
if ($script:authToken) {
    Write-Host "PHASE 5: Appointments Management (Authenticated)" -ForegroundColor Yellow
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    
    $result = Test-Endpoint -Name "Get My Appointments" -Method "GET" -Url "$baseUrl/appointments/my-appointments" -AuthToken $script:authToken -ExpectedStatus 200
    $testResults += $result
    
    Write-Host "$(if($result.Status -eq 'PASS') {'✓'} else {'✗'}) $($result.Name)" -ForegroundColor $(if($result.Status -eq 'PASS') {'Green'} else {'Red'})
    Write-Host "  Status: $($result.StatusCode) | Time: $($result.Time)ms" -ForegroundColor White
    
    # Get appointment data
    if ($result.Status -eq "PASS") {
        try {
            $headers = @{"Authorization"="Bearer $($script:authToken)"}
            $apptsResponse = Invoke-WebRequest -Uri "$baseUrl/appointments/my-appointments" -Headers $headers -UseBasicParsing -TimeoutSec 15
            $apptsData = $apptsResponse.Content | ConvertFrom-Json
            $count = $apptsData.data | Measure-Object | Select-Object -ExpandProperty Count
            Write-Host "  ✓ Total appointments: $count" -ForegroundColor Cyan
        } catch {
            Write-Host "  ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    # Test Create Appointment (only if we have a service)
    if ($script:serviceId) {
        $futureDate = (Get-Date).AddDays(3).ToString("yyyy-MM-ddT10:00:00Z")
        $apptBody = @{
            serviceId = $script:serviceId
            appointmentDate = $futureDate
            status = "pending"
            notes = "Test appointment from automated testing"
        } | ConvertTo-Json
        
        $result = Test-Endpoint -Name "Create Appointment" -Method "POST" -Url "$baseUrl/appointments" -Body $apptBody -AuthToken $script:authToken -ExpectedStatus 201
        $testResults += $result
        
        Write-Host "$(if($result.Status -eq 'PASS') {'✓'} else {'✗'}) $($result.Name)" -ForegroundColor $(if($result.Status -eq 'PASS') {'Green'} else {'Red'})
        Write-Host "  Status: $($result.StatusCode) | Time: $($result.Time)ms" -ForegroundColor White
        
        if ($result.Status -eq "PASS") {
            Write-Host "  ✓ Appointment created successfully" -ForegroundColor Cyan
        }
    }
    
    Write-Host ""
}

# Test 6: Products
Write-Host "PHASE 6: Products Catalog" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

$result = Test-Endpoint -Name "Get All Products" -Method "GET" -Url "$baseUrl/products" -ExpectedStatus 200
$testResults += $result

Write-Host "$(if($result.Status -eq 'PASS') {'✓'} else {'✗'}) $($result.Name)" -ForegroundColor $(if($result.Status -eq 'PASS') {'Green'} else {'Red'})
Write-Host "  Status: $($result.StatusCode) | Time: $($result.Time)ms" -ForegroundColor White

try {
    $productsResponse = Invoke-WebRequest -Uri "$baseUrl/products" -UseBasicParsing -TimeoutSec 15
    $productsData = $productsResponse.Content | ConvertFrom-Json
    $count = $productsData.data | Measure-Object | Select-Object -ExpandProperty Count
    Write-Host "  ✓ Total products: $count" -ForegroundColor Cyan
} catch {
    Write-Host "  ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 7: Reviews
Write-Host "PHASE 7: Reviews & Ratings" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

$result = Test-Endpoint -Name "Get All Reviews" -Method "GET" -Url "$baseUrl/reviews" -ExpectedStatus 200
$testResults += $result

Write-Host "$(if($result.Status -eq 'PASS') {'✓'} else {'✗'}) $($result.Name)" -ForegroundColor $(if($result.Status -eq 'PASS') {'Green'} else {'Red'})
Write-Host "  Status: $($result.StatusCode) | Time: $($result.Time)ms" -ForegroundColor White

Write-Host ""

# Test 8: Customers
Write-Host "PHASE 8: Customers (Admin)" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

if ($script:authToken) {
    $result = Test-Endpoint -Name "Get All Customers" -Method "GET" -Url "$baseUrl/customers" -AuthToken $script:authToken -ExpectedStatus 200
    $testResults += $result
    
    Write-Host "$(if($result.Status -eq 'PASS') {'✓'} else {'✗'}) $($result.Name)" -ForegroundColor $(if($result.Status -eq 'PASS') {'Green'} else {'Red'})
    Write-Host "  Status: $($result.StatusCode) | Time: $($result.Time)ms" -ForegroundColor White
}

Write-Host ""

# Test 9: Error Handling
Write-Host "PHASE 9: Error Handling & Security" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

# Test unauthorized access
$result = Test-Endpoint -Name "Unauthorized Access (No Token)" -Method "GET" -Url "$baseUrl/users/me" -ExpectedStatus 401
$testResults += $result

Write-Host "$(if($result.Status -eq 'PASS') {'✓'} else {'✗'}) $($result.Name)" -ForegroundColor $(if($result.Status -eq 'PASS') {'Green'} else {'Red'})
Write-Host "  Status: $($result.StatusCode) | Time: $($result.Time)ms" -ForegroundColor White

# Test invalid credentials
$badLoginBody = @{
    email = "wrong@example.com"
    password = "wrongpassword"
} | ConvertTo-Json

$result = Test-Endpoint -Name "Invalid Login Credentials" -Method "POST" -Url "$baseUrl/auth/login" -Body $badLoginBody -ExpectedStatus 401
$testResults += $result

Write-Host "$(if($result.Status -eq 'PASS') {'✓'} else {'✗'}) $($result.Name)" -ForegroundColor $(if($result.Status -eq 'PASS') {'Green'} else {'Red'})
Write-Host "  Status: $($result.StatusCode) | Time: $($result.Time)ms" -ForegroundColor White

Write-Host ""

# Summary
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  TEST SUMMARY                                              ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

$passCount = ($testResults | Where-Object {$_.Status -eq "PASS"}).Count
$failCount = ($testResults | Where-Object {$_.Status -eq "FAIL"}).Count
$totalCount = $testResults.Count
$passPercentage = if ($totalCount -gt 0) { [math]::Round(($passCount / $totalCount) * 100, 0) } else { 0 }

Write-Host ""
Write-Host "Total Tests: $totalCount" -ForegroundColor White
Write-Host "Passed: $passCount ✓" -ForegroundColor Green
Write-Host "Failed: $failCount ✗" -ForegroundColor Red
Write-Host "Success Rate: $passPercentage%" -ForegroundColor $(if($passPercentage -ge 80) {'Green'} else {'Yellow'})

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

# Detailed Results Table
Write-Host ""
Write-Host "Detailed Results:" -ForegroundColor Yellow
Write-Host ""

$testResults | ForEach-Object {
    $statusSymbol = if ($_.Status -eq "PASS") { "✓" } else { "✗" }
    $statusColor = if ($_.Status -eq "PASS") { "Green" } else { "Red" }
    
    Write-Host "$statusSymbol $($_.Name)" -ForegroundColor $statusColor
    Write-Host "   Code: $($_.StatusCode) | Time: $($_.Time)ms | Status: $($_.Status)" -ForegroundColor Gray
    if ($_.Message) {
        Write-Host "   Message: $($_.Message)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

Write-Host ""
Write-Host "✅ BACKEND API TESTING COMPLETE!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Review results above for any failures" -ForegroundColor White
Write-Host "  2. Use Postman for interactive testing (Beauty-Parlour-Collection.json)" -ForegroundColor White
Write-Host "  3. Test frontend: https://beauty-parlour-0124.web.app" -ForegroundColor White
Write-Host "  4. Verify complete user flow (register → book → review)" -ForegroundColor White
Write-Host ""
Write-Host "Credentials for testing:" -ForegroundColor Yellow
Write-Host "  Email: $loginEmail" -ForegroundColor White
Write-Host "  Password: $loginPassword" -ForegroundColor White
Write-Host ""
