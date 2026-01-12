/**
 * Agent 2: Insight Generator
 * Analyzes data and generates insights using Claude API with Sonnet 4.5 model
 * Uses Sonnet for complex analysis, reasoning, and anomaly detection
 */

import Anthropic from "@anthropic-ai/sdk";
import { trackClaudeTokens } from "@/lib/usage-tracker";
import { knowledgeBase } from "@/lib/knowledgeBase";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

export interface InsightGeneratorInput {
  rawData: any;
  dateRange: { start: string; end: string };
  connectors: string[];
}

export interface InsightGeneratorOutput {
  insights: {
    summary: string;
    keyFindings: Array<{
      finding: string;
      impact: string;
      priority: 'critical' | 'high' | 'medium';
    }>;
    criticalIssues: Array<{
      issue: string;
      impact: string;
      recommendation: string;
      priority: 'critical' | 'high' | 'medium';
    }>;
    recommendations: Array<{
      action: string;
      timeframe: 'immediate' | 'short-term' | 'medium-term';
      priority: 'critical' | 'high' | 'medium';
    }>;
  };
  tokensUsed: number;
}

export async function insightGenerator(
  input: InsightGeneratorInput
): Promise<InsightGeneratorOutput> {
  const benchmarks = knowledgeBase.orion.benchmarks;
  const historical = knowledgeBase.orion.historical_metrics.baseline;
  const criticalIssues = knowledgeBase.orion.critical_issues;

  const systemPrompt = `You are the Insight Generator Agent for Orion Reports.

Your job: Analyze data and surface actionable insights using benchmarks and historical context.

Context:
- Company: Orion (white-label VPN platform)
- Target segments: ISPs, telcos, security companies, MSPs
- Current situation: Growth stage, focusing on top-of-funnel optimization

Benchmarks (targets):
- Visitor-to-contact: ${benchmarks?.visitor_to_contact || 0.03} (3%)
- CTR target: ${benchmarks?.ctr_target || 0.01} (1.0%)
- CAC: $${(benchmarks?.cac || 0).toLocaleString()}
- LTV: $${(benchmarks?.ltv || 0).toLocaleString()}
- Engagement rate target: ${((benchmarks?.engagement_rate_target || 0.70) * 100).toFixed(0)}%
- Bounce rate target: ${((benchmarks?.bounce_rate_target || 0.40) * 100).toFixed(0)}%
- Pages per session target: ${benchmarks?.pages_per_session_target || 3.0}

Historical Baseline:
- Users: ${(historical?.users || 0).toLocaleString()}
- Pipeline: $${(historical?.pipeline || 0).toLocaleString()}
- CTR: ${((historical?.ctr || 0) * 100).toFixed(2)}%
- Engagement rate: ${((historical?.engagement_rate || 0) * 100).toFixed(0)}%
- Bounce rate: ${((historical?.bounce_rate || 0) * 100).toFixed(0)}%
- Pages per session: ${historical?.pages_per_session || 0}

Analysis Framework:
1. Compare each metric vs benchmark/historical baseline
2. Flag anomalies (>15% variance from target or historical)
3. Identify root causes for significant gaps
4. Prioritize critical issues (high impact + easy fix)
5. Create specific, actionable recommendations

For each insight, include:
- Finding: What changed or what's the issue
- Impact: Quantified impact (e.g., "470 lost leads/year", "57% below target")
- Priority: critical, high, or medium
- Recommendation: Specific action item (for critical issues)
- Timeframe: immediate (7 days), short-term (30 days), medium-term (90 days)

Return ONLY valid JSON with this exact structure (no markdown, no code blocks):
{
  "summary": "Brief 2-3 sentence overview of the period",
  "keyFindings": [
    {
      "finding": "Description of what changed",
      "impact": "Quantified impact",
      "priority": "critical|high|medium"
    }
  ],
  "criticalIssues": [
    {
      "issue": "Issue description",
      "impact": "Quantified impact",
      "recommendation": "Specific action",
      "priority": "critical|high|medium"
    }
  ],
  "recommendations": [
    {
      "action": "Specific action item",
      "timeframe": "immediate|short-term|medium-term",
      "priority": "critical|high|medium"
    }
  ]
}`;

  const userPrompt = `Analyze the following data for the period ${input.dateRange.start} to ${input.dateRange.end}:

Connectors used: ${input.connectors.join(', ')}

Data:
${JSON.stringify(input.rawData, null, 2)}

Generate insights, identify critical issues, and provide actionable recommendations.
Compare metrics against benchmarks and historical baseline.
Flag any anomalies (>15% variance).
Return ONLY the JSON object, no markdown, no code blocks, no explanations.`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929", // Sonnet 4.5 for complex analysis (cost-optimized for reasoning)
      max_tokens: 2048,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const tokensUsed = response.usage.input_tokens + response.usage.output_tokens;
    
    // Track tokens
    trackClaudeTokens(response.usage.input_tokens, response.usage.output_tokens);

    // Parse JSON from response
    let insights;
    try {
      // Try to extract JSON if wrapped in markdown code blocks
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
      const jsonText = jsonMatch ? jsonMatch[1] : text;
      
      // Remove any leading/trailing whitespace and try to parse
      const cleanedText = jsonText.trim();
      insights = JSON.parse(cleanedText);
    } catch (parseError) {
      // If JSON parsing fails, create a structured fallback
      console.error("Failed to parse insights JSON:", parseError);
      console.error("Response text:", text.substring(0, 500));
      
      insights = {
        summary: text.substring(0, 300) || "Analysis completed for the selected period",
        keyFindings: [],
        criticalIssues: [],
        recommendations: [],
      };
    }

    // Ensure structure matches expected format
    if (!insights.keyFindings) insights.keyFindings = [];
    if (!insights.criticalIssues) insights.criticalIssues = [];
    if (!insights.recommendations) insights.recommendations = [];
    if (!insights.summary) insights.summary = "Analysis completed";

    return {
      insights: insights || {
        summary: "Analysis completed for the selected period",
        keyFindings: [],
        criticalIssues: [],
        recommendations: [],
      },
      tokensUsed: tokensUsed || 0,
    };
  } catch (error: any) {
    console.error("Insight Generator error:", error);
    throw new Error(`Insight generation failed: ${error.message}`);
  }
}
