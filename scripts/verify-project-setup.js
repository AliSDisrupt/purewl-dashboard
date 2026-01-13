/**
 * Verify Google Cloud Project Setup
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

console.log("🔍 Google Ads API Setup Verification\n");
console.log("=".repeat(60));
console.log("\n📋 Checklist:\n");

console.log("1. ✅ Credentials configured in .env.local");
console.log(`   Client ID: ${CLIENT_ID ? CLIENT_ID.substring(0, 30) + '...' : 'Missing'}`);

console.log("\n2. ⚠️  CRITICAL: Verify OAuth credentials are from the SAME Google Cloud Project");
console.log("   where Google Ads API is enabled!");
console.log("\n   Steps to verify:");
console.log("   a) Go to https://console.cloud.google.com/");
console.log("   b) Check which project your OAuth Client ID belongs to:");
console.log(`      - Your Client ID: ${CLIENT_ID || 'N/A'}`);
console.log("      - Go to APIs & Services → Credentials");
console.log("      - Find your OAuth 2.0 Client ID");
console.log("      - Note the Project name");
console.log("   c) Verify Google Ads API is enabled in THE SAME project:");
console.log("      - Go to APIs & Services → Library");
console.log("      - Search 'Google Ads API'");
console.log("      - Ensure it shows 'Enabled' in the SAME project");

console.log("\n3. ⚠️  Verify Developer Token is linked to the correct project:");
console.log("   a) Go to https://ads.google.com/");
console.log("   b) Tools & Settings → API Center");
console.log("   c) Check your developer token");
console.log("   d) Verify it's associated with the correct Google Cloud Project");

console.log("\n4. ⚠️  Verify OAuth account has access:");
console.log("   a) Go to https://ads.google.com/");
console.log("   b) Tools & Settings → Access and Security");
console.log("   c) Verify the email used for OAuth has access to the account");

console.log("\n5. ⚠️  API Version Check:");
console.log("   The Google Ads API might require a specific version.");
console.log("   Current test uses: v16");
console.log("   Try checking Google Ads API documentation for latest version");

console.log("\n" + "=".repeat(60));
console.log("\n💡 Common Issues:");
console.log("   - OAuth credentials from different project than API");
console.log("   - Developer token not linked to the project");
console.log("   - OAuth account doesn't have Google Ads access");
console.log("   - API needs time to propagate (wait 10-15 minutes)");

console.log("\n🔧 Next Steps:");
console.log("   1. Verify all items above");
console.log("   2. Ensure OAuth Client ID and Google Ads API are in SAME project");
console.log("   3. Wait 10-15 minutes if you just made changes");
console.log("   4. Try testing again");

console.log("\n");
