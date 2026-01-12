import { NextResponse } from "next/server";
import { trackRequest } from "@/lib/usage-tracker";

const DEVELOPER_TOKEN = process.env.GOOGLE_ADS_DEVELOPER_TOKEN || "zH1MEYol-aW8zN34amgT3g";
const CUSTOMER_ID = process.env.GOOGLE_ADS_CUSTOMER_ID || "840-576-7621";
const LOGIN_CUSTOMER_ID = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID || CUSTOMER_ID; // For manager accounts
const CLIENT_ID = process.env.GOOGLE_ADS_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_ADS_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_ADS_REFRESH_TOKEN;
// Optional: Direct access token (for testing, expires in ~1 hour)
const ACCESS_TOKEN = process.env.GOOGLE_ADS_ACCESS_TOKEN;

/**
 * Get OAuth access token
 */
async function getAccessToken(): Promise<string> {
  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
    throw new Error(
      "Google Ads OAuth credentials not configured. Please set GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET, and GOOGLE_ADS_REFRESH_TOKEN in .env.local"
    );
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get access token: ${error}`);
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Fetch Google Ads data using the Google Ads API
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate") || "30daysAgo";
    const endDate = searchParams.get("endDate") || "yesterday";

    // Parse dates
    const parseDate = (dateStr: string): string => {
      if (dateStr === "yesterday") {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        return d.toISOString().split("T")[0].replace(/-/g, "");
      }
      if (dateStr === "today") {
        return new Date().toISOString().split("T")[0].replace(/-/g, "");
      }
      if (dateStr.endsWith("daysAgo")) {
        const days = parseInt(dateStr);
        const d = new Date();
        d.setDate(d.getDate() - days);
        return d.toISOString().split("T")[0].replace(/-/g, "");
      }
      // Assume YYYY-MM-DD format
      return dateStr.replace(/-/g, "");
    };

    const start = parseDate(startDate);
    const end = parseDate(endDate);

    // Try to get access token (if OAuth is configured)
    let accessToken: string | null = null;
    
    // First, try using direct access token if provided (for testing)
    if (ACCESS_TOKEN) {
      accessToken = ACCESS_TOKEN;
      console.log("Using provided access token");
    } else {
      // Otherwise, try to refresh token
      try {
        accessToken = await getAccessToken();
      } catch (error: any) {
        // If OAuth refresh fails, return a helpful error
        return NextResponse.json(
          {
            error: "Google Ads OAuth authentication failed",
            message: error.message,
            instructions:
              "Failed to refresh OAuth token. Please check: " +
              "1. GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET, and GOOGLE_ADS_REFRESH_TOKEN in .env.local " +
              "2. The OAuth app is configured correctly in Google Cloud Console " +
              "3. The refresh token is valid and not expired",
          },
          { status: 401 }
        );
      }
    }

    // Build the Google Ads API query
    const query = `
      SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions,
        metrics.ctr,
        metrics.average_cpc,
        metrics.cost_per_conversion
      FROM campaign
      WHERE segments.date BETWEEN '${start}' AND '${end}'
      ORDER BY metrics.impressions DESC
    `;

    // Google Ads API endpoint
    // Note: Customer ID format should be without dashes for API calls
    const customerIdFormatted = CUSTOMER_ID.replace(/-/g, "");
    const loginCustomerIdFormatted = LOGIN_CUSTOMER_ID.replace(/-/g, "");
    const apiUrl = `https://googleads.googleapis.com/v16/customers/${customerIdFormatted}/googleAds:search`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "developer-token": DEVELOPER_TOKEN,
        "Content-Type": "application/json",
        "login-customer-id": loginCustomerIdFormatted, // Required for manager accounts
      },
      body: JSON.stringify({
        query: query.trim(),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google Ads API Error:", errorText);
      return NextResponse.json(
        {
          error: "Failed to fetch Google Ads data",
          details: errorText,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const campaigns: any[] = [];

    // Parse the response
    if (data.results) {
      for (const result of data.results) {
        const campaign = result.campaign;
        const metrics = result.metrics;
        const segments = result.segments;

        campaigns.push({
          id: campaign.id,
          name: campaign.name,
          status: campaign.status,
          impressions: parseInt(metrics.impressions || "0"),
          clicks: parseInt(metrics.clicks || "0"),
          cost: parseFloat(metrics.costMicros || "0") / 1_000_000, // Convert from micros
          conversions: parseFloat(metrics.conversions || "0"),
          ctr: parseFloat(metrics.ctr || "0"),
          cpc: parseFloat(metrics.averageCpc?.micros || "0") / 1_000_000,
          cpa: parseFloat(metrics.costPerConversion?.micros || "0") / 1_000_000,
          date: segments?.date,
        });
      }
    }

    // Aggregate by campaign (in case there are multiple date rows per campaign)
    const campaignMap = new Map<string, any>();
    for (const campaign of campaigns) {
      const existing = campaignMap.get(campaign.id);
      if (existing) {
        existing.impressions += campaign.impressions;
        existing.clicks += campaign.clicks;
        existing.cost += campaign.cost;
        existing.conversions += campaign.conversions;
      } else {
        campaignMap.set(campaign.id, { ...campaign });
      }
    }

    const aggregatedCampaigns = Array.from(campaignMap.values()).map((campaign) => ({
      ...campaign,
      ctr: campaign.impressions > 0 ? (campaign.clicks / campaign.impressions) * 100 : 0,
      cpc: campaign.clicks > 0 ? campaign.cost / campaign.clicks : 0,
      cpa: campaign.conversions > 0 ? campaign.cost / campaign.conversions : 0,
    }));

    // Calculate summary
    const summary = aggregatedCampaigns.reduce(
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
      }
    );

    summary.averageCtr =
      summary.totalImpressions > 0
        ? (summary.totalClicks / summary.totalImpressions) * 100
        : 0;
    summary.averageCpc =
      summary.totalClicks > 0 ? summary.totalCost / summary.totalClicks : 0;

    return NextResponse.json({
      customerId: CUSTOMER_ID,
      currencyCode: "USD", // Default, should be fetched from account
      descriptiveName: `Google Ads Account ${CUSTOMER_ID}`,
      campaigns: aggregatedCampaigns,
      summary,
    });
  } catch (error: any) {
    console.error("Google Ads API Error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to fetch Google Ads data",
      },
      { status: 500 }
    );
  }
}
