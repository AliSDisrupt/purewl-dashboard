import { NextResponse } from "next/server";

// Use environment variable or fallback to the provided admin key
// The admin key is required for usage report API - regular API key won't work
function getAnthropicAdminKey(): string {
  // First try environment variable
  const envKey = process.env.ANTHROPIC_ADMIN_KEY;
  if (envKey && envKey.trim().startsWith('sk-ant-admin')) {
    return envKey.trim();
  }
  
  // No fallback - require environment variable
  throw new Error("ANTHROPIC_ADMIN_KEY environment variable is required");
}

const ANTHROPIC_ADMIN_KEY = getAnthropicAdminKey();

// Log which key is being used (first 20 chars for debugging)
if (ANTHROPIC_ADMIN_KEY && ANTHROPIC_ADMIN_KEY.startsWith('sk-ant-admin')) {
  console.log(`[Anthropic Usage API] Using admin key: ${ANTHROPIC_ADMIN_KEY.substring(0, 20)}...`);
} else {
  console.error("[Anthropic Usage API] ANTHROPIC_ADMIN_KEY is invalid. Usage tracking will not work.");
}

interface AnthropicUsageData {
  inputTokens: number;
  outputTokens: number;
  cachedInputTokens: number;
  cacheCreationTokens: number;
  totalTokens: number;
  byModel: {
    [model: string]: {
      inputTokens: number;
      outputTokens: number;
      cachedInputTokens: number;
      cacheCreationTokens: number;
      totalTokens: number;
    };
  };
}

interface AnthropicCostData {
  totalCost: number;
  tokenCosts: number;
  webSearchCosts: number;
  codeExecutionCosts: number;
  byModel: {
    [model: string]: {
      totalCost: number;
      tokenCosts: number;
      webSearchCosts: number;
      codeExecutionCosts: number;
    };
  };
}

/**
 * Fetch usage report from Anthropic API
 */
async function fetchUsageReport(startingAt: string, endingAt: string, bucketWidth: '1d' | '1h' | '1m' = '1d') {
  // Limit must be <= 31 when bucket_width is '1d', <= 168 when '1h', <= 10080 when '1m'
  const limit = bucketWidth === '1d' ? '31' : bucketWidth === '1h' ? '168' : '10080';
  
  const params = new URLSearchParams({
    starting_at: startingAt,
    ending_at: endingAt,
    bucket_width: bucketWidth,
    limit: limit,
  });

  // IMPORTANT: Use admin key, not regular API key - only admin keys can access usage reports
  const adminKey = getAnthropicAdminKey();
  
  const response = await fetch(`https://api.anthropic.com/v1/organizations/usage_report/messages?${params}`, {
    method: "GET",
    headers: {
      "x-api-key": adminKey, // Must be admin key, not regular API key
      "anthropic-version": "2023-06-01",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic API Error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return response.json();
}

/**
 * Fetch cost report from Anthropic API
 */
async function fetchCostReport(startingAt: string, endingAt: string) {
  const params = new URLSearchParams({
    starting_at: startingAt,
    ending_at: endingAt,
  });

  // IMPORTANT: Use admin key, not regular API key - only admin keys can access cost reports
  const adminKey = getAnthropicAdminKey();
  
  const response = await fetch(`https://api.anthropic.com/v1/organizations/cost_report?${params}`, {
    method: "GET",
    headers: {
      "x-api-key": adminKey, // Must be admin key, not regular API key
      "anthropic-version": "2023-06-01",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic API Error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return response.json();
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const daysBack = parseInt(searchParams.get('days') || '7');
    // Granularity options: '1d' (daily), '1h' (hourly), '1m' (minute)
    const bucketWidth = (searchParams.get('bucket_width') || '1d') as '1d' | '1h' | '1m';
    
    // Validate bucket width
    const validBucketWidths: ('1d' | '1h' | '1m')[] = ['1d', '1h', '1m'];
    const finalBucketWidth = validBucketWidths.includes(bucketWidth) ? bucketWidth : '1d';
    
    // Calculate date range
    const endingAt = new Date();
    const startingAt = new Date();
    startingAt.setDate(startingAt.getDate() - daysBack);

    const startingAtISO = startingAt.toISOString();
    const endingAtISO = endingAt.toISOString();

    // Fetch both usage and cost reports
    // Usage Report supports granularity: 1-minute, 1-hour, or 1-day buckets
    const [usageData, costData] = await Promise.all([
      fetchUsageReport(startingAtISO, endingAtISO, finalBucketWidth).catch((err) => {
        console.error("Error fetching usage report:", err);
        throw err;
      }),
      fetchCostReport(startingAtISO, endingAtISO).catch((err) => {
        console.warn("Cost report not available:", err.message);
        return null; // Cost report might not be available for all accounts
      }),
    ]);

    // Process usage data
    // Anthropic API returns data in this structure:
    // { data: [{ bucket: {...}, metrics: {...}, model: "..." }, ...] }
    const usage: AnthropicUsageData = {
      inputTokens: 0,
      outputTokens: 0,
      cachedInputTokens: 0,
      cacheCreationTokens: 0,
      totalTokens: 0,
      byModel: {},
    };

    // Aggregate usage data from all buckets
    // The API returns: { data: [{ starting_at, ending_at, results: [{ uncached_input_tokens, cache_read_input_tokens, cache_creation, output_tokens, model, workspace_id, api_key_id, ... }] }, ...] }
    // Actual structure: result.uncached_input_tokens, result.cache_read_input_tokens, result.cache_creation, result.output_tokens, result.model, result.workspace_id, result.api_key_id
    const dataBuckets = usageData?.data || [];
    
    if (Array.isArray(dataBuckets) && dataBuckets.length > 0) {
      for (const bucket of dataBuckets) {
        // Each bucket has a 'results' array with usage data
        const results = bucket.results || [];
        
        if (Array.isArray(results) && results.length > 0) {
          for (const result of results) {
            // Usage Report API structure: result fields are at top level
            // Fields: uncached_input_tokens, cache_read_input_tokens, cache_creation, output_tokens, model, workspace_id, api_key_id
            const uncachedInputTokens = Number(result.uncached_input_tokens || 0);
            const cachedInputTokens = Number(result.cache_read_input_tokens || 0);
            const cacheCreationTokens = Number(result.cache_creation || 0);
            const outputTokens = Number(result.output_tokens || 0);
            
            // Total input tokens = uncached + cached
            const totalInputTokens = uncachedInputTokens + cachedInputTokens;
            
            // Extract metadata for breakdown
            const bucketModel = result.model || null;
            const workspaceId = result.workspace_id || null;
            const apiKeyId = result.api_key_id || null;

            // Aggregate totals
            usage.inputTokens += totalInputTokens;
            usage.outputTokens += outputTokens;
            usage.cachedInputTokens += cachedInputTokens;
            usage.cacheCreationTokens += cacheCreationTokens;

            // Aggregate by model if available (model can be null, so check for truthy value)
            if (bucketModel && bucketModel !== null && bucketModel !== 'null' && bucketModel !== '') {
              if (!usage.byModel[bucketModel]) {
                usage.byModel[bucketModel] = {
                  inputTokens: 0,
                  outputTokens: 0,
                  cachedInputTokens: 0,
                  cacheCreationTokens: 0,
                  totalTokens: 0,
                };
              }
              usage.byModel[bucketModel].inputTokens += totalInputTokens;
              usage.byModel[bucketModel].outputTokens += outputTokens;
              usage.byModel[bucketModel].cachedInputTokens += cachedInputTokens;
              usage.byModel[bucketModel].cacheCreationTokens += cacheCreationTokens;
            }
          }
        }
      }
    }

    // Calculate total tokens
    usage.totalTokens = usage.inputTokens + usage.outputTokens;
    
    // Calculate totals per model
    for (const model in usage.byModel) {
      usage.byModel[model].totalTokens = 
        usage.byModel[model].inputTokens + 
        usage.byModel[model].outputTokens;
    }

    // Process cost data
    // Cost Report API returns: { data: [{ starting_at, ending_at, results: [{ currency: "USD", amount: "136.524275", cost_type: "...", model: "...", ... }] }] }
    // NOTE: The 'amount' field is in CENTS, not dollars! We need to divide by 100 to convert to USD.
    // Example: amount "136.524275" = 136.524275 cents = $1.36524275 ≈ $1.37 USD
    let costs: AnthropicCostData | null = null;
    if (costData && costData.data && Array.isArray(costData.data)) {
      costs = {
        totalCost: 0,
        tokenCosts: 0,
        webSearchCosts: 0,
        codeExecutionCosts: 0,
        byModel: {},
      };

      // Aggregate costs from all buckets
      for (const bucket of costData.data) {
        if (bucket.results && Array.isArray(bucket.results)) {
          for (const result of bucket.results) {
            // Each result has: { currency: "USD", amount: "136.524275", cost_type: "...", model: "...", ... }
            // IMPORTANT: The amount is in cents, not dollars! Divide by 100 to convert to USD
            const amountInCents = parseFloat(result.amount || '0');
            const amount = amountInCents / 100; // Convert cents to dollars
            const costType = result.cost_type || null;
            const model = result.model || null;
            
            // Aggregate total
            costs.totalCost += amount;
            
            // Categorize costs by type according to Anthropic's cost report structure:
            // - cost_type: null or undefined = token costs (default)
            // - cost_type: specific values indicate web search, code execution, etc.
            // According to Anthropic docs, cost_type can be null (token costs) or have specific values
            if (costType === null || costType === undefined || costType === '') {
              // cost_type is null = token costs (this is the default)
              costs.tokenCosts += amount;
            } else if (typeof costType === 'string') {
              const costTypeLower = costType.toLowerCase();
              if (costTypeLower.includes('web_search') || costTypeLower.includes('websearch') || costTypeLower === 'web_search') {
                costs.webSearchCosts += amount;
              } else if (costTypeLower.includes('code_execution') || costTypeLower.includes('codeexecution') || costTypeLower === 'code_execution') {
                costs.codeExecutionCosts += amount;
              } else {
                // Unknown cost_type, default to token costs
                costs.tokenCosts += amount;
              }
            } else {
              // Fallback: treat as token costs
              costs.tokenCosts += amount;
            }

            // Aggregate by model if available
            if (model) {
              if (!costs.byModel[model]) {
                costs.byModel[model] = {
                  totalCost: 0,
                  tokenCosts: 0,
                  webSearchCosts: 0,
                  codeExecutionCosts: 0,
                };
              }
              
              costs.byModel[model].totalCost += amount;
              
              // Categorize by type for this model (same logic as above)
              if (costType === null || costType === undefined || costType === '') {
                costs.byModel[model].tokenCosts += amount;
              } else if (typeof costType === 'string') {
                const costTypeLower = costType.toLowerCase();
                if (costTypeLower.includes('web_search') || costTypeLower.includes('websearch') || costTypeLower === 'web_search') {
                  costs.byModel[model].webSearchCosts += amount;
                } else if (costTypeLower.includes('code_execution') || costTypeLower.includes('codeexecution') || costTypeLower === 'code_execution') {
                  costs.byModel[model].codeExecutionCosts += amount;
                } else {
                  costs.byModel[model].tokenCosts += amount;
                }
              } else {
                costs.byModel[model].tokenCosts += amount;
              }
            }
          }
        }
      }
      
      // Round to 2 decimal places for USD
      costs.totalCost = Math.round(costs.totalCost * 100) / 100;
      costs.tokenCosts = Math.round(costs.tokenCosts * 100) / 100;
      costs.webSearchCosts = Math.round(costs.webSearchCosts * 100) / 100;
      costs.codeExecutionCosts = Math.round(costs.codeExecutionCosts * 100) / 100;
      
      // Round model costs
      for (const model in costs.byModel) {
        costs.byModel[model].totalCost = Math.round(costs.byModel[model].totalCost * 100) / 100;
        costs.byModel[model].tokenCosts = Math.round(costs.byModel[model].tokenCosts * 100) / 100;
        costs.byModel[model].webSearchCosts = Math.round(costs.byModel[model].webSearchCosts * 100) / 100;
        costs.byModel[model].codeExecutionCosts = Math.round(costs.byModel[model].codeExecutionCosts * 100) / 100;
      }
    }

    // Calculate cache hit rate
    const cacheHitRate = usage.inputTokens > 0 
      ? (usage.cachedInputTokens / (usage.inputTokens + usage.cachedInputTokens)) * 100 
      : 0;

    return NextResponse.json({
      success: true,
      period: {
        startingAt: startingAtISO,
        endingAt: endingAtISO,
        daysBack,
      },
      usage,
      costs,
      cacheHitRate: Math.round(cacheHitRate * 100) / 100,
    });
  } catch (error: any) {
    console.error("Error fetching Anthropic usage:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch usage data",
      },
      { status: 500 }
    );
  }
}
