/**
 * Date range helpers for Orion Insights aggregation.
 * Uses "current period" = last 7 days, "comparison period" = 7 days before that (WoW).
 */

function toGA4Date(d: Date): string {
  return d.toISOString().split("T")[0]!;
}

export interface WoWDateRanges {
  current: { start: string; end: string };
  previous: { start: string; end: string };
  /** GA4-style: "7daysAgo" / "yesterday" etc. for current period */
  currentGA4: { startDate: string; endDate: string };
  /** GA4-style for previous period */
  previousGA4: { startDate: string; endDate: string };
}

/**
 * Get date ranges for week-over-week comparison.
 * Current = last 7 days (excluding today), Previous = 7 days before that.
 */
export function getWoWDateRanges(asOf: Date = new Date()): WoWDateRanges {
  const end = new Date(asOf);
  end.setDate(end.getDate() - 1); // yesterday (GA4 data not available for today)
  end.setHours(23, 59, 59, 999);

  const currentStart = new Date(end);
  currentStart.setDate(currentStart.getDate() - 6);
  currentStart.setHours(0, 0, 0, 0);

  const previousEnd = new Date(currentStart);
  previousEnd.setDate(previousEnd.getDate() - 1);
  previousEnd.setHours(23, 59, 59, 999);

  const previousStart = new Date(previousEnd);
  previousStart.setDate(previousStart.getDate() - 6);
  previousStart.setHours(0, 0, 0, 0);

  return {
    current: { start: toGA4Date(currentStart), end: toGA4Date(end) },
    previous: { start: toGA4Date(previousStart), end: toGA4Date(previousEnd) },
    currentGA4: {
      startDate: toGA4Date(currentStart),
      endDate: toGA4Date(end),
    },
    previousGA4: {
      startDate: toGA4Date(previousStart),
      endDate: toGA4Date(previousEnd),
    },
  };
}

/** For APIs that take "daysBack": current period = 7, previous = 14 (we'll subtract to get previous 7). */
export function getDaysBackRanges(): { currentDays: number; previousDays: number } {
  return { currentDays: 7, previousDays: 14 };
}
