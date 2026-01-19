# LinkedIn Campaign Analytics - Complete Metrics Guide

**Last Updated:** January 2026  
**Account:** PureVPN - Partner & Enterprise Solutions (ID: 514469053)

---

## ✅ Metrics Currently Being Fetched (31 Total)

### Core Performance Metrics (4)
- ✅ **`impressions`** - Total ad impressions (views)
- ✅ **`clicks`** - Total chargeable clicks (finalized clicks only)
- ✅ **`costInLocalCurrency`** - Total spend/cost in local currency
- ✅ **`conversions`** - Total conversions

### Engagement Metrics (8)
- ✅ **`totalEngagements`** - Total engagement count
- ✅ **`likes`** - Number of likes
- ✅ **`comments`** - Number of comments
- ✅ **`shares`** - Number of shares
- ✅ **`reactions`** - Number of reactions
- ✅ **`follows`** - Number of follows
- ✅ **`companyPageClicks`** - Clicks to company page
- ✅ **`landingPageClicks`** - Clicks to landing page

### Conversion Metrics (7)
- ✅ **`externalWebsiteConversions`** - Website conversions
- ✅ **`externalWebsitePostClickConversions`** - Post-click conversions
- ✅ **`externalWebsitePostViewConversions`** - Post-view conversions
- ✅ **`conversionValueInLocalCurrency`** - Total conversion value
- ✅ **`oneClickLeads`** - One-click lead form submissions
- ✅ **`qualifiedLeads`** - Qualified leads
- ✅ **`validWorkEmailLeads`** - Valid work email leads

### Video Metrics (3)
- ✅ **`videoStarts`** - Video starts
- ✅ **`videoViews`** - Video views
- ✅ **`videoCompletions`** - Video completions

### Messaging Metrics (4) - **NEW**
- ✅ **`sends`** - Message sends (for messaging campaigns)
- ✅ **`opens`** - Message opens
- ✅ **`replies`** - Message replies
- ✅ **`clicksOnSend`** - Clicks on send button

### Job Ad Metrics (3) - **NEW**
- ✅ **`jobApplies`** - Job applications (for job campaigns)
- ✅ **`jobViews`** - Job views
- ✅ **`jobSaves`** - Job saves

### Additional Click Metrics (3) - **NEW**
- ✅ **`textUrlClicks`** - Text URL clicks
- ✅ **`cardClicks`** - Carousel card clicks
- ✅ **`cardImpressions`** - Carousel card impressions

### Calculated Metrics (4)
- ✅ **`ctr`** - Click-through rate (calculated: clicks/impressions * 100)
- ✅ **`cpc`** - Cost per click (calculated: spend/clicks)
- ✅ **`cpm`** - Cost per mille (calculated: spend/impressions * 1000)
- ✅ **`costPerConversion`** - Cost per conversion (calculated: spend/conversions)

**Total: 31 metrics being fetched**

---

## ❌ Metrics NOT Being Fetched (And Why)

### 1. Pending Clicks / Pending Impressions

**Status:** ❌ **NOT AVAILABLE**

**Why Not Available:**
- LinkedIn API only provides **finalized, chargeable metrics**
- There is no "pending" state exposed via the API
- Clicks are validated and finalized before appearing in API responses
- Typical validation time: 24-48 hours

**What You Get Instead:**
- `clicks` - Finalized, chargeable clicks only
- All clicks returned are already validated and finalized

**LinkedIn API Limitation:** This is a fundamental limitation of LinkedIn's API design. They don't expose pending/in-process metrics.

---

### 2. Real-Time Metrics

**Status:** ❌ **NOT AVAILABLE**

**Why Not Available:**
- LinkedIn API has a **24-48 hour delay** for data availability
- Real-time metrics are not exposed via the API
- Data is finalized and validated before being made available

**What You Get Instead:**
- Historical data with 24-48 hour delay
- Finalized metrics only

**LinkedIn API Limitation:** Data processing and validation delay.

---

### 3. Audience Demographics (Age, Gender, Location Breakdown)

**Status:** ❌ **NOT CURRENTLY FETCHED** (But Available)

**Why Not Currently Fetched:**
- Requires different API endpoint (`adAnalyticsV2` with different pivot)
- Requires additional API calls
- Not included in current implementation

**Can Be Added:** ✅ Yes, if needed

**How to Add:**
1. Add new API call with `pivot: "DEMOGRAPHIC"` or `pivot: "GEO"`
2. Parse demographic/geographic breakdown
3. Add to UI components

---

### 4. Ad-Level Metrics (Individual Ad Performance)

**Status:** ❌ **NOT CURRENTLY FETCHED** (But Available)

**Why Not Currently Fetched:**
- Requires `pivot: "CREATIVE"` in API call
- Additional API calls needed
- Currently only fetching campaign-level and account-level

**Can Be Added:** ✅ Yes, if needed

**How to Add:**
1. Fetch ads for each campaign
2. Call `adAnalyticsV2` with `pivot: "CREATIVE"`
3. Parse ad-level metrics

---

### 5. Time-Based Breakdowns (Hourly, Daily Trends)

**Status:** ⚠️ **PARTIALLY AVAILABLE**

**Current Implementation:**
- Uses `timeGranularity: "ALL"` for aggregated totals
- Does not fetch daily/hourly breakdowns

**Why Not Currently Fetched:**
- Would require additional API calls with `timeGranularity: "DAILY"` or `"HOURLY"`
- More complex data processing needed
- Currently optimized for total metrics

**Can Be Added:** ✅ Yes, if needed

**How to Add:**
1. Add API call with `timeGranularity: "DAILY"`
2. Parse date-based breakdown
3. Add time-series charts to UI

---

## 📊 Where Metrics Are Displayed

### 1. LinkedInMetrics Component (`components/linkedin/LinkedInMetrics.tsx`)

**Primary Metrics (Always Shown):**
- Impressions
- Clicks
- Spend
- Conversions

**Performance Metrics (Always Shown):**
- CTR
- CPC
- CPM
- Conversion Rate
- Cost per Conversion

**Engagement Metrics (Shown if > 0):**
- Total Engagements
- Likes
- Comments
- Shares
- Follows
- Company Page Clicks

**Video Metrics (Shown if > 0):**
- Video Views
- Video Starts
- Video Completions

**Lead Metrics (Shown if > 0):**
- Qualified Leads
- One-Click Leads
- Valid Work Email Leads

**Messaging Metrics (Shown if > 0):** - **NEW**
- Sends
- Opens
- Replies
- Clicks on Send

**Job Ad Metrics (Shown if > 0):** - **NEW**
- Job Applications
- Job Views
- Job Saves

**Additional Metrics (Shown if > 0):**
- Landing Page Clicks
- External Website Conversions
- Conversion Value
- Text URL Clicks - **NEW**
- Card Clicks - **NEW**
- Card Impressions - **NEW**

---

### 2. CampaignsTable Component (`components/linkedin/CampaignsTable.tsx`)

**Shown Per Campaign:**
- Impressions
- Clicks
- Spend
- Conversions (if > 0)
- CTR (calculated)
- CPC (calculated)

**Note:** Campaign table shows core metrics only. Full metrics available in detailed view.

---

## 🔄 Data Flow

```
LinkedIn API (adAnalyticsV2)
    ↓
lib/mcp/linkedin-campaign-analytics.ts
    ↓
Parse & Sum All Metrics
    ↓
Return LinkedInMetrics Object
    ↓
UI Components (LinkedInMetrics, CampaignsTable)
    ↓
Display Metrics (Conditional Rendering)
```

---

## 📝 API Request Details

**Endpoint:** `GET /rest/adAnalyticsV2`

**Current Fields Requested:**
```
impressions,
clicks,
costInLocalCurrency,
externalWebsiteConversions,
externalWebsitePostClickConversions,
externalWebsitePostViewConversions,
landingPageClicks,
totalEngagements,
likes,
comments,
shares,
reactions,
follows,
companyPageClicks,
oneClickLeads,
qualifiedLeads,
validWorkEmailLeads,
videoStarts,
videoViews,
videoCompletions,
conversionValueInLocalCurrency,
sends,              ← NEW
opens,              ← NEW
replies,            ← NEW
clicksOnSend,       ← NEW
jobApplies,         ← NEW
jobViews,           ← NEW
jobSaves,           ← NEW
textUrlClicks,      ← NEW
cardClicks,         ← NEW
cardImpressions     ← NEW
```

**Total Fields:** 31 metrics

---

## 🎯 Summary

### ✅ What IS Being Fetched:
- **31 metrics** total
- All core performance metrics
- All engagement metrics
- All conversion metrics
- All video metrics
- **NEW:** Messaging metrics (4)
- **NEW:** Job ad metrics (3)
- **NEW:** Additional click metrics (3)
- All calculated metrics (CTR, CPC, CPM, Cost per Conversion)

### ❌ What is NOT Being Fetched:
- **Pending clicks** - Not available in LinkedIn API
- **Pending impressions** - Not available
- **Real-time metrics** - 24-48 hour delay
- **Demographic breakdowns** - Not currently implemented (but available)
- **Ad-level metrics** - Not currently implemented (but available)
- **Time-based breakdowns** - Not currently implemented (but available)

### 📊 Display Status:
- ✅ **All fetched metrics are displayed** in UI components
- ✅ **Conditional rendering** - metrics only shown if > 0
- ✅ **Organized by category** - Engagement, Video, Lead, Messaging, Job, Additional
- ✅ **Icons and formatting** - Professional presentation

---

## 🔧 How to Add More Metrics

If you need additional metrics:

1. **Check LinkedIn API Documentation** for available fields
2. **Add to fields list** in `lib/mcp/linkedin-campaign-analytics.ts` (line 104)
3. **Add to interface** in `lib/mcp/linkedin.ts` (line 43)
4. **Add parsing logic** in both files
5. **Add to UI component** in `components/linkedin/LinkedInMetrics.tsx`
6. **Test with real data**

---

**Document Version:** 2.0  
**Status:** ✅ All metrics documented and displayed  
**Last Updated:** January 2026
