// Test script to see exactly what LinkedIn API returns for analytics
const ACCESS_TOKEN = process.env.LINKEDIN_ACCESS_TOKEN || "AQWkKXim-oqXnFtJfr46yhTzjqGOpjUC4nDMIwE2udJaKxzwMD0ZVrQoEeYWAh_Sjuj4eVJoueJae2ktgtp1mADMfLu-5xoMOm8P1WbAd34QzIgu-xoNGahFylCpR2vIu3xLDz9jN6EUEH-N3YEjdRk7tbBeTp_Cw1BTVTfv98-97LlqF2Q_FaYnSnpUiQkIJa97QYt0NkG4QTalJociKJ7Vq2L8ZG7yuN3jlUqWqe0wxJf_zKmC1bte6tG4yOpLhRT0A2MjACrOyRTAZOyOvHWLmFa4_y1WW2O17nJ81b2506Xyz_IpSGthyfh2iDkst_wsLO017cnMOomldMfidhlenPspow";
const API_BASE = "https://api.linkedin.com/rest";
const ACCOUNT_ID = "514469053"; // PureVPN Partner account

function getHeaders() {
  return {
    "Authorization": `Bearer ${ACCESS_TOKEN}`,
    "LinkedIn-Version": "202511",
    "X-Restli-Protocol-Version": "2.0.0",
    "Content-Type": "application/json"
  };
}

async function testLinkedInAnalytics() {
  console.log("\n🔍 Testing LinkedIn Analytics API Fetch (MCP Server Method)\n");
  console.log("=".repeat(70));
  
  try {
    // Use the same logic as MCP server
    const fullAccountId = `urn:li:sponsoredAccount:${ACCOUNT_ID}`;
    
    // Calculate date range (yesterday to 30 days ago)
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() - 1); // Yesterday
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 30);
    
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
    
    console.log("\n📡 API Request Details:");
    console.log(`   URL: ${url}`);
    console.log(`   Account ID: ${fullAccountId}`);
    console.log(`   Date Range: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);
    console.log(`   Fields: impressions,clicks,costInLocalCurrency,conversions,leadsGenerated`);
    console.log(`   Pivot: ACCOUNT`);
    console.log(`   Time Granularity: ALL`);
    
    const fullUrl = `${url}?${params}`;
    console.log(`\n   Full URL: ${fullUrl.substring(0, 200)}...`);
    
    const response = await fetch(fullUrl, {
      headers: getHeaders(),
    });
    
    console.log(`\n📥 Response Status: ${response.status} ${response.statusText}`);
    
    if (response.status === 404) {
      console.log("\n⚠️  404 Response - No data found (LinkedIn returns 404 for 0 activity)");
      console.log("   This is expected if there's no activity in the date range.");
      return;
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`\n❌ Error Response:`);
      console.log(errorText);
      return;
    }
    
    const data = await response.json();
    
    console.log(`\n📊 Raw API Response Structure:`);
    console.log(`   Has elements: ${!!data.elements}`);
    console.log(`   Elements count: ${data.elements?.length || 0}`);
    console.log(`   Response keys: ${Object.keys(data).join(', ')}`);
    
    if (data.elements && data.elements.length > 0) {
      console.log(`\n📋 First Element Structure:`);
      const firstElement = data.elements[0];
      console.log(`   Keys: ${Object.keys(firstElement).join(', ')}`);
      console.log(`\n   Raw Data:`);
      console.log(JSON.stringify(firstElement, null, 2));
      
      console.log(`\n🔢 Field Values (as MCP server sees them):`);
      console.log(`   impressions: ${firstElement.impressions || firstElement.impressionCount || 'NOT FOUND'}`);
      console.log(`   clicks: ${firstElement.clicks || firstElement.clickCount || 'NOT FOUND'}`);
      console.log(`   costInLocalCurrency: ${firstElement.costInLocalCurrency || 'NOT FOUND'}`);
      console.log(`   spend: ${firstElement.spend || 'NOT FOUND'}`);
      console.log(`   cost: ${firstElement.cost || 'NOT FOUND'}`);
      console.log(`   conversions: ${firstElement.conversions || 'NOT FOUND'}`);
      console.log(`   leadsGenerated: ${firstElement.leadsGenerated || 'NOT FOUND'}`);
      
      // Calculate totals like MCP server does
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
      
      console.log(`\n✅ Calculated Totals (MCP Server Method):`);
      console.log(`   Total Impressions: ${totalImpressions}`);
      console.log(`   Total Clicks: ${totalClicks}`);
      console.log(`   Total Spend: $${totalSpend.toFixed(2)}`);
      console.log(`   Total Conversions: ${totalConversions}`);
      console.log(`   Rows Processed: ${data.elements.length}`);
      
      const hasData = data.elements && data.elements.length > 0 && (totalImpressions > 0 || totalClicks > 0 || totalSpend > 0);
      console.log(`\n   Has Data: ${hasData}`);
      
    } else {
      console.log("\n⚠️  No elements in response");
      console.log("   Full response:", JSON.stringify(data, null, 2));
    }
    
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error(error.stack);
  }
}

testLinkedInAnalytics();
