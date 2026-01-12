import { NextResponse } from "next/server";
import { fetchGA4Overview } from "@/lib/mcp/ga4";
import { fetchGA4Events } from "@/lib/mcp/ga4-campaigns";
import { fetchGA4SourceMedium } from "@/lib/mcp/ga4-campaigns";
import { fetchHubSpotDeals } from "@/lib/mcp/hubspot";

// Helper function to categorize source/medium into channels
function categorizeChannel(source: string, medium: string): string {
  const sourceLower = source.toLowerCase();
  const mediumLower = medium.toLowerCase();

  if (sourceLower.includes("linkedin")) {
    return "LinkedIn";
  }
  if (sourceLower.includes("reddit")) {
    return "Reddit";
  }
  if (sourceLower === "google" && (mediumLower === "cpc" || mediumLower === "paid")) {
    return "Google Ads";
  }
  if (mediumLower === "organic" || sourceLower === "google" && mediumLower === "organic") {
    return "Organic";
  }
  if (sourceLower === "(direct)" || mediumLower === "(none)") {
    return "Direct";
  }
  if (mediumLower === "email") {
    return "Email";
  }
  if (mediumLower === "social") {
    return "Social";
  }
  if (mediumLower === "referral") {
    return "Referral";
  }
  return "Other";
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate") || "30daysAgo";
    const endDate = searchParams.get("endDate") || "yesterday";

    // Step 1: Fetch GA4 Sessions (Total Traffic) with source breakdown
    const ga4Overview = await fetchGA4Overview({ startDate, endDate });
    const totalSessions = ga4Overview.summary.sessions;

    // Fetch source/medium data for channel breakdown
    let sourceMedium: any[] = [];
    try {
      const sourceMediumData = await fetchGA4SourceMedium({ startDate, endDate });
      sourceMedium = sourceMediumData?.sourceMedium || [];
    } catch (error) {
      console.error("Error fetching source/medium data:", error);
      // Continue with empty array if source/medium fetch fails
    }

    // Calculate channel breakdown for traffic
    const trafficBreakdown: Record<string, number> = {};
    if (sourceMedium.length > 0) {
      sourceMedium.forEach((item: any) => {
        const channel = categorizeChannel(item.source || "", item.medium || "");
        trafficBreakdown[channel] = (trafficBreakdown[channel] || 0) + (item.sessions || 0);
      });
    }

    // Step 2: Fetch GA4 Lead_Generated_All_Sites Event with attribution
    const ga4Events = await fetchGA4Events({ startDate, endDate });
    const leadGeneratedEvent = ga4Events.events?.find(
      (e: any) => e.eventName === "Lead_Generated_All_Sites"
    );
    const qualifiedLeads = leadGeneratedEvent?.eventCount || 0;

    // For leads breakdown, we'll use the same source/medium distribution
    // (assuming leads follow similar traffic patterns)
    // In a real scenario, you'd want event-level attribution
    const leadsBreakdown: Record<string, number> = {};
    const totalSourceSessions = sourceMedium.reduce((sum: number, item: any) => sum + item.sessions, 0);
    if (totalSourceSessions > 0) {
      sourceMedium.forEach((item: any) => {
        const channel = categorizeChannel(item.source, item.medium);
        // Estimate leads by channel based on traffic proportion
        const channelProportion = item.sessions / totalSourceSessions;
        leadsBreakdown[channel] = (leadsBreakdown[channel] || 0) + Math.round(qualifiedLeads * channelProportion);
      });
    }

    // Step 3 & 4: Fetch HubSpot Deals
    // Note: We need to fetch deals with createdAt property for accurate "Deals Created" filtering
    // For now, we'll use all deals and filter by closeDate as a proxy
    const hubspotData = await fetchHubSpotDeals();
    const allDeals = hubspotData.deals || [];

    // Parse date range for filtering
    const parseDate = (dateStr: string): Date => {
      if (dateStr === "yesterday") {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        return d;
      }
      if (dateStr === "today") {
        return new Date();
      }
      if (dateStr.endsWith("daysAgo")) {
        const days = parseInt(dateStr);
        const d = new Date();
        d.setDate(d.getDate() - days);
        return d;
      }
      // Assume YYYY-MM-DD format
      return new Date(dateStr);
    };

    const start = parseDate(startDate);
    const end = parseDate(endDate);
    end.setHours(23, 59, 59, 999); // End of day

    // Filter deals by createdAt for "Deals Created" (Level 3)
    const dealsCreatedInRange = allDeals.filter((deal: any) => {
      if (!deal.createdAt) return false;
      const dealDate = new Date(deal.createdAt);
      return dealDate >= start && dealDate <= end;
    });

    // Filter deals by closeDate for "Closed-Won Revenue" (Level 4)
    const closedWonDealsInRange = allDeals.filter((deal: any) => {
      if (!deal.closeDate) return false;
      const dealDate = new Date(deal.closeDate);
      return (
        dealDate >= start &&
        dealDate <= end &&
        (deal.stage?.toLowerCase() === "closedwon" ||
          deal.stage?.toLowerCase() === "closed won")
      );
    });

    // Step 3: Deals Created (any deal in the date range)
    const dealsCreated = dealsCreatedInRange.length;

    // Step 4: Closed-Won Revenue (deals with stage 'closedwon' and closeDate in range)
    const closedWonRevenue = closedWonDealsInRange.reduce(
      (sum: number, deal: any) => sum + (deal.amount || 0),
      0
    );
    const closedWonCount = closedWonDealsInRange.length;

    // Calculate conversion rates
    const sessionToLeadRate =
      totalSessions > 0 ? (qualifiedLeads / totalSessions) * 100 : 0;
    const leadToDealRate =
      qualifiedLeads > 0 ? (dealsCreated / qualifiedLeads) * 100 : 0;
    const dealToCloseRate =
      dealsCreated > 0 ? (closedWonCount / dealsCreated) * 100 : 0;

    // Calculate deals breakdown by channel (using HubSpot deal source if available)
    // For now, we'll estimate based on leads breakdown
    const dealsBreakdown: Record<string, number> = {};
    if (qualifiedLeads > 0) {
      Object.keys(leadsBreakdown).forEach((channel) => {
        const channelLeads = leadsBreakdown[channel];
        const channelProportion = channelLeads / qualifiedLeads;
        dealsBreakdown[channel] = Math.round(dealsCreated * channelProportion);
      });
    }

    // Calculate revenue breakdown (estimate based on closed-won deals breakdown)
    const revenueBreakdown: Record<string, number> = {};
    if (closedWonCount > 0 && dealsCreated > 0) {
      const closeRate = closedWonCount / dealsCreated;
      const avgDealValue = closedWonRevenue / closedWonCount || 0;
      Object.keys(dealsBreakdown).forEach((channel) => {
        const channelDeals = dealsBreakdown[channel];
        const channelClosedDeals = Math.round(channelDeals * closeRate);
        revenueBreakdown[channel] = Math.round(channelClosedDeals * avgDealValue);
      });
    }

    return NextResponse.json({
      funnel: {
        level1: {
          label: "Total Traffic",
          value: totalSessions,
          source: "GA4",
          metric: "sessions",
          breakdown: trafficBreakdown,
        },
        level2: {
          label: "Leads Generated",
          value: qualifiedLeads,
          source: "GA4",
          metric: "Lead_Generated_All_Sites",
          conversionRate: sessionToLeadRate,
          breakdown: leadsBreakdown,
        },
        level3: {
          label: "Deals Created",
          value: dealsCreated,
          source: "HubSpot",
          metric: "deals",
          conversionRate: leadToDealRate,
          breakdown: dealsBreakdown,
        },
        level4: {
          label: "Closed-Won Revenue",
          value: closedWonRevenue,
          count: closedWonCount,
          source: "HubSpot",
          metric: "closedwon",
          conversionRate: dealToCloseRate,
          breakdown: revenueBreakdown,
        },
      },
      conversionRates: {
        sessionToLead: sessionToLeadRate,
        leadToDeal: leadToDealRate,
        dealToClose: dealToCloseRate,
      },
      dateRange: {
        startDate,
        endDate,
      },
    });
  } catch (error: any) {
    console.error("Error fetching funnel data:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch funnel data" },
      { status: 500 }
    );
  }
}
