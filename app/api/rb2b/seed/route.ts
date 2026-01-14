import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Visitor from "@/lib/db/models/Visitor";

// Sample visitor data for seeding with ALL fields
const sampleVisitors = [
  {
    firstName: "Sarah",
    lastName: "Chen",
    fullName: "Sarah Chen",
    email: "sarah.chen@techcorp.io",
    jobTitle: "VP of Engineering",
    linkedInUrl: "https://linkedin.com/in/sarahchen",
    phone: "+1-415-555-0123",
    twitterUrl: "https://twitter.com/sarahchen",
    githubUrl: "https://github.com/sarahchen",
    bio: "Engineering leader with 15+ years of experience building scalable products",
    seniority: "VP",
    department: "Engineering",
    company: "TechCorp Solutions",
    companyDomain: "techcorp.io",
    industry: "Technology",
    companySize: "500-1000",
    companyRevenue: "$50M-100M",
    companyWebsite: "https://techcorp.io",
    companyLinkedIn: "https://linkedin.com/company/techcorp",
    companyTwitter: "https://twitter.com/techcorp",
    companyType: "Private",
    companyFounded: 2015,
    companyDescription: "Leading provider of enterprise software solutions",
    companyTechnologies: ["React", "Node.js", "AWS", "MongoDB", "Docker"],
    companyFunding: "Series C",
    country: "United States",
    city: "San Francisco",
    region: "California",
    pageUrl: "https://purewl.com/pricing",
    pageTitle: "Pricing - PureWL",
    referrer: "https://google.com",
    visitedAt: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    sessionId: "sess_abc123",
    visitCount: 3,
    timeOnSite: 1245,
    deviceType: "desktop",
    browser: "Chrome",
    operatingSystem: "macOS",
    ipAddress: "192.168.1.100",
    utmSource: "google",
    utmMedium: "cpc",
    utmCampaign: "enterprise_pricing",
    formSubmissions: ["contact_form", "demo_request"],
    engagementScore: 85,
    intentSignals: ["pricing", "enterprise", "demo"],
    technologiesDetected: ["Google Analytics", "HubSpot", "Salesforce"],
    contentInterests: ["enterprise solutions", "pricing", "security"],
    firstVisitDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
    lastVisitDate: new Date(Date.now() - 1000 * 60 * 30),
    pagesViewed: ["/", "/pricing", "/features", "/enterprise"],
  },
  {
    firstName: "Michael",
    lastName: "Roberts",
    fullName: "Michael Roberts",
    email: "m.roberts@innovateai.com",
    jobTitle: "Chief Technology Officer",
    linkedInUrl: "https://linkedin.com/in/michaelroberts",
    phone: "+44-20-7946-0958",
    twitterUrl: "https://twitter.com/mroberts",
    githubUrl: "https://github.com/mroberts",
    bio: "CTO with expertise in AI and machine learning",
    seniority: "C-Level",
    department: "Technology",
    company: "InnovateAI",
    companyDomain: "innovateai.com",
    industry: "Artificial Intelligence",
    companySize: "200-500",
    companyRevenue: "$20M-50M",
    companyWebsite: "https://innovateai.com",
    companyLinkedIn: "https://linkedin.com/company/innovateai",
    companyTwitter: "https://twitter.com/innovateai",
    companyType: "Private",
    companyFounded: 2018,
    companyDescription: "AI-powered solutions for enterprise automation",
    companyTechnologies: ["Python", "TensorFlow", "Kubernetes", "GCP"],
    companyFunding: "Series B",
    country: "United Kingdom",
    city: "London",
    region: "England",
    pageUrl: "https://purewl.com/features",
    pageTitle: "Features - PureWL",
    referrer: "https://linkedin.com",
    visitedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    sessionId: "sess_def456",
    visitCount: 1,
    timeOnSite: 890,
    deviceType: "desktop",
    browser: "Safari",
    operatingSystem: "macOS",
    ipAddress: "192.168.1.101",
    utmSource: "linkedin",
    utmMedium: "social",
    utmCampaign: "ai_enterprise",
    engagementScore: 72,
    intentSignals: ["features", "integration", "api"],
    technologiesDetected: ["HubSpot", "Slack"],
    contentInterests: ["AI integration", "API documentation"],
    firstVisitDate: new Date(Date.now() - 1000 * 60 * 60 * 2),
    lastVisitDate: new Date(Date.now() - 1000 * 60 * 60 * 2),
    pagesViewed: ["/features", "/integrations"],
  },
  {
    firstName: "Emma",
    lastName: "Schmidt",
    fullName: "Emma Schmidt",
    email: "emma.schmidt@cloudnine.de",
    jobTitle: "Head of Product",
    linkedInUrl: "https://linkedin.com/in/emmaschmidt",
    phone: "+49-30-12345678",
    twitterUrl: "https://twitter.com/emmaschmidt",
    seniority: "Director",
    department: "Product",
    company: "CloudNine GmbH",
    companyDomain: "cloudnine.de",
    industry: "Cloud Computing",
    companySize: "100-200",
    companyRevenue: "$10M-20M",
    companyWebsite: "https://cloudnine.de",
    companyLinkedIn: "https://linkedin.com/company/cloudnine",
    companyType: "Private",
    companyFounded: 2020,
    companyDescription: "Cloud infrastructure solutions",
    companyTechnologies: ["AWS", "Docker", "Kubernetes", "Terraform"],
    companyFunding: "Series A",
    country: "Germany",
    city: "Berlin",
    region: "Berlin",
    pageUrl: "https://purewl.com/enterprise",
    pageTitle: "Enterprise Solutions - PureWL",
    referrer: "https://reddit.com/r/saas",
    visitedAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    sessionId: "sess_ghi789",
    visitCount: 2,
    timeOnSite: 567,
    deviceType: "mobile",
    browser: "Chrome Mobile",
    operatingSystem: "iOS",
    ipAddress: "192.168.1.102",
    utmSource: "reddit",
    utmMedium: "social",
    engagementScore: 65,
    intentSignals: ["enterprise", "security"],
    technologiesDetected: ["Google Analytics"],
    contentInterests: ["enterprise", "security"],
    firstVisitDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    lastVisitDate: new Date(Date.now() - 1000 * 60 * 60 * 5),
    pagesViewed: ["/enterprise", "/security"],
  },
  {
    firstName: "James",
    lastName: "Wilson",
    fullName: "James Wilson",
    email: "jwilson@globalfinance.com",
    jobTitle: "Director of IT",
    linkedInUrl: "https://linkedin.com/in/jameswilson",
    phone: "+1-212-555-0198",
    seniority: "Director",
    department: "IT",
    company: "Global Finance Partners",
    companyDomain: "globalfinance.com",
    industry: "Financial Services",
    companySize: "1000-5000",
    companyRevenue: "$100M-500M",
    companyWebsite: "https://globalfinance.com",
    companyLinkedIn: "https://linkedin.com/company/globalfinance",
    companyType: "Public",
    companyFounded: 2010,
    companyDescription: "Global financial services provider",
    companyTechnologies: ["Java", "Oracle", "AWS", "Salesforce"],
    country: "United States",
    city: "New York",
    region: "New York",
    pageUrl: "https://purewl.com/security",
    pageTitle: "Security & Compliance - PureWL",
    referrer: "https://google.com",
    visitedAt: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
    sessionId: "sess_jkl012",
    visitCount: 1,
    timeOnSite: 432,
    deviceType: "desktop",
    browser: "Edge",
    operatingSystem: "Windows",
    ipAddress: "192.168.1.103",
    utmSource: "google",
    utmMedium: "organic",
    engagementScore: 58,
    intentSignals: ["security", "compliance"],
    technologiesDetected: ["Salesforce", "Microsoft Office"],
    contentInterests: ["security", "compliance", "GDPR"],
    firstVisitDate: new Date(Date.now() - 1000 * 60 * 60 * 8),
    lastVisitDate: new Date(Date.now() - 1000 * 60 * 60 * 8),
    pagesViewed: ["/security", "/compliance"],
  },
  {
    firstName: "Priya",
    lastName: "Patel",
    fullName: "Priya Patel",
    email: "priya@startupxyz.in",
    jobTitle: "Founder & CEO",
    linkedInUrl: "https://linkedin.com/in/priyapatel",
    phone: "+91-80-1234-5678",
    twitterUrl: "https://twitter.com/priyapatel",
    githubUrl: "https://github.com/priyapatel",
    bio: "Serial entrepreneur building the next generation of SaaS products",
    seniority: "C-Level",
    department: "Executive",
    company: "StartupXYZ",
    companyDomain: "startupxyz.in",
    industry: "SaaS",
    companySize: "10-50",
    companyRevenue: "$1M-5M",
    companyWebsite: "https://startupxyz.in",
    companyLinkedIn: "https://linkedin.com/company/startupxyz",
    companyTwitter: "https://twitter.com/startupxyz",
    companyType: "Private",
    companyFounded: 2022,
    companyDescription: "Early-stage SaaS startup",
    companyTechnologies: ["React", "Node.js", "PostgreSQL", "Vercel"],
    companyFunding: "Seed",
    country: "India",
    city: "Bangalore",
    region: "Karnataka",
    pageUrl: "https://purewl.com/pricing",
    pageTitle: "Pricing - PureWL",
    referrer: "https://twitter.com",
    visitedAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
    sessionId: "sess_mno345",
    visitCount: 5,
    timeOnSite: 2100,
    deviceType: "desktop",
    browser: "Chrome",
    operatingSystem: "Linux",
    ipAddress: "192.168.1.104",
    utmSource: "twitter",
    utmMedium: "social",
    utmCampaign: "startup_launch",
    formSubmissions: ["newsletter", "demo_request", "contact"],
    engagementScore: 92,
    intentSignals: ["pricing", "startup", "demo", "trial"],
    technologiesDetected: ["Google Analytics", "Stripe", "Intercom"],
    contentInterests: ["pricing", "startup resources", "API"],
    firstVisitDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
    lastVisitDate: new Date(Date.now() - 1000 * 60 * 60 * 12),
    pagesViewed: ["/", "/pricing", "/features", "/api", "/docs", "/blog"],
  },
];

// POST: Seed database with sample visitors
export async function POST() {
  try {
    await connectDB();

    // Check if we already have visitors
    const existingCount = await Visitor.countDocuments();

    if (existingCount > 0) {
      return NextResponse.json({
        success: true,
        message: `Database already has ${existingCount} visitors. Skipping seed.`,
        existingCount,
      });
    }

    // Insert sample visitors
    const result = await Visitor.insertMany(sampleVisitors);

    return NextResponse.json({
      success: true,
      message: `Seeded ${result.length} sample visitors with all fields`,
      count: result.length,
    });
  } catch (error: any) {
    console.error("Error seeding visitors:", error);
    return NextResponse.json(
      { error: error.message || "Failed to seed visitors" },
      { status: 500 }
    );
  }
}

// GET: Get seed status
export async function GET() {
  try {
    await connectDB();
    const count = await Visitor.countDocuments();

    return NextResponse.json({
      status: "ready",
      visitorCount: count,
      sampleDataAvailable: sampleVisitors.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Database not connected" },
      { status: 500 }
    );
  }
}

// DELETE: Reset and reseed (force reseed)
export async function DELETE() {
  try {
    await connectDB();

    // Delete all existing visitors
    await Visitor.deleteMany({});

    // Insert sample visitors
    const result = await Visitor.insertMany(sampleVisitors);

    return NextResponse.json({
      success: true,
      message: `Reset and seeded ${result.length} sample visitors with all fields`,
      count: result.length,
    });
  } catch (error: any) {
    console.error("Error resetting visitors:", error);
    return NextResponse.json(
      { error: error.message || "Failed to reset visitors" },
      { status: 500 }
    );
  }
}
