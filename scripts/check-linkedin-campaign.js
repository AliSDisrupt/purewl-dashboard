// Check all LinkedIn accounts for a specific campaign
const SEARCH_TERM = "ISP Growth - ARPU Strategy";

async function checkAllAccounts() {
  try {
    console.log(`\n🔍 Searching for campaign: "${SEARCH_TERM}"\n`);
    console.log("=" .repeat(60));
    
    // First, get all LinkedIn accounts
    const accountsResponse = await fetch("http://localhost:3000/api/linkedin/accounts");
    
    if (!accountsResponse.ok) {
      console.error("Failed to fetch accounts:", accountsResponse.status, accountsResponse.statusText);
      return;
    }
    
    const accountsData = await accountsResponse.json();
    const accounts = accountsData.accounts || [];
    
    console.log(`\n📊 Found ${accounts.length} LinkedIn account(s)\n`);
    
    let foundInAnyAccount = false;
    let totalCampaignsChecked = 0;
    
    // Check each account
    for (const account of accounts) {
      console.log(`\n${"=".repeat(60)}`);
      console.log(`\n📁 Checking Account: ${account.name || account.id}`);
      console.log(`   ID: ${account.id}`);
      console.log(`   Status: ${account.status || "N/A"}`);
      
      try {
        const campaignsResponse = await fetch(
          `http://localhost:3000/api/linkedin/campaigns?accountId=${encodeURIComponent(account.id)}&includeAnalytics=true`
        );
        
        if (!campaignsResponse.ok) {
          console.log(`   ⚠️  Failed to fetch campaigns: ${campaignsResponse.status}`);
          continue;
        }
        
        const campaignsData = await campaignsResponse.json();
        const campaigns = campaignsData.campaigns || [];
        totalCampaignsChecked += campaigns.length;
        
        console.log(`   📊 Found ${campaigns.length} campaign(s) in this account`);
        
        // Search for exact match
        const exactMatches = campaigns.filter(c => 
          c.name && c.name.toLowerCase() === SEARCH_TERM.toLowerCase()
        );
        
        // Search for partial match (contains the search term)
        const partialMatches = campaigns.filter(c => 
          c.name && c.name.toLowerCase().includes(SEARCH_TERM.toLowerCase())
        );
        
        // Search for similar (ISP + Growth/ARPU)
        const similarMatches = campaigns.filter(c => 
          c.name && (
            (c.name.toLowerCase().includes("isp") && c.name.toLowerCase().includes("growth")) ||
            (c.name.toLowerCase().includes("isp") && c.name.toLowerCase().includes("arpu")) ||
            (c.name.toLowerCase().includes("growth") && c.name.toLowerCase().includes("arpu"))
          )
        );
        
        if (exactMatches.length > 0) {
          foundInAnyAccount = true;
          console.log(`\n   ✅ FOUND EXACT MATCH!`);
          exactMatches.forEach(c => {
            console.log(`\n      Name: ${c.name}`);
            console.log(`      ID: ${c.id}`);
            console.log(`      Status: ${c.status}`);
            console.log(`      Objective: ${c.objective}`);
            if (c.analytics) {
              console.log(`      Analytics:`);
              console.log(`        Impressions: ${c.analytics.impressions || 0}`);
              console.log(`        Clicks: ${c.analytics.clicks || 0}`);
              console.log(`        Spend: $${c.analytics.spend || 0}`);
              console.log(`        Conversions: ${c.analytics.conversions || 0}`);
            }
          });
        } else if (partialMatches.length > 0) {
          foundInAnyAccount = true;
          console.log(`\n   🔍 FOUND PARTIAL MATCH:`);
          partialMatches.forEach(c => {
            console.log(`      - ${c.name} (${c.status})`);
          });
        } else if (similarMatches.length > 0) {
          console.log(`\n   💡 SIMILAR CAMPAIGNS (ISP/Growth/ARPU related):`);
          similarMatches.forEach(c => {
            console.log(`      - ${c.name} (${c.status})`);
          });
        } else {
          console.log(`   ❌ Not found in this account`);
        }
        
        // Show all campaigns for this account
        if (campaigns.length > 0) {
          console.log(`\n   📋 All campaigns in this account:`);
          campaigns.forEach((c, idx) => {
            console.log(`      ${idx + 1}. ${c.name} (${c.status})`);
          });
        }
        
      } catch (error) {
        console.log(`   ❌ Error checking this account: ${error.message}`);
      }
    }
    
    console.log(`\n${"=".repeat(60)}`);
    console.log(`\n📊 SUMMARY:`);
    console.log(`   Accounts checked: ${accounts.length}`);
    console.log(`   Total campaigns checked: ${totalCampaignsChecked}`);
    
    if (foundInAnyAccount) {
      console.log(`   ✅ Campaign found in at least one account!`);
    } else {
      console.log(`   ❌ Campaign "${SEARCH_TERM}" not found in any account`);
    }
    console.log(`\n`);
    
  } catch (error) {
    console.error("Error:", error.message);
    console.error(error.stack);
  }
}

checkAllAccounts();
