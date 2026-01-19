/**
 * Fetch LinkedIn Ads data from HubSpot
 * 
 * This module fetches contacts, deals, and conversations
 * that originated from LinkedIn Ads campaigns.
 */

import {
  fetchHubSpotDeals,
  fetchHubSpotConversations,
  HubSpotDeal,
  HubSpotConversation,
} from '@/lib/mcp/hubspot';
import { LinkedInAdsContact } from '@/types/ads';

const API_BASE = process.env.HUBSPOT_API_BASE || "https://api.hubapi.com";
const ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;

function getHeaders() {
  return {
    "Authorization": `Bearer ${ACCESS_TOKEN}`,
    "Content-Type": "application/json"
  };
}

/**
 * Fetch contacts from HubSpot that came from LinkedIn Ads
 * Filters by UTM parameters: utm_source=linkedin, utm_medium=paid
 */
export async function fetchLinkedInAdsContacts(
  startDate?: string,
  endDate?: string,
  limit: number = 1000
): Promise<LinkedInAdsContact[]> {
  if (!ACCESS_TOKEN) {
    console.warn("HUBSPOT_ACCESS_TOKEN not configured");
    return [];
  }

  try {
    const url = `${API_BASE}/crm/v3/objects/contacts/search`;
    
    // Filter for LinkedIn-sourced contacts
    // Try multiple filter approaches since HubSpot may categorize LinkedIn as "PAID_SOCIAL"
    // or use different property names
    const filterGroups: any[] = [
      {
        filters: [
          {
            propertyName: "hs_analytics_source",
            operator: "EQ",
            value: "linkedin"
          }
        ]
      },
      {
        filters: [
          {
            propertyName: "hs_analytics_source",
            operator: "EQ",
            value: "PAID_SOCIAL"
          }
        ]
      },
      {
        filters: [
          {
            propertyName: "hs_analytics_source_data_1",
            operator: "CONTAINS_TOKEN",
            value: "linkedin"
          }
        ]
      },
      {
        filters: [
          {
            propertyName: "hs_analytics_source_data_2",
            operator: "CONTAINS_TOKEN",
            value: "linkedin"
          }
        ]
      }
    ];

    // Add date filter if provided
    if (startDate || endDate) {
      const dateFilters: any[] = [];
      if (startDate) {
        dateFilters.push({
          propertyName: "createdate",
          operator: "GTE",
          value: new Date(startDate).getTime().toString()
        });
      }
      if (endDate) {
        dateFilters.push({
          propertyName: "createdate",
          operator: "LTE",
          value: new Date(endDate).getTime().toString()
        });
      }
      if (dateFilters.length > 0) {
        filterGroups.push({ filters: dateFilters });
      }
    }

    const payload = {
      filterGroups,
      sorts: ["-createdate"],
      properties: [
        "firstname",
        "lastname",
        "email",
        "company",
        "jobtitle",
        "phone",
        "createdate",
        "hs_analytics_source",
        "hs_analytics_medium",
        "hs_analytics_campaign_name",
        "hs_analytics_first_touch_converting_campaign",
        "hs_analytics_source_data_1",
        "hs_analytics_source_data_2",
        "hs_analytics_first_touch_source",
        "hs_analytics_last_touch_source",
        "hs_social_linkedin",
        "recent_deal_amount",
        "num_associated_deals",
      ],
      limit,
    };

    const response = await fetch(url, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`HubSpot API Error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error("Error details:", errorText);
      return [];
    }

    const data = await response.json();
    let contacts: LinkedInAdsContact[] = [];

    // Process contacts from first query (linkedin, PAID_SOCIAL, etc.)
    for (const c of data.results || []) {
      const props = c.properties || {};
      const first = props.firstname || "";
      const last = props.lastname || "";
      const name = `${first} ${last}`.trim() || "Unnamed";

      // Check if this contact is LinkedIn-related
      const source = (props.hs_analytics_source || "").toLowerCase();
      const sourceData1 = (props.hs_analytics_source_data_1 || "").toLowerCase();
      const sourceData2 = (props.hs_analytics_source_data_2 || "").toLowerCase();
      const firstTouch = (props.hs_analytics_first_touch_source || "").toLowerCase();
      const lastTouch = (props.hs_analytics_last_touch_source || "").toLowerCase();
      
      // Determine if this is a LinkedIn contact
      const isLinkedIn = 
        source === "linkedin" ||
        sourceData1.includes("linkedin") ||
        sourceData2.includes("linkedin") ||
        firstTouch.includes("linkedin") ||
        lastTouch.includes("linkedin") ||
        // If source is PAID_SOCIAL, include all (we'll filter more precisely below)
        source === "paid_social";

      // Only include if it's LinkedIn-related
      if (isLinkedIn) {
        // Determine detection method
        let detectedSource = props.hs_analytics_source || "unknown";
        if (source === "paid_social") {
          // For PAID_SOCIAL, check if we have LinkedIn indicators
          if (sourceData1.includes("linkedin") || sourceData2.includes("linkedin") || props.hs_social_linkedin) {
            detectedSource = "PAID_SOCIAL (LinkedIn detected)";
          } else {
            // Include PAID_SOCIAL contacts as potential LinkedIn (since we can't be 100% sure)
            detectedSource = "PAID_SOCIAL (potential LinkedIn)";
          }
        } else if (source === "linkedin") {
          detectedSource = "linkedin";
        }

        contacts.push({
          id: String(c.id),
          name,
          email: props.email || "No Email",
          phone: props.phone || null,
          company: props.company || null,
          jobTitle: props.jobtitle || null,
          createdAt: props.createdate ? new Date(parseInt(props.createdate)).toISOString() : new Date().toISOString(),
          sourceCampaign: props.hs_analytics_campaign_name || props.hs_analytics_first_touch_converting_campaign || undefined,
          utmSource: props.hs_analytics_source || undefined,
          utmMedium: props.hs_analytics_medium || undefined,
          utmCampaign: props.hs_analytics_campaign_name || undefined,
          linkedInProfileUrl: props.hs_social_linkedin || undefined,
          detectedSource: detectedSource,
        });
      }
    }

    // If we got results, return them. Otherwise, try fetching PAID_SOCIAL contacts separately
    if (contacts.length > 0) {
      return contacts;
    }

    // Fallback: Fetch PAID_SOCIAL contacts separately and include all (since we can't distinguish)
    try {
      const fallbackPayload = {
        filterGroups: [
          {
            filters: [
              {
                propertyName: "hs_analytics_source",
                operator: "EQ",
                value: "PAID_SOCIAL"
              }
            ]
          }
        ],
        sorts: ["-createdate"],
        properties: [
          "firstname",
          "lastname",
          "email",
          "company",
          "jobtitle",
          "phone",
          "createdate",
          "hs_analytics_source",
          "hs_analytics_medium",
          "hs_analytics_campaign_name",
          "hs_analytics_first_touch_converting_campaign",
          "hs_analytics_source_data_1",
          "hs_analytics_source_data_2",
          "hs_social_linkedin",
        ],
        limit: Math.min(limit, 100), // Limit to 100 for fallback
      };

      const fallbackResponse = await fetch(url, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(fallbackPayload),
      });

      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        for (const c of fallbackData.results || []) {
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
            jobTitle: props.jobtitle || null,
            createdAt: props.createdate ? new Date(parseInt(props.createdate)).toISOString() : new Date().toISOString(),
            sourceCampaign: props.hs_analytics_campaign_name || props.hs_analytics_first_touch_converting_campaign || undefined,
            utmSource: props.hs_analytics_source || undefined,
            utmMedium: props.hs_analytics_medium || undefined,
            utmCampaign: props.hs_analytics_campaign_name || undefined,
            linkedInProfileUrl: props.hs_social_linkedin || undefined,
            detectedSource: "PAID_SOCIAL (may include LinkedIn)",
          });
        }
      }
    } catch (error) {
      console.error("Error in fallback PAID_SOCIAL fetch:", error);
    }

    return contacts;
  } catch (error) {
    console.error("Error fetching LinkedIn Ads contacts from HubSpot:", error);
    return [];
  }
}

/**
 * Fetch deals associated with LinkedIn Ads contacts
 */
export async function fetchLinkedInAdsDeals(
  contactIds: string[],
  startDate?: string,
  endDate?: string,
  linkedInContacts?: LinkedInAdsContact[]
): Promise<HubSpotDeal[]> {
  if (!ACCESS_TOKEN || contactIds.length === 0) {
    return [];
  }

  try {
    // Fetch all deals and filter for those associated with LinkedIn contacts
    const allDeals = await fetchHubSpotDeals(10000);
    
    // Filter deals by date range if provided
    let filteredDeals = allDeals.deals;
    
    if (startDate || endDate) {
      filteredDeals = filteredDeals.filter((deal) => {
        if (!deal.createdAt) return false;
        const dealDate = new Date(deal.createdAt);
        if (startDate && dealDate < new Date(startDate)) return false;
        if (endDate && dealDate > new Date(endDate)) return false;
        return true;
      });
    }

    // Filter deals that have LinkedIn as source or are associated with LinkedIn contacts
    const linkedInDeals = filteredDeals.filter((deal) => {
      // Check if deal source indicates LinkedIn
      const source = (deal.source || "").toLowerCase();
      const sourceData1 = (deal.sourceData1 || "").toLowerCase();
      const sourceData2 = (deal.sourceData2 || "").toLowerCase();
      
      if (source.includes("linkedin") || 
          sourceData1.includes("linkedin") || 
          sourceData2.includes("linkedin")) {
        return true;
      }
      
      // Check if deal is associated with a LinkedIn contact by email
      if (deal.contactEmail && linkedInContacts) {
        const linkedInContact = linkedInContacts.find(c => c.email === deal.contactEmail);
        if (linkedInContact) return true;
      }
      
      return false;
    });

    return linkedInDeals;
  } catch (error) {
    console.error("Error fetching LinkedIn Ads deals from HubSpot:", error);
    return [];
  }
}

/**
 * Fetch conversations from LinkedIn Ads leads
 */
export async function fetchLinkedInAdsConversations(
  contactIds: string[],
  limit: number = 100
): Promise<HubSpotConversation[]> {
  if (!ACCESS_TOKEN || contactIds.length === 0) {
    return [];
  }

  try {
    // Fetch all conversations
    const conversationsData = await fetchHubSpotConversations(limit);
    
    // Filter conversations associated with LinkedIn contacts
    // Note: This would require checking conversation associations
    // For now, return all conversations and filter client-side if needed
    return conversationsData.threads;
  } catch (error) {
    console.error("Error fetching LinkedIn Ads conversations from HubSpot:", error);
    return [];
  }
}

/**
 * Get deal associations for contacts
 * This requires additional API calls to get associations
 */
export async function getContactDealAssociations(contactId: string): Promise<string[]> {
  if (!ACCESS_TOKEN) return [];

  try {
    const url = `${API_BASE}/crm/v4/objects/contacts/${contactId}/associations/deals`;
    const response = await fetch(url, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return (data.results || []).map((r: any) => String(r.toObjectId));
  } catch (error) {
    console.error("Error fetching contact deal associations:", error);
    return [];
  }
}
