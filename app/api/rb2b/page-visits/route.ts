import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import RB2BPageVisit from "@/lib/db/models/RB2BPageVisit";

// GET: Fetch RB2B page visits (raw events)
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

    // Build query
    let query: any = {};

    if (identityKey) {
      query.identity_key = identityKey;
    }

    if (companyName) {
      query.company_name = new RegExp(companyName, "i");
    }

    if (email) {
      query.business_email = email.toLowerCase().trim();
    }

    if (startDate || endDate) {
      query.seen_at = {};
      if (startDate) {
        query.seen_at.$gte = new Date(startDate);
      }
      if (endDate) {
        query.seen_at.$lte = new Date(endDate);
      }
    }

    // Get total count
    const total = await RB2BPageVisit.countDocuments(query);

    // Get page visits with pagination, sorted by most recent first
    const pageVisits = await RB2BPageVisit.find(query)
      .sort({ seen_at: -1 })
      .skip(offset)
      .limit(limit)
      .lean();

    return NextResponse.json({
      pageVisits,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    });
  } catch (error: any) {
    console.error("Error fetching RB2B page visits:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch page visits" },
      { status: 500 }
    );
  }
}
