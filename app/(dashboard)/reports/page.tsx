"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Calendar,
  Database
} from "lucide-react";
import { ReportViewer } from "@/components/reports/ReportViewer";

const CONNECTORS = [
  { id: 'ga4', name: 'Google Analytics 4', icon: '📊', description: 'Traffic and engagement metrics' },
  { id: 'hubspot', name: 'HubSpot CRM', icon: '👥', description: 'Pipeline and deals data' },
  { id: 'linkedin', name: 'LinkedIn Ads', icon: '💼', description: 'Campaign performance metrics' },
  { id: 'reddit', name: 'Reddit', icon: '🔴', description: 'Community mentions and engagement' },
  { id: 'windsor-ai', name: 'Windsor AI Ads', icon: '🔗', description: 'Google Ads, Reddit Ads, LinkedIn Ads performance' },
];

export default function ReportsPage() {
  // Date range state
  const [startDate, setStartDate] = useState<string>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Connector selection
  const [selectedConnectors, setSelectedConnectors] = useState<string[]>(['ga4', 'hubspot', 'linkedin']);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<{
    agent: 'data' | 'insights' | 'format' | null;
    status: string;
    percentage: number;
  }>({ agent: null, status: '', percentage: 0 });

  // Report state
  const [report, setReport] = useState<{
    reportId: string;
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
  } | null>(null);

  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (selectedConnectors.length === 0) {
      setError("Please select at least one data source");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setReport(null);
    setProgress({ agent: 'data', status: 'Fetching data from selected sources...', percentage: 10 });

    try {
      // Simulate progress updates (actual progress will come from agents)
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev.agent === 'data' && prev.percentage < 40) {
            return { ...prev, percentage: Math.min(prev.percentage + 5, 40) };
          } else if (prev.agent === 'insights' && prev.percentage < 70) {
            return { ...prev, percentage: Math.min(prev.percentage + 5, 70) };
          } else if (prev.agent === 'format' && prev.percentage < 95) {
            return { ...prev, percentage: Math.min(prev.percentage + 5, 95) };
          }
          return prev;
        });
      }, 1000);

      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate,
          endDate,
          connectors: selectedConnectors,
        }),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to generate report`);
      }

      const data = await response.json();
      
      setReport({
        reportId: data.reportId,
        markdown: data.markdown,
        metadata: data.metadata,
      });
      setProgress({ agent: 'format', status: 'Complete', percentage: 100 });
    } catch (err: any) {
      setError(err.message || 'Failed to generate report');
      setProgress({ agent: null, status: 'Error', percentage: 0 });
      console.error("Report generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleConnector = (connectorId: string) => {
    if (selectedConnectors.includes(connectorId)) {
      setSelectedConnectors(selectedConnectors.filter((c) => c !== connectorId));
    } else {
      setSelectedConnectors([...selectedConnectors, connectorId]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground mt-1">
          Generate detailed analytics reports across all your data sources
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT PANEL - Controls */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report Settings</CardTitle>
              <CardDescription>Configure your report parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Date Range */}
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date Range
                </label>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                      disabled={isGenerating}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                      disabled={isGenerating}
                    />
                  </div>
                </div>
              </div>

              {/* Connector Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Data Sources
                </label>
                <div className="space-y-2">
                  {CONNECTORS.map((connector) => (
                    <div
                      key={connector.id}
                      className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => !isGenerating && toggleConnector(connector.id)}
                    >
                      <Checkbox
                        checked={selectedConnectors.includes(connector.id)}
                        onCheckedChange={() => toggleConnector(connector.id)}
                        disabled={isGenerating}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{connector.icon}</span>
                          <span className="text-sm font-medium">{connector.name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{connector.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || selectedConnectors.length === 0}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Report
                  </>
                )}
              </Button>

              {/* Progress Indicator */}
              {isGenerating && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{progress.status}</span>
                        <span className="font-medium">{progress.percentage}%</span>
                      </div>
                      <Progress value={progress.percentage} />
                      <div className="space-y-1.5 text-xs text-muted-foreground">
                        {progress.agent === 'data' && (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-3 w-3 animate-spin text-primary" />
                            <span>Data Aggregator Agent...</span>
                          </div>
                        )}
                        {progress.agent === 'insights' && (
                          <>
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-3 w-3 text-green-500" />
                              <span className="line-through">Data Aggregator Agent ✓</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-3 w-3 animate-spin text-primary" />
                              <span>Insight Generator Agent...</span>
                            </div>
                          </>
                        )}
                        {progress.agent === 'format' && (
                          <>
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-3 w-3 text-green-500" />
                              <span className="line-through">Data Aggregator Agent ✓</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-3 w-3 text-green-500" />
                              <span className="line-through">Insight Generator Agent ✓</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-3 w-3 animate-spin text-primary" />
                              <span>Report Formatter Agent...</span>
                            </div>
                          </>
                        )}
                        {progress.percentage === 100 && (
                          <>
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-3 w-3 text-green-500" />
                              <span>Data Aggregator Agent ✓</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-3 w-3 text-green-500" />
                              <span>Insight Generator Agent ✓</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-3 w-3 text-green-500" />
                              <span>Report Formatter Agent ✓</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Error Display */}
              {error && (
                <Card className="border-destructive">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-destructive mb-1">Error</p>
                        <p className="text-xs text-muted-foreground">{error}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3"
                          onClick={handleGenerate}
                        >
                          Retry
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT PANEL - Report Display */}
        <div className="lg:col-span-2">
          {report ? (
            <ReportViewer
              markdown={report.markdown}
              metadata={report.metadata}
              reportId={report.reportId}
            />
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center min-h-[400px]">
                <div className="text-center space-y-3">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <p className="text-lg font-medium">No report generated yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Select data sources and click "Generate Report" to create your first report
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
