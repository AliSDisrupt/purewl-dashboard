#!/usr/bin/env node

/**
 * Test script to check if funnel API returns breakdown data
 */

const testFunnelBreakdown = async () => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const startDate = "2025-01-01";
  const endDate = "2025-01-31";

  try {
    console.log(`Testing funnel API: ${baseUrl}/api/funnel?startDate=${startDate}&endDate=${endDate}\n`);
    
    const response = await fetch(`${baseUrl}/api/funnel?startDate=${startDate}&endDate=${endDate}`);
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log("✅ Funnel API Response:");
    console.log("=".repeat(60));
    
    if (data.funnel) {
      Object.keys(data.funnel).forEach((level) => {
        const levelData = data.funnel[level];
        console.log(`\n${level.toUpperCase()}:`);
        console.log(`  Label: ${levelData.label}`);
        console.log(`  Value: ${levelData.value}`);
        console.log(`  Breakdown:`, levelData.breakdown || "NO BREAKDOWN DATA");
        
        if (levelData.breakdown && Object.keys(levelData.breakdown).length > 0) {
          console.log(`  ✅ Breakdown has ${Object.keys(levelData.breakdown).length} channels`);
          Object.entries(levelData.breakdown).forEach(([channel, value]) => {
            console.log(`    - ${channel}: ${value}`);
          });
        } else {
          console.log(`  ❌ No breakdown data available`);
        }
      });
    } else {
      console.log("❌ No funnel data in response");
    }
    
    console.log("\n" + "=".repeat(60));
    console.log("\n📊 Full Response Structure:");
    console.log(JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error("❌ Error testing funnel API:", error.message);
    process.exit(1);
  }
};

testFunnelBreakdown();
