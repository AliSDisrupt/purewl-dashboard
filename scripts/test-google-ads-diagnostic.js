/**
 * Diagnostic test for Google Ads API
 * Tests different endpoint formats and customer IDs
 */

const CLIENT_ID = "1027443338412-isjqls5bocco22hp2m3lsne8krql7q03.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REFRESH_TOKEN = process.env.GOOGLE_ADS_REFRESH_TOKEN;
const DEVELOPER_TOKEN = "zH1MEYol-aW8zN34amgT3g";
const CUSTOMER_ID = "8405767621"; // Without dashes
const LOGIN_CUSTOMER_ID = "8405767621"; // Without dashes

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

async function testEndpoint(apiUrl, headers, description) {
  console.log(`\n📋 Testing: ${description}`);
  console.log(`   URL: ${apiUrl}`);
  
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        query: "SELECT customer.id, customer.descriptive_name FROM customer LIMIT 1",
      }),
    });

    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ SUCCESS! Response:`, JSON.stringify(data, null, 2).substring(0, 500));
      return true;
    } else {
      const errorText = await response.text();
      console.log(`   ❌ Failed: ${errorText.substring(0, 300)}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

async function runDiagnostics() {
  console.log("🔍 Google Ads API Diagnostic Test\n");
  console.log("=".repeat(60));

  try {
    // Step 1: Get access token
    console.log("\n1. Getting OAuth access token...");
    const accessToken = await getAccessToken();
    console.log("✅ Access token obtained");
    console.log(`   Token: ${accessToken.substring(0, 50)}...`);

    // Step 2: Test different endpoint configurations
    console.log("\n2. Testing different endpoint configurations...");
    
    const baseHeaders = {
      Authorization: `Bearer ${accessToken}`,
      "developer-token": DEVELOPER_TOKEN,
      "Content-Type": "application/json",
    };

    // Test 1: Standard endpoint with login-customer-id
    await testEndpoint(
      `https://googleads.googleapis.com/v16/customers/${CUSTOMER_ID}/googleAds:search`,
      {
        ...baseHeaders,
        "login-customer-id": LOGIN_CUSTOMER_ID,
      },
      "Standard endpoint with login-customer-id"
    );

    // Test 2: Without login-customer-id
    await testEndpoint(
      `https://googleads.googleapis.com/v16/customers/${CUSTOMER_ID}/googleAds:search`,
      baseHeaders,
      "Standard endpoint without login-customer-id"
    );

    // Test 3: Using login-customer-id as the customer ID
    await testEndpoint(
      `https://googleads.googleapis.com/v16/customers/${LOGIN_CUSTOMER_ID}/googleAds:search`,
      {
        ...baseHeaders,
        "login-customer-id": LOGIN_CUSTOMER_ID,
      },
      "Using login-customer-id as customer ID"
    );

    // Test 4: Try v15 API
    await testEndpoint(
      `https://googleads.googleapis.com/v15/customers/${CUSTOMER_ID}/googleAds:search`,
      {
        ...baseHeaders,
        "login-customer-id": LOGIN_CUSTOMER_ID,
      },
      "v15 API with login-customer-id"
    );

    // Test 5: Try v14 API
    await testEndpoint(
      `https://googleads.googleapis.com/v14/customers/${CUSTOMER_ID}/googleAds:search`,
      {
        ...baseHeaders,
        "login-customer-id": LOGIN_CUSTOMER_ID,
      },
      "v14 API with login-customer-id"
    );

    console.log("\n" + "=".repeat(60));
    console.log("\n💡 If all tests fail with 404:");
    console.log("   1. Verify Google Ads API is enabled in Google Cloud Console");
    console.log("   2. Check that the customer ID is correct");
    console.log("   3. Verify the developer token is approved");
    console.log("   4. Ensure the OAuth app has Google Ads API access");

  } catch (error) {
    console.error("\n❌ Fatal error:", error.message);
  }
}

runDiagnostics()
  .then(() => {
    console.log("\n✅ Diagnostic test completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
