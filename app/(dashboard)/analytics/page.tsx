"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatNumber } from "@/lib/utils";
import { getComparisonPeriod, formatDateRangeLabel } from "@/lib/dateUtils";

// ============================================
// ANALYTICS PAGE - Deep Dive
// Shows: Acquisition paths, Content, Source/Medium, Events, Technology, Landing Pages
// Does NOT show: Traffic Trend, Traffic Channels, Geo (those are Overview)
// ============================================

// Fetch functions
async function fetchGA4Overview(startDate: string, endDate: string) {
  const res = await fetch(`/api/ga4/overview?startDate=${startDate}&endDate=${endDate}`);
  if (!res.ok) throw new Error("Failed to fetch GA4 overview");
  return res.json();
}

async function fetchGA4Acquisition(startDate: string, endDate: string) {
  const res = await fetch(`/api/ga4/acquisition?startDate=${startDate}&endDate=${endDate}`);
  if (!res.ok) throw new Error("Failed to fetch GA4 acquisition");
  return res.json();
}

async function fetchGA4Content(startDate: string, endDate: string) {
  const res = await fetch(`/api/ga4/content?startDate=${startDate}&endDate=${endDate}`);
  if (!res.ok) throw new Error("Failed to fetch GA4 content");
  return res.json();
}

async function fetchGA4SourceMedium(startDate: string, endDate: string) {
  const res = await fetch(`/api/ga4/source-medium?startDate=${startDate}&endDate=${endDate}`);
  if (!res.ok) throw new Error("Failed to fetch GA4 source/medium");
  return res.json();
}

async function fetchGA4Events(startDate: string, endDate: string) {
  const res = await fetch(`/api/ga4/events?startDate=${startDate}&endDate=${endDate}`);
  if (!res.ok) throw new Error("Failed to fetch GA4 events");
  return res.json();
}

async function fetchGA4Technology(startDate: string, endDate: string) {
  const res = await fetch(`/api/ga4/technology?startDate=${startDate}&endDate=${endDate}`);
  if (!res.ok) throw new Error("Failed to fetch GA4 technology");
  return res.json();
}

async function fetchGA4Pages(startDate: string, endDate: string) {
  const res = await fetch(`/api/ga4/pages?startDate=${startDate}&endDate=${endDate}`);
  if (!res.ok) throw new Error("Failed to fetch GA4 pages");
  return res.json();
}

// Mini KPI Card
const MiniKPICard = ({ 
  label, 
  value, 
  change, 
  icon, 
  loading = false,
  delay = 0 
}: {
  label: string;
  value: string;
  change?: number;
  icon: string;
  loading?: boolean;
  delay?: number;
}) => {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), delay); }, [delay]);
  
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(14, 14, 20, 0.8) 0%, rgba(18, 18, 26, 0.8) 100%)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 12,
      padding: '16px 20px',
      opacity: loaded ? 1 : 0,
      transform: loaded ? 'translateY(0)' : 'translateY(8px)',
      transition: 'all 0.4s ease',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#52525B', textTransform: 'uppercase' }}>{label}</span>
        <span style={{ fontSize: 14 }}>{icon}</span>
      </div>
      {loading ? (
        <div style={{ height: 32, width: 80, background: 'rgba(255,255,255,0.05)', borderRadius: 4, animation: 'pulse 1.5s infinite' }} />
      ) : (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span style={{ fontSize: 26, fontWeight: 700, color: '#FFF', fontFamily: "'JetBrains Mono', monospace" }}>{value}</span>
          {change !== undefined && (
            <span style={{ fontSize: 12, fontWeight: 600, color: change >= 0 ? '#10B981' : '#EF4444' }}>
              {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// Section Header
const SectionHeader = ({ phase, title }: { phase: number; title: string }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    marginTop: 32,
    marginBottom: 16,
    paddingBottom: 14,
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  }}>
    <div style={{
      padding: '5px 10px',
      borderRadius: 5,
      background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
      fontSize: 10,
      fontWeight: 700,
      color: '#FFF',
      textTransform: 'uppercase',
    }}>Phase {phase}</div>
    <span style={{ fontSize: 16, fontWeight: 600, color: '#FFF' }}>{title}</span>
  </div>
);

// Value with Change
const ValueCell = ({ value, change }: { value: string | number; change?: number }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
    <span style={{ fontSize: 14, fontWeight: 600, color: '#FFF', fontFamily: "'JetBrains Mono', monospace" }}>{value}</span>
    {change !== undefined && (
      <span style={{ fontSize: 10, color: change >= 0 ? '#10B981' : '#EF4444' }}>
        {change >= 0 ? '↑' : '↓'}{Math.abs(change).toFixed(1)}%
      </span>
    )}
  </div>
);

// Acquisition Path Table
const AcquisitionPathTable = ({ data, loading }: { data: any[]; loading: boolean }) => {
  const sourceColors: Record<string, string> = {
    google: '#4285F4',
    reddit: '#FF4500',
    '(direct)': '#64748B',
    bing: '#00897B',
  };
  
  if (loading) {
    return (
      <div style={{
        background: 'rgba(14, 14, 20, 0.8)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 12,
        padding: 20,
        height: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{ color: '#71717A' }}>Loading acquisition data...</span>
      </div>
    );
  }
  
  const sortedData = [...data].sort((a, b) => (b.users || 0) - (a.users || 0)).slice(0, 6);
  
  return (
    <div style={{
      background: 'rgba(14, 14, 20, 0.8)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 12,
      overflow: 'hidden',
    }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#FFF', margin: 0 }}>User Acquisition Path (First Touch)</h3>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '80px 70px 1fr 90px', gap: 12, padding: '10px 20px', background: 'rgba(255,255,255,0.02)' }}>
        {['Source', 'Medium', 'Campaign', 'Users'].map((h, i) => (
          <span key={h} style={{ fontSize: 10, fontWeight: 600, color: '#52525B', textTransform: 'uppercase', textAlign: i === 3 ? 'right' : 'left' }}>{h}</span>
        ))}
      </div>
      
      {sortedData.length === 0 ? (
        <div style={{ padding: 20, textAlign: 'center', color: '#71717A' }}>No acquisition data available</div>
      ) : (
        sortedData.map((row, i) => (
          <div key={i} style={{
            display: 'grid',
            gridTemplateColumns: '80px 70px 1fr 90px',
            gap: 12,
            padding: '12px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.03)',
            alignItems: 'center',
          }}>
            <span style={{
              padding: '3px 8px',
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 600,
              background: `${sourceColors[(row.source || '').toLowerCase()] || '#3B82F6'}20`,
              color: sourceColors[(row.source || '').toLowerCase()] || '#3B82F6',
              width: 'fit-content',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%',
            }}>{row.source || '(not set)'}</span>
            <span style={{ fontSize: 12, color: '#71717A', fontFamily: "'JetBrains Mono', monospace" }}>{row.medium || '(none)'}</span>
            <span style={{ fontSize: 12, color: '#A1A1AA', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.campaign || '(not set)'}</span>
            <ValueCell value={formatNumber(row.users || 0)} change={row.change} />
          </div>
        ))
      )}
    </div>
  );
};

// Content Performance Table
const ContentPerformanceTable = ({ data, loading }: { data: any[]; loading: boolean }) => {
  const getColor = (v: number) => v >= 60 ? '#10B981' : v >= 40 ? '#F59E0B' : '#F97316';
  
  if (loading) {
    return (
      <div style={{
        background: 'rgba(14, 14, 20, 0.8)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 12,
        padding: 20,
        height: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{ color: '#71717A' }}>Loading content data...</span>
      </div>
    );
  }
  
  const sortedData = [...data].sort((a, b) => (b.users || 0) - (a.users || 0)).slice(0, 5);
  
  return (
    <div style={{
      background: 'rgba(14, 14, 20, 0.8)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 12,
      overflow: 'hidden',
    }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#FFF', margin: 0 }}>Content Performance</h3>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 70px 70px 90px', gap: 12, padding: '10px 20px', background: 'rgba(255,255,255,0.02)' }}>
        {['Page', 'Users', 'Views', 'Engagement'].map((h, i) => (
          <span key={h} style={{ fontSize: 10, fontWeight: 600, color: '#52525B', textTransform: 'uppercase', textAlign: i > 0 ? 'right' : 'left' }}>{h}</span>
        ))}
      </div>
      
      {sortedData.length === 0 ? (
        <div style={{ padding: 20, textAlign: 'center', color: '#71717A' }}>No content data available</div>
      ) : (
        sortedData.map((row, i) => {
          const engagement = row.engagementRate ? row.engagementRate * 100 : 0;
          return (
            <div key={i} style={{
              display: 'grid',
              gridTemplateColumns: '1fr 70px 70px 90px',
              gap: 12,
              padding: '12px 20px',
              borderBottom: '1px solid rgba(255,255,255,0.03)',
              alignItems: 'center',
            }}>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: 13, color: '#E4E4E7', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.title || row.pagePath || 'Unknown'}</div>
                <div style={{ fontSize: 10, color: '#52525B', fontFamily: "'JetBrains Mono', monospace", marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.pagePath || ''}</div>
              </div>
              <span style={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace", color: '#FFF', textAlign: 'right' }}>{formatNumber(row.users || 0)}</span>
              <span style={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace", color: '#A1A1AA', textAlign: 'right' }}>{formatNumber(row.pageViews || 0)}</span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                  <div style={{ width: `${Math.min(engagement, 100)}%`, height: '100%', background: getColor(engagement), borderRadius: 2 }} />
                </div>
                <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: getColor(engagement), minWidth: 35 }}>{engagement.toFixed(1)}%</span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

// Source/Medium Table
const SourceMediumTable = ({ data, loading }: { data: any[]; loading: boolean }) => {
  if (loading) {
    return (
      <div style={{
        background: 'rgba(14, 14, 20, 0.8)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 12,
        padding: 20,
        height: 250,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{ color: '#71717A' }}>Loading source/medium data...</span>
      </div>
    );
  }
  
  const sortedData = [...data].sort((a, b) => (b.users || 0) - (a.users || 0)).slice(0, 5);
  
  return (
    <div style={{
      background: 'rgba(14, 14, 20, 0.8)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 12,
      overflow: 'hidden',
    }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#FFF', margin: 0 }}>Source / Medium Breakdown</h3>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '80px 80px 90px 90px 90px', gap: 12, padding: '10px 20px', background: 'rgba(255,255,255,0.02)' }}>
        {['Source', 'Medium', 'Users', 'Sessions', 'Engagement'].map((h, i) => (
          <span key={h} style={{ fontSize: 10, fontWeight: 600, color: '#52525B', textTransform: 'uppercase', textAlign: i > 1 ? 'right' : 'left' }}>{h}</span>
        ))}
      </div>
      
      {sortedData.length === 0 ? (
        <div style={{ padding: 20, textAlign: 'center', color: '#71717A' }}>No source/medium data available</div>
      ) : (
        sortedData.map((row, i) => (
          <div key={i} style={{
            display: 'grid',
            gridTemplateColumns: '80px 80px 90px 90px 90px',
            gap: 12,
            padding: '12px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.03)',
            alignItems: 'center',
          }}>
            <span style={{ fontSize: 12, color: '#E4E4E7', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.source || '(direct)'}</span>
            <span style={{ fontSize: 12, color: '#71717A', fontFamily: "'JetBrains Mono', monospace" }}>{row.medium || '(none)'}</span>
            <ValueCell value={formatNumber(row.users || 0)} change={row.change} />
            <span style={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace", color: '#A1A1AA', textAlign: 'right' }}>{formatNumber(row.sessions || 0)}</span>
            <span style={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace", color: '#A1A1AA', textAlign: 'right' }}>{((row.engagementRate || 0) * 100).toFixed(1)}%</span>
          </div>
        ))
      )}
    </div>
  );
};

// Browser Chart
const BrowserChart = ({ data, loading }: { data: any[]; loading: boolean }) => {
  const colors: Record<string, string> = { 
    Chrome: '#4285F4', 
    'Android Webview': '#3DDC84', 
    Edge: '#0078D7', 
    Opera: '#FF1B2D', 
    Safari: '#5AC8FA', 
    Firefox: '#FF7139' 
  };
  
  if (loading || !data || data.length === 0) {
    return (
      <div style={{
        background: 'rgba(14, 14, 20, 0.8)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 12,
        padding: 20,
        height: 250,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{ color: '#71717A' }}>{loading ? 'Loading technology data...' : 'No browser data available'}</span>
      </div>
    );
  }
  
  const maxUsers = Math.max(...data.map(d => d.users || 0));
  const sortedData = [...data].sort((a, b) => (b.users || 0) - (a.users || 0)).slice(0, 6);
  
  return (
    <div style={{
      background: 'rgba(14, 14, 20, 0.8)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 12,
      padding: 20,
    }}>
      <h3 style={{ fontSize: 14, fontWeight: 600, color: '#FFF', margin: '0 0 16px' }}>Technology (Browsers)</h3>
      
      {sortedData.map((item, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <span style={{ width: 100, fontSize: 12, color: '#A1A1AA', textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.browser || 'Unknown'}</span>
          <div style={{ flex: 1, height: 20, background: 'rgba(255,255,255,0.03)', borderRadius: 4 }}>
            <div style={{ width: `${((item.users || 0) / maxUsers) * 100}%`, height: '100%', background: colors[item.browser] || '#3B82F6', borderRadius: 4 }} />
          </div>
          <span style={{ width: 50, fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: '#71717A', textAlign: 'right' }}>
            {(item.users || 0) >= 1000 ? ((item.users || 0)/1000).toFixed(1) + 'K' : (item.users || 0)}
          </span>
        </div>
      ))}
    </div>
  );
};

// Top Events Table
const TopEventsTable = ({ data, loading }: { data: any[]; loading: boolean }) => {
  const icons: Record<string, string> = {
    page_view: '📄',
    session_start: '🚀',
    first_visit: '👋',
    user_engagement: '⚡',
    Lead_Generated_All_Sites: '🎯',
    click: '👆',
    scroll: '📜',
    form_submit: '📝',
  };
  
  if (loading) {
    return (
      <div style={{
        background: 'rgba(14, 14, 20, 0.8)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 12,
        padding: 20,
        height: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{ color: '#71717A' }}>Loading events data...</span>
      </div>
    );
  }
  
  const sortedData = [...data].sort((a, b) => (b.eventCount || 0) - (a.eventCount || 0)).slice(0, 5);
  
  return (
    <div style={{
      background: 'rgba(14, 14, 20, 0.8)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 12,
      overflow: 'hidden',
    }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#FFF', margin: 0 }}>Top Events</h3>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 90px 80px', gap: 12, padding: '10px 20px', background: 'rgba(255,255,255,0.02)' }}>
        {['Event', 'Count', 'Users', 'Conv.'].map((h, i) => (
          <span key={h} style={{ fontSize: 10, fontWeight: 600, color: '#52525B', textTransform: 'uppercase', textAlign: i > 0 ? 'right' : 'left' }}>{h}</span>
        ))}
      </div>
      
      {sortedData.length === 0 ? (
        <div style={{ padding: 20, textAlign: 'center', color: '#71717A' }}>No events data available</div>
      ) : (
        sortedData.map((event, i) => (
          <div key={i} style={{
            display: 'grid',
            gridTemplateColumns: '1fr 100px 90px 80px',
            gap: 12,
            padding: '12px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.03)',
            alignItems: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 14 }}>{icons[event.eventName] || '📊'}</span>
              <span style={{ fontSize: 13, color: '#E4E4E7' }}>{(event.eventName || '').replace(/_/g, ' ')}</span>
            </div>
            <ValueCell value={formatNumber(event.eventCount || 0)} change={event.change} />
            <span style={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace", color: '#A1A1AA', textAlign: 'right' }}>{formatNumber(event.users || 0)}</span>
            <span style={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace", color: (event.conversions || 0) > 0 ? '#10B981' : '#52525B', textAlign: 'right' }}>{event.conversions || 0}</span>
          </div>
        ))
      )}
    </div>
  );
};

// Landing Pages Table
const LandingPagesTable = ({ data, loading }: { data: any[]; loading: boolean }) => {
  const getColor = (v: number) => v >= 60 ? '#10B981' : v >= 40 ? '#F59E0B' : '#F97316';
  
  if (loading) {
    return (
      <div style={{
        background: 'rgba(14, 14, 20, 0.8)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 12,
        padding: 20,
        height: 350,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{ color: '#71717A' }}>Loading landing pages...</span>
      </div>
    );
  }
  
  const sortedData = [...data].sort((a, b) => (b.users || 0) - (a.users || 0)).slice(0, 8);
  
  return (
    <div style={{
      background: 'rgba(14, 14, 20, 0.8)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 12,
      overflow: 'hidden',
    }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#FFF', margin: 0 }}>Top Landing Pages</h3>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 90px', gap: 12, padding: '10px 20px', background: 'rgba(255,255,255,0.02)' }}>
        {['Page', 'Users', 'Views', 'Engagement'].map((h, i) => (
          <span key={h} style={{ fontSize: 10, fontWeight: 600, color: '#52525B', textTransform: 'uppercase', textAlign: i > 0 ? 'right' : 'left' }}>{h}</span>
        ))}
      </div>
      
      {sortedData.length === 0 ? (
        <div style={{ padding: 20, textAlign: 'center', color: '#71717A' }}>No landing page data available</div>
      ) : (
        sortedData.map((row, i) => {
          const engagement = row.engagementRate ? row.engagementRate * 100 : 0;
          return (
            <div key={i} style={{
              display: 'grid',
              gridTemplateColumns: '1fr 80px 80px 90px',
              gap: 12,
              padding: '12px 20px',
              borderBottom: '1px solid rgba(255,255,255,0.03)',
              alignItems: 'center',
            }}>
              <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: '#A1A1AA', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.pagePath || row.landingPage || '/'}</span>
              <span style={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace", color: '#FFF', textAlign: 'right' }}>{formatNumber(row.users || 0)}</span>
              <span style={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace", color: '#A1A1AA', textAlign: 'right' }}>{formatNumber(row.pageViews || row.views || 0)}</span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                  <div style={{ width: `${Math.min(engagement, 100)}%`, height: '100%', background: getColor(engagement), borderRadius: 2 }} />
                </div>
                <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: getColor(engagement), minWidth: 35 }}>{engagement.toFixed(1)}%</span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string }>(() => {
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
        const days = saved ? parseInt(saved) : 7;
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
    start.setDate(start.getDate() - 7);
    return {
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    };
  });

  const comparisonPeriod = getComparisonPeriod(dateRange);

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
        const days = saved ? parseInt(saved) : 7;
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - days);
        setDateRange({
          startDate: start.toISOString().split("T")[0],
          endDate: end.toISOString().split("T")[0],
        });
      }
    };

    window.addEventListener("dateRangeChange", handleDateRangeChange);
    return () => window.removeEventListener("dateRangeChange", handleDateRangeChange);
  }, []);

  // Data queries
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ["ga4-overview", dateRange.startDate, dateRange.endDate],
    queryFn: () => fetchGA4Overview(dateRange.startDate, dateRange.endDate),
  });

  const { data: prevOverview } = useQuery({
    queryKey: ["ga4-overview-prev", comparisonPeriod.startDate, comparisonPeriod.endDate],
    queryFn: () => fetchGA4Overview(comparisonPeriod.startDate, comparisonPeriod.endDate),
  });

  const { data: acquisition, isLoading: acquisitionLoading } = useQuery({
    queryKey: ["ga4-acquisition", dateRange.startDate, dateRange.endDate],
    queryFn: () => fetchGA4Acquisition(dateRange.startDate, dateRange.endDate),
  });

  const { data: content, isLoading: contentLoading } = useQuery({
    queryKey: ["ga4-content", dateRange.startDate, dateRange.endDate],
    queryFn: () => fetchGA4Content(dateRange.startDate, dateRange.endDate),
  });

  const { data: sourceMedium, isLoading: sourceMediumLoading } = useQuery({
    queryKey: ["ga4-source-medium", dateRange.startDate, dateRange.endDate],
    queryFn: () => fetchGA4SourceMedium(dateRange.startDate, dateRange.endDate),
  });

  const { data: technology, isLoading: technologyLoading } = useQuery({
    queryKey: ["ga4-technology", dateRange.startDate, dateRange.endDate],
    queryFn: () => fetchGA4Technology(dateRange.startDate, dateRange.endDate),
  });

  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ["ga4-events", dateRange.startDate, dateRange.endDate],
    queryFn: () => fetchGA4Events(dateRange.startDate, dateRange.endDate),
  });

  const { data: pages, isLoading: pagesLoading } = useQuery({
    queryKey: ["ga4-pages", dateRange.startDate, dateRange.endDate],
    queryFn: () => fetchGA4Pages(dateRange.startDate, dateRange.endDate),
  });

  // Calculate changes
  const summary = overview?.summary;
  const prevSummary = prevOverview?.summary;
  
  const calcChange = (current: number, previous: number) => {
    if (!previous || previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const usersChange = summary && prevSummary ? calcChange(summary.totalUsers, prevSummary.totalUsers) : undefined;
  const sessionsChange = summary && prevSummary ? calcChange(summary.sessions, prevSummary.sessions) : undefined;
  const pageViewsChange = summary && prevSummary ? calcChange(summary.pageViews, prevSummary.pageViews) : undefined;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Fonts and animations */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
      `}</style>
      
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#FFF', margin: 0 }}>Analytics</h1>
        <p style={{ fontSize: 13, color: '#71717A', margin: '6px 0 0' }}>
          {formatDateRangeLabel(dateRange)} vs {formatDateRangeLabel(comparisonPeriod)}
        </p>
      </div>
      
      {/* Mini KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MiniKPICard
          label="Total Users"
          value={overviewLoading ? '...' : formatNumber(summary?.totalUsers || 0)}
          change={usersChange}
          icon="👥"
          loading={overviewLoading}
          delay={0}
        />
        <MiniKPICard
          label="Sessions"
          value={overviewLoading ? '...' : formatNumber(summary?.sessions || 0)}
          change={sessionsChange}
          icon="📊"
          loading={overviewLoading}
          delay={50}
        />
        <MiniKPICard
          label="Page Views"
          value={overviewLoading ? '...' : formatNumber(summary?.pageViews || 0)}
          change={pageViewsChange}
          icon="📄"
          loading={overviewLoading}
          delay={100}
        />
        <MiniKPICard
          label="Engagement Rate"
          value={overviewLoading ? '...' : `${((summary?.engagementRate || 0) * 100).toFixed(1)}%`}
          icon="⚡"
          loading={overviewLoading}
          delay={150}
        />
      </div>
      
      {/* Phase 1: User Acquisition */}
      <SectionHeader phase={1} title="User Acquisition & Content" />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AcquisitionPathTable data={acquisition?.acquisition || []} loading={acquisitionLoading} />
        <ContentPerformanceTable data={content?.content || []} loading={contentLoading} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SourceMediumTable data={sourceMedium?.sourceMedium || []} loading={sourceMediumLoading} />
        <BrowserChart data={technology?.browsers || []} loading={technologyLoading} />
      </div>
      
      {/* Phase 2: Events & Landing Pages */}
      <SectionHeader phase={2} title="Events & Landing Pages" />
      
      <TopEventsTable data={events?.events || []} loading={eventsLoading} />
      
      <LandingPagesTable data={pages?.pages || []} loading={pagesLoading} />
    </div>
  );
}
