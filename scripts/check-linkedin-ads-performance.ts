/**
 * LinkedIn Ads Performance Checker
 * Fetches and displays current LinkedIn Ads performance metrics
 */

import { fetchLinkedInAccounts } from '../lib/mcp/linkedin';
import { fetchLinkedInCampaigns } from '../lib/mcp/linkedin';
import { fetchLinkedInAnalytics } from '../lib/mcp/linkedin';
import { fetchLinkedInCampaignsAnalytics } from '../lib/mcp/linkedin-campaign-analytics';

const DAYS_BACK = 30; // Last 30 days

async function checkLinkedInAdsPerformance() {
  console.log('📊 LinkedIn Ads Performance Report\n');
  console.log('='.repeat(80));
  console.log(`Date Range: Last ${DAYS_BACK} days`);
  console.log('='.repeat(80));
  console.log('\n🔍 Fetching LinkedIn Ads data...\n');

  try {
    // Step 1: Fetch all accounts
    console.log('1️⃣ Fetching ad accounts...');
    const accounts = await fetchLinkedInAccounts();
    console.log(`   ✅ Found ${accounts.length} ad account(s)\n`);

    if (accounts.length === 0) {
      console.log('❌ No LinkedIn ad accounts found. Please check your access token and account permissions.');
      return;
    }

    // Step 2: For each account, fetch campaigns and analytics
    for (const account of accounts) {
      console.log(`\n${'─'.repeat(80)}`);
      console.log(`📈 Account: ${account.name} (ID: ${account.simpleId})`);
      console.log(`${'─'.repeat(80)}\n`);

      // Fetch campaigns
      console.log('2️⃣ Fetching campaigns...');
      const campaigns = await fetchLinkedInCampaigns(account.id);
      console.log(`   ✅ Found ${campaigns.length} campaign(s)`);

      if (campaigns.length === 0) {
        console.log('   ⚠️  No campaigns found for this account\n');
        continue;
      }

      // Show campaign list
      console.log('\n   Campaigns:');
      campaigns.forEach((campaign, index) => {
        console.log(`   ${index + 1}. ${campaign.name} (${campaign.status})`);
      });

      // Fetch account-level analytics
      console.log('\n3️⃣ Fetching account-level analytics...');
      const accountAnalytics = await fetchLinkedInAnalytics(account.id, DAYS_BACK);
      
      if (accountAnalytics.hasData && accountAnalytics.metrics) {
        const metrics = accountAnalytics.metrics;
        console.log('   ✅ Account-level data found\n');
        
        console.log('   📊 PERFORMANCE METRICS:');
        console.log('   ' + '─'.repeat(70));
        console.log(`   Impressions:        ${metrics.impressions?.toLocaleString() || 0}`);
        console.log(`   Clicks:             ${metrics.clicks?.toLocaleString() || 0}`);
        console.log(`   Spend:              $${metrics.spend?.toFixed(2) || '0.00'}`);
        console.log(`   CTR:                ${((metrics.ctr || 0) * 100).toFixed(2)}%`);
        console.log(`   CPC:                $${metrics.cpc?.toFixed(2) || '0.00'}`);
        console.log(`   CPM:                $${metrics.cpm?.toFixed(2) || '0.00'}`);
        console.log(`   Conversions:        ${metrics.conversions?.toLocaleString() || 0}`);
        console.log(`   Cost/Conversion:    $${metrics.costPerConversion?.toFixed(2) || '0.00'}`);
        console.log('   ' + '─'.repeat(70));
        
        if (metrics.totalEngagements) {
          console.log('\n   💬 ENGAGEMENT METRICS:');
          console.log('   ' + '─'.repeat(70));
          console.log(`   Total Engagements:   ${metrics.totalEngagements.toLocaleString()}`);
          console.log(`   Likes:               ${metrics.likes?.toLocaleString() || 0}`);
          console.log(`   Comments:            ${metrics.comments?.toLocaleString() || 0}`);
          console.log(`   Shares:              ${metrics.shares?.toLocaleString() || 0}`);
          console.log(`   Reactions:           ${metrics.reactions?.toLocaleString() || 0}`);
          console.log(`   Follows:             ${metrics.follows?.toLocaleString() || 0}`);
          console.log('   ' + '─'.repeat(70));
        }

        if (metrics.oneClickLeads || metrics.qualifiedLeads) {
          console.log('\n   🎯 LEAD GENERATION:');
          console.log('   ' + '─'.repeat(70));
          console.log(`   One-Click Leads:     ${metrics.oneClickLeads?.toLocaleString() || 0}`);
          console.log(`   Qualified Leads:     ${metrics.qualifiedLeads?.toLocaleString() || 0}`);
          console.log(`   Valid Work Emails:   ${metrics.validWorkEmailLeads?.toLocaleString() || 0}`);
          console.log('   ' + '─'.repeat(70));
        }

        if (metrics.videoStarts || metrics.videoViews) {
          console.log('\n   🎥 VIDEO METRICS:');
          console.log('   ' + '─'.repeat(70));
          console.log(`   Video Starts:        ${metrics.videoStarts?.toLocaleString() || 0}`);
          console.log(`   Video Views:         ${metrics.videoViews?.toLocaleString() || 0}`);
          console.log(`   Video Completions:   ${metrics.videoCompletions?.toLocaleString() || 0}`);
          console.log('   ' + '─'.repeat(70));
        }
      } else {
        console.log('   ⚠️  No account-level data found, trying campaign-level aggregation...\n');
        
        // Try campaign-level aggregation
        if (campaigns.length > 0) {
          console.log('4️⃣ Fetching campaign-level analytics...');
          const campaignAnalytics = await fetchLinkedInCampaignsAnalytics(
            campaigns.map(c => ({ id: c.id, accountId: c.accountId, status: c.status })),
            DAYS_BACK,
            true // include all campaigns
          );

          // Aggregate metrics
          let totalImpressions = 0;
          let totalClicks = 0;
          let totalSpend = 0;
          let totalConversions = 0;
          let totalEngagements = 0;
          let totalLeads = 0;

          campaignAnalytics.forEach((metrics) => {
            totalImpressions += metrics.impressions || 0;
            totalClicks += metrics.clicks || 0;
            totalSpend += metrics.spend || 0;
            totalConversions += metrics.conversions || 0;
            totalEngagements += metrics.totalEngagements || 0;
            totalLeads += metrics.oneClickLeads || 0;
          });

          if (totalImpressions > 0 || totalClicks > 0 || totalSpend > 0) {
            const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
            const cpc = totalClicks > 0 ? totalSpend / totalClicks : 0;
            const cpm = totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0;
            const costPerConversion = totalConversions > 0 ? totalSpend / totalConversions : 0;

            console.log('   ✅ Campaign-level data aggregated\n');
            
            console.log('   📊 PERFORMANCE METRICS (Aggregated from Campaigns):');
            console.log('   ' + '─'.repeat(70));
            console.log(`   Impressions:        ${totalImpressions.toLocaleString()}`);
            console.log(`   Clicks:             ${totalClicks.toLocaleString()}`);
            console.log(`   Spend:              $${totalSpend.toFixed(2)}`);
            console.log(`   CTR:                ${ctr.toFixed(2)}%`);
            console.log(`   CPC:                $${cpc.toFixed(2)}`);
            console.log(`   CPM:                $${cpm.toFixed(2)}`);
            console.log(`   Conversions:        ${totalConversions.toLocaleString()}`);
            console.log(`   Cost/Conversion:    $${costPerConversion.toFixed(2)}`);
            console.log(`   Total Engagements:  ${totalEngagements.toLocaleString()}`);
            console.log(`   Leads Generated:    ${totalLeads.toLocaleString()}`);
            console.log('   ' + '─'.repeat(70));
          } else {
            console.log('   ⚠️  No campaign data found for the last 30 days');
          }
        }
      }

      // Show campaign breakdown
      if (campaigns.length > 0) {
        console.log('\n5️⃣ Fetching individual campaign performance...');
        const campaignAnalytics = await fetchLinkedInCampaignsAnalytics(
          campaigns.map(c => ({ id: c.id, accountId: c.accountId, status: c.status })),
          DAYS_BACK,
          true
        );

        const campaignsWithData = campaigns
          .map((campaign, index) => {
            const analytics = campaignAnalytics.get(campaign.id);
            return { campaign, analytics, index };
          })
          .filter(item => item.analytics && (item.analytics.impressions > 0 || item.analytics.clicks > 0 || item.analytics.spend > 0));

        if (campaignsWithData.length > 0) {
          console.log(`   ✅ Found ${campaignsWithData.length} campaign(s) with data\n`);
          
          console.log('   📋 CAMPAIGN BREAKDOWN:');
          console.log('   ' + '─'.repeat(70));
          
          campaignsWithData.forEach(({ campaign, analytics }) => {
            if (!analytics) return;
            
            const ctr = analytics.impressions > 0 ? (analytics.clicks / analytics.impressions) * 100 : 0;
            const cpc = analytics.clicks > 0 ? analytics.spend / analytics.clicks : 0;
            
            console.log(`\n   Campaign: ${campaign.name}`);
            console.log(`   Status: ${campaign.status}`);
            console.log(`   Impressions: ${analytics.impressions.toLocaleString()} | Clicks: ${analytics.clicks.toLocaleString()} | Spend: $${analytics.spend.toFixed(2)}`);
            console.log(`   CTR: ${ctr.toFixed(2)}% | CPC: $${cpc.toFixed(2)}`);
            if (analytics.conversions) {
              console.log(`   Conversions: ${analytics.conversions.toLocaleString()}`);
            }
          });
          console.log('   ' + '─'.repeat(70));
        } else {
          console.log('   ⚠️  No campaigns with data found for the last 30 days');
        }
      }
    }

    console.log('\n\n' + '='.repeat(80));
    console.log('✅ LinkedIn Ads Performance Report Complete');
    console.log('='.repeat(80));

  } catch (error: any) {
    console.error('\n❌ Error fetching LinkedIn Ads performance:', error);
    console.error('Error details:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    throw error;
  }
}

// Run the performance check
checkLinkedInAdsPerformance()
  .then(() => {
    console.log('\n✅ Performance check complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Performance check failed:', error);
    process.exit(1);
  });
