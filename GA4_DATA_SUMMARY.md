# GA4 API Data Fetching Summary

This document lists all data being fetched from the Google Analytics 4 (GA4) Data API.

## 📊 Current Data Endpoints

### 1. **Overview Data** (`/api/ga4/overview`)
**Endpoint**: `GET /api/ga4/overview?startDate={date}&endDate={date}`

**Metrics Fetched:**
- `totalUsers` - Total number of users
- `newUsers` - Number of new users
- `sessions` - Total sessions
- `screenPageViews` - Total page views
- `engagementRate` - Engagement rate (0-1)
- `averageSessionDuration` - Average session duration (seconds)
- `bounceRate` - Bounce rate (0-1)

**Dimensions:**
- `date` - Daily breakdown for trend data

**Returns:**
- `summary`: Aggregated metrics for the date range
- `trend`: Daily `totalUsers` and `sessions` over time

---

### 2. **Traffic Channels** (`/api/ga4/traffic`)
**Endpoint**: `GET /api/ga4/traffic?startDate={date}&endDate={date}`

**Channel Breakdown:**
- **Dimension**: `sessionDefaultChannelGroup`
- **Metrics**: `totalUsers`, `sessions`, `engagementRate`

**Device Breakdown:**
- **Dimension**: `deviceCategory`
- **Metrics**: `totalUsers`

**Returns:**
- `byChannel`: Array of channels with users, sessions, engagement rate, and percentage
- `byDevice`: Array of device types with users and percentage

---

### 3. **Geographic Data** (`/api/ga4/geography`)
**Endpoint**: `GET /api/ga4/geography?startDate={date}&endDate={date}&limit={number}`

**Dimensions:**
- `country` - Country name

**Metrics:**
- `totalUsers` - Users per country
- `sessions` - Sessions per country

**Returns:**
- `countries`: Array of countries with country name, country code, users, and sessions
- Limited to top 20 countries (sorted by users, descending)

---

### 4. **Top Pages** (`/api/ga4/pages`)
**Endpoint**: `GET /api/ga4/pages?startDate={date}&endDate={date}&limit={number}`

**Dimensions:**
- `pagePath` - Page URL path

**Metrics:**
- `totalUsers` - Users per page
- `screenPageViews` - Page views per page
- `engagementRate` - Engagement rate per page

**Returns:**
- `pages`: Array of pages with path, users, pageViews, and engagementRate
- Limited to top 15 pages (sorted by users, descending)

---

## 🆕 New Data Endpoints (Just Added)

### 5. **Campaigns** (`/api/ga4/campaigns`) ✨ NEW
**Endpoint**: `GET /api/ga4/campaigns?startDate={date}&endDate={date}`

**Dimensions:**
- `campaignName` - Campaign name
- `source` - Traffic source
- `sessionMedium` - Traffic medium

**Metrics:**
- `totalUsers` - Users per campaign
- `sessions` - Sessions per campaign
- `conversions` - Conversions per campaign
- `totalRevenue` - Revenue per campaign

**Returns:**
- `campaigns`: Array of campaigns with:
  - `campaign` - Campaign name
  - `source` - Traffic source
  - `medium` - Traffic medium
  - `users` - Total users
  - `sessions` - Total sessions
  - `conversions` - Total conversions
  - `revenue` - Total revenue
- Limited to top 50 campaigns (sorted by users, descending)

---

### 6. **Source/Medium** (`/api/ga4/source-medium`) ✨ NEW
**Endpoint**: `GET /api/ga4/source-medium?startDate={date}&endDate={date}`

**Dimensions:**
- `sessionSource` - Traffic source (e.g., "google", "facebook", "direct")
- `sessionMedium` - Traffic medium (e.g., "organic", "cpc", "referral")

**Metrics:**
- `totalUsers` - Users per source/medium combination
- `sessions` - Sessions per source/medium combination
- `engagementRate` - Engagement rate per source/medium

**Returns:**
- `sourceMedium`: Array of source/medium combinations with:
  - `source` - Traffic source
  - `medium` - Traffic medium
  - `users` - Total users
  - `sessions` - Total sessions
  - `engagementRate` - Engagement rate
- Limited to top 50 combinations (sorted by users, descending)

---

### 7. **Events** (`/api/ga4/events`) ✨ NEW
**Endpoint**: `GET /api/ga4/events?startDate={date}&endDate={date}`

**Dimensions:**
- `eventName` - Event name (e.g., "page_view", "click", "purchase")

**Metrics:**
- `eventCount` - Total event count
- `totalUsers` - Users who triggered the event
- `conversions` - Conversions from the event

**Returns:**
- `events`: Array of events with:
  - `eventName` - Event name
  - `eventCount` - Total event count
  - `totalUsers` - Users who triggered the event
  - `conversions` - Conversions
- Limited to top 30 events (sorted by event count, descending)

---

### 8. **Demographics** (`/api/ga4/demographics`) ✨ NEW
**Endpoint**: `GET /api/ga4/demographics?startDate={date}&endDate={date}`

**Age Group Breakdown:**
- **Dimension**: `userAgeBracket`
- **Metrics**: `totalUsers`, `sessions`

**Gender Breakdown:**
- **Dimension**: `userGender`
- **Metrics**: `totalUsers`, `sessions`

**Returns:**
- `ageGroups`: Array of age groups with users and sessions
- `genders`: Array of genders with users and sessions
- Limited to top 20 age groups and top 10 genders

---

### 9. **Technology** (`/api/ga4/technology`) ✨ NEW
**Endpoint**: `GET /api/ga4/technology?startDate={date}&endDate={date}`

**Browser Breakdown:**
- **Dimension**: `browser`
- **Metrics**: `totalUsers`

**Operating System Breakdown:**
- **Dimension**: `operatingSystem`
- **Metrics**: `totalUsers`

**Returns:**
- `browsers`: Array of browsers with users
- `operatingSystems`: Array of operating systems with users
- Limited to top 15 browsers and top 15 operating systems

---

## 📈 Total Data Summary

### API Endpoints: **9 Total**
1. Overview
2. Traffic Channels
3. Geography
4. Top Pages
5. **Campaigns** (NEW)
6. **Source/Medium** (NEW)
7. **Events** (NEW)
8. **Demographics** (NEW)
9. **Technology** (NEW)

### Metrics Collected: **20+ Unique Metrics**
- totalUsers
- newUsers
- sessions
- screenPageViews
- engagementRate
- averageSessionDuration
- bounceRate
- conversions
- totalRevenue
- eventCount
- (Plus various dimensions)

### Dimensions Used: **12+ Unique Dimensions**
- date
- sessionDefaultChannelGroup
- deviceCategory
- country
- pagePath
- campaignName
- source
- sessionMedium
- eventName
- userAgeBracket
- userGender
- browser
- operatingSystem

---

## 🔧 Implementation Details

- **API Client**: `@google-analytics/data` (BetaAnalyticsDataClient)
- **Authentication**: Service Account (JSON key file)
- **Property ID**: `383191966` (from environment variable)
- **Date Format**: Supports ISO dates (YYYY-MM-DD) and relative dates (7daysAgo, yesterday, today)
- **Error Handling**: All endpoints include try-catch with detailed error messages

---

## 📝 Notes

- All new endpoints follow the same pattern as existing endpoints
- Date range is configurable via query parameters
- Results are sorted by relevant metrics (users, event count, etc.)
- Limits are applied to prevent excessive data transfer
- All data is fetched in real-time from GA4 API
