// Test the LinkedIn analytics API with all new metrics
async function testFullMetrics() {
  console.log("\n🔍 Testing LinkedIn Analytics API - Full Metrics\n");
  console.log("=".repeat(70));
  
  try {
    const accountId = "514469053";
    const url = `http://localhost:3000/api/linkedin/analytics?accountId=${encodeURIComponent(accountId)}&daysBack=30`;
    
    console.log(`\n📡 Calling: ${url}\n`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log(`📥 Response Status: ${response.status}`);
    console.log(`\n📊 Full Response Data:`);
    console.log(JSON.stringify(data, null, 2));
    
    if (data.metrics) {
      console.log(`\n✅ Core Metrics:`);
      console.log(`   Impressions: ${data.metrics.impressions?.toLocaleString() || 0}`);
      console.log(`   Clicks: ${data.metrics.clicks?.toLocaleString() || 0}`);
      console.log(`   Spend: $${data.metrics.spend?.toFixed(2) || '0.00'}`);
      console.log(`   Conversions: ${data.metrics.conversions?.toLocaleString() || 0}`);
      console.log(`   Has Data: ${data.hasData}`);
      
      console.log(`\n📈 Cost Metrics (Calculated):`);
      console.log(`   CTR: ${data.metrics.ctr?.toFixed(2) || '0.00'}%`);
      console.log(`   CPC: $${data.metrics.cpc?.toFixed(2) || '0.00'}`);
      console.log(`   CPM: $${data.metrics.cpm?.toFixed(2) || '0.00'}`);
      console.log(`   Cost Per Conversion: $${data.metrics.costPerConversion?.toFixed(2) || '0.00'}`);
      
      console.log(`\n💬 Engagement Metrics:`);
      console.log(`   Total Engagements: ${data.metrics.totalEngagements?.toLocaleString() || 0}`);
      console.log(`   Likes: ${data.metrics.likes?.toLocaleString() || 0}`);
      console.log(`   Comments: ${data.metrics.comments?.toLocaleString() || 0}`);
      console.log(`   Shares: ${data.metrics.shares?.toLocaleString() || 0}`);
      console.log(`   Reactions: ${data.metrics.reactions?.toLocaleString() || 0}`);
      console.log(`   Follows: ${data.metrics.follows?.toLocaleString() || 0}`);
      console.log(`   Company Page Clicks: ${data.metrics.companyPageClicks?.toLocaleString() || 0}`);
      console.log(`   Landing Page Clicks: ${data.metrics.landingPageClicks?.toLocaleString() || 0}`);
      
      console.log(`\n🎯 Conversion Metrics:`);
      console.log(`   External Website Conversions: ${data.metrics.externalWebsiteConversions?.toLocaleString() || 0}`);
      console.log(`   Post-Click Conversions: ${data.metrics.externalWebsitePostClickConversions?.toLocaleString() || 0}`);
      console.log(`   Post-View Conversions: ${data.metrics.externalWebsitePostViewConversions?.toLocaleString() || 0}`);
      console.log(`   Conversion Value: $${data.metrics.conversionValueInLocalCurrency?.toFixed(2) || '0.00'}`);
      
      console.log(`\n👥 Lead Metrics:`);
      console.log(`   One-Click Leads: ${data.metrics.oneClickLeads?.toLocaleString() || 0}`);
      console.log(`   Qualified Leads: ${data.metrics.qualifiedLeads?.toLocaleString() || 0}`);
      console.log(`   Valid Work Email Leads: ${data.metrics.validWorkEmailLeads?.toLocaleString() || 0}`);
      
      console.log(`\n🎬 Video Metrics:`);
      console.log(`   Video Starts: ${data.metrics.videoStarts?.toLocaleString() || 0}`);
      console.log(`   Video Views: ${data.metrics.videoViews?.toLocaleString() || 0}`);
      console.log(`   Video Completions: ${data.metrics.videoCompletions?.toLocaleString() || 0}`);
      
      // Check if we have any non-zero metrics
      const hasAnyData = 
        data.metrics.impressions > 0 ||
        data.metrics.clicks > 0 ||
        data.metrics.spend > 0 ||
        data.metrics.conversions > 0 ||
        (data.metrics.totalEngagements && data.metrics.totalEngagements > 0) ||
        (data.metrics.videoViews && data.metrics.videoViews > 0) ||
        (data.metrics.qualifiedLeads && data.metrics.qualifiedLeads > 0);
      
      if (!hasAnyData) {
        console.log(`\n⚠️  All metrics are zero - this could mean:`);
        console.log(`   - No campaigns have activity in the last 30 days`);
        console.log(`   - LinkedIn API is returning 404 (no data)`);
        console.log(`   - Campaign-level aggregation also found no data`);
      } else {
        console.log(`\n✅ Found data! Metrics are being tracked correctly.`);
      }
    }
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error.stack);
  }
}

testFullMetrics();
