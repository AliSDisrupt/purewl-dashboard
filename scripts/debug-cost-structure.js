/**
 * Debug script to check the actual cost report structure
 */

const ANTHROPIC_ADMIN_KEY = process.env.ANTHROPIC_ADMIN_KEY;
if (!ANTHROPIC_ADMIN_KEY) {
  throw new Error("ANTHROPIC_ADMIN_KEY environment variable is required");
}
const cleanKey = ANTHROPIC_ADMIN_KEY.trim().replace(/\s+/g, '');

const endingAt = new Date();
const startingAt = new Date();
startingAt.setDate(startingAt.getDate() - 7);

const startingAtISO = startingAt.toISOString();
const endingAtISO = endingAt.toISOString();

async function debugCostReport() {
  try {
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error: ${errorText}`);
      return;
    }

    const data = await response.json();
    
    console.log(`\n=== Full Cost Report Structure ===`);
    console.log(`Date range: ${startingAtISO} to ${endingAtISO}`);
    console.log(`Number of buckets: ${data.data?.length || 0}`);
    console.log(`Has more: ${data.has_more}`);
    
    let totalAmount = 0;
    let entryCount = 0;
    
    if (data.data && Array.isArray(data.data)) {
      for (let i = 0; i < data.data.length; i++) {
        const bucket = data.data[i];
        console.log(`\n--- Bucket ${i + 1} ---`);
        console.log(`  Period: ${bucket.starting_at} to ${bucket.ending_at}`);
        console.log(`  Results count: ${bucket.results?.length || 0}`);
        
        if (bucket.results && Array.isArray(bucket.results)) {
          for (let j = 0; j < bucket.results.length; j++) {
            const result = bucket.results[j];
            entryCount++;
            const amount = parseFloat(result.amount || '0');
            totalAmount += amount;
            
            console.log(`\n  Result ${j + 1}:`);
            console.log(`    Amount (string): "${result.amount}"`);
            console.log(`    Amount (parsed): ${amount}`);
            console.log(`    Currency: ${result.currency}`);
            console.log(`    Cost Type: ${result.cost_type}`);
            console.log(`    Model: ${result.model}`);
            console.log(`    Workspace ID: ${result.workspace_id}`);
            console.log(`    Description: ${result.description}`);
          }
        }
      }
    }
    
    console.log(`\n=== Summary ===`);
    console.log(`Total entries: ${entryCount}`);
    console.log(`Sum of all amounts: $${totalAmount.toFixed(2)}`);
    console.log(`Average per entry: $${entryCount > 0 ? (totalAmount / entryCount).toFixed(2) : 0}`);
    
  } catch (error) {
    console.error(`Exception:`, error.message);
  }
}

debugCostReport();
