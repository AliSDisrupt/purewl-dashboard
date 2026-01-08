/**
 * GA4 Ads Data
 * 
 * Fetches ad performance data for:
 * - Reddit Ads (source: reddit, medium: cpc/paid)
 * - FluentForm Ads (campaigns containing "fluentform" or specific source/medium)
 */

import { BetaAnalyticsDataClient } from "@google-analytics/data";

const propertyId = process.env.GA4_PROPERTY_ID || "383191966";
const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

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

export interface AdSourceData {
  source: string;
  medium: string;
  campaign?: string;
  impressions: number; // Estimated from page views
  clicks: number; // Sessions
  users: number;
  sessions: number;
  conversions: number;
  revenue: number;
  ctr: number;
  cpc: number;
}

export interface GA4AdsData {
  reddit: AdSourceData;
  fluentForm: AdSourceData;
  total: {
    impressions: number;
    clicks: number;
    users: number;
    sessions: number;
    conversions: number;
    revenue: number;
  };
}

/**
 * Fetch Reddit Ads data from GA4
 */
export async function fetchGA4RedditAds(
  params: { startDate?: string; endDate?: string } = {}
): Promise<AdSourceData> {
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
        { name: "campaignName" },
      ],
      metrics: [
        { name: "totalUsers" },
        { name: "sessions" },
        { name: "conversions" },
        { name: "totalRevenue" },
        { name: "screenPageViews" }, // Use as proxy for impressions
      ],
      dimensionFilter: {
        andGroup: {
          expressions: [
            {
              filter: {
                fieldName: "sessionSource",
                stringFilter: {
                  matchType: "CONTAINS",
                  value: "reddit",
                  caseSensitive: false,
                },
              },
            },
            {
              orGroup: {
                expressions: [
                  {
                    filter: {
                      fieldName: "sessionMedium",
                      stringFilter: {
                        matchType: "EXACT",
                        value: "cpc",
                        caseSensitive: false,
                      },
                    },
                  },
                  {
                    filter: {
                      fieldName: "sessionMedium",
                      stringFilter: {
                        matchType: "EXACT",
                        value: "paid",
                        caseSensitive: false,
                      },
                    },
                  },
                ],
              },
            },
          ],
        },
      },
      orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
      limit: 100,
    });

    let totalUsers = 0;
    let totalSessions = 0;
    let totalConversions = 0;
    let totalRevenue = 0;
    let totalPageViews = 0;
    let source = "reddit";
    let medium = "cpc";
    let campaign = "";

    for (const row of response.rows || []) {
      const users = parseInt(row.metricValues?.[0]?.value || "0");
      const sessions = parseInt(row.metricValues?.[1]?.value || "0");
      const conversions = parseFloat(row.metricValues?.[2]?.value || "0");
      const revenue = parseFloat(row.metricValues?.[3]?.value || "0");
      const pageViews = parseInt(row.metricValues?.[4]?.value || "0");

      totalUsers += users;
      totalSessions += sessions;
      totalConversions += conversions;
      totalRevenue += revenue;
      totalPageViews += pageViews;

      if (!source) source = row.dimensionValues?.[0]?.value || "reddit";
      if (!medium) medium = row.dimensionValues?.[1]?.value || "cpc";
    }

    const impressions = totalPageViews;
    const clicks = totalSessions;
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    const cpc = clicks > 0 ? (totalRevenue / clicks) : 0;

    return {
      source,
      medium,
      campaign,
      impressions,
      clicks,
      users: totalUsers,
      sessions: totalSessions,
      conversions: totalConversions,
      revenue: totalRevenue,
      ctr,
      cpc,
    };
  } catch (error: any) {
    console.error("GA4 Reddit Ads API Error:", error);
    throw new Error(`GA4 Reddit Ads API Error: ${error.message}`);
  }
}

/**
 * Fetch FluentForm Ads data from GA4
 */
export async function fetchGA4FluentFormAds(
  params: { startDate?: string; endDate?: string } = {}
): Promise<AdSourceData> {
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
        { name: "campaignName" },
      ],
      metrics: [
        { name: "totalUsers" },
        { name: "sessions" },
        { name: "conversions" },
        { name: "totalRevenue" },
        { name: "screenPageViews" },
      ],
      dimensionFilter: {
        orGroup: {
          expressions: [
            // Filter by campaign name containing "fluent" (any variation)
            {
              filter: {
                fieldName: "campaignName",
                stringFilter: {
                  matchType: "CONTAINS",
                  value: "fluent",
                  caseSensitive: false,
                },
              },
            },
            // Or filter by source containing "fluent"
            {
              filter: {
                fieldName: "sessionSource",
                stringFilter: {
                  matchType: "CONTAINS",
                  value: "fluent",
                  caseSensitive: false,
                },
              },
            },
            // Or filter by medium containing "fluent"
            {
              filter: {
                fieldName: "sessionMedium",
                stringFilter: {
                  matchType: "CONTAINS",
                  value: "fluent",
                  caseSensitive: false,
                },
              },
            },
          ],
        },
      },
      orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
      limit: 100,
    });

    let totalUsers = 0;
    let totalSessions = 0;
    let totalConversions = 0;
    let totalRevenue = 0;
    let totalPageViews = 0;
    let source = "fluent";
    let medium = "";
    let campaign = "";

    for (const row of response.rows || []) {
      const users = parseInt(row.metricValues?.[0]?.value || "0");
      const sessions = parseInt(row.metricValues?.[1]?.value || "0");
      const conversions = parseFloat(row.metricValues?.[2]?.value || "0");
      const revenue = parseFloat(row.metricValues?.[3]?.value || "0");
      const pageViews = parseInt(row.metricValues?.[4]?.value || "0");

      totalUsers += users;
      totalSessions += sessions;
      totalConversions += conversions;
      totalRevenue += revenue;
      totalPageViews += pageViews;

      // Get the first source/medium/campaign found
      const rowSource = row.dimensionValues?.[0]?.value || "";
      const rowMedium = row.dimensionValues?.[1]?.value || "";
      const rowCampaign = row.dimensionValues?.[2]?.value || "";

      if (!source || source === "fluent") {
        source = rowSource || "fluent";
      }
      if (!medium && rowMedium) {
        medium = rowMedium;
      }
      if (!campaign && rowCampaign) {
        campaign = rowCampaign;
      }
    }

    const impressions = totalPageViews;
    const clicks = totalSessions;
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    const cpc = clicks > 0 ? (totalRevenue / clicks) : 0;

    return {
      source,
      medium,
      campaign,
      impressions,
      clicks,
      users: totalUsers,
      sessions: totalSessions,
      conversions: totalConversions,
      revenue: totalRevenue,
      ctr,
      cpc,
    };
  } catch (error: any) {
    console.error("GA4 FluentForm Ads API Error:", error);
    throw new Error(`GA4 FluentForm Ads API Error: ${error.message}`);
  }
}

/**
 * Fetch all GA4 Ads data (Reddit + FluentForm)
 */
export async function fetchGA4Ads(
  params: { startDate?: string; endDate?: string } = {}
): Promise<GA4AdsData> {
  const [reddit, fluentForm] = await Promise.all([
    fetchGA4RedditAds(params),
    fetchGA4FluentFormAds(params),
  ]);

  return {
    reddit,
    fluentForm,
    total: {
      impressions: reddit.impressions + fluentForm.impressions,
      clicks: reddit.clicks + fluentForm.clicks,
      users: reddit.users + fluentForm.users,
      sessions: reddit.sessions + fluentForm.sessions,
      conversions: reddit.conversions + fluentForm.conversions,
      revenue: reddit.revenue + fluentForm.revenue,
    },
  };
}
