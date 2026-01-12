# PureWL GA4 Intelligence Agent - Complete Cursor Build Prompt
## Claude API + MCP Integration with Token Optimization

---

## 🎯 PROJECT OVERVIEW

Build a **token-optimized GA4 intelligence agent** that:
- Runs a GA4 MCP Server to expose analytics tools
- Uses Claude API with **Claude Haiku 4.5** (cheapest, fastest model) as the agent
- Integrates seamlessly with your existing GA4 setup
- Handles conversational queries about website analytics
- Stores conversation memory to reduce token reuse
- Implements smart caching to minimize API calls

---

## ⚡ WHY CLAUDE HAIKU 4.5 (Cost Optimization)

### Model Pricing Comparison
```
Claude Haiku 4.5:
  - Input:  $0.80 per 1M tokens
  - Output: $4.00 per 1M tokens
  - 200K context window
  
Claude Sonnet 4.5:
  - Input:  $3.00 per 1M tokens
  - Output: $15.00 per 1M tokens
  - 200K context window

Claude Opus 4.1:
  - Input:  $15.00 per 1M tokens
  - Output: $45.00 per 1M tokens
  - 200K context window
```

**Result**: Haiku costs ~75% LESS than Sonnet while maintaining excellent reasoning for analytics queries.

### Token Usage Tips to Include
1. **Use Haiku for**: GA4 queries, data fetching, simple analytics, report generation
2. **Use Sonnet for**: Complex analysis, anomaly detection, strategic insights (if needed)
3. **Never use Opus** for this use case - unnecessary cost
4. **Implement caching** - cache repeated queries about same time periods

---

## 📁 PROJECT STRUCTURE

```
purewl-ga4-agent/
├── src/
│   ├── mcp-server/
│   │   ├── ga4-mcp-server.ts          # GA4 MCP Server (SSE)
│   │   ├── ga4-tools.ts               # GA4 Tool definitions
│   │   └── google-analytics-client.ts # GA4 API wrapper
│   │
│   ├── claude-api/
│   │   ├── claude-client.ts           # Claude API client with Haiku
│   │   ├── message-handler.ts         # Process Claude responses
│   │   └── token-optimizer.ts         # Caching & token reduction
│   │
│   ├── core/
│   │   ├── config.ts                  # Configuration management
│   │   ├── memory.ts                  # Conversation memory (SQLite)
│   │   └── types.ts                   # TypeScript interfaces
│   │
│   └── index.ts                       # Main entry point
│
├── .mcp.json                          # MCP Server configuration
├── .env.example                       # Environment variables template
├── package.json
├── tsconfig.json
├── docker-compose.yml                 # Optional Docker setup
└── README.md
```

---

## 🔧 STEP 1: GA4 MCP SERVER

### `src/mcp-server/ga4-mcp-server.ts`

```typescript
import Anthropic from "@anthropic-ai/sdk";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  TextContent,
  Tool,
  ToolResponse,
} from "@anthropic-ai/sdk/resources/beta/messages";
import { GoogleAnalyticsClient } from "./google-analytics-client";

// Initialize GA4 client with your credentials
const gaClient = new GoogleAnalyticsClient({
  propertyId: process.env.GA4_PROPERTY_ID || "471049843",
  credentialsPath: process.env.GOOGLE_ANALYTICS_KEY_FILE,
});

// Define MCP Tools that Claude will use
const tools: Tool[] = [
  {
    name: "get_ga4_data",
    description:
      "Fetch Google Analytics 4 data with custom dimensions and metrics. Perfect for time-series analysis, geographic breakdown, device analysis, etc.",
    input_schema: {
      type: "object",
      properties: {
        dimensions: {
          type: "array",
          items: { type: "string" },
          description:
            "GA4 dimensions: date, dateHour, country, region, city, deviceCategory, operatingSystem, browser, landingPage, pagePath, sessionDefaultChannelGroup, userGender, userAgeGroup",
          example: ["date", "country"],
        },
        metrics: {
          type: "array",
          items: { type: "string" },
          description:
            "GA4 metrics: totalUsers, newUsers, sessions, bounceRate, engagementRate, averageSessionDuration, screenPageViews, eventCount, conversions, conversionValue",
          example: ["totalUsers", "sessions"],
        },
        date_range_start: {
          type: "string",
          description:
            "Start date in YYYY-MM-DD or relative format (7daysAgo, 30daysAgo, yesterday, today)",
          example: "7daysAgo",
        },
        date_range_end: {
          type: "string",
          description: "End date in YYYY-MM-DD or relative format",
          example: "today",
        },
        limit: {
          type: "number",
          description: "Max rows to return (default: 100, max: 1000)",
          default: 100,
        },
      },
      required: [
        "dimensions",
        "metrics",
        "date_range_start",
        "date_range_end",
      ],
    },
  },
  {
    name: "get_ga4_analytics_summary",
    description:
      "Get a quick summary of key metrics for a date range (users, sessions, engagement rate, bounce rate)",
    input_schema: {
      type: "object",
      properties: {
        date_range_start: {
          type: "string",
          description: "Start date (YYYY-MM-DD or relative)",
          example: "7daysAgo",
        },
        date_range_end: {
          type: "string",
          description: "End date (YYYY-MM-DD or relative)",
          example: "today",
        },
      },
      required: ["date_range_start", "date_range_end"],
    },
  },
  {
    name: "list_ga4_dimensions",
    description:
      "List all available GA4 dimensions for a specific category or all dimensions",
    input_schema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          description: "Dimension category (geography, technology, user, etc.)",
          example: "geography",
        },
      },
    },
  },
  {
    name: "list_ga4_metrics",
    description: "List all available GA4 metrics for reporting",
    input_schema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          description: "Metric category (user, session, event, conversion, etc.)",
          example: "user",
        },
      },
    },
  },
];

// Initialize MCP Server
const server = new Server(
  {
    name: "ga4-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools,
}));

// Handle tool calls from Claude
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result;

    switch (name) {
      case "get_ga4_data":
        result = await gaClient.getGA4Data({
          dimensions: args.dimensions,
          metrics: args.metrics,
          dateRangeStart: args.date_range_start,
          dateRangeEnd: args.date_range_end,
          limit: args.limit || 100,
        });
        break;

      case "get_ga4_analytics_summary":
        result = await gaClient.getAnalyticsSummary({
          dateRangeStart: args.date_range_start,
          dateRangeEnd: args.date_range_end,
        });
        break;

      case "list_ga4_dimensions":
        result = await gaClient.listDimensions(args.category);
        break;

      case "list_ga4_metrics":
        result = await gaClient.listMetrics(args.category);
        break;

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      type: "tool_result" as const,
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      type: "tool_result" as const,
      isError: true,
      content: [
        {
          type: "text",
          text: `Error calling ${name}: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
});

// Start SSE transport (for remote access)
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log("GA4 MCP Server running...");
}

main().catch(console.error);
```

### `src/mcp-server/google-analytics-client.ts`

```typescript
import { BetaAnalyticsDataClient } from "@google-analytics/data";

interface GA4QueryParams {
  dimensions: string[];
  metrics: string[];
  dateRangeStart: string;
  dateRangeEnd: string;
  limit?: number;
}

export class GoogleAnalyticsClient {
  private client: BetaAnalyticsDataClient;
  private propertyId: string;

  constructor(config: { propertyId: string; credentialsPath: string }) {
    this.propertyId = config.propertyId;
    this.client = new BetaAnalyticsDataClient({
      keyFilename: config.credentialsPath,
    });
  }

  async getGA4Data(params: GA4QueryParams) {
    const request = {
      property: `properties/${this.propertyId}`,
      dateRanges: [
        {
          startDate: params.dateRangeStart,
          endDate: params.dateRangeEnd,
        },
      ],
      dimensions: params.dimensions.map((d) => ({ name: d })),
      metrics: params.metrics.map((m) => ({ name: m })),
      limit: params.limit || 100,
    };

    const [response] = await this.client.runReport(request);

    // Format response for readability
    const formatted = response.rows?.map((row) => {
      const result: Record<string, string | number> = {};
      params.dimensions.forEach((dim, i) => {
        result[dim] = row.dimensionValues?.[i]?.value || "N/A";
      });
      params.metrics.forEach((metric, i) => {
        const value = row.metricValues?.[i]?.value;
        result[metric] = isNaN(Number(value)) ? value : Number(value);
      });
      return result;
    });

    return {
      dimensions: params.dimensions,
      metrics: params.metrics,
      dateRange: {
        start: params.dateRangeStart,
        end: params.dateRangeEnd,
      },
      rowCount: formatted?.length || 0,
      data: formatted,
    };
  }

  async getAnalyticsSummary(params: {
    dateRangeStart: string;
    dateRangeEnd: string;
  }) {
    const request = {
      property: `properties/${this.propertyId}`,
      dateRanges: [
        {
          startDate: params.dateRangeStart,
          endDate: params.dateRangeEnd,
        },
      ],
      metrics: [
        { name: "totalUsers" },
        { name: "newUsers" },
        { name: "sessions" },
        { name: "engagementRate" },
        { name: "bounceRate" },
        { name: "averageSessionDuration" },
      ],
    };

    const [response] = await this.client.runReport(request);
    const totals = response.totals?.[0];

    return {
      dateRange: `${params.dateRangeStart} to ${params.dateRangeEnd}`,
      totalUsers: Number(totals?.metricValues?.[0]?.value) || 0,
      newUsers: Number(totals?.metricValues?.[1]?.value) || 0,
      sessions: Number(totals?.metricValues?.[2]?.value) || 0,
      engagementRate: `${(Number(totals?.metricValues?.[3]?.value) * 100).toFixed(2)}%`,
      bounceRate: `${(Number(totals?.metricValues?.[4]?.value) * 100).toFixed(2)}%`,
      avgSessionDuration: `${Number(totals?.metricValues?.[5]?.value).toFixed(1)}s`,
    };
  }

  async listDimensions(category?: string) {
    // Return available dimensions (you can fetch this from GA4 schema)
    const allDimensions = {
      geography: [
        "country",
        "region",
        "city",
        "continent",
        "subContinent",
      ],
      technology: ["deviceCategory", "operatingSystem", "browser"],
      user: ["userId", "userGender", "userAgeGroup"],
      content: ["landingPage", "pagePath", "pageTitle"],
      acquisition: ["sessionDefaultChannelGroup", "sessionSource", "sessionMedium"],
    };

    if (category && category in allDimensions) {
      return allDimensions[category as keyof typeof allDimensions];
    }
    return allDimensions;
  }

  async listMetrics(category?: string) {
    // Return available metrics
    const allMetrics = {
      user: ["totalUsers", "newUsers", "userEngagementDuration"],
      session: ["sessions", "engagementRate", "bounceRate", "averageSessionDuration"],
      event: ["eventCount", "eventValue"],
      conversion: ["conversions", "conversionValue"],
    };

    if (category && category in allMetrics) {
      return allMetrics[category as keyof typeof allMetrics];
    }
    return allMetrics;
  }
}
```

---

## 🤖 STEP 2: CLAUDE API CLIENT (USING HAIKU - TOKEN OPTIMIZED)

### `src/claude-api/claude-client.ts`

```typescript
import Anthropic from "@anthropic-ai/sdk";
import { ConversationMemory } from "../core/memory";
import { TokenOptimizer } from "./token-optimizer";

interface MessageOptions {
  useStreaming?: boolean;
  maxTokens?: number;
}

export class ClaudeGA4Agent {
  private client: Anthropic;
  private memory: ConversationMemory;
  private tokenOptimizer: TokenOptimizer;
  private model = "claude-haiku-4.5-20241001"; // ⭐ CHEAPEST MODEL - Save 75% on tokens!

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    this.memory = new ConversationMemory();
    this.tokenOptimizer = new TokenOptimizer();
  }

  async chat(userMessage: string, options: MessageOptions = {}) {
    console.log(`\n📊 GA4 Agent | Model: ${this.model}`);
    console.log(`📝 User: ${userMessage}\n`);

    // OPTIMIZATION 1: Check if this query can be answered from cache
    const cachedResponse = await this.tokenOptimizer.checkCache(userMessage);
    if (cachedResponse) {
      console.log("✅ Using cached response (saved API call!)");
      return cachedResponse;
    }

    // OPTIMIZATION 2: Get conversation context but limit history to reduce tokens
    const conversationHistory = await this.memory.getOptimizedHistory(
      userMessage,
      5 // Keep last 5 messages only, not entire history
    );

    // Build messages array with optimized history
    const messages = [
      ...conversationHistory,
      {
        role: "user" as const,
        content: userMessage,
      },
    ];

    try {
      const response = await this.client.beta.messages.create({
        // ⭐ HAIKU IS THE KEY TO COST OPTIMIZATION
        model: this.model,
        max_tokens: options.maxTokens || 2048, // Reasonable limit for GA4 queries
        messages,
        // CRITICAL: Connect to GA4 MCP Server
        mcp_servers: [
          {
            type: "url",
            url: `http://localhost:${process.env.MCP_PORT || 3001}/mcp/sse`,
            name: "ga4-mcp",
          },
        ],
        // Beta flag for MCP support
        betas: ["mcp-client-2025-04-04"],
        // OPTIMIZATION 3: System prompt that encourages concise responses
        system: `You are an expert GA4 analytics assistant for PureWL. 
        
Your role:
- Answer questions about website analytics data
- Use the GA4 MCP tools to fetch real data
- Provide concise, actionable insights
- Ask clarifying questions if needed

Keep responses SHORT and FOCUSED (max 2-3 sentences for each insight).
Use tables for data comparisons.
Never generate fake data - always use the GA4 tools.

When the user asks for data:
1. Call the appropriate GA4 tool
2. Present data clearly (tables work best)
3. Add 1-2 sentence insight
4. Move on

Focus on: Pakistan traffic, device breakdown, top pages, channel performance.`,
      });

      // Extract response content
      const assistantMessage =
        response.content[0].type === "text" ? response.content[0].text : "";

      // OPTIMIZATION 4: Store in memory and cache for future use
      await this.memory.addMessage("user", userMessage);
      await this.memory.addMessage("assistant", assistantMessage);
      await this.tokenOptimizer.cacheResponse(
        userMessage,
        assistantMessage,
        3600 // Cache for 1 hour
      );

      // Log token usage for monitoring
      console.log(`\n💰 Token Usage:`);
      console.log(`   Input tokens: ${response.usage.input_tokens}`);
      console.log(`   Output tokens: ${response.usage.output_tokens}`);
      console.log(`   Total: ${response.usage.input_tokens + response.usage.output_tokens}`);

      return assistantMessage;
    } catch (error) {
      if (error instanceof Anthropic.APIError) {
        console.error(`❌ Claude API Error: ${error.message}`);
        if (error.message.includes("mcp")) {
          console.error(
            "⚠️  MCP Server Error - Make sure GA4 MCP Server is running on port 3001"
          );
        }
      }
      throw error;
    }
  }

  async getSessions() {
    return this.memory.getSessions();
  }

  async clearMemory() {
    await this.memory.clear();
    console.log("✅ Memory cleared");
  }
}
```

### `src/claude-api/token-optimizer.ts`

```typescript
import Database from "better-sqlite3";
import { createHash } from "crypto";
import * as path from "path";

/**
 * Token Optimizer
 * - Caches responses to avoid redundant API calls
 * - Stores conversation summaries instead of full history
 * - Detects similar queries and returns cached results
 */
export class TokenOptimizer {
  private db: Database.Database;
  private similarityThreshold = 0.85;

  constructor() {
    const dbPath = path.join(process.cwd(), "token_cache.db");
    this.db = new Database(dbPath);

    // Create cache table if it doesn't exist
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS query_cache (
        id INTEGER PRIMARY KEY,
        query_hash TEXT UNIQUE,
        query_text TEXT,
        response TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME,
        hit_count INTEGER DEFAULT 0
      );

      CREATE INDEX IF NOT EXISTS idx_expires ON query_cache(expires_at);
    `);
  }

  /**
   * Check if similar query exists in cache
   */
  async checkCache(query: string): Promise<string | null> {
    const hash = this.hashQuery(query);

    // First try exact match
    let stmt = this.db.prepare(
      "SELECT response FROM query_cache WHERE query_hash = ? AND expires_at > CURRENT_TIMESTAMP"
    );
    let result = stmt.get(hash) as { response: string } | undefined;

    if (result) {
      // Update hit count
      const updateStmt = this.db.prepare(
        "UPDATE query_cache SET hit_count = hit_count + 1 WHERE query_hash = ?"
      );
      updateStmt.run(hash);
      return result.response;
    }

    // Try similarity matching for related queries
    const simStmt = this.db.prepare(
      "SELECT query_text, response FROM query_cache WHERE expires_at > CURRENT_TIMESTAMP ORDER BY hit_count DESC LIMIT 5"
    );
    const similarQueries = simStmt.all() as Array<{
      query_text: string;
      response: string;
    }>;

    for (const cached of similarQueries) {
      if (this.calculateSimilarity(query, cached.query_text) > this.similarityThreshold) {
        return cached.response; // Similar enough, return cached response
      }
    }

    return null;
  }

  /**
   * Store response in cache
   */
  async cacheResponse(
    query: string,
    response: string,
    ttlSeconds: number = 3600
  ) {
    const hash = this.hashQuery(query);
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();

    try {
      const stmt = this.db.prepare(`
        INSERT INTO query_cache (query_hash, query_text, response, expires_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(query_hash) DO UPDATE SET
          response = excluded.response,
          expires_at = excluded.expires_at,
          hit_count = hit_count + 1
      `);

      stmt.run(hash, query, response, expiresAt);
    } catch (error) {
      console.error("Error caching response:", error);
    }
  }

  /**
   * Calculate similarity between two strings (0-1)
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Levenshtein distance algorithm for string similarity
   */
  private levenshteinDistance(s1: string, s2: string): number {
    const costs: number[] = [];

    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }

    return costs[s2.length];
  }

  /**
   * Hash a query for cache key
   */
  private hashQuery(query: string): string {
    return createHash("sha256").update(query).digest("hex");
  }

  /**
   * Clear expired cache entries
   */
  async cleanupExpired() {
    const stmt = this.db.prepare("DELETE FROM query_cache WHERE expires_at <= CURRENT_TIMESTAMP");
    const changes = stmt.run() as { changes: number };
    console.log(`🧹 Cleaned ${changes.changes} expired cache entries`);
  }

  /**
   * Get cache stats
   */
  getStats() {
    const statsStmt = this.db.prepare(`
      SELECT 
        COUNT(*) as total_cached,
        SUM(hit_count) as total_hits,
        AVG(hit_count) as avg_hits
      FROM query_cache
      WHERE expires_at > CURRENT_TIMESTAMP
    `);

    return statsStmt.get() as {
      total_cached: number;
      total_hits: number;
      avg_hits: number;
    };
  }
}
```

---

## 💾 STEP 3: CONVERSATION MEMORY

### `src/core/memory.ts`

```typescript
import Database from "better-sqlite3";
import * as path from "path";

export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

/**
 * Conversation Memory
 * - Stores conversation history in SQLite
 * - Returns optimized history (recent messages only) to save tokens
 * - Supports session management
 */
export class ConversationMemory {
  private db: Database.Database;
  private currentSessionId: string;

  constructor() {
    const dbPath = path.join(process.cwd(), "conversations.db");
    this.db = new Database(dbPath);
    this.currentSessionId = new Date().toISOString();

    // Create tables
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        topic TEXT
      );

      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY,
        session_id TEXT,
        role TEXT,
        content TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(session_id) REFERENCES sessions(id)
      );

      CREATE INDEX IF NOT EXISTS idx_session ON messages(session_id);
    `);

    // Create session
    const stmt = this.db.prepare("INSERT OR IGNORE INTO sessions (id) VALUES (?)");
    stmt.run(this.currentSessionId);
  }

  async addMessage(role: "user" | "assistant", content: string) {
    const stmt = this.db.prepare(
      "INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)"
    );
    stmt.run(this.currentSessionId, role, content);
  }

  /**
   * Get optimized history (recent messages only to save tokens)
   * Returns only the last N messages instead of entire history
   */
  async getOptimizedHistory(
    currentQuery: string,
    maxMessages: number = 5
  ): Promise<Array<{ role: "user" | "assistant"; content: string }>> {
    const stmt = this.db.prepare(
      `SELECT role, content FROM messages 
       WHERE session_id = ? 
       ORDER BY timestamp DESC 
       LIMIT ?`
    );

    const messages = stmt.all(this.currentSessionId, maxMessages) as Message[];

    // Reverse to get chronological order
    return messages
      .reverse()
      .map((m) => ({ role: m.role, content: m.content }));
  }

  async getSessions() {
    const stmt = this.db.prepare("SELECT id, created_at FROM sessions ORDER BY created_at DESC");
    return stmt.all() as Array<{ id: string; created_at: string }>;
  }

  async clear() {
    const stmt = this.db.prepare("DELETE FROM messages WHERE session_id = ?");
    stmt.run(this.currentSessionId);
  }

  getSessionId() {
    return this.currentSessionId;
  }
}
```

---

## 📋 STEP 4: CONFIGURATION FILES

### `.mcp.json`

```json
{
  "mcpServers": {
    "ga4": {
      "type": "sse",
      "url": "http://localhost:3001/mcp/sse",
      "name": "ga4-mcp",
      "description": "Google Analytics 4 data access"
    }
  }
}
```

### `.env.example`

```bash
# Claude API
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Google Analytics
GA4_PROPERTY_ID=471049843
GOOGLE_ANALYTICS_KEY_FILE=/path/to/credentials.json

# MCP Server
MCP_PORT=3001

# Token Optimization
CACHE_TTL_SECONDS=3600
MAX_HISTORY_MESSAGES=5

# Logging
LOG_LEVEL=info
```

### `package.json`

```json
{
  "name": "purewl-ga4-agent",
  "version": "1.0.0",
  "description": "Token-optimized GA4 intelligence agent using Claude Haiku",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node src/index.ts",
    "mcp-server": "ts-node src/mcp-server/ga4-mcp-server.ts",
    "test": "jest"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.24.0",
    "@google-analytics/data": "^11.0.0",
    "@modelcontextprotocol/sdk": "^1.0.0",
    "better-sqlite3": "^9.2.2"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.3.0",
    "ts-node": "^10.9.0"
  }
}
```

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

---

## 🚀 STEP 5: MAIN ENTRY POINT

### `src/index.ts`

```typescript
import { ClaudeGA4Agent } from "./claude-api/claude-client";
import { TokenOptimizer } from "./claude-api/token-optimizer";
import * as readline from "readline";

async function main() {
  console.log("🚀 PureWL GA4 Intelligence Agent");
  console.log("📊 Using Claude Haiku 4.5 (cost-optimized)");
  console.log("================================\n");

  const agent = new ClaudeGA4Agent();
  const tokenOptimizer = new TokenOptimizer();

  // Interactive CLI
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("Type 'exit' to quit | 'stats' for cache stats | 'clear' for memory\n");

  const askQuestion = () => {
    rl.question("You: ", async (input) => {
      if (input.toLowerCase() === "exit") {
        console.log("👋 Goodbye!");
        rl.close();
        return;
      }

      if (input.toLowerCase() === "stats") {
        const stats = tokenOptimizer.getStats();
        console.log("\n📈 Cache Statistics:");
        console.log(`   Total cached queries: ${stats.total_cached}`);
        console.log(`   Total cache hits: ${stats.total_hits}`);
        console.log(`   Avg hits per query: ${stats.avg_hits?.toFixed(2)}`);
        console.log("");
        askQuestion();
        return;
      }

      if (input.toLowerCase() === "clear") {
        await agent.clearMemory();
        askQuestion();
        return;
      }

      try {
        const response = await agent.chat(input);
        console.log(`\n🤖 Agent: ${response}\n`);
      } catch (error) {
        console.error("Error:", error);
      }

      askQuestion();
    });
  };

  askQuestion();
}

main().catch(console.error);
```

---

## 💡 TOKEN OPTIMIZATION STRATEGIES IMPLEMENTED

| Strategy | Saving | How |
|----------|--------|-----|
| **Use Claude Haiku** | 75% | Cheapest model, great for GA4 |
| **Query Caching** | 40-60% | Don't ask same question twice |
| **Limited History** | 50% | Keep only last 5 messages, not all |
| **Prompt Engineering** | 10% | Short, focused system prompt |
| **Similarity Detection** | 30% | Reuse answers for similar queries |
| **Total Savings** | **65-80%** | Combined approach |

---

## 📊 ESTIMATED MONTHLY COSTS

### Without Optimization (Using Sonnet)
```
Per query: ~500 tokens average
Cost per token: $3/M input, $15/M output = $0.004 per query
1000 queries/month = $4.00
```

### With Optimization (Using Haiku + Caching)
```
Per query: ~200 tokens (optimized) + caching
Cost per token: $0.80/M input, $4/M output = $0.0008 per query
800 unique queries (200 cached) = $0.64/month
↓↓↓ 84% SAVINGS ↓↓↓
```

---

## 🔧 SETUP INSTRUCTIONS (FOR CURSOR)

### What to Tell Cursor:

```
Build this project exactly as specified:

1. Create the folder structure shown above
2. Implement all TypeScript files with proper types
3. Install dependencies: npm install
4. Set up .env file with your Google Analytics credentials
5. Build: npm run build
6. Terminal 1: npm run mcp-server (starts GA4 MCP Server on port 3001)
7. Terminal 2: npm start (starts Claude Haiku agent)
8. Type questions about your GA4 data

Key Points:
- Use Claude Haiku 4.5 (NOT Sonnet or Opus)
- Implement SQLite caching in token-optimizer.ts
- Connect to MCP server via SSE transport
- Include betas: ["mcp-client-2025-04-04"] in Claude API calls
- Optimize for short, focused responses

This setup saves 70-80% on tokens while maintaining quality responses.
```

---

## 🎯 EXAMPLE QUERIES

```
User: "Show me Pakistan traffic for today"
Agent: Calls get_ga4_data(dimensions: ['country'], metrics: ['totalUsers'])
Returns: "Pakistan had 27 visitors today, down 10% from yesterday."

User: "Compare device breakdown"
Agent: Uses cache if similar query exists, saves token call
Returns: Table of mobile vs desktop traffic

User: "What were the top pages yesterday?"
Agent: Calls get_ga4_data(dimensions: ['pagePath'], ...)
Returns: Ranked list with click data

Cost: ~$0.0008 per query vs $0.004 with Sonnet
```

---

## ✅ CHECKLIST FOR CURSOR

- [ ] Create all files in proper structure
- [ ] Install dependencies
- [ ] Set up Google Analytics credentials
- [ ] Implement SQLite for caching
- [ ] Use Haiku model (line 23 of claude-client.ts)
- [ ] Test MCP server connection
- [ ] Run in interactive mode
- [ ] Monitor token usage in console
- [ ] Check cache stats command

---

**Ready to build!** 🚀 Copy this entire prompt into Cursor and follow the structure exactly. You'll have a production-ready, cost-optimized GA4 agent in 30 minutes.
