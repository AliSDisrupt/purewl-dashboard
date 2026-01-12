import { NextResponse } from "next/server";
import { orchestrator } from "@/lib/agents/orchestrator";
import { trackRequest } from "@/lib/usage-tracker";

export async function POST(request: Request) {
  try {
    const { startDate, endDate, connectors } = await request.json();

    // Validation
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "startDate and endDate are required" },
        { status: 400 }
      );
    }

    if (!connectors || !Array.isArray(connectors) || connectors.length === 0) {
      return NextResponse.json(
        { error: "At least one connector must be selected" },
        { status: 400 }
      );
    }

    // Validate connectors
    const validConnectors = ['ga4', 'hubspot', 'linkedin', 'reddit'];
    const invalidConnectors = connectors.filter((c: string) => !validConnectors.includes(c));
    if (invalidConnectors.length > 0) {
      return NextResponse.json(
        { error: `Invalid connectors: ${invalidConnectors.join(', ')}` },
        { status: 400 }
      );
    }

    const reportId = `report-${Date.now()}`;
    const startTime = Date.now();

    // Track API usage
    trackRequest('reports');

    console.log(`[Reports API] Generating report ${reportId}`);
    console.log(`[Reports API] Date range: ${startDate} to ${endDate}`);
    console.log(`[Reports API] Connectors: ${connectors.join(', ')}`);

    // Run orchestrator with all 3 agents
    let result;
    try {
      result = await orchestrator({
        dateRange: { start: startDate, end: endDate },
        connectors,
        reportId,
      });
    } catch (orchestratorError: any) {
      console.error("[Reports API] Orchestrator error:", orchestratorError);
      throw new Error(`Orchestrator failed: ${orchestratorError.message || orchestratorError.toString()}`);
    }

    const executionTime = Math.round((Date.now() - startTime) / 1000);

    console.log(`[Reports API] Report ${reportId} generated successfully in ${executionTime}s`);
    console.log(`[Reports API] Total tokens used: ${result?.tokensUsed || 0}`);
    console.log(`[Reports API] Result structure:`, {
      hasMarkdown: !!result?.markdown,
      markdownLength: result?.markdown?.length || 0,
      tokensUsed: result?.tokensUsed,
      connectors: result?.connectors,
      metadata: result?.metadata,
    });

    // Validate result structure
    if (!result) {
      throw new Error("Orchestrator returned no result");
    }

    return NextResponse.json({
      reportId,
      markdown: result.markdown || '# Full Funnel Performance Report\n\nReport generation completed but no content was produced.',
      metadata: {
        generatedAt: new Date().toISOString(),
        agentTokens: result.tokensUsed || 0,
        executionTime: executionTime || 0,
        connectors: result.connectors || connectors,
        dateRange: { start: startDate, end: endDate },
        breakdown: result.metadata || {
          dataFetchTime: 0,
          insightGenerationTime: 0,
          reportFormattingTime: 0,
          totalTime: executionTime || 0,
        },
      },
    });
  } catch (error: any) {
    console.error("[Reports API] Error generating report:", error);
    return NextResponse.json(
      { 
        error: error.message || "Failed to generate report",
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
