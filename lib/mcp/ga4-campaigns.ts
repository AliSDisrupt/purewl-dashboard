/**
 * GA4 Campaigns and Additional Data
 * 
 * Extended GA4 data fetching for campaigns, source/medium, events, and demographics
 */

import { BetaAnalyticsDataClient } from "@google-analytics/data";

const propertyId = process.env.GA4_PROPERTY_ID || "383191966";
const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

// Initialize client if credentials are available
let analyticsDataClient: BetaAnalyticsDataClient | null = null;

if (credentialsPath) {
  try {
    const normalizedPath = credentialsPath.replace(/\\/g, '/');
    analyticsDataClient = new BetaAnalyticsDataClient({
      keyFilename: normalizedPath,
    });
  } catch (error) {
    console.error("Failed to initialize GA4 client:", error);
  }
}

function parseDate(dateStr: string): string {
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

export interface CampaignData {
  campaign: string;
  source: string;
  medium: string;
  users: number;
  sessions: number;
  conversions: number;
  revenue?: number;
}

export interface SourceMediumData {
  source: string;
  medium: string;
  users: number;
  sessions: number;
  engagementRate: number;
}

export interface EventData {
  eventName: string;
  eventCount: number;
  totalUsers: number;
  conversions: number;
}

export interface DemographicData {
  ageGroup?: string;
  gender?: string;
  users: number;
  sessions: number;
}

/**
 * Fetch Campaign Performance Data
 */
export async function fetchGA4Campaigns(params: { startDate?: string; endDate?: string } = {}) {
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
      dimensions: [
        { name: "campaignName" },
        { name: "source" },
        { name: "sessionMedium" },
      ],
      metrics: [
        { name: "totalUsers" },
        { name: "sessions" },
        { name: "conversions" },
        { name: "totalRevenue" },
      ],
      orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
      limit: 50,
    });

    const campaigns: CampaignData[] = (response.rows || []).map((row) => ({
      campaign: row.dimensionValues?.[0]?.value || "Unknown",
      source: row.dimensionValues?.[1]?.value || "Unknown",
      medium: row.dimensionValues?.[2]?.value || "Unknown",
      users: parseInt(row.metricValues?.[0]?.value || "0"),
      sessions: parseInt(row.metricValues?.[1]?.value || "0"),
      conversions: parseFloat(row.metricValues?.[2]?.value || "0"),
      revenue: parseFloat(row.metricValues?.[3]?.value || "0"),
    }));

    return { campaigns };
  } catch (error: any) {
    console.error("GA4 Campaigns API Error:", error);
    throw new Error(`GA4 Campaigns API Error: ${error.message}`);
  }
}

/**
 * Fetch Source/Medium Breakdown
 */
export async function fetchGA4SourceMedium(params: { startDate?: string; endDate?: string } = {}) {
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
      dimensions: [
        { name: "sessionSource" },
        { name: "sessionMedium" },
      ],
      metrics: [
        { name: "totalUsers" },
        { name: "sessions" },
        { name: "engagementRate" },
      ],
      orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
      limit: 50,
    });

    const sourceMedium: SourceMediumData[] = (response.rows || []).map((row) => ({
      source: row.dimensionValues?.[0]?.value || "Unknown",
      medium: row.dimensionValues?.[1]?.value || "Unknown",
      users: parseInt(row.metricValues?.[0]?.value || "0"),
      sessions: parseInt(row.metricValues?.[1]?.value || "0"),
      engagementRate: parseFloat(row.metricValues?.[2]?.value || "0"),
    }));

    return { sourceMedium };
  } catch (error: any) {
    console.error("GA4 Source/Medium API Error:", error);
    throw new Error(`GA4 Source/Medium API Error: ${error.message}`);
  }
}

/**
 * Fetch Top Events
 */
export async function fetchGA4Events(params: { startDate?: string; endDate?: string } = {}) {
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
      dimensions: [{ name: "eventName" }],
      metrics: [
        { name: "eventCount" },
        { name: "totalUsers" },
        { name: "conversions" },
      ],
      orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
      limit: 30,
    });

    const events: EventData[] = (response.rows || []).map((row) => ({
      eventName: row.dimensionValues?.[0]?.value || "Unknown",
      eventCount: parseInt(row.metricValues?.[0]?.value || "0"),
      totalUsers: parseInt(row.metricValues?.[1]?.value || "0"),
      conversions: parseFloat(row.metricValues?.[2]?.value || "0"),
    }));

    return { events };
  } catch (error: any) {
    console.error("GA4 Events API Error:", error);
    throw new Error(`GA4 Events API Error: ${error.message}`);
  }
}

/**
 * Fetch Demographics Data (Age and Gender)
 */
export async function fetchGA4Demographics(params: { startDate?: string; endDate?: string } = {}) {
  if (!analyticsDataClient || !propertyId) {
    throw new Error("GA4 credentials not configured");
  }

  const { startDate = "30daysAgo", endDate = "yesterday" } = params;
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  try {
    // Age Group
    const [ageResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: start, endDate: end }],
      dimensions: [{ name: "userAgeBracket" }],
      metrics: [
        { name: "totalUsers" },
        { name: "sessions" },
      ],
      orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
      limit: 20,
    });

    // Gender
    const [genderResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: start, endDate: end }],
      dimensions: [{ name: "userGender" }],
      metrics: [
        { name: "totalUsers" },
        { name: "sessions" },
      ],
      orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
      limit: 10,
    });

    const ageGroups: DemographicData[] = (ageResponse.rows || []).map((row) => ({
      ageGroup: row.dimensionValues?.[0]?.value || "Unknown",
      users: parseInt(row.metricValues?.[0]?.value || "0"),
      sessions: parseInt(row.metricValues?.[1]?.value || "0"),
    }));

    const genders: DemographicData[] = (genderResponse.rows || []).map((row) => ({
      gender: row.dimensionValues?.[0]?.value || "Unknown",
      users: parseInt(row.metricValues?.[0]?.value || "0"),
      sessions: parseInt(row.metricValues?.[1]?.value || "0"),
    }));

    return { ageGroups, genders };
  } catch (error: any) {
    console.error("GA4 Demographics API Error:", error);
    throw new Error(`GA4 Demographics API Error: ${error.message}`);
  }
}

/**
 * Fetch Technology Data (Browser, OS, Device)
 */
export async function fetchGA4Technology(params: { startDate?: string; endDate?: string } = {}) {
  if (!analyticsDataClient || !propertyId) {
    throw new Error("GA4 credentials not configured");
  }

  const { startDate = "30daysAgo", endDate = "yesterday" } = params;
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  try {
    // Browser
    const [browserResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: start, endDate: end }],
      dimensions: [{ name: "browser" }],
      metrics: [{ name: "totalUsers" }],
      orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
      limit: 15,
    });

    // Operating System
    const [osResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: start, endDate: end }],
      dimensions: [{ name: "operatingSystem" }],
      metrics: [{ name: "totalUsers" }],
      orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
      limit: 15,
    });

    const browsers = (browserResponse.rows || []).map((row) => ({
      browser: row.dimensionValues?.[0]?.value || "Unknown",
      users: parseInt(row.metricValues?.[0]?.value || "0"),
    }));

    const operatingSystems = (osResponse.rows || []).map((row) => ({
      os: row.dimensionValues?.[0]?.value || "Unknown",
      users: parseInt(row.metricValues?.[0]?.value || "0"),
    }));

    return { browsers, operatingSystems };
  } catch (error: any) {
    console.error("GA4 Technology API Error:", error);
    throw new Error(`GA4 Technology API Error: ${error.message}`);
  }
}

/**
 * PHASE 1: User Acquisition Path
 */
export async function fetchGA4Acquisition(params: { startDate?: string; endDate?: string } = {}) {
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
      dimensions: [
        { name: "firstUserSource" },
        { name: "firstUserMedium" },
        { name: "firstUserCampaignName" },
      ],
      metrics: [
        { name: "totalUsers" },
        { name: "newUsers" },
        { name: "sessions" },
      ],
      orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
      limit: 50,
    });

    const acquisition = (response.rows || []).map((row) => ({
      source: row.dimensionValues?.[0]?.value || "Unknown",
      medium: row.dimensionValues?.[1]?.value || "Unknown",
      campaign: row.dimensionValues?.[2]?.value || "(not set)",
      totalUsers: parseInt(row.metricValues?.[0]?.value || "0"),
      newUsers: parseInt(row.metricValues?.[1]?.value || "0"),
      sessions: parseInt(row.metricValues?.[2]?.value || "0"),
    }));

    return { acquisition };
  } catch (error: any) {
    console.error("GA4 Acquisition API Error:", error);
    throw new Error(`GA4 Acquisition API Error: ${error.message}`);
  }
}

/**
 * PHASE 1: Content Performance
 */
export async function fetchGA4Content(params: { startDate?: string; endDate?: string } = {}) {
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
      dimensions: [
        { name: "pageTitle" },
        { name: "pagePath" },
      ],
      metrics: [
        { name: "totalUsers" },
        { name: "screenPageViews" },
        { name: "engagementRate" },
        { name: "conversions" },
      ],
      orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
      limit: 50,
    });

    const content = (response.rows || []).map((row) => ({
      pageTitle: row.dimensionValues?.[0]?.value || "Unknown",
      pagePath: row.dimensionValues?.[1]?.value || "Unknown",
      users: parseInt(row.metricValues?.[0]?.value || "0"),
      pageViews: parseInt(row.metricValues?.[1]?.value || "0"),
      engagementRate: parseFloat(row.metricValues?.[2]?.value || "0"),
      conversions: parseFloat(row.metricValues?.[3]?.value || "0"),
    }));

    return { content };
  } catch (error: any) {
    console.error("GA4 Content API Error:", error);
    throw new Error(`GA4 Content API Error: ${error.message}`);
  }
}

/**
 * PHASE 1: Time-Based Patterns
 */
export async function fetchGA4TimePatterns(params: { startDate?: string; endDate?: string } = {}) {
  if (!analyticsDataClient || !propertyId) {
    throw new Error("GA4 credentials not configured");
  }

  const { startDate = "30daysAgo", endDate = "yesterday" } = params;
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  try {
    // Hour of day
    const [hourResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: start, endDate: end }],
      dimensions: [{ name: "hour" }],
      metrics: [
        { name: "totalUsers" },
        { name: "sessions" },
        { name: "conversions" },
      ],
      orderBys: [{ dimension: { dimensionName: "hour" } }],
    });

    // Day of week
    const [dayResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: start, endDate: end }],
      dimensions: [{ name: "dayOfWeek" }],
      metrics: [
        { name: "totalUsers" },
        { name: "sessions" },
        { name: "conversions" },
      ],
      orderBys: [{ dimension: { dimensionName: "dayOfWeek" } }],
    });

    const hours = (hourResponse.rows || []).map((row) => ({
      hour: parseInt(row.dimensionValues?.[0]?.value || "0"),
      users: parseInt(row.metricValues?.[0]?.value || "0"),
      sessions: parseInt(row.metricValues?.[1]?.value || "0"),
      conversions: parseFloat(row.metricValues?.[2]?.value || "0"),
    }));

    const daysOfWeek = (dayResponse.rows || []).map((row) => {
      const dayNum = parseInt(row.dimensionValues?.[0]?.value || "0");
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      return {
        dayOfWeek: dayNum,
        dayName: dayNames[dayNum] || "Unknown",
        users: parseInt(row.metricValues?.[0]?.value || "0"),
        sessions: parseInt(row.metricValues?.[1]?.value || "0"),
        conversions: parseFloat(row.metricValues?.[2]?.value || "0"),
      };
    });

    return { hours, daysOfWeek };
  } catch (error: any) {
    console.error("GA4 Time Patterns API Error:", error);
    throw new Error(`GA4 Time Patterns API Error: ${error.message}`);
  }
}

/**
 * PHASE 2: Conversion Paths
 */
export async function fetchGA4ConversionPaths(params: { startDate?: string; endDate?: string } = {}) {
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
      dimensions: [
        { name: "sessionSource" },
        { name: "sessionMedium" },
        { name: "sessionCampaignName" },
      ],
      metrics: [
        { name: "conversions" },
        { name: "totalRevenue" },
        { name: "sessions" },
      ],
      orderBys: [{ metric: { metricName: "conversions" }, desc: true }],
      limit: 50,
    });

    const paths = (response.rows || []).map((row) => ({
      source: row.dimensionValues?.[0]?.value || "Unknown",
      medium: row.dimensionValues?.[1]?.value || "Unknown",
      campaign: row.dimensionValues?.[2]?.value || "(not set)",
      conversions: parseFloat(row.metricValues?.[0]?.value || "0"),
      revenue: parseFloat(row.metricValues?.[1]?.value || "0"),
      sessions: parseInt(row.metricValues?.[2]?.value || "0"),
      conversionRate: parseFloat(row.metricValues?.[0]?.value || "0") / parseInt(row.metricValues?.[2]?.value || "1") * 100,
    }));

    return { paths };
  } catch (error: any) {
    console.error("GA4 Conversion Paths API Error:", error);
    throw new Error(`GA4 Conversion Paths API Error: ${error.message}`);
  }
}

/**
 * PHASE 2: User Retention
 */
export async function fetchGA4Retention(params: { startDate?: string; endDate?: string } = {}) {
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
      dimensions: [
        { name: "date" },
        { name: "newVsReturning" },
      ],
      metrics: [
        { name: "totalUsers" },
        { name: "sessions" },
        { name: "engagementRate" },
      ],
      orderBys: [{ dimension: { dimensionName: "date" } }],
    });

    const retention = (response.rows || []).map((row) => ({
      date: row.dimensionValues?.[0]?.value || "",
      userType: row.dimensionValues?.[1]?.value || "Unknown",
      users: parseInt(row.metricValues?.[0]?.value || "0"),
      sessions: parseInt(row.metricValues?.[1]?.value || "0"),
      engagementRate: parseFloat(row.metricValues?.[2]?.value || "0"),
    }));

    return { retention };
  } catch (error: any) {
    console.error("GA4 Retention API Error:", error);
    throw new Error(`GA4 Retention API Error: ${error.message}`);
  }
}

/**
 * PHASE 3: Search Terms
 */
export async function fetchGA4SearchTerms(params: { startDate?: string; endDate?: string } = {}) {
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
      dimensions: [{ name: "searchTerm" }],
      metrics: [
        { name: "totalUsers" },
        { name: "sessions" },
        { name: "searchResultViews" },
      ],
      orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
      limit: 30,
    });

    const searchTerms = (response.rows || []).map((row) => ({
      term: row.dimensionValues?.[0]?.value || "Unknown",
      users: parseInt(row.metricValues?.[0]?.value || "0"),
      sessions: parseInt(row.metricValues?.[1]?.value || "0"),
      resultViews: parseInt(row.metricValues?.[2]?.value || "0"),
    }));

    return { searchTerms };
  } catch (error: any) {
    // Search terms might not be available if site search isn't configured
    if (error.message?.includes("searchTerm")) {
      return { searchTerms: [] };
    }
    console.error("GA4 Search Terms API Error:", error);
    throw new Error(`GA4 Search Terms API Error: ${error.message}`);
  }
}

/**
 * PHASE 3: Real-Time Data
 */
export async function fetchGA4Realtime() {
  if (!analyticsDataClient || !propertyId) {
    throw new Error("GA4 credentials not configured");
  }

  try {
    // Get total active users
    const [totalResponse] = await analyticsDataClient.runRealtimeReport({
      property: `properties/${propertyId}`,
      metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
    });

    // Get by country
    const [countryResponse] = await analyticsDataClient.runRealtimeReport({
      property: `properties/${propertyId}`,
      dimensions: [{ name: "country" }],
      metrics: [{ name: "activeUsers" }],
      limit: 10,
    });

    // Get by device
    const [deviceResponse] = await analyticsDataClient.runRealtimeReport({
      property: `properties/${propertyId}`,
      dimensions: [{ name: "deviceCategory" }],
      metrics: [{ name: "activeUsers" }],
      limit: 10,
    });

    // Get top pages
    const [pagesResponse] = await analyticsDataClient.runRealtimeReport({
      property: `properties/${propertyId}`,
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }],
      limit: 10,
    });

    const realtime = {
      totalActiveUsers: parseInt(totalResponse.totals?.[0]?.metricValues?.[0]?.value || "0"),
      totalPageViews: parseInt(totalResponse.totals?.[0]?.metricValues?.[1]?.value || "0"),
      byCountry: (countryResponse.rows || []).map((row) => ({
        country: row.dimensionValues?.[0]?.value || "Unknown",
        users: parseInt(row.metricValues?.[0]?.value || "0"),
      })),
      byDevice: (deviceResponse.rows || []).map((row) => ({
        device: row.dimensionValues?.[0]?.value || "Unknown",
        users: parseInt(row.metricValues?.[0]?.value || "0"),
      })),
      topPages: (pagesResponse.rows || []).map((row) => ({
        page: row.dimensionValues?.[0]?.value || "Unknown",
        views: parseInt(row.metricValues?.[0]?.value || "0"),
      })),
    };

    return realtime;
  } catch (error: any) {
    // Real-time API might not be available or might have permission issues
    // Return empty data structure instead of throwing error
    console.warn("GA4 Realtime API Error (returning empty data):", error.message);
    return {
      totalActiveUsers: 0,
      totalPageViews: 0,
      byCountry: [],
      byDevice: [],
      topPages: [],
    };
  }
}
