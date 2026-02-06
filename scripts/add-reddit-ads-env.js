/**
 * One-time: add or update REDDIT_ADS_API_KEY in .env.local
 * Run: node scripts/add-reddit-ads-env.js
 * Requires: REDDIT_ADS_API_KEY in environment (e.g. set in shell before running)
 */

const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "..", ".env.local");
const key = process.env.REDDIT_ADS_API_KEY;

if (!key) {
  console.error("Set REDDIT_ADS_API_KEY in the environment, then run: node scripts/add-reddit-ads-env.js");
  process.exit(1);
}

let content = "";
if (fs.existsSync(envPath)) {
  content = fs.readFileSync(envPath, "utf8");
  content = content.replace(/^\s*REDDIT_ADS_API_KEY=.*$/m, "");
  content = content.replace(/\n{2,}/g, "\n").trim();
}
if (content && !content.endsWith("\n")) content += "\n";
content += `REDDIT_ADS_API_KEY=${key}\n`;
fs.writeFileSync(envPath, content, "utf8");
console.log("Updated .env.local with REDDIT_ADS_API_KEY.");
console.log("Restart the dev server (npm run dev) so the app picks up the key.");
process.exit(0);
