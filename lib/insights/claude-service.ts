/**
 * Orion Daily GTM Insights - Claude Sonnet service.
 * Calls Claude API with aggregated data and returns structured insights.
 */

import Anthropic from "@anthropic-ai/sdk";
import type { InsightsClaudeInput } from "./types";
import type { InsightsClaudeOutput } from "./output-types";

const CLAUDE_CONFIG = {
  model: "claude-sonnet-4-20250514",
  maxTokens: 8000,
  temperature: 0.3,
};

function buildMasterPrompt(businessContext: InsightsClaudeInput["businessContext"]): string {
  return `# GTM Intelligence Analyst Prompt

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

### Data Sources (current run)
- **Google Analytics (GA4)**: Website traffic, sessions, conversions, top pages, geography, traffic sources
- **HubSpot**: Leads, MQLs, SQLs, opportunities, pipeline value, conversion rates
- **RB2B**: Identified visitors, top companies by page views
- **Windsor AI Ads** (if present): Aggregated ads performance from Google Ads, Reddit Ads, and LinkedIn Ads including impressions, clicks, spend, conversions, CTR, CPC, and week-over-week comparisons

### Benchmark Reference:
- Website conversion rate: 2%+
- Form completion rate: 20%+
- MQL to SQL: 25%+
- Bounce rate (good): <50%
- GA4: focus on sessions, conversions, top pages, geography, and week-over-week changes.
- HubSpot: focus on leads, MQLs, SQLs, pipeline, and stage velocity.
- RB2B: focus on identified visitors, top companies by page views, and engagement trends.

## Context About the Business

Industry: ${businessContext.industry}
Target Audience: ${businessContext.targetAudience}
Current Goals: ${businessContext.currentGoals.join(", ")}
Monthly Budget: $${businessContext.monthlyBudget.toLocaleString()}
Target CPL: $${businessContext.targetCPL}
Target Leads: ${businessContext.targetLeads}

## Current Targets

Monthly Budget: $${businessContext.monthlyBudget.toLocaleString()}
Target CPL: $${businessContext.targetCPL}
Target Leads: ${businessContext.targetLeads}

---

## REQUIRED: Populate every section from the input data

You MUST derive and fill every section below. Do not leave geo, audience, pages, funnel, or strategic sections empty.

### geoInsights (from googleAnalytics.geoData and traffic)
- Use googleAnalytics.geoData (country, sessions, conversions) to build regionsToScale: top countries by sessions or conversion rate; include country, leads (or sessions), cpl (or 0), recommendation (e.g. scale_moderate), reasoning.
- regionsToReduce: countries with low sessions/conversions or high bounce; include country, issue, potentialSavings (estimate), reasoning.
- Always write a 2–4 sentence geoSummary summarizing where traffic and conversions come from and what to scale or reduce.

### audienceInsights (from rb2b.topCompanies + GA4/HubSpot)
- Use rb2b.topCompanies as audience signals: map companyName to jobTitle or segment (e.g. "Visitors from [Company]" or "B2B decision makers"). If no RB2B data, use topJobTitles with 2–3 segments like "Marketing leaders", "Sales" based on targetAudience.
- Always write audienceSummary (2–4 sentences) on who is engaging and any audience opportunities.

### pageInsights (from googleAnalytics.topPages)
- Map googleAnalytics.topPages to pageInsights.topPages: pagePath, pageTitle (use path or last segment), sessions, conversions, conversionRate, bounceRate, status (top_performer/stable/declining).
- problemPages: pick pages with high bounceRate or low conversion; include pagePath, pageTitle, issue (e.g. high_bounce, low_conversion), potentialImpact, recommendations[].
- Always write pageSummary (2–4 sentences).

### funnelInsights (from hubspot)
- Map hubspot to stages: e.g. stages = [ { stageName: "Leads", count: hubspot.newLeads }, { stageName: "MQL", count: hubspot.mqls }, { stageName: "SQL", count: hubspot.sqls }, { stageName: "Opportunity", count: hubspot.opportunities }, { stageName: "Closed Won", count: hubspot.closedWon } ] with conversionToNext from hubspot.conversionRates.
- bottlenecks: where conversion drops (e.g. MQL→SQL); include fromStage, toStage, leadsLost, potentialRevenue (estimate).
- Always write funnelSummary (2–4 sentences).

### adsInsights (REQUIRED if windsorAi data is present)
- Analyze windsorAi data to provide comprehensive ads performance insights:
  - platformPerformance: Create an entry for each platform (googleAds, redditAds, linkedInAds) with:
    - All metrics: impressions, clicks, spend, conversions, CTR, CPC, conversionRate (conversions/clicks), CPA (spend/conversions)
    - performance status: "excellent" (CTR > 1%, CPA below target), "good" (CTR 0.5-1%, reasonable CPA), "needs_attention" (CTR < 0.5% or high CPA), "poor" (very low CTR or very high CPA)
    - weekOverWeek: Include current, previous, and change % for all metrics
    - insights: 2-3 specific observations about this platform's performance
    - recommendations: 2-3 actionable recommendations for this platform
  - topPerformingPlatform: Which platform has best CTR or lowest CPA
  - underperformingPlatform: Which platform needs most attention
  - Calculate totals: totalSpend, totalConversions, averageCtr, averageCpc, averageCpa across all platforms
  - efficiencyTrend: Compare current vs previous week totals to determine if improving/declining/stable
  - keyFindings: 3-5 high-level insights about overall ads performance
  - actionableRecommendations: 3-5 specific actions to improve ads performance
  - adsSummary: 3-4 sentence summary of ads performance, trends, and priorities

### strategicRecommendations (REQUIRED – always provide)
- priorityActions: at least 2–3 concrete next steps (title, description, priority 1–3, effort, category, reasoning, steps[], expectedImpact). Base on data and GTM best practices. **Include ads-related actions if adsInsights are available.**
- opportunities: at least 2–3 items. Suggest opportunities from the data (e.g. "Scale top GA4 pages", "Double down on top RB2B companies", "Increase budget for top-performing ad platform") AND from general GTM/industry best practices (e.g. "Test lead magnets for top job titles", "Improve MQL→SQL handoff"). Include title, description, potentialImpact, confidence (high/medium/low).
- risks: at least 2–3 items. Infer from data (e.g. "Pipeline concentration", "Bounce rate on key pages", "Declining ad performance") AND common risks (e.g. "Seasonality", "Competitive pressure", "Budget pacing"). Include title, description, severity (high/medium/low), mitigationSteps[], deadline if relevant.
- weeklyFocus: one short paragraph (2–3 sentences) on the single most important focus for the week. **Consider ads performance if adsInsights are available.**

### trends (REQUIRED – build from input weekOverWeek)
- You MUST populate trends.summary from the input's week-over-week data. For each source use the exact current/previous values provided:
  - From googleAnalytics.weekOverWeek: add one entry for "Sessions (GA4)" (sessions.current, sessions.previous) and one for "Conversions (GA4)" (conversions.current, conversions.previous). Compute change as percent: previous ? ((current - previous) / previous) * 100 : 0. Set changeType: "positive" when higher is better (sessions, conversions) and current > previous, else "negative"; use "neutral" when change is 0.
  - From hubspot.weekOverWeek: add "Leads (HubSpot)", "MQLs (HubSpot)", "SQLs (HubSpot)" using leads.current/previous, mqls.current/previous, sqls.current/previous. Same change and changeType logic.
  - From rb2b.weekOverWeek (if present): add "Identified visitors (RB2B)" and "Page views (RB2B)" using visitors.current/previous, pageViews.current/previous.
  - From windsorAi.weekOverWeek (if present): add "Ad Impressions (Windsor AI)", "Ad Clicks (Windsor AI)", "Ad Spend (Windsor AI)", "Ad Conversions (Windsor AI)", "CTR (Windsor AI)", "CPC (Windsor AI)" using impressions.current/previous, clicks.current/previous, spend.current/previous, conversions.current/previous, ctr.current/previous, cpc.current/previous. For CTR and CPC, lower CPC is better (negative change is positive), higher CTR is better (positive change is positive).
- Each trends.summary item must have: metric (string), thisWeek (number), lastWeek (number), change (number, percent), changeType ("positive"|"negative"|"neutral"), sparklineData (array of 7 numbers, e.g. [current week daily values] or [lastWeek, ..., thisWeek] if you have no daily breakdown—otherwise use [previous, previous, previous, previous, previous, previous, current] as placeholder), trend ("stable"|"accelerating"|"decelerating"|"volatile").
- Always write trends.trendNarrative: 2–4 sentences summarizing week-over-week movement (what went up, what went down, and what it means).
- trends.anomalies: optional array; include if you spot unusual deviations.

You do not have access to live web search; base opportunities and risks on the provided data and your GTM/industry knowledge.

---

Now analyze the following data and provide insights. Return ONLY valid JSON matching the InsightsOutput schema. Do not include markdown code blocks or any text outside the JSON.`;
}

/**
 * Generate insights from aggregated GTM data using Claude Sonnet.
 */
export async function generateInsights(input: InsightsClaudeInput): Promise<InsightsClaudeOutput> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }
  if (!apiKey.startsWith("sk-ant-")) {
    throw new Error("ANTHROPIC_API_KEY appears invalid");
  }

  const anthropic = new Anthropic({ apiKey });

  const prompt = buildMasterPrompt(input.businessContext);
  const inputJson = JSON.stringify(input, null, 2);

  const systemPrompt = `You are a GTM analyst. Analyze the provided marketing data and return ONLY valid JSON matching the InsightsOutput schema. The JSON must include all required fields. Do not include markdown code blocks, explanations, or any text outside the JSON object.`;

  try {
    const message = await anthropic.messages.create({
      model: CLAUDE_CONFIG.model,
      max_tokens: CLAUDE_CONFIG.maxTokens,
      temperature: CLAUDE_CONFIG.temperature,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `${prompt}\n\n## Input Data\n\n\`\`\`json\n${inputJson}\n\`\`\`\n\n## Output Schema Reference\n\nReturn a JSON object with this structure. Populate ALL sections from the input; do not leave geo, audience, pages, funnel, or strategic sections empty.\n- generatedAt: ISO timestamp\n- executiveSummary: { aiSummary, gtmHealthScore (0-100), healthScoreReasoning, sentiment, keyHighlights[], keyLowlights[] }\n- immediateActions: { adsToPause[], adsToFix[], trackingIssues[], budgetAlerts[] }\n- geoInsights: { regionsToScale[], regionsToReduce[], geoSummary }  // derive from googleAnalytics.geoData\n- audienceInsights: { topJobTitles[], audienceSaturation[], audienceSummary }  // derive from rb2b.topCompanies + business context\n- pageInsights: { topPages[], problemPages[], formAnalytics[], pageSummary }  // derive from googleAnalytics.topPages\n- creativeInsights: { topCreatives[], fatigueAlerts[], recommendations[], creativeSummary }\n- funnelInsights: { stages[], bottlenecks[], velocity {}, funnelSummary }  // derive from hubspot\n- budgetInsights: { overview[], efficiency {}, reallocations[], budgetSummary }\n- channelHealth: []\n- timingInsights: { bestDays {}, bestHours {}, schedulingRecommendations[] }\n- trends: { summary[] (metric, thisWeek, lastWeek, change %, changeType, sparklineData[7], trend), anomalies[], trendNarrative }  // REQUIRED: build summary from googleAnalytics/hubspot/rb2b/windsorAi weekOverWeek\n- goalTracking: { goals[], overallStatus }\n- strategicRecommendations: { priorityActions[] (min 2), opportunities[] (min 2, from data + best practices), risks[] (min 2, from data + common risks), weeklyFocus }\n- crossChannelInsights: []\n- adsInsights: { platformPerformance[] (one per platform: googleAds, redditAds, linkedInAds with impressions, clicks, spend, conversions, ctr, cpc, conversionRate, cpa, performance, weekOverWeek, insights[], recommendations[]), topPerformingPlatform, underperformingPlatform, totalSpend, totalConversions, averageCtr, averageCpc, averageCpa, efficiencyTrend, keyFindings[], actionableRecommendations[], adsSummary }  // REQUIRED if windsorAi data present\n\nReturn ONLY the JSON object, no markdown formatting.`,
        },
      ],
    });

    const textContent = message.content.find((c) => c.type === "text")?.text;
    if (!textContent) {
      throw new Error("Claude returned no text content");
    }

    // Extract JSON from response (handle markdown code blocks if present)
    let jsonText = textContent.trim();
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    const parsed = JSON.parse(jsonText) as InsightsClaudeOutput;
    parsed.generatedAt = new Date().toISOString();

    return parsed;
  } catch (error: any) {
    if (error instanceof SyntaxError) {
      throw new Error(`Failed to parse Claude response as JSON: ${error.message}`);
    }
    throw new Error(`Claude API error: ${error.message || String(error)}`);
  }
}
