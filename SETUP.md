# Setup Guide

## Environment Variables Setup

### Option 1: Automatic Setup (Recommended)

Run the setup script to automatically extract credentials from `DATA/claude_desktop_config.json`:

```bash
npm run setup-env
```

This will create `.env.local` with all the credentials from your config file.

### Option 2: Manual Setup

Since `.env.local` is gitignored, you can create it manually:

1. Copy the example file:
```bash
cp .env.example .env.local
```

2. Edit `.env.local` and add your actual credentials:

```bash
# LinkedIn Ads Configuration (from DATA/claude_desktop_config.json)
LINKEDIN_ACCESS_TOKEN=your_linkedin_access_token_here
LINKEDIN_API_BASE=https://api.linkedin.com/rest

# HubSpot Configuration (from DATA/claude_desktop_config.json)
HUBSPOT_ACCESS_TOKEN=your_hubspot_access_token_here
HUBSPOT_API_BASE=https://api.hubapi.com

# Google Analytics (GA4) Configuration (from DATA/claude_desktop_config.json)
GOOGLE_APPLICATION_CREDENTIALS=path/to/your/google-credentials.json
GA4_PROPERTY_ID=your_ga4_property_id

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## API Integration Status

### ✅ Working Now
- **LinkedIn Ads**: 
  - Direct API integration - will fetch real data when `.env.local` is configured
  - MCP Server: npm package `linkedin-ads-mcp-server` (configured in Claude Desktop)
- **HubSpot CRM**: Direct API integration - will fetch real data when `.env.local` is configured

### ⚠️ Requires Additional Setup
- **Google Analytics (GA4)**: Uses Python MCP server. Options:
  1. Create a bridge API service (Node.js/Express) that calls the Python MCP server
  2. Use Google Analytics Data API directly with `@google-analytics/data` package
  
- **Reddit**: Uses Python MCP server. Options:
  1. Create a bridge API service that calls the Python MCP server
  2. Use Reddit API directly with OAuth authentication

## Testing the Integrations

Once `.env.local` is set up:

1. **Test LinkedIn Ads**:
   - Visit `/ads` page
   - Check browser console for API calls
   - Should see real account data

2. **Test HubSpot**:
   - Visit `/crm` page
   - Check browser console for API calls
   - Should see real deals and contacts

3. **Test GA4** (when bridge is set up):
   - Visit `/analytics` page
   - Should see real analytics data

4. **Test Reddit** (when bridge is set up):
   - Visit `/community` page
   - Should see real Reddit posts

## Next Steps

1. ✅ Create `.env.local` with credentials
2. ✅ Test LinkedIn and HubSpot integrations
3. ⏳ Set up MCP bridge service for GA4 and Reddit
4. ⏳ Build UI components for all data sources
5. ⏳ Add date range picker
6. ⏳ Add data refresh functionality
