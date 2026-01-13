/**
 * Test Google Ads API with provided credentials
 */

const fs = require('fs');
const path = require('path');

// Load .env.local manually
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, ''); // Remove quotes
      process.env[key] = value;
    }
  });
}

const CLIENT_ID = process.env.GOOGLE_ADS_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_ADS_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_ADS_REFRESH_TOKEN;
const DEVELOPER_TOKEN = process.env.GOOGLE_ADS_DEVELOPER_TOKEN || "zH1MEYol-aW8zN34amgT3g";
const CUSTOMER_ID = process.env.GOOGLE_ADS_CUSTOMER_ID?.replace(/-/g, "") || "8405767621";
const LOGIN_CUSTOMER_ID = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID?.replace(/-/g, "") || "2038330622";

async function getAccessToken() {
  console.log("1. Getting OAuth access token...");
  console.log(`   Client ID: ${CLIENT_ID ? '✅ Set' : '❌ Missing'}`);
  console.log(`   Client Secret: ${CLIENT_SECRET ? '✅ Set' : '❌ Missing'}`);
  console.log(`   Refresh Token: ${REFRESH_TOKEN ? '✅ Set' : '❌ Missing'}`);
  
  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
    console.error("❌ Missing OAuth credentials");
    return null;
  }
  
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
  return data.access_token;
}

async function testGoogleAdsAPI() {
  console.log("\n🔍 Testing Google Ads API...\n");

  try {
    // Step 1: Get access token
    const accessToken = await getAccessToken();
    if (!accessToken) {
      console.log("\n❌ Could not get access token");
      return false;
    }

    console.log("\n2. Testing Google Ads API query...");
    console.log(`   Customer ID: ${CUSTOMER_ID}`);
    console.log(`   Login Customer ID (Manager): ${LOGIN_CUSTOMER_ID}`);
    console.log(`   Developer Token: ${DEVELOPER_TOKEN}`);
    
    // Get date range (last 7 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    
    const startDateStr = startDate.toISOString().split('T')[0].replace(/-/g, '');
    const endDateStr = endDate.toISOString().split('T')[0].replace(/-/g, '');
    
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
      WHERE segments.date BETWEEN '${startDateStr}' AND '${endDateStr}'
      ORDER BY metrics.impressions DESC
      LIMIT 10
    `;

    // Try with manager account first, then customer account
    let apiUrl = `https://googleads.googleapis.com/v16/customers/${CUSTOMER_ID}/googleAds:search`;
    
    // Build headers
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "developer-token": DEVELOPER_TOKEN,
      "Content-Type": "application/json",
    };
    
    // Add login-customer-id header for manager accounts
    if (LOGIN_CUSTOMER_ID && LOGIN_CUSTOMER_ID !== CUSTOMER_ID) {
      headers["login-customer-id"] = LOGIN_CUSTOMER_ID;
    }

    console.log(`   API URL: ${apiUrl}`);
    console.log(`   Headers: ${JSON.stringify(Object.keys(headers), null, 2)}`);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query: query.trim(),
      }),
    });

    console.log(`   Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("\n❌ Google Ads API Error:");
      console.error(errorText);
      
      // Try to parse and show helpful error
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error) {
          console.error("\nError Details:");
          console.error("  Code:", errorJson.error.code);
          console.error("  Message:", errorJson.error.message);
          if (errorJson.error.status) {
            console.error("  Status:", errorJson.error.status);
          }
        }
      } catch (e) {
        // Not JSON, already printed
      }
      
      return false;
    }

    const data = await response.json();
    console.log("\n✅ Google Ads API Success!");
    console.log(`   Results: ${data.results?.length || 0} campaigns found`);
    
    if (data.results && data.results.length > 0) {
      console.log("\n   Sample campaign data:");
      data.results.slice(0, 3).forEach((result, index) => {
        console.log(`\n   Campaign ${index + 1}:`);
        console.log(`   - ID: ${result.campaign?.id}`);
        console.log(`   - Name: ${result.campaign?.name}`);
        console.log(`   - Status: ${result.campaign?.status}`);
        console.log(`   - Impressions: ${result.metrics?.impressions || 0}`);
        console.log(`   - Clicks: ${result.metrics?.clicks || 0}`);
        console.log(`   - Cost: $${result.metrics?.costMicros ? (result.metrics.costMicros / 1_000_000).toFixed(2) : '0.00'}`);
        console.log(`   - CTR: ${result.metrics?.ctr ? (result.metrics.ctr * 100).toFixed(2) : '0.00'}%`);
      });
    } else {
      console.log("\n   ⚠️  No campaigns found for the date range");
      console.log("   This could mean:");
      console.log("   - No campaigns exist in this account");
      console.log("   - No data for the selected date range");
      console.log("   - Campaigns exist but have no activity");
    }

    return true;
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error(error.stack);
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
