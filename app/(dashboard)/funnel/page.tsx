"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { LeadSourcesTable } from "@/components/funnel/LeadSourcesTable";
import { AccountWatch } from "@/components/funnel/AccountWatch";
import { formatNumber } from "@/lib/utils";

// ============================================
// FUNNEL PAGE - Full Funnel Analysis
// Traffic → Leads → Deals → Revenue
// ============================================

interface DateRange {
  startDate: string;
  endDate: string;
}

async function fetchFunnelData(startDate: string, endDate: string) {
  const res = await fetch(`/api/funnel?startDate=${startDate}&endDate=${endDate}`);
  if (!res.ok) throw new Error("Failed to fetch funnel data");
  return res.json();
}

async function fetchGA4Overview(startDate: string, endDate: string) {
  const res = await fetch(`/api/ga4/overview?startDate=${startDate}&endDate=${endDate}`);
  if (!res.ok) throw new Error("Failed to fetch GA4 overview");
  return res.json();
}

async function fetchGA4SourceMedium(startDate: string, endDate: string) {
  const res = await fetch(`/api/ga4/source-medium?startDate=${startDate}&endDate=${endDate}`);
  if (!res.ok) throw new Error("Failed to fetch source/medium data");
  return res.json();
}

async function fetchHubSpotDeals() {
  const res = await fetch(`/api/hubspot/deals`);
  if (!res.ok) throw new Error("Failed to fetch HubSpot deals");
  return res.json();
}

async function fetchLeadSources(startDate: string, endDate: string) {
  const res = await fetch(`/api/funnel/lead-sources?startDate=${startDate}&endDate=${endDate}`);
  if (!res.ok) throw new Error("Failed to fetch lead sources");
  return res.json();
}

async function fetchDealSources(startDate: string, endDate: string) {
  const res = await fetch(`/api/funnel/deal-sources?startDate=${startDate}&endDate=${endDate}`);
  if (!res.ok) throw new Error("Failed to fetch deal sources");
  return res.json();
}

// KPI Card Component
const KPICard = ({ 
  label, 
  value, 
  subtext, 
  icon, 
  color, 
  loading = false,
  delay = 0, 
  small = false 
}: {
  label: string;
  value: string;
  subtext?: string;
  icon?: string;
  color?: string;
  loading?: boolean;
  delay?: number;
  small?: boolean;
}) => {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), delay); }, [delay]);
  
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(14, 14, 20, 0.8) 0%, rgba(18, 18, 26, 0.8) 100%)',
      border: '1px solid rgba(255, 255, 255, 0.06)',
      borderRadius: small ? 10 : 14,
      padding: small ? '14px 18px' : '20px 24px',
      position: 'relative',
      overflow: 'hidden',
      opacity: loaded ? 1 : 0,
      transform: loaded ? 'translateY(0)' : 'translateY(10px)',
      transition: 'all 0.4s ease',
    }}>
      {color && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: small ? 18 : 24,
          right: small ? 18 : 24,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          opacity: 0.6,
        }} />
      )}
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: small ? 8 : 10 }}>
        <span style={{ fontSize: small ? 10 : 11, fontWeight: 600, color: '#52525B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
        {icon && <span style={{ fontSize: small ? 14 : 16, opacity: 0.6 }}>{icon}</span>}
      </div>
      
      {loading ? (
        <div style={{ height: small ? 28 : 36, width: 80, background: 'rgba(255,255,255,0.05)', borderRadius: 4, animation: 'pulse 1.5s infinite' }} />
      ) : (
        <div style={{ fontSize: small ? 22 : 28, fontWeight: 700, color: '#FFF', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '-0.5px' }}>
          {value}
        </div>
      )}
      
      {subtext && !loading && (
        <div style={{ fontSize: 12, color: '#71717A', marginTop: 6 }}>{subtext}</div>
      )}
    </div>
  );
};

// Conversion Funnel Component
const ConversionFunnel = ({ 
  stages, 
  trafficSources, 
  loading,
  dateRange 
}: { 
  stages: { id: string; label: string; value: number; source: string; color: string; icon: string }[];
  trafficSources: { name: string; percentage: number; color: string }[];
  loading: boolean;
  dateRange: DateRange;
}) => {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 200); }, []);
  
  const maxValue = Math.max(...stages.map(s => s.value), 1);
  
  const getConversionRate = (index: number) => {
    if (index >= stages.length - 1) return null;
    const from = stages[index].value;
    const to = stages[index + 1].value;
    return from > 0 ? ((to / from) * 100).toFixed(1) : '0.0';
  };
  
  if (loading) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, rgba(14, 14, 20, 0.8) 0%, rgba(18, 18, 26, 0.8) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: 16,
        padding: 28,
        height: 400,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{ color: '#71717A' }}>Loading funnel data...</span>
      </div>
    );
  }
  
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(14, 14, 20, 0.8) 0%, rgba(18, 18, 26, 0.8) 100%)',
      border: '1px solid rgba(255, 255, 255, 0.06)',
      borderRadius: 16,
      padding: 28,
      opacity: loaded ? 1 : 0,
      transition: 'all 0.5s ease',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: '#FFF', margin: 0 }}>Conversion Funnel</h3>
          <p style={{ fontSize: 12, color: '#52525B', margin: '4px 0 0' }}>Full pipeline efficiency • {dateRange.startDate} - {dateRange.endDate}</p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 12px',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          borderRadius: 100,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', animation: 'pulse 2s ease-in-out infinite' }} />
          <span style={{ fontSize: 12, color: '#10B981', fontWeight: 500 }}>Live Data</span>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-8 mt-6">
        {/* Funnel Stages */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {stages.map((stage, i) => {
            const widthPercent = stage.value > 0 ? Math.max((stage.value / maxValue) * 100, 5) : 5;
            const conversionRate = getConversionRate(i);
            
            return (
              <div key={stage.id}>
                {/* Stage */}
                <div style={{ padding: '16px 0' }}>
                  {/* Label */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <span style={{ fontSize: 18 }}>{stage.icon}</span>
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#E4E4E7' }}>{stage.label}</span>
                    <span style={{
                      fontSize: 10,
                      color: stage.source === 'HubSpot' ? '#F97316' : '#3B82F6',
                      background: stage.source === 'HubSpot' ? 'rgba(249, 115, 22, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                      padding: '3px 8px',
                      borderRadius: 4,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}>{stage.source}</span>
                  </div>
                  
                  {/* Bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{
                      flex: 1,
                      height: 44,
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: 10,
                      overflow: 'hidden',
                      border: '1px solid rgba(255, 255, 255, 0.04)',
                    }}>
                      <div style={{
                        width: loaded ? `${widthPercent}%` : '0%',
                        height: '100%',
                        background: `linear-gradient(90deg, ${stage.color}cc, ${stage.color})`,
                        borderRadius: 10,
                        transition: `width 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${0.1 + i * 0.15}s`,
                        position: 'relative',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: '-100%',
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
                          animation: loaded ? 'shimmer 2.5s ease-in-out infinite 1.5s' : 'none',
                        }} />
                      </div>
                    </div>
                    
                    <div style={{ minWidth: 120, textAlign: 'right' }}>
                      <span style={{ fontSize: 20, fontWeight: 600, color: '#FFF', fontFamily: "'JetBrains Mono', monospace" }}>
                        {stage.id === 'revenue' ? `$${formatNumber(stage.value)}` : formatNumber(stage.value)}
                      </span>
                      <span style={{ fontSize: 12, color: '#52525B', marginLeft: 6 }}>
                        ({((stage.value / maxValue) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Conversion Connector */}
                {conversionRate && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '6px 0',
                    marginLeft: 28,
                  }}>
                    <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(113,113,122,0.2), rgba(113,113,122,0.05))' }} />
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '4px 12px',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: 100,
                      margin: '0 12px',
                    }}>
                      <span style={{ color: '#52525B' }}>↓</span>
                      <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: '#A1A1AA' }}>{conversionRate}%</span>
                    </div>
                    <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(113,113,122,0.05), transparent)' }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Traffic Sources Sidebar */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.04)',
          borderRadius: 12,
          padding: 20,
          height: 'fit-content',
        }}>
          <h4 style={{ fontSize: 14, fontWeight: 600, color: '#E4E4E7', margin: '0 0 16px' }}>Traffic Sources</h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {trafficSources.map((source) => (
              <div key={source.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  background: source.color,
                }} />
                <span style={{ flex: 1, fontSize: 13, color: '#A1A1AA' }}>{source.name}</span>
                <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", color: '#E4E4E7' }}>{source.percentage.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Business Insights Component
const BusinessInsights = ({ funnel, conversionRates }: { funnel: any; conversionRates: any }) => {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 500); }, []);
  
  const getInsights = () => {
    if (!funnel || !conversionRates) return [];
    const insights = [];
    
    if (funnel.level1?.value > 0 && conversionRates.sessionToLead < 2) {
      insights.push({
        type: 'warning',
        title: 'Low Traffic-to-Lead Conversion',
        message: `Only ${conversionRates.sessionToLead.toFixed(1)}% of sessions are converting to leads. Landing pages may need optimization.`,
      });
    }
    
    if (funnel.level3?.value > 0 && conversionRates.dealToClose < 5) {
      insights.push({
        type: 'error',
        title: 'Low Deal Close Rate',
        message: `Only ${conversionRates.dealToClose.toFixed(1)}% of deals are closing. This may indicate sales team performance issues or low-quality leads.`,
      });
    }
    
    if (funnel.level2?.value > 0 && funnel.level3?.value > funnel.level2?.value) {
      insights.push({
        type: 'info',
        title: 'More Deals Than Leads',
        message: `HubSpot shows ${funnel.level3?.value} deals but only ${funnel.level2?.value} leads from GA4. Some deals may be manually created.`,
      });
    }
    
    return insights;
  };
  
  const insights = getInsights();
  
  if (insights.length === 0) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(14, 14, 20, 0.8) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.15)',
        borderRadius: 14,
        padding: 20,
        opacity: loaded ? 1 : 0,
        transition: 'all 0.5s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <span style={{ fontSize: 18 }}>💡</span>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#FFF', margin: 0 }}>Business Insights</h3>
        </div>
        <div style={{ padding: 16, background: 'rgba(16, 185, 129, 0.1)', borderRadius: 10 }}>
          <span style={{ fontSize: 13, color: '#10B981' }}>✓ No critical issues detected. Funnel is performing within normal parameters.</span>
        </div>
      </div>
    );
  }
  
  const primaryInsight = insights[0];
  const bgColor = primaryInsight.type === 'error' ? 'rgba(239, 68, 68, 0.05)' : 
                  primaryInsight.type === 'warning' ? 'rgba(245, 158, 11, 0.05)' : 'rgba(59, 130, 246, 0.05)';
  const borderColor = primaryInsight.type === 'error' ? 'rgba(239, 68, 68, 0.15)' :
                      primaryInsight.type === 'warning' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(59, 130, 246, 0.15)';
  const textColor = primaryInsight.type === 'error' ? '#FCA5A5' :
                    primaryInsight.type === 'warning' ? '#FCD34D' : '#93C5FD';
  const alertBg = primaryInsight.type === 'error' ? 'rgba(239, 68, 68, 0.1)' :
                  primaryInsight.type === 'warning' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)';
  const alertBorder = primaryInsight.type === 'error' ? 'rgba(239, 68, 68, 0.2)' :
                      primaryInsight.type === 'warning' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(59, 130, 246, 0.2)';
  
  return (
    <div style={{
      background: `linear-gradient(135deg, ${bgColor} 0%, rgba(14, 14, 20, 0.8) 100%)`,
      border: `1px solid ${borderColor}`,
      borderRadius: 14,
      padding: 20,
      opacity: loaded ? 1 : 0,
      transition: 'all 0.5s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 18 }}>💡</span>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#FFF', margin: 0 }}>Business Insights</h3>
      </div>
      
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: 16,
        background: alertBg,
        border: `1px solid ${alertBorder}`,
        borderRadius: 10,
      }}>
        <span style={{ fontSize: 16 }}>{primaryInsight.type === 'error' ? '⚠️' : primaryInsight.type === 'warning' ? '⚡' : 'ℹ️'}</span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: textColor, marginBottom: 4 }}>{primaryInsight.title}</div>
          <div style={{ fontSize: 13, color: '#A1A1AA', lineHeight: 1.5 }}>{primaryInsight.message}</div>
        </div>
      </div>
    </div>
  );
};

// Live Account Watch Component  
const LiveAccountWatch = () => {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 550); }, []);
  
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(14, 14, 20, 0.8) 0%, rgba(18, 18, 26, 0.8) 100%)',
      border: '1px solid rgba(255, 255, 255, 0.06)',
      borderRadius: 14,
      padding: 20,
      opacity: loaded ? 1 : 0,
      transition: 'all 0.5s ease',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>🔗</span>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#FFF', margin: 0 }}>Live Account Watch</h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: '#52525B' }}>🔄</span>
          <span style={{ fontSize: 12, color: '#52525B' }}>0 Active</span>
        </div>
      </div>
      
      <p style={{ fontSize: 12, color: '#52525B', marginBottom: 16 }}>Real-time alerts when contacts with open deals visit high-intent pages</p>
      
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: 20,
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: 10,
        justifyContent: 'center',
      }}>
        <span style={{ fontSize: 14, color: '#52525B' }}>⏳</span>
        <span style={{ fontSize: 13, color: '#52525B', textAlign: 'center' }}>No active alerts. Alerts appear when contacts with open deals visit pricing, docs, or other high-intent pages.</span>
      </div>
    </div>
  );
};

export default function FunnelPage() {
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    if (typeof window !== "undefined") {
      const savedType = localStorage.getItem("dashboard-date-range-type");
      if (savedType === "custom") {
        const savedStart = localStorage.getItem("dashboard-custom-start-date");
        const savedEnd = localStorage.getItem("dashboard-custom-end-date");
        if (savedStart && savedEnd) {
          return {
            startDate: new Date(savedStart).toISOString().split("T")[0],
            endDate: new Date(savedEnd).toISOString().split("T")[0],
          };
        }
      } else if (savedType === "today") {
        const today = new Date().toISOString().split("T")[0];
        return { startDate: today, endDate: today };
      } else if (savedType === "yesterday") {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];
        return { startDate: yesterdayStr, endDate: yesterdayStr };
      } else {
        const saved = localStorage.getItem("dashboard-date-range");
        const days = saved ? parseInt(saved) : 30;
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - days);
        return {
          startDate: start.toISOString().split("T")[0],
          endDate: end.toISOString().split("T")[0],
        };
      }
    }
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return {
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    };
  });

  useEffect(() => {
    const handleDateRangeChange = () => {
      const savedType = localStorage.getItem("dashboard-date-range-type");
      if (savedType === "custom") {
        const savedStart = localStorage.getItem("dashboard-custom-start-date");
        const savedEnd = localStorage.getItem("dashboard-custom-end-date");
        if (savedStart && savedEnd) {
          setDateRange({
            startDate: new Date(savedStart).toISOString().split("T")[0],
            endDate: new Date(savedEnd).toISOString().split("T")[0],
          });
        }
      } else if (savedType === "today") {
        const today = new Date().toISOString().split("T")[0];
        setDateRange({ startDate: today, endDate: today });
      } else if (savedType === "yesterday") {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];
        setDateRange({ startDate: yesterdayStr, endDate: yesterdayStr });
      } else {
        const saved = localStorage.getItem("dashboard-date-range");
        const days = saved ? parseInt(saved) : 30;
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - days);
        setDateRange({
          startDate: start.toISOString().split("T")[0],
          endDate: end.toISOString().split("T")[0],
        });
      }
    };

    window.addEventListener("storage", handleDateRangeChange);
    window.addEventListener("dateRangeChange", handleDateRangeChange);
    return () => {
      window.removeEventListener("storage", handleDateRangeChange);
      window.removeEventListener("dateRangeChange", handleDateRangeChange);
    };
  }, []);

  // Fetch data
  const { data: funnelData, isLoading: funnelLoading } = useQuery({
    queryKey: ["funnel", dateRange.startDate, dateRange.endDate],
    queryFn: () => fetchFunnelData(dateRange.startDate, dateRange.endDate),
    refetchInterval: 300000,
  });

  const { data: ga4Overview, isLoading: overviewLoading } = useQuery({
    queryKey: ["ga4-overview", dateRange.startDate, dateRange.endDate],
    queryFn: () => fetchGA4Overview(dateRange.startDate, dateRange.endDate),
    refetchInterval: 300000,
  });

  const { data: sourceMediumData, isLoading: sourceMediumLoading } = useQuery({
    queryKey: ["ga4-source-medium", dateRange.startDate, dateRange.endDate],
    queryFn: () => fetchGA4SourceMedium(dateRange.startDate, dateRange.endDate),
    refetchInterval: 300000,
  });

  const { data: hubspotDeals, isLoading: dealsLoading } = useQuery({
    queryKey: ["hubspot-deals"],
    queryFn: fetchHubSpotDeals,
    refetchInterval: 300000,
  });

  const { data: leadSourcesData, isLoading: leadSourcesLoading } = useQuery({
    queryKey: ["lead-sources", dateRange.startDate, dateRange.endDate],
    queryFn: () => fetchLeadSources(dateRange.startDate, dateRange.endDate),
    refetchInterval: 300000,
  });

  const { data: dealSourcesData, isLoading: dealSourcesLoading } = useQuery({
    queryKey: ["deal-sources", dateRange.startDate, dateRange.endDate],
    queryFn: () => fetchDealSources(dateRange.startDate, dateRange.endDate),
    refetchInterval: 300000,
  });

  // Extract data
  const funnel = funnelData?.funnel;
  const conversionRates = funnelData?.conversionRates;
  const overview = ga4Overview?.summary || {};
  const sourceMedium = sourceMediumData?.sourceMedium || [];
  const dealsSummary = hubspotDeals?.summary || {};

  // Calculate metrics
  const sessions = overview.sessions || funnel?.level1?.value || 0;
  const leads = funnel?.level2?.value || 0;
  const dealsCreated = funnel?.level3?.value || 0;
  const closedWonRevenue = funnel?.level4?.value || 0;
  const closedWonCount = funnel?.level4?.count || 0;

  const leadConversionRate = sessions > 0 ? ((leads / sessions) * 100).toFixed(1) : '0.0';
  const dealConversionRate = leads > 0 ? ((dealsCreated / leads) * 100).toFixed(1) : '0.0';

  const avgDealValue = dealsCreated > 0 ? closedWonRevenue / dealsCreated : 0;
  const valuePerLead = leads > 0 ? closedWonRevenue / leads : 0;
  const pipelineValue = dealsSummary.totalValue || 0;

  // Funnel stages for chart
  const funnelStages = [
    { id: 'traffic', label: 'Total Traffic', value: sessions, source: 'GA4', color: '#3B82F6', icon: '👁' },
    { id: 'leads', label: 'Leads Generated', value: leads, source: 'GA4', color: '#8B5CF6', icon: '✉' },
    { id: 'deals', label: 'Deals Created', value: dealsCreated, source: 'HubSpot', color: '#F59E0B', icon: '🤝' },
    { id: 'revenue', label: 'Closed-Won Revenue', value: closedWonRevenue, source: 'HubSpot', color: '#10B981', icon: '💰' },
  ];

  // Traffic sources from source/medium data
  const totalSessions = sourceMedium.reduce((sum: number, s: any) => sum + (s.sessions || 0), 0);
  const trafficSources = sourceMedium.slice(0, 6).map((s: any) => {
    const name = s.source === '(direct)' ? 'Direct' : 
                 s.source.toLowerCase().includes('google') && s.medium === 'organic' ? 'Organic' :
                 s.source.toLowerCase().includes('google') && s.medium === 'cpc' ? 'Google Ads' :
                 s.source.toLowerCase().includes('reddit') ? 'Reddit' :
                 s.source.toLowerCase().includes('bing') ? 'Bing' : s.source;
    const color = s.source.toLowerCase().includes('reddit') ? '#FF4500' :
                  s.source.toLowerCase().includes('google') && s.medium === 'organic' ? '#10B981' :
                  s.source.toLowerCase().includes('google') && s.medium === 'cpc' ? '#4285F4' :
                  s.source === '(direct)' ? '#64748B' : '#06B6D4';
    return {
      name,
      percentage: totalSessions > 0 ? (s.sessions / totalSessions) * 100 : 0,
      color,
    };
  });

  const isLoading = funnelLoading || overviewLoading || dealsLoading;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Fonts and animations */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes shimmer { 0% { left: -100%; } 100% { left: 200%; } }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: rgba(14, 14, 20, 0.5); }
        ::-webkit-scrollbar-thumb { background: #2A2A34; border-radius: 4px; }
      `}</style>
      
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#FFF', margin: 0 }}>Full Funnel Analysis</h1>
        <p style={{ fontSize: 14, color: '#71717A', margin: '8px 0 0' }}>Comprehensive view of your entire customer journey from Traffic → Leads → Deals → Revenue</p>
      </div>
      
      {/* KPI Cards Row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Total Traffic"
          value={formatNumber(sessions)}
          subtext="Sessions"
          icon="👁"
          color="#3B82F6"
          loading={isLoading}
          delay={0}
        />
        <KPICard
          label="Leads Generated"
          value={formatNumber(leads)}
          subtext={`${leadConversionRate}% conversion rate`}
          icon="✉"
          color="#8B5CF6"
          loading={isLoading}
          delay={50}
        />
        <KPICard
          label="Deals Created"
          value={formatNumber(dealsCreated)}
          subtext={`${dealConversionRate}% conversion rate`}
          icon="🤝"
          color="#F59E0B"
          loading={isLoading}
          delay={100}
        />
        <KPICard
          label="Closed-Won Revenue"
          value={`$${formatNumber(closedWonRevenue)}`}
          subtext={`${closedWonCount} deals closed`}
          icon="💰"
          color="#10B981"
          loading={isLoading}
          delay={150}
        />
      </div>
      
      {/* KPI Cards Row 2 */}
      <div className="grid grid-cols-3 gap-3">
        <KPICard
          label="Avg Deal Value"
          value={`$${formatNumber(avgDealValue)}`}
          color="#64748B"
          loading={isLoading}
          delay={200}
          small
        />
        <KPICard
          label="Value per Lead"
          value={`$${formatNumber(valuePerLead)}`}
          color="#64748B"
          loading={isLoading}
          delay={250}
          small
        />
        <KPICard
          label="Total Pipeline Value"
          value={`$${formatNumber(pipelineValue)}`}
          color="#64748B"
          loading={isLoading}
          delay={300}
          small
        />
      </div>
      
      {/* Conversion Funnel */}
      <ConversionFunnel 
        stages={funnelStages} 
        trafficSources={trafficSources} 
        loading={isLoading}
        dateRange={dateRange}
      />
      
      {/* Attribution Sources Table */}
      <LeadSourcesTable 
        leadSources={leadSourcesData?.sources || []}
        dealSources={dealSourcesData?.dealSources || []}
        revenueSources={dealSourcesData?.revenueSources || []}
        isLoading={leadSourcesLoading || dealSourcesLoading}
      />
      
      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BusinessInsights funnel={funnel} conversionRates={conversionRates} />
        <LiveAccountWatch />
      </div>
    </div>
  );
}
