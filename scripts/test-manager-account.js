/**
 * Test Google Ads API using Manager Account
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
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      process.env[key] = value;
    }
  });
}

const CLIENT_ID = process.env.GOOGLE_ADS_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_ADS_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_ADS_REFRESH_TOKEN;
const DEVELOPER_TOKEN = process.env.GOOGLE_ADS_DEVELOPER_TOKEN || "zH1MEYol-aW8zN34amgT3g";
const MANAGER_ID = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID?.replace(/-/g, "") || "2038330622";
const CUSTOMER_ID = process.env.GOOGLE_ADS_CUSTOMER_ID?.replace(/-/g, "") || "8405767621";

async function getAccessToken() {
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
    throw new Error(`Failed to get access token: ${errorText}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function testManagerAccount() {
  console.log("🔍 Testing Google Ads API with Manager Account...\n");
  
  const accessToken = await getAccessToken();
  console.log("✅ Access token obtained\n");
  
  // Test 1: Try to list accessible customers using manager account
  console.log("1. Listing accessible customers from manager account...");
  try {
    const listUrl = `https://googleads.googleapis.com/v16/customers/${MANAGER_ID}:listAccessibleCustomers`;
    const listResponse = await fetch(listUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "developer-token": DEVELOPER_TOKEN,
        "Content-Type": "application/json",
      },
    });
    
    console.log(`   Status: ${listResponse.status}`);
    
    if (listResponse.ok) {
      const listData = await listResponse.json();
      console.log("   ✅ Success! Accessible customers:");
      if (listData.resourceNames && listData.resourceNames.length > 0) {
        listData.resourceNames.forEach((resource, index) => {
          const customerId = resource.replace("customers/", "");
          console.log(`      ${index + 1}. ${customerId}`);
        });
      } else {
        console.log("      No customers found");
      }
    } else {
      const errorText = await listResponse.text();
      console.log(`   ❌ Failed: ${errorText.substring(0, 200)}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  // Test 2: Try querying manager account directly
  console.log("\n2. Querying manager account directly...");
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
      metrics.cost_micros
    FROM campaign
    WHERE segments.date BETWEEN '${startDateStr}' AND '${endDateStr}'
    ORDER BY metrics.impressions DESC
    LIMIT 5
  `;
  
  try {
    const apiUrl = `https://googleads.googleapis.com/v16/customers/${MANAGER_ID}/googleAds:search`;
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "developer-token": DEVELOPER_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: query.trim() }),
    });
    
    console.log(`   Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ Success! Found ${data.results?.length || 0} campaigns`);
      if (data.results && data.results.length > 0) {
        console.log("\n   Sample campaigns:");
        data.results.slice(0, 3).forEach((result, index) => {
          console.log(`      ${index + 1}. ${result.campaign?.name || 'N/A'}`);
          console.log(`         Impressions: ${result.metrics?.impressions || 0}`);
          console.log(`         Clicks: ${result.metrics?.clicks || 0}`);
        });
      }
    } else {
      const errorText = await response.text();
      console.log(`   ❌ Failed`);
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error) {
          console.log(`   Error: ${errorJson.error.message || errorJson.error.code}`);
        }
      } catch (e) {
        console.log(`   Response: ${errorText.substring(0, 300)}`);
      }
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  // Test 3: Try querying customer account through manager
  console.log("\n3. Querying customer account through manager...");
  try {
    const apiUrl = `https://googleads.googleapis.com/v16/customers/${CUSTOMER_ID}/googleAds:search`;
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "developer-token": DEVELOPER_TOKEN,
        "Content-Type": "application/json",
        "login-customer-id": MANAGER_ID, // Manager account
      },
      body: JSON.stringify({ query: query.trim() }),
    });
    
    console.log(`   Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ Success! Found ${data.results?.length || 0} campaigns`);
      if (data.results && data.results.length > 0) {
        console.log("\n   Sample campaigns:");
        data.results.slice(0, 3).forEach((result, index) => {
          console.log(`      ${index + 1}. ${result.campaign?.name || 'N/A'}`);
          console.log(`         Impressions: ${result.metrics?.impressions || 0}`);
          console.log(`         Clicks: ${result.metrics?.clicks || 0}`);
        });
      }
    } else {
      const errorText = await response.text();
      console.log(`   ❌ Failed`);
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error) {
          console.log(`   Error: ${errorJson.error.message || errorJson.error.code}`);
          if (errorJson.error.details) {
            console.log(`   Details: ${JSON.stringify(errorJson.error.details, null, 2)}`);
          }
        }
      } catch (e) {
        console.log(`   Response: ${errorText.substring(0, 300)}`);
      }
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
}

testManagerAccount()
  .then(() => {
    console.log("\n✅ Testing completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
