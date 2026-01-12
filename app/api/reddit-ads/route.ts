import { NextResponse } from "next/server";
import { fetchRedditAdsData } from "@/lib/reddit-ads/client";
import { trackRequest } from "@/lib/usage-tracker";

export async function GET(request: Request) {
  try {
    trackRequest('redditAds');
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate") || "30daysAgo";
    const endDate = searchParams.get("endDate") || "yesterday";

    const data = await fetchRedditAdsData(startDate, endDate);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error fetching Reddit Ads data:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to fetch Reddit Ads data",
      },
      { status: 500 }
    );
  }
}
