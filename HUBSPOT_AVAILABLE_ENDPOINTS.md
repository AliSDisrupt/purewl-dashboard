# HubSpot Available API Endpoints

## Currently Implemented Endpoints

### ✅ 1. Deals
**Endpoint:** `GET /crm/v3/objects/deals`
**Status:** ✅ Implemented
**Properties Fetched:**
- dealname, amount, dealstage, closedate, pipeline

### ✅ 2. Contacts
**Endpoint:** `POST /crm/v3/objects/contacts/search`
**Status:** ✅ Implemented
**Properties Fetched:**
- firstname, lastname, email, company, jobtitle, phone

### ✅ 3. Conversations
**Endpoint:** `GET /conversations/v3/conversations/threads`
**Status:** ✅ Implemented
**Properties Fetched:**
- id, status, createdAt, updatedAt, subject, preview, channel, participants

---

## Available Endpoints We Can Add

### 🆕 4. Companies
**Endpoint:** `GET /crm/v3/objects/companies`
**Scope Required:** `crm.objects.companies.read`
**What We Can Fetch:**
- Company name
- Domain
- Industry
- Number of employees
- Annual revenue
- Phone number
- Address
- Website
- Associated contacts count
- Associated deals count

**Use Case:** Display company information, company size, industry breakdown

---

### 🆕 5. Tickets (Support Tickets)
**Endpoint:** `GET /crm/v3/objects/tickets`
**Scope Required:** `tickets.read`
**What We Can Fetch:**
- Ticket subject/title
- Status (NEW, OPEN, PENDING, CLOSED)
- Priority (LOW, MEDIUM, HIGH, URGENT)
- Category
- Assigned to
- Created date
- Updated date
- Source (email, chat, phone, etc.)
- Associated contact/company

**Use Case:** Support ticket tracking, ticket status dashboard, response time metrics

---

### 🆕 6. Tasks
**Endpoint:** `GET /crm/v3/objects/tasks`
**Scope Required:** `tasks.read`
**What We Can Fetch:**
- Task name/subject
- Status (NOT_STARTED, IN_PROGRESS, COMPLETED, WAITING, DEFERRED)
- Priority
- Due date
- Assigned to
- Associated contact/deal/company
- Task type (CALL, EMAIL, MEETING, etc.)
- Notes

**Use Case:** Task management, activity tracking, follow-up reminders

---

### 🆕 7. Meetings
**Endpoint:** `GET /crm/v3/objects/meetings`
**Scope Required:** `meetings.read`
**What We Can Fetch:**
- Meeting title
- Start time
- End time
- Meeting body/notes
- Location (in-person, video call, etc.)
- Attendees
- Associated contact/deal/company
- Meeting URL (for video calls)

**Use Case:** Calendar integration, meeting tracking, scheduled meetings dashboard

---

### 🆕 8. Calls
**Endpoint:** `GET /crm/v3/objects/calls`
**Scope Required:** `calls.read`
**What We Can Fetch:**
- Call title
- Call duration
- Call direction (INBOUND, OUTBOUND)
- Call status
- Recording URL (if available)
- Notes/transcript
- Associated contact/deal/company
- Start time

**Use Case:** Call tracking, call analytics, call duration metrics

---

### 🆕 9. Emails
**Endpoint:** `GET /crm/v3/objects/emails`
**Scope Required:** `sales-email-read`
**What We Can Fetch:**
- Email subject
- Email body/content
- From/to addresses
- Sent/received date
- Email status (SENT, OPENED, CLICKED, REPLIED)
- Open count
- Click count
- Associated contact/deal/company

**Use Case:** Email engagement tracking, email campaign performance

---

### 🆕 10. Products
**Endpoint:** `GET /crm/v3/objects/products`
**Scope Required:** `crm.objects.products.read`
**What We Can Fetch:**
- Product name
- Product code/SKU
- Price
- Description
- Product category
- Associated deals
- Quantity sold

**Use Case:** Product catalog, product performance, sales by product

---

### 🆕 11. Line Items
**Endpoint:** `GET /crm/v3/objects/line_items`
**Scope Required:** `crm.objects.line_items.read`
**What We Can Fetch:**
- Line item name
- Quantity
- Price
- Amount
- Associated deal
- Associated product
- Discount

**Use Case:** Deal line items, product breakdown per deal

---

### 🆕 12. Quotes
**Endpoint:** `GET /crm/v3/objects/quotes`
**Scope Required:** `crm.objects.quotes.read`
**What We Can Fetch:**
- Quote title
- Quote amount
- Status
- Expiration date
- Associated deal
- Associated contact/company
- Line items

**Use Case:** Quote tracking, quote-to-deal conversion

---

### 🆕 13. Timeline Events
**Endpoint:** `GET /integrations/v1/{appId}/timeline/events`
**Scope Required:** `timeline.events.read`
**What We Can Fetch:**
- Event type
- Event timestamp
- Event description
- Associated contact/deal/company
- Event metadata

**Use Case:** Activity timeline, interaction history

---

### 🆕 14. Email Events
**Endpoint:** `GET /email/public/v1/events`
**Scope Required:** `sales-email-read`
**What We Can Fetch:**
- Email open events
- Email click events
- Email bounce events
- Email unsubscribe events
- Timestamp
- Recipient email
- Email campaign ID

**Use Case:** Email engagement analytics, open rates, click rates

---

### 🆕 15. Owners (Users)
**Endpoint:** `GET /crm/v3/owners`
**Scope Required:** `crm.objects.read` (usually included)
**What We Can Fetch:**
- Owner name
- Email
- User ID
- Team
- Active status

**Use Case:** Assignee information, team performance, ownership tracking

---

### 🆕 16. Pipelines
**Endpoint:** `GET /crm/v3/pipelines/{objectType}`
**Scope Required:** `crm.objects.read`
**What We Can Fetch:**
- Pipeline name
- Pipeline stages
- Stage order
- Stage probability
- Pipeline ID

**Use Case:** Pipeline configuration, stage definitions

---

### 🆕 17. Associations
**Endpoint:** `GET /crm/v4/objects/{objectType}/{objectId}/associations/{toObjectType}`
**Scope Required:** `crm.objects.read`
**What We Can Fetch:**
- Associated contacts for a deal
- Associated deals for a contact
- Associated companies for a contact
- Association labels

**Use Case:** Relationship mapping, contact-to-deal associations

---

### 🆕 18. Properties
**Endpoint:** `GET /crm/v3/properties/{objectType}`
**Scope Required:** `crm.objects.read`
**What We Can Fetch:**
- Available properties for an object type
- Property types
- Property options (for dropdowns)
- Custom properties

**Use Case:** Dynamic property discovery, custom field support

---

## Recommended Priority Implementation

### High Priority (Most Useful)
1. **Companies** - Essential for B2B CRM
2. **Tickets** - Support tracking
3. **Tasks** - Activity management
4. **Meetings** - Calendar integration

### Medium Priority
5. **Calls** - Call tracking
6. **Emails** - Email engagement
7. **Products** - Product catalog

### Low Priority (Nice to Have)
8. **Line Items** - Detailed deal breakdown
9. **Quotes** - Quote management
10. **Timeline Events** - Activity history
11. **Email Events** - Email analytics

---

## Implementation Notes

### Pagination
Most endpoints support pagination using:
- `limit` parameter (max 100 per page)
- `after` cursor for next page
- Similar to deals implementation

### Rate Limits
- HubSpot API rate limit: 100 requests per 10 seconds
- For bulk fetching, implement pagination and rate limiting

### Required Scopes
Each endpoint requires specific scopes. See `HUBSPOT_SCOPES.md` for details.

### Data Structure
All CRM v3 endpoints return data in similar format:
```json
{
  "results": [
    {
      "id": "123",
      "properties": {
        "propertyName": "value"
      }
    }
  ],
  "paging": {
    "next": {
      "after": "cursor"
    }
  }
}
```

---

## Example Implementation Pattern

For any new endpoint, follow this pattern:

1. **Add interface** in `lib/mcp/hubspot.ts`
2. **Create fetch function** with pagination
3. **Create API route** in `app/api/hubspot/{endpoint}/route.ts`
4. **Create component** in `components/crm/{ComponentName}.tsx`
5. **Add to CRM page** in `app/(dashboard)/crm/page.tsx`

---

## Next Steps

To implement any of these endpoints:
1. Check required scopes in HubSpot app settings
2. Add scope to `HUBSPOT_SCOPES.md`
3. Implement fetch function with pagination
4. Create API route
5. Create UI component
6. Add to CRM page
