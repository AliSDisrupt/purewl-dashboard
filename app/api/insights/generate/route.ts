/**
 * POST /api/insights/generate
 * Generates complete insights (aggregate + Claude analysis) and saves to storage.
 * Use this for manual triggers or testing before cron is set up.
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { generateDailyInsights } from "@/lib/insights/generator";
import { saveInsights } from "@/lib/insights/storage";
import { apiError } from "@/lib/api-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutes max

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await generateDailyInsights();
    
    // Save to storage
    await saveInsights(result.input, result.output, "success");

    return NextResponse.json({
      ...result,
      saved: true,
      message: "Insights generated and saved successfully",
    });
  } catch (error) {
    return apiError("Failed to generate insights", 500, error);
  }
}
