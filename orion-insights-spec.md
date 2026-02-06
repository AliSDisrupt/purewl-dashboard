# 🎯 Orion Daily GTM Insights Page - Complete Specification

## Overview

Build an AI-powered daily insights page for the Orion GTM Dashboard. This page runs automatically at **9:00 AM GMT+5 (PKT)** every day, pulling data from all connected sources and using **Claude Sonnet API** to generate intelligent, actionable GTM insights.

**Goal:** Give the GTM team a 2-minute morning brief that tells them exactly what needs attention, what's working, and what to do next.

---

## 🏗️ Technical Architecture

### Data Flow
```
┌─────────────────────────────────────────────────────────────────┐
│                    DAILY CRON JOB (9 AM PKT)                    │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA COLLECTION LAYER                       │
├─────────────────┬─────────────────┬─────────────────┬───────────┤
│  LinkedIn Ads   │   Google        │    HubSpot      │  Reddit   │
│  API            │   Analytics 4   │    API          │  API      │
│                 │   API           │                 │           │
│  - Campaigns    │  - Sessions     │  - Leads        │  - Posts  │
│  - Spend        │  - Conversions  │  - MQLs/SQLs    │  - Engage │
│  - Leads        │  - Pages        │  - Pipeline     │  - Traffic│
│  - Geo data     │  - Sources      │  - Contacts     │           │
│  - Audiences    │  - Devices      │  - Deals        │           │
│  - Creatives    │  - Events       │                 │           │
└─────────────────┴─────────────────┴─────────────────┴───────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATA PROCESSING LAYER                         │
│                                                                  │
│  - Aggregate metrics                                            │
│  - Calculate WoW changes                                        │
│  - Compute benchmarks                                           │
│  - Flag anomalies                                               │
│  - Prepare comparison data                                      │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CLAUDE SONNET API                            │
│                                                                  │
│  Input: Structured JSON with all metrics + context              │
│  Output: Structured insights JSON                               │
│  Model: claude-sonnet-4-20250514                                      │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    STORAGE & DISPLAY                            │
│                                                                  │
│  - Store insights JSON (Supabase/JSON file)                     │
│  - Cache for quick loading                                      │
│  - Display on React frontend                                    │
│  - Optional: Slack notification                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Tech Stack
- **Cron Job:** GitHub Actions / Vercel Cron / n8n
- **AI Engine:** Claude Sonnet API (claude-sonnet-4-20250514)
- **Data Sources:** LinkedIn Ads API, GA4 API, HubSpot API, Reddit API
- **Storage:** Supabase / JSON in GitHub repo
- **Frontend:** React + Tailwind CSS
- **Charts:** Recharts / Tremor

---

## 📊 Complete Section Breakdown

### Section 1: 🎯 Executive Summary (Hero Section)

**Purpose:** 30-second glance at GTM health

**Components:**
```typescript
interface ExecutiveSummary {
  aiSummary: string; // 2-3 sentence AI-generated summary
  gtmHealthScore: {
    score: number; // 0-100
    trend: 'up' | 'down' | 'stable';
    changeFromLastWeek: number;
  };
  keyMetrics: [
    {
      name: string;
      value: string;
      change: number;
      changeType: 'positive' | 'negative' | 'neutral';
      sparklineData: number[]; // Last 7 days
    }
  ]; // Exactly 4 key metrics
  sentimentIndicator: 'excellent' | 'good' | 'concerning' | 'critical';
}
```

**Example AI Summary:**
> "Strong week overall with leads up 23% and CPL down 15%. LinkedIn UAE campaigns crushing it. However, website conversion dropped - the /features page needs urgent attention. Reddit showing promising early signals with 3 qualified leads from organic posts."

**Visual Design:**
- Large GTM Health Score circle (color-coded: green/yellow/red)
- 4 metric cards with sparklines
- AI summary in a highlighted card
- Mood indicator icon

---

### Section 2: 🚨 Immediate Actions Required

**Purpose:** Critical items that need attention TODAY

**Sub-sections:**

#### 2a. Ads to Pause/Fix
```typescript
interface AdAlert {
  campaignName: string;
  accountName: string; // Which LinkedIn account
  issue: 'high_cpl' | 'low_ctr' | 'no_conversions' | 'high_frequency' | 'budget_exhausted' | 'creative_fatigue';
  severity: 'critical' | 'warning';
  metric: {
    name: string;
    current: number;
    benchmark: number;
    percentageOff: number;
  };
  impact: string; // e.g., "Wasted $340 this week"
  recommendation: string;
  quickAction: string; // e.g., "Pause campaign"
}
```

**Thresholds for Alerts:**
| Issue | Threshold | Severity |
|-------|-----------|----------|
| High CPL | >2x target CPL | Critical |
| High CPL | >1.5x target CPL | Warning |
| Low CTR | <0.25% | Critical |
| Low CTR | <0.4% | Warning |
| No Conversions | 0 leads, >$100 spent, 3+ days | Critical |
| High Frequency | >6 | Warning |
| High Frequency | >8 | Critical |
| Creative Fatigue | CTR dropped >40% from peak | Warning |

#### 2b. Tracking/Data Issues
```typescript
interface DataAlert {
  source: 'linkedin' | 'ga4' | 'hubspot' | 'reddit';
  issue: string;
  detected: string; // timestamp
  impact: string;
  suggestedFix: string;
}
```

**Example Issues:**
- "GA4 conversion tracking shows 0 events for 2 days"
- "LinkedIn API returning partial data for PureWL account"
- "HubSpot sync lag detected - data 6 hours stale"

#### 2c. Budget Alerts
```typescript
interface BudgetAlert {
  account: string;
  alertType: 'overspend' | 'underspend' | 'pacing_fast' | 'pacing_slow';
  currentSpend: number;
  expectedSpend: number;
  projectedMonthEnd: number;
  monthlyBudget: number;
  recommendation: string;
}
```

---

### Section 3: 🌍 Geographic Performance Analysis

**Purpose:** Know where to spend and where to cut

#### 3a. Regions to Scale (Top Performers)
```typescript
interface GeoRecommendation {
  region: string;
  country: string;
  leads: number;
  spend: number;
  cpl: number;
  cplVsAverage: number; // percentage
  leadQuality: 'high' | 'medium' | 'low'; // based on SQL conversion
  sqlConversionRate: number;
  recommendation: 'scale_aggressive' | 'scale_moderate' | 'maintain';
  suggestedBudgetChange: string; // e.g., "+30%"
  reasoning: string;
}
```

#### 3b. Regions to Reduce/Cut
```typescript
interface GeoWarning {
  region: string;
  country: string;
  leads: number;
  spend: number;
  cpl: number;
  cplVsAverage: number;
  issue: 'high_cpl' | 'low_quality' | 'saturated' | 'low_volume';
  leadToSqlRate: number;
  recommendation: 'pause' | 'reduce_50' | 'reduce_25' | 'monitor';
  reasoning: string;
  potentialSavings: number;
}
```

#### 3c. Geo Heatmap Data
```typescript
interface GeoHeatmap {
  regions: [{
    name: string;
    countryCode: string;
    leads: number;
    cpl: number;
    performance: 'excellent' | 'good' | 'average' | 'poor';
  }];
}
```

**Visual:** Interactive map with color-coded regions

---

### Section 4: 👥 Audience & Targeting Insights

**Purpose:** Know WHO is converting best

#### 4a. Job Title Performance
```typescript
interface JobTitleInsight {
  jobTitle: string;
  impressions: number;
  clicks: number;
  leads: number;
  cpl: number;
  ctr: number;
  sqlConversionRate: number;
  performance: 'top_performer' | 'good' | 'average' | 'underperforming';
  recommendation: string;
}
```

#### 4b. Company Size Performance
```typescript
interface CompanySizeInsight {
  size: '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1001-5000' | '5000+';
  leads: number;
  cpl: number;
  dealSize: number; // average deal value
  recommendation: string;
}
```

#### 4c. Industry Performance
```typescript
interface IndustryInsight {
  industry: string;
  leads: number;
  cpl: number;
  conversionRate: number;
  performance: string;
}
```

#### 4d. Audience Saturation Alerts
```typescript
interface AudienceSaturation {
  audienceName: string;
  frequencyScore: number;
  reachPercentage: number; // % of audience reached
  fatigueIndicator: boolean;
  recommendation: string;
}
```

---

### Section 5: 📄 Landing Page & Content Performance

**Purpose:** Know which pages convert and which leak

#### 5a. Top Converting Pages
```typescript
interface PagePerformance {
  pagePath: string;
  pageTitle: string;
  sessions: number;
  conversions: number;
  conversionRate: number;
  bounceRate: number;
  avgTimeOnPage: number;
  trend: number; // WoW change
  status: 'top_performer' | 'improving' | 'stable' | 'declining';
}
```

#### 5b. Pages Needing Attention
```typescript
interface PageIssue {
  pagePath: string;
  pageTitle: string;
  sessions: number;
  issue: 'high_bounce' | 'low_conversion' | 'high_exit' | 'low_engagement' | 'form_dropoff';
  metric: {
    name: string;
    value: number;
    benchmark: number;
  };
  potentialImpact: string; // e.g., "Fixing could generate +15 leads/week"
  recommendations: string[];
  priority: 'high' | 'medium' | 'low';
}
```

#### 5c. Form Analytics
```typescript
interface FormAnalytics {
  formName: string;
  pagePath: string;
  views: number;
  starts: number;
  completions: number;
  startRate: number;
  completionRate: number;
  dropoffFields: string[]; // which fields cause abandonment
  avgCompletionTime: number;
  recommendations: string[];
}
```

#### 5d. Content Gap Analysis
```typescript
interface ContentGap {
  searchTerm: string;
  searchVolume: number;
  currentRanking: number | null;
  hasLandingPage: boolean;
  opportunity: string;
  recommendation: string;
}
```

---

### Section 6: 🎨 Creative Performance (LinkedIn Ads)

**Purpose:** Know which creatives work and which are tired

#### 6a. Top Performing Creatives
```typescript
interface CreativePerformance {
  creativeName: string;
  creativeType: 'image' | 'video' | 'carousel' | 'document';
  campaignName: string;
  impressions: number;
  ctr: number;
  conversionRate: number;
  cpl: number;
  status: 'top_performer' | 'good' | 'average';
  insight: string; // AI-generated insight on why it works
}
```

#### 6b. Creative Fatigue Alerts
```typescript
interface CreativeFatigue {
  creativeName: string;
  campaignName: string;
  daysRunning: number;
  ctrPeak: number;
  ctrCurrent: number;
  ctrDecline: number; // percentage
  frequency: number;
  recommendation: 'refresh_urgently' | 'plan_refresh' | 'monitor';
  suggestedRefreshDate: string;
}
```

#### 6c. Creative Recommendations
```typescript
interface CreativeRecommendation {
  type: 'new_format' | 'messaging_test' | 'visual_refresh' | 'audience_specific';
  recommendation: string;
  reasoning: string;
  expectedImpact: string;
  examples: string[];
}
```

---

### Section 7: 🔄 Funnel Analysis

**Purpose:** See where leads drop off

#### 7a. Funnel Stages
```typescript
interface FunnelStage {
  stageName: string;
  count: number;
  conversionToNext: number;
  avgTimeInStage: number; // days
  trend: number; // WoW change
  benchmark: number;
  status: 'healthy' | 'bottleneck' | 'leaking';
}
```

**Stages:**
1. Website Visitor
2. Lead (Form Fill)
3. MQL (Marketing Qualified)
4. SQL (Sales Qualified)
5. Opportunity
6. Closed Won

#### 7b. Funnel Bottlenecks
```typescript
interface FunnelBottleneck {
  fromStage: string;
  toStage: string;
  currentConversion: number;
  expectedConversion: number;
  gap: number;
  leadsLost: number;
  potentialRevenue: number;
  possibleCauses: string[];
  recommendations: string[];
}
```

#### 7c. Funnel Velocity
```typescript
interface FunnelVelocity {
  avgDaysToMQL: number;
  avgDaysToSQL: number;
  avgDaysToClose: number;
  totalCycleTime: number;
  trend: 'faster' | 'slower' | 'stable';
  changeFromLastMonth: number;
}
```

---

### Section 8: 💰 Budget & Spend Analysis

**Purpose:** Know if you're spending wisely

#### 8a. Budget Overview
```typescript
interface BudgetOverview {
  account: string;
  monthlyBudget: number;
  spentToDate: number;
  remainingBudget: number;
  daysRemaining: number;
  dailyPace: number;
  projectedMonthEndSpend: number;
  pacingStatus: 'on_track' | 'underspending' | 'overspending';
  recommendation: string;
}
```

#### 8b. Spend Efficiency
```typescript
interface SpendEfficiency {
  totalSpend: number;
  totalLeads: number;
  totalSQLs: number;
  costPerLead: number;
  costPerSQL: number;
  costPerOpportunity: number;
  roi: number; // if revenue data available
  efficiencyTrend: 'improving' | 'declining' | 'stable';
}
```

#### 8c. Budget Reallocation Suggestions
```typescript
interface BudgetReallocation {
  from: {
    campaign: string;
    currentBudget: number;
    performance: string;
  };
  to: {
    campaign: string;
    currentBudget: number;
    performance: string;
  };
  suggestedAmount: number;
  expectedImpact: string;
  reasoning: string;
}
```

---

### Section 9: 📊 Channel Performance Comparison

**Purpose:** Compare all channels at a glance

#### 9a. Channel Health Cards
```typescript
interface ChannelHealth {
  channel: 'linkedin_ads' | 'google_analytics' | 'hubspot' | 'reddit' | 'organic_social';
  status: 'excellent' | 'good' | 'needs_attention' | 'critical';
  primaryMetric: {
    name: string;
    value: number;
    trend: number;
  };
  secondaryMetrics: [{
    name: string;
    value: number;
    trend: number;
  }];
  aiInsight: string;
  topRecommendation: string;
}
```

#### 9b. Channel Attribution
```typescript
interface ChannelAttribution {
  channel: string;
  firstTouchLeads: number;
  lastTouchLeads: number;
  assistedConversions: number;
  revenueContribution: number;
  costPerAcquisition: number;
}
```

#### 9c. Cross-Channel Insights
```typescript
interface CrossChannelInsight {
  insight: string;
  channels: string[];
  correlation: string;
  recommendation: string;
}
```

**Example:**
> "Reddit posts about [topic] are correlating with 34% increase in branded search traffic. Consider amplifying Reddit content strategy."

---

### Section 10: 🕐 Timing Intelligence

**Purpose:** Know WHEN to run campaigns

#### 10a. Best Performing Times
```typescript
interface TimingInsight {
  dimension: 'day_of_week' | 'hour_of_day' | 'day_of_month';
  data: [{
    period: string;
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number;
    conversionRate: number;
    performance: 'peak' | 'good' | 'average' | 'low';
  }];
  recommendation: string;
}
```

#### 10b. Scheduling Recommendations
```typescript
interface SchedulingRecommendation {
  campaignType: string;
  recommendedDays: string[];
  recommendedHours: string; // e.g., "9 AM - 2 PM"
  avoidTimes: string[];
  reasoning: string;
}
```

---

### Section 11: 📈 Week-over-Week Trends

**Purpose:** Spot momentum and concerning patterns

#### 11a. Trend Summary
```typescript
interface TrendSummary {
  metric: string;
  thisWeek: number;
  lastWeek: number;
  change: number;
  changeType: 'positive' | 'negative' | 'neutral';
  sparklineData: number[]; // 7 data points
  trend: 'accelerating' | 'decelerating' | 'stable' | 'volatile';
}
```

#### 11b. Anomaly Detection
```typescript
interface Anomaly {
  metric: string;
  date: string;
  expectedValue: number;
  actualValue: number;
  deviation: number; // standard deviations
  possibleCauses: string[];
  requiresAction: boolean;
}
```

---

### Section 12: 🎯 Goals & OKR Tracking

**Purpose:** Track progress against targets

#### 12a. Goal Progress
```typescript
interface GoalProgress {
  goalName: string;
  metric: string;
  target: number;
  current: number;
  progressPercentage: number;
  daysRemaining: number;
  projectedEndValue: number;
  willHitTarget: boolean;
  status: 'on_track' | 'at_risk' | 'behind' | 'exceeded';
  recommendation: string;
}
```

#### 12b. OKR Dashboard
```typescript
interface OKRStatus {
  objective: string;
  keyResults: [{
    krName: string;
    target: number;
    current: number;
    progress: number;
    status: 'green' | 'yellow' | 'red';
  }];
  overallHealth: number; // 0-100
}
```

---

### Section 13: 💡 AI Strategic Recommendations

**Purpose:** Claude's prioritized action items

#### 13a. Priority Actions
```typescript
interface PriorityAction {
  priority: 1 | 2 | 3 | 4 | 5;
  title: string;
  description: string;
  category: 'quick_win' | 'strategic' | 'experimental' | 'maintenance';
  reasoning: string;
  expectedImpact: {
    metric: string;
    improvement: string;
  };
  effort: 'low' | 'medium' | 'high';
  timeToImplement: string;
  owner: string; // suggested owner
  steps: string[];
}
```

#### 13b. Opportunities Identified
```typescript
interface Opportunity {
  title: string;
  description: string;
  dataPoints: string[]; // evidence
  potentialImpact: string;
  confidence: 'high' | 'medium' | 'low';
  nextSteps: string[];
}
```

#### 13c. Risks & Warnings
```typescript
interface Risk {
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  likelihood: 'high' | 'medium' | 'low';
  mitigationSteps: string[];
  deadline: string; // when to address by
}
```

---

### Section 14: 🔍 Competitive Intelligence (Optional)

**Purpose:** Market context and competitor signals

#### 14a. Share of Voice
```typescript
interface ShareOfVoice {
  ourMentions: number;
  competitorMentions: [{
    competitor: string;
    mentions: number;
    trend: number;
  }];
  ourShare: number;
  trend: 'growing' | 'shrinking' | 'stable';
}
```

#### 14b. Competitor Alerts
```typescript
interface CompetitorAlert {
  competitor: string;
  alertType: 'new_campaign' | 'pricing_change' | 'product_launch' | 'content_push';
  description: string;
  source: string;
  detectedDate: string;
  suggestedResponse: string;
}
```

---

### Section 15: 📧 Outbound Performance (If Applicable)

**Purpose:** Track email/outbound campaigns

#### 15a. Outbound Metrics
```typescript
interface OutboundMetrics {
  emailsSent: number;
  openRate: number;
  replyRate: number;
  meetingsBooked: number;
  bounceRate: number;
  unsubscribeRate: number;
  trend: {
    metric: string;
    change: number;
  }[];
}
```

#### 15b. Sequence Performance
```typescript
interface SequencePerformance {
  sequenceName: string;
  emailsInSequence: number;
  enrolled: number;
  completed: number;
  replies: number;
  meetings: number;
  bestPerformingEmail: number; // email # in sequence
  dropoffPoint: number;
  recommendation: string;
}
```

---

### Section 16: 📱 Device & Technical Performance

**Purpose:** Ensure technical optimization

#### 16a. Device Performance
```typescript
interface DevicePerformance {
  device: 'desktop' | 'mobile' | 'tablet';
  sessions: number;
  conversionRate: number;
  bounceRate: number;
  avgSessionDuration: number;
  trend: number;
  issues: string[];
}
```

#### 16b. Page Speed Alerts
```typescript
interface PageSpeedAlert {
  page: string;
  loadTime: number;
  benchmark: number;
  impact: string;
  recommendation: string;
}
```

---

## 🤖 Claude Sonnet Integration

### API Configuration
```typescript
const CLAUDE_CONFIG = {
  model: "claude-sonnet-4-20250514",
  max_tokens: 8000,
  temperature: 0.3, // Lower for more consistent analysis
};
```

### Master Prompt for Claude

```markdown
# GTM Intelligence Analyst Prompt

You are an expert GTM (Go-To-Market) analyst for Orion, a marketing intelligence platform. Your job is to analyze marketing data and provide actionable insights that help the team make better decisions.

## Your Persona
- You think like a VP of Marketing who has seen hundreds of campaigns
- You're data-driven but understand the human side of marketing
- You prioritize ruthlessly - not everything is urgent
- You're direct and actionable - no fluff
- You connect dots across channels that others might miss

## Analysis Framework

When analyzing data, always consider:

1. **What's actually moving the needle?**
   - Don't report vanity metrics
   - Focus on leading indicators of revenue

2. **What's the story behind the numbers?**
   - Correlation vs causation
   - Seasonal factors
   - External events

3. **What would I do if this were my money?**
   - Prioritize high-impact, low-effort wins
   - Be honest about what's not working

4. **What am I missing?**
   - Data gaps
   - Alternative explanations
   - Risks I should flag

## Output Format

You will receive structured JSON data and must return a structured JSON response matching the InsightsOutput schema provided.

### Key Rules:
1. **Be specific** - "Reduce US budget by $500" not "Consider budget changes"
2. **Quantify impact** - "Could save $340/week" not "Could save money"
3. **Prioritize** - Mark severity and effort clearly
4. **Be honest** - If data is insufficient, say so
5. **Think cross-channel** - Connect insights across sources

### Severity Thresholds:
- **Critical:** Actively losing money or broken tracking
- **Warning:** Performance declining or below benchmarks
- **Info:** Opportunities or observations

### Benchmark Reference:
- LinkedIn CTR benchmark: 0.4%+
- LinkedIn CPL benchmark: Varies by industry, use provided targets
- Website conversion rate: 2%+
- Form completion rate: 20%+
- MQL to SQL: 25%+
- Bounce rate (good): <50%
- Frequency (healthy): <5

## Context About the Business

{Insert business context here - industry, target audience, goals, etc.}

## Current Targets

{Insert current OKRs/targets here}

---

Now analyze the following data and provide insights:
```

### Input Data Schema
```typescript
interface ClaudeInput {
  dateRange: {
    start: string;
    end: string;
    comparisonStart: string;
    comparisonEnd: string;
  };
  businessContext: {
    industry: string;
    targetAudience: string;
    currentGoals: string[];
    monthlyBudget: number;
    targetCPL: number;
    targetLeads: number;
  };
  linkedInAds: {
    accounts: [{
      accountName: string;
      campaigns: [{
        name: string;
        status: string;
        spend: number;
        impressions: number;
        clicks: number;
        leads: number;
        ctr: number;
        cpl: number;
        frequency: number;
        geoBreakdown: [{
          region: string;
          spend: number;
          leads: number;
          cpl: number;
        }];
        audienceBreakdown: [{
          audience: string;
          spend: number;
          leads: number;
          cpl: number;
        }];
      }];
    }];
    weekOverWeek: {
      spend: { current: number; previous: number };
      leads: { current: number; previous: number };
      cpl: { current: number; previous: number };
    };
  };
  googleAnalytics: {
    totalSessions: number;
    totalUsers: number;
    newUsers: number;
    conversions: number;
    conversionRate: number;
    bounceRate: number;
    avgSessionDuration: number;
    topPages: [{
      path: string;
      sessions: number;
      conversions: number;
      bounceRate: number;
    }];
    trafficSources: [{
      source: string;
      medium: string;
      sessions: number;
      conversions: number;
    }];
    geoData: [{
      country: string;
      sessions: number;
      conversions: number;
    }];
    deviceData: [{
      device: string;
      sessions: number;
      conversionRate: number;
    }];
    weekOverWeek: {
      sessions: { current: number; previous: number };
      conversions: { current: number; previous: number };
    };
  };
  hubspot: {
    newLeads: number;
    mqls: number;
    sqls: number;
    opportunities: number;
    closedWon: number;
    pipelineValue: number;
    leadsBySource: [{
      source: string;
      count: number;
    }];
    conversionRates: {
      leadToMql: number;
      mqlToSql: number;
      sqlToOpp: number;
      oppToClose: number;
    };
    weekOverWeek: {
      leads: { current: number; previous: number };
      mqls: { current: number; previous: number };
      sqls: { current: number; previous: number };
    };
  };
  reddit: {
    posts: [{
      title: string;
      subreddit: string;
      upvotes: number;
      comments: number;
      engagement: number;
    }];
    totalEngagement: number;
    trafficReferred: number;
    leadsFromReddit: number;
    weekOverWeek: {
      engagement: { current: number; previous: number };
    };
  };
  historicalData: {
    last30Days: {
      avgCPL: number;
      avgConversionRate: number;
      avgLeadsPerWeek: number;
    };
    last90Days: {
      avgCPL: number;
      avgConversionRate: number;
      avgLeadsPerWeek: number;
    };
  };
}
```

### Output Schema
```typescript
interface ClaudeOutput {
  generatedAt: string;
  executiveSummary: {
    aiSummary: string;
    gtmHealthScore: number;
    healthScoreReasoning: string;
    sentiment: 'excellent' | 'good' | 'concerning' | 'critical';
    keyHighlights: string[];
    keyLowlights: string[];
  };
  immediateActions: {
    adsToPause: AdAlert[];
    adsToFix: AdAlert[];
    trackingIssues: DataAlert[];
    budgetAlerts: BudgetAlert[];
  };
  geoInsights: {
    regionsToScale: GeoRecommendation[];
    regionsToReduce: GeoWarning[];
    geoSummary: string;
  };
  audienceInsights: {
    topJobTitles: JobTitleInsight[];
    audienceSaturation: AudienceSaturation[];
    audienceSummary: string;
  };
  pageInsights: {
    topPages: PagePerformance[];
    problemPages: PageIssue[];
    formAnalytics: FormAnalytics[];
    pageSummary: string;
  };
  creativeInsights: {
    topCreatives: CreativePerformance[];
    fatigueAlerts: CreativeFatigue[];
    recommendations: CreativeRecommendation[];
    creativeSummary: string;
  };
  funnelInsights: {
    stages: FunnelStage[];
    bottlenecks: FunnelBottleneck[];
    velocity: FunnelVelocity;
    funnelSummary: string;
  };
  budgetInsights: {
    overview: BudgetOverview[];
    efficiency: SpendEfficiency;
    reallocations: BudgetReallocation[];
    budgetSummary: string;
  };
  channelHealth: ChannelHealth[];
  timingInsights: {
    bestDays: TimingInsight;
    bestHours: TimingInsight;
    schedulingRecommendations: SchedulingRecommendation[];
  };
  trends: {
    summary: TrendSummary[];
    anomalies: Anomaly[];
    trendNarrative: string;
  };
  goalTracking: {
    goals: GoalProgress[];
    overallStatus: string;
  };
  strategicRecommendations: {
    priorityActions: PriorityAction[];
    opportunities: Opportunity[];
    risks: Risk[];
    weeklyFocus: string;
  };
  crossChannelInsights: CrossChannelInsight[];
}
```

---

## 🎨 UI/UX Design Guidelines

### Layout Structure
```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER: "Daily GTM Insights" + Date + Last Updated            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │           EXECUTIVE SUMMARY (Hero Section)               │   │
│  │  AI Summary + Health Score + 4 Key Metrics               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────┐  ┌──────────────────────┐            │
│  │  🚨 IMMEDIATE        │  │  💡 TOP 3 PRIORITIES │            │
│  │  ACTIONS             │  │                      │            │
│  │  (Collapsible)       │  │                      │            │
│  └──────────────────────┘  └──────────────────────┘            │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              CHANNEL HEALTH CARDS (4 cards)              │   │
│  │  [LinkedIn] [Website] [HubSpot] [Reddit]                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  TAB NAVIGATION:                                                │
│  [Geo] [Audience] [Pages] [Creative] [Funnel] [Budget] [Goals] │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              TAB CONTENT AREA                            │   │
│  │              (Changes based on selected tab)             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              TRENDS & ANOMALIES                          │   │
│  │              (Sparklines + Alerts)                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Color Coding
```css
:root {
  /* Status Colors */
  --status-excellent: #10B981; /* Green */
  --status-good: #3B82F6;      /* Blue */
  --status-warning: #F59E0B;   /* Amber */
  --status-critical: #EF4444;  /* Red */
  
  /* Trend Colors */
  --trend-up-good: #10B981;    /* Green (when up is good) */
  --trend-up-bad: #EF4444;     /* Red (when up is bad, like CPL) */
  --trend-down-good: #10B981;  /* Green (when down is good, like CPL) */
  --trend-down-bad: #EF4444;   /* Red (when down is bad) */
  --trend-neutral: #6B7280;    /* Gray */
  
  /* Card Backgrounds */
  --card-excellent: #ECFDF5;
  --card-warning: #FFFBEB;
  --card-critical: #FEF2F2;
}
```

### Component Library
- Use **Tremor** or **shadcn/ui** for dashboard components
- Use **Recharts** for charts and sparklines
- Use **Framer Motion** for subtle animations
- Use **React Query** for data fetching

### Responsive Design
- Desktop: Full layout as shown
- Tablet: Stack cards, maintain tabs
- Mobile: Accordion sections, simplified metrics

---

## 🔧 Implementation Checklist

### Phase 1: Data Layer
- [ ] Set up LinkedIn Ads API connection
- [ ] Set up GA4 API connection
- [ ] Set up HubSpot API connection
- [ ] Set up Reddit API connection
- [ ] Create data aggregation functions
- [ ] Build week-over-week comparison logic
- [ ] Create benchmark calculation functions

### Phase 2: AI Integration
- [ ] Set up Claude API connection
- [ ] Create master analysis prompt
- [ ] Build input data transformer
- [ ] Create output parser and validator
- [ ] Set up error handling for API failures
- [ ] Implement caching for insights

### Phase 3: Cron Job
- [ ] Set up GitHub Actions / Vercel Cron
- [ ] Configure 9 AM PKT schedule
- [ ] Add retry logic for failures
- [ ] Set up Slack notifications for errors
- [ ] Create manual trigger option

### Phase 4: Frontend
- [ ] Build Executive Summary component
- [ ] Build Immediate Actions component
- [ ] Build Channel Health cards
- [ ] Build Tab navigation system
- [ ] Build Geo insights tab
- [ ] Build Audience insights tab
- [ ] Build Pages insights tab
- [ ] Build Creative insights tab
- [ ] Build Funnel insights tab
- [ ] Build Budget insights tab
- [ ] Build Goals tab
- [ ] Build Trends section
- [ ] Add loading states
- [ ] Add error states
- [ ] Implement responsive design

### Phase 5: Polish
- [ ] Add animations
- [ ] Optimize performance
- [ ] Add print/export functionality
- [ ] Add historical insights view
- [ ] Add Slack integration for daily summary
- [ ] Add email digest option

---

## 📝 Notes for Cursor

1. **Start with the data layer** - Get all APIs connected and returning data before touching UI

2. **Build the Claude prompt iteratively** - Test with real data and refine based on output quality

3. **Keep components modular** - Each section should be its own component for maintainability

4. **Cache aggressively** - Insights only update daily, so cache everything

5. **Handle edge cases** - What if an API is down? What if there's no data for a period?

6. **Make it fast** - Use React Query for caching, skeleton loaders, optimistic updates

7. **Think about state** - Consider Zustand or React Context for sharing insights across tabs

---

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install @anthropic-ai/sdk recharts tremor @tanstack/react-query

# Environment variables needed
ANTHROPIC_API_KEY=
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
GA4_PROPERTY_ID=
GA4_CREDENTIALS=
HUBSPOT_API_KEY=
REDDIT_CLIENT_ID=
REDDIT_CLIENT_SECRET=
```

---

Built for Orion GTM Dashboard | Vettio Marketing Team
```
