/**
 * Test GA4 library functions directly (without needing server)
 */

require('dotenv').config({ path: '.env.local' });

const {
  fetchGA4Overview,
  fetchGA4Channels,
  fetchGA4Geography,
  fetchGA4TopPages
} = require('../lib/mcp/ga4');

const {
  fetchGA4Campaigns,
  fetchGA4SourceMedium,
  fetchGA4Events,
  fetchGA4Demographics,
  fetchGA4Technology,
  fetchGA4Acquisition,
  fetchGA4Content,
  fetchGA4TimePatterns,
  fetchGA4ConversionPaths,
  fetchGA4Retention,
  fetchGA4SearchTerms,
  fetchGA4Realtime
} = require('../lib/mcp/ga4-campaigns');

const { fetchGA4Ads } = require('../lib/mcp/ga4-ads');
const { fetchGA4FluidFusion } = require('../lib/mcp/ga4-fluid-fusion');

const TEST_DATE_RANGE = {
  startDate: '30daysAgo',
  endDate: 'yesterday'
};

const TESTS = [
  { name: 'Overview', fn: () => fetchGA4Overview(TEST_DATE_RANGE) },
  { name: 'Channels/Traffic', fn: () => fetchGA4Channels(TEST_DATE_RANGE) },
  { name: 'Geography', fn: () => fetchGA4Geography(TEST_DATE_RANGE) },
  { name: 'Top Pages', fn: () => fetchGA4TopPages(TEST_DATE_RANGE) },
  { name: 'Campaigns', fn: () => fetchGA4Campaigns(TEST_DATE_RANGE) },
  { name: 'Source Medium', fn: () => fetchGA4SourceMedium(TEST_DATE_RANGE) },
  { name: 'Events', fn: () => fetchGA4Events(TEST_DATE_RANGE) },
  { name: 'Demographics', fn: () => fetchGA4Demographics(TEST_DATE_RANGE) },
  { name: 'Technology', fn: () => fetchGA4Technology(TEST_DATE_RANGE) },
  { name: 'Acquisition', fn: () => fetchGA4Acquisition(TEST_DATE_RANGE) },
  { name: 'Content', fn: () => fetchGA4Content(TEST_DATE_RANGE) },
  { name: 'Time Patterns', fn: () => fetchGA4TimePatterns(TEST_DATE_RANGE) },
  { name: 'Conversion Paths', fn: () => fetchGA4ConversionPaths(TEST_DATE_RANGE) },
  { name: 'Retention', fn: () => fetchGA4Retention(TEST_DATE_RANGE) },
  { name: 'Search Terms', fn: () => fetchGA4SearchTerms(TEST_DATE_RANGE) },
  { name: 'Ads', fn: () => fetchGA4Ads(TEST_DATE_RANGE) },
  { name: 'Fluid Fusion', fn: () => fetchGA4FluidFusion(TEST_DATE_RANGE) },
  { name: 'Realtime', fn: () => fetchGA4Realtime() },
];

async function testFunction(test) {
  const { name, fn } = test;
  
  try {
    console.log(`\n🧪 Testing: ${name}`);
    
    const startTime = Date.now();
    const data = await fn();
    const duration = Date.now() - startTime;
    
    if (!data) {
      console.log(`   ⚠️  WARNING: No data returned`);
      return { name, status: 'WARNING', message: 'No data returned', duration };
    }
    
    const dataKeys = Object.keys(data);
    const hasData = dataKeys.length > 0;
    
    console.log(`   ✅ SUCCESS (${duration}ms)`);
    console.log(`   Data keys: ${dataKeys.join(', ')}`);
    
    // Check for common data structures
    if (data.summary) {
      const summaryKeys = Object.keys(data.summary);
      console.log(`   - Summary: ${summaryKeys.join(', ')}`);
    }
    if (data.trend) console.log(`   - Trend: ${data.trend.length} data points`);
    if (data.campaigns) console.log(`   - Campaigns: ${data.campaigns.length}`);
    if (data.events) console.log(`   - Events: ${data.events.length}`);
    if (data.countries) console.log(`   - Countries: ${data.countries.length}`);
    if (data.pages) console.log(`   - Pages: ${data.pages.length}`);
    if (data.sourceMedium) console.log(`   - Source/Medium: ${data.sourceMedium.length}`);
    if (data.byChannel) console.log(`   - Channels: ${data.byChannel.length}`);
    if (data.byDevice) console.log(`   - Devices: ${data.byDevice.length}`);
    if (data.browsers) console.log(`   - Browsers: ${data.browsers.length}`);
    if (data.operatingSystems) console.log(`   - Operating Systems: ${data.operatingSystems.length}`);
    if (data.error) {
      console.log(`   ⚠️  WARNING: Response contains error: ${data.error}`);
      return { name, status: 'WARNING', hasData, dataKeys, error: data.error, duration };
    }
    
    return { name, status: 'SUCCESS', hasData, dataKeys, duration };
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
    if (error.stack) {
      const stackLines = error.stack.split('\n').slice(0, 3);
      stackLines.forEach(line => console.log(`      ${line.trim()}`));
    }
    return { name, status: 'ERROR', error: error.message, stack: error.stack };
  }
}

async function runTests() {
  console.log('🚀 Starting GA4 Library Functions Test');
  console.log(`📅 Date Range: ${TEST_DATE_RANGE.startDate} to ${TEST_DATE_RANGE.endDate}`);
  console.log(`\n📊 Testing ${TESTS.length} functions...\n`);
  
  const results = [];
  
  for (const test of TESTS) {
    const result = await testFunction(test);
    results.push(result);
    // Small delay between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Summary
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  
  const successful = results.filter(r => r.status === 'SUCCESS');
  const failed = results.filter(r => r.status === 'ERROR');
  const warnings = results.filter(r => r.status === 'WARNING');
  
  console.log(`\n✅ Successful: ${successful.length}/${TESTS.length}`);
  successful.forEach(r => {
    console.log(`   ✓ ${r.name} (${r.duration}ms)`);
  });
  
  if (warnings.length > 0) {
    console.log(`\n⚠️  Warnings: ${warnings.length}/${TESTS.length}`);
    warnings.forEach(r => {
      console.log(`   ⚠ ${r.name}: ${r.error || r.message || 'Unknown warning'}`);
    });
  }
  
  if (failed.length > 0) {
    console.log(`\n❌ Failed: ${failed.length}/${TESTS.length}`);
    failed.forEach(r => {
      console.log(`   ✗ ${r.name}: ${r.error}`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
  
  // Exit with error code if any failed
  if (failed.length > 0) {
    process.exit(1);
  }
  
  process.exit(0);
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
