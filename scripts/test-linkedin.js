/**
 * Test LinkedIn API Integration
 */

require('dotenv').config({ path: '.env.local' });

const API_BASE = process.env.LINKEDIN_API_BASE || "https://api.linkedin.com/rest";
const ACCESS_TOKEN = process.env.LINKEDIN_ACCESS_TOKEN;
const ACCOUNT_ID = "514469053"; // PureVPN Partner account

function getHeaders() {
  return {
    "Authorization": `Bearer ${ACCESS_TOKEN}`,
    "LinkedIn-Version": "202511",
    "X-Restli-Protocol-Version": "2.0.0",
    "Content-Type": "application/json"
  };
}

async function testLinkedInAPI() {
  console.log('\n=== Testing LinkedIn API Integration ===\n');
  
  // Check if access token is configured
  if (!ACCESS_TOKEN) {
    console.error('❌ ERROR: LINKEDIN_ACCESS_TOKEN is not configured in .env.local');
    console.log('\nPlease add your LinkedIn access token to .env.local:');
    console.log('LINKEDIN_ACCESS_TOKEN=your_token_here\n');
    return;
  }
  
  console.log('✅ Access token found (length:', ACCESS_TOKEN.length, 'characters)');
  console.log('📋 Account ID:', ACCOUNT_ID);
  console.log('🌐 API Base:', API_BASE);
  console.log('\n---\n');

  // Test 1: Fetch Accounts
  console.log('Test 1: Fetching LinkedIn Ad Accounts...');
  try {
    const accountsUrl = `${API_BASE}/adAccounts?q=search`;
    const accountsResponse = await fetch(accountsUrl, {
      headers: getHeaders(),
    });

    console.log('  Status:', accountsResponse.status, accountsResponse.statusText);
    
    if (!accountsResponse.ok) {
      const errorText = await accountsResponse.text();
      console.error('  ❌ Error:', errorText);
    } else {
      const accountsData = await accountsResponse.json();
      console.log('  ✅ Success! Found', accountsData.elements?.length || 0, 'accounts');
      
      if (accountsData.elements && accountsData.elements.length > 0) {
        console.log('\n  Accounts:');
        accountsData.elements.forEach((acc, idx) => {
          const simpleId = acc.id?.includes(':') ? acc.id.split(':').pop() : acc.id;
          console.log(`    ${idx + 1}. ${acc.name || 'Unnamed'} (ID: ${simpleId})`);
        });
      }
    }
  } catch (error) {
    console.error('  ❌ Exception:', error.message);
  }

  console.log('\n---\n');

  // Test 2: Fetch Campaigns for Account
  console.log('Test 2: Fetching Campaigns for Account', ACCOUNT_ID, '...');
  try {
    const campaignsUrl = `${API_BASE}/adAccounts/${ACCOUNT_ID}/adCampaigns?q=search`;
    const campaignsResponse = await fetch(campaignsUrl, {
      headers: getHeaders(),
    });

    console.log('  Status:', campaignsResponse.status, campaignsResponse.statusText);
    
    if (!campaignsResponse.ok) {
      const errorText = await campaignsResponse.text();
      console.error('  ❌ Error:', errorText);
    } else {
      const campaignsData = await campaignsResponse.json();
      console.log('  ✅ Success! Found', campaignsData.elements?.length || 0, 'campaigns');
      
      if (campaignsData.elements && campaignsData.elements.length > 0) {
        console.log('\n  Campaigns:');
        campaignsData.elements.slice(0, 5).forEach((camp, idx) => {
          console.log(`    ${idx + 1}. ${camp.name || 'Unnamed'} (Status: ${camp.status || 'UNKNOWN'})`);
        });
        if (campaignsData.elements.length > 5) {
          console.log(`    ... and ${campaignsData.elements.length - 5} more`);
        }
      }
    }
  } catch (error) {
    console.error('  ❌ Exception:', error.message);
  }

  console.log('\n---\n');

  // Test 3: Fetch Analytics
  console.log('Test 3: Fetching Analytics for Account', ACCOUNT_ID, '...');
  try {
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() - 1);
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 30);

    const analyticsUrl = `${API_BASE}/adAnalyticsV2`;
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
      fields: "impressions,clicks,costInLocalCurrency,conversions,leadsGenerated",
    });

    const analyticsResponse = await fetch(`${analyticsUrl}?${params}`, {
      headers: getHeaders(),
    });

    console.log('  Status:', analyticsResponse.status, analyticsResponse.statusText);
    
    if (analyticsResponse.status === 404) {
      console.log('  ⚠️  No data (404) - This is normal if there\'s no activity in the last 30 days');
    } else if (!analyticsResponse.ok) {
      const errorText = await analyticsResponse.text();
      console.error('  ❌ Error:', errorText);
    } else {
      const analyticsData = await analyticsResponse.json();
      console.log('  ✅ Success! Found', analyticsData.elements?.length || 0, 'data points');
      
      if (analyticsData.elements && analyticsData.elements.length > 0) {
        let totalImpressions = 0;
        let totalClicks = 0;
        let totalSpend = 0;
        let totalConversions = 0;

        analyticsData.elements.forEach(row => {
          totalImpressions += parseInt(row.impressions || row.impressionCount || 0);
          totalClicks += parseInt(row.clicks || row.clickCount || 0);
          totalSpend += parseFloat(row.costInLocalCurrency || row.spend || row.cost || 0);
          totalConversions += parseInt(row.conversions || row.leadsGenerated || row.conversionCount || 0);
        });

        console.log('\n  Analytics Summary (Last 30 days):');
        console.log('    Impressions:', totalImpressions.toLocaleString());
        console.log('    Clicks:', totalClicks.toLocaleString());
        console.log('    Spend: $' + totalSpend.toFixed(2));
        console.log('    Conversions:', totalConversions.toLocaleString());
      }
    }
  } catch (error) {
    console.error('  ❌ Exception:', error.message);
  }

  console.log('\n=== Test Complete ===\n');
}

testLinkedInAPI().catch(console.error);
