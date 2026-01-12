// Test the actual API endpoint to see what it returns
async function testAPI() {
  console.log("\n🔍 Testing LinkedIn Analytics API Endpoint\n");
  console.log("=".repeat(70));
  
  try {
    const accountId = "514469053";
    const url = `http://localhost:3000/api/linkedin/analytics?accountId=${encodeURIComponent(accountId)}&daysBack=30`;
    
    console.log(`\n📡 Calling: ${url}\n`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log(`📥 Response Status: ${response.status}`);
    console.log(`\n📊 Response Data:`);
    console.log(JSON.stringify(data, null, 2));
    
    if (data.metrics) {
      console.log(`\n✅ Metrics:`);
      console.log(`   Impressions: ${data.metrics.impressions}`);
      console.log(`   Clicks: ${data.metrics.clicks}`);
      console.log(`   Spend: $${data.metrics.spend}`);
      console.log(`   Conversions: ${data.metrics.conversions}`);
      console.log(`   Has Data: ${data.hasData}`);
    }
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testAPI();
