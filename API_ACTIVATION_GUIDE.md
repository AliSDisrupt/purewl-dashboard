# API Activation Guide - How to Fetch Data

## Overview
This guide explains what needs to be activated/configured for each API to fetch data in the conversion funnel.

---

## 1. HubSpot API Configuration

### Required Environment Variable:
```bash
HUBSPOT_ACCESS_TOKEN=your_hubspot_access_token_here
```

### How to Get HubSpot Access Token:

1. **Go to HubSpot Developer Account:**
   - Visit: https://app.hubspot.com/
   - Navigate to: Settings → Integrations → Private Apps

2. **Create a Private App:**
   - Click "Create a private app"
   - Give it a name (e.g., "Dashboard Integration")

3. **Set Required Scopes:**
   Your app needs these scopes:
   - ✅ `crm.objects.deals.read` - Read deals
   - ✅ `crm.objects.contacts.read` - Read contacts
   - ✅ `crm.objects.companies.read` - Read companies
   - ✅ `sales-email-read` - Read emails
   - ✅ `conversations.read` - Read conversations
   - ✅ `calls.read` - Read calls
   - ✅ `meetings.read` - Read meetings
   - ✅ `tickets.read` - Read tickets
   - ✅ `tasks.read` - Read tasks

4. **Generate Access Token:**
   - After creating the app, go to the "Auth" tab
   - Copy the "Access token" (starts with `pat-`)

5. **Add to `.env.local`:**
   ```bash
   HUBSPOT_ACCESS_TOKEN=pat-your-token-here
   HUBSPOT_API_BASE=https://api.hubapi.com
   ```

### Verify HubSpot is Working:
```bash
# Test the API
curl http://localhost:3000/api/hubspot/deals
```

---

## 2. Google Analytics 4 (GA4) Configuration

### Current Status:
GA4 credentials are **hardcoded** in the code (`lib/mcp/ga4.ts`), but you may need to verify:

### Required Setup:

1. **Service Account:**
   - The code uses a service account with email: `ga4-viewer@claude-ga4-mcp-483413.iam.gserviceaccount.com`
   - This service account needs access to your GA4 property

2. **GA4 Property ID:**
   - Currently hardcoded: `383191966`
   - Verify this is your correct property ID

3. **Grant Access in GA4:**
   - Go to: Google Analytics → Admin → Property Access Management
   - Add the service account email: `ga4-viewer@claude-ga4-mcp-483413.iam.gserviceaccount.com`
   - Grant "Viewer" role

### Verify GA4 is Working:
```bash
# Test the API
curl "http://localhost:3000/api/ga4/overview?startDate=30daysAgo&endDate=yesterday"
```

---

## 3. Date Range Configuration

### Important Notes:

1. **Date Format:**
   - The APIs accept dates in format: `YYYY-MM-DD`
   - Or relative formats: `30daysAgo`, `yesterday`, `today`

2. **Current Month Query:**
   - Start: First day of current month (e.g., `2026-01-01`)
   - End: Today's date (e.g., `2026-01-14`)

3. **Data Availability:**
   - GA4 data is typically available up to yesterday (not today)
   - HubSpot data may have delays depending on when deals were created

---

## 4. Check Current Configuration

### Check if Environment Variables are Set:

```bash
# Check .env.local file exists
cat .env.local

# Or in PowerShell
Get-Content .env.local
```

### Verify APIs are Responding:

```bash
# Test HubSpot
curl http://localhost:3000/api/hubspot/deals

# Test GA4
curl "http://localhost:3000/api/ga4/overview?startDate=30daysAgo&endDate=yesterday"
```

---

## 5. Common Issues & Solutions

### Issue: All values showing 0

**Possible Causes:**

1. **Missing Access Token:**
   - Check if `HUBSPOT_ACCESS_TOKEN` is set in `.env.local`
   - Restart dev server after adding: `npm run dev`

2. **Invalid Access Token:**
   - Token may have expired
   - Regenerate token in HubSpot

3. **Wrong Date Range:**
   - Data might not exist for the selected date range
   - Try a broader range: `startDate=30daysAgo&endDate=yesterday`

4. **No Data in HubSpot:**
   - Verify deals exist in HubSpot for the date range
   - Check HubSpot directly: https://app.hubspot.com/sales/deals

5. **GA4 Property Access:**
   - Service account may not have access
   - Verify property ID is correct

### Issue: API Returns Empty Arrays

**Check Server Logs:**
- Look for warnings like: `"HUBSPOT_ACCESS_TOKEN not configured"`
- Check for API errors in the terminal

**Verify Token Format:**
- HubSpot tokens start with `pat-`
- Should be: `HUBSPOT_ACCESS_TOKEN=pat-xxxxx`

---

## 6. Step-by-Step Activation Checklist

### For HubSpot:
- [ ] Create HubSpot Private App
- [ ] Set required scopes (deals.read, contacts.read, etc.)
- [ ] Copy access token
- [ ] Add `HUBSPOT_ACCESS_TOKEN` to `.env.local`
- [ ] Restart dev server
- [ ] Test: `curl http://localhost:3000/api/hubspot/deals`

### For GA4:
- [ ] Verify service account has access to GA4 property
- [ ] Check property ID is correct (currently: `383191966`)
- [ ] Grant "Viewer" role to service account
- [ ] Test: `curl "http://localhost:3000/api/ga4/overview?startDate=30daysAgo&endDate=yesterday"`

### For Date Range:
- [ ] Use correct date format: `YYYY-MM-DD`
- [ ] Try broader range if no data: `30daysAgo` to `yesterday`
- [ ] Check if data exists in source systems for that range

---

## 7. Quick Test Script

Run this to test all APIs:

```bash
# Test HubSpot Deals
echo "Testing HubSpot..."
curl http://localhost:3000/api/hubspot/deals | jq '.summary.totalDeals'

# Test GA4
echo "Testing GA4..."
curl "http://localhost:3000/api/ga4/overview?startDate=30daysAgo&endDate=yesterday" | jq '.summary.sessions'

# Test Deals by Stage
echo "Testing Deals by Stage..."
curl "http://localhost:3000/api/hubspot/deals-by-stage?startDate=30daysAgo&endDate=yesterday" | jq '.summary.total'
```

---

## 8. Environment Variables Template

Create `.env.local` with:

```bash
# HubSpot Configuration
HUBSPOT_ACCESS_TOKEN=pat-your-token-here
HUBSPOT_API_BASE=https://api.hubapi.com

# GA4 Configuration (if using env vars instead of hardcoded)
# GA4_PROPERTY_ID=383191966
# GOOGLE_APPLICATION_CREDENTIALS=path/to/credentials.json

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Summary

**To activate data fetching:**

1. ✅ **HubSpot:** Set `HUBSPOT_ACCESS_TOKEN` in `.env.local`
2. ✅ **GA4:** Verify service account has access (already configured in code)
3. ✅ **Restart:** Restart dev server after adding env vars
4. ✅ **Test:** Use curl commands above to verify APIs work
5. ✅ **Date Range:** Use appropriate date range (data may not exist for current month yet)

**Most Common Issue:** Missing or invalid `HUBSPOT_ACCESS_TOKEN` - this is the #1 thing to check!
