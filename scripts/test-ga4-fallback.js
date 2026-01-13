/**
 * Test GA4 Fallback for Google Ads
 */

const fs = require('fs');
const path = require('path');

// Load .env.local
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

async function testGA4Fallback() {
  console.log('🧪 Testing GA4 Fallback for Google Ads...\n');
  
  try {
    // Import the GA4 function
    const { fetchGoogleAdsFromGA4 } = require('../lib/mcp/ga4-google-ads.ts');
    
    console.log('1. Testing GA4 Google Ads fetch...');
    const data = await fetchGoogleAdsFromGA4({
      startDate: '7daysAgo',
      endDate: 'yesterday',
    });
    
    console.log('✅ GA4 Fallback Success!');
    console.log(`   - Customer ID: ${data.customerId}`);
    console.log(`   - Descriptive Name: ${data.descriptiveName}`);
    console.log(`   - Campaigns: ${data.campaigns.length}`);
    console.log(`   - Total Impressions: ${data.summary.totalImpressions}`);
    console.log(`   - Total Clicks: ${data.summary.totalClicks}`);
    console.log(`   - Total Cost: $${data.summary.totalCost.toFixed(2)}`);
    console.log(`   - Source: ${data.source || 'N/A'}`);
    
    if (data.campaigns.length > 0) {
      console.log('\n   Sample campaigns:');
      data.campaigns.slice(0, 3).forEach((campaign, index) => {
        console.log(`      ${index + 1}. ${campaign.name}`);
        console.log(`         Impressions: ${campaign.impressions}, Clicks: ${campaign.clicks}`);
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ GA4 Fallback Failed!');
    console.error(`   Error: ${error.message}`);
    if (error.stack) {
      console.error(`   Stack: ${error.stack.split('\n').slice(0, 3).join('\n')}`);
    }
    return false;
  }
}

testGA4Fallback()
  .then((success) => {
    console.log(success ? '\n✅ Test completed successfully!' : '\n❌ Test failed');
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
