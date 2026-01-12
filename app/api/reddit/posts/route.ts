import { NextResponse } from "next/server";
import { fetchRedditPosts, searchRedditPosts, searchRedditPostsAndComments, TimeFilter } from "@/lib/mcp/reddit";
import { savePosts, saveComments, mergeWithStored, getStorageStats } from "@/lib/storage/reddit-storage";
import { trackRequest } from "@/lib/usage-tracker";

export async function GET(request: Request) {
  try {
    trackRequest('reddit');
    const { searchParams } = new URL(request.url);
    const subreddit = searchParams.get("subreddit") || "vpn";
    const sort = (searchParams.get("sort") || "hot") as "hot" | "new" | "top" | "rising" | "relevance";
    const limit = parseInt(searchParams.get("limit") || "10");
    const query = searchParams.get("query");
    const keywords = searchParams.get("keywords"); // Comma-separated keywords
    const subreddits = searchParams.get("subreddits"); // Comma-separated subreddits
    const time = (searchParams.get("time") || "all") as TimeFilter; // Time filter
    const includeComments = searchParams.get("includeComments") === "true"; // Include comments
    const commentsPerPost = parseInt(searchParams.get("commentsPerPost") || "3");
    const startDate = searchParams.get("startDate"); // Custom start date
    const endDate = searchParams.get("endDate"); // Custom end date

    // If keywords are provided, use multi-subreddit search with optional comments
    if (keywords) {
      const keywordArray = keywords.split(',').map(k => k.trim());
      const subredditArray = subreddits 
        ? subreddits.split(',').map(s => s.trim())
        : ['vpn', 'privacy', 'networking', 'technology'];
      
      // Check if we should merge with stored data
      const mergeWithStoredData = searchParams.get("mergeWithStored") !== "false"; // Default: true
      
      if (includeComments) {
        const { posts: newPosts, comments: newComments } = await searchRedditPostsAndComments(
          keywordArray, 
          subredditArray, 
          limit, 
          time,
          true,
          commentsPerPost
        );
        
        // Save new data to storage
        await savePosts(newPosts);
        await saveComments(newComments);
        
        // Merge with stored data if requested
        let finalPosts = newPosts;
        let finalComments = newComments;
        
        if (mergeWithStoredData) {
          const merged = await mergeWithStored(newPosts, newComments);
          finalPosts = merged.posts;
          finalComments = merged.comments;
        }
        
        const stats = await getStorageStats();
        
        return NextResponse.json({ 
          posts: finalPosts, 
          comments: finalComments,
          searchType: 'multi-subreddit-with-comments', 
          keywords: keywordArray,
          timeFilter: time,
          storageStats: stats,
          newPostsCount: newPosts.length,
          newCommentsCount: newComments.length,
        });
      } else {
        const newPosts = await searchRedditPosts(keywordArray, subredditArray, limit, time, startDate || undefined, endDate || undefined);
        
        // Save new data to storage
        await savePosts(newPosts);
        
        // Merge with stored data if requested
        let finalPosts = newPosts;
        
        if (mergeWithStoredData) {
          const merged = await mergeWithStored(newPosts, []);
          finalPosts = merged.posts;
        }
        
        const stats = await getStorageStats();
        
        return NextResponse.json({ 
          posts: finalPosts, 
          comments: [],
          searchType: 'multi-subreddit', 
          keywords: keywordArray,
          timeFilter: time,
          storageStats: stats,
          newPostsCount: newPosts.length,
        });
      }
    }

    // Single subreddit search or listing
    const posts = await fetchRedditPosts({ subreddit, sort, limit, query: query || undefined, time });
    return NextResponse.json({ 
      posts, 
      comments: [],
      searchType: 'single-subreddit',
      timeFilter: time
    });
  } catch (error: any) {
    console.error("Error fetching Reddit posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch Reddit posts", message: error.message },
      { status: 500 }
    );
  }
}
