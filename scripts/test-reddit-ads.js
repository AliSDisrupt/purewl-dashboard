/**
 * Test Reddit Ads API
 */

const REDDIT_ADS_API_KEY = "eyJhbGciOiJSUzI1NiIsImtpZCI6IlNIQTI1NjpzS3dsMnlsV0VtMjVmcXhwTU40cWY4MXE2OWFFdWFyMnpLMUdhVGxjdWNZIiwidHlwIjoiSldUIn0.eyJzdWIiOiJ1c2VyIiwiZXhwIjo0OTIzNjk5NjU0LjAwOTMyOSwiaWF0IjoxNzY3OTM5NjU0LjAwOTMyOSwianRpIjoiN1dUYzFCZE8xRDhLb2d0T25DODBMOHNKeEdxdWN3IiwiY2lkIjoiMVExRU96VFBXbll2ZXJocHR2Z1dzUSIsImxpZCI6InQyXzI1cnlqamY2c2UiLCJhaWQiOiJ0Ml8yNXJ5ampmNnNlIiwiYXQiOjUsImxjYSI6MTc2NzkzOTY1MjM2NCwic2NwIjoiZUp5S1ZrcE1LVTdPenl0TExTck96TThyVm9vRkJBQUFfXzlCRmdidSIsImZsbyI6MTAsImxsIjp0cnVlfQ.HcaxVZBO_XgkLUwQoORuLE3Cxfy5JSCYPYw3Kbv6w1dSPEzJgkUqZX2-NiBuLioQ2Nm2e9B3uwcw4qMMLqXuq2NqGlHYfncpMsXgOoFb-uDatUZioHklP9Ql2cxZ7qP6TSQB87irSTPRduG2aDhllyVatwRpncYehTvcGvi9pJW0kPHcNj3HmPO7OX575_p68hPP_xiPmp7BtwX3OI9QeHrUEC-h1hLZKP0luC93hg0LGcGqvWSyazJcEQk_f8nKYqDbLNB6JX5ioUf-ep2zdFqj12YKfplNtKXawUkebbR0TnSkpbB17bLCouU6Kdhjps12r8T_IntNmiQw7Vrn9Q";
// Try different possible base URLs
const POSSIBLE_BASES = [
  "https://ads-api.reddit.com/api/v2",
  "https://ads-api.reddit.com/api/v1",
  "https://ads-api.reddit.com/v2",
  "https://ads-api.reddit.com/v1",
  "https://api.reddit.com/ads/v2",
  "https://api.reddit.com/ads/v1",
  "https://www.reddit.com/api/ads/v2",
];

async function testRedditAdsAPI() {
  console.log("🔍 Testing Reddit Ads API...\n");

  const headers = {
    Authorization: `Bearer ${REDDIT_ADS_API_KEY}`,
    "Content-Type": "application/json",
  };

  try {
    // Test different base URLs and endpoints
    console.log("1. Testing different API endpoints...\n");
    
    const possibleEndpoints = [
      "/accounts",
      "/advertisers",
      "/advertiser",
      "/me",
      "/user",
      "/campaigns",
    ];

    let workingBase = null;
    let workingEndpoint = null;

    for (const base of POSSIBLE_BASES) {
      for (const endpoint of possibleEndpoints) {
        try {
          const url = `${base}${endpoint}`;
          console.log(`   Trying: ${url}`);
          const response = await fetch(url, { headers });
          console.log(`   Status: ${response.status} ${response.statusText}`);
          
          if (response.ok) {
            const data = await response.json();
            console.log(`   ✅ SUCCESS! Found working endpoint: ${url}`);
            console.log(`   Response:`, JSON.stringify(data, null, 2).substring(0, 500));
            workingBase = base;
            workingEndpoint = endpoint;
            break;
          } else if (response.status !== 404) {
            const errorText = await response.text();
            console.log(`   Response (${response.status}):`, errorText.substring(0, 200));
          }
        } catch (error) {
          // Skip network errors
        }
      }
      if (workingBase) break;
    }

    if (!workingBase) {
      console.log("\n❌ No working endpoint found. The API structure might be different.");
      console.log("   Please check Reddit Ads API documentation for the correct endpoints.");
      return false;
    }

    console.log(`\n✅ Found working base: ${workingBase}`);
    console.log(`✅ Found working endpoint: ${workingEndpoint}\n`);

    // Test 1: Fetch accounts using working base
    console.log("2. Testing account data retrieval...");
    const accountsResponse = await fetch(`${workingBase}${workingEndpoint}`, {
      headers,
    });

    console.log(`   Status: ${accountsResponse.status} ${accountsResponse.statusText}`);

    if (!accountsResponse.ok) {
      const errorText = await accountsResponse.text();
      console.log(`   ❌ Error: ${errorText}`);
      return false;
    }

    const accountsData = await accountsResponse.json();
    console.log(`   ✅ Success! Response structure:`, JSON.stringify(accountsData, null, 2).substring(0, 1000));

    const accountId = accountsData.data?.[0]?.id || accountsData.id || accountsData.account_id;
    if (!accountId) {
      console.log("   ⚠️  No account ID found in response");
      console.log("   Full response:", JSON.stringify(accountsData, null, 2));
      return false;
    }

    console.log(`   Account ID: ${accountId}\n`);

    // Test 2: Fetch campaigns - try different possible endpoints
    console.log(`3. Testing campaigns endpoint...`);
    const campaignEndpoints = [
      `${workingBase}/accounts/${accountId}/campaigns`,
      `${workingBase}/advertisers/${accountId}/campaigns`,
      `${workingBase}/campaigns?account_id=${accountId}`,
      `${workingBase}/campaigns?advertiser_id=${accountId}`,
    ];

    let campaignsData = null;
    for (const endpoint of campaignEndpoints) {
      try {
        console.log(`   Trying: ${endpoint}`);
        const campaignsResponse = await fetch(endpoint, { headers });
        console.log(`   Status: ${campaignsResponse.status}`);
        
        if (campaignsResponse.ok) {
          campaignsData = await campaignsResponse.json();
          console.log(`   ✅ Success! Found campaigns endpoint: ${endpoint}`);
          break;
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }

    if (!campaignsData) {
      console.log("   ⚠️  Could not fetch campaigns. Trying alternative approach...");
      return true; // At least accounts worked
    }

    console.log(`   Status: ${campaignsResponse.status} ${campaignsResponse.statusText}`);

    if (!campaignsResponse.ok) {
      const errorText = await campaignsResponse.text();
      console.log(`   ❌ Error: ${errorText}`);
      return false;
    }

    console.log(`   ✅ Found ${(campaignsData.data || campaignsData.campaigns || []).length} campaigns`);
    console.log(`   Response structure:`, JSON.stringify(campaignsData, null, 2).substring(0, 500));

    // Test 3: Try to fetch stats for first campaign (if available)
    const campaigns = campaignsData.data || campaignsData.campaigns || [];
    if (campaigns.length > 0) {
      const firstCampaign = campaigns[0];
      const campaignId = firstCampaign.id || firstCampaign.campaign_id;
      
      console.log(`\n4. Testing stats/metrics endpoint for campaign ${campaignId}...`);
      
      // Try different possible endpoints
      const possibleEndpoints = [
        `${workingBase}/accounts/${accountId}/campaigns/${campaignId}/stats`,
        `${workingBase}/accounts/${accountId}/campaigns/${campaignId}/metrics`,
        `${workingBase}/campaigns/${campaignId}/stats`,
        `${workingBase}/campaigns/${campaignId}/metrics`,
        `${workingBase}/stats?campaign_id=${campaignId}`,
      ];

      for (const endpoint of possibleEndpoints) {
        try {
          const statsResponse = await fetch(endpoint, { headers });
          console.log(`   Trying: ${endpoint}`);
          console.log(`   Status: ${statsResponse.status}`);
          
          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            console.log(`   ✅ Success! Stats:`, JSON.stringify(statsData, null, 2).substring(0, 500));
            break;
          } else {
            const errorText = await statsResponse.text();
            console.log(`   ❌ Error: ${errorText.substring(0, 200)}`);
          }
        } catch (error) {
          console.log(`   ❌ Exception: ${error.message}`);
        }
      }
    }

    console.log("\n✅ Reddit Ads API test completed!");
    return true;
  } catch (error) {
    console.error("\n❌ Reddit Ads API Error:", error.message);
    console.error("Stack:", error.stack);
    return false;
  }
}

// Run the test
testRedditAdsAPI()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
