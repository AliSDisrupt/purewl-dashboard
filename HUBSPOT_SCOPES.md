# HubSpot API Scopes Required

## Overview
This document lists all the HubSpot API scopes (permissions) that should be activated for the PureWL Analytics Dashboard to function properly.

## Required Scopes

### 1. **CRM Scopes** (Essential)
These scopes are required for accessing CRM data:

```
crm.objects.contacts.read
crm.objects.contacts.write
crm.objects.deals.read
crm.objects.deals.write
crm.objects.companies.read
crm.objects.companies.write
```

**What they enable:**
- Read and write contacts
- Read and write deals
- Read and write companies
- Access to all CRM object properties

### 2. **Conversations Scopes** (For Chat/Support)
These scopes are required for accessing conversation data:

```
conversations.read
conversations.write
```

**What they enable:**
- Read conversation threads
- Read conversation messages
- Access conversation metadata
- View conversation participants
- See conversation status (OPEN/CLOSED)

### 3. **Timeline Scopes** (For Activity History)
These scopes enable viewing activity timelines:

```
timeline.events.read
timeline.events.write
```

**What they enable:**
- View activity history
- See timeline events
- Track interactions

### 4. **Email Scopes** (For Email Tracking)
These scopes enable email-related features:

```
sales-email-read
sales-email-write
```

**What they enable:**
- Read email interactions
- Track email opens/clicks
- View email engagement

### 5. **Analytics Scopes** (For Reporting)
These scopes enable analytics and reporting:

```
reports.read
analytics.read
```

**What they enable:**
- Access to HubSpot analytics
- View reports
- Export data

## Recommended Additional Scopes

### 6. **Tickets Scopes** (For Support)
If you want to track support tickets:

```
tickets.read
tickets.write
```

### 7. **Meetings Scopes** (For Calendar Integration)
If you want to track meetings:

```
meetings.read
meetings.write
```

### 8. **Tasks Scopes** (For Task Management)
If you want to track tasks:

```
tasks.read
tasks.write
```

### 9. **Files Scopes** (For File Access)
If you want to access files:

```
files.read
files.write
```

## How to Activate Scopes

### Step 1: Go to HubSpot Developer Settings
1. Log in to your HubSpot account
2. Navigate to **Settings** (gear icon in top right)
3. Go to **Integrations** → **Private Apps** (or **OAuth Apps**)

### Step 2: Create/Edit Your App
1. If creating a new app, click **Create a private app** (or **Create an OAuth app**)
2. If editing existing app, click on it

### Step 3: Select Scopes
1. Go to the **Scopes** tab
2. Check all the required scopes listed above
3. For the dashboard, at minimum select:
   - ✅ `crm.objects.contacts.read`
   - ✅ `crm.objects.deals.read`
   - ✅ `conversations.read`

### Step 4: Save and Get Token
1. Click **Save** or **Create app**
2. Copy the **Access Token** (for Private Apps) or complete OAuth flow (for OAuth Apps)
3. Add the token to your `.env.local` file as `HUBSPOT_ACCESS_TOKEN`

## Current Implementation Status

### ✅ Currently Used
- `crm.objects.deals.read` - For fetching deals
- `crm.objects.contacts.read` - For fetching contacts
- `conversations.read` - For fetching conversation threads

### ⚠️ May Need Additional Scopes
- `conversations.read` (detailed) - For reading conversation messages
- `timeline.events.read` - For activity history
- `reports.read` - For analytics data

## Testing Scopes

After activating scopes, test your API access:

```bash
# Test deals access
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.hubapi.com/crm/v3/objects/deals

# Test conversations access
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.hubapi.com/conversations/v3/conversations/threads

# Test contacts access
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.hubapi.com/crm/v3/objects/contacts
```

## Common Issues

### Error: "Insufficient scope"
**Solution:** Make sure you've activated the required scope in your HubSpot app settings.

### Error: "Access denied"
**Solution:** 
1. Check that your access token is valid
2. Verify the token hasn't expired
3. Ensure the scopes are correctly activated

### Conversations return empty
**Solution:** 
1. Activate `conversations.read` scope
2. Make sure you have conversations in your HubSpot account
3. Check that the conversations API endpoint is accessible

## Minimum Required Scopes for Dashboard

For the dashboard to work with basic features, you need at minimum:

```
crm.objects.contacts.read
crm.objects.deals.read
conversations.read
```

## Full Feature Set Scopes

For all features to work optimally, activate:

```
crm.objects.contacts.read
crm.objects.contacts.write
crm.objects.deals.read
crm.objects.deals.write
crm.objects.companies.read
conversations.read
conversations.write
timeline.events.read
reports.read
```

## Notes

- **Private Apps** are easier to set up but have all scopes by default (if you have admin access)
- **OAuth Apps** require explicit scope selection and user consent
- Some scopes may require specific HubSpot subscription tiers
- Always use the minimum required scopes for security (principle of least privilege)
