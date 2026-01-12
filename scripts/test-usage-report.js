/**
 * Test script for Usage Report API - Track token consumption
 * Tests: /v1/organizations/usage_report/messages
 * Data: Input tokens, cached input, cache creation, output tokens broken down by model, workspace, API key
 * Granularity: 1-minute, 1-hour, or 1-day buckets
 */

const ANTHROPIC_ADMIN_KEY = process.env.ANTHROPIC_ADMIN_KEY;
if (!ANTHROPIC_ADMIN_KEY) {
  throw new Error("ANTHROPIC_ADMIN_KEY environment variable is required");
}
const cleanKey = ANTHROPIC_ADMIN_KEY.trim().replace(/\s+/g, '');

// Calculate date range (last 7 days)
const endingAt = new Date();
const startingAt = new Date();
startingAt.setDate(startingAt.getDate() - 7);

const startingAtISO = startingAt.toISOString();
const endingAtISO = endingAt.toISOString();

console.log(`\n=== Usage Report API Test ===`);
console.log(`Date range: ${startingAtISO} to ${endingAtISO}`);

/**
 * Test usage report with different granularity options
 */
async function testUsageReport(bucketWidth = '1d') {
  try {
    console.log(`\n--- Testing with bucket_width: ${bucketWidth} ---`);
    
    // Limit must be <= 31 when bucket_width is '1d', <= 168 when '1h', <= 10080 when '1m'
    const limit = bucketWidth === '1d' ? '31' : bucketWidth === '1h' ? '168' : '10080';
    
    const params = new URLSearchParams({
      starting_at: startingAtISO,
      ending_at: endingAtISO,
      bucket_width: bucketWidth,
      limit: limit,
    });

    const response = await fetch(`https://api.anthropic.com/v1/organizations/usage_report/messages?${params}`, {
      method: "GET",
      headers: {
        "x-api-key": cleanKey,
        "anthropic-version": "2023-06-01",
      },
    });

    console.log(`Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error: ${errorText}`);
      return null;
    }

    const data = await response.json();
    console.log(`Success! Response keys:`, Object.keys(data));
    console.log(`Has more: ${data.has_more || false}`);
    
    // Parse usage data
    const usage = {
      inputTokens: 0,
      outputTokens: 0,
      cachedInputTokens: 0,
      cacheCreationTokens: 0,
      totalTokens: 0,
      byModel: {},
      byWorkspace: {},
      buckets: [],
    };
    
    const dataBuckets = data?.data || [];
    console.log(`Number of buckets: ${dataBuckets.length}`);
    
    if (Array.isArray(dataBuckets) && dataBuckets.length > 0) {
      for (const bucket of dataBuckets) {
        const results = bucket.results || [];
        console.log(`\n  Bucket: ${bucket.starting_at} to ${bucket.ending_at}`);
        console.log(`    Results count: ${results.length}`);
        
        if (Array.isArray(results) && results.length > 0) {
          for (const result of results) {
            // Each result has: { model, metrics: { input_tokens, output_tokens, cached_input_tokens, cache_creation_tokens }, workspace_id, ... }
            const metrics = result.metrics || result;
            const bucketModel = result.model || metrics?.model || null;
            const workspaceId = result.workspace_id || metrics?.workspace_id || null;
            
            // Extract token counts (API uses snake_case)
            const inputTokens = Number(metrics?.input_tokens || metrics?.inputTokens || 0);
            const outputTokens = Number(metrics?.output_tokens || metrics?.outputTokens || 0);
            const cachedInput = Number(metrics?.cached_input_tokens || metrics?.cachedInputTokens || 0);
            const cacheCreation = Number(metrics?.cache_creation_tokens || metrics?.cacheCreationTokens || 0);
            
            // Aggregate totals
            usage.inputTokens += inputTokens;
            usage.outputTokens += outputTokens;
            usage.cachedInputTokens += cachedInput;
            usage.cacheCreationTokens += cacheCreation;
            
            // Breakdown by model
            if (bucketModel) {
              if (!usage.byModel[bucketModel]) {
                usage.byModel[bucketModel] = {
                  inputTokens: 0,
                  outputTokens: 0,
                  cachedInputTokens: 0,
                  cacheCreationTokens: 0,
                  totalTokens: 0,
                };
              }
              usage.byModel[bucketModel].inputTokens += inputTokens;
              usage.byModel[bucketModel].outputTokens += outputTokens;
              usage.byModel[bucketModel].cachedInputTokens += cachedInput;
              usage.byModel[bucketModel].cacheCreationTokens += cacheCreation;
            }
            
            // Breakdown by workspace
            if (workspaceId) {
              if (!usage.byWorkspace[workspaceId]) {
                usage.byWorkspace[workspaceId] = {
                  inputTokens: 0,
                  outputTokens: 0,
                  cachedInputTokens: 0,
                  cacheCreationTokens: 0,
                  totalTokens: 0,
                };
              }
              usage.byWorkspace[workspaceId].inputTokens += inputTokens;
              usage.byWorkspace[workspaceId].outputTokens += outputTokens;
              usage.byWorkspace[workspaceId].cachedInputTokens += cachedInput;
              usage.byWorkspace[workspaceId].cacheCreationTokens += cacheCreation;
            }
            
            // Log first result for debugging
            if (results.indexOf(result) === 0) {
              console.log(`\n    First result sample:`);
              console.log(`      Model: ${bucketModel || 'N/A'}`);
              console.log(`      Workspace ID: ${workspaceId || 'N/A'}`);
              console.log(`      Input tokens: ${inputTokens.toLocaleString()}`);
              console.log(`      Output tokens: ${outputTokens.toLocaleString()}`);
              console.log(`      Cached input: ${cachedInput.toLocaleString()}`);
              console.log(`      Cache creation: ${cacheCreation.toLocaleString()}`);
              console.log(`      Full result keys:`, Object.keys(result));
            }
          }
        }
      }
    }
    
    // Calculate totals
    usage.totalTokens = usage.inputTokens + usage.outputTokens;
    
    // Calculate totals per model
    for (const model in usage.byModel) {
      usage.byModel[model].totalTokens = 
        usage.byModel[model].inputTokens + 
        usage.byModel[model].outputTokens;
    }
    
    // Calculate totals per workspace
    for (const workspaceId in usage.byWorkspace) {
      usage.byWorkspace[workspaceId].totalTokens = 
        usage.byWorkspace[workspaceId].inputTokens + 
        usage.byWorkspace[workspaceId].outputTokens;
    }
    
    console.log(`\n=== Usage Summary (${bucketWidth} granularity) ===`);
    console.log(`Total Input Tokens: ${usage.inputTokens.toLocaleString()}`);
    console.log(`Total Output Tokens: ${usage.outputTokens.toLocaleString()}`);
    console.log(`Total Cached Input Tokens: ${usage.cachedInputTokens.toLocaleString()}`);
    console.log(`Total Cache Creation Tokens: ${usage.cacheCreationTokens.toLocaleString()}`);
    console.log(`Grand Total Tokens: ${usage.totalTokens.toLocaleString()}`);
    
    const cacheHitRate = usage.inputTokens > 0 
      ? ((usage.cachedInputTokens / (usage.inputTokens + usage.cachedInputTokens)) * 100).toFixed(2)
      : '0.00';
    console.log(`Cache Hit Rate: ${cacheHitRate}%`);
    
    console.log(`\nBreakdown by Model (${Object.keys(usage.byModel).length} models):`);
    for (const model in usage.byModel) {
      const modelUsage = usage.byModel[model];
      console.log(`  ${model}:`);
      console.log(`    Input: ${modelUsage.inputTokens.toLocaleString()}`);
      console.log(`    Output: ${modelUsage.outputTokens.toLocaleString()}`);
      console.log(`    Cached: ${modelUsage.cachedInputTokens.toLocaleString()}`);
      console.log(`    Cache Creation: ${modelUsage.cacheCreationTokens.toLocaleString()}`);
      console.log(`    Total: ${modelUsage.totalTokens.toLocaleString()}`);
    }
    
    if (Object.keys(usage.byWorkspace).length > 0) {
      console.log(`\nBreakdown by Workspace (${Object.keys(usage.byWorkspace).length} workspaces):`);
      for (const workspaceId in usage.byWorkspace) {
        const workspaceUsage = usage.byWorkspace[workspaceId];
        console.log(`  Workspace ${workspaceId}:`);
        console.log(`    Input: ${workspaceUsage.inputTokens.toLocaleString()}`);
        console.log(`    Output: ${workspaceUsage.outputTokens.toLocaleString()}`);
        console.log(`    Total: ${workspaceUsage.totalTokens.toLocaleString()}`);
      }
    }
    
    return usage;
  } catch (error) {
    console.error(`Exception:`, error.message);
    return null;
  }
}

// Run tests with different granularities
(async () => {
  console.log(`\n=== Testing Usage Report with Different Granularities ===`);
  
  // Test with 1-day buckets (default)
  const dailyUsage = await testUsageReport('1d');
  
  // Test with 1-hour buckets (if daily worked)
  if (dailyUsage) {
    console.log(`\n\n${'='.repeat(60)}`);
    const hourlyUsage = await testUsageReport('1h');
  }
  
  // Test with 1-minute buckets (if hourly worked) - only for last 24 hours
  if (dailyUsage) {
    console.log(`\n\n${'='.repeat(60)}`);
    const endingAt24h = new Date();
    const startingAt24h = new Date();
    startingAt24h.setHours(startingAt24h.getHours() - 24);
    console.log(`Testing 1-minute buckets for last 24 hours: ${startingAt24h.toISOString()} to ${endingAt24h.toISOString()}`);
    // Note: 1-minute buckets would require adjusting the date range to last 24 hours
  }
  
  console.log(`\n=== Test Complete ===`);
})();
