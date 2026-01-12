// Test campaign-level analytics directly
const ACCESS_TOKEN = process.env.LINKEDIN_ACCESS_TOKEN || "AQWkKXim-oqXnFtJfr46yhTzjqGOpjUC4nDMIwE2udJaKxzwMD0ZVrQoEeYWAh_Sjuj4eVJoueJae2ktgtp1mADMfLu-5xoMOm8P1WbAd34QzIgu-xoNGahFylCpR2vIu3xLDz9jN6EUEH-N3YEjdRk7tbBeTp_Cw1BTVTfv98-97LlqF2Q_FaYnSnpUiQkIJa97QYt0NkG4QTalJociKJ7Vq2L8ZG7yuN3jlUqWqe0wxJf_zKmC1bte6tG4yOpLhRT0A2MjACrOyRTAZOyOvHWLmFa4_y1WW2O17nJ81b2506Xyz_IpSGthyfh2iDkst_wsLO017cnMOomldMfidhlenPspow";
const API_BASE = "https://api.linkedin.com/rest";
const ACCOUNT_ID = "514469053";

function getHeaders() {
  return {
    "Authorization": `Bearer ${ACCESS_TOKEN}`,
    "LinkedIn-Version": "202511",
    "X-Restli-Protocol-Version": "2.0.0",
    "Content-Type": "application/json"
  };
}

async function testCampaignAnalytics() {
  console.log("\n🔍 Testing Campaign-Level Analytics\n");
  console.log("=".repeat(70));
  
  try {
    // First, get campaigns
    const campaignsUrl = `${API_BASE}/adAccounts/${ACCOUNT_ID}/adCampaigns?q=search&count=10`;
    console.log(`\n📡 Fetching campaigns from: ${campaignsUrl}`);
    
    const campaignsResponse = await fetch(campaignsUrl, {
      headers: getHeaders(),
    });
    
    if (!campaignsResponse.ok) {
      console.error(`❌ Failed to fetch campaigns: ${campaignsResponse.status}`);
      return;
    }
    
    const campaignsData = await campaignsResponse.json();
    const campaigns = campaignsData.elements || [];
    
    console.log(`\n✅ Found ${campaigns.length} campaigns`);
    
    const activeCampaigns = campaigns.filter(
      c => c.status === "ACTIVE" || c.status === "RUNNING"
    );
    
    console.log(`   Active/Running: ${activeCampaigns.length}`);
    
    if (activeCampaigns.length === 0) {
      console.log(`\n⚠️  No active campaigns found`);
      return;
    }
    
    // Test analytics for first 3 active campaigns
    const testCampaigns = activeCampaigns.slice(0, 3);
    
    for (const campaign of testCampaigns) {
      const campaignId = String(campaign.id || campaign);
      const fullCampaignId = campaignId.startsWith("urn:li:") ? campaignId : `urn:li:sponsoredCampaign:${campaignId}`;
      const fullAccountId = `urn:li:sponsoredAccount:${ACCOUNT_ID}`;
      
      console.log(`\n   Raw Campaign ID: ${campaign.id} (type: ${typeof campaign.id})`);
      
      console.log(`\n${"=".repeat(70)}`);
      console.log(`\n📊 Campaign: ${campaign.name}`);
      console.log(`   ID: ${fullCampaignId}`);
      console.log(`   Status: ${campaign.status}`);
      
      // Calculate date range
      const today = new Date();
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() - 1);
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 30);
      
      const url = `${API_BASE}/adAnalyticsV2`;
      const params = new URLSearchParams({
        q: "analytics",
        pivot: "CAMPAIGN",
        timeGranularity: "ALL",
        "dateRange.start.day": String(startDate.getDate()),
        "dateRange.start.month": String(startDate.getMonth() + 1),
        "dateRange.start.year": String(startDate.getFullYear()),
        "dateRange.end.day": String(endDate.getDate()),
        "dateRange.end.month": String(endDate.getMonth() + 1),
        "dateRange.end.year": String(endDate.getFullYear()),
        campaigns: `List(${fullCampaignId})`,
        accounts: `List(${fullAccountId})`,
        fields: "impressions,clicks,costInLocalCurrency,conversions,leadsGenerated",
      });
      
      const analyticsResponse = await fetch(`${url}?${params}`, {
        headers: getHeaders(),
      });
      
      console.log(`   API Status: ${analyticsResponse.status}`);
      
      if (analyticsResponse.status === 404) {
        console.log(`   ⚠️  404 - No analytics data for this campaign`);
        continue;
      }
      
      if (!analyticsResponse.ok) {
        const errorText = await analyticsResponse.text();
        console.log(`   ❌ Error: ${errorText.substring(0, 200)}`);
        continue;
      }
      
      const analyticsData = await analyticsResponse.json();
      
      if (!analyticsData.elements || analyticsData.elements.length === 0) {
        console.log(`   ⚠️  Empty response`);
        continue;
      }
      
      let totalImpressions = 0;
      let totalClicks = 0;
      let totalSpend = 0;
      let totalConversions = 0;
      
      for (const row of analyticsData.elements || []) {
        totalImpressions += parseInt(row.impressions || row.impressionCount || 0);
        totalClicks += parseInt(row.clicks || row.clickCount || 0);
        totalSpend += parseFloat(row.costInLocalCurrency || row.spend || row.cost || 0);
        totalConversions += parseInt(row.conversions || row.leadsGenerated || row.conversionCount || 0);
      }
      
      console.log(`   ✅ Analytics:`);
      console.log(`      Impressions: ${totalImpressions.toLocaleString()}`);
      console.log(`      Clicks: ${totalClicks.toLocaleString()}`);
      console.log(`      Spend: $${totalSpend.toFixed(2)}`);
      console.log(`      Conversions: ${totalConversions}`);
      
      if (totalImpressions > 0 || totalClicks > 0 || totalSpend > 0) {
        console.log(`   🎯 HAS DATA!`);
      }
    }
    
    console.log(`\n${"=".repeat(70)}`);
    
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error(error.stack);
  }
}

testCampaignAnalytics();
