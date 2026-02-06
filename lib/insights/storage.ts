/**
 * Orion Daily GTM Insights - Storage layer.
 * Saves and retrieves insights from MongoDB.
 */

import connectDB from "@/lib/db/mongodb";
import Insight from "@/lib/db/models/Insight";
import type { InsightsClaudeInput } from "./types";
import type { InsightsClaudeOutput } from "./output-types";

/**
 * Get PKT date string (YYYY-MM-DD) for today.
 * PKT = UTC+5, so 9 AM PKT = 4 AM UTC.
 */
function getPKTDateString(date: Date = new Date()): string {
  const pkt = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Karachi" }));
  return pkt.toISOString().split("T")[0]!;
}

/**
 * Save insights to MongoDB.
 */
export async function saveInsights(
  input: InsightsClaudeInput,
  output: InsightsClaudeOutput,
  status: "success" | "partial" | "failed" = "success",
  error?: string
): Promise<void> {
  if (!process.env.MONGODB_URI) {
    console.warn("MONGODB_URI not set - insights not saved to DB");
    return;
  }

  await connectDB();
  const date = getPKTDateString();

  await Insight.findOneAndUpdate(
    { date },
    {
      date,
      generatedAt: output.generatedAt,
      input,
      output,
      status,
      error,
    },
    { upsert: true, new: true }
  );
}

/**
 * Get latest insights (most recent by date).
 */
export async function getLatestInsights(): Promise<{
  input: InsightsClaudeInput;
  output: InsightsClaudeOutput;
  date: string;
  generatedAt: string;
} | null> {
  if (!process.env.MONGODB_URI) {
    return null;
  }

  await connectDB();
  const insight = await Insight.findOne().sort({ date: -1 }).lean().exec();

  if (!insight) return null;

  return {
    input: insight.input as InsightsClaudeInput,
    output: insight.output as InsightsClaudeOutput,
    date: insight.date,
    generatedAt: insight.generatedAt,
  };
}

/**
 * Get insights for a specific date (YYYY-MM-DD).
 */
export async function getInsightsByDate(date: string): Promise<{
  input: InsightsClaudeInput;
  output: InsightsClaudeOutput;
  date: string;
  generatedAt: string;
} | null> {
  if (!process.env.MONGODB_URI) {
    return null;
  }

  await connectDB();
  const insight = await Insight.findOne({ date }).lean().exec();

  if (!insight) return null;

  return {
    input: insight.input as InsightsClaudeInput,
    output: insight.output as InsightsClaudeOutput,
    date: insight.date,
    generatedAt: insight.generatedAt,
  };
}

/**
 * Get all insights (for history view).
 */
export async function getAllInsights(limit: number = 30): Promise<
  Array<{
    date: string;
    generatedAt: string;
    status: string;
    executiveSummary: InsightsClaudeOutput["executiveSummary"];
  }>
> {
  if (!process.env.MONGODB_URI) {
    return [];
  }

  await connectDB();
  const insights = await Insight.find().sort({ date: -1 }).limit(limit).lean().exec();

  return insights.map((i) => ({
    date: i.date,
    generatedAt: i.generatedAt,
    status: i.status,
    executiveSummary: (i.output as InsightsClaudeOutput).executiveSummary,
  }));
}
