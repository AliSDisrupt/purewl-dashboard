import { NextResponse } from "next/server";
import { fetchHubSpotDeals } from "@/lib/mcp/hubspot";

const API_BASE = process.env.HUBSPOT_API_BASE || "https://api.hubapi.com";
const ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;

function getHeaders() {
  return {
    Authorization: `Bearer ${ACCESS_TOKEN}`,
    "Content-Type": "application/json",
  };
}

// In-memory store for alerts (in production, use a database like Supabase/Postgres)
// This will reset on server restart, but works for demo purposes
// Export for use in notify endpoint
export const alertsStore: Array<{
  id: string;
  timestamp: string;
  visitorName: string;
  visitorEmail: string;
  linkedinUrl?: string;
  companyName: string;
  companyDomain?: string;
  pageUrl: string;
  dealId: string;
  dealName: string;
  dealStage: string;
  dealValue: number;
  dealOwner?: string;
  notified: boolean;
}> = [];

// High-intent page patterns
const HIGH_INTENT_PATTERNS = [
  "/pricing",
  "/docs",
  "/api",
  "/features",
  "/contact",
  "/demo",
  "/trial",
  "/signup",
];

function isHighIntentPage(url: string): boolean {
  const lowerUrl = url.toLowerCase();
  return HIGH_INTENT_PATTERNS.some((pattern) => lowerUrl.includes(pattern));
}

async function findOpenDealsForContact(
  email: string,
  companyDomain?: string
): Promise<Array<{
  id: string;
  name: string;
  stage: string;
  amount: number;
  owner?: string;
}>> {
  if (!ACCESS_TOKEN) {
    throw new Error("HUBSPOT_ACCESS_TOKEN not configured");
  }

  try {
    // First, find contacts by email
    const contactsUrl = `${API_BASE}/crm/v3/objects/contacts/search`;
    const contactsResponse = await fetch(contactsUrl, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        filterGroups: [
          {
            filters: [
              {
                propertyName: "email",
                operator: "EQ",
                value: email,
              },
            ],
          },
        ],
        properties: ["email", "firstname", "lastname", "company"],
        limit: 1,
      }),
    });

    if (!contactsResponse.ok) {
      console.error("Failed to search contacts:", await contactsResponse.text());
      return [];
    }

    const contactsData = await contactsResponse.json();
    const contacts = contactsData.results || [];

    if (contacts.length === 0) {
      return [];
    }

    const contactId = contacts[0].id;

    // Find deals associated with this contact
    const dealsUrl = `${API_BASE}/crm/v3/objects/deals/search`;
    const dealsResponse = await fetch(dealsUrl, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        filterGroups: [
          {
            filters: [
              {
                propertyName: "associations.contact",
                operator: "EQ",
                value: contactId,
              },
              {
                propertyName: "dealstage",
                operator: "NOT_IN",
                value: ["closedwon", "closed lost"],
              },
            ],
          },
        ],
        properties: ["dealname", "amount", "dealstage", "hubspot_owner_id"],
        limit: 10,
      }),
    });

    if (!dealsResponse.ok) {
      console.error("Failed to search deals:", await dealsResponse.text());
      return [];
    }

    const dealsData = await dealsResponse.json();
    const deals = dealsData.results || [];

    return deals
      .map((deal: any) => {
        const props = deal.properties || {};
        const stage = props.dealstage || "Unknown";
        const stageLower = stage.toLowerCase();

        // Filter out closed deals
        if (
          stageLower.includes("closed") ||
          stageLower === "closedwon" ||
          stageLower === "closed lost" ||
          stageLower === "closedlost"
        ) {
          return null;
        }

        const amount = props.amount
          ? typeof props.amount === "string"
            ? parseFloat(props.amount)
            : props.amount
          : 0;

        return {
          id: String(deal.id),
          name: props.dealname || "Unnamed Deal",
          stage: stage,
          amount: isNaN(amount) ? 0 : amount,
          owner: props.hubspot_owner_id || undefined,
        };
      })
      .filter((deal: any) => deal !== null);
  } catch (error) {
    console.error("Error finding open deals:", error);
    return [];
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    // Extract RB2B payload data
    const email = payload.email || payload.visitor_email;
    const linkedinUrl = payload.linkedin_url || payload.linkedinUrl;
    const companyName = payload.company_name || payload.companyName;
    const companyDomain = payload.company_domain || payload.companyDomain;
    const pageUrl = payload.page_url || payload.pageUrl || payload.current_page;
    const visitorName =
      payload.name ||
      payload.visitor_name ||
      `${payload.first_name || ""} ${payload.last_name || ""}`.trim() ||
      "Unknown Visitor";

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    if (!pageUrl) {
      return NextResponse.json(
        { error: "Page URL is required" },
        { status: 400 }
      );
    }

    // Filter 1: Check if this is a high-intent page
    if (!isHighIntentPage(pageUrl)) {
      return NextResponse.json({
        message: "Not a high-intent page, skipping",
        highIntent: false,
      });
    }

    // Filter 2: Check HubSpot for open deals
    const openDeals = await findOpenDealsForContact(email, companyDomain);

    if (openDeals.length === 0) {
      return NextResponse.json({
        message: "No open deals found for this contact",
        highIntent: true,
        hasOpenDeal: false,
      });
    }

    // Create alerts for each open deal
    const newAlerts = openDeals.map((deal) => {
      const alertId = `${Date.now()}-${deal.id}-${Math.random().toString(36).substr(2, 9)}`;
      return {
        id: alertId,
        timestamp: new Date().toISOString(),
        visitorName,
        visitorEmail: email,
        linkedinUrl,
        companyName: companyName || "Unknown Company",
        companyDomain,
        pageUrl,
        dealId: deal.id,
        dealName: deal.name,
        dealStage: deal.stage,
        dealValue: deal.amount,
        dealOwner: deal.owner,
        notified: false,
      };
    });

    // Add alerts to store
    alertsStore.push(...newAlerts);

    // Keep only last 100 alerts to prevent memory issues
    if (alertsStore.length > 100) {
      alertsStore.splice(0, alertsStore.length - 100);
    }

    return NextResponse.json({
      message: "High-intent alert created",
      highIntent: true,
      hasOpenDeal: true,
      alertsCreated: newAlerts.length,
      alerts: newAlerts,
    });
  } catch (error: any) {
    console.error("RB2B Webhook Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process webhook" },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve alerts (for the dashboard widget)
export async function GET() {
  // Sort by timestamp (newest first) and return last 20
  const recentAlerts = alertsStore
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 20);

  return NextResponse.json({
    alerts: recentAlerts,
    total: alertsStore.length,
  });
}
