/**
 * Test Reddit Ads API v3 endpoints
 */

const REDDIT_ADS_API_KEY = process.env.REDDIT_ADS_API_KEY || "eyJhbGciOiJSUzI1NiIsImtpZCI6IlNIQTI1NjpzS3dsMnlsV0VtMjVmcXhwTU40cWY4MXE2OWFFdWFyMnpLMUdhVGxjdWNZIiwidHlwIjoiSldUIn0.eyJzdWIiOiJ1c2VyIiwiZXhwIjo0OTIzNjk5NjU0LjAwOTMyOSwiaWF0IjoxNzY3OTM5NjU0LjAwOTMyOSwianRpIjoiN1dUYzFCZE8xRDhLb2d0T25DODBMOHNKeEdxdWN3IiwiY2lkIjoiMVExRU96VFBXbll2ZXJocHR2Z1dzUSIsImxpZCI6InQyXzI1cnlqamY2c2UiLCJhaWQiOiJ0Ml8yNXJ5ampmNnNlIiwiYXQiOjUsImxjYSI6MTc2NzkzOTY1MjM2NCwic2NwIjoiZUp5S1ZrcE1LVTdPenl0TExTck96TThyVm9vRkJBQUFfXzlCRmdidSIsImZsbyI6MTAsImxsIjp0cnVlfQ.HcaxVZBO_XgkLUwQoORuLE3Cxfy5JSCYPYw3Kbv6w1dSPEzJgkUqZX2-NiBuLioQ2Nm2e9B3uwcw4qMMLqXuq2NqGlHYfncpMsXgOoFb-uDatUZioHklP9Ql2cxZ7qP6TSQB87irSTPRduG2aDhllyVatwRpncYehTvcGvi9pJW0kPHcNj3HmPO7OX575_p68hPP_xiPmp7BtwX3OI9QeHrUEC-h1hLZKP0luC93hg0LGcGqvWSyazJcEQk_f8nKYqDbLNB6JX5ioUf-ep2zdFqj12YKfplNtKXawUkebbR0TnSkpbB17bLCouU6Kdhjps12r8T_IntNmiQw7Vrn9Q";

const accountId = "t2_25ryjjf6se"; // From decoded token

async function testRedditAPI() {
  console.log("🔍 Testing Reddit Ads API v3 with account ID:", accountId, "\n");

  const headers = {
    Authorization: `Bearer ${REDDIT_ADS_API_KEY}`,
    "Content-Type": "application/json",
    "User-Agent": "PureWL-Dashboard/1.0",
  };

  // Try various Reddit Ads API endpoints
  const endpoints = [
    // V3 endpoints
    { url: "https://ads-api.reddit.com/api/v3/advertisers", desc: "V3 Advertisers" },
    { url: "https://ads-api.reddit.com/api/v3/campaigns", desc: "V3 Campaigns" },
    { url: `https://ads-api.reddit.com/api/v3/advertisers/${accountId}`, desc: "V3 Advertiser by ID" },
    { url: `https://ads-api.reddit.com/api/v3/advertisers/${accountId}/campaigns`, desc: "V3 Campaigns by Advertiser" },
    
    // V2 endpoints (fallback)
    { url: "https://ads-api.reddit.com/api/v2/advertisers", desc: "V2 Advertisers" },
    { url: "https://ads-api.reddit.com/api/v2/campaigns", desc: "V2 Campaigns" },
    { url: `https://ads-api.reddit.com/api/v2/advertisers/${accountId}`, desc: "V2 Advertiser by ID" },
    { url: `https://ads-api.reddit.com/api/v2/advertisers/${accountId}/campaigns`, desc: "V2 Campaigns by Advertiser" },
    
    // Alternative base URLs
    { url: "https://api.reddit.com/ads/v3/advertisers", desc: "Alternative V3 Advertisers" },
    { url: "https://www.reddit.com/api/ads/v3/advertisers", desc: "WWW V3 Advertisers" },
    
    // Reporting API v3 (mentioned in migration docs)
    { url: "https://ads-api.reddit.com/api/v3/reporting/advertisers", desc: "V3 Reporting Advertisers" },
    { url: `https://ads-api.reddit.com/api/v3/reporting/advertisers/${accountId}/campaigns`, desc: "V3 Reporting Campaigns" },
  ];

  let foundWorking = false;

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
        foundWorking = true;
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

  if (!foundWorking) {
    console.log("❌ No working endpoint found");
    console.log("\nPossible issues:");
    console.log("1. Reddit Ads API requires Business Manager integration");
    console.log("2. Token might need to be refreshed or re-generated");
    console.log("3. API endpoints might have changed");
    console.log("4. Account might not have Ads API access enabled");
    return { success: false };
  }
}

testRedditAPI()
  .then((result) => {
    if (result && result.success) {
      console.log("\n✅ Found working endpoint:", result.url);
      process.exit(0);
    } else {
      console.log("\n❌ Could not find working Reddit Ads API endpoint");
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
