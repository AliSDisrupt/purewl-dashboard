/**
 * Orion Daily GTM Insights - Generator orchestrator.
 * Combines data aggregation (Phase 1) with Claude analysis (Phase 2).
 */

import { aggregateInsightsData } from "./aggregate";
import { generateInsights } from "./claude-service";
import type { InsightsClaudeInput } from "./types";
import type { InsightsClaudeOutput } from "./output-types";

/**
 * Generate complete insights: aggregate data + Claude analysis.
 * This is the main entry point for generating daily insights.
 * 
 * Note: This does NOT save to storage. Use saveInsights() separately
 * or call the /api/insights/generate route which handles saving.
 */
export async function generateDailyInsights(options?: { asOf?: Date }): Promise<{
  input: InsightsClaudeInput;
  output: InsightsClaudeOutput;
}> {
  // Phase 1: Aggregate data from all sources
  const input = await aggregateInsightsData(options);

  // Phase 2: Send to Claude for analysis
  const output = await generateInsights(input);

  return { input, output };
}
