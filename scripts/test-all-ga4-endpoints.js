/**
 * Test all GA4 endpoints to verify they're working and fetching data
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const TEST_DATE_RANGE = {
  startDate: '30daysAgo',
  endDate: 'yesterday'
};

const ENDPOINTS = [
  { name: 'Overview', path: '/api/ga4/overview', params: { startDate: '30daysAgo', endDate: 'yesterday' } },
  { name: 'Traffic', path: '/api/ga4/traffic', params: { startDate: '30daysAgo', endDate: 'yesterday' } },
  { name: 'Geography', path: '/api/ga4/geography', params: { startDate: '30daysAgo', endDate: 'yesterday' } },
  { name: 'Pages', path: '/api/ga4/pages', params: { startDate: '30daysAgo', endDate: 'yesterday' } },
  { name: 'Campaigns', path: '/api/ga4/campaigns', params: { startDate: '30daysAgo', endDate: 'yesterday' } },
  { name: 'Source Medium', path: '/api/ga4/source-medium', params: { startDate: '30daysAgo', endDate: 'yesterday' } },
  { name: 'Events', path: '/api/ga4/events', params: { startDate: '30daysAgo', endDate: 'yesterday' } },
  { name: 'Technology', path: '/api/ga4/technology', params: { startDate: '30daysAgo', endDate: 'yesterday' } },
  { name: 'Demographics', path: '/api/ga4/demographics', params: { startDate: '30daysAgo', endDate: 'yesterday' } },
  { name: 'Acquisition', path: '/api/ga4/acquisition', params: { startDate: '30daysAgo', endDate: 'yesterday' } },
  { name: 'Content', path: '/api/ga4/content', params: { startDate: '30daysAgo', endDate: 'yesterday' } },
  { name: 'Time Patterns', path: '/api/ga4/time-patterns', params: { startDate: '30daysAgo', endDate: 'yesterday' } },
  { name: 'Conversion Paths', path: '/api/ga4/conversion-paths', params: { startDate: '30daysAgo', endDate: 'yesterday' } },
  { name: 'Retention', path: '/api/ga4/retention', params: { startDate: '30daysAgo', endDate: 'yesterday' } },
  { name: 'Search Terms', path: '/api/ga4/search-terms', params: { startDate: '30daysAgo', endDate: 'yesterday' } },
  { name: 'Ads', path: '/api/ga4/ads', params: { startDate: '30daysAgo', endDate: 'yesterday' } },
  { name: 'Fluid Fusion', path: '/api/ga4/fluid-fusion', params: { startDate: '30daysAgo', endDate: 'yesterday' } },
  { name: 'Realtime', path: '/api/ga4/realtime', params: {} },
];

async function testEndpoint(endpoint) {
  const { name, path, params } = endpoint;
  
  try {
    const url = new URL(path, BASE_URL);
    Object.entries(params || {}).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
    
    console.log(`\n🧪 Testing: ${name}`);
    console.log(`   URL: ${url.toString()}`);
    
    const startTime = Date.now();
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const duration = Date.now() - startTime;
    const status = response.status;
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`   ❌ FAILED: ${status} ${response.statusText}`);
      console.log(`   Error: ${errorText.substring(0, 200)}`);
      return { name, status: 'FAILED', statusCode: status, error: errorText, duration };
    }
    
    const data = await response.json();
    
    // Check if data exists and has content
    const hasData = data && Object.keys(data).length > 0;
    const dataKeys = Object.keys(data || {});
    
    console.log(`   ✅ SUCCESS: ${status} (${duration}ms)`);
    console.log(`   Data keys: ${dataKeys.join(', ')}`);
    
    // Check for common data structures
    if (data.summary) console.log(`   - Has summary`);
    if (data.trend) console.log(`   - Has trend`);
    if (data.campaigns) console.log(`   - Has campaigns (${data.campaigns?.length || 0})`);
    if (data.events) console.log(`   - Has events (${data.events?.length || 0})`);
    if (data.countries) console.log(`   - Has countries (${data.countries?.length || 0})`);
    if (data.pages) console.log(`   - Has pages (${data.pages?.length || 0})`);
    if (data.sourceMedium) console.log(`   - Has sourceMedium (${data.sourceMedium?.length || 0})`);
    if (data.byChannel) console.log(`   - Has byChannel (${data.byChannel?.length || 0})`);
    if (data.byDevice) console.log(`   - Has byDevice (${data.byDevice?.length || 0})`);
    if (data.browsers) console.log(`   - Has browsers (${data.browsers?.length || 0})`);
    if (data.operatingSystems) console.log(`   - Has operatingSystems (${data.operatingSystems?.length || 0})`);
    if (data.error) {
      console.log(`   ⚠️  WARNING: Response contains error field: ${data.error}`);
      return { name, status: 'WARNING', statusCode: status, hasData, dataKeys, error: data.error, duration };
    }
    
    return { name, status: 'SUCCESS', statusCode: status, hasData, dataKeys, duration };
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
    return { name, status: 'ERROR', error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Starting GA4 Endpoints Test Suite');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`📅 Date Range: ${TEST_DATE_RANGE.startDate} to ${TEST_DATE_RANGE.endDate}`);
  console.log(`\n📊 Testing ${ENDPOINTS.length} endpoints...\n`);
  
  const results = [];
  
  for (const endpoint of ENDPOINTS) {
    const result = await testEndpoint(endpoint);
    results.push(result);
    // Small delay between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Summary
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  
  const successful = results.filter(r => r.status === 'SUCCESS');
  const failed = results.filter(r => r.status === 'FAILED' || r.status === 'ERROR');
  const warnings = results.filter(r => r.status === 'WARNING');
  
  console.log(`\n✅ Successful: ${successful.length}/${ENDPOINTS.length}`);
  successful.forEach(r => {
    console.log(`   ✓ ${r.name} (${r.duration}ms)`);
  });
  
  if (warnings.length > 0) {
    console.log(`\n⚠️  Warnings: ${warnings.length}/${ENDPOINTS.length}`);
    warnings.forEach(r => {
      console.log(`   ⚠ ${r.name}: ${r.error || 'Unknown warning'}`);
    });
  }
  
  if (failed.length > 0) {
    console.log(`\n❌ Failed: ${failed.length}/${ENDPOINTS.length}`);
    failed.forEach(r => {
      console.log(`   ✗ ${r.name}: ${r.error || `Status ${r.statusCode}`}`);
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
