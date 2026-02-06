/**
 * Test Reddit Ads API key (Bearer JWT).
 * Run: REDDIT_ADS_API_KEY="your-jwt" node scripts/test-reddit-ads-key.js
 * Do not commit the key; use env only.
 */

const REDDIT_ADS_API_KEY = process.env.REDDIT_ADS_API_KEY;
const REDDIT_ADS_API_BASE_V3 = "https://ads-api.reddit.com/api/v3";
const REDDIT_ADS_API_BASE_V2 = "https://ads-api.reddit.com/api/v2";

async function test() {
  if (!REDDIT_ADS_API_KEY) {
    console.error("Missing REDDIT_ADS_API_KEY. Run: REDDIT_ADS_API_KEY=\"your-jwt\" node scripts/test-reddit-ads-key.js");
    process.exit(1);
  }

  const headers = {
    Authorization: `Bearer ${REDDIT_ADS_API_KEY}`,
    "Content-Type": "application/json",
  };

  console.log("Testing Reddit Ads API key...\n");

  const endpoints = [
    { name: "v3 advertisers", url: `${REDDIT_ADS_API_BASE_V3}/advertisers` },
    { name: "v3 accounts", url: `${REDDIT_ADS_API_BASE_V3}/accounts` },
    { name: "v3 me", url: `${REDDIT_ADS_API_BASE_V3}/me` },
    { name: "v2 advertisers", url: `${REDDIT_ADS_API_BASE_V2}/advertisers` },
    { name: "v2 accounts", url: `${REDDIT_ADS_API_BASE_V2}/accounts` },
    { name: "v2 me", url: `${REDDIT_ADS_API_BASE_V2}/me` },
  ];

  for (const { name, url } of endpoints) {
    try {
      const res = await fetch(url, { headers });
      const text = await res.text();
      let body;
      try {
        body = JSON.parse(text);
      } catch {
        body = text;
      }
      console.log(`${name} (${url}): ${res.status} ${res.statusText}`);
      if (res.ok) {
        console.log("  ✅ Success");
        if (body && (body.data || body.accounts || body.advertisers)) {
          const list = body.data || body.accounts || body.advertisers || [];
          console.log("  Data:", Array.isArray(list) ? `${list.length} item(s)` : JSON.stringify(list).slice(0, 200));
        }
      } else {
        console.log("  ❌ Response:", (body && (body.message || body.error)) ? (body.message || body.error) : text.slice(0, 200));
      }
    } catch (err) {
      console.log(`${name}: ❌ Error: ${err.message}`);
    }
    console.log("");
  }
}

test();
