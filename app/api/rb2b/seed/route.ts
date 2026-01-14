import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Visitor from "@/lib/db/models/Visitor";

// Sample visitor data for seeding
const sampleVisitors = [
  {
    firstName: "Sarah",
    lastName: "Chen",
    fullName: "Sarah Chen",
    email: "sarah.chen@techcorp.io",
    jobTitle: "VP of Engineering",
    linkedInUrl: "https://linkedin.com/in/sarahchen",
    company: "TechCorp Solutions",
    companyDomain: "techcorp.io",
    industry: "Technology",
    companySize: "500-1000",
    companyRevenue: "$50M-100M",
    country: "United States",
    city: "San Francisco",
    region: "California",
    pageUrl: "https://purewl.com/pricing",
    pageTitle: "Pricing - PureWL",
    referrer: "https://google.com",
    visitedAt: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
  },
  {
    firstName: "Michael",
    lastName: "Roberts",
    fullName: "Michael Roberts",
    email: "m.roberts@innovateai.com",
    jobTitle: "Chief Technology Officer",
    linkedInUrl: "https://linkedin.com/in/michaelroberts",
    company: "InnovateAI",
    companyDomain: "innovateai.com",
    industry: "Artificial Intelligence",
    companySize: "200-500",
    companyRevenue: "$20M-50M",
    country: "United Kingdom",
    city: "London",
    region: "England",
    pageUrl: "https://purewl.com/features",
    pageTitle: "Features - PureWL",
    referrer: "https://linkedin.com",
    visitedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    firstName: "Emma",
    lastName: "Schmidt",
    fullName: "Emma Schmidt",
    email: "emma.schmidt@cloudnine.de",
    jobTitle: "Head of Product",
    linkedInUrl: "https://linkedin.com/in/emmaschmidt",
    company: "CloudNine GmbH",
    companyDomain: "cloudnine.de",
    industry: "Cloud Computing",
    companySize: "100-200",
    companyRevenue: "$10M-20M",
    country: "Germany",
    city: "Berlin",
    region: "Berlin",
    pageUrl: "https://purewl.com/enterprise",
    pageTitle: "Enterprise Solutions - PureWL",
    referrer: "https://reddit.com/r/saas",
    visitedAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
  },
  {
    firstName: "James",
    lastName: "Wilson",
    fullName: "James Wilson",
    email: "jwilson@globalfinance.com",
    jobTitle: "Director of IT",
    linkedInUrl: "https://linkedin.com/in/jameswilson",
    company: "Global Finance Partners",
    companyDomain: "globalfinance.com",
    industry: "Financial Services",
    companySize: "1000-5000",
    companyRevenue: "$100M-500M",
    country: "United States",
    city: "New York",
    region: "New York",
    pageUrl: "https://purewl.com/security",
    pageTitle: "Security & Compliance - PureWL",
    referrer: "https://google.com",
    visitedAt: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
  },
  {
    firstName: "Priya",
    lastName: "Patel",
    fullName: "Priya Patel",
    email: "priya@startupxyz.in",
    jobTitle: "Founder & CEO",
    linkedInUrl: "https://linkedin.com/in/priyapatel",
    company: "StartupXYZ",
    companyDomain: "startupxyz.in",
    industry: "SaaS",
    companySize: "10-50",
    companyRevenue: "$1M-5M",
    country: "India",
    city: "Bangalore",
    region: "Karnataka",
    pageUrl: "https://purewl.com/pricing",
    pageTitle: "Pricing - PureWL",
    referrer: "https://twitter.com",
    visitedAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
  },
  {
    firstName: "David",
    lastName: "Lee",
    fullName: "David Lee",
    email: "david.lee@nexgen.co",
    jobTitle: "Solutions Architect",
    linkedInUrl: "https://linkedin.com/in/davidlee",
    company: "NexGen Technologies",
    companyDomain: "nexgen.co",
    industry: "Information Technology",
    companySize: "200-500",
    companyRevenue: "$25M-50M",
    country: "Australia",
    city: "Sydney",
    region: "New South Wales",
    pageUrl: "https://purewl.com/integrations",
    pageTitle: "Integrations - PureWL",
    referrer: "https://producthunt.com",
    visitedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
  },
  {
    firstName: "Sophie",
    lastName: "Martin",
    fullName: "Sophie Martin",
    email: "sophie.martin@euroscale.fr",
    jobTitle: "Growth Manager",
    linkedInUrl: "https://linkedin.com/in/sophiemartin",
    company: "EuroScale",
    companyDomain: "euroscale.fr",
    industry: "E-commerce",
    companySize: "50-100",
    companyRevenue: "$5M-10M",
    country: "France",
    city: "Paris",
    region: "Île-de-France",
    pageUrl: "https://purewl.com/case-studies",
    pageTitle: "Case Studies - PureWL",
    referrer: "https://linkedin.com",
    visitedAt: new Date(Date.now() - 1000 * 60 * 60 * 36), // 1.5 days ago
  },
  {
    firstName: "Carlos",
    lastName: "Rodriguez",
    fullName: "Carlos Rodriguez",
    email: "carlos@latamtech.mx",
    jobTitle: "Engineering Lead",
    linkedInUrl: "https://linkedin.com/in/carlosrodriguez",
    company: "LatAm Tech Hub",
    companyDomain: "latamtech.mx",
    industry: "Technology",
    companySize: "100-200",
    companyRevenue: "$10M-20M",
    country: "Mexico",
    city: "Mexico City",
    region: "CDMX",
    pageUrl: "https://purewl.com/docs",
    pageTitle: "Documentation - PureWL",
    referrer: "https://google.com",
    visitedAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
  },
  {
    firstName: "Anna",
    lastName: "Kowalski",
    fullName: "Anna Kowalski",
    email: "anna.k@nordicsoft.se",
    jobTitle: "Product Manager",
    linkedInUrl: "https://linkedin.com/in/annakowalski",
    company: "Nordic Software",
    companyDomain: "nordicsoft.se",
    industry: "Software Development",
    companySize: "50-100",
    companyRevenue: "$5M-10M",
    country: "Sweden",
    city: "Stockholm",
    region: "Stockholm",
    pageUrl: "https://purewl.com/api",
    pageTitle: "API Reference - PureWL",
    referrer: "https://bing.com",
    visitedAt: new Date(Date.now() - 1000 * 60 * 60 * 72), // 3 days ago
  },
  {
    firstName: "Tom",
    lastName: "Anderson",
    fullName: "Tom Anderson",
    email: "tanderson@pacificventures.sg",
    jobTitle: "Investment Director",
    linkedInUrl: "https://linkedin.com/in/tomanderson",
    company: "Pacific Ventures",
    companyDomain: "pacificventures.sg",
    industry: "Venture Capital",
    companySize: "20-50",
    companyRevenue: "$50M-100M AUM",
    country: "Singapore",
    city: "Singapore",
    region: "Central",
    pageUrl: "https://purewl.com/about",
    pageTitle: "About Us - PureWL",
    referrer: "https://crunchbase.com",
    visitedAt: new Date(Date.now() - 1000 * 60 * 60 * 96), // 4 days ago
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
      message: `Seeded ${result.length} sample visitors`,
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
      message: `Reset and seeded ${result.length} sample visitors`,
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
