/**
 * Test Reddit Ads API with correct endpoints
 */

const REDDIT_ADS_API_KEY = "eyJhbGciOiJSUzI1NiIsImtpZCI6IlNIQTI1NjpzS3dsMnlsV0VtMjVmcXhwTU40cWY4MXE2OWFFdWFyMnpLMUdhVGxjdWNZIiwidHlwIjoiSldUIn0.eyJzdWIiOiJ1c2VyIiwiZXhwIjo0OTIzNjk5NjU0LjAwOTMyOSwiaWF0IjoxNzY3OTM5NjU0LjAwOTMyOSwianRpIjoiN1dUYzFCZE8xRDhLb2d0T25DODBMOHNKeEdxdWN3IiwiY2lkIjoiMVExRU96VFBXbll2ZXJocHR2Z1dzUSIsImxpZCI6InQyXzI1cnlqamY2c2UiLCJhaWQiOiJ0Ml8yNXJ5ampmNnNlIiwiYXQiOjUsImxjYSI6MTc2NzkzOTY1MjM2NCwic2NwIjoiZUp5S1ZrcE1LVTdPenl0TExTck96TThyVm9vRkJBQUFfXzlCRmdidSIsImZsbyI6MTAsImxsIjp0cnVlfQ.HcaxVZBO_XgkLUwQoORuLE3Cxfy5JSCYPYw3Kbv6w1dSPEzJgkUqZX2-NiBuLioQ2Nm2e9B3uwcw4qMMLqXuq2NqGlHYfncpMsXgOoFb-uDatUZioHklP9Ql2cxZ7qP6TSQB87irSTPRduG2aDhllyVatwRpncYehTvcGvi9pJW0kPHcNj3HmPO7OX575_p68hPP_xiPmp7BtwX3OI9QeHrUEC-h1hLZKP0luC93hg0LGcGqvWSyazJcEQk_f8nKYqDbLNB6JX5ioUf-ep2zdFqj12YKfplNtKXawUkebbR0TnSkpbB17bLCouU6Kdhjps12r8T_IntNmiQw7Vrn9Q";

const accountId = "t2_25ryjjf6se"; // From decoded token

async function testRedditAPI() {
  console.log("🔍 Testing Reddit API with account ID:", accountId, "\n");

  const headers = {
    Authorization: `Bearer ${REDDIT_ADS_API_KEY}`,
    "Content-Type": "application/json",
    "User-Agent": "PureWL-Dashboard/1.0",
  };

  // Try Reddit OAuth API endpoints
  const endpoints = [
    { url: "https://oauth.reddit.com/api/v1/me", desc: "OAuth Reddit /api/v1/me" },
    { url: "https://www.reddit.com/api/v1/me", desc: "Reddit /api/v1/me" },
    { url: `https://oauth.reddit.com/api/v1/me.json`, desc: "OAuth Reddit /api/v1/me.json" },
    { url: `https://www.reddit.com/api/v1/me.json`, desc: "Reddit /api/v1/me.json" },
    { url: `https://ads-api.reddit.com/api/v1/me`, desc: "Ads API /api/v1/me" },
    { url: `https://ads-api.reddit.com/api/v1/advertisers/${accountId}`, desc: "Ads API advertiser" },
    { url: `https://ads-api.reddit.com/api/v1/advertisers/${accountId}/campaigns`, desc: "Ads API campaigns" },
    { url: `https://ads-api.reddit.com/api/v1/campaigns?advertiser_id=${accountId}`, desc: "Ads API campaigns query" },
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing: ${endpoint.desc}`);
      console.log(`  URL: ${endpoint.url}`);
      
      const response = await fetch(endpoint.url, { headers });
      console.log(`  Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`  ✅ SUCCESS!`);
        console.log(`  Response:`, JSON.stringify(data, null, 2).substring(0, 1000));
        console.log("");
        return { success: true, url: endpoint.url, data };
      } else {
        const errorText = await response.text();
        console.log(`  ❌ Error: ${errorText.substring(0, 200)}`);
      }
      console.log("");
    } catch (error) {
      console.log(`  ❌ Exception: ${error.message}`);
      console.log("");
    }
  }

  console.log("❌ No working endpoint found");
  return { success: false };
}

testRedditAPI()
  .then((result) => {
    if (result.success) {
      console.log("\n✅ Found working endpoint:", result.url);
    } else {
      console.log("\n❌ Could not find working Reddit Ads API endpoint");
      console.log("   The API might require:");
      console.log("   1. Different authentication method");
      console.log("   2. Different base URL");
      console.log("   3. Additional headers or parameters");
      console.log("   4. The token might be for a different Reddit API (not Ads API)");
    }
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
