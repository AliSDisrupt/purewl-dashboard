/**
 * LinkedIn Campaign-Level Analytics
 * 
 * Fetches analytics for individual campaigns
 */

const API_BASE = process.env.LINKEDIN_API_BASE || "https://api.linkedin.com/rest";
// Hardcoded LinkedIn token from DATA/claude_desktop_config.json
const ACCESS_TOKEN = process.env.LINKEDIN_ACCESS_TOKEN || "AQWkKXim-oqXnFtJfr46yhTzjqGOpjUC4nDMIwE2udJaKxzwMD0ZVrQoEeYWAh_Sjuj4eVJoueJae2ktgtp1mADMfLu-5xoMOm8P1WbAd34QzIgu-xoNGahFylCpR2vIu3xLDz9jN6EUEH-N3YEjdRk7tbBeTp_Cw1BTVTfv98-97LlqF2Q_FaYnSnpUiQkIJa97QYt0NkG4QTalJociKJ7Vq2L8ZG7yuN3jlUqWqe0wxJf_zKmC1bte6tG4yOpLhRT0A2MjACrOyRTAZOyOvHWLmFa4_y1WW2O17nJ81b2506Xyz_IpSGthyfh2iDkst_wsLO017cnMOomldMfidhlenPspow";

function getHeaders() {
  return {
    "Authorization": `Bearer ${ACCESS_TOKEN}`,
    "LinkedIn-Version": "202511",
    "X-Restli-Protocol-Version": "2.0.0",
    "Content-Type": "application/json"
  };
}

export interface LinkedInMetrics {
  // Core Performance
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  
  // Engagement Metrics
  likes?: number;
  comments?: number;
  shares?: number;
  reactions?: number;
  follows?: number;
  companyPageClicks?: number;
  totalEngagements?: number;
  landingPageClicks?: number;
  
  // Conversion Metrics
  externalWebsiteConversions?: number;
  externalWebsitePostClickConversions?: number;
  externalWebsitePostViewConversions?: number;
  conversionValueInLocalCurrency?: number;
  oneClickLeads?: number;
  qualifiedLeads?: number;
  validWorkEmailLeads?: number;
  
  // Video Metrics
  videoStarts?: number;
  videoViews?: number;
  videoCompletions?: number;
  
  // Cost Metrics (calculated)
  ctr?: number;
  cpc?: number;
  cpm?: number;
  costPerConversion?: number;
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
      fields: "impressions,clicks,costInLocalCurrency,externalWebsiteConversions,externalWebsitePostClickConversions,externalWebsitePostViewConversions,landingPageClicks,totalEngagements,likes,comments,shares,reactions,follows,companyPageClicks,oneClickLeads,qualifiedLeads,validWorkEmailLeads,videoStarts,videoViews,videoCompletions,conversionValueInLocalCurrency",
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
        ctr: 0,
        cpc: 0,
        cpm: 0,
        costPerConversion: 0,
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
    let totalEngagements = 0;
    let totalLikes = 0;
    let totalComments = 0;
    let totalShares = 0;
    let totalReactions = 0;
    let totalFollows = 0;
    let totalCompanyPageClicks = 0;
    let totalLandingPageClicks = 0;
    let totalExternalWebsiteConversions = 0;
    let totalPostClickConversions = 0;
    let totalPostViewConversions = 0;
    let totalOneClickLeads = 0;
    let totalQualifiedLeads = 0;
    let totalValidWorkEmailLeads = 0;
    let totalVideoStarts = 0;
    let totalVideoViews = 0;
    let totalVideoCompletions = 0;
    let totalConversionValue = 0;

    for (const row of data.elements || []) {
      // Core metrics
      totalImpressions += parseInt(row.impressions || row.impressionCount || 0);
      totalClicks += parseInt(row.clicks || row.clickCount || 0);
      totalSpend += parseFloat(row.costInLocalCurrency || row.spend || row.cost || 0);
      totalConversions += parseInt(row.conversions || row.leadsGenerated || row.conversionCount || 0);
      
      // Engagement metrics
      totalEngagements += parseInt(row.totalEngagements || 0);
      totalLikes += parseInt(row.likes || 0);
      totalComments += parseInt(row.comments || 0);
      totalShares += parseInt(row.shares || 0);
      totalReactions += parseInt(row.reactions || 0);
      totalFollows += parseInt(row.follows || 0);
      totalCompanyPageClicks += parseInt(row.companyPageClicks || 0);
      totalLandingPageClicks += parseInt(row.landingPageClicks || 0);
      
      // Conversion metrics
      totalExternalWebsiteConversions += parseInt(row.externalWebsiteConversions || 0);
      totalPostClickConversions += parseInt(row.externalWebsitePostClickConversions || 0);
      totalPostViewConversions += parseInt(row.externalWebsitePostViewConversions || 0);
      totalOneClickLeads += parseInt(row.oneClickLeads || 0);
      totalQualifiedLeads += parseInt(row.qualifiedLeads || 0);
      totalValidWorkEmailLeads += parseInt(row.validWorkEmailLeads || 0);
      totalConversionValue += parseFloat(row.conversionValueInLocalCurrency || 0);
      
      // Video metrics
      totalVideoStarts += parseInt(row.videoStarts || 0);
      totalVideoViews += parseInt(row.videoViews || 0);
      totalVideoCompletions += parseInt(row.videoCompletions || 0);
    }

    // Calculate cost metrics
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const cpc = totalClicks > 0 ? totalSpend / totalClicks : 0;
    const cpm = totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0;
    const costPerConversion = totalExternalWebsiteConversions > 0 
      ? totalSpend / totalExternalWebsiteConversions 
      : 0;

    console.log(`Campaign ${fullCampaignId} analytics:`, {
      impressions: totalImpressions,
      clicks: totalClicks,
      spend: totalSpend,
      conversions: totalExternalWebsiteConversions || totalConversions,
      engagements: totalEngagements,
    });

    return {
      impressions: totalImpressions,
      clicks: totalClicks,
      spend: totalSpend,
      conversions: totalExternalWebsiteConversions || totalConversions,
      totalEngagements: totalEngagements,
      likes: totalLikes,
      comments: totalComments,
      shares: totalShares,
      reactions: totalReactions,
      follows: totalFollows,
      companyPageClicks: totalCompanyPageClicks,
      landingPageClicks: totalLandingPageClicks,
      externalWebsiteConversions: totalExternalWebsiteConversions,
      externalWebsitePostClickConversions: totalPostClickConversions,
      externalWebsitePostViewConversions: totalPostViewConversions,
      oneClickLeads: totalOneClickLeads,
      qualifiedLeads: totalQualifiedLeads,
      validWorkEmailLeads: totalValidWorkEmailLeads,
      videoStarts: totalVideoStarts,
      videoViews: totalVideoViews,
      videoCompletions: totalVideoCompletions,
      conversionValueInLocalCurrency: totalConversionValue,
      ctr,
      cpc,
      cpm,
      costPerConversion,
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
  daysBack: number = 30,
  includeAllCampaigns: boolean = false // New parameter to include all campaigns, not just active
): Promise<Map<string, LinkedInMetrics>> {
  const analyticsMap = new Map<string, LinkedInMetrics>();

  // Fetch analytics for active campaigns by default, or all campaigns if requested
  const campaignsToCheck = includeAllCampaigns 
    ? campaigns 
    : campaigns.filter(
        (c) => c.status?.toUpperCase() === "ACTIVE" || c.status?.toUpperCase() === "RUNNING"
      );

  // Fetch analytics for campaigns in parallel (limit to 10 at a time to avoid rate limits)
  const batchSize = 10;
  for (let i = 0; i < campaignsToCheck.length; i += batchSize) {
    const batch = campaignsToCheck.slice(i, i + batchSize);
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
          ctr: 0,
          cpc: 0,
          cpm: 0,
          costPerConversion: 0,
        });
      }
    });
  }

  return analyticsMap;
}
