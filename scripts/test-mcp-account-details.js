// Test how get_linkedin_account_details works (what Atlas uses)
// This is what Atlas sees when it calls get_linkedin_account_details

async function testAccountDetails() {
  console.log("\n🔍 Testing MCP: get_linkedin_account_details");
  console.log("=".repeat(70));
  console.log("\nThis is what Atlas sees when it calls this tool\n");
  
  try {
    const response = await fetch("http://localhost:3000/api/mcp/linkedin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tool: "get_linkedin_account_details",
        parameters: {}
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error("❌ Error:", response.status, error);
      return;
    }
    
    const data = await response.json();
    const accounts = data.result?.accounts || [];
    
    console.log(`📊 Found ${accounts.length} account(s)\n`);
    
    for (const account of accounts) {
      console.log(`\n${"=".repeat(70)}`);
      console.log(`\n📁 Account: ${account.name || account.id}`);
      console.log(`   ID: ${account.id}`);
      console.log(`   Total Campaigns: ${account.totalCampaigns || 0}`);
      console.log(`   Active Campaigns: ${account.activeCampaigns || 0}`);
      console.log(`   Has Data: ${account.hasData || false}`);
      
      if (account.analytics) {
        console.log(`\n   📊 Analytics (Account-Level):`);
        console.log(`      Impressions: ${account.analytics.impressions?.toLocaleString() || 0}`);
        console.log(`      Clicks: ${account.analytics.clicks?.toLocaleString() || 0}`);
        console.log(`      Spend: $${account.analytics.spend?.toFixed(2) || '0.00'}`);
        console.log(`      Conversions: ${account.analytics.conversions || 0}`);
      } else {
        console.log(`\n   ⚠️  No analytics data (analytics is null)`);
      }
      
      // Check campaigns with analytics
      if (account.campaigns && account.campaigns.length > 0) {
        const campaignsWithData = account.campaigns.filter(c => 
          c.analytics && (c.analytics.impressions > 0 || c.analytics.clicks > 0 || c.analytics.spend > 0)
        );
        
        if (campaignsWithData.length > 0) {
          console.log(`\n   🎯 Campaigns with Analytics Data: ${campaignsWithData.length}`);
          campaignsWithData.slice(0, 5).forEach(c => {
            console.log(`\n      Campaign: ${c.name}`);
            if (c.analytics) {
              console.log(`         Impressions: ${c.analytics.impressions?.toLocaleString() || 0}`);
              console.log(`         Clicks: ${c.analytics.clicks?.toLocaleString() || 0}`);
              console.log(`         Spend: $${c.analytics.spend?.toFixed(2) || '0.00'}`);
            }
          });
        }
      }
      
      // Check if there's an error
      if (account.error) {
        console.log(`\n   ❌ Error: ${account.error}`);
      }
    }
    
    console.log(`\n${"=".repeat(70)}`);
    console.log(`\n💡 Summary:`);
    console.log(`   - This is the exact data structure Atlas receives`);
    console.log(`   - If Atlas sees impressions/clicks/spend, it's from account.analytics`);
    console.log(`   - If account.analytics is null/zeros, Atlas might aggregate from campaigns`);
    console.log(`   - The MCP server fetches account-level analytics first`);
    console.log(`   - If that returns 404, it sets analytics to null`);
    console.log(`\n`);
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testAccountDetails();
