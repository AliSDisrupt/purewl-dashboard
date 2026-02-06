import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import PageVisit from "@/lib/db/models/PageVisit";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * Get tracked visitors data
 * GET /api/tracking/visitors?limit=50&page=1&startDate=&endDate=
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const ipAddress = searchParams.get("ipAddress");
    const pagePath = searchParams.get("pagePath");

    // Build query
    const query: any = {};
    
    if (startDate || endDate) {
      query.visitedAt = {};
      if (startDate) query.visitedAt.$gte = new Date(startDate);
      if (endDate) query.visitedAt.$lte = new Date(endDate);
    }
    
    if (ipAddress) {
      query.ipAddress = ipAddress;
    }
    
    if (pagePath) {
      query.pagePath = { $regex: pagePath, $options: "i" };
    }

    // Get total count
    const total = await PageVisit.countDocuments(query);

    // Get paginated results
    const skip = (page - 1) * limit;
    const visits = await PageVisit.find(query)
      .sort({ visitedAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    // Aggregate by session/visitor
    const visitorMap = new Map<string, {
      sessionId: string;
      visitorId?: string;
      ipAddress: string;
      firstVisit: Date;
      lastVisit: Date;
      pageCount: number;
      pages: Array<{
        url: string;
        title?: string;
        path: string;
        visitedAt: Date;
        clickType?: string;
        clickedElement?: string;
      }>;
      clicks: Array<{
        type: string;
        element?: string;
        url?: string;
        page: string;
        timestamp: Date;
      }>;
      userAgent?: string;
      deviceType?: string;
      browser?: string;
      country?: string;
    }>();

    for (const visit of visits) {
      const key = visit.visitorId || visit.sessionId;
      const existing = visitorMap.get(key);

      if (existing) {
        existing.pageCount += 1;
        existing.lastVisit = new Date(Math.max(
          existing.lastVisit.getTime(),
          new Date(visit.visitedAt).getTime()
        ));
        existing.firstVisit = new Date(Math.min(
          existing.firstVisit.getTime(),
          new Date(visit.visitedAt).getTime()
        ));

        // Add page if not already in list
        const pageExists = existing.pages.some(
          (p) => p.path === visit.pagePath && 
          Math.abs(new Date(p.visitedAt).getTime() - new Date(visit.visitedAt).getTime()) < 1000
        );
        if (!pageExists) {
          existing.pages.push({
            url: visit.pageUrl,
            title: visit.pageTitle,
            path: visit.pagePath,
            visitedAt: visit.visitedAt,
            clickType: visit.clickType,
            clickedElement: visit.clickedElement,
          });
        }

        // Add click if present
        if (visit.clickType) {
          existing.clicks.push({
            type: visit.clickType,
            element: visit.clickedElement,
            url: visit.clickedUrl,
            page: visit.pagePath,
            timestamp: visit.visitedAt,
          });
        }
      } else {
        visitorMap.set(key, {
          sessionId: visit.sessionId,
          visitorId: visit.visitorId,
          ipAddress: visit.ipAddress,
          firstVisit: visit.visitedAt,
          lastVisit: visit.visitedAt,
          pageCount: 1,
          pages: [{
            url: visit.pageUrl,
            title: visit.pageTitle,
            path: visit.pagePath,
            visitedAt: visit.visitedAt,
            clickType: visit.clickType,
            clickedElement: visit.clickedElement,
          }],
          clicks: visit.clickType ? [{
            type: visit.clickType,
            element: visit.clickedElement,
            url: visit.clickedUrl,
            page: visit.pagePath,
            timestamp: visit.visitedAt,
          }] : [],
          userAgent: visit.userAgent,
          deviceType: visit.deviceType,
          browser: visit.browser,
          country: visit.country,
        });
      }
    }

    const visitors = Array.from(visitorMap.values());

    return NextResponse.json({
      success: true,
      visitors,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching visitors:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch visitors",
      },
      { status: 500 }
    );
  }
}
