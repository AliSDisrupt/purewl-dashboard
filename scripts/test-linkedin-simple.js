/**
 * Simple LinkedIn API Test
 * Tests if LinkedIn API is accessible and fetching data
 */

// Read .env.local manually
const fs = require('fs');
const path = require('path');

let envVars = {};
try {
  const envPath = path.join(__dirname, '..', '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      envVars[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
    }
  });
} catch (err) {
  console.error('Could not read .env.local:', err.message);
  process.exit(1);
}

const API_BASE = envVars.LINKEDIN_API_BASE || "https://api.linkedin.com/rest";
const ACCESS_TOKEN = envVars.LINKEDIN_ACCESS_TOKEN;
const ACCOUNT_ID = "514469053";

function getHeaders() {
  return {
    "Authorization": `Bearer ${ACCESS_TOKEN}`,
    "LinkedIn-Version": "202511",
    "X-Restli-Protocol-Version": "2.0.0",
    "Content-Type": "application/json"
  };
}

async function test() {
  console.log('\n=== LinkedIn API Test ===\n');
  
  if (!ACCESS_TOKEN) {
    console.error('❌ ERROR: LINKEDIN_ACCESS_TOKEN not found in .env.local');
    return;
  }
  
  console.log('✅ Access token found');
  console.log('📋 Testing account:', ACCOUNT_ID);
  console.log('\n---\n');

  // Test Accounts
  console.log('1. Testing /adAccounts endpoint...');
  try {
    const res = await fetch(`${API_BASE}/adAccounts?q=search`, {
      headers: getHeaders(),
    });
    console.log('   Status:', res.status);
    if (res.ok) {
      const data = await res.json();
      console.log('   ✅ Success! Found', data.elements?.length || 0, 'accounts');
    } else {
      const text = await res.text();
      console.log('   ❌ Error:', text.substring(0, 200));
    }
  } catch (err) {
    console.log('   ❌ Exception:', err.message);
  }

  console.log('\n---\n');

  // Test Campaigns
  console.log('2. Testing /adCampaigns endpoint...');
  try {
    const res = await fetch(`${API_BASE}/adAccounts/${ACCOUNT_ID}/adCampaigns?q=search`, {
      headers: getHeaders(),
    });
    console.log('   Status:', res.status);
    if (res.ok) {
      const data = await res.json();
      console.log('   ✅ Success! Found', data.elements?.length || 0, 'campaigns');
      if (data.elements && data.elements.length > 0) {
        console.log('   Sample campaign:', data.elements[0].name);
      }
    } else {
      const text = await res.text();
      console.log('   ❌ Error:', text.substring(0, 200));
    }
  } catch (err) {
    console.log('   ❌ Exception:', err.message);
  }

  console.log('\n---\n');

  // Test Analytics
  console.log('3. Testing /adAnalyticsV2 endpoint...');
  try {
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() - 1);
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 30);

    const params = new URLSearchParams({
      q: "analytics",
      pivot: "ACCOUNT",
      timeGranularity: "ALL",
      "dateRange.start.day": String(startDate.getDate()),
      "dateRange.start.month": String(startDate.getMonth() + 1),
      "dateRange.start.year": String(startDate.getFullYear()),
      "dateRange.end.day": String(endDate.getDate()),
      "dateRange.end.month": String(endDate.getMonth() + 1),
      "dateRange.end.year": String(endDate.getFullYear()),
      accounts: `List(urn:li:sponsoredAccount:${ACCOUNT_ID})`,
      fields: "impressions,clicks,costInLocalCurrency",
    });

    const res = await fetch(`${API_BASE}/adAnalyticsV2?${params}`, {
      headers: getHeaders(),
    });
    console.log('   Status:', res.status);
    if (res.status === 404) {
      console.log('   ⚠️  No data (404) - Normal if no activity');
    } else if (res.ok) {
      const data = await res.json();
      console.log('   ✅ Success! Found', data.elements?.length || 0, 'data points');
    } else {
      const text = await res.text();
      console.log('   ❌ Error:', text.substring(0, 200));
    }
  } catch (err) {
    console.log('   ❌ Exception:', err.message);
  }

  console.log('\n=== Test Complete ===\n');
}

test().catch(console.error);
