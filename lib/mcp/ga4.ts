/**
 * GA4 MCP Client
 * 
 * This client connects to Google Analytics 4 Data API directly
 * using the service account credentials.
 */

import { BetaAnalyticsDataClient } from "@google-analytics/data";

// Hardcoded GA4 Property ID
const propertyId = "383191966";

// Hardcoded Google Analytics credentials
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

// Initialize client with hardcoded credentials
let analyticsDataClient: BetaAnalyticsDataClient | null = null;

try {
  analyticsDataClient = new BetaAnalyticsDataClient({
    credentials: credentials,
  });
  console.log("✅ GA4 client initialized successfully");
} catch (error) {
  console.error("❌ Failed to initialize GA4 client:", error);
  console.error("Error details:", error instanceof Error ? error.stack : String(error));
}

export interface GA4QueryParams {
  startDate?: string;
  endDate?: string;
  propertyId?: string;
  metrics?: string[];
  dimensions?: string[];
}

export interface GA4Response {
  summary: {
    totalUsers: number;
    newUsers: number;
    sessions: number;
    pageViews: number;
    engagementRate: number;
    avgSessionDuration: number;
    bounceRate: number;
  };
  trend: Array<{
    date: string;
    totalUsers: number;
    sessions: number;
  }>;
}

/**
 * Convert date string like "7daysAgo" or "2024-01-15" or "January 10, 2026" to actual date
 */
function parseDate(dateStr: string): string {
  // Handle ISO date format (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  
  if (dateStr === "yesterday") {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split("T")[0];
  }
  
  if (dateStr === "today") {
    // GA4 data is not available for today (delayed by 24-48 hours)
    // Use yesterday instead
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split("T")[0];
  }
  
  if (dateStr.endsWith("daysAgo")) {
    const days = parseInt(dateStr);
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split("T")[0];
  }

  // Handle natural language dates like "January 10, 2026" or "Jan 10 2026"
  try {
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      // Check if date is in the future (more than 1 day ahead)
      const now = new Date();
      const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      if (parsed > oneDayFromNow) {
        throw new Error(`Date "${dateStr}" is in the future. GA4 data is only available for past dates.`);
      }
      return parsed.toISOString().split("T")[0];
    }
  } catch (error: any) {
    // If parsing fails, throw a helpful error
    if (error.message && error.message.includes("future")) {
      throw error; // Re-throw future date errors
    }
    throw new Error(`Invalid date format: "${dateStr}". Please use formats like "2024-01-10", "7daysAgo", "yesterday", or "January 10, 2024".`);
  }
  
  // If we get here, the date format is not recognized
  throw new Error(`Unrecognized date format: "${dateStr}". Please use formats like "2024-01-10", "7daysAgo", "yesterday", or "January 10, 2024".`);
}

/**
 * Fetch GA4 overview data
 */
export async function fetchGA4Overview(params: GA4QueryParams = {}): Promise<GA4Response> {
  // Credentials are hardcoded, so this check is not needed
  // if (!analyticsDataClient || !propertyId) {
  //   throw new Error("GA4 credentials not configured. Set GOOGLE_APPLICATION_CREDENTIALS and GA4_PROPERTY_ID");
  // }
  
  if (!analyticsDataClient || !propertyId) {
    throw new Error("GA4 client initialization failed");
  }

  const { startDate = "7daysAgo", endDate = "yesterday" } = params;
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  try {
    // Get summary metrics
    const [summaryResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: start, endDate: end }],
      metrics: [
        { name: "totalUsers" },
        { name: "newUsers" },
        { name: "sessions" },
        { name: "screenPageViews" },
        { name: "engagementRate" },
        { name: "averageSessionDuration" },
        { name: "bounceRate" },
      ],
    });

    // Get daily trend
    const [trendResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: start, endDate: end }],
      dimensions: [{ name: "date" }],
      metrics: [{ name: "totalUsers" }, { name: "sessions" }],
      orderBys: [{ dimension: { dimensionName: "date" } }],
    });

    const summaryRow = summaryResponse.rows?.[0];
    const summary = {
      totalUsers: parseInt(summaryRow?.metricValues?.[0]?.value || "0"),
      newUsers: parseInt(summaryRow?.metricValues?.[1]?.value || "0"),
      sessions: parseInt(summaryRow?.metricValues?.[2]?.value || "0"),
      pageViews: parseInt(summaryRow?.metricValues?.[3]?.value || "0"),
      engagementRate: parseFloat(summaryRow?.metricValues?.[4]?.value || "0"),
      avgSessionDuration: parseFloat(summaryRow?.metricValues?.[5]?.value || "0"),
      bounceRate: parseFloat(summaryRow?.metricValues?.[6]?.value || "0"),
    };

    const trend = (trendResponse.rows || []).map((row) => ({
      date: row.dimensionValues?.[0]?.value || "",
      totalUsers: parseInt(row.metricValues?.[0]?.value || "0"),
      sessions: parseInt(row.metricValues?.[1]?.value || "0"),
    }));

    return { summary, trend };
  } catch (error: any) {
    console.error("GA4 API Error:", error);
    throw new Error(`GA4 API Error: ${error.message}`);
  }
}

export async function fetchGA4Channels(params: GA4QueryParams = {}) {
  if (!analyticsDataClient || !propertyId) {
    throw new Error("GA4 credentials not configured");
  }

  const { startDate = "30daysAgo", endDate = "yesterday" } = params;
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  try {
    // Get channel breakdown
    const [channelResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: start, endDate: end }],
      dimensions: [{ name: "sessionDefaultChannelGroup" }],
      metrics: [
        { name: "totalUsers" },
        { name: "sessions" },
        { name: "engagementRate" },
      ],
    });

    // Get device breakdown
    const [deviceResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: start, endDate: end }],
      dimensions: [{ name: "deviceCategory" }],
      metrics: [{ name: "totalUsers" }],
    });

    const channels = (channelResponse.rows || []).map((row) => ({
      channel: row.dimensionValues?.[0]?.value || "Unknown",
      users: parseInt(row.metricValues?.[0]?.value || "0"),
      sessions: parseInt(row.metricValues?.[1]?.value || "0"),
      engagementRate: parseFloat(row.metricValues?.[2]?.value || "0"),
    }));

    const totalUsers = channels.reduce((sum, ch) => sum + ch.users, 0);
    const byChannel = channels.map((ch) => ({
      ...ch,
      percentage: totalUsers > 0 ? (ch.users / totalUsers) * 100 : 0,
    }));

    const devices = (deviceResponse.rows || []).map((row) => {
      const users = parseInt(row.metricValues?.[0]?.value || "0");
      return {
        device: row.dimensionValues?.[0]?.value || "Unknown",
        users,
        percentage: totalUsers > 0 ? (users / totalUsers) * 100 : 0,
      };
    });

    return { byChannel, byDevice: devices };
  } catch (error: any) {
    console.error("GA4 API Error:", error);
    throw new Error(`GA4 API Error: ${error.message}`);
  }
}

export async function fetchGA4Geography(params: GA4QueryParams = {}) {
  if (!analyticsDataClient || !propertyId) {
    throw new Error("GA4 credentials not configured");
  }

  const { startDate = "30daysAgo", endDate = "yesterday" } = params;
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: start, endDate: end }],
      dimensions: [{ name: "country" }],
      metrics: [{ name: "totalUsers" }, { name: "sessions" }],
      orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
      limit: 20,
    });

    const { getCountryCode } = await import("@/lib/countryCodes");
    const countries = (response.rows || []).map((row) => {
      const countryName = row.dimensionValues?.[0]?.value || "Unknown";
      return {
        country: countryName,
        countryCode: getCountryCode(countryName),
        users: parseInt(row.metricValues?.[0]?.value || "0"),
        sessions: parseInt(row.metricValues?.[1]?.value || "0"),
      };
    });

    return { countries };
  } catch (error: any) {
    console.error("GA4 API Error:", error);
    throw new Error(`GA4 API Error: ${error.message}`);
  }
}

export async function fetchGA4TopPages(params: GA4QueryParams = {}) {
  if (!analyticsDataClient || !propertyId) {
    throw new Error("GA4 credentials not configured");
  }

  const { startDate = "30daysAgo", endDate = "yesterday" } = params;
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: start, endDate: end }],
      dimensions: [{ name: "pagePath" }, { name: "pageTitle" }],
      metrics: [
        { name: "totalUsers" },
        { name: "screenPageViews" },
        { name: "engagementRate" },
        { name: "averageSessionDuration" },
        { name: "bounceRate" },
      ],
      orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
      limit: 100, // Increased to 100 to capture more blog posts for Content ROI
    });

    const pages = (response.rows || []).map((row) => ({
      path: row.dimensionValues?.[0]?.value || "Unknown",
      title: row.dimensionValues?.[1]?.value || row.dimensionValues?.[0]?.value || "Unknown",
      users: parseInt(row.metricValues?.[0]?.value || "0"),
      pageViews: parseInt(row.metricValues?.[1]?.value || "0"),
      engagementRate: parseFloat(row.metricValues?.[2]?.value || "0"),
      avgEngagementTime: parseFloat(row.metricValues?.[3]?.value || "0"), // Average engagement time in seconds
      bounceRate: parseFloat(row.metricValues?.[4]?.value || "0"), // Bounce rate as decimal (0-1)
    }));

    return { pages };
  } catch (error: any) {
    console.error("GA4 API Error:", error);
    throw new Error(`GA4 API Error: ${error.message}`);
  }
}
