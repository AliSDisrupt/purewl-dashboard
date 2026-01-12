/**
 * Orchestrator: Coordinates all 3 agents
 * Agent 1 → Agent 2 → Agent 3
 */

import { dataAggregator } from "./dataAggregator";
import { insightGenerator } from "./insightGenerator";
import { reportFormatter } from "./reportFormatter";

export interface OrchestratorInput {
  dateRange: { start: string; end: string };
  connectors: string[];
  reportId: string;
}

export interface OrchestratorResult {
  markdown: string;
  tokensUsed: number;
  connectors: string[];
  metadata: {
    dataFetchTime: number;
    insightGenerationTime: number;
    reportFormattingTime: number;
    totalTime: number;
  };
}

export async function orchestrator(
  inputs: OrchestratorInput
): Promise<OrchestratorResult> {
  const startTime = Date.now();
  let totalTokens = 0;
  let dataFetchTime = 0;
  let insightGenerationTime = 0;
  let reportFormattingTime = 0;

  try {
    // Step 1: Data Aggregator Agent
    console.log(`[Orchestrator] Starting Data Aggregator Agent...`);
    const dataStartTime = Date.now();
    const rawData = await dataAggregator({
      dateRange: inputs.dateRange,
      connectors: inputs.connectors,
    });
    dataFetchTime = Date.now() - dataStartTime;
    console.log(`[Orchestrator] Data Aggregator completed in ${dataFetchTime}ms`);
    console.log(`[Orchestrator] Data keys:`, Object.keys(rawData.data || {}));
    console.log(`[Orchestrator] Completeness:`, rawData.metadata.completeness);

    // Step 2: Insight Generator Agent (uses raw data + knowledge base)
    console.log(`[Orchestrator] Starting Insight Generator Agent...`);
    const insightStartTime = Date.now();
    const insights = await insightGenerator({
      rawData: rawData.data,
      dateRange: inputs.dateRange,
      connectors: inputs.connectors,
    });
    insightGenerationTime = Date.now() - insightStartTime;
    totalTokens += insights.tokensUsed || 0;
    console.log(`[Orchestrator] Insight Generator completed in ${insightGenerationTime}ms`);
    console.log(`[Orchestrator] Tokens used: ${insights.tokensUsed}`);
    console.log(`[Orchestrator] Insights summary:`, insights.insights?.summary?.substring(0, 100));
    console.log(`[Orchestrator] Critical issues:`, insights.insights?.criticalIssues?.length || 0);

    // Step 3: Report Formatter Agent (uses insights + template)
    console.log(`[Orchestrator] Starting Report Formatter Agent...`);
    const formatStartTime = Date.now();
    const report = await reportFormatter({
      insights: insights.insights,
      rawData: rawData.data,
      dateRange: inputs.dateRange,
      connectors: inputs.connectors,
    });
    reportFormattingTime = Date.now() - formatStartTime;
    totalTokens += report.tokensUsed || 0;
    console.log(`[Orchestrator] Report Formatter completed in ${formatStartTime}ms`);
    console.log(`[Orchestrator] Tokens used: ${report.tokensUsed}`);
    console.log(`[Orchestrator] Report length:`, report.markdown?.length || 0);

    const totalTime = Date.now() - startTime;

    console.log(`[Orchestrator] Report generation complete!`);
    console.log(`[Orchestrator] Total time: ${totalTime}ms`);
    console.log(`[Orchestrator] Total tokens: ${totalTokens}`);

    return {
      markdown: report.markdown || '# Report\n\nNo content generated.',
      tokensUsed: totalTokens || 0,
      connectors: inputs.connectors || [],
      metadata: {
        dataFetchTime: Math.round(dataFetchTime / 1000) || 0,
        insightGenerationTime: Math.round(insightGenerationTime / 1000) || 0,
        reportFormattingTime: Math.round(reportFormattingTime / 1000) || 0,
        totalTime: Math.round(totalTime / 1000) || 0,
      },
    };
  } catch (error: any) {
    console.error("[Orchestrator] Error:", error);
    throw new Error(`Report generation failed: ${error.message}`);
  }
}
