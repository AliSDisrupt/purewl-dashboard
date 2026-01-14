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

async function fetchConversations(startDate: string, endDate: string) {
  const res = await fetch(`/api/hubspot/conversations?startDate=${startDate}&endDate=${endDate}`);
  if (!res.ok) throw new Error("Failed to fetch conversations");
  return res.json();
}

async function fetchDealsByStage(startDate: string, endDate: string, stage?: string) {
  const url = stage 
    ? `/api/hubspot/deals-by-stage?startDate=${startDate}&endDate=${endDate}&stage=${stage}`
    : `/api/hubspot/deals-by-stage?startDate=${startDate}&endDate=${endDate}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch deals by stage");
  return res.json();
}

async function fetchEmailsSent(startDate: string, endDate: string) {
  const res = await fetch(`/api/hubspot/emails-sent?startDate=${startDate}&endDate=${endDate}`);
  if (!res.ok) throw new Error("Failed to fetch emails sent");
  return res.json();
}

async function fetchFirstResponse(startDate: string, endDate: string) {
  const res = await fetch(`/api/hubspot/first-response?startDate=${startDate}&endDate=${endDate}`);
  if (!res.ok) throw new Error("Failed to fetch first response");
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
const BusinessInsights = ({ 
  sessions, 
  dealsCreated, 
  disqualifiedLeads, 
  trafficToDealRate, 
  dealToCloseRate 
}: { 
  sessions: number;
  dealsCreated: number;
  disqualifiedLeads: number;
  trafficToDealRate: string;
  dealToCloseRate: string;
}) => {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 500); }, []);
  
  const getInsights = () => {
    const insights = [];
    
    if (sessions > 0 && parseFloat(trafficToDealRate) < 2) {
      insights.push({
        type: 'warning',
        title: 'Low Traffic-to-Deal Conversion',
        message: `Only ${trafficToDealRate}% of sessions are converting to deals. Landing pages may need optimization.`,
      });
    }
    
    if (dealsCreated > 0 && parseFloat(dealToCloseRate) < 5) {
      insights.push({
        type: 'error',
        title: 'Low Deal Close Rate',
        message: `Only ${dealToCloseRate}% of deals are closing. This may indicate sales team performance issues.`,
      });
    }
    
    if (disqualifiedLeads > 0 && disqualifiedLeads > dealsCreated * 0.3) {
      insights.push({
        type: 'warning',
        title: 'High Disqualification Rate',
        message: `${disqualifiedLeads} deals were disqualified. Consider improving lead qualification process.`,
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

// Live Account Watch Component (RB2B Integration)
const LiveAccountWatch = () => {
  const [loaded, setLoaded] = useState(false);
  const [visitors, setVisitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => { setTimeout(() => setLoaded(true), 550); }, []);
  
  useEffect(() => {
    const fetchVisitors = async () => {
      try {
        const res = await fetch('/api/rb2b/visitors?limit=5');
        if (res.ok) {
          const data = await res.json();
          setVisitors(data.visitors || []);
        }
      } catch (err) {
        console.error('Error fetching RB2B visitors:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVisitors();
    // Refresh every 30 seconds
    const interval = setInterval(fetchVisitors, 30000);
    return () => clearInterval(interval);
  }, []);
  
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };
  
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
          <span style={{
            fontSize: 10,
            color: '#F97316',
            background: 'rgba(249, 115, 22, 0.1)',
            padding: '2px 6px',
            borderRadius: 4,
            fontWeight: 500,
          }}>RB2B</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {visitors.length > 0 && (
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', animation: 'pulse 2s ease-in-out infinite' }} />
          )}
          <span style={{ fontSize: 12, color: visitors.length > 0 ? '#10B981' : '#52525B' }}>
            {visitors.length} Identified
          </span>
        </div>
      </div>
      
      <p style={{ fontSize: 12, color: '#52525B', marginBottom: 16 }}>
        Identified website visitors from RB2B • Auto-refreshes every 30s
      </p>
      
      {loading ? (
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
          <span style={{ fontSize: 13, color: '#52525B' }}>Loading visitors...</span>
        </div>
      ) : visitors.length === 0 ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          padding: 20,
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: 10,
        }}>
          <span style={{ fontSize: 24, opacity: 0.6 }}>👥</span>
          <span style={{ fontSize: 13, color: '#52525B', textAlign: 'center' }}>
            No visitors identified yet. RB2B webhook will push data here when visitors are identified.
          </span>
          <span style={{ fontSize: 11, color: '#3B82F6', marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>
            Webhook: /api/webhooks/rb2b
          </span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflowY: 'auto' }}>
          {visitors.map((visitor, i) => (
            <div key={visitor.id || i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 14px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.04)',
              borderRadius: 10,
              transition: 'all 0.2s ease',
            }}>
              {/* Avatar */}
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: 600,
                color: '#FFF',
              }}>
                {(visitor.firstName?.[0] || visitor.email?.[0] || '?').toUpperCase()}
              </div>
              
              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#E4E4E7', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {visitor.fullName || visitor.email || 'Unknown Visitor'}
                  </span>
                  {visitor.linkedInUrl && (
                    <a href={visitor.linkedInUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#0A66C2', fontSize: 12 }}>
                      in
                    </a>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  {visitor.jobTitle && (
                    <span style={{ fontSize: 11, color: '#71717A' }}>{visitor.jobTitle}</span>
                  )}
                  {visitor.company && (
                    <>
                      <span style={{ fontSize: 11, color: '#52525B' }}>•</span>
                      <span style={{ fontSize: 11, color: '#A1A1AA', fontWeight: 500 }}>{visitor.company}</span>
                    </>
                  )}
                </div>
              </div>
              
              {/* Time */}
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 11, color: '#52525B', fontFamily: "'JetBrains Mono', monospace" }}>
                  {formatTime(visitor.visitedAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
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

  const { data: conversationsData, isLoading: conversationsLoading } = useQuery({
    queryKey: ["hubspot-conversations", dateRange.startDate, dateRange.endDate],
    queryFn: () => fetchConversations(dateRange.startDate, dateRange.endDate),
    refetchInterval: 300000,
  });

  // Fetch deals by stage for new funnel stages
  const { data: dealsCreatedData, isLoading: dealsCreatedLoading } = useQuery({
    queryKey: ["hubspot-deals-created", dateRange.startDate, dateRange.endDate],
    queryFn: () => fetchDealsByStage(dateRange.startDate, dateRange.endDate),
    refetchInterval: 300000,
  });

  const { data: disqualifiedDealsData, isLoading: disqualifiedLoading } = useQuery({
    queryKey: ["hubspot-deals-disqualified", dateRange.startDate, dateRange.endDate],
    queryFn: () => fetchDealsByStage(dateRange.startDate, dateRange.endDate, "143589767"), // Disqualified leads stage ID
    refetchInterval: 300000,
  });

  const { data: requirementsReceivedData, isLoading: requirementsLoading } = useQuery({
    queryKey: ["hubspot-deals-requirements", dateRange.startDate, dateRange.endDate],
    queryFn: () => fetchDealsByStage(dateRange.startDate, dateRange.endDate, "requirements received"),
    refetchInterval: 300000,
  });

  const { data: closedWonDealsData, isLoading: closedWonLoading } = useQuery({
    queryKey: ["hubspot-deals-closedwon", dateRange.startDate, dateRange.endDate],
    queryFn: () => fetchDealsByStage(dateRange.startDate, dateRange.endDate, "143589765"), // Won stage ID
    refetchInterval: 300000,
  });

  // Fetch emails sent (Conversations Started)
  const { data: emailsSentData, isLoading: emailsSentLoading } = useQuery({
    queryKey: ["hubspot-emails-sent", dateRange.startDate, dateRange.endDate],
    queryFn: () => fetchEmailsSent(dateRange.startDate, dateRange.endDate),
    refetchInterval: 300000,
  });

  // Fetch first response (Conversations Initiated)
  const { data: firstResponseData, isLoading: firstResponseLoading } = useQuery({
    queryKey: ["hubspot-first-response", dateRange.startDate, dateRange.endDate],
    queryFn: () => fetchFirstResponse(dateRange.startDate, dateRange.endDate),
    refetchInterval: 300000,
  });

  // Extract data
  const funnel = funnelData?.funnel;
  const conversionRates = funnelData?.conversionRates;
  const overview = ga4Overview?.summary || {};
  const sourceMedium = sourceMediumData?.sourceMedium || [];
  const dealsSummary = hubspotDeals?.summary || {};

  // Calculate metrics - NEW FUNNEL STRUCTURE
  const sessions = overview.sessions || funnel?.level1?.value || 0;
  
  // New funnel stages based on HubSpot deal stages
  const dealsCreated = dealsCreatedData?.summary?.total || 0;
  const disqualifiedLeads = disqualifiedDealsData?.summary?.total || 0;
  const emailsSent = emailsSentData?.emailsSent || 0; // Conversations Started
  const firstResponse = firstResponseData?.firstResponseCount || 0; // Conversations Initiated
  const requirementsReceived = requirementsReceivedData?.summary?.total || 0;
  const closedWonDeals = closedWonDealsData?.summary?.total || 0;
  const closedWonRevenue = closedWonDealsData?.summary?.stageDetails 
    ? Object.values(closedWonDealsData.summary.stageDetails).reduce((sum: number, stage: any) => sum + (stage.totalValue || 0), 0)
    : 0;

  // Calculate conversion rates for new funnel
  const trafficToDealRate = sessions > 0 ? ((dealsCreated / sessions) * 100).toFixed(1) : '0.0';
  const dealToCloseRate = dealsCreated > 0 ? ((closedWonDeals / dealsCreated) * 100).toFixed(1) : '0.0';
  const avgDealValue = closedWonDeals > 0 ? closedWonRevenue / closedWonDeals : 0;
  const valuePerDeal = dealsCreated > 0 ? closedWonRevenue / dealsCreated : 0;
  const pipelineValue = dealsSummary.totalValue || 0;

  // Funnel stages for chart - NEW STRUCTURE
  const funnelStages = [
    { id: 'traffic', label: 'Total Traffic', value: sessions, source: 'GA4', color: '#3B82F6', icon: '👁' },
    { id: 'deals-created', label: 'Deal Created', value: dealsCreated, source: 'HubSpot', color: '#F59E0B', icon: '🤝' },
    { id: 'disqualified', label: 'Disqualified Lead', value: disqualifiedLeads, source: 'HubSpot', color: '#EF4444', icon: '❌' },
    { id: 'conversations-started', label: 'Email Sent', value: emailsSent, source: 'HubSpot', color: '#EC4899', icon: '📧' },
    { id: 'first-response', label: 'Conversations Initiated', value: firstResponse, source: 'HubSpot', color: '#8B5CF6', icon: '💬' },
    { id: 'requirements', label: 'Requirements Received', value: requirementsReceived, source: 'HubSpot', color: '#06B6D4', icon: '📋' },
    { id: 'revenue', label: 'Won', value: closedWonRevenue, source: 'HubSpot', color: '#10B981', icon: '💰' },
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

  const isLoading = funnelLoading || overviewLoading || dealsLoading || conversationsLoading || 
    dealsCreatedLoading || disqualifiedLoading || requirementsLoading || closedWonLoading ||
    emailsSentLoading || firstResponseLoading;

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
        <p style={{ fontSize: 14, color: '#71717A', margin: '8px 0 0' }}>Comprehensive view of your entire customer journey from Traffic → Deal Created → Disqualified → Email Sent → First Response → Requirements → Won</p>
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
          label="Deals Created"
          value={formatNumber(dealsCreated)}
          subtext={`${trafficToDealRate}% conversion rate`}
          icon="🤝"
          color="#F59E0B"
          loading={isLoading}
          delay={50}
        />
        <KPICard
          label="Emails Sent"
          value={formatNumber(emailsSent)}
          subtext="Conversations Started"
          icon="📧"
          color="#EC4899"
          loading={isLoading}
          delay={100}
        />
        <KPICard
          label="Closed-Won Revenue"
          value={`$${formatNumber(closedWonRevenue)}`}
          subtext={`${closedWonDeals} deals closed`}
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
          label="Value per Deal"
          value={`$${formatNumber(valuePerDeal)}`}
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
        leadSources={leadSourcesData?.leadSources || []}
        sourceBreakdown={leadSourcesData?.sourceBreakdown || []}
        topLandingPages={leadSourcesData?.topLandingPages || []}
        summary={leadSourcesData?.summary || { totalLeads: 0, uniqueSources: 0, uniquePages: 0 }}
        dealSources={dealSourcesData?.dealSources || []}
        revenueSources={dealSourcesData?.revenueSources || []}
        dealSummary={dealSourcesData?.summary}
        isLoading={leadSourcesLoading || dealSourcesLoading}
      />
      
      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BusinessInsights 
          sessions={sessions}
          dealsCreated={dealsCreated}
          disqualifiedLeads={disqualifiedLeads}
          trafficToDealRate={trafficToDealRate}
          dealToCloseRate={dealToCloseRate}
        />
        <LiveAccountWatch />
      </div>
    </div>
  );
}
