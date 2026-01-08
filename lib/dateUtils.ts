/**
 * Date utility functions for period comparisons
 */

export interface DateRange {
  startDate: string;
  endDate: string;
}

/**
 * Calculate the previous period for comparison
 * Examples:
 * - Today -> Yesterday
 * - Yesterday -> Day before yesterday
 * - Last 7 days -> Previous 7 days
 * - Custom range -> Same length period before
 */
export function getComparisonPeriod(dateRange: DateRange): DateRange {
  const start = new Date(dateRange.startDate);
  const end = new Date(dateRange.endDate);
  
  // Calculate the duration of the period
  const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  // Calculate the previous period
  const comparisonEnd = new Date(start);
  comparisonEnd.setDate(comparisonEnd.getDate() - 1);
  
  const comparisonStart = new Date(comparisonEnd);
  comparisonStart.setDate(comparisonStart.getDate() - duration + 1);
  
  return {
    startDate: comparisonStart.toISOString().split("T")[0],
    endDate: comparisonEnd.toISOString().split("T")[0],
  };
}

/**
 * Calculate percentage change between two values
 */
export function calculateChange(current: number, previous: number): {
  value: number;
  percentage: number;
  trend: "up" | "down" | "neutral";
} {
  if (previous === 0) {
    return {
      value: current,
      percentage: current > 0 ? 100 : 0,
      trend: current > 0 ? "up" : "neutral",
    };
  }
  
  const change = current - previous;
  const percentage = (change / previous) * 100;
  
  return {
    value: change,
    percentage: Math.abs(percentage),
    trend: change > 0 ? "up" : change < 0 ? "down" : "neutral",
  };
}

/**
 * Format date range label
 */
export function formatDateRangeLabel(dateRange: DateRange): string {
  const start = new Date(dateRange.startDate);
  const end = new Date(dateRange.endDate);
  
  if (dateRange.startDate === dateRange.endDate) {
    return start.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
  
  return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
}
