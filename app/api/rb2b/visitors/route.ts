import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Visitor from "@/lib/db/models/Visitor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isEmptyPayloadError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    !process.env.MONGODB_URI ||
    msg.includes("MONGODB_URI is not defined") ||
    msg.includes("MongoNetworkError") ||
    msg.includes("MongoServerSelectionError") ||
    msg.includes("connection") ||
    msg.includes("ECONNREFUSED") ||
    msg.includes("timed out")
  );
}

// GET: Fetch RB2B visitors from MongoDB
export async function GET(request: NextRequest) {
  if (!process.env.MONGODB_URI) {
    console.log("[RB2B Visitors API] MONGODB_URI not defined, returning empty data");
    const limit = parseInt(new URL(request.url).searchParams.get("limit") || "50", 10);
    const offset = parseInt(new URL(request.url).searchParams.get("offset") || "0", 10);
    return NextResponse.json({
      visitors: [],
      total: 0,
      limit,
      offset,
      hasMore: false,
      error: "MongoDB not configured",
    });
  }

  try {
    // Connect to MongoDB
    await connectDB();

    const { searchParams } = new URL(request.url);
    const visitorId = searchParams.get("id");
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const search = searchParams.get("search") || "";

    // If ID is provided, return that specific visitor
    if (visitorId) {
      const mongoose = require("mongoose");
      if (!mongoose.Types.ObjectId.isValid(visitorId)) {
        return NextResponse.json(
          { error: "Invalid visitor ID format" },
          { status: 400 }
        );
      }

      const visitor = await Visitor.findById(visitorId).lean();
      if (!visitor) {
        return NextResponse.json(
          { error: "Visitor not found" },
          { status: 404 }
        );
      }

      // Transform to match the same format as list endpoint
      const transformedVisitor = {
        id: visitor._id.toString(),
        // Person Info
        firstName: visitor.firstName,
        lastName: visitor.lastName,
        fullName: visitor.fullName,
        email: visitor.email,
        jobTitle: visitor.jobTitle,
        linkedInUrl: visitor.linkedInUrl,
        phone: visitor.phone,
        twitterUrl: visitor.twitterUrl,
        githubUrl: visitor.githubUrl,
        bio: visitor.bio,
        profilePicture: visitor.profilePicture,
        seniority: visitor.seniority,
        department: visitor.department,
        // Company Info
        company: visitor.company,
        companyDomain: visitor.companyDomain,
        industry: visitor.industry,
        companySize: visitor.companySize,
        companyRevenue: visitor.companyRevenue,
        companyWebsite: visitor.companyWebsite,
        companyLinkedIn: visitor.companyLinkedIn,
        companyTwitter: visitor.companyTwitter,
        companyType: visitor.companyType,
        companyFounded: visitor.companyFounded,
        companyDescription: visitor.companyDescription,
        companyTechnologies: visitor.companyTechnologies,
        companyFunding: visitor.companyFunding,
        // Location
        country: visitor.country,
        city: visitor.city,
        region: visitor.region,
        // Visit Info
        pageUrl: visitor.pageUrl,
        pageTitle: visitor.pageTitle,
        referrer: visitor.referrer,
        visitedAt: visitor.visitedAt,
        sessionId: visitor.sessionId,
        visitCount: visitor.visitCount,
        timeOnSite: visitor.timeOnSite,
        deviceType: visitor.deviceType,
        browser: visitor.browser,
        operatingSystem: visitor.operatingSystem,
        ipAddress: visitor.ipAddress,
        utmSource: visitor.utmSource,
        utmMedium: visitor.utmMedium,
        utmCampaign: visitor.utmCampaign,
        formSubmissions: visitor.formSubmissions,
        // Behavioral Data
        engagementScore: visitor.engagementScore,
        intentSignals: visitor.intentSignals,
        technologiesDetected: visitor.technologiesDetected,
        contentInterests: visitor.contentInterests,
        // Visit History
        firstVisitDate: visitor.firstVisitDate,
        lastVisitDate: visitor.lastVisitDate,
        pagesViewed: visitor.pagesViewed,
        isRepeatVisit: visitor.isRepeatVisit,
        // Metadata
        createdAt: visitor.createdAt,
        updatedAt: visitor.updatedAt,
      };

      return NextResponse.json({ visitor: transformedVisitor });
    }

    // Build query
    let query: any = {};

    if (search) {
      const searchRegex = new RegExp(search, "i");
      query = {
        $or: [
          { email: searchRegex },
          { fullName: searchRegex },
          { firstName: searchRegex },
          { lastName: searchRegex },
          { company: searchRegex },
          { jobTitle: searchRegex },
          { phone: searchRegex },
          { companyDomain: searchRegex },
          { industry: searchRegex },
          { department: searchRegex },
        ],
      };
    }

    // Get total count
    const total = await Visitor.countDocuments(query);

    // Get visitors with pagination, sorted by most recent first
    const visitors = await Visitor.find(query)
      .sort({ visitedAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean();

    console.log(`[RB2B Visitors API] Query:`, JSON.stringify(query));
    console.log(`[RB2B Visitors API] Found ${visitors.length} visitors (total: ${total}, limit: ${limit}, offset: ${offset})`);
    if (visitors.length > 0) {
      console.log(`[RB2B Visitors API] Sample visitor:`, {
        id: visitors[0]._id?.toString(),
        email: visitors[0].email,
        fullName: visitors[0].fullName,
        company: visitors[0].company,
        visitedAt: visitors[0].visitedAt,
      });
    }

    // Transform _id to id for frontend compatibility and include ALL fields
    const transformedVisitors = visitors.map((v: any) => ({
      id: v._id.toString(),
      // Person Info
      firstName: v.firstName,
      lastName: v.lastName,
      fullName: v.fullName,
      email: v.email,
      jobTitle: v.jobTitle,
      linkedInUrl: v.linkedInUrl,
      phone: v.phone,
      twitterUrl: v.twitterUrl,
      githubUrl: v.githubUrl,
      bio: v.bio,
      profilePicture: v.profilePicture,
      seniority: v.seniority,
      department: v.department,
      // Company Info
      company: v.company,
      companyDomain: v.companyDomain,
      industry: v.industry,
      companySize: v.companySize,
      companyRevenue: v.companyRevenue,
      companyWebsite: v.companyWebsite,
      companyLinkedIn: v.companyLinkedIn,
      companyTwitter: v.companyTwitter,
      companyType: v.companyType,
      companyFounded: v.companyFounded,
      companyDescription: v.companyDescription,
      companyTechnologies: v.companyTechnologies,
      companyFunding: v.companyFunding,
      // Location
      country: v.country,
      city: v.city,
      region: v.region,
      // Visit Info
      pageUrl: v.pageUrl,
      pageTitle: v.pageTitle,
      referrer: v.referrer,
      visitedAt: v.visitedAt,
      sessionId: v.sessionId,
      visitCount: v.visitCount,
      timeOnSite: v.timeOnSite,
      deviceType: v.deviceType,
      browser: v.browser,
      operatingSystem: v.operatingSystem,
      ipAddress: v.ipAddress,
      utmSource: v.utmSource,
      utmMedium: v.utmMedium,
      utmCampaign: v.utmCampaign,
      formSubmissions: v.formSubmissions,
      // Behavioral Data
      engagementScore: v.engagementScore,
      intentSignals: v.intentSignals,
      technologiesDetected: v.technologiesDetected,
      contentInterests: v.contentInterests,
        // Visit History
        firstVisitDate: v.firstVisitDate,
        lastVisitDate: v.lastVisitDate,
        pagesViewed: v.pagesViewed,
        isRepeatVisit: v.isRepeatVisit,
        // Metadata
        createdAt: v.createdAt,
        updatedAt: v.updatedAt,
      }));

    const response = {
      visitors: transformedVisitors,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    };
    
    console.log(`[RB2B Visitors API] Returning response with ${transformedVisitors.length} visitors`);
    
    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error("Error fetching RB2B visitors:", error);
    if (isEmptyPayloadError(error)) {
      const { searchParams } = new URL(request.url);
      const limit = parseInt(searchParams.get("limit") || "50", 10);
      const offset = parseInt(searchParams.get("offset") || "0", 10);
      return NextResponse.json({
        visitors: [],
        total: 0,
        limit,
        offset,
        hasMore: false,
      });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch visitors" },
      { status: 500 }
    );
  }
}

// DELETE: Clear all visitors (admin only)
export async function DELETE() {
  try {
    const { auth } = await import("@/lib/auth/config");
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { getUserByEmail, getUserById } = await import("@/lib/storage/users");
    const userData = session.user.email 
      ? await getUserByEmail(session.user.email) 
      : await getUserById(session.user.id ?? "");
    const isAdmin = userData?.role === "admin" || session.user?.email === "admin@orion.local" || session.user?.role === "admin";
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    await connectDB();
    await Visitor.deleteMany({});

    return NextResponse.json({
      success: true,
      message: "All visitors cleared",
    });
  } catch (error: any) {
    console.error("Error clearing RB2B visitors:", error);
    return NextResponse.json(
      { error: error.message || "Failed to clear visitors" },
      { status: 500 }
    );
  }
}
