# Cursor Prompt - Build Orion Reports Page with Mini Agents

Copy this entire prompt into Cursor and paste it.

---

Build a Reports page for Orion (our analytics dashboard) with the following architecture:

### **Tech Stack:**
- Next.js App Router
- React components
- Claude API (Haiku model for cost efficiency)
- Markdown rendering (react-markdown)
- PDF generation (html2pdf or similar)
- Tailwind CSS

### **Features:**

**UI Layout:**
- Left panel: Date range selector + connector checkboxes (GA4, HubSpot, LinkedIn, Reddit) + Generate button
- Right panel: Live report display (markdown + PDF download)
- Below: Conversational chat panel (remembers context)
- Progress indicator showing agent status

**Report Generation Flow:**
1. User selects date range (e.g., Jan 3-9, 2026)
2. User checks which connectors to include
3. User clicks [Generate Report]
4. Three mini agents run synchronously:
   - **Agent 1 (Data Aggregator):** Fetches raw metrics from selected connectors
   - **Agent 2 (Insight Generator):** Analyzes data and creates insights/recommendations
   - **Agent 3 (Report Formatter):** Converts insights to polished .md/.pdf
5. Right panel populates with formatted report
6. User can ask follow-up questions in chat

### **Agents Architecture:**

**Agent 1: Data Aggregator (500-800 tokens)**
- Fetches: GA4 users/sessions/engagement, HubSpot contacts/deals, LinkedIn campaigns/spend, Reddit mentions
- Input: Date range, selected connectors, conversation context
- Output: Structured JSON with metrics
- Returns only JSON (no markdown) for efficiency

**Agent 2: Insight Generator (1000-1500 tokens)**
- Analyzes data vs historical benchmarks
- Identifies anomalies (>15% variance)
- Flags critical issues
- Creates prioritized recommendations
- Input: Raw data from Agent 1 + knowledge base + previous reports + conversation history
- Output: Structured insights

**Agent 3: Report Formatter (800-1200 tokens)**
- Converts insights to professional markdown
- Includes tables, sections, highlights
- Follows the template structure (like the attached PDF report)
- Input: Insights from Agent 2 + raw data
- Output: Markdown + PDF

**Coordination:**
- Agents run in parallel where possible
- Agent 1 and Agent 2 can run simultaneously (Agent 2 queries knowledge base)
- Agent 3 waits for Agent 2 to finish
- Total execution: 15-25 seconds
- Total tokens: 2300-3500 (~1 cent with Haiku)

### **Knowledge Base:**

Create a knowledge base JSON at `/lib/knowledgeBase.json` with:
```json
{
  "purewl": {
    "benchmarks": {
      "visitor_to_contact": 0.03,
      "cac": 4500,
      "ltv": 206550,
      "ctr_target": 0.01,
      "mobile_desktop_ratio": 1.8
    },
    "critical_issues": [
      {
        "id": "mobile_conversion",
        "description": "Mobile converts at 0.6% vs desktop 1.8%",
        "impact": 470
      }
    ]
  }
}
```

Include actual values from the attached Full Funnel Performance Report.

### **Files to Create:**

```
/app/reports/
  ├── page.jsx                       # Main Reports page
  ├── layout.jsx                     # Reports layout
  └── components/
      ├── ReportGenerator.jsx        # Main controller
      ├── DateRangeSelector.jsx      # Date picker
      ├── ConnectorSelector.jsx      # Checkboxes for GA4/HubSpot/etc
      ├── ProgressIndicator.jsx      # Shows "Data Agent → Insight Agent → Format Agent"
      ├── ReportPanel.jsx            # Right side display
      └── ChatPanel.jsx              # Bottom conversational panel

/app/api/reports/
  ├── generate/route.js              # POST - generates report
  └── download/route.js              # GET - downloads PDF

/lib/
  ├── agents/
  │   ├── dataAggregator.js          # Agent 1
  │   ├── insightGenerator.js        # Agent 2
  │   ├── reportFormatter.js         # Agent 3
  │   └── orchestrator.js            # Coordinates all 3
  ├── apiIntegrations/
  │   ├── ga4.js                     # GA4 API calls
  │   ├── hubspot.js                 # HubSpot API calls
  │   ├── linkedin.js                # LinkedIn API calls
  │   └── reddit.js                  # Reddit API calls
  ├── knowledgeBase.json             # Benchmarks, historical data
  └── reportTemplates.js             # Markdown templates

### **System Prompts for Agents:**

**Agent 1 (Data Aggregator):**
```
You are the Data Aggregator Agent for Orion Reports.

Your job: Fetch and compile raw metrics from selected data sources efficiently.

Available connectors:
- GA4: users, sessions, engagement_rate, bounce_rate, pages_per_session, traffic_source, device, geography, conversion_rate
- HubSpot: total_contacts, new_contacts, active_deals, pipeline_value, sales_activity_count
- LinkedIn: campaigns, total_spend, impressions, clicks, ctr, avg_cpc
- Reddit: mentions, sentiment_score, engagement

Instructions:
1. Only fetch data for the selected connectors
2. Use minimal tokens - return ONLY valid JSON with no markdown
3. Include all metrics from the selected date range
4. Flag any missing or incomplete data
5. Add data quality notes (e.g., "GA4 data may have 2-hour delay")

Return format (JSON ONLY):
{
  "ga4": {...metrics...},
  "hubspot": {...metrics...},
  "linkedin": {...metrics...},
  "metadata": {
    "timestamp": "ISO timestamp",
    "completeness": "100%",
    "notes": []
  }
}
```

**Agent 2 (Insight Generator):**
```
You are the Insight Generator Agent for Orion Reports.

Your job: Analyze data and surface actionable insights using benchmarks.

Context:
- Company: PureWL (white-label VPN platform)
- Target segments: ISPs, telcos, security companies, MSPs
- Current situation: Growth stage, focusing on top-of-funnel optimization

Benchmarks (from knowledge base):
- Visitor-to-contact: 3% target, currently 1.3%
- CTR target: 1.0%, currently 0.79%
- CAC: $4,500
- LTV: $206,550

Analysis framework:
1. Compare each metric vs benchmark/historical
2. Flag anomalies (>15% variance)
3. Identify root causes for significant gaps
4. Prioritize critical issues (high impact + easy fix)
5. Create specific, actionable recommendations

For each insight:
- Finding (what changed)
- Impact (quantified)
- Root cause (hypothesis)
- Recommended action (specific)
- Priority (critical/high/medium)

Output format (Markdown in JSON):
{
  "summary": "Brief 2-3 sentence overview",
  "key_findings": [
    {
      "finding": "...",
      "impact": "...",
      "priority": "critical|high|medium"
    }
  ],
  "critical_issues": [...],
  "recommendations": [...]
}
```

**Agent 3 (Report Formatter):**
```
You are the Report Formatter Agent for Orion Reports.

Your job: Convert insights and data into a polished, professional .md report.

Template structure:
# [Report Title]: Week Ending [Date]

## Executive Summary
- 2-3 bullet points of critical findings
- Alert any critical issues

## [Section by Connector]
For each active connector:
- Top metrics (in table format)
- Key insights
- Anomalies
- Recommendations

## Critical Issues & Action Items
Organized by priority (Critical → High → Medium)

## Recommendations & Next Steps
Organized by timeframe (Immediate → Short-term → Medium-term)

## Data Quality & Methodology
- Data sources used
- Date range
- Generated timestamp

Style guidelines:
- Use clear markdown formatting (##, ###, **bold**, tables)
- Include actual numbers and percentages
- Use action verbs (Pause, Scale, Optimize, etc.)
- Professional but conversational tone
- Highlight critical items with emojis (🔴 for critical, 🟡 for high)

Output ONLY the markdown content (no JSON wrapper).
```

### **API Route Implementation:**

**POST /api/reports/generate**
- Input: {dateRange, connectors, conversationHistory}
- Call orchestrator with all 3 agents
- Return: {reportId, markdown, metadata}
- Updates UI progress as agents complete

### **Features to Include:**

1. **Progress Indicator**
   - Shows each agent's status (running/completed/pending)
   - Real-time updates
   - Estimated time remaining

2. **Report Display**
   - Renders markdown in real-time as it's generated
   - Scrollable
   - Copy button for markdown
   - Download PDF button

3. **Chat Integration**
   - User can ask questions about the report
   - Agent remembers report context
   - Can drill into specific insights

4. **Data Persistence**
   - Save generated reports
   - Allow viewing historical reports
   - Export history

### **Performance Targets:**

- Data fetch: 3-5 seconds
- Insight generation: 5-8 seconds
- Report formatting: 3-5 seconds
- **Total:** 15-25 seconds
- **Tokens per report:** 2,300-3,500 (Haiku at ~$0.01/report)

### **Optimization:**

- Use Haiku model (fastest, cheapest)
- Implement prompt caching for knowledge base (huge savings)
- Parallel agent execution where possible
- Structured JSON output (not markdown) until final step
- Enforce max token limits per agent

### **Testing:**

- Test with sample data from the attached PDF
- Verify agents return proper JSON
- Check markdown rendering
- Test PDF download
- Verify chat context awareness

### **Implementation Order:**

1. Create React components (UI scaffolding)
2. Implement Agent 1 (data fetching)
3. Implement Agent 2 (insight analysis)
4. Implement Agent 3 (report formatting)
5. Create orchestrator
6. Wire up API routes
7. Add progress indicators
8. Add chat integration
9. Add export/download features
10. Test end-to-end

---

## Summary

**3 mini agents:**
- Agent 1: Data Aggregator
- Agent 2: Insight Generator  
- Agent 3: Report Formatter

**Cost:** ~$0.01 per report
**Speed:** 15-25 seconds
**Feasibility:** 100% possible
**Token efficiency:** 2,300-3,500 tokens (Haiku)

The entire system is designed to be cheap, fast, and synchronized!

---

**Ready to build. Create all files with full implementation (not skeleton code) and make it production-ready.**
