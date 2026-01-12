// Use built-in fetch (Node 18+) or node-fetch
const fetch = globalThis.fetch || require('node-fetch');

async function testGA4MCP() {
  console.log("🧪 Testing GA4 MCP Server...\n");

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const testTools = [
    { tool: 'get_ga4_overview', parameters: { startDate: '7daysAgo', endDate: 'yesterday' } },
    { tool: 'get_ga4_realtime', parameters: {} },
    { tool: 'get_ga4_top_pages', parameters: { startDate: '30daysAgo', endDate: 'yesterday' } },
  ];

  for (const test of testTools) {
    try {
      console.log(`Testing: ${test.tool}`);
      console.log(`  Parameters:`, test.parameters);
      
      const response = await fetch(`${baseUrl}/api/mcp/ga4`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tool: test.tool,
          parameters: test.parameters,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`  ✅ SUCCESS!`);
        console.log(`  Response keys:`, Object.keys(data.result || {}));
        if (data.result && typeof data.result === 'object') {
          const preview = JSON.stringify(data.result).substring(0, 200);
          console.log(`  Preview: ${preview}...`);
        }
      } else {
        const error = await response.text();
        console.log(`  ❌ Error: ${response.status} ${response.statusText}`);
        console.log(`  ${error.substring(0, 200)}`);
      }
      console.log("");
    } catch (error) {
      console.log(`  ❌ Exception: ${error.message}`);
      console.log("");
    }
  }

  console.log("✅ GA4 MCP test completed!");
}

testGA4MCP()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
