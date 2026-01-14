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
      // Get the original stage value from deals (before name mapping) if available
      // For now, we'll match against the mapped stage name
      filteredDeals = dealsData.deals.filter((deal: any) => {
        const dealStage = (deal.stage || "").toString();
        const targetStage = stage.toString();
        
        // Exact match (case-insensitive)
        if (dealStage.toLowerCase().trim() === targetStage.toLowerCase().trim()) return true;
        
        // Numeric ID match (if both are numeric)
        if (!isNaN(Number(dealStage)) && !isNaN(Number(targetStage))) {
          if (Number(dealStage) === Number(targetStage)) return true;
        }
        
        // Check if target is a numeric ID and deal stage is the mapped name
        // e.g., target="143589767" (Disqualified ID) should match deal.stage="Disqualified lead"
        if (!isNaN(Number(targetStage))) {
          // Map the ID to expected name and check
          const stageIdMap: Record<string, string> = {
            '143589767': 'Disqualified lead',
            '1181812774': 'Email sent',
            'closedlost': 'Conversation initiated',
            '143589765': 'Won',
            '143589766': 'Lost',
          };
          const expectedName = stageIdMap[targetStage];
          if (expectedName && dealStage.toLowerCase().includes(expectedName.toLowerCase())) {
            return true;
          }
        }
        
        // Contains match (e.g., "closed won" matches "closedwon" or "closed-won")
        const dealStageLower = dealStage.toLowerCase().trim();
        const targetStageLower = targetStage.toLowerCase().trim();
        if (dealStageLower.includes(targetStageLower) || targetStageLower.includes(dealStageLower)) return true;
        
        // Handle common variations (normalize spaces, dashes, underscores)
        const normalizedDealStage = dealStageLower.replace(/[-\s_]/g, "");
        const normalizedTargetStage = targetStageLower.replace(/[-\s_]/g, "");
        if (normalizedDealStage === normalizedTargetStage) return true;
        
        return false;
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
