import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Visitor from "@/lib/db/models/Visitor";

// GET: Fetch RB2B visitors from MongoDB
export async function GET(request: NextRequest) {
  try {
    // Connect to MongoDB
    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const search = searchParams.get("search") || "";

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
      // Metadata
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
    }));

    return NextResponse.json({
      visitors: transformedVisitors,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    });
  } catch (error: any) {
    console.error("Error fetching RB2B visitors:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch visitors" },
      { status: 500 }
    );
  }
}

// DELETE: Clear all visitors (admin only)
export async function DELETE() {
  try {
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
