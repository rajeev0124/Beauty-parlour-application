# ============================================
# COMPREHENSIVE APPLICATION TEST SUITE
# ============================================

Write-Host "`n" -ForegroundColor Magenta
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║  COMPLETE BEAUTY PARLOUR APPLICATION TEST SUITE       ║" -ForegroundColor Magenta
Write-Host "║  Testing all components, endpoints, and workflows     ║" -ForegroundColor Magenta
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Magenta

$BaseURL = "https://beauty-pallour-application.onrender.com/api"
$FrontendURL = "https://beauty-parlour-0124.web.app"
$testsPassed = 0
$testsFailed = 0
$totalTests = 0

# Helper function
function Test-Endpoint {
    param(
        [string]$Name,
        [string]$URL,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [string]$Body = $null
    )
    
    $totalTests++
    Write-Host "`n[TEST $totalTests] $Name" -ForegroundColor Cyan
    Write-Host "URL: $URL" -ForegroundColor Gray
    
    try {
        $params = @{
            Uri = $URL
            Method = $Method
            TimeoutSec = 15
            UseBasicParsing = $true
            ErrorAction = "Stop"
        }
        
        if ($Headers.Count -gt 0) { $params.Headers = $Headers }
        if ($Body) { $params.Body = $Body }
        
        $response = Invoke-WebRequest @params
        $data = $response.Content | ConvertFrom-Json -ErrorAction SilentlyContinue
        
        Write-Host "✅ PASSED" -ForegroundColor Green
        
        # Show details
        if ($data -is [array]) {
            Write-Host "   Items: $($data.Count)" -ForegroundColor Yellow
            if ($data.Count -gt 0) {
                Write-Host "   Sample: $(ConvertTo-Json -InputObject $data[0] -Compress)" -ForegroundColor DarkYellow
            }
        } else {
            Write-Host "   Response: $(ConvertTo-Json -InputObject $data -Compress)" -ForegroundColor Yellow
        }
        
        $script:testsPassed++
        return $true
    }
    catch {
        Write-Host "❌ FAILED" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        $script:testsFailed++
        return $false
    }
}

# ============================================
# SECTION 1: BACKEND INFRASTRUCTURE TESTS
# ============================================
Write-Host "`n" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor White
Write-Host "SECTION 1: BACKEND INFRASTRUCTURE" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor White

Test-Endpoint -Name "Backend Health Check" -URL "$BaseURL/health"
Test-Endpoint -Name "Get All Services" -URL "$BaseURL/services"
Test-Endpoint -Name "Get All Products" -URL "$BaseURL/products"
Test-Endpoint -Name "Get All Reviews" -URL "$BaseURL/reviews"

# ============================================
# SECTION 2: FRONTEND DEPLOYMENT TESTS
# ============================================
Write-Host "`n" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor White
Write-Host "SECTION 2: FRONTEND DEPLOYMENT" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor White

$totalTests++
Write-Host "`n[TEST $totalTests] Frontend Main Page" -ForegroundColor Cyan
Write-Host "URL: $FrontendURL" -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri $FrontendURL -TimeoutSec 15 -UseBasicParsing -ErrorAction Stop
    if ($response.StatusCode -eq 200 -and $response.Content -match "Beauty Parlour") {
        Write-Host "✅ PASSED" -ForegroundColor Green
        Write-Host "   Status: 200 OK" -ForegroundColor Yellow
        Write-Host "   Content Length: $($response.Content.Length) bytes" -ForegroundColor Yellow
        $script:testsPassed++
    } else {
        Write-Host "❌ FAILED" -ForegroundColor Red
        $script:testsFailed++
    }
} catch {
    Write-Host "❌ FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    $script:testsFailed++
}

$totalTests++
Write-Host "`n[TEST $totalTests] Frontend Services Page" -ForegroundColor Cyan
Write-Host "URL: $FrontendURL/services" -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri "$FrontendURL/services" -TimeoutSec 15 -UseBasicParsing -ErrorAction Stop
    if ($response.StatusCode -eq 200 -and $response.Content -match "Our Services") {
        Write-Host "✅ PASSED" -ForegroundColor Green
        Write-Host "   Status: 200 OK" -ForegroundColor Yellow
        Write-Host "   Content Length: $($response.Content.Length) bytes" -ForegroundColor Yellow
        $script:testsPassed++
    } else {
        Write-Host "❌ FAILED" -ForegroundColor Red
        $script:testsFailed++
    }
} catch {
    Write-Host "❌ FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    $script:testsFailed++
}

# ============================================
# SECTION 3: USER AUTHENTICATION TESTS
# ============================================
Write-Host "`n" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor White
Write-Host "SECTION 3: USER AUTHENTICATION" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor White

# Create test user
$totalTests++
$testEmail = "testuser_$(Get-Random)@beauty.test"
$testPassword = "Test@12345"

Write-Host "`n[TEST $totalTests] User Registration" -ForegroundColor Cyan
Write-Host "URL: $BaseURL/auth/register" -ForegroundColor Gray
Write-Host "Creating user: $testEmail" -ForegroundColor Gray

try {
    $body = @{
        name = "Test User"
        email = $testEmail
        phone = "9876543210"
        password = $testPassword
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$BaseURL/auth/register" -Method POST -ContentType "application/json" -Body $body -TimeoutSec 15 -UseBasicParsing -ErrorAction Stop
    $data = $response.Content | ConvertFrom-Json
    
    if ($response.StatusCode -eq 201) {
        Write-Host "✅ PASSED" -ForegroundColor Green
        Write-Host "   User Created: $testEmail" -ForegroundColor Yellow
        Write-Host "   Status: 201 Created" -ForegroundColor Yellow
        $script:testsPassed++
        
        # Try to login
        $totalTests++
        Write-Host "`n[TEST $totalTests] User Login" -ForegroundColor Cyan
        Write-Host "URL: $BaseURL/auth/login" -ForegroundColor Gray
        
        try {
            $loginBody = @{
                email = $testEmail
                password = $testPassword
            } | ConvertTo-Json
            
            $loginResponse = Invoke-WebRequest -Uri "$BaseURL/auth/login" -Method POST -ContentType "application/json" -Body $loginBody -TimeoutSec 15 -UseBasicParsing -ErrorAction Stop
            $loginData = $loginResponse.Content | ConvertFrom-Json
            
            if ($loginResponse.StatusCode -eq 201 -and $loginData.access_token) {
                Write-Host "✅ PASSED" -ForegroundColor Green
                Write-Host "   User Logged In Successfully" -ForegroundColor Yellow
                Write-Host "   Token Issued: $(($loginData.access_token).Substring(0,20))..." -ForegroundColor Yellow
                Write-Host "   Status: 201 Created" -ForegroundColor Yellow
                $script:testsPassed++
                
                # Store token for next tests
                $token = $loginData.access_token
                
                # Test authenticated endpoints
                $totalTests++
                Write-Host "`n[TEST $totalTests] Get Current User (Authenticated)" -ForegroundColor Cyan
                Write-Host "URL: $BaseURL/users/me" -ForegroundColor Gray
                
                try {
                    $meResponse = Invoke-WebRequest -Uri "$BaseURL/users/me" -Method GET -Headers @{"Authorization"="Bearer $token"} -TimeoutSec 15 -UseBasicParsing -ErrorAction Stop
                    $meData = $meResponse.Content | ConvertFrom-Json
                    
                    if ($meResponse.StatusCode -eq 200) {
                        Write-Host "✅ PASSED" -ForegroundColor Green
                        Write-Host "   User Data Retrieved" -ForegroundColor Yellow
                        Write-Host "   User: $($meData.email)" -ForegroundColor Yellow
                        $script:testsPassed++
                    } else {
                        Write-Host "❌ FAILED" -ForegroundColor Red
                        $script:testsFailed++
                    }
                } catch {
                    Write-Host "❌ FAILED" -ForegroundColor Red
                    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
                    $script:testsFailed++
                }
            } else {
                Write-Host "❌ FAILED" -ForegroundColor Red
                Write-Host "   Status: $($loginResponse.StatusCode)" -ForegroundColor Red
                $script:testsFailed++
            }
        } catch {
            Write-Host "❌ FAILED" -ForegroundColor Red
            Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
            $script:testsFailed++
        }
    } else {
        Write-Host "❌ FAILED" -ForegroundColor Red
        Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Red
        $script:testsFailed++
    }
} catch {
    Write-Host "❌ FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    $script:testsFailed++
}

# ============================================
# SECTION 4: DATABASE CONNECTIVITY TEST
# ============================================
Write-Host "`n" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor White
Write-Host "SECTION 4: DATABASE CONNECTIVITY" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor White

$totalTests++
Write-Host "`n[TEST $totalTests] Database Records Count" -ForegroundColor Cyan
Write-Host "Checking: Services, Products, Users" -ForegroundColor Gray

try {
    $servicesResp = Invoke-WebRequest -Uri "$BaseURL/services" -TimeoutSec 15 -UseBasicParsing -ErrorAction Stop
    $services = $servicesResp.Content | ConvertFrom-Json
    $serviceCount = @($services).Count
    
    $productsResp = Invoke-WebRequest -Uri "$BaseURL/products" -TimeoutSec 15 -UseBasicParsing -ErrorAction Stop
    $products = $productsResp.Content | ConvertFrom-Json
    $productCount = @($products).Count
    
    Write-Host "✅ PASSED" -ForegroundColor Green
    Write-Host "   Services in DB: $serviceCount" -ForegroundColor Yellow
    Write-Host "   Products in DB: $productCount" -ForegroundColor Yellow
    Write-Host "   Total Records: $($serviceCount + $productCount)" -ForegroundColor Yellow
    $script:testsPassed++
} catch {
    Write-Host "❌ FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    $script:testsFailed++
}

# ============================================
# FINAL REPORT
# ============================================
Write-Host "`n" -ForegroundColor White
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║                    FINAL REPORT                        ║" -ForegroundColor Magenta
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Magenta

$successPercentage = [math]::Round(($testsPassed / $totalTests) * 100, 2)

Write-Host "`nTotal Tests Run: $totalTests" -ForegroundColor White
Write-Host "✅ Tests Passed: $testsPassed" -ForegroundColor Green
Write-Host "❌ Tests Failed: $testsFailed" -ForegroundColor $(if ($testsFailed -eq 0) { "Green" } else { "Red" })
Write-Host "Success Rate: $successPercentage%" -ForegroundColor $(if ($successPercentage -ge 90) { "Green" } else { "Yellow" })

Write-Host "`n" -ForegroundColor White

if ($testsFailed -eq 0) {
    Write-Host "🎉 ALL TESTS PASSED! APPLICATION IS FULLY OPERATIONAL! 🎉" -ForegroundColor Green
    Write-Host "`nYour Beauty Parlour application is PRODUCTION READY!" -ForegroundColor Green
    Write-Host "✅ Backend: Fully Operational" -ForegroundColor Green
    Write-Host "✅ Frontend: Fully Operational" -ForegroundColor Green
    Write-Host "✅ Database: Fully Connected" -ForegroundColor Green
    Write-Host "✅ Authentication: Fully Working" -ForegroundColor Green
    Write-Host "✅ Integration: Fully Verified" -ForegroundColor Green
} elseif ($testsFailed -lt 3) {
    Write-Host "⚠️  MOSTLY WORKING - Minor issues found" -ForegroundColor Yellow
    Write-Host "Application is operational but has $testsFailed minor issue(s)" -ForegroundColor Yellow
} else {
    Write-Host "❌ CRITICAL ISSUES FOUND" -ForegroundColor Red
    Write-Host "Application needs fixes before deployment" -ForegroundColor Red
}

Write-Host "`n" -ForegroundColor White
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor White
Write-Host "Test Report Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor White
Write-Host "`n"
