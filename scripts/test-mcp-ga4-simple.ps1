# Test GA4 MCP Server - Simple Version
$baseUrl = "http://localhost:3000"

Write-Host "🚀 Testing GA4 MCP Server" -ForegroundColor Green
Write-Host "📍 Base URL: $baseUrl`n"

# Test 1: Overview with default dates
Write-Host "🧪 Test 1: get_ga4_overview (7daysAgo to yesterday)" -ForegroundColor Cyan
$body1 = @{
    tool = "get_ga4_overview"
    parameters = @{
        startDate = "7daysAgo"
        endDate = "yesterday"
    }
} | ConvertTo-Json

try {
    $response1 = Invoke-WebRequest -Uri "$baseUrl/api/mcp/ga4" -Method POST -Body $body1 -ContentType "application/json" -UseBasicParsing
    $data1 = $response1.Content | ConvertFrom-Json
    Write-Host "   ✅ SUCCESS" -ForegroundColor Green
    Write-Host "   📊 Users: $($data1.result.summary.totalUsers), Sessions: $($data1.result.summary.sessions), Page Views: $($data1.result.summary.pageViews)" -ForegroundColor Yellow
} catch {
    Write-Host "   ❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Overview with natural language date
Write-Host "`n🧪 Test 2: get_ga4_overview (January 10, 2026)" -ForegroundColor Cyan
$body2 = @{
    tool = "get_ga4_overview"
    parameters = @{
        startDate = "January 10, 2026"
        endDate = "January 10, 2026"
    }
} | ConvertTo-Json

try {
    $response2 = Invoke-WebRequest -Uri "$baseUrl/api/mcp/ga4" -Method POST -Body $body2 -ContentType "application/json" -UseBasicParsing
    $data2 = $response2.Content | ConvertFrom-Json
    Write-Host "   ✅ SUCCESS" -ForegroundColor Green
    Write-Host "   📊 Users: $($data2.result.summary.totalUsers), Sessions: $($data2.result.summary.sessions)" -ForegroundColor Yellow
} catch {
    Write-Host "   ❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        try {
            $errorData = $errorBody | ConvertFrom-Json
            Write-Host "   Error: $($errorData.error)" -ForegroundColor Red
            if ($errorData.suggestion) {
                Write-Host "   Suggestion: $($errorData.suggestion)" -ForegroundColor Yellow
            }
        } catch {}
    }
}

# Test 3: Top Pages
Write-Host "`n🧪 Test 3: get_ga4_top_pages (30daysAgo to yesterday)" -ForegroundColor Cyan
$body3 = @{
    tool = "get_ga4_top_pages"
    parameters = @{
        startDate = "30daysAgo"
        endDate = "yesterday"
    }
} | ConvertTo-Json

try {
    $response3 = Invoke-WebRequest -Uri "$baseUrl/api/mcp/ga4" -Method POST -Body $body3 -ContentType "application/json" -UseBasicParsing
    $data3 = $response3.Content | ConvertFrom-Json
    Write-Host "   ✅ SUCCESS" -ForegroundColor Green
    Write-Host "   📄 Found $($data3.result.pages.Count) pages" -ForegroundColor Yellow
    if ($data3.result.pages.Count -gt 0) {
        Write-Host "   📄 Top page: $($data3.result.pages[0].path)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest Complete!`n" -ForegroundColor Green
