/**
 * Fetch Reddit Ads data via the app API (dev server must be running with REDDIT_ADS_API_KEY in .env.local).
 * Run: node scripts/fetch-reddit-ads-now.mjs
 */
const res = await fetch("http://localhost:3000/api/reddit-ads?startDate=30daysAgo&endDate=yesterday");
const data = await res.json();
console.log("Status:", res.status);
console.log(JSON.stringify(data, null, 2));
