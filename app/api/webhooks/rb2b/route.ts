import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Visitor from "@/lib/db/models/Visitor";
import RB2BPageVisit from "@/lib/db/models/RB2BPageVisit";
import RB2BPersonVisit from "@/lib/db/models/RB2BPersonVisit";
import { enrichVisitorFromIP, enrichVisitorFromEmail } from "@/lib/rb2b/client";
import crypto from "crypto";

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
      // RB2B sends data in a flat structure with specific field names
      // Handle both RB2B format and other possible formats
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

      // RB2B specific field mappings (RB2B sends flat structure with capitalized field names)
      const rb2bLinkedInUrl = body["LinkedIn URL"] || body.linkedInUrl || body.linkedin_url;
      const rb2bFirstName = body["First Name"] || body.firstName || body.first_name;
      const rb2bLastName = body["Last Name"] || body.lastName || body.last_name;
      const rb2bTitle = body["Title"] || body.title || body.jobTitle || body.job_title;
      const rb2bCompanyName = body["Company Name"] || body.companyName || body.company_name;
      const rb2bBusinessEmail = body["Business Email"] || body.businessEmail || body.business_email;
      const rb2bWebsite = body["Website"] || body.website;
      const rb2bIndustry = body["Industry"] || body.industry;
      const rb2bEmployeeCount = body["Employee Count"] || body.employeeCount || body.employee_count;
      const rb2bEstimateRevenue = body["Estimate Revenue"] || body.estimateRevenue || body.estimate_revenue;
      const rb2bCity = body["City"] || body.city;
      const rb2bState = body["State"] || body.state;
      const rb2bZipcode = body["Zipcode"] || body.zipcode;
      const rb2bSeenAt = body["Seen At"] || body.seenAt || body.seen_at;
      const rb2bReferrer = body["Referrer"] || body.referrer;
      const rb2bCapturedUrl = body["Captured URL"] || body.capturedUrl || body.captured_url;
      const rb2bTags = body["Tags"] || body.tags;
      const rb2bIsRepeatVisit = body["is_repeat_visit"] || body.isRepeatVisit || body.is_repeat_visit;
      
      // Log extracted data for debugging
      console.log("=== EXTRACTED DATA ===");
      console.log("Visitor data keys:", Object.keys(visitorData));
      console.log("RB2B Fields detected:", {
        linkedInUrl: !!rb2bLinkedInUrl,
        firstName: !!rb2bFirstName,
        lastName: !!rb2bLastName,
        title: !!rb2bTitle,
        companyName: !!rb2bCompanyName,
        businessEmail: !!rb2bBusinessEmail,
        website: !!rb2bWebsite,
        industry: !!rb2bIndustry,
        employeeCount: !!rb2bEmployeeCount,
        estimateRevenue: !!rb2bEstimateRevenue,
        city: !!rb2bCity,
        state: !!rb2bState,
        zipcode: !!rb2bZipcode,
        seenAt: !!rb2bSeenAt,
        referrer: !!rb2bReferrer,
        capturedUrl: !!rb2bCapturedUrl,
        tags: !!rb2bTags,
        isRepeatVisit: !!rb2bIsRepeatVisit,
      });
      console.log("Visitor type:", rb2bFirstName || rb2bLastName || rb2bBusinessEmail ? "Person-level" : "Company-level");
      console.log("Is repeat visit:", rb2bIsRepeatVisit || false);
      console.log("=== END EXTRACTED DATA ===");

      // Extract IP and User Agent for RB2B API enrichment
      // Try to get IP from request headers (X-Forwarded-For, X-Real-IP, or direct connection)
      const forwardedFor = request.headers.get("x-forwarded-for");
      const realIp = request.headers.get("x-real-ip");
      const ipAddress = 
        sessionData.ip || 
        body.ip || 
        body.ipAddress || 
        visitorData.ip ||
        (forwardedFor ? forwardedFor.split(',')[0].trim() : null) ||
        realIp;
      const userAgent = 
        sessionData.user_agent || 
        sessionData.userAgent || 
        body.user_agent || 
        body.userAgent || 
        request.headers.get("user-agent");

      // Enrich visitor data using RB2B API
      let enrichedData: any = {};
      if (ipAddress && process.env.RB2B_API_KEY) {
        try {
          console.log("=== RB2B API ENRICHMENT START ===");
          console.log("IP Address:", ipAddress);
          console.log("User Agent:", userAgent);

          // Enrich from IP + User Agent
          const ipEnrichment = await enrichVisitorFromIP(ipAddress, userAgent || undefined);
          if (ipEnrichment.linkedInProfile) {
            enrichedData = {
              ...enrichedData,
              // Merge LinkedIn profile data
              firstName: enrichedData.firstName || ipEnrichment.linkedInProfile.first_name,
              lastName: enrichedData.lastName || ipEnrichment.linkedInProfile.last_name,
              fullName: enrichedData.fullName || ipEnrichment.linkedInProfile.full_name,
              linkedInUrl: enrichedData.linkedInUrl || ipEnrichment.linkedInProfile.linkedin_person_url,
              jobTitle: enrichedData.jobTitle || ipEnrichment.linkedInProfile.job_title || ipEnrichment.linkedInProfile.title,
              seniority: enrichedData.seniority || ipEnrichment.linkedInProfile.seniority,
              email: enrichedData.email || ipEnrichment.linkedInProfile.work_email || ipEnrichment.linkedInProfile.personal_email,
              company: enrichedData.company || ipEnrichment.linkedInProfile.company_domain,
              companyDomain: enrichedData.companyDomain || ipEnrichment.linkedInProfile.company_domain || ipEnrichment.companyDomain,
              industry: enrichedData.industry || ipEnrichment.linkedInProfile.industry,
            };
          }
          if (ipEnrichment.companyDomain && !enrichedData.companyDomain) {
            enrichedData.companyDomain = ipEnrichment.companyDomain;
          }

          console.log("IP Enrichment Result:", JSON.stringify(ipEnrichment, null, 2));
          console.log("=== RB2B API ENRICHMENT END ===");
        } catch (apiError: any) {
          console.error("RB2B API Enrichment Error:", apiError.message);
          // Continue without enrichment if API fails
        }
      }

      // If we have email but no LinkedIn profile, try enriching from email
      const extractedEmail = visitorData.email || visitorData.work_email || visitorData.personal_email || visitorData.email_address || enrichedData.email;
      if (extractedEmail && !enrichedData.linkedInUrl && process.env.RB2B_API_KEY) {
        try {
          console.log("=== RB2B EMAIL ENRICHMENT START ===");
          console.log("Email:", extractedEmail);
          const emailEnrichment = await enrichVisitorFromEmail(extractedEmail);
          if (emailEnrichment.linkedInProfile) {
            enrichedData = {
              ...enrichedData,
              linkedInUrl: enrichedData.linkedInUrl || emailEnrichment.linkedInUrl,
              firstName: enrichedData.firstName || emailEnrichment.linkedInProfile.first_name,
              lastName: enrichedData.lastName || emailEnrichment.linkedInProfile.last_name,
              fullName: enrichedData.fullName || emailEnrichment.linkedInProfile.full_name,
              jobTitle: enrichedData.jobTitle || emailEnrichment.linkedInProfile.job_title || emailEnrichment.linkedInProfile.title,
              seniority: enrichedData.seniority || emailEnrichment.linkedInProfile.seniority,
              company: enrichedData.company || emailEnrichment.linkedInProfile.company_domain,
              companyDomain: enrichedData.companyDomain || emailEnrichment.linkedInProfile.company_domain,
              industry: enrichedData.industry || emailEnrichment.linkedInProfile.industry,
            };
          }
          console.log("Email Enrichment Result:", JSON.stringify(emailEnrichment, null, 2));
          console.log("=== RB2B EMAIL ENRICHMENT END ===");
        } catch (apiError: any) {
          console.error("RB2B Email Enrichment Error:", apiError.message);
          // Continue without enrichment if API fails
        }
      }

      // Create normalized visitor object with ALL fields
      // Priority: RB2B specific fields > Enriched data > Generic visitor data
      const visitorDoc: any = {
        // Person Info
        firstName: rb2bFirstName || enrichedData.firstName || visitorData.first_name || visitorData.firstName || visitorData.given_name,
        lastName: rb2bLastName || enrichedData.lastName || visitorData.last_name || visitorData.lastName || visitorData.family_name,
        fullName:
          (rb2bFirstName && rb2bLastName ? `${rb2bFirstName} ${rb2bLastName}` : undefined) ||
          enrichedData.fullName ||
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
        email: rb2bBusinessEmail || enrichedData.email || visitorData.email || visitorData.work_email || visitorData.personal_email || visitorData.workEmail || visitorData.personalEmail || visitorData.email_address || visitorData.emailAddress,
        jobTitle: rb2bTitle || enrichedData.jobTitle ||
                  visitorData.job_title || 
                  visitorData.jobTitle || 
                  visitorData.title || 
                  visitorData.position || 
                  visitorData.role ||
                  visitorData.job_role ||
                  visitorData.jobRole,
        linkedInUrl: rb2bLinkedInUrl || enrichedData.linkedInUrl || visitorData.linkedin_url || visitorData.linkedin || visitorData.social_linkedin || visitorData.linkedInUrl,
        phone: visitorData.phone || visitorData.phone_number || visitorData.phoneNumber || visitorData.mobile,
        twitterUrl: visitorData.twitter_url || visitorData.twitter || visitorData.social_twitter || visitorData.twitterUrl,
        githubUrl: visitorData.github_url || visitorData.github || visitorData.social_github || visitorData.githubUrl,
        bio: visitorData.bio || visitorData.about || visitorData.description,
        profilePicture: visitorData.profile_picture || visitorData.avatar || visitorData.profilePicture || visitorData.photo,
        seniority: enrichedData.seniority || visitorData.seniority || visitorData.level || visitorData.seniority_level,
        department: visitorData.department || visitorData.team || visitorData.division,

        // Company Info
        company:
          rb2bCompanyName ||
          enrichedData.company ||
          (typeof companyData === "string"
            ? companyData
            : companyData.name || 
              companyData.company_name || 
              companyData.companyName ||
              visitorData.company || 
              visitorData.organization || 
              visitorData.company_name ||
              visitorData.companyName ||
              visitorData.employer),
        companyDomain: enrichedData.companyDomain || companyData.domain || visitorData.company_domain || visitorData.domain || visitorData.companyDomain,
        industry: rb2bIndustry || enrichedData.industry || companyData.industry || visitorData.industry,
        companySize:
          rb2bEmployeeCount ||
          companyData.size ||
          companyData.employees ||
          visitorData.company_size ||
          visitorData.employees ||
          visitorData.companySize,
        companyRevenue: rb2bEstimateRevenue || companyData.revenue || visitorData.company_revenue || visitorData.companyRevenue,
        companyWebsite: rb2bWebsite || companyData.website || companyData.url || visitorData.company_website || visitorData.companyWebsite,
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
        city: rb2bCity || visitorData.city || 
              visitorData.location?.city || 
              visitorData.location_city ||
              companyData.city ||
              companyData.location?.city,
        region:
          rb2bState ||
          visitorData.region ||
          visitorData.state ||
          visitorData.location?.region ||
          visitorData.location?.state ||
          visitorData.location_region ||
          visitorData.location_state ||
          companyData.region ||
          companyData.state,

        // Visit Info
        pageUrl: rb2bCapturedUrl || pageData.url || pageData.page_url || body.url || body.pageUrl,
        pageTitle: pageData.title || pageData.page_title || body.pageTitle,
        referrer: rb2bReferrer || pageData.referrer || body.referrer,
        visitedAt: new Date(rb2bSeenAt || body.timestamp || body.created_at || body["Seen At"] || Date.now()),
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
        intentSignals: rb2bTags 
          ? (Array.isArray(rb2bTags) ? rb2bTags : typeof rb2bTags === 'string' ? rb2bTags.split(',').map((t: string) => t.trim()) : [rb2bTags])
          : Array.isArray(behavioralData.intent_signals)
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
        isRepeatVisit: rb2bIsRepeatVisit !== undefined ? rb2bIsRepeatVisit : undefined, // RB2B: repeat visitor flag
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

      // Generate identity_key for RB2B collections
      // Priority: email > company+city+state > linkedin_url > hash of available data
      let identity_key: string;
      if (rb2bBusinessEmail) {
        identity_key = `email:${rb2bBusinessEmail.toLowerCase().trim()}`;
      } else if (rb2bCompanyName && rb2bCity && rb2bState) {
        identity_key = `company:${rb2bCompanyName.toLowerCase().trim()}:${rb2bCity.toLowerCase().trim()}:${rb2bState.toLowerCase().trim()}`;
      } else if (rb2bLinkedInUrl) {
        identity_key = `linkedin:${rb2bLinkedInUrl}`;
      } else {
        // Fallback: hash available data
        const hashData = `${rb2bCompanyName || ''}:${rb2bCity || ''}:${rb2bState || ''}:${rb2bCapturedUrl || ''}`;
        identity_key = `hash:${crypto.createHash('md5').update(hashData).digest('hex')}`;
      }

      console.log("=== RB2B IDENTITY KEY ===");
      console.log("Identity Key:", identity_key);

      // Parse seen_at date
      const seenAtDate = rb2bSeenAt ? new Date(rb2bSeenAt) : new Date();

      // 1. Save raw page visit event to rb2b_page_visits
      const pageVisitDoc = {
        identity_key,
        seen_at: seenAtDate,
        captured_url: rb2bCapturedUrl || visitorDoc.pageUrl || '',
        referrer: rb2bReferrer || visitorDoc.referrer,
        tags: rb2bTags || undefined,
        first_name: rb2bFirstName || undefined,
        last_name: rb2bLastName || undefined,
        title: rb2bTitle || undefined,
        company_name: rb2bCompanyName || undefined,
        business_email: rb2bBusinessEmail || undefined,
        website: rb2bWebsite || undefined,
        industry: rb2bIndustry || undefined,
        employee_count: rb2bEmployeeCount || undefined,
        estimate_revenue: rb2bEstimateRevenue || undefined,
        city: rb2bCity || '',
        state: rb2bState || '',
        zipcode: rb2bZipcode || undefined,
        linkedin_url: rb2bLinkedInUrl || undefined,
        is_repeat_visit: rb2bIsRepeatVisit !== undefined ? rb2bIsRepeatVisit : undefined,
      };

      // Remove undefined values
      Object.keys(pageVisitDoc).forEach((key) => {
        if (pageVisitDoc[key as keyof typeof pageVisitDoc] === undefined) {
          delete pageVisitDoc[key as keyof typeof pageVisitDoc];
        }
      });

      const pageVisit = await RB2BPageVisit.create(pageVisitDoc);
      console.log(`✅ RB2B Page Visit saved: ${pageVisit._id.toString()}`);

      // 2. Aggregate visitor data in rb2b_person_visits
      const visitorDataDoc = {
        first_name: rb2bFirstName || undefined,
        last_name: rb2bLastName || undefined,
        title: rb2bTitle || undefined,
        company_name: rb2bCompanyName || undefined,
        business_email: rb2bBusinessEmail || undefined,
        website: rb2bWebsite || undefined,
        industry: rb2bIndustry || undefined,
        employee_count: rb2bEmployeeCount || undefined,
        estimate_revenue: rb2bEstimateRevenue || undefined,
        city: rb2bCity || undefined,
        state: rb2bState || undefined,
        zipcode: rb2bZipcode || undefined,
        linkedin_url: rb2bLinkedInUrl || undefined,
      };

      // Remove undefined values
      Object.keys(visitorDataDoc).forEach((key) => {
        if (visitorDataDoc[key as keyof typeof visitorDataDoc] === undefined) {
          delete visitorDataDoc[key as keyof typeof visitorDataDoc];
        }
      });

      // Get current date (day only, no time) for unique_days tracking
      const currentDay = new Date(seenAtDate);
      currentDay.setHours(0, 0, 0, 0);

      // Use findOneAndUpdate with upsert for aggregation
      const personVisit = await RB2BPersonVisit.findOneAndUpdate(
        { identity_key },
        {
          $set: {
            last_seen: seenAtDate,
            last_page: rb2bCapturedUrl || visitorDoc.pageUrl || '',
            visitor_data: visitorDataDoc,
          },
          $setOnInsert: {
            first_seen: seenAtDate,
            page_views: 0,
            all_pages: [],
            unique_days: [],
            unique_days_count: 0,
          },
          $inc: { page_views: 1 },
          $addToSet: {
            all_pages: rb2bCapturedUrl || visitorDoc.pageUrl || '',
            unique_days: currentDay,
          },
        },
        {
          upsert: true,
          new: true,
        }
      );

      // Update unique_days_count
      if (personVisit.unique_days) {
        personVisit.unique_days_count = personVisit.unique_days.length;
        await personVisit.save();
      }

      console.log(`✅ RB2B Person Visit aggregated: ${personVisit._id.toString()}`);
      console.log(`   Page views: ${personVisit.page_views}, Unique days: ${personVisit.unique_days_count}`);

      // Check if visitor with same email exists
      // For company-only profiles (no email), use company + city + state as identifier
      let visitor;
      if (visitorDoc.email) {
        // Person-level visitor: match by email
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
          
          // If RB2B says it's a repeat visit, mark it
          if (rb2bIsRepeatVisit !== undefined) {
            visitorDoc.isRepeatVisit = rb2bIsRepeatVisit;
          }
        } else {
          // First visit
          visitorDoc.firstVisitDate = visitorDoc.visitedAt;
          visitorDoc.lastVisitDate = visitorDoc.visitedAt;
          visitorDoc.visitCount = 1;
          visitorDoc.isRepeatVisit = rb2bIsRepeatVisit || false;
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
        // Company-level visitor (no email): create new visitor
        // Note: For company-only profiles, we create a new entry each time
        // You may want to match by company + city + state if you want to track repeat company visits
        visitorDoc.firstVisitDate = visitorDoc.visitedAt;
        visitorDoc.lastVisitDate = visitorDoc.visitedAt;
        visitorDoc.visitCount = 1;
        visitorDoc.isRepeatVisit = rb2bIsRepeatVisit || false;
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
        identity_key: identity_key,
        pageVisitId: pageVisit._id.toString(),
        personVisitId: personVisit._id.toString(),
        pageViews: personVisit.page_views,
        uniqueDays: personVisit.unique_days_count,
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
