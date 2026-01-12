/**
 * LinkedIn Ads MCP Client
 * 
 * This client connects to the LinkedIn Ads API directly
 * using the access token from environment variables.
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

export interface LinkedInAccount {
  id: string;
  name: string;
  simpleId: string;
}

export interface LinkedInCampaign {
  id: string;
  name: string;
  status: string;
  objective: string;
  createdAt: string;
  accountId: string;
  accountName: string;
  type?: string;
  dailyBudget?: number;
  totalBudget?: number;
  startDate?: string;
  endDate?: string;
  analytics?: LinkedInMetrics; // Campaign-level analytics
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
 * Fetch LinkedIn ad accounts
 */
export async function fetchLinkedInAccounts(): Promise<LinkedInAccount[]> {
  // Token is now hardcoded, so this check is not needed
  // if (!ACCESS_TOKEN) {
  //   console.error("LINKEDIN_ACCESS_TOKEN not configured");
  //   throw new Error("LINKEDIN_ACCESS_TOKEN not configured");
  // }

  try {
    const url = `${API_BASE}/adAccounts`;
    const params = { q: "search" };
    
    console.log("Fetching LinkedIn accounts from:", url);
    const response = await fetch(`${url}?${new URLSearchParams(params)}`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`LinkedIn Accounts API Error: ${response.status} ${response.statusText} - ${errorText}`);
      throw new Error(`LinkedIn API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`LinkedIn Accounts: Found ${data.elements?.length || 0} accounts`);
    const accounts: LinkedInAccount[] = [];

    for (const element of data.elements || []) {
      const name = element.name || "Unknown";
      const accId = element.id;
      const accIdStr = String(accId);
      // Extract simple ID from URN format (urn:li:sponsoredAccount:12345 -> 12345)
      let simpleId = accIdStr;
      if (accIdStr.includes(":")) {
        const parts = accIdStr.split(":");
        simpleId = parts[parts.length - 1] || accIdStr;
      }

      accounts.push({
        id: String(accId),
        name,
        simpleId: simpleId,
      });
      
      console.log(`  - Account: ${name} (ID: ${simpleId}, Full: ${accId})`);
    }

    return accounts;
  } catch (error: any) {
    console.error("Error fetching LinkedIn accounts:", error.message || error);
    throw error; // Re-throw so API route can handle it
  }
}

/**
 * Fetch LinkedIn campaigns for an account
 */
export async function fetchLinkedInCampaigns(accountId: string): Promise<LinkedInCampaign[]> {
  if (!ACCESS_TOKEN) {
    console.warn("LINKEDIN_ACCESS_TOKEN not configured");
    return [];
  }

  try {
    // Extract simple ID
    let simpleId = accountId;
    if (accountId.includes("urn:li:sponsoredAccount:")) {
      simpleId = accountId.split(":").pop() || accountId;
    }

    const url = `${API_BASE}/adAccounts/${simpleId}/adCampaigns`;
    const params = { q: "search" };

    console.log(`Fetching LinkedIn campaigns for account ${simpleId} from:`, url);
    const response = await fetch(`${url}?${new URLSearchParams(params)}`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`LinkedIn Campaigns API Error: ${response.status} ${response.statusText} - ${errorText}`);
      return [];
    }

    const data = await response.json();
    console.log(`LinkedIn Campaigns: Found ${data.elements?.length || 0} campaigns for account ${simpleId}`);
    const campaigns: LinkedInCampaign[] = [];

    for (const c of data.elements || []) {
      // Parse creation date - LinkedIn returns milliseconds since epoch
      let createdAt = new Date().toISOString();
      if (c.created?.time) {
        try {
          // Check if it's in milliseconds (13 digits) or seconds (10 digits)
          const timeValue = typeof c.created.time === 'string' 
            ? parseInt(c.created.time) 
            : c.created.time;
          
          if (timeValue > 0) {
            // If less than 13 digits, it's likely in seconds, multiply by 1000
            const timestamp = timeValue < 1000000000000 ? timeValue * 1000 : timeValue;
            createdAt = new Date(timestamp).toISOString();
          }
        } catch (err) {
          console.warn("Error parsing campaign creation date:", err);
        }
      }

      campaigns.push({
        id: String(c.id),
        name: c.name || "Unnamed Campaign",
        status: c.status || "UNKNOWN",
        objective: c.objective || "UNKNOWN",
        createdAt: createdAt,
        accountId: simpleId,
        accountName: "LinkedIn Account",
        type: c.type || undefined,
        dailyBudget: c.dailyBudget?.amount || undefined,
        totalBudget: c.totalBudget?.amount || undefined,
        startDate: c.start?.time || undefined,
        endDate: c.end?.time || undefined,
      });
    }

    console.log(`LinkedIn Campaigns: Returning ${campaigns.length} campaigns`);
    return campaigns;
  } catch (error: any) {
    console.error("Error fetching LinkedIn campaigns:", error.message || error);
    return [];
  }
}

/**
 * Fetch LinkedIn analytics for an account
 */
export async function fetchLinkedInAnalytics(
  accountId: string,
  daysBack: number = 30
): Promise<{
  hasData: boolean;
  metrics?: LinkedInMetrics;
}> {
  if (!ACCESS_TOKEN) {
    console.warn("LINKEDIN_ACCESS_TOKEN not configured");
    return { hasData: false };
  }

  try {
    // Ensure full URN for analytics endpoint
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
      pivot: "ACCOUNT",
      timeGranularity: "ALL", // Use ALL for aggregated totals
      "dateRange.start.day": String(startDate.getDate()),
      "dateRange.start.month": String(startDate.getMonth() + 1),
      "dateRange.start.year": String(startDate.getFullYear()),
      "dateRange.end.day": String(endDate.getDate()),
      "dateRange.end.month": String(endDate.getMonth() + 1),
      "dateRange.end.year": String(endDate.getFullYear()),
      accounts: `List(${fullAccountId})`,
      fields: "impressions,clicks,costInLocalCurrency,externalWebsiteConversions,externalWebsitePostClickConversions,externalWebsitePostViewConversions,landingPageClicks,totalEngagements,likes,comments,shares,reactions,follows,companyPageClicks,oneClickLeads,qualifiedLeads,validWorkEmailLeads,videoStarts,videoViews,videoCompletions,conversionValueInLocalCurrency",
    });

    const response = await fetch(`${url}?${params}`, {
      headers: getHeaders(),
    });

    // 404 means no data (LinkedIn returns 404 for 0 activity) - this is OK
    if (response.status === 404) {
      return { 
        hasData: false,
        metrics: {
          impressions: 0,
          clicks: 0,
          spend: 0,
          conversions: 0,
          ctr: 0,
          cpc: 0,
          cpm: 0,
          costPerConversion: 0,
        }
      };
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`LinkedIn API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    if (!data.elements || data.elements.length === 0) {
      console.log(`LinkedIn Analytics for ${accountId}: Empty elements array - returning zeros`);
      return { 
        hasData: false,
        metrics: {
          impressions: 0,
          clicks: 0,
          spend: 0,
          conversions: 0,
          ctr: 0,
          cpc: 0,
          cpm: 0,
          costPerConversion: 0,
        }
      };
    }

    // Sum up all rows (works for both ALL and DAILY granularity)
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

    console.log(`LinkedIn Analytics for ${accountId}:`, {
      impressions: totalImpressions,
      clicks: totalClicks,
      spend: totalSpend,
      conversions: totalExternalWebsiteConversions || totalConversions,
      engagements: totalEngagements,
      rowsProcessed: data.elements?.length || 0
    });

    // hasData should be true if we have any meaningful activity (impressions, clicks, or spend)
    const hasData = data.elements && data.elements.length > 0 && (totalImpressions > 0 || totalClicks > 0 || totalSpend > 0);
    
    return {
      hasData,
      metrics: {
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
      },
    };
  } catch (error) {
    console.error("Error fetching LinkedIn analytics:", error);
    return { 
      hasData: false,
      metrics: {
        impressions: 0,
        clicks: 0,
        spend: 0,
        conversions: 0,
        ctr: 0,
        cpc: 0,
        cpm: 0,
        costPerConversion: 0,
      }
    };
  }
}
