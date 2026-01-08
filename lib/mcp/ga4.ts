/**
 * GA4 MCP Client
 * 
 * This client connects to Google Analytics 4 Data API directly
 * using the service account credentials.
 */

import { BetaAnalyticsDataClient } from "@google-analytics/data";

const propertyId = process.env.GA4_PROPERTY_ID || "383191966";
const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

// Initialize client if credentials are available
let analyticsDataClient: BetaAnalyticsDataClient | null = null;

if (credentialsPath) {
  try {
    // Handle Windows path format
    const normalizedPath = credentialsPath.replace(/\\/g, '/');
    analyticsDataClient = new BetaAnalyticsDataClient({
      keyFilename: normalizedPath,
    });
  } catch (error) {
    console.error("Failed to initialize GA4 client:", error);
  }
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
 * Convert date string like "7daysAgo" or "2024-01-15" to actual date
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
    const today = new Date();
    return today.toISOString().split("T")[0];
  }
  
  if (dateStr.endsWith("daysAgo")) {
    const days = parseInt(dateStr);
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split("T")[0];
  }
  
  return dateStr;
}

/**
 * Fetch GA4 overview data
 */
export async function fetchGA4Overview(params: GA4QueryParams = {}): Promise<GA4Response> {
  if (!analyticsDataClient || !propertyId) {
    throw new Error("GA4 credentials not configured. Set GOOGLE_APPLICATION_CREDENTIALS and GA4_PROPERTY_ID");
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
      dimensions: [{ name: "pagePath" }],
      metrics: [
        { name: "totalUsers" },
        { name: "screenPageViews" },
        { name: "engagementRate" },
      ],
      orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
      limit: 15,
    });

    const pages = (response.rows || []).map((row) => ({
      path: row.dimensionValues?.[0]?.value || "Unknown",
      users: parseInt(row.metricValues?.[0]?.value || "0"),
      pageViews: parseInt(row.metricValues?.[1]?.value || "0"),
      engagementRate: parseFloat(row.metricValues?.[2]?.value || "0"),
    }));

    return { pages };
  } catch (error: any) {
    console.error("GA4 API Error:", error);
    throw new Error(`GA4 API Error: ${error.message}`);
  }
}
