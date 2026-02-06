import { NextResponse } from "next/server";

const WINDSOR_AI_API_KEY = process.env.WINDSOR_AI_API_KEY || "2403886836e607f492497f451145f22a374b";
const WINDSOR_AI_BASE_URL = "https://connectors.windsor.ai/all";

interface WindsorAIHubSpotDataPoint {
  account_name: string;
  datasource: string;
  date: string;
  email: string | null;
  meetings_hs_activity_type: string | null;
  owner_owner_id: string | null;
  source: string | null;
  tickets_hs_all_team_ids: string | null;
  tickets_hubspot_owner_assigneddate: string | null;
  tickets_hubspot_team_id: string | null;
}

interface WindsorAIResponse {
  data: WindsorAIHubSpotDataPoint[];
}

/**
 * Fetch HubSpot CRM data from Windsor AI
 * Filters by account ID hubspot__44138820
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const datePreset = searchParams.get("datePreset") || "last_180d";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    
    // If custom date range provided, calculate appropriate preset or use custom dates
    let finalDatePreset = datePreset;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      
      // Map to Windsor AI date presets
      if (daysDiff <= 7) {
        finalDatePreset = "last_7d";
      } else if (daysDiff <= 30) {
        finalDatePreset = "last_30d";
      } else if (daysDiff <= 90) {
        finalDatePreset = "last_90d";
      } else if (daysDiff <= 180) {
        finalDatePreset = "last_180d";
      } else {
        finalDatePreset = "last_365d";
      }
    }

    // Build Windsor AI API URL
    // Using select_accounts parameter to filter by HubSpot account ID
    // Format: select_accounts=hubspot__{account_id}
    // Based on the query: select_accounts=hubspot__44138820
    const fields = "account_name,datasource,date,email,meetings_hs_activity_type,owner_owner_id,source,tickets_hs_all_team_ids,tickets_hubspot_owner_assigneddate,tickets_hubspot_team_id";
    const encodedFields = encodeURIComponent(fields);
    // Use select_accounts parameter for HubSpot account ID 44138820
    const accountId = "44138820";
    const selectAccountsParam = `&select_accounts=hubspot__${accountId}`;
    // Build URL with date preset or custom date range
    let url = `${WINDSOR_AI_BASE_URL}?api_key=${WINDSOR_AI_API_KEY}&date_preset=${finalDatePreset}&fields=${encodedFields}${selectAccountsParam}`;
    
    // If custom dates provided, filter the data after fetching (Windsor AI uses presets)
    // Note: We'll filter client-side after fetching since Windsor AI primarily uses presets

    console.log(`Fetching Windsor AI HubSpot CRM data:`);
    console.log(`  URL: ${url.replace(WINDSOR_AI_API_KEY, "***")}`);
    console.log(`  Fields: ${fields}`);
    console.log(`  Date Preset: ${finalDatePreset}`);
    if (startDate && endDate) {
      console.log(`  Custom Date Range: ${startDate} to ${endDate}`);
    }
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
          status: response.status,
          statusText: response.statusText,
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

    // Filter by datasource to ensure we only get HubSpot data
    let filteredData = data.data.filter(
      (item) => item.datasource === "hubspot"
    );

    // If custom date range provided, filter by date
    if (startDate && endDate) {
      filteredData = filteredData.filter(
        (item) => item.date >= startDate && item.date <= endDate
      );
    }

    console.log(`HubSpot CRM data:`, {
      totalItems: data.data.length,
      filteredItems: filteredData.length,
      accountNames: [...new Set(data.data.map((d) => d.account_name))],
      dateRange: {
        min: data.data.length > 0 ? Math.min(...data.data.map((d) => d.date)) : null,
        max: data.data.length > 0 ? Math.max(...data.data.map((d) => d.date)) : null,
      },
      uniqueEmails: [...new Set(filteredData.map((d) => d.email).filter(Boolean))].length,
      meetingsCount: filteredData.filter((d) => d.meetings_hs_activity_type).length,
      ticketsCount: filteredData.filter((d) => d.tickets_hubspot_owner_assigneddate).length,
    });

    if (filteredData.length === 0) {
      return NextResponse.json({
        accountId: accountId,
        accountName: data.data.length > 0 ? data.data[0]?.account_name : "Unknown",
        data: [],
        summary: {
          totalRecords: 0,
          totalEmails: 0,
          totalMeetings: 0,
          totalTickets: 0,
          bySource: {},
          byOwner: {},
        },
        source: "windsor-ai",
        note: `No HubSpot CRM data found for account "${accountId}" in the selected date range`,
      });
    }

    // Group data by type and aggregate metrics
    const meetings: Array<{
      date: string;
      email: string | null;
      activityType: string | null;
      ownerId: string | null;
      source: string | null;
    }> = [];
    
    const tickets: Array<{
      date: string;
      email: string | null;
      teamIds: string | null;
      assignedDate: string | null;
      teamId: string | null;
      ownerId: string | null;
      source: string | null;
    }> = [];

    const emails: Array<{
      date: string;
      email: string | null;
      source: string | null;
    }> = [];

    const sourceMap = new Map<string, number>();
    const ownerMap = new Map<string, number>();
    const emailSet = new Set<string>();

    for (const item of filteredData) {
      // Track unique emails
      if (item.email) {
        emailSet.add(item.email);
      }

      // Track sources
      if (item.source) {
        sourceMap.set(item.source, (sourceMap.get(item.source) || 0) + 1);
      }

      // Track owners
      if (item.owner_owner_id) {
        ownerMap.set(item.owner_owner_id, (ownerMap.get(item.owner_owner_id) || 0) + 1);
      }

      // Categorize by type
      if (item.meetings_hs_activity_type) {
        meetings.push({
          date: item.date,
          email: item.email,
          activityType: item.meetings_hs_activity_type,
          ownerId: item.owner_owner_id,
          source: item.source,
        });
      }

      if (item.tickets_hubspot_owner_assigneddate || item.tickets_hs_all_team_ids) {
        tickets.push({
          date: item.date,
          email: item.email,
          teamIds: item.tickets_hs_all_team_ids,
          assignedDate: item.tickets_hubspot_owner_assigneddate,
          teamId: item.tickets_hubspot_team_id,
          ownerId: item.owner_owner_id,
          source: item.source,
        });
      }

      if (item.email && !item.meetings_hs_activity_type && !item.tickets_hubspot_owner_assigneddate) {
        emails.push({
          date: item.date,
          email: item.email,
          source: item.source,
        });
      }
    }

    // Convert maps to objects for JSON response
    const bySource: Record<string, number> = {};
    sourceMap.forEach((count, source) => {
      bySource[source] = count;
    });

    const byOwner: Record<string, number> = {};
    ownerMap.forEach((count, ownerId) => {
      byOwner[ownerId] = count;
    });

    return NextResponse.json({
      accountId: accountId,
      accountName: filteredData.length > 0 ? filteredData[0]?.account_name : "Unknown",
      data: filteredData,
      meetings,
      tickets,
      emails,
      summary: {
        totalRecords: filteredData.length,
        totalEmails: emailSet.size,
        totalMeetings: meetings.length,
        totalTickets: tickets.length,
        bySource,
        byOwner,
      },
      source: "windsor-ai",
      note: `Data fetched from Windsor AI for HubSpot account "${accountId}"`,
    });
  } catch (error: any) {
    console.error("Windsor AI HubSpot CRM API Error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to fetch data from Windsor AI",
      },
      { status: 500 }
    );
  }
}
