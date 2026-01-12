# GA4 Endpoints Comparison: Atlas vs Report Generator

## 📊 Summary

**Atlas (Agent):** ✅ Has access to **18 GA4 tools/endpoints**
**Report Generator (dataAggregator):** ❌ Only uses **1 GA4 endpoint** (`fetchGA4Overview`)

---

## 🔍 Atlas (Agent) - Available GA4 Tools

Atlas has access to **18 GA4 tools** via `lib/mcp/tools.ts`:

1. ✅ `get_ga4_overview` → `fetchGA4Overview()` in `lib/mcp/ga4.ts`
2. ✅ `get_ga4_campaigns` → `fetchGA4Campaigns()` in `lib/mcp/ga4-campaigns.ts`
3. ✅ `get_ga4_ads` → `fetchGA4Ads()` in `lib/mcp/ga4-ads.ts`
4. ✅ `get_ga4_geography` → `fetchGA4Geography()` in `lib/mcp/ga4.ts`
5. ✅ `get_ga4_traffic` → `fetchGA4Channels()` in `lib/mcp/ga4.ts`
6. ✅ `get_ga4_top_pages` → `fetchGA4TopPages()` in `lib/mcp/ga4.ts`
7. ✅ `get_ga4_acquisition` → `fetchGA4Acquisition()` in `lib/mcp/ga4-campaigns.ts`
8. ✅ `get_ga4_content` → `fetchGA4Content()` in `lib/mcp/ga4-campaigns.ts`
9. ✅ `get_ga4_conversion_paths` → `fetchGA4ConversionPaths()` in `lib/mcp/ga4-campaigns.ts`
10. ✅ `get_ga4_demographics` → `fetchGA4Demographics()` in `lib/mcp/ga4-campaigns.ts`
11. ✅ `get_ga4_events` → `fetchGA4Events()` in `lib/mcp/ga4-campaigns.ts`
12. ✅ `get_ga4_fluid_fusion` → `fetchGA4FluidFusion()` in `lib/mcp/ga4-fluid-fusion.ts`
13. ✅ `get_ga4_realtime` → `fetchGA4Realtime()` in `lib/mcp/ga4-campaigns.ts`
14. ✅ `get_ga4_retention` → `fetchGA4Retention()` in `lib/mcp/ga4-campaigns.ts`
15. ✅ `get_ga4_search_terms` → `fetchGA4SearchTerms()` in `lib/mcp/ga4-campaigns.ts`
16. ✅ `get_ga4_source_medium` → `fetchGA4SourceMedium()` in `lib/mcp/ga4-campaigns.ts`
17. ✅ `get_ga4_technology` → `fetchGA4Technology()` in `lib/mcp/ga4-campaigns.ts`
18. ✅ `get_ga4_time_patterns` → `fetchGA4TimePatterns()` in `lib/mcp/ga4-campaigns.ts`

---

## ❌ Report Generator (dataAggregator) - Current Status

**Location:** `lib/agents/dataAggregator.ts`

**Currently only uses:**
- ❌ `fetchGA4Overview()` from `lib/mcp/ga4.ts`

**Missing:**
- ❌ Campaign performance data
- ❌ Ads data (Reddit, FluentForm)
- ❌ Geographic breakdown
- ❌ Traffic/channel breakdown
- ❌ Top pages
- ❌ Acquisition data
- ❌ Content performance
- ❌ Conversion paths
- ❌ Demographics
- ❌ Events
- ❌ Fluid Fusion data
- ❌ Realtime data
- ❌ Retention data
- ❌ Search terms
- ❌ Source/medium breakdown
- ❌ Technology (browsers, OS)
- ❌ Time patterns (hour/day of week)

---

## 🔧 Fix Required

Update `lib/agents/dataAggregator.ts` to fetch ALL available GA4 endpoints when GA4 is selected as a connector, similar to how Atlas can access all of them.
