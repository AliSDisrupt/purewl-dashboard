import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// RB2B Visitor Interface
interface RB2BVisitor {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  company?: string;
  companyDomain?: string;
  jobTitle?: string;
  linkedInUrl?: string;
  industry?: string;
  companySize?: string;
  country?: string;
  city?: string;
  region?: string;
  pageUrl?: string;
  referrer?: string;
  visitedAt: string;
  rawData?: any;
}

// Storage file path
const VISITORS_FILE = path.join(process.cwd(), "data", "rb2b-visitors.json");

// Load visitors from storage
async function loadVisitors(): Promise<RB2BVisitor[]> {
  try {
    const data = await fs.readFile(VISITORS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// GET: Fetch RB2B visitors
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const search = searchParams.get("search") || "";
    
    let visitors = await loadVisitors();
    
    // Filter by search term if provided
    if (search) {
      const searchLower = search.toLowerCase();
      visitors = visitors.filter(v => 
        v.email?.toLowerCase().includes(searchLower) ||
        v.fullName?.toLowerCase().includes(searchLower) ||
        v.company?.toLowerCase().includes(searchLower) ||
        v.jobTitle?.toLowerCase().includes(searchLower)
      );
    }
    
    // Get total count before pagination
    const total = visitors.length;
    
    // Apply pagination
    const paginatedVisitors = visitors.slice(offset, offset + limit);
    
    // Remove rawData from response to reduce payload size
    const cleanVisitors = paginatedVisitors.map(({ rawData, ...rest }) => rest);
    
    return NextResponse.json({
      visitors: cleanVisitors,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    });
  } catch (error) {
    console.error("Error fetching RB2B visitors:", error);
    return NextResponse.json(
      { error: "Failed to fetch visitors" },
      { status: 500 }
    );
  }
}

// DELETE: Clear all visitors (admin only)
export async function DELETE() {
  try {
    const dataDir = path.join(process.cwd(), "data");
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
    }
    
    await fs.writeFile(VISITORS_FILE, JSON.stringify([], null, 2));
    
    return NextResponse.json({
      success: true,
      message: "All visitors cleared",
    });
  } catch (error) {
    console.error("Error clearing RB2B visitors:", error);
    return NextResponse.json(
      { error: "Failed to clear visitors" },
      { status: 500 }
    );
  }
}
