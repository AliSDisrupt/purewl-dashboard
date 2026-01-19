# LinkedIn Campaign Analytics - Metrics Being Fetched

**Last Updated:** January 2026  
**Account:** PureVPN - Partner & Enterprise Solutions (ID: 514469053)

---

## ✅ Metrics Currently Being Fetched

### Core Performance Metrics
- ✅ **`impressions`** - Total impressions (ad views)
- ✅ **`clicks`** - Total chargeable clicks (finalized clicks)
- ✅ **`costInLocalCurrency`** - Total spend/cost
- ✅ **`conversions`** - Total conversions

### Engagement Metrics
- ✅ **`totalEngagements`** - Total engagement count
- ✅ **`likes`** - Number of likes
- ✅ **`comments`** - Number of comments
- ✅ **`shares`** - Number of shares
- ✅ **`reactions`** - Number of reactions
- ✅ **`follows`** - Number of follows
- ✅ **`companyPageClicks`** - Clicks to company page
- ✅ **`landingPageClicks`** - Clicks to landing page

### Conversion Metrics
- ✅ **`externalWebsiteConversions`** - Website conversions
- ✅ **`externalWebsitePostClickConversions`** - Post-click conversions
- ✅ **`externalWebsitePostViewConversions`** - Post-view conversions
- ✅ **`conversionValueInLocalCurrency`** - Conversion value
- ✅ **`oneClickLeads`** - One-click lead form submissions
- ✅ **`qualifiedLeads`** - Qualified leads
- ✅ **`validWorkEmailLeads`** - Valid work email leads

### Video Metrics
- ✅ **`videoStarts`** - Video starts
- ✅ **`videoViews`** - Video views
- ✅ **`videoCompletions`** - Video completions

### Calculated Metrics
- ✅ **`ctr`** - Click-through rate (calculated: clicks/impressions * 100)
- ✅ **`cpc`** - Cost per click (calculated: spend/clicks)
- ✅ **`cpm`** - Cost per mille (calculated: spend/impressions * 1000)
- ✅ **`costPerConversion`** - Cost per conversion (calculated: spend/conversions)

---

## ❌ Metrics NOT Currently Being Fetched

### Pending/Processing Metrics
- ❌ **`pendingClicks`** - **NOT available** (LinkedIn API doesn't provide this field)
- ❌ **`pendingImpressions`** - Not available
- ❌ **`pendingConversions`** - Not available

**Note:** LinkedIn API only provides **finalized/chargeable** clicks, not pending clicks. Pending clicks are not a standard metric in LinkedIn's API.

### Other Available Metrics (Not Currently Fetched)
- ❌ **`sends`** - Message sends (for messaging campaigns)
- ❌ **`opens`** - Message opens
- ❌ **`replies`** - Message replies
- ❌ **`clicksOnSend`** - Clicks on send button
- ❌ **`jobApplies`** - Job applications (for job ads)
- ❌ **`jobViews`** - Job views
- ❌ **`jobSaves`** - Job saves
- ❌ **`textUrlClicks`** - Text URL clicks
- ❌ **`cardClicks`** - Card clicks (for carousel ads)
- ❌ **`cardImpressions`** - Card impressions
- ❌ **`pivotValues`** - Pivot breakdown values
- ❌ **`dateRange`** - Date range breakdown (when using DAILY granularity)

---

## 📊 Current API Request

**Endpoint:** `GET /rest/adAnalyticsV2`

**Fields Requested:**
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
conversionValueInLocalCurrency
```

**Total Fields:** 21 metrics

---

## 🔍 About "Pending Clicks"

### What Are Pending Clicks?

"Pending clicks" typically refers to clicks that are:
- Still being processed/validated by LinkedIn
- Under review for fraud or invalid traffic
- Not yet finalized as chargeable clicks

### Why They're Not Available

1. **LinkedIn API Limitation:** LinkedIn's `adAnalyticsV2` API only returns **finalized, chargeable clicks**
2. **No Pending State:** LinkedIn doesn't expose clicks in a "pending" state via their API
3. **Real-time vs. Finalized:** The API provides finalized metrics, not real-time pending metrics

### What You Get Instead

- **`clicks`** - These are **chargeable clicks** (finalized, validated clicks)
- **`landingPageClicks`** - Clicks that reached the landing page
- **`companyPageClicks`** - Clicks to company page

All clicks returned are **finalized** - there's no "pending" state exposed.

---

## 📈 Data Processing

### How Clicks Are Processed

1. **API Request:** System requests `clicks` field from LinkedIn
2. **LinkedIn Response:** Returns finalized, chargeable clicks only
3. **Data Storage:** Clicks are stored as-is (no pending state)
4. **Display:** Clicks shown in dashboard are all finalized

### Click Validation Timeline

- **Immediate:** Some clicks are validated immediately
- **24-48 Hours:** Some clicks may take 24-48 hours to finalize
- **After Finalization:** Only finalized clicks appear in API responses

**Important:** The API doesn't distinguish between "just happened" and "pending" - it only shows clicks that have been finalized.

---

## 🔄 If You Need More Metrics

### To Add Additional Metrics

1. **Update Fields List** in `lib/mcp/linkedin-campaign-analytics.ts` (line 104):
   ```typescript
   fields: "impressions,clicks,...,NEW_METRIC_HERE"
   ```

2. **Add to Interface** in `lib/mcp/linkedin-campaign-analytics.ts` (line 20):
   ```typescript
   export interface LinkedInMetrics {
     // ... existing fields
     newMetric?: number;
   }
   ```

3. **Parse Response** in the same file (around line 158):
   ```typescript
   totalNewMetric += parseInt(row.newMetric || 0);
   ```

4. **Return in Response** (around line 206):
   ```typescript
   return {
     // ... existing fields
     newMetric: totalNewMetric,
   };
   ```

### Available LinkedIn Metrics (Not Currently Fetched)

You can add these if needed:
- `sends` - Message sends
- `opens` - Message opens  
- `replies` - Message replies
- `jobApplies` - Job applications
- `jobViews` - Job views
- `textUrlClicks` - Text URL clicks
- `cardClicks` - Carousel card clicks
- `cardImpressions` - Carousel card impressions

---

## ✅ Summary

### What IS Being Fetched:
- ✅ **21 metrics** including impressions, clicks, spend, conversions, engagements, leads, video metrics
- ✅ **All finalized/chargeable metrics** (no pending states)
- ✅ **Calculated metrics** (CTR, CPC, CPM, Cost per Conversion)

### What is NOT Being Fetched:
- ❌ **Pending clicks** - Not available in LinkedIn API
- ❌ **Pending impressions** - Not available
- ❌ **Real-time pending metrics** - API only provides finalized data
- ❌ **Some messaging/job metrics** - Available but not currently requested

### Key Point:
**"Pending clicks" is not a metric provided by LinkedIn's API.** The API only returns finalized, chargeable clicks. If you see "pending clicks" in LinkedIn Campaign Manager, those are clicks that haven't been finalized yet, but they're not exposed via the API until they're finalized.

---

**Document Version:** 1.0  
**Status:** ✅ Current metrics documented  
**Note:** All clicks fetched are finalized/chargeable clicks only
