import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import RB2BPersonVisit from "@/lib/db/models/RB2BPersonVisit";

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

// GET: Fetch RB2B person visits (aggregated visitors)
export async function GET(request: NextRequest) {
  if (!process.env.MONGODB_URI) {
    const limit = parseInt(new URL(request.url).searchParams.get("limit") || "50", 10);
    const offset = parseInt(new URL(request.url).searchParams.get("offset") || "0", 10);
    return NextResponse.json({
      personVisits: [],
      total: 0,
      limit,
      offset,
      hasMore: false,
    });
  }

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
  } catch (error: unknown) {
    console.error("Error fetching RB2B person visits:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch person visits";
    
    // If MongoDB is not configured or connection fails, return empty data instead of error
    if (isEmptyPayloadError(error) || !process.env.MONGODB_URI) {
      const { searchParams } = new URL(request.url);
      const limit = parseInt(searchParams.get("limit") || "50", 10);
      const offset = parseInt(searchParams.get("offset") || "0", 10);
      return NextResponse.json({
        personVisits: [],
        total: 0,
        limit,
        offset,
        hasMore: false,
        error: process.env.MONGODB_URI ? undefined : "MongoDB not configured",
      });
    }
    
    // For other errors, return error response
    return NextResponse.json(
      { 
        error: errorMessage,
        personVisits: [],
        total: 0,
      },
      { status: 500 }
    );
  }
}

// GET by identity_key: Get specific person visit
export async function POST(request: NextRequest) {
  if (!process.env.MONGODB_URI) {
    return NextResponse.json(
      { error: "Person visit not found" },
      { status: 404 }
    );
  }
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
  } catch (error: unknown) {
    console.error("Error fetching RB2B person visit:", error);
    if (isEmptyPayloadError(error)) {
      return NextResponse.json(
        { error: "Person visit not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch person visit" },
      { status: 500 }
    );
  }
}
