import { NextResponse } from "next/server";
import { fetchHubSpotDeals } from "@/lib/mcp/hubspot";
import { apiError } from "@/lib/api-response";

// Helper function to parse date strings
function parseDate(dateStr: string): Date {
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
}

// Helper to format source nicely
function formatSource(source: string | null | undefined): string {
  if (!source) return "Unknown";
  
  // Map HubSpot analytics source values to readable names
  const sourceMap: Record<string, string> = {
    "ORGANIC_SEARCH": "Organic Search",
    "PAID_SEARCH": "Paid Search",
    "DIRECT_TRAFFIC": "Direct",
    "REFERRALS": "Referral",
    "OTHER_CAMPAIGNS": "Campaign",
    "SOCIAL_MEDIA": "Social Media",
    "EMAIL_MARKETING": "Email",
    "OFFLINE": "Offline",
    "PAID_SOCIAL": "Paid Social",
  };
  
  return sourceMap[source] || source.replace(/_/g, " ").toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate") || "30daysAgo";
    const endDate = searchParams.get("endDate") || "yesterday";

    // Fetch all HubSpot deals
    const hubspotData = await fetchHubSpotDeals();
    const allDeals = hubspotData.deals || [];

    // Parse date range
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    end.setHours(23, 59, 59, 999);

    // Filter deals created in range
    const dealsInRange = allDeals.filter((deal: any) => {
      if (!deal.createdAt) return false;
      const dealDate = new Date(deal.createdAt);
      return dealDate >= start && dealDate <= end;
    });

    // Filter closed-won deals in range
    const closedWonInRange = allDeals.filter((deal: any) => {
      if (!deal.closeDate) return false;
      const dealDate = new Date(deal.closeDate);
      return (
        dealDate >= start &&
        dealDate <= end &&
        (deal.stage?.toLowerCase() === "closedwon" ||
          deal.stage?.toLowerCase() === "closed won")
      );
    });

    // Aggregate deal sources
    const dealSourceMap: Record<string, { count: number; deals: string[] }> = {};
    dealsInRange.forEach((deal: any) => {
      const source = formatSource(deal.source);
      const detail = deal.sourceData1 || deal.sourceData2 || "";
      const key = detail ? `${source} (${detail})` : source;
      
      if (!dealSourceMap[key]) {
        dealSourceMap[key] = { count: 0, deals: [] };
      }
      dealSourceMap[key].count += 1;
      dealSourceMap[key].deals.push(deal.name);
    });

    // Aggregate revenue sources
    const revenueSourceMap: Record<string, { count: number; revenue: number; deals: string[] }> = {};
    closedWonInRange.forEach((deal: any) => {
      const source = formatSource(deal.source);
      const detail = deal.sourceData1 || deal.sourceData2 || "";
      const key = detail ? `${source} (${detail})` : source;
      
      if (!revenueSourceMap[key]) {
        revenueSourceMap[key] = { count: 0, revenue: 0, deals: [] };
      }
      revenueSourceMap[key].count += 1;
      revenueSourceMap[key].revenue += deal.amount || 0;
      revenueSourceMap[key].deals.push(deal.name);
    });

    // Convert to arrays and sort
    const dealSources = Object.entries(dealSourceMap)
      .map(([source, data]) => ({
        source,
        count: data.count,
        deals: data.deals.slice(0, 5), // Only include first 5 deal names
      }))
      .sort((a, b) => b.count - a.count);

    const revenueSources = Object.entries(revenueSourceMap)
      .map(([source, data]) => ({
        source,
        count: data.count,
        revenue: data.revenue,
        deals: data.deals.slice(0, 5),
      }))
      .sort((a, b) => b.revenue - a.revenue);

    // Calculate totals
    const totalDeals = dealsInRange.length;
    const totalRevenue = closedWonInRange.reduce((sum: number, d: any) => sum + (d.amount || 0), 0);
    const totalClosedWon = closedWonInRange.length;

    return NextResponse.json({
      dealSources,
      revenueSources,
      summary: {
        totalDeals,
        totalClosedWon,
        totalRevenue,
        uniqueDealSources: dealSources.length,
        uniqueRevenueSources: revenueSources.length,
      },
    });
  } catch (error) {
    return apiError("Failed to fetch deal sources", 500, error);
  }
}
