# PureWL Dashboard - System Architecture Documentation

**Last Updated:** January 2026  
**Project Name:** PureWL Dashboard (Orion Analytics Dashboard)  
**Version:** 0.1.0

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Core Purpose & Functionality](#core-purpose--functionality)
3. [API Integrations](#api-integrations)
4. [MCP Servers](#mcp-servers)
5. [Database Connections](#database-connections)
6. [AI Agents System](#ai-agents-system)
7. [Webhook Integrations](#webhook-integrations)
8. [Technology Stack](#technology-stack)
9. [Project Structure](#project-structure)
10. [Environment Configuration](#environment-configuration)

---

## 🎯 System Overview

**PureWL Dashboard** (also known as **Orion Analytics Dashboard**) is a comprehensive **B2B marketing intelligence platform** that aggregates data from multiple marketing channels, CRM systems, and analytics platforms into a unified dashboard. The system provides real-time insights, automated reporting, and AI-powered analysis for PureWL's go-to-market operations.

### Key Capabilities

- **Multi-Source Data Aggregation**: Collects data from GA4, HubSpot, LinkedIn Ads, Reddit, and RB2B
- **AI-Powered Insights**: Uses Claude AI (Anthropic) to generate actionable insights and reports
- **Automated Reporting**: Generates comprehensive 14-page GTM reports automatically
- **Real-Time Analytics**: Live dashboards for traffic, pipeline, campaigns, and performance
- **Visitor Intelligence**: Tracks and enriches visitor data via RB2B webhooks
- **Full Funnel Analysis**: Tracks visitors from first touch to closed deals

---

## 🚀 Core Purpose & Functionality

### Primary Use Cases

1. **Marketing Performance Monitoring**
   - Track website traffic, engagement, and conversions
   - Monitor campaign performance across LinkedIn, Google Ads, and Reddit
   - Analyze geographic and demographic data
   - Measure content performance and landing page effectiveness

2. **Sales Pipeline Management**
   - Track deals from creation to close
   - Monitor pipeline health and velocity
   - Analyze deal sources and attribution
   - Identify stuck deals and bottlenecks

3. **Lead Generation Analysis**
   - Track contacts from all sources
   - Analyze conversion rates at each funnel stage
   - Monitor form submissions and demo requests
   - Measure lead quality by source

4. **Automated Intelligence Reports**
   - Generate comprehensive GTM reports using AI
   - Identify critical issues and opportunities
   - Provide strategic recommendations
   - Track performance vs. benchmarks

5. **Visitor Intelligence**
   - Track anonymous website visitors
   - Enrich visitor data with company information
   - Identify high-value accounts
   - Monitor repeat visitors and engagement

---

## 🔌 API Integrations

### 1. Google Analytics 4 (GA4) API

**Status:** ✅ **Active - Direct API Integration**

**Purpose:** Track website traffic, user behavior, conversions, and engagement metrics

**Endpoints Used:**
- `/api/ga4/overview` - Summary metrics (users, sessions, engagement)
- `/api/ga4/traffic` - Traffic trends and patterns
- `/api/ga4/campaigns` - Campaign performance data
- `/api/ga4/ads` - Reddit and FluentForm ad performance
- `/api/ga4/geography` - Geographic distribution of users
- `/api/ga4/pages` - Top landing pages and content performance
- `/api/ga4/source-medium` - Traffic sources and mediums
- `/api/ga4/events` - Custom event tracking
- `/api/ga4/demographics` - Age and gender demographics
- `/api/ga4/technology` - Browser, OS, and device data
- `/api/ga4/acquisition` - User acquisition paths
- `/api/ga4/content` - Content performance analysis
- `/api/ga4/time-patterns` - Hourly and daily traffic patterns
- `/api/ga4/conversion-paths` - Multi-touch attribution
- `/api/ga4/retention` - User retention analysis
- `/api/ga4/search-terms` - Search query data
- `/api/ga4/realtime` - Real-time active users
- `/api/ga4/fluid-fusion` - Combined Reddit, Google Ads, and Website data

**Authentication:** Google Service Account (JSON credentials file)

**Data Retrieved:**
- Total users, sessions, page views
- Engagement rate, bounce rate, session duration
- Traffic sources (organic, paid, direct, referral)
- Geographic data (countries, cities)
- Device breakdown (desktop, mobile, tablet)
- Conversion events and goals
- Landing page performance
- Campaign attribution

**Library:** `@google-analytics/data` v5.2.1

---

### 2. HubSpot CRM API

**Status:** ✅ **Active - Direct API Integration**

**Purpose:** Manage contacts, companies, deals, pipeline, and sales activities

**Endpoints Used:**
- `/api/hubspot/contacts` - Contact database
- `/api/hubspot/companies` - Company/account data
- `/api/hubspot/deals` - Deal pipeline
- `/api/hubspot/deals-by-stage` - Pipeline breakdown by stage
- `/api/hubspot/pipelines` - Pipeline definitions
- `/api/hubspot/conversations` - Email and chat conversations
- `/api/hubspot/calls` - Call logs and recordings
- `/api/hubspot/emails` - Email activity
- `/api/hubspot/meetings` - Meeting schedules
- `/api/hubspot/tasks` - Task management
- `/api/hubspot/tickets` - Support tickets
- `/api/hubspot/owners` - Sales team members
- `/api/hubspot/products` - Product catalog
- `/api/hubspot/quotes` - Sales quotes
- `/api/hubspot/line-items` - Deal line items
- `/api/hubspot/linkedin-ads` - LinkedIn-sourced contacts and deals (aggregated)

**Authentication:** OAuth 2.0 Access Token

**Data Retrieved:**
- Contacts (name, email, company, job title, source)
- Companies (name, industry, employee count, revenue)
- Deals (name, amount, stage, close date, source)
- Pipeline value and health metrics
- Sales activities (calls, emails, meetings, tasks)
- Conversation threads
- Deal associations and relationships

**Special Features:**
- LinkedIn Ads data extraction from HubSpot contacts
- Deal source attribution
- Pipeline stage analysis
- Sales activity tracking

---

### 3. LinkedIn Ads API

**Status:** ✅ **Active - Direct API Integration**

**Purpose:** Track LinkedIn advertising campaign performance

**Endpoints Used:**
- `/api/linkedin/accounts` - LinkedIn ad accounts
- `/api/linkedin/accounts-list` - List all accounts
- `/api/linkedin/accounts-detail` - Account details
- `/api/linkedin/campaigns` - Campaign list
- `/api/linkedin/campaign-analytics` - Campaign performance metrics
- `/api/linkedin/analytics` - Overall account analytics

**Authentication:** OAuth 2.0 Access Token

**Data Retrieved:**
- Campaign performance (impressions, clicks, spend)
- CTR (Click-Through Rate)
- CPC (Cost Per Click)
- CPM (Cost Per Mille)
- Conversions and leads
- Engagement metrics (likes, comments, shares)
- Account-level analytics

**Integration Note:** Also fetches LinkedIn-sourced contacts and deals from HubSpot for comprehensive attribution

---

### 4. Reddit API

**Status:** ✅ **Active - MCP Server Integration**

**Purpose:** Monitor Reddit discussions, brand mentions, and community engagement

**Endpoints Used:**
- `/api/reddit/posts` - Search Reddit posts
- `/api/mcp/reddit` - MCP server bridge

**Authentication:** Public API (no auth required for read-only)

**Data Retrieved:**
- Reddit posts matching keywords
- Post scores and engagement
- Comment counts
- Subreddit information
- Post timestamps and URLs

**Keywords Monitored:**
- "white label VPN"
- "Orion"
- "VPN reseller"
- Related industry terms

---

### 5. RB2B API

**Status:** ✅ **Active - Webhook Integration**

**Purpose:** Enrich visitor data with company and contact information

**Endpoints Used:**
- Webhook: `/api/webhooks/rb2b` - Receives visitor data from RB2B
- `/api/rb2b/page-visits` - Query raw page visit events
- `/api/rb2b/person-visits` - Query aggregated visitor data
- `/api/rb2b/visitors` - Legacy visitor endpoint

**Authentication:** Webhook secret (optional)

**Data Retrieved:**
- Visitor company information
- Contact details (name, email, title)
- LinkedIn profile URLs
- Company size and revenue estimates
- Geographic data (city, state, zipcode)
- Page visit history
- Repeat visitor tracking

**Data Storage:**
- `rb2b_page_visits` collection - Raw event-level data
- `rb2b_person_visits` collection - Aggregated visitor-level data

---

### 6. Google Ads API

**Status:** ⚠️ **Partial Integration**

**Purpose:** Track Google Ads campaign performance

**Endpoints Used:**
- `/api/google-ads` - Google Ads data (via GA4 attribution)

**Note:** Currently tracked through GA4 source/medium data. Direct Google Ads API integration may be added in the future.

---

### 7. Anthropic Claude API

**Status:** ✅ **Active - AI Agent Integration**

**Purpose:** Power AI agents for data analysis, insight generation, and report formatting

**Endpoints Used:**
- `/api/claude/chat` - Chat interface with Claude
- `/api/anthropic/usage` - Token usage tracking

**Models Used:**
- **Claude Sonnet 4.5** - Complex analysis and reasoning (Insight Generator)
- **Claude Haiku 4.5** - Fast formatting and simple tasks (Report Formatter)

**Authentication:** API Key (`ANTHROPIC_API_KEY`)

**Capabilities:**
- Data analysis and pattern recognition
- Insight generation with benchmarks
- Critical issue identification
- Strategic recommendations
- Report formatting (14-page GTM reports)
- Natural language queries

---

## 🖥️ MCP Servers

**MCP (Model Context Protocol)** servers provide standardized interfaces for AI agents to access external data sources.

### 1. GA4 MCP Server

**Status:** ✅ **Configured**

**Location:** `lib/mcp/ga4.ts`, `lib/mcp/ga4-campaigns.ts`, `lib/mcp/ga4-ads.ts`, `lib/mcp/ga4-fluid-fusion.ts`

**Purpose:** Provide GA4 data access to AI agents via standardized MCP tools

**Tools Available:** 18 tools
- `get_ga4_overview`
- `get_ga4_campaigns`
- `get_ga4_ads`
- `get_ga4_geography`
- `get_ga4_traffic`
- `get_ga4_top_pages`
- `get_ga4_source_medium`
- `get_ga4_events`
- `get_ga4_demographics`
- `get_ga4_technology`
- `get_ga4_acquisition`
- `get_ga4_content`
- `get_ga4_time_patterns`
- `get_ga4_conversion_paths`
- `get_ga4_retention`
- `get_ga4_search_terms`
- `get_ga4_realtime`
- `get_ga4_fluid_fusion`

**Bridge Route:** `/api/mcp/ga4`

---

### 2. HubSpot MCP Server

**Status:** ✅ **Configured**

**Location:** `lib/mcp/hubspot.ts`

**Purpose:** Provide HubSpot CRM data access to AI agents

**Tools Available:** 13 tools
- Contact management
- Company/account data
- Deal pipeline access
- Sales activity tracking
- Conversation threads
- Email and call logs

**Bridge Route:** `/api/mcp/hubspot`

---

### 3. LinkedIn MCP Server

**Status:** ✅ **Configured**

**Implementation:** npm package `linkedin-ads-mcp-server` (via Claude Desktop)

**Location:** 
- Claude Desktop: `npx linkedin-ads-mcp-server`
- Dashboard Integration: `lib/mcp/linkedin.ts`, `lib/mcp/linkedin-campaign-analytics.ts`

**Purpose:** Provide LinkedIn Ads data access to AI agents

**Tools Available:** 5+ tools
- `list_linkedin_accounts` - List all ad accounts
- `get_linkedin_account_details` - Get account information
- `get_linkedin_campaigns` - List campaigns
- `get_linkedin_campaign_analytics` - Campaign performance metrics
- `get_linkedin_analytics` - Overall account analytics

**Bridge Route:** `/api/mcp/linkedin`

**Installation:**
```bash
npm install -g linkedin-ads-mcp-server
```

**Configuration:** Configured in Claude Desktop config with `LINKEDIN_ACCESS_TOKEN` environment variable.

**Documentation:** See `docs/LINKEDIN_ADS_MCP_SETUP.md` for setup instructions.

---

### 4. Reddit MCP Server

**Status:** ✅ **Configured**

**Location:** `lib/mcp/reddit.ts`

**Purpose:** Provide Reddit data access to AI agents

**Tools Available:** 1 tool
- `get_reddit_posts` - Search Reddit posts by keywords

**Bridge Route:** `/api/mcp/reddit`

---

## 💾 Database Connections

### MongoDB

**Status:** ✅ **Active**

**Connection:** `lib/db/mongodb.ts`

**Purpose:** Store visitor data, page visits, and aggregated analytics

**Collections:**

1. **`rb2b_page_visits`** (Raw Events)
   - Stores individual page visit events from RB2B webhooks
   - Fields: `identity_key`, `seen_at`, `captured_url`, `referrer`, visitor data, company data
   - Indexes: `identity_key`, `seen_at`, `company_name`, `business_email`

2. **`rb2b_person_visits`** (Aggregated Data)
   - Stores aggregated visitor data per person/company
   - Fields: `identity_key`, `first_seen`, `last_seen`, `page_views`, `unique_days`, `visitor_data`, `all_pages`
   - Indexes: `identity_key` (unique), `last_seen`, `company_name`, `business_email`

3. **`visitors`** (Legacy)
   - Legacy collection for backward compatibility
   - May be deprecated in favor of `rb2b_person_visits`

**Connection String:** `MONGODB_URI` environment variable

**Models:**
- `RB2BPageVisit` - `lib/db/models/RB2BPageVisit.ts`
- `RB2BPersonVisit` - `lib/db/models/RB2BPersonVisit.ts`
- `Visitor` - `lib/db/models/Visitor.ts` (legacy)

---

## 🤖 AI Agents System

The system uses a **3-agent pipeline** to generate comprehensive reports:

### Agent 1: Data Aggregator

**File:** `lib/agents/dataAggregator.ts`

**Purpose:** Fetch raw data from all selected connectors (GA4, HubSpot, LinkedIn, Reddit)

**Responsibilities:**
- Parallel data fetching from multiple sources
- Data normalization and formatting
- Error handling and fallback logic
- Completeness tracking

**Data Sources:**
- **GA4:** 18 endpoints (overview, campaigns, ads, geography, traffic, pages, events, demographics, technology, acquisition, content, time patterns, conversion paths, retention, search terms, realtime, fluid fusion)
- **HubSpot:** Deals, contacts, companies, pipeline data
- **LinkedIn:** Account analytics, campaign performance
- **Reddit:** Post search results

**Output:** Raw data object with metadata (completeness, notes, timestamp)

---

### Agent 2: Insight Generator

**File:** `lib/agents/insightGenerator.ts`

**Purpose:** Analyze raw data and generate actionable insights using Claude Sonnet 4.5

**Responsibilities:**
- Compare metrics vs. benchmarks and historical baselines
- Identify anomalies (>15% variance)
- Flag critical issues
- Generate prioritized recommendations
- Quantify impact of findings

**AI Model:** Claude Sonnet 4.5 (for complex reasoning and analysis)

**Knowledge Base:** Uses `lib/knowledgeBase.ts` for:
- Benchmarks (target metrics)
- Historical baselines
- Critical issue patterns

**Output:**
- Summary overview
- Key findings (with impact and priority)
- Critical issues (with recommendations)
- Actionable recommendations (with timeframe)

---

### Agent 3: Report Formatter

**File:** `lib/agents/reportFormatter.ts`

**Purpose:** Convert insights into polished 14-page GTM markdown reports

**Responsibilities:**
- Structure insights into 13 comprehensive sections
- Format tables and metrics
- Apply professional GTM tone
- Include all required sections (even if data is limited)

**AI Model:** Claude Sonnet 4.5 (for comprehensive report formatting)

**Report Sections:**
1. Executive Summary
2. Stage 1 - Traffic and Acquisition
3. Stage 2 - Lead Generation
4. Stage 3 - Sales Pipeline
5. Stage 4 - Marketing Campaign Performance
6. Full Funnel Conversion Analysis
7. Revenue and Business Impact Analysis
8. Technology and Device Analysis
9. Geographic Deep Dive
10. Time-Based Performance Patterns
11. Competitor Intelligence Update
12. Critical Issues and Risk Assessment
13. Strategic Recommendations and Next Steps
14. Data Quality & Methodology

**Output:** Complete markdown report (14 pages, 30+ tables)

---

### Orchestrator

**File:** `lib/agents/orchestrator.ts`

**Purpose:** Coordinate all 3 agents in sequence

**Workflow:**
1. **Data Aggregator** → Fetches raw data
2. **Insight Generator** → Analyzes data and generates insights
3. **Report Formatter** → Formats insights into report

**Features:**
- Performance tracking (timing for each agent)
- Token usage tracking
- Error handling and recovery
- Metadata generation

**API Endpoint:** `/api/reports/generate`

---

## 🔔 Webhook Integrations

### RB2B Webhook

**Endpoint:** `/api/webhooks/rb2b`

**Purpose:** Receive visitor data from RB2B visitor identification service

**Data Flow:**
1. RB2B detects a visitor on the website
2. RB2B sends webhook payload with visitor data
3. System enriches data using RB2B API (if needed)
4. System stores raw event in `rb2b_page_visits`
5. System updates/creates aggregated record in `rb2b_person_visits`

**Payload Structure:**
```json
{
  "LinkedIn URL": "https://linkedin.com/in/...",
  "First Name": "John",
  "Last Name": "Doe",
  "Title": "CEO",
  "Company Name": "Acme Corp",
  "Business Email": "john@acme.com",
  "Website": "https://acme.com",
  "Industry": "Technology",
  "Employee Count": "100-500",
  "Estimate Revenue": "$10M",
  "City": "San Francisco",
  "State": "California",
  "Zipcode": "94102",
  "Seen At": "2024-01-01T12:34:56Z",
  "Referrer": "https://google.com",
  "Captured URL": "https://example.com/pricing",
  "Tags": "Hot Lead, ICP",
  "is_repeat_visit": true
}
```

**Processing:**
- Generates `identity_key` from email, company+location, or LinkedIn URL
- Tracks unique days and page views
- Maintains page visit history
- Handles both person-level and company-level visitors

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** Next.js 16.1.1 (App Router)
- **Language:** TypeScript 5
- **UI Library:** React 19.2.3
- **Styling:** Tailwind CSS 4
- **Components:** shadcn/ui (Radix UI primitives)
- **Charts:** Recharts 3.6.0
- **State Management:** TanStack Query (React Query) 5.90.16
- **Icons:** Lucide React 0.562.0
- **Date Handling:** date-fns 4.1.0
- **Animations:** Framer Motion 12.24.11

### Backend
- **Runtime:** Node.js 18+
- **API Framework:** Next.js API Routes
- **Database:** MongoDB (via Mongoose 9.1.3)
- **Authentication:** NextAuth.js 5.0.0-beta.30

### AI & Analytics
- **AI Provider:** Anthropic Claude API
  - Claude Sonnet 4.5 (analysis)
  - Claude Haiku 4.5 (formatting)
- **Analytics:** Google Analytics Data API v5.2.1
- **CRM:** HubSpot API (direct integration)
- **Ads:** LinkedIn Ads API (direct integration)

### Development Tools
- **Build Tool:** Next.js Turbopack
- **Linting:** ESLint 9
- **Type Checking:** TypeScript
- **Package Manager:** npm

---

## 📁 Project Structure

```
purewl-dashboard/
├── app/                          # Next.js App Router
│   ├── (dashboard)/             # Dashboard pages (route group)
│   │   ├── admin/               # Admin panel
│   │   ├── ads/                 # LinkedIn Ads dashboard
│   │   ├── agent/               # AI agent chat interface
│   │   ├── analytics/           # GA4 analytics dashboard
│   │   ├── community/           # Reddit monitoring
│   │   ├── crm/                 # HubSpot CRM dashboard
│   │   ├── funnel/              # Full funnel analysis
│   │   ├── reports/             # Report generation
│   │   ├── settings/            # System settings
│   │   ├── signals/             # RB2B visitor signals
│   │   └── page.tsx             # Main dashboard
│   ├── api/                     # API routes
│   │   ├── ga4/                 # GA4 endpoints (18 routes)
│   │   ├── hubspot/             # HubSpot endpoints (18 routes)
│   │   ├── linkedin/           # LinkedIn endpoints (6 routes)
│   │   ├── reddit/              # Reddit endpoints
│   │   ├── rb2b/                # RB2B endpoints
│   │   ├── mcp/                 # MCP server bridges
│   │   ├── claude/              # Claude AI chat
│   │   ├── reports/             # Report generation
│   │   ├── webhooks/            # Webhook handlers
│   │   └── auth/                # Authentication
│   └── auth/                    # Auth pages
├── components/                   # React components
│   ├── ui/                      # shadcn/ui components
│   ├── dashboard/               # Dashboard components
│   ├── charts/                 # Chart components
│   ├── analytics/              # GA4 components
│   ├── crm/                    # HubSpot components
│   ├── ads/                    # LinkedIn Ads components
│   ├── funnel/                 # Funnel components
│   ├── reports/                # Report components
│   └── agent/                  # AI agent components
├── lib/                         # Core libraries
│   ├── agents/                 # AI agents (4 files)
│   │   ├── orchestrator.ts    # Agent coordinator
│   │   ├── dataAggregator.ts  # Data fetcher
│   │   ├── insightGenerator.ts # Insight analyzer
│   │   └── reportFormatter.ts  # Report formatter
│   ├── mcp/                    # MCP client libraries (10 files)
│   │   ├── ga4.ts              # GA4 MCP client
│   │   ├── ga4-campaigns.ts    # GA4 campaigns
│   │   ├── ga4-ads.ts          # GA4 ads
│   │   ├── ga4-fluid-fusion.ts # Combined data
│   │   ├── hubspot.ts          # HubSpot MCP client
│   │   ├── linkedin.ts         # LinkedIn MCP client
│   │   ├── linkedin-campaign-analytics.ts
│   │   ├── reddit.ts           # Reddit MCP client
│   │   └── tools.ts             # MCP tools
│   ├── db/                     # Database
│   │   ├── mongodb.ts          # MongoDB connection
│   │   └── models/             # Mongoose models
│   │       ├── RB2BPageVisit.ts
│   │       ├── RB2BPersonVisit.ts
│   │       └── Visitor.ts
│   ├── auth/                   # Authentication
│   ├── rb2b/                   # RB2B client
│   ├── fetchHubSpotLinkedInData.ts # LinkedIn data from HubSpot
│   ├── knowledgeBase.ts        # Knowledge base for AI
│   └── usage-tracker.ts        # Token usage tracking
├── types/                      # TypeScript types
│   ├── ads.ts                  # LinkedIn Ads types
│   └── next-auth.d.ts          # Auth types
├── utils/                      # Utility functions
│   └── calculateMetrics.ts     # Metric calculations
├── scripts/                    # Utility scripts
├── public/                     # Static assets
└── DATA/                       # Data files and configs
```

---

## ⚙️ Environment Configuration

### Required Environment Variables

Create a `.env.local` file in the project root:

```bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017/purewl-dashboard

# Anthropic Claude API
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Google Analytics 4
GOOGLE_APPLICATION_CREDENTIALS=path/to/credentials.json
GA4_PROPERTY_ID=383191966

# HubSpot CRM
HUBSPOT_ACCESS_TOKEN=your_hubspot_token

# LinkedIn Ads
LINKEDIN_ACCESS_TOKEN=your_linkedin_token
LINKEDIN_API_BASE=https://api.linkedin.com/rest

# RB2B
RB2B_API_KEY=your_rb2b_api_key
RB2B_API_BASE=https://api.rb2b.com

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Optional Environment Variables

```bash
# Claude Model Selection
CLAUDE_MODEL=claude-sonnet-4-5-20250929

# MCP Server Port (if using separate MCP server)
MCP_PORT=3001

# Token Optimization
CACHE_TTL_SECONDS=3600
MAX_HISTORY_MESSAGES=5
```

---

## 🔐 Authentication & Security

### Authentication System

- **Provider:** NextAuth.js 5.0.0-beta.30
- **Session Management:** Server-side sessions
- **Role-Based Access:** Admin, User roles
- **Login Tracking:** `/api/auth/track-login`

### API Security

- Environment variables for sensitive credentials
- Server-side API routes (no client-side exposure)
- Webhook secret validation (optional)
- Rate limiting (via Next.js middleware)

---

## 📊 Data Flow Architecture

### 1. Real-Time Data Flow

```
External APIs → Next.js API Routes → Frontend Components
     ↓
MongoDB (for visitor data)
```

### 2. Report Generation Flow

```
User Request → Orchestrator
     ↓
Data Aggregator → Fetch from APIs
     ↓
Insight Generator → Claude Sonnet Analysis
     ↓
Report Formatter → Claude Sonnet Formatting
     ↓
Markdown Report → PDF Export (optional)
```

### 3. Webhook Flow

```
RB2B Service → Webhook Endpoint
     ↓
Data Enrichment (RB2B API)
     ↓
MongoDB Storage
     ├── rb2b_page_visits (raw)
     └── rb2b_person_visits (aggregated)
```

---

## 🎯 Key Features Summary

### ✅ Implemented Features

- [x] Multi-source data aggregation (GA4, HubSpot, LinkedIn, Reddit)
- [x] Real-time analytics dashboards
- [x] AI-powered insight generation
- [x] Automated 14-page GTM reports
- [x] Visitor intelligence tracking (RB2B)
- [x] Full funnel analysis
- [x] Pipeline management and health monitoring
- [x] Campaign performance tracking
- [x] Geographic and demographic analysis
- [x] MCP server integration for AI agents
- [x] Webhook support for real-time data ingestion

### 🚧 Future Enhancements

- [ ] Direct Google Ads API integration
- [ ] Advanced attribution modeling
- [ ] Predictive analytics
- [ ] Custom alerting system
- [ ] Scheduled report delivery
- [ ] Multi-user collaboration
- [ ] Custom dashboard builder
- [ ] Data export to CSV/Excel
- [ ] API rate limit optimization
- [ ] Caching layer for performance

---

## 📞 Support & Documentation

### Additional Documentation Files

- `README.md` - Getting started guide
- `SETUP.md` - Environment setup instructions
- `API_ACTIVATION_GUIDE.md` - API activation steps
- `PUREWL_AGENT_SYSTEM_PROMPT.md` - AI agent system details
- `Knowledge Base/ATLAS_SYSTEM_PROMPT.md` - Atlas agent prompt

### Key Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run setup-env    # Setup environment variables
npm run test-apis    # Test API connections
```

---

## 🏁 Conclusion

The **PureWL Dashboard** is a comprehensive marketing intelligence platform that combines:

- **Real-time data** from 5+ sources
- **AI-powered analysis** using Claude
- **Automated reporting** with 14-page GTM reports
- **Visitor intelligence** via RB2B
- **Full funnel tracking** from traffic to revenue

The system is designed to help PureWL's marketing and sales teams make data-driven decisions, identify opportunities, and optimize performance across all channels.

---

**Document Version:** 1.0  
**Last Updated:** January 2026  
**Maintained By:** PureWL Development Team
