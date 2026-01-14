# HubSpot Deal Stages Being Fetched

## Overview
This document lists all deal stages that are being fetched and used in the application.

---

## Stages Specifically Queried

The application makes **4 specific queries** for deal stages on the Funnel page:

### 1. **All Deals Created** (No Stage Filter)
- **Query:** `/api/hubspot/deals-by-stage?startDate={startDate}&endDate={endDate}`
- **Stage Filter:** None (fetches all deals in date range)
- **Purpose:** Count all deals created in the date range
- **Used For:** "Deal Created" funnel stage

### 2. **Disqualified Leads**
- **Query:** `/api/hubspot/deals-by-stage?startDate={startDate}&endDate={endDate}&stage=disqualified`
- **Stage Filter:** `"disqualified"`
- **Matching:** Case-insensitive, flexible matching (handles "Disqualified", "disqualified", etc.)
- **Purpose:** Count deals in disqualified stage
- **Used For:** "Disqualified Lead" funnel stage

### 3. **Requirements Received**
- **Query:** `/api/hubspot/deals-by-stage?startDate={startDate}&endDate={endDate}&stage=requirements received`
- **Stage Filter:** `"requirements received"`
- **Matching:** Case-insensitive, flexible matching (handles "Requirements Received", "requirements-received", etc.)
- **Purpose:** Count deals in requirements received stage
- **Used For:** "Requirements Received" funnel stage

### 4. **Closed Won**
- **Query:** `/api/hubspot/deals-by-stage?startDate={startDate}&endDate={endDate}&stage=closed won`
- **Stage Filter:** `"closed won"`
- **Matching:** Case-insensitive, flexible matching (handles "Closed Won", "closed-won", "closedwon", etc.)
- **Purpose:** Count deals in closed-won stage and calculate revenue
- **Used For:** "Won" funnel stage (shows revenue)

---

## All Stages Fetched

**Important:** The application fetches **ALL deals** from HubSpot, which means it retrieves deals in **ALL stages** that exist in your HubSpot account.

### How It Works:
1. **Main Fetch:** `fetchHubSpotDeals()` fetches ALL deals (paginated, up to 100k deals)
2. **Stage Grouping:** The `summary.byStage` object contains counts for **every stage** that exists in your HubSpot deals
3. **Stage Details:** The `summary.stageDetails` object contains count and total value for each stage

### Example Response Structure:
```typescript
{
  deals: HubSpotDeal[],
  summary: {
    totalDeals: number,
    totalValue: number,
    byStage: {
      "appointmentscheduled": 5,
      "qualifiedtobuy": 10,
      "presentationscheduled": 8,
      "decisionmakerboughtin": 12,
      "contractsent": 6,
      "closedwon": 15,
      "closedlost": 3,
      "disqualified": 2,
      "requirements received": 4,
      // ... all other stages in your HubSpot pipeline
    }
  }
}
```

---

## Stage Matching Logic

The application uses **flexible stage matching** to handle variations in stage names:

### Matching Methods:
1. **Exact Match:** `"closed won" === "closed won"`
2. **Contains Match:** `"closed won"` matches `"closed-won"` or `"closedwon"`
3. **Normalized Match:** Removes spaces, dashes, underscores before comparing
   - `"closed won"` → `"closedwon"`
   - `"closed-won"` → `"closedwon"`
   - `"closed_won"` → `"closedwon"`

### Case Insensitive:
- All matching is case-insensitive
- `"Disqualified"` matches `"disqualified"` matches `"DISQUALIFIED"`

---

## Stages Used in Funnel

The funnel page displays these stages in order:

1. **Total Traffic** (GA4) - Not a deal stage
2. **Deal Created** - All deals created (no stage filter)
3. **Disqualified Lead** - Deals in "disqualified" stage
4. **Email Sent** - Not a deal stage (from emails)
5. **Conversations Initiated** - Not a deal stage (from first response)
6. **Requirements Received** - Deals in "requirements received" stage
7. **Won** - Deals in "closed won" stage (shows revenue)

---

## Other Stage References

### In Deal Sources API (`/api/funnel/deal-sources`):
- Filters for deals with stage: `"closedwon"` or `"closed won"` (for revenue calculation)

### In Webhook Handler (`/api/webhooks/rb2b-visitor`):
- Excludes deals with stages containing: `"closed"`, `"closedwon"`, `"closed lost"`, `"closedlost"`
- Only returns open deals (not in closed stages)

---

## Summary

### Stages Specifically Queried:
1. ✅ **All deals** (no filter) - for "Deal Created"
2. ✅ **"disqualified"** - for "Disqualified Lead"
3. ✅ **"requirements received"** - for "Requirements Received"
4. ✅ **"closed won"** - for "Won" (revenue)

### All Stages Available:
- The application fetches **ALL deals** from HubSpot
- This means it has access to deals in **ALL stages** that exist in your HubSpot account
- The `summary.byStage` object contains counts for every stage
- You can query any stage by name using the `/api/hubspot/deals-by-stage` endpoint

### Stage Names in Your HubSpot:
The actual stage names depend on your HubSpot pipeline configuration. Common stages include:
- Appointments Scheduled
- Qualified To Buy
- Presentation Scheduled
- Decision Maker Bought-In
- Contract Sent
- Closed Won
- Closed Lost
- Disqualified
- Requirements Received
- (And any custom stages you've created)

---

## How to See All Your Stages

To see all stages that exist in your HubSpot account, you can:

1. **Check the API response:**
   ```javascript
   const response = await fetch('/api/hubspot/deals');
   const data = await response.json();
   console.log(data.summary.byStage); // Shows all stages with counts
   ```

2. **Check HubSpot directly:**
   - Go to HubSpot → Sales → Deals → Pipelines
   - View your pipeline stages

3. **Query a specific stage:**
   ```javascript
   const response = await fetch('/api/hubspot/deals-by-stage?startDate=30daysAgo&endDate=yesterday&stage=YOUR_STAGE_NAME');
   ```
