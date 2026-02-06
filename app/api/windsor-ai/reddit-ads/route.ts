import { NextResponse } from "next/server";

const WINDSOR_AI_API_KEY = process.env.WINDSOR_AI_API_KEY || "2403886836e607f492497f451145f22a374b";
const WINDSOR_AI_BASE_URL = "https://connectors.windsor.ai/all";

interface WindsorAIRedditDataPoint {
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
  data: WindsorAIRedditDataPoint[];
}

/**
 * Fetch Reddit Ads data from Windsor AI
 * Filters by account name (defaults to "admin_PureWL" which matches Windsor AI dashboard)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate") || "30daysAgo";
    const endDate = searchParams.get("endDate") || "yesterday";
    // Default to "admin_PureWL" as shown in Windsor AI dashboard
    const accountName = searchParams.get("accountName") || "admin_PureWL";

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
    // Using fields that match what's available in Windsor AI dashboard
    // Based on the dashboard, these fields are available: Account Name, Campaign, Data Source, Date, Sessions, Source, Clicks, Amount Spent, Email
    // Adding conversions and form submission fields
    // Using field names as they appear in the API (snake_case)
    const fields = "account_name,campaign,clicks,conversions,datasource,date,email,form_submissions,sessions,source,spend";
    // URL encode the fields parameter
    const encodedFields = encodeURIComponent(fields);
    // Try adding datasource filter directly in the URL if supported
    // Some Windsor AI endpoints support filtering by datasource
    const url = `${WINDSOR_AI_BASE_URL}?api_key=${WINDSOR_AI_API_KEY}&date_preset=${datePreset}&fields=${encodedFields}&datasource=reddit`;

    console.log(`Fetching Windsor AI Reddit Ads data:`);
    console.log(`  URL: ${url.replace(WINDSOR_AI_API_KEY, "***")}`);
    console.log(`  Fields: ${fields}`);
    console.log(`  Date Preset: ${datePreset}`);
    console.log(`  Date Range: ${start} to ${end}`);
    console.log(`  Account Filter: ${accountName}`);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Windsor AI API Error:", {
        status: response.status,
        statusText: response.statusText,
        errorText,
        url: url.replace(WINDSOR_AI_API_KEY, "***"), // Hide API key in logs
      });
      
      let errorDetails;
      try {
        errorDetails = JSON.parse(errorText);
      } catch {
        errorDetails = errorText;
      }
      
      // Return more detailed error message
      const errorMessage = typeof errorDetails === "object" && errorDetails.message 
        ? errorDetails.message 
        : typeof errorDetails === "string" 
        ? errorDetails 
        : `Failed to fetch data from Windsor AI: ${response.status} ${response.statusText}`;
      
      return NextResponse.json(
        {
          error: errorMessage,
          details: errorDetails,
          status: response.status,
        },
        { status: response.status }
      );
    }

    const data: WindsorAIResponse = await response.json();

    console.log(`Windsor AI Reddit Ads Response:`, {
      totalItems: data.data?.length || 0,
      accountName,
      start,
      end,
      sampleItem: data.data?.[0],
    });

    if (!data.data || !Array.isArray(data.data)) {
      console.error("Invalid response format from Windsor AI:", data);
      return NextResponse.json(
        {
          error: "Invalid response format from Windsor AI",
          data: data,
        },
        { status: 500 }
      );
    }

    // Get all unique account names and datasources for debugging
    const allAccountNames = [...new Set(data.data.map((d) => d.account_name))];
    const allDataSources = [...new Set(data.data.map((d) => d.datasource))];
    const redditData = data.data.filter((item) => item.datasource === "reddit" || item.datasource?.toLowerCase().includes("reddit"));
    
    console.log(`Filtered Reddit Ads data:`, {
      totalItems: data.data.length,
      redditItems: redditData.length,
      accountNames: allAccountNames,
      datasources: allDataSources,
      searchingForAccount: accountName,
      dateRange: {
        min: data.data.length > 0 ? Math.min(...data.data.map((d) => d.date)) : null,
        max: data.data.length > 0 ? Math.max(...data.data.map((d) => d.date)) : null,
      },
    });

    // Filter by account name and datasource (reddit)
    // Try to match account name (case-insensitive) or check if accountName is in the account_name
    const filteredData = data.data.filter(
      (item) => {
        const accountMatch = item.account_name?.toLowerCase() === accountName.toLowerCase() ||
                            item.account_name?.toLowerCase().includes(accountName.toLowerCase()) ||
                            accountName.toLowerCase().includes(item.account_name?.toLowerCase() || "");
        const datasourceMatch = item.datasource === "reddit" || 
                               item.datasource?.toLowerCase().includes("reddit");
        const dateMatch = item.date >= start && item.date <= end;
        return accountMatch && datasourceMatch && dateMatch;
      }
    );
    
    console.log(`After filtering:`, {
      filteredItems: filteredData.length,
      matchedAccountNames: [...new Set(filteredData.map((d) => d.account_name))],
    });

    if (filteredData.length === 0) {
      return NextResponse.json({
        accountId: accountName,
        accountName: accountName,
        campaigns: [],
        summary: {
          totalImpressions: 0,
          totalClicks: 0,
          totalSpend: 0,
          totalConversions: 0,
          averageCtr: 0,
          averageCpc: 0,
        },
        source: "windsor-ai",
        note: `No Reddit Ads data found for account "${accountName}" in the selected date range`,
      });
    }

    // Group by campaign and aggregate metrics
    const campaignMap = new Map<string, {
      id: string;
      name: string;
      status: string;
      startDate: string;
      endDate?: string;
      budget: number;
      impressions: number;
      clicks: number;
      spend: number;
      conversions: number;
      ctr: number;
      cpc: number;
      cpa: number;
    }>();

    // Track date ranges per campaign
    const campaignDates = new Map<string, { min: string; max: string }>();

    for (const item of filteredData) {
      const campaignName = item.campaign || "(not set)";
      const campaignId = campaignName.toLowerCase().replace(/\s+/g, "-");

      // Track date range
      if (!campaignDates.has(campaignId)) {
        campaignDates.set(campaignId, { min: item.date, max: item.date });
      } else {
        const dates = campaignDates.get(campaignId)!;
        if (item.date < dates.min) dates.min = item.date;
        if (item.date > dates.max) dates.max = item.date;
      }

      const existing = campaignMap.get(campaignId);
      const clicks = item.clicks ?? 0;
      const spend = item.spend ?? 0;
      
      // Estimate impressions from clicks (rough estimate: 20 impressions per click)
      // Since we don't have impressions or CPM data, we'll estimate
      const estimatedImpressions = clicks > 0 
        ? clicks * 20 // Rough estimate: 20 impressions per click
        : 0;

      // Conversions - use form_submissions or conversions field
      // Priority: form_submissions > conversions > email (fallback)
      const conversions = (item.form_submissions ?? 0) || 
                         (item.conversions ?? 0) || 
                         (item.email ? 1 : 0);

      if (existing) {
        existing.clicks += clicks;
        existing.spend += spend;
        existing.impressions += estimatedImpressions;
        existing.conversions += conversions;
        // Recalculate CPC
        existing.cpc = existing.clicks > 0 ? existing.spend / existing.clicks : 0;
      } else {
        campaignMap.set(campaignId, {
          id: campaignId,
          name: campaignName,
          status: "ACTIVE", // Default status since we don't have ad_form_status
          startDate: item.date,
          budget: spend, // Use spend as budget estimate
          impressions: estimatedImpressions,
          clicks: clicks,
          spend: spend,
          conversions: conversions,
          ctr: 0, // Will be calculated after aggregation
          cpc: clicks > 0 ? spend / clicks : 0,
          cpa: conversions > 0 ? spend / conversions : 0,
        });
      }
    }

    // Calculate metrics for each campaign
    const campaigns = Array.from(campaignMap.entries()).map(([id, campaign]) => {
      const dates = campaignDates.get(id)!;
      
      const ctr = campaign.impressions > 0 
        ? (campaign.clicks / campaign.impressions) * 100 
        : 0;
      
      const cpc = campaign.clicks > 0 
        ? campaign.spend / campaign.clicks 
        : campaign.cpc;
      
      const cpa = campaign.conversions > 0 
        ? campaign.spend / campaign.conversions 
        : 0;

      return {
        ...campaign,
        startDate: dates.min,
        endDate: dates.max !== dates.min ? dates.max : undefined,
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
        acc.totalSpend += campaign.spend;
        acc.totalConversions += campaign.conversions;
        return acc;
      },
      {
        totalImpressions: 0,
        totalClicks: 0,
        totalSpend: 0,
        totalConversions: 0,
      }
    );

    summary.averageCtr =
      summary.totalImpressions > 0
        ? (summary.totalClicks / summary.totalImpressions) * 100
        : 0;
    summary.averageCpc =
      summary.totalClicks > 0 ? summary.totalSpend / summary.totalClicks : 0;

    return NextResponse.json({
      accountId: accountName,
      accountName: accountName,
      campaigns: campaigns.sort((a, b) => b.clicks - a.clicks), // Sort by clicks descending
      summary,
      source: "windsor-ai",
      note: `Data fetched from Windsor AI for account "${accountName}"`,
    });
  } catch (error: any) {
    console.error("Windsor AI Reddit Ads API Error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to fetch data from Windsor AI",
      },
      { status: 500 }
    );
  }
}
