import { NextResponse } from "next/server";
import { fetchHubSpotConversations } from "@/lib/mcp/hubspot";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const threadId = searchParams.get("threadId");

    const data = await fetchHubSpotConversations(limit);
    
    // If threadId is provided, return only that thread
    if (threadId) {
      const thread = data.threads?.find((t: any) => t.id === threadId);
      if (thread) {
        return NextResponse.json({ thread, threads: [thread], summary: data.summary });
      } else {
        return NextResponse.json({ error: "Thread not found" }, { status: 404 });
      }
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching HubSpot conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch HubSpot conversations" },
      { status: 500 }
    );
  }
}
