# Beauty Parlour Application - Comprehensive API Test Suite
# Run this script to test all endpoints

$baseUrl = "http://localhost:3000/api"
$testResults = @()
$authToken = ""
$refreshToken = ""

# Test helper function
function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Url,
        [object]$Body = $null,
        [hashtable]$Headers = @{},
        [int]$ExpectedStatus = 200
    )
    
    $result = @{
        Name = $Name
        Method = $Method
        Url = $Url
        Status = "PENDING"
        StatusCode = 0
        Response = $null
        Error = $null
    }
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            ContentType = "application/json"
            UseBasicParsing = $true
        }
        
        if ($Headers.Count -gt 0) {
            $params.Headers = $Headers
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-WebRequest @params -ErrorAction Stop
        $result.StatusCode = $response.StatusCode
        $result.Response = $response.Content | ConvertFrom-Json -ErrorAction SilentlyContinue
        
        if ($response.StatusCode -eq $ExpectedStatus -or $response.StatusCode -in @(200, 201)) {
            $result.Status = "PASS"
        } else {
            $result.Status = "FAIL"
        }
    }
    catch {
        $result.Status = "FAIL"
        $result.Error = $_.Exception.Message
        if ($_.Exception.Response) {
            $result.StatusCode = [int]$_.Exception.Response.StatusCode
        }
    }
    
    # Print result
    $color = if ($result.Status -eq "PASS") { "Green" } else { "Red" }
    Write-Host "[$($result.Status)] $Name - $Method $Url" -ForegroundColor $color
    if ($result.Error) {
        Write-Host "    Error: $($result.Error)" -ForegroundColor Yellow
    }
    
    return $result
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  BEAUTY PARLOUR API TEST SUITE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# ============================================
# 1. HEALTH & DATABASE TESTS
# ============================================
Write-Host "`n--- HEALTH & DATABASE ---" -ForegroundColor Yellow

$testResults += Test-Endpoint -Name "Health Check" -Method "GET" -Url "$baseUrl/health"
$testResults += Test-Endpoint -Name "Root Endpoint" -Method "GET" -Url "$baseUrl"

# ============================================
# 2. AUTHENTICATION TESTS
# ============================================
Write-Host "`n--- AUTHENTICATION ---" -ForegroundColor Yellow

# Test Registration
$registerData = @{
    email = "testuser_$(Get-Random)@test.com"
    password = "Test@123456"
    firstName = "Test"
    lastName = "User"
    phone = "9876543210"
}
$testResults += Test-Endpoint -Name "Register User" -Method "POST" -Url "$baseUrl/auth/register" -Body $registerData -ExpectedStatus 201

# Test Login
$loginData = @{
    email = $registerData.email
    password = $registerData.password
}
$loginResult = Test-Endpoint -Name "Login User" -Method "POST" -Url "$baseUrl/auth/login" -Body $loginData
$testResults += $loginResult

if ($loginResult.Response -and $loginResult.Response.access_token) {
    $script:authToken = $loginResult.Response.access_token
    $script:refreshToken = $loginResult.Response.refresh_token
    Write-Host "    Token obtained successfully!" -ForegroundColor Green
}

# Test with invalid credentials
$invalidLogin = @{
    email = "invalid@test.com"
    password = "wrongpassword"
}
$testResults += Test-Endpoint -Name "Login Invalid Credentials" -Method "POST" -Url "$baseUrl/auth/login" -Body $invalidLogin -ExpectedStatus 401

# ============================================
# 3. SERVICES TESTS (Public)
# ============================================
Write-Host "`n--- SERVICES (Public) ---" -ForegroundColor Yellow

$testResults += Test-Endpoint -Name "Get All Services" -Method "GET" -Url "$baseUrl/services"
$testResults += Test-Endpoint -Name "Get Services Categories" -Method "GET" -Url "$baseUrl/customer/services/categories"

# ============================================
# 4. PRODUCTS TESTS (Public)
# ============================================
Write-Host "`n--- PRODUCTS (Public) ---" -ForegroundColor Yellow

$testResults += Test-Endpoint -Name "Get All Products" -Method "GET" -Url "$baseUrl/products"

# ============================================
# 5. STAFF TESTS (Public)
# ============================================
Write-Host "`n--- STAFF (Public) ---" -ForegroundColor Yellow

$testResults += Test-Endpoint -Name "Get All Staff" -Method "GET" -Url "$baseUrl/staff"

# ============================================
# 6. AUTHENTICATED TESTS
# ============================================
if ($authToken) {
    $authHeaders = @{
        "Authorization" = "Bearer $authToken"
    }
    
    Write-Host "`n--- AUTHENTICATED ENDPOINTS ---" -ForegroundColor Yellow
    
    # Profile
    $testResults += Test-Endpoint -Name "Get User Profile" -Method "GET" -Url "$baseUrl/auth/profile" -Headers $authHeaders
    
    # Customer Portal
    $testResults += Test-Endpoint -Name "Get Customer Profile" -Method "GET" -Url "$baseUrl/customer/profile" -Headers $authHeaders
    $testResults += Test-Endpoint -Name "Get Customer Services" -Method "GET" -Url "$baseUrl/customer/services" -Headers $authHeaders
    $testResults += Test-Endpoint -Name "Get Customer Products" -Method "GET" -Url "$baseUrl/customer/products" -Headers $authHeaders
    
    # Appointments
    $testResults += Test-Endpoint -Name "Get Customer Appointments" -Method "GET" -Url "$baseUrl/customer/appointments" -Headers $authHeaders
    
    # Orders
    $testResults += Test-Endpoint -Name "Get Customer Orders" -Method "GET" -Url "$baseUrl/customer/orders" -Headers $authHeaders
    
    # Payments
    $testResults += Test-Endpoint -Name "Get Customer Payments" -Method "GET" -Url "$baseUrl/customer/payments" -Headers $authHeaders
    
    # Wishlist
    $testResults += Test-Endpoint -Name "Get Wishlist" -Method "GET" -Url "$baseUrl/wishlist" -Headers $authHeaders
    
    # Reviews
    $testResults += Test-Endpoint -Name "Get Public Reviews" -Method "GET" -Url "$baseUrl/reviews/public"
    $testResults += Test-Endpoint -Name "Get Review Stats" -Method "GET" -Url "$baseUrl/reviews/stats"
    
    # Coupons (should require admin)
    $testResults += Test-Endpoint -Name "Get Coupons (Auth)" -Method "GET" -Url "$baseUrl/coupons" -Headers $authHeaders
    
    # Loyalty
    $testResults += Test-Endpoint -Name "Get Loyalty Points" -Method "GET" -Url "$baseUrl/loyalty" -Headers $authHeaders
    $testResults += Test-Endpoint -Name "Get Loyalty History" -Method "GET" -Url "$baseUrl/loyalty/history" -Headers $authHeaders
}

# ============================================
# 7. ADMIN TESTS (Need admin user)
# ============================================
Write-Host "`n--- ADMIN LOGIN ---" -ForegroundColor Yellow

# Try to login as admin
$adminLogin = @{
    email = "admin@beautyparlour.com"
    password = "Admin@123"
}
$adminResult = Test-Endpoint -Name "Login Admin" -Method "POST" -Url "$baseUrl/auth/login" -Body $adminLogin
$testResults += $adminResult

if ($adminResult.Response -and $adminResult.Response.access_token) {
    $adminToken = $adminResult.Response.access_token
    $adminHeaders = @{
        "Authorization" = "Bearer $adminToken"
    }
    
    Write-Host "`n--- ADMIN ENDPOINTS ---" -ForegroundColor Yellow
    
    # Users Management
    $testResults += Test-Endpoint -Name "Get All Users (Admin)" -Method "GET" -Url "$baseUrl/users" -Headers $adminHeaders
    
    # Services CRUD
    $testResults += Test-Endpoint -Name "Get Services (Admin)" -Method "GET" -Url "$baseUrl/services" -Headers $adminHeaders
    
    # Create Service
    $newService = @{
        name = "Test Service $(Get-Random)"
        description = "Test service description"
        duration = 30
        price = 500
        category = "Hair"
        isActive = $true
    }
    $testResults += Test-Endpoint -Name "Create Service (Admin)" -Method "POST" -Url "$baseUrl/services" -Body $newService -Headers $adminHeaders -ExpectedStatus 201
    
    # Products CRUD
    $testResults += Test-Endpoint -Name "Get Products (Admin)" -Method "GET" -Url "$baseUrl/products" -Headers $adminHeaders
    
    # Create Product
    $newProduct = @{
        name = "Test Product $(Get-Random)"
        description = "Test product description"
        price = 299
        category = "Skincare"
        stock = 100
        isActive = $true
    }
    $testResults += Test-Endpoint -Name "Create Product (Admin)" -Method "POST" -Url "$baseUrl/products" -Body $newProduct -Headers $adminHeaders -ExpectedStatus 201
    
    # Staff CRUD
    $testResults += Test-Endpoint -Name "Get Staff (Admin)" -Method "GET" -Url "$baseUrl/staff" -Headers $adminHeaders
    
    # Appointments
    $testResults += Test-Endpoint -Name "Get Appointments (Admin)" -Method "GET" -Url "$baseUrl/appointments" -Headers $adminHeaders
    
    # Orders
    $testResults += Test-Endpoint -Name "Get Orders (Admin)" -Method "GET" -Url "$baseUrl/orders" -Headers $adminHeaders
    
    # Payments
    $testResults += Test-Endpoint -Name "Get Payments (Admin)" -Method "GET" -Url "$baseUrl/payments" -Headers $adminHeaders
    
    # Inventory
    $testResults += Test-Endpoint -Name "Get Inventory (Admin)" -Method "GET" -Url "$baseUrl/inventory" -Headers $adminHeaders
    
    # Coupons
    $testResults += Test-Endpoint -Name "Get Coupons (Admin)" -Method "GET" -Url "$baseUrl/coupons" -Headers $adminHeaders
    
    # Create Coupon
    $newCoupon = @{
        code = "TEST$(Get-Random)"
        description = "Test coupon"
        discountType = "percentage"
        discountValue = 10
        minOrderValue = 500
        maxDiscount = 100
        usageLimit = 100
        validFrom = (Get-Date).ToString("yyyy-MM-dd")
        validUntil = (Get-Date).AddMonths(1).ToString("yyyy-MM-dd")
        isActive = $true
    }
    $testResults += Test-Endpoint -Name "Create Coupon (Admin)" -Method "POST" -Url "$baseUrl/coupons" -Body $newCoupon -Headers $adminHeaders -ExpectedStatus 201
    
    # Expenses
    $testResults += Test-Endpoint -Name "Get Expenses (Admin)" -Method "GET" -Url "$baseUrl/expenses" -Headers $adminHeaders
    
    # Reports
    $testResults += Test-Endpoint -Name "Get Dashboard Report" -Method "GET" -Url "$baseUrl/reports/dashboard" -Headers $adminHeaders
    $testResults += Test-Endpoint -Name "Get Appointments Report" -Method "GET" -Url "$baseUrl/reports/appointments" -Headers $adminHeaders
    $testResults += Test-Endpoint -Name "Get Sales Report" -Method "GET" -Url "$baseUrl/reports/sales" -Headers $adminHeaders
    
    # Schedule
    $testResults += Test-Endpoint -Name "Get Schedule Slots" -Method "GET" -Url "$baseUrl/schedule/slots?date=$(Get-Date -Format 'yyyy-MM-dd')" -Headers $adminHeaders

} else {
    Write-Host "    Admin login failed - skipping admin tests" -ForegroundColor Yellow
}

# ============================================
# 8. ERROR HANDLING TESTS
# ============================================
Write-Host "`n--- ERROR HANDLING ---" -ForegroundColor Yellow

$testResults += Test-Endpoint -Name "404 - Non-existent Route" -Method "GET" -Url "$baseUrl/nonexistent" -ExpectedStatus 404
$testResults += Test-Endpoint -Name "401 - Unauthorized Access" -Method "GET" -Url "$baseUrl/users" -ExpectedStatus 401

# ============================================
# SUMMARY
# ============================================
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "            TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$passed = ($testResults | Where-Object { $_.Status -eq "PASS" }).Count
$failed = ($testResults | Where-Object { $_.Status -eq "FAIL" }).Count
$total = $testResults.Count

Write-Host "`nTotal Tests: $total" -ForegroundColor White
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor $(if($failed -gt 0){"Red"}else{"Green"})
Write-Host "`nSuccess Rate: $([math]::Round(($passed/$total)*100, 2))%" -ForegroundColor Cyan

# List failed tests
if ($failed -gt 0) {
    Write-Host "`n--- FAILED TESTS ---" -ForegroundColor Red
    $testResults | Where-Object { $_.Status -eq "FAIL" } | ForEach-Object {
        Write-Host "- $($_.Name): $($_.Error)" -ForegroundColor Red
    }
}

Write-Host "`n========================================`n" -ForegroundColor Cyan

# Return results for further processing
return $testResults
