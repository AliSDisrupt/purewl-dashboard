/**
 * Test script to verify MCP servers are fetching data and returning it properly
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function testMCPDataFlow() {
  console.log('🔍 Testing MCP Server Data Flow\n');
  console.log('='.repeat(60));

  const tests = [
    {
      name: 'GA4 Overview',
      endpoint: '/api/mcp/ga4',
      tool: 'get_ga4_overview',
      parameters: { startDate: '7daysAgo', endDate: 'yesterday' }
    },
    {
      name: 'HubSpot Deals',
      endpoint: '/api/mcp/hubspot',
      tool: 'get_hubspot_deals',
      parameters: { limit: 5 }
    },
    {
      name: 'LinkedIn Accounts',
      endpoint: '/api/mcp/linkedin',
      tool: 'list_linkedin_accounts',
      parameters: {}
    },
    {
      name: 'GA4 Realtime',
      endpoint: '/api/mcp/ga4',
      tool: 'get_ga4_realtime',
      parameters: {}
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`\n📊 Testing: ${test.name}`);
      console.log(`   Endpoint: ${test.endpoint}`);
      console.log(`   Tool: ${test.tool}`);
      
      const response = await fetch(`${BASE_URL}${test.endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tool: test.tool,
          parameters: test.parameters,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`   ❌ FAILED: ${response.status} ${response.statusText}`);
        console.log(`   Error: ${errorText.substring(0, 200)}`);
        failed++;
        continue;
      }

      const data = await response.json();
      
      if (data.result) {
        console.log(`   ✅ SUCCESS: Data returned`);
        console.log(`   Result type: ${typeof data.result}`);
        
        // Show a sample of the data structure
        if (typeof data.result === 'object') {
          const keys = Object.keys(data.result);
          console.log(`   Result keys: ${keys.slice(0, 5).join(', ')}${keys.length > 5 ? '...' : ''}`);
          
          // Check if result has meaningful data
          if (Array.isArray(data.result)) {
            console.log(`   Array length: ${data.result.length}`);
          } else if (data.result.summary || data.result.data || data.result.deals || data.result.accounts) {
            console.log(`   ✅ Contains expected data structure`);
          }
        }
        passed++;
      } else {
        console.log(`   ⚠️  WARNING: No 'result' field in response`);
        console.log(`   Response: ${JSON.stringify(data).substring(0, 200)}`);
        failed++;
      }
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}`);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n📈 Test Results:`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   Total: ${passed + failed}`);

  if (failed === 0) {
    console.log('\n✅ All MCP servers are properly fetching and returning data!');
  } else {
    console.log('\n⚠️  Some MCP servers may need attention.');
  }
}

// Run tests
testMCPDataFlow()
  .then(() => {
    console.log('\n✅ Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
