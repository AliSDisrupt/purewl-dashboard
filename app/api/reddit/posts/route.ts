import { NextResponse } from "next/server";
import { fetchRedditPosts } from "@/lib/mcp/reddit";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subreddit = searchParams.get("subreddit") || "vpn";
    const sort = (searchParams.get("sort") || "hot") as "hot" | "new" | "top" | "rising";
    const limit = parseInt(searchParams.get("limit") || "10");

    const posts = await fetchRedditPosts({ subreddit, sort, limit });
    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Error fetching Reddit posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch Reddit posts" },
      { status: 500 }
    );
  }
}
