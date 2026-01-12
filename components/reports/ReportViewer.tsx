"use client";

import { ReportViewerHeader } from "./ReportViewerHeader";
import { ReportViewerContent } from "./ReportViewerContent";
import { ReportViewerActions } from "./ReportViewerActions";

interface ReportViewerProps {
  markdown: string;
  metadata: {
    generatedAt: string;
    agentTokens: number;
    executionTime: number;
    connectors: string[];
    dateRange: { start: string; end: string };
    breakdown?: {
      dataFetchTime: number;
      insightGenerationTime: number;
      reportFormattingTime: number;
      totalTime: number;
    };
  };
  reportId: string;
}

export function ReportViewer({ markdown, metadata, reportId }: ReportViewerProps) {
  return (
    <div className="bg-background/50 border border-border rounded-xl overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 250px)', minHeight: '600px' }}>
      {/* Header */}
      <ReportViewerHeader metadata={metadata} />

      {/* Report Content - Professional Viewer */}
      <ReportViewerContent markdown={markdown} />

      {/* Action Buttons - Including PDF Download */}
      <ReportViewerActions markdown={markdown} reportId={reportId} />
    </div>
  );
}
