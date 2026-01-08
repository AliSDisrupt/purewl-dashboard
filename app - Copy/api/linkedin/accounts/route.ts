import { NextResponse } from "next/server";
import { fetchLinkedInAccounts } from "@/lib/mcp/linkedin";

export async function GET(request: Request) {
  try {
    console.log("API Route: Fetching LinkedIn accounts...");
    const accounts = await fetchLinkedInAccounts();
    console.log(`API Route: Returning ${accounts.length} accounts`);
    return NextResponse.json({ accounts });
  } catch (error: any) {
    console.error("API Route Error fetching LinkedIn accounts:", error.message || error);
    return NextResponse.json(
      { 
        error: "Failed to fetch LinkedIn accounts",
        message: error.message || "Unknown error"
      },
      { status: 500 }
    );
  }
}
