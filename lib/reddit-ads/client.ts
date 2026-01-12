/**
 * Reddit Ads API Client
 * 
 * Fetches Reddit Ads data using the Reddit Ads API
 */

const REDDIT_ADS_API_KEY = process.env.REDDIT_ADS_API_KEY || "eyJhbGciOiJSUzI1NiIsImtpZCI6IlNIQTI1NjpzS3dsMnlsV0VtMjVmcXhwTU40cWY4MXE2OWFFdWFyMnpLMUdhVGxjdWNZIiwidHlwIjoiSldUIn0.eyJzdWIiOiJ1c2VyIiwiZXhwIjo0OTIzNjk5NjU0LjAwOTMyOSwiaWF0IjoxNzY3OTM5NjU0LjAwOTMyOSwianRpIjoiN1dUYzFCZE8xRDhLb2d0T25DODBMOHNKeEdxdWN3IiwiY2lkIjoiMVExRU96VFBXbll2ZXJocHR2Z1dzUSIsImxpZCI6InQyXzI1cnlqamY2c2UiLCJhaWQiOiJ0Ml8yNXJ5ampmNnNlIiwiYXQiOjUsImxjYSI6MTc2NzkzOTY1MjM2NCwic2NwIjoiZUp5S1ZrcE1LVTdPenl0TExTck96TThyVm9vRkJBQUFfXzlCRmdidSIsImZsbyI6MTAsImxsIjp0cnVlfQ.HcaxVZBO_XgkLUwQoORuLE3Cxfy5JSCYPYw3Kbv6w1dSPEzJgkUqZX2-NiBuLioQ2Nm2e9B3uwcw4qMMLqXuq2NqGlHYfncpMsXgOoFb-uDatUZioHklP9Ql2cxZ7qP6TSQB87irSTPRduG2aDhllyVatwRpncYehTvcGvi9pJW0kPHcNj3HmPO7OX575_p68hPP_xiPmp7BtwX3OI9QeHrUEC-h1hLZKP0luC93hg0LGcGqvWSyazJcEQk_f8nKYqDbLNB6JX5ioUf-ep2zdFqj12YKfplNtKXawUkebbR0TnSkpbB17bLCouU6Kdhjps12r8T_IntNmiQw7Vrn9Q";

// Reddit Ads API - Try v3 first (v2 is deprecated), then fallback to v2
const REDDIT_ADS_API_BASE_V3 = "https://ads-api.reddit.com/api/v3";
const REDDIT_ADS_API_BASE_V2 = "https://ads-api.reddit.com/api/v2";

export interface RedditAdCampaign {
  id: string;
  name: string;
  status: string;
  startDate: string;
  endDate?: string;
  budget: number;
  impressions: number;
  clicks: number;
  spend: number;
  conversions?: number;
  ctr: number;
  cpc: number;
}

export interface RedditAdsAccount {
  accountId: string;
  accountName: string;
  campaigns: RedditAdCampaign[];
  summary: {
    totalImpressions: number;
    totalClicks: number;
    totalSpend: number;
    totalConversions: number;
    averageCtr: number;
    averageCpc: number;
  };
  error?: string;
}

/**
 * Fetch Reddit Ads campaigns and metrics
 */
export async function fetchRedditAdsData(
  startDate?: string,
  endDate?: string
): Promise<RedditAdsAccount> {
  const headers = {
    Authorization: `Bearer ${REDDIT_ADS_API_KEY}`,
    "Content-Type": "application/json",
  };

  try {
    // Try multiple possible endpoints for Reddit Ads API
    // Reddit migrated to v3, but we'll try both v3 and v2
    // The API structure might vary, so we'll try different approaches
    
    // First, try to get account info - try different endpoints (v3 first, then v2)
    const possibleAccountEndpoints = [
      // V3 endpoints
      `${REDDIT_ADS_API_BASE_V3}/advertisers`,
      `${REDDIT_ADS_API_BASE_V3}/accounts`,
      // V2 endpoints (fallback)
      `${REDDIT_ADS_API_BASE_V2}/advertisers`,
      `${REDDIT_ADS_API_BASE_V2}/accounts`,
      // Alternative endpoints
      `https://ads-api.reddit.com/api/v1/advertisers`,
      `https://ads-api.reddit.com/api/v1/accounts`,
    ];

    let accountResponse = null;
    let accountData = null;
    let accountId = null;

    for (const endpoint of possibleAccountEndpoints) {
      try {
        accountResponse = await fetch(endpoint, { headers });
        if (accountResponse.ok) {
          accountData = await accountResponse.json();
          // Try to extract account ID from different response structures
          accountId = accountData.data?.[0]?.id || 
                     accountData.id || 
                     accountData.account_id ||
                     accountData.name; // Reddit username format
          if (accountId) break;
        }
      } catch (error) {
        // Continue to next endpoint
        continue;
      }
    }

    if (!accountId) {
      // If we can't get account ID from API, use the one from the token
      // The token contains aid: t2_25ryjjf6se
      accountId = "t2_25ryjjf6se";
      console.warn("Could not fetch account from API, using token account ID:", accountId);
    }

    if (!accountResponse || !accountResponse.ok) {
      const errorText = accountResponse ? await accountResponse.text() : "No response";
      const status = accountResponse?.status;
      console.error("Reddit Ads API Error:", status, errorText);
      
      // If all endpoints return 404, the API might not be accessible
      if (status === 404) {
        console.warn("Reddit Ads API returned 404. Possible issues:");
        console.warn("1. Token might not be for Ads API (could be general Reddit OAuth token)");
        console.warn("2. Account might need Business Manager integration");
        console.warn("3. API access might not be enabled for this account");
        console.warn("4. API endpoints might have changed");
      }
      // Don't throw - continue with token account ID
    }

    // Account ID is now set above

    // Parse date range
    const parseDate = (dateStr?: string): string => {
      if (!dateStr) return "";
      if (dateStr === "yesterday") {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        return d.toISOString().split("T")[0];
      }
      if (dateStr === "today") {
        return new Date().toISOString().split("T")[0];
      }
      if (dateStr.endsWith("daysAgo")) {
        const days = parseInt(dateStr);
        const d = new Date();
        d.setDate(d.getDate() - days);
        return d.toISOString().split("T")[0];
      }
      return dateStr; // Assume YYYY-MM-DD format
    };

    const start = parseDate(startDate);
    const end = parseDate(endDate);

    // Fetch campaigns - try different possible endpoints (v3 first, then v2)
    const possibleCampaignEndpoints = [
      // V3 endpoints
      `${REDDIT_ADS_API_BASE_V3}/advertisers/${accountId}/campaigns`,
      `${REDDIT_ADS_API_BASE_V3}/campaigns?advertiser_id=${accountId}`,
      `${REDDIT_ADS_API_BASE_V3}/accounts/${accountId}/campaigns`,
      // V2 endpoints (fallback)
      `${REDDIT_ADS_API_BASE_V2}/advertisers/${accountId}/campaigns`,
      `${REDDIT_ADS_API_BASE_V2}/campaigns?advertiser_id=${accountId}`,
      `${REDDIT_ADS_API_BASE_V2}/accounts/${accountId}/campaigns`,
      // Alternative endpoints
      `https://ads-api.reddit.com/api/v1/advertisers/${accountId}/campaigns`,
      `https://ads-api.reddit.com/api/v1/campaigns?advertiser_id=${accountId}`,
    ];

    let campaignsData = null;
    let campaigns = [];

    for (const endpoint of possibleCampaignEndpoints) {
      try {
        const campaignsResponse = await fetch(endpoint, { headers });
        if (campaignsResponse.ok) {
          campaignsData = await campaignsResponse.json();
          campaigns = campaignsData.data || campaignsData.campaigns || campaignsData.results || [];
          if (campaigns.length > 0 || campaignsData) break;
        }
      } catch (error) {
        continue;
      }
    }

    // If no campaigns found via API, return empty but don't error
    if (!campaignsData) {
      console.warn("Could not fetch campaigns from Reddit Ads API. The API endpoint structure might be different.");
      console.warn("All endpoints returned 404. This suggests:");
      console.warn("- The token might not be for Reddit Ads API");
      console.warn("- The account might need Business Manager integration");
      console.warn("- API access might not be enabled");
      
      // Return empty data structure so UI can show a helpful message
      return {
        accountId,
        accountName: `Reddit Ads Account ${accountId}`,
        campaigns: [],
        summary: {
          totalImpressions: 0,
          totalClicks: 0,
          totalSpend: 0,
          totalConversions: 0,
          averageCtr: 0,
          averageCpc: 0,
        },
        error: "API endpoints not found (404). Please verify the token is for Reddit Ads API and that the account has API access enabled through Business Manager.",
      };
    }

    // Fetch metrics for each campaign
    const campaignsWithMetrics: RedditAdCampaign[] = [];

    for (const campaign of campaigns) {
      try {
        // Try v3 first, then v2 for metrics
        const possibleMetricsUrls = [
          `${REDDIT_ADS_API_BASE_V3}/advertisers/${accountId}/campaigns/${campaign.id}/stats`,
          `${REDDIT_ADS_API_BASE_V3}/campaigns/${campaign.id}/stats?advertiser_id=${accountId}`,
          `${REDDIT_ADS_API_BASE_V2}/advertisers/${accountId}/campaigns/${campaign.id}/stats`,
          `${REDDIT_ADS_API_BASE_V2}/campaigns/${campaign.id}/stats?advertiser_id=${accountId}`,
        ];

        const metricsParams = new URLSearchParams();
        if (start) metricsParams.append("start_date", start);
        if (end) metricsParams.append("end_date", end);

        let metricsResponse = null;
        for (const metricsUrl of possibleMetricsUrls) {
          try {
            metricsResponse = await fetch(
              `${metricsUrl}?${metricsParams.toString()}`,
              { headers }
            );
            if (metricsResponse.ok) break;
          } catch (e) {
            continue;
          }
        }

        if (!metricsResponse) {
          metricsResponse = { ok: false } as Response;
        }

        let metrics = {
          impressions: 0,
          clicks: 0,
          spend: 0,
          conversions: 0,
        };

        if (metricsResponse.ok) {
          const metricsData = await metricsResponse.json();
          const stats = metricsData.data || metricsData.stats || {};
          metrics = {
            impressions: parseInt(stats.impressions || stats.imp || "0"),
            clicks: parseInt(stats.clicks || "0"),
            spend: parseFloat(stats.spend || stats.cost || "0"),
            conversions: parseInt(stats.conversions || stats.conv || "0"),
          };
        }

        const ctr = metrics.impressions > 0 ? (metrics.clicks / metrics.impressions) * 100 : 0;
        const cpc = metrics.clicks > 0 ? metrics.spend / metrics.clicks : 0;

        campaignsWithMetrics.push({
          id: campaign.id || String(campaign.campaign_id),
          name: campaign.name || campaign.campaign_name || "Unnamed Campaign",
          status: campaign.status || campaign.state || "UNKNOWN",
          startDate: campaign.start_date || campaign.startDate || "",
          endDate: campaign.end_date || campaign.endDate,
          budget: parseFloat(campaign.budget || campaign.daily_budget || "0"),
          impressions: metrics.impressions,
          clicks: metrics.clicks,
          spend: metrics.spend,
          conversions: metrics.conversions,
          ctr,
          cpc,
        });
      } catch (error) {
        console.error(`Error fetching metrics for campaign ${campaign.id}:`, error);
        // Continue with other campaigns even if one fails
      }
    }

    // Calculate summary
    const summary = campaignsWithMetrics.reduce(
      (acc, campaign) => {
        acc.totalImpressions += campaign.impressions;
        acc.totalClicks += campaign.clicks;
        acc.totalSpend += campaign.spend;
        acc.totalConversions += campaign.conversions || 0;
        return acc;
      },
      {
        totalImpressions: 0,
        totalClicks: 0,
        totalSpend: 0,
        totalConversions: 0,
        averageCtr: 0,
        averageCpc: 0,
      }
    );

    summary.averageCtr =
      summary.totalImpressions > 0 ? (summary.totalClicks / summary.totalImpressions) * 100 : 0;
    summary.averageCpc = summary.totalClicks > 0 ? summary.totalSpend / summary.totalClicks : 0;

    return {
      accountId,
      accountName: accountData?.data?.[0]?.name || accountData?.name || `Reddit Ads Account ${accountId}`,
      campaigns: campaignsWithMetrics,
      summary,
    };
  } catch (error: any) {
    console.error("Reddit Ads API Error:", error);
    throw new Error(`Reddit Ads API Error: ${error.message}`);
  }
}
