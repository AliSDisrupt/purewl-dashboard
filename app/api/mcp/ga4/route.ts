import { NextResponse } from "next/server";
import {
  fetchGA4Overview,
  fetchGA4Channels,
  fetchGA4Geography,
  fetchGA4TopPages
} from "@/lib/mcp/ga4";
import {
  fetchGA4Campaigns,
  fetchGA4SourceMedium,
  fetchGA4GeographySourceMedium,
  fetchGA4Events,
  fetchGA4Demographics,
  fetchGA4Technology,
  fetchGA4Acquisition,
  fetchGA4Content,
  fetchGA4TimePatterns,
  fetchGA4ConversionPaths,
  fetchGA4Retention,
  fetchGA4SearchTerms,
  fetchGA4Realtime
} from "@/lib/mcp/ga4-campaigns";
import { fetchGA4Ads } from "@/lib/mcp/ga4-ads";
import { fetchGA4FluidFusion } from "@/lib/mcp/ga4-fluid-fusion";
import { trackRequest } from "@/lib/usage-tracker";

export async function POST(request: Request) {
  try {
    trackRequest('ga4');
    const { tool, parameters } = await request.json();

    switch (tool) {
      case "get_ga4_overview": {
        try {
          const { startDate = "7daysAgo", endDate = "yesterday" } = parameters;
          const overview = await fetchGA4Overview({ startDate, endDate });
          return NextResponse.json({ result: overview });
        } catch (error: any) {
          console.error("Error in get_ga4_overview:", error);
          const errorMessage = error.message || "Failed to fetch GA4 overview data";
          // Check if it's a date format error
          const isDateError = errorMessage.toLowerCase().includes("date") || errorMessage.toLowerCase().includes("format");
          return NextResponse.json({ 
            error: errorMessage,
            details: error.stack || String(error),
            suggestion: isDateError 
              ? "Try using date formats like '2024-01-10', '7daysAgo', '30daysAgo', or 'yesterday'. Natural language dates are supported but may need conversion."
              : "Check if GA4 credentials are configured and the property ID is correct"
          }, { status: 500 });
        }
      }

      case "get_ga4_campaigns": {
        const { startDate = "30daysAgo", endDate = "yesterday" } = parameters;
        const campaigns = await fetchGA4Campaigns({ startDate, endDate });
        return NextResponse.json({ result: campaigns });
      }

      case "get_ga4_ads": {
        const { startDate = "30daysAgo", endDate = "yesterday" } = parameters;
        const ads = await fetchGA4Ads({ startDate, endDate });
        return NextResponse.json({ result: ads });
      }

      case "get_ga4_geography": {
        const { startDate = "30daysAgo", endDate = "yesterday" } = parameters;
        const geography = await fetchGA4Geography({ startDate, endDate });
        return NextResponse.json({ result: geography });
      }

      case "get_ga4_traffic": {
        const { startDate = "30daysAgo", endDate = "yesterday" } = parameters;
        const traffic = await fetchGA4Channels({ startDate, endDate });
        return NextResponse.json({ result: traffic });
      }

      case "get_ga4_top_pages": {
        try {
          const { startDate = "30daysAgo", endDate = "yesterday" } = parameters;
          const pages = await fetchGA4TopPages({ startDate, endDate });
          return NextResponse.json({ result: pages });
        } catch (error: any) {
          console.error("Error in get_ga4_top_pages:", error);
          const errorMessage = error.message || "Failed to fetch GA4 top pages data";
          const isDateError = errorMessage.toLowerCase().includes("date") || errorMessage.toLowerCase().includes("format");
          return NextResponse.json({ 
            error: errorMessage,
            details: error.stack || String(error),
            suggestion: isDateError 
              ? "Try using date formats like '2024-01-10', '7daysAgo', '30daysAgo', or 'yesterday'"
              : "Check if GA4 credentials are configured and the property ID is correct"
          }, { status: 500 });
        }
      }

      case "get_ga4_acquisition": {
        const { startDate = "30daysAgo", endDate = "yesterday" } = parameters;
        const acquisition = await fetchGA4Acquisition({ startDate, endDate });
        return NextResponse.json({ result: acquisition });
      }

      case "get_ga4_content": {
        try {
          const { startDate = "30daysAgo", endDate = "yesterday" } = parameters;
          const content = await fetchGA4Content({ startDate, endDate });
          return NextResponse.json({ result: content });
        } catch (error: any) {
          console.error("Error in get_ga4_content:", error);
          const errorMessage = error.message || "Failed to fetch GA4 content data";
          const isDateError = errorMessage.toLowerCase().includes("date") || errorMessage.toLowerCase().includes("format");
          return NextResponse.json({ 
            error: errorMessage,
            details: error.stack || String(error),
            suggestion: isDateError 
              ? "Try using date formats like '2024-01-10', '7daysAgo', '30daysAgo', or 'yesterday'"
              : "Check if GA4 credentials are configured and the property ID is correct"
          }, { status: 500 });
        }
      }

      case "get_ga4_conversion_paths": {
        const { startDate = "30daysAgo", endDate = "yesterday" } = parameters;
        const paths = await fetchGA4ConversionPaths({ startDate, endDate });
        return NextResponse.json({ result: paths });
      }

      case "get_ga4_demographics": {
        const { startDate = "30daysAgo", endDate = "yesterday" } = parameters;
        const demographics = await fetchGA4Demographics({ startDate, endDate });
        return NextResponse.json({ result: demographics });
      }

      case "get_ga4_events": {
        const { startDate = "30daysAgo", endDate = "yesterday" } = parameters;
        const events = await fetchGA4Events({ startDate, endDate });
        return NextResponse.json({ result: events });
      }

      case "get_ga4_fluid_fusion": {
        const { startDate = "30daysAgo", endDate = "yesterday" } = parameters;
        const fluidFusion = await fetchGA4FluidFusion({ startDate, endDate });
        return NextResponse.json({ result: fluidFusion });
      }

      case "get_ga4_realtime": {
        try {
          const realtime = await fetchGA4Realtime();
          return NextResponse.json({ result: realtime });
        } catch (error: any) {
          console.error("Error in get_ga4_realtime:", error);
          // Return error with helpful message and suggestion to use overview instead
          return NextResponse.json({ 
            error: error.message || "Failed to fetch GA4 realtime data",
            suggestion: "The Realtime API may not be available. Try using get_ga4_overview instead for recent traffic statistics.",
            fallback: "Use get_ga4_overview for traffic data if realtime is unavailable"
          }, { status: 500 });
        }
      }

      case "get_ga4_retention": {
        const { startDate = "30daysAgo", endDate = "yesterday" } = parameters;
        const retention = await fetchGA4Retention({ startDate, endDate });
        return NextResponse.json({ result: retention });
      }

      case "get_ga4_search_terms": {
        const { startDate = "30daysAgo", endDate = "yesterday" } = parameters;
        const searchTerms = await fetchGA4SearchTerms({ startDate, endDate });
        return NextResponse.json({ result: searchTerms });
      }

      case "get_ga4_source_medium": {
        const { startDate = "30daysAgo", endDate = "yesterday" } = parameters;
        const sourceMedium = await fetchGA4SourceMedium({ startDate, endDate });
        return NextResponse.json({ result: sourceMedium });
      }

      case "get_ga4_technology": {
        const { startDate = "30daysAgo", endDate = "yesterday" } = parameters;
        const technology = await fetchGA4Technology({ startDate, endDate });
        return NextResponse.json({ result: technology });
      }

      case "get_ga4_time_patterns": {
        const { startDate = "30daysAgo", endDate = "yesterday" } = parameters;
        const timePatterns = await fetchGA4TimePatterns({ startDate, endDate });
        return NextResponse.json({ result: timePatterns });
      }

      case "get_ga4_geography_source_medium": {
        const { startDate = "30daysAgo", endDate = "yesterday", country } = parameters;
        try {
          const geographySourceMedium = await fetchGA4GeographySourceMedium({ startDate, endDate, country });
          return NextResponse.json({ result: geographySourceMedium });
        } catch (error: any) {
          console.error("Error in get_ga4_geography_source_medium:", error);
          // Return error but don't throw - let Atlas handle it
          return NextResponse.json({ 
            error: error.message || "Failed to fetch geography + source/medium data",
            suggestion: "Try using get_ga4_geography and get_ga4_source_medium separately, or check if the country name is correct"
          }, { status: 500 });
        }
      }

      default:
        return NextResponse.json(
          { error: `Unknown tool: ${tool}` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error("GA4 MCP Bridge Error:", error);
    console.error("Error stack:", error?.stack);
    return NextResponse.json(
      { 
        error: error?.message || "Failed to execute GA4 tool",
        details: error?.stack || String(error)
      },
      { status: 500 }
    );
  }
}
