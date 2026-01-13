/**
 * Google Ads Data from GA4
 * 
 * Fetches Google Ads performance data through GA4
 * This is an alternative to the direct Google Ads API
 * Works when Google Ads is linked to GA4
 */

import { BetaAnalyticsDataClient } from "@google-analytics/data";

// GA4 Property ID
const propertyId = process.env.GA4_PROPERTY_ID || "383191966";

// Initialize GA4 client
let analyticsDataClient: BetaAnalyticsDataClient | null = null;

// Try to initialize with service account credentials
try {
  let credentials;
  
  // Check if GOOGLE_APPLICATION_CREDENTIALS is a JSON string or a file path
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      // Try parsing as JSON first
      credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
    } catch {
      // If not JSON, it's probably a file path - use hardcoded credentials instead
      credentials = {
        type: "service_account",
        project_id: "claude-ga4-mcp-483413",
        private_key_id: "54ea94a29f4693c8480854f4da4fbd8060e71de2",
        private_key: process.env.GA4_PRIVATE_KEY?.replace(/\\n/g, '\n') || "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDNu8Q6kwD6V3vk\niP6IsxUisvUfIkwZfUWNDodKM1Tu8aU1FZZpbJrzMaR4iwEkApRgKIvGy1idn71G\nGdWjYDEiG8Ej5eupmdxB+Htjeh3olqMdyp9BTnsqjklpF68pNdWuhcQnxtVmGdlN\nnQ1xVMQDiNVipOkQa4uBtB/dQrdahBkLudNZp4eOywNSSLo19icCqBG8aVm7+LC+\nVc4KhN7LxiOKEsBBLiusNWDLRsXqgV9Okix10MtDi9PC4R7osHTR29rRpjeoC0OL\nDZ2PFTncDqnuAiCOlKyWzkgT/yCxOC2sXVu5DRaJTRTkv1i6v6dpmKxWIkp6s2Hi\nwKgSX8SDAgMBAAECggEADolcjXb4SWKyZ6zLr1pX/Uz/x49jfnmSLIFWSzE3/cTS\nk4mkSGwFbCGZ1BqeSK5rUCVimvf17vfr0RmKNYevxmUyTxhef8FWBXif30uFntA7\nU6OO1SJ3zsNMVJdOfRmcsOmADqocnKDpmx5PENmYcAIpxv/ip+exbRy5E6ffJLoI\nRhVinOc4W8sq561SbER9WvnUEcnN0vwsy5sHNgvIAMF/vPbaQMhfugq8TwCw41QP\nJU2bh7E9eVZ1KtZjJtpOH3FM70PWZaQYtnbtkg8oUQCNrmIaHjO57uCYxaPCNE+j\nkF+8u6c4A0MTY/WSeshBZiYaZ6E/fT2Y5X/jfTmWIQKBgQDuvl4dHEpVaha/reQ9\nEATZqXpv0Tq2gGnpjuRTjP17Ho9VxEtNOHy6A1aaDmRviZdt8x0JC1ij1LRg8gu9\nffpno8twLzCAdxPoi6y/04XS3twSnxuGwUkBWaoCH5SXSwfXUkRshi+Y8pA7xoGX\nEtfzrBwnS3MR+7TqY5Wj6cD6pwKBgQDcmpcC2MtARtvYdLBLrHPURRmiwC2zZ9JP\nV7MSyuhthjYc8zCID9howSHx6Q5Gh49crfkJLSwqrmJ6MGNi5W8WTBi5nz9fPtVk\nSoKfwquAob9OK+ZaGTCu2quzXctUGhciiDSpkzVyZRtF+DoCgJzy2gpPW5Ct2sdJ\nQYB3h4BOxQKBgGlWbUgC13lgWbExFGcszjcLZA46DuG/PvviJDQJHT5ZeXyqI19q\n8P1Rw8AtYXslBj9o6QK4kt+WVhAAO9Xb48QerQBOkePcplgQaKQqu/0Sf59nvEl0\ntrV1zmEpdfJbFJaYocAQZKfjPmhhaYQyuD23TqS30Ym5uVVBoyCzXoY5AoGAIA1N\n95nsHhCtjIuXucb6pVLM4LqvaSuigOirGgXlM1SWtCoZWQuEU+QLvIwyCMlVaQ/V\n6SFpE2J26G3zYsEXHNQ9m2qp2HrWolW5GOE97diSZRc3xst2KVGYNN1h13xa9Cd6\nD1FWKKLMDaR9OTPameZYLSOOp9PrtJcRxUwotkkCgYBgWWwscuT4l3MRUbv+I1+a\nIBQNkAxm3GHCQM2DH/z71V+uZ4TvQYSsdzqCtFvi3ywcbuHBLgqkUQxns0SMlg9C\nHcqO5z1FHD8vTIdU8zKy1Vka6Es2vT0fZHdohXuQLtQ+Vv17GzbfaGRvauLiGkKd\nNFKx69WKUEhC3KyD45rXkQ==\n-----END PRIVATE KEY-----\n",
        client_email: "ga4-viewer@claude-ga4-mcp-483413.iam.gserviceaccount.com",
        client_id: "113131558866134582044",
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/ga4-viewer%40claude-ga4-mcp-483413.iam.gserviceaccount.com",
        universe_domain: "googleapis.com"
      };
    }
  } else {
    // No env var, use hardcoded credentials
    credentials = {
      type: "service_account",
      project_id: "claude-ga4-mcp-483413",
      private_key_id: "54ea94a29f4693c8480854f4da4fbd8060e71de2",
      private_key: process.env.GA4_PRIVATE_KEY?.replace(/\\n/g, '\n') || "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDNu8Q6kwD6V3vk\niP6IsxUisvUfIkwZfUWNDodKM1Tu8aU1FZZpbJrzMaR4iwEkApRgKIvGy1idn71G\nGdWjYDEiG8Ej5eupmdxB+Htjeh3olqMdyp9BTnsqjklpF68pNdWuhcQnxtVmGdlN\nnQ1xVMQDiNVipOkQa4uBtB/dQrdahBkLudNZp4eOywNSSLo19icCqBG8aVm7+LC+\nVc4KhN7LxiOKEsBBLiusNWDLRsXqgV9Okix10MtDi9PC4R7osHTR29rRpjeoC0OL\nDZ2PFTncDqnuAiCOlKyWzkgT/yCxOC2sXVu5DRaJTRTkv1i6v6dpmKxWIkp6s2Hi\nwKgSX8SDAgMBAAECggEADolcjXb4SWKyZ6zLr1pX/Uz/x49jfnmSLIFWSzE3/cTS\nk4mkSGwFbCGZ1BqeSK5rUCVimvf17vfr0RmKNYevxmUyTxhef8FWBXif30uFntA7\nU6OO1SJ3zsNMVJdOfRmcsOmADqocnKDpmx5PENmYcAIpxv/ip+exbRy5E6ffJLoI\nRhVinOc4W8sq561SbER9WvnUEcnN0vwsy5sHNgvIAMF/vPbaQMhfugq8TwCw41QP\nJU2bh7E9eVZ1KtZjJtpOH3FM70PWZaQYtnbtkg8oUQCNrmIaHjO57uCYxaPCNE+j\nkF+8u6c4A0MTY/WSeshBZiYaZ6E/fT2Y5X/jfTmWIQKBgQDuvl4dHEpVaha/reQ9\nEATZqXpv0Tq2gGnpjuRTjP17Ho9VxEtNOHy6A1aaDmRviZdt8x0JC1ij1LRg8gu9\nffpno8twLzCAdxPoi6y/04XS3twSnxuGwUkBWaoCH5SXSwfXUkRshi+Y8pA7xoGX\nEtfzrBwnS3MR+7TqY5Wj6cD6pwKBgQDcmpcC2MtARtvYdLBLrHPURRmiwC2zZ9JP\nV7MSyuhthjYc8zCID9howSHx6Q5Gh49crfkJLSwqrmJ6MGNi5W8WTBi5nz9fPtVk\nSoKfwquAob9OK+ZaGTCu2quzXctUGhciiDSpkzVyZRtF+DoCgJzy2gpPW5Ct2sdJ\nQYB3h4BOxQKBgGlWbUgC13lgWbExFGcszjcLZA46DuG/PvviJDQJHT5ZeXyqI19q\n8P1Rw8AtYXslBj9o6QK4kt+WVhAAO9Xb48QerQBOkePcplgQaKQqu/0Sf59nvEl0\ntrV1zmEpdfJbFJaYocAQZKfjPmhhaYQyuD23TqS30Ym5uVVBoyCzXoY5AoGAIA1N\n95nsHhCtjIuXucb6pVLM4LqvaSuigOirGgXlM1SWtCoZWQuEU+QLvIwyCMlVaQ/V\n6SFpE2J26G3zYsEXHNQ9m2qp2HrWolW5GOE97diSZRc3xst2KVGYNN1h13xa9Cd6\nD1FWKKLMDaR9OTPameZYLSOOp9PrtJcRxUwotkkCgYBgWWwscuT4l3MRUbv+I1+a\nIBQNkAxm3GHCQM2DH/z71V+uZ4TvQYSsdzqCtFvi3ywcbuHBLgqkUQxns0SMlg9C\nHcqO5z1FHD8vTIdU8zKy1Vka6Es2vT0fZHdohXuQLtQ+Vv17GzbfaGRvauLiGkKd\nNFKx69WKUEhC3KyD45rXkQ==\n-----END PRIVATE KEY-----\n",
      client_email: "ga4-viewer@claude-ga4-mcp-483413.iam.gserviceaccount.com",
      client_id: "113131558866134582044",
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/ga4-viewer%40claude-ga4-mcp-483413.iam.gserviceaccount.com",
      universe_domain: "googleapis.com"
    };
  }

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

export interface GoogleAdsCampaign {
  id: string; // Campaign name as ID
  name: string;
  status: string; // "ENABLED" (estimated - GA4 doesn't provide status)
  impressions: number; // Page views as proxy
  clicks: number; // Sessions
  cost: number; // Revenue (if cost data is imported to GA4)
  conversions: number;
  ctr: number;
  cpc: number;
  cpa: number;
  date?: string;
}

export interface GoogleAdsData {
  customerId: string;
  currencyCode: string;
  descriptiveName: string;
  campaigns: GoogleAdsCampaign[];
  summary: {
    totalImpressions: number;
    totalClicks: number;
    totalCost: number;
    totalConversions: number;
    averageCtr: number;
    averageCpc: number;
  };
}

/**
 * Fetch Google Ads data from GA4
 * Filters by source=google and medium=cpc
 */
export async function fetchGoogleAdsFromGA4(
  params: { startDate?: string; endDate?: string } = {}
): Promise<GoogleAdsData> {
  if (!analyticsDataClient || !propertyId) {
    throw new Error("GA4 credentials not configured");
  }

  const { startDate = "30daysAgo", endDate = "yesterday" } = params;
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  try {
    // Fetch campaign-level data for Google Ads
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: start, endDate: end }],
      dimensions: [
        { name: "campaignName" },
        { name: "sessionSource" },
        { name: "sessionMedium" },
      ],
      metrics: [
        { name: "totalUsers" },
        { name: "sessions" }, // Use as clicks
        { name: "conversions" },
        { name: "totalRevenue" }, // Use as cost proxy if available
        { name: "eventCount" }, // Use as impressions proxy (alternative to screenPageViews)
      ],
      dimensionFilter: {
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
      orderBys: [
        { metric: { metricName: "sessions" }, desc: true },
        { dimension: { dimensionName: "campaignName" }, desc: false },
      ],
      limit: 10000,
    });

    // Aggregate by campaign
    const campaignMap = new Map<string, GoogleAdsCampaign>();

    for (const row of response.rows || []) {
      const campaignName = row.dimensionValues?.[0]?.value || "Unknown Campaign";
      const source = row.dimensionValues?.[1]?.value || "google";
      const medium = row.dimensionValues?.[2]?.value || "cpc";
      
      const users = parseInt(row.metricValues?.[0]?.value || "0");
      const sessions = parseInt(row.metricValues?.[1]?.value || "0");
      const conversions = parseFloat(row.metricValues?.[2]?.value || "0");
      const revenue = parseFloat(row.metricValues?.[3]?.value || "0");
      const eventCount = parseInt(row.metricValues?.[4]?.value || "0"); // Use as impressions proxy

      // Use campaign name as ID
      const campaignId = campaignName.toLowerCase().replace(/\s+/g, "-");

      if (!campaignMap.has(campaignId)) {
        campaignMap.set(campaignId, {
          id: campaignId,
          name: campaignName,
          status: "ENABLED", // GA4 doesn't provide status, assume enabled
          impressions: 0,
          clicks: 0,
          cost: 0,
          conversions: 0,
          ctr: 0,
          cpc: 0,
          cpa: 0,
        });
      }

      const campaign = campaignMap.get(campaignId)!;
      campaign.impressions += eventCount || sessions; // Use eventCount as impressions proxy, fallback to sessions
      campaign.clicks += sessions;
      campaign.cost += revenue; // Use revenue as cost proxy
      campaign.conversions += conversions;
    }

    // Calculate metrics for each campaign
    const campaigns = Array.from(campaignMap.values()).map((campaign) => {
      campaign.ctr = campaign.impressions > 0 ? (campaign.clicks / campaign.impressions) * 100 : 0;
      campaign.cpc = campaign.clicks > 0 ? campaign.cost / campaign.clicks : 0;
      campaign.cpa = campaign.conversions > 0 ? campaign.cost / campaign.conversions : 0;
      return campaign;
    });

    // Calculate summary
    const summary = campaigns.reduce(
      (acc, campaign) => {
        acc.totalImpressions += campaign.impressions;
        acc.totalClicks += campaign.clicks;
        acc.totalCost += campaign.cost;
        acc.totalConversions += campaign.conversions;
        return acc;
      },
      {
        totalImpressions: 0,
        totalClicks: 0,
        totalCost: 0,
        totalConversions: 0,
        averageCtr: 0,
        averageCpc: 0,
      }
    );

    summary.averageCtr =
      summary.totalImpressions > 0
        ? (summary.totalClicks / summary.totalImpressions) * 100
        : 0;
    summary.averageCpc =
      summary.totalClicks > 0 ? summary.totalCost / summary.totalClicks : 0;

    return {
      customerId: "GA4-GoogleAds",
      currencyCode: "USD",
      descriptiveName: "Google Ads (via GA4)",
      campaigns,
      summary,
    };
  } catch (error: any) {
    console.error("GA4 Google Ads API Error:", error);
    throw new Error(`GA4 Google Ads API Error: ${error.message}`);
  }
}
