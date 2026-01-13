/**
 * Test GA4 MCP Server
 * Tests the MCP bridge endpoints to verify data fetching works
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function testMCPEndpoint(toolName, parameters = {}) {
  const url = `${BASE_URL}/api/mcp/ga4`;
  
  console.log(`\n🧪 Testing: ${toolName}`);
  console.log(`   URL: ${url}`);
  console.log(`   Parameters:`, JSON.stringify(parameters, null, 2));

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tool: toolName,
        parameters: parameters,
      }),
    });

    const text = await response.text();
    let data;
    
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error(`   ❌ Invalid JSON response:`, text.substring(0, 200));
      return { success: false, error: 'Invalid JSON response' };
    }

    if (!response.ok) {
      console.error(`   ❌ HTTP ${response.status}:`, data.error || data.message || 'Unknown error');
      if (data.suggestion) {
        console.log(`   💡 Suggestion:`, data.suggestion);
      }
      return { success: false, error: data.error || data.message, details: data };
    }

    console.log(`   ✅ SUCCESS: Status ${response.status}`);
    
    // Display summary of results
    if (data.result) {
      if (data.result.summary) {
        console.log(`   📊 Summary:`, {
          users: data.result.summary.totalUsers,
          sessions: data.result.summary.sessions,
          pageViews: data.result.summary.pageViews,
        });
      } else if (data.result.pages) {
        console.log(`   📄 Pages: ${data.result.pages.length} pages found`);
        if (data.result.pages.length > 0) {
          console.log(`   📄 Top page: ${data.result.pages[0].path || data.result.pages[0].title || 'N/A'}`);
        }
      } else if (data.result.content) {
        console.log(`   📝 Content: ${data.result.content.length} items found`);
        if (data.result.content.length > 0) {
          console.log(`   📝 Top content: ${data.result.content[0].pageTitle || 'N/A'}`);
        }
      } else {
        console.log(`   📦 Data structure:`, Object.keys(data.result));
      }
    }

    return { success: true, data: data.result };
  } catch (error) {
    console.error(`   ❌ ERROR:`, error.message);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log("🚀 Starting GA4 MCP Server Tests");
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`\n📊 Testing MCP endpoints...\n`);

  const results = [];

  // Test 1: Overview with default dates
  results.push(await testMCPEndpoint('get_ga4_overview', {
    startDate: '7daysAgo',
    endDate: 'yesterday'
  }));

  // Test 2: Overview with natural language date (January 10, 2026)
  results.push(await testMCPEndpoint('get_ga4_overview', {
    startDate: 'January 10, 2026',
    endDate: 'January 10, 2026'
  }));

  // Test 3: Top Pages with default dates
  results.push(await testMCPEndpoint('get_ga4_top_pages', {
    startDate: '30daysAgo',
    endDate: 'yesterday'
  }));

  // Test 4: Top Pages with natural language date
  results.push(await testMCPEndpoint('get_ga4_top_pages', {
    startDate: 'January 10, 2026',
    endDate: 'January 10, 2026'
  }));

  // Test 5: Content with default dates
  results.push(await testMCPEndpoint('get_ga4_content', {
    startDate: '30daysAgo',
    endDate: 'yesterday'
  }));

  // Test 6: Content with ISO date format
  results.push(await testMCPEndpoint('get_ga4_content', {
    startDate: '2026-01-10',
    endDate: '2026-01-10'
  }));

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 TEST SUMMARY");
  console.log("=".repeat(60));

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`\n✅ Successful: ${successful}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}`);

  if (failed > 0) {
    console.log("\n❌ Failed Tests:");
    results.forEach((result, index) => {
      if (!result.success) {
        console.log(`   ${index + 1}. Error: ${result.error}`);
      }
    });
  }

  console.log("\n" + "=".repeat(60) + "\n");

  return results;
}

// Run tests
runTests().catch(console.error);
