/**
 * Report Templates
 * Defines structure for different report types
 */

export interface ReportSection {
  id: string;
  title: string;
  subsections: string[];
  tables: number;
  maxPages?: number;
  dataSources: string[];
  includeRecommendations?: boolean;
  includeAlerts?: boolean;
  includeGaps?: boolean;
}

export interface ReportTemplate {
  title: string;
  subtitle: string;
  period: string;
  dataSources: string[];
  sections: ReportSection[];
  totalSections: number;
  estimatedPages: number;
  targetTokens: number;
}

export const fullFunnelReportTemplate: ReportTemplate = {
  title: "Full Funnel Performance Report",
  subtitle: "Week Ending {date}",
  period: "{startDate} - {endDate}",
  dataSources: ["Google Analytics 4", "HubSpot CRM", "LinkedIn Ads", "Reddit"],
  
  sections: [
    {
      id: "executive-summary",
      title: "Executive Summary",
      subsections: ["Top-Line Metrics", "Key Insights", "Critical Alerts"],
      tables: 1,
      dataSources: ["ga4", "hubspot", "linkedin"],
      includeAlerts: true,
    },
    {
      id: "traffic-acquisition",
      title: "Stage 1: Traffic and Acquisition (Top of Funnel)",
      subsections: [
        "Overall Traffic Performance",
        "Traffic by Source/Medium",
        "Top Landing Pages",
        "Geographic Distribution"
      ],
      tables: 4,
      maxPages: 2,
      dataSources: ["ga4"],
      includeRecommendations: true,
    },
    {
      id: "lead-generation",
      title: "Stage 2: Lead Generation (Middle of Funnel)",
      subsections: [
        "HubSpot Contact Database Overview",
        "Recent Activity",
        "HubSpot Companies",
        "Sales Activity"
      ],
      tables: 2,
      maxPages: 2,
      dataSources: ["hubspot"],
    },
    {
      id: "sales-pipeline",
      title: "Stage 3: Sales Pipeline (Bottom of Funnel)",
      subsections: [
        "HubSpot Deal Pipeline Analysis",
        "Pipeline Breakdown by Stage",
        "Pipeline Health Metrics",
        "Deals by Segment"
      ],
      tables: 3,
      maxPages: 2,
      dataSources: ["hubspot"],
      includeAlerts: true,
    },
    {
      id: "marketing-campaigns",
      title: "Stage 4: Marketing Campaign Performance",
      subsections: [
        "LinkedIn Ads Performance",
        "Campaign Breakdown",
        "Analysis"
      ],
      tables: 2,
      maxPages: 1,
      dataSources: ["linkedin"],
      includeRecommendations: true,
    },
    {
      id: "funnel-conversion",
      title: "Full Funnel Conversion Analysis",
      subsections: [
        "Week-by-Week Funnel Performance",
        "Conversion Rate Benchmarks",
        "Attribution and Customer Journey Insights",
        "Content Performance by Funnel Stage"
      ],
      tables: 3,
      maxPages: 2,
      dataSources: ["ga4", "hubspot"],
      includeGaps: true,
    },
    {
      id: "revenue-impact",
      title: "Revenue and Business Impact Analysis",
      subsections: [
        "Pipeline Velocity Metrics",
        "Revenue Forecast",
        "Customer Acquisition Economics",
        "Marketing Efficiency Metrics"
      ],
      tables: 4,
      maxPages: 2,
      dataSources: ["hubspot", "linkedin"],
    },
    {
      id: "technology-devices",
      title: "Technology and Device Analysis",
      subsections: [
        "Traffic by Device",
        "Browser Performance",
        "Operating System Insights",
        "Critical Issues"
      ],
      tables: 3,
      maxPages: 2,
      dataSources: ["ga4"],
      includeAlerts: true,
    },
    {
      id: "geographic",
      title: "Geographic Deep Dive",
      subsections: [
        "Regional Performance Analysis",
        "North America",
        "Europe",
        "Asia-Pacific"
      ],
      tables: 4,
      maxPages: 2,
      dataSources: ["ga4", "hubspot"],
      includeRecommendations: true,
    },
    {
      id: "time-patterns",
      title: "Time-Based Performance Patterns",
      subsections: [
        "Traffic by Day of Week",
        "Hourly Patterns",
        "Optimization Opportunities"
      ],
      tables: 2,
      maxPages: 1,
      dataSources: ["ga4"],
      includeRecommendations: true,
    },
    {
      id: "competitor",
      title: "Competitor Intelligence Update",
      subsections: [
        "Market Movements",
        "Competitive Win/Loss Analysis"
      ],
      tables: 2,
      maxPages: 1,
      dataSources: ["manual", "reddit"],
    },
    {
      id: "critical-issues",
      title: "Critical Issues and Risk Assessment",
      subsections: [
        "Critical (Immediate Action Required)",
        "High Priority (Address This Month)",
        "Medium Priority (Monitor and Plan)"
      ],
      tables: 3,
      maxPages: 2,
      dataSources: ["all"],
      includeAlerts: true,
    },
    {
      id: "recommendations",
      title: "Strategic Recommendations and Next Steps",
      subsections: [
        "Immediate Actions (Next 7 Days)",
        "Short-Term Tactics (30 Days)",
        "Medium-Term Strategy (90 Days / Q1 2026)"
      ],
      tables: 0,
      maxPages: 2,
      dataSources: ["all"],
      includeRecommendations: true,
    },
  ],
  
  totalSections: 13,
  estimatedPages: 14,
  targetTokens: 4000,
};
