import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import PageVisit from "@/lib/db/models/PageVisit";

/**
 * Track page visits and clicks
 * POST /api/tracking/page-visit
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      pageUrl,
      pageTitle,
      pagePath,
      clickType,
      clickedElement,
      clickedUrl,
      sessionId,
      visitorId,
      referrer,
      userAgent,
      deviceType,
      browser,
      operatingSystem,
      screenResolution,
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent,
    } = body;

    // Get IP address from request headers
    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      request.headers.get("cf-connecting-ip") ||
      "unknown";

    // Get user agent if not provided
    const finalUserAgent = userAgent || request.headers.get("user-agent") || "";

    // Create page visit record
    const pageVisit = new PageVisit({
      sessionId: sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      visitorId,
      pageUrl,
      pageTitle,
      pagePath,
      clickType,
      clickedElement,
      clickedUrl,
      ipAddress,
      userAgent: finalUserAgent,
      referrer: referrer || request.headers.get("referer") || undefined,
      deviceType,
      browser,
      operatingSystem,
      screenResolution,
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent,
      visitedAt: new Date(),
    });

    await pageVisit.save();

    return NextResponse.json(
      {
        success: true,
        message: "Page visit tracked successfully",
        visitId: pageVisit._id,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error tracking page visit:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to track page visit",
      },
      { status: 500 }
    );
  }
}
