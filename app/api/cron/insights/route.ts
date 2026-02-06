/**
 * GET /api/cron/insights
 * Vercel Cron: Runs daily at 9:00 AM PKT (4:00 AM UTC).
 * 
 * To configure in Vercel:
 * 1. Go to Project Settings > Cron Jobs
 * 2. Add: "0 4 * * *" (4 AM UTC = 9 AM PKT) -> GET /api/cron/insights
 * 
 * Or use vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/insights",
 *     "schedule": "0 4 * * *"
 *   }]
 * }
 */

import { NextResponse } from "next/server";
import { generateDailyInsights } from "@/lib/insights/generator";
import { saveInsights } from "@/lib/insights/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutes max for cron

// Verify request is from Vercel Cron (optional security)
function isAuthorized(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  if (authHeader === `Bearer ${process.env.CRON_SECRET}`) {
    return true;
  }
  // Allow if CRON_SECRET not set (for local testing)
  if (!process.env.CRON_SECRET) {
    return true;
  }
  return false;
}

export async function GET(request: Request) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🚀 Starting daily insights generation (cron)...");

    let input: any = undefined;
    let output: any = undefined;
    let status: "success" | "partial" | "failed" = "success";
    let error: string | undefined;

    try {
      const result = await generateDailyInsights();
      input = result.input;
      output = result.output;

      // Save to MongoDB
      await saveInsights(input, output, "success");

      console.log("✅ Daily insights generated and saved successfully");
      return NextResponse.json({
        success: true,
        date: output.generatedAt,
        message: "Insights generated successfully",
      });
    } catch (err: any) {
      error = err.message || String(err);
      status = "failed";
      console.error("❌ Failed to generate insights:", error);

      // Try to save partial data if we have input
      if (input) {
        try {
          await saveInsights(input, output || ({} as any), "partial", error);
        } catch (saveErr) {
          console.error("Failed to save partial insights:", saveErr);
        }
      }

      // In production, you might want to send Slack notification here
      // For now, just return error
      return NextResponse.json(
        {
          success: false,
          error: error,
          message: "Failed to generate insights",
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Cron route error:", error);
    return NextResponse.json(
      { error: error.message || "Cron execution failed" },
      { status: 500 }
    );
  }
}
