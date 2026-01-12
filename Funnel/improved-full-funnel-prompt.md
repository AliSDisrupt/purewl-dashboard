# Full-Funnel Conversion Widget — Complete Build Specification

## Overview

Build a **production-grade Full-Funnel Conversion Widget** that visualizes pipeline efficiency from Website Traffic → Lead Handshake → Closed Revenue in a single, animated view. This widget merges data from **Google Analytics 4** and **HubSpot CRM** to show the complete customer journey with real-time conversion metrics.

---

## 1. Visual Design Specifications

### Chart Type
**Vertical Funnel Chart** with animated bars that narrow progressively from top (traffic) to bottom (revenue).

### Color System
```
Stage 1 (Sessions):    #3B82F6 (Blue)     — Represents raw traffic
Stage 2 (Leads):       #8B5CF6 (Purple)   — Marketing qualified
Stage 3 (Deals):       #F59E0B (Amber)    — Sales pipeline
Stage 4 (Revenue):     #10B981 (Emerald)  — Closed won success
```

### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│  FULL-FUNNEL CONVERSION                    [Date Picker ▼]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ████████████████████████████████████████  10,000           │
│  Total Sessions                            ↑ 12% vs prior   │
│                                                             │
│                    ↓ 4.88% conversion rate                  │
│                                                             │
│  ██████████████                            488              │
│  Leads Generated                           ↑ 8% vs prior    │
│                                                             │
│                    ↓ 79.9% sync rate                        │
│                                                             │
│  █████████████                             390              │
│  Deals Created                             ↓ 3% vs prior    │
│                                                             │
│                    ↓ 10% close rate                         │
│                                                             │
│  ████                                      39 ($150,000)    │
│  Closed Won                                ↑ 15% vs prior   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Bar Specifications
- **Width**: Proportional to value (largest stage = 100% width, others scale relative)
- **Height**: 48px per bar
- **Border Radius**: 8px
- **Spacing Between Stages**: 24px
- **Gradient**: Each bar has a subtle left-to-right gradient (stage color → stage color 20% lighter)

### Interaction Design
| Action | Behavior |
|--------|----------|
| **Hover on bar** | Show tooltip with: stage value, % change vs. previous period, source label |
| **Hover on connector** | Highlight conversion rate, show "X of Y converted" |
| **Click on stage** | Expand to show breakdown (by source, campaign, etc.) |

---

## 2. Data Architecture

### Stage Definitions

```typescript
interface FunnelStage {
  id: 'sessions' | 'leads' | 'deals' | 'revenue';
  label: string;
  value: number;
  displayValue: string;  // Formatted (e.g., "10,000" or "$150K")
  source: 'ga4' | 'hubspot';
  color: string;
  percentChange?: number;  // vs. previous period
  conversionRate?: number; // % from previous stage
}

// Stage 1: Total Sessions
{
  id: 'sessions',
  label: 'Total Sessions',
  source: 'ga4',
  query: {
    metrics: ['sessions'],
    dimensions: [],
    dateRanges: [{ startDate, endDate }]
  }
}

// Stage 2: Leads Generated
{
  id: 'leads',
  label: 'Leads Generated',
  source: 'ga4',
  query: {
    metrics: ['eventCount'],
    dimensionFilter: {
      filter: {
        fieldName: 'eventName',
        stringFilter: { value: 'Lead_Generated_All_Sites' }
      }
    },
    dateRanges: [{ startDate, endDate }]
  }
}

// Stage 3: Deals Created
{
  id: 'deals',
  label: 'Deals Created',
  source: 'hubspot',
  query: {
    object: 'deals',
    filterGroups: [{
      filters: [{
        propertyName: 'createdate',
        operator: 'BETWEEN',
        value: startDate,
        highValue: endDate
      }]
    }],
    aggregation: 'COUNT'
  }
}

// Stage 4: Closed Won Revenue
{
  id: 'revenue',
  label: 'Closed Won Revenue',
  source: 'hubspot',
  query: {
    object: 'deals',
    filterGroups: [{
      filters: [
        { propertyName: 'dealstage', operator: 'EQ', value: 'closedwon' },
        { propertyName: 'closedate', operator: 'BETWEEN', value: startDate, highValue: endDate }
      ]
    }],
    properties: ['amount'],
    aggregation: 'SUM(amount)'
  }
}
```

### Conversion Rate Calculations

```typescript
interface ConversionMetrics {
  sessionToLead: number;    // (leads / sessions) * 100
  leadToDeal: number;       // (deals / leads) * 100
  dealToClose: number;      // (closedWon / deals) * 100
  overallConversion: number; // (closedWon / sessions) * 100
}

const calculateConversions = (stages: FunnelStage[]): ConversionMetrics => {
  const sessions = stages.find(s => s.id === 'sessions')?.value || 0;
  const leads = stages.find(s => s.id === 'leads')?.value || 0;
  const deals = stages.find(s => s.id === 'deals')?.value || 0;
  const closedWon = stages.find(s => s.id === 'revenue')?.value || 0;
  
  return {
    sessionToLead: sessions > 0 ? (leads / sessions) * 100 : 0,
    leadToDeal: leads > 0 ? (deals / leads) * 100 : 0,
    dealToClose: deals > 0 ? (closedWon / deals) * 100 : 0,
    overallConversion: sessions > 0 ? (closedWon / sessions) * 100 : 0
  };
};
```

---

## 3. API Implementation

### Endpoint: `/api/funnel/data`

```typescript
// Request
GET /api/funnel/data?startDate=2025-01-01&endDate=2025-01-31&comparePrevious=true

// Response
{
  "dateRange": {
    "start": "2025-01-01",
    "end": "2025-01-31"
  },
  "stages": [
    {
      "id": "sessions",
      "label": "Total Sessions",
      "value": 10000,
      "displayValue": "10,000",
      "previousValue": 8929,
      "percentChange": 12.0,
      "source": "ga4"
    },
    {
      "id": "leads",
      "label": "Leads Generated",
      "value": 488,
      "displayValue": "488",
      "previousValue": 452,
      "percentChange": 8.0,
      "source": "ga4"
    },
    {
      "id": "deals",
      "label": "Deals Created",
      "value": 390,
      "displayValue": "390",
      "previousValue": 402,
      "percentChange": -3.0,
      "source": "hubspot"
    },
    {
      "id": "revenue",
      "label": "Closed Won",
      "value": 150000,
      "displayValue": "$150K",
      "count": 39,
      "previousValue": 130435,
      "percentChange": 15.0,
      "source": "hubspot"
    }
  ],
  "conversions": {
    "sessionToLead": 4.88,
    "leadToDeal": 79.92,
    "dealToClose": 10.0,
    "overallConversion": 0.39
  },
  "insights": [
    {
      "type": "warning",
      "message": "Lead-to-Deal conversion dropped 3% — check HubSpot integration"
    },
    {
      "type": "success", 
      "message": "Revenue up 15% with strong close rate"
    }
  ]
}
```

### Data Fetching Logic

```typescript
export async function getFunnelData(startDate: string, endDate: string) {
  // Parallel fetch from both sources
  const [ga4Data, hubspotData] = await Promise.all([
    // GA4 Queries
    Promise.all([
      fetchGA4({
        metrics: [{ name: 'sessions' }],
        dateRanges: [{ startDate, endDate }]
      }),
      fetchGA4({
        metrics: [{ name: 'eventCount' }],
        dimensionFilter: {
          filter: {
            fieldName: 'eventName',
            stringFilter: { value: 'Lead_Generated_All_Sites' }
          }
        },
        dateRanges: [{ startDate, endDate }]
      })
    ]),
    
    // HubSpot Queries
    Promise.all([
      searchHubSpotDeals({
        filterGroups: [{
          filters: [{
            propertyName: 'createdate',
            operator: 'BETWEEN',
            value: startDate,
            highValue: endDate
          }]
        }]
      }),
      searchHubSpotDeals({
        filterGroups: [{
          filters: [
            { propertyName: 'dealstage', operator: 'EQ', value: 'closedwon' },
            { propertyName: 'closedate', operator: 'BETWEEN', value: startDate, highValue: endDate }
          ]
        }],
        properties: ['amount']
      })
    ])
  ]);
  
  // Process and return structured data
  return processFunnelData(ga4Data, hubspotData);
}
```

---

## 4. Business Intelligence Layer

### Automated Insight Detection

```typescript
interface FunnelInsight {
  type: 'success' | 'warning' | 'critical';
  stage: string;
  message: string;
  recommendation?: string;
}

const detectInsights = (
  current: FunnelStage[],
  previous: FunnelStage[]
): FunnelInsight[] => {
  const insights: FunnelInsight[] = [];
  
  // Check: High sessions but low leads
  const sessions = current.find(s => s.id === 'sessions')?.value || 0;
  const leads = current.find(s => s.id === 'leads')?.value || 0;
  const sessionToLead = sessions > 0 ? (leads / sessions) * 100 : 0;
  
  if (sessionToLead < 2) {
    insights.push({
      type: 'warning',
      stage: 'leads',
      message: 'Session-to-Lead conversion below 2%',
      recommendation: 'Review landing page messaging and form placement'
    });
  }
  
  // Check: High leads but low deals (integration issue)
  const deals = current.find(s => s.id === 'deals')?.value || 0;
  const leadToDeal = leads > 0 ? (deals / leads) * 100 : 0;
  
  if (leadToDeal < 50) {
    insights.push({
      type: 'critical',
      stage: 'deals',
      message: 'Only ' + leadToDeal.toFixed(0) + '% of leads becoming deals',
      recommendation: 'Check Lead_Generated event → HubSpot workflow integration'
    });
  }
  
  // Check: High deals but low close rate (sales issue)
  const closedWon = current.find(s => s.id === 'revenue')?.value || 0;
  const dealToClose = deals > 0 ? (closedWon / deals) * 100 : 0;
  
  if (dealToClose < 10 && deals > 20) {
    insights.push({
      type: 'warning',
      stage: 'revenue',
      message: 'Close rate below 10% with ' + deals + ' deals in pipeline',
      recommendation: 'Review sales team performance or lead quality'
    });
  }
  
  return insights;
};
```

### Diagnostic Logic Summary

| Symptom | Diagnosis | Recommended Action |
|---------|-----------|-------------------|
| High Sessions + Low Leads | Landing pages/messaging broken | A/B test CTAs, check form visibility |
| High Leads + Low Deals | Integration gap | Verify `Lead_Generated_All_Sites` → HubSpot workflow |
| High Deals + Low Revenue | Sales performance issue | Review deal velocity, qualification criteria |
| All stages declining | Market/seasonal issue | Compare YoY, check competitive landscape |

---

## 5. Component Implementation

### React Component Structure

```typescript
// components/widgets/FullFunnelWidget.tsx

interface FullFunnelWidgetProps {
  dateRange: { start: Date; end: Date };
  comparePrevious?: boolean;
  showInsights?: boolean;
  onStageClick?: (stageId: string) => void;
}

export const FullFunnelWidget: React.FC<FullFunnelWidgetProps> = ({
  dateRange,
  comparePrevious = true,
  showInsights = true,
  onStageClick
}) => {
  const { data, isLoading, error } = useFunnelData(dateRange, comparePrevious);
  
  if (isLoading) return <FunnelSkeleton />;
  if (error) return <FunnelError error={error} />;
  
  return (
    <Card className="p-6">
      <FunnelHeader dateRange={dateRange} />
      
      <div className="space-y-6 mt-6">
        {data.stages.map((stage, index) => (
          <React.Fragment key={stage.id}>
            <FunnelBar
              stage={stage}
              maxValue={data.stages[0].value}
              onClick={() => onStageClick?.(stage.id)}
              animationDelay={index * 150}
            />
            
            {index < data.stages.length - 1 && (
              <ConversionConnector
                rate={data.conversions[getConversionKey(index)]}
                fromLabel={stage.label}
                toLabel={data.stages[index + 1].label}
              />
            )}
          </React.Fragment>
        ))}
      </div>
      
      {showInsights && data.insights.length > 0 && (
        <InsightsPanel insights={data.insights} />
      )}
    </Card>
  );
};
```

### Animation Specifications

```typescript
// Framer Motion variants for funnel bars
const barVariants = {
  hidden: { 
    scaleX: 0, 
    opacity: 0,
    originX: 0 
  },
  visible: (delay: number) => ({
    scaleX: 1,
    opacity: 1,
    transition: {
      delay: delay / 1000,
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  })
};

// Number counter animation
const useCountUp = (target: number, duration = 1000) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const start = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target, duration]);
  
  return count;
};
```

---

## 6. Error Handling & Edge Cases

### Graceful Degradation

```typescript
// Handle partial data availability
const renderFunnelWithPartialData = (data: Partial<FunnelData>) => {
  const stages = FUNNEL_STAGES.map(config => {
    const value = data[config.id];
    return {
      ...config,
      value: value ?? null,
      isLoading: value === undefined,
      hasError: value === null && data.errors?.[config.id]
    };
  });
  
  return stages;
};

// Display states
interface StageState {
  value: number | null;
  isLoading: boolean;
  hasError: boolean;
  errorMessage?: string;
}
```

### Error Messages

| Error Type | User Message | Technical Action |
|------------|--------------|------------------|
| GA4 auth expired | "Analytics data unavailable — reconnect Google Analytics" | Trigger OAuth refresh |
| HubSpot rate limit | "CRM data loading slowly — please wait" | Implement exponential backoff |
| Network timeout | "Connection issue — retrying..." | Auto-retry with backoff |
| Invalid date range | "Please select a valid date range" | Validate before query |

---

## 7. Testing Checklist

### Unit Tests
- [ ] Conversion rate calculations handle zero values
- [ ] Date range parsing works across timezones
- [ ] Insight detection triggers on correct thresholds
- [ ] Number formatting handles large values (1M+)

### Integration Tests
- [ ] GA4 API returns expected schema
- [ ] HubSpot API returns expected schema
- [ ] Data merge produces correct stage values
- [ ] Previous period comparison calculates correctly

### Visual Tests
- [ ] Funnel bars scale proportionally
- [ ] Colors match design system
- [ ] Animations play smoothly (60fps)
- [ ] Responsive layout at all breakpoints

### Accessibility Tests
- [ ] Screen reader announces stage values
- [ ] Keyboard navigation works
- [ ] Color contrast passes WCAG AA
- [ ] Reduced motion preference respected

---

## 8. Success Criteria

When complete, this widget should enable:

1. **At-a-glance pipeline health** — See conversion efficiency in 3 seconds
2. **Instant bottleneck detection** — Visual narrowing shows where funnel breaks
3. **Data-source transparency** — Clear labeling of GA4 vs. HubSpot sources
4. **Actionable insights** — Automated recommendations based on patterns
5. **Time comparison** — Understand trends vs. previous period
