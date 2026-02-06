/**
 * MCP Tool Definitions for Claude Agent
 * 
 * These tools allow Claude to interact with LinkedIn, HubSpot, GA4, and Reddit data
 */

export const mcpTools = [
  // LinkedIn Tools
  {
    name: "list_linkedin_accounts",
    description: "List all LinkedIn ad accounts. Returns account IDs, names, and basic info.",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: []
    }
  },
  {
    name: "get_linkedin_account_details",
    description: "Get detailed information about LinkedIn ad accounts including campaign counts and analytics.",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: []
    }
  },
  {
    name: "get_linkedin_campaigns",
    description: "Get LinkedIn campaigns for a specific account. Include analytics if needed.",
    input_schema: {
      type: "object" as const,
      properties: {
        accountId: {
          type: "string",
          description: "LinkedIn account ID (e.g., '514469053' or URN format)"
        },
        includeAnalytics: {
          type: "boolean",
          description: "Whether to include campaign analytics data",
          default: false
        }
      },
      required: ["accountId"]
    }
  },
  {
    name: "get_linkedin_analytics",
    description: "Get analytics data for a LinkedIn ad account (impressions, clicks, spend, conversions).",
    input_schema: {
      type: "object" as const,
      properties: {
        accountId: {
          type: "string",
          description: "LinkedIn account ID"
        },
        daysBack: {
          type: "number",
          description: "Number of days to look back (default: 30)",
          default: 30
        }
      },
      required: ["accountId"]
    }
  },
  {
    name: "get_linkedin_campaign_analytics",
    description: "Get analytics for specific LinkedIn campaigns. Provide campaign IDs and account ID.",
    input_schema: {
      type: "object" as const,
      properties: {
        campaignIds: {
          type: "array",
          items: { type: "string" },
          description: "Array of campaign IDs"
        },
        accountId: {
          type: "string",
          description: "LinkedIn account ID"
        },
        daysBack: {
          type: "number",
          description: "Number of days to look back (default: 30)",
          default: 30
        }
      },
      required: ["campaignIds", "accountId"]
    }
  },
  
  // HubSpot Tools
  {
    name: "get_hubspot_deals",
    description: "Get HubSpot deals. Can filter by limit and search query.",
    input_schema: {
      type: "object" as const,
      properties: {
        limit: {
          type: "number",
          description: "Maximum number of deals to return",
          default: 10
        },
        query: {
          type: "string",
          description: "Search query to filter deals"
        }
      },
      required: []
    }
  },
  {
    name: "search_hubspot_contacts",
    description: "Search for HubSpot contacts by name, email, or other criteria.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description: "Search query (name, email, etc.)"
        },
        limit: {
          type: "number",
          description: "Maximum number of contacts to return",
          default: 10
        }
      },
      required: []
    }
  },
  {
    name: "get_hubspot_companies",
    description: "Get HubSpot companies. Can filter by limit and search query.",
    input_schema: {
      type: "object" as const,
      properties: {
        limit: {
          type: "number",
          description: "Maximum number of companies to return",
          default: 10
        },
        query: {
          type: "string",
          description: "Search query to filter companies"
        }
      },
      required: []
    }
  },
  {
    name: "get_hubspot_conversations",
    description: "Get HubSpot conversations/threads. Can filter by threadId or get all.",
    input_schema: {
      type: "object" as const,
      properties: {
        threadId: {
          type: "string",
          description: "Specific thread ID to get"
        },
        limit: {
          type: "number",
          description: "Maximum number of conversations to return",
          default: 10
        }
      },
      required: []
    }
  },
  {
    name: "get_hubspot_calls",
    description: "Get HubSpot calls/phone call records.",
    input_schema: {
      type: "object" as const,
      properties: {
        limit: {
          type: "number",
          description: "Maximum number of calls to return",
          default: 10
        }
      },
      required: []
    }
  },
  {
    name: "get_hubspot_emails",
    description: "Get HubSpot email records and communications.",
    input_schema: {
      type: "object" as const,
      properties: {
        limit: {
          type: "number",
          description: "Maximum number of emails to return",
          default: 10
        }
      },
      required: []
    }
  },
  {
    name: "get_hubspot_meetings",
    description: "Get HubSpot meeting records and scheduled meetings.",
    input_schema: {
      type: "object" as const,
      properties: {
        limit: {
          type: "number",
          description: "Maximum number of meetings to return",
          default: 10
        }
      },
      required: []
    }
  },
  {
    name: "get_hubspot_tasks",
    description: "Get HubSpot task records and to-do items.",
    input_schema: {
      type: "object" as const,
      properties: {
        limit: {
          type: "number",
          description: "Maximum number of tasks to return",
          default: 10
        }
      },
      required: []
    }
  },
  {
    name: "get_hubspot_tickets",
    description: "Get HubSpot support tickets.",
    input_schema: {
      type: "object" as const,
      properties: {
        limit: {
          type: "number",
          description: "Maximum number of tickets to return",
          default: 10
        }
      },
      required: []
    }
  },
  {
    name: "get_hubspot_products",
    description: "Get HubSpot products catalog.",
    input_schema: {
      type: "object" as const,
      properties: {
        limit: {
          type: "number",
          description: "Maximum number of products to return",
          default: 10
        }
      },
      required: []
    }
  },
  {
    name: "get_hubspot_line_items",
    description: "Get HubSpot line items (product line items for deals).",
    input_schema: {
      type: "object" as const,
      properties: {
        limit: {
          type: "number",
          description: "Maximum number of line items to return",
          default: 10
        }
      },
      required: []
    }
  },
  {
    name: "get_hubspot_quotes",
    description: "Get HubSpot quotes/proposals.",
    input_schema: {
      type: "object" as const,
      properties: {
        limit: {
          type: "number",
          description: "Maximum number of quotes to return",
          default: 10
        }
      },
      required: []
    }
  },
  {
    name: "get_hubspot_owners",
    description: "Get HubSpot owners (users/team members).",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: []
    }
  },
  {
    name: "get_hubspot_pipelines",
    description: "Get HubSpot deal pipelines and their stages (same as /api/hubspot/pipelines).",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: []
    }
  },
  {
    name: "get_hubspot_deals_by_stage",
    description: "Get HubSpot deals grouped by stage within a date range (same as /api/hubspot/deals-by-stage). Uses same stage naming as the dashboard (e.g. Lead Generated, Email sent, Conversation initiated, Won, Lost).",
    input_schema: {
      type: "object" as const,
      properties: {
        startDate: {
          type: "string",
          description: "Start date: '30daysAgo', '7daysAgo', 'yesterday', or YYYY-MM-DD",
          default: "30daysAgo"
        },
        endDate: {
          type: "string",
          description: "End date: 'yesterday', 'today', or YYYY-MM-DD",
          default: "yesterday"
        },
        stage: {
          type: "string",
          description: "Optional stage ID or name to filter deals (e.g. 143589765 for Won, 143589766 for Lost)"
        }
      },
      required: []
    }
  },

  // GA4 Tools
  {
    name: "get_ga4_overview",
    description: "Get Google Analytics 4 overview data (users, sessions, page views, engagement metrics, bounce rate, average session duration). This is the PRIMARY tool for traffic statistics. Use this for general traffic data. For real-time data (active users right now), use get_ga4_realtime, but if that fails, this tool provides recent traffic statistics.",
    input_schema: {
      type: "object" as const,
      properties: {
        startDate: {
          type: "string",
          description: "Start date (e.g., '7daysAgo', '30daysAgo', 'today', or '2024-01-01')",
          default: "7daysAgo"
        },
        endDate: {
          type: "string",
          description: "End date (e.g., 'yesterday', 'today', or '2024-01-31')",
          default: "yesterday"
        }
      },
      required: []
    }
  },
  {
    name: "get_ga4_campaigns",
    description: "Get GA4 campaign performance data with source and medium breakdown.",
    input_schema: {
      type: "object" as const,
      properties: {
        startDate: {
          type: "string",
          description: "Start date",
          default: "30daysAgo"
        },
        endDate: {
          type: "string",
          description: "End date",
          default: "yesterday"
        }
      },
      required: []
    }
  },
  {
    name: "get_ga4_ads",
    description: "Get GA4 ads data for Reddit and FluentForm campaigns.",
    input_schema: {
      type: "object" as const,
      properties: {
        startDate: {
          type: "string",
          description: "Start date",
          default: "30daysAgo"
        },
        endDate: {
          type: "string",
          description: "End date",
          default: "yesterday"
        }
      },
      required: []
    }
  },
  {
    name: "get_ga4_geography",
    description: "Get GA4 geographic data showing users and sessions by country.",
    input_schema: {
      type: "object" as const,
      properties: {
        startDate: {
          type: "string",
          description: "Start date",
          default: "30daysAgo"
        },
        endDate: {
          type: "string",
          description: "End date",
          default: "yesterday"
        }
      },
      required: []
    }
  },
  {
    name: "get_ga4_traffic",
    description: "Get GA4 traffic data with channel breakdown and device categories.",
    input_schema: {
      type: "object" as const,
      properties: {
        startDate: {
          type: "string",
          description: "Start date",
          default: "30daysAgo"
        },
        endDate: {
          type: "string",
          description: "End date",
          default: "yesterday"
        }
      },
      required: []
    }
  },
  {
    name: "get_ga4_top_pages",
    description: "Get GA4 top pages by users and page views.",
    input_schema: {
      type: "object" as const,
      properties: {
        startDate: {
          type: "string",
          description: "Start date",
          default: "30daysAgo"
        },
        endDate: {
          type: "string",
          description: "End date",
          default: "yesterday"
        }
      },
      required: []
    }
  },
  {
    name: "get_ga4_acquisition",
    description: "Get GA4 user acquisition data (first user source, medium, campaign).",
    input_schema: {
      type: "object" as const,
      properties: {
        startDate: {
          type: "string",
          description: "Start date",
          default: "30daysAgo"
        },
        endDate: {
          type: "string",
          description: "End date",
          default: "yesterday"
        }
      },
      required: []
    }
  },
  {
    name: "get_ga4_content",
    description: "Get GA4 content performance data (page titles, paths, engagement).",
    input_schema: {
      type: "object" as const,
      properties: {
        startDate: {
          type: "string",
          description: "Start date",
          default: "30daysAgo"
        },
        endDate: {
          type: "string",
          description: "End date",
          default: "yesterday"
        }
      },
      required: []
    }
  },
  {
    name: "get_ga4_conversion_paths",
    description: "Get GA4 conversion paths showing which sources/mediums lead to conversions.",
    input_schema: {
      type: "object" as const,
      properties: {
        startDate: {
          type: "string",
          description: "Start date",
          default: "30daysAgo"
        },
        endDate: {
          type: "string",
          description: "End date",
          default: "yesterday"
        }
      },
      required: []
    }
  },
  {
    name: "get_ga4_demographics",
    description: "Get GA4 demographics data (age groups and gender).",
    input_schema: {
      type: "object" as const,
      properties: {
        startDate: {
          type: "string",
          description: "Start date",
          default: "30daysAgo"
        },
        endDate: {
          type: "string",
          description: "End date",
          default: "yesterday"
        }
      },
      required: []
    }
  },
  {
    name: "get_ga4_events",
    description: "Get GA4 top events and event performance data.",
    input_schema: {
      type: "object" as const,
      properties: {
        startDate: {
          type: "string",
          description: "Start date",
          default: "30daysAgo"
        },
        endDate: {
          type: "string",
          description: "End date",
          default: "yesterday"
        }
      },
      required: []
    }
  },
  {
    name: "get_ga4_fluid_fusion",
    description: "Get GA4 Fluid Fusion forms data (Reddit, Google Ads, Website traffic).",
    input_schema: {
      type: "object" as const,
      properties: {
        startDate: {
          type: "string",
          description: "Start date",
          default: "30daysAgo"
        },
        endDate: {
          type: "string",
          description: "End date",
          default: "yesterday"
        }
      },
      required: []
    }
  },
  {
    name: "get_ga4_realtime",
    description: "Get GA4 real-time data (active users, current page views, by country/device).",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: []
    }
  },
  {
    name: "get_ga4_retention",
    description: "Get GA4 user retention data showing new vs returning users over time.",
    input_schema: {
      type: "object" as const,
      properties: {
        startDate: {
          type: "string",
          description: "Start date",
          default: "30daysAgo"
        },
        endDate: {
          type: "string",
          description: "End date",
          default: "yesterday"
        }
      },
      required: []
    }
  },
  {
    name: "get_ga4_search_terms",
    description: "Get GA4 site search terms data (if site search is configured).",
    input_schema: {
      type: "object" as const,
      properties: {
        startDate: {
          type: "string",
          description: "Start date",
          default: "30daysAgo"
        },
        endDate: {
          type: "string",
          description: "End date",
          default: "yesterday"
        }
      },
      required: []
    }
  },
  {
    name: "get_ga4_source_medium",
    description: "Get GA4 source/medium breakdown showing traffic sources and mediums.",
    input_schema: {
      type: "object" as const,
      properties: {
        startDate: {
          type: "string",
          description: "Start date",
          default: "30daysAgo"
        },
        endDate: {
          type: "string",
          description: "End date",
          default: "yesterday"
        }
      },
      required: []
    }
  },
  {
    name: "get_ga4_technology",
    description: "Get GA4 technology data (browsers and operating systems).",
    input_schema: {
      type: "object" as const,
      properties: {
        startDate: {
          type: "string",
          description: "Start date",
          default: "30daysAgo"
        },
        endDate: {
          type: "string",
          description: "End date",
          default: "yesterday"
        }
      },
      required: []
    }
  },
  {
    name: "get_ga4_time_patterns",
    description: "Get GA4 time-based patterns (hour of day and day of week analysis).",
    input_schema: {
      type: "object" as const,
      properties: {
        startDate: {
          type: "string",
          description: "Start date",
          default: "30daysAgo"
        },
        endDate: {
          type: "string",
          description: "End date",
          default: "yesterday"
        }
      },
      required: []
    }
  },
  {
    name: "get_ga4_geography_source_medium",
    description: "Get GA4 data combining country and source/medium dimensions. Use this to answer questions like 'what sources are bringing traffic from China' or 'what countries are getting traffic from LinkedIn'. Optionally filter by a specific country. This tool has automatic fallback if the combined query fails - it will automatically try alternative methods to get the data.",
    input_schema: {
      type: "object" as const,
      properties: {
        startDate: {
          type: "string",
          description: "Start date",
          default: "30daysAgo"
        },
        endDate: {
          type: "string",
          description: "End date",
          default: "yesterday"
        },
        country: {
          type: "string",
          description: "Optional: Filter by specific country name (e.g., 'China', 'United States'). The tool will automatically match country names even if not exact."
        }
      },
      required: []
    }
  },
  
  // Reddit Tools
  {
    name: "get_reddit_posts",
    description: "Get Reddit posts from a specific subreddit. Useful for monitoring mentions.",
    input_schema: {
      type: "object" as const,
      properties: {
        subreddit: {
          type: "string",
          description: "Subreddit name (e.g., 'vpn', 'privacy')",
          default: "vpn"
        },
        limit: {
          type: "number",
          description: "Maximum number of posts to return",
          default: 10
        },
        query: {
          type: "string",
          description: "Search query to filter posts"
        }
      },
      required: []
    }
  },
  
  // Windsor AI Ads Tools
  {
    name: "get_windsor_ai_google_ads",
    description: "Get Google Ads performance data from Windsor AI (impressions, clicks, spend, conversions, CTR, CPC).",
    input_schema: {
      type: "object" as const,
      properties: {
        startDate: {
          type: "string",
          description: "Start date (YYYY-MM-DD format or '30daysAgo')",
          default: "30daysAgo"
        },
        endDate: {
          type: "string",
          description: "End date (YYYY-MM-DD format or 'yesterday')",
          default: "yesterday"
        },
        accountName: {
          type: "string",
          description: "Google Ads account name",
          default: "PureVPN B2B - Business VPN"
        }
      },
      required: []
    }
  },
  {
    name: "get_windsor_ai_reddit_ads",
    description: "Get Reddit Ads performance data from Windsor AI (impressions, clicks, spend, conversions, CTR, CPC).",
    input_schema: {
      type: "object" as const,
      properties: {
        startDate: {
          type: "string",
          description: "Start date (YYYY-MM-DD format or '30daysAgo')",
          default: "30daysAgo"
        },
        endDate: {
          type: "string",
          description: "End date (YYYY-MM-DD format or 'yesterday')",
          default: "yesterday"
        },
        accountName: {
          type: "string",
          description: "Reddit Ads account name",
          default: "admin_PureWL"
        }
      },
      required: []
    }
  },
  {
    name: "get_windsor_ai_linkedin_ads",
    description: "Get LinkedIn Ads performance data from Windsor AI (impressions, clicks, spend, conversions, CTR, CPC).",
    input_schema: {
      type: "object" as const,
      properties: {
        startDate: {
          type: "string",
          description: "Start date (YYYY-MM-DD format)",
          default: "30daysAgo"
        },
        endDate: {
          type: "string",
          description: "End date (YYYY-MM-DD format)",
          default: "yesterday"
        },
        accountName: {
          type: "string",
          description: "LinkedIn Ads account name",
          default: "PureVPN - Partner & Enterprise Solution"
        }
      },
      required: []
    }
  },
  {
    name: "get_windsor_ai_all_ads",
    description: "Get all ads performance data from Windsor AI (Google Ads, Reddit Ads, LinkedIn Ads) in one call.",
    input_schema: {
      type: "object" as const,
      properties: {
        startDate: {
          type: "string",
          description: "Start date (YYYY-MM-DD format)",
          default: "30daysAgo"
        },
        endDate: {
          type: "string",
          description: "End date (YYYY-MM-DD format)",
          default: "yesterday"
        }
      },
      required: []
    }
  }
];

export type MCPToolName = typeof mcpTools[number]['name'];
