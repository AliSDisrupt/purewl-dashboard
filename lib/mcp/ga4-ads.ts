/**
 * GA4 Ads Data
 * 
 * Fetches ad performance data for:
 * - Reddit Ads (source: reddit, medium: cpc/paid)
 * - FluentForm Ads (campaigns containing "fluentform" or specific source/medium)
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

let analyticsDataClient: BetaAnalyticsDataClient | null = null;

try {
  analyticsDataClient = new BetaAnalyticsDataClient({
    credentials: credentials,
  });
} catch (error) {
  console.error("Failed to initialize GA4 client:", error);
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
