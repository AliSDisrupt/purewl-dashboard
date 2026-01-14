"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { DealsTable } from "@/components/crm/DealsTable";
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

// ============================================
// CRM PAGE - HubSpot CRM Data
// ============================================

// Fetch functions
async function fetchHubSpotDeals() {
  const res = await fetch("/api/hubspot/deals");
  if (!res.ok) throw new Error("Failed to fetch HubSpot deals");
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

// Deals by Stage Grid
const DealsByStageGrid = ({ stages, loading }: { stages: Record<string, number>; loading: boolean }) => {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 400); }, []);
  
  const getStageColor = (stageId: string) => {
    if (stageId.toLowerCase().includes('closedlost') || stageId.toLowerCase().includes('lost')) return '#EF4444';
    if (stageId.toLowerCase().includes('closedwon') || stageId.toLowerCase().includes('won') || stageId.toLowerCase().includes('contract')) return '#10B981';
    return '#3B82F6';
  };
  
  const stageEntries = Object.entries(stages).sort((a, b) => b[1] - a[1]);
  
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
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {stageEntries.map(([stageId, count]) => {
          const color = getStageColor(stageId);
          return (
            <div key={stageId} style={{
              padding: '16px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.04)',
              borderRadius: 10,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              transition: 'all 0.2s ease',
            }}>
              <span style={{
                fontSize: 11,
                fontFamily: "'JetBrains Mono', monospace",
                color: '#71717A',
                maxWidth: 80,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {stageId}
              </span>
              <span style={{
                fontSize: 18,
                fontWeight: 700,
                fontFamily: "'JetBrains Mono', monospace",
                color: color,
              }}>
                {count}
              </span>
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

  // Define tabs
  const tabs = [
    { id: 'deals', label: 'Deals', icon: '💰' },
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

  // Fetch deals
  const { data: dealsData, isLoading: dealsLoading } = useQuery({
    queryKey: ["hubspot-deals"],
    queryFn: fetchHubSpotDeals,
    refetchInterval: 300000,
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
            <DealsTable deals={deals} summary={dealsSummary} isLoading={dealsLoading} />
            <DealsByStageGrid stages={dealsSummary.byStage} loading={dealsLoading} />
          </>
        );
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
