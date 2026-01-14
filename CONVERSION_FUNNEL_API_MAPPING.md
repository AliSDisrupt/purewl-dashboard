# Conversion Funnel to API Mapping

## Overview
This document maps each stage in the conversion funnel to the specific API endpoints being called.

---

## Conversion Funnel Stages → API Endpoints

### 1. **Total Traffic** 👁
**Funnel Stage:** Total Traffic  
**Data Source:** GA4 (Google Analytics 4)  
**API Endpoint:** `/api/ga4/overview`  
**Query Function:** `fetchGA4Overview(startDate, endDate)`  
**Metric Used:** `sessions` (total sessions)  
**HubSpot API:** ❌ Not using HubSpot  

---

### 2. **Deal Created** 🤝
**Funnel Stage:** Deal Created  
**Data Source:** HubSpot  
**API Endpoint:** `/api/hubspot/deals-by-stage`  
**Query Function:** `fetchDealsByStage(startDate, endDate)` (no stage parameter)  
**HubSpot API Call:** `GET /crm/v3/objects/deals`  
**Filter Applied:** 
- Date range: `createdAt` between `startDate` and `endDate`
- Stage filter: **None** (fetches all deals created in date range)
**Code Location:**
```typescript
const { data: dealsCreatedData } = useQuery({
  queryKey: ["hubspot-deals-created", dateRange.startDate, dateRange.endDate],
  queryFn: () => fetchDealsByStage(dateRange.startDate, dateRange.endDate),
});
```
**Value Used:** `dealsCreatedData?.summary?.total`

---

### 3. **Disqualified Lead** ❌
**Funnel Stage:** Disqualified Lead  
**Data Source:** HubSpot  
**API Endpoint:** `/api/hubspot/deals-by-stage?stage=disqualified`  
**Query Function:** `fetchDealsByStage(startDate, endDate, "disqualified")`  
**HubSpot API Call:** `GET /crm/v3/objects/deals` (then filtered client-side)  
**Filter Applied:**
- Date range: `createdAt` between `startDate` and `endDate`
- Stage filter: `stage="disqualified"` (case-insensitive, flexible matching)
**Code Location:**
```typescript
const { data: disqualifiedDealsData } = useQuery({
  queryKey: ["hubspot-deals-disqualified", dateRange.startDate, dateRange.endDate],
  queryFn: () => fetchDealsByStage(dateRange.startDate, dateRange.endDate, "disqualified"),
});
```
**Value Used:** `disqualifiedDealsData?.summary?.total`  
**Stage Matching:** Handles "Disqualified", "disqualified", "DISQUALIFIED", etc.

---

### 4. **Email Sent** 📧 (Conversations Started)
**Funnel Stage:** Email Sent  
**Data Source:** HubSpot  
**API Endpoint:** `/api/hubspot/emails-sent`  
**Query Function:** `fetchEmailsSent(startDate, endDate)`  
**HubSpot API Call:** `GET /crm/v3/objects/emails`  
**Filter Applied:**
- Date range: `hs_timestamp` (sent date) between `startDate` and `endDate`
- Only counts emails that were actually sent
**Code Location:**
```typescript
const { data: emailsSentData } = useQuery({
  queryKey: ["hubspot-emails-sent", dateRange.startDate, dateRange.endDate],
  queryFn: () => fetchEmailsSent(dateRange.startDate, dateRange.endDate),
});
```
**Value Used:** `emailsSentData?.emailsSent`  
**Properties Fetched:** `hs_email_subject, hs_email_text, hs_email_from_firstname, hs_email_from_lastname, hs_email_to_email, hs_timestamp, hs_email_status`

---

### 5. **Conversations Initiated** 💬 (First Response)
**Funnel Stage:** Conversations Initiated  
**Data Source:** HubSpot  
**API Endpoint:** `/api/hubspot/first-response`  
**Query Function:** `fetchFirstResponse(startDate, endDate)`  
**HubSpot API Call:** `GET /crm/v3/objects/emails` (multiple calls to analyze email threads)  
**Filter Applied:**
- Date range: First outbound email date between `startDate` and `endDate`
- Logic: Finds first outbound email sent after an inbound email
**Code Location:**
```typescript
const { data: firstResponseData } = useQuery({
  queryKey: ["hubspot-first-response", dateRange.startDate, dateRange.endDate],
  queryFn: () => fetchFirstResponse(dateRange.startDate, dateRange.endDate),
});
```
**Value Used:** `firstResponseData?.firstResponseCount`  
**Calculation:** Groups emails by recipient, finds first inbound email, then first outbound response after that

---

### 6. **Requirements Received** 📋
**Funnel Stage:** Requirements Received  
**Data Source:** HubSpot  
**API Endpoint:** `/api/hubspot/deals-by-stage?stage=requirements received`  
**Query Function:** `fetchDealsByStage(startDate, endDate, "requirements received")`  
**HubSpot API Call:** `GET /crm/v3/objects/deals` (then filtered client-side)  
**Filter Applied:**
- Date range: `createdAt` between `startDate` and `endDate`
- Stage filter: `stage="requirements received"` (case-insensitive, flexible matching)
**Code Location:**
```typescript
const { data: requirementsReceivedData } = useQuery({
  queryKey: ["hubspot-deals-requirements", dateRange.startDate, dateRange.endDate],
  queryFn: () => fetchDealsByStage(dateRange.startDate, dateRange.endDate, "requirements received"),
});
```
**Value Used:** `requirementsReceivedData?.summary?.total`  
**Stage Matching:** Handles "Requirements Received", "requirements-received", "requirementsreceived", etc.

---

### 7. **Won** 💰 (Closed-Won Revenue)
**Funnel Stage:** Won  
**Data Source:** HubSpot  
**API Endpoint:** `/api/hubspot/deals-by-stage?stage=closed won`  
**Query Function:** `fetchDealsByStage(startDate, endDate, "closed won")`  
**HubSpot API Call:** `GET /crm/v3/objects/deals` (then filtered client-side)  
**Filter Applied:**
- Date range: `createdAt` between `startDate` and `endDate`
- Stage filter: `stage="closed won"` (case-insensitive, flexible matching)
**Code Location:**
```typescript
const { data: closedWonDealsData } = useQuery({
  queryKey: ["hubspot-deals-closedwon", dateRange.startDate, dateRange.endDate],
  queryFn: () => fetchDealsByStage(dateRange.startDate, dateRange.endDate, "closed won"),
});
```
**Value Used:** 
- Count: `closedWonDealsData?.summary?.total`
- Revenue: `closedWonDealsData?.summary?.stageDetails` (sum of all `totalValue`)
**Stage Matching:** Handles "Closed Won", "closed-won", "closedwon", "Closed Won", etc.  
**Revenue Calculation:**
```typescript
const closedWonRevenue = closedWonDealsData?.summary?.stageDetails 
  ? Object.values(closedWonDealsData.summary.stageDetails).reduce((sum: number, stage: any) => sum + (stage.totalValue || 0), 0)
  : 0;
```

---

## Summary Table

| Funnel Stage | API Endpoint | HubSpot API | Stage Filter | Date Filter | Value Used |
|--------------|-------------|-------------|--------------|-------------|------------|
| Total Traffic | `/api/ga4/overview` | N/A (GA4) | N/A | ✅ | `sessions` |
| Deal Created | `/api/hubspot/deals-by-stage` | `GET /crm/v3/objects/deals` | ❌ None | ✅ `createdAt` | `summary.total` |
| Disqualified Lead | `/api/hubspot/deals-by-stage?stage=disqualified` | `GET /crm/v3/objects/deals` | ✅ "disqualified" | ✅ `createdAt` | `summary.total` |
| Email Sent | `/api/hubspot/emails-sent` | `GET /crm/v3/objects/emails` | N/A | ✅ `hs_timestamp` | `emailsSent` |
| Conversations Initiated | `/api/hubspot/first-response` | `GET /crm/v3/objects/emails` | N/A | ✅ First response date | `firstResponseCount` |
| Requirements Received | `/api/hubspot/deals-by-stage?stage=requirements received` | `GET /crm/v3/objects/deals` | ✅ "requirements received" | ✅ `createdAt` | `summary.total` |
| Won | `/api/hubspot/deals-by-stage?stage=closed won` | `GET /crm/v3/objects/deals` | ✅ "closed won" | ✅ `createdAt` | `summary.total` + `stageDetails.totalValue` |

---

## API Call Flow

### For Deal Stages (2, 3, 6, 7):
1. **Frontend:** Calls `/api/hubspot/deals-by-stage` with optional `stage` parameter
2. **Backend:** Calls `fetchHubSpotDeals()` which fetches ALL deals from HubSpot
3. **Backend:** Filters deals by:
   - Date range (using `createdAt`)
   - Stage name (if provided, using flexible matching)
4. **Backend:** Returns filtered deals with summary

### For Email Stages (4, 5):
1. **Frontend:** Calls `/api/hubspot/emails-sent` or `/api/hubspot/first-response`
2. **Backend:** Calls `fetchHubSpotEmails()` which fetches emails from HubSpot
3. **Backend:** Filters/processes emails by date range
4. **Backend:** Returns count or calculated metrics

---

## Notes

1. **All deal stages use the same HubSpot endpoint:** `GET /crm/v3/objects/deals`
   - The filtering happens client-side after fetching all deals
   - This is efficient for small to medium datasets but could be optimized for large datasets

2. **Stage matching is flexible:**
   - Case-insensitive
   - Handles variations (spaces, dashes, underscores)
   - Example: "closed won" matches "Closed Won", "closed-won", "closedwon"

3. **Date filtering:**
   - All deal stages filter by `createdAt` (when deal was created)
   - Email stages filter by `hs_timestamp` (when email was sent)

4. **Revenue calculation:**
   - Only the "Won" stage calculates revenue
   - Sums up `totalValue` from all closed-won deals in the date range
