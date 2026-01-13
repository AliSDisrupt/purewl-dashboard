/**
 * List accessible Google Ads customers
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
    console.log("1. Getting OAuth access token...");
    const accessToken = await getAccessToken();
    console.log("✅ Access token obtained\n");

    console.log("2. Fetching accessible customers...");
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
      return false;
    }

    const data = await response.json();
    console.log("✅ Success! Accessible customers:");
    
    if (data.resourceNames && data.resourceNames.length > 0) {
      console.log("\n📋 Customer IDs found:");
      data.resourceNames.forEach((resourceName, index) => {
        const customerId = resourceName.replace("customers/", "");
        console.log(`   ${index + 1}. ${customerId}`);
      });
    } else {
      console.log("   No customers found");
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
