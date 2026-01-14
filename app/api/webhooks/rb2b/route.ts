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

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.join(process.cwd(), "data");
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Load visitors from storage
async function loadVisitors(): Promise<RB2BVisitor[]> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(VISITORS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Save visitors to storage
async function saveVisitors(visitors: RB2BVisitor[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(VISITORS_FILE, JSON.stringify(visitors, null, 2));
}

// POST: Receive webhook from RB2B
export async function POST(request: NextRequest) {
  try {
    // Get the raw body for signature verification (if needed)
    const body = await request.json();
    
    console.log("RB2B Webhook received:", JSON.stringify(body, null, 2));
    
    // Extract visitor data from RB2B payload
    // RB2B sends different formats, so we handle multiple structures
    const visitorData = body.person || body.visitor || body.contact || body;
    const pageData = body.page || body.visit || {};
    
    // Create normalized visitor object
    const visitor: RB2BVisitor = {
      id: visitorData.id || visitorData.email || `rb2b_${Date.now()}`,
      email: visitorData.email || visitorData.work_email || visitorData.personal_email,
      firstName: visitorData.first_name || visitorData.firstName || visitorData.given_name,
      lastName: visitorData.last_name || visitorData.lastName || visitorData.family_name,
      fullName: visitorData.full_name || visitorData.name || 
                (visitorData.first_name && visitorData.last_name 
                  ? `${visitorData.first_name} ${visitorData.last_name}` 
                  : undefined),
      company: visitorData.company || visitorData.organization || visitorData.company_name,
      companyDomain: visitorData.company_domain || visitorData.domain,
      jobTitle: visitorData.job_title || visitorData.title || visitorData.position,
      linkedInUrl: visitorData.linkedin_url || visitorData.linkedin || visitorData.social_linkedin,
      industry: visitorData.industry,
      companySize: visitorData.company_size || visitorData.employees,
      country: visitorData.country || visitorData.location?.country,
      city: visitorData.city || visitorData.location?.city,
      region: visitorData.region || visitorData.state || visitorData.location?.region,
      pageUrl: pageData.url || pageData.page_url || body.url,
      referrer: pageData.referrer || body.referrer,
      visitedAt: body.timestamp || body.created_at || new Date().toISOString(),
      rawData: body, // Store raw data for debugging
    };
    
    // Load existing visitors
    const visitors = await loadVisitors();
    
    // Check if visitor already exists (by email or id)
    const existingIndex = visitors.findIndex(
      v => (v.email && v.email === visitor.email) || v.id === visitor.id
    );
    
    if (existingIndex >= 0) {
      // Update existing visitor with new visit
      visitors[existingIndex] = {
        ...visitors[existingIndex],
        ...visitor,
        visitedAt: visitor.visitedAt, // Update visit time
      };
    } else {
      // Add new visitor at the beginning
      visitors.unshift(visitor);
    }
    
    // Keep only last 1000 visitors
    const trimmedVisitors = visitors.slice(0, 1000);
    
    // Save updated visitors
    await saveVisitors(trimmedVisitors);
    
    console.log(`RB2B Visitor saved: ${visitor.email || visitor.fullName || visitor.id}`);
    
    return NextResponse.json({
      success: true,
      message: "Visitor data received",
      visitorId: visitor.id,
    });
  } catch (error) {
    console.error("RB2B Webhook Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}

// GET: Return webhook info (for testing)
export async function GET() {
  return NextResponse.json({
    service: "RB2B Webhook",
    status: "active",
    endpoint: "/api/webhooks/rb2b",
    method: "POST",
    description: "Receives visitor identification data from RB2B",
  });
}
