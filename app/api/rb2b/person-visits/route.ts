import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import RB2BPersonVisit from "@/lib/db/models/RB2BPersonVisit";

// GET: Fetch RB2B person visits (aggregated visitors)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const identityKey = searchParams.get("identity_key");
    const companyName = searchParams.get("company_name");
    const email = searchParams.get("email");
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");
    const minPageViews = searchParams.get("min_page_views");

    // Build query
    let query: any = {};

    if (identityKey) {
      query.identity_key = identityKey;
    }

    if (companyName) {
      query["visitor_data.company_name"] = new RegExp(companyName, "i");
    }

    if (email) {
      query["visitor_data.business_email"] = email.toLowerCase().trim();
    }

    if (startDate || endDate) {
      query.last_seen = {};
      if (startDate) {
        query.last_seen.$gte = new Date(startDate);
      }
      if (endDate) {
        query.last_seen.$lte = new Date(endDate);
      }
    }

    if (minPageViews) {
      query.page_views = { $gte: parseInt(minPageViews, 10) };
    }

    // Get total count
    const total = await RB2BPersonVisit.countDocuments(query);

    // Get person visits with pagination, sorted by most recent first
    const personVisits = await RB2BPersonVisit.find(query)
      .sort({ last_seen: -1 })
      .skip(offset)
      .limit(limit)
      .lean();

    return NextResponse.json({
      personVisits,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    });
  } catch (error: any) {
    console.error("Error fetching RB2B person visits:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch person visits" },
      { status: 500 }
    );
  }
}

// GET by identity_key: Get specific person visit
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { identity_key } = body;

    if (!identity_key) {
      return NextResponse.json(
        { error: "identity_key is required" },
        { status: 400 }
      );
    }

    const personVisit = await RB2BPersonVisit.findOne({ identity_key }).lean();

    if (!personVisit) {
      return NextResponse.json(
        { error: "Person visit not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ personVisit });
  } catch (error: any) {
    console.error("Error fetching RB2B person visit:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch person visit" },
      { status: 500 }
    );
  }
}
