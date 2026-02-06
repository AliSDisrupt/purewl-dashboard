/**
 * Orion Daily GTM Insights - Claude output types.
 * Matches orion-insights-spec.md ClaudeOutput schema.
 */

export interface AdAlert {
  campaignName: string;
  accountName: string;
  issue: "high_cpl" | "low_ctr" | "no_conversions" | "high_frequency" | "budget_exhausted" | "creative_fatigue";
  severity: "critical" | "warning";
  metric: { name: string; current: number; benchmark: number; percentageOff: number };
  impact: string;
  recommendation: string;
  quickAction: string;
}

export interface DataAlert {
  source: "linkedin" | "ga4" | "hubspot" | "reddit";
  issue: string;
  detected: string;
  impact: string;
  suggestedFix: string;
}

export interface BudgetAlert {
  account: string;
  alertType: "overspend" | "underspend" | "pacing_fast" | "pacing_slow";
  currentSpend: number;
  expectedSpend: number;
  projectedMonthEnd: number;
  monthlyBudget: number;
  recommendation: string;
}

export interface GeoRecommendation {
  region: string;
  country: string;
  leads: number;
  spend: number;
  cpl: number;
  cplVsAverage: number;
  leadQuality: "high" | "medium" | "low";
  sqlConversionRate: number;
  recommendation: "scale_aggressive" | "scale_moderate" | "maintain";
  suggestedBudgetChange: string;
  reasoning: string;
}

export interface GeoWarning {
  region: string;
  country: string;
  leads: number;
  spend: number;
  cpl: number;
  cplVsAverage: number;
  issue: "high_cpl" | "low_quality" | "saturated" | "low_volume";
  leadToSqlRate: number;
  recommendation: "pause" | "reduce_50" | "reduce_25" | "monitor";
  reasoning: string;
  potentialSavings: number;
}

export interface JobTitleInsight {
  jobTitle: string;
  impressions: number;
  clicks: number;
  leads: number;
  cpl: number;
  ctr: number;
  sqlConversionRate: number;
  performance: "top_performer" | "good" | "average" | "underperforming";
  recommendation: string;
}

export interface AudienceSaturation {
  audienceName: string;
  frequencyScore: number;
  reachPercentage: number;
  fatigueIndicator: boolean;
  recommendation: string;
}

export interface PagePerformance {
  pagePath: string;
  pageTitle: string;
  sessions: number;
  conversions: number;
  conversionRate: number;
  bounceRate: number;
  avgTimeOnPage: number;
  trend: number;
  status: "top_performer" | "improving" | "stable" | "declining";
}

export interface PageIssue {
  pagePath: string;
  pageTitle: string;
  sessions: number;
  issue: "high_bounce" | "low_conversion" | "high_exit" | "low_engagement" | "form_dropoff";
  metric: { name: string; value: number; benchmark: number };
  potentialImpact: string;
  recommendations: string[];
  priority: "high" | "medium" | "low";
}

export interface FormAnalytics {
  formName: string;
  pagePath: string;
  views: number;
  starts: number;
  completions: number;
  startRate: number;
  completionRate: number;
  dropoffFields: string[];
  avgCompletionTime: number;
  recommendations: string[];
}

export interface CreativePerformance {
  creativeName: string;
  creativeType: "image" | "video" | "carousel" | "document";
  campaignName: string;
  impressions: number;
  ctr: number;
  conversionRate: number;
  cpl: number;
  status: "top_performer" | "good" | "average";
  insight: string;
}

export interface CreativeFatigue {
  creativeName: string;
  campaignName: string;
  daysRunning: number;
  ctrPeak: number;
  ctrCurrent: number;
  ctrDecline: number;
  frequency: number;
  recommendation: "refresh_urgently" | "plan_refresh" | "monitor";
  suggestedRefreshDate: string;
}

export interface CreativeRecommendation {
  type: "new_format" | "messaging_test" | "visual_refresh" | "audience_specific";
  recommendation: string;
  reasoning: string;
  expectedImpact: string;
  examples: string[];
}

export interface FunnelStage {
  stageName: string;
  count: number;
  conversionToNext: number;
  avgTimeInStage: number;
  trend: number;
  benchmark: number;
  status: "healthy" | "bottleneck" | "leaking";
}

export interface FunnelBottleneck {
  fromStage: string;
  toStage: string;
  currentConversion: number;
  expectedConversion: number;
  gap: number;
  leadsLost: number;
  potentialRevenue: number;
  possibleCauses: string[];
  recommendations: string[];
}

export interface FunnelVelocity {
  avgDaysToMQL: number;
  avgDaysToSQL: number;
  avgDaysToClose: number;
  totalCycleTime: number;
  trend: "faster" | "slower" | "stable";
  changeFromLastMonth: number;
}

export interface BudgetOverview {
  account: string;
  monthlyBudget: number;
  spentToDate: number;
  remainingBudget: number;
  daysRemaining: number;
  dailyPace: number;
  projectedMonthEndSpend: number;
  pacingStatus: "on_track" | "underspending" | "overspending";
  recommendation: string;
}

export interface SpendEfficiency {
  totalSpend: number;
  totalLeads: number;
  totalSQLs: number;
  costPerLead: number;
  costPerSQL: number;
  costPerOpportunity: number;
  roi: number;
  efficiencyTrend: "improving" | "declining" | "stable";
}

export interface BudgetReallocation {
  from: { campaign: string; currentBudget: number; performance: string };
  to: { campaign: string; currentBudget: number; performance: string };
  suggestedAmount: number;
  expectedImpact: string;
  reasoning: string;
}

export interface ChannelHealth {
  channel: "linkedin_ads" | "google_analytics" | "hubspot" | "reddit" | "organic_social";
  status: "excellent" | "good" | "needs_attention" | "critical";
  primaryMetric: { name: string; value: number; trend: number };
  secondaryMetrics: Array<{ name: string; value: number; trend: number }>;
  aiInsight: string;
  topRecommendation: string;
}

export interface TimingInsight {
  dimension: "day_of_week" | "hour_of_day" | "day_of_month";
  data: Array<{
    period: string;
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number;
    conversionRate: number;
    performance: "peak" | "good" | "average" | "low";
  }>;
  recommendation: string;
}

export interface SchedulingRecommendation {
  campaignType: string;
  recommendedDays: string[];
  recommendedHours: string;
  avoidTimes: string[];
  reasoning: string;
}

export interface TrendSummary {
  metric: string;
  thisWeek: number;
  lastWeek: number;
  change: number;
  changeType: "positive" | "negative" | "neutral";
  sparklineData: number[];
  trend: "accelerating" | "decelerating" | "stable" | "volatile";
}

export interface Anomaly {
  metric: string;
  date: string;
  expectedValue: number;
  actualValue: number;
  deviation: number;
  possibleCauses: string[];
  requiresAction: boolean;
}

export interface GoalProgress {
  goalName: string;
  metric: string;
  target: number;
  current: number;
  progressPercentage: number;
  daysRemaining: number;
  projectedEndValue: number;
  willHitTarget: boolean;
  status: "on_track" | "at_risk" | "behind" | "exceeded";
  recommendation: string;
}

export interface PriorityAction {
  priority: 1 | 2 | 3 | 4 | 5;
  title: string;
  description: string;
  category: "quick_win" | "strategic" | "experimental" | "maintenance";
  reasoning: string;
  expectedImpact: { metric: string; improvement: string };
  effort: "low" | "medium" | "high";
  timeToImplement: string;
  owner: string;
  steps: string[];
}

export interface Opportunity {
  title: string;
  description: string;
  dataPoints: string[];
  potentialImpact: string;
  confidence: "high" | "medium" | "low";
  nextSteps: string[];
}

export interface Risk {
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
  likelihood: "high" | "medium" | "low";
  mitigationSteps: string[];
  deadline: string;
}

export interface CrossChannelInsight {
  insight: string;
  channels: string[];
  correlation: string;
  recommendation: string;
}

/** Full Claude output schema (orion-insights-spec ClaudeOutput). */
export interface InsightsClaudeOutput {
  generatedAt: string;
  executiveSummary: {
    aiSummary: string;
    gtmHealthScore: number;
    healthScoreReasoning: string;
    sentiment: "excellent" | "good" | "concerning" | "critical";
    keyHighlights: string[];
    keyLowlights: string[];
  };
  immediateActions: {
    adsToPause: AdAlert[];
    adsToFix: AdAlert[];
    trackingIssues: DataAlert[];
    budgetAlerts: BudgetAlert[];
  };
  geoInsights: {
    regionsToScale: GeoRecommendation[];
    regionsToReduce: GeoWarning[];
    geoSummary: string;
  };
  audienceInsights: {
    topJobTitles: JobTitleInsight[];
    audienceSaturation: AudienceSaturation[];
    audienceSummary: string;
  };
  pageInsights: {
    topPages: PagePerformance[];
    problemPages: PageIssue[];
    formAnalytics: FormAnalytics[];
    pageSummary: string;
  };
  creativeInsights: {
    topCreatives: CreativePerformance[];
    fatigueAlerts: CreativeFatigue[];
    recommendations: CreativeRecommendation[];
    creativeSummary: string;
  };
  funnelInsights: {
    stages: FunnelStage[];
    bottlenecks: FunnelBottleneck[];
    velocity: FunnelVelocity;
    funnelSummary: string;
  };
  budgetInsights: {
    overview: BudgetOverview[];
    efficiency: SpendEfficiency;
    reallocations: BudgetReallocation[];
    budgetSummary: string;
  };
  channelHealth: ChannelHealth[];
  timingInsights: {
    bestDays: TimingInsight;
    bestHours: TimingInsight;
    schedulingRecommendations: SchedulingRecommendation[];
  };
  trends: {
    summary: TrendSummary[];
    anomalies: Anomaly[];
    trendNarrative: string;
  };
  goalTracking: {
    goals: GoalProgress[];
    overallStatus: string;
  };
  strategicRecommendations: {
    priorityActions: PriorityAction[];
    opportunities: Opportunity[];
    risks: Risk[];
    weeklyFocus: string;
  };
  crossChannelInsights: CrossChannelInsight[];
  adsInsights?: AdsInsights;
}
