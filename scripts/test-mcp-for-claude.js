/**
 * Test script to verify MCP servers are connected and fetching data for Claude
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function testMCPForClaude() {
  console.log('🔍 Testing MCP Servers for Claude Integration\n');
  console.log('='.repeat(70));

  // Test 1: Health Check
  console.log('\n📊 Test 1: Health Check');
  console.log('-'.repeat(70));
  try {
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    if (!healthRes.ok) {
      throw new Error(`Health check failed: ${healthRes.status}`);
    }
    const health = await healthRes.json();
    
    console.log('MCP Server Status:');
    console.log(`  LinkedIn: ${health.linkedin?.connected ? '✅ Connected' : '❌ Disconnected'}`);
    if (health.linkedin?.error) console.log(`    Error: ${health.linkedin.error}`);
    
    console.log(`  HubSpot: ${health.hubspot?.connected ? '✅ Connected' : '❌ Disconnected'}`);
    if (health.hubspot?.error) console.log(`    Error: ${health.hubspot.error}`);
    
    console.log(`  GA4: ${health.ga4?.connected ? '✅ Connected' : '❌ Disconnected'}`);
    if (health.ga4?.error) console.log(`    Error: ${health.ga4.error}`);
    
    console.log(`  Reddit: ${health.reddit?.connected ? '✅ Connected' : '❌ Disconnected'}`);
    if (health.reddit?.error) console.log(`    Error: ${health.reddit.error}`);
  } catch (error) {
    console.log(`❌ Health check failed: ${error.message}`);
  }

  // Test 2: GA4 MCP Bridge
  console.log('\n📊 Test 2: GA4 MCP Bridge');
  console.log('-'.repeat(70));
  const ga4Tests = [
    { tool: 'get_ga4_overview', params: { startDate: '7daysAgo', endDate: 'yesterday' } },
    { tool: 'get_ga4_realtime', params: {} },
  ];

  for (const test of ga4Tests) {
    try {
      console.log(`\n  Testing: ${test.tool}`);
      const res = await fetch(`${BASE_URL}/api/mcp/ga4`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: test.tool, parameters: test.params }),
      });

      if (!res.ok) {
        const error = await res.text();
        console.log(`    ❌ Failed: ${res.status} - ${error.substring(0, 100)}`);
        continue;
      }

      const data = await res.json();
      if (data.result) {
        console.log(`    ✅ Success: Data returned`);
        console.log(`    Result type: ${typeof data.result}`);
        if (typeof data.result === 'object') {
          const keys = Object.keys(data.result);
          console.log(`    Keys: ${keys.slice(0, 5).join(', ')}${keys.length > 5 ? '...' : ''}`);
        }
      } else {
        console.log(`    ⚠️  Warning: No result field`);
      }
    } catch (error) {
      console.log(`    ❌ Error: ${error.message}`);
    }
  }

  // Test 3: HubSpot MCP Bridge
  console.log('\n📊 Test 3: HubSpot MCP Bridge');
  console.log('-'.repeat(70));
  const hubspotTests = [
    { tool: 'get_hubspot_deals', params: { limit: 5 } },
    { tool: 'get_hubspot_contacts', params: { query: '', limit: 5 } },
  ];

  for (const test of hubspotTests) {
    try {
      console.log(`\n  Testing: ${test.tool}`);
      const res = await fetch(`${BASE_URL}/api/mcp/hubspot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: test.tool, parameters: test.params }),
      });

      if (!res.ok) {
        const error = await res.text();
        console.log(`    ❌ Failed: ${res.status} - ${error.substring(0, 100)}`);
        continue;
      }

      const data = await res.json();
      if (data.result) {
        console.log(`    ✅ Success: Data returned`);
        console.log(`    Result type: ${typeof data.result}`);
        if (Array.isArray(data.result)) {
          console.log(`    Array length: ${data.result.length}`);
        } else if (typeof data.result === 'object') {
          const keys = Object.keys(data.result);
          console.log(`    Keys: ${keys.slice(0, 5).join(', ')}${keys.length > 5 ? '...' : ''}`);
        }
      } else {
        console.log(`    ⚠️  Warning: No result field`);
      }
    } catch (error) {
      console.log(`    ❌ Error: ${error.message}`);
    }
  }

  // Test 4: LinkedIn MCP Bridge
  console.log('\n📊 Test 4: LinkedIn MCP Bridge');
  console.log('-'.repeat(70));
  try {
    console.log(`\n  Testing: list_linkedin_accounts`);
    const res = await fetch(`${BASE_URL}/api/mcp/linkedin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool: 'list_linkedin_accounts', parameters: {} }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.log(`    ❌ Failed: ${res.status} - ${error.substring(0, 100)}`);
    } else {
      const data = await res.json();
      if (data.result) {
        console.log(`    ✅ Success: Data returned`);
        if (Array.isArray(data.result)) {
          console.log(`    Accounts found: ${data.result.length}`);
        }
      } else {
        console.log(`    ⚠️  Warning: No result field`);
      }
    }
  } catch (error) {
    console.log(`    ❌ Error: ${error.message}`);
  }

  // Test 5: Verify tool definitions
  console.log('\n📊 Test 5: Tool Definitions for Claude');
  console.log('-'.repeat(70));
  try {
    const toolsModule = await import('../lib/mcp/tools.ts');
    const tools = toolsModule.mcpTools || [];
    console.log(`\n  Total tools available: ${tools.length}`);
    
    const byService = {
      linkedin: tools.filter(t => t.name.includes('linkedin')).length,
      hubspot: tools.filter(t => t.name.includes('hubspot')).length,
      ga4: tools.filter(t => t.name.includes('ga4')).length,
      reddit: tools.filter(t => t.name.includes('reddit')).length,
    };
    
    console.log(`  LinkedIn tools: ${byService.linkedin}`);
    console.log(`  HubSpot tools: ${byService.hubspot}`);
    console.log(`  GA4 tools: ${byService.ga4}`);
    console.log(`  Reddit tools: ${byService.reddit}`);
  } catch (error) {
    console.log(`    ⚠️  Could not load tool definitions: ${error.message}`);
  }

  console.log('\n' + '='.repeat(70));
  console.log('\n✅ MCP Server Test Complete');
  console.log('\nSummary:');
  console.log('- MCP servers should be connected (check health endpoint)');
  console.log('- MCP bridge routes should return { result: ... } format');
  console.log('- Claude can call these tools via executeToolCall() function');
  console.log('- All tools are defined in lib/mcp/tools.ts');
}

// Run tests
testMCPForClaude()
  .then(() => {
    console.log('\n✅ All tests completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
