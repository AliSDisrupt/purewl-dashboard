import { NextResponse } from "next/server";
import { fetchGA4TopPages } from "@/lib/mcp/ga4";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate") || "30daysAgo";
    const endDate = searchParams.get("endDate") || "yesterday";

    // Fetch Top Content from GA4 (top 100 pages to get more blog posts)
    const ga4Pages = await fetchGA4TopPages({ startDate, endDate });
    let allPages = ga4Pages.pages || [];
    
    // Filter for blog posts - URLs containing /blog/, /posts/, /article/, or pageTitle containing "blog"
    const blogPages = allPages.filter((page: any) => {
      const path = (page.path || page.url || "").toLowerCase();
      const title = (page.title || "").toLowerCase();
      
      // Check if it's a blog post
      return (
        path.includes("/blog/") ||
        path.includes("/posts/") ||
        path.includes("/article/") ||
        path.includes("/news/") ||
        title.includes("blog") ||
        title.includes("post") ||
        title.includes("article")
      );
    });
    
    // If we have blog pages, use them; otherwise use all pages (fallback)
    let topPages = blogPages.length > 0 ? blogPages : allPages;
    
    // Sort by unique visitors (traffic) descending
    topPages.sort((a: any, b: any) => (b.users || 0) - (a.users || 0));
    
    // Limit to top 50 blog posts
    topPages = topPages.slice(0, 50);

    // Create Content ROI rows - just traffic data from GA4
    const contentROI = topPages.map((page: any) => {
      const uniqueVisitors = page.users || 0;
      const pageViews = page.pageViews || 0;
      const engagementRate = page.engagementRate || 0;
      const avgEngagementTime = page.avgEngagementTime || 0;
      const bounceRate = page.bounceRate || 0;

      return {
        pageTitle: page.title || page.path || "Unknown",
        pageUrl: page.path || page.url || "",
        uniqueVisitors,
        pageViews,
        engagementRate,
        avgEngagementTime,
        bounceRate,
      };
    });

    // Sort by Unique Visitors (High to Low) - traffic-based sorting
    contentROI.sort((a, b) => b.uniqueVisitors - a.uniqueVisitors);
    
    // Log summary for debugging
    console.log(`Content ROI: ${topPages.length} blog posts (filtered from ${allPages.length} total pages)`);

    return NextResponse.json({
      contentROI,
      summary: {
        totalPages: contentROI.length,
        totalVisitors: contentROI.reduce((sum, p) => sum + p.uniqueVisitors, 0),
        totalPageViews: contentROI.reduce((sum, p) => sum + p.pageViews, 0),
      },
    });
  } catch (error: any) {
    console.error("Error fetching Content ROI data:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch Content ROI data" },
      { status: 500 }
    );
  }
}
