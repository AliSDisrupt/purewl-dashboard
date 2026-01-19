import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

// Load environment variables manually
try {
  const envFile = readFileSync(join(__dirname, '..', '.env.local'), 'utf8');
  envFile.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
      if (!process.env[key.trim()]) {
        process.env[key.trim()] = value;
      }
    }
  });
} catch (e) {
  // .env.local might not exist, that's okay
}

// Import the GA4 function
const { fetchGA4LeadSources } = await import('../lib/mcp/ga4-campaigns.ts');

async function listLandingPages() {
  try {
    console.log('Fetching landing pages data from GA4...\n');
    
    const data = await fetchGA4LeadSources({ 
      startDate: '30daysAgo', 
      endDate: 'yesterday' 
    });
    
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
    console.error('Error:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
  }
}

listLandingPages();
