// Direct test of GA4 MCP functions
const { fetchGA4Overview, fetchGA4Realtime, fetchGA4TopPages } = require('../lib/mcp/ga4');

async function testGA4Direct() {
  console.log("🧪 Testing GA4 MCP Functions Directly...\n");

  try {
    console.log("1. Testing get_ga4_overview...");
    const overview = await fetchGA4Overview({ startDate: '7daysAgo', endDate: 'yesterday' });
    console.log("   ✅ SUCCESS!");
    console.log("   Summary:", {
      totalUsers: overview.summary?.totalUsers,
      sessions: overview.summary?.sessions,
      pageViews: overview.summary?.pageViews,
    });
    console.log("");
  } catch (error) {
    console.log("   ❌ Error:", error.message);
    console.log("");
  }

  try {
    console.log("2. Testing get_ga4_realtime...");
    const realtime = await fetchGA4Realtime();
    console.log("   ✅ SUCCESS!");
    console.log("   Active Users:", realtime.activeUsers || 0);
    console.log("   Top Pages:", realtime.topPages?.length || 0);
    console.log("");
  } catch (error) {
    console.log("   ❌ Error:", error.message);
    console.log("");
  }

  try {
    console.log("3. Testing get_ga4_top_pages...");
    const pages = await fetchGA4TopPages({ startDate: '30daysAgo', endDate: 'yesterday' });
    console.log("   ✅ SUCCESS!");
    console.log("   Pages found:", pages.pages?.length || 0);
    if (pages.pages && pages.pages.length > 0) {
      console.log("   Top page:", pages.pages[0].path, "-", pages.pages[0].users, "users");
    }
    console.log("");
  } catch (error) {
    console.log("   ❌ Error:", error.message);
    console.log("");
  }

  console.log("✅ GA4 MCP Direct Test Completed!");
}

testGA4Direct()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
