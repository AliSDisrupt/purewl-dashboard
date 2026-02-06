import { NextResponse } from "next/server";
import { fetchAnthropicUsageAndCost } from "@/lib/anthropic-usage-report";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const daysBack = parseInt(searchParams.get("days") || "7", 10);
    const bucketWidth = (searchParams.get("bucket_width") || "1d") as "1d" | "1h" | "1m";
    const validBucketWidths: ("1d" | "1h" | "1m")[] = ["1d", "1h", "1m"];
    const finalBucketWidth = validBucketWidths.includes(bucketWidth) ? bucketWidth : "1d";

    const result = await fetchAnthropicUsageAndCost(daysBack, finalBucketWidth);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error fetching Anthropic usage:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch usage data" },
      { status: 500 }
    );
  }
}
