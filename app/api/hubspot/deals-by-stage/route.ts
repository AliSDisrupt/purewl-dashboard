import { NextRequest, NextResponse } from "next/server";
import { fetchHubSpotDealsByStage } from "@/lib/mcp/hubspot";

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

    // Parse date range
    const start = parseDate(startDate);
    start.setHours(0, 0, 0, 0);
    const end = parseDate(endDate);
    end.setHours(23, 59, 59, 999);

    // Fetch deals using search API with server-side filtering
    // This is more efficient than fetching all deals and filtering client-side
    // Note: We pass the stage parameter to the search API, but it might be an ID or name
    // The API will try to match it, but we'll also do client-side matching for accuracy
    const dealsData = await fetchHubSpotDealsByStage(start, end, stage || undefined);

    // If stage filter was provided, we need to do client-side matching
    // because HubSpot might return stage names (after mapping) but we're filtering by ID
    let filteredDeals = dealsData.deals;
    
    if (stage) {
      // Stage ID to expected mapped name mapping
      // Note: deals have already been mapped to stage names, so we match against the mapped name
      const stageIdToNameMap: Record<string, string[]> = {
        '143589767': ['Disqualified lead', 'disqualified'],
        '1181812774': ['Email sent', 'email'],
        'closedlost': ['Conversation initiated', 'conversation'],
        '143589763': ['Requirements Received', 'requirements received', 'Proposal shared', 'proposal'],
        '143589765': ['Won', 'closed won', 'closedwon'],
        '143589766': ['Lost'],
      };
      
      const targetStage = stage.toString().toLowerCase().trim();
      const expectedNames = stageIdToNameMap[targetStage] || [];
      
      filteredDeals = dealsData.deals.filter((deal: any) => {
        const dealStage = (deal.stage || "").toString().toLowerCase().trim();
        
        // If we have expected names for this stage ID, check against them
        if (expectedNames.length > 0) {
          if (expectedNames.some(name => dealStage.includes(name.toLowerCase()) || name.toLowerCase().includes(dealStage))) {
            return true;
          }
        }
        
        // Exact match (case-insensitive)
        if (dealStage === targetStage) return true;
        
        // Numeric ID match (if both are numeric)
        if (!isNaN(Number(dealStage)) && !isNaN(Number(targetStage))) {
          if (Number(dealStage) === Number(targetStage)) return true;
        }
        
        // Contains match
        if (dealStage.includes(targetStage) || targetStage.includes(dealStage)) return true;
        
        // Handle common variations (normalize spaces, dashes, underscores)
        const normalizedDealStage = dealStage.replace(/[-\s_]/g, "");
        const normalizedTargetStage = targetStage.replace(/[-\s_]/g, "");
        if (normalizedDealStage === normalizedTargetStage) return true;
        
        return false;
      });
      
      // Debug logging
      console.log(`🔍 Filtering deals by stage "${stage}":`, {
        totalDeals: dealsData.deals.length,
        filteredCount: filteredDeals.length,
        expectedNames: expectedNames,
        sampleStages: [...new Set(dealsData.deals.slice(0, 10).map((d: any) => d.stage))],
      });
    }

    // Recalculate summary for filtered deals
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
