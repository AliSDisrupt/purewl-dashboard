import { NextResponse } from "next/server";
import { fetchLinkedInAccounts, fetchLinkedInCampaigns, fetchLinkedInAnalytics } from "@/lib/mcp/linkedin";

export async function GET() {
  try {
    const accounts = await fetchLinkedInAccounts();
    
    // For each account, fetch campaigns and analytics to see which has activity
    const accountsWithDetails = await Promise.all(
      accounts.map(async (account) => {
        try {
          const campaigns = await fetchLinkedInCampaigns(account.id);
          const analytics = await fetchLinkedInAnalytics(account.id, 30);
          
          // Check for active campaigns
          const activeCampaigns = campaigns.filter(
            (c) => c.status?.toUpperCase() === "ACTIVE" || c.status?.toUpperCase() === "RUNNING"
          );
          
          return {
            ...account,
            totalCampaigns: campaigns.length,
            activeCampaigns: activeCampaigns.length,
            campaigns: campaigns.map(c => ({
              id: c.id,
              name: c.name,
              status: c.status,
              objective: c.objective,
            })),
            analytics: analytics.metrics,
            hasData: analytics.hasData,
          };
        } catch (error: any) {
          return {
            ...account,
            error: error.message,
            totalCampaigns: 0,
            activeCampaigns: 0,
            campaigns: [],
            analytics: null,
            hasData: false,
          };
        }
      })
    );
    
    return NextResponse.json({
      accounts: accountsWithDetails,
      totalAccounts: accountsWithDetails.length,
    });
  } catch (error: any) {
    console.error("Error fetching LinkedIn accounts detail:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch LinkedIn accounts detail",
        message: error.message,
        accounts: []
      },
      { status: 500 }
    );
  }
}
