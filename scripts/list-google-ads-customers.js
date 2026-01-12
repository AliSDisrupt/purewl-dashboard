/**
 * List accessible Google Ads customers
 * This helps identify which customer IDs are available
 */

const CLIENT_ID = "1027443338412-isjqls5bocco22hp2m3lsne8krql7q03.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REFRESH_TOKEN = process.env.GOOGLE_ADS_REFRESH_TOKEN;
const DEVELOPER_TOKEN = "zH1MEYol-aW8zN34amgT3g";

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

async function listCustomers() {
  console.log("🔍 Listing accessible Google Ads customers...\n");

  try {
    // Step 1: Get access token
    console.log("1. Getting OAuth access token...");
    const accessToken = await getAccessToken();
    console.log("✅ Access token obtained\n");

    // Step 2: Try to list customers using the customer service
    // Note: This endpoint might vary, let's try the customer service
    console.log("2. Fetching accessible customers...");
    
    // Try the customer service endpoint
    const customerServiceUrl = "https://googleads.googleapis.com/v16/customers:listAccessibleCustomers";
    
    const response = await fetch(customerServiceUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "developer-token": DEVELOPER_TOKEN,
        "Content-Type": "application/json",
      },
    });

    console.log(`   Status: ${response.status} ${response.statusText}\n`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Error fetching customers:");
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
    console.log("✅ Success! Accessible customers:");
    console.log(JSON.stringify(data, null, 2));
    
    if (data.resourceNames && data.resourceNames.length > 0) {
      console.log("\n📋 Customer IDs found:");
      data.resourceNames.forEach((resourceName, index) => {
        // Extract customer ID from resource name (format: customers/1234567890)
        const customerId = resourceName.replace("customers/", "");
        console.log(`   ${index + 1}. ${customerId}`);
      });
    }

    return true;
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    return false;
  }
}

listCustomers()
  .then((success) => {
    console.log(success ? "\n✅ Customer listing completed!" : "\n❌ Customer listing failed");
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
