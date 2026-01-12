/**
 * Test Google Ads API with direct access token
 */

const ACCESS_TOKEN = process.env.GOOGLE_ADS_ACCESS_TOKEN;
const DEVELOPER_TOKEN = "zH1MEYol-aW8zN34amgT3g";
const CUSTOMER_ID = "8405767621"; // Without dashes

async function testGoogleAdsAPI() {
  console.log("🔍 Testing Google Ads API with direct access token...\n");
  console.log(`Customer ID: ${CUSTOMER_ID}`);
  console.log(`Developer Token: ${DEVELOPER_TOKEN.substring(0, 20)}...\n`);

  try {
    // Build the Google Ads API query
    const query = `
      SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions,
        metrics.ctr,
        metrics.average_cpc
      FROM campaign
      WHERE segments.date BETWEEN '20250101' AND '20250109'
      ORDER BY metrics.impressions DESC
      LIMIT 10
    `;

    // Try different endpoint formats
    const possibleEndpoints = [
      `https://googleads.googleapis.com/v16/customers/${CUSTOMER_ID}/googleAds:search`,
      `https://googleads.googleapis.com/v16/customers/${CUSTOMER_ID.replace(/-/g, "")}/googleAds:search`,
      `https://googleads.googleapis.com/v15/customers/${CUSTOMER_ID}/googleAds:search`,
      `https://googleads.googleapis.com/v15/customers/${CUSTOMER_ID.replace(/-/g, "")}/googleAds:search`,
      `https://googleads.googleapis.com/v14/customers/${CUSTOMER_ID}/googleAds:search`,
      `https://googleads.googleapis.com/v14/customers/${CUSTOMER_ID.replace(/-/g, "")}/googleAds:search`,
    ];

    let apiUrl = possibleEndpoints[0];
    let workingEndpoint = null;

    // Try to find working endpoint
    for (const endpoint of possibleEndpoints) {
      try {
        console.log(`   Trying: ${endpoint}`);
        const testResponse = await fetch(endpoint, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            "developer-token": DEVELOPER_TOKEN,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: "SELECT campaign.id FROM campaign LIMIT 1" }),
        });
        
        if (testResponse.status !== 404) {
          workingEndpoint = endpoint;
          apiUrl = endpoint;
          console.log(`   ✅ Found working endpoint: ${endpoint}`);
          break;
        }
      } catch (error) {
        // Continue
      }
    }

    if (!workingEndpoint) {
      apiUrl = possibleEndpoints[0]; // Use first one for full test
    }

    console.log("1. Sending request to Google Ads API...");
    console.log(`   URL: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "developer-token": DEVELOPER_TOKEN,
        "Content-Type": "application/json",
        "login-customer-id": CUSTOMER_ID,
      },
      body: JSON.stringify({
        query: query.trim(),
      }),
    });

    console.log(`   Status: ${response.status} ${response.statusText}\n`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Google Ads API Error:");
      console.error(errorText);
      
      // Try to parse as JSON
      try {
        const errorJson = JSON.parse(errorText);
        console.error("\nParsed Error:", JSON.stringify(errorJson, null, 2));
      } catch (e) {
        // Not JSON, that's fine
      }
      
      return false;
    }

    const data = await response.json();
    console.log("✅ Google Ads API Success!");
    console.log(`   Results: ${data.results?.length || 0} campaigns found\n`);

    if (data.results && data.results.length > 0) {
      console.log("Sample campaign data:");
      data.results.slice(0, 3).forEach((result, index) => {
        const campaign = result.campaign;
        const metrics = result.metrics;
        console.log(`\n   Campaign ${index + 1}:`);
        console.log(`   - ID: ${campaign?.id}`);
        console.log(`   - Name: ${campaign?.name}`);
        console.log(`   - Status: ${campaign?.status}`);
        console.log(`   - Impressions: ${metrics?.impressions || 0}`);
        console.log(`   - Clicks: ${metrics?.clicks || 0}`);
        console.log(`   - Cost: $${metrics?.costMicros ? (metrics.costMicros / 1_000_000).toFixed(2) : "0.00"}`);
        console.log(`   - CTR: ${metrics?.ctr ? (metrics.ctr * 100).toFixed(2) : "0.00"}%`);
      });
    } else {
      console.log("   No campaigns found for this date range.");
    }

    return true;
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error("Stack:", error.stack);
    return false;
  }
}

testGoogleAdsAPI()
  .then((success) => {
    console.log(success ? "\n✅ Google Ads API test completed successfully!" : "\n❌ Google Ads API test failed");
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
