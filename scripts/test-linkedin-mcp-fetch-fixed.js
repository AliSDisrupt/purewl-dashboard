// Test script with FIXED date calculation
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

async function testWithDateRange(daysBack) {
  console.log(`\n📅 Testing with ${daysBack} days back\n`);
  console.log("-".repeat(70));
  
  try {
    const fullAccountId = `urn:li:sponsoredAccount:${ACCOUNT_ID}`;
    
    // FIXED: Calculate date range correctly
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() - 1); // Yesterday
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - daysBack);
    
    const url = `${API_BASE}/adAnalyticsV2`;
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
      accounts: `List(${fullAccountId})`,
      fields: "impressions,clicks,costInLocalCurrency,conversions,leadsGenerated",
    });
    
    console.log(`   Date Range: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);
    
    const response = await fetch(`${url}?${params}`, {
      headers: getHeaders(),
    });
    
    if (response.status === 404) {
      console.log(`   ❌ 404 - No data for this range`);
      return null;
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`   ❌ Error ${response.status}: ${errorText.substring(0, 100)}`);
      return null;
    }
    
    const data = await response.json();
    
    if (!data.elements || data.elements.length === 0) {
      console.log(`   ⚠️  Empty response`);
      return null;
    }
    
    // Calculate totals
    let totalImpressions = 0;
    let totalClicks = 0;
    let totalSpend = 0;
    let totalConversions = 0;
    
    for (const row of data.elements || []) {
      totalImpressions += parseInt(row.impressions || row.impressionCount || 0);
      totalClicks += parseInt(row.clicks || row.clickCount || 0);
      totalSpend += parseFloat(row.costInLocalCurrency || row.spend || row.cost || 0);
      totalConversions += parseInt(row.conversions || row.leadsGenerated || row.conversionCount || 0);
    }
    
    console.log(`   ✅ Found Data:`);
    console.log(`      Impressions: ${totalImpressions.toLocaleString()}`);
    console.log(`      Clicks: ${totalClicks.toLocaleString()}`);
    console.log(`      Spend: $${totalSpend.toFixed(2)}`);
    console.log(`      Conversions: ${totalConversions}`);
    console.log(`      Rows: ${data.elements.length}`);
    
    // Show first row structure
    if (data.elements[0]) {
      console.log(`\n   📋 First Row Field Names:`);
      console.log(`      ${Object.keys(data.elements[0]).join(', ')}`);
    }
    
    return { totalImpressions, totalClicks, totalSpend, totalConversions };
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return null;
  }
}

async function testAllAccounts() {
  console.log("\n🔍 Testing LinkedIn Analytics - MCP Server Method\n");
  console.log("=".repeat(70));
  
  // Test different date ranges
  console.log("\n📊 Testing Account-Level Analytics:");
  await testWithDateRange(7);   // Last 7 days
  await testWithDateRange(30);  // Last 30 days
  await testWithDateRange(90);  // Last 90 days
  
  // Also test campaign-level for active campaigns
  console.log("\n\n📊 Testing Campaign-Level Analytics:");
  try {
    // First get campaigns
    const campaignsUrl = `${API_BASE}/adAccounts/${ACCOUNT_ID}/adCampaigns?q=search`;
    const campaignsResponse = await fetch(campaignsUrl, {
      headers: getHeaders(),
    });
    
    if (campaignsResponse.ok) {
      const campaignsData = await campaignsResponse.json();
      const activeCampaigns = (campaignsData.elements || []).filter(
        c => c.status === "ACTIVE" || c.status === "RUNNING"
      ).slice(0, 3); // Test first 3 active campaigns
      
      if (activeCampaigns.length > 0) {
        console.log(`\n   Found ${activeCampaigns.length} active campaign(s) to test`);
        
        for (const campaign of activeCampaigns) {
          const campaignId = campaign.id;
          const fullCampaignId = campaignId.startsWith("urn:li:") ? campaignId : `urn:li:sponsoredCampaign:${campaignId}`;
          
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
            accounts: `List(urn:li:sponsoredAccount:${ACCOUNT_ID})`,
            fields: "impressions,clicks,costInLocalCurrency,conversions,leadsGenerated",
          });
          
          const response = await fetch(`${url}?${params}`, {
            headers: getHeaders(),
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.elements && data.elements.length > 0) {
              let totalImpressions = 0;
              let totalClicks = 0;
              let totalSpend = 0;
              
              for (const row of data.elements || []) {
                totalImpressions += parseInt(row.impressions || row.impressionCount || 0);
                totalClicks += parseInt(row.clicks || row.clickCount || 0);
                totalSpend += parseFloat(row.costInLocalCurrency || row.spend || row.cost || 0);
              }
              
              console.log(`\n   ✅ Campaign: ${campaign.name}`);
              console.log(`      Impressions: ${totalImpressions.toLocaleString()}`);
              console.log(`      Clicks: ${totalClicks.toLocaleString()}`);
              console.log(`      Spend: $${totalSpend.toFixed(2)}`);
            } else {
              console.log(`\n   ⚠️  Campaign: ${campaign.name} - No data`);
            }
          } else if (response.status === 404) {
            console.log(`\n   ❌ Campaign: ${campaign.name} - 404 (no data)`);
          } else {
            console.log(`\n   ❌ Campaign: ${campaign.name} - Error ${response.status}`);
          }
        }
      }
    }
  } catch (error) {
    console.log(`\n   ❌ Error testing campaigns: ${error.message}`);
  }
  
  console.log("\n" + "=".repeat(70));
}

testAllAccounts();
