/**
 * Direct GA4 API Test
 * Tests GA4 endpoints directly to diagnose issues
 */

const { BetaAnalyticsDataClient } = require("@google-analytics/data");

// Hardcoded credentials (same as in lib/mcp/ga4.ts)
const credentials = {
  type: "service_account",
  project_id: "claude-ga4-mcp-483413",
  private_key_id: "54ea94a29f4693c8480854f4da4fbd8060e71de2",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDNu8Q6kwD6V3vk\niP6IsxUisvUfIkwZfUWNDodKM1Tu8aU1FZZpbJrzMaR4iwEkApRgKIvGy1idn71G\nGdWjYDEiG8Ej5eupmdxB+Htjeh3olqMdyp9BTnsqjklpF68pNdWuhcQnxtVmGdlN\nnQ1xVMQDiNVipOkQa4uBtB/dQrdahBkLudNZp4eOywNSSLo19icCqBG8aVm7+LC+\nVc4KhN7LxiOKEsBBLiusNWDLRsXqgV9Okix10MtDi9PC4R7osHTR29rRpjeoC0OL\nDZ2PFTncDqnuAiCOlKyWzkgT/yCxOC2sXVu5DRaJTRTkv1i6v6dpmKxWIkp6s2Hi\nwKgSX8SDAgMBAAECggEADolcjXb4SWKyZ6zLr1pX/Uz/x49jfnmSLIFWSzE3/cTS\nk4mkSGwFbCGZ1BqeSK5rUCVimvf17vfr0RmKNYevxmUyTxhef8FWBXif30uFntA7\nU6OO1SJ3zsNMVJdOfRmcsOmADqocnKDpmx5PENmYcAIpxv/ip+exbRy5E6ffJLoI\nRhVinOc4W8sq561SbER9WvnUEcnN0vwsy5sHNgvIAMF/vPbaQMhfugq8TwCw41QP\nJU2bh7E9eVZ1KtZjJtpOH3FM70PWZaQYtnbtkg8oUQCNrmIaHjO57uCYxaPCNE+j\nkF+8u6c4A0MTY/WSeshBZiYaZ6E/fT2Y5X/jfTmWIQKBgQDuvl4dHEpVaha/reQ9\nEATZqXpv0Tq2gGnpjuRTjP17Ho9VxEtNOHy6A1aaDmRviZdt8x0JC1ij1LRg8gu9\nffpno8twLzCAdxPoi6y/04XS3twSnxuGwUkBWaoCH5SXSwfXUkRshi+Y8pA7xoGX\nEtfzrBwnS3MR+7TqY5Wj6cD6pwKBgQDcmpcC2MtARtvYdLBLrHPURRmiwC2zZ9JP\nV7MSyuhthjYc8zCID9howSHx6Q5Gh49crfkJLSwqrmJ6MGNi5W8WTBi5nz9fPtVk\nSoKfwquAob9OK+ZaGTCu2quzXctUGhciiDSpkzVyZRtF+DoCgJzy2gpPW5Ct2sdJ\nQYB3h4BOxQKBgGlWbUgC13lgWbExFGcszjcLZA46DuG/PvviJDQJHT5ZeXyqI19q\n8P1Rw8AtYXslBj9o6QK4kt+WVhAAO9Xb48QerQBOkePcplgQaKQqu/0Sf59nvEl0\ntrV1zmEpdfJbFJaYocAQZKfjPmhhaYQyuD23TqS30Ym5uVVBoyCzXoY5AoGAIA1N\n95nsHhCtjIuXucb6pVLM4LqvaSuigOirGgXlM1SWtCoZWQuEU+QLvIwyCMlVaQ/V\n6SFpE2J26G3zYsEXHNQ9m2qp2HrWolW5GOE97diSZRc3xst2KVGYNN1h13xa9Cd6\nD1FWKKLMDaR9OTPameZYLSOOp9PrtJcRxUwotkkCgYBgWWwscuT4l3MRUbv+I1+a\nIBQNkAxm3GHCQM2DH/z71V+uZ4TvQYSsdzqCtFvi3ywcbuHBLgqkUQxns0SMlg9C\nHcqO5z1FHD8vTIdU8zKy1Vka6Es2vT0fZHdohXuQLtQ+Vv17GzbfaGRvauLiGkKd\nNFKx69WKUEhC3KyD45rXkQ==\n-----END PRIVATE KEY-----\n",
  client_email: "ga4-viewer@claude-ga4-mcp-483413.iam.gserviceaccount.com",
  client_id: "113131558866134582044",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/ga4-viewer%40claude-ga4-mcp-483413.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

const propertyId = "383191966";

async function testGA4Client() {
  console.log("🧪 Testing GA4 Client Initialization...\n");

  // Test 1: Initialize client
  let client;
  try {
    client = new BetaAnalyticsDataClient({
      credentials: credentials,
    });
    console.log("✅ GA4 client initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize GA4 client:", error.message);
    console.error("Error details:", error);
    return;
  }

  // Test 2: Test Overview
  console.log("\n🧪 Testing get_ga4_overview...");
  try {
    const startDate = "7daysAgo";
    const endDate = "yesterday";
    
    // Parse dates
    const parseDate = (dateStr) => {
      if (dateStr === "yesterday") {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        return d.toISOString().split("T")[0];
      }
      if (dateStr.endsWith("daysAgo")) {
        const days = parseInt(dateStr);
        const d = new Date();
        d.setDate(d.getDate() - days);
        return d.toISOString().split("T")[0];
      }
      return dateStr;
    };

    const [response] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: parseDate(startDate), endDate: parseDate(endDate) }],
      metrics: [
        { name: "totalUsers" },
        { name: "newUsers" },
        { name: "sessions" },
        { name: "screenPageViews" },
      ],
    });

    const row = response.rows?.[0];
    console.log("✅ Overview data retrieved:");
    console.log(`   Users: ${row?.metricValues?.[0]?.value || 0}`);
    console.log(`   Sessions: ${row?.metricValues?.[2]?.value || 0}`);
  } catch (error) {
    console.error("❌ Overview test failed:", error.message);
    console.error("Error code:", error.code);
    console.error("Error details:", error);
  }

  // Test 3: Test Top Pages
  console.log("\n🧪 Testing get_ga4_top_pages...");
  try {
    const startDate = "30daysAgo";
    const endDate = "yesterday";
    
    const parseDate = (dateStr) => {
      if (dateStr === "yesterday") {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        return d.toISOString().split("T")[0];
      }
      if (dateStr.endsWith("daysAgo")) {
        const days = parseInt(dateStr);
        const d = new Date();
        d.setDate(d.getDate() - days);
        return d.toISOString().split("T")[0];
      }
      return dateStr;
    };

    const [response] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: parseDate(startDate), endDate: parseDate(endDate) }],
      dimensions: [{ name: "pagePath" }, { name: "pageTitle" }],
      metrics: [
        { name: "totalUsers" },
        { name: "screenPageViews" },
      ],
      orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
      limit: 10,
    });

    console.log("✅ Top pages data retrieved:");
    console.log(`   Found ${response.rows?.length || 0} pages`);
    if (response.rows && response.rows.length > 0) {
      console.log(`   Top page: ${response.rows[0].dimensionValues?.[0]?.value || "Unknown"}`);
    }
  } catch (error) {
    console.error("❌ Top pages test failed:", error.message);
    console.error("Error code:", error.code);
    console.error("Error details:", error);
  }

  // Test 4: Test Content
  console.log("\n🧪 Testing get_ga4_content...");
  try {
    const startDate = "30daysAgo";
    const endDate = "yesterday";
    
    const parseDate = (dateStr) => {
      if (dateStr === "yesterday") {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        return d.toISOString().split("T")[0];
      }
      if (dateStr.endsWith("daysAgo")) {
        const days = parseInt(dateStr);
        const d = new Date();
        d.setDate(d.getDate() - days);
        return d.toISOString().split("T")[0];
      }
      return dateStr;
    };

    const [response] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: parseDate(startDate), endDate: parseDate(endDate) }],
      dimensions: [
        { name: "pageTitle" },
        { name: "pagePath" },
      ],
      metrics: [
        { name: "totalUsers" },
        { name: "screenPageViews" },
      ],
      orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
      limit: 10,
    });

    console.log("✅ Content data retrieved:");
    console.log(`   Found ${response.rows?.length || 0} content items`);
  } catch (error) {
    console.error("❌ Content test failed:", error.message);
    console.error("Error code:", error.code);
    console.error("Error details:", error);
  }

  console.log("\n✅ Diagnostic test complete!");
}

testGA4Client().catch(console.error);
