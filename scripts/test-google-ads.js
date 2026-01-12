/**
 * Test Google Ads API with OAuth credentials
 */

const CLIENT_ID = process.env.GOOGLE_ADS_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_ADS_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_ADS_REFRESH_TOKEN;
const DEVELOPER_TOKEN = "zH1MEYol-aW8zN34amgT3g";
const CUSTOMER_ID = "8405767621"; // Without dashes

async function getAccessToken() {
  console.log("1. Getting OAuth access token...");
  
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("❌ Failed to get access token:", errorText);
    return null;
  }

  const data = await response.json();
  console.log("✅ Access token obtained");
  console.log("   Token expires in:", data.expires_in, "seconds");
  return data.access_token;
}

async function testGoogleAdsAPI() {
  console.log("🔍 Testing Google Ads API...\n");

  try {
    // Step 1: Get access token
    const accessToken = await getAccessToken();
    if (!accessToken) {
      console.log("\n❌ Could not get access token");
      return false;
    }

    console.log("");

    // Step 2: Test Google Ads API query
    console.log("2. Testing Google Ads API query...");
    console.log(`   Customer ID: ${CUSTOMER_ID}`);
    
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

    const apiUrl = `https://googleads.googleapis.com/v16/customers/${CUSTOMER_ID}/googleAds:search`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "developer-token": DEVELOPER_TOKEN,
        "Content-Type": "application/json",
        "login-customer-id": CUSTOMER_ID,
      },
      body: JSON.stringify({
        query: query.trim(),
      }),
    });

    console.log(`   Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Google Ads API Error:", errorText);
      return false;
    }

    const data = await response.json();
    console.log("✅ Google Ads API Success!");
    console.log("   Results:", data.results?.length || 0, "campaigns found");
    
    if (data.results && data.results.length > 0) {
      console.log("\n   Sample campaign data:");
      const firstResult = data.results[0];
      console.log("   - Campaign ID:", firstResult.campaign?.id);
      console.log("   - Campaign Name:", firstResult.campaign?.name);
      console.log("   - Status:", firstResult.campaign?.status);
      console.log("   - Impressions:", firstResult.metrics?.impressions);
      console.log("   - Clicks:", firstResult.metrics?.clicks);
      console.log("   - Cost:", firstResult.metrics?.costMicros ? (firstResult.metrics.costMicros / 1_000_000) : 0);
    }

    return true;
  } catch (error) {
    console.error("\n❌ Error:", error.message);
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
