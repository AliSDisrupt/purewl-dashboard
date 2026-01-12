/**
 * Generate Google Ads OAuth Refresh Token
 * 
 * This script helps you generate a refresh token for Google Ads API
 * 
 * Steps:
 * 1. Run this script: node scripts/generate-google-ads-refresh-token.js
 * 2. It will print an authorization URL
 * 3. Open that URL in your browser and authorize
 * 4. Copy the authorization code from the redirect URL
 * 5. Paste it when prompted
 * 6. The script will exchange it for a refresh token
 */

const CLIENT_ID = "1027443338412-isjqls5bocco22hp2m3lsne8krql7q03.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REDIRECT_URI = "urn:ietf:wg:oauth:2.0:oob"; // For installed apps
const SCOPE = "https://www.googleapis.com/auth/adwords";

const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function generateRefreshToken() {
  console.log("\n🔐 Google Ads OAuth Refresh Token Generator\n");
  console.log("CLIENT_ID:", CLIENT_ID);
  console.log("CLIENT_SECRET:", CLIENT_SECRET);
  console.log("\n" + "=".repeat(60));
  console.log("STEP 1: Get Authorization Code");
  console.log("=".repeat(60));
  
  // Build authorization URL
  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", CLIENT_ID);
  authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", SCOPE);
  authUrl.searchParams.set("access_type", "offline");
  authUrl.searchParams.set("prompt", "consent");

  console.log("\n1. Open this URL in your browser:");
  console.log("\n" + authUrl.toString() + "\n");
  console.log("2. Sign in with your Google account");
  console.log("3. Grant permissions for Google Ads API");
  console.log("4. You'll be redirected to a page with an authorization code");
  console.log("5. Copy the entire authorization code\n");

  const authCode = await question("Paste the authorization code here: ");

  if (!authCode || authCode.trim() === "") {
    console.error("\n❌ No authorization code provided");
    rl.close();
    process.exit(1);
  }

  console.log("\n" + "=".repeat(60));
  console.log("STEP 2: Exchange Authorization Code for Refresh Token");
  console.log("=".repeat(60));

  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: authCode.trim(),
        grant_type: "authorization_code",
        redirect_uri: REDIRECT_URI,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("\n❌ Failed to exchange code for token:");
      console.error(errorText);
      rl.close();
      process.exit(1);
    }

    const data = await response.json();
    
    console.log("\n✅ Success! Here are your tokens:\n");
    console.log("=".repeat(60));
    console.log("ACCESS TOKEN (expires in 1 hour):");
    console.log(data.access_token);
    console.log("\n" + "=".repeat(60));
    console.log("REFRESH TOKEN (save this!):");
    console.log(data.refresh_token);
    console.log("\n" + "=".repeat(60));
    console.log("\n📝 Add this to your .env.local file:");
    console.log(`GOOGLE_ADS_REFRESH_TOKEN=${data.refresh_token}`);
    console.log("\n✅ You can now use this refresh token with your CLIENT_ID and CLIENT_SECRET\n");

    rl.close();
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    rl.close();
    process.exit(1);
  }
}

generateRefreshToken();
