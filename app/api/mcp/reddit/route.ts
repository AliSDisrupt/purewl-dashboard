import { NextResponse } from "next/server";
import { fetchRedditPosts } from "@/lib/mcp/reddit";

export async function POST(request: Request) {
  try {
    const { tool, parameters } = await request.json();

    switch (tool) {
      case "get_reddit_posts": {
        const { subreddit = "vpn", limit = 10, query } = parameters;
        const posts = await fetchRedditPosts({ subreddit, limit });
        
        // Filter by query if provided
        const filteredPosts = query
          ? posts.filter(
              (post) =>
                post.title.toLowerCase().includes(query.toLowerCase()) ||
                post.content?.toLowerCase().includes(query.toLowerCase())
            )
          : posts;

        return NextResponse.json({ result: filteredPosts });
      }

      default:
        return NextResponse.json(
          { error: `Unknown tool: ${tool}` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error("Reddit MCP Bridge Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to execute Reddit tool" },
      { status: 500 }
    );
  }
}
