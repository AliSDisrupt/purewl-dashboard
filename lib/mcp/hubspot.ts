/**
 * HubSpot MCP Client
 * 
 * This client connects to the HubSpot CRM API directly
 * using the access token from environment variables.
 */

const API_BASE = process.env.HUBSPOT_API_BASE || "https://api.hubapi.com";
// Hardcoded HubSpot token from DATA/claude_desktop_config.json
const ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;

function getHeaders() {
  return {
    "Authorization": `Bearer ${ACCESS_TOKEN}`,
    "Content-Type": "application/json"
  };
}

export interface HubSpotDeal {
  id: string;
  name: string;
  amount: number | null;
  stage: string;
  closeDate: string | null;
  createdAt?: string | null;
  contactEmail?: string;
  source?: string | null;
  sourceData1?: string | null;
  sourceData2?: string | null;
}

export interface HubSpotContact {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
}

export interface HubSpotConversation {
  id: string;
  status: 'OPEN' | 'CLOSED';
  createdAt?: string;
  updatedAt?: string;
  assignedTo?: string;
  subject?: string;
  preview?: string;
  channel?: string;
  participantCount?: number;
  messages?: Array<{
    id: string;
    text: string;
    from: string;
    timestamp: string;
  }>;
  participants?: Array<{
    id: string;
    name?: string;
    email?: string;
  }>;
  associatedContact?: string;
  associatedDeal?: string;
}

export interface HubSpotCompany {
  id: string;
  name: string;
  domain?: string;
  industry?: string;
  employees?: number;
  revenue?: number;
  phone?: string;
  address?: string;
  website?: string;
  city?: string;
  country?: string;
}

export interface HubSpotTicket {
  id: string;
  subject: string;
  status: string;
  priority?: string;
  category?: string;
  assignedTo?: string;
  createdAt?: string;
  updatedAt?: string;
  source?: string;
}

export interface HubSpotTask {
  id: string;
  name: string;
  status: string;
  priority?: string;
  dueDate?: string;
  assignedTo?: string;
  taskType?: string;
  notes?: string;
  associatedContact?: string;
  associatedDeal?: string;
}

export interface HubSpotMeeting {
  id: string;
  title: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  meetingUrl?: string;
  notes?: string;
  associatedContact?: string;
  associatedDeal?: string;
}

export interface HubSpotCall {
  id: string;
  title: string;
  duration?: number;
  direction?: string;
  status?: string;
  recordingUrl?: string;
  notes?: string;
  startTime?: string;
  associatedContact?: string;
}

export interface HubSpotEmail {
  id: string;
  subject: string;
  body?: string;
  from?: string;
  to?: string;
  sentDate?: string;
  status?: string;
  openCount?: number;
  clickCount?: number;
  associatedContact?: string;
  conversationId?: string;
}

export interface HubSpotProduct {
  id: string;
  name: string;
  sku?: string;
  price?: number;
  description?: string;
  category?: string;
}

export interface HubSpotLineItem {
  id: string;
  name: string;
  quantity?: number;
  price?: number;
  amount?: number;
  associatedDeal?: string;
  associatedProduct?: string;
}

export interface HubSpotQuote {
  id: string;
  title: string;
  amount?: number;
  status?: string;
  expirationDate?: string;
  associatedDeal?: string;
}

export interface HubSpotOwner {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  team?: string;
}

/**
 * Fetch HubSpot deals with pagination to get ALL deals
 */
export async function fetchHubSpotDeals(limit?: number): Promise<{
  deals: HubSpotDeal[];
  summary: {
    totalDeals: number;
    totalValue: number;
    byStage: Record<string, number>;
  };
}> {
  // Token is now hardcoded, so this check is not needed
  // if (!ACCESS_TOKEN) {
  //   throw new Error("HUBSPOT_ACCESS_TOKEN not configured");
  // }

  try {
    const allDeals: HubSpotDeal[] = [];
    let after: string | undefined = undefined;
    const pageSize = 100; // HubSpot max per page - always fetch 100 per page for efficiency
    let hasMore = true;
    let pageCount = 0;
    const maxPages = 1000; // Safety limit to prevent infinite loops (supports up to 100k deals)

    // Paginate through all deals
    while (hasMore && pageCount < maxPages) {
      const url = `${API_BASE}/crm/v3/objects/deals`;
      
      // Log request for first page to debug
      if (pageCount === 0) {
        console.log(`🔍 Fetching HubSpot deals:`, {
          url: url,
          hasAccessToken: !!ACCESS_TOKEN,
          tokenPrefix: ACCESS_TOKEN ? ACCESS_TOKEN.substring(0, 15) + '...' : 'NOT SET'
        });
      }
      
      const params = new URLSearchParams({
        limit: String(pageSize),
        properties: "dealname,amount,dealstage,closedate,pipeline,createdate,hs_analytics_source,hs_analytics_source_data_1,hs_analytics_source_data_2",
        sort: "-createdAt",
      });

      // Add pagination cursor if we have one
      if (after) {
        params.append("after", after);
      }

      const response = await fetch(`${url}?${params}`, {
        headers: getHeaders(),
      });

      // Check response status and headers
      const contentType = response.headers.get("content-type");
      const contentLength = response.headers.get("content-length");
      
      // Read response body once
      const responseText = await response.text();
      
      if (!response.ok) {
        console.error(`HubSpot API Error:`, {
          status: response.status,
          statusText: response.statusText,
          contentType,
          contentLength,
          error: responseText
        });
        throw new Error(`HubSpot API Error: ${response.status} ${response.statusText} - ${responseText}`);
      }

      // Check if response body is empty (HTTP 200 but no body)
      if (!responseText || responseText.trim() === '') {
        console.warn(`HubSpot API returned empty body (HTTP 200) for page ${pageCount + 1}`, {
          url: `${url}?${params}`,
          contentType,
          contentLength,
          note: "This usually means no more data or API returned empty response"
        });
        // Empty response means no more data
        hasMore = false;
        break;
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error(`Failed to parse HubSpot API response:`, {
          error: parseError,
          responsePreview: responseText.substring(0, 500),
          contentType,
          contentLength,
          fullUrl: `${url}?${params}`
        });
        hasMore = false;
        break;
      }

      const results = data.results || [];
      
      // Log response details for debugging (first page only)
      if (pageCount === 0) {
        console.log(`HubSpot Deals API Response:`, {
          status: response.status,
          contentType,
          contentLength,
          hasResults: !!data.results,
          resultsCount: results.length,
          hasPaging: !!data.paging,
          pagingNext: data.paging?.next?.after,
          sampleDeal: results[0] ? {
            id: results[0].id,
            hasProperties: !!results[0].properties,
            propertyKeys: results[0].properties ? Object.keys(results[0].properties) : []
          } : null
        });
      }

      // Process deals from this page
      for (const d of results) {
        const props = d.properties || {};
        // Handle amount - can be string or number
        let amount: number | null = null;
        if (props.amount) {
          const amountValue = typeof props.amount === 'string' ? parseFloat(props.amount) : props.amount;
          amount = isNaN(amountValue) ? null : amountValue;
        }

        allDeals.push({
          id: String(d.id),
          name: props.dealname || "Unnamed Deal",
          amount,
          stage: props.dealstage || "Unknown Stage",
          closeDate: props.closedate || null,
          createdAt: props.createdate || d.createdAt || null,
          source: props.hs_analytics_source || null,
          sourceData1: props.hs_analytics_source_data_1 || null,
          sourceData2: props.hs_analytics_source_data_2 || null,
        });
      }

      // Check if there are more pages
      const paging = data.paging;
      if (paging && paging.next && paging.next.after) {
        after = paging.next.after;
        hasMore = true;
      } else {
        hasMore = false;
      }

      pageCount++;

      // If a limit was provided and we've reached it, stop
      if (limit && allDeals.length >= limit) {
        hasMore = false;
      }
    }

    // Calculate summary from ALL deals
    const totalValue = allDeals
      .filter(d => d.amount !== null)
      .reduce((sum, d) => sum + (d.amount || 0), 0);

    const byStage = allDeals.reduce((acc, deal) => {
      acc[deal.stage] = (acc[deal.stage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log(`Fetched ${allDeals.length} deals from HubSpot across ${pageCount} page(s)`);

    return {
      deals: limit ? allDeals.slice(0, limit) : allDeals,
      summary: {
        totalDeals: allDeals.length,
        totalValue,
        byStage,
      },
    };
  } catch (error) {
    console.error("Error fetching HubSpot deals:", error);
    return {
      deals: [],
      summary: { totalDeals: 0, totalValue: 0, byStage: {} },
    };
  }
}

/**
 * Fetch HubSpot contacts
 */
export async function fetchHubSpotContacts(query: string = '', limit: number = 10): Promise<HubSpotContact[]> {
  if (!ACCESS_TOKEN) {
    console.warn("HUBSPOT_ACCESS_TOKEN not configured");
    return [];
  }

  try {
    const url = `${API_BASE}/crm/v3/objects/contacts/search`;
    
    const payload: any = {
      filterGroups: [],
      sorts: ["-createdAt"],
      properties: ["firstname", "lastname", "email", "company", "jobtitle", "phone"],
      limit,
    };

    // Add search filters if query provided
    if (query) {
      payload.filterGroups = [
        {
          filters: [{
            propertyName: "email",
            operator: "CONTAINS_TOKEN",
            value: query
          }]
        },
        {
          filters: [{
            propertyName: "firstname",
            operator: "CONTAINS_TOKEN",
            value: query
          }]
        },
        {
          filters: [{
            propertyName: "lastname",
            operator: "CONTAINS_TOKEN",
            value: query
          }]
        }
      ];
    }

    const response = await fetch(url, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`HubSpot API Error: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    const contacts: HubSpotContact[] = [];

    for (const c of data.results || []) {
      const props = c.properties || {};
      const first = props.firstname || "";
      const last = props.lastname || "";
      const name = `${first} ${last}`.trim() || "Unnamed";

      contacts.push({
        id: String(c.id),
        name,
        email: props.email || "No Email",
        phone: props.phone || null,
        company: props.company || null,
      });
    }

    return contacts;
  } catch (error) {
    console.error("Error fetching HubSpot contacts:", error);
    return [];
  }
}

/**
 * Fetch HubSpot conversations with details
 */
export async function fetchHubSpotConversations(limit: number = 50): Promise<{
  threads: HubSpotConversation[];
  summary: {
    total: number;
    open: number;
    closed: number;
  };
}> {
  if (!ACCESS_TOKEN) {
    console.warn("HUBSPOT_ACCESS_TOKEN not configured");
    return {
      threads: [],
      summary: { total: 0, open: 0, closed: 0 },
    };
  }

  try {
    // Fetch conversation threads
    const url = `${API_BASE}/conversations/v3/conversations/threads`;
    const params = new URLSearchParams({ 
      limit: String(limit),
      sort: "-updatedAt" // Most recently updated first
    });

    const response = await fetch(`${url}?${params}`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      console.error(`HubSpot API Error: ${response.status} ${response.statusText}`);
      return {
        threads: [],
        summary: { total: 0, open: 0, closed: 0 },
      };
    }

    const data = await response.json();
    const threads: HubSpotConversation[] = [];

    // Log detailed sample of first thread to debug
    if (data.results && data.results.length > 0) {
      const sample = data.results[0];
      console.log(`HubSpot Conversations API Response Sample:`, {
        id: sample.id,
        status: sample.status,
        createdAt: sample.createdAt,
        updatedAt: sample.updatedAt,
        created: sample.created,
        updated: sample.updated,
        timestamp: sample.timestamp,
        allKeys: Object.keys(sample),
        fullSample: JSON.stringify(sample, null, 2).substring(0, 500)
      });
    }
    
    console.log(`HubSpot Conversations API Response:`, {
      totalResults: data.results?.length || 0,
      hasPaging: !!data.paging,
    });

    // Process each thread
    for (const thread of data.results || []) {
      // Extract basic info from thread object
      const threadId = String(thread.id || thread.threadId || "");
      const status = thread.status || thread.state || "UNKNOWN";
      const normalizedStatus = status.toUpperCase() === "OPEN" ? "OPEN" : "CLOSED";
      
      // Try to get thread details for preview
      let preview = "";
      let channel = "";
      let participantCount = 0;
      let subject = thread.subject || thread.title || thread.name || "";
      // Extract dates - try multiple possible field names
      let createdAt = thread.createdAt || thread.created || thread.timestamp || thread.createdTimestamp || "";
      let updatedAt = thread.updatedAt || thread.updated || thread.lastUpdated || thread.updatedTimestamp || thread.modifiedAt || "";
      
      // If dates are in milliseconds (number), convert to ISO string
      if (typeof createdAt === 'number') {
        createdAt = new Date(createdAt).toISOString();
      }
      if (typeof updatedAt === 'number') {
        updatedAt = new Date(updatedAt).toISOString();
      }
      let assignedTo = thread.assignedTo || thread.assignee || thread.owner || "";

      // Try to get additional details from thread object first
      if (thread.channel) {
        channel = thread.channel;
      } else if (thread.channelType) {
        channel = thread.channelType;
      } else if (thread.source) {
        channel = thread.source;
      }

      if (thread.participants) {
        participantCount = Array.isArray(thread.participants) ? thread.participants.length : 0;
      }

      // Try to get message preview from thread object
      if (thread.messages && Array.isArray(thread.messages) && thread.messages.length > 0) {
        const latestMessage = thread.messages[thread.messages.length - 1];
        preview = latestMessage.text || latestMessage.body || latestMessage.content || "";
        if (preview.length > 150) {
          preview = preview.substring(0, 150) + "...";
        }
      } else if (thread.preview || thread.lastMessage) {
        preview = thread.preview || thread.lastMessage || "";
        if (preview.length > 150) {
          preview = preview.substring(0, 150) + "...";
        }
      }

      // Always fetch thread details to get accurate dates and other metadata
      if (threadId) {
        try {
          const threadUrl = `${API_BASE}/conversations/v3/conversations/threads/${threadId}`;
          const threadResponse = await fetch(threadUrl, {
            headers: getHeaders(),
          });

          if (threadResponse.ok) {
            const threadData = await threadResponse.json();
            
            // Get latest message for preview
            if (!preview) {
              const messages = threadData.messages || [];
              if (messages.length > 0) {
                const latestMessage = messages[messages.length - 1];
                preview = latestMessage.text || latestMessage.body || latestMessage.content || "";
                if (preview.length > 150) {
                  preview = preview.substring(0, 150) + "...";
                }
              }
            }

            // Get channel info if not already set
            if (!channel) {
              channel = threadData.channel || threadData.channelType || threadData.source || "";
            }
            
            // Get participant count if not already set
            if (participantCount === 0) {
              participantCount = threadData.participants?.length || 0;
            }

            // Always update dates from detailed thread data (more reliable)
            if (threadData.createdAt) {
              createdAt = threadData.createdAt;
            } else if (threadData.created) {
              createdAt = threadData.created;
            } else if (threadData.timestamp) {
              createdAt = threadData.timestamp;
            }
            
            if (threadData.updatedAt) {
              updatedAt = threadData.updatedAt;
            } else if (threadData.updated) {
              updatedAt = threadData.updated;
            } else if (threadData.lastUpdated) {
              updatedAt = threadData.lastUpdated;
            }

            // Get additional metadata
            if (!subject && threadData.subject) {
              subject = threadData.subject;
            }
          }
        } catch (err) {
          // If thread details fail, continue with basic info
          console.warn(`Could not fetch details for thread ${threadId}:`, err);
        }
      }

      // Fetch full thread details for more information (only if we don't have dates yet)
      let messages: Array<{ id: string; text: string; from: string; timestamp: string }> = [];
      let participants: Array<{ id: string; name?: string; email?: string }> = [];
      let associatedContact: string | undefined;
      let associatedDeal: string | undefined;

      // Only fetch full details if we're missing dates or other critical info
      if (!createdAt || !updatedAt || !preview) {
        try {
          const threadDetailsUrl = `${API_BASE}/conversations/v3/conversations/threads/${threadId}`;
          const detailsResponse = await fetch(threadDetailsUrl, {
            headers: getHeaders(),
          });

          if (detailsResponse.ok) {
            const detailsData = await detailsResponse.json();
            
            // Always update dates from detailed response (most reliable)
            // Try multiple possible field names
            if (detailsData.createdAt) {
              createdAt = detailsData.createdAt;
            } else if (detailsData.created) {
              createdAt = detailsData.created;
            } else if (detailsData.timestamp) {
              createdAt = detailsData.timestamp;
            } else if (detailsData.createdTimestamp) {
              createdAt = detailsData.createdTimestamp;
            }
            
            if (detailsData.updatedAt) {
              updatedAt = detailsData.updatedAt;
            } else if (detailsData.updated) {
              updatedAt = detailsData.updated;
            } else if (detailsData.lastUpdated) {
              updatedAt = detailsData.lastUpdated;
            } else if (detailsData.updatedTimestamp) {
              updatedAt = detailsData.updatedTimestamp;
            } else if (detailsData.modifiedAt) {
              updatedAt = detailsData.modifiedAt;
            }
            
            // Convert numeric timestamps to ISO strings
            if (typeof createdAt === 'number') {
              createdAt = new Date(createdAt).toISOString();
            }
            if (typeof updatedAt === 'number') {
              updatedAt = new Date(updatedAt).toISOString();
            }
            
            // Extract messages
            if (detailsData.messages && Array.isArray(detailsData.messages)) {
              messages = detailsData.messages.map((msg: any) => ({
                id: String(msg.id || msg.messageId || ""),
                text: msg.text || msg.body || msg.content || "",
                from: msg.from?.email || msg.from?.name || msg.sender || "Unknown",
                timestamp: msg.timestamp || msg.createdAt || msg.sentAt || "",
              }));
              
              // Use first message timestamp as createdAt if still missing
              if (!createdAt && messages.length > 0 && messages[0].timestamp) {
                createdAt = messages[0].timestamp;
              }
            }

            // Extract participants
            if (detailsData.participants && Array.isArray(detailsData.participants)) {
              participants = detailsData.participants.map((p: any) => ({
                id: String(p.id || p.participantId || ""),
                name: p.name || p.displayName || undefined,
                email: p.email || undefined,
              }));
            }

            // Extract associations
            if (detailsData.associations) {
              if (detailsData.associations.contacts?.results?.length > 0) {
                associatedContact = String(detailsData.associations.contacts.results[0].id);
              }
              if (detailsData.associations.deals?.results?.length > 0) {
                associatedDeal = String(detailsData.associations.deals.results[0].id);
              }
            }
            
            // Get preview from messages if still missing
            if (!preview && messages.length > 0) {
              preview = messages[messages.length - 1].text || "";
              if (preview.length > 150) {
                preview = preview.substring(0, 150) + "...";
              }
            }
          }
        } catch (err) {
          // Silently fail - we already have basic info
          console.debug(`Could not fetch full details for thread ${threadId}:`, err);
        }
      }

      threads.push({
        id: threadId,
        status: normalizedStatus,
        createdAt,
        updatedAt,
        assignedTo,
        subject,
        preview,
        channel,
        participantCount: participants.length > 0 ? participants.length : participantCount,
        messages: messages.length > 0 ? messages : undefined,
        participants: participants.length > 0 ? participants : undefined,
        associatedContact,
        associatedDeal,
      });
    }

    console.log(`Processed ${threads.length} conversation threads`);

    return {
      threads,
      summary: {
        total: threads.length,
        open: threads.filter(t => t.status === "OPEN").length,
        closed: threads.filter(t => t.status === "CLOSED").length,
      },
    };
  } catch (error) {
    console.error("Error fetching HubSpot conversations:", error);
    return {
      threads: [],
      summary: { total: 0, open: 0, closed: 0 },
    };
  }
}

/**
 * Fetch HubSpot companies with pagination
 */
export async function fetchHubSpotCompanies(limit?: number): Promise<HubSpotCompany[]> {
  if (!ACCESS_TOKEN) {
    console.warn("HUBSPOT_ACCESS_TOKEN not configured");
    return [];
  }

  try {
    const allCompanies: HubSpotCompany[] = [];
    let after: string | undefined = undefined;
    const pageSize = 100;
    let hasMore = true;
    let pageCount = 0;
    const maxPages = 100;

    while (hasMore && pageCount < maxPages) {
      const url = `${API_BASE}/crm/v3/objects/companies`;
      const params = new URLSearchParams({
        limit: String(pageSize),
        properties: "name,domain,industry,numberofemployees,annualrevenue,phone,address,website,city,country",
        sort: "-createdAt",
      });

      if (after) {
        params.append("after", after);
      }

      const response = await fetch(`${url}?${params}`, {
        headers: getHeaders(),
      });

      if (!response.ok) {
        console.error(`HubSpot Companies API Error: ${response.status}`);
        break;
      }

      const data = await response.json();
      const results = data.results || [];

      for (const c of results) {
        const props = c.properties || {};
        allCompanies.push({
          id: String(c.id),
          name: props.name || "Unnamed Company",
          domain: props.domain || undefined,
          industry: props.industry || undefined,
          employees: props.numberofemployees ? parseInt(props.numberofemployees) : undefined,
          revenue: props.annualrevenue ? parseFloat(props.annualrevenue) : undefined,
          phone: props.phone || undefined,
          address: props.address || undefined,
          website: props.website || undefined,
          city: props.city || undefined,
          country: props.country || undefined,
        });
      }

      const paging = data.paging;
      if (paging && paging.next && paging.next.after) {
        after = paging.next.after;
      } else {
        hasMore = false;
      }

      pageCount++;
      if (limit && allCompanies.length >= limit) {
        hasMore = false;
      }
    }

    return limit ? allCompanies.slice(0, limit) : allCompanies;
  } catch (error) {
    console.error("Error fetching HubSpot companies:", error);
    return [];
  }
}

/**
 * Fetch HubSpot tickets
 */
export async function fetchHubSpotTickets(limit?: number): Promise<HubSpotTicket[]> {
  if (!ACCESS_TOKEN) {
    console.warn("HUBSPOT_ACCESS_TOKEN not configured");
    return [];
  }

  try {
    const url = `${API_BASE}/crm/v3/objects/tickets`;
    const params = new URLSearchParams({
      limit: String(limit || 100),
      properties: "subject,hs_ticket_priority,hs_ticket_category,hs_pipeline_stage,hs_ticket_status",
      sort: "-createdAt",
    });

    const response = await fetch(`${url}?${params}`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      console.error(`HubSpot Tickets API Error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const tickets: HubSpotTicket[] = [];

    for (const t of data.results || []) {
      const props = t.properties || {};
      tickets.push({
        id: String(t.id),
        subject: props.subject || "Untitled Ticket",
        status: props.hs_ticket_status || props.hs_pipeline_stage || "Unknown",
        priority: props.hs_ticket_priority || undefined,
        category: props.hs_ticket_category || undefined,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      });
    }

    return tickets;
  } catch (error) {
    console.error("Error fetching HubSpot tickets:", error);
    return [];
  }
}

/**
 * Fetch HubSpot tasks
 */
export async function fetchHubSpotTasks(limit?: number): Promise<HubSpotTask[]> {
  if (!ACCESS_TOKEN) {
    console.warn("HUBSPOT_ACCESS_TOKEN not configured");
    return [];
  }

  try {
    const url = `${API_BASE}/crm/v3/objects/tasks`;
    const params = new URLSearchParams({
      limit: String(limit || 100),
      properties: "hs_task_subject,hs_timestamp,hs_task_status,hs_task_priority,hs_task_type,hs_task_body,hs_task_association_type,hs_task_association_id",
      sort: "-createdAt",
    });

    const response = await fetch(`${url}?${params}`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      console.error(`HubSpot Tasks API Error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const tasks: HubSpotTask[] = [];

    for (const t of data.results || []) {
      const props = t.properties || {};
      const associations = t.associations || {};
      
      // Extract associated contact/deal from associations
      let associatedContact: string | undefined;
      let associatedDeal: string | undefined;
      
      if (associations.contacts?.results && associations.contacts.results.length > 0) {
        associatedContact = String(associations.contacts.results[0].id);
      }
      if (associations.deals?.results && associations.deals.results.length > 0) {
        associatedDeal = String(associations.deals.results[0].id);
      }
      
      tasks.push({
        id: String(t.id),
        name: props.hs_task_subject || "Untitled Task",
        status: props.hs_task_status || "NOT_STARTED",
        priority: props.hs_task_priority || undefined,
        dueDate: props.hs_timestamp || undefined,
        taskType: props.hs_task_type || undefined,
        notes: props.hs_task_body || undefined,
        associatedContact,
        associatedDeal,
      });
    }

    return tasks;
  } catch (error) {
    console.error("Error fetching HubSpot tasks:", error);
    return [];
  }
}

/**
 * Fetch HubSpot meetings
 */
export async function fetchHubSpotMeetings(limit?: number): Promise<HubSpotMeeting[]> {
  if (!ACCESS_TOKEN) {
    console.warn("HUBSPOT_ACCESS_TOKEN not configured");
    return [];
  }

  try {
    const url = `${API_BASE}/crm/v3/objects/meetings`;
    const params = new URLSearchParams({
      limit: String(limit || 100),
      properties: "hs_meeting_title,hs_meeting_start_time,hs_meeting_end_time,hs_meeting_location,hs_meeting_body,hs_meeting_url",
      sort: "-createdAt",
    });

    const response = await fetch(`${url}?${params}`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      console.error(`HubSpot Meetings API Error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const meetings: HubSpotMeeting[] = [];

    for (const m of data.results || []) {
      const props = m.properties || {};
      meetings.push({
        id: String(m.id),
        title: props.hs_meeting_title || "Untitled Meeting",
        startTime: props.hs_meeting_start_time || undefined,
        endTime: props.hs_meeting_end_time || undefined,
        location: props.hs_meeting_location || undefined,
        meetingUrl: props.hs_meeting_url || undefined,
        notes: props.hs_meeting_body || undefined,
      });
    }

    return meetings;
  } catch (error) {
    console.error("Error fetching HubSpot meetings:", error);
    return [];
  }
}

/**
 * Fetch HubSpot calls
 */
export async function fetchHubSpotCalls(limit?: number): Promise<HubSpotCall[]> {
  if (!ACCESS_TOKEN) {
    console.warn("HUBSPOT_ACCESS_TOKEN not configured");
    return [];
  }

  try {
    const url = `${API_BASE}/crm/v3/objects/calls`;
    const params = new URLSearchParams({
      limit: String(limit || 100),
      properties: "hs_call_title,hs_call_duration,hs_call_direction,hs_call_status,hs_call_body,hs_call_recording_url,hs_timestamp",
      sort: "-createdAt",
    });

    const response = await fetch(`${url}?${params}`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      console.error(`HubSpot Calls API Error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const calls: HubSpotCall[] = [];

    for (const c of data.results || []) {
      const props = c.properties || {};
      calls.push({
        id: String(c.id),
        title: props.hs_call_title || "Untitled Call",
        duration: props.hs_call_duration ? parseInt(props.hs_call_duration) : undefined,
        direction: props.hs_call_direction || undefined,
        status: props.hs_call_status || undefined,
        recordingUrl: props.hs_call_recording_url || undefined,
        notes: props.hs_call_body || undefined,
        startTime: props.hs_timestamp || undefined,
      });
    }

    return calls;
  } catch (error) {
    console.error("Error fetching HubSpot calls:", error);
    return [];
  }
}

/**
 * Fetch HubSpot emails
 */
export async function fetchHubSpotEmails(limit?: number): Promise<HubSpotEmail[]> {
  if (!ACCESS_TOKEN) {
    console.warn("HUBSPOT_ACCESS_TOKEN not configured");
    return [];
  }

  try {
    const url = `${API_BASE}/crm/v3/objects/emails`;
    const params = new URLSearchParams({
      limit: String(limit || 100),
      properties: "hs_email_subject,hs_email_text,hs_email_from_firstname,hs_email_from_lastname,hs_email_to_email,hs_timestamp,hs_email_status",
      sort: "-hs_timestamp", // Sort by sent date, latest first
    });

    const response = await fetch(`${url}?${params}`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      console.error(`HubSpot Emails API Error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const emails: HubSpotEmail[] = [];

    for (const e of data.results || []) {
      const props = e.properties || {};
      
      // Try to get conversation ID from associations (fetch separately)
      let conversationId: string | undefined;
      try {
        // Fetch associations for this email
        const assocUrl = `${API_BASE}/crm/v4/objects/emails/${e.id}/associations/conversations`;
        const assocResponse = await fetch(assocUrl, {
          headers: getHeaders(),
        });
        if (assocResponse.ok) {
          const assocData = await assocResponse.json();
          if (assocData.results && assocData.results.length > 0) {
            conversationId = String(assocData.results[0].id);
          }
        }
      } catch (err) {
        // Silently fail - conversation ID is optional
      }
      
      emails.push({
        id: String(e.id),
        subject: props.hs_email_subject || "No Subject",
        body: props.hs_email_text || undefined,
        from: props.hs_email_from_firstname && props.hs_email_from_lastname 
          ? `${props.hs_email_from_firstname} ${props.hs_email_from_lastname}` 
          : undefined,
        to: props.hs_email_to_email || undefined,
        sentDate: props.hs_timestamp || undefined,
        status: props.hs_email_status || undefined,
        conversationId: conversationId,
      });
    }

    // Sort by sentDate (latest first) as a fallback
    emails.sort((a, b) => {
      if (!a.sentDate && !b.sentDate) return 0;
      if (!a.sentDate) return 1;
      if (!b.sentDate) return -1;
      return new Date(b.sentDate).getTime() - new Date(a.sentDate).getTime();
    });

    return emails;
  } catch (error) {
    console.error("Error fetching HubSpot emails:", error);
    return [];
  }
}

/**
 * Fetch HubSpot products
 */
export async function fetchHubSpotProducts(limit?: number): Promise<HubSpotProduct[]> {
  if (!ACCESS_TOKEN) {
    console.warn("HUBSPOT_ACCESS_TOKEN not configured");
    return [];
  }

  try {
    const url = `${API_BASE}/crm/v3/objects/products`;
    const params = new URLSearchParams({
      limit: String(limit || 100),
      properties: "name,price,description,hs_sku",
      sort: "-createdAt",
    });

    const response = await fetch(`${url}?${params}`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      console.error(`HubSpot Products API Error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const products: HubSpotProduct[] = [];

    for (const p of data.results || []) {
      const props = p.properties || {};
      products.push({
        id: String(p.id),
        name: props.name || "Unnamed Product",
        sku: props.hs_sku || undefined,
        price: props.price ? parseFloat(props.price) : undefined,
        description: props.description || undefined,
      });
    }

    return products;
  } catch (error) {
    console.error("Error fetching HubSpot products:", error);
    return [];
  }
}

/**
 * Fetch HubSpot line items
 */
export async function fetchHubSpotLineItems(limit?: number): Promise<HubSpotLineItem[]> {
  if (!ACCESS_TOKEN) {
    console.warn("HUBSPOT_ACCESS_TOKEN not configured");
    return [];
  }

  try {
    const url = `${API_BASE}/crm/v3/objects/line_items`;
    const params = new URLSearchParams({
      limit: String(limit || 100),
      properties: "name,quantity,price,amount",
      sort: "-createdAt",
    });

    const response = await fetch(`${url}?${params}`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      console.error(`HubSpot Line Items API Error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const lineItems: HubSpotLineItem[] = [];

    for (const li of data.results || []) {
      const props = li.properties || {};
      lineItems.push({
        id: String(li.id),
        name: props.name || "Unnamed Line Item",
        quantity: props.quantity ? parseInt(props.quantity) : undefined,
        price: props.price ? parseFloat(props.price) : undefined,
        amount: props.amount ? parseFloat(props.amount) : undefined,
      });
    }

    return lineItems;
  } catch (error) {
    console.error("Error fetching HubSpot line items:", error);
    return [];
  }
}

/**
 * Fetch HubSpot quotes
 */
export async function fetchHubSpotQuotes(limit?: number): Promise<HubSpotQuote[]> {
  if (!ACCESS_TOKEN) {
    console.warn("HUBSPOT_ACCESS_TOKEN not configured");
    return [];
  }

  try {
    const url = `${API_BASE}/crm/v3/objects/quotes`;
    const params = new URLSearchParams({
      limit: String(limit || 100),
      properties: "hs_title,hs_expiration_date,hs_quote_amount,hs_quote_currency_code",
      sort: "-createdAt",
    });

    const response = await fetch(`${url}?${params}`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      console.error(`HubSpot Quotes API Error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const quotes: HubSpotQuote[] = [];

    for (const q of data.results || []) {
      const props = q.properties || {};
      quotes.push({
        id: String(q.id),
        title: props.hs_title || "Untitled Quote",
        amount: props.hs_quote_amount ? parseFloat(props.hs_quote_amount) : undefined,
        expirationDate: props.hs_expiration_date || undefined,
      });
    }

    return quotes;
  } catch (error) {
    console.error("Error fetching HubSpot quotes:", error);
    return [];
  }
}

/**
 * Fetch HubSpot owners (users)
 */
export async function fetchHubSpotOwners(): Promise<HubSpotOwner[]> {
  if (!ACCESS_TOKEN) {
    console.warn("HUBSPOT_ACCESS_TOKEN not configured");
    return [];
  }

  try {
    const url = `${API_BASE}/crm/v3/owners`;
    const response = await fetch(url, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      console.error(`HubSpot Owners API Error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const owners: HubSpotOwner[] = [];

    for (const o of data.results || []) {
      owners.push({
        id: String(o.id),
        firstName: o.firstName || "",
        lastName: o.lastName || "",
        email: o.email || "",
        team: o.team || undefined,
      });
    }

    return owners;
  } catch (error) {
    console.error("Error fetching HubSpot owners:", error);
    return [];
  }
}
