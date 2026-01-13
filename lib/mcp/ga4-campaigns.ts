/**
 * GA4 Campaigns and Additional Data
 * 
 * Extended GA4 data fetching for campaigns, source/medium, events, and demographics
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

// Initialize client with hardcoded credentials
let analyticsDataClient: BetaAnalyticsDataClient | null = null;

try {
  analyticsDataClient = new BetaAnalyticsDataClient({
    credentials: credentials,
  });
  console.log("✅ GA4 campaigns client initialized successfully");
} catch (error) {
  console.error("❌ Failed to initialize GA4 campaigns client:", error);
  console.error("Error details:", error instanceof Error ? error.stack : String(error));
}

function parseDate(dateStr: string): string {
  // Handle ISO date format (YYYY-MM-DD)
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

  // Handle natural language dates like "January 10, 2026" or "Jan 10 2026"
  try {
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      // Check if date is in the future (more than 1 day ahead)
      const now = new Date();
      const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      if (parsed > oneDayFromNow) {
        throw new Error(`Date "${dateStr}" is in the future. GA4 data is only available for past dates.`);
      }
      return parsed.toISOString().split("T")[0];
    }
  } catch (error: any) {
    // If parsing fails, throw a helpful error
    if (error.message && error.message.includes("future")) {
      throw error; // Re-throw future date errors
    }
    throw new Error(`Invalid date format: "${dateStr}". Please use formats like "2024-01-10", "7daysAgo", "yesterday", or "January 10, 2024".`);
  }
  
  // If we get here, the date format is not recognized
  throw new Error(`Unrecognized date format: "${dateStr}". Please use formats like "2024-01-10", "7daysAgo", "yesterday", or "January 10, 2024".`);
}

export interface CampaignData {
  campaign: string;
  source: string;
  medium: string;
  users: number;
  sessions: number;
  conversions: number;
  revenue?: number;
}

export interface SourceMediumData {
  source: string;
  medium: string;
  users: number;
  sessions: number;
  engagementRate: number;
}

export interface EventData {
  eventName: string;
  eventCount: number;
  totalUsers: number;
  conversions: number;
}

export interface DemographicData {
  ageGroup?: string;
  gender?: string;
  users: number;
  sessions: number;
}

/**
 * Fetch Campaign Performance Data
 */
export async function fetchGA4Campaigns(params: { startDate?: string; endDate?: string } = {}) {
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
        { name: "campaignName" },
        { name: "source" },
        { name: "sessionMedium" },
      ],
      metrics: [
        { name: "totalUsers" },
        { name: "sessions" },
        { name: "conversions" },
        { name: "totalRevenue" },
      ],
      orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
      limit: 50,
    });

    const campaigns: CampaignData[] = (response.rows || []).map((row) => ({
      campaign: row.dimensionValues?.[0]?.value || "Unknown",
      source: row.dimensionValues?.[1]?.value || "Unknown",
      medium: row.dimensionValues?.[2]?.value || "Unknown",
      users: parseInt(row.metricValues?.[0]?.value || "0"),
      sessions: parseInt(row.metricValues?.[1]?.value || "0"),
      conversions: parseFloat(row.metricValues?.[2]?.value || "0"),
      revenue: parseFloat(row.metricValues?.[3]?.value || "0"),
    }));

    return { campaigns };
  } catch (error: any) {
    console.error("GA4 Campaigns API Error:", error);
    throw new Error(`GA4 Campaigns API Error: ${error.message}`);
  }
}

/**
 * Fetch Source/Medium Breakdown
 */
export async function fetchGA4SourceMedium(params: { startDate?: string; endDate?: string } = {}) {
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
      ],
      metrics: [
        { name: "totalUsers" },
        { name: "sessions" },
        { name: "engagementRate" },
      ],
      orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
      limit: 50,
    });

    const sourceMedium: SourceMediumData[] = (response.rows || []).map((row) => ({
      source: row.dimensionValues?.[0]?.value || "Unknown",
      medium: row.dimensionValues?.[1]?.value || "Unknown",
      users: parseInt(row.metricValues?.[0]?.value || "0"),
      sessions: parseInt(row.metricValues?.[1]?.value || "0"),
      engagementRate: parseFloat(row.metricValues?.[2]?.value || "0"),
    }));

    return { sourceMedium };
  } catch (error: any) {
    console.error("GA4 Source/Medium API Error:", error);
    throw new Error(`GA4 Source/Medium API Error: ${error.message}`);
  }
}

/**
 * Fetch GA4 data combining country and source/medium dimensions
 * This allows answering questions like "what sources are bringing traffic from China"
 * Has fallback to combine separate geography and source/medium queries if combined query fails
 */
export async function fetchGA4GeographySourceMedium(params: { 
  startDate?: string; 
  endDate?: string;
  country?: string; // Optional: filter by specific country
} = {}) {
  if (!analyticsDataClient || !propertyId) {
    throw new Error("GA4 credentials not configured");
  }

  const { startDate = "30daysAgo", endDate = "yesterday", country } = params;
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  // Try method 1: Combined query with all dimensions
  try {
    const dimensions = [
      { name: "country" },
      { name: "sessionSource" },
      { name: "sessionMedium" },
    ];

    // Build dimension filter if country is specified
    // Use CONTAINS for more flexible matching (handles "China" vs "China (mainland)")
    const dimensionFilter = country
      ? {
          filter: {
            fieldName: "country",
            stringFilter: {
              matchType: "CONTAINS" as const,
              value: country,
              caseSensitive: false,
            },
          },
        }
      : undefined;

    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: start, endDate: end }],
      dimensions,
      metrics: [
        { name: "totalUsers" },
        { name: "sessions" },
        { name: "engagementRate" },
      ],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      dimensionFilter,
      limit: 100,
    });

    const geographySourceMedium = (response.rows || []).map((row) => ({
      country: row.dimensionValues?.[0]?.value || "Unknown",
      source: row.dimensionValues?.[1]?.value || "Unknown",
      medium: row.dimensionValues?.[2]?.value || "Unknown",
      users: parseInt(row.metricValues?.[0]?.value || "0"),
      sessions: parseInt(row.metricValues?.[1]?.value || "0"),
      engagementRate: parseFloat(row.metricValues?.[2]?.value || "0"),
    }));

    // If country filter was used and we got results, return them
    if (country && geographySourceMedium.length > 0) {
      return { geographySourceMedium };
    }
    // If no country filter, return all results
    if (!country) {
      return { geographySourceMedium };
    }
    // If country filter but no results, fall through to fallback
  } catch (error: any) {
    console.warn("GA4 Combined Geography/Source/Medium query failed, trying fallback:", error.message);
    // Fall through to fallback method
  }

  // Fallback method: If country is specified, query with country filter and source/medium dimensions
  // If no country, query all countries with source/medium (but limit to avoid too much data)
  try {
    console.log("Using fallback: Querying with country filter and source/medium dimensions...");
    
    if (country) {
      // Method 2a: Query with country filter, source/medium dimensions
      // First, get the exact country name from geography data
      const { fetchGA4Geography } = await import("@/lib/mcp/ga4");
      const geographyData = await fetchGA4Geography({ startDate, endDate });
      const countries = geographyData.countries || [];
      
      const countryLower = country.toLowerCase();
      const matchingCountry = countries.find((c: any) => 
        c.country.toLowerCase().includes(countryLower) || 
        c.country.toLowerCase() === countryLower
      );
      
      if (matchingCountry) {
        // Query with exact country name and source/medium dimensions
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
            { name: "engagementRate" },
          ],
          dimensionFilter: {
            filter: {
              fieldName: "country",
              stringFilter: {
                matchType: "EXACT",
                value: matchingCountry.country,
                caseSensitive: false,
              },
            },
          },
          orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
          limit: 100,
        });

        const geographySourceMedium = (response.rows || []).map((row) => ({
          country: matchingCountry.country,
          source: row.dimensionValues?.[0]?.value || "Unknown",
          medium: row.dimensionValues?.[1]?.value || "Unknown",
          users: parseInt(row.metricValues?.[0]?.value || "0"),
          sessions: parseInt(row.metricValues?.[1]?.value || "0"),
          engagementRate: parseFloat(row.metricValues?.[2]?.value || "0"),
        }));

        return { geographySourceMedium };
      }
    }
    
    // Method 2b: If no country filter or country not found, get top countries with their source/medium
    // Query top 10 countries with source/medium breakdown
    const { fetchGA4Geography } = await import("@/lib/mcp/ga4");
    const geographyData = await fetchGA4Geography({ startDate, endDate });
    const topCountries = (geographyData.countries || []).slice(0, 10);
    
    const allResults: any[] = [];
    
    // Query each top country separately
    for (const countryData of topCountries) {
      try {
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
            { name: "engagementRate" },
          ],
          dimensionFilter: {
            filter: {
              fieldName: "country",
              stringFilter: {
                matchType: "EXACT",
                value: countryData.country,
                caseSensitive: false,
              },
            },
          },
          orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
          limit: 20, // Top 20 sources per country
        });

        const countryResults = (response.rows || []).map((row) => ({
          country: countryData.country,
          source: row.dimensionValues?.[0]?.value || "Unknown",
          medium: row.dimensionValues?.[1]?.value || "Unknown",
          users: parseInt(row.metricValues?.[0]?.value || "0"),
          sessions: parseInt(row.metricValues?.[1]?.value || "0"),
          engagementRate: parseFloat(row.metricValues?.[2]?.value || "0"),
        }));

        allResults.push(...countryResults);
      } catch (err) {
        // Skip this country if query fails
        console.warn(`Failed to fetch data for ${countryData.country}:`, err);
        continue;
      }
    }
    
    // Sort by sessions descending
    allResults.sort((a, b) => b.sessions - a.sessions);
    
    return { 
      geographySourceMedium: allResults.slice(0, 100)
    };
  } catch (fallbackError: any) {
    console.error("GA4 Geography/Source/Medium Fallback Error:", fallbackError);
    throw new Error(`GA4 Geography/Source/Medium API Error: ${fallbackError.message}`);
  }
}

/**
 * Fetch Top Events
 */
export async function fetchGA4Events(params: { startDate?: string; endDate?: string } = {}) {
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
      dimensions: [{ name: "eventName" }],
      metrics: [
        { name: "eventCount" },
        { name: "totalUsers" },
        { name: "conversions" },
      ],
      orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
      limit: 30,
    });

    const events: EventData[] = (response.rows || []).map((row) => ({
      eventName: row.dimensionValues?.[0]?.value || "Unknown",
      eventCount: parseInt(row.metricValues?.[0]?.value || "0"),
      totalUsers: parseInt(row.metricValues?.[1]?.value || "0"),
      conversions: parseFloat(row.metricValues?.[2]?.value || "0"),
    }));

    return { events };
  } catch (error: any) {
    console.error("GA4 Events API Error:", error);
    throw new Error(`GA4 Events API Error: ${error.message}`);
  }
}

/**
 * Fetch Demographics Data (Age and Gender)
 */
export async function fetchGA4Demographics(params: { startDate?: string; endDate?: string } = {}) {
  if (!analyticsDataClient || !propertyId) {
    throw new Error("GA4 credentials not configured");
  }

  const { startDate = "30daysAgo", endDate = "yesterday" } = params;
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  try {
    // Age Group
    const [ageResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: start, endDate: end }],
      dimensions: [{ name: "userAgeBracket" }],
      metrics: [
        { name: "totalUsers" },
        { name: "sessions" },
      ],
      orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
      limit: 20,
    });

    // Gender
    const [genderResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: start, endDate: end }],
      dimensions: [{ name: "userGender" }],
      metrics: [
        { name: "totalUsers" },
        { name: "sessions" },
      ],
      orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
      limit: 10,
    });

    const ageGroups: DemographicData[] = (ageResponse.rows || []).map((row) => ({
      ageGroup: row.dimensionValues?.[0]?.value || "Unknown",
      users: parseInt(row.metricValues?.[0]?.value || "0"),
      sessions: parseInt(row.metricValues?.[1]?.value || "0"),
    }));

    const genders: DemographicData[] = (genderResponse.rows || []).map((row) => ({
      gender: row.dimensionValues?.[0]?.value || "Unknown",
      users: parseInt(row.metricValues?.[0]?.value || "0"),
      sessions: parseInt(row.metricValues?.[1]?.value || "0"),
    }));

    return { ageGroups, genders };
  } catch (error: any) {
    console.error("GA4 Demographics API Error:", error);
    throw new Error(`GA4 Demographics API Error: ${error.message}`);
  }
}

/**
 * Fetch Technology Data (Browser, OS, Device)
 */
export async function fetchGA4Technology(params: { startDate?: string; endDate?: string } = {}) {
  if (!analyticsDataClient || !propertyId) {
    throw new Error("GA4 credentials not configured");
  }

  const { startDate = "30daysAgo", endDate = "yesterday" } = params;
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  try {
    // Browser
    const [browserResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: start, endDate: end }],
      dimensions: [{ name: "browser" }],
      metrics: [{ name: "totalUsers" }],
      orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
      limit: 15,
    });

    // Operating System
    const [osResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: start, endDate: end }],
      dimensions: [{ name: "operatingSystem" }],
      metrics: [{ name: "totalUsers" }],
      orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
      limit: 15,
    });

    const browsers = (browserResponse.rows || []).map((row) => ({
      browser: row.dimensionValues?.[0]?.value || "Unknown",
      users: parseInt(row.metricValues?.[0]?.value || "0"),
    }));

    const operatingSystems = (osResponse.rows || []).map((row) => ({
      os: row.dimensionValues?.[0]?.value || "Unknown",
      users: parseInt(row.metricValues?.[0]?.value || "0"),
    }));

    return { browsers, operatingSystems };
  } catch (error: any) {
    console.error("GA4 Technology API Error:", error);
    throw new Error(`GA4 Technology API Error: ${error.message}`);
  }
}

/**
 * PHASE 1: User Acquisition Path
 */
export async function fetchGA4Acquisition(params: { startDate?: string; endDate?: string } = {}) {
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
        { name: "firstUserSource" },
        { name: "firstUserMedium" },
        { name: "firstUserCampaignName" },
      ],
      metrics: [
        { name: "totalUsers" },
        { name: "newUsers" },
        { name: "sessions" },
      ],
      orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
      limit: 50,
    });

    const acquisition = (response.rows || []).map((row) => ({
      source: row.dimensionValues?.[0]?.value || "Unknown",
      medium: row.dimensionValues?.[1]?.value || "Unknown",
      campaign: row.dimensionValues?.[2]?.value || "(not set)",
      totalUsers: parseInt(row.metricValues?.[0]?.value || "0"),
      newUsers: parseInt(row.metricValues?.[1]?.value || "0"),
      sessions: parseInt(row.metricValues?.[2]?.value || "0"),
    }));

    return { acquisition };
  } catch (error: any) {
    console.error("GA4 Acquisition API Error:", error);
    throw new Error(`GA4 Acquisition API Error: ${error.message}`);
  }
}

/**
 * PHASE 1: Content Performance
 */
export async function fetchGA4Content(params: { startDate?: string; endDate?: string } = {}) {
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
        { name: "pageTitle" },
        { name: "pagePath" },
      ],
      metrics: [
        { name: "totalUsers" },
        { name: "screenPageViews" },
        { name: "engagementRate" },
        { name: "averageSessionDuration" },
        { name: "bounceRate" },
        { name: "conversions" },
      ],
      orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
      limit: 50,
    });

    const content = (response.rows || []).map((row) => ({
      pageTitle: row.dimensionValues?.[0]?.value || "Unknown",
      pagePath: row.dimensionValues?.[1]?.value || "Unknown",
      users: parseInt(row.metricValues?.[0]?.value || "0"),
      pageViews: parseInt(row.metricValues?.[1]?.value || "0"),
      engagementRate: parseFloat(row.metricValues?.[2]?.value || "0"),
      avgEngagementTime: parseFloat(row.metricValues?.[3]?.value || "0"), // Average engagement time in seconds
      bounceRate: parseFloat(row.metricValues?.[4]?.value || "0"), // Bounce rate as decimal (0-1)
      conversions: parseFloat(row.metricValues?.[5]?.value || "0"),
    }));

    return { content };
  } catch (error: any) {
    console.error("GA4 Content API Error:", error);
    throw new Error(`GA4 Content API Error: ${error.message}`);
  }
}

/**
 * PHASE 1: Time-Based Patterns
 */
export async function fetchGA4TimePatterns(params: { startDate?: string; endDate?: string } = {}) {
  if (!analyticsDataClient || !propertyId) {
    throw new Error("GA4 credentials not configured");
  }

  const { startDate = "30daysAgo", endDate = "yesterday" } = params;
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  try {
    // Hour of day
    const [hourResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: start, endDate: end }],
      dimensions: [{ name: "hour" }],
      metrics: [
        { name: "totalUsers" },
        { name: "sessions" },
        { name: "conversions" },
      ],
      orderBys: [{ dimension: { dimensionName: "hour" } }],
    });

    // Day of week
    const [dayResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: start, endDate: end }],
      dimensions: [{ name: "dayOfWeek" }],
      metrics: [
        { name: "totalUsers" },
        { name: "sessions" },
        { name: "conversions" },
      ],
      orderBys: [{ dimension: { dimensionName: "dayOfWeek" } }],
    });

    const hours = (hourResponse.rows || []).map((row) => ({
      hour: parseInt(row.dimensionValues?.[0]?.value || "0"),
      users: parseInt(row.metricValues?.[0]?.value || "0"),
      sessions: parseInt(row.metricValues?.[1]?.value || "0"),
      conversions: parseFloat(row.metricValues?.[2]?.value || "0"),
    }));

    const daysOfWeek = (dayResponse.rows || []).map((row) => {
      const dayNum = parseInt(row.dimensionValues?.[0]?.value || "0");
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      return {
        dayOfWeek: dayNum,
        dayName: dayNames[dayNum] || "Unknown",
        users: parseInt(row.metricValues?.[0]?.value || "0"),
        sessions: parseInt(row.metricValues?.[1]?.value || "0"),
        conversions: parseFloat(row.metricValues?.[2]?.value || "0"),
      };
    });

    return { hours, daysOfWeek };
  } catch (error: any) {
    console.error("GA4 Time Patterns API Error:", error);
    throw new Error(`GA4 Time Patterns API Error: ${error.message}`);
  }
}

/**
 * PHASE 2: Conversion Paths
 */
export async function fetchGA4ConversionPaths(params: { startDate?: string; endDate?: string } = {}) {
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
        { name: "sessionCampaignName" },
      ],
      metrics: [
        { name: "conversions" },
        { name: "totalRevenue" },
        { name: "sessions" },
      ],
      orderBys: [{ metric: { metricName: "conversions" }, desc: true }],
      limit: 50,
    });

    const paths = (response.rows || []).map((row) => ({
      source: row.dimensionValues?.[0]?.value || "Unknown",
      medium: row.dimensionValues?.[1]?.value || "Unknown",
      campaign: row.dimensionValues?.[2]?.value || "(not set)",
      conversions: parseFloat(row.metricValues?.[0]?.value || "0"),
      revenue: parseFloat(row.metricValues?.[1]?.value || "0"),
      sessions: parseInt(row.metricValues?.[2]?.value || "0"),
      conversionRate: parseFloat(row.metricValues?.[0]?.value || "0") / parseInt(row.metricValues?.[2]?.value || "1") * 100,
    }));

    return { paths };
  } catch (error: any) {
    console.error("GA4 Conversion Paths API Error:", error);
    throw new Error(`GA4 Conversion Paths API Error: ${error.message}`);
  }
}

/**
 * PHASE 2: User Retention
 */
export async function fetchGA4Retention(params: { startDate?: string; endDate?: string } = {}) {
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
        { name: "date" },
        { name: "newVsReturning" },
      ],
      metrics: [
        { name: "totalUsers" },
        { name: "sessions" },
        { name: "engagementRate" },
      ],
      orderBys: [{ dimension: { dimensionName: "date" } }],
    });

    const retention = (response.rows || []).map((row) => ({
      date: row.dimensionValues?.[0]?.value || "",
      userType: row.dimensionValues?.[1]?.value || "Unknown",
      users: parseInt(row.metricValues?.[0]?.value || "0"),
      sessions: parseInt(row.metricValues?.[1]?.value || "0"),
      engagementRate: parseFloat(row.metricValues?.[2]?.value || "0"),
    }));

    return { retention };
  } catch (error: any) {
    console.error("GA4 Retention API Error:", error);
    throw new Error(`GA4 Retention API Error: ${error.message}`);
  }
}

/**
 * PHASE 3: Search Terms
 */
export async function fetchGA4SearchTerms(params: { startDate?: string; endDate?: string } = {}) {
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
      dimensions: [{ name: "searchTerm" }],
      metrics: [
        { name: "totalUsers" },
        { name: "sessions" },
        { name: "searchResultViews" },
      ],
      orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
      limit: 30,
    });

    const searchTerms = (response.rows || []).map((row) => ({
      term: row.dimensionValues?.[0]?.value || "Unknown",
      users: parseInt(row.metricValues?.[0]?.value || "0"),
      sessions: parseInt(row.metricValues?.[1]?.value || "0"),
      resultViews: parseInt(row.metricValues?.[2]?.value || "0"),
    }));

    return { searchTerms };
  } catch (error: any) {
    // Search terms might not be available if site search isn't configured
    if (error.message?.includes("searchTerm")) {
      return { searchTerms: [] };
    }
    console.error("GA4 Search Terms API Error:", error);
    throw new Error(`GA4 Search Terms API Error: ${error.message}`);
  }
}

/**
 * PHASE 3: Real-Time Data
 */
export async function fetchGA4Realtime() {
  if (!analyticsDataClient || !propertyId) {
    throw new Error("GA4 credentials not configured");
  }

  try {
    // Get total active users
    const [totalResponse] = await analyticsDataClient.runRealtimeReport({
      property: `properties/${propertyId}`,
      metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
    });

    // Get by country
    const [countryResponse] = await analyticsDataClient.runRealtimeReport({
      property: `properties/${propertyId}`,
      dimensions: [{ name: "country" }],
      metrics: [{ name: "activeUsers" }],
      limit: 10,
    });

    // Get by device
    const [deviceResponse] = await analyticsDataClient.runRealtimeReport({
      property: `properties/${propertyId}`,
      dimensions: [{ name: "deviceCategory" }],
      metrics: [{ name: "activeUsers" }],
      limit: 10,
    });

    // Get top pages
    const [pagesResponse] = await analyticsDataClient.runRealtimeReport({
      property: `properties/${propertyId}`,
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }],
      limit: 10,
    });

    const realtime = {
      totalActiveUsers: parseInt(totalResponse.totals?.[0]?.metricValues?.[0]?.value || "0"),
      totalPageViews: parseInt(totalResponse.totals?.[0]?.metricValues?.[1]?.value || "0"),
      byCountry: (countryResponse.rows || []).map((row) => ({
        country: row.dimensionValues?.[0]?.value || "Unknown",
        users: parseInt(row.metricValues?.[0]?.value || "0"),
      })),
      byDevice: (deviceResponse.rows || []).map((row) => ({
        device: row.dimensionValues?.[0]?.value || "Unknown",
        users: parseInt(row.metricValues?.[0]?.value || "0"),
      })),
      topPages: (pagesResponse.rows || []).map((row) => ({
        page: row.dimensionValues?.[0]?.value || "Unknown",
        views: parseInt(row.metricValues?.[0]?.value || "0"),
      })),
    };

    return realtime;
  } catch (error: any) {
    // Real-time API might not be available or might have permission issues
    // Throw error with helpful message so Atlas knows what went wrong
    console.error("GA4 Realtime API Error:", error);
    const errorMessage = error.message || String(error);
    throw new Error(
      `GA4 Realtime API failed: ${errorMessage}. ` +
      `This could be due to: 1) Realtime API not enabled for this property, ` +
      `2) Insufficient permissions, 3) API quota exceeded, or 4) Network issues. ` +
      `Try using get_ga4_overview instead for recent traffic data.`
    );
  }
}
