# Cursor Rules: PureWL Full-Funnel Analytics Dashboard

## 📋 Project Overview

Build a production-grade, visually stunning Full-Funnel Analytics Dashboard that integrates GA4, HubSpot, and RB2B data sources into unified conversion visualizations.

---

## 🎨 Design System & Libraries

### Required Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "next": "^14.0.0",
    "typescript": "^5.0.0",
    
    "tailwindcss": "^3.4.0",
    "framer-motion": "^11.0.0",
    
    "recharts": "^2.12.0",
    "@tremor/react": "^3.14.0",
    
    "lucide-react": "^0.400.0",
    
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^4.5.0",
    
    "date-fns": "^3.0.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0"
  }
}
```

### Design Philosophy

**Aesthetic Direction: "Data Observatory"**
- Dark mode primary with strategic light accents
- Glass-morphism cards with subtle backdrop blur
- Gradient accents that flow from blue (#0066FF) → teal (#00D4AA) → emerald (#10B981)
- Depth through layered shadows and subtle borders
- Micro-animations on data changes and interactions

### Typography

```css
/* Primary: Space Grotesk for headers - geometric, modern */
/* Secondary: DM Sans for body text - clean, readable */
/* Mono: JetBrains Mono for numbers/metrics - technical precision */

@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');
```

### Color Palette

```javascript
const colors = {
  // Core palette
  background: {
    primary: '#0A0A0F',      // Deep black-blue
    secondary: '#12121A',    // Card backgrounds
    tertiary: '#1A1A24',     // Elevated surfaces
  },
  
  // Funnel stage colors (Top to Bottom)
  funnel: {
    sessions: '#3B82F6',     // Blue - Traffic
    leads: '#8B5CF6',        // Purple - Leads
    deals: '#F59E0B',        // Amber - Deals
    revenue: '#10B981',      // Emerald - Closed Won
  },
  
  // Status & feedback
  status: {
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',
  },
  
  // Text hierarchy
  text: {
    primary: '#FFFFFF',
    secondary: '#A1A1AA',
    muted: '#71717A',
  },
  
  // Accents
  accent: {
    gradient: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 50%, #10B981 100%)',
    glow: 'rgba(59, 130, 246, 0.15)',
  }
}
```

---

## 🏗️ Component Architecture

### Folder Structure

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── dashboard/
│       ├── page.tsx
│       └── layout.tsx
│
├── components/
│   ├── ui/                    # Base UI components
│   │   ├── Card.tsx
│   │   ├── Button.tsx
│   │   ├── Badge.tsx
│   │   ├── Skeleton.tsx
│   │   └── Tooltip.tsx
│   │
│   ├── charts/                # Visualization components
│   │   ├── FunnelChart.tsx    # ⭐ Primary funnel visualization
│   │   ├── WaterfallChart.tsx
│   │   ├── ConversionBar.tsx
│   │   └── TrendLine.tsx
│   │
│   ├── widgets/               # Dashboard widgets
│   │   ├── FullFunnelWidget.tsx
│   │   ├── ContentROITable.tsx
│   │   ├── AccountWatchFeed.tsx
│   │   └── KPICard.tsx
│   │
│   └── layout/
│       ├── DashboardShell.tsx
│       ├── Sidebar.tsx
│       └── Header.tsx
│
├── lib/
│   ├── api/
│   │   ├── ga4.ts            # Google Analytics integration
│   │   ├── hubspot.ts        # HubSpot CRM integration
│   │   └── rb2b.ts           # RB2B webhook handler
│   │
│   ├── utils/
│   │   ├── formatters.ts
│   │   ├── calculations.ts
│   │   └── mergeData.ts
│   │
│   └── hooks/
│       ├── useFunnelData.ts
│       ├── useContentROI.ts
│       └── useAccountWatch.ts
│
├── stores/
│   ├── dashboardStore.ts
│   └── dateRangeStore.ts
│
└── types/
    ├── funnel.ts
    ├── ga4.ts
    └── hubspot.ts
```

---

## 🎯 Widget Specifications

### 1. Full-Funnel Conversion Widget

```typescript
interface FunnelStage {
  id: string;
  label: string;
  value: number;
  previousValue: number; // For conversion calculation
  source: 'ga4' | 'hubspot';
  color: string;
  icon: LucideIcon;
}

interface FunnelWidgetProps {
  dateRange: DateRange;
  stages: FunnelStage[];
  showConversionRates: boolean;
  animateOnLoad: boolean;
}

// Stage Configuration
const FUNNEL_STAGES = [
  { 
    id: 'sessions',
    label: 'Total Sessions',
    source: 'ga4',
    color: '#3B82F6',
    metric: 'sessions'
  },
  {
    id: 'leads',
    label: 'Leads Generated',
    source: 'ga4',
    color: '#8B5CF6',
    metric: 'eventCount',
    filter: { eventName: 'Lead_Generated_All_Sites' }
  },
  {
    id: 'deals',
    label: 'Deals Created',
    source: 'hubspot',
    color: '#F59E0B',
    object: 'deals',
    filter: { createdAt: 'dateRange' }
  },
  {
    id: 'revenue',
    label: 'Closed Won Revenue',
    source: 'hubspot',
    color: '#10B981',
    object: 'deals',
    filter: { dealStage: 'closedwon', closedate: 'dateRange' },
    valueField: 'amount'
  }
];
```

### Visual Design Rules for Funnel

```css
/* Funnel Bar Styling */
.funnel-bar {
  @apply relative overflow-hidden rounded-lg;
  @apply transition-all duration-500 ease-out;
  @apply hover:scale-[1.02] hover:shadow-lg;
  background: linear-gradient(90deg, var(--stage-color) 0%, var(--stage-color-light) 100%);
}

.funnel-bar::before {
  content: '';
  @apply absolute inset-0 opacity-0;
  @apply transition-opacity duration-300;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
}

.funnel-bar:hover::before {
  @apply opacity-100;
  animation: shimmer 1.5s infinite;
}

/* Conversion Rate Connector */
.conversion-connector {
  @apply flex items-center justify-center;
  @apply text-xs font-mono;
  @apply py-2 text-gray-400;
}

.conversion-connector::before,
.conversion-connector::after {
  content: '';
  @apply h-px flex-1 bg-gradient-to-r from-transparent via-gray-600 to-transparent;
}
```

### 2. Content ROI Table Widget

```typescript
interface ContentROIRow {
  pagePath: string;
  pageTitle: string;
  uniqueVisitors: number;      // GA4: activeUsers
  leadsGenerated: number;      // HubSpot: contacts by hs_analytics_first_url
  pipelineValue: number;       // HubSpot: sum of deal amounts
  rpv: number;                 // Calculated: pipelineValue / uniqueVisitors
  conversionRate: number;      // leadsGenerated / uniqueVisitors * 100
}

interface ContentROITableProps {
  data: ContentROIRow[];
  sortField: keyof ContentROIRow;
  sortDirection: 'asc' | 'desc';
  highlightLowConversion: boolean;
  highlightThreshold: number; // e.g., 0.5% conversion rate
}
```

### Table Visual Rules

```tsx
// Row highlighting logic
const getRowClassName = (row: ContentROIRow) => {
  if (row.uniqueVisitors > 500 && row.leadsGenerated === 0) {
    return 'bg-red-500/10 border-l-2 border-red-500'; // Warning: high traffic, no leads
  }
  if (row.rpv > 100) {
    return 'bg-emerald-500/10 border-l-2 border-emerald-500'; // Success: high RPV
  }
  return '';
};

// Currency formatting
const formatCurrency = (value: number) => 
  new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0 
  }).format(value);
```

### 3. Account Watch Feed Widget

```typescript
interface AccountWatchEvent {
  id: string;
  timestamp: Date;
  visitor: {
    name: string;
    email: string;
    linkedinUrl: string;
    avatarUrl?: string;
  };
  company: {
    name: string;
    domain: string;
  };
  deal: {
    id: string;
    stageName: string;
    amount: number;
    ownerName: string;
    ownerId: string;
  };
  currentPage: string;
  isHighIntent: boolean; // /pricing or /docs
}
```

---

## 📊 Data Integration Rules

### GA4 API Queries

```typescript
// Sessions Query
const sessionsQuery = {
  dimensions: [],
  metrics: [{ name: 'sessions' }],
  dateRanges: [{ startDate, endDate }]
};

// Lead Event Query
const leadsQuery = {
  dimensions: [],
  metrics: [{ name: 'eventCount' }],
  dimensionFilter: {
    filter: {
      fieldName: 'eventName',
      stringFilter: { value: 'Lead_Generated_All_Sites' }
    }
  },
  dateRanges: [{ startDate, endDate }]
};

// Content Performance Query
const contentQuery = {
  dimensions: [
    { name: 'pagePath' },
    { name: 'pageTitle' }
  ],
  metrics: [{ name: 'activeUsers' }],
  orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
  limit: 50,
  dateRanges: [{ startDate, endDate }]
};
```

### HubSpot API Queries

```typescript
// Deals Created Query
const dealsCreatedQuery = {
  filterGroups: [{
    filters: [{
      propertyName: 'createdate',
      operator: 'BETWEEN',
      highValue: endDate,
      value: startDate
    }]
  }],
  properties: ['dealname', 'amount', 'dealstage', 'createdate', 'closedate']
};

// Closed Won Revenue Query
const closedWonQuery = {
  filterGroups: [{
    filters: [
      {
        propertyName: 'dealstage',
        operator: 'EQ',
        value: 'closedwon'
      },
      {
        propertyName: 'closedate',
        operator: 'BETWEEN',
        highValue: endDate,
        value: startDate
      }
    ]
  }],
  properties: ['amount']
};

// Attribution Query (for Content ROI)
const attributionQuery = {
  filterGroups: [{
    filters: [{
      propertyName: 'hs_analytics_first_url',
      operator: 'HAS_PROPERTY'
    }]
  }],
  properties: [
    'hs_analytics_first_url',
    'associatedcompanyid'
  ]
};
```

### Data Merge Logic

```typescript
// URL Normalization for matching GA4 ↔ HubSpot
const normalizeUrl = (url: string): string => {
  try {
    const parsed = new URL(url, 'https://purewl.com');
    let path = parsed.pathname;
    
    // Remove trailing slash
    path = path.replace(/\/$/, '') || '/';
    
    // Lowercase
    path = path.toLowerCase();
    
    // Remove common query params
    return path;
  } catch {
    return url.toLowerCase().replace(/\/$/, '') || '/';
  }
};

// Left Join: GA4 content + HubSpot attribution
const mergeContentData = (
  ga4Data: GA4ContentRow[],
  hubspotData: HubSpotAttributionRow[]
): ContentROIRow[] => {
  const hubspotMap = new Map<string, HubSpotAttributionRow>();
  
  hubspotData.forEach(row => {
    const key = normalizeUrl(row.hs_analytics_first_url);
    const existing = hubspotMap.get(key);
    if (existing) {
      existing.leadCount += 1;
      existing.pipelineValue += row.dealAmount || 0;
    } else {
      hubspotMap.set(key, { ...row, leadCount: 1 });
    }
  });
  
  return ga4Data.map(ga4Row => {
    const key = normalizeUrl(ga4Row.pagePath);
    const hubspotRow = hubspotMap.get(key);
    
    const leadsGenerated = hubspotRow?.leadCount || 0;
    const pipelineValue = hubspotRow?.pipelineValue || 0;
    const uniqueVisitors = ga4Row.activeUsers;
    
    return {
      pagePath: ga4Row.pagePath,
      pageTitle: ga4Row.pageTitle,
      uniqueVisitors,
      leadsGenerated,
      pipelineValue,
      rpv: uniqueVisitors > 0 ? pipelineValue / uniqueVisitors : 0,
      conversionRate: uniqueVisitors > 0 ? (leadsGenerated / uniqueVisitors) * 100 : 0
    };
  });
};
```

---

## 🎬 Animation Guidelines

### Funnel Load Animation

```typescript
// Staggered entrance for funnel bars
const funnelVariants = {
  hidden: { opacity: 0, scaleX: 0, originX: 0 },
  visible: (i: number) => ({
    opacity: 1,
    scaleX: 1,
    transition: {
      delay: i * 0.15,
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94] // easeOutQuad
    }
  })
};

// Number counting animation
const useAnimatedNumber = (value: number, duration = 1000) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    const startTime = Date.now();
    const startValue = displayValue;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      
      setDisplayValue(Math.round(startValue + (value - startValue) * eased));
      
      if (progress < 1) requestAnimationFrame(animate);
    };
    
    requestAnimationFrame(animate);
  }, [value]);
  
  return displayValue;
};
```

### Hover & Interaction States

```css
/* Card hover lift effect */
.dashboard-card {
  @apply transition-all duration-300 ease-out;
  @apply hover:-translate-y-1 hover:shadow-xl;
  @apply hover:shadow-blue-500/10;
}

/* Metric value pulse on update */
@keyframes metric-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.metric-updated {
  animation: metric-pulse 0.3s ease-out;
}

/* Table row hover */
.table-row {
  @apply transition-colors duration-150;
  @apply hover:bg-white/5;
}
```

---

## 🔧 API Route Specifications

### `/api/funnel/overview`

```typescript
// GET /api/funnel/overview?startDate=2025-01-01&endDate=2025-01-31
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  
  const [sessions, leads, deals, closedWon] = await Promise.all([
    fetchGA4Sessions(startDate, endDate),
    fetchGA4LeadEvents(startDate, endDate),
    fetchHubSpotDealsCreated(startDate, endDate),
    fetchHubSpotClosedWon(startDate, endDate)
  ]);
  
  return Response.json({
    stages: [
      { id: 'sessions', value: sessions, label: 'Total Sessions' },
      { id: 'leads', value: leads, label: 'Leads Generated' },
      { id: 'deals', value: deals.count, label: 'Deals Created' },
      { 
        id: 'revenue', 
        value: closedWon.totalAmount, 
        count: closedWon.count,
        label: 'Closed Won' 
      }
    ],
    conversionRates: {
      sessionToLead: (leads / sessions * 100).toFixed(2),
      leadToDeal: (deals.count / leads * 100).toFixed(2),
      dealToClose: (closedWon.count / deals.count * 100).toFixed(2)
    }
  });
}
```

### `/api/webhooks/rb2b-visitor`

```typescript
// POST /api/webhooks/rb2b-visitor
export async function POST(request: Request) {
  const payload = await request.json();
  
  const { email, linkedin_url, company_name, company_domain, page_url } = payload;
  
  // Check for open deal in HubSpot
  const openDeal = await searchHubSpotDeals({
    filterGroups: [{
      filters: [
        { propertyName: 'dealstage', operator: 'NOT_IN', values: ['closedwon', 'closedlost'] },
        { propertyName: 'associations.contact', operator: 'CONTAINS', value: email }
      ]
    }]
  });
  
  // Check if high-intent page
  const isHighIntent = /\/(pricing|docs|api)/.test(page_url);
  
  if (openDeal && isHighIntent) {
    // Save to database
    await db.accountWatchEvents.create({
      data: {
        visitorEmail: email,
        visitorLinkedin: linkedin_url,
        companyName: company_name,
        companyDomain: company_domain,
        dealId: openDeal.id,
        dealStage: openDeal.properties.dealstage,
        dealAmount: parseFloat(openDeal.properties.amount),
        currentPage: page_url,
        timestamp: new Date()
      }
    });
    
    // Optional: Send Slack notification
    if (process.env.SLACK_WEBHOOK_URL) {
      await sendSlackAlert({
        text: `🔥 *High Intent Alert*\n${company_name} is viewing ${page_url}\nOpen Deal: $${openDeal.properties.amount}`
      });
    }
  }
  
  return Response.json({ success: true });
}
```

---

## ✅ Quality Checklist

### Performance
- [ ] All API calls parallelized with `Promise.all`
- [ ] React Query caching with 5-minute stale time
- [ ] Skeleton loaders for all async components
- [ ] Virtualized tables for 50+ rows

### Accessibility
- [ ] All interactive elements keyboard accessible
- [ ] Color contrast ratio ≥ 4.5:1 for text
- [ ] ARIA labels on charts and data visualizations
- [ ] Focus indicators visible on all interactive elements

### Error Handling
- [ ] Graceful degradation when APIs fail
- [ ] User-friendly error messages
- [ ] Retry logic with exponential backoff
- [ ] Fallback UI for missing data

### Testing
- [ ] Unit tests for data transformation functions
- [ ] Integration tests for API routes
- [ ] Visual regression tests for charts
- [ ] E2E tests for critical user flows

---

## 🚀 Implementation Order

1. **Phase 1: Foundation**
   - Set up Next.js project with TypeScript
   - Configure Tailwind with custom theme
   - Create base UI components (Card, Button, etc.)

2. **Phase 2: Data Layer**
   - Implement GA4 API integration
   - Implement HubSpot API integration
   - Build data merging utilities

3. **Phase 3: Full Funnel Widget**
   - Create FunnelChart component
   - Build useFunnelData hook
   - Add animations and interactions

4. **Phase 4: Content ROI Table**
   - Create sortable table component
   - Implement attribution logic
   - Add conditional row highlighting

5. **Phase 5: Account Watch**
   - Set up RB2B webhook endpoint
   - Create real-time feed component
   - Add Slack integration

6. **Phase 6: Polish**
   - Performance optimization
   - Error handling
   - Documentation
