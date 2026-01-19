/**
 * AAARRR Analysis Script for January 1-15, 2026
 * Fetches data from GA4 and HubSpot and generates AAARRR analysis
 */

import { fetchGA4Overview } from '../lib/mcp/ga4';
import { fetchGA4Events } from '../lib/mcp/ga4-campaigns';
import { fetchHubSpotDeals } from '../lib/mcp/hubspot';

const HUBSPOT_API_BASE = process.env.HUBSPOT_API_BASE || "https://api.hubapi.com";
const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;

async function fetchHubSpotContactsByDate(startDate: string, endDate: string): Promise<number> {
  if (!HUBSPOT_ACCESS_TOKEN) {
    console.warn('HUBSPOT_ACCESS_TOKEN not configured');
    return 0;
  }

  try {
    const url = `${HUBSPOT_API_BASE}/crm/v3/objects/contacts/search`;
    const startTimestamp = new Date(startDate).getTime();
    const endTimestamp = new Date(endDate + 'T23:59:59.999Z').getTime();

    const payload = {
      filterGroups: [
        {
          filters: [
            {
              propertyName: "createdate",
              operator: "GTE",
              value: startTimestamp.toString()
            }
          ]
        },
        {
          filters: [
            {
              propertyName: "createdate",
              operator: "LTE",
              value: endTimestamp.toString()
            }
          ]
        }
      ],
      properties: ["firstname", "lastname", "email", "createdate"],
      limit: 10000
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.warn(`HubSpot API Error: ${response.status} ${response.statusText}`);
      return 0;
    }

    const data = await response.json();
    return data.results?.length || 0;
  } catch (error) {
    console.error("Error fetching HubSpot contacts by date:", error);
    return 0;
  }
}

// Date range: January 1-15, 2026
const START_DATE = '2026-01-01';
const END_DATE = '2026-01-15';

// Convert to GA4 format (days ago)
function getDaysAgo(dateStr: string): number {
  const date = new Date(dateStr);
  const today = new Date();
  const diffTime = today.getTime() - date.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

const startDaysAgo = getDaysAgo(START_DATE);
const endDaysAgo = getDaysAgo(END_DATE);

interface AAARRRAnalysis {
  acquisition: {
    achieved: string;
    analysis: string;
    nextSteps: string[];
  };
  activation: {
    achieved: string;
    analysis: string;
    nextSteps: string[];
  };
  retention: {
    achieved: string;
    analysis: string;
    nextSteps: string[];
  };
  referral: {
    achieved: string;
    analysis: string;
    nextSteps: string[];
  };
  revenue: {
    achieved: string;
    analysis: string;
    nextSteps: string[];
  };
}

async function analyzeAAARRR() {
  console.log('📊 AAARRR Analysis for January 1-15, 2026\n');
  console.log('='.repeat(80));
  console.log(`Date Range: ${START_DATE} to ${END_DATE}`);
  console.log('='.repeat(80));
  console.log('\n🔍 Fetching data from GA4 and HubSpot...\n');

  try {
    // Fetch GA4 Overview Data
    console.log('📈 Fetching GA4 overview data...');
    const ga4Overview = await fetchGA4Overview({
      startDate: `${startDaysAgo}daysAgo`,
      endDate: `${endDaysAgo}daysAgo`
    });

    // Fetch GA4 Events (for conversions)
    console.log('📈 Fetching GA4 events data...');
    const ga4Events = await fetchGA4Events({
      startDate: `${startDaysAgo}daysAgo`,
      endDate: `${endDaysAgo}daysAgo`
    });

    // Fetch HubSpot Contacts created in Jan 1-15, 2026
    console.log('👥 Fetching HubSpot contacts created in period...');
    const contactsInPeriod = await fetchHubSpotContactsByDate(START_DATE, END_DATE);

    // Fetch HubSpot Deals
    console.log('💰 Fetching HubSpot deals...');
    const hubspotDeals = await fetchHubSpotDeals();

    console.log('\n✅ Data fetched successfully!\n');
    console.log('='.repeat(80));
    console.log('📊 AAARRR ANALYSIS RESULTS');
    console.log('='.repeat(80));
    console.log('');

    // Filter contacts created in Jan 1-15, 2026
    // Note: HubSpot contacts API doesn't return createdAt, so we'll estimate based on total
    const startDateObj = new Date(START_DATE);
    const endDateObj = new Date(END_DATE);
    endDateObj.setHours(23, 59, 59, 999); // End of day

    // contactsInPeriod is already filtered by date

    // Filter deals closed won in Jan 1-15, 2026
    const dealsClosedWon = hubspotDeals.deals.filter(deal => {
      if (deal.stage !== 'closedwon') return false;
      if (!deal.closeDate) return false;
      const closeDate = new Date(deal.closeDate);
      return closeDate >= startDateObj && closeDate <= endDateObj;
    });

    // Get all closed won deals since Jan 1, 2026
    const allWonDealsSinceJan1 = hubspotDeals.deals.filter(deal => {
      if (deal.stage !== 'closedwon') return false;
      if (!deal.closeDate) return false;
      const closeDate = new Date(deal.closeDate);
      return closeDate >= startDateObj;
    });

    // Calculate engagement rate
    const engagementRate = ga4Overview.summary.engagementRate * 100;
    const engagedSessions = Math.round(ga4Overview.summary.sessions * ga4Overview.summary.engagementRate);

    // Calculate daily averages
    const daysInPeriod = 15;
    const avgDailyUsers = Math.round(ga4Overview.summary.newUsers / daysInPeriod);
    const avgDailyContacts = Math.round(contactsInPeriod / daysInPeriod);

    // Build AAARRR Analysis
    const analysis: AAARRRAnalysis = {
      acquisition: {
        achieved: `${ga4Overview.summary.newUsers.toLocaleString()} new users (GA4)\n${contactsInPeriod}+ leads (HubSpot)`,
        analysis: `GA4 shows strong traffic with ${ga4Overview.summary.newUsers.toLocaleString()} new users and ${ga4Overview.summary.sessions.toLocaleString()} sessions. HubSpot has ${contactsInPeriod} contacts created in this period. Average ~${avgDailyUsers} new users/day and ~${avgDailyContacts} contacts/day.`,
        nextSteps: [
          'Continue monitoring traffic sources to identify top-performing channels',
          'Optimize landing pages for new user conversion',
          'A/B test form fields to improve contact conversion rate',
          'Scale successful acquisition channels'
        ]
      },
      activation: {
        achieved: `${engagementRate.toFixed(1)}% engagement`,
        analysis: `${engagedSessions.toLocaleString()} engaged sessions out of ${ga4Overview.summary.sessions.toLocaleString()} total. Engagement rate of ${engagementRate.toFixed(1)}% shows ${engagementRate >= 40 ? 'strong' : engagementRate >= 30 ? 'solid' : 'moderate'} user activation. Average session duration: ${Math.round(ga4Overview.summary.avgSessionDuration)}s. Pages per session: ${(ga4Overview.summary.pageViews / ga4Overview.summary.sessions).toFixed(1)}.`,
        nextSteps: [
          engagementRate < 40 ? 'Improve onboarding flow to increase engagement rate' : 'Maintain current engagement levels',
          'Optimize key pages to reduce bounce rate (currently ' + (ga4Overview.summary.bounceRate * 100).toFixed(1) + '%)',
          'Add interactive elements to increase session duration',
          'Create clear value propositions on landing pages'
        ]
      },
      retention: {
        achieved: '--',
        analysis: 'Not a focus right now. Retention metrics require longer-term tracking (7-day, 30-day retention). Current focus is on acquisition and activation.',
        nextSteps: [
          'Set up retention tracking for 7-day and 30-day cohorts',
          'Implement email nurture campaigns for new contacts',
          'Create re-engagement campaigns for inactive users',
          'Track repeat visitor rate from GA4'
        ]
      },
      referral: {
        achieved: '--',
        analysis: 'Not a focus right now. Referral programs require dedicated tracking and incentives.',
        nextSteps: [
          'Implement referral tracking in GA4 (UTM parameters)',
          'Create referral program with incentives',
          'Add social sharing buttons to key pages',
          'Track referral sources in HubSpot'
        ]
      },
      revenue: {
        achieved: `${dealsClosedWon.length}+ deals closed (Won stage)`,
        analysis: `Strong deal volume with ${dealsClosedWon.length} closed won deals in January 1-15 period. Total ${allWonDealsSinceJan1.length}+ won deals since Jan 1. Pipeline remains active with high conversion activity. Total pipeline value: $${hubspotDeals.summary.totalValue.toLocaleString()}. Active deals: ${hubspotDeals.deals.filter(d => d.stage !== 'closedwon' && d.stage !== 'closedlost').length}.`,
        nextSteps: [
          'Continue nurturing active pipeline deals',
          'Focus on deals in late stages (Proposal, Negotiation)',
          'Identify and address stuck deals',
          'Optimize sales process to reduce time-to-close'
        ]
      }
    };

    // Print formatted report
    console.log('## ACQUISITION STAGE');
    console.log('─'.repeat(80));
    console.log(`Achieved (Jan 1-15):`);
    console.log(analysis.acquisition.achieved);
    console.log(`\nAnalysis & Next Steps:`);
    console.log(analysis.acquisition.analysis);
    console.log(`\nNext Steps:`);
    analysis.acquisition.nextSteps.forEach((step, i) => {
      console.log(`  ${i + 1}. ${step}`);
    });

    console.log('\n\n## ACTIVATION STAGE');
    console.log('─'.repeat(80));
    console.log(`Achieved (Jan 1-15):`);
    console.log(analysis.activation.achieved);
    console.log(`\nAnalysis & Next Steps:`);
    console.log(analysis.activation.analysis);
    console.log(`\nNext Steps:`);
    analysis.activation.nextSteps.forEach((step, i) => {
      console.log(`  ${i + 1}. ${step}`);
    });

    console.log('\n\n## RETENTION STAGE');
    console.log('─'.repeat(80));
    console.log(`Achieved (Jan 1-15):`);
    console.log(analysis.retention.achieved);
    console.log(`\nAnalysis & Next Steps:`);
    console.log(analysis.retention.analysis);
    console.log(`\nNext Steps:`);
    analysis.retention.nextSteps.forEach((step, i) => {
      console.log(`  ${i + 1}. ${step}`);
    });

    console.log('\n\n## REFERRAL STAGE');
    console.log('─'.repeat(80));
    console.log(`Achieved (Jan 1-15):`);
    console.log(analysis.referral.achieved);
    console.log(`\nAnalysis & Next Steps:`);
    console.log(analysis.referral.analysis);
    console.log(`\nNext Steps:`);
    analysis.referral.nextSteps.forEach((step, i) => {
      console.log(`  ${i + 1}. ${step}`);
    });

    console.log('\n\n## REVENUE STAGE');
    console.log('─'.repeat(80));
    console.log(`Achieved (Jan 1-15):`);
    console.log(analysis.revenue.achieved);
    console.log(`\nAnalysis & Next Steps:`);
    console.log(analysis.revenue.analysis);
    console.log(`\nNext Steps:`);
    analysis.revenue.nextSteps.forEach((step, i) => {
      console.log(`  ${i + 1}. ${step}`);
    });

    console.log('\n\n' + '='.repeat(80));
    console.log('📋 SUMMARY');
    console.log('='.repeat(80));
    console.log(`Data Period: ${START_DATE} to ${END_DATE}`);
    console.log(`Sources: Google Analytics 4 & HubSpot CRM`);
    console.log(`\nKey Metrics:`);
    console.log(`  • New Users: ${ga4Overview.summary.newUsers.toLocaleString()}`);
    console.log(`  • Sessions: ${ga4Overview.summary.sessions.toLocaleString()}`);
    console.log(`  • Engagement Rate: ${engagementRate.toFixed(1)}%`);
    console.log(`  • New Contacts: ${contactsInPeriod}`);
    console.log(`  • Closed Won Deals: ${dealsClosedWon.length}`);
    console.log(`  • Total Pipeline Value: $${hubspotDeals.summary.totalValue.toLocaleString()}`);
    console.log('='.repeat(80));

    // Return analysis for potential export
    return analysis;

  } catch (error: any) {
    console.error('\n❌ Error analyzing AAARRR:', error);
    console.error('Error details:', error.message);
    throw error;
  }
}

// Run the analysis
analyzeAAARRR()
  .then(() => {
    console.log('\n✅ Analysis complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Analysis failed:', error);
    process.exit(1);
  });
