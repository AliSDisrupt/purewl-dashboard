import { NextRequest, NextResponse } from "next/server";
import { fetchHubSpotDeals } from "@/lib/mcp/hubspot";

// Helper function to parse date strings
function parseDate(dateStr: string): Date {
  if (dateStr === "yesterday") {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d;
  }
  if (dateStr === "today") {
    // Use yesterday for today (data not available for current day)
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d;
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate") || "30daysAgo";
    const endDate = searchParams.get("endDate") || "yesterday";
    const stage = searchParams.get("stage"); // Optional: filter by specific stage

    // Fetch all deals
    const dealsData = await fetchHubSpotDeals();
    const allDeals = dealsData.deals || [];

    // Parse date range
    const start = parseDate(startDate);
    start.setHours(0, 0, 0, 0);
    const end = parseDate(endDate);
    end.setHours(23, 59, 59, 999);

    // Filter deals by date range and optionally by stage
    const filteredDeals = allDeals.filter((deal: any) => {
      // Filter by date (using createdAt for "created" deals, or closeDate for closed deals)
      const dealDate = deal.createdAt ? new Date(deal.createdAt) : null;
      if (!dealDate) return false;
      
      const inDateRange = dealDate >= start && dealDate <= end;
      if (!inDateRange) return false;

      // Filter by stage if provided
      if (stage) {
        // Case-insensitive stage matching with flexible matching
        const dealStage = (deal.stage || "").toLowerCase().trim();
        const targetStage = stage.toLowerCase().trim();
        
        // Exact match
        if (dealStage === targetStage) return true;
        
        // Contains match (e.g., "closed won" matches "closedwon" or "closed-won")
        if (dealStage.includes(targetStage) || targetStage.includes(dealStage)) return true;
        
        // Handle common variations
        const normalizedDealStage = dealStage.replace(/[-\s_]/g, "");
        const normalizedTargetStage = targetStage.replace(/[-\s_]/g, "");
        if (normalizedDealStage === normalizedTargetStage) return true;
        
        return false;
      }

      return true;
    });

    // Group by stage
    const byStage: Record<string, number> = {};
    const stageDetails: Record<string, { count: number; totalValue: number }> = {};

    filteredDeals.forEach((deal: any) => {
      const dealStage = deal.stage || "Unknown";
      byStage[dealStage] = (byStage[dealStage] || 0) + 1;
      
      if (!stageDetails[dealStage]) {
        stageDetails[dealStage] = { count: 0, totalValue: 0 };
      }
      stageDetails[dealStage].count++;
      stageDetails[dealStage].totalValue += deal.amount || 0;
    });

    return NextResponse.json({
      deals: filteredDeals,
      summary: {
        total: filteredDeals.length,
        byStage,
        stageDetails,
      },
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Error fetching HubSpot deals by stage:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch deals by stage" },
      { status: 500 }
    );
  }
}
