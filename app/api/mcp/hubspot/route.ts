import { NextResponse } from "next/server";
import {
  fetchHubSpotDeals,
  fetchHubSpotContacts,
  fetchHubSpotCompanies,
  fetchHubSpotConversations,
  fetchHubSpotCalls,
  fetchHubSpotEmails,
  fetchHubSpotMeetings,
  fetchHubSpotTasks,
  fetchHubSpotTickets,
  fetchHubSpotProducts,
  fetchHubSpotLineItems,
  fetchHubSpotQuotes,
  fetchHubSpotOwners
} from "@/lib/mcp/hubspot";
import { trackRequest } from "@/lib/usage-tracker";

export async function POST(request: Request) {
  try {
    trackRequest('hubspot');
    const { tool, parameters } = await request.json();

    switch (tool) {
      case "get_hubspot_deals": {
        const { limit = 10 } = parameters;
        const deals = await fetchHubSpotDeals(limit);
        // Filter by query if provided (client-side)
        const result = parameters.query
          ? {
              ...deals,
              deals: deals.deals.filter((d: any) =>
                d.name?.toLowerCase().includes(parameters.query.toLowerCase())
              )
            }
          : deals;
        return NextResponse.json({ result });
      }

      case "search_hubspot_contacts": {
        const { query = "", limit = 10 } = parameters;
        const contacts = await fetchHubSpotContacts(query, limit);
        return NextResponse.json({ result: contacts });
      }

      case "get_hubspot_companies": {
        const { limit = 10 } = parameters;
        const companies = await fetchHubSpotCompanies(limit);
        // Filter by query if provided (client-side)
        const result = parameters.query
          ? companies.filter((c: any) =>
              c.name?.toLowerCase().includes(parameters.query.toLowerCase())
            )
          : companies;
        return NextResponse.json({ result });
      }

      case "get_hubspot_conversations": {
        const { threadId, limit = 10 } = parameters;
        // fetchHubSpotConversations only takes limit parameter
        const conversations = await fetchHubSpotConversations(limit);
        // Filter by threadId if provided (client-side filtering)
        const result = threadId 
          ? conversations.threads?.find((t: any) => t.id === threadId) || null
          : conversations;
        return NextResponse.json({ result });
      }

      case "get_hubspot_calls": {
        const { limit = 10 } = parameters;
        const calls = await fetchHubSpotCalls(limit);
        return NextResponse.json({ result: calls });
      }

      case "get_hubspot_emails": {
        const { limit = 10 } = parameters;
        const emails = await fetchHubSpotEmails(limit);
        return NextResponse.json({ result: emails });
      }

      case "get_hubspot_meetings": {
        const { limit = 10 } = parameters;
        const meetings = await fetchHubSpotMeetings(limit);
        return NextResponse.json({ result: meetings });
      }

      case "get_hubspot_tasks": {
        const { limit = 10 } = parameters;
        const tasks = await fetchHubSpotTasks(limit);
        return NextResponse.json({ result: tasks });
      }

      case "get_hubspot_tickets": {
        const { limit = 10 } = parameters;
        const tickets = await fetchHubSpotTickets(limit);
        return NextResponse.json({ result: tickets });
      }

      case "get_hubspot_products": {
        const { limit = 10 } = parameters;
        const products = await fetchHubSpotProducts(limit);
        return NextResponse.json({ result: products });
      }

      case "get_hubspot_line_items": {
        const { limit = 10 } = parameters;
        const lineItems = await fetchHubSpotLineItems(limit);
        return NextResponse.json({ result: lineItems });
      }

      case "get_hubspot_quotes": {
        const { limit = 10 } = parameters;
        const quotes = await fetchHubSpotQuotes(limit);
        return NextResponse.json({ result: quotes });
      }

      case "get_hubspot_owners": {
        const owners = await fetchHubSpotOwners();
        return NextResponse.json({ result: owners });
      }

      default:
        return NextResponse.json(
          { error: `Unknown tool: ${tool}` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error("HubSpot MCP Bridge Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to execute HubSpot tool" },
      { status: 500 }
    );
  }
}
