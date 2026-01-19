# HubSpot LinkedIn Ads Tracking Setup Guide

## Overview
This guide explains how to properly set up LinkedIn Ads tracking in HubSpot to ensure all LinkedIn-sourced contacts and deals are correctly identified.

## Current Status
- ✅ Code updated to detect LinkedIn contacts from multiple sources
- ✅ Supports both "linkedin" and "PAID_SOCIAL" source types
- ⚠️ UTM parameters need to be properly configured in LinkedIn Ads

---

## Step 1: Configure LinkedIn Ads UTM Parameters

### In LinkedIn Campaign Manager:

1. **Go to Campaign Manager** → Select your campaign
2. **Click "Edit"** on your ad
3. **Add UTM Parameters** to your destination URL:

```
https://yourwebsite.com/landing-page?utm_source=linkedin&utm_medium=paid&utm_campaign=CampaignName&utm_content=AdName
```

**Required Parameters:**
- `utm_source=linkedin` (MUST be exactly "linkedin" for proper detection)
- `utm_medium=paid` (or "cpc", "social", etc.)
- `utm_campaign=YourCampaignName` (will show in HubSpot)
- `utm_content=AdName` (optional, for ad-level tracking)
- `utm_term=Keyword` (optional, for keyword tracking)

### Example URLs:
```
https://purevpn.com/pricing?utm_source=linkedin&utm_medium=paid&utm_campaign=VPN_Reseller_Q1&utm_content=Desktop_Ad
```

---

## Step 2: Install HubSpot Tracking Code

### Verify HubSpot Tracking is Installed:

1. **Go to HubSpot** → Settings → Integrations → Tracking Code
2. **Copy your tracking code** (if not already installed)
3. **Install on all pages** where LinkedIn ads lead:
   - Landing pages
   - Thank you pages
   - Form pages
   - Homepage (if used as landing page)

### Tracking Code Location:
```html
<!-- Start of HubSpot Embed Code -->
<script type="text/javascript" id="hs-script-loader" async defer src="//js.hs-scripts.com/YOUR_PORTAL_ID.js"></script>
<!-- End of HubSpot Embed Code -->
```

**Install in:**
- `<head>` section (recommended)
- Or before closing `</body>` tag

---

## Step 3: Configure HubSpot Contact Properties

### Ensure These Properties Are Tracked:

1. **Go to HubSpot** → Settings → Properties → Contact Properties
2. **Verify these properties exist and are tracked:**
   - `hs_analytics_source` ✅ (automatically tracked)
   - `hs_analytics_medium` ✅ (automatically tracked)
   - `hs_analytics_campaign_name` ✅ (automatically tracked)
   - `hs_analytics_first_touch_converting_campaign` ✅ (automatically tracked)
   - `hs_social_linkedin` ✅ (LinkedIn profile URL)

### Create Custom Properties (Optional):

If you want additional tracking, create these custom properties:
- `linkedin_campaign_id` (Text)
- `linkedin_ad_id` (Text)
- `linkedin_ad_set_id` (Text)
- `linkedin_account_id` (Text)

---

## Step 4: Set Up HubSpot Forms

### For LinkedIn Lead Gen Forms:

1. **Go to HubSpot** → Marketing → Forms
2. **Create or edit your form**
3. **Enable "Include UTM parameters"** in form settings
4. **Map LinkedIn form fields** to HubSpot properties:
   - First Name → `firstname`
   - Last Name → `lastname`
   - Email → `email`
   - Company → `company`
   - Job Title → `jobtitle`
   - Phone → `phone`

### For Landing Page Forms:

1. **Ensure UTM parameters are preserved** in form submissions
2. **Use HubSpot's form builder** (automatically captures UTM params)
3. **Or manually pass UTM params** in hidden form fields

---

## Step 5: Test the Setup

### Test Checklist:

1. ✅ **Create a test LinkedIn ad** with UTM parameters
2. ✅ **Click the ad** and land on your page
3. ✅ **Submit a form** or interact with the page
4. ✅ **Check HubSpot** → Contacts → Find the test contact
5. ✅ **Verify properties:**
   - `hs_analytics_source` = "linkedin"
   - `hs_analytics_medium` = "paid" (or your medium value)
   - `utm_campaign` = Your campaign name

### Test Script:
Run this script to verify tracking:
```bash
node scripts/fetch-linkedin-hubspot-data.js
```

---

## Step 6: Verify Data in Dashboard

### Check the LinkedIn Ads Dashboard:

1. **Go to** `/ads` page in your dashboard
2. **Click "LinkedIn (HubSpot)" tab**
3. **Verify contacts are showing:**
   - Should see contacts with `hs_analytics_source = "linkedin"`
   - Or contacts with `hs_analytics_source = "PAID_SOCIAL"` that have LinkedIn indicators

### If No Data Shows:

1. **Check HubSpot tracking code** is installed
2. **Verify UTM parameters** are in LinkedIn ad URLs
3. **Test with a new contact** (create one manually with LinkedIn source)
4. **Check HubSpot contact properties** are being populated

---

## Step 7: Advanced Configuration

### Custom Source Detection:

The code now automatically detects LinkedIn contacts from:
- ✅ `hs_analytics_source = "linkedin"`
- ✅ `hs_analytics_source = "PAID_SOCIAL"` (with LinkedIn indicators)
- ✅ `hs_analytics_source_data_1` contains "linkedin"
- ✅ `hs_analytics_source_data_2` contains "linkedin"
- ✅ Contact has `hs_social_linkedin` profile URL

### Deal Association:

To properly track deals from LinkedIn contacts:
1. **Ensure deals are associated with contacts** in HubSpot
2. **Deals will automatically inherit** contact source if properly associated
3. **Or manually set deal source** to "linkedin" when creating deals

---

## Troubleshooting

### Issue: Contacts show as "PAID_SOCIAL" instead of "linkedin"

**Solution:** This is normal! The code now detects LinkedIn contacts from PAID_SOCIAL source. Make sure:
- UTM parameters include `utm_source=linkedin`
- HubSpot tracking code is installed
- Forms preserve UTM parameters

### Issue: No contacts showing in dashboard

**Possible causes:**
1. No contacts have been created from LinkedIn ads yet
2. UTM parameters not configured in LinkedIn ads
3. HubSpot tracking code not installed
4. Contacts created manually without source tracking

**Solution:**
1. Test with a manual contact creation
2. Verify UTM parameters in LinkedIn ad URLs
3. Check HubSpot tracking code installation
4. Run test script to see what data exists

### Issue: Campaign names not showing

**Solution:**
- Ensure `utm_campaign` parameter is in LinkedIn ad URLs
- Check that `hs_analytics_campaign_name` property is being populated
- Verify HubSpot is capturing UTM parameters

---

## Best Practices

1. **Always use UTM parameters** in LinkedIn ad URLs
2. **Use consistent naming** for campaigns (e.g., "LinkedIn_Q1_2024")
3. **Test tracking** before launching campaigns
4. **Monitor the dashboard** regularly to ensure data is flowing
5. **Keep UTM parameters** consistent across all LinkedIn ads

---

## Support

If you continue to have issues:
1. Check HubSpot documentation: https://knowledge.hubspot.com/
2. Verify LinkedIn Ads tracking: https://www.linkedin.com/help/linkedin
3. Run diagnostic scripts in `/scripts` folder
4. Check server logs for API errors

---

## Next Steps

1. ✅ Update LinkedIn ad URLs with UTM parameters
2. ✅ Verify HubSpot tracking code is installed
3. ✅ Test with a new contact
4. ✅ Check dashboard for data
5. ✅ Monitor regularly

---

**Last Updated:** 2026-01-14
**Status:** ✅ Code Updated, ⚠️ Requires UTM Configuration
