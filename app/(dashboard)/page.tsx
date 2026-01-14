"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ApiStatus } from "@/components/dashboard/ApiStatus";
import { formatNumber } from "@/lib/utils";
import { FlagEmoji, getCountryCodeFromName } from "@/components/ui/FlagEmoji";

// ============================================
// OVERVIEW PAGE - Executive Dashboard
// Shows: High-level KPIs, Traffic Trend, Channels, Geo, Traffic Sources
// Does NOT show: Landing Pages, Events, Demographics (those are Analytics)
// ============================================

async function fetchGA4Overview(startDate: string, endDate: string) {
  const res = await fetch(`/api/ga4/overview?startDate=${startDate}&endDate=${endDate}`);
  if (!res.ok) throw new Error("Failed to fetch GA4 overview");
  return res.json();
}

async function fetchGA4Channels(startDate: string, endDate: string) {
  const res = await fetch(`/api/ga4/traffic?startDate=${startDate}&endDate=${endDate}`);
  if (!res.ok) throw new Error("Failed to fetch GA4 channels");
  return res.json();
}

async function fetchGA4Geography(startDate: string, endDate: string) {
  const res = await fetch(`/api/ga4/geography?startDate=${startDate}&endDate=${endDate}`);
  if (!res.ok) throw new Error("Failed to fetch GA4 geography");
  return res.json();
}

async function fetchHubSpotDeals() {
  const res = await fetch("/api/hubspot/deals");
  if (!res.ok) throw new Error("Failed to fetch HubSpot deals");
  return res.json();
}

async function fetchGA4FluidFusion(startDate: string, endDate: string) {
  const res = await fetch(`/api/ga4/fluid-fusion?startDate=${startDate}&endDate=${endDate}`);
  if (!res.ok) throw new Error("Failed to fetch GA4 traffic data");
  return res.json();
}

// KPI Card Component
const KPICard = ({ 
  label, 
  value, 
  change, 
  icon, 
  color, 
  invertChange = false, 
  loading = false,
  delay = 0 
}: {
  label: string;
  value: string;
  change?: number;
  icon: string;
  color: string;
  invertChange?: boolean;
  loading?: boolean;
  delay?: number;
}) => {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), delay); }, [delay]);
  
  const isPositive = invertChange ? (change || 0) < 0 : (change || 0) > 0;
  
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(14, 14, 20, 0.8) 0%, rgba(18, 18, 26, 0.8) 100%)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 14,
      padding: '20px 24px',
      position: 'relative',
      opacity: loaded ? 1 : 0,
      transform: loaded ? 'translateY(0)' : 'translateY(10px)',
      transition: 'all 0.4s ease',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 24, right: 24, height: 2, background: `linear-gradient(90deg, transparent, ${color}, transparent)`, opacity: 0.6 }} />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
        <span style={{ fontSize: 16 }}>{icon}</span>
      </div>
      
      {loading ? (
        <div style={{ height: 40, width: 100, background: 'rgba(255,255,255,0.05)', borderRadius: 6, animation: 'pulse 1.5s infinite' }} />
      ) : (
        <div style={{ fontSize: 32, fontWeight: 700, color: '#FFF', fontFamily: "'JetBrains Mono', monospace" }}>{value}</div>
      )}
      
      {change !== undefined && !loading && (
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          marginTop: 12,
          padding: '5px 10px',
          borderRadius: 100,
          fontSize: 12,
          fontWeight: 600,
          background: isPositive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
          color: isPositive ? '#10B981' : '#EF4444',
        }}>
          {isPositive ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
          <span style={{ color: '#52525B', fontWeight: 400, marginLeft: 4 }}>vs last week</span>
        </div>
      )}
    </div>
  );
};

// Traffic Trend Chart Component
const TrafficTrendChart = ({ data, loading }: { data: any[]; loading: boolean }) => {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 200); }, []);
  
  if (loading || data.length === 0) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, rgba(14, 14, 20, 0.8) 0%, rgba(18, 18, 26, 0.8) 100%)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 14,
        padding: 24,
        height: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{ color: '#71717A' }}>{loading ? 'Loading traffic data...' : 'No trend data available'}</span>
      </div>
    );
  }
  
  const maxValue = Math.max(...data.map(d => Math.max(d.sessions || 0, d.totalUsers || 0)));
  const height = 200;
  const width = 100;
  
  const getY = (value: number) => height - (value / maxValue) * height;
  
  const formatDate = (dateStr: string) => {
    if (dateStr.length === 8) {
      const month = dateStr.substring(4, 6);
      const day = dateStr.substring(6, 8);
      return `${parseInt(month)}/${parseInt(day)}`;
    }
    return dateStr;
  };
  
  const sessionsPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${(i / (data.length - 1)) * width} ${getY(d.sessions || 0)}`).join(' ');
  const usersPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${(i / (data.length - 1)) * width} ${getY(d.totalUsers || 0)}`).join(' ');
  const sessionsArea = sessionsPath + ` L ${width} ${height} L 0 ${height} Z`;
  
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(14, 14, 20, 0.8) 0%, rgba(18, 18, 26, 0.8) 100%)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 14,
      padding: 24,
      opacity: loaded ? 1 : 0,
      transition: 'all 0.5s ease',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#FFF', margin: 0 }}>Traffic Trend</h3>
        <div style={{ display: 'flex', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 12, height: 3, borderRadius: 2, background: '#10B981' }} />
            <span style={{ fontSize: 12, color: '#71717A' }}>Sessions</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 12, height: 3, borderRadius: 2, background: '#3B82F6' }} />
            <span style={{ fontSize: 12, color: '#71717A' }}>Users</span>
          </div>
        </div>
      </div>
      
      <div style={{ position: 'relative', height: 220 }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 30, width: 40, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          {[maxValue, Math.round(maxValue * 0.5), 0].map((v, i) => (
            <span key={i} style={{ fontSize: 11, color: '#52525B', fontFamily: "'JetBrains Mono', monospace" }}>
              {v >= 1000 ? (v/1000).toFixed(1) + 'K' : v}
            </span>
          ))}
        </div>
        
        <div style={{ marginLeft: 50, height: 200, position: 'relative' }}>
          <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%' }} preserveAspectRatio="none">
            <defs>
              <linearGradient id="sessionsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <path d={sessionsArea} fill="url(#sessionsGrad)" />
            <path d={sessionsPath} fill="none" stroke="#10B981" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
            <path d={usersPath} fill="none" stroke="#3B82F6" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>
        
        <div style={{ marginLeft: 50, display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          {data.filter((_, i) => i % Math.ceil(data.length / 7) === 0 || i === data.length - 1).map((d, i) => (
            <span key={i} style={{ fontSize: 11, color: '#52525B' }}>{formatDate(d.date)}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

// Traffic Channels Component
const TrafficChannels = ({ data, loading }: { data: any[]; loading: boolean }) => {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 300); }, []);
  
  if (loading || data.length === 0) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, rgba(14, 14, 20, 0.8) 0%, rgba(18, 18, 26, 0.8) 100%)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 14,
        padding: 24,
        height: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{ color: '#71717A' }}>{loading ? 'Loading channels...' : 'No channel data available'}</span>
      </div>
    );
  }
  
  const colors = ['#10B981', '#8B5CF6', '#64748B', '#F59E0B', '#06B6D4', '#3F3F46', '#F43F5E'];
  const maxValue = Math.max(...data.map(d => d.users || 0));
  const sortedData = [...data].sort((a, b) => (b.users || 0) - (a.users || 0)).slice(0, 7);
  
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(14, 14, 20, 0.8) 0%, rgba(18, 18, 26, 0.8) 100%)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 14,
      padding: 24,
      opacity: loaded ? 1 : 0,
      transition: 'all 0.5s ease',
    }}>
      <h3 style={{ fontSize: 16, fontWeight: 600, color: '#FFF', margin: '0 0 20px' }}>Traffic Channels</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {sortedData.map((channel, i) => (
          <div key={channel.channel} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 110, fontSize: 13, color: '#A1A1AA', textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {channel.channel}
            </span>
            <div style={{ flex: 1, height: 24, background: 'rgba(255,255,255,0.03)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{
                width: loaded ? `${((channel.users || 0) / maxValue) * 100}%` : '0%',
                height: '100%',
                background: colors[i % colors.length],
                borderRadius: 4,
                transition: `width 0.6s ease ${i * 0.05}s`,
              }} />
            </div>
            <span style={{ width: 50, fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: '#71717A', textAlign: 'right' }}>
              {(channel.users || 0) >= 1000 ? ((channel.users || 0)/1000).toFixed(1) + 'K' : (channel.users || 0)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Geographic Distribution Component
const GeoDistribution = ({ data, loading }: { data: any[]; loading: boolean }) => {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 350); }, []);
  
  if (loading || data.length === 0) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, rgba(14, 14, 20, 0.8) 0%, rgba(18, 18, 26, 0.8) 100%)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 14,
        padding: 24,
        height: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{ color: '#71717A' }}>{loading ? 'Loading geography...' : 'No geographic data available'}</span>
      </div>
    );
  }
  
  const sortedData = [...data].sort((a, b) => (b.users || 0) - (a.users || 0)).slice(0, 6);
  const maxUsers = Math.max(...sortedData.map(d => d.users || 0));
  
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(14, 14, 20, 0.8) 0%, rgba(18, 18, 26, 0.8) 100%)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 14,
      padding: 24,
      opacity: loaded ? 1 : 0,
      transition: 'all 0.5s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <span style={{ fontSize: 18 }}>🌍</span>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#FFF', margin: 0 }}>Geographic Distribution</h3>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 70px 70px', gap: 0, marginBottom: 8, padding: '0 0 8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <span style={{ fontSize: 11, color: '#52525B', textTransform: 'uppercase' }}>Country</span>
        <span style={{ fontSize: 11, color: '#52525B', textTransform: 'uppercase', textAlign: 'right' }}>Users</span>
        <span style={{ fontSize: 11, color: '#52525B', textTransform: 'uppercase', textAlign: 'right' }}>Sessions</span>
      </div>
      
      {sortedData.map((country, i) => {
        const countryCode = country.countryCode || getCountryCodeFromName(country.country);
        return (
          <div key={country.country} style={{
            display: 'grid',
            gridTemplateColumns: '1fr 70px 70px',
            gap: 12,
            padding: '10px 0',
            borderBottom: '1px solid rgba(255,255,255,0.03)',
            alignItems: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <FlagEmoji countryCode={countryCode} size={20} />
              <div>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#E4E4E7' }}>{country.country}</span>
                <div style={{ marginTop: 4, height: 3, width: 80, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                  <div style={{ width: `${((country.users || 0) / maxUsers) * 100}%`, height: '100%', background: '#3B82F6', borderRadius: 2 }} />
                </div>
              </div>
            </div>
            <span style={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace", color: '#A1A1AA', textAlign: 'right' }}>{formatNumber(country.users || 0)}</span>
            <span style={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace", color: '#71717A', textAlign: 'right' }}>{formatNumber(country.sessions || 0)}</span>
          </div>
        );
      })}
    </div>
  );
};

// Traffic Source Card Component
const TrafficSourceCard = ({ 
  platform, 
  data, 
  delay 
}: { 
  platform: 'reddit' | 'google' | 'direct'; 
  data: { impressions: number; clicks: number; conversions: number; revenue: number; sessions?: number };
  delay: number;
}) => {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), delay); }, [delay]);
  
  const configs = {
    reddit: { name: 'Reddit', icon: '🔴', color: '#FF4500' },
    google: { name: 'Google Ads', icon: '🔍', color: '#4285F4' },
    direct: { name: 'Website/Direct', icon: '🌐', color: '#10B981' },
  };
  const config = configs[platform];
  
  const ctr = data.impressions > 0 ? ((data.clicks / data.impressions) * 100).toFixed(2) : '0.00';
  
  return (
    <div style={{
      background: `linear-gradient(135deg, ${config.color}08 0%, transparent 100%)`,
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 14,
      padding: 20,
      position: 'relative',
      opacity: loaded ? 1 : 0,
      transition: 'all 0.5s ease',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: config.color, opacity: 0.7 }} />
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 14 }}>{config.icon}</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#FFF' }}>{config.name}</span>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 20px' }}>
        <div>
          <span style={{ fontSize: 10, color: '#52525B', textTransform: 'uppercase' }}>Traffic</span>
          <div style={{ fontSize: 18, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", color: '#FFF' }}>
            {data.impressions >= 1000 ? (data.impressions / 1000).toFixed(1) + 'K' : data.impressions}
          </div>
        </div>
        <div>
          <span style={{ fontSize: 10, color: '#52525B', textTransform: 'uppercase' }}>Clicks</span>
          <div style={{ fontSize: 18, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", color: '#FFF' }}>
            {data.clicks >= 1000 ? (data.clicks / 1000).toFixed(1) + 'K' : data.clicks}
          </div>
        </div>
        <div>
          <span style={{ fontSize: 10, color: '#52525B', textTransform: 'uppercase' }}>Conversions</span>
          <div style={{ fontSize: 18, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", color: '#10B981' }}>{data.conversions}</div>
        </div>
        <div>
          <span style={{ fontSize: 10, color: '#52525B', textTransform: 'uppercase' }}>CTR</span>
          <div style={{ fontSize: 18, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", color: '#F59E0B' }}>{ctr}%</div>
        </div>
      </div>
    </div>
  );
};

export default function DashboardPage() {
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

  const { data: ga4Overview, isLoading: ga4Loading } = useQuery({
    queryKey: ["ga4-overview", dateRange.startDate, dateRange.endDate],
    queryFn: () => fetchGA4Overview(dateRange.startDate, dateRange.endDate),
    refetchInterval: 300000,
  });

  const { data: ga4Channels, isLoading: channelsLoading } = useQuery({
    queryKey: ["ga4-channels", dateRange.startDate, dateRange.endDate],
    queryFn: () => fetchGA4Channels(dateRange.startDate, dateRange.endDate),
    refetchInterval: 300000,
  });

  const { data: ga4Geography, isLoading: geoLoading } = useQuery({
    queryKey: ["ga4-geography", dateRange.startDate, dateRange.endDate],
    queryFn: () => fetchGA4Geography(dateRange.startDate, dateRange.endDate),
    refetchInterval: 300000,
  });

  const { data: hubspotDeals, isLoading: dealsLoading } = useQuery({
    queryKey: ["hubspot-deals"],
    queryFn: fetchHubSpotDeals,
    refetchInterval: 300000,
  });

  const { data: fluidFusionData, isLoading: fluidFusionLoading } = useQuery({
    queryKey: ["ga4-fluid-fusion", dateRange.startDate, dateRange.endDate],
    queryFn: () => fetchGA4FluidFusion(dateRange.startDate, dateRange.endDate),
    refetchInterval: 300000,
  });

  const summary = ga4Overview?.summary;
  const trend = ga4Overview?.trend || [];
  const channels = ga4Channels?.byChannel || [];
  const countries = ga4Geography?.countries || [];
  const pipelineValue = hubspotDeals?.summary?.totalValue || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* JetBrains Mono font for numbers */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
      `}</style>
      
      {/* API Status */}
      <ApiStatus />
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Total Users"
          value={ga4Loading ? '...' : formatNumber(summary?.totalUsers || 0)}
          change={13.5}
          icon="👥"
          color="#3B82F6"
          loading={ga4Loading}
          delay={0}
        />
        <KPICard
          label="Sessions"
          value={ga4Loading ? '...' : formatNumber(summary?.sessions || 0)}
          change={8.2}
          icon="📊"
          color="#10B981"
          loading={ga4Loading}
          delay={50}
        />
        <KPICard
          label="Bounce Rate"
          value={ga4Loading ? '...' : `${((summary?.bounceRate || 0) * 100).toFixed(1)}%`}
          change={-2.1}
          icon="📉"
          color="#F59E0B"
          invertChange={true}
          loading={ga4Loading}
          delay={100}
        />
        <KPICard
          label="Pipeline Value"
          value={dealsLoading ? '...' : `$${formatNumber(pipelineValue)}`}
          change={15.8}
          icon="💰"
          color="#8B5CF6"
          loading={dealsLoading}
          delay={150}
        />
      </div>
      
      {/* Traffic Trend */}
      <TrafficTrendChart data={trend} loading={ga4Loading} />
      
      {/* Channels + Geo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TrafficChannels data={channels} loading={channelsLoading} />
        <GeoDistribution data={countries} loading={geoLoading} />
      </div>
      
      {/* Total Traffic Section */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(14, 14, 20, 0.8) 0%, rgba(18, 18, 26, 0.8) 100%)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 14,
        padding: 24,
      }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, color: '#FFF', margin: '0 0 4px' }}>Total Traffic</h3>
        <p style={{ fontSize: 13, color: '#52525B', margin: '0 0 20px' }}>Traffic and conversions from Reddit, Google Ads, and Website/Direct</p>
        
        {fluidFusionLoading ? (
          <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#71717A' }}>Loading traffic data...</span>
          </div>
        ) : fluidFusionData ? (
          <>
            {/* Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
              {[
                { label: 'Total Traffic', value: fluidFusionData.total?.impressions || 0, color: '#3B82F6' },
                { label: 'Total Clicks', value: fluidFusionData.total?.clicks || 0, color: '#8B5CF6' },
                { label: 'Total Conversions', value: fluidFusionData.total?.conversions || 0, color: '#10B981' },
                { label: 'Total Revenue', value: fluidFusionData.total?.revenue || 0, color: '#F59E0B', prefix: '$' },
              ].map(m => (
                <div key={m.label} style={{ padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 10 }}>
                  <span style={{ fontSize: 10, color: '#52525B', textTransform: 'uppercase' }}>{m.label}</span>
                  <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: m.color, marginTop: 6 }}>
                    {m.prefix || ''}{typeof m.value === 'number' && m.value >= 1000 ? (m.value / 1000).toFixed(1) + 'K' : m.value}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Source Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TrafficSourceCard 
                platform="reddit" 
                data={{
                  impressions: fluidFusionData.reddit?.impressions || 0,
                  clicks: fluidFusionData.reddit?.clicks || 0,
                  conversions: fluidFusionData.reddit?.conversions || 0,
                  revenue: fluidFusionData.reddit?.revenue || 0,
                }} 
                delay={400} 
              />
              <TrafficSourceCard 
                platform="google" 
                data={{
                  impressions: fluidFusionData.googleAds?.impressions || 0,
                  clicks: fluidFusionData.googleAds?.clicks || 0,
                  conversions: fluidFusionData.googleAds?.conversions || 0,
                  revenue: fluidFusionData.googleAds?.revenue || 0,
                }} 
                delay={450} 
              />
              <TrafficSourceCard 
                platform="direct" 
                data={{
                  impressions: fluidFusionData.website?.impressions || 0,
                  clicks: fluidFusionData.website?.clicks || 0,
                  conversions: fluidFusionData.website?.conversions || 0,
                  revenue: fluidFusionData.website?.revenue || 0,
                }} 
                delay={500} 
              />
            </div>
          </>
        ) : (
          <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#71717A' }}>No traffic data available</span>
          </div>
        )}
      </div>
    </div>
  );
}
