# Actual Stages Being Fetched by Your API

## What Your API Actually Does

### 1. **Property Requested from HubSpot:**
```
properties: "dealname,amount,dealstage,closedate,pipeline,createdate,..."
```
- Your API requests the `dealstage` property from HubSpot
- This property contains the **actual stage name** for each deal

### 2. **What Gets Fetched:**
- **ALL deals** from your HubSpot account (no stage filtering at API level)
- Each deal has a `dealstage` property with its current stage name
- The stage name is whatever HubSpot returns (from your pipeline configuration)

### 3. **How Stages Are Extracted:**
```typescript
stage: props.dealstage || "Unknown Stage"
```
- The stage comes directly from HubSpot's `dealstage` property
- If a deal has no stage, it defaults to "Unknown Stage"

### 4. **How Stages Are Grouped:**
```typescript
const byStage = allDeals.reduce((acc, deal) => {
  acc[deal.stage] = (acc[deal.stage] || 0) + 1;
  return acc;
}, {} as Record<string, number>);
```
- All deals are grouped by their `deal.stage` value
- This creates a count for **every unique stage** that exists in your deals

## Answer: The Stages Are Whatever Exists in Your HubSpot Account

**Your API does NOT fetch specific predefined stages.** Instead:

1. ✅ It fetches **ALL deals** from HubSpot
2. ✅ Each deal has a `dealstage` property with its stage name
3. ✅ The `summary.byStage` object contains **every unique stage** that exists in your deals
4. ✅ The stage names are whatever you've configured in your HubSpot pipeline

## Example Response Structure

If your HubSpot account has deals in these stages:
- "Appointments Scheduled"
- "Qualified To Buy" 
- "Disqualified"
- "Requirements Received"
- "Closed Won"
- "Closed Lost"

Then your API response would look like:
```json
{
  "deals": [...],
  "summary": {
    "totalDeals": 50,
    "totalValue": 100000,
    "byStage": {
      "Appointments Scheduled": 5,
      "Qualified To Buy": 10,
      "Disqualified": 2,
      "Requirements Received": 4,
      "Closed Won": 15,
      "Closed Lost": 3,
      "Unknown Stage": 1
    }
  }
}
```

## To See YOUR Actual Stages

You can check what stages your API is actually fetching by:

1. **Call the API:**
   ```bash
   curl http://localhost:3001/api/hubspot/deals
   ```

2. **Or in browser console:**
   ```javascript
   fetch('/api/hubspot/deals')
     .then(r => r.json())
     .then(data => console.log(data.summary.byStage));
   ```

3. **Check the response:**
   - Look at `summary.byStage` object
   - It will show all the actual stage names from your HubSpot account

## Summary

- ❌ **NOT fetching:** Predefined list of stages
- ✅ **IS fetching:** Whatever stages exist in your HubSpot deals
- ✅ **Result:** `summary.byStage` contains all unique stage names from your account
- ✅ **Stage names:** Come directly from your HubSpot pipeline configuration

The stages I listed earlier (like "Appointments Scheduled", "Qualified To Buy", etc.) were just **common examples** - not the actual stages being fetched. Your API fetches whatever stages you've configured in HubSpot.
