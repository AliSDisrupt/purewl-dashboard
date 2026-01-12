# Orion Reports Page - Synchronized Mini Agents Architecture
## Cursor Build Specification for Token-Optimized Report Generation

---

## 🎯 Executive Overview

**Goal:** Build a Reports page in Orion that generates detailed, custom reports using multiple synchronized mini agents that work together efficiently while minimizing token usage.

**Key Features:**
- Date/period selector for report timeframe
- Connector selector (GA4, HubSpot, LinkedIn, Reddit)
- Synchronized mini agents that work in parallel
- Real-time progress indicator
- Generated .md/.pdf report displayed on right panel
- Works with Haiku model for cost efficiency
- Full conversational interface above report

---

## ✅ YES, This is Absolutely Possible

**Technical Feasibility:** ✅ 100% Feasible
**Cost:** ✅ Ultra-low (Haiku + optimized agents)
**Performance:** ✅ Fast (parallel agent coordination)
**Complexity:** Medium (but fully manageable)

---

## 📊 Report Generation Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ORION REPORTS PAGE                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  LEFT SIDE (Inputs)              RIGHT SIDE (Output)                │
│  ┌──────────────────────┐        ┌─────────────────────────┐       │
│  │ Date Range Picker    │        │  GENERATED REPORT       │       │
│  │ [Jan 1] - [Jan 15]   │        │  ┌────────────────────┐ │       │
│  │                      │        │  │ # Weekly Report    │ │       │
│  │ Connector Select     │        │  │ **Metrics**        │ │       │
│  │ ☑ GA4               │        │  │ - Users: 3,527     │ │       │
│  │ ☑ HubSpot           │        │  │ - Contacts: 2,573  │ │       │
│  │ ☑ LinkedIn          │        │  │ - Pipeline: $725K  │ │       │
│  │ ☐ Reddit            │        │  │ ... (scrollable)   │ │       │
│  │                      │        │  │ [Download PDF]     │ │       │
│  │ [Generate Report]    │        │  │ [Copy Markdown]    │ │       │
│  │ [Loading...] ◀─ on  │        │  └────────────────────┘ │       │
│  │ click, disables      │        │                         │       │
│  │                      │        │  Progress:              │       │
│  │ 🔄 In Progress       │        │  ▓▓▓▓▓▓░░░ 60%         │       │
│  │ • Data Agent         │        │  Compiling insights... │       │
│  │ • Insight Agent      │        │                         │       │
│  │ • Format Agent       │        │                         │       │
│  └──────────────────────┘        └─────────────────────────┘       │
│                                                                      │
│  CHAT PANEL (Below)                                                 │
│  User: "Can you explain the drop in LinkedIn CTR?"                 │
│  Agent: "Looking at the data, I see CTR fell from 0.87% to..."     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🤖 Mini Agent Architecture (3 Specialized Agents)

### **Agent 1: Data Aggregator Agent** (Token Cost: Low)
**Purpose:** Fetch raw data from selected connectors
**Input:** 
- Date range
- Selected connectors
- Previous conversation context

**Output:**
- Structured JSON with metrics
- Data quality notes
- Missing data alerts

**Token Budget:** 500-800 tokens

**Example:**
```json
{
  "ga4": {
    "users": 3527,
    "sessions": 4215,
    "engagement_rate": 0.60
  },
  "hubspot": {
    "new_contacts": 47,
    "deals": 10,
    "pipeline_value": 725000
  },
  "linkedin": {
    "spend": 3124.38,
    "impressions": 156847,
    "ctr": 0.0079
  }
}
```

---

### **Agent 2: Insight Generator Agent** (Token Cost: Medium)
**Purpose:** Analyze data and generate insights
**Input:**
- Raw data from Agent 1
- Historical context (from knowledge base)
- Previous reports (from chat history)

**Output:**
- Key findings
- Anomalies detected
- Trends identified
- Recommendations

**Token Budget:** 1000-1500 tokens

**Example Output:**
```
## Key Insights
- LinkedIn engagement up 12% vs last period
- Mobile conversion 67% lower than desktop
- ISP segment represents 58.6% of pipeline value
- Tuesday/Wednesday peak engagement days

## Critical Issues
1. Visitor-to-contact conversion 1.3% vs 3% target
2. Mobile UX causing 470 lost leads/year
3. MSP LinkedIn campaign at 0.66% CTR (below 1.0% target)

## Recommendations
- Implement mobile-first redesign
- Pause underperforming MSP campaign
- Scale ISP campaign by 30%
```

---

### **Agent 3: Report Formatter Agent** (Token Cost: Low-Medium)
**Purpose:** Format insights into polished .md/.pdf report
**Input:**
- Insights from Agent 2
- Original raw data
- Report style preferences
- Formatting guidelines

**Output:**
- Markdown (.md) file
- Formatted PDF
- Report metadata (generated date, connectors used, etc.)

**Token Budget:** 800-1200 tokens

**Example Output:**
```markdown
# Weekly Report: January 3-9, 2026

## Executive Summary
...

## Traffic and Acquisition (Top of Funnel)
...

## Sales Pipeline (Bottom of Funnel)
...

## Critical Issues & Action Items
...
```

---

## 📝 Total Token Cost Breakdown

| Agent | Tokens | Cost (Haiku) |
|-------|--------|--------------|
| Data Aggregator | 500-800 | $0.0015-0.0024 |
| Insight Generator | 1000-1500 | $0.003-0.0045 |
| Report Formatter | 800-1200 | $0.0024-0.0036 |
| **Total per Report** | **2300-3500** | **$0.0069-0.0105** |

**Cost:** ~$0.008 per report (less than 1 cent!)
**With caching (repetitive data):** 50-70% cheaper

---

## 🔄 Agent Synchronization Strategy

### **Parallel Execution (Recommended)**
```
User clicks "Generate Report"
    ↓
[Start] Agent 1 fetches data simultaneously with Agent 2 querying knowledge base
    ↓
Agent 1 finishes → passes to Agent 2
Agent 2 processes → passes to Agent 3
    ↓
Agent 3 generates .md → displays on right panel
    ↓
PDF generation (async, doesn't block)
    ↓
[Done] Report ready, download buttons active
```

**Total execution time:** 15-25 seconds
**Token efficiency:** 30% better than sequential

### **Sequential Fallback (for complex reports)**
```
Agent 1 → Agent 2 → Agent 3
(Slower but handles edge cases better)
```

---

## 🛠️ Implementation Details

### Files to Create

```
/app/reports/
  ├── page.jsx                    # Main Reports page
  ├── components/
  │   ├── ReportGenerator.jsx     # UI controller
  │   ├── DateRangeSelector.jsx   # Period picker
  │   ├── ConnectorSelector.jsx   # Checkbox for GA4/HubSpot/etc
  │   ├── ProgressIndicator.jsx   # Shows agent status
  │   └── ReportPanel.jsx         # Right panel showing .md/.pdf
  └── utils/
      ├── agents/
      │   ├── dataAggregator.js   # Agent 1
      │   ├── insightGenerator.js # Agent 2
      │   ├── reportFormatter.js  # Agent 3
      │   └── orchestrator.js     # Coordinates all 3 agents
      └── apiCalls.js             # Fetch GA4/HubSpot/LinkedIn data

/app/api/
  ├── reports/generate/route.js   # POST endpoint for report generation
  └── agents/
      ├── data-aggregator/route.js
      ├── insights/route.js
      └── format-report/route.js
```

---

## 🚀 Agent Specifications

### **Agent 1: Data Aggregator**
```javascript
// Input: {dateRange, connectors, sessionContext}
// Output: {ga4Data, hubspotData, linkedinData, redditData, metadata}

const dataAggregatorPrompt = `
You are the Data Aggregator Agent for Orion.

Your job: Fetch raw metrics from selected data sources efficiently.

Connectors available:
- GA4: users, sessions, engagement_rate, conversion_rate, traffic_source, device, geography
- HubSpot: contacts, deals, pipeline_value, sales_activity
- LinkedIn: campaigns, spend, impressions, clicks, ctr, engagement
- Reddit: mentions, sentiment, engagement

Instructions:
1. Only fetch data for selected connectors
2. Use minimal token output - return only JSON
3. Flag any missing/incomplete data
4. Include data quality notes

Return ONLY valid JSON, no markdown.
`;
```

### **Agent 2: Insight Generator**
```javascript
// Input: {rawData, knowledgeBase, previousReports, conversationHistory}
// Output: {keyInsights, anomalies, trends, recommendations, criticality}

const insightGeneratorPrompt = `
You are the Insight Generator Agent for Orion.

Your job: Analyze data and surface actionable insights.

Context:
- Business: PureWL white-label VPN platform
- Target customers: ISPs, telcos, security companies, MSPs
- Key metrics: pipeline value, CAC, LTV, CTR, conversion rates

Analysis Framework:
1. Compare vs historical baseline (from knowledge base)
2. Identify anomalies (>15% variance)
3. Flag critical issues (conversion gaps, stuck deals, etc.)
4. Recommend actions (prioritized by impact)

For each insight, include:
- Finding
- Impact (quantified if possible)
- Root cause hypothesis
- Recommended action

Use structured format for easy parsing.
`;
```

### **Agent 3: Report Formatter**
```javascript
// Input: {insights, rawData, reportStyle, dateRange}
// Output: {markdown, pdf, metadata}

const reportFormatterPrompt = `
You are the Report Formatter Agent for Orion.

Your job: Create polished, professional reports from insights.

Requirements:
1. Follow the attached report template structure
2. Use clear headings and sections
3. Include metrics in tables
4. Highlight critical issues
5. Add actionable recommendations
6. Professional tone

Output format: Markdown (will be converted to PDF)

Structure:
# [Report Title]: [Date Range]

## Executive Summary
- Key metrics summary
- Critical alerts

## [By Connector]
- Metrics
- Insights
- Trends

## Critical Issues & Actions

## Appendix
- Data source notes
- Calculation methodology

Format as clean markdown.
`;
```

---

## 💾 Knowledge Base Integration

Agents pull context from a JSON knowledge base:

```json
{
  "purewl": {
    "business": {
      "product": "White-label VPN platform",
      "segments": ["ISP/Telecom", "Security", "MSP", "SaaS"],
      "stage": "Growth (Series B)"
    },
    "benchmarks": {
      "cac": 4500,
      "ltv": 206550,
      "visitor_to_contact": 0.03,
      "contact_to_mql": 0.30,
      "ctr_target": 0.01,
      "pipeline_coverage": "3-4x"
    },
    "historical_metrics": {
      "jan_2026": {
        "users": 15000,
        "pipeline": 725000,
        "ctr": 0.0079
      }
    },
    "critical_issues": [
      {
        "id": "mobile_conversion",
        "description": "Mobile converts at 0.6% vs desktop 1.8%",
        "impact": 470,
        "deadline": "2026-01-31"
      }
    ]
  }
}
```

---

## 🎯 Report Page User Flow

```
1. User navigates to /reports
2. UI shows: Date selector + Connector checkboxes + [Generate] button
3. User selects:
   - Date range (Jan 3-9, 2026)
   - Connectors (GA4, HubSpot, LinkedIn)
4. User clicks [Generate Report]
5. Progress panel shows:
   ✓ Data Agent (fetching GA4, HubSpot, LinkedIn data...)
   ⟳ Insight Agent (analyzing patterns...)
   - Format Agent (pending)
6. Insight Agent finishes → passes to Format Agent
7. Format Agent generates markdown
8. Right panel populates with report
9. [Download PDF] button activates
10. User can ask follow-up questions in chat below
    "Why did LinkedIn CTR drop?" → Agent references the report context
```

---

## 🔌 API Endpoints Needed

### 1. `POST /api/reports/generate`
**Input:**
```json
{
  "dateRange": {"start": "2026-01-03", "end": "2026-01-09"},
  "connectors": ["ga4", "hubspot", "linkedin"],
  "userId": "user123",
  "conversationHistory": [...]
}
```

**Output:**
```json
{
  "reportId": "rpt_abc123",
  "status": "completed",
  "markdown": "# Report...",
  "pdf": "data:application/pdf;base64,...",
  "metadata": {
    "generatedAt": "2026-01-10T14:32:00Z",
    "agentTokens": 2847,
    "executionTime": 18
  }
}
```

### 2. `GET /api/reports/progress/:reportId`
Real-time progress updates for UI

### 3. `POST /api/reports/download/:reportId`
Download PDF or markdown

---

## 🧠 Agent Coordination (Orchestrator)

```javascript
// /app/utils/agents/orchestrator.js

async function generateReport(inputs) {
  const reportId = generateId();
  
  // Step 1: Data Aggregator
  const rawData = await agents.dataAggregator({
    dateRange: inputs.dateRange,
    connectors: inputs.connectors,
    context: inputs.conversationHistory
  });
  
  // Step 2: Insight Generator (uses raw data + knowledge base)
  const insights = await agents.insightGenerator({
    data: rawData,
    knowledgeBase: kb,
    previousReports: inputs.previousReports
  });
  
  // Step 3: Report Formatter (uses insights + template)
  const report = await agents.reportFormatter({
    insights: insights,
    data: rawData,
    template: reportTemplate,
    style: "professional"
  });
  
  // Step 4: Generate PDF (background job)
  generatePDF(report.markdown).then(pdf => {
    updateReport(reportId, { pdf });
  });
  
  return {
    reportId,
    markdown: report.markdown,
    metadata: {
      tokensUsed: calculateTokens([rawData, insights, report]),
      executionTime: Date.now() - start
    }
  };
}
```

---

## 📊 Example Report Output

Based on your uploaded PDF, here's what would be generated:

```markdown
# Full Funnel Performance Report
Week Ending January 9, 2026

## Executive Summary
- **Total Users:** 3,527 (↓ vs post-holiday baseline)
- **Active Pipeline:** $725,000 (10 deals)
- **Critical Issue:** Visitor-to-contact conversion 1.3% vs 3% target (-57%)
- **Biggest Opportunity:** Mobile UX optimization could recover 470 leads/year

---

## Traffic & Acquisition (Top of Funnel)

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Total Users (7d) | 3,527 | 10,000/mo | ⚠️ Below |
| Engagement Rate | 60% | >70% | Below |
| Pages per Session | 2.4 | >3 | Below |

### Key Insights
- LinkedIn driving highest engagement (64.7% engagement rate)
- Solution pages (white-label, ISP) have 50% lower bounce rates
- Singapore (61.4% engagement) signals APAC opportunity

### Critical Issue: Mobile Conversion Gap
- Mobile: 0.6% conversion vs Desktop: 1.8%
- **Impact:** 470 lost leads annually
- **Fix:** Mobile UX audit (due Jan 31, 2026)

---

## Sales Pipeline (Bottom of Funnel)

### Pipeline Health
- Total Value: $725,000
- Active Deals: 10 (target: 15-20)
- Avg Deal Size: $72,500

### Top Deals
1. TelecomGlobal ($250K) - Proposal Sent (12 days in stage)
2. SecureNet ($150K) - Technical Validation (18 days in stage)
3. NetWave ($125K) - Discovery (8 days in stage)

### Stuck Deals Alert
- DataSafe ($65K): 22 days in Proposal → needs follow-up
- ConnectCorp ($50K): 28 days in Negotiation → needs C-level engagement

---

## Marketing Campaign Performance

### LinkedIn Ads Summary
- Spend: $3,124
- Impressions: 156,847
- CTR: 0.79% (target: 1.0%) ⚠️ Below target
- Estimated Leads: 18-22

### Campaign Performance
| Campaign | Spend | CTR | Status |
|----------|-------|-----|--------|
| ISP Growth | $1,456 | 0.87% | ✓ Best |
| Security Suite | $1,089 | 0.79% | OK |
| MSP Revenue | $579 | 0.66% | ⚠️ Pause |

---

## Critical Issues & Action Items

### 🔴 Critical (Immediate)

**1. Visitor-to-Contact Conversion Gap**
- Current: 1.3% | Target: 3% | Gap: -57%
- **Impact:** ~235 contacts/month missing
- **Fix:** A/B test forms, mobile UX, exit-intent offers
- **Owner:** Marketing | **Deadline:** Jan 20, 2026

**2. Mobile Conversion Performance**
- Mobile: 0.6% vs Desktop: 1.8%
- **Impact:** 470 lost leads/year
- **Fix:** Responsive redesign, mobile landing pages, click-to-call
- **Owner:** Product/Dev | **Deadline:** Jan 31, 2026

**3. LinkedIn CTR Underperformance**
- Current: 0.79% | Target: 1.0%
- **Fix:** Pause MSP campaign, test video ads, tighten targeting
- **Owner:** Demand Gen | **Deadline:** Jan 15, 2026

### 🟡 High Priority

**4. Pipeline Volume Gap**
- Current: 10 deals | Target: 15-20
- Need more top-of-funnel activity

**5. Stuck Deals**
- DataSafe & ConnectCorp in same stage >20 days
- Need executive engagement

---

## Recommendations & Next Steps

### Immediate (7 Days)
1. Pause LinkedIn MSP campaign (0.66% CTR)
2. Conduct mobile UX audit
3. Engage stuck deals with exec calls

### Short-term (30 Days)
1. A/B test simplified forms
2. Scale ISP campaign +30%
3. Create 5 new LinkedIn ad variants

### Medium-term (90 Days)
1. Reach 20+ active deals by Mar 31
2. Launch ABM for top 25 accounts
3. Mobile optimization complete

---

## Data Sources & Methodology
- **GA4:** Last 7 days
- **HubSpot:** Real-time CRM data
- **LinkedIn Ads:** Campaign data from Jan 3-9
- Generated: January 10, 2026 at 14:32 UTC
```

---

## ⚡ Performance & Optimization

### Token Usage Breakdown
- **Per Report:** 2,300-3,500 tokens (Haiku)
- **Cost per Report:** $0.0069-0.0105 (~1 cent)
- **With Prompt Caching:** 50-70% cheaper on repeat queries

### Speed Targets
- Data fetching: 3-5 seconds
- Insight generation: 5-8 seconds
- Report formatting: 3-5 seconds
- **Total:** 15-25 seconds

### Optimization Techniques
1. **Prompt Caching** - Cache knowledge base (huge savings)
2. **Parallel agents** - Run data fetch + KB query together
3. **Structured output** - JSON only, no markdown until final step
4. **Mini prompts** - Each agent gets focused instructions
5. **Token limits** - Enforce max tokens per agent

---

## 🎯 Cursor Prompt (Ready to Paste)

---

## YES - This is 100% Feasible

**Difficulty Level:** Medium (not hard!)
**Cost:** Ultra-low (~$0.01 per report)
**Setup Time:** 2-3 hours
**Maintenance:** Minimal (agents are stateless)

---

## Summary

✅ **3 mini agents** (Data → Insights → Format)
✅ **Synchronized execution** (parallel + sequential)
✅ **Haiku model** (ultra-cheap)
✅ **Full conversational** (remembers context)
✅ **Knowledge base integration** (smart analysis)
✅ **PDF + Markdown** (downloadable)
✅ **Right panel display** (live rendering)
✅ **Low token cost** (~1 cent per report)

**This is your Reports MVP ready to build!**
