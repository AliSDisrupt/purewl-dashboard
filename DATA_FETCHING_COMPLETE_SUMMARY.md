# Complete Data Fetching Summary

**Last Updated:** January 2026  
**System:** PureWL Dashboard (Orion Analytics Dashboard)

This document provides a comprehensive overview of ALL data being fetched by the system from all sources.

---

## 📊 Table of Contents

1. [Google Analytics 4 (GA4) Data](#google-analytics-4-ga4-data)
2. [HubSpot CRM Data](#hubspot-crm-data)
3. [LinkedIn Ads Data](#linkedin-ads-data)
4. [Reddit Data](#reddit-data)
5. [RB2B Visitor Intelligence Data](#rb2b-visitor-intelligence-data)
6. [MongoDB Collections](#mongodb-collections)
7. [Data Flow Summary](#data-flow-summary)

---

## 📈 Google Analytics 4 (GA4) Data

**Status:** ✅ **Active**  
**API:** Google Analytics Data API v5.2.1  
**Property ID:** `383191966`  
**Authentication:** Service Account (JSON credentials)

### Overview Metrics (`/api/ga4/overview`)
**Fetched:**
- `totalUsers` - Total number of users
- `newUsers` - Number of new users
- `sessions` - Total sessions
- `screenPageViews` - Total page views
- `engagementRate` - Engagement rate (0-1)
- `averageSessionDuration` - Average session duration (seconds)
- `bounceRate` - Bounce rate (0-1)
- **Daily Trend:** `date`, `totalUsers`, `sessions`

### Traffic Channels (`/api/ga4/traffic`)
**Fetched:**
- **By Channel:** `sessionDefaultChannelGroup`, `totalUsers`, `sessions`, `engagementRate`
- **By Device:** `deviceCategory`, `totalUsers`

### Geographic Data (`/api/ga4/geography`)
**Fetched:**
- `country` - Country name
- `totalUsers` - Users per country
- `sessions` - Sessions per country
- **Limit:** Top 20 countries

### Top Pages (`/api/ga4/pages`)
**Fetched:**
- `pagePath` - Page URL path
- `totalUsers` - Users per page
- `screenPageViews` - Page views per page
- `engagementRate` - Engagement rate per page
- `averageSessionDuration` - Avg session duration per page
- `bounceRate` - Bounce rate per page
- **Limit:** Top 50 pages

### Campaigns (`/api/ga4/campaigns`)
**Fetched:**
- `campaignName` - Campaign name
- `totalUsers` - Users per campaign
- `sessions` - Sessions per campaign
- `conversions` - Conversions per campaign
- `totalRevenue` - Revenue per campaign
- `engagementRate` - Engagement rate per campaign

### Source/Medium (`/api/ga4/source-medium`)
**Fetched:**
- `sessionSource` - Traffic source
- `sessionMedium` - Traffic medium
- `totalUsers` - Users per source/medium
- `sessions` - Sessions per source/medium
- `engagementRate` - Engagement rate
- `averageSessionDuration` - Avg session duration

### Events (`/api/ga4/events`)
**Fetched:**
- `eventName` - Event name
- `eventCount` - Total event count
- `totalUsers` - Users who triggered event
- `conversions` - Conversions from event
- `totalRevenue` - Revenue from event

### Demographics (`/api/ga4/demographics`)
**Fetched:**
- `userAgeBracket` - Age group
- `userGender` - Gender
- `totalUsers` - Users per demographic
- `sessions` - Sessions per demographic
- `engagementRate` - Engagement rate per demographic

### Technology (`/api/ga4/technology`)
**Fetched:**
- `browser` - Browser name
- `operatingSystem` - OS name
- `deviceCategory` - Device type
- `totalUsers` - Users per technology
- `sessions` - Sessions per technology
- `engagementRate` - Engagement rate per technology

### Acquisition (`/api/ga4/acquisition`)
**Fetched:**
- `firstUserDefaultChannelGroup` - First touch channel
- `firstUserSource` - First touch source
- `firstUserMedium` - First touch medium
- `totalUsers` - Users per acquisition path
- `sessions` - Sessions per acquisition path

### Content (`/api/ga4/content`)
**Fetched:**
- `pageTitle` - Page title
- `pagePath` - Page path
- `totalUsers` - Users per page
- `screenPageViews` - Page views
- `engagementRate` - Engagement rate
- `averageSessionDuration` - Avg engagement time
- `bounceRate` - Bounce rate
- `conversions` - Conversions per page

### Time Patterns (`/api/ga4/time-patterns`)
**Fetched:**
- `hour` - Hour of day (0-23)
- `dayOfWeek` - Day of week (0-6)
- `totalUsers` - Users per time period
- `sessions` - Sessions per time period
- `engagementRate` - Engagement rate per time period

### Conversion Paths (`/api/ga4/conversion-paths`)
**Fetched:**
- Multi-touch attribution paths
- `sourceMedium` - Source/medium combinations
- `totalUsers` - Users per path
- `conversions` - Conversions per path

### Retention (`/api/ga4/retention`)
**Fetched:**
- `date` - Date
- `cohort` - Cohort date
- `totalUsers` - Users per cohort
- `retentionRate` - Retention rate

### Search Terms (`/api/ga4/search-terms`)
**Fetched:**
- `searchTerm` - Search query
- `totalUsers` - Users per search term
- `sessions` - Sessions per search term
- `eventCount` - Event count per search term

### Realtime (`/api/ga4/realtime`)
**Fetched:**
- `totalUsers` - Active users right now
- `sessions` - Active sessions
- `screenPageViews` - Active page views
- **Note:** No date range (real-time only)

### Ads - Reddit (`/api/ga4/ads`)
**Fetched:**
- `sessionSource` = "reddit"
- `sessionMedium` = "cpc" or "social"
- `campaignName` - Reddit campaign name
- `totalUsers`, `sessions`, `conversions`, `totalRevenue`

### Ads - FluentForm (`/api/ga4/ads`)
**Fetched:**
- `sessionSource` = "fluentform" or form-related sources
- `totalUsers`, `sessions`, `conversions`

### Fluid Fusion (`/api/ga4/fluid-fusion`)
**Fetched:**
- Combined data from Reddit, Google Ads, and Website
- `sessionSource` - Source breakdown
- `sessionMedium` - Medium breakdown
- `totalUsers`, `sessions`, `conversions`, `totalRevenue`

### Google Ads (via GA4) (`/api/google-ads`)
**Fetched:**
- `sessionSource` = "google"
- `sessionMedium` = "cpc"
- `campaignName` - Google Ads campaign
- `totalUsers`, `sessions`, `conversions`, `totalRevenue`

**Total GA4 Endpoints:** 18+ endpoints  
**Total Metrics Fetched:** 30+ unique metrics  
**Total Dimensions Fetched:** 15+ unique dimensions

---

## 💼 HubSpot CRM Data

**Status:** ✅ **Active**  
**API:** HubSpot CRM API v3  
**Authentication:** OAuth 2.0 Access Token

### Deals (`/api/hubspot/deals`)
**Fetched:**
- `dealname` - Deal name
- `amount` - Deal value/amount
- `dealstage` - Current stage in pipeline
- `closedate` - Expected/actual close date
- `pipeline` - Pipeline name
- `createdate` - Creation timestamp
- `hs_analytics_source` - Source tracking
- `hs_analytics_source_data_1` - Additional source data
- `hs_analytics_source_data_2` - Additional source data
- **Pagination:** Fetches ALL deals (up to 100k)
- **Returns:** `deals[]`, `summary.totalDeals`, `summary.totalValue`, `summary.byStage`

### Deals by Stage (`/api/hubspot/deals-by-stage`)
**Fetched:**
- Same deal properties as above
- **Filtered by:** Stage name, date range
- **Returns:** Deals grouped by stage with counts and total values

### Contacts (`/api/hubspot/contacts`)
**Fetched:**
- `firstname` - First name
- `lastname` - Last name
- `email` - Email address
- `company` - Company name
- `jobtitle` - Job title
- `phone` - Phone number
- **Search:** Optional query parameter (searches email, firstname, lastname)
- **Returns:** `contacts[]` with id, name, email, phone, company

### Companies (`/api/hubspot/companies`)
**Fetched:**
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
- **Returns:** `companies[]` with all properties

### Conversations (`/api/hubspot/conversations`)
**Fetched:**
- `id` - Conversation ID
- `status` - Status (OPEN, CLOSED)
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp
- `subject` - Conversation subject
- `preview` - Message preview
- `channel` - Channel (email, chat, etc.)
- `participants` - Participant IDs
- `associatedContact` - Associated contact ID
- `associatedDeal` - Associated deal ID
- **Returns:** `threads[]`, `summary.total`, `summary.open`, `summary.closed`

### Calls (`/api/hubspot/calls`)
**Fetched:**
- Call logs and recordings
- Call duration, direction, outcome
- Associated contacts and deals

### Emails (`/api/hubspot/emails`)
**Fetched:**
- Email activity logs
- Sent/received emails
- Email opens, clicks
- Associated contacts and deals

### Meetings (`/api/hubspot/meetings`)
**Fetched:**
- Meeting schedules
- Meeting attendees
- Meeting notes
- Associated contacts and deals

### Tasks (`/api/hubspot/tasks`)
**Fetched:**
- Task name/subject
- Status (NOT_STARTED, IN_PROGRESS, COMPLETED, etc.)
- Priority
- Due date
- Assigned to
- Task type (CALL, EMAIL, MEETING, etc.)
- Notes
- Associated contacts/deals/companies

### Tickets (`/api/hubspot/tickets`)
**Fetched:**
- Ticket subject/title
- Status (NEW, OPEN, PENDING, CLOSED)
- Priority (LOW, MEDIUM, HIGH, URGENT)
- Category
- Assigned to
- Created/updated dates
- Source (email, chat, phone, etc.)
- Associated contact/company

### Owners (`/api/hubspot/owners`)
**Fetched:**
- Owner/user information
- Name, email
- Team assignments
- Used for deal/contact ownership

### Pipelines (`/api/hubspot/pipelines`)
**Fetched:**
- Pipeline definitions
- Stage names and IDs
- Stage probabilities
- Stage order
- Closed won/lost indicators

### Products (`/api/hubspot/products`)
**Fetched:**
- Product catalog
- Product names, descriptions
- Prices
- Associated with deals (line items)

### Line Items (`/api/hubspot/line-items`)
**Fetched:**
- Deal line items
- Product associations
- Quantities, prices
- Deal associations

### Quotes (`/api/hubspot/quotes`)
**Fetched:**
- Sales quotes
- Quote amounts
- Associated deals
- Quote status

### LinkedIn Ads Data (from HubSpot) (`/api/hubspot/linkedin-ads`)
**Fetched:**
- **Contacts:** Filtered by `hs_analytics_source = "linkedin"` OR `"PAID_SOCIAL"`
- **Deals:** Filtered by source containing "linkedin"
- **Conversations:** Associated with LinkedIn-sourced contacts
- **Properties:**
  - `jobTitle` - Job title
  - `linkedInProfileUrl` - LinkedIn profile URL
  - `sourceData1`, `sourceData2` - Campaign/source data
- **Returns:** Aggregated LinkedIn Ads performance metrics

**Total HubSpot Endpoints:** 18+ endpoints  
**Total Properties Fetched:** 50+ unique properties

---

## 💼 LinkedIn Ads Data

**Status:** ✅ **Active**  
**API:** LinkedIn Marketing API  
**Authentication:** OAuth 2.0 Access Token  
**MCP Server:** npm package `linkedin-ads-mcp-server`

### Accounts (`/api/linkedin/accounts`)
**Fetched:**
- `id` - Account ID
- `name` - Account name
- `simpleId` - Simple account ID
- `status` - Account status
- `currency` - Currency code
- `type` - Account type

### Accounts List (`/api/linkedin/accounts-list`)
**Fetched:**
- List of all ad accounts
- Account details for each

### Accounts Detail (`/api/linkedin/accounts-detail`)
**Fetched:**
- Detailed account information
- Account settings
- Billing information

### Campaigns (`/api/linkedin/campaigns`)
**Fetched:**
- `id` - Campaign ID
- `name` - Campaign name
- `status` - Campaign status (ACTIVE, PAUSED, etc.)
- `objective` - Campaign objective
- `createdAt` - Creation date
- `accountId` - Associated account ID
- `accountName` - Account name
- `type` - Campaign type
- `dailyBudget` - Daily budget
- `totalBudget` - Total budget
- `startDate` - Start date
- `endDate` - End date
- **Optional:** Campaign analytics (if `includeAnalytics=true`)

### Campaign Analytics (`/api/linkedin/campaign-analytics`)
**Fetched:**
- `impressions` - Total impressions
- `clicks` - Total clicks
- `spend` - Total spend (costInLocalCurrency)
- `conversions` - Total conversions
- `ctr` - Click-through rate
- `cpc` - Cost per click
- `cpm` - Cost per mille (1000 impressions)
- `costPerConversion` - Cost per conversion
- `totalEngagements` - Total engagements
- `likes` - Likes count
- `comments` - Comments count
- `shares` - Shares count
- `reactions` - Reactions count
- `follows` - Follows count
- `companyPageClicks` - Company page clicks
- `landingPageClicks` - Landing page clicks
- `oneClickLeads` - One-click leads
- `qualifiedLeads` - Qualified leads
- `validWorkEmailLeads` - Valid work email leads
- `videoStarts` - Video starts
- `videoViews` - Video views
- `videoCompletions` - Video completions
- `conversionValue` - Conversion value
- `externalWebsiteConversions` - External website conversions
- `externalWebsitePostClickConversions` - Post-click conversions
- `externalWebsitePostViewConversions` - Post-view conversions

### Analytics (`/api/linkedin/analytics`)
**Fetched:**
- Account-level aggregated analytics
- Same metrics as campaign analytics
- Aggregated across all campaigns in account
- **Date Range:** Configurable (default: 30 days)

**Total LinkedIn Endpoints:** 6 endpoints  
**Total Metrics Fetched:** 25+ unique metrics

---

## 🔴 Reddit Data

**Status:** ✅ **Active**  
**API:** Reddit Public API  
**Authentication:** None required (public read-only)

### Posts (`/api/reddit/posts`)
**Fetched:**
- `title` - Post title
- `subreddit` - Subreddit name
- `score` - Post score (upvotes - downvotes)
- `commentCount` - Number of comments
- `url` - Post URL
- `createdAt` - Creation timestamp
- `author` - Post author
- `matchedKeywords` - Keywords that matched search
- **Search Keywords:**
  - "white label VPN"
  - "Orion"
  - "VPN reseller"
  - Related industry terms
- **Time Range:** Configurable (week, month, year, all)
- **Limit:** Configurable (default: 20 posts)

**Total Reddit Endpoints:** 1 endpoint  
**Total Data Points:** ~10 per post

---

## 👤 RB2B Visitor Intelligence Data

**Status:** ✅ **Active**  
**Integration:** Webhook + Direct API  
**Authentication:** Optional webhook secret

### Webhook Data (`/api/webhooks/rb2b`)
**Received from RB2B:**
- `LinkedIn URL` - LinkedIn profile URL
- `First Name` - First name
- `Last Name` - Last name
- `Title` - Job title
- `Company Name` - Company name
- `Business Email` - Business email
- `Website` - Company website
- `Industry` - Industry
- `Employee Count` - Employee count range
- `Estimate Revenue` - Estimated revenue
- `City` - City
- `State` - State
- `Zipcode` - Zipcode
- `Seen At` - Visit timestamp
- `Referrer` - Referrer URL
- `Captured URL` - Page URL visited
- `Tags` - Tags/labels
- `is_repeat_visit` - Repeat visit flag

**Data Enrichment:**
- IP address enrichment (via RB2B API)
- Email enrichment (via RB2B API)
- Company data enrichment

**Storage:**
- **Raw Events:** `rb2b_page_visits` collection
- **Aggregated:** `rb2b_person_visits` collection

### Page Visits (`/api/rb2b/page-visits`)
**Fetched from MongoDB:**
- All fields from webhook
- Filtered by date range, company, email, etc.
- **Returns:** Raw event-level data

### Person Visits (`/api/rb2b/person-visits`)
**Fetched from MongoDB:**
- `identity_key` - Unique visitor identifier
- `first_seen` - First visit date
- `last_seen` - Last visit date
- `page_views` - Total page views
- `last_page` - Last page visited
- `visitor_data` - All visitor information
- `all_pages` - Array of all pages visited
- `unique_days` - Array of unique visit dates
- `unique_days_count` - Number of unique days
- **Returns:** Aggregated visitor-level data

**Total RB2B Endpoints:** 3 endpoints  
**Total Fields:** 20+ unique fields

---

## 💾 MongoDB Collections

**Status:** ✅ **Active**  
**Database:** MongoDB  
**Connection:** `MONGODB_URI` environment variable

### Collection 1: `rb2b_page_visits`
**Purpose:** Store raw page visit events from RB2B webhooks

**Schema:**
- `identity_key` (String, indexed)
- `seen_at` (Date, indexed)
- `captured_url` (String, required)
- `referrer` (String)
- `tags` (String)
- `first_name`, `last_name`, `title` (String)
- `company_name` (String, indexed)
- `business_email` (String, indexed, lowercase)
- `website`, `industry`, `employee_count`, `estimate_revenue` (String)
- `city`, `state`, `zipcode` (String)
- `linkedin_url` (String)
- `is_repeat_visit` (Boolean)
- `createdAt`, `updatedAt` (Date, auto)

**Indexes:**
- `identity_key`
- `seen_at`
- `company_name` + `seen_at` (compound)
- `business_email` + `seen_at` (compound)

### Collection 2: `rb2b_person_visits`
**Purpose:** Store aggregated visitor data per person/company

**Schema:**
- `identity_key` (String, unique, indexed)
- `first_seen` (Date, required)
- `last_seen` (Date, required, indexed)
- `page_views` (Number, default: 1)
- `last_page` (String, required)
- `visitor_data` (Object):
  - All visitor fields (name, email, company, etc.)
- `all_pages` (Array of Strings)
- `unique_days` (Array of Dates)
- `unique_days_count` (Number, default: 1)
- `createdAt`, `updatedAt` (Date, auto)

**Indexes:**
- `identity_key` (unique)
- `last_seen`
- `visitor_data.company_name` + `last_seen` (compound)
- `visitor_data.business_email` + `last_seen` (compound)

### Collection 3: `visitors` (Legacy)
**Purpose:** Legacy collection (may be deprecated)

**Total Collections:** 3 collections  
**Total Indexes:** 8+ indexes

---

## 📊 Data Flow Summary

### Real-Time Data Flow

```
External APIs → Next.js API Routes → Frontend Components
     ↓
MongoDB (for visitor data)
```

### Data Sources by Category

1. **Analytics Data:**
   - GA4: 18+ endpoints, 30+ metrics, 15+ dimensions
   - Real-time active users

2. **CRM Data:**
   - HubSpot: 18+ endpoints, 50+ properties
   - Contacts, deals, companies, activities

3. **Advertising Data:**
   - LinkedIn Ads: 6 endpoints, 25+ metrics
   - Google Ads (via GA4): Campaign performance
   - Reddit Ads (via GA4): Campaign performance

4. **Social Media Data:**
   - Reddit: Post monitoring, engagement tracking

5. **Visitor Intelligence:**
   - RB2B: 20+ fields per visitor
   - Company enrichment
   - Contact enrichment

### Data Aggregation

**AI Agent System:**
- **Data Aggregator:** Fetches from all sources in parallel
- **Insight Generator:** Analyzes aggregated data
- **Report Formatter:** Creates comprehensive reports

**Total Data Points Fetched:**
- **GA4:** ~500+ data points per query
- **HubSpot:** ~1000+ records (deals, contacts, etc.)
- **LinkedIn:** ~100+ metrics per account
- **Reddit:** ~20 posts per query
- **RB2B:** ~1000+ visitor records

---

## 🔄 Update Frequency

- **GA4:** Real-time (realtime endpoint) + Historical (cached)
- **HubSpot:** On-demand (when page loads or API called)
- **LinkedIn:** On-demand (when page loads or API called)
- **Reddit:** On-demand (when page loads or API called)
- **RB2B:** Real-time (webhook) + On-demand (API queries)

---

## 📝 Notes

- All data is fetched in real-time from APIs (no local caching except MongoDB)
- Date ranges are configurable for most endpoints
- Pagination is handled automatically for large datasets
- Error handling includes fallbacks and retries
- Rate limiting is respected for all APIs

---

**Document Version:** 1.0  
**Last Updated:** January 2026  
**Total Data Sources:** 5 major sources  
**Total API Endpoints:** 50+ endpoints  
**Total Data Points:** 2000+ unique data points
