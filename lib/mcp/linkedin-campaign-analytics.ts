/**
 * LinkedIn Campaign-Level Analytics
 * 
 * Fetches analytics for individual campaigns
 */

const API_BASE = process.env.LINKEDIN_API_BASE || "https://api.linkedin.com/rest";
const ACCESS_TOKEN = process.env.LINKEDIN_ACCESS_TOKEN;

function getHeaders() {
  return {
    "Authorization": `Bearer ${ACCESS_TOKEN}`,
    "LinkedIn-Version": "202511",
    "X-Restli-Protocol-Version": "2.0.0",
    "Content-Type": "application/json"
  };
}

export interface LinkedInMetrics {
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
}

/**
 * Fetch analytics for a specific campaign
 */
export async function fetchLinkedInCampaignAnalytics(
  campaignId: string,
  accountId: string,
  daysBack: number = 30
): Promise<LinkedInMetrics | null> {
  if (!ACCESS_TOKEN) {
    console.warn("LINKEDIN_ACCESS_TOKEN not configured");
    return null;
  }

  try {
    // Ensure full URN for campaign
    let fullCampaignId = campaignId;
    if (!campaignId.startsWith("urn:li:")) {
      fullCampaignId = `urn:li:sponsoredCampaign:${campaignId}`;
    }

    // Ensure full URN for account
    let fullAccountId = accountId;
    if (!accountId.startsWith("urn:li:")) {
      fullAccountId = `urn:li:sponsoredAccount:${accountId}`;
    }

    // Calculate date range (yesterday to daysBack ago)
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() - 1); // Yesterday
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - daysBack);

    const url = `${API_BASE}/adAnalyticsV2`;
    const params = new URLSearchParams({
      q: "analytics",
      pivot: "CAMPAIGN",
      timeGranularity: "ALL",
      "dateRange.start.day": String(startDate.getDate()),
      "dateRange.start.month": String(startDate.getMonth() + 1),
      "dateRange.start.year": String(startDate.getFullYear()),
      "dateRange.end.day": String(endDate.getDate()),
      "dateRange.end.month": String(endDate.getMonth() + 1),
      "dateRange.end.year": String(endDate.getFullYear()),
      campaigns: `List(${fullCampaignId})`,
      accounts: `List(${fullAccountId})`,
      fields: "impressions,clicks,costInLocalCurrency,conversions,leadsGenerated",
    });

    const response = await fetch(`${url}?${params}`, {
      headers: getHeaders(),
    });

    // 404 means no data - this is OK, return zeros so we know we checked
    if (response.status === 404) {
      console.log(`Campaign ${fullCampaignId}: No analytics data (404)`);
      return {
        impressions: 0,
        clicks: 0,
        spend: 0,
        conversions: 0,
      };
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`LinkedIn Campaign Analytics API Error: ${response.status} - ${errorText}`);
      return null;
    }

    const data = await response.json();

    // Sum up all rows
    let totalImpressions = 0;
    let totalClicks = 0;
    let totalSpend = 0;
    let totalConversions = 0;

    for (const row of data.elements || []) {
      totalImpressions += parseInt(row.impressions || row.impressionCount || 0);
      totalClicks += parseInt(row.clicks || row.clickCount || 0);
      totalSpend += parseFloat(row.costInLocalCurrency || row.spend || row.cost || 0);
      totalConversions += parseInt(row.conversions || row.leadsGenerated || row.conversionCount || 0);
    }

    console.log(`Campaign ${fullCampaignId} analytics:`, {
      impressions: totalImpressions,
      clicks: totalClicks,
      spend: totalSpend,
      conversions: totalConversions,
    });

    return {
      impressions: totalImpressions,
      clicks: totalClicks,
      spend: totalSpend,
      conversions: totalConversions,
    };
  } catch (error) {
    console.error("Error fetching LinkedIn campaign analytics:", error);
    return null;
  }
}

/**
 * Fetch analytics for multiple campaigns (batch)
 */
export async function fetchLinkedInCampaignsAnalytics(
  campaigns: Array<{ id: string; accountId: string; status: string }>,
  daysBack: number = 30
): Promise<Map<string, LinkedInMetrics>> {
  const analyticsMap = new Map<string, LinkedInMetrics>();

  // Only fetch analytics for ACTIVE or RUNNING campaigns
  const activeCampaigns = campaigns.filter(
    (c) => c.status?.toUpperCase() === "ACTIVE" || c.status?.toUpperCase() === "RUNNING"
  );

  // Fetch analytics for active campaigns in parallel (limit to 10 at a time to avoid rate limits)
  const batchSize = 10;
  for (let i = 0; i < activeCampaigns.length; i += batchSize) {
    const batch = activeCampaigns.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(async (campaign) => {
        const analytics = await fetchLinkedInCampaignAnalytics(
          campaign.id,
          campaign.accountId,
          daysBack
        );
        return { campaignId: campaign.id, analytics };
      })
    );

    results.forEach(({ campaignId, analytics }) => {
      // Always set analytics, even if it's zeros (so we know we checked)
      if (analytics) {
        analyticsMap.set(campaignId, analytics);
      } else {
        // Set empty analytics for campaigns that returned null (error case)
        // This way we know we tried to fetch but failed
        analyticsMap.set(campaignId, {
          impressions: 0,
          clicks: 0,
          spend: 0,
          conversions: 0,
        });
      }
    });
  }

  return analyticsMap;
}
