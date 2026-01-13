# Test GA4 MCP Server
# Tests the MCP bridge endpoints to verify data fetching works

$baseUrl = if ($env:NEXT_PUBLIC_APP_URL) { $env:NEXT_PUBLIC_APP_URL } else { "http://localhost:3000" }

function Test-MCPEndpoint {
    param(
        [string]$toolName,
        [hashtable]$parameters = @{}
    )
    
    $url = "$baseUrl/api/mcp/ga4"
    
    Write-Host "`n🧪 Testing: $toolName" -ForegroundColor Cyan
    Write-Host "   URL: $url"
    Write-Host "   Parameters: $($parameters | ConvertTo-Json -Compress)"
    
    $body = @{
        tool = $toolName
        parameters = $parameters
    } | ConvertTo-Json
    
    try {
        $response = Invoke-WebRequest -Uri $url -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
        
        $data = $response.Content | ConvertFrom-Json
        
        if ($response.StatusCode -eq 200) {
            Write-Host "   ✅ SUCCESS: Status $($response.StatusCode)" -ForegroundColor Green
            
            # Display summary of results
            if ($data.result) {
                if ($data.result.summary) {
                    Write-Host "   📊 Summary:" -ForegroundColor Yellow
                    Write-Host "      Users: $($data.result.summary.totalUsers)"
                    Write-Host "      Sessions: $($data.result.summary.sessions)"
                    Write-Host "      Page Views: $($data.result.summary.pageViews)"
                } elseif ($data.result.pages) {
                    Write-Host "   📄 Pages: $($data.result.pages.Count) pages found" -ForegroundColor Yellow
                    if ($data.result.pages.Count -gt 0) {
                        $topPage = if ($data.result.pages[0].path) { $data.result.pages[0].path } elseif ($data.result.pages[0].title) { $data.result.pages[0].title } else { "N/A" }
                        Write-Host "   📄 Top page: $topPage"
                    }
                } elseif ($data.result.content) {
                    Write-Host "   📝 Content: $($data.result.content.Count) items found" -ForegroundColor Yellow
                    if ($data.result.content.Count -gt 0) {
                        $topContent = if ($data.result.content[0].pageTitle) { $data.result.content[0].pageTitle } else { "N/A" }
                        Write-Host "   📝 Top content: $topContent"
                    }
                } else {
                    Write-Host "   📦 Data structure: $($data.result.PSObject.Properties.Name -join ', ')" -ForegroundColor Yellow
                }
            }
            
            return @{ success = $true; data = $data.result }
        } else {
            Write-Host "   ❌ HTTP $($response.StatusCode): $($data.error)" -ForegroundColor Red
            if ($data.suggestion) {
                Write-Host "   💡 Suggestion: $($data.suggestion)" -ForegroundColor Yellow
            }
            return @{ success = $false; error = $data.error; details = $data }
        }
    } catch {
        $errorMsg = $_.Exception.Message
        Write-Host "   ❌ ERROR: $errorMsg" -ForegroundColor Red
        
        # Try to parse error response
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            try {
                $errorData = $responseBody | ConvertFrom-Json
                if ($errorData.error) {
                    Write-Host "   Error details: $($errorData.error)" -ForegroundColor Red
                }
            } catch {
                Write-Host "   Response: $($responseBody.Substring(0, [Math]::Min(200, $responseBody.Length)))" -ForegroundColor Red
            }
        }
        
        return @{ success = $false; error = $errorMsg }
    }
}

Write-Host ""

Write-Host "🚀 Starting GA4 MCP Server Tests" -ForegroundColor Green
Write-Host "📍 Base URL: $baseUrl"
Write-Host "`n📊 Testing MCP endpoints...`n"

$results = @()

# Test 1: Overview with default dates
$results += Test-MCPEndpoint -toolName "get_ga4_overview" -parameters @{
    startDate = "7daysAgo"
    endDate = "yesterday"
}

# Test 2: Overview with natural language date (January 10, 2026)
$results += Test-MCPEndpoint -toolName "get_ga4_overview" -parameters @{
    startDate = "January 10, 2026"
    endDate = "January 10, 2026"
}

# Test 3: Top Pages with default dates
$results += Test-MCPEndpoint -toolName "get_ga4_top_pages" -parameters @{
    startDate = "30daysAgo"
    endDate = "yesterday"
}

# Test 4: Top Pages with natural language date
$results += Test-MCPEndpoint -toolName "get_ga4_top_pages" -parameters @{
    startDate = "January 10, 2026"
    endDate = "January 10, 2026"
}

# Test 5: Content with default dates
$results += Test-MCPEndpoint -toolName "get_ga4_content" -parameters @{
    startDate = "30daysAgo"
    endDate = "yesterday"
}

# Summary
Write-Host "`n" + ("=" * 60) -ForegroundColor Cyan
Write-Host "📊 TEST SUMMARY" -ForegroundColor Green
Write-Host ("=" * 60) -ForegroundColor Cyan

$successful = ($results | Where-Object { $_.success }).Count
$failed = ($results | Where-Object { -not $_.success }).Count

Write-Host "`n✅ Successful: $successful/$($results.Count)" -ForegroundColor Green
Write-Host "❌ Failed: $failed/$($results.Count)" -ForegroundColor $(if ($failed -gt 0) { "Red" } else { "Green" })

if ($failed -gt 0) {
    Write-Host "`n❌ Failed Tests:" -ForegroundColor Red
    for ($i = 0; $i -lt $results.Count; $i++) {
        if (-not $results[$i].success) {
            Write-Host "   $($i + 1). Error: $($results[$i].error)" -ForegroundColor Red
        }
    }
}

$separator = "=" * 60
Write-Host "`n$separator`n" -ForegroundColor Cyan
