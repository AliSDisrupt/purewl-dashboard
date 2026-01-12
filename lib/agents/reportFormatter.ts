/**
 * Agent 3: Report Formatter
 * Converts insights into polished markdown report using Claude API with Haiku 4.5 model
 * Uses Haiku for fast formatting (low complexity task)
 */

import Anthropic from "@anthropic-ai/sdk";
import { trackClaudeTokens } from "@/lib/usage-tracker";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

export interface ReportFormatterInput {
  insights: any;
  rawData: any;
  dateRange: { start: string; end: string };
  connectors: string[];
}

export interface ReportFormatterOutput {
  markdown: string;
  tokensUsed: number;
}

export async function reportFormatter(
  input: ReportFormatterInput
): Promise<ReportFormatterOutput> {
  const systemPrompt = `You are the Report Formatter Agent for GTM-based Orion reports.

Your job: Convert insights and raw data into a complete 14-page professional GTM report with ALL 13 sections.

CRITICAL: You MUST include ALL 13 sections with exact structure below. Do NOT skip any section.

SECTION 1: EXECUTIVE SUMMARY
- ### Top-Line Metrics table:
  | Metric | Value | Target | Status |
  |--------|-------|--------|--------|
  | Total Website Users (Last 7 days) | [value] | 10,000/month | ✅/⚠️ |
  | Total HubSpot Contacts | [value] | - | - |
  | Active Deals in Pipeline | [value] deals worth $[amount] | 15-20 deals | ✅/⚠️ |
  | LinkedIn Campaign Performance | [campaigns] active, $[spend] spend | - | - |
  | Sales Activity | [calls] calls, [emails] emails, [meetings] meetings | - | - |

- ### Key Insights (3-5 bullet points):
  - Traffic status (down/up vs baseline)
  - Pipeline health indicator
  - Marketing performance note
  - Sales team activity level
  - Strategic priority indicator

SECTION 2: STAGE 1 - TRAFFIC AND ACQUISITION (Top of Funnel)
- ### Overall Traffic Performance (Last 7 Days):
  | Metric | This Week | Benchmark | Status |
  |--------|-----------|-----------|--------|
  | Total Users | [#] | [target]/month | ✅/⚠️ |
  | New Users | [#] | [%] new rate | ✅/⚠️ |
  | Total Sessions | [#] | - | - |
  | Average Session Duration | [time] | >[benchmark] | ✅/⚠️ |
  | Pages per Session | [#] | >[benchmark] | ✅/⚠️ |
  
  Analysis paragraph (3-4 sentences): Post-holiday context, current pace projection, intent level, engagement strength.

- ### Traffic by Source/Medium (Last 7 Days):
  | Source/Medium | Users | Sessions | Engagement Rate | Avg Session Duration |
  |---|---|---|---|---|
  | google / organic | [#] | [#] | [%] | [time] |
  | (direct) / (none) | [#] | [#] | [%] | [time] |
  | linkedin / cpc | [#] | [#] | [%] | [time] |
  | google / cpc | [#] | [#] | [%] | [time] |
  | bing / organic | [#] | [#] | [%] | [time] |
  | reddit / social | [#] | [#] | [%] | [time] |
  | referral / various | [#] | [#] | [%] | [time] |
  
  Key insight paragraph (2-3 sentences): Highest engagement channel, intent signal, volume vs quality.

- ### Top Landing Pages (Last 7 Days):
  | Page | Users | Avg Engagement Time | Bounce Rate |
  |---|---|---|---|
  | / (homepage) | [#] | [time] | [%] |
  | /white-label-vpn | [#] | [time] | [%] |
  | /solutions/isp | [#] | [time] | [%] |
  | /pricing | [#] | [time] | [%] |
  | /blog/vpn-market-2026 | [#] | [time] | [%] |
  | /enterprise-security | [#] | [time] | [%] |
  
  Key insight paragraph (2-3 sentences): Solution pages performance, bounce rate comparison, routing recommendation.

- ### Geographic Distribution (Last 7 Days):
  | Country | Users | % of Total | Engagement Rate |
  |---|---|---|---|
  | United States | [#] | [%] | [%] |
  | United Kingdom | [#] | [%] | [%] |
  | Canada | [#] | [%] | [%] |
  | Germany | [#] | [%] | [%] |
  | Singapore | [#] | [%] | [%] |
  | Australia | [#] | [%] | [%] |
  | Others | [#] | [%] | [%] |
  
  Key insight paragraph (2 sentences): Top performing geography, APAC expansion opportunity.

SECTION 3: STAGE 2 - LEAD GENERATION (Middle of Funnel)
- ### HubSpot Contact Database Overview:
  Summary bullets:
  - Total contacts in database: [#]
  - New contacts added (Last 7 days): ~[#]
  - Contacts engaged (Last 7 days): [#]
  - Form submissions (Last 7 days): [#]
  - Demo requests (Last 7 days): [#]

- ### HubSpot Companies (Target Accounts):
  Summary: Total companies: [#]
  
  | Company Name | Industry | Domain | Employees | Deal Value |
  |---|---|---|---|---|
  | TelecomGlobal Inc | Telecommunications | telecomglobal.com | 5,000-10,000 | $[amount] |
  | SecureNet Solutions | Security Software | securenet.com | 1,000-5,000 | $[amount] |
  | NetWave ISP | ISP/Telecom | netwave.net | 2,500+ | $[amount] |
  | CloudShield Corp | Cloud Security | cloudshield.io | 500-1,000 | $[amount] |
  | DataSafe Partners | MSP | datasafe.com | 200-500 | $[amount] |
  
  Key insight paragraph (1-2 sentences): Segment alignment, ICP validation.

- ### Sales Activity (Last 7 Days):
  | Activity Type | Count | Notes |
  |---|---|---|
  | Calls Made | [#] | [status] |
  | Emails Sent | [#] | [status] |
  | Meetings Held | [#] | [status] |
  | Tasks Completed | [#] | [status] |
  | Notes Logged | [#] | [status] |
  
  Concerns paragraph (2 sentences): CRM hygiene, documentation gaps, attribution challenges.

SECTION 4: STAGE 3 - SALES PIPELINE (Bottom of Funnel)
- ### HubSpot Deal Pipeline Analysis:
  Summary: Active deals: [#], Total pipeline value: $[amount], Average deal size: $[amount]

- ### Pipeline Breakdown by Stage:
  | Deal Name | Amount | Stage | Close Date | Segment | Days in Stage |
  |---|---|---|---|---|---|
  | TelecomGlobal - White Label VPN | $[amount] | Proposal Sent | [date] | ISP/Telecom | [#] |
  | SecureNet Suite Integration | $[amount] | Technical Validation | [date] | Security Co | [#] |
  | NetWave Subscriber Bundle | $[amount] | Discovery | [date] | ISP/Telecom | [#] |
  | CloudShield Enterprise | $[amount] | Demo Scheduled | [date] | Tech/SaaS | [#] |
  | DataSafe MSP Partnership | $[amount] | Proposal Sent | [date] | MSP | [#] |
  | ConnectCorp VPN Launch | $[amount] | Negotiation | [date] | ISP/Telecom | [#] |

- ### Pipeline Health Metrics:
  | Metric | Value | Target | Status |
  |---|---|---|---|
  | Total Pipeline Value | $[amount] | $600,000+ | ✅/⚠️ |
  | Number of Active Deals | [#] | 15-20 | ⚠️ |
  | Average Deal Size | $[amount] | $75,000 | ✅ |
  | Deals >14 Days in Same Stage | [#] | <2 | ⚠️ |
  | Weighted Pipeline (by %) | ~$[amount] | - | - |
  
  Concerns bullets: Deal stuck alerts, deal volume below target.

- ### Deals by Segment:
  | Segment | Number of Deals | Total Value | Average Deal | % of Pipeline |
  |---|---|---|---|---|
  | ISP/Telecom | [#] | $[amount] | $[amount] | [%] |
  | Security Companies | [#] | $[amount] | $[amount] | [%] |
  | MSP/Reseller | [#] | $[amount] | $[amount] | [%] |
  | Tech/SaaS | [#] | $[amount] | $[amount] | [%] |
  | Other | [#] | $[amount] | $[amount] | [%] |
  
  Key insight paragraph (2 sentences): Dominant segment, segment prioritization.

SECTION 5: STAGE 4 - MARKETING CAMPAIGN PERFORMANCE
- ### LinkedIn Ads Performance (Last 7 Days):
  Summary bullets:
  - Active campaigns: [#]
  - Total spend: $[amount]
  - Total impressions: [#]
  - Total clicks: [#]
  - Average CTR: [%] (target: 1.0%+)
  - Average CPC: $[amount]
  - Estimated leads: [#]-[#]

- ### Campaign Breakdown:
  | Campaign Name | Spend | Impressions | Clicks | CTR | CPC |
  |---|---|---|---|---|---|
  | ISP Growth - ARPU Strategy | $[amount] | [#] | [#] | [%] | $[amount] |
  | Security Suite Completion | $[amount] | [#] | [#] | [%] | $[amount] |
  | MSP Revenue Partnership | $[amount] | [#] | [#] | [%] | $[amount] |

- ### Campaign Analysis:
  Analysis paragraph (3-4 sentences): Top performer CTR, underperformer identification, CPC assessment, primary optimization lever.
  
  Recommendations bullets:
  - Pause underperforming campaign and refresh creative
  - Scale top performer by 30%
  - A/B test new ad creative
  - Tighten targeting

SECTION 6: FULL FUNNEL CONVERSION ANALYSIS
- ### Week-by-Week Funnel Performance (Last 7 Days):
  | Funnel Stage | Count | Conversion Rate | Vs. Target / Notes |
  |---|---|---|---|
  | Website Visitors (7d) | [#] | 100% | [%] of monthly pace |
  | Engaged Visitors (>1 min) | [#] | [%] | [status] |
  | Key Page Visits | [#] | [%] | - |
  | Form Submissions | [#] | [%] | Below [%] target |
  | New Contacts | [#] | [%] | Below [%] target |
  | Demo Requests | [#] | [%] | [status] |
  | Opportunities Created | [#] | [%] | - |
  
  Monthly Projection (based on weekly pace): Monthly visitors ~[#] (vs [#] target), Monthly MQLs ~[#]-[#] (vs [#] target), Monthly SQLs ~[#]-[#] (vs [#] target), Monthly demos ~[#] (vs [#] target).

- ### Conversion Rate Benchmarks:
  | Conversion Path | Current | Target | Gap | Status |
  |---|---|---|---|---|
  | Visitor → Contact | [%] | [%] | [%] | 🔴 Critical |
  | Contact → MQL | [%] | [%] | - | - |
  | MQL → SQL | [%] | [%] | - | - |
  | SQL → Opportunity | [%] | [%] | [%] | ✅ On target |
  | Opportunity → Close | [%] | [%] | [%] | ✅ On target |
  
  Key issue paragraph (2 sentences): Primary bottleneck, impact quantification.

- ### Attribution and Customer Journey Insights:
  | Source | Engagement Rate | Avg Session | Lead Quality (Estimated) |
  |---|---|---|---|
  | LinkedIn Ads | [%] | [time] | High (enterprise) |
  | Google Organic | [%] | [time] | Medium-high |
  | Google Ads | [%] | [time] | Medium |
  | Direct | [%] | [time] | Mixed |
  | Reddit | [%] | [time] | Low (awareness) |
  
  Strategic insight paragraph (2 sentences): Highest quality channels, intent signal indicators.

- ### Content Performance by Funnel Stage:
  **Top of Funnel (Awareness):** Blog content [time] average engagement, Industry reports high shares, Reddit discussions brand awareness.
  **Middle of Funnel (Consideration):** /white-label-vpn page [time] engagement [%] bounce, /solutions/isp page [time] engagement [%] bounce, Case studies strong conversion to demo.
  **Bottom of Funnel (Decision):** /pricing page [time] engagement, Technical docs high download rate, Competitor comparisons strong conversion.

SECTION 7: REVENUE AND BUSINESS IMPACT ANALYSIS
- ### Pipeline Velocity Metrics:
  | Metric | Current | Target | Status |
  |---|---|---|---|
  | Average Sales Cycle | [#]-[#] days | <90 days | ✅ Excellent |
  | Pipeline Coverage Ratio | [#]x | 3-4x quarterly | ⚠️ Needs deals |
  | Monthly New Pipeline Added | ~$[amount]/month | $600K+ | ✅ On pace |
  | Win Rate (Historical) | ~[%] | 25-30% | ✅ On target |
  | Average Deal Size | $[amount] | $75,000 | ✅ [%] of target |

- ### Revenue Forecast (Q1 2026):
  | Scenario | Deals | Total ARR | Probability |
  |---|---|---|---|
  | Best Case (60% close) | [#] | $[amount] | [%] |
  | Expected (40% close) | [#] | $[amount] | [%] |
  | Worst Case (25% close) | [#]-[#] | $[amount] | [%] |
  
  Forecast summary paragraph: Most likely Q1 outcome, revenue projection.
  
  Projected Deals to Close in Q1:
  - Deal 1: $[amount] - [%] probability
  - Deal 2: $[amount] - [%] probability
  - Deal 3: $[amount] - [%] probability
  - Deal 4: $[amount] - [%] probability

- ### Customer Acquisition Economics:
  | Metric | Value | Benchmark | Status |
  |---|---|---|---|
  | CAC (Customer Acquisition Cost) | $[amount] | <$5,000 | ✅ On target |
  | Average ARR per Customer | $[amount] | $75,000 | ✅ On target |
  | LTV (3-year @ 95% retention) | $[amount] | $150,000+ | ✅ Excellent |
  | LTV:CAC Ratio | [#]:1 | >30:1 | ✅ Outstanding |
  | Months to Payback CAC | [#] months | <12 months | ✅ Exceptional |
  
  Key insight paragraph (2 sentences): Unit economics assessment, investment recommendation.

- ### Marketing Efficiency Metrics:
  | Channel | Spend (7d) | Estimated Leads | CPL | Channel Efficiency |
  |---|---|---|---|---|
  | LinkedIn Ads | $[amount] | [#]-[#] | $[amount] | ✅/⚠️ |
  | Google Ads | ~$[amount] | [#]-[#] | $[amount] | ✅/⚠️ |
  | Organic/Content | $0 | [#]-[#] | $0 | ✅ Excellent ROI |
  | Total (blended) | ~$[amount] | [#]-[#] | ~$[amount] | ✅ Strong |
  
  Analysis paragraph (2 sentences): Blended CPL assessment, optimization opportunity.

SECTION 8: TECHNOLOGY AND DEVICE ANALYSIS
- ### Traffic by Device (Last 7 Days):
  | Device | Users | % of Total | Engagement Rate | Avg Session | Conversion Rate |
  |---|---|---|---|---|---|
  | Desktop | [#] | [%] | [%] | [time] | [%] |
  | Mobile | [#] | [%] | [%] | [time] | [%] |
  | Tablet | [#] | [%] | [%] | [time] | [%] |
  
  🔴 **Critical Issue Alert:** Mobile conversion [%] vs Desktop [%] (-[%] gap). Mobile represents [%] of traffic. Significant lead and revenue leak.
  
  Estimated Lost Opportunity: Mobile visitors [#]/week (~[#]/month). Potential contacts if mobile = desktop: ~[#]/month vs current ~[#]/month. Estimated lost leads: ~[#]/month (~[#]/year).
  
  Recommendation with Deadline: Mobile UX audit and optimization. Target: Recover [#]+ MQLs per month. Deadline: [date].

- ### Browser Performance:
  | Browser | Users | % | Engagement Rate |
  |---|---|---|---|
  | Chrome | [#] | [%] | [%] |
  | Safari | [#] | [%] | [%] |
  | Edge | [#] | [%] | [%] |
  | Firefox | [#] | [%] | [%] |
  | Other | [#] | [%] | [%] |
  
  Analysis: No major browser issues identified; consistent performance across platforms.

- ### Operating System Insights:
  | Operating System | Users | Engagement Rate | Notes |
  |---|---|---|---|
  | Windows | [#] | [%] | Primary B2B audience |
  | macOS | [#] | [%] | High engagement |
  | iOS | [#] | [%] | Mobile traffic |
  | Android | [#] | [%] | Lower engagement |
  | Linux | [#] | [%] | High-intent technical |

SECTION 9: GEOGRAPHIC DEEP DIVE
- ### Regional Performance Analysis:
  
  **NORTH AMERICA (55% of traffic)**
  | Metric | USA | Canada | Total NA |
  |---|---|---|---|
  | Users | [#] | [#] | [#] |
  | Engagement Rate | [%] | [%] | [%] |
  | Estimated Leads | [#] | [#] | [#] |
  | Pipeline Value | $[amount] | $[amount] | $[amount] |
  
  Analysis paragraph (1-2 sentences): Market maturity, buying patterns, deal size indicator.
  
  **EUROPE (28% of traffic)**
  | Country | Users | Engagement | Pipeline | Deals |
  |---|---|---|---|---|
  | United Kingdom | [#] | [%] | $[amount] | [#] |
  | Germany | [#] | [%] | $[amount] | [#] |
  | France | ~[#] | - | $[amount] | [#] |
  | Netherlands | ~[#] | - | $[amount] | [#] |
  
  Opportunity Analysis: Strong UK performance. Germany/EU underrepresented. GDPR/NIS2 compliance angle opportunity.
  
  **ASIA-PACIFIC (9% of traffic)**
  | Country | Users | Engagement | Notes |
  |---|---|---|---|
  | Singapore | [#] | [%] | Highest engagement globally |
  | Australia | [#] | [%] | Strong potential |
  | India | ~[#] | - | High growth market |
  | Japan | ~[#] | - | Regulatory opportunity |
  
  APAC Expansion Recommendation: Use Singapore as beachhead (highest engagement, English-speaking). Pursue telco partnerships. Estimated TAM: $[amount]B in APAC white-label VPN market by 2030. Strategic priority for Q1 2026 expansion planning.

SECTION 10: TIME-BASED PERFORMANCE PATTERNS
- ### Traffic by Day of Week (Last 7 Days):
  | Day | Users | Engagement | Lead Volume (Estimated) |
  |---|---|---|---|
  | Monday | [#] | [%] | [#] |
  | Tuesday | [#] | [%] | [#] |
  | Wednesday | [#] | [%] | [#] |
  | Thursday | [#] | [%] | [#] |
  | Friday | [#] | [%] | [#] |
  | Saturday | [#] | [%] | [#] |
  | Sunday | [#] | [%] | [#] |
  
  Pattern Identification: Tuesday and Wednesday are peak days for B2B engagement.
  
  Optimization Opportunities:
  - Schedule LinkedIn campaign emphasis for Tuesday/Wednesday
  - Send email campaigns Monday evening to land Tuesday morning
  - Avoid major launches on Fridays

- ### Hourly Patterns (Typical B2B):
  Pattern Analysis: Peak hours 9-11 AM local time (research and evaluation). Secondary peak 2-4 PM local time (decision-making hours). Significant drop-off after 6 PM.
  
  Recommendation: Schedule LinkedIn delivery during peak hours in key time zones (EST and GMT) for maximum impact.

SECTION 11: COMPETITOR INTELLIGENCE UPDATE (January 2026)
- ### Market Movements:
  **Check Point SASE (formerly Perimeter 81):** Continued enterprise push with hardware requirements. Pricing pressure on mid-market. Advantage vs us: [assessment].
  
  **NordLayer:** Growing SMB market share. Limited customization options. Advantage vs us: [assessment].
  
  **Emerging Threats (New Players):** New white-label VPN startups with lower entry pricing (~$500 startup cost). Our advantages: 17+ years infrastructure, enterprise certifications, proven scale.

- ### Competitive Win/Loss Analysis (Last Quarter):
  | Outcome | Count | Primary Competitor | Win/Loss Factor |
  |---|---|---|---|
  | Won | [#] | Check Point SASE ([#]), Build In-House ([#]), NordLayer ([#]) | White-label capability, proven infrastructure |
  | Lost | [#] | Price ([#]), Timeline ([#]) | Budget constraints, urgency mismatch |
  
  Win Rate Analysis: [%] win rate (vs [%] benchmark).

SECTION 12: CRITICAL ISSUES AND RISK ASSESSMENT
- ### Critical (Immediate Action Required):
  
  🔴 **Issue 1: Top-of-Funnel Conversion Gap**
  - Problem: Visitor-to-contact conversion 1.3% vs 3% target (-57%)
  - Impact: Approximately 235 potential contacts/month
  - Fix Required: A/B test simplified forms (3 fields max), Add social proof above the fold, Mobile UX overhaul, Implement exit-intent offers
  - Owner: Marketing
  - Deadline: January 20, 2026
  
  🔴 **Issue 2: Mobile Conversion Performance**
  - Problem: Mobile converts at 0.6% vs desktop 1.8% (-67%)
  - Impact: Approximately 470 lost leads annually
  - Fix Required: Responsive form redesign, Mobile-specific landing pages, Click-to-call buttons for mobile, Simplified navigation
  - Owner: Product/Web Dev
  - Deadline: January 31, 2026
  
  🔴 **Issue 3: LinkedIn Campaign Underperformance**
  - Problem: All campaigns below 1.0% CTR (0.66-0.87%)
  - Impact: Elevated CPL and reduced lead volume
  - Fix Required: Pause MSP campaign immediately, Create 5 new ad variants for A/B testing, Tighten audience targeting, Test video ads
  - Owner: Demand Gen
  - Deadline: January 15, 2026

- ### High Priority (Address This Month):
  
  🟡 **Issue 1: Pipeline Volume Gap**
  - Only 10 active deals vs 15-20 target. Need to increase top-of-funnel lead generation. Improve MQL to SQL conversion.
  - Deadline: January 31, 2026
  
  🟡 **Issue 2: Stuck Deals**
  - DataSafe MSP: 22 days in Proposal Sent → needs follow-up. ConnectCorp: 28 days in Negotiation → needs C-level engagement.
  - Owner: Sales Leadership
  - Deadline: January 12, 2026
  
  🟡 **Issue 3: CRM Data Quality**
  - Minimal notes logged. Zero tasks completed. Reduces pipeline visibility. Inhibits reliable MQL/SQL attribution.
  - Owner: Sales Ops
  - Deadline: January 20, 2026
  - Action: Implement CRM hygiene training, enforce mandatory fields, weekly pipeline review

- ### Medium Priority (Monitor and Plan):
  
  🔵 **Issue 1: MQL Volume Below Pace**
  - Tracking to ~35-40 MQLs/month vs 50 target. Primary lever: Fix top-of-funnel conversion. Secondary lever: Scale working campaigns.
  
  🔵 **Issue 2: Content Performance Gap**
  - Solution pages show high engagement but volume is low. Action: Prioritize SEO and paid distribution to /solutions/isp and /white-label-vpn.
  
  🔵 **Issue 3: Geographic Expansion Readiness**
  - APAC engagement signals are strong. Q1 2026 action: Build APAC GTM plan, case studies, localization.

SECTION 13: STRATEGIC RECOMMENDATIONS AND NEXT STEPS
- ### Immediate Actions (Next 7 Days):
  1. **Pause LinkedIn MSP Campaign** - CTR of 0.66% is underperforming. Reallocate budget to ISP campaign (0.87% CTR). Action owner: Demand Gen.
  
  2. **Mobile UX Audit** - Conduct heatmap and session recording analysis. Identify friction points. Action owner: Product/Web Dev.
  
  3. **Engage Stuck Deals** - Executive call with DataSafe stakeholders. C-level engagement for ConnectCorp. Action owner: Sales Leadership.
  
  4. **Create New Ad Variants** - 5 new LinkedIn ad variants. Include video and testimonial-driven creative. Action owner: Demand Gen.
  
  5. **Fix CRM Hygiene** - Training session for sales team. Set mandatory fields. Establish weekly pipeline review cadence. Action owner: Sales Ops.

- ### Short-Term Tactics (30 Days):
  1. **Launch A/B Tests** - Homepage hero section, Contact form field count (test 3-field version), CTA copy variations. Target: 2.5%+ visitor-to-contact conversion. Action owner: Marketing.
  
  2. **Scale What's Working** - Increase ISP campaign budget by ~30%. Boost traffic to /solutions/isp landing page. Action owner: Demand Gen.
  
  3. **Geographic Expansion Prep** - Singapore market research, APAC competitor analysis, Develop case studies for APAC market. Action owner: Strategy/Marketing.
  
  4. **Content Marketing Acceleration** - Publish 2 ISP-focused blog posts, Draft 2026 white-label VPN buyer's guide, Develop HIPAA compliance guide. Action owner: Content Marketing.
  
  5. **Sales Enablement** - Update battle cards vs Check Point, Create ROI calculator for ISPs, Record demo videos for self-serve. Action owner: Sales Ops/Enablement.

- ### Medium-Term Strategy (90 Days / Q1 2026):
  1. **Pipeline Generation Engine** - Reach 20+ active deals by March 31, 2026. Launch ABM (Account-Based Marketing) for top 25 target accounts. Run monthly ISP/Telecom webinar series. Partner with industry associations. Action owner: Marketing/Sales Leadership.
  
  2. **Mobile Experience Overhaul** - Complete responsive form redesign. Launch mobile-specific landing pages. Implement click-to-call functionality. Simplify mobile navigation. Target: Recover 40+ MQLs per month. Action owner: Product/Web Dev.
  
  3. **APAC Expansion Initiative** - Establish Singapore office/partnership. Develop APAC-specific marketing materials. Create localized landing pages. Build telco partnership pipeline. Action owner: Strategic Partnerships/Marketing.

DATA QUALITY & METHODOLOGY (Final Section):
- **Data Sources:** List all connectors used (GA4, HubSpot, LinkedIn, Reddit)
- **Date Range:** Start date to end date
- **Generated:** Timestamp
- **Data Completeness Notes:** Any missing data or limitations
- **Methodology:** Brief note on data collection and analysis approach

FORMATTING REQUIREMENTS:
- Use ## for section headers (1-13)
- Use ### for subheading headers
- Use | pipes | for ALL tables (30+ tables required)
- Use 🔴🟡🔵 emojis for priority indicators
- Use **bold** for key metrics and numbers
- Use - bullets for lists
- Professional GTM (Go-To-Market) tone
- Include actual data from rawData and insights
- 14 pages total, ~30 tables minimum
- Use connector-specific sections (only show sections for available connectors)

CRITICAL: Include ALL 13 sections with proper structure. Only include sections where data is available from connectors. Use "N/A" or "No data available" if a connector is not selected. Do NOT skip sections - always provide the structure even if data is limited.

Output ONLY the markdown content (no JSON wrapper, no code blocks, no explanations).`;

  const formatDate = (dateStr: string | undefined | null) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (error) {
      console.error('Date formatting error:', error, 'for date:', dateStr);
      return dateStr || 'N/A';
    }
  };

  const endDateFormatted = input.dateRange?.end ? formatDate(input.dateRange.end) : 'N/A';

  const userPrompt = `Create a complete GTM (Go-To-Market) performance report with ALL 13 sections for the period ${input.dateRange?.start || 'N/A'} to ${input.dateRange?.end || 'N/A'}.

CRITICAL REQUIREMENTS:
1. Include ALL 13 sections in the exact order and structure provided in the system prompt
2. Only include sections where data is available from selected connectors: ${(input.connectors || []).join(', ') || 'None'}
3. Use actual data values from the raw data below
4. Fill all tables with real numbers (use 0 or N/A if data unavailable)
5. Include all subheadings (###) as specified
6. Use proper markdown table formatting with | pipes |
7. Use 🔴🟡🔵 emojis for priority indicators
8. Use **bold** for key metrics and numbers
9. Generate 14 pages of comprehensive GTM report content

CONNECTORS AVAILABLE:
${input.connectors?.map((c: string) => `- ${c.toUpperCase()}: ${c === 'ga4' ? 'Traffic, geography, devices, time patterns' : c === 'hubspot' ? 'Contacts, companies, deals, pipeline, activity' : c === 'linkedin' ? 'Campaigns, spend, impressions, clicks, CTR' : c === 'reddit' ? 'Posts, comments, engagement' : 'N/A'}`).join('\n') || 'None'}

INSIGHTS DATA:
${JSON.stringify(input.insights || {}, null, 2)}

RAW DATA:
${JSON.stringify(input.rawData || {}, null, 2)}

REMEMBER:
- This is a GTM report - focus on go-to-market metrics, pipeline, revenue, and strategic recommendations
- Include ALL 13 sections even if some data is limited (mark as N/A or "No data available")
- Use the exact table structures provided in the system prompt
- Professional GTM tone throughout
- 14 pages, ~30 tables minimum
- End with "## Data Quality & Methodology" section listing data sources, date range, and generated timestamp

Generate the complete report NOW following the exact structure. Return ONLY the markdown content (no JSON wrapper, no code blocks, no explanations).`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929", // Sonnet 4.5 for comprehensive GTM report formatting (better quality for detailed tables and structure)
      max_tokens: 4096, // Increased for comprehensive 14-page reports with 30+ tables
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    let markdown = response.content[0].type === "text" ? response.content[0].text : "";
    const tokensUsed = response.usage.input_tokens + response.usage.output_tokens;
    
    // Track tokens
    trackClaudeTokens(response.usage.input_tokens, response.usage.output_tokens);

    // Clean up markdown (remove code blocks if present)
    markdown = markdown.replace(/```markdown\s*/g, '').replace(/```\s*/g, '').trim();

    // If markdown is empty or too short, create a fallback
    if (!markdown || markdown.length < 100) {
      console.warn("Report formatter returned minimal content, creating fallback");
      markdown = `# Full Funnel Performance Report
Week Ending ${endDateFormatted}

## Executive Summary
Analysis completed for the period ${input.dateRange?.start || 'N/A'} to ${input.dateRange?.end || 'N/A'}.

## Data Sources
${(input.connectors || []).map((c) => `- ${c.toUpperCase()}`).join('\n')}

## Data Overview
Data has been collected and analyzed. Please check the insights for detailed findings.

## Generated
Report generated at ${new Date().toLocaleString()}
Date range: ${input.dateRange?.start || 'N/A'} to ${input.dateRange?.end || 'N/A'}`;
    }

    return {
      markdown: markdown || '# Full Funnel Performance Report\n\nReport generation completed but no content was produced.',
      tokensUsed: tokensUsed || 0,
    };
  } catch (error: any) {
    console.error("Report Formatter error:", error);
    throw new Error(`Report formatting failed: ${error.message}`);
  }
}
