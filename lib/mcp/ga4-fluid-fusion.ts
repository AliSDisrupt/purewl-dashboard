/**
 * GA4 Fluid Fusion Forms Data
 * 
 * Fetches traffic and conversion data for:
 * - Reddit (source: reddit.com)
 * - Google Ads (medium: cpc, source: google)
 * - Website/Direct (source: direct or medium: (none))
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
