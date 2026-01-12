// Debug script to see exactly what data LinkedIn returns and how MCP processes it
const ACCESS_TOKEN = process.env.LINKEDIN_ACCESS_TOKEN || "AQWkKXim-oqXnFtJfr46yhTzjqGOpjUC4nDMIwE2udJaKxzwMD0ZVrQoEeYWAh_Sjuj4eVJoueJae2ktgtp1mADMfLu-5xoMOm8P1WbAd34QzIgu-xoNGahFylCpR2vIu3xLDz9jN6EUEH-N3YEjdRk7tbBeTp_Cw1BTVTfv98-97LlqF2Q_FaYnSnpUiQkIJa97QYt0NkG4QTalJociKJ7Vq2L8ZG7yuN3jlUqWqe0wxJf_zKmC1bte6tG4yOpLhRT0A2MjACrOyRTAZOyOvHWLmFa4_y1WW2O17nJ81b2506Xyz_IpSGthyfh2iDkst_wsLO017cnMOomldMfidhlenPspow";
const API_BASE = "https://api.linkedin.com/rest";

function getHeaders() {
  return {
    "Authorization": `Bearer ${ACCESS_TOKEN}`,
    "LinkedIn-Version": "202511",
    "X-Restli-Protocol-Version": "2.0.0",
    "Content-Type": "application/json"
  };
}

async function testMCPFetch(accountId, daysBack = 30) {
  console.log(`\n🔍 Testing MCP Server Fetch Method`);
  console.log(`   Account: ${accountId}`);
  console.log(`   Days Back: ${daysBack}`);
  console.log("=".repeat(70));
  
  try {
    // Same logic as lib/mcp/linkedin.ts fetchLinkedInAnalytics
    let fullAccountId = accountId;
    if (!accountId.startsWith("urn:li:")) {
      fullAccountId = `urn:li:sponsoredAccount:${accountId}`;
    }
    
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() - 1);
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - daysBack);
    
    console.log(`\n📅 Date Range Calculation:`);
    console.log(`   Today: ${today.toISOString().split('T')[0]}`);
    console.log(`   End Date (yesterday): ${endDate.toISOString().split('T')[0]}`);
    console.log(`   Start Date: ${startDate.toISOString().split('T')[0]}`);
    console.log(`   Full Account ID: ${fullAccountId}`);
    
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
    
    console.log(`\n📡 API Request:`);
    console.log(`   Endpoint: ${url}`);
    console.log(`   Query Params: ${params.toString()}`);
    
    const response = await fetch(`${url}?${params}`, {
      headers: getHeaders(),
    });
    
    console.log(`\n📥 Response:`);
    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    if (response.status === 404) {
      console.log(`\n   ⚠️  404 - LinkedIn returns 404 when there's no activity`);
      console.log(`   This means: No impressions, clicks, or spend in this date range`);
      console.log(`   MCP server returns: { hasData: false, metrics: { all zeros } }`);
      return { hasData: false, metrics: { impressions: 0, clicks: 0, spend: 0, conversions: 0 } };
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`\n   ❌ Error Response:`);
      console.log(`   ${errorText.substring(0, 500)}`);
      throw new Error(`LinkedIn API Error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    
    console.log(`\n📊 Response Data Structure:`);
    console.log(`   Type: ${typeof data}`);
    console.log(`   Has 'elements': ${!!data.elements}`);
    console.log(`   Elements count: ${data.elements?.length || 0}`);
    console.log(`   Top-level keys: ${Object.keys(data).join(', ')}`);
    
    if (!data.elements || data.elements.length === 0) {
      console.log(`\n   ⚠️  Empty elements array`);
      console.log(`   Full response: ${JSON.stringify(data, null, 2).substring(0, 500)}`);
      return { hasData: false, metrics: { impressions: 0, clicks: 0, spend: 0, conversions: 0 } };
    }
    
    console.log(`\n📋 First Element Structure:`);
    const firstRow = data.elements[0];
    console.log(`   Keys in first row: ${Object.keys(firstRow).join(', ')}`);
    console.log(`\n   Raw first row data:`);
    console.log(JSON.stringify(firstRow, null, 2));
    
    // Process exactly like MCP server does
    console.log(`\n🔢 Processing Data (MCP Server Logic):`);
    let totalImpressions = 0;
    let totalClicks = 0;
    let totalSpend = 0;
    let totalConversions = 0;
    
    for (const row of data.elements || []) {
      const imp = parseInt(row.impressions || row.impressionCount || 0);
      const clk = parseInt(row.clicks || row.clickCount || 0);
      const spd = parseFloat(row.costInLocalCurrency || row.spend || row.cost || 0);
      const conv = parseInt(row.conversions || row.leadsGenerated || row.conversionCount || 0);
      
      console.log(`   Row ${data.elements.indexOf(row) + 1}:`);
      console.log(`      impressions field: ${row.impressions || row.impressionCount || 'NOT FOUND'}`);
      console.log(`      clicks field: ${row.clicks || row.clickCount || 'NOT FOUND'}`);
      console.log(`      costInLocalCurrency: ${row.costInLocalCurrency || 'NOT FOUND'}`);
      console.log(`      spend: ${row.spend || 'NOT FOUND'}`);
      console.log(`      cost: ${row.cost || 'NOT FOUND'}`);
      console.log(`      → Parsed: imp=${imp}, clk=${clk}, spd=${spd}, conv=${conv}`);
      
      totalImpressions += imp;
      totalClicks += clk;
      totalSpend += spd;
      totalConversions += conv;
    }
    
    console.log(`\n✅ Final Totals (MCP Server Output):`);
    console.log(`   Impressions: ${totalImpressions.toLocaleString()}`);
    console.log(`   Clicks: ${totalClicks.toLocaleString()}`);
    console.log(`   Spend: $${totalSpend.toFixed(2)}`);
    console.log(`   Conversions: ${totalConversions}`);
    
    const hasData = data.elements && data.elements.length > 0 && (totalImpressions > 0 || totalClicks > 0 || totalSpend > 0);
    console.log(`\n   Has Data: ${hasData}`);
    console.log(`   MCP Returns: { hasData: ${hasData}, metrics: { impressions: ${totalImpressions}, clicks: ${totalClicks}, spend: ${totalSpend}, conversions: ${totalConversions} } }`);
    
    return {
      hasData,
      metrics: {
        impressions: totalImpressions,
        clicks: totalClicks,
        spend: totalSpend,
        conversions: totalConversions,
      }
    };
    
  } catch (error) {
    console.error(`\n❌ Error:`, error.message);
    console.error(error.stack);
    return { hasData: false, metrics: { impressions: 0, clicks: 0, spend: 0, conversions: 0 } };
  }
}

// Test with the main account
testMCPFetch("514469053", 30).then(() => {
  console.log("\n" + "=".repeat(70));
  console.log("\n✅ Test Complete");
});
