# PureWL Analytics Dashboard

A real-time analytics dashboard for PureVPN WhiteLabel (PureWL) that aggregates data from multiple MCP servers into a single, unified interface.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

3. Edit `.env.local` with your API credentials:
   - **LinkedIn Ads**: Add your `LINKEDIN_ACCESS_TOKEN`
   - **HubSpot**: Add your `HUBSPOT_ACCESS_TOKEN`
   - **GA4**: Configure `GOOGLE_APPLICATION_CREDENTIALS` path and `GA4_PROPERTY_ID`
   - **Reddit**: Uses MCP server (no direct API keys needed)

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📊 Features

### ✅ Completed
- ✅ Next.js 14 project setup with TypeScript
- ✅ Tailwind CSS and shadcn/ui components
- ✅ Dashboard layout with sidebar navigation
- ✅ KPI cards component
- ✅ Traffic trend chart (Recharts)
- ✅ Channel breakdown pie chart
- ✅ Top pages table
- ✅ API route structure
- ✅ Dark theme with PureVPN brand colors
- ✅ **LinkedIn Ads API integration** (direct API calls)
- ✅ **HubSpot CRM API integration** (direct API calls)
- ✅ Environment variable configuration

### 🚧 In Progress / TODO
- [ ] GA4 MCP server integration (requires bridge service)
- [ ] Reddit MCP server integration (requires bridge service)
- [ ] Geographic map component
- [ ] HubSpot deals pipeline view
- [ ] LinkedIn campaigns list UI
- [ ] Reddit feed component
- [ ] Date range picker
- [ ] Data refresh functionality
- [ ] Historical data storage (optional PostgreSQL)

## 🔌 API Integration Status

### ✅ Direct API Integration (Working)
- **LinkedIn Ads**: Direct API calls using access token
- **HubSpot CRM**: Direct API calls using access token

### ⚠️ MCP Server Integration (Requires Bridge)
- **Google Analytics (GA4)**: Uses Python MCP server
  - Requires bridge API service to connect Next.js to Python MCP server
  - Or use Google Analytics Data API directly
- **Reddit**: Uses Python MCP server
  - Requires bridge API service to connect Next.js to Python MCP server
  - Or use Reddit API directly with OAuth

## 🏗️ Project Structure

```
purewl-dashboard/
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx          # Dashboard layout with sidebar
│   │   ├── page.tsx            # Main dashboard
│   │   ├── analytics/          # GA4 Analytics page
│   │   ├── crm/                # HubSpot CRM page
│   │   ├── ads/                # LinkedIn Ads page
│   │   └── community/          # Reddit monitoring page
│   ├── api/                    # API routes
│   │   ├── ga4/
│   │   ├── hubspot/
│   │   ├── linkedin/
│   │   └── reddit/
│   ├── layout.tsx              # Root layout
│   └── globals.css              # Global styles
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── dashboard/              # Dashboard components
│   ├── charts/                 # Chart components
│   └── ga4/                    # GA4-specific components
├── lib/
│   ├── mcp/                    # MCP client libraries
│   │   ├── ga4.ts              # GA4 client (MCP bridge needed)
│   │   ├── hubspot.ts           # HubSpot client (✅ Direct API)
│   │   ├── linkedin.ts          # LinkedIn client (✅ Direct API)
│   │   └── reddit.ts            # Reddit client (MCP bridge needed)
│   ├── types.ts                # TypeScript types
│   ├── mockData.ts             # Mock data for testing
│   └── utils.ts                # Utility functions
├── DATA/                       # MCP server configs and Python scripts
│   ├── claude_desktop_config.json
│   ├── server.py               # LinkedIn MCP server
│   └── hubspot_server.py        # HubSpot MCP server
└── public/                      # Static assets
```

## 🔐 Environment Variables

Create a `.env.local` file with:

```bash
# LinkedIn Ads
LINKEDIN_ACCESS_TOKEN=your_token_here
LINKEDIN_API_BASE=https://api.linkedin.com/rest

# HubSpot
HUBSPOT_ACCESS_TOKEN=your_token_here
HUBSPOT_API_BASE=https://api.hubapi.com

# GA4 (MCP Server)
GOOGLE_APPLICATION_CREDENTIALS=path/to/credentials.json
GA4_PROPERTY_ID=your_property_id

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **State Management**: React Query (TanStack Query)
- **Icons**: Lucide React

## 📡 MCP Server Integration

The dashboard integrates with MCP servers for:
1. **Google Analytics (GA4)** - Python MCP server (requires bridge)
2. **HubSpot CRM** - ✅ Direct API integration
3. **LinkedIn Ads** - ✅ Direct API integration
4. **Reddit** - Python MCP server (requires bridge)

### MCP Bridge Service (Future)

To connect Python MCP servers to Next.js, you'll need a bridge service that:
1. Runs as a separate service (Node.js/Express or Python/FastAPI)
2. Communicates with Python MCP servers
3. Exposes HTTP endpoints for Next.js to call
4. Handles authentication and error handling

## 📝 License

Private - PureVPN WhiteLabel Internal Use
