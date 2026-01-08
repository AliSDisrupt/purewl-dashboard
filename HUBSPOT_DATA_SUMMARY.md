# HubSpot Data Fetching Summary

## Overview
The dashboard fetches data from HubSpot CRM API using direct API calls with an access token.

## API Endpoints Used

### 1. **Deals** (`/api/hubspot/deals`)
**Endpoint:** `GET /crm/v3/objects/deals`

**Properties Fetched:**
- `dealname` - Deal name
- `amount` - Deal value/amount
- `dealstage` - Current stage in pipeline
- `closedate` - Expected/actual close date
- `pipeline` - Pipeline name
- `createdAt` - Creation timestamp (for sorting)

**Data Returned:**
```typescript
{
  deals: [
    {
      id: string,
      name: string,
      amount: number | null,
      stage: string,
      closeDate: string | null
    }
  ],
  summary: {
    totalDeals: number,
    totalValue: number,  // Sum of all deal amounts
    byStage: {          // Count of deals per stage
      [stageName]: number
    }
  }
}
```

**Current Usage:**
- Used on main dashboard (`/`) to display **Pipeline Value** in a KPI card
- Shows total value of all deals in HubSpot
- Default limit: 10 deals (configurable via query param)

---

### 2. **Contacts** (`/api/hubspot/contacts`)
**Endpoint:** `POST /crm/v3/objects/contacts/search`

**Properties Fetched:**
- `firstname` - First name
- `lastname` - Last name
- `email` - Email address
- `company` - Company name
- `jobtitle` - Job title
- `phone` - Phone number

**Search Capabilities:**
- Optional search query parameter
- Searches across: email, firstname, lastname
- Uses `CONTAINS_TOKEN` operator for flexible matching

**Data Returned:**
```typescript
{
  contacts: [
    {
      id: string,
      name: string,        // Combined firstname + lastname
      email: string,
      phone: string | null,
      company: string | null
    }
  ]
}
```

**Current Usage:**
- API endpoint exists but **NOT currently displayed** on any page
- Available for future CRM page implementation

---

### 3. **Conversations** (`/api/hubspot/conversations`)
**Endpoint:** `GET /conversations/v3/conversations/threads`

**Properties Fetched:**
- `id` - Thread ID
- `status` - OPEN or CLOSED

**Data Returned:**
```typescript
{
  threads: [
    {
      id: string,
      status: 'OPEN' | 'CLOSED'
    }
  ],
  summary: {
    total: number,
    open: number,
    closed: number
  }
}
```

**Current Usage:**
- API endpoint exists but **NOT currently displayed** on any page
- Available for future CRM page implementation

---

## Current Dashboard Integration

### Main Dashboard (`/`)
- **Deals Summary**: Only the `totalValue` from deals is displayed
- **KPI Card**: Shows "Pipeline Value" with the sum of all deal amounts
- **Location**: Main dashboard KPI cards section

### CRM Page (`/crm`)
- Currently a placeholder: "HubSpot CRM view - Coming soon"
- No HubSpot data displayed yet

---

## API Configuration

**Required Environment Variables:**
- `HUBSPOT_ACCESS_TOKEN` - OAuth access token for HubSpot API
- `HUBSPOT_API_BASE` - Optional, defaults to `https://api.hubapi.com`

**Authentication:**
- Uses Bearer token authentication
- Header: `Authorization: Bearer ${ACCESS_TOKEN}`

---

## Data Limitations

1. **Deals:**
   - Default limit: 10 deals
   - Sorted by: `-createdAt` (newest first)
   - Only fetches basic deal properties

2. **Contacts:**
   - Default limit: 10 contacts
   - Search is optional (empty query returns all)
   - Returns empty array if token not configured

3. **Conversations:**
   - Limit: 5 threads
   - Only fetches thread status, not full conversation details

---

## Potential Enhancements

1. **Deals:**
   - Add deal owner information
   - Add deal probability
   - Add deal source
   - Filter by pipeline
   - Date range filtering

2. **Contacts:**
   - Display contacts table on CRM page
   - Add contact lifecycle stage
   - Add contact tags
   - Add contact engagement score

3. **Conversations:**
   - Display conversation threads
   - Show conversation messages
   - Filter by status
   - Show conversation assignee

4. **Additional Data:**
   - Companies
   - Tickets
   - Tasks
   - Meetings
   - Email events

---

## Error Handling

All HubSpot functions include error handling:
- Returns empty arrays/zero values on errors
- Logs errors to console
- Does not crash the application
- Gracefully handles missing access tokens
