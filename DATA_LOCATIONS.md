# Data Locations and What's Being Fetched

## 📍 Where Deals Are Displayed

### 1. **Main Dashboard** (`/`)
**Location:** Top KPI Cards Section

**What's Shown:**
- **Pipeline Value** KPI Card
  - Shows the total value of ALL deals in HubSpot
  - Calculated from: Sum of all deal amounts
  - Updates every 5 minutes
  - Icon: Dollar sign ($)

**Data Source:**
- Fetches ALL deals from HubSpot (no limit)
- API: `/api/hubspot/deals`
- Endpoint: `GET /crm/v3/objects/deals` (with pagination)

---

### 2. **CRM Page** (`/crm`)
**Location:** 
- **KPI Cards Section** (top of page)
- **Deals Tab** (main content area)

**What's Shown:**

#### KPI Cards (Top):
1. **Pipeline Value** - Total value of all deals
2. **Total Deals** - Count of all deals
3. **Open Conversations** - Count of open conversations

#### Deals Tab (Main Table):
- **Deal Name** - Name of the deal
- **Stage** - Current pipeline stage (color-coded)
- **Amount** - Deal value in dollars
- **Close Date** - Expected/actual close date
- **Stage Breakdown** - Count of deals by stage

**Data Source:**
- Fetches ALL deals from HubSpot (no limit)
- API: `/api/hubspot/deals`
- Shows complete deal list with all details

---

## 💬 What Conversations Are Being Fetched

### Conversation Data Structure

**API Endpoint:** `/api/hubspot/conversations`
**HubSpot API:** `GET /conversations/v3/conversations/threads`

### Data Being Fetched:

1. **Basic Thread Information:**
   - `id` - Thread/Conversation ID
   - `status` - OPEN or CLOSED
   - `createdAt` - When conversation was created
   - `updatedAt` - Last update timestamp
   - `assignedTo` - Who it's assigned to
   - `subject` - Conversation subject/title

2. **Message Preview:**
   - Latest message text (first 150 characters)
   - Extracted from thread messages or preview field
   - Shows what the conversation is about

3. **Channel Information:**
   - Communication channel (email, chat, etc.)
   - Source of the conversation

4. **Participant Count:**
   - Number of people in the conversation
   - Extracted from participants array

5. **Summary Statistics:**
   - Total conversations count
   - Open conversations count
   - Closed conversations count

### Where Conversations Are Displayed

**Location:** CRM Page (`/crm`) → **Conversations Tab**

**What's Shown:**
- **Table with columns:**
  1. Subject/Preview - Conversation subject and message preview
  2. Channel - Communication channel badge
  3. Participants - Number of participants
  4. Updated - Relative time (e.g., "2h ago", "3d ago")
  5. Status - OPEN/CLOSED badge (color-coded)

- **Summary Cards:**
  - Total conversations
  - Open conversations (blue)
  - Closed conversations (green)

### Data Fetching Details:

- **Limit:** 50 conversations (configurable)
- **Sort:** Most recently updated first (`-updatedAt`)
- **Refresh:** Every 5 minutes
- **Details:** For each conversation, tries to fetch:
  - Thread details from individual API call
  - Message preview from latest message
  - Channel and participant information

---

## 📊 Complete Data Flow

### Deals Flow:
```
HubSpot API → /api/hubspot/deals → Main Dashboard (Pipeline Value)
                                      ↓
                                   CRM Page (Full Deals Table)
```

### Conversations Flow:
```
HubSpot API → /api/hubspot/conversations → CRM Page (Conversations Tab)
```

---

## 🔍 How to View the Data

### To See Deals:

1. **Main Dashboard:**
   - Navigate to `/` (home page)
   - Look at the KPI cards at the top
   - See "Pipeline Value" card

2. **Full Deals List:**
   - Navigate to `/crm`
   - Click on the **"Deals"** tab
   - See complete table with all deal details

### To See Conversations:

1. **Navigate to CRM Page:**
   - Go to `/crm`
   - Click on the **"Conversations"** tab
   - View all conversation threads with details

---

## 📝 Current Implementation Status

### ✅ Fully Implemented:
- **Deals:** 
  - ✅ Fetches ALL deals (with pagination)
  - ✅ Shows on main dashboard (pipeline value)
  - ✅ Shows on CRM page (full table)
  - ✅ Stage breakdown
  - ✅ Total value calculation

- **Conversations:**
  - ✅ Fetches up to 50 conversations
  - ✅ Shows thread details
  - ✅ Message previews
  - ✅ Channel information
  - ✅ Participant counts
  - ✅ Status summary

### 📍 Navigation:
- **Main Dashboard:** `/` - Shows Pipeline Value KPI
- **CRM Page:** `/crm` - Shows Deals, Contacts, and Conversations tabs
