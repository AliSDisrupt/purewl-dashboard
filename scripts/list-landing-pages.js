#!/usr/bin/env node

/**
 * List all unique landing pages from GA4 lead sources (last 30 days)
 */

const listLandingPages = async () => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const startDate = "30daysAgo";
  const endDate = "yesterday";

  try {
    console.log(`Fetching landing pages from: ${baseUrl}/api/funnel/lead-sources`);
    console.log(`Date range: ${startDate} to ${endDate}\n`);
    
    const response = await fetch(`${baseUrl}/api/funnel/lead-sources?startDate=${startDate}&endDate=${endDate}`);
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.leadSources || data.leadSources.length === 0) {
      console.log('No landing pages data found.');
      return;
    }
    
    // Extract unique landing pages
    const uniquePages = [...new Set(data.leadSources.map(s => s.landingPage))];
    
    // Group by page and calculate stats
    const pageStats = {};
    data.leadSources.forEach(source => {
      if (!pageStats[source.landingPage]) {
        pageStats[source.landingPage] = {
          totalEvents: 0,
          sources: new Set()
        };
      }
      pageStats[source.landingPage].totalEvents += source.eventCount;
      pageStats[source.landingPage].sources.add(`${source.source}/${source.medium}`);
    });
    
    // Sort by total events
    const sortedPages = Object.entries(pageStats)
      .map(([page, stats]) => ({
        page,
        events: stats.totalEvents,
        sources: stats.sources.size
      }))
      .sort((a, b) => b.events - a.events);
    
    console.log(`📊 Found ${uniquePages.length} unique landing pages:\n`);
    console.log('='.repeat(80));
    
    sortedPages.forEach((item, index) => {
      console.log(`${(index + 1).toString().padStart(3)}. ${item.page}`);
      console.log(`     Events: ${item.events.toString().padStart(4)} | Unique Sources: ${item.sources}`);
    });
    
    console.log('='.repeat(80));
    console.log(`\n✅ Total unique pages: ${uniquePages.length}`);
    console.log(`✅ Total lead events: ${data.summary?.totalLeads || 0}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 Make sure the Next.js dev server is running:');
      console.error('   Run: npm run dev');
    }
    if (error.stack) {
      console.error(error.stack);
    }
  }
};

listLandingPages();
