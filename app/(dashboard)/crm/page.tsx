"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ContactsTable } from "@/components/crm/ContactsTable";
import { ConversationsTable } from "@/components/crm/ConversationsTable";
import { CompaniesTable } from "@/components/crm/CompaniesTable";
import { TicketsTable } from "@/components/crm/TicketsTable";
import { TasksTable } from "@/components/crm/TasksTable";
import { MeetingsTable } from "@/components/crm/MeetingsTable";
import { CallsTable } from "@/components/crm/CallsTable";
import { EmailsTable } from "@/components/crm/EmailsTable";
import { ProductsTable } from "@/components/crm/ProductsTable";
import { LineItemsTable } from "@/components/crm/LineItemsTable";
import { QuotesTable } from "@/components/crm/QuotesTable";
import { OwnersTable } from "@/components/crm/OwnersTable";
import { formatNumber } from "@/lib/utils";
import { Calendar } from "lucide-react";

// ============================================
// CRM PAGE - HubSpot CRM Data
// ============================================

// Fetch functions
async function fetchHubSpotDeals(startDate?: string, endDate?: string) {
  // If no date filter, fetch ALL deals (no filtering)
  if (!startDate && !endDate) {
    const res = await fetch("/api/hubspot/deals");
    if (!res.ok) throw new Error("Failed to fetch HubSpot deals");
    const data = await res.json();
    return {
      deals: data.deals || [],
      summary: {
        totalDeals: data.summary?.totalDeals || 0,
        totalValue: data.summary?.totalValue || 0,
        byStage: data.summary?.byStage || {},
      },
    };
  }
  
  // If date filter provided, use deals-by-stage endpoint (but NO stage filter - shows all stages)
  const params = new URLSearchParams();
  if (startDate) {
    params.append("startDate", startDate);
  }
  if (endDate) {
    params.append("endDate", endDate);
  }
  // Note: NOT adding stage parameter - this ensures ALL stages are included
  
  const url = `/api/hubspot/deals-by-stage?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch HubSpot deals");
  const data = await res.json();
  
  // Normalize response format (deals-by-stage uses 'total', deals uses 'totalDeals')
  return {
    deals: data.deals || [],
    summary: {
      totalDeals: data.summary?.total || data.summary?.totalDeals || 0,
      totalValue: data.summary?.totalValue || 0,
      byStage: data.summary?.byStage || {},
    },
  };
}

async function fetchHubSpotPipelines() {
  const res = await fetch("/api/hubspot/pipelines");
  if (!res.ok) throw new Error("Failed to fetch HubSpot pipelines");
  return res.json();
}

async function fetchHubSpotContacts(query: string = "", limit: number = 50) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (query) params.append("query", query);
  const res = await fetch(`/api/hubspot/contacts?${params}`);
  if (!res.ok) throw new Error("Failed to fetch HubSpot contacts");
  return res.json();
}

async function fetchHubSpotConversations() {
  const res = await fetch("/api/hubspot/conversations");
  if (!res.ok) throw new Error("Failed to fetch HubSpot conversations");
  return res.json();
}

async function fetchHubSpotCompanies() {
  const res = await fetch("/api/hubspot/companies");
  if (!res.ok) throw new Error("Failed to fetch HubSpot companies");
  return res.json();
}

async function fetchHubSpotTickets() {
  const res = await fetch("/api/hubspot/tickets");
  if (!res.ok) throw new Error("Failed to fetch HubSpot tickets");
  return res.json();
}

async function fetchHubSpotTasks() {
  const res = await fetch("/api/hubspot/tasks");
  if (!res.ok) throw new Error("Failed to fetch HubSpot tasks");
  return res.json();
}

async function fetchHubSpotMeetings() {
  const res = await fetch("/api/hubspot/meetings");
  if (!res.ok) throw new Error("Failed to fetch HubSpot meetings");
  return res.json();
}

async function fetchHubSpotCalls() {
  const res = await fetch("/api/hubspot/calls");
  if (!res.ok) throw new Error("Failed to fetch HubSpot calls");
  return res.json();
}

async function fetchHubSpotEmails() {
  const res = await fetch("/api/hubspot/emails");
  if (!res.ok) throw new Error("Failed to fetch HubSpot emails");
  return res.json();
}

async function fetchHubSpotProducts() {
  const res = await fetch("/api/hubspot/products");
  if (!res.ok) throw new Error("Failed to fetch HubSpot products");
  return res.json();
}

async function fetchHubSpotLineItems() {
  const res = await fetch("/api/hubspot/line-items");
  if (!res.ok) throw new Error("Failed to fetch HubSpot line items");
  return res.json();
}

async function fetchHubSpotQuotes() {
  const res = await fetch("/api/hubspot/quotes");
  if (!res.ok) throw new Error("Failed to fetch HubSpot quotes");
  return res.json();
}

async function fetchHubSpotOwners() {
  const res = await fetch("/api/hubspot/owners");
  if (!res.ok) throw new Error("Failed to fetch HubSpot owners");
  return res.json();
}

// KPI Card Component
const KPICard = ({ 
  label, 
  value, 
  icon, 
  color, 
  loading = false,
  delay = 0 
}: {
  label: string;
  value: string;
  icon: string;
  color: string;
  loading?: boolean;
  delay?: number;
}) => {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), delay); }, [delay]);
  
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(14, 14, 20, 0.8) 0%, rgba(18, 18, 26, 0.8) 100%)',
      border: '1px solid rgba(255, 255, 255, 0.06)',
      borderRadius: 14,
      padding: '20px 24px',
      position: 'relative',
      overflow: 'hidden',
      opacity: loaded ? 1 : 0,
      transform: loaded ? 'translateY(0)' : 'translateY(10px)',
      transition: 'all 0.4s ease',
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 24,
        right: 24,
        height: 2,
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        opacity: 0.6,
      }} />
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#52525B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
        <span style={{ fontSize: 16, opacity: 0.6 }}>{icon}</span>
      </div>
      
      {loading ? (
        <div style={{ height: 40, width: 100, background: 'rgba(255,255,255,0.05)', borderRadius: 6, animation: 'pulse 1.5s infinite' }} />
      ) : (
        <div style={{ fontSize: 32, fontWeight: 700, color: '#FFF', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '-1px' }}>
          {value}
        </div>
      )}
    </div>
  );
};

// Tab Navigation Component
const TabNavigation = ({ 
  tabs, 
  activeTab, 
  onTabChange 
}: { 
  tabs: { id: string; label: string; icon: string }[]; 
  activeTab: string; 
  onTabChange: (id: string) => void;
}) => (
  <div style={{
    display: 'flex',
    background: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 10,
    padding: 4,
    gap: 2,
    overflowX: 'auto',
  }}>
    {tabs.map(tab => (
      <button
        key={tab.id}
        onClick={() => onTabChange(tab.id)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 16px',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 500,
          color: activeTab === tab.id ? '#FFF' : '#71717A',
          background: activeTab === tab.id ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
          border: activeTab === tab.id ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          transition: 'all 0.2s ease',
        }}
      >
        <span style={{ fontSize: 14 }}>{tab.icon}</span>
        {tab.label}
      </button>
    ))}
  </div>
);

// Deals Pipeline Table Component
const DealsPipelineTable = ({ 
  deals, 
  totalValue, 
  totalDeals, 
  loading 
}: { 
  deals: any[]; 
  totalValue: string; 
  totalDeals: string; 
  loading: boolean;
}) => {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 300); }, []);
  
  const stageColors: Record<string, string> = {
    'closedwon': '#10B981',
    'closedlost': '#EF4444',
    'contractsent': '#F59E0B',
  };
  
  const getStageColor = (stage: string) => {
    const stageLower = (stage || '').toLowerCase();
    if (stageLower.includes('won')) return '#10B981';
    if (stageLower.includes('lost')) return '#EF4444';
    if (stageLower.includes('contract')) return '#F59E0B';
    return '#3B82F6';
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  if (loading) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, rgba(14, 14, 20, 0.8) 0%, rgba(18, 18, 26, 0.8) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: 14,
        padding: 24,
        height: 400,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{ color: '#71717A' }}>Loading deals...</span>
      </div>
    );
  }
  
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(14, 14, 20, 0.8) 0%, rgba(18, 18, 26, 0.8) 100%)',
      border: '1px solid rgba(255, 255, 255, 0.06)',
      borderRadius: 14,
      overflow: 'hidden',
      opacity: loaded ? 1 : 0,
      transition: 'all 0.5s ease',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>💰</span>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#FFF', margin: 0 }}>Deals Pipeline</h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: '#71717A' }}>Total Value:</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#10B981', fontFamily: "'JetBrains Mono', monospace" }}>{totalValue}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: '#71717A' }}>Deals:</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#FFF', fontFamily: "'JetBrains Mono', monospace" }}>{totalDeals}</span>
          </div>
        </div>
      </div>
      
      {/* Table Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 140px 100px 120px',
        gap: 16,
        padding: '12px 24px',
        background: 'rgba(255, 255, 255, 0.02)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
      }}>
        {['Deal Name', 'Stage', 'Amount', 'Close Date'].map((h, i) => (
          <span key={h} style={{
            fontSize: 10,
            fontWeight: 600,
            color: '#52525B',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            textAlign: i > 0 ? 'right' : 'left',
          }}>{h}</span>
        ))}
      </div>
      
      {/* Rows */}
      <div style={{ maxHeight: 400, overflowY: 'auto' }}>
        {deals.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#71717A' }}>No deals found</div>
        ) : (
          deals.slice(0, 50).map((deal, i) => {
            const stageColor = getStageColor(deal.stage || deal.dealstage || '');
            return (
              <div key={deal.id || i} style={{
                display: 'grid',
                gridTemplateColumns: '1fr 180px 100px 160px',
                gap: 16,
                padding: '14px 24px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
                alignItems: 'center',
                transition: 'background 0.15s ease',
              }}>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#E4E4E7', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {deal.dealname || deal.name || 'Untitled Deal'}
                  </div>
                  <div style={{ fontSize: 12, color: '#52525B', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {deal.email || deal.contactEmail || '—'}
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', minWidth: 0 }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 600,
                    fontFamily: "'JetBrains Mono', monospace",
                    background: `${stageColor}20`,
                    color: stageColor,
                    border: `1px solid ${stageColor}40`,
                    maxWidth: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={deal.stage || deal.dealstage || '—'} // Tooltip for full name
                  >
                    {deal.stage || deal.dealstage || '—'}
                  </span>
                </div>
                
                <span style={{
                  fontSize: 14,
                  fontWeight: 500,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: deal.amount ? '#10B981' : '#52525B',
                  textAlign: 'right',
                }}>
                  {deal.amount ? `$${formatNumber(deal.amount)}` : '—'}
                </span>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                  <span style={{ fontSize: 12, color: '#71717A' }}>📅</span>
                  <span style={{ fontSize: 13, color: '#A1A1AA' }}>{formatDate(deal.closedate || deal.closeDate || '')}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// Deals by Stage Grid
const DealsByStageGrid = ({ stages, deals, loading }: { stages: Record<string, number>; deals?: any[]; loading: boolean }) => {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 400); }, []);
  
  const getStageColor = (stageId: string) => {
    const stageLower = stageId.toLowerCase();
    if (stageLower.includes('lost')) return '#EF4444';
    if (stageLower.includes('won') || stageLower.includes('contract') || stageLower.includes('payment')) return '#10B981';
    return '#3B82F6';
  };
  
  // Define the order of all stages with their display names and possible IDs/values
  // This maps HubSpot stage values to display names
  const stageDefinitions = [
    { displayName: 'Lead Generated', values: ['Lead Generated', 'lead generated', '1183461702'] },
    { displayName: 'Disqualified lead', values: ['Disqualified lead', 'disqualified lead', 'Disqualified', 'disqualified', '143589767'] },
    { displayName: 'Email sent', values: ['Email sent', 'email sent', '1181812774'] },
    { displayName: 'Conversation initiated', values: ['Conversation initiated', 'conversation initiated', 'closedlost', 'closed-lost', 'closed lost'] },
    { displayName: 'Qualification', values: ['Qualification', 'qualification', '143589762'] },
    { displayName: 'Proposal shared', values: ['Proposal shared', 'proposal shared', '143589763'] },
    { displayName: 'Negotiation', values: ['Negotiation', 'negotiation', '143589764'] },
    { displayName: 'On trial', values: ['On trial', 'on trial', '999637325'] },
    { displayName: 'Contract sent', values: ['Contract sent', 'contract sent', 'contractsent', 'contract-sent'] },
    { displayName: 'Won', values: ['Won', 'won', '143589765', 'closedwon', 'closed-won', 'closed won'] },
    { displayName: 'Payment Recieved', values: ['Payment Recieved', 'payment recieved', 'Payment Received', 'payment received', '995534683'] },
    { displayName: 'Lost', values: ['Lost', 'lost', '143589766'] } // Note: closedlost is Conversation initiated, NOT Lost
  ];
  
  // Helper function to check if a deal stage matches any of the stage values
  const matchesStage = (dealStage: string, stageValues: string[]): boolean => {
    const normalizedDealStage = (dealStage || '').toLowerCase().trim();
    return stageValues.some(value => 
      normalizedDealStage === value.toLowerCase().trim() ||
      normalizedDealStage.replace(/[-\s_]/g, '') === value.toLowerCase().replace(/[-\s_]/g, '')
    );
  };
  
  // Calculate most recent deal date for each stage
  const stageWithDates = stageDefinitions.map(stageDef => {
    // Find count by matching against all possible stage values
    let count = 0;
    Object.entries(stages).forEach(([stageKey, stageCount]) => {
      if (matchesStage(stageKey, stageDef.values)) {
        count += stageCount;
      }
    });
    
    let mostRecentDate: Date | null = null;
    
    if (deals && deals.length > 0) {
      const dealsInStage = deals.filter(deal => {
        const dealStage = (deal.stage || deal.dealstage || '').toString();
        return matchesStage(dealStage, stageDef.values);
      });
      
      if (dealsInStage.length > 0) {
        const dates = dealsInStage
          .map(deal => {
            const dateStr = deal.createdAt || deal.createdate;
            return dateStr ? new Date(dateStr) : null;
          })
          .filter((date): date is Date => date !== null);
        
        if (dates.length > 0) {
          mostRecentDate = new Date(Math.max(...dates.map(d => d.getTime())));
        }
      }
    }
    
    return {
      name: stageDef.displayName,
      count,
      mostRecentDate,
      timestamp: mostRecentDate ? mostRecentDate.getTime() : 0
    };
  });
  
  // Sort by most recent date (newest first), then by count
  const stageEntries = stageWithDates.sort((a, b) => {
    // If both have dates, sort by date (newest first)
    if (a.timestamp > 0 && b.timestamp > 0) {
      return b.timestamp - a.timestamp;
    }
    // If only one has a date, prioritize it
    if (a.timestamp > 0) return -1;
    if (b.timestamp > 0) return 1;
    // If neither has a date, sort by count
    return b.count - a.count;
  });
  
  if (loading) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, rgba(14, 14, 20, 0.8) 0%, rgba(18, 18, 26, 0.8) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: 14,
        padding: 24,
        height: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{ color: '#71717A' }}>Loading stages...</span>
      </div>
    );
  }
  
  if (stageEntries.length === 0) {
    return null;
  }
  
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(14, 14, 20, 0.8) 0%, rgba(18, 18, 26, 0.8) 100%)',
      border: '1px solid rgba(255, 255, 255, 0.06)',
      borderRadius: 14,
      padding: 24,
      opacity: loaded ? 1 : 0,
      transition: 'all 0.5s ease',
    }}>
      <h3 style={{ fontSize: 16, fontWeight: 600, color: '#FFF', margin: '0 0 20px' }}>Deals by Stage</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {stageEntries.map((stage) => {
          const color = getStageColor(stage.name);
          return (
            <div key={stage.name} style={{
              padding: '16px',
              background: stage.count > 0 ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.01)',
              border: stage.count > 0 ? '1px solid rgba(255, 255, 255, 0.04)' : '1px solid rgba(255, 255, 255, 0.02)',
              borderRadius: 10,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              transition: 'all 0.2s ease',
              opacity: stage.count > 0 ? 1 : 0.5,
            }}>
              <span style={{
                fontSize: 13,
                fontWeight: 500,
                color: stage.count > 0 ? '#E4E4E7' : '#71717A',
                wordBreak: 'break-word',
                lineHeight: '1.4',
              }}>
                {stage.name}
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{
                  fontSize: 24,
                  fontWeight: 700,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: color,
                  alignSelf: 'flex-start',
                }}>
                  {stage.count}
                </span>
                {stage.mostRecentDate && (
                  <span style={{
                    fontSize: 10,
                    color: '#71717A',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>
                    {stage.mostRecentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function CRMPage() {
  const [activeTab, setActiveTab] = useState("deals");
  const [contactSearchQuery, setContactSearchQuery] = useState("");
  
  // Date filtering state - default to no filter (show all deals)
  const [dateFilter, setDateFilter] = useState<{
    startDate: string;
    endDate: string;
  } | null>(null);
  
  const [useDateFilter, setUseDateFilter] = useState(false);

  // Define tabs
  const tabs = [
    { id: 'deals', label: 'Deals', icon: '💰' },
    { id: 'pipelines', label: 'Pipelines', icon: '🔀' },
    { id: 'contacts', label: 'Contacts', icon: '👤' },
    { id: 'companies', label: 'Companies', icon: '🏢' },
    { id: 'conversations', label: 'Chats', icon: '💬' },
    { id: 'tickets', label: 'Tickets', icon: '🎫' },
    { id: 'tasks', label: 'Tasks', icon: '✅' },
    { id: 'meetings', label: 'Meetings', icon: '📅' },
    { id: 'calls', label: 'Calls', icon: '📞' },
    { id: 'emails', label: 'Emails', icon: '📧' },
    { id: 'products', label: 'Products', icon: '📦' },
    { id: 'line-items', label: 'Line Items', icon: '🛒' },
    { id: 'quotes', label: 'Quotes', icon: '📄' },
    { id: 'owners', label: 'Team', icon: '👥' },
  ];

  // Fetch deals - show ALL deals by default, or filtered by date if filter is enabled
  const { data: dealsData, isLoading: dealsLoading } = useQuery({
    queryKey: ["hubspot-deals", useDateFilter ? dateFilter?.startDate : null, useDateFilter ? dateFilter?.endDate : null],
    queryFn: () => fetchHubSpotDeals(
      useDateFilter && dateFilter ? dateFilter.startDate : undefined,
      useDateFilter && dateFilter ? dateFilter.endDate : undefined
    ),
    refetchInterval: 300000,
  });

  // Fetch pipelines
  const { data: pipelinesData, isLoading: pipelinesLoading } = useQuery({
    queryKey: ["hubspot-pipelines"],
    queryFn: fetchHubSpotPipelines,
    refetchInterval: 3600000, // Refresh every hour
  });

  // Fetch contacts
  const { data: contactsData, isLoading: contactsLoading } = useQuery({
    queryKey: ["hubspot-contacts", contactSearchQuery],
    queryFn: () => fetchHubSpotContacts(contactSearchQuery, 50),
    refetchInterval: 300000,
  });

  // Fetch conversations
  const { data: conversationsData, isLoading: conversationsLoading } = useQuery({
    queryKey: ["hubspot-conversations"],
    queryFn: fetchHubSpotConversations,
    refetchInterval: 300000,
  });

  // Fetch other data
  const { data: companiesData, isLoading: companiesLoading } = useQuery({
    queryKey: ["hubspot-companies"],
    queryFn: fetchHubSpotCompanies,
    refetchInterval: 300000,
  });

  const { data: ticketsData, isLoading: ticketsLoading } = useQuery({
    queryKey: ["hubspot-tickets"],
    queryFn: fetchHubSpotTickets,
    refetchInterval: 300000,
  });

  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ["hubspot-tasks"],
    queryFn: fetchHubSpotTasks,
    refetchInterval: 300000,
  });

  const { data: meetingsData, isLoading: meetingsLoading } = useQuery({
    queryKey: ["hubspot-meetings"],
    queryFn: fetchHubSpotMeetings,
    refetchInterval: 300000,
  });

  const { data: callsData, isLoading: callsLoading } = useQuery({
    queryKey: ["hubspot-calls"],
    queryFn: fetchHubSpotCalls,
    refetchInterval: 300000,
  });

  const { data: emailsData, isLoading: emailsLoading } = useQuery({
    queryKey: ["hubspot-emails"],
    queryFn: fetchHubSpotEmails,
    refetchInterval: 300000,
  });

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["hubspot-products"],
    queryFn: fetchHubSpotProducts,
    refetchInterval: 300000,
  });

  const { data: lineItemsData, isLoading: lineItemsLoading } = useQuery({
    queryKey: ["hubspot-line-items"],
    queryFn: fetchHubSpotLineItems,
    refetchInterval: 300000,
  });

  const { data: quotesData, isLoading: quotesLoading } = useQuery({
    queryKey: ["hubspot-quotes"],
    queryFn: fetchHubSpotQuotes,
    refetchInterval: 300000,
  });

  const { data: ownersData, isLoading: ownersLoading } = useQuery({
    queryKey: ["hubspot-owners"],
    queryFn: fetchHubSpotOwners,
    refetchInterval: 300000,
  });

  // Extract data
  const deals = dealsData?.deals || [];
  const dealsSummary = dealsData?.summary || { totalDeals: 0, totalValue: 0, byStage: {} };
  const pipelines = pipelinesData?.pipelines || [];

  // Pipelines display component
  const PipelinesDisplay = () => {
    if (pipelinesLoading) {
      return (
        <div style={{
          background: 'linear-gradient(135deg, rgba(14, 14, 20, 0.8) 0%, rgba(18, 18, 26, 0.8) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: 14,
          padding: 24,
          textAlign: 'center',
        }}>
          <span style={{ color: '#71717A' }}>Loading pipelines...</span>
        </div>
      );
    }

    if (pipelines.length === 0) {
      return (
        <div style={{
          background: 'linear-gradient(135deg, rgba(14, 14, 20, 0.8) 0%, rgba(18, 18, 26, 0.8) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: 14,
          padding: 24,
          textAlign: 'center',
        }}>
          <span style={{ color: '#71717A' }}>No pipelines found</span>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {pipelines.map((pipeline: any) => (
          <div
            key={pipeline.id}
            style={{
              background: 'linear-gradient(135deg, rgba(14, 14, 20, 0.8) 0%, rgba(18, 18, 26, 0.8) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: 14,
              padding: 24,
            }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#FFF', marginBottom: 16 }}>
              {pipeline.label}
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {pipeline.stages.map((stage: any, index: number) => (
                <div
                  key={stage.id}
                  style={{
                    padding: '10px 16px',
                    background: stage.closedWon
                      ? 'rgba(16, 185, 129, 0.1)'
                      : stage.closedLost
                      ? 'rgba(239, 68, 68, 0.1)'
                      : 'rgba(59, 130, 246, 0.1)',
                    border: `1px solid ${
                      stage.closedWon
                        ? 'rgba(16, 185, 129, 0.3)'
                        : stage.closedLost
                        ? 'rgba(239, 68, 68, 0.3)'
                        : 'rgba(59, 130, 246, 0.3)'
                    }`,
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: stage.closedWon
                        ? '#10B981'
                        : stage.closedLost
                        ? '#EF4444'
                        : '#3B82F6',
                    }}
                  >
                    {index + 1}.
                  </span>
                  <span style={{ fontSize: 13, color: '#E4E4E7' }}>{stage.label}</span>
                  {stage.probability && (
                    <span style={{ fontSize: 11, color: '#71717A', fontFamily: "'JetBrains Mono', monospace" }}>
                      {stage.probability}%
                    </span>
                  )}
                  <span style={{ fontSize: 10, color: '#52525B', fontFamily: "'JetBrains Mono', monospace" }}>
                    (ID: {stage.id})
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };
  const contacts = contactsData?.contacts || [];
  const conversations = conversationsData?.threads || [];
  const conversationsSummary = conversationsData?.summary || { total: 0, open: 0, closed: 0 };
  const companies = companiesData?.companies || [];
  const tickets = ticketsData?.tickets || [];
  const tasks = tasksData?.tasks || [];
  const meetings = meetingsData?.meetings || [];
  const calls = callsData?.calls || [];
  const emails = emailsData?.emails || [];
  const products = productsData?.products || [];
  const lineItems = lineItemsData?.lineItems || [];
  const quotes = quotesData?.quotes || [];
  const owners = ownersData?.owners || [];

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'deals':
        return (
          <>
            {/* Date Filter - Optional */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(14, 14, 20, 0.8) 0%, rgba(18, 18, 26, 0.8) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: 14,
              padding: 20,
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              flexWrap: 'wrap',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Calendar style={{ width: 18, height: 18, color: '#71717A' }} />
                <span style={{ fontSize: 14, fontWeight: 500, color: '#E4E4E7' }}>
                  {useDateFilter ? 'Date Range:' : 'Show All Deals (All Stages)'}
                </span>
              </div>
              <button
                onClick={() => {
                  setUseDateFilter(!useDateFilter);
                  if (!useDateFilter && !dateFilter) {
                    const end = new Date();
                    const start = new Date();
                    start.setDate(start.getDate() - 30);
                    setDateFilter({
                      startDate: start.toISOString().split("T")[0],
                      endDate: end.toISOString().split("T")[0],
                    });
                  }
                }}
                style={{
                  padding: '8px 16px',
                  background: useDateFilter ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                  border: useDateFilter ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: 8,
                  color: useDateFilter ? '#3B82F6' : '#10B981',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                {useDateFilter ? 'Disable Filter' : 'Enable Date Filter'}
              </button>
              {useDateFilter && dateFilter && (
                <>
                  <input
                    type="date"
                    value={dateFilter.startDate}
                    onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value })}
                    style={{
                      padding: '8px 12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 8,
                      color: '#E4E4E7',
                      fontSize: 13,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  />
                  <span style={{ color: '#71717A' }}>to</span>
                  <input
                    type="date"
                    value={dateFilter.endDate}
                    onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
                    style={{
                      padding: '8px 12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 8,
                      color: '#E4E4E7',
                      fontSize: 13,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  />
                  <button
                    onClick={() => {
                      const end = new Date();
                      const start = new Date();
                      start.setDate(start.getDate() - 30);
                      setDateFilter({
                        startDate: start.toISOString().split("T")[0],
                        endDate: end.toISOString().split("T")[0],
                      });
                    }}
                    style={{
                      padding: '8px 16px',
                      background: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: 8,
                      color: '#3B82F6',
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    Last 30 Days
                  </button>
                  <button
                    onClick={() => {
                      const end = new Date();
                      const start = new Date();
                      start.setDate(start.getDate() - 90);
                      setDateFilter({
                        startDate: start.toISOString().split("T")[0],
                        endDate: end.toISOString().split("T")[0],
                      });
                    }}
                    style={{
                      padding: '8px 16px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 8,
                      color: '#E4E4E7',
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    Last 90 Days
                  </button>
                </>
              )}
            </div>
            <DealsPipelineTable 
              deals={deals} 
              totalValue={`$${formatNumber(dealsSummary.totalValue)}`} 
              totalDeals={formatNumber(dealsSummary.totalDeals)}
              loading={dealsLoading} 
            />
            <DealsByStageGrid stages={dealsSummary.byStage} deals={deals} loading={dealsLoading} />
          </>
        );
      case 'pipelines':
        return <PipelinesDisplay />;
      case 'contacts':
        return <ContactsTable contacts={contacts} isLoading={contactsLoading} onSearch={setContactSearchQuery} />;
      case 'companies':
        return <CompaniesTable companies={companies} isLoading={companiesLoading} />;
      case 'conversations':
        return <ConversationsTable threads={conversations} summary={conversationsSummary} isLoading={conversationsLoading} />;
      case 'tickets':
        return <TicketsTable tickets={tickets} isLoading={ticketsLoading} />;
      case 'tasks':
        return <TasksTable tasks={tasks} isLoading={tasksLoading} />;
      case 'meetings':
        return <MeetingsTable meetings={meetings} isLoading={meetingsLoading} />;
      case 'calls':
        return <CallsTable calls={calls} isLoading={callsLoading} />;
      case 'emails':
        return <EmailsTable emails={emails} isLoading={emailsLoading} />;
      case 'products':
        return <ProductsTable products={products} isLoading={productsLoading} />;
      case 'line-items':
        return <LineItemsTable lineItems={lineItems} isLoading={lineItemsLoading} />;
      case 'quotes':
        return <QuotesTable quotes={quotes} isLoading={quotesLoading} />;
      case 'owners':
        return <OwnersTable owners={owners} isLoading={ownersLoading} />;
      default:
        return null;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Fonts and animations */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: rgba(14, 14, 20, 0.5); }
        ::-webkit-scrollbar-thumb { background: #2A2A34; border-radius: 4px; }
      `}</style>
      
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#FFF', margin: 0 }}>CRM</h1>
        <p style={{ fontSize: 14, color: '#71717A', margin: '8px 0 0' }}>HubSpot CRM data and pipeline management</p>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard
          label="Pipeline Value"
          value={`$${formatNumber(dealsSummary.totalValue)}`}
          icon="💰"
          color="#10B981"
          loading={dealsLoading}
          delay={0}
        />
        <KPICard
          label="Total Deals"
          value={formatNumber(dealsSummary.totalDeals)}
          icon="🤝"
          color="#3B82F6"
          loading={dealsLoading}
          delay={50}
        />
        <KPICard
          label="Open Conversations"
          value={formatNumber(conversationsSummary.open)}
          icon="💬"
          color="#8B5CF6"
          loading={conversationsLoading}
          delay={100}
        />
      </div>
      
      {/* Tab Navigation */}
      <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Tab Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {renderTabContent()}
      </div>
    </div>
  );
}
