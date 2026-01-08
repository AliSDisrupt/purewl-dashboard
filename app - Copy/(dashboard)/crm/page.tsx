"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { KPICard } from "@/components/dashboard/KPICard";
import { 
  DollarSign, 
  Users, 
  MessageSquare, 
  Building2, 
  Ticket, 
  CheckSquare, 
  Calendar, 
  Phone, 
  Mail, 
  Package, 
  ShoppingCart, 
  FileText 
} from "lucide-react";
import { formatNumber } from "@/lib/utils";

// Fetch functions
async function fetchHubSpotDeals() {
  // Fetch ALL deals (no limit parameter = fetch all)
  const res = await fetch("/api/hubspot/deals");
  if (!res.ok) throw new Error("Failed to fetch HubSpot deals");
  return res.json();
}

async function fetchHubSpotContacts(query: string = "", limit: number = 50) {
  const params = new URLSearchParams({
    limit: String(limit),
  });
  if (query) {
    params.append("query", query);
  }
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

export default function CRMPage() {
  const [contactSearchQuery, setContactSearchQuery] = useState("");

  // Fetch deals
  const { data: dealsData, isLoading: dealsLoading } = useQuery({
    queryKey: ["hubspot-deals"],
    queryFn: fetchHubSpotDeals,
    refetchInterval: 300000, // Refresh every 5 minutes
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

  // Fetch all other data
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

  const deals = dealsData?.deals || [];
  const dealsSummary = dealsData?.summary || {
    totalDeals: 0,
    totalValue: 0,
    byStage: {},
  };
  const contacts = contactsData?.contacts || [];
  const conversations = conversationsData?.threads || [];
  const conversationsSummary = conversationsData?.summary || {
    total: 0,
    open: 0,
    closed: 0,
  };
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">CRM</h1>
        <p className="text-muted-foreground mt-1">
          HubSpot CRM data and pipeline management
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard
          title="Pipeline Value"
          value={`$${formatNumber(dealsSummary.totalValue)}`}
          change={0}
          changeLabel=""
          trend="neutral"
          loading={dealsLoading}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        />
        <KPICard
          title="Total Deals"
          value={formatNumber(dealsSummary.totalDeals)}
          change={0}
          changeLabel=""
          trend="neutral"
          loading={dealsLoading}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        />
        <KPICard
          title="Open Conversations"
          value={formatNumber(conversationsSummary.open)}
          change={0}
          changeLabel=""
          trend="neutral"
          loading={conversationsLoading}
          icon={<MessageSquare className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {/* Tabs for different CRM views */}
      <Tabs defaultValue="deals" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-1 overflow-x-auto">
          <TabsTrigger value="deals" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Deals</span>
          </TabsTrigger>
          <TabsTrigger value="contacts" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Contacts</span>
          </TabsTrigger>
          <TabsTrigger value="companies" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Companies</span>
          </TabsTrigger>
          <TabsTrigger value="conversations" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Chats</span>
          </TabsTrigger>
          <TabsTrigger value="tickets" className="flex items-center gap-2">
            <Ticket className="h-4 w-4" />
            <span className="hidden sm:inline">Tickets</span>
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Tasks</span>
          </TabsTrigger>
          <TabsTrigger value="meetings" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Meetings</span>
          </TabsTrigger>
          <TabsTrigger value="calls" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            <span className="hidden sm:inline">Calls</span>
          </TabsTrigger>
          <TabsTrigger value="emails" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Emails</span>
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Products</span>
          </TabsTrigger>
          <TabsTrigger value="line-items" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Line Items</span>
          </TabsTrigger>
          <TabsTrigger value="quotes" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Quotes</span>
          </TabsTrigger>
          <TabsTrigger value="owners" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Team</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="deals" className="mt-6">
          <DealsTable
            deals={deals}
            summary={dealsSummary}
            isLoading={dealsLoading}
          />
        </TabsContent>

        <TabsContent value="contacts" className="mt-6">
          <ContactsTable
            contacts={contacts}
            isLoading={contactsLoading}
            onSearch={(query) => {
              setContactSearchQuery(query);
            }}
          />
        </TabsContent>

        <TabsContent value="companies" className="mt-6">
          <CompaniesTable
            companies={companies}
            isLoading={companiesLoading}
          />
        </TabsContent>

        <TabsContent value="conversations" className="mt-6">
          <ConversationsTable
            threads={conversations}
            summary={conversationsSummary}
            isLoading={conversationsLoading}
          />
        </TabsContent>

        <TabsContent value="tickets" className="mt-6">
          <TicketsTable
            tickets={tickets}
            isLoading={ticketsLoading}
          />
        </TabsContent>

        <TabsContent value="tasks" className="mt-6">
          <TasksTable
            tasks={tasks}
            isLoading={tasksLoading}
          />
        </TabsContent>

        <TabsContent value="meetings" className="mt-6">
          <MeetingsTable
            meetings={meetings}
            isLoading={meetingsLoading}
          />
        </TabsContent>

        <TabsContent value="calls" className="mt-6">
          <CallsTable
            calls={calls}
            isLoading={callsLoading}
          />
        </TabsContent>

        <TabsContent value="emails" className="mt-6">
          <EmailsTable
            emails={emails}
            isLoading={emailsLoading}
          />
        </TabsContent>

        <TabsContent value="products" className="mt-6">
          <ProductsTable
            products={products}
            isLoading={productsLoading}
          />
        </TabsContent>

        <TabsContent value="line-items" className="mt-6">
          <LineItemsTable
            lineItems={lineItems}
            isLoading={lineItemsLoading}
          />
        </TabsContent>

        <TabsContent value="quotes" className="mt-6">
          <QuotesTable
            quotes={quotes}
            isLoading={quotesLoading}
          />
        </TabsContent>

        <TabsContent value="owners" className="mt-6">
          <OwnersTable
            owners={owners}
            isLoading={ownersLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
