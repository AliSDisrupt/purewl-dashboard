# Test GA4 MCP Server
$baseUrl = "http://localhost:3000"

Write-Host "Testing GA4 MCP Server" -ForegroundColor Green
Write-Host "Base URL: $baseUrl" -ForegroundColor Yellow
Write-Host ""

# Test 1: Overview with default dates
Write-Host "Test 1: get_ga4_overview (7daysAgo to yesterday)" -ForegroundColor Cyan
$body1 = @{
    tool = "get_ga4_overview"
    parameters = @{
        startDate = "7daysAgo"
        endDate = "yesterday"
    }
} | ConvertTo-Json -Compress

try {
    Write-Host "   Sending request..." -ForegroundColor Gray
    $response1 = Invoke-WebRequest -Uri "$baseUrl/api/mcp/ga4" -Method POST -Body $body1 -ContentType "application/json" -UseBasicParsing
    Write-Host "   Response status: $($response1.StatusCode)" -ForegroundColor Gray
    Write-Host "   Response length: $($response1.Content.Length)" -ForegroundColor Gray
    
    if ($response1.Content.Length -lt 500) {
        Write-Host "   Response preview: $($response1.Content.Substring(0, [Math]::Min(200, $response1.Content.Length)))" -ForegroundColor Gray
    }
    
    # Try to parse JSON
    try {
        $data1 = $response1.Content | ConvertFrom-Json
        Write-Host "   SUCCESS" -ForegroundColor Green
        if ($data1.result -and $data1.result.summary) {
            Write-Host "   Users: $($data1.result.summary.totalUsers), Sessions: $($data1.result.summary.sessions), Page Views: $($data1.result.summary.pageViews)" -ForegroundColor Yellow
        } else {
            Write-Host "   Response structure: $($data1.PSObject.Properties.Name -join ', ')" -ForegroundColor Yellow
            Write-Host "   First 500 chars of response: $($response1.Content.Substring(0, [Math]::Min(500, $response1.Content.Length)))" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "   JSON Parse Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "   First 1000 chars: $($response1.Content.Substring(0, [Math]::Min(1000, $response1.Content.Length)))" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   FAILED: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        Write-Host "   Response body (first 300 chars): $($errorBody.Substring(0, [Math]::Min(300, $errorBody.Length)))" -ForegroundColor Red
        try {
            $errorData = $errorBody | ConvertFrom-Json
            Write-Host "   Error: $($errorData.error)" -ForegroundColor Red
            if ($errorData.suggestion) {
                Write-Host "   Suggestion: $($errorData.suggestion)" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "   Could not parse as JSON" -ForegroundColor Red
        }
    }
}

# Test 2: Overview with natural language date
Write-Host ""
Write-Host "Test 2: get_ga4_overview (January 10, 2026)" -ForegroundColor Cyan
$body2 = @{
    tool = "get_ga4_overview"
    parameters = @{
        startDate = "January 10, 2026"
        endDate = "January 10, 2026"
    }
} | ConvertTo-Json -Compress

try {
    $response2 = Invoke-WebRequest -Uri "$baseUrl/api/mcp/ga4" -Method POST -Body $body2 -ContentType "application/json" -UseBasicParsing
    $data2 = $response2.Content | ConvertFrom-Json
    Write-Host "   SUCCESS" -ForegroundColor Green
    Write-Host "   Users: $($data2.result.summary.totalUsers), Sessions: $($data2.result.summary.sessions)" -ForegroundColor Yellow
} catch {
    Write-Host "   FAILED: $($_.Exception.Message)" -ForegroundColor Red
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
Write-Host ""
Write-Host "Test 3: get_ga4_top_pages (30daysAgo to yesterday)" -ForegroundColor Cyan
$body3 = @{
    tool = "get_ga4_top_pages"
    parameters = @{
        startDate = "30daysAgo"
        endDate = "yesterday"
    }
} | ConvertTo-Json -Compress

try {
    $response3 = Invoke-WebRequest -Uri "$baseUrl/api/mcp/ga4" -Method POST -Body $body3 -ContentType "application/json" -UseBasicParsing
    $data3 = $response3.Content | ConvertFrom-Json
    Write-Host "   SUCCESS" -ForegroundColor Green
    Write-Host "   Found $($data3.result.pages.Count) pages" -ForegroundColor Yellow
    if ($data3.result.pages.Count -gt 0) {
        Write-Host "   Top page: $($data3.result.pages[0].path)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Test Complete!" -ForegroundColor Green
