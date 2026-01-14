import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Visitor from "@/lib/db/models/Visitor";

// POST: Receive webhook from RB2B
export async function POST(request: NextRequest) {
  try {
    // Connect to MongoDB
    await connectDB();

    // Get the raw body
    const body = await request.json();

    console.log("RB2B Webhook received:", JSON.stringify(body, null, 2));

    // Extract visitor data from RB2B payload
    // RB2B sends different formats, so we handle multiple structures
    const visitorData = body.person || body.visitor || body.contact || body;
    const pageData = body.page || body.visit || {};
    const companyData = body.company || visitorData.company || {};

    // Create normalized visitor object
    const visitorDoc = {
      // Person Info
      firstName: visitorData.first_name || visitorData.firstName || visitorData.given_name,
      lastName: visitorData.last_name || visitorData.lastName || visitorData.family_name,
      fullName:
        visitorData.full_name ||
        visitorData.name ||
        visitorData.fullName ||
        (visitorData.first_name && visitorData.last_name
          ? `${visitorData.first_name} ${visitorData.last_name}`
          : undefined),
      email: visitorData.email || visitorData.work_email || visitorData.personal_email,
      jobTitle: visitorData.job_title || visitorData.title || visitorData.position || visitorData.jobTitle,
      linkedInUrl: visitorData.linkedin_url || visitorData.linkedin || visitorData.social_linkedin || visitorData.linkedInUrl,

      // Company Info
      company:
        typeof companyData === "string"
          ? companyData
          : companyData.name || visitorData.company || visitorData.organization || visitorData.company_name,
      companyDomain: companyData.domain || visitorData.company_domain || visitorData.domain || visitorData.companyDomain,
      industry: companyData.industry || visitorData.industry,
      companySize:
        companyData.size ||
        companyData.employees ||
        visitorData.company_size ||
        visitorData.employees ||
        visitorData.companySize,
      companyRevenue: companyData.revenue || visitorData.company_revenue || visitorData.companyRevenue,

      // Location
      country: visitorData.country || visitorData.location?.country || companyData.country,
      city: visitorData.city || visitorData.location?.city || companyData.city,
      region:
        visitorData.region ||
        visitorData.state ||
        visitorData.location?.region ||
        visitorData.location?.state ||
        companyData.region,

      // Visit Info
      pageUrl: pageData.url || pageData.page_url || body.url || body.pageUrl,
      pageTitle: pageData.title || pageData.page_title || body.pageTitle,
      referrer: pageData.referrer || body.referrer,
      visitedAt: new Date(body.timestamp || body.created_at || Date.now()),
    };

    // Check if visitor with same email exists
    let visitor;
    if (visitorDoc.email) {
      // Update existing visitor or create new one
      visitor = await Visitor.findOneAndUpdate(
        { email: visitorDoc.email },
        {
          $set: visitorDoc,
          $setOnInsert: { createdAt: new Date() },
        },
        { upsert: true, new: true }
      );
    } else {
      // Create new visitor without email
      visitor = await Visitor.create(visitorDoc);
    }

    console.log(`RB2B Visitor saved: ${visitor.email || visitor.fullName || visitor._id}`);

    return NextResponse.json({
      success: true,
      message: "Visitor data received and saved to database",
      visitorId: visitor._id.toString(),
    });
  } catch (error: any) {
    console.error("RB2B Webhook Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process webhook" },
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
    description: "Receives visitor identification data from RB2B and stores in MongoDB",
    database: "MongoDB Atlas",
  });
}
