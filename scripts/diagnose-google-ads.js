/**
 * Diagnose Google Ads API setup issues
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

async function diagnose() {
  console.log("🔍 Google Ads API Diagnosis\n");
  console.log("=".repeat(60));
  
  // Check credentials
  console.log("\n1. Checking Credentials:");
  console.log(`   Client ID: ${CLIENT_ID ? '✅ Set' : '❌ Missing'}`);
  console.log(`   Client Secret: ${CLIENT_SECRET ? '✅ Set' : '❌ Missing'}`);
  console.log(`   Refresh Token: ${REFRESH_TOKEN ? '✅ Set' : '❌ Missing'}`);
  console.log(`   Developer Token: ${DEVELOPER_TOKEN ? '✅ Set' : '❌ Missing'}`);
  console.log(`   Customer ID: ${CUSTOMER_ID}`);
  console.log(`   Manager ID: ${LOGIN_CUSTOMER_ID}`);
  
  // Test OAuth
  console.log("\n2. Testing OAuth Token Refresh:");
  try {
    const accessToken = await getAccessToken();
    console.log("   ✅ OAuth token refresh successful");
    console.log(`   Token length: ${accessToken.length} characters`);
  } catch (error) {
    console.log(`   ❌ OAuth token refresh failed: ${error.message}`);
    return;
  }
  
  // Test API endpoint with detailed error
  console.log("\n3. Testing Google Ads API Endpoint:");
  const accessToken = await getAccessToken();
  
  // Try a simple query
  const query = `SELECT customer.id, customer.descriptive_name FROM customer LIMIT 1`;
  const apiUrl = `https://googleads.googleapis.com/v16/customers/${CUSTOMER_ID}/googleAds:search`;
  
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "developer-token": DEVELOPER_TOKEN,
    "Content-Type": "application/json",
  };
  
  if (LOGIN_CUSTOMER_ID && LOGIN_CUSTOMER_ID !== CUSTOMER_ID) {
    headers["login-customer-id"] = LOGIN_CUSTOMER_ID;
  }
  
  console.log(`   Endpoint: ${apiUrl}`);
  console.log(`   Developer Token: ${DEVELOPER_TOKEN}`);
  console.log(`   Headers: ${Object.keys(headers).join(', ')}`);
  
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({ query }),
    });
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    const responseText = await response.text();
    
    if (response.ok) {
      console.log("   ✅ API call successful!");
      try {
        const data = JSON.parse(responseText);
        console.log(`   Results: ${JSON.stringify(data, null, 2)}`);
      } catch (e) {
        console.log(`   Response: ${responseText.substring(0, 200)}...`);
      }
    } else {
      console.log(`   ❌ API call failed`);
      console.log(`   Response: ${responseText.substring(0, 500)}`);
      
      // Try to parse error
      try {
        const errorJson = JSON.parse(responseText);
        if (errorJson.error) {
          console.log("\n   Error Details:");
          console.log(`   Code: ${errorJson.error.code || 'N/A'}`);
          console.log(`   Message: ${errorJson.error.message || 'N/A'}`);
          if (errorJson.error.status) {
            console.log(`   Status: ${errorJson.error.status}`);
          }
          if (errorJson.error.details) {
            console.log(`   Details: ${JSON.stringify(errorJson.error.details, null, 2)}`);
          }
        }
      } catch (e) {
        // Not JSON
      }
      
      // Specific error guidance
      if (response.status === 404) {
        console.log("\n   💡 404 Error Troubleshooting:");
        console.log("   1. Verify Developer Token is APPROVED in Google Ads:");
        console.log("      - Go to https://ads.google.com/");
        console.log("      - Tools & Settings → API Center");
        console.log("      - Check if token shows 'Approved' status");
        console.log("   2. Verify Google Ads API is enabled:");
        console.log("      - Go to https://console.cloud.google.com/");
        console.log("      - APIs & Services → Library");
        console.log("      - Search 'Google Ads API' and ensure it's enabled");
        console.log("   3. Wait 5-10 minutes after enabling API (propagation delay)");
        console.log("   4. Verify OAuth account has access to Google Ads account");
      }
    }
  } catch (error) {
    console.log(`   ❌ Network error: ${error.message}`);
  }
  
  console.log("\n" + "=".repeat(60));
  console.log("\n📋 Next Steps:");
  console.log("1. Verify Developer Token is APPROVED (not just applied)");
  console.log("2. Ensure Google Ads API is enabled in Google Cloud Console");
  console.log("3. Verify the OAuth account email has access to the Google Ads account");
  console.log("4. Wait a few minutes if you just enabled the API");
  console.log("5. Check Google Ads API Center for any error messages");
}

diagnose()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
