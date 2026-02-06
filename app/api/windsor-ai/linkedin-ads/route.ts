import { NextResponse } from "next/server";

const WINDSOR_AI_API_KEY = process.env.WINDSOR_AI_API_KEY || "2403886836e607f492497f451145f22a374b";
const WINDSOR_AI_BASE_URL = "https://connectors.windsor.ai/all";

interface WindsorAILinkedInDataPoint {
  account_name: string;
  campaign: string | null;
  clicks: number | null;
  conversions: number | null;
  datasource: string;
  date: string;
  form_submissions: number | null;
  one_click_leads: number | null;
  source: string;
  spend: number | null;
}

interface WindsorAIResponse {
  data: WindsorAILinkedInDataPoint[];
}

/**
 * Fetch LinkedIn Ads data from Windsor AI
 * Filters by account name "PureVPN - Partner & Enterprise Solution"
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate") || "30daysAgo";
    const endDate = searchParams.get("endDate") || "yesterday";
    const accountName = searchParams.get("accountName") || "PureVPN - Partner & Enterprise Solution";

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
    // Using select_accounts parameter to filter by LinkedIn account ID
    // Format: select_accounts=linkedin__{account_id}
    // Based on the query: select_accounts=linkedin__514469053
    // Adding conversions and form submission fields
    const fields = "account_name,campaign,clicks,conversions,datasource,date,form_submissions,one_click_leads,source,spend";
    const encodedFields = encodeURIComponent(fields);
    // Use select_accounts parameter for LinkedIn account ID 514469053
    const accountId = "514469053";
    const selectAccountsParam = `&select_accounts=linkedin__${accountId}`;
    const url = `${WINDSOR_AI_BASE_URL}?api_key=${WINDSOR_AI_API_KEY}&date_preset=${datePreset}&fields=${encodedFields}${selectAccountsParam}`;

    console.log(`Fetching Windsor AI LinkedIn Ads data:`);
    console.log(`  URL: ${url.replace(WINDSOR_AI_API_KEY, "***")}`);
    console.log(`  Fields: ${fields}`);
    console.log(`  Date Preset: ${datePreset}`);
    console.log(`  Account ID: ${accountId}`);

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

    // Since we're using select_accounts, the data is already filtered by account
    // Just filter by date range
    const filteredData = data.data.filter(
      (item) =>
        item.datasource === "linkedin" &&
        item.date >= start &&
        item.date <= end
    );

    console.log(`LinkedIn Ads data:`, {
      totalItems: data.data.length,
      filteredItems: filteredData.length,
      accountNames: [...new Set(data.data.map((d) => d.account_name))],
      dateRange: {
        min: data.data.length > 0 ? Math.min(...data.data.map((d) => d.date)) : null,
        max: data.data.length > 0 ? Math.max(...data.data.map((d) => d.date)) : null,
      },
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
        metrics: {
          impressions: 0,
          clicks: 0,
          spend: 0,
          conversions: 0,
          ctr: 0,
          cpc: 0,
          cpm: 0,
        },
        source: "windsor-ai",
        note: `No LinkedIn Ads data found for account "${accountName}" in the selected date range`,
      });
    }

    // Group by campaign and aggregate metrics
    const campaignMap = new Map<string, {
      id: string;
      name: string;
      status: string;
      impressions: number;
      clicks: number;
      spend: number;
      conversions: number;
      ctr: number;
      cpc: number;
      cpa: number;
    }>();

    for (const item of filteredData) {
      const campaignName = item.campaign || "(not set)";
      const campaignId = campaignName.toLowerCase().replace(/\s+/g, "-");

      const existing = campaignMap.get(campaignId);
      const clicks = item.clicks ?? 0;
      const spend = item.spend ?? 0;
      
      // Estimate impressions from clicks (rough estimate: 20 impressions per click)
      // Since we don't have impressions or sessions data
      const estimatedImpressions = clicks > 0 
        ? clicks * 20 // Rough estimate: 20 impressions per click
        : 0;

      // Conversions - use form_submissions, one_click_leads, or conversions field
      // Priority: form_submissions > one_click_leads > conversions
      const conversions = (item.form_submissions ?? 0) || 
                         (item.one_click_leads ?? 0) || 
                         (item.conversions ?? 0);

      if (existing) {
        existing.clicks += clicks;
        existing.spend += spend;
        existing.impressions += estimatedImpressions;
        existing.conversions += conversions;
      } else {
        campaignMap.set(campaignId, {
          id: campaignId,
          name: campaignName,
          status: "ACTIVE", // Windsor AI doesn't provide status, default to ACTIVE
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
    const campaigns = Array.from(campaignMap.values()).map((campaign) => {
      const ctr = campaign.impressions > 0 
        ? (campaign.clicks / campaign.impressions) * 100 
        : 0;
      
      const cpc = campaign.clicks > 0 
        ? campaign.spend / campaign.clicks 
        : 0;
      
      const cpa = campaign.conversions > 0 
        ? campaign.spend / campaign.conversions 
        : 0;

      return {
        ...campaign,
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

    // Format metrics for LinkedInMetrics component
    const metrics = {
      impressions: summary.totalImpressions,
      clicks: summary.totalClicks,
      spend: summary.totalSpend,
      conversions: summary.totalConversions,
      ctr: summary.averageCtr,
      cpc: summary.averageCpc,
      cpm: summary.totalImpressions > 0 ? (summary.totalSpend / summary.totalImpressions) * 1000 : 0,
    };

    return NextResponse.json({
      accountId: accountName,
      accountName: accountName,
      campaigns: campaigns.sort((a, b) => b.clicks - a.clicks), // Sort by clicks descending
      summary,
      metrics,
      source: "windsor-ai",
      note: `Data fetched from Windsor AI for account "${accountName}"`,
    });
  } catch (error: any) {
    console.error("Windsor AI LinkedIn Ads API Error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to fetch data from Windsor AI",
      },
      { status: 500 }
    );
  }
}
