/**
 * Knowledge Base for Orion Reports
 * Contains benchmarks, historical metrics, and critical issues
 */

export const knowledgeBase = {
  orion: {
    business: {
      product: "White-label VPN platform",
      segments: ["ISP/Telecom", "Security", "MSP", "SaaS"],
      stage: "Growth",
    },
    report_config: {
      type: "gtm_detailed",
      format: "gtm_performance_report",
      sections: 13,
      estimated_pages: 14,
      estimated_tables: 30,
      data_sources: ["ga4", "hubspot", "linkedin", "reddit"],
      gtm_focus: true,
    },
    report_structure: {
      sections: [
        {
          id: 1,
          name: "Executive Summary",
          fields: ["total_users", "total_contacts", "active_deals", "pipeline_value", "linkedin_spend"],
          metrics_count: 5,
          include_benchmarks: true,
        },
        {
          id: 2,
          name: "Stage 1: Traffic and Acquisition",
          subsections: [
            "Overall Traffic Performance",
            "Traffic by Source/Medium",
            "Top Landing Pages",
            "Geographic Distribution"
          ],
          data_sources: ["ga4"],
          tables_needed: 4,
          include_recommendations: true,
        },
        {
          id: 3,
          name: "Stage 2: Lead Generation",
          subsections: [
            "HubSpot Contact Database Overview",
            "Recent Activity",
            "HubSpot Companies",
            "Sales Activity"
          ],
          data_sources: ["hubspot"],
          tables_needed: 2,
          include_concerns: true,
        },
        {
          id: 4,
          name: "Stage 3: Sales Pipeline",
          subsections: [
            "HubSpot Deal Pipeline Analysis",
            "Pipeline Breakdown by Stage",
            "Pipeline Health Metrics",
            "Deals by Segment"
          ],
          data_sources: ["hubspot"],
          tables_needed: 3,
          include_alerts: true,
        },
        {
          id: 5,
          name: "Stage 4: Marketing Campaigns",
          subsections: [
            "LinkedIn Ads Performance",
            "Campaign Breakdown",
            "Analysis"
          ],
          data_sources: ["linkedin"],
          tables_needed: 2,
          include_recommendations: true,
        },
        {
          id: 6,
          name: "Full Funnel Conversion Analysis",
          subsections: [
            "Week-by-Week Funnel Performance",
            "Conversion Rate Benchmarks",
            "Attribution and Customer Journey Insights",
            "Content Performance by Funnel Stage"
          ],
          data_sources: ["ga4", "hubspot"],
          tables_needed: 3,
          include_gaps: true,
        },
        {
          id: 7,
          name: "Revenue and Business Impact",
          subsections: [
            "Pipeline Velocity Metrics",
            "Revenue Forecast",
            "Customer Acquisition Economics",
            "Marketing Efficiency Metrics"
          ],
          data_sources: ["hubspot", "linkedin"],
          tables_needed: 4,
          include_scenarios: true,
        },
        {
          id: 8,
          name: "Technology and Device Analysis",
          subsections: [
            "Traffic by Device",
            "Browser Performance",
            "Operating System Insights",
            "Critical Issues"
          ],
          data_sources: ["ga4"],
          tables_needed: 3,
          include_alerts: true,
        },
        {
          id: 9,
          name: "Geographic Deep Dive",
          subsections: [
            "Regional Performance Analysis",
            "North America",
            "Europe",
            "Asia-Pacific"
          ],
          data_sources: ["ga4", "hubspot"],
          tables_needed: 4,
          include_recommendations: true,
        },
        {
          id: 10,
          name: "Time-Based Performance Patterns",
          subsections: [
            "Traffic by Day of Week",
            "Hourly Patterns",
            "Optimization Opportunities"
          ],
          data_sources: ["ga4"],
          tables_needed: 2,
          include_recommendations: true,
        },
        {
          id: 11,
          name: "Competitor Intelligence Update",
          subsections: [
            "Market Movements",
            "Competitive Win/Loss Analysis"
          ],
          data_sources: ["manual", "reddit"],
          tables_needed: 2,
          include_strategic_insights: true,
        },
        {
          id: 12,
          name: "Critical Issues and Risk Assessment",
          subsections: [
            "Critical (Immediate Action Required)",
            "High Priority (Address This Month)",
            "Medium Priority (Monitor and Plan)"
          ],
          tables_needed: 3,
          include_owners: true,
          include_deadlines: true,
        },
        {
          id: 13,
          name: "Strategic Recommendations and Next Steps",
          subsections: [
            "Immediate Actions (Next 7 Days)",
            "Short-Term Tactics (30 Days)",
            "Medium-Term Strategy (90 Days / Q1 2026)"
          ],
          tables_needed: 0,
          include_owners: true,
          include_deadlines: true,
        },
      ],
    },
    benchmarks: {
      ga4: {
        visitor_to_contact: 0.03,
        form_submission_rate: 0.01,
        pages_per_session: 3,
        avg_session_duration: "2m+",
        ctr_linkedin: 0.01,
        mobile_desktop_conversion_ratio: 0.33,
        engagement_rate: 0.70,
        bounce_rate: 0.40,
        conversion_rate: 0.03,
      },
      hubspot: {
        pipeline_coverage: "3-4x",
        avg_deal_size: 75000,
        active_deals: "15-20",
        sales_cycle: "< 90 days",
        win_rate: 0.28,
        contact_to_mql: 0.30,
      },
      linkedin: {
        target_ctr: 0.01,
        target_cpl: 150,
        target_cpc: 2.5,
      },
      business: {
        cac: 4500,
        ltv: 206550,
        ltv_cac_ratio: 45.9,
      },
    },
    current_metrics_jan_2026: {
      ga4: {
        total_users_7d: 3527,
        new_user_rate: 0.958,
        total_sessions: 4215,
        avg_session_duration: "2m18s",
        pages_per_session: 2.4,
        top_sources: {
          google_organic: { users: 1247, engagement: 0.583 },
          direct: { users: 892, engagement: 0.472 },
          linkedin_cpc: { users: 485, engagement: 0.647 },
        },
      },
      hubspot: {
        total_contacts: 2573,
        new_contacts_7d: 47,
        active_deals: 10,
        pipeline_value: 725000,
        top_company: "TelecomGlobal Inc ($250k)",
        sales_activity: {
          calls: 10,
          emails: 10,
          meetings: 10,
        },
      },
      linkedin: {
        active_campaigns: 3,
        total_spend_7d: 3124.38,
        impressions: 156847,
        clicks: 1247,
        avg_ctr: 0.0079,
        avg_cpc: 2.51,
      },
    },
    critical_issues_jan_2026: [
      {
        priority: "critical",
        id: "top_of_funnel_conversion",
        description: "Visitor-to-contact conversion 1.3% vs 3% target",
        impact: "~235 contacts/month lost",
        deadline: "2026-01-20",
        owner: "Marketing",
      },
      {
        priority: "critical",
        id: "mobile_conversion",
        description: "Mobile converts at 0.6% vs desktop 1.8%",
        impact: "~470 lost leads/year",
        deadline: "2026-01-31",
        owner: "Product",
      },
      {
        priority: "critical",
        id: "linkedin_ctr",
        description: "LinkedIn CTR 0.79% vs 1.0% target",
        impact: "Elevated CPL and reduced leads",
        deadline: "2026-01-15",
        owner: "Marketing",
      },
      {
        priority: "high",
        id: "pipeline_coverage",
        description: "Pipeline coverage below 3-4x target",
        impact: "Risk of missing revenue targets",
        deadline: "2026-02-01",
        owner: "Sales",
      },
      {
        priority: "medium",
        id: "pages_per_session",
        description: "Pages per session at 2.4 vs 3.0 target",
        impact: "Lower engagement, potential content gaps",
        deadline: "2026-02-15",
        owner: "Content",
      },
    ],
    historical_metrics: {
      baseline: {
        users: 15000,
        pipeline: 725000,
        ctr: 0.0079,
        engagement_rate: 0.60,
        bounce_rate: 0.55,
        pages_per_session: 2.4,
      },
      jan_2026: {
        users: 3527,
        pipeline: 725000,
        ctr: 0.0079,
        engagement_rate: 0.60,
        bounce_rate: 0.55,
        pages_per_session: 2.4,
      },
    },
    target_customers: {
      isps: {
        description: "Internet Service Providers",
        key_metrics: ["pipeline_value", "ctr", "conversions"],
        priorities: ["scalability", "white-label", "integration"],
      },
      telcos: {
        description: "Telecommunications companies",
        key_metrics: ["pipeline_value", "ctr", "conversions"],
        priorities: ["reliability", "security", "compliance"],
      },
      msps: {
        description: "Managed Service Providers",
        key_metrics: ["pipeline_value", "ctr", "conversions"],
        priorities: ["ease_of_use", "support", "margins"],
      },
      security: {
        description: "Security companies",
        key_metrics: ["pipeline_value", "ctr", "conversions"],
        priorities: ["security_features", "compliance", "integration"],
      },
    },
    competitors: {
      top_competitors: ["NordLayer", "Perimeter 81", "GoodAccess"],
      differentiators: ["White-label focus", "ISP partnerships", "Fast integration"],
    },
  },
};
