import { NextResponse } from "next/server";
import { fetchLinkedInAccounts, fetchLinkedInCampaigns, fetchLinkedInAnalytics } from "@/lib/mcp/linkedin";
import { fetchLinkedInCampaignsAnalytics } from "@/lib/mcp/linkedin-campaign-analytics";

export async function GET() {
  try {
    const accounts = await fetchLinkedInAccounts();
    
    // For each account, fetch campaigns and analytics to see which has activity
    const accountsWithDetails = await Promise.all(
      accounts.map(async (account) => {
        try {
          const campaigns = await fetchLinkedInCampaigns(account.id);
          const accountAnalytics = await fetchLinkedInAnalytics(account.id, 30);
          
          // Check for active campaigns
          const activeCampaigns = campaigns.filter(
            (c) => c.status?.toUpperCase() === "ACTIVE" || c.status?.toUpperCase() === "RUNNING"
          );
          
          let finalAnalytics = accountAnalytics.metrics || {
            impressions: 0,
            clicks: 0,
            spend: 0,
            conversions: 0,
          };
          let hasData = accountAnalytics.hasData || false;
          
          // If account-level has no data, try aggregating from campaign-level analytics
          if (!hasData && activeCampaigns.length > 0) {
            try {
              const analyticsMap = await fetchLinkedInCampaignsAnalytics(
                activeCampaigns.map(c => ({ id: c.id, accountId: c.accountId, status: c.status })),
                30
              );
              
              // Aggregate metrics from all campaigns
              let totalImpressions = 0;
              let totalClicks = 0;
              let totalSpend = 0;
              let totalConversions = 0;
              
              analyticsMap.forEach((metrics) => {
                totalImpressions += metrics.impressions || 0;
                totalClicks += metrics.clicks || 0;
                totalSpend += metrics.spend || 0;
                totalConversions += metrics.conversions || 0;
              });
              
              // Use campaign metrics if they have any data
              if (totalImpressions > 0 || totalClicks > 0 || totalSpend > 0) {
                finalAnalytics = {
                  impressions: totalImpressions,
                  clicks: totalClicks,
                  spend: totalSpend,
                  conversions: totalConversions,
                };
                hasData = true;
                console.log(`Account ${account.id}: Aggregated ${activeCampaigns.length} campaigns - ${totalImpressions} impressions, ${totalClicks} clicks, $${totalSpend.toFixed(2)} spend`);
              }
            } catch (campaignError: any) {
              console.warn(`Failed to aggregate campaign analytics for account ${account.id}:`, campaignError.message);
              // Keep account-level analytics (zeros)
            }
          }
          
          // Always include analytics metrics, even if hasData is false
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
            analytics: finalAnalytics,
            hasData: hasData,
          };
        } catch (error: any) {
          return {
            ...account,
            error: error.message,
            totalCampaigns: 0,
            activeCampaigns: 0,
            campaigns: [],
            analytics: {
              impressions: 0,
              clicks: 0,
              spend: 0,
              conversions: 0,
            },
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
