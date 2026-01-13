/**
 * Test Google Ads API with different configurations
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
const CUSTOMER_ID = process.env.GOOGLE_ADS_CUSTOMER_ID?.replace(/-/g, "") || "8405767621";
const LOGIN_CUSTOMER_ID = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID?.replace(/-/g, "") || "2038330622";

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

async function testConfiguration(customerId, loginCustomerId, useLoginHeader, apiVersion = 'v16') {
  const accessToken = await getAccessToken();
  
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

  const apiUrl = `https://googleads.googleapis.com/${apiVersion}/customers/${customerId}/googleAds:search`;
  
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "developer-token": DEVELOPER_TOKEN,
    "Content-Type": "application/json",
  };
  
  if (useLoginHeader && loginCustomerId && loginCustomerId !== customerId) {
    headers["login-customer-id"] = loginCustomerId;
  }

  console.log(`\n  Testing: Customer=${customerId}, Login=${loginCustomerId || 'none'}, API=${apiVersion}`);
  
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({ query: query.trim() }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`  ✅ SUCCESS! Found ${data.results?.length || 0} campaigns`);
      return { success: true, data };
    } else {
      const errorText = await response.text();
      let errorMessage = `Status ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.message) {
          errorMessage = errorJson.error.message;
        }
      } catch (e) {
        // Not JSON
      }
      console.log(`  ❌ FAILED: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  } catch (error) {
    console.log(`  ❌ ERROR: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log("🔍 Testing Google Ads API with different configurations...\n");
  console.log("Getting access token...");
  await getAccessToken();
  console.log("✅ Access token obtained\n");

  const tests = [
    { customerId: CUSTOMER_ID, loginCustomerId: LOGIN_CUSTOMER_ID, useLoginHeader: true, apiVersion: 'v16', name: 'Customer ID with Manager Login (v16)' },
    { customerId: LOGIN_CUSTOMER_ID, loginCustomerId: null, useLoginHeader: false, apiVersion: 'v16', name: 'Manager ID directly (v16)' },
    { customerId: CUSTOMER_ID, loginCustomerId: null, useLoginHeader: false, apiVersion: 'v16', name: 'Customer ID only (v16)' },
    { customerId: CUSTOMER_ID, loginCustomerId: LOGIN_CUSTOMER_ID, useLoginHeader: true, apiVersion: 'v17', name: 'Customer ID with Manager Login (v17)' },
  ];

  let successCount = 0;
  for (const test of tests) {
    console.log(`\nTest: ${test.name}`);
    const result = await testConfiguration(test.customerId, test.loginCustomerId, test.useLoginHeader, test.apiVersion);
    if (result.success) {
      successCount++;
      console.log(`\n✅ Found working configuration!`);
      if (result.data?.results?.length > 0) {
        console.log(`\nSample campaign:`);
        const campaign = result.data.results[0];
        console.log(`  - Name: ${campaign.campaign?.name}`);
        console.log(`  - Impressions: ${campaign.metrics?.impressions || 0}`);
        console.log(`  - Clicks: ${campaign.metrics?.clicks || 0}`);
      }
      break; // Stop on first success
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  if (successCount > 0) {
    console.log("✅ At least one configuration worked!");
  } else {
    console.log("❌ All configurations failed. Possible issues:");
    console.log("  1. Developer token not approved");
    console.log("  2. OAuth account doesn't have access to Google Ads account");
    console.log("  3. Customer ID is incorrect");
    console.log("  4. API needs more time to propagate after enabling");
  }
}

runTests()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
