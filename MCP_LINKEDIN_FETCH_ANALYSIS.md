# LinkedIn MCP Server Data Fetching Analysis

## How MCP Server Fetches LinkedIn Analytics

### 1. Account-Level Analytics (`get_linkedin_analytics`)

**Location**: `lib/mcp/linkedin.ts` → `fetchLinkedInAnalytics()`

**Process**:
1. Converts account ID to URN format: `urn:li:sponsoredAccount:{accountId}`
2. Calculates date range: Yesterday to `daysBack` days ago (default: 30 days)
3. Calls LinkedIn API: `GET /rest/adAnalyticsV2`
   - `pivot: "ACCOUNT"` (aggregates all campaigns in account)
   - `timeGranularity: "ALL"` (total, not daily breakdown)
   - Fields: `impressions,clicks,costInLocalCurrency,conversions,leadsGenerated`
4. **Response Handling**:
   - **404 Response**: LinkedIn returns 404 when there's NO activity → MCP returns `{ hasData: false, metrics: { all zeros } }`
   - **200 Response**: Parses `data.elements[]` array and sums up all rows
   - Field name fallbacks:
     - `impressions` or `impressionCount`
     - `clicks` or `clickCount`
     - `costInLocalCurrency` or `spend` or `cost`
     - `conversions` or `leadsGenerated` or `conversionCount`

**Current Status**: ✅ Working correctly, but returns zeros because LinkedIn API returns 404 (no account-level data in date range)

---

### 2. Campaign-Level Analytics (`get_linkedin_campaign_analytics`)

**Location**: `lib/mcp/linkedin-campaign-analytics.ts` → `fetchLinkedInCampaignAnalytics()`

**Process**:
1. Converts campaign ID and account ID to URN format
2. Same date range calculation
3. Calls LinkedIn API: `GET /rest/adAnalyticsV2`
   - `pivot: "CAMPAIGN"` (per-campaign breakdown)
   - `timeGranularity: "ALL"`
   - Fields: Same as account-level
4. **Response Handling**:
   - **404 Response**: Returns zeros (not null) so we know we checked
   - **200 Response**: Sums up metrics from `data.elements[]`

**Current Status**: ✅ Working correctly

---

### 3. Account Details (`get_linkedin_account_details`)

**Location**: `app/api/mcp/linkedin/route.ts` → `get_linkedin_account_details` case

**Process**:
1. Fetches all accounts
2. For each account:
   - Fetches campaigns list
   - **Fetches account-level analytics** (calls `fetchLinkedInAnalytics`)
   - Returns: `{ account, campaigns[], analytics, hasData }`
3. **Note**: Does NOT fetch campaign-level analytics by default

**Current Status**: ✅ Working, but only returns account-level analytics (which are zeros)

---

### 4. Campaigns with Analytics (`get_linkedin_campaigns` with `includeAnalytics: true`)

**Location**: `app/api/mcp/linkedin/route.ts` → `get_linkedin_campaigns` case

**Process**:
1. Fetches campaigns for account
2. If `includeAnalytics: true`:
   - Calls `fetchLinkedInCampaignsAnalytics()` (batch fetches campaign-level analytics)
   - Attaches analytics to each campaign object
3. Returns campaigns with `campaign.analytics` property

**Current Status**: ✅ Working correctly

---

## Why Atlas Sees Data But API Shows Zeros

**Possible Reasons**:

1. **Atlas uses campaign-level aggregation**:
   - When account-level returns 404/zeros, Atlas might call `get_linkedin_campaigns` with `includeAnalytics: true`
   - Then sums up all campaign-level metrics
   - This would show impressions/clicks/spend even if account-level is zero

2. **Different date ranges**:
   - Atlas might use a different `daysBack` parameter
   - Or might query specific date ranges that have data

3. **Multiple accounts**:
   - Atlas might aggregate across multiple LinkedIn accounts
   - Account-level might be zero for one account but have data in another

---

## Data Flow Diagram

```
Claude/Atlas
    ↓
Tool Call: get_linkedin_analytics
    ↓
app/api/claude/chat/route.ts → executeToolCall()
    ↓
POST /api/mcp/linkedin
    ↓
app/api/mcp/linkedin/route.ts → get_linkedin_analytics case
    ↓
lib/mcp/linkedin.ts → fetchLinkedInAnalytics()
    ↓
LinkedIn API: GET /rest/adAnalyticsV2?pivot=ACCOUNT
    ↓
Response: 404 (no data) OR 200 (with data.elements[])
    ↓
Parse & Sum: impressions, clicks, costInLocalCurrency, conversions
    ↓
Return: { hasData: boolean, metrics: { impressions, clicks, spend, conversions } }
    ↓
Back to Claude/Atlas
```

---

## Field Name Mapping

The MCP server handles multiple possible field names from LinkedIn:

| Metric | Primary Field | Fallback Fields |
|--------|--------------|----------------|
| Impressions | `impressions` | `impressionCount` |
| Clicks | `clicks` | `clickCount` |
| Spend | `costInLocalCurrency` | `spend`, `cost` |
| Conversions | `conversions` | `leadsGenerated`, `conversionCount` |

---

## Current Test Results

**Account-Level Analytics** (Account ID: 514469053, Last 30 days):
- ✅ API call successful
- ❌ Response: 404 (no data in date range)
- ✅ MCP correctly returns: `{ hasData: false, metrics: { all zeros } }`

**Account Details**:
- ✅ Fetches 5 accounts
- ✅ Each account shows: `analytics: { all zeros }`, `hasData: false`
- ✅ Campaigns list is fetched but analytics are NOT included by default

---

## Recommendations

1. **If Atlas needs to see campaign-level data**:
   - Atlas should call `get_linkedin_campaigns` with `includeAnalytics: true`
   - Or call `get_linkedin_campaign_analytics` for specific campaigns

2. **To fix account-level zeros**:
   - Check if campaigns have data at campaign-level
   - If yes, consider aggregating campaign-level data when account-level returns 404
   - Or expand the date range to find when data exists

3. **Debugging**:
   - Check server logs for `console.log` statements in `lib/mcp/linkedin.ts`
   - Look for: `"LinkedIn Analytics for {accountId}:"` logs
   - These show what data was actually fetched

---

## Code Locations

- **MCP Tool Definitions**: `lib/mcp/tools.ts`
- **MCP Bridge Routes**: `app/api/claude/chat/route.ts` (mcpBridgeRoutes)
- **LinkedIn MCP Bridge**: `app/api/mcp/linkedin/route.ts`
- **Account Analytics**: `lib/mcp/linkedin.ts` → `fetchLinkedInAnalytics()`
- **Campaign Analytics**: `lib/mcp/linkedin-campaign-analytics.ts` → `fetchLinkedInCampaignAnalytics()`
