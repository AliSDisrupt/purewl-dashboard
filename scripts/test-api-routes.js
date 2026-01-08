/**
 * Test API Routes - Check if LinkedIn data is being fetched
 */

async function testAPIRoutes() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('\n=== Testing API Routes ===\n');
  console.log('Base URL:', baseUrl);
  console.log('\n---\n');

  // Test 1: Accounts endpoint
  console.log('1. Testing /api/linkedin/accounts...');
  try {
    const res = await fetch(`${baseUrl}/api/linkedin/accounts`);
    const data = await res.json();
    console.log('   Status:', res.status);
    if (res.ok) {
      console.log('   ✅ Success!');
      console.log('   Accounts found:', data.accounts?.length || 0);
      if (data.accounts && data.accounts.length > 0) {
        console.log('   Sample account:', data.accounts[0].name, '(ID:', data.accounts[0].simpleId + ')');
      }
    } else {
      console.log('   ❌ Error:', data.error || 'Unknown error');
    }
  } catch (err) {
    console.log('   ❌ Exception:', err.message);
    console.log('   ⚠️  Make sure the server is running on port 3000');
  }

  console.log('\n---\n');

  // Test 2: Accounts Detail endpoint
  console.log('2. Testing /api/linkedin/accounts-detail...');
  try {
    const res = await fetch(`${baseUrl}/api/linkedin/accounts-detail`);
    const data = await res.json();
    console.log('   Status:', res.status);
    if (res.ok) {
      console.log('   ✅ Success!');
      console.log('   Total accounts:', data.totalAccounts || 0);
      if (data.accounts && data.accounts.length > 0) {
        data.accounts.forEach((acc, idx) => {
          console.log(`   ${idx + 1}. ${acc.name} (ID: ${acc.simpleId})`);
          console.log(`      - Campaigns: ${acc.totalCampaigns || 0} total, ${acc.activeCampaigns || 0} active`);
          console.log(`      - Has data: ${acc.hasData ? 'Yes' : 'No'}`);
          if (acc.analytics) {
            console.log(`      - Analytics: ${acc.analytics.impressions || 0} impressions, ${acc.analytics.clicks || 0} clicks`);
          }
        });
      }
    } else {
      console.log('   ❌ Error:', data.error || 'Unknown error');
      if (data.message) console.log('   Message:', data.message);
    }
  } catch (err) {
    console.log('   ❌ Exception:', err.message);
  }

  console.log('\n---\n');

  // Test 3: Campaigns endpoint
  console.log('3. Testing /api/linkedin/campaigns?accountId=514469053...');
  try {
    const res = await fetch(`${baseUrl}/api/linkedin/campaigns?accountId=514469053`);
    const data = await res.json();
    console.log('   Status:', res.status);
    if (res.ok) {
      console.log('   ✅ Success!');
      console.log('   Campaigns found:', data.campaigns?.length || 0);
      if (data.campaigns && data.campaigns.length > 0) {
        const active = data.campaigns.filter(c => c.status === 'ACTIVE' || c.status === 'RUNNING');
        console.log('   Active campaigns:', active.length);
        console.log('   Sample campaigns:');
        data.campaigns.slice(0, 3).forEach((camp, idx) => {
          console.log(`     ${idx + 1}. ${camp.name} (${camp.status})`);
          if (camp.analytics) {
            console.log(`        Analytics: ${camp.analytics.impressions} impressions, ${camp.analytics.clicks} clicks`);
          }
        });
      }
    } else {
      console.log('   ❌ Error:', data.error || 'Unknown error');
    }
  } catch (err) {
    console.log('   ❌ Exception:', err.message);
  }

  console.log('\n---\n');

  // Test 4: Analytics endpoint
  console.log('4. Testing /api/linkedin/analytics?accountId=514469053...');
  try {
    const res = await fetch(`${baseUrl}/api/linkedin/analytics?accountId=514469053&daysBack=30`);
    const data = await res.json();
    console.log('   Status:', res.status);
    if (res.ok) {
      console.log('   ✅ Success!');
      console.log('   Has data:', data.hasData ? 'Yes' : 'No');
      if (data.metrics) {
        console.log('   Metrics:');
        console.log('     - Impressions:', data.metrics.impressions || 0);
        console.log('     - Clicks:', data.metrics.clicks || 0);
        console.log('     - Spend: $' + (data.metrics.spend || 0).toFixed(2));
        console.log('     - Conversions:', data.metrics.conversions || 0);
      }
    } else {
      console.log('   ❌ Error:', data.error || 'Unknown error');
    }
  } catch (err) {
    console.log('   ❌ Exception:', err.message);
  }

  console.log('\n=== Test Complete ===\n');
}

testAPIRoutes().catch(console.error);
