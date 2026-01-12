import { NextResponse } from "next/server";
import {
  fetchLinkedInAccounts,
  fetchLinkedInCampaigns,
  fetchLinkedInAnalytics
} from "@/lib/mcp/linkedin";
import { trackRequest } from "@/lib/usage-tracker";

export async function POST(request: Request) {
  try {
    trackRequest('linkedin');
    const { tool, parameters } = await request.json();

    switch (tool) {
      case "list_linkedin_accounts": {
        const accounts = await fetchLinkedInAccounts();
        return NextResponse.json({ result: accounts });
      }

      case "get_linkedin_account_details": {
        const accounts = await fetchLinkedInAccounts();
        
        // For each account, fetch campaigns and analytics to see which has activity
        const accountsWithDetails = await Promise.all(
          accounts.map(async (account) => {
            try {
              const campaigns = await fetchLinkedInCampaigns(account.id);
              const analytics = await fetchLinkedInAnalytics(account.id, 30);
              
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
          result: {
            accounts: accountsWithDetails,
            totalAccounts: accountsWithDetails.length,
          }
        });
      }

      case "get_linkedin_campaigns": {
        const { accountId, includeAnalytics } = parameters;
        const campaigns = await fetchLinkedInCampaigns(accountId);
        
        // If analytics requested, fetch them (similar to campaigns API route)
        if (includeAnalytics && campaigns.length > 0) {
          const { fetchLinkedInCampaignsAnalytics } = await import("@/lib/mcp/linkedin-campaign-analytics");
          const analyticsMap = await fetchLinkedInCampaignsAnalytics(
            campaigns.map(c => ({ id: c.id, accountId: c.accountId, status: c.status })),
            30
          );
          
          campaigns.forEach(campaign => {
            const analytics = analyticsMap.get(campaign.id);
            if (analytics !== undefined) {
              campaign.analytics = analytics;
            }
          });
        }
        
        return NextResponse.json({ result: campaigns });
      }

      case "get_linkedin_analytics": {
        const { accountId, daysBack = 30 } = parameters;
        const analytics = await fetchLinkedInAnalytics(accountId, daysBack);
        return NextResponse.json({ result: analytics });
      }

      case "get_linkedin_campaign_analytics": {
        const { campaignIds, accountId, daysBack = 30 } = parameters;
        const { fetchLinkedInCampaignsAnalytics } = await import("@/lib/mcp/linkedin-campaign-analytics");
        
        // Convert campaign IDs to the format expected by the function
        const campaigns = campaignIds.map((id: string) => ({
          id,
          accountId,
          status: "ACTIVE" // Default status
        }));
        
        const analyticsMap = await fetchLinkedInCampaignsAnalytics(campaigns, daysBack);
        
        // Convert map to array format
        const result = Array.from(analyticsMap.entries()).map(([campaignId, metrics]) => ({
          campaignId,
          metrics
        }));
        
        return NextResponse.json({ result });
      }

      default:
        return NextResponse.json(
          { error: `Unknown tool: ${tool}` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error("LinkedIn MCP Bridge Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to execute LinkedIn tool" },
      { status: 500 }
    );
  }
}
