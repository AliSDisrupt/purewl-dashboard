"use client";

import { Badge } from "@/components/ui/badge";

interface ReportViewerHeaderProps {
  metadata: {
    generatedAt?: string;
    agentTokens?: number;
    executionTime?: number;
    connectors?: string[];
    dateRange?: { start: string; end: string };
    breakdown?: {
      dataFetchTime?: number;
      insightGenerationTime?: number;
      reportFormattingTime?: number;
      totalTime?: number;
    };
  };
}

const CONNECTOR_LABELS: Record<string, string> = {
  ga4: "GA4",
  hubspot: "HubSpot",
  linkedin: "LinkedIn",
  reddit: "Reddit",
};

export function ReportViewerHeader({ metadata }: ReportViewerHeaderProps) {
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  const endDateFormatted = metadata.dateRange?.end ? formatDate(metadata.dateRange.end) : 'N/A';

  return (
    <div className="bg-gradient-to-r from-primary/20 to-purple-600/20 border-b border-border px-6 py-4 sticky top-0 z-10 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-foreground">Full Funnel Performance Report</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Week Ending {endDateFormatted}
            {' • '}
            Period: {metadata.dateRange?.start || 'N/A'} to {metadata.dateRange?.end || 'N/A'}
            {' • '}
            Generated: {metadata.generatedAt ? new Date(metadata.generatedAt).toLocaleString() : 'N/A'}
          </p>
          <div className="flex gap-2 mt-3">
            {(metadata.connectors || []).map((connector) => (
              <Badge key={connector} variant="secondary" className="text-xs">
                {CONNECTOR_LABELS[connector] || connector.toUpperCase()}
              </Badge>
            ))}
          </div>
        </div>
        <div className="text-right text-xs text-muted-foreground ml-4">
          <p>Tokens: {(metadata.agentTokens || 0).toLocaleString()}</p>
          <p>Time: {metadata.executionTime || 0}s</p>
          {metadata.breakdown && (
            <>
              <p className="text-[10px] mt-1">
                Data: {metadata.breakdown.dataFetchTime || 0}s
                {' • '}Insights: {metadata.breakdown.insightGenerationTime || 0}s
                {' • '}Format: {metadata.breakdown.reportFormattingTime || 0}s
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
