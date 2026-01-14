import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Visitor from "@/lib/db/models/Visitor";

// POST: Receive webhook from RB2B
export async function POST(request: NextRequest) {
  // Set timeout for the entire operation
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error("Request timeout")), 4000); // 4 second timeout
  });

  try {
    // Get the raw body first (fast operation)
    const body = await request.json();

    // Process database operation with timeout
    const dbOperation = (async () => {
      // Connect to MongoDB
      await connectDB();

      // Log the FULL raw payload to see what RB2B is actually sending
      console.log("=== RB2B WEBHOOK RAW PAYLOAD ===");
      console.log(JSON.stringify(body, null, 2));
      console.log("=== PAYLOAD KEYS ===");
      console.log("Top level keys:", Object.keys(body));
      console.log("=== END RAW PAYLOAD ===");

      // Extract visitor data from RB2B payload
      // RB2B sends different formats, so we handle multiple structures
      // Try all possible locations for visitor data
      const visitorData = 
        body.person || 
        body.visitor || 
        body.contact || 
        body.data || 
        body.user ||
        body.lead ||
        body.profile ||
        body;
      
      const pageData = body.page || body.visit || body.pageData || body.page_info || {};
      const companyData = body.company || visitorData.company || body.companyData || body.company_info || {};
      const sessionData = body.session || body.sessionData || body.session_info || {};
      const behavioralData = body.behavioral || body.engagement || body.behavioralData || body.engagement_data || {};
      
      // Log extracted data for debugging
      console.log("=== EXTRACTED DATA ===");
      console.log("Visitor data keys:", Object.keys(visitorData));
      console.log("Visitor data sample:", JSON.stringify(visitorData, null, 2).substring(0, 500));
      console.log("Has email:", !!(visitorData.email || visitorData.work_email || visitorData.personal_email || visitorData.email_address));
      console.log("Has name:", !!(visitorData.full_name || visitorData.name || visitorData.fullName || visitorData.first_name || visitorData.firstName));
      console.log("Has company:", !!(companyData.name || visitorData.company || companyData.company_name));
      console.log("=== END EXTRACTED DATA ===");

      // Create normalized visitor object with ALL fields
      const visitorDoc: any = {
        // Person Info
        firstName: visitorData.first_name || visitorData.firstName || visitorData.given_name,
        lastName: visitorData.last_name || visitorData.lastName || visitorData.family_name,
        fullName:
          visitorData.full_name ||
          visitorData.name ||
          visitorData.fullName ||
          visitorData.display_name ||
          visitorData.displayName ||
          (visitorData.first_name && visitorData.last_name
            ? `${visitorData.first_name} ${visitorData.last_name}`
            : visitorData.firstName && visitorData.lastName
            ? `${visitorData.firstName} ${visitorData.lastName}`
            : visitorData.first_name
            ? visitorData.first_name
            : visitorData.firstName
            ? visitorData.firstName
            : undefined),
        email: visitorData.email || visitorData.work_email || visitorData.personal_email || visitorData.workEmail || visitorData.personalEmail || visitorData.email_address || visitorData.emailAddress,
        jobTitle: visitorData.job_title || 
                  visitorData.jobTitle || 
                  visitorData.title || 
                  visitorData.position || 
                  visitorData.role ||
                  visitorData.job_role ||
                  visitorData.jobRole,
        linkedInUrl: visitorData.linkedin_url || visitorData.linkedin || visitorData.social_linkedin || visitorData.linkedInUrl,
        phone: visitorData.phone || visitorData.phone_number || visitorData.phoneNumber || visitorData.mobile,
        twitterUrl: visitorData.twitter_url || visitorData.twitter || visitorData.social_twitter || visitorData.twitterUrl,
        githubUrl: visitorData.github_url || visitorData.github || visitorData.social_github || visitorData.githubUrl,
        bio: visitorData.bio || visitorData.about || visitorData.description,
        profilePicture: visitorData.profile_picture || visitorData.avatar || visitorData.profilePicture || visitorData.photo,
        seniority: visitorData.seniority || visitorData.level || visitorData.seniority_level,
        department: visitorData.department || visitorData.team || visitorData.division,

        // Company Info
        company:
          typeof companyData === "string"
            ? companyData
            : companyData.name || 
              companyData.company_name || 
              companyData.companyName ||
              visitorData.company || 
              visitorData.organization || 
              visitorData.company_name ||
              visitorData.companyName ||
              visitorData.employer,
        companyDomain: companyData.domain || visitorData.company_domain || visitorData.domain || visitorData.companyDomain,
        industry: companyData.industry || visitorData.industry,
        companySize:
          companyData.size ||
          companyData.employees ||
          visitorData.company_size ||
          visitorData.employees ||
          visitorData.companySize,
        companyRevenue: companyData.revenue || visitorData.company_revenue || visitorData.companyRevenue,
        companyWebsite: companyData.website || companyData.url || visitorData.company_website || visitorData.companyWebsite,
        companyLinkedIn: companyData.linkedin || companyData.linkedin_url || visitorData.company_linkedin || visitorData.companyLinkedIn,
        companyTwitter: companyData.twitter || companyData.twitter_url || visitorData.company_twitter || visitorData.companyTwitter,
        companyType: companyData.type || companyData.company_type || visitorData.companyType,
        companyFounded: companyData.founded || companyData.founded_year || visitorData.companyFounded,
        companyDescription: companyData.description || companyData.about || visitorData.companyDescription,
        companyTechnologies: Array.isArray(companyData.technologies)
          ? companyData.technologies
          : companyData.tech_stack
          ? companyData.tech_stack.split(",").map((t: string) => t.trim())
          : visitorData.companyTechnologies
          ? (Array.isArray(visitorData.companyTechnologies) ? visitorData.companyTechnologies : [visitorData.companyTechnologies])
          : undefined,
        companyFunding: companyData.funding || companyData.funding_stage || visitorData.companyFunding,

        // Location
        country: visitorData.country || visitorData.location?.country || companyData.country,
        city: visitorData.city || 
              visitorData.location?.city || 
              visitorData.location_city ||
              companyData.city ||
              companyData.location?.city,
        region:
          visitorData.region ||
          visitorData.state ||
          visitorData.location?.region ||
          visitorData.location?.state ||
          visitorData.location_region ||
          visitorData.location_state ||
          companyData.region ||
          companyData.state,

        // Visit Info
        pageUrl: pageData.url || pageData.page_url || body.url || body.pageUrl,
        pageTitle: pageData.title || pageData.page_title || body.pageTitle,
        referrer: pageData.referrer || body.referrer,
        visitedAt: new Date(body.timestamp || body.created_at || Date.now()),
        sessionId: sessionData.id || sessionData.session_id || body.sessionId || body.session_id,
        visitCount: sessionData.visit_count || sessionData.visits || body.visitCount || 1,
        timeOnSite: sessionData.time_on_site || sessionData.duration || body.timeOnSite || body.sessionDuration,
        deviceType: sessionData.device_type || sessionData.device || body.deviceType || body.device,
        browser: sessionData.browser || body.browser,
        operatingSystem: sessionData.os || sessionData.operating_system || body.operatingSystem || body.os,
        ipAddress: sessionData.ip || body.ip || body.ipAddress,
        utmSource: body.utm_source || body.utmSource || pageData.utm_source,
        utmMedium: body.utm_medium || body.utmMedium || pageData.utm_medium,
        utmCampaign: body.utm_campaign || body.utmCampaign || pageData.utm_campaign,
        formSubmissions: Array.isArray(body.form_submissions)
          ? body.form_submissions
          : body.formSubmissions
          ? (Array.isArray(body.formSubmissions) ? body.formSubmissions : [body.formSubmissions])
          : undefined,

        // Behavioral Data
        engagementScore: behavioralData.score || behavioralData.engagement_score || body.engagementScore,
        intentSignals: Array.isArray(behavioralData.intent_signals)
          ? behavioralData.intent_signals
          : behavioralData.intentSignals
          ? (Array.isArray(behavioralData.intentSignals) ? behavioralData.intentSignals : [behavioralData.intentSignals])
          : body.intentSignals
          ? (Array.isArray(body.intentSignals) ? body.intentSignals : [body.intentSignals])
          : undefined,
        technologiesDetected: Array.isArray(body.technologies)
          ? body.technologies
          : body.technologiesDetected
          ? (Array.isArray(body.technologiesDetected) ? body.technologiesDetected : [body.technologiesDetected])
          : undefined,
        contentInterests: Array.isArray(body.content_interests)
          ? body.content_interests
          : body.contentInterests
          ? (Array.isArray(body.contentInterests) ? body.contentInterests : [body.contentInterests])
          : undefined,

        // Visit History
        firstVisitDate: body.first_visit_date ? new Date(body.first_visit_date) : body.firstVisitDate ? new Date(body.firstVisitDate) : undefined,
        lastVisitDate: body.last_visit_date ? new Date(body.last_visit_date) : body.lastVisitDate ? new Date(body.lastVisitDate) : undefined,
        pagesViewed: Array.isArray(body.pages_viewed)
          ? body.pages_viewed
          : body.pagesViewed
          ? (Array.isArray(body.pagesViewed) ? body.pagesViewed : [body.pagesViewed])
          : pageData.url
          ? [pageData.url]
          : undefined,
      };

      // Log what we're about to save
      console.log("=== VISITOR DOC BEFORE CLEANUP ===");
      console.log("Fields with values:", Object.keys(visitorDoc).filter(k => visitorDoc[k] !== undefined && visitorDoc[k] !== null && visitorDoc[k] !== ""));
      console.log("Sample data:", {
        firstName: visitorDoc.firstName,
        lastName: visitorDoc.lastName,
        fullName: visitorDoc.fullName,
        email: visitorDoc.email,
        company: visitorDoc.company,
        jobTitle: visitorDoc.jobTitle,
      });

      // Remove undefined values to keep database clean
      Object.keys(visitorDoc).forEach((key) => {
        if (visitorDoc[key] === undefined || visitorDoc[key] === null || visitorDoc[key] === "") {
          delete visitorDoc[key];
        }
      });
      
      console.log("=== VISITOR DOC AFTER CLEANUP ===");
      console.log("Fields to save:", Object.keys(visitorDoc));
      console.log("Total fields:", Object.keys(visitorDoc).length);

      // Check if visitor with same email exists
      let visitor;
      if (visitorDoc.email) {
        // Get existing visitor to preserve visit history
        const existingVisitor = await Visitor.findOne({ email: visitorDoc.email });

        if (existingVisitor) {
          // Update visit count
          visitorDoc.visitCount = (existingVisitor.visitCount || 1) + 1;

          // Merge pages viewed
          const existingPages = existingVisitor.pagesViewed || [];
          const newPages = visitorDoc.pagesViewed || [];
          visitorDoc.pagesViewed = [...new Set([...existingPages, ...newPages])];

          // Preserve first visit date
          if (existingVisitor.firstVisitDate) {
            visitorDoc.firstVisitDate = existingVisitor.firstVisitDate;
          } else {
            visitorDoc.firstVisitDate = visitorDoc.visitedAt;
          }

          // Update last visit date
          visitorDoc.lastVisitDate = visitorDoc.visitedAt;
        } else {
          // First visit
          visitorDoc.firstVisitDate = visitorDoc.visitedAt;
          visitorDoc.lastVisitDate = visitorDoc.visitedAt;
          visitorDoc.visitCount = 1;
        }

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
        visitorDoc.firstVisitDate = visitorDoc.visitedAt;
        visitorDoc.lastVisitDate = visitorDoc.visitedAt;
        visitorDoc.visitCount = 1;
        visitor = await Visitor.create(visitorDoc);
      }

      console.log(`RB2B Visitor saved:`, {
        id: visitor._id.toString(),
        email: visitor.email || 'NO EMAIL',
        fullName: visitor.fullName || 'NO NAME',
        firstName: visitor.firstName || 'NO FIRST NAME',
        lastName: visitor.lastName || 'NO LAST NAME',
        company: visitor.company || 'NO COMPANY',
        jobTitle: visitor.jobTitle || 'NO JOB TITLE',
        city: visitor.city || 'NO CITY',
        region: visitor.region || 'NO REGION',
      });

      return {
        success: true,
        message: "Visitor data received and saved to database",
        visitorId: visitor._id.toString(),
      };
    })();

    // Race between DB operation and timeout
    const result = await Promise.race([dbOperation, timeoutPromise]);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("RB2B Webhook Error:", error);

    // Return 200 even on error so RB2B doesn't retry
    // Log the error for debugging
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to process webhook",
        note: "Error logged, but webhook accepted",
      },
      { status: 200 } // Return 200 so RB2B doesn't retry
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
    fieldsSupported: [
      "Person: firstName, lastName, fullName, email, jobTitle, linkedInUrl, phone, twitterUrl, githubUrl, bio, profilePicture, seniority, department",
      "Company: company, companyDomain, industry, companySize, companyRevenue, companyWebsite, companyLinkedIn, companyTwitter, companyType, companyFounded, companyDescription, companyTechnologies, companyFunding",
      "Location: country, city, region",
      "Visit: pageUrl, pageTitle, referrer, visitedAt, sessionId, visitCount, timeOnSite, deviceType, browser, operatingSystem, ipAddress, utmSource, utmMedium, utmCampaign, formSubmissions",
      "Behavioral: engagementScore, intentSignals, technologiesDetected, contentInterests",
      "History: firstVisitDate, lastVisitDate, pagesViewed",
    ],
  });
}
