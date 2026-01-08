import { NextResponse } from "next/server";
import { fetchLinkedInAccounts } from "@/lib/mcp/linkedin";

export async function GET() {
  try {
    const accounts = await fetchLinkedInAccounts();
    
    // Return detailed information about each account
    return NextResponse.json({
      totalAccounts: accounts.length,
      accounts: accounts.map(acc => ({
        id: acc.id,
        simpleId: acc.simpleId,
        name: acc.name,
        // Show which endpoints use this account
        endpoints: {
          campaigns: `/api/linkedin/campaigns?accountId=${encodeURIComponent(acc.id)}`,
          analytics: `/api/linkedin/analytics?accountId=${encodeURIComponent(acc.id)}&daysBack=30`
        }
      }))
    });
  } catch (error: any) {
    console.error("Error fetching LinkedIn accounts:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch LinkedIn accounts",
        message: error.message,
        totalAccounts: 0,
        accounts: []
      },
      { status: 500 }
    );
  }
}
