import { NextResponse } from "next/server";

const WINDSOR_AI_API_KEY = process.env.WINDSOR_AI_API_KEY || "2403886836e607f492497f451145f22a374b";
const WINDSOR_AI_BASE_URL = "https://connectors.windsor.ai/all";

interface WindsorAIDataPoint {
  account_name: string;
  campaign: string | null;
  clicks: number | null;
  conversions: number | null;
  datasource: string;
  date: string;
  email: string | null;
  form_submissions: number | null;
  sessions: number | null;
  source: string;
  spend: number | null;
}

interface WindsorAIResponse {
  data: WindsorAIDataPoint[];
}

/**
 * Fetch Google Ads data from Windsor AI
 * Filters by account name "PureVPN B2B - Business VPN"
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate") || "30daysAgo";
    const endDate = searchParams.get("endDate") || "yesterday";
    const accountName = searchParams.get("accountName") || "PureVPN B2B - Business VPN";

    // Parse dates to YYYY-MM-DD format
    const parseDate = (dateStr: string): string => {
      if (dateStr === "yesterday") {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        return d.toISOString().split("T")[0]!;
      }
      if (dateStr === "today") {
        return new Date().toISOString().split("T")[0]!;
      }
      if (dateStr.endsWith("daysAgo")) {
        const days = parseInt(dateStr.replace("daysAgo", ""));
        const d = new Date();
        d.setDate(d.getDate() - days);
        return d.toISOString().split("T")[0]!;
      }
      // Assume YYYY-MM-DD format
      return dateStr;
    };

    const start = parseDate(startDate);
    const end = parseDate(endDate);

    // Calculate date range for Windsor AI (last_7d, last_30d, or custom)
    const startDateObj = new Date(start);
    const endDateObj = new Date(end);
    const daysDiff = Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24));
    
    let datePreset = "last_7d";
    if (daysDiff <= 7) {
      datePreset = "last_7d";
    } else if (daysDiff <= 30) {
      datePreset = "last_30d";
    } else {
      datePreset = "last_90d";
    }

    // Build Windsor AI API URL
    // Adding conversions and form submission fields
    const fields = "account_name,campaign,clicks,conversions,datasource,date,email,form_submissions,sessions,source,spend";
    const encodedFields = encodeURIComponent(fields);
    const url = `${WINDSOR_AI_BASE_URL}?api_key=${WINDSOR_AI_API_KEY}&date_preset=${datePreset}&fields=${encodedFields}`;

    console.log(`Fetching Windsor AI data from ${url}`);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Windsor AI API Error:", errorText);
      return NextResponse.json(
        {
          error: "Failed to fetch data from Windsor AI",
          details: errorText,
        },
        { status: response.status }
      );
    }

    const data: WindsorAIResponse = await response.json();

    if (!data.data || !Array.isArray(data.data)) {
      return NextResponse.json(
        {
          error: "Invalid response format from Windsor AI",
          data: data,
        },
        { status: 500 }
      );
    }

    // Filter by account name and datasource (google_ads)
    const filteredData = data.data.filter(
      (item) =>
        item.account_name === accountName &&
        item.datasource === "google_ads" &&
        item.date >= start &&
        item.date <= end
    );

    // Group by campaign and aggregate metrics
    const campaignMap = new Map<string, {
      id: string;
      name: string;
      status: string;
      impressions: number;
      clicks: number;
      cost: number;
      conversions: number;
      ctr: number;
      cpc: number;
      cpa: number;
      sessions: number;
    }>();

    for (const item of filteredData) {
      const campaignName = item.campaign || "(not set)";
      const campaignId = campaignName.toLowerCase().replace(/\s+/g, "-");

      const existing = campaignMap.get(campaignId);
      const clicks = item.clicks ?? 0;
      const spend = item.spend ?? 0;
      const sessions = item.sessions ?? 0;
      
      // Conversions - use form_submissions or conversions field
      // Priority: form_submissions > conversions > email (fallback)
      const conversions = (item.form_submissions ?? 0) || 
                         (item.conversions ?? 0) || 
                         (item.email ? 1 : 0);

      if (existing) {
        existing.clicks += clicks;
        existing.cost += spend;
        existing.sessions += sessions;
        existing.conversions += conversions;
      } else {
        campaignMap.set(campaignId, {
          id: campaignId,
          name: campaignName,
          status: "ENABLED", // Windsor AI doesn't provide status, default to ENABLED
          impressions: 0, // Windsor AI doesn't provide impressions directly
          clicks: clicks,
          cost: spend,
          conversions: conversions,
          ctr: 0,
          cpc: clicks > 0 ? spend / clicks : 0,
          cpa: 0,
          sessions: sessions,
        });
      }
    }

    // Calculate metrics for each campaign
    const campaigns = Array.from(campaignMap.values()).map((campaign) => {
      // Estimate impressions from sessions (if available) or clicks
      const estimatedImpressions = campaign.sessions > 0 
        ? campaign.sessions * 10 // Rough estimate: 10 impressions per session
        : campaign.clicks * 20; // Rough estimate: 20 impressions per click

      const ctr = estimatedImpressions > 0 
        ? (campaign.clicks / estimatedImpressions) * 100 
        : 0;
      
      const cpc = campaign.clicks > 0 
        ? campaign.cost / campaign.clicks 
        : 0;
      
      const cpa = campaign.conversions > 0 
        ? campaign.cost / campaign.conversions 
        : 0;

      return {
        ...campaign,
        impressions: Math.round(estimatedImpressions),
        ctr,
        cpc,
        cpa,
      };
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
      }
    );

    summary.averageCtr =
      summary.totalImpressions > 0
        ? (summary.totalClicks / summary.totalImpressions) * 100
        : 0;
    summary.averageCpc =
      summary.totalClicks > 0 ? summary.totalCost / summary.totalClicks : 0;

    return NextResponse.json({
      customerId: accountName,
      currencyCode: "USD",
      descriptiveName: accountName,
      campaigns: campaigns.sort((a, b) => b.clicks - a.clicks), // Sort by clicks descending
      summary,
      source: "windsor-ai",
      note: `Data fetched from Windsor AI for account "${accountName}"`,
    });
  } catch (error: any) {
    console.error("Windsor AI API Error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to fetch data from Windsor AI",
      },
      { status: 500 }
    );
  }
}
