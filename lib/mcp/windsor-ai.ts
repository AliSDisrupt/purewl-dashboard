/**
 * Windsor AI Data Fetching Functions
 * Used by dataAggregator, Atlas, and Reports
 * 
 * Note: These functions call the Next.js API routes, which handle the actual Windsor AI API calls.
 * For server-side usage, we need to construct absolute URLs.
 */

// Get base URL for API calls (works in both server and client contexts)
function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    // Client-side: use relative URLs
    return "";
  }
  // Server-side: use absolute URL
  return process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
}

interface WindsorAIAdsData {
  googleAds?: {
    impressions: number;
    clicks: number;
    spend: number;
    conversions: number;
    ctr: number;
    cpc: number;
  };
  redditAds?: {
    impressions: number;
    clicks: number;
    spend: number;
    conversions: number;
    ctr: number;
    cpc: number;
  };
  linkedInAds?: {
    impressions: number;
    clicks: number;
    spend: number;
    conversions: number;
    ctr: number;
    cpc: number;
  };
}

/**
 * Fetch Windsor AI Google Ads data
 */
export async function fetchWindsorAIGoogleAds(
  startDate: string,
  endDate: string,
  accountName: string = "PureVPN B2B - Business VPN"
): Promise<any> {
  try {
    // Convert dates to API format
    const formatDateForAPI = (date: string): string => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dateObj = new Date(date);
      dateObj.setHours(0, 0, 0, 0);
      
      if (dateObj.getTime() === today.getTime()) return "today";
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      if (dateObj.getTime() === yesterday.getTime()) return "yesterday";
      
      const daysDiff = Math.ceil((today.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff > 0 && daysDiff <= 365) return `${daysDiff}daysAgo`;
      
      return date;
    };

    const res = await fetch(
      `/api/windsor-ai/google-ads?startDate=${formatDateForAPI(startDate)}&endDate=${formatDateForAPI(endDate)}&accountName=${encodeURIComponent(accountName)}`
    );
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || "Failed to fetch Windsor AI Google Ads data");
    }
    return res.json();
  } catch (error: any) {
    throw new Error(`Windsor AI Google Ads: ${error.message || "Failed"}`);
  }
}

/**
 * Fetch Windsor AI Reddit Ads data
 */
export async function fetchWindsorAIRedditAds(
  startDate: string,
  endDate: string,
  accountName: string = "admin_PureWL"
): Promise<any> {
  try {
    const formatDateForAPI = (date: string): string => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dateObj = new Date(date);
      dateObj.setHours(0, 0, 0, 0);
      
      if (dateObj.getTime() === today.getTime()) return "today";
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      if (dateObj.getTime() === yesterday.getTime()) return "yesterday";
      
      const daysDiff = Math.ceil((today.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff > 0 && daysDiff <= 365) return `${daysDiff}daysAgo`;
      
      return date;
    };

    const baseUrl = getBaseUrl();
    const res = await fetch(
      `${baseUrl}/api/windsor-ai/reddit-ads?startDate=${formatDateForAPI(startDate)}&endDate=${formatDateForAPI(endDate)}&accountName=${encodeURIComponent(accountName)}`
    );
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || "Failed to fetch Windsor AI Reddit Ads data");
    }
    return res.json();
  } catch (error: any) {
    throw new Error(`Windsor AI Reddit Ads: ${error.message || "Failed"}`);
  }
}

/**
 * Fetch Windsor AI LinkedIn Ads data
 */
export async function fetchWindsorAILinkedInAds(
  startDate: string,
  endDate: string,
  accountName: string = "PureVPN - Partner & Enterprise Solution"
): Promise<any> {
  try {
    const baseUrl = getBaseUrl();
    const res = await fetch(
      `${baseUrl}/api/windsor-ai/linkedin-ads?startDate=${startDate}&endDate=${endDate}&accountName=${encodeURIComponent(accountName)}`
    );
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || "Failed to fetch Windsor AI LinkedIn Ads data");
    }
    return res.json();
  } catch (error: any) {
    throw new Error(`Windsor AI LinkedIn Ads: ${error.message || "Failed"}`);
  }
}

/**
 * Fetch all Windsor AI ads data
 */
export async function fetchWindsorAIAds(
  startDate: string,
  endDate: string
): Promise<WindsorAIAdsData> {
  console.log(`[Windsor AI] Fetching ads data for ${startDate} to ${endDate}`);
  
  const [googleAds, redditAds, linkedInAds] = await Promise.allSettled([
    fetchWindsorAIGoogleAds(startDate, endDate),
    fetchWindsorAIRedditAds(startDate, endDate),
    fetchWindsorAILinkedInAds(startDate, endDate),
  ]);

  const result: WindsorAIAdsData = {};

  // Handle Google Ads
  if (googleAds.status === "fulfilled" && googleAds.value?.summary) {
    // Google Ads API returns totalCost, not totalSpend
    const spend = googleAds.value.summary.totalCost || googleAds.value.summary.totalSpend || 0;
    result.googleAds = {
      impressions: googleAds.value.summary.totalImpressions || 0,
      clicks: googleAds.value.summary.totalClicks || 0,
      spend: spend,
      conversions: googleAds.value.summary.totalConversions || 0,
      ctr: googleAds.value.summary.averageCtr || 0,
      cpc: googleAds.value.summary.averageCpc || 0,
    };
    console.log(`[Windsor AI] Google Ads: spend=$${spend}, clicks=${result.googleAds.clicks}, conversions=${result.googleAds.conversions}`);
  } else if (googleAds.status === "rejected") {
    console.error(`[Windsor AI] Google Ads fetch failed:`, googleAds.reason);
  } else {
    console.warn(`[Windsor AI] Google Ads: No summary data available`, googleAds.value);
  }

  // Handle Reddit Ads
  if (redditAds.status === "fulfilled" && redditAds.value?.summary) {
    // Reddit Ads API returns totalSpend
    result.redditAds = {
      impressions: redditAds.value.summary.totalImpressions || 0,
      clicks: redditAds.value.summary.totalClicks || 0,
      spend: redditAds.value.summary.totalSpend || 0,
      conversions: redditAds.value.summary.totalConversions || 0,
      ctr: redditAds.value.summary.averageCtr || 0,
      cpc: redditAds.value.summary.averageCpc || 0,
    };
    console.log(`[Windsor AI] Reddit Ads: spend=$${result.redditAds.spend}, clicks=${result.redditAds.clicks}, conversions=${result.redditAds.conversions}`);
  } else if (redditAds.status === "rejected") {
    console.error(`[Windsor AI] Reddit Ads fetch failed:`, redditAds.reason);
  } else {
    console.warn(`[Windsor AI] Reddit Ads: No summary data available`, redditAds.value);
  }

  // Handle LinkedIn Ads
  if (linkedInAds.status === "fulfilled" && linkedInAds.value?.metrics) {
    result.linkedInAds = {
      impressions: linkedInAds.value.metrics.impressions || 0,
      clicks: linkedInAds.value.metrics.clicks || 0,
      spend: linkedInAds.value.metrics.spend || 0,
      conversions: linkedInAds.value.metrics.conversions || 0,
      ctr: linkedInAds.value.metrics.ctr || 0,
      cpc: linkedInAds.value.metrics.cpc || 0,
    };
    console.log(`[Windsor AI] LinkedIn Ads: spend=$${result.linkedInAds.spend}, clicks=${result.linkedInAds.clicks}, conversions=${result.linkedInAds.conversions}`);
  } else if (linkedInAds.status === "rejected") {
    console.error(`[Windsor AI] LinkedIn Ads fetch failed:`, linkedInAds.reason);
  } else {
    console.warn(`[Windsor AI] LinkedIn Ads: No metrics data available`, linkedInAds.value);
  }

  const totalSpend = (result.googleAds?.spend || 0) + (result.redditAds?.spend || 0) + (result.linkedInAds?.spend || 0);
  console.log(`[Windsor AI] Total spend across all platforms: $${totalSpend}`);

  return result;
}
