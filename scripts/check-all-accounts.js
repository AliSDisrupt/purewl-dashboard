// Check all LinkedIn accounts to see which ones have data
async function checkAllAccounts() {
  console.log("\n🔍 Checking All LinkedIn Accounts for Data\n");
  console.log("=".repeat(70));
  
  try {
    const response = await fetch("http://localhost:3000/api/linkedin/accounts-detail");
    const data = await response.json();
    
    const accounts = data.accounts || [];
    
    console.log(`\n📊 Found ${accounts.length} accounts\n`);
    
    let accountsWithData = 0;
    
    for (const account of accounts) {
      const hasData = account.hasData || false;
      const analytics = account.analytics || {};
      const impressions = analytics.impressions || 0;
      const clicks = analytics.clicks || 0;
      const spend = analytics.spend || 0;
      
      if (hasData || impressions > 0 || clicks > 0 || spend > 0) {
        accountsWithData++;
        console.log(`\n✅ ${account.name} (${account.id})`);
        console.log(`   Impressions: ${impressions.toLocaleString()}`);
        console.log(`   Clicks: ${clicks.toLocaleString()}`);
        console.log(`   Spend: $${spend.toFixed(2)}`);
        console.log(`   Active Campaigns: ${account.activeCampaigns || 0}`);
      }
    }
    
    if (accountsWithData === 0) {
      console.log(`\n⚠️  No accounts have data in the last 30 days`);
      console.log(`\n   This could mean:`);
      console.log(`   - No LinkedIn ads were running in the last 30 days`);
      console.log(`   - Data exists but in a different time period`);
      console.log(`   - LinkedIn API is not returning data for some reason`);
    } else {
      console.log(`\n✅ Found ${accountsWithData} account(s) with data`);
    }
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

checkAllAccounts();
