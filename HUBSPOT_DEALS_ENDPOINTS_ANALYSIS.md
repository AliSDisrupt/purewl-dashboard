# HubSpot Deals Endpoints Analysis

## Overview
This document lists all endpoints used to fetch deals from HubSpot in the application.

---

## 1. Main Deals Endpoint

### **`/api/hubspot/deals`**
**Location:** `app/api/hubspot/deals/route.ts`

**Backend Function:** `fetchHubSpotDeals()` in `lib/mcp/hubspot.ts`

**HubSpot API Endpoint:**
```
GET https://api.hubapi.com/crm/v3/objects/deals
```

**Query Parameters:**
- `limit`: 100 (max per page, paginated)
- `properties`: `dealname,amount,dealstage,closedate,pipeline,createdate,hs_analytics_source,hs_analytics_source_data_1,hs_analytics_source_data_2`
- `sort`: `-createdAt` (newest first)
- `after`: Pagination cursor (if more pages exist)

**Properties Fetched:**
- `dealname` - Deal name
- `amount` - Deal value/amount
- `dealstage` - Current stage in pipeline
- `closedate` - Expected/actual close date
- `pipeline` - Pipeline name
- `createdate` - Creation date
- `hs_analytics_source` - Source tracking (may contain "LinkedIn", "Google", etc.)
- `hs_analytics_source_data_1` - Additional source data
- `hs_analytics_source_data_2` - Additional source data

**Pagination:**
- Fetches ALL deals (paginated, up to 100k deals)
- Uses cursor-based pagination (`after` parameter)
- Processes 100 deals per page

**Response Structure:**
```typescript
{
  deals: HubSpotDeal[],
  summary: {
    totalDeals: number,
    totalValue: number,
    byStage: Record<string, number>
  }
}
```

**Used By:**
- Main dashboard (`/`) - Pipeline value
- Funnel page (`/funnel`) - Deal summary
- CRM page (`/crm`) - Deal listing
- Funnel API (`/api/funnel`) - Deal creation filtering
- Deal sources API (`/api/funnel/deal-sources`) - Source attribution
- Health check (`/api/health`) - Connection test
- Settings status (`/api/settings/status`) - Integration status

---

## 2. Deals by Stage Endpoint

### **`/api/hubspot/deals-by-stage`**
**Location:** `app/api/hubspot/deals-by-stage/route.ts`

**Backend Function:** Uses `fetchHubSpotDeals()` then filters by stage

**HubSpot API Endpoint:**
```
GET https://api.hubapi.com/crm/v3/objects/deals
```
(Same as main deals endpoint, but filters results client-side)

**Query Parameters:**
- `startDate` - Start date for filtering (default: "30daysAgo")
- `endDate` - End date for filtering (default: "yesterday")
- `stage` - Optional stage filter (e.g., "disqualified", "closed won", "requirements received")

**Filtering Logic:**
1. Fetches ALL deals using `fetchHubSpotDeals()`
2. Filters by `createdAt` date within date range
3. Optionally filters by stage name (case-insensitive, flexible matching)

**Stage Matching:**
- Exact match
- Contains match
- Normalized match (removes spaces, dashes, underscores)

**Response Structure:**
```typescript
{
  deals: HubSpotDeal[],
  summary: {
    total: number,
    byStage: Record<string, number>,
    stageDetails: Record<string, { count: number, totalValue: number }>
  },
  dateRange: {
    start: string,
    end: string
  }
}
```

**Used By:**
- Funnel page (`/funnel`) - For filtering deals by stage:
  - All deals created (no stage filter)
  - Disqualified deals (`stage=disqualified`)
  - Requirements received (`stage=requirements received`)
  - Closed won deals (`stage=closed won`)

---

## 3. MCP HubSpot Endpoint

### **`/api/mcp/hubspot`**
**Location:** `app/api/mcp/hubspot/route.ts`

**Tool:** `get_hubspot_deals`

**Backend Function:** `fetchHubSpotDeals(limit)`

**Used By:**
- Claude AI chat interface
- MCP (Model Context Protocol) integration

**Parameters:**
- `limit` - Optional limit on number of deals to return

---

## Summary of All Deals Endpoints

| Endpoint | Purpose | HubSpot API Call | Properties |
|----------|---------|------------------|------------|
| `/api/hubspot/deals` | Get all deals | `GET /crm/v3/objects/deals` | dealname, amount, dealstage, closedate, pipeline, createdate, hs_analytics_source, hs_analytics_source_data_1, hs_analytics_source_data_2 |
| `/api/hubspot/deals-by-stage` | Get deals filtered by stage and date | `GET /crm/v3/objects/deals` (then filtered) | Same as above, filtered client-side |
| `/api/mcp/hubspot` (get_hubspot_deals) | MCP tool for AI access | `GET /crm/v3/objects/deals` | Same as above |

---

## Properties Breakdown

### Core Deal Properties:
- **dealname** - Deal name/title
- **amount** - Deal value (can be string or number)
- **dealstage** - Current pipeline stage
- **closedate** - Expected or actual close date
- **pipeline** - Which pipeline the deal belongs to
- **createdate** - When the deal was created

### Source Tracking Properties:
- **hs_analytics_source** - Primary source (e.g., "LinkedIn", "Google", "Organic")
- **hs_analytics_source_data_1** - Additional source metadata
- **hs_analytics_source_data_2** - Additional source metadata

---

## Usage Across Application

### Pages Using Deals:
1. **Main Dashboard** (`/`) - Shows pipeline value
2. **Funnel Page** (`/funnel`) - Shows deals by stage in conversion funnel
3. **CRM Page** (`/crm`) - Lists all deals

### APIs Using Deals:
1. **Funnel API** (`/api/funnel`) - Calculates deals created and closed-won revenue
2. **Deal Sources API** (`/api/funnel/deal-sources`) - Attribution by source
3. **Health Check** (`/api/health`) - Tests HubSpot connection
4. **Settings Status** (`/api/settings/status`) - Checks integration status

---

## Notes

1. **Pagination:** The main deals endpoint fetches ALL deals (up to 100k) using pagination
2. **Date Filtering:** The deals-by-stage endpoint filters by `createdAt` date, not `closedate`
3. **Stage Matching:** Flexible matching handles variations like "closed won", "closed-won", "closedwon"
4. **Source Tracking:** Uses HubSpot's analytics source properties for attribution
5. **Performance:** Fetches 100 deals per page for efficiency
