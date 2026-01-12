/**
 * Test script to verify Anthropic Admin API key is working
 */

const ANTHROPIC_ADMIN_KEY = process.env.ANTHROPIC_ADMIN_KEY;
if (!ANTHROPIC_ADMIN_KEY) {
  throw new Error("ANTHROPIC_ADMIN_KEY environment variable is required");
}

// Clean the key (remove line breaks and whitespace)
const cleanKey = ANTHROPIC_ADMIN_KEY.trim().replace(/\s+/g, '');

console.log(`Testing Anthropic Admin API key...`);
console.log(`Key prefix: ${cleanKey.substring(0, 20)}...`);
console.log(`Key length: ${cleanKey.length}`);

// Calculate date range (last 7 days)
const endingAt = new Date();
const startingAt = new Date();
startingAt.setDate(startingAt.getDate() - 7);

const startingAtISO = startingAt.toISOString();
const endingAtISO = endingAt.toISOString();

console.log(`\nDate range: ${startingAtISO} to ${endingAtISO}`);

// Test usage report endpoint
async function testUsageReport() {
  try {
    console.log(`\nTesting Usage Report API...`);
    const params = new URLSearchParams({
      starting_at: startingAtISO,
      ending_at: endingAtISO,
      bucket_width: '1d',
      limit: '31', // Must be <= 31 when bucket_width is '1d'
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
    
    if (data.data) {
      console.log(`Data buckets: ${data.data.length}`);
      if (data.data.length > 0) {
        console.log(`First bucket sample:`, JSON.stringify(data.data[0], null, 2).substring(0, 500));
      }
    }
    
    return data;
  } catch (error) {
    console.error(`Exception:`, error.message);
    return null;
  }
}

// Test cost report endpoint
async function testCostReport() {
  try {
    console.log(`\nTesting Cost Report API...`);
    const params = new URLSearchParams({
      starting_at: startingAtISO,
      ending_at: endingAtISO,
    });

    const response = await fetch(`https://api.anthropic.com/v1/organizations/cost_report?${params}`, {
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
    // Log full structure for debugging
    console.log(`Cost data structure (first 2000 chars):`, JSON.stringify(data, null, 2).substring(0, 2000));
    
    // Test parsing cost data
    if (data.data && Array.isArray(data.data)) {
      console.log(`\n=== Cost Data Breakdown ===`);
      console.log(`Number of cost buckets: ${data.data.length}`);
      
      let totalCost = 0;
      let totalTokenCosts = 0;
      let totalWebSearchCosts = 0;
      let totalCodeExecutionCosts = 0;
      
      for (const bucket of data.data) {
        if (bucket.results && Array.isArray(bucket.results)) {
          for (const result of bucket.results) {
            // Cost Report API returns: { currency: "USD", amount: "136.524275", cost_type: "...", model: "...", ... }
            const amount = parseFloat(result.amount || 0);
            const costType = result.cost_type || 'unknown';
            const model = result.model || 'unknown';
            const currency = result.currency || 'USD';
            
            totalCost += amount;
            
            // Categorize costs by type (cost_type field indicates the type)
            if (costType.includes('token') || !costType || costType === null) {
              totalTokenCosts += amount;
            } else if (costType.includes('web_search') || costType.includes('search')) {
              totalWebSearchCosts += amount;
            } else if (costType.includes('code_execution') || costType.includes('execution')) {
              totalCodeExecutionCosts += amount;
            } else {
              // If cost_type is null/unknown, treat as token costs (default)
              totalTokenCosts += amount;
            }
            
            console.log(`\nCost Entry:`);
            console.log(`  Amount: $${amount.toFixed(4)} ${currency}`);
            console.log(`  Cost Type: ${costType || 'token (default)'}`);
            if (model && model !== 'unknown') {
              console.log(`  Model: ${model}`);
            }
          }
        }
      }
      
      console.log(`\n=== Aggregated Costs (USD) ===`);
      console.log(`Total Token Costs: $${totalTokenCosts.toFixed(2)}`);
      console.log(`Total Web Search Costs: $${totalWebSearchCosts.toFixed(2)}`);
      console.log(`Total Code Execution Costs: $${totalCodeExecutionCosts.toFixed(2)}`);
      console.log(`Grand Total: $${totalCost.toFixed(2)}`);
    }
    
    return data;
  } catch (error) {
    console.error(`Exception:`, error.message);
    return null;
  }
}

// Run tests
(async () => {
  const usageData = await testUsageReport();
  const costData = await testCostReport();
  
  console.log(`\n=== Summary ===`);
  console.log(`Usage Report: ${usageData ? 'SUCCESS' : 'FAILED'}`);
  console.log(`Cost Report: ${costData ? 'SUCCESS' : 'FAILED'}`);
})();
