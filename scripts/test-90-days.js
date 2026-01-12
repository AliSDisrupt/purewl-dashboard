// Test with 90 days to see if data exists in a longer range
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

async function test90Days() {
  console.log("\n🔍 Testing with 90 days date range\n");
  console.log("=".repeat(70));
  
  const fullAccountId = `urn:li:sponsoredAccount:${ACCOUNT_ID}`;
  
  // Calculate 90 days back
  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() - 1);
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 90);
  
  console.log(`\n📅 Date Range: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);
  console.log(`   (90 days back from yesterday)\n`);
  
  // Test account-level
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
  
  const response = await fetch(`${url}?${params}`, {
    headers: getHeaders(),
  });
  
  console.log(`📥 Account-Level API Status: ${response.status}`);
  
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
      
      console.log(`\n✅ Found Data (90 days):`);
      console.log(`   Impressions: ${totalImpressions.toLocaleString()}`);
      console.log(`   Clicks: ${totalClicks.toLocaleString()}`);
      console.log(`   Spend: $${totalSpend.toFixed(2)}`);
    } else {
      console.log(`\n⚠️  No data in 90 days either`);
    }
  } else if (response.status === 404) {
    console.log(`\n⚠️  404 - No account-level data in 90 days`);
  } else {
    const errorText = await response.text();
    console.log(`\n❌ Error: ${errorText.substring(0, 200)}`);
  }
}

test90Days();
