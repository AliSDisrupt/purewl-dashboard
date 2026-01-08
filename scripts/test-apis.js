#!/usr/bin/env node

/**
 * Test script to verify API connections
 * Run with: node scripts/test-apis.js
 * 
 * Note: Make sure .env.local exists with your credentials
 */

const fs = require('fs');
const path = require('path');

// Simple .env.local parser
function loadEnv() {
  const envPath = path.join(__dirname, '../.env.local');
  if (!fs.existsSync(envPath)) {
    console.log('⚠️  .env.local not found. Run: npm run setup-env');
    return {};
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = {};
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      env[match[1].trim()] = match[2].trim();
    }
  });
  return env;
}

const env = loadEnv();
const LINKEDIN_TOKEN = env.LINKEDIN_ACCESS_TOKEN;
const HUBSPOT_TOKEN = env.HUBSPOT_ACCESS_TOKEN;

async function testLinkedIn() {
  console.log('\n🔍 Testing LinkedIn Ads API...');
  
  if (!LINKEDIN_TOKEN) {
    console.log('❌ LINKEDIN_ACCESS_TOKEN not found in .env.local');
    return false;
  }

  try {
    const url = 'https://api.linkedin.com/rest/adAccounts?q=search';
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${LINKEDIN_TOKEN}`,
        'LinkedIn-Version': '202511',
        'X-Restli-Protocol-Version': '2.0.0',
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200) {
      const data = await response.json();
      console.log(`✅ LinkedIn API: Connected! Found ${data.elements?.length || 0} accounts`);
      return true;
    } else {
      const errorText = await response.text();
      console.log(`❌ LinkedIn API Error: ${response.status} - ${errorText}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ LinkedIn API Error: ${error.message}`);
    return false;
  }
}

async function testHubSpot() {
  console.log('\n🔍 Testing HubSpot CRM API...');
  
  if (!HUBSPOT_TOKEN) {
    console.log('❌ HUBSPOT_ACCESS_TOKEN not found in .env.local');
    return false;
  }

  try {
    const url = 'https://api.hubapi.com/crm/v3/objects/deals?limit=1';
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${HUBSPOT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200) {
      const data = await response.json();
      console.log(`✅ HubSpot API: Connected! Found ${data.results?.length || 0} deals`);
      return true;
    } else {
      const errorText = await response.text();
      console.log(`❌ HubSpot API Error: ${response.status} - ${errorText}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ HubSpot API Error: ${error.message}`);
    return false;
  }
}

async function testReddit() {
  console.log('\n🔍 Testing Reddit API...');
  
  try {
    const url = 'https://www.reddit.com/r/vpn/hot.json?limit=1';
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'PureWL-Dashboard/1.0',
      }
    });

    if (response.status === 200) {
      const data = await response.json();
      const posts = data.data?.children || [];
      console.log(`✅ Reddit API: Connected! Found ${posts.length} test post(s)`);
      return true;
    } else {
      console.log(`❌ Reddit API Error: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Reddit API Error: ${error.message}`);
    return false;
  }
}

async function testGA4() {
  console.log('\n🔍 Testing Google Analytics (GA4) API...');
  
  const credentialsPath = env.GOOGLE_APPLICATION_CREDENTIALS;
  const propertyId = env.GA4_PROPERTY_ID;

  if (!credentialsPath) {
    console.log('❌ GOOGLE_APPLICATION_CREDENTIALS not found in .env.local');
    return false;
  }

  if (!propertyId) {
    console.log('❌ GA4_PROPERTY_ID not found in .env.local');
    return false;
  }

  // Check if credentials file exists
  const fs = require('fs');
  const path = require('path');
  const credPath = credentialsPath.replace(/\\/g, '/');
  
  if (!fs.existsSync(credPath)) {
    console.log(`❌ Credentials file not found: ${credPath}`);
    return false;
  }

  console.log(`✅ GA4 credentials file found: ${credPath}`);
  console.log(`✅ GA4 Property ID: ${propertyId}`);
  console.log('   (Full connection test requires @google-analytics/data package)');
  return true;
}

async function main() {
  console.log('🧪 Testing API Connections...\n');
  console.log('Make sure .env.local exists with your credentials!\n');

  const linkedinOk = await testLinkedIn();
  const hubspotOk = await testHubSpot();
  const redditOk = await testReddit();
  const ga4Ok = await testGA4();

  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Results:');
  console.log(`   LinkedIn Ads: ${linkedinOk ? '✅ Working' : '❌ Failed'}`);
  console.log(`   HubSpot CRM: ${hubspotOk ? '✅ Working' : '❌ Failed'}`);
  console.log(`   Reddit: ${redditOk ? '✅ Working' : '❌ Failed'}`);
  console.log(`   Google Analytics: ${ga4Ok ? '✅ Configured' : '❌ Failed'}`);
  console.log('='.repeat(50));
}

main().catch(console.error);
