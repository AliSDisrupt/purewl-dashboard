/**
 * GA4 Fluid Fusion Forms Data
 * 
 * Fetches traffic and conversion data for:
 * - Reddit (source: reddit.com)
 * - Google Ads (medium: cpc, source: google)
 * - Website/Direct (source: direct or medium: (none))
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

export interface FluidFusionSource {
  source: string;
  medium: string;
  users: number;
  sessions: number;
  impressions?: number; // Estimated from sessions
  clicks: number; // Sessions are clicks
  conversions: number;
  revenue: number;
}

export interface FluidFusionData {
  reddit: FluidFusionSource;
  googleAds: FluidFusionSource;
  website: FluidFusionSource;
  total: {
    users: number;
    sessions: number;
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
  };
}

/**
 * Fetch Fluid Fusion Forms data (Reddit, Google Ads, Website)
 */
export async function fetchGA4FluidFusion(
  params: { startDate?: string; endDate?: string } = {}
): Promise<FluidFusionData> {
  if (!analyticsDataClient || !propertyId) {
    throw new Error("GA4 credentials not configured");
  }

  const { startDate = "30daysAgo", endDate = "yesterday" } = params;
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  try {
    // Fetch source/medium data with filters
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
        { name: "conversions" },
        { name: "totalRevenue" },
        { name: "screenPageViews" }, // Use as proxy for impressions
      ],
      dimensionFilter: {
        orGroup: {
          expressions: [
            // Reddit
            {
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
                ],
              },
            },
            // Google Ads
            {
              andGroup: {
                expressions: [
                  {
                    filter: {
                      fieldName: "sessionSource",
                      stringFilter: {
                        matchType: "EXACT",
                        value: "google",
                        caseSensitive: false,
                      },
                    },
                  },
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
                ],
              },
            },
            // Website/Direct
            {
              orGroup: {
                expressions: [
                  {
                    filter: {
                      fieldName: "sessionSource",
                      stringFilter: {
                        matchType: "EXACT",
                        value: "(direct)",
                        caseSensitive: false,
                      },
                    },
                  },
                  {
                    filter: {
                      fieldName: "sessionMedium",
                      stringFilter: {
                        matchType: "EXACT",
                        value: "(none)",
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

    // Initialize default values
    const defaultSource: FluidFusionSource = {
      source: "",
      medium: "",
      users: 0,
      sessions: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      revenue: 0,
    };

    let reddit: FluidFusionSource = { ...defaultSource, source: "reddit", medium: "referral" };
    let googleAds: FluidFusionSource = { ...defaultSource, source: "google", medium: "cpc" };
    let website: FluidFusionSource = { ...defaultSource, source: "(direct)", medium: "(none)" };

    // Process rows
    for (const row of response.rows || []) {
      const source = row.dimensionValues?.[0]?.value || "";
      const medium = row.dimensionValues?.[1]?.value || "";
      const users = parseInt(row.metricValues?.[0]?.value || "0");
      const sessions = parseInt(row.metricValues?.[1]?.value || "0");
      const conversions = parseFloat(row.metricValues?.[2]?.value || "0");
      const revenue = parseFloat(row.metricValues?.[3]?.value || "0");
      const pageViews = parseInt(row.metricValues?.[4]?.value || "0");

      // Categorize by source
      if (source.toLowerCase().includes("reddit")) {
        reddit.users += users;
        reddit.sessions += sessions;
        reddit.impressions = (reddit.impressions || 0) + pageViews; // Use page views as proxy
        reddit.clicks += sessions;
        reddit.conversions += conversions;
        reddit.revenue += revenue;
      } else if (source.toLowerCase() === "google" && medium.toLowerCase() === "cpc") {
        googleAds.users += users;
        googleAds.sessions += sessions;
        googleAds.impressions = (googleAds.impressions || 0) + pageViews;
        googleAds.clicks += sessions;
        googleAds.conversions += conversions;
        googleAds.revenue += revenue;
      } else if (source.toLowerCase() === "(direct)" || medium.toLowerCase() === "(none)") {
        website.users += users;
        website.sessions += sessions;
        website.impressions = (website.impressions || 0) + pageViews;
        website.clicks += sessions;
        website.conversions += conversions;
        website.revenue += revenue;
      }
    }

    // Calculate totals
    const total = {
      users: reddit.users + googleAds.users + website.users,
      sessions: reddit.sessions + googleAds.sessions + website.sessions,
      impressions: (reddit.impressions || 0) + (googleAds.impressions || 0) + (website.impressions || 0),
      clicks: reddit.clicks + googleAds.clicks + website.clicks,
      conversions: reddit.conversions + googleAds.conversions + website.conversions,
      revenue: reddit.revenue + googleAds.revenue + website.revenue,
    };

    return {
      reddit,
      googleAds,
      website,
      total,
    };
  } catch (error: any) {
    console.error("GA4 Fluid Fusion API Error:", error);
    throw new Error(`GA4 Fluid Fusion API Error: ${error.message}`);
  }
}
