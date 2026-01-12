/**
 * Test Google Ads API with customer verification
 * This script tries to verify the customer ID and check API access
 */

const CLIENT_ID = "1027443338412-isjqls5bocco22hp2m3lsne8krql7q03.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REFRESH_TOKEN = process.env.GOOGLE_ADS_REFRESH_TOKEN;
const DEVELOPER_TOKEN = "zH1MEYol-aW8zN34amgT3g";
const CUSTOMER_ID = "8405767621"; // Without dashes

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

async function testCustomerAccess() {
  console.log("🔍 Testing Google Ads Customer Access...\n");
  console.log("=".repeat(60));

  try {
    // Step 1: Get access token
    console.log("1. Getting OAuth access token...");
    const accessToken = await getAccessToken();
    console.log("✅ Access token obtained\n");

    // Step 2: Try to get customer information
    console.log("2. Testing customer access...");
    console.log(`   Customer ID: ${CUSTOMER_ID}`);
    console.log(`   Developer Token: ${DEVELOPER_TOKEN.substring(0, 20)}...\n`);

    // Try a simple query to get customer info
    const query = `
      SELECT
        customer.id,
        customer.descriptive_name,
        customer.currency_code,
        customer.time_zone
      FROM customer
      LIMIT 1
    `;

    const apiUrl = `https://googleads.googleapis.com/v16/customers/${CUSTOMER_ID}/googleAds:search`;

    console.log(`   API URL: ${apiUrl}\n`);

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
    console.log(`   Headers:`, Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log(`\n   Response length: ${responseText.length} characters`);

    if (!response.ok) {
      console.log("\n❌ Request failed");
      
      // Try to parse as JSON
      try {
        const errorJson = JSON.parse(responseText);
        console.log("\n📋 Parsed Error Response:");
        console.log(JSON.stringify(errorJson, null, 2));
        
        // Check for GoogleAdsFailure
        if (errorJson.error) {
          console.log("\n🔍 Error Details:");
          console.log(`   Code: ${errorJson.error.code || 'N/A'}`);
          console.log(`   Message: ${errorJson.error.message || 'N/A'}`);
          if (errorJson.error.status) {
            console.log(`   Status: ${errorJson.error.status}`);
          }
        }
      } catch (e) {
        console.log("\n📋 Raw Error Response (first 500 chars):");
        console.log(responseText.substring(0, 500));
      }

      // Check if it's an HTML error page (404 from Google)
      if (responseText.includes("<!DOCTYPE html>")) {
        console.log("\n⚠️  HTML error page received - This usually means:");
        console.log("   1. The Google Ads API is not enabled in Google Cloud Console");
        console.log("   2. The endpoint URL is incorrect");
        console.log("   3. The customer ID doesn't exist or isn't accessible");
      }

      return false;
    }

    const data = JSON.parse(responseText);
    console.log("\n✅ SUCCESS! Customer data retrieved:");
    console.log(JSON.stringify(data, null, 2));

    if (data.results && data.results.length > 0) {
      const customer = data.results[0].customer;
      console.log("\n📋 Customer Information:");
      console.log(`   ID: ${customer.id}`);
      console.log(`   Name: ${customer.descriptiveName}`);
      console.log(`   Currency: ${customer.currencyCode}`);
      console.log(`   Time Zone: ${customer.timeZone}`);
    }

    return true;
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error(error.stack);
    return false;
  }
}

testCustomerAccess()
  .then((success) => {
    console.log("\n" + "=".repeat(60));
    console.log(success ? "✅ Test completed successfully!" : "❌ Test failed");
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
