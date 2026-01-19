/**
 * Script to fetch and display current LinkedIn data from HubSpot
 */

const fs = require('fs');
const path = require('path');

// Load .env.local manually
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
        if (!process.env[key.trim()]) {
          process.env[key.trim()] = value;
        }
      }
    });
  }
}

loadEnv();

const API_BASE = process.env.HUBSPOT_API_BASE || "https://api.hubapi.com";
const ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;

if (!ACCESS_TOKEN) {
  console.error("❌ HUBSPOT_ACCESS_TOKEN not found in .env.local");
  process.exit(1);
}

async function fetchLinkedInContacts() {
  try {
    const url = `${API_BASE}/crm/v3/objects/contacts/search`;
    
    const payload = {
      filterGroups: [
        {
          filters: [
            {
              propertyName: "hs_analytics_source",
              operator: "EQ",
              value: "linkedin"
            }
          ]
        }
      ],
      sorts: ["-createdate"],
      properties: [
        "firstname",
        "lastname",
        "email",
        "company",
        "jobtitle",
        "phone",
        "createdate",
        "hs_analytics_source",
        "hs_analytics_medium",
        "hs_analytics_campaign_name",
        "hs_analytics_first_touch_converting_campaign",
      ],
      limit: 50, // Get first 50 for display
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HubSpot API Error: ${response.status} ${response.statusText}\n${errorText}`);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("Error fetching LinkedIn contacts:", error.message);
    return [];
  }
}

async function fetchLinkedInDeals() {
  try {
    const url = `${API_BASE}/crm/v3/objects/deals`;
    const params = new URLSearchParams({
      limit: "100",
      properties: "dealname,amount,dealstage,closedate,createdAt,hs_lastmodifieddate,source,sourceData1,sourceData2",
      sort: "-createdAt",
    });

    const response = await fetch(`${url}?${params}`, {
      headers: {
        "Authorization": `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      },
    });

    if (!response.ok) {
      throw new Error(`HubSpot API Error: ${response.status}`);
    }

    const data = await response.json();
    // Filter for LinkedIn-sourced deals
    const linkedInDeals = (data.results || []).filter((deal) => {
      const source = (deal.properties?.source || "").toLowerCase();
      return source.includes("linkedin");
    });
    
    return linkedInDeals;
  } catch (error) {
    console.error("Error fetching LinkedIn deals:", error.message);
    return [];
  }
}

async function main() {
  console.log("🔍 Fetching LinkedIn data from HubSpot...\n");
  console.log("=" .repeat(80));

  // Fetch Contacts
  console.log("\n📧 LINKEDIN-SOURCED CONTACTS");
  console.log("-".repeat(80));
  const contacts = await fetchLinkedInContacts();
  
  if (contacts.length === 0) {
    console.log("❌ No contacts found with hs_analytics_source = 'linkedin'");
    console.log("\n💡 This could mean:");
    console.log("   - No contacts have been tracked with LinkedIn as source");
    console.log("   - The property name might be different in your HubSpot account");
    console.log("   - Contacts might be tracked differently (e.g., via UTM parameters)");
  } else {
    console.log(`✅ Found ${contacts.length} LinkedIn-sourced contact(s)\n`);
    
    contacts.forEach((contact, index) => {
      const props = contact.properties || {};
      console.log(`\nContact #${index + 1}:`);
      console.log(`  ID: ${contact.id}`);
      console.log(`  Name: ${props.firstname || ''} ${props.lastname || ''}`.trim() || 'Unnamed');
      console.log(`  Email: ${props.email || 'No Email'}`);
      console.log(`  Company: ${props.company || '—'}`);
      console.log(`  Job Title: ${props.jobtitle || '—'}`);
      console.log(`  Phone: ${props.phone || '—'}`);
      console.log(`  Created: ${props.createdate ? new Date(parseInt(props.createdate)).toLocaleString() : '—'}`);
      console.log(`  Source: ${props.hs_analytics_source || '—'}`);
      console.log(`  Medium: ${props.hs_analytics_medium || '—'}`);
      console.log(`  Campaign: ${props.hs_analytics_campaign_name || props.hs_analytics_first_touch_converting_campaign || '—'}`);
      console.log(`  First Touch Campaign: ${props.hs_analytics_first_touch_converting_campaign || '—'}`);
    });
  }

  // Fetch Deals
  console.log("\n\n💼 LINKEDIN-SOURCED DEALS");
  console.log("-".repeat(80));
  const deals = await fetchLinkedInDeals();
  
  if (deals.length === 0) {
    console.log("❌ No deals found with source containing 'linkedin'");
  } else {
    console.log(`✅ Found ${deals.length} LinkedIn-sourced deal(s)\n`);
    
    deals.forEach((deal, index) => {
      const props = deal.properties || {};
      console.log(`\nDeal #${index + 1}:`);
      console.log(`  ID: ${deal.id}`);
      console.log(`  Name: ${props.dealname || 'Unnamed Deal'}`);
      console.log(`  Amount: $${props.amount || '0'}`);
      console.log(`  Stage: ${props.dealstage || '—'}`);
      console.log(`  Close Date: ${props.closedate ? new Date(parseInt(props.closedate)).toLocaleDateString() : '—'}`);
      console.log(`  Created: ${props.createdAt ? new Date(props.createdAt).toLocaleString() : '—'}`);
      console.log(`  Source: ${props.source || '—'}`);
      console.log(`  Source Data 1: ${props.sourceData1 || '—'}`);
      console.log(`  Source Data 2: ${props.sourceData2 || '—'}`);
    });
  }

  // Summary
  console.log("\n\n📊 SUMMARY");
  console.log("=".repeat(80));
  console.log(`Total LinkedIn Contacts: ${contacts.length}`);
  console.log(`Total LinkedIn Deals: ${deals.length}`);
  
  // Show sample raw data
  if (contacts.length > 0) {
    console.log("\n\n📋 SAMPLE RAW CONTACT DATA (First Contact):");
    console.log("-".repeat(80));
    console.log(JSON.stringify(contacts[0], null, 2));
  }

  if (deals.length > 0) {
    console.log("\n\n📋 SAMPLE RAW DEAL DATA (First Deal):");
    console.log("-".repeat(80));
    console.log(JSON.stringify(deals[0], null, 2));
  }

  console.log("\n✅ Done!\n");
}

main().catch(console.error);
