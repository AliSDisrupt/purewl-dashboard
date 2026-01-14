# How to Check if Data is Now Fetching

## Quick Test

Since scopes have been configured, let's verify if data is now being fetched:

### 1. **Check Your Server Logs**

Look at the terminal where `npm run dev` is running. You should see:

**If working:**
```
🔍 Fetching HubSpot deals: { hasAccessToken: true, ... }
HubSpot Deals API Response: { resultsCount: 10, ... }
Fetched 10 deals from HubSpot across 1 page(s)
```

**If still empty:**
```
⚠️ HubSpot API returned HTTP 200 with empty body
```

### 2. **Test in Browser**

Open these URLs in your browser:

1. **All Deals:**
   ```
   http://localhost:3000/api/hubspot/deals
   ```

2. **Deals Last 30 Days:**
   ```
   http://localhost:3000/api/hubspot/deals-by-stage?startDate=30daysAgo&endDate=yesterday
   ```

3. **Check Funnel Page:**
   ```
   http://localhost:3000/funnel
   ```

### 3. **What to Look For**

**Good Response (Working):**
```json
{
  "deals": [
    {
      "id": "123",
      "name": "Deal Name",
      "amount": 5000,
      "stage": "qualifiedtobuy"
    }
  ],
  "summary": {
    "totalDeals": 10,
    "totalValue": 50000,
    "byStage": {
      "qualifiedtobuy": 5,
      "closedwon": 3
    }
  }
}
```

**Empty Response (Not Working):**
```json
{
  "deals": [],
  "summary": {
    "totalDeals": 0,
    "totalValue": 0,
    "byStage": {}
  }
}
```

### 4. **If Still Empty After Configuring Scopes**

**Check:**
1. ✅ Did you **restart the dev server** after updating scopes?
2. ✅ Did you **regenerate the access token** after adding scopes?
3. ✅ Did you **update `.env.local`** with the new token?
4. ✅ Does your HubSpot account **actually have deals**?

**Next Steps:**
- Check server logs for the new debug messages
- Verify token in HubSpot Private Apps shows the new scopes
- Test API directly: `curl -H "Authorization: Bearer YOUR_TOKEN" "https://api.hubapi.com/crm/v3/objects/deals?limit=1"`

### 5. **Verify Scopes Are Active**

1. Go to HubSpot → Settings → Private Apps
2. Click on your app
3. Go to **Scopes** tab
4. Verify these are **checked/enabled**:
   - ✅ `crm.objects.deals.read`
   - ✅ `crm.objects.contacts.read`
   - ✅ `sales-email-read`

5. If scopes were just added, you may need to:
   - **Regenerate the access token**
   - **Update `.env.local`**
   - **Restart dev server**

---

## Current Status

Based on the API tests:
- ✅ APIs are responding (no errors)
- ⚠️ But returning empty data (0 deals, 0 stages)

This suggests either:
1. **No deals exist** in your HubSpot account
2. **Token still needs regeneration** after scope changes
3. **Date range** has no data

**Action:** Check your server logs for the detailed debug messages I added - they will tell you exactly what's happening!
