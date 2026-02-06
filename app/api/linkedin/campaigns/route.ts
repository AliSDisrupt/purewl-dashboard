import { NextResponse } from "next/server";
import { fetchLinkedInCampaigns } from "@/lib/mcp/linkedin";
import { fetchLinkedInCampaignsAnalytics } from "@/lib/mcp/linkedin-campaign-analytics";
import { apiError } from "@/lib/api-response";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("accountId");
    const includeAnalytics = searchParams.get("includeAnalytics") === "true";

    if (!accountId) {
      return NextResponse.json(
        { error: "accountId parameter is required" },
        { status: 400 }
      );
    }

    const campaigns = await fetchLinkedInCampaigns(accountId);
    
    // If requested, fetch analytics for active campaigns
    if (includeAnalytics && campaigns.length > 0) {
      const analyticsMap = await fetchLinkedInCampaignsAnalytics(
        campaigns.map(c => ({ id: c.id, accountId: c.accountId, status: c.status })),
        30 // Last 30 days
      );
      
      // Attach analytics to campaigns
      campaigns.forEach(campaign => {
        const analytics = analyticsMap.get(campaign.id);
        // Always attach analytics if it exists (even if zeros)
        // This helps identify which campaigns we've checked
        if (analytics !== undefined) {
          campaign.analytics = analytics;
        }
      });
    }
    
    return NextResponse.json({ campaigns });
  } catch (error) {
    return apiError("Failed to fetch LinkedIn campaigns", 500, error);
  }
}
