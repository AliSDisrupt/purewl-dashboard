# HubSpot LinkedIn Data Analysis

## Current Status: HubSpot is NOT Fetching LinkedIn Data

Based on the codebase analysis, **HubSpot is currently NOT fetching any LinkedIn-specific data**. However, HubSpot does store LinkedIn-related information that we could fetch.

---

## What HubSpot Currently Fetches

### 1. **Contacts** (`/api/hubspot/contacts`)
**Properties Currently Fetched:**
- `firstname` - First name
- `lastname` - Last name  
- `email` - Email address
- `company` - Company name
- `jobtitle` - Job title
- `phone` - Phone number

**❌ LinkedIn Fields NOT Currently Fetched:**
- `hs_linkedinbio` - LinkedIn bio
- `linkedinbio` - LinkedIn bio (alternative)
- `hs_social_linkedin` - LinkedIn profile URL
- `linkedin_url` - LinkedIn URL (custom property)
- `hs_analytics_source` - Source (may contain "LinkedIn")

---

### 2. **Deals** (`/api/hubspot/deals`)
**Properties Currently Fetched:**
- `dealname` - Deal name
- `amount` - Deal value
- `dealstage` - Current stage
- `closedate` - Close date
- `pipeline` - Pipeline name
- `createdate` - Creation date
- `hs_analytics_source` - **Source (may indicate LinkedIn)**
- `hs_analytics_source_data_1` - Source data 1
- `hs_analytics_source_data_2` - Source data 2

**✅ Partially LinkedIn-Related:**
- `hs_analytics_source` - This field may contain "LinkedIn" if the deal came from LinkedIn ads/campaigns
- `hs_analytics_source_data_1` and `hs_analytics_source_data_2` - May contain LinkedIn campaign/account info

---

### 3. **Companies** (`/api/hubspot/companies`)
**Properties Currently Fetched:**
- `name` - Company name
- `domain` - Company domain
- `industry` - Industry
- `numberofemployees` - Employee count
- `annualrevenue` - Annual revenue
- `phone` - Phone number
- `address` - Address
- `website` - Website
- `city` - City
- `country` - Country

**❌ LinkedIn Fields NOT Currently Fetched:**
- `hs_social_linkedin` - Company LinkedIn page URL
- `linkedin_company_url` - LinkedIn company URL (custom property)

---

## Available LinkedIn Properties in HubSpot

HubSpot has several LinkedIn-related properties that we could fetch:

### For Contacts:
1. **`hs_social_linkedin`** - LinkedIn profile URL (standard property)
2. **`linkedin_url`** - LinkedIn URL (custom property, if configured)
3. **`hs_linkedinbio`** or **`linkedinbio`** - LinkedIn bio
4. **`hs_analytics_source`** - Source tracking (may show "LinkedIn")

### For Companies:
1. **`hs_social_linkedin`** - Company LinkedIn page URL
2. **`linkedin_company_url`** - LinkedIn company URL (custom property, if configured)

### For Deals:
1. **`hs_analytics_source`** - Source (may show "LinkedIn" if deal came from LinkedIn)
2. **`hs_analytics_source_data_1`** - Additional source data (may contain LinkedIn campaign info)
3. **`hs_analytics_source_data_2`** - Additional source data (may contain LinkedIn account info)

---

## What We Could Add

### Option 1: Add LinkedIn Fields to Contacts Fetch
```typescript
properties: [
  "firstname", 
  "lastname", 
  "email", 
  "company", 
  "jobtitle", 
  "phone",
  "hs_social_linkedin",  // ← Add this
  "linkedin_url",        // ← Add this (if custom property exists)
  "hs_analytics_source"  // ← Add this to see source
]
```

### Option 2: Add LinkedIn Fields to Companies Fetch
```typescript
properties: [
  "name",
  "domain",
  "industry",
  // ... existing fields ...
  "hs_social_linkedin",  // ← Add this
  "linkedin_company_url" // ← Add this (if custom property exists)
]
```

### Option 3: Filter Deals by LinkedIn Source
We could filter deals where `hs_analytics_source` contains "LinkedIn" to see:
- How many deals came from LinkedIn
- Total value of LinkedIn-sourced deals
- Conversion rate from LinkedIn

---

## Current Integration Status

**LinkedIn Data Source:**
- LinkedIn data is fetched **directly from LinkedIn API** (not through HubSpot)
- Located in: `lib/mcp/linkedin.ts`
- Fetches: Accounts, Campaigns, Analytics (impressions, clicks, spend, conversions)

**HubSpot Data Source:**
- HubSpot data is fetched **directly from HubSpot API**
- Located in: `lib/mcp/hubspot.ts`
- Currently does NOT fetch LinkedIn-related fields

**They are separate integrations** - HubSpot doesn't fetch LinkedIn data, and LinkedIn doesn't fetch HubSpot data.

---

## Recommendations

1. **Add LinkedIn URL to Contacts** - Fetch `hs_social_linkedin` to display LinkedIn profiles
2. **Track LinkedIn-Sourced Deals** - Use `hs_analytics_source` to identify deals from LinkedIn
3. **Add Company LinkedIn Pages** - Fetch `hs_social_linkedin` for companies
4. **Create LinkedIn Attribution Report** - Show which deals/contacts came from LinkedIn

Would you like me to add these LinkedIn fields to the HubSpot data fetching?
